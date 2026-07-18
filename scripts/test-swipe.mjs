// lib/swipe.ts kuralinin testi:  node scripts/test-swipe.mjs
//
// Neden var: "bir kaydirma = bir gorsel" kurali once yalniz CSS ile
// (scroll-snap-stop) cozuldu ama telefonda YETMEDI. Simdi karar JS'te ve
// dogrulanabilir olmasi gerekiyor. Tarayici onizlemesinde bu bileseni
// olcemedim (sayfa display:none render ediliyor, genislik 0 kaliyor),
// o yuzden mantik saf fonksiyona ayrildi ve burada siniyor.

import { readFileSync } from 'node:fs';

// lib/swipe.ts'i derlemeden okumak icin govdeyi buraya kopyalamiyoruz;
// tek fonksiyon oldugu icin kaynaktan cikarip degerlendiriyoruz.
const src = readFileSync(new URL('../lib/swipe.ts', import.meta.url), 'utf8');
const body = src.slice(src.indexOf('export function swipeTarget'))
  .replace(/export function/, 'function')
  .replace(/: number/g, '').replace(/\)\s*\{/, ') {');
const swipeTarget = new Function(`${body}; return swipeTarget;`)();

const W = 390, N = 8;
const cases = [
  ['normal ileri kaydirma',         2,  -120, 3],
  ['ASIRI savurma (10 ekran)',      2, -3900, 3],
  ['ASIRI savurma (sonsuza yakin)', 2,-99999, 3],
  ['normal geri kaydirma',          2,   120, 1],
  ['ASIRI geri savurma',            2,  3900, 1],
  ['esik alti (20px)',              2,   -20, 2],
  ['esik alti (-58px)',             2,   -58, 2],
  ['esik tam (-58.5px)',            2, -58.5, 3],
  ['ilk slaytta geri (kirpma)',     0,  3900, 0],
  ['son slaytta ileri (kirpma)',    7, -3900, 7],
  ['hic hareket',                   3,     0, 3],
  ['bozuk deger (NaN)',             3,   NaN, 3],
];

let fail = 0;
for (const [ad, from, dx, bek] of cases) {
  const got = swipeTarget(from, dx, W, N);
  const ok = got === bek;
  if (!ok) fail++;
  console.log(`${ok ? '  OK  ' : ' HATA '}${ad.padEnd(32)}${from} -> ${got} (beklenen ${bek})`);
}
console.log(`genislik 0            ${swipeTarget(3, -500, 0, N) === 3 ? '  OK' : ' HATA'}`);

// ASIL GARANTI: hicbir dx degeri 1 slayttan fazla atlatamaz.
let ihlal = 0;
for (let from = 0; from < N; from++)
  for (let dx = -5000; dx <= 5000; dx += 7)
    if (Math.abs(swipeTarget(from, dx, W, N) - from) > 1) ihlal++;

console.log(`\nKaba kuvvet (8 baslangic x ~1430 dx): 1'den fazla atlama = ${ihlal}`);
if (fail || ihlal) { console.error('BASARISIZ'); process.exit(1); }
console.log('TUM TESTLER GECTI');
