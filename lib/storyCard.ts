import { coverText, carouselTheme } from './carousel';
import { ARTICLE_PHOTOS } from './articlePhotos';
import { drawCoverComposition, fitFont, wrap, CARD_FONT } from './canvasKit';

// SADECE-METİN hikaye zeminleri. Fotoğrafı olmayan kullanıcı da hikaye atsın:
// renkli gradyan + ortalanmış yazı. İkinci renk üste, ilki alta (canvas dik gradyan).
export const TEXT_STORY_BGS: [string, string][] = [
  ['#5b2eef', '#8b5cf6'], // marka indigo
  ['#be185d', '#f97316'], // magenta→amber
  ['#0f766e', '#22d3ee'], // teal→cyan
  ['#1e1b4b', '#4c1d95'], // gece moru
  ['#b91c1c', '#f59e0b'], // kızıl→amber
  ['#0f172a', '#334155'], // grafit
];

/**
 * SADECE-METİN hikaye kartı: gradyan zemin + ortalanmış, sığana kadar küçülen
 * yazı. Üretilen PNG normal görsel hikaye olarak yüklenir (schema değişmez).
 */
export async function renderTextStoryCard(text: string, bgIndex = 0, W = 1080, H = 1920): Promise<Blob | null> {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  if (!x) return null;

  const [a, b] = TEXT_STORY_BGS[bgIndex] ?? TEXT_STORY_BGS[0];
  const g = x.createLinearGradient(0, H, 0, 0);
  g.addColorStop(0, a); g.addColorStop(1, b);
  x.fillStyle = g; x.fillRect(0, 0, W, H);

  const PAD = 110, innerW = W - PAD * 2;
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#ffffff';
  // En uzun kelimeyi sığdıracak puntoyu bul, sonra tüm metni o puntoda sar.
  const longest = text.split(/\s+/).sort((p, q) => q.length - p.length)[0] ?? text;
  const size = fitFont(x, longest, 'bold', 96, 40, innerW);
  x.font = `bold ${size}px ${CARD_FONT}`;
  const lines = wrap(x, text, innerW).slice(0, 8);
  const lh = size + 16;
  let y = H / 2 - ((lines.length - 1) * lh) / 2;
  for (const line of lines) { x.fillText(line, W / 2, y); y += lh; }

  x.font = `500 30px ${CARD_FONT}`; x.fillStyle = 'rgba(255,255,255,0.7)'; x.textBaseline = 'alphabetic';
  x.fillText('basementonfire.com', W / 2, H - 70);
  return new Promise((res) => c.toBlob(res, 'image/png'));
}

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
