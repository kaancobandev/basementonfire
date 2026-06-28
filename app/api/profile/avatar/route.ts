import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const PUBLIC_PREFIX = '/storage/v1/object/public/media/';
const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Avatar commit: dosya tarayıcıdan doğrudan Supabase Storage'a (imzalı URL ile)
 * yüklendikten sonra yalnızca DB'yi günceller. Dosya bytes'ı bu route'tan GEÇMEZ
 * → Netlify fonksiyon gövde limitine takılmaz (büyük GIF avatarlar için gerekli).
 */
export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş yapılmamış' }, 401);

  let body: { path?: string };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  const path = (body.path ?? '').trim();
  // İmza route'u avatar yolunu "avatars/{me.id}-..." üretir → sahiplik doğrula
  // (başkasının yolunu avatar yapmayı engeller).
  if (!path.startsWith(`avatars/${me.id}-`)) return json({ error: 'Geçersiz dosya yolu.' }, 400);

  const avatarUrl = db.storage.from('media').getPublicUrl(path).data.publicUrl;
  const { error } = await db.from('users').update({ avatar: avatarUrl }).eq('id', me.id);
  if (error) return json({ error: 'Avatar kaydedilemedi.' }, 500);

  // Eski avatarı storage'dan temizle (varsa, yenisiyle aynı değilse)
  const old = me.avatar as string | null;
  if (old && old.includes(PUBLIC_PREFIX)) {
    const oldPath = old.split(PUBLIC_PREFIX)[1];
    if (oldPath && oldPath.startsWith('avatars/') && oldPath !== path) {
      try { await db.storage.from('media').remove([oldPath]); } catch {}
    }
  }

  return json({ avatar_url: avatarUrl });
}
