import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../lib/supabase';
import { compressImage } from '../../../lib/image';
import { saveHashtagsAndMentions } from '../../../lib/hashtags';

const MAX_SIZE = 100 * 1024 * 1024;
const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEOS = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

export const POST: APIRoute = async ({ request }) => {
  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return redirect('/login');

  const { data: dbUser } = await supabase
    .from('users').select('id').eq('auth_id', authUser.id).single();
  if (!dbUser) return redirect('/login');

  let formData: FormData;
  try { formData = await request.formData(); }
  catch { return redirect('/gonderi-olustur?error=Form+verisi+okunamadı'); }

  const file    = formData.get('media') as File | null;
  const caption = (formData.get('caption') as string | null)?.trim() ?? '';

  if (!file || file.size === 0) return redirect('/gonderi-olustur?error=Dosya+seçilmedi');
  if (!caption)                  return redirect('/gonderi-olustur?error=Açıklama+boş+olamaz');
  if (caption.length > 300)      return redirect('/gonderi-olustur?error=Açıklama+en+fazla+300+karakter');
  if (file.size > MAX_SIZE)      return redirect('/gonderi-olustur?error=Dosya+100MB+dan+büyük+olamaz');

  const isImage = ALLOWED_IMAGES.includes(file.type);
  const isVideo = ALLOWED_VIDEOS.includes(file.type);
  if (!isImage && !isVideo) return redirect('/gonderi-olustur?error=Desteklenmeyen+dosya+türü');

  let uploadBuffer: Buffer;
  let contentType: string;
  let ext: string;

  const rawBuffer = Buffer.from(await file.arrayBuffer());

  if (isImage) {
    try {
      const processed = await compressImage(rawBuffer, file.type);
      uploadBuffer = processed.buffer;
      contentType  = processed.contentType;
      ext          = processed.ext;
    } catch {
      // Sharp başarısız olursa orijinali kullan
      uploadBuffer = rawBuffer;
      contentType  = file.type;
      ext          = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    }
  } else {
    uploadBuffer = rawBuffer;
    contentType  = file.type;
    ext          = file.name.split('.').pop()?.toLowerCase() ?? 'mp4';
  }

  const filename = `${dbUser.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filename, uploadBuffer, { contentType, upsert: false });

  if (uploadError) return redirect(`/gonderi-olustur?error=${encodeURIComponent(uploadError.message)}`);

  const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filename);

  const { data: newPost, error: dbError } = await supabase
    .from('quick_facts')
    .insert({
      user_id:    dbUser.id,
      caption,
      media_url:  publicUrl,
      media_type: isImage ? 'image' : 'video',
    })
    .select('id')
    .single();

  if (dbError) return redirect(`/gonderi-olustur?error=${encodeURIComponent(dbError.message)}`);

  // fire-and-forget: persist hashtags + mention notifications
  saveHashtagsAndMentions(newPost.id, caption, dbUser.id).catch(() => {});

  return redirect('/akis');
};

function redirect(location: string) {
  return new Response(null, { status: 303, headers: { Location: location } });
}
