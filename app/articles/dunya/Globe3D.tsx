'use client';

import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

// Sürüklenip döndürülebilen, kendiliğinden dönen 3B Dünya küresi (cobe v2, ~5KB).
// v2 API: onRender YOK; kendi rAF döngümüzde globe.update({ phi, width, height })
// çağırarak döndürüyoruz. dynamic(ssr:false) ile yüklenir.

export default function Globe3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerMovement = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = canvas.offsetWidth || 400;
    const measure = () => { width = canvas.offsetWidth || width; };
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(canvas);
    window.addEventListener('resize', measure);

    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let phi = 0;
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
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.32, 0.38, 0.5],
        markerColor: [0.45, 0.9, 1],
        glowColor: [0.18, 0.5, 0.95],
        markers: [
          { location: [41.01, 28.98], size: 0.08 }, // İstanbul
          { location: [35.68, 139.69], size: 0.05 }, // Tokyo
          { location: [40.71, -74.01], size: 0.05 }, // New York
          { location: [-33.87, 151.21], size: 0.05 }, // Sydney
        ],
      });

      const tick = () => {
        if (pointerInteracting.current === null && !reduce) phi += 0.0035;
        globe!.update({ phi: phi + pointerMovement.current / 200, width: width * 2, height: width * 2 });
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      requestAnimationFrame(() => { canvas.style.opacity = '1'; });
    } catch {
      canvas.style.display = 'none';
    }

    return () => {
      cancelAnimationFrame(raf);
      globe?.destroy();
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
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
          onPointerMove={(e) => { if (pointerInteracting.current !== null) pointerMovement.current = e.clientX - pointerInteracting.current; }}
          onTouchMove={(e) => { if (pointerInteracting.current !== null && e.touches[0]) pointerMovement.current = e.touches[0].clientX - pointerInteracting.current; }}
        />
      </div>
      <figcaption className="mt-3 text-center text-xs text-slate-500">İşte o bulutsudan doğacak gezegen — sürükleyip döndür. 🌍</figcaption>
    </figure>
  );
}
