// Görselleri gösterim anında Netlify Image CDN üzerinden cihaza göre yeniden
// boyutlandırıp WebP olarak sunar (orijinali Storage'da yüksek kalitede kalır).
// Sadece ÜRETİMDE (Netlify) devreye girer; geliştirmede (next dev) /.netlify/images
// olmadığından orijinal URL kullanılır.

const WIDTHS = [320, 480, 640, 768, 960, 1280, 1600, 1920];

function isProd() {
  return process.env.NODE_ENV === 'production';
}

function eligible(src: string): boolean {
  if (!src) return false;
  if (!/^https?:\/\//i.test(src)) return false;        // sadece mutlak http(s): yerel/relative/blob/data atlanır
  if (/\.gif($|\?)/i.test(src)) return false;          // animasyonlu GIF'i bozma
  return true;
}

/** Tek bir genişlik için CDN URL'i (srcSet eşleşmezse kullanılacak varsayılan src). */
export function cdnUrl(src: string, width = 1280, quality = 78): string {
  if (!isProd() || !eligible(src)) return src;
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&fm=webp&q=${quality}`;
}

/** Responsive srcSet (cihazın DPR + sizes değerine göre tarayıcı seçer). */
export function cdnSrcSet(src: string, quality = 78): string | undefined {
  if (!isProd() || !eligible(src)) return undefined;
  return WIDTHS.map(w => `${cdnUrl(src, w, quality)} ${w}w`).join(', ');
}
