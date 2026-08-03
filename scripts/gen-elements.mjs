// app/articles/periyodik-tablo/elements.ts üretir. Tek seferlik değil: veri
// yenilenirse tekrar çalıştırılır.
//
//   node scripts/gen-elements.mjs          # üret
//   node scripts/gen-elements.mjs --dry    # sadece getir + doğrula, yazma
//
// KAYNAKLAR ve LİSANS:
//   Sayısal veri → PubChem REST (NCBI/NLM, ABD devleti → KAMU MALI, ticari
//     kullanım serbest; NLM atıf RİCA ediyor, zorunlu değil). Arkasında IUPAC
//     (CIAAW), NIST, IAEA, Jefferson Lab zinciri var.
//   Türkçe adlar → Wikidata (CC0, atıf zorunlu değil). ⚠ Yalnız YAPILANDIRILMIŞ
//     veri CC0; Wikipedia METNİ CC BY-SA, oradan alıntı yapılmıyor.
//   Bowserinator/Periodic-Table-JSON BİLEREK KULLANILMADI: CC BY-SA 3.0 ve
//     ShareAlike bulaşıcı — sitenin reklam/sponsorluk planıyla uyumsuz.
//
// GRUP 3 KARARI (makalenin konusu, o yüzden burada açıkça yazılı):
//   Bu tablo GELENEKSEL / TKD biçimini kullanıyor → grup 3'te Lantan (57) ve
//   Aktinyum (89) durur; f-blok satırları Ce–Lu ve Th–Lr'dir. Türkiye Kimya
//   Derneği'nin resmî Türkçe tablosu da böyle. IUPAC'in 2021 GEÇİCİ raporu
//   Sc-Y-Lu-Lr biçimini öneriyor ama karar HÂLÂ verilmedi — makalenin 3. perdesi
//   tam olarak bunu anlatıyor. Biçimi değiştirirsen makale metnini de değiştir.

import fs from 'node:fs';

const KURU = process.argv.includes('--dry');
const UA = 'basementonfire-element-data/1.0 (https://basementonfire.com; kaaan3452@gmail.com)';

// ── 1) PubChem: sayısal veri ────────────────────────────────────────────────
const PUBCHEM = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/CSV';

// Tırnaklı alan taşıyabilen minimal CSV çözücü (OxidationStates virgül içerir).
function csv(metin) {
  const satirlar = [];
  let alan = '', satir = [], tirnak = false;
  for (let i = 0; i < metin.length; i++) {
    const c = metin[i];
    if (tirnak) {
      if (c === '"') { if (metin[i + 1] === '"') { alan += '"'; i++; } else tirnak = false; }
      else alan += c;
    } else if (c === '"') tirnak = true;
    else if (c === ',') { satir.push(alan); alan = ''; }
    else if (c === '\n') { satir.push(alan); satirlar.push(satir); satir = []; alan = ''; }
    else if (c !== '\r') alan += c;
  }
  if (alan || satir.length) { satir.push(alan); satirlar.push(satir); }
  return satirlar.filter((s) => s.length > 1);
}

// ── 2) Wikidata: Türkçe adlar ───────────────────────────────────────────────
const SPARQL = `SELECT ?z ?ad WHERE {
  ?el wdt:P31 wd:Q11344 ; wdt:P1086 ?z .
  ?el rdfs:label ?ad . FILTER(LANG(?ad) = "tr")
} ORDER BY ?z`;

// ⚠ ELLE DÜZELTME: Wikidata bu ikisinde 2016'da TERK EDİLMİŞ IUPAC yer
// tutucularını taşıyor. Kaynağı düzeltmek bizim işimiz değil, çıktıyı düzeltmek
// bizim işimiz.
const AD_DUZELTME = {
  113: 'Nihonyum',      // Wikidata: "ununtriyum" — 2016'da Nihonium oldu
  117: 'Tennessin',     // Wikidata: "ununseptiyum" — 2016'da Tennessine oldu
};

// ⚠ BİLİNEN VARYANTLAR — BİLEREK DEĞİŞTİRİLMEDİ.
// Türkçede iki biçimi de kullanılan adlar var ve Wikidata bunlarda kendi içinde
// tutarsız görünüyor:
//     59 Pr "Praseodim"  ↔  60 Nd "Neodimyum"   (biri -yum alıyor, öteki almıyor)
//     41 Nb "Niobyum"    ↔  yaygın kullanımda "Niyobyum"
// Kendi tercihimizi tek kaynağın üstüne yazmak, doğrulanamayan ve yeniden
// üretilemeyen değerler doğurur — o yüzden Wikidata (CC0) tek kaynak olarak
// bırakıldı. Otoriter bir liste (TKD basılı tablosu) elde edilirse buraya
// AD_DUZELTME satırı eklemek yeterli; gövde metnine dokunmak gerekmez.

// Türkçe büyük harf tuzağı: "iterbiyum" → toUpperCase() 'i'yi 'I' yapar.
// Elle eşliyoruz, ICU'ya güvenmiyoruz (SSR'da hidrasyon riski).
const buyukIlk = (s) => {
  const ilk = s[0];
  const cevrim = { i: 'İ', 'ı': 'I', 'ş': 'Ş', 'ğ': 'Ğ', 'ü': 'Ü', 'ö': 'Ö', 'ç': 'Ç' };
  return (cevrim[ilk] ?? ilk.toUpperCase()) + s.slice(1);
};

// ── 3) Yerleşim: Z → { periyot, grup, blok } ────────────────────────────────
// Geleneksel/TKD biçimi. f-blok satırları ayrı çizilir (grup = 0 işareti).
function yerlesim(z) {
  const P = [[1, 2], [3, 10], [11, 18], [19, 36], [37, 54], [55, 86], [87, 118]];
  const periyot = P.findIndex(([a, b]) => z >= a && z <= b) + 1;

  if (z === 1) return { periyot: 1, grup: 1, blok: 's' };
  if (z === 2) return { periyot: 1, grup: 18, blok: 's' };

  // f-blok: Ce–Lu ve Th–Lr (Lantan ve Aktinyum grup 3'te KALIR)
  if ((z >= 58 && z <= 71) || (z >= 90 && z <= 103)) {
    return { periyot, grup: 0, blok: 'f' };
  }

  let grup;
  if (periyot === 2 || periyot === 3) {
    const i = z - (periyot === 2 ? 3 : 11);       // 0..7
    grup = i < 2 ? i + 1 : i + 11;                // 1,2, 13..18
  } else if (periyot === 4 || periyot === 5) {
    grup = z - (periyot === 4 ? 19 : 37) + 1;     // 1..18
  } else {
    // 6 ve 7: 55,56,57 → 1,2,3 · 72+ → 4..18 (f-blok satırı atlanmış)
    const taban = periyot === 6 ? 55 : 87;
    grup = z <= taban + 2 ? z - taban + 1 : z - taban - 14 + 1;
  }

  const blok = grup <= 2 ? 's' : grup >= 13 ? 'p' : 'd';
  return { periyot, grup, blok };
}

// ── çalıştır ────────────────────────────────────────────────────────────────
const say = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };

console.log('PubChem çekiliyor…');
const pcRes = await fetch(PUBCHEM, { headers: { 'User-Agent': UA } });
if (!pcRes.ok) throw new Error(`PubChem ${pcRes.status}`);
const tablo = csv(await pcRes.text());
const bas = tablo[0].map((s) => s.trim());
const sut = (ad) => bas.indexOf(ad);
console.log(`  ${tablo.length - 1} satır, ${bas.length} sütun`);

console.log('Wikidata Türkçe adlar çekiliyor…');
// WDQS halka açık uç nokta ve düzenli 502/429 veriyor — üstel bekleyişle dene.
async function wdqs(deneme = 5) {
  for (let i = 1; i <= deneme; i++) {
    const r = await fetch('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(SPARQL), {
      headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json' },
    });
    if (r.ok) return r.json();
    console.log(`  ${r.status} — ${i}/${deneme}, ${i * 3}s bekleniyor`);
    if (i < deneme) await new Promise((c) => setTimeout(c, i * 3000));
  }
  throw new Error('Wikidata uç noktası yanıt vermedi');
}
const adlar = new Map();
for (const b of (await wdqs()).results.bindings) {
  const z = parseInt(b.z.value, 10);
  if (z >= 1 && z <= 118 && !adlar.has(z)) adlar.set(z, b.ad.value);
}
console.log(`  ${adlar.size}/118 Türkçe ad`);

const elementler = [];
for (const satir of tablo.slice(1)) {
  const z = parseInt(satir[sut('AtomicNumber')], 10);
  if (!z) continue;
  const ham = AD_DUZELTME[z] ?? adlar.get(z);
  if (!ham) { console.warn(`  ⚠ ${z} için Türkçe ad YOK`); continue; }
  const { periyot, grup, blok } = yerlesim(z);
  elementler.push({
    z,
    s: satir[sut('Symbol')].trim(),
    ad: buyukIlk(ham.trim()),
    en: satir[sut('Name')].trim(),
    kutle: say(satir[sut('AtomicMass')]),
    periyot, grup, blok,
    kategori: satir[sut('GroupBlock')].trim(),
    dizilim: satir[sut('ElectronConfiguration')].trim(),
    enegatiflik: say(satir[sut('Electronegativity')]),
    iyonlasma: say(satir[sut('IonizationEnergy')]),
    yaricap: say(satir[sut('AtomicRadius')]),
    yogunluk: say(satir[sut('Density')]),
    erime: say(satir[sut('MeltingPoint')]),
    kaynama: say(satir[sut('BoilingPoint')]),
    hal: satir[sut('StandardState')].trim(),
    kesif: satir[sut('YearDiscovered')].trim(),
    renk: satir[sut('CPKHexColor')].trim(),
  });
}

// ── doğrulama ───────────────────────────────────────────────────────────────
const hata = [];
if (elementler.length !== 118) hata.push(`118 element bekleniyordu, ${elementler.length} var`);
for (let z = 1; z <= 118; z++) if (!elementler.find((e) => e.z === z)) hata.push(`Z=${z} eksik`);
const fSayi = elementler.filter((e) => e.blok === 'f').length;
if (fSayi !== 28) hata.push(`f-blok 28 olmalı, ${fSayi} çıktı`);
for (const e of elementler) {
  if (e.grup !== 0 && (e.grup < 1 || e.grup > 18)) hata.push(`Z=${e.z} grup ${e.grup}`);
  if (!e.ad || !e.s) hata.push(`Z=${e.z} ad/sembol boş`);
}
// Bilinen çapa değerler — veri kayarsa yakalansın.
const capa = { 1: 'Hidrojen', 26: 'Demir', 79: 'Altın', 80: 'Cıva', 113: 'Nihonyum', 117: 'Tennessin', 118: 'Oganesson' };
for (const [z, ad] of Object.entries(capa)) {
  const e = elementler.find((x) => x.z === +z);
  if (e && e.ad !== ad) hata.push(`Z=${z} adı "${e.ad}", "${ad}" bekleniyordu`);
}
if (hata.length) { console.error('\n❌ DOĞRULAMA:'); hata.forEach((h) => console.error('  ' + h)); process.exit(1); }
console.log('✓ doğrulama geçti: 118 element, 28 f-blok, çapa adlar tutuyor');

if (KURU) { console.log('(--dry: yazılmadı)'); process.exit(0); }

const bd = `// OTOMATİK ÜRETİLDİ — elle düzenleme. node scripts/gen-elements.mjs
//
// Sayısal veri: PubChem (NCBI/NLM) — ABD devleti, kamu malı. IUPAC/CIAAW, NIST,
// IAEA, Jefferson Lab zincirine dayanıyor. Türkçe adlar: Wikidata (CC0).
// Grup 3'te Lantan ve Aktinyum durur (geleneksel/TKD biçimi) — bkz. script başı.

export type Element = {
  z: number; s: string; ad: string; en: string;
  kutle: number | null;
  periyot: number; grup: number; blok: 's' | 'p' | 'd' | 'f';
  kategori: string; dizilim: string;
  enegatiflik: number | null; iyonlasma: number | null; yaricap: number | null;
  yogunluk: number | null; erime: number | null; kaynama: number | null;
  hal: string; kesif: string; renk: string;
};

export const ELEMENTLER: Element[] = ${JSON.stringify(elementler, null, 0).replace(/\},\{/g, '},\n  {').replace(/^\[/, '[\n  ').replace(/\]$/, ',\n]')};

export const ELEMENT_BUL = (z: number) => ELEMENTLER.find((e) => e.z === z);
`;

fs.writeFileSync('app/articles/periyodik-tablo/elements.ts', bd);
console.log(`✓ elements.ts yazıldı — ${Math.round(bd.length / 1024)}KB`);
