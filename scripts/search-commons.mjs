// Commons'ta aday görsel arar — spec yazmadan ÖNCE başlıkları görmek için.
// Uydurma başlık yazmayı önler: buradan kopyaladığın başlık kesin vardır.
//
//   node scripts/search-commons.mjs "Colosseum" "Pantheon Rome dome"
//
// Her sorgu için ilk 6 sonucu lisans + boyutla listeler. Ticari kullanıma
// kapalı (NC/ND) olanları ✗ ile işaretler — spec'e ALMA.

const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'basementonfire-image-sourcing/1.0 (https://basementonfire.com; kaaan3452@gmail.com)';
const BAD = /(\bnc\b|noncommercial|non-commercial|\bnd\b|noderiv|fair use|non-free)/i;
const strip = (h) => (h ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

for (const q of process.argv.slice(2)) {
  const url = `${API}?${new URLSearchParams({
    action: 'query', generator: 'search', gsrsearch: q, gsrnamespace: '6', gsrlimit: '6',
    prop: 'imageinfo', iiprop: 'url|size|extmetadata',
    iiextmetadatafilter: 'LicenseShortName|Artist', format: 'json',
  })}`;
  const data = await (await fetch(url, { headers: { 'User-Agent': UA } })).json();
  const pages = Object.values(data?.query?.pages ?? {});
  // generator=search sırayı korumaz → arama skoruna göre geri sırala.
  pages.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  console.log(`\n━━ ${q}`);
  if (!pages.length) { console.log('   (sonuç yok)'); continue; }
  for (const p of pages) {
    const ii = p.imageinfo?.[0];
    if (!ii) continue;
    const em = ii.extmetadata ?? {};
    const lic = strip(em.LicenseShortName?.value) || '?';
    const who = strip(em.Artist?.value).slice(0, 34) || '—';
    const px = `${ii.width}×${ii.height}`;
    // .tif/.svg → CDN/sharp tarafında dertli, işaretle
    const fmt = /\.(tiff?|svg)$/i.test(p.title) ? ' ⚠fmt' : '';
    console.log(`${BAD.test(lic) ? '✗' : '·'} ${p.title}`);
    console.log(`   ${px.padEnd(12)} ${lic.padEnd(14)} ${who}${fmt}`);
  }
}
