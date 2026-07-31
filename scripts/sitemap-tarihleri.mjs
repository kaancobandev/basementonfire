// lib/sitemap-dates.ts dosyasını git geçmişinden üretir.
//
// NEDEN VAR: sitemap her URL'ye `lastModified: new Date()` yazıyordu ve harita
// saatte bir yenilendiği için tüm sayfalar sürekli "az önce değişti" diyordu.
// Google, lastmod her zaman güncelse alanı öğrenip YOK SAYAR — yani gerçek bir
// önceliklendirme sinyali boşa gidiyordu (2026-07-31'de canlıda ölçüldü).
//
// Çalıştır:  node scripts/sitemap-tarihleri.mjs
// Ne zaman:  makale eklendiğinde/güncellendiğinde, deploy öncesi. Unutulursa
//            tarihler biraz eskir — yine de "hep şimdi"den çok daha iyidir.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

// Rota → tarihi belirleyen dosya/klasör
const HEDEF = {
  '/': 'app/page.tsx',
  '/discover': 'app/discover',
  '/akis': 'app/akis',
  '/reels': 'app/reels',
  '/muzik': 'app/muzik',
  '/lig': 'app/lig',
  '/hakkimizda': 'app/hakkimizda',
  '/teknoloji': 'app/teknoloji',
  '/yol-haritasi': 'app/yol-haritasi',
  '/iletisim': 'app/iletisim',
  '/basin': 'app/basin',
  '/en': 'app/en',
  '/gizlilik': 'app/gizlilik',
  '/kosullar': 'app/kosullar',
  '/aydinlatma': 'app/aydinlatma',
  '/acik-riza': 'app/acik-riza',
};

const gitTarih = (yol) => {
  try {
    const d = execSync(`git log -1 --format=%cI -- "${yol}"`, { encoding: 'utf8' }).trim();
    return d || null;
  } catch { return null; }
};

const slugler = fs.readFileSync('lib/articles.ts', 'utf8')
  .match(/slug: '([^']+)'/g).map((m) => m.slice(7, -1));

const makale = {};
for (const s of slugler) {
  const d = gitTarih(`app/articles/${s}`);
  if (d) makale[s] = d;
}

const sayfa = {};
for (const [rota, yol] of Object.entries(HEDEF)) {
  const d = gitTarih(yol);
  if (d) sayfa[rota] = d;
}

const out = `// ÜRETİLMİŞ DOSYA — elle düzenleme.
// Kaynak: scripts/sitemap-tarihleri.mjs · git geçmişinden okunur.
// Yeniden üret:  node scripts/sitemap-tarihleri.mjs
//
// Sitemap'teki lastModified bu tarihlerden gelir. Öncesinde her URL
// "new Date()" yazıyordu; harita saatte bir yenilendiği için tüm sayfalar
// sürekli "az önce değişti" diyordu ve Google bu sinyali yok sayıyordu.

export const MAKALE_TARIH: Record<string, string> = ${JSON.stringify(makale, null, 2)};

export const SAYFA_TARIH: Record<string, string> = ${JSON.stringify(sayfa, null, 2)};

/** Bilinmeyen rota için güvenli geri düşüş: dosyanın üretildiği an. */
export const URETIM_TARIHI = '${new Date().toISOString()}';
`;

fs.writeFileSync('lib/sitemap-dates.ts', out, 'utf8');
console.log(`lib/sitemap-dates.ts yazıldı — ${Object.keys(makale).length} makale, ${Object.keys(sayfa).length} sayfa`);
