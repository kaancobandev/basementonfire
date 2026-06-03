import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const PUBLIC_PREFIX = '/storage/v1/object/public/media/';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş yapılmamış' }, 401);

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file || file.size === 0) return json({ error: 'Dosya seçilmedi.' }, 400);
  if (file.size > MAX_SIZE)     return json({ error: "Dosya 5 MB'dan büyük olamaz." }, 400);
  if (!ALLOWED.includes(file.type)) return json({ error: 'Desteklenmeyen dosya türü.' }, 400);

  // Supabase Storage'a yükle (Netlify'da yerel diske yazılamaz)
  const ext         = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const storagePath = `avatars/${me.id}-${Date.now()}.${ext}`;

  const { error: upErr } = await db.storage
    .from('media')
    .upload(storagePath, await file.arrayBuffer(), { contentType: file.type, upsert: true });
  if (upErr) return json({ error: 'Dosya yüklenemedi.' }, 500);

  const avatarUrl = db.storage.from('media').getPublicUrl(storagePath).data.publicUrl;
  await db.from('users').update({ avatar: avatarUrl }).eq('id', me.id);

  // Eski avatarı storage'dan temizle (varsa)
  const old = me.avatar as string | null;
  if (old && old.includes(PUBLIC_PREFIX)) {
    const oldPath = old.split(PUBLIC_PREFIX)[1];
    if (oldPath && oldPath.startsWith('avatars/')) {
      try { await db.storage.from('media').remove([oldPath]); } catch {}
    }
  }

  return json({ avatar_url: avatarUrl });
}
