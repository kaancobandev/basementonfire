import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../lib/supabase';
import fs from 'fs';
import path from 'path';

const AVATAR_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars');
const MAX_SIZE   = 5 * 1024 * 1024;
const ALLOWED    = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const POST: APIRoute = async ({ request }) => {
  const authHeaders = new Headers();
  const authClient  = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return json({ error: 'Giriş yapılmamış' }, 401);

  const { data: me } = await supabase
    .from('users').select('id, avatar').eq('auth_id', authUser.id).single();
  if (!me) return json({ error: 'Kullanıcı bulunamadı' }, 404);

  let formData: FormData;
  try { formData = await request.formData(); }
  catch { return json({ error: 'Form verisi okunamadı.' }, 400); }

  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) return json({ error: 'Dosya seçilmedi.' }, 400);
  if (file.size > MAX_SIZE)     return json({ error: "Dosya 5 MB'dan büyük olamaz." }, 400);
  if (!ALLOWED.includes(file.type)) return json({ error: 'Desteklenmeyen dosya türü.' }, 400);

  if (!fs.existsSync(AVATAR_DIR)) fs.mkdirSync(AVATAR_DIR, { recursive: true });

  const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filename = `${me.id}-${Date.now()}.${ext}`;
  const filePath = path.join(AVATAR_DIR, filename);

  fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));

  const avatarUrl = `/uploads/avatars/${filename}`;
  await supabase.from('users').update({ avatar: avatarUrl }).eq('id', me.id);

  // Eski yüklenen avatarı sil
  const old = (me as any).avatar as string | null;
  if (old?.startsWith('/uploads/avatars/')) {
    try { fs.unlinkSync(path.join(process.cwd(), 'public', old)); } catch {}
  }

  return json({ avatar_url: avatarUrl });
};

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
