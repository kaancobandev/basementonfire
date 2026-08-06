#!/usr/bin/env node
/**
 * MAKALE QUIZ SORULARINI SQL'E ÇEVİR
 * ─────────────────────────────────────────────────────────────
 * Sitede iki ayrı quiz büyümüştü:
 *   • makale içindeki "mini quiz" — kaynak dosyada dizi, hiçbir yere yazmaz,
 *     XP vermez, 170 soru (26 makale)
 *   • XP kazandıran quiz — quiz_questions tablosundan okur, cevabı
 *     article_quiz_answers'a yazar, +5 XP verir; ama tabloda yalnız 33 soru
 *     ve 14 makalenin HİÇ sorusu yok (takyon dahil)
 *
 * Mini quiz kaldırılıp her yerde XP'li altyapıya geçilecek. Bu betik, kaynak
 * dosyalardaki 170 soruyu tabloya taşıyacak SQL'i üretir — içerik kaybı olmaz.
 *
 * Üretilen SQL YENİDEN ÇALIŞTIRILABİLİR: her satır `where not exists` ile
 * korunuyor, aynı (article_slug, question) ikilisi iki kez eklenmez. Mevcut
 * satırlar SİLİNMEZ — article_quiz_answers onlara `on delete cascade` ile
 * bağlı, silmek kullanıcıların kazandığı XP kaydını da silerdi.
 *
 * Kullanım: node scripts/quiz-sorulari-sql-uret.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const KOK = 'app/articles';
const CIKTI = 'sql/quiz-questions-makale-govdesi.sql';

/* ── tırnak/kaçış farkında ayrıştırma (quiz-siklari-dagit.mjs ile aynı) ── */
function diziSonu(src, bas) {
  let d = 0, t = null;
  for (let i = bas; i < src.length; i++) {
    const c = src[i];
    if (t) { if (c === '\\') { i++; continue; } if (c === t) t = null; continue; }
    if (c === "'" || c === '"' || c === '`') { t = c; continue; }
    if (c === '[') d++; else if (c === ']') { d--; if (!d) return i; }
  }
  return -1;
}
function ustDuzeyBol(govde) {
  const p = []; let bas = 0, d = 0, t = null;
  for (let i = 0; i < govde.length; i++) {
    const c = govde[i];
    if (t) { if (c === '\\') { i++; continue; } if (c === t) t = null; continue; }
    if (c === "'" || c === '"' || c === '`') { t = c; continue; }
    if ('[{('.includes(c)) d++; else if (']})'.includes(c)) d--;
    else if (c === ',' && !d) { p.push(govde.slice(bas, i)); bas = i + 1; }
  }
  p.push(govde.slice(bas));
  return p.filter(x => x.trim());
}
const metniCoz = (ham) => {
  const s = ham.trim(), q = s[0];
  return (q === "'" || q === '"' || q === '`') ? s.slice(1, -1).replace(/\\(.)/g, '$1') : s;
};
/** `alan: '...'` biçimindeki tek değerli alanı okur. */
function alanOku(soru, adlar) {
  for (const ad of adlar) {
    const re = new RegExp(`\\b${ad}\\s*:\\s*(['"\`])`);
    const m = soru.match(re);
    if (!m) continue;
    const q = m[1];
    let i = m.index + m[0].length;
    let out = '';
    for (; i < soru.length; i++) {
      if (soru[i] === '\\') { out += soru[i + 1]; i++; continue; }
      if (soru[i] === q) break;
      out += soru[i];
    }
    return out;
  }
  return null;
}

/* ── dosyaları tara ── */
const dosyalar = [];
(function tara(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) tara(p);
    // ⚠ .ts DE taranmalı: Katman A makaleleri (atilla, kanuni, sezar…) quizQs'i
    // data.ts içinde tutuyor; yalnız .tsx taranınca 7 makale sessizce atlanıyordu.
    else if (/\.tsx?$/.test(e.name)) dosyalar.push(p);
  }
})(KOK);

const kayitlar = [];
const rapor = [];
for (const dosya of dosyalar) {
  const src = fs.readFileSync(dosya, 'utf8');
  const m = src.match(/(?:quizQs|QUIZ|QUIZ_Q|sorular)\s*(?::[^=]*)?=\s*\[/);
  if (!m) continue;
  const bas = src.indexOf('[', m.index);
  const son = diziSonu(src, bas);
  if (son < 0) continue;
  const slug = dosya.replace(/^app[\\/]articles[\\/]/, '').replace(/[\\/].*$/, '');
  let n = 0;
  for (const soru of ustDuzeyBol(src.slice(bas + 1, son))) {
    const oBas = soru.search(/\bopts\s*:\s*\[/);
    const dEs = soru.match(/\b(?:a|correct|dogru)\s*:\s*(\d+)/);
    if (oBas < 0 || !dEs) continue;
    const oB = soru.indexOf('[', oBas), oS = diziSonu(soru, oB);
    const siklar = ustDuzeyBol(soru.slice(oB + 1, oS)).map(metniCoz);
    const metin = alanOku(soru, ['text', 'q', 'soru', 'question']);
    if (!metin || siklar.length < 2) continue;
    kayitlar.push({
      slug,
      question: metin,
      options: siklar,
      correct: +dEs[1],
      explanation: alanOku(soru, ['exp', 'aciklama', 'explanation']),
    });
    n++;
  }
  if (n) rapor.push({ slug, n });
}

/* ── doğrulama ── */
let hata = 0;
for (const k of kayitlar) {
  if (k.correct < 0 || k.correct >= k.options.length) { console.error('✗ indeks aralık dışı:', k.slug, k.question.slice(0, 40)); hata++; }
  if (k.options.some(o => !o.trim())) { console.error('✗ boş şık:', k.slug, k.question.slice(0, 40)); hata++; }
}
if (hata) { console.error(`\n${hata} hata — SQL üretilmedi.`); process.exit(1); }

/* ── SQL ── */
const q = (s) => "'" + String(s).replace(/'/g, "''") + "'";
const satirlar = kayitlar.map(k =>
  `    (${q(k.question)}, ${q(JSON.stringify(k.options))}, ${k.correct}, ${k.explanation ? q(k.explanation) : 'null'}, ${q(k.slug)})`
);

const sql = `-- ============================================================
-- MAKALE QUIZ SORULARI — gövdeden tabloya
-- ============================================================
-- Üreten: scripts/quiz-sorulari-sql-uret.mjs (elle düzenleme, yeniden üret)
-- ${kayitlar.length} soru · ${rapor.length} makale
--
-- Neden: makale içindeki "mini quiz" kaynak dosyada duruyordu; hiçbir yere
-- yazmıyor, XP vermiyordu. XP kazandıran quiz ise quiz_questions'tan okuyor
-- ama tabloda yalnız 33 soru vardı ve 14 makalenin hiç sorusu yoktu. Mini
-- quiz kaldırılıp her yerde XP'li altyapıya geçiliyor; bu dosya soruları
-- taşıyor ki içerik kaybolmasın.
--
-- GÜVENLİ: her satır \`where not exists\` ile korunuyor — tekrar tekrar
-- çalıştırabilirsin, aynı soru iki kez eklenmez. Mevcut satırlara DOKUNMAZ
-- (article_quiz_answers onlara on delete cascade ile bağlı; silmek
-- kullanıcıların XP kaydını da silerdi).
--
-- ⚠ YAN ETKİ: Günün Sorusu havuzu da quiz_questions'tan besleniyor
-- (active=true olan hepsi). Bu dosya havuzu ~33'ten ~${33 + kayitlar.length}'e çıkarır —
-- havuzun ince olması zaten bilinen bir sorundu, çeşitlilik artar. Günün
-- sorusu \`dayNumber % toplam\` ile seçildiği için sıra da değişir.
-- ============================================================

insert into public.quiz_questions (question, options, correct_index, explanation, article_slug)
select v.question, v.options::jsonb, v.correct_index, v.explanation, v.article_slug
from (values
${satirlar.join(',\n')}
) as v(question, options, correct_index, explanation, article_slug)
where not exists (
  select 1 from public.quiz_questions q
  where q.article_slug = v.article_slug and q.question = v.question
);

-- Kontrol: makale başına soru sayısı
-- select article_slug, count(*) from public.quiz_questions
-- where article_slug is not null group by 1 order by 2 desc;
`;

fs.writeFileSync(CIKTI, sql);
console.log('makale'.padEnd(22), 'soru');
for (const r of rapor.sort((a, b) => a.slug.localeCompare(b.slug))) console.log(r.slug.padEnd(22), r.n);
console.log(`\n${CIKTI} yazıldı — ${kayitlar.length} soru, ${rapor.length} makale`);
console.log(`açıklaması olan: ${kayitlar.filter(k => k.explanation).length}`);
