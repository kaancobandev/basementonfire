import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });
const PUBLIC_PREFIX = '/storage/v1/object/public/media/';

/**
 * Kullanıcı kendi medya gönderisini siler. İçerik YOK EDİLMEZ:
 *  - Kayıt, RLS ile kilitli `deleted_media` arşiv tablosuna kopyalanır. Web sitesi
 *    bu tabloyu hiçbir zaman sorgulamaz; anon/authenticated erişemez — yalnızca
 *    service-role (sunucu) ve Supabase paneli görebilir.
 *  - Dosya, public `media` bucket'ından private `archive` bucket'ına taşınır →
 *    public URL kalmaz (dışarıdan/hacker erişemez).
 *  - quick_facts'ten silinir → profil/akış/her yerden kalkar (bağımlılar CASCADE).
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const factId = Number(id);
  if (!factId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { data: fact, error: fErr } = await db
    .from('quick_facts')
    .select('id, user_id, caption, media_type, media_url, created_at')
    .eq('id', factId)
    .single();
  if (fErr || !fact) return json({ error: 'İçerik bulunamadı' }, 404);
  if (fact.user_id !== me.id) return json({ error: 'Bu içeriği silme yetkin yok' }, 403);

  // Public 'media' bucket'ındaki yol + private 'archive' bucket'ındaki hedef
  const srcPath = fact.media_url?.includes(PUBLIC_PREFIX) ? fact.media_url.split(PUBLIC_PREFIX)[1] : null;
  const archivePath = srcPath ? `${fact.user_id}/${Date.now()}-${srcPath.split('/').pop()}` : null;

  // 1) Gizli arşiv tablosuna kopyala
  const { error: arcErr } = await db.from('deleted_media').insert({
    original_id: fact.id,
    user_id: fact.user_id,
    caption: fact.caption,
    media_type: fact.media_type,
    original_media_url: fact.media_url,
    archive_path: archivePath,
    original_created_at: fact.created_at,
  });
  if (arcErr) return json({ error: 'Arşivlenemedi — `deleted_media` tablosu kurulu mu?' }, 500);

  // 2) quick_facts'ten sil (fact_likes / yorum / bookmark CASCADE ile gider)
  const { error: delErr } = await db.from('quick_facts').delete().eq('id', factId);
  if (delErr) {
    await db.from('deleted_media').delete().eq('original_id', factId).eq('archive_path', archivePath ?? '');
    return json({ error: 'Silinemedi' }, 500);
  }

  // 3) Dosyayı private 'archive' bucket'ına taşı (en son; içerik zaten profilden kalktı)
  if (srcPath && archivePath) {
    const { error: mvErr } = await db.storage.from('media').move(srcPath, archivePath, { destinationBucket: 'archive' });
    if (mvErr) {
      // Taşınamadıysa dosya hâlâ media'da — arşiv kaydında gerçek konumu işaretle
      await db.from('deleted_media').update({ archive_path: srcPath }).eq('original_id', factId).eq('archive_path', archivePath);
    }
  }

  return json({ ok: true });
}
