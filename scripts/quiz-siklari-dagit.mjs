#!/usr/bin/env node
/**
 * QUIZ ŞIKLARINI DAĞIT
 * ─────────────────────────────────────────────────────────────
 * Sorun: sitedeki quiz'lerin sorularının %81'inde doğru cevap B şıkkıydı;
 * dört makalede İSTİSNASIZ hepsi. Okuyucu deseni iki soruda fark edip
 * gerisini okumadan tıklıyordu — quiz ölçmek istediği şeyi ölçmüyordu.
 *
 * Çözüm: rastgele karıştırma DEĞİL, deterministik döndürme. Her soruda
 * doğru cevap bir sonraki konuma kayar (A→B→C→D→A...), böylece dağılım
 * eşitlenir, sonuç tekrar çalıştırınca aynı çıkar ve doğrulanabilir.
 * Döndürme şıkların göreli sırasını da korur.
 *
 * DEĞİŞMEZ KURALLAR (script kendini denetler, ihlalde çıkış kodu 1):
 *   1. Soru sayısı değişmez.
 *   2. Bir sorunun şık METİNLERİ kümesi değişmez (yalnız sıra değişir).
 *   3. Doğru cevabın METNİ değişmez.
 * Soru metni, şık metni ve açıklamalar hiç ellenmez.
 *
 * Kullanım:  node scripts/quiz-siklari-dagit.mjs [--yaz]
 *            (--yaz olmadan hiçbir dosyaya dokunmaz)
 */
import fs from 'node:fs';
import path from 'node:path';

const YAZ = process.argv.includes('--yaz');
const KOK = 'app/articles';

/**
 * Sırası değişirse ANLAMI bozulan şıklar: diğer şıklara atıf yapanlar.
 * Dikkat — "Hiçbir şey olmaz" gibi kendi başına anlamlı çeldiriciler BUNA
 * GİRMEZ; onlar serbestçe yer değiştirebilir. Bu yüzden kalıp, şıkkın
 * TAMAMIYLA eşleşmesini ister.
 */
const SIRAYA_BAGIMLI = /^(hiçbiri(ni)?|hepsi(ni)?|yukarıdakiler(in hepsi)?|her ikisi de)[.!]?$/i;

/** Doğru cevabı tutan alan adı makaleden makaleye değişiyor. */
const DOGRU_ALAN = /\b(a|correct|dogru)\s*:\s*(\d+)/;

/* ── hedef konumlar ────────────────────────────────────────────────────
 * Doğru cevabı A→B→C→D diye SIRAYLA kaydırmak, "hep B" kadar olmasa da
 * yine bir desendir: okuyucu dört soruda çözer. Bunun yerine her makale
 * için DENGELİ bir hedef listesi kurup (her konum ~eşit sayıda) onu
 * tohumlanmış bir karıştırıcıdan geçiriyoruz: dağılım dengeli kalır ama
 * görünür bir sıra oluşmaz. Tohum makale adından türediği için sonuç
 * tekrar çalıştırınca aynı çıkar (deterministik).
 */
const tohumla = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const uretec = (tohum) => () => { tohum |= 0; tohum = tohum + 0x6D2B79F5 | 0; let t = Math.imul(tohum ^ tohum >>> 15, 1 | tohum); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

function hedefListesi(adet, tohum) {
  // Soru sayısı 4'ün katı değilse artan konumlar (or. 6 soruda A ve B) fazladan
  // birer kez düşer. Başlangıcı da tohuma bağlayıp bu fazlalığın hep aynı
  // konumlara binmesini engelliyoruz — yoksa site genelinde A/B yine şişerdi.
  const kaydir = tohum % 4;
  const liste = Array.from({ length: adet }, (_, i) => (i + kaydir) % 4);
  const rnd = uretec(tohum);
  for (let i = liste.length - 1; i > 0; i--) {           // Fisher-Yates
    const j = Math.floor(rnd() * (i + 1));
    [liste[i], liste[j]] = [liste[j], liste[i]];
  }
  return liste;
}

/* ── tırnak ve kaçış farkında ayrıştırma ───────────────────────────── */

function diziSonu(src, bas) {
  let d = 0, t = null;
  for (let i = bas; i < src.length; i++) {
    const c = src[i];
    if (t) { if (c === '\\') { i++; continue; } if (c === t) t = null; continue; }
    if (c === "'" || c === '"' || c === '`') { t = c; continue; }
    if (c === '[') d++;
    else if (c === ']') { d--; if (!d) return i; }
  }
  return -1;
}

function ustDuzeyBol(govde) {
  const p = []; let bas = 0, d = 0, t = null;
  for (let i = 0; i < govde.length; i++) {
    const c = govde[i];
    if (t) { if (c === '\\') { i++; continue; } if (c === t) t = null; continue; }
    if (c === "'" || c === '"' || c === '`') { t = c; continue; }
    if ('[{('.includes(c)) d++;
    else if (']})'.includes(c)) d--;
    else if (c === ',' && !d) { p.push(govde.slice(bas, i)); bas = i + 1; }
  }
  p.push(govde.slice(bas));
  // ⚠ BOŞ PARÇALAR KORUNUR. Diziyi yeniden kurarken join(',') ile birleştiriyoruz;
  // sondaki virgülden sonra gelen boş parça (kapanış `]` öncesindeki satır sonu)
  // atılırsa `];` son sorunun satırına yapışır. Ayrıştırma tarafı boşları zaten
  // eleyecek.
  return p;
}

const metniCoz = (ham) => {
  const s = ham.trim(), q = s[0];
  return (q === "'" || q === '"' || q === '`') ? s.slice(1, -1).replace(/\\(.)/g, '$1') : s;
};

/** Bir kaynak dosyadan quiz'i çıkarır: [{ siklar:[metin], dogruMetin }] */
function quizOku(src) {
  const m = src.match(/(?:quizQs|QUIZ|QUIZ_Q|sorular)\s*(?::[^=]*)?=\s*\[/);
  if (!m) return null;
  const bas = src.indexOf('[', m.index);
  const son = diziSonu(src, bas);
  if (son < 0) return null;
  const sorular = ustDuzeyBol(src.slice(bas + 1, son));
  const cikti = [];
  for (const s of sorular) {
    const oBas = s.search(/\bopts\s*:\s*\[/);
    const dEs = s.match(DOGRU_ALAN);
    if (oBas < 0 || !dEs) { cikti.push(null); continue; }
    const oB = s.indexOf('[', oBas), oS = diziSonu(s, oB);
    const siklar = ustDuzeyBol(s.slice(oB + 1, oS)).filter(x => x.trim()).map(metniCoz);
    cikti.push({ siklar, dogruMetin: siklar[+dEs[2]] });
  }
  return { bas, son, sorular, ozet: cikti };
}

/* ── dosyaları tara ────────────────────────────────────────────────── */

const dosyalar = [];
(function tara(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) tara(p);
    else if (e.name.endsWith('.tsx')) dosyalar.push(p);
  }
})(KOK);

const rapor = [];
let toplamSoru = 0, dondurulen = 0, atlanan = 0, hata = 0;
const dagilimOnce = {}, dagilimSonra = {};

for (const dosya of dosyalar) {
  const src = fs.readFileSync(dosya, 'utf8');
  const q = quizOku(src);
  if (!q || !q.ozet.some(Boolean)) continue;

  const makale = dosya.replace(/^app[\\/]articles[\\/]/, '').replace(/[\\/].*$/, '');
  const yeniSorular = [];
  const hedefler = hedefListesi(q.ozet.filter(Boolean).length, tohumla(makale));
  let sira = 0, dosyaDondurulen = 0, dosyaAtlanan = 0;

  for (let i = 0; i < q.sorular.length; i++) {
    const soru = q.sorular[i];
    const ozet = q.ozet[i];
    if (!ozet) { yeniSorular.push(soru); continue; }

    toplamSoru++;
    const oBas = soru.search(/\bopts\s*:\s*\[/);
    const oB = soru.indexOf('[', oBas), oS = diziSonu(soru, oB);
    const hamSik = ustDuzeyBol(soru.slice(oB + 1, oS)).filter(x => x.trim());
    const dEs = soru.match(DOGRU_ALAN);
    const alan = dEs[1], c = +dEs[2], n = hamSik.length;
    dagilimOnce[c] = (dagilimOnce[c] || 0) + 1;

    const hedef = hedefler[sira++];

    if (ozet.siklar.some(t => SIRAYA_BAGIMLI.test(t.trim()))) {
      yeniSorular.push(soru); dosyaAtlanan++; atlanan++;
      dagilimSonra[c] = (dagilimSonra[c] || 0) + 1;
      continue;
    }

    const t = hedef % n, k = (c - t + n) % n;
    dagilimSonra[t] = (dagilimSonra[t] || 0) + 1;
    if (k === 0) { yeniSorular.push(soru); continue; }

    const yeniSik = hamSik.slice(k).concat(hamSik.slice(0, k));
    if (metniCoz(yeniSik[t]) !== ozet.dogruMetin) {
      console.error(`✗ ${makale}: doğru cevap kaydı — "${ozet.dogruMetin.slice(0, 40)}"`);
      hata++; yeniSorular.push(soru); continue;
    }

    // Yalnızca opts dizisi ve doğru-cevap indeksi değişir; gerisi harfi harfine aynı.
    const kuyruk = soru.slice(oS).replace(DOGRU_ALAN, `${alan}: ${t}`);
    yeniSorular.push(soru.slice(0, oB + 1) + yeniSik.join(',') + kuyruk);
    dosyaDondurulen++; dondurulen++;
  }

  const yeniSrc = src.slice(0, q.bas + 1) + yeniSorular.join(',') + src.slice(q.son);

  // ── DOĞRULAMA: yeni kaynağı baştan ayrıştır, değişmez kuralları sına ──
  const kontrol = quizOku(yeniSrc);
  const sirala = (a) => [...a].sort().join('│');
  let dosyaHata = 0;
  if (!kontrol || kontrol.ozet.length !== q.ozet.length) { dosyaHata++; }
  else for (let i = 0; i < q.ozet.length; i++) {
    const a = q.ozet[i], b = kontrol.ozet[i];
    if (!a && !b) continue;
    if (!a || !b) { dosyaHata++; continue; }
    if (sirala(a.siklar) !== sirala(b.siklar)) { console.error(`✗ ${makale} s${i + 1}: şık kümesi değişti`); dosyaHata++; }
    if (a.dogruMetin !== b.dogruMetin) { console.error(`✗ ${makale} s${i + 1}: doğru cevap değişti`); dosyaHata++; }
  }
  hata += dosyaHata;

  if (YAZ && !dosyaHata && dosyaDondurulen) fs.writeFileSync(dosya, yeniSrc);
  rapor.push({ makale, soru: q.ozet.filter(Boolean).length, dondurulen: dosyaDondurulen, atlanan: dosyaAtlanan, hata: dosyaHata });
}

console.log(YAZ ? '── YAZILDI ──\n' : '── DENEME (dosyaya dokunulmadı) · uygulamak için --yaz ──\n');
console.log('makale'.padEnd(22), 'soru'.padEnd(5), 'döndürülen'.padEnd(11), 'atlanan'.padEnd(8), 'hata');
for (const r of rapor) console.log(r.makale.padEnd(22), String(r.soru).padEnd(5), String(r.dondurulen).padEnd(11), String(r.atlanan).padEnd(8), r.hata);

const yuzde = (d) => { const top = Object.values(d).reduce((a, b) => a + b, 0); return Object.entries(d).sort().map(([k, v]) => `${'ABCD'[k]}:${v} (%${Math.round(v / top * 100)})`).join('  '); };
console.log(`\nÖNCE   ${yuzde(dagilimOnce)}`);
console.log(`SONRA  ${yuzde(dagilimSonra)}`);
console.log(`\ntoplam ${toplamSoru} soru · ${dondurulen} döndürüldü · ${atlanan} atlandı · ${hata} hata`);
process.exit(hata ? 1 : 0);
