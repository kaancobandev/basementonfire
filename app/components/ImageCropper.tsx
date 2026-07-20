'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';

type Area = { x: number; y: number; width: number; height: number };

const ASPECTS: { label: string; value: number }[] = [
  { label: 'Kare 1:1', value: 1 },
  { label: 'Dikey 4:5', value: 4 / 5 },
  { label: 'Yatay 1.91:1', value: 1.91 },
];
const MAX_OUT = 2048; // master (uzun kenar); gösterimde CDN cihaza göre küçültür

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, w);
  canvas.height = Math.max(1, h);
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return { canvas, ctx };
}

async function encodeBest(canvas: HTMLCanvasElement): Promise<{ blob: Blob; ext: string; type: string }> {
  // WebP (daha iyi kalite/boyut + alpha) dene; desteklenmiyorsa JPEG'e düş.
  const webp = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/webp', 0.92));
  if (webp && webp.type === 'image/webp') return { blob: webp, ext: 'webp', type: 'image/webp' };
  const jpeg = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.92));
  return { blob: jpeg ?? new Blob(), ext: 'jpg', type: 'image/jpeg' };
}

async function cropToFile(src: string, area: Area, origName: string): Promise<File> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });

  // 1) Seçilen alanı tam çözünürlükte tuvale al
  const first = makeCanvas(Math.round(area.width), Math.round(area.height));
  first.ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, first.canvas.width, first.canvas.height);
  let canvas = first.canvas;

  // 2) Hedef boyuta KADEMELİ küçült (her adımda en çok yarıya) — tek hamlede
  //    büyük küçültmeye kıyasla belirgin daha net sonuç verir
  const scale = Math.min(1, MAX_OUT / Math.max(canvas.width, canvas.height));
  const targetW = Math.max(1, Math.round(canvas.width * scale));
  const targetH = Math.max(1, Math.round(canvas.height * scale));
  while (canvas.width > targetW * 2 || canvas.height > targetH * 2) {
    const step = makeCanvas(Math.max(targetW, Math.floor(canvas.width / 2)), Math.max(targetH, Math.floor(canvas.height / 2)));
    step.ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, step.canvas.width, step.canvas.height);
    canvas = step.canvas;
  }
  if (canvas.width !== targetW || canvas.height !== targetH) {
    const fin = makeCanvas(targetW, targetH);
    fin.ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, targetW, targetH);
    canvas = fin.canvas;
  }

  // 3) En iyi formatta kodla (WebP, yoksa JPEG)
  const { blob, ext, type } = await encodeBest(canvas);
  const base = origName.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob], `${base}.${ext}`, { type });
}

/** Instagram tarzı kırpma ekranı: oran seç (1:1/4:5/1.91:1) + yakınlaştır + sürükle. */
export default function ImageCropper({ file, onCancel, onCropped, aspects = ASPECTS, defaultAspect = 1, zIndex = 300 }: {
  file: File;
  onCancel: () => void;
  onCropped: (f: File) => void;
  /** Sunulacak oran seçenekleri. Hikâye tek oranlıdır (9:16) → tek elemanlı dizi geç. */
  aspects?: { label: string; value: number }[];
  defaultAspect?: number;
  /**
   * Kırpıcının katmanı. VARSAYILAN 300 HER YERDE YETMEZ: hikâye oluşturma modalı
   * ve hikâye görüntüleyici zIndex 500'de duruyor (HomeFeed), yani kırpıcı onların
   * ALTINDA kalıp görünmez oluyordu — kullanıcı "dosya seçtim, hiçbir şey olmadı"
   * derdi. Bir modalın içinden açan taraf kendi katmanının üstünü vermeli.
   */
  zIndex?: number;
}) {
  const [url] = useState(() => URL.createObjectURL(file));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(defaultAspect);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_: Area, ap: Area) => setAreaPixels(ap), []);

  async function apply() {
    if (!areaPixels) return;
    setBusy(true);
    try {
      const cropped = await cropToFile(url, areaPixels, file.name);
      URL.revokeObjectURL(url);
      onCropped(cropped);
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    URL.revokeObjectURL(url);
    onCancel();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <Cropper
          image={url}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          objectFit="contain"
        />
      </div>
      <div style={{ padding: 16, background: '#0f0f0f', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {aspects.length > 1 && aspects.map(a => {
            const on = Math.abs(aspect - a.value) < 0.001;
            return (
              <button key={a.label} type="button" onClick={() => setAspect(a.value)}
                style={{ padding: '6px 14px', borderRadius: 9999, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
                  border: on ? '2px solid var(--color-primary)' : '1px solid #444',
                  background: on ? 'rgba(99,102,241,0.25)' : 'transparent', color: '#fff', fontFamily: 'inherit' }}>
                {a.label}
              </button>
            );
          })}
        </div>
        <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} aria-label="Yakınlaştır" style={{ width: '100%' }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={cancel} disabled={busy} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #555', background: 'transparent', color: '#fff', fontWeight: 700, cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit' }}>İptal</button>
          <button type="button" onClick={apply} disabled={busy} style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 700, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1, fontFamily: 'inherit' }}>{busy ? 'İşleniyor…' : 'Uygula'}</button>
        </div>
      </div>
    </div>
  );
}
