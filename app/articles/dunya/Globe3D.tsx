'use client';

import { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';

// Renkli + interaktif 3B Dünya küresi (cobe v2). Kendi rAF döngümüzde
// globe.update({...}) ile döndürür/odaklarız. Özellikler:
//  - gökkuşağı şehir işaretçileri (per-marker renk) + canlı palet
//  - sürükle-döndür (fare/dokunuş), oto-dönüş aç/kapa, hız ve yakınlaştırma
//  - şehir çiplerine tıkla → küre o şehre yumuşakça döner ve işaretçi büyür

type Rgb = [number, number, number];
type LL = [number, number];
const CITIES: { name: string; loc: LL; color: Rgb }[] = [
  { name: 'İstanbul', loc: [41.01, 28.98], color: [0.3, 0.9, 1] },
  { name: 'Tokyo', loc: [35.68, 139.69], color: [1, 0.35, 0.5] },
  { name: 'New York', loc: [40.71, -74.01], color: [0.45, 1, 0.55] },
  { name: 'Londra', loc: [51.5, -0.12], color: [1, 0.8, 0.3] },
  { name: 'Sydney', loc: [-33.87, 151.21], color: [0.72, 0.5, 1] },
  { name: 'Kahire', loc: [30.04, 31.24], color: [1, 0.55, 0.25] },
  { name: 'Rio', loc: [-22.9, -43.2], color: [0.3, 1, 0.85] },
  { name: 'Nairobi', loc: [-1.29, 36.82], color: [1, 0.45, 0.85] },
  { name: 'Delhi', loc: [28.61, 77.21], color: [0.95, 0.95, 0.4] },
  { name: 'Los Angeles', loc: [34.05, -118.24], color: [0.5, 0.8, 1] },
];

// lat/lng → cobe [phi, theta] (resmi cobe odak örneğindeki dönüşüm)
function locationToAngles(lat: number, lng: number): [number, number] {
  return [Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180];
}

export default function Globe3D() {
  const [spin, setSpin] = useState(true);
  const [speed, setSpeed] = useState(4); // ×0.001 rad/kare
  const [zoom, setZoom] = useState(1);
  const [focus, setFocus] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spinRef = useRef(spin); spinRef.current = spin;
  const speedRef = useRef(speed); speedRef.current = speed;
  const zoomRef = useRef(zoom); zoomRef.current = zoom;
  const focusRef = useRef<number | null>(focus); focusRef.current = focus;
  const targetRef = useRef<[number, number] | null>(null);

  const phiRef = useRef(0);
  const thetaRef = useRef(0.28);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, phi: 0, theta: 0 });

  // Odak değişince hedef açıyı belirle; phiRef'i kısa yoldan dönecek şekilde normalize et.
  useEffect(() => {
    if (focus === null) { targetRef.current = null; return; }
    const [tp, tt] = locationToAngles(CITIES[focus].loc[0], CITIES[focus].loc[1]);
    const TAU = Math.PI * 2;
    let p = phiRef.current % TAU;
    let d = tp - p;
    while (d > Math.PI) d -= TAU;
    while (d < -Math.PI) d += TAU;
    phiRef.current = p;
    targetRef.current = [p + d, tt];
  }, [focus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let width = canvas.offsetWidth || 400;
    const measure = () => { width = canvas.offsetWidth || width; };
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(canvas);
    window.addEventListener('resize', measure);
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    const makeMarkers = () => CITIES.map((c, i) => ({ location: c.loc, size: i === focusRef.current ? 0.12 : 0.05, color: c.color }));

    let raf = 0;
    let globe: { update: (s: Record<string, unknown>) => void; destroy: () => void } | null = null;
    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.28,
        dark: 1,
        diffuse: 1.25,
        mapSamples: 16000,
        mapBrightness: 5.4,
        baseColor: [0.22, 0.74, 0.86],
        markerColor: [0.4, 0.9, 1],
        glowColor: [0.2, 0.5, 1],
        markers: makeMarkers(),
      });
      const tick = () => {
        if (focusRef.current !== null && targetRef.current) {
          phiRef.current += (targetRef.current[0] - phiRef.current) * 0.08;
          thetaRef.current += (targetRef.current[1] - thetaRef.current) * 0.08;
        } else if (!dragging.current && spinRef.current && !reduce) {
          phiRef.current += speedRef.current / 1000;
        }
        globe!.update({ phi: phiRef.current, theta: thetaRef.current, scale: zoomRef.current, width: width * 2, height: width * 2, markers: makeMarkers() });
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      requestAnimationFrame(() => { canvas.style.opacity = '1'; });
    } catch {
      canvas.style.display = 'none';
    }
    return () => { cancelAnimationFrame(raf); globe?.destroy(); ro?.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    dragging.current = true;
    setFocus(null);
    dragStart.current = { x: e.clientX, y: e.clientY, phi: phiRef.current, theta: thetaRef.current };
    e.currentTarget.style.cursor = 'grabbing';
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragging.current) return;
    phiRef.current = dragStart.current.phi + (e.clientX - dragStart.current.x) * 0.008;
    thetaRef.current = Math.max(-1.2, Math.min(1.2, dragStart.current.theta + (e.clientY - dragStart.current.y) * 0.005));
  }
  function onUp(e: React.PointerEvent<HTMLCanvasElement>) { dragging.current = false; e.currentTarget.style.cursor = 'grab'; }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
      <figure className="m-0">
        <div className="relative mx-auto aspect-square w-full max-w-[460px]">
          <canvas
            ref={canvasRef}
            className="h-full w-full opacity-0 transition-opacity duration-700"
            style={{ contain: 'layout paint size', cursor: 'grab', touchAction: 'none' }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
          />
        </div>
      </figure>

      {/* Kontroller */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setSpin(v => { const nv = !v; if (nv) setFocus(null); return nv; })}
          className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${spin && focus === null ? 'bg-sky-400 text-sky-950' : 'border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'}`}
        >
          {spin && focus === null ? '⏸ Döndürmeyi durdur' : '▶ Serbest döndür'}
        </button>
        <label className="flex items-center gap-2 text-xs text-slate-400">Hız
          <input type="range" min={0} max={12} value={speed} onChange={e => setSpeed(+e.target.value)} className="w-20 accent-sky-400" aria-label="Dönüş hızı" />
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-400">Yakınlık
          <input type="range" min={70} max={170} value={Math.round(zoom * 100)} onChange={e => setZoom(+e.target.value / 100)} className="w-24 accent-cyan-400" aria-label="Yakınlaştırma" />
        </label>
      </div>

      {/* Şehir çipleri — tıkla, küre o şehre uçsun */}
      <div className="mt-3 flex flex-wrap gap-2">
        {CITIES.map((c, i) => (
          <button
            key={c.name}
            onClick={() => setFocus(f => (f === i ? null : i))}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${focus === i ? 'border-white/40 bg-white/15 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: `rgb(${c.color[0] * 255},${c.color[1] * 255},${c.color[2] * 255})` }} />
            {c.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">Sürükleyip döndür · şehre tıkla, küre oraya uçsun · hızı ve yakınlığı ayarla. 🌍</p>
    </div>
  );
}
