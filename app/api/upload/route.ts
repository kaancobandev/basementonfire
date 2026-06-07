import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Commit: dosya tarayıcıdan doğrudan Supabase Storage'a yüklendikten sonra
 * sadece kaydı oluşturur (küçük JSON gövdesi — Netlify limitine takılmaz).
 */
export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let body: { path?: string; caption?: string; mediaType?: string };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  const path = body.path ?? '';
  const caption = (body.caption ?? '').trim();
  const mediaType = body.mediaType === 'video' ? 'video' : 'image';

  if (!caption) return json({ error: 'Açıklama boş olamaz.' }, 400);
  if (caption.length > 10000) return json({ error: 'Açıklama en fazla 10000 karakter.' }, 400);
  // Yol bu kullanıcıya ait olmalı (imza route'u "{me.id}/..." üretir).
  if (!path.startsWith(`${me.id}/`)) return json({ error: 'Geçersiz dosya yolu.' }, 400);

  const mediaUrl = db.storage.from('media').getPublicUrl(path).data.publicUrl;

  const { error } = await db.from('quick_facts').insert({
    user_id:    me.id,
    caption,
    media_url:  mediaUrl,
    media_type: mediaType,
  });

  if (error) {
    await db.storage.from('media').remove([path]);
    return json({ error: 'Veritabanına kaydedilemedi.' }, 500);
  }

  return json({ ok: true });
}
