import { db, getMe } from '@/lib/supabase/server';
import { NextResponse, after } from 'next/server';
import { revalidateTag } from 'next/cache';
import { submitToIndexNow, postUrl, profileUrl, isLiveRequest } from '@/lib/indexnow';
import { parseHashtags } from '@/lib/caption';

const json = (data: object, status = 200) => NextResponse.json(data, { status });
const MAX_MEDIA = 20;

type InMedia = { path?: string; mediaType?: string; w?: number; h?: number };

// İstemcinin ölçtüğü piksel boyutunu doğrula: pozitif, makul sınırda tam sayı.
// Geçersizse yok sayılır (kayıt w/h'siz kalır, istemci fallback'i ölçer).
const dim = (n: unknown): number | null =>
  typeof n === 'number' && Number.isFinite(n) && n >= 1 && n <= 32768 ? Math.round(n) : null;

/**
 * Commit: dosya(lar) tarayıcıdan doğrudan Supabase Storage'a yüklendikten sonra
 * sadece kaydı oluşturur (küçük JSON gövdesi — Netlify limitine takılmaz).
 *
 * Çoklu medya: `media: [{ path, mediaType }]` (en fazla 20). İlk öğe kapak olarak
 * media_url/media_type'a yazılır (geriye dönük uyum); tamamı `media` (jsonb) kolonuna.
 * Eski tek dosyalı gövde ({ path, mediaType }) de desteklenir.
 */
export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let body: { path?: string; mediaType?: string; media?: InMedia[]; caption?: string };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  const caption = (body.caption ?? '').trim();
  if (!caption) return json({ error: 'Açıklama boş olamaz.' }, 400);
  if (caption.length > 10000) return json({ error: 'Açıklama en fazla 10000 karakter.' }, 400);

  // Yeni (media[]) ve eski (tek path) gövdeyi destekle
  const rawList: InMedia[] = Array.isArray(body.media) && body.media.length
    ? body.media
    : (body.path ? [{ path: body.path, mediaType: body.mediaType }] : []);

  if (!rawList.length) return json({ error: 'En az bir medya gerekli.' }, 400);
  if (rawList.length > MAX_MEDIA) return json({ error: `En fazla ${MAX_MEDIA} medya yükleyebilirsin.` }, 400);

  const items = rawList.map(m => {
    const w = dim(m.w), h = dim(m.h);
    return {
      path: m.path ?? '',
      type: (m.mediaType === 'video' ? 'video' : m.mediaType === 'audio' ? 'audio' : 'image') as 'image' | 'video' | 'audio',
      // w/h yalnızca ikisi de geçerliyse ve görsel/videoysa saklanır (CLS: oran SSR'da)
      ...(w && h && m.mediaType !== 'audio' ? { w, h } : {}),
    };
  });

  // Tüm yollar bu kullanıcıya ait olmalı (imza route'u "{me.id}/..." üretir)
  if (items.some(it => !it.path.startsWith(`${me.id}/`))) {
    return json({ error: 'Geçersiz dosya yolu.' }, 400);
  }

  const media = items.map(it => ({
    url: db.storage.from('media').getPublicUrl(it.path).data.publicUrl,
    type: it.type,
    ...(it.w && it.h ? { w: it.w, h: it.h } : {}),
  }));

  // `media` kolonu varsa onunla; yoksa (migration yapılmamışsa) sadece kapakla kaydet.
  let { data: created, error } = await db.from('quick_facts').insert({
    user_id:    me.id,
    caption,
    media_url:  media[0].url,
    media_type: media[0].type,
    media,
  }).select('id').single();

  if (error && (error.code === 'PGRST204' || /schema cache|'media'|column/i.test(error.message ?? ''))) {
    ({ data: created, error } = await db.from('quick_facts').insert({
      user_id:    me.id,
      caption,
      media_url:  media[0].url,
      media_type: media[0].type,
    }).select('id').single());
  }

  if (error || !created) {
    await db.storage.from('media').remove(items.map(it => it.path));
    return json({ error: 'Veritabanına kaydedilemedi.' }, 500);
  }

  const newId = created.id;

  // Yeni gönderi → home/akış/discover paylaşılan feed önbelleğini (T2 'feed' tag'i)
  // hemen tazele → gönderi herkese anında görünür, revalidate penceresini beklemez.
  revalidateTag('feed');

  // Caption'daki #etiketleri çıkar → hashtags + post_hashtags tablolarına işle.
  // Best-effort: hata gönderi oluşturmayı geçersiz kılmaz. hashtags.tag üzerinde
  // unique kısıt (hashtags_tag_key) olduğundan upsert yarış-güvenlidir.
  try {
    const tags = parseHashtags(caption).slice(0, 30);
    if (tags.length) {
      await db.from('hashtags').upsert(tags.map((tag) => ({ tag })), { onConflict: 'tag', ignoreDuplicates: true });
      const { data: tagRows } = await db.from('hashtags').select('id, tag').in('tag', tags);
      if (tagRows?.length) {
        await db.from('post_hashtags').insert(tagRows.map((h: any) => ({ post_id: newId, hashtag_id: h.id })));
      }
    }
  } catch (e) {
    console.error('[upload] hashtag çıkarma başarısız:', (e as Error)?.message ?? e);
  }

  // Yeni gönderi sayfası (+ değişen profil ızgarası) arama motorlarına anında bildirilir.
  // Yanıt gönderildikten SONRA çalışır (after) → kullanıcıyı bekletmez, akışı bozmaz.
  // Yalnızca gerçek üretim isteğinde (isLiveRequest) ve gizli olmayan hesapta
  // (gizli gönderiler zaten noindex) ping atılır.
  if (!me.is_private && isLiveRequest(req)) {
    after(() => submitToIndexNow([postUrl(newId), profileUrl(me.username)]));
  }

  return json({ ok: true, id: newId });
}
