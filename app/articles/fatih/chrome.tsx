'use client';

// Sabit UI iskelesi (brief'in "Tutma Mimarisi" #4: ilerleme yanılsaması).
// Üstte ince okuma-ilerleme çubuğu + kalan süre; solda (masaüstü) perde göstergesi.
// Hafif: scroll dinleyici rAF ile kısılır; IntersectionObserver ile aktif perde.

import { useEffect, useState } from 'react';
import { ACCENT, BG } from './ui';

const READ_MIN = 13;

export function ReadingProgress() {
  const [frac, setFrac] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        setFrac(max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)) : 0);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);

  const left = Math.max(0, Math.round(READ_MIN * (1 - frac)));
  const near = frac > 0.985;

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent" aria-hidden>
        <div className="h-full origin-left" style={{ transform: `scaleX(${frac})`, background: `linear-gradient(90deg, ${ACCENT}, color-mix(in srgb, ${ACCENT} 55%, white))`, transition: 'transform 0.08s linear' }} />
      </div>
      <div className="pointer-events-none fixed right-3 top-3 z-[60] rounded-full border px-2.5 py-1 text-[0.62rem] font-bold backdrop-blur" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${BG} 55%, transparent)`, color: `color-mix(in srgb, ${ACCENT} 88%, white)` }}>
        {near ? 'son' : `~${left} dk kaldı`}
      </div>
    </>
  );
}

export function PerdeNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    items.forEach((it) => { const el = document.getElementById(it.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Perdeler" className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2.5 lg:flex">
      {items.map((it, i) => {
        const on = it.id === active;
        return (
          <a
            key={it.id}
            href={`#${it.id}`}
            className="group flex items-center gap-2"
            aria-current={on ? 'true' : undefined}
          >
            <span
              className="grid h-6 w-6 place-items-center rounded-full border font-mono text-[0.6rem] font-bold transition"
              style={on
                ? { background: ACCENT, color: BG, borderColor: ACCENT }
                : { borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.03)' }}
            >
              {i}
            </span>
            <span
              className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold opacity-0 transition-all duration-200 group-hover:max-w-[160px] group-hover:opacity-100"
              style={{ color: on ? `color-mix(in srgb, ${ACCENT} 90%, white)` : 'rgba(255,255,255,0.7)' }}
            >
              {it.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
