import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });
const MAX_MEDIA = 20;

type InMedia = { path?: string; mediaType?: string };

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

  const items = rawList.map(m => ({
    path: m.path ?? '',
    type: (m.mediaType === 'video' ? 'video' : m.mediaType === 'audio' ? 'audio' : 'image') as 'image' | 'video' | 'audio',
  }));

  // Tüm yollar bu kullanıcıya ait olmalı (imza route'u "{me.id}/..." üretir)
  if (items.some(it => !it.path.startsWith(`${me.id}/`))) {
    return json({ error: 'Geçersiz dosya yolu.' }, 400);
  }

  const media = items.map(it => ({
    url: db.storage.from('media').getPublicUrl(it.path).data.publicUrl,
    type: it.type,
  }));

  // `media` kolonu varsa onunla; yoksa (migration yapılmamışsa) sadece kapakla kaydet.
  let { error } = await db.from('quick_facts').insert({
    user_id:    me.id,
    caption,
    media_url:  media[0].url,
    media_type: media[0].type,
    media,
  });

  if (error && (error.code === 'PGRST204' || /schema cache|'media'|column/i.test(error.message ?? ''))) {
    ({ error } = await db.from('quick_facts').insert({
      user_id:    me.id,
      caption,
      media_url:  media[0].url,
      media_type: media[0].type,
    }));
  }

  if (error) {
    await db.storage.from('media').remove(items.map(it => it.path));
    return json({ error: 'Veritabanına kaydedilemedi.' }, 500);
  }

  return json({ ok: true });
}
