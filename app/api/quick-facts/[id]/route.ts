import { db, getMe } from '@/lib/supabase/server';
import { factMediaList } from '@/lib/types';
import { NextResponse, after } from 'next/server';
import { submitToIndexNow, postUrl, profileUrl, isLiveRequest } from '@/lib/indexnow';

const json = (data: object, status = 200) => NextResponse.json(data, { status });
const PUBLIC_PREFIX = '/storage/v1/object/public/media/';

/**
 * Kullanıcı kendi medya gönderisini siler. İçerik YOK EDİLMEZ:
 *  - Her medya dosyası için kayıt, RLS ile kilitli `deleted_media` arşiv tablosuna
 *    kopyalanır. Web sitesi bu tabloyu hiçbir zaman sorgulamaz; anon/authenticated
 *    erişemez — yalnızca service-role (sunucu) ve Supabase paneli görebilir.
 *  - Dosyalar public `media` bucket'ından private `archive` bucket'ına taşınır →
 *    public URL kalmaz (dışarıdan/hacker erişemez).
 *  - quick_facts'ten silinir → profil/akış/her yerden kalkar (bağımlılar CASCADE).
 *
 * Çoklu medyalı gönderilerde TÜM dosyalar arşivlenir/taşınır (sadece kapak değil).
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const factId = Number(id);
  if (!factId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  // select('*') → `media` kolonu varsa gelir, yoksa hata vermez (geriye dönük uyum)
  const { data: fact, error: fErr } = await db
    .from('quick_facts')
    .select('*')
    .eq('id', factId)
    .single();
  if (fErr || !fact) return json({ error: 'İçerik bulunamadı' }, 404);
  if (fact.user_id !== me.id) return json({ error: 'Bu içeriği silme yetkin yok' }, 403);

  // Gönderinin tüm medya dosyaları (çoklu veya tek)
  const files = factMediaList(fact).map((m, i) => {
    const srcPath = m.url?.includes(PUBLIC_PREFIX) ? m.url.split(PUBLIC_PREFIX)[1] : null;
    const archivePath = srcPath
      ? `${fact.user_id}/${Date.now()}-${i}-${srcPath.split('/').pop()}`
      : null;
    return { url: m.url, type: m.type, srcPath, archivePath };
  });

  // 1) Gizli arşiv tablosuna her dosya için bir satır kopyala
  const { error: arcErr } = await db.from('deleted_media').insert(
    files.map(f => ({
      original_id: fact.id,
      user_id: fact.user_id,
      caption: fact.caption,
      media_type: f.type,
      original_media_url: f.url,
      archive_path: f.archivePath,
      original_created_at: fact.created_at,
    })),
  );
  if (arcErr) return json({ error: 'Arşivlenemedi — `deleted_media` tablosu kurulu mu?' }, 500);

  // 2) quick_facts'ten sil (fact_likes / yorum / bookmark CASCADE ile gider)
  const { error: delErr } = await db.from('quick_facts').delete().eq('id', factId);
  if (delErr) {
    await db.from('deleted_media').delete().eq('original_id', factId);
    return json({ error: 'Silinemedi' }, 500);
  }

  // 3) Dosyaları private 'archive' bucket'ına taşı (en son; içerik zaten kalktı)
  for (const f of files) {
    if (f.srcPath && f.archivePath) {
      const { error: mvErr } = await db.storage
        .from('media')
        .move(f.srcPath, f.archivePath, { destinationBucket: 'archive' });
      if (mvErr) {
        // Taşınamadıysa dosya hâlâ media'da — arşiv kaydında gerçek konumu işaretle
        await db.from('deleted_media')
          .update({ archive_path: f.srcPath })
          .eq('original_id', factId)
          .eq('original_media_url', f.url);
      }
    }
  }

  // Silinen gönderi sayfasını IndexNow'a bildir → motorlar yeniden tarar, 404 görüp
  // dizinden hızla düşürür. Profil ızgarası da değiştiği için onu da bildir.
  // Yalnızca gerçek üretim isteğinde ve gizli olmayan hesapta (içerik dizine girer).
  if (!me.is_private && isLiveRequest(req)) {
    after(() => submitToIndexNow([postUrl(factId), profileUrl(me.username)]));
  }

  return json({ ok: true });
}
