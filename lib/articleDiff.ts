/**
 * Kullanici makalesi FARK (diff) hesabi — admin onay kuyrugu icin.
 *
 * Admin, yayindaki bir makaleye sonradan sokulan bir cumleyi ya da bir bagi
 * fark edebilmeli. Iki surumu yan yana okutmak bunu saglamaz: 4000 kelimelik
 * bir metinde degisen tek cumleyi goz bulamaz. O yuzden burada satir duzeyinde
 * LCS + degisen paragraflarda kelime duzeyinde ikinci bir gecis yapiliyor.
 *
 * Bagimlilik YOK: doc jsonb'si zaten kucuk (LIMITS.docBytes) ve karsilastirma
 * sunucuda, yalnizca admin kuyrugu cizilirken bir kez calisiyor.
 */

import type { ArticleBlock, ArticleSource } from './userArticles';

/** Duzenlemenin sakladigi surum — pending_edit jsonb'siyle birebir ayni sekil. */
export type PendingEdit = {
  title: string;
  summary: string;
  cover_url: string | null;
  category: string | null;
  doc: ArticleBlock[];
  sources: ArticleSource[];
};

/* ── metne indirgeme ───────────────────────────────────────── */

/**
 * HTML'i karsilastirilabilir duz metne cevirir.
 *
 * ⚠ Etiketler tamamen atilmaz: <a href> KORUNUR. Duzenleme onayinin as?l riski
 * gorunen metin ayni kalirken bagin baska bir adrese cevrilmesidir — etiketi
 * atsak bu fark diff'te HIC gorunmezdi. Bag, metnin yaninda "→ adres" olarak
 * yazilir ki degisince satir degismis sayilsin.
 */
export function htmlToText(html: string): string {
  return String(html ?? '')
    // baglari once yakala: gorunen metin + hedef adres
    .replace(/<a\b[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
      (_m, href, inner) => `${String(inner).replace(/<[^>]+>/g, '')} → ${href}`)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#3?9;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** doc jsonb -> karsilastirilabilir satir dizisi (bos satirlar atilir). */
export function docToLines(doc: unknown): string[] {
  if (!Array.isArray(doc)) return [];
  const out: string[] = [];
  for (const b of doc as ArticleBlock[]) {
    if (!b || typeof b !== 'object') continue;
    if (b.type === 'text') {
      const t = htmlToText(b.html);
      if (t) out.push(t);
    } else if (b.type === 'image') {
      // Gorselin KENDISI de degisebilir -> adres satirin parcasi olmali.
      const alt = [b.alt, b.caption].filter(Boolean).join(' · ');
      out.push(`🖼 ${alt || 'görsel'} → ${b.url}`);
    } else if (b.type === 'embed') {
      const e = b as any;
      out.push(`▶ gömme (${e.provider ?? 'medya'}) → ${e.url ?? e.src ?? ''}`);
    }
  }
  return out;
}

/** Kaynakcayi tek satirlik karsilastirilabilir bicime indirger. */
export function sourcesToLines(sources: unknown): string[] {
  if (!Array.isArray(sources)) return [];
  return (sources as ArticleSource[])
    .filter((s) => s && typeof s === 'object')
    .map((s) => [s.title, s.authors, s.year, s.source, s.url].filter(Boolean).join(' · '))
    .filter(Boolean);
}

/* ── LCS ──────────────────────────────────────────────────── */

type Op = { k: 'same' | 'add' | 'del'; v: string };

/**
 * Iki dizinin en uzun ortak alt dizisinden ekleme/silme listesi uretir.
 * O(n·m) — satir sayisi makale basina birkac yuzu gecmedigi icin fazlasiyla hizli.
 */
function lcsOps(a: string[], b: string[]): Op[] {
  const n = a.length, m = b.length;
  // (n+1)×(m+1) tablo; Int32Array ile tek blok
  const dp = new Int32Array((n + 1) * (m + 1));
  const at = (i: number, j: number) => i * (m + 1) + j;
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[at(i, j)] = a[i] === b[j]
        ? dp[at(i + 1, j + 1)] + 1
        : Math.max(dp[at(i + 1, j)], dp[at(i, j + 1)]);
    }
  }
  const ops: Op[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push({ k: 'same', v: a[i] }); i++; j++; }
    else if (dp[at(i + 1, j)] >= dp[at(i, j + 1)]) { ops.push({ k: 'del', v: a[i] }); i++; }
    else { ops.push({ k: 'add', v: b[j] }); j++; }
  }
  while (i < n) { ops.push({ k: 'del', v: a[i] }); i++; }
  while (j < m) { ops.push({ k: 'add', v: b[j] }); j++; }
  return ops;
}

/* ── kelime duzeyi ────────────────────────────────────────── */

export type WordPart = { s: 'same' | 'add' | 'del'; text: string };

/** Iki satir arasinda kelime duzeyinde fark. */
function wordDiff(oldLine: string, newLine: string): WordPart[] {
  const A = oldLine.split(' '), B = newLine.split(' ');
  const parts: WordPart[] = [];
  for (const op of lcsOps(A, B)) {
    const s = op.k === 'same' ? 'same' : op.k === 'add' ? 'add' : 'del';
    const last = parts[parts.length - 1];
    // Ardisik ayni turdeki kelimeleri tek parcada birlestir -> daha az DOM,
    // daha okunakli cikti.
    if (last && last.s === s) last.text += ' ' + op.v;
    else parts.push({ s, text: op.v });
  }
  return parts;
}

/** Iki satirin kelime ortakligi (0..1) — 'degistirildi' mi 'bastan yazildi' mi. */
function benzerlik(a: string, b: string): number {
  const A = new Set(a.toLowerCase().split(' ').filter(Boolean));
  const B = new Set(b.toLowerCase().split(' ').filter(Boolean));
  if (!A.size || !B.size) return 0;
  let ortak = 0;
  for (const w of A) if (B.has(w)) ortak++;
  return ortak / Math.max(A.size, B.size);
}

/* ── genel fark ───────────────────────────────────────────── */

export type DiffRow =
  | { t: 'same'; text: string }
  | { t: 'add'; text: string }
  | { t: 'del'; text: string }
  | { t: 'mod'; parts: WordPart[] };

/**
 * Satir dizilerinin farki. Yan yana dusen sil+ekle ciftleri, yeterince
 * benzerse (>=%40 ortak kelime) TEK bir 'mod' satirinda kelime duzeyinde
 * gosterilir — "bu paragraf bastan yazildi" ile "bu paragrafta bir cumle
 * degisti" ayni sekilde gorunmesin diye.
 */
export function diffLines(oncekiler: string[], sonrakiler: string[]): DiffRow[] {
  const ops = lcsOps(oncekiler, sonrakiler);
  const rows: DiffRow[] = [];
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    if (op.k === 'same') { rows.push({ t: 'same', text: op.v }); continue; }
    if (op.k === 'del') {
      // Hemen ardindan gelen ilk 'add' ile eslesebilir mi?
      const nx = ops[i + 1];
      if (nx && nx.k === 'add' && benzerlik(op.v, nx.v) >= 0.4) {
        rows.push({ t: 'mod', parts: wordDiff(op.v, nx.v) });
        i++; // eslesen 'add'i tukettik
        continue;
      }
      rows.push({ t: 'del', text: op.v });
      continue;
    }
    rows.push({ t: 'add', text: op.v });
  }
  return rows;
}

/** Fark satirlarinda gercek degisiklik var mi. */
export const farkVar = (rows: DiffRow[]) => rows.some((r) => r.t !== 'same');

/** Degisen satir sayisi (rozet icin). */
export const farkSayisi = (rows: DiffRow[]) => rows.filter((r) => r.t !== 'same').length;

/* ── skaler alanlar ───────────────────────────────────────── */

export type FieldChange = { label: string; onceki: string; sonraki: string };

/** Baslik/ozet/kategori/kapak gibi tek degerli alanlarin degisimi. */
export function diffFields(
  onceki: { title: string; summary: string; category: string | null; cover_url: string | null },
  sonraki: PendingEdit,
): FieldChange[] {
  const alanlar: [string, string | null, string | null][] = [
    ['Başlık', onceki.title, sonraki.title],
    ['Özet', onceki.summary, sonraki.summary],
    ['Kategori', onceki.category, sonraki.category],
    ['Kapak', onceki.cover_url, sonraki.cover_url],
  ];
  return alanlar
    .filter(([, a, b]) => (a ?? '') !== (b ?? ''))
    .map(([label, a, b]) => ({ label, onceki: a ?? '—', sonraki: b ?? '—' }));
}

/** Admin kuyrugunun tek seferde ihtiyaci olan her sey. */
export function makaleFarki(
  canli: { title: string; summary: string; category: string | null; cover_url: string | null; doc: unknown; sources: unknown },
  duzenleme: PendingEdit,
) {
  const govde = diffLines(docToLines(canli.doc), docToLines(duzenleme.doc));
  const kaynak = diffLines(sourcesToLines(canli.sources), sourcesToLines(duzenleme.sources));
  return {
    alanlar: diffFields(canli, duzenleme),
    govde,
    kaynak,
    degisenSatir: farkSayisi(govde) + farkSayisi(kaynak),
  };
}
