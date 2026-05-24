/**
 * Supabase Storage transform API ile thumbnail URL üretir.
 * Supabase'in /render/image/public/ endpoint'i width/quality/format parametrelerini destekler.
 */
export function thumbUrl(url: string, width = 600, quality = 75): string {
  if (!url || !url.includes('/object/public/')) return url;
  return (
    url.replace('/object/public/', '/render/image/public/') +
    `?width=${width}&quality=${quality}&format=webp`
  );
}

import sharpPkg from 'sharp';
const sharp = (sharpPkg as any).default ?? sharpPkg;

export interface ProcessedImage {
  buffer: Buffer;
  contentType: 'image/webp';
  ext: 'webp';
}

/**
 * Gelen resim buffer'ını WebP'ye dönüştürür, boyutlandırır ve sıkıştırır.
 * max 1920px genişlik, quality 85. GIF için sadece ilk frame.
 */
export async function compressImage(
  input: Buffer,
  mimeType: string,
  maxWidth = 1920,
  quality = 85
): Promise<ProcessedImage> {
  let pipeline = sharp(input).rotate(); // EXIF rotation fix

  if (mimeType === 'image/gif') {
    // GIF → tek frame WebP (animated WebP'yi desteklemez tüm tarayıcılar)
    pipeline = pipeline.gif({ pages: 1 });
  }

  const buffer = await pipeline
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  return { buffer, contentType: 'image/webp', ext: 'webp' };
}
