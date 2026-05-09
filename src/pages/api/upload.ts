import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 100 * 1024 * 1024; // 100 MB
const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEOS = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

export const POST: APIRoute = async ({ request }) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: 'Form verisi okunamadı.' }, 400);
  }

  const file    = formData.get('media') as File | null;
  const caption = (formData.get('caption') as string | null)?.trim() ?? '';

  if (!file || file.size === 0) return json({ error: 'Medya dosyası seçilmedi.' }, 400);
  if (!caption)                  return json({ error: 'Açıklama boş olamaz.' }, 400);
  if (caption.length > 300)      return json({ error: 'Açıklama en fazla 300 karakter olabilir.' }, 400);
  if (file.size > MAX_SIZE)      return json({ error: 'Dosya 100 MB\'dan büyük olamaz.' }, 400);

  const isImage = ALLOWED_IMAGES.includes(file.type);
  const isVideo = ALLOWED_VIDEOS.includes(file.type);
  if (!isImage && !isVideo) return json({ error: 'Desteklenmeyen dosya türü. JPG, PNG, WEBP, GIF, MP4 veya WEBM yükleyebilirsin.' }, 400);

  // Benzersiz dosya adı
  const ext      = file.name.split('.').pop()?.toLowerCase() ?? (isImage ? 'jpg' : 'mp4');
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
  } catch {
    return json({ error: 'Dosya kaydedilemedi.' }, 500);
  }

  const mediaUrl  = `/uploads/${filename}`;
  const mediaType = isImage ? 'image' : 'video';

  const { error: dbError } = await supabase
    .from('quick_facts')
    .insert({ user_id: 1, caption, media_url: mediaUrl, media_type: mediaType });

  if (dbError) {
    fs.unlinkSync(filePath);
    return json({ error: 'Veritabanına kaydedilemedi.' }, 500);
  }

  return new Response(null, { status: 303, headers: { Location: '/hizli-bilgiler' } });
};

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
