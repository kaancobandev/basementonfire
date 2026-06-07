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
const MAX_OUT = 1440; // kırpılan çıktıyı bu boyuta indir (dosya boyutu da küçülür)

async function cropToFile(src: string, area: Area, origName: string): Promise<File> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
  const scale = Math.min(1, MAX_OUT / Math.max(area.width, area.height));
  const w = Math.max(1, Math.round(area.width * scale));
  const h = Math.max(1, Math.round(area.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  const base = origName.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob ?? new Blob()], `${base}.jpg`, { type: 'image/jpeg' });
}

/** Instagram tarzı kırpma ekranı: oran seç (1:1/4:5/1.91:1) + yakınlaştır + sürükle. */
export default function ImageCropper({ file, onCancel, onCropped }: {
  file: File;
  onCancel: () => void;
  onCropped: (f: File) => void;
}) {
  const [url] = useState(() => URL.createObjectURL(file));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(1);
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 300, display: 'flex', flexDirection: 'column' }}>
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
          {ASPECTS.map(a => {
            const on = Math.abs(aspect - a.value) < 0.001;
            return (
              <button key={a.label} type="button" onClick={() => setAspect(a.value)}
                style={{ padding: '6px 14px', borderRadius: 9999, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
                  border: on ? '2px solid #6366f1' : '1px solid #444',
                  background: on ? 'rgba(99,102,241,0.25)' : 'transparent', color: '#fff', fontFamily: 'inherit' }}>
                {a.label}
              </button>
            );
          })}
        </div>
        <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} aria-label="Yakınlaştır" style={{ width: '100%' }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={cancel} disabled={busy} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #555', background: 'transparent', color: '#fff', fontWeight: 700, cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit' }}>İptal</button>
          <button type="button" onClick={apply} disabled={busy} style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1, fontFamily: 'inherit' }}>{busy ? 'İşleniyor…' : 'Uygula'}</button>
        </div>
      </div>
    </div>
  );
}
