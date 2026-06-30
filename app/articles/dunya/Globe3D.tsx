'use client';

import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

// Sürüklenip döndürülebilen, kendiliğinden dönen 3B Dünya küresi (cobe ~5KB, ogl).
// dynamic(ssr:false) ile yüklenir. prefers-reduced-motion'da otomatik dönüş durur.

export default function Globe3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerMovement = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let width = 0;
    const measure = () => { width = canvas.offsetWidth; };
    window.addEventListener('resize', measure);
    measure();
    // İlk boyut 0 gelirse (layout henüz hazır değilse) küre görünmez kalmasın diye
    // ResizeObserver ile gerçek genişliği yakala.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(canvas);

    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let phi = 0;
    let globe: { destroy: () => void } | null = null;

    try {
      // cobe tipleri onRender'ı içermiyor; literal yerine değişkenle geçince
      // fazla-özellik denetimi tetiklenmez (state'i de açıkça tipliyoruz).
      const opts = {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.28,
        dark: 1,
        diffuse: 1.25,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.26, 0.46, 0.7] as [number, number, number],
        markerColor: [0.4, 0.85, 1] as [number, number, number],
        glowColor: [0.15, 0.45, 0.85] as [number, number, number],
        markers: [
          { location: [41.01, 28.98] as [number, number], size: 0.07 }, // İstanbul
          { location: [35.68, 139.69] as [number, number], size: 0.05 }, // Tokyo
          { location: [40.71, -74.01] as [number, number], size: 0.05 }, // New York
          { location: [-33.87, 151.21] as [number, number], size: 0.05 }, // Sydney
        ],
        onRender: (state: Record<string, number>) => {
          if (pointerInteracting.current === null && !reduce) phi += 0.0035;
          state.phi = phi + pointerMovement.current / 200;
          state.width = width * 2;
          state.height = width * 2;
        },
      };
      globe = createGlobe(canvas, opts);
      requestAnimationFrame(() => { canvas.style.opacity = '1'; });
    } catch {
      canvas.style.display = 'none';
    }

    return () => { globe?.destroy(); ro?.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  return (
    <figure className="my-2">
      <div className="relative mx-auto aspect-square w-full max-w-[440px]">
        <canvas
          ref={canvasRef}
          className="h-full w-full opacity-0 transition-opacity duration-700"
          style={{ contain: 'layout paint size', cursor: 'grab' }}
          onPointerDown={(e) => {
            pointerInteracting.current = e.clientX - pointerMovement.current;
            (e.currentTarget as HTMLCanvasElement).style.cursor = 'grabbing';
          }}
          onPointerUp={(e) => { pointerInteracting.current = null; (e.currentTarget as HTMLCanvasElement).style.cursor = 'grab'; }}
          onPointerOut={(e) => { pointerInteracting.current = null; (e.currentTarget as HTMLCanvasElement).style.cursor = 'grab'; }}
          onPointerMove={(e) => {
            if (pointerInteracting.current !== null) pointerMovement.current = e.clientX - pointerInteracting.current;
          }}
          onTouchMove={(e) => {
            if (pointerInteracting.current !== null && e.touches[0]) pointerMovement.current = e.touches[0].clientX - pointerInteracting.current;
          }}
        />
      </div>
      <figcaption className="mt-3 text-center text-xs text-slate-500">İşte o bulutsudan doğacak gezegen — sürükleyip döndür. 🌍</figcaption>
    </figure>
  );
}
