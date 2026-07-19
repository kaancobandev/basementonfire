'use client';

// KANIT KARTI — okurun KENDİ sonucunu paylaşmasını sağlayan 1080×1080 PNG.
//
// Neden var: insan "şu makaleyi oku" linki paylaşmaz, kendi sonucunu paylaşır.
// Sitede okura kişisel bir SAYI veren 60'tan fazla yüzey var ama paylaşılabilir
// hâle getirilmiş olan tek bir tanesiydi (radyoaktivite · BodyActivity). Bu
// bileşen o kanıtlanmış deseni genelleştirir; yeni bir yüzeye bağlamak artık
// bir <ProofShare spec={...} /> satırı.
//
// Kart İSTEMCİDE canvas ile çizilir (sunucuya istek yok, sorguya bağlı rotaya
// s-maxage eklenmez → Netlify cache tuzağına girmez).

import { useState } from 'react';

export type ProofSpec = {
  /** Üstteki küçük tanıtım satırı, genelde emoji + harf aralıklı büyük harf. */
  kicker: string;
  /** Kartın merkezindeki büyük değer — sayı ya da kısa bir kelime. */
  value: string;
  /** Değerin altındaki 1–2 satırlık açıklama. */
  lines: string[];
  /** Küçük ve soluk ayrıntı satırı (parametreler, kırılım). */
  detail?: string;
  /** Kapanış cümlesi — vurgu renginde, kalın. */
  punch?: string;
  /** Makalenin vurgu rengi. */
  accent: string;
  /** Arka plan gradyanının üç durağı (koyudan koyuya). */
  bg: [string, string, string];
  /** navigator.share başlığı + panoya kopyalanan metin (site adresi eklenir). */
  shareText: string;
  /** İndirme dosya adı (uzantısız). */
  fileName: string;
};

const SITE = 'basementonfire.com';
const FONT = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';

/** Metni verilen genişliğe sığana kadar küçültür; taban puntonun altına inmez. */
function fitFont(x: CanvasRenderingContext2D, text: string, weight: string, start: number, min: number, maxW: number): number {
  let size = start;
  for (;;) {
    x.font = `${weight} ${size}px ${FONT}`;
    if (x.measureText(text).width <= maxW || size <= min) return size;
    size -= 4;
  }
}

/** Uzun satırı kelime kelime sarar (kart taşmasın diye). */
function wrap(x: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ');
  const out: string[] = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (x.measureText(next).width > maxW && line) { out.push(line); line = w; }
    else line = next;
  }
  if (line) out.push(line);
  return out;
}

export async function drawProofCard(spec: ProofSpec): Promise<Blob | null> {
  const S = 1080;
  const PAD = 90;
  const innerW = S - PAD * 2;

  const c = document.createElement('canvas');
  c.width = S; c.height = S;
  const x = c.getContext('2d');
  if (!x) return null;

  // zemin
  const g = x.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, spec.bg[0]); g.addColorStop(0.55, spec.bg[1]); g.addColorStop(1, spec.bg[2]);
  x.fillStyle = g; x.fillRect(0, 0, S, S);

  const glow = x.createRadialGradient(S * 0.5, S * 0.42, 40, S * 0.5, S * 0.42, S * 0.55);
  glow.addColorStop(0, `${spec.accent}38`); glow.addColorStop(1, `${spec.accent}00`);
  x.fillStyle = glow; x.fillRect(0, 0, S, S);

  x.strokeStyle = `${spec.accent}59`; x.lineWidth = 6;
  x.strokeRect(40, 40, S - 80, S - 80);

  x.textAlign = 'center';

  // Blok İKİ AŞAMADA çizilir: önce satırlar ölçülür, sonra tamamı dikey
  // ortalanır. Sabit y değerleriyle çizince tek satırlık kartlarda (ör. fidye)
  // açıklama ile ayrıntı arasında göze batan bir boşluk kalıyordu.
  type Row = { text: string; font: string; fill: string; lead: number; gapBefore: number };
  const rows: Row[] = [];

  const kickerSize = fitFont(x, spec.kicker, 'bold', 30, 18, innerW);
  rows.push({ text: spec.kicker, font: `bold ${kickerSize}px ${FONT}`, fill: spec.accent, lead: kickerSize + 10, gapBefore: 0 });

  const valueSize = fitFont(x, spec.value, 'bold', 190, 56, innerW);
  rows.push({ text: spec.value, font: `bold ${valueSize}px ${FONT}`, fill: '#ffffff', lead: valueSize + 12, gapBefore: 96 });

  x.font = `46px ${FONT}`;
  let first = true;
  for (const line of spec.lines.slice(0, 2)) {
    for (const part of wrap(x, line, innerW)) {
      rows.push({ text: part, font: `46px ${FONT}`, fill: 'rgba(255,255,255,0.9)', lead: 62, gapBefore: first ? 28 : 0 });
      first = false;
    }
  }

  if (spec.detail) {
    x.font = `30px ${FONT}`;
    let firstDetail = true;
    for (const part of wrap(x, spec.detail, innerW)) {
      rows.push({ text: part, font: `30px ${FONT}`, fill: 'rgba(255,255,255,0.55)', lead: 42, gapBefore: firstDetail ? 46 : 0 });
      firstDetail = false;
    }
  }

  if (spec.punch) {
    const punchSize = fitFont(x, spec.punch, 'bold', 34, 22, innerW);
    rows.push({ text: spec.punch, font: `bold ${punchSize}px ${FONT}`, fill: spec.accent, lead: punchSize + 8, gapBefore: 52 });
  }

  const blockH = rows.reduce((t, r) => t + r.gapBefore + r.lead, 0);
  // 0.47 → altta site adresi için biraz daha fazla nefes bırakır.
  let y = Math.max(190, S * 0.47 - blockH / 2);
  for (const r of rows) {
    y += r.gapBefore + r.lead;
    x.font = r.font; x.fillStyle = r.fill;
    x.fillText(r.text, S / 2, y);
  }

  x.fillStyle = 'rgba(255,255,255,0.4)';
  x.font = `28px ${FONT}`;
  x.fillText(SITE, S / 2, 985);

  return new Promise<Blob | null>((res) => c.toBlob(res, 'image/png'));
}

/**
 * İki düğme: kartı paylaş (mobilde yerel paylaşım sayfası, masaüstünde indirme)
 * ve metni kopyala. Paylaşım iptal edilirse SESSİZ kalır — iptal hata değildir.
 */
export function ProofShare({ spec, label = 'Sonucunu paylaş' }: { spec: ProofSpec; label?: string }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  function flash(msg: string) { setNote(msg); setTimeout(() => setNote(''), 2000); }

  async function share() {
    if (busy) return;
    setBusy(true);
    try {
      const blob = await drawProofCard(spec);
      if (!blob) return;
      const file = new File([blob], `${spec.fileName}.png`, { type: 'image/png' });

      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: spec.shareText }); return; }
        catch { return; } // kullanıcı iptal etti — uyarı gösterme
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${spec.fileName}-basements.png`;
      a.click();
      URL.revokeObjectURL(url);
      flash('indirildi');
    } finally { setBusy(false); }
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(`${spec.shareText} — ${SITE}`);
      flash('kopyalandı');
    } catch { /* pano izni yok */ }
  }

  const base = 'min-h-[44px] rounded-xl px-4 text-sm font-bold transition disabled:opacity-40';
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button onClick={share} disabled={busy} className={`${base} text-black hover:brightness-110`} style={{ background: spec.accent }}>
        {label}
      </button>
      <button onClick={copyText} className={`${base} border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10`}>
        Metni kopyala
      </button>
      {note && <span className="text-xs text-slate-400">{note}</span>}
    </div>
  );
}
