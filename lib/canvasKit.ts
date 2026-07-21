// Paylaşılan istemci-canvas yardımcıları — CarouselStudio (carousel/reel kartları)
// ve storyCard (makaleyi hikayeye paylaş) AYNI çizimi kullansın, ayrışmasın.
// Hepsi tarayıcıda çalışır (document/Image); sunucuda import ETME.

export const CARD_FONT = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';

/** Metni verilen genişliğe sığana kadar küçültür; taban puntonun altına inmez. */
export function fitFont(x: CanvasRenderingContext2D, text: string, weight: string, start: number, min: number, maxW: number): number {
  let size = start;
  for (;;) { x.font = `${weight} ${size}px ${CARD_FONT}`; if (x.measureText(text).width <= maxW || size <= min) return size; size -= 4; }
}

/** Uzun satırı kelime kelime sarar. */
export function wrap(x: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' '); const out: string[] = []; let line = '';
  for (const w of words) { const next = line ? `${line} ${w}` : w; if (x.measureText(next).width > maxW && line) { out.push(line); line = w; } else line = next; }
  if (line) out.push(line); return out;
}

export function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
}

/** Görseli kutuyu KAPLAYACAK şekilde (kırparak) çizer — object-fit: cover. */
export function drawCoverFit(x: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number) {
  const scale = Math.max(W / img.width, H / img.height);
  const w = img.width * scale, h = img.height * scale;
  x.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
}

export function bgGradient(x: CanvasRenderingContext2D, W: number, H: number, bg: [string, string]) {
  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]);
  x.fillStyle = g; x.fillRect(0, 0, W, H);
}

export function brandStrip(x: CanvasRenderingContext2D, y: number, accent: string) {
  x.textAlign = 'left';
  x.fillStyle = accent; x.fillRect(72, y, 12, 46);
  x.fillStyle = accent; x.font = `bold 30px ${CARD_FONT}`;
  x.fillText('BASEMENTS', 100, y + 34);
}

/**
 * Fotoğraf zeminli KAPAK kompozisyonu (carousel kapağı, reel kapağı VE hikaye
 * kartı bunu paylaşır → tek görsel kimlik). Fotoğraf varsa tam kanvas + alttan
 * koyulaşan perde; yoksa tema gradyanı. Üstte marka şeridi + kategori etiketi,
 * altta başlık + soru + alt bilgi. textBaseline='top' ile ölç-istifle (sabit y
 * ile etiket başlıkla biniyordu).
 */
export function drawCoverComposition(
  x: CanvasRenderingContext2D,
  { kicker, title, question }: { kicker: string; title: string; question: string },
  photo: string | undefined,
  theme: { bg: [string, string]; accent: string },
  W: number, H: number,
  footer: string,
): Promise<void> {
  const PAD = 84, innerW = W - PAD * 2;
  return (async () => {
    const img = photo ? await loadImage(photo) : null;
    if (img) {
      drawCoverFit(x, img, W, H);
      const scrim = x.createLinearGradient(0, H, 0, 0);
      scrim.addColorStop(0, 'rgba(0,0,0,0.92)'); scrim.addColorStop(0.5, 'rgba(0,0,0,0.55)'); scrim.addColorStop(1, 'rgba(0,0,0,0.18)');
      x.fillStyle = scrim; x.fillRect(0, 0, W, H);
    } else {
      bgGradient(x, W, H, theme.bg);
    }
    brandStrip(x, 84, theme.accent);

    x.textAlign = 'left'; x.textBaseline = 'top';
    const titleSize = fitFont(x, title, 'bold', 100, 62, innerW);
    x.font = `bold ${titleSize}px ${CARD_FONT}`;
    const titleLines = wrap(x, title, innerW);
    x.font = `40px ${CARD_FONT}`;
    const qLines = question ? wrap(x, question, innerW) : [];

    const KICK_H = 34, KICK_GAP = 22, TITLE_H = titleSize + 8, Q_GAP = 30, Q_H = 52;
    const blockH = KICK_H + KICK_GAP + titleLines.length * TITLE_H + (qLines.length ? Q_GAP + qLines.length * Q_H : 0);
    let y = (H - 120) - blockH;

    x.fillStyle = theme.accent; x.font = `bold 30px ${CARD_FONT}`;
    x.fillText(kicker.split('').join(' '), PAD, y); y += KICK_H + KICK_GAP;
    x.fillStyle = '#ffffff'; x.font = `bold ${titleSize}px ${CARD_FONT}`;
    for (const line of titleLines) { x.fillText(line, PAD, y); y += TITLE_H; }
    if (qLines.length) {
      y += Q_GAP; x.fillStyle = 'rgba(255,255,255,0.9)'; x.font = `40px ${CARD_FONT}`;
      for (const line of qLines) { x.fillText(line, PAD, y); y += Q_H; }
    }
    x.fillStyle = 'rgba(255,255,255,0.6)'; x.font = `26px ${CARD_FONT}`;
    x.fillText(footer, PAD, H - 84);
    x.textBaseline = 'alphabetic';
  })();
}
