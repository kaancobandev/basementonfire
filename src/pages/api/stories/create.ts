import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../lib/supabase';
import { compressImage } from '../../../lib/image';

const MAX_SIZE     = 50 * 1024 * 1024; // 50 MB
const ALLOWED_IMG  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VID  = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

export const POST: APIRoute = async ({ request }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const authHeaders = new Headers();
  const authClient  = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return json({ error: 'Giriş gerekli' }, 401);

  const { data: dbUser } = await supabase
    .from('users').select('id').eq('auth_id', authUser.id).single();
  if (!dbUser) return json({ error: 'Kullanıcı bulunamadı' }, 404);

  let formData: FormData;
  try { formData = await request.formData(); }
  catch { return json({ error: 'Form verisi okunamadı' }, 400); }

  const file = formData.get('media') as File | null;
  if (!file || file.size === 0) return json({ error: 'Dosya seçilmedi' }, 400);
  if (file.size > MAX_SIZE)     return json({ error: 'Dosya 50MB\'dan büyük olamaz' }, 400);

  const isImage = ALLOWED_IMG.includes(file.type);
  const isVideo = ALLOWED_VID.includes(file.type);
  if (!isImage && !isVideo) return json({ error: 'Desteklenmeyen dosya türü' }, 400);

  let buffer: Buffer;
  let contentType: string;
  let ext: string;

  const raw = Buffer.from(await file.arrayBuffer());

  if (isImage) {
    try {
      const p = await compressImage(raw, file.type, 1080, 85);
      buffer = p.buffer; contentType = p.contentType; ext = p.ext;
    } catch {
      buffer = raw;
      contentType = file.type;
      ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    }
  } else {
    buffer = raw;
    contentType = file.type;
    ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp4';
  }

  const filename = `stories/${dbUser.id}/${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from('media')
    .upload(filename, buffer, { contentType, upsert: false });

  if (uploadErr) return json({ error: uploadErr.message }, 500);

  const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filename);

  const { data: story, error: dbErr } = await supabase
    .from('stories')
    .insert({ user_id: dbUser.id, media_url: publicUrl, media_type: isImage ? 'image' : 'video' })
    .select('id, media_url, media_type, created_at')
    .single();

  if (dbErr) return json({ error: dbErr.message }, 500);

  return json({ story });
};
