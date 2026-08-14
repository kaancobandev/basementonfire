// app/fonts/ altındaki woff2 dosyalarını Google Fonts'tan yeniler.
//
//   node scripts/fontlari-indir.mjs
//
// NEDEN VAR: 2026-08-14'te `next/font/google` kullanılıyordu ve woff2'leri
// DERLEME ANINDA indiriyordu. fonts.gstatic.com yaklaşık bir dakika hata döndürdü,
// Netlify build'i "Failed to fetch `Bricolage Grotesque`" ile düştü ve deploy
// kayboldu. Dosyalar repoya alındı (`next/font/local`) → derleme artık Google'a
// bağımlı DEĞİL. Bu betik yalnızca ELLE, font sürümünü tazelemek istendiğinde
// çalıştırılır; derleme akışının parçası DEĞİLDİR ve olmamalıdır.
//
// ⚠ AİLE BAŞINA İKİ DOSYA — İKİSİ DE ŞART. Türkçe iki alt kümeye yayılı:
//   latin     → ç ö ü ve `ı` (U+0131)
//   latin-ext → ğ İ ş
// Birini atlarsan Türkçe metin sessizce yedek fonta düşer; ekranda hemen belli
// olmaz, ancak harf harf bakınca fark edilir.
//
// ⚠ ÇIKTIDAKİ unicode-range DEĞERLERİNİ app/layout.tsx'e KOPYALA. Google bu
// aralıkları zamanla değiştirebilir; dosyayı yenileyip aralığı eski bırakırsan
// yeni glifler kapsam dışında kalır.
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const OUT = path.join('app', 'fonts');

// Ağırlıklar ARALIK olarak isteniyor → alt küme başına tek DEĞİŞKEN font dosyası.
// Sabit ağırlık listesi (600;700;800) altı ayrı dosya üretirdi, toplamı daha büyük.
const AILE = [
  { ad: 'bricolage', spec: 'Bricolage+Grotesque:opsz,wght@12..96,600..800' },
  { ad: 'dmsans', spec: 'DM+Sans:opsz,wght@9..40,400..700' },
];

const ISTENEN = new Set(['latin', 'latin-ext']);

async function main() {
  await mkdir(OUT, { recursive: true });
  const rapor = [];

  for (const { ad, spec } of AILE) {
    const url = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
    const res = await fetch(url, { headers: { 'user-agent': UA } });
    if (!res.ok) throw new Error(`CSS alınamadı (${res.status}): ${url}`);
    const css = await res.text();

    // Her @font-face bloğu "/* latin-ext */" gibi bir yorumla başlıyor.
    for (const b of css.split('/*').slice(1)) {
      const altKume = b.slice(0, b.indexOf('*/')).trim();
      if (!ISTENEN.has(altKume)) continue;
      const src = b.match(/url\((https:\/\/[^)]+\.woff2)\)/)?.[1];
      const range = b.match(/unicode-range:\s*([^;]+);/)?.[1]?.trim();
      if (!src || !range) continue;

      const fr = await fetch(src, { headers: { 'user-agent': UA } });
      if (!fr.ok) throw new Error(`Font inmedi (${fr.status}): ${src}`);
      const buf = Buffer.from(await fr.arrayBuffer());
      const dosya = `${ad}-${altKume}.woff2`;
      await writeFile(path.join(OUT, dosya), buf);
      rapor.push({ ad, altKume, range });
      console.log(`✓ ${dosya.padEnd(28)} ${(buf.length / 1024).toFixed(1).padStart(6)} KB`);
    }
  }

  const eksik = AILE.filter((a) => rapor.filter((r) => r.ad === a.ad).length !== 2);
  if (eksik.length) throw new Error(`Alt küme eksik kaldı: ${eksik.map((e) => e.ad).join(', ')}`);

  console.log('\n── unicode-range (app/layout.tsx ile KARŞILAŞTIR) ──');
  for (const r of rapor) console.log(`\n${r.ad} · ${r.altKume}:\n${r.range}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
