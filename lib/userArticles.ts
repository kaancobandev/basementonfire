// Kullanici makaleleri — PAYLASILAN tipler/sabitler/yardimcilar (client + server).
// Node'a ozel sey YOK (sanitize-html sunucu tarafinda lib/articleSanitize.ts'te).
// Buradaki tek "guvenlik" parcasi buildEmbedSrcDoc: interaktif blogu sandbox
// iframe icin tam HTML + CSP olarak insa eder.

export type ArticleCategory = 'Fizik' | 'Tarih' | 'Biyoloji' | 'Teknoloji' | 'Kültür' | 'Diğer';
export const ARTICLE_CATEGORIES: ArticleCategory[] = ['Fizik', 'Tarih', 'Biyoloji', 'Teknoloji', 'Kültür', 'Diğer'];

// Blok tipleri — makale govdesi bunlarin sirali bir dizisidir.
export type ArticleTextBlock = { type: 'text'; html: string };
export type ArticleImageBlock = { type: 'image'; url: string; alt?: string; caption?: string };
export type ArticleEmbedBlock = {
  type: 'embed';
  html: string;
  css: string;
  js: string;
  libs: string[];
  height: number;
  caption?: string;
};
export type ArticleBlock = ArticleTextBlock | ArticleImageBlock | ArticleEmbedBlock;

export type ArticleSource = { title: string; authors?: string; year?: string; source?: string; url?: string };

export type ArticleStatus = 'pending' | 'approved' | 'rejected';

// Sinirlar — hem editor (UI) hem API (yetkili dogrulama) bunlari kullanir.
export const LIMITS = {
  title: 120,
  summary: 300,
  blocks: 60,
  embeds: 8,
  textHtml: 50_000,
  embedHtml: 60_000,
  embedCss: 40_000,
  embedJs: 80_000,
  docBytes: 500_000,
  sources: 30,
  pendingPerUser: 8,
  embedHeightMin: 120,
  embedHeightMax: 1400,
  embedHeightDefault: 360,
} as const;

// Prose icin secilebilir font yiginlari (sanitize-html font-family'yi yalnizca
// guvenli karakterlere izin vererek dogrular; bu liste UI icindir).
export const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Varsayılan', value: '' },
  { label: 'Manrope', value: 'Manrope, system-ui, sans-serif' },
  { label: 'Space Grotesk', value: '"Space Grotesk", system-ui, sans-serif' },
  { label: 'Georgia (servis)', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Space Mono', value: '"Space Mono", ui-monospace, monospace' },
];

// Editor renk paletleri (metin rengi + vurgu). Deger olarak hex kullanilir;
// sanitize-html hex/rgb/hsl/isimli renkleri kabul eder.
export const TEXT_COLORS = ['#0f172a', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777', '#ffffff'];
export const HIGHLIGHT_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa', '#e9d5ff', '#fecaca', '#a7f3d0'];

// Interaktif blok icin curated CDN kutuphane izin listesi. TEK host: cdnjs.
// (Sandbox iframe + CSP zaten yalnizca bu host'a script-src verir.)
export const EMBED_LIBS: Record<string, { label: string; src: string[] }> = {
  three:    { label: 'Three.js (3B)',     src: ['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'] },
  gsap:     { label: 'GSAP (animasyon)',  src: ['https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'] },
  p5:       { label: 'p5.js (yaratıcı)',  src: ['https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js'] },
  anime:    { label: 'anime.js',          src: ['https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.2/anime.min.js'] },
  confetti: { label: 'Confetti',          src: ['https://cdnjs.cloudflare.com/ajax/libs/canvas-confetti/1.9.3/confetti.browser.min.js'] },
};
export const EMBED_LIB_HOST = 'https://cdnjs.cloudflare.com';

// Turkce karakter -> ascii (slug icin).
const TR: Record<string, string> = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u' };
export function slugify(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[çğıöşüâîû]/g, (c) => TR[c] ?? c)
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // kalan birlesik aksanlari at
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'makale';
}

export function clampHeight(h: unknown): number {
  const n = Math.round(Number(h));
  if (!Number.isFinite(n)) return LIMITS.embedHeightDefault;
  return Math.min(LIMITS.embedHeightMax, Math.max(LIMITS.embedHeightMin, n));
}

/**
 * Interaktif (kullanici JS) blogunu, GUVENLI bir sandbox iframe icin tam bir
 * HTML belgesi olarak insa eder. Bu string `<iframe srcDoc=...>`'a verilir;
 * iframe `sandbox="allow-scripts"` (same-origin YOK) ile calistirilir -> belge
 * "opak köken" alir: ana sayfanin DOM'una, cerezlerine, Supabase oturumuna
 * ERISEMEZ. Ek olarak siki bir CSP:
 *   - script yalnizca inline (kullanicinin kendi JS'i) + cdnjs (curated lib)
 *   - connect-src 'none' -> fetch/XHR/websocket ile veri sizdirma KAPALI
 *   - object/base/form/frame KAPALI
 * Boylece kotu niyetli kod en fazla kendi iframe'i icinde kalir.
 */
export function buildEmbedSrcDoc(e: { html?: string; css?: string; js?: string; libs?: string[] }): string {
  const libs = (e.libs ?? []).filter((id) => Object.prototype.hasOwnProperty.call(EMBED_LIBS, id));
  const libTags = libs
    .flatMap((id) => EMBED_LIBS[id].src)
    .map((s) => `<script src="${s}"></script>`)
    .join('\n');

  // <\/script> / <\/style> kacisi: kullanici icerigi script/style elemanindan
  // erken cikamasin (sandbox disina kacis degil; yalnizca dogru ayrismasi icin).
  const css = String(e.css ?? '').replace(/<\/(style)/gi, '<\\/$1');
  const html = String(e.html ?? '');
  const js = String(e.js ?? '').replace(/<\/(script)/gi, '<\\/$1');

  const csp = [
    "default-src 'none'",
    `script-src 'unsafe-inline' ${EMBED_LIB_HOST}`,
    "style-src 'unsafe-inline' https://fonts.googleapis.com",
    'font-src https://fonts.gstatic.com data:',
    'img-src https: data: blob:',
    'media-src https: data: blob:',
    "connect-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-src 'none'",
    "child-src 'none'",
  ].join('; ');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<base target="_blank">
<style>
  html,body{margin:0;padding:0;background:transparent;color:#e9ecf8;font-family:system-ui,-apple-system,sans-serif;overflow-x:hidden;}
  *{box-sizing:border-box;}
  canvas{max-width:100%;}
</style>
<style>${css}</style>
${libTags}
</head>
<body>
${html}
<script>${js}</script>
<script>
(function(){
  // Ana sayfaya yuksekligini bildirir (otomatik boyutlandirma). Sadece bir sayi
  // gonderir; ana taraf kaynagi (contentWindow) dogrular ve degeri sinirlar.
  function post(){
    try{
      var h = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
      parent.postMessage({ __baEmbed: 1, h: h }, '*');
    }catch(e){}
  }
  window.addEventListener('load', post);
  try{ if (window.ResizeObserver) new ResizeObserver(post).observe(document.documentElement); }catch(e){}
  setTimeout(post, 250); setTimeout(post, 1000); setTimeout(post, 2500);
})();
</script>
</body>
</html>`;
}
