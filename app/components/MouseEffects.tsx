'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';

// ─────────────────────────────────────────────────────────────────────────
// Tıklama efekti (Originkit "sniper" modu): tıklanan noktadan dört artı çizgisi
// ve sekiz nokta dışa fırlayıp ~0.3s'de söner.
//
// Orijinal bileşenden sadeleştirildi:
//   • 6 moddan yalnız "sniper" tutuldu (diğer 5 mod = ~400 satır ölü koddu).
//   • "Click Anywhere" demo etiketi ve labelFont/showLabel prop'ları atıldı.
//   • container fixed inset-0: document click dinlendiği için koordinatın
//     viewport'a birebir oturması gerekir (relative parent'ta kayardı).
//   • state temizleme 8 noktada değil TEK yerde (idempotent ama gereksizdi).
//   • SVG ref'ine de dataset.animated guard'ı eklendi (re-render'da restart yok).
//
// AppShell yalnız GİRİŞ YAPMIŞ kullanıcıda dynamic(ssr:false) ile mount eder →
// çıkışlı ziyaretçiye GSAP hiç inmez (login/register bundle'ı GSAP'sız kalır).
// ─────────────────────────────────────────────────────────────────────────

type Sniper = { id: string; x: number; y: number };

// Noktaların dışa fırlama açıları (8 yön, çaprazlar dahil).
const DOT_ANGLES = [
  Math.PI / 3, (2 * Math.PI) / 3, (4 * Math.PI) / 3, (5 * Math.PI) / 3,
  Math.PI / 6, (5 * Math.PI) / 6, (7 * Math.PI) / 6, (11 * Math.PI) / 6,
];
const CROSS_ANGLES = [0, 90, 180, 270];

export default function MouseEffects({
  color = 'var(--color-primary)',   // tema-duyarlı marka moru (açık #5b2eef / koyu #8f74ff)
  duration = 0.3,
  strokeWidth = 2,
  effectSize = 90,
  rotation = 0,
}: {
  color?: string;
  duration?: number;
  strokeWidth?: number;
  effectSize?: number;
  rotation?: number;
}) {
  const [snipers, setSnipers] = useState<Sniper[]>([]);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce.current) return;   // hareket azaltma: efekt kapalı
    const onClick = (e: MouseEvent) => {
      const id = `${e.timeStamp}-${Math.round(e.clientX)}-${Math.round(e.clientY)}`;
      setSnipers((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const svgStyle = (x: number, y: number): CSSProperties => ({
    position: 'absolute', left: x - effectSize / 2, top: y - effectSize / 2,
    width: effectSize, height: effectSize, pointerEvents: 'none', overflow: 'visible',
    transform: `rotate(${rotation}deg)`, transformOrigin: 'center',
  });

  const remove = (id: string) => setSnipers((prev) => prev.filter((s) => s.id !== id));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'visible' }} aria-hidden>
      {snipers.map((s) => (
        <div key={s.id}>
          {/* dört artı çizgisi dışa doğru fırlar */}
          <svg
            style={svgStyle(s.x, s.y)}
            ref={(el) => {
              if (!el || el.dataset.animated) return;
              el.dataset.animated = 'true';
              el.querySelectorAll('line').forEach((line, i) => {
                const a = CROSS_ANGLES[i] * (Math.PI / 180);
                const c = effectSize / 2, len = effectSize * 0.2;
                const sx = c + 5 * Math.cos(a), sy = c - 5 * Math.sin(a);
                const ex = c + (5 + len) * Math.cos(a), ey = c - (5 + len) * Math.sin(a);
                gsap.set(line, { attr: { x1: sx, y1: sy, x2: ex, y2: ey }, strokeWidth });
                gsap.timeline()
                  .to(line, {
                    attr: { x1: ex, y1: ey, x2: ex, y2: ey },
                    translateX: (5 + len) * Math.cos(a), translateY: -(5 + len) * Math.sin(a),
                    duration, ease: 'power2.out',
                  })
                  .to(line, { strokeWidth: 0, duration: duration * 0.4, ease: 'linear' }, duration * 0.6);
              });
            }}
          >
            {CROSS_ANGLES.map((_, i) => (
              <line key={i} x1={effectSize / 2} y1={effectSize / 2} x2={effectSize / 2} y2={effectSize / 2}
                stroke={color} strokeWidth={strokeWidth} strokeLinecap="square" />
            ))}
          </svg>

          {/* sekiz nokta radyal olarak fırlar; TEK temizleme (i===0) */}
          {DOT_ANGLES.map((a, i) => (
            <div
              key={i}
              style={{
                position: 'absolute', left: s.x - strokeWidth / 2, top: s.y - strokeWidth / 2,
                width: strokeWidth, height: strokeWidth, backgroundColor: color,
                pointerEvents: 'none', transformOrigin: 'center', transform: `rotate(${rotation}deg)`,
              }}
              ref={(el) => {
                if (!el || el.dataset.animated) return;
                el.dataset.animated = 'true';
                gsap.set(el, { x: 0, y: 0, width: strokeWidth, height: strokeWidth });
                gsap.timeline()
                  .to(el, {
                    x: Math.cos(a) * (effectSize * 0.4), y: Math.sin(a) * (effectSize * 0.4),
                    duration, ease: 'power2.out',
                    onComplete: i === 0 ? () => remove(s.id) : undefined,
                  })
                  .to(el, { width: 0, height: 0, duration: duration * 0.4, ease: 'linear' }, duration * 0.6);
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
