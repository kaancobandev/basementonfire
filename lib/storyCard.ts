import { coverText, carouselTheme } from './carousel';
import { ARTICLE_PHOTOS } from './articlePhotos';
import { drawCoverComposition } from './canvasKit';

// Makaleyi HİKAYEYE paylaşmak için 9:16 kart üretir — reel kapağıyla AYNI
// kompozisyon (drawCoverComposition), tek görsel kimlik. İstemci-canvas: tarayıcı
// .webp makale fotoğrafını kendi çözer (Satori çözemezdi) ve sunucu isteği yok.
// Üretilen PNG mevcut hikaye yükleme akışından geçer (uploadToStorage 'story').
export async function renderArticleStoryCard(slug: string, W = 1080, H = 1920): Promise<Blob | null> {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  if (!x) return null;
  await drawCoverComposition(x, coverText(slug), ARTICLE_PHOTOS[slug]?.[0], carouselTheme(slug), W, H, 'basementonfire.com');
  return new Promise((res) => c.toBlob(res, 'image/png'));
}
