import { createAvatar } from '@dicebear/core';
import { notionists } from '@dicebear/collection';

// Fotoğrafı olmayan kullanıcılar için deterministik, EĞLENCELİ avatar.
// Self-host: DiceBear notionists (CC0) SVG'sini sunucuda üretir — DIŞ API YOK.
// Kullanıcı adı seed → @kaan her yerde hep aynı avatar. Kalıcı cache (immutable):
// ilk istekte üretilir, sonrası Netlify CDN + tarayıcıdan anında gelir.
export async function GET(_req: Request, { params }: { params: Promise<{ seed: string }> }) {
  const { seed } = await params;
  const svg = createAvatar(notionists, {
    seed: decodeURIComponent(seed || 'user'),
    radius: 50,
    backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 'c1f4d4', 'ffe0a3'],
  }).toString();

  return new Response(svg, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
}
