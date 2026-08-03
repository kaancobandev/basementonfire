// public/articles/<slug>/ tarayip lib/articlePhotos.ts uretir. Yeni gorsel sonrasi calistir.
//
// ⚠ 2026-08-03: bu dosya KIRIKTI ve sessizce kirikti. Cikti sablonu tek tirnakli
// bir string icinde satir sonu tasiyordu (SyntaxError: Invalid or unexpected
// token) → script her calistirmada patliyordu, kimse fark etmedi ve manifest
// atilla + kanuni eklendiginde guncellenemedi. Sablon artik template literal.
// Ikinci duzeltme: uzanti regex'inde nokta kacissizdi (/.(webp|...)/) → herhangi
// bir karakteri eslestiriyordu; \. yapildi.
const fs = require('fs'), path = require('path');
const root = 'public/articles';
const out = {};
for (const slug of fs.readdirSync(root)) {
  const dir = path.join(root, slug);
  if (!fs.statSync(dir).isDirectory()) continue;
  const imgs = fs.readdirSync(dir).filter((f) => /\.(webp|jpg|jpeg|png)$/i.test(f)).sort();
  if (imgs.length) out[slug] = imgs.map((f) => '/articles/' + slug + '/' + f);
}
fs.writeFileSync(
  'lib/articlePhotos.ts',
  `// OTOMATİK ÜRETİLDİ — elle düzenleme. node scripts/gen-article-photos.cjs
export const ARTICLE_PHOTOS: Record<string, string[]> = ${JSON.stringify(out, null, 2)};
`,
);
console.log('yazildi', Object.keys(out).length, 'makale');
