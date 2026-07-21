'use client';

// PAYLAŞIM STÜDYOSU — makale seç, Instagram carousel'i (1080×1350) veya reel
// kapağı (1080×1920) üret, indir. Görselleştirme→trafik planının 3+4. hamlesi.
//
// TÜM ÇİZİM İSTEMCİDE CANVAS ile (bkz. lib/carousel.ts başlığı): tarayıcı .webp'yi
// kendisi çözer (Satori çözemezdi) ve sunucu isteği/cache tuzağı yoktur. Türkçe
// karakterler sistem fontundan sorunsuz gelir (ProofCard ile aynı; font yüklemeye
// gerek yok).

import { useEffect, useMemo, useRef, useState } from 'react';
import { ARTICLES } from '@/lib/articles';
import { ARTICLE_PHOTOS } from '@/lib/articlePhotos';
import { slidesFor, carouselTheme, coverText, type Slide, type CarouselTheme } from '@/lib/carousel';
import { CARD_FONT as FONT, fitFont, wrap, loadImage, drawCoverFit, bgGradient, brandStrip, drawCoverComposition } from '@/lib/canvasKit';

const SITE = 'basementonfire.com';

// ── slayt çizimi (canvas yardımcıları lib/canvasKit.ts'te — storyCard ile paylaşımlı) ──
async function drawSlide(slide: Slide, slug: string, theme: CarouselTheme, W: number, H: number): Promise<HTMLCanvasElement> {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d')!;
  const PAD = 84; const innerW = W - PAD * 2;

  if (slide.kind === 'cover') {
    // Kapak kompozisyonu = makaleyi hikayeye paylaş kartıyla AYNI (canvasKit).
    await drawCoverComposition(x, coverText(slug), ARTICLE_PHOTOS[slug]?.[0], theme, W, H, `${SITE} · kaydır →`);
    return c;
  }

  if (slide.kind === 'photo') {
    const img = await loadImage(slide.src);
    if (img) drawCoverFit(x, img, W, H); else bgGradient(x, W, H, theme.bg);
    if (slide.caption) {
      const scrim = x.createLinearGradient(0, H, 0, H - 360);
      scrim.addColorStop(0, 'rgba(0,0,0,0.9)'); scrim.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = scrim; x.fillRect(0, H - 360, W, 360);
      x.textAlign = 'left'; x.fillStyle = '#ffffff'; x.font = `36px ${FONT}`;
      let cy = H - 150;
      for (const line of wrap(x, slide.caption, innerW).slice(0, 3)) { x.fillText(line, PAD, cy); cy += 48; }
    }
    // Köşe marka izi
    x.textAlign = 'right'; x.fillStyle = 'rgba(255,255,255,0.75)'; x.font = `bold 26px ${FONT}`;
    x.fillText(SITE, W - PAD, H - 60);
    return c;
  }

  if (slide.kind === 'fact') {
    bgGradient(x, W, H, theme.bg);
    x.strokeStyle = theme.accent + '55'; x.lineWidth = 5; x.strokeRect(40, 40, W - 80, H - 80);
    brandStrip(x, 84, theme.accent);
    x.textAlign = 'left';
    // ölç → dikey ortala
    type Row = { text: string; font: string; fill: string; lh: number; gap: number };
    const rows: Row[] = [];
    if (slide.kicker) { rows.push({ text: slide.kicker.split('').join(' '), font: `bold 30px ${FONT}`, fill: theme.accent, lh: 40, gap: 0 }); }
    const hSize = fitFont(x, slide.headline, 'bold', 74, 44, innerW);
    x.font = `bold ${hSize}px ${FONT}`;
    for (const line of wrap(x, slide.headline, innerW)) rows.push({ text: line, font: `bold ${hSize}px ${FONT}`, fill: '#ffffff', lh: hSize + 12, gap: rows.length && rows[rows.length - 1].fill === theme.accent ? 30 : 0 });
    if (slide.body) { x.font = `40px ${FONT}`; let first = true; for (const line of wrap(x, slide.body, innerW)) { rows.push({ text: line, font: `40px ${FONT}`, fill: 'rgba(255,255,255,0.85)', lh: 56, gap: first ? 40 : 0 }); first = false; } }
    const blockH = rows.reduce((t, r) => t + r.gap + r.lh, 0);
    let y = Math.max(200, H * 0.42 - blockH / 2);
    for (const r of rows) { y += r.gap + r.lh; x.font = r.font; x.fillStyle = r.fill; x.fillText(r.text, PAD, y); }
    x.fillStyle = 'rgba(255,255,255,0.55)'; x.font = `26px ${FONT}`;
    x.fillText(`${SITE} · kaydır →`, PAD, H - 70);
    return c;
  }

  // cta
  bgGradient(x, W, H, theme.bg);
  x.strokeStyle = theme.accent + '55'; x.lineWidth = 5; x.strokeRect(40, 40, W - 80, H - 80);
  brandStrip(x, 84, theme.accent);
  x.textAlign = 'left'; x.textBaseline = 'top';
  const { question } = coverText(slug);
  const big = 'Cevabı sitede oyna, ölç, kanıtla.';
  const bigSize = fitFont(x, big.split(' ').sort((a, b) => b.length - a.length)[0], 'bold', 66, 44, innerW);
  x.font = `bold ${bigSize}px ${FONT}`;
  const bigLines = wrap(x, big, innerW);
  x.font = `36px ${FONT}`;
  const qLines = question ? wrap(x, question, innerW) : [];
  const BIG_H = bigSize + 12, Q_GAP = 40, Q_H = 48;
  const blockH = bigLines.length * BIG_H + (qLines.length ? Q_GAP + qLines.length * Q_H : 0);
  let y = H * 0.40 - blockH / 2;
  x.fillStyle = '#ffffff'; x.font = `bold ${bigSize}px ${FONT}`;
  for (const line of bigLines) { x.fillText(line, PAD, y); y += BIG_H; }
  if (qLines.length) {
    y += Q_GAP; x.fillStyle = theme.accent; x.font = `36px ${FONT}`;
    for (const line of qLines) { x.fillText(line, PAD, y); y += Q_H; }
  }
  x.fillStyle = 'rgba(255,255,255,0.85)'; x.font = `bold 34px ${FONT}`;
  x.fillText(`${SITE}/articles/${slug}`, PAD, H - 104);
  x.textBaseline = 'alphabetic';
  return c;
}

function canvasToBlob(c: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((res) => c.toBlob(res, 'image/png'));
}

type Format = 'carousel' | 'reel';
const SIZES: Record<Format, { w: number; h: number; label: string }> = {
  carousel: { w: 1080, h: 1350, label: 'Carousel · 1080×1350 (4:5)' },
  reel: { w: 1080, h: 1920, label: 'Reel kapağı · 1080×1920 (9:16)' },
};

export default function CarouselStudio() {
  const [slug, setSlug] = useState(ARTICLES[0].slug);
  const [format, setFormat] = useState<Format>('carousel');
  const [previews, setPreviews] = useState<{ url: string; blob: Blob }[]>([]);
  const [busy, setBusy] = useState(false);
  const genId = useRef(0);

  const theme = useMemo(() => carouselTheme(slug), [slug]);
  const { w, h } = SIZES[format];

  // Reel: yalnız kapak (hook). Carousel: tam slayt dizisi.
  const slides = useMemo<Slide[]>(
    () => (format === 'reel' ? [{ kind: 'cover' }] : slidesFor(slug, ARTICLE_PHOTOS[slug] ?? [])),
    [slug, format],
  );

  useEffect(() => {
    const id = ++genId.current;
    setBusy(true);
    // önceki önizleme URL'lerini serbest bırak
    setPreviews((prev) => { prev.forEach((p) => URL.revokeObjectURL(p.url)); return []; });
    (async () => {
      const made: { url: string; blob: Blob }[] = [];
      for (const slide of slides) {
        const canvas = await drawSlide(slide, slug, theme, w, h);
        const blob = await canvasToBlob(canvas);
        if (id !== genId.current) return; // seçim değişti, bu turu bırak
        if (blob) made.push({ url: URL.createObjectURL(blob), blob });
      }
      if (id === genId.current) { setPreviews(made); setBusy(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, format, slides, w, h]);

  function download(blob: Blob, i: number) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${slug}-${format}-${i + 1}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  async function downloadAll() {
    // Tarayıcı ardışık indirmelere izin verir; aralara küçük gecikme koy.
    for (let i = 0; i < previews.length; i++) { download(previews[i].blob, i); await new Promise((r) => setTimeout(r, 350)); }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Paylaşım Stüdyosu</h1>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Makale seç, Instagram carousel'ini ya da reel kapağını indir. Her şey makalenin kendi verisinden üretilir.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <select value={slug} onChange={(e) => setSlug(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}>
          {ARTICLES.map((a) => <option key={a.slug} value={a.slug}>{a.title}</option>)}
        </select>
        <div className="inline-flex rounded-xl border p-1" style={{ borderColor: 'var(--color-border)' }}>
          {(Object.keys(SIZES) as Format[]).map((f) => (
            <button key={f} onClick={() => setFormat(f)}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold"
              style={f === format ? { background: 'var(--color-primary)', color: '#fff' } : { color: 'var(--color-text-muted)' }}>
              {f === 'carousel' ? 'Carousel' : 'Reel kapağı'}
            </button>
          ))}
        </div>
        <button onClick={downloadAll} disabled={busy || !previews.length}
          className="rounded-xl px-4 py-2 text-sm font-bold text-black disabled:opacity-40" style={{ background: theme.accent }}>
          {busy ? 'Hazırlanıyor…' : `Hepsini indir (${previews.length})`}
        </button>
      </div>

      <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>{SIZES[format].label}</p>

      {format === 'reel' && (
        <p className="mt-3 rounded-lg border px-3 py-2 text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
          Reel kapağı, videonun ilk karesi ya da kapanışı için. Asıl 15 sn'lik videoyu makaledeki simülasyonun ekran
          kaydından sen çekersin — bu kapağı başına/sonuna koyarsın.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {previews.map((p, i) => (
          <figure key={p.url} className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
            <img src={p.url} alt={`${slug} slayt ${i + 1}`} className="block w-full" />
            <button onClick={() => download(p.blob, i)} className="w-full py-2 text-xs font-semibold" style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>
              {i + 1}. slaytı indir
            </button>
          </figure>
        ))}
        {busy && !previews.length && <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Çiziliyor…</p>}
      </div>
    </div>
  );
}
