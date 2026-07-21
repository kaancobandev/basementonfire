// PAYLAŞIM CAROUSEL'İ — makale başına Instagram 1080×1350 slayt dizisi + 1080×1920
// reel kapağı. Görselleştirme→trafik planının 3. ve 4. hamlesi ([[gorsellestirme-buyume-plani]]).
//
// NEDEN: sitenin görsel serveti (WebGL/GSAP/sim) siteden ÇIKAMIYOR — hepsi
// tıklamadan sonra başlıyor, Instagram'da/Google Görseller'de görünmüyor. Bu
// dosya makalenin ELDEKİ verisinden (başlık, soru, kategori, gerçek fotoğraflar,
// gradyan) dışarıda paylaşılabilir kart üretir. UYDURMA İÇERİK YOK: her şey
// mevcut registry'lerden gelir (lib/articles.ts, lib/questions.ts, article-gradients.ts).
//
// NEDEN CANVAS, ImageResponse DEĞİL: kartlar CanvasStudio'da istemcide çizilir
// (bkz. app/components/CarouselStudio.tsx). İki kazanç: (1) tarayıcı .webp'yi
// kendisi çözer → makale fotoğrafları doğrudan kullanılabilir (Satori/next-og
// .webp'yi okuyamaz), (2) sunucu isteği yok → sorguya bağlı rotaya s-maxage
// eklenmez, Netlify cache tuzağına girilmez ([[netlify-cache-and-grid-gotchas]]).

import { ARTICLE_MAP } from './articles';
import { questionFor } from './questions';
import { gradientFor } from './article-gradients';

export type Slide =
  // Kapak — kategori etiketi + başlık + soru. Otomatik kurulur.
  | { kind: 'cover' }
  // Gerçek makale fotoğrafı, tam kanvas + altta açıklama şeridi.
  | { kind: 'photo'; src: string; caption?: string; credit?: string }
  // Metin kartı — vurgulu başlık + gövde. Elle yazılır (flagship makaleler).
  | { kind: 'fact'; kicker?: string; headline: string; body?: string }
  // Kapanış — "interaktif kanıt sitede" + adres. Otomatik kurulur.
  | { kind: 'cta' };

export type CarouselTheme = {
  /** Zemin gradyanının iki durağı (koyu → biraz daha açık). */
  bg: [string, string];
  /** Vurgu rengi — etiket, çerçeve, kapanış. */
  accent: string;
};

// ── Gradyan ayrıştırma ──────────────────────────────────────────────────────
// article-gradients.ts değerleri "linear-gradient(135deg,#aaa,#bbb)" biçiminde.
// İki hex durağı çekilir; zemin bunların koyulaştırılmış hâli olur (kart metni
// beyaz, okunurluk için zemin yeterince koyu kalmalı).
function hexStops(gradient: string): [string, string] {
  const m = gradient.match(/#[0-9a-fA-F]{6}/g);
  if (m && m.length >= 2) return [m[0], m[1]];
  if (m && m.length === 1) return [m[0], m[0]];
  return ['#1e1b4b', '#4c1d95']; // marka indigo yedeği
}

function clamp(n: number): number { return Math.max(0, Math.min(255, Math.round(n))); }

function shift(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp(((n >> 16) & 255) * factor);
  const g = clamp(((n >> 8) & 255) * factor);
  const b = clamp((n & 255) * factor);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

/**
 * Makalenin carousel teması — keşif/OG kartıyla AYNI gradyan kaynağından türer,
 * yani paylaşılan carousel ile sitede görülen kimlik aynı aileden olur.
 * accent: gradyanın açık durağının parlatılmışı (koyu zeminde okunur).
 */
export function carouselTheme(slug: string): CarouselTheme {
  const [a, b] = hexStops(gradientFor(slug));
  return {
    bg: [shift(a, 0.62), shift(b, 0.72)], // zemini koyulaştır (metin beyaz)
    accent: shift(b, 1.55),               // vurgu: açık durağı parlat
  };
}

// ── Slayt çözümleyici ───────────────────────────────────────────────────────
// FLAGSHIP içerik: elle yazılmış fact slaytları. Yalnızca makale kanıtına
// dayanır (uydurma yok); kaynak makalenin kendi metnidir. Girişi olmayan makale
// OTOMATİK 3 slayta düşer (kapak + fotoğraf + kapanış) — 32 makalenin hepsi
// sıfır ek içerikle çalışır.
const FLAGSHIP: Record<string, Slide[]> = {
  sezar: [
    { kind: 'fact', kicker: 'MÖ 75', headline: 'Korsanlar 20 talent istedi.', body: 'Sezar hakaret saydı: “Ben 50 ederim” dedi. Fidyeyi kendi artırdı.' },
    { kind: 'fact', kicker: 'MÖ 49 · RUBICON', headline: 'Tek bir nehir, bir iç savaş.', body: 'Rubicon’u ordusuyla geçmek yasağı çiğnemekti. Geri dönüş yoktu.' },
  ],
  radyoaktivite: [
    { kind: 'fact', kicker: 'SEN', headline: 'Vücudun saniyede ~4.400 kez ışıma yapıyor.', body: 'İçindeki potasyum-40 ve karbon-14 sürekli bozunuyor. Radyoaktiflik dışarıda değil, sende.' },
  ],
  tardigrad: [
    { kind: 'fact', kicker: 'SU AYISI', headline: 'Uzayın boşluğunda hayatta kaldı.', body: 'Kaynar sudan mutlak sıfıra, vakumdan radyasyona — kuruyup camlaşarak durur, su gelince geri döner.' },
  ],
  fatih: [
    { kind: 'fact', kicker: '1453', headline: 'Gemileri karadan yürüttü.', body: 'Haliç’in girişi zincirle kapalıydı. 21 yaşındaki sultan donanmayı tepenin üstünden geçirdi.' },
  ],
};

/**
 * Bir makalenin carousel slaytları. Kapak başa, kapanış sona OTOMATİK eklenir;
 * arada flagship fact’leri (varsa) + varsa fotoğraflar. photoSrcs çağıran taraftan
 * gelir (public/articles/<slug>/ içeriği build’de bilinmez, istemcide verilir).
 */
export function slidesFor(slug: string, photoSrcs: string[] = []): Slide[] {
  const out: Slide[] = [{ kind: 'cover' }];

  const facts = FLAGSHIP[slug] ?? [];
  out.push(...facts);

  // En çok 2 fotoğraf: carousel'i 5-6 slaytta tut (IG'de ilk birkaç slayt izlenir).
  for (const src of photoSrcs.slice(0, facts.length ? 1 : 2)) {
    out.push({ kind: 'photo', src });
  }

  out.push({ kind: 'cta' });
  return out;
}

/** Kapakta ve kapanışta kullanılan metinler (tek kaynak — çizim kodu bunları okur). */
export function coverText(slug: string): { kicker: string; title: string; question: string } {
  const a = ARTICLE_MAP[slug];
  return {
    kicker: (a?.category ?? 'BASEMENTS').toUpperCase(),
    title: a?.title ?? 'Basementonfire',
    // Soru yoksa desc'e düş (OG kartıyla aynı kural).
    question: questionFor(slug) ?? a?.desc ?? '',
  };
}
