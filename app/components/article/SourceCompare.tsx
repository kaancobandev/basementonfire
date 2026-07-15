'use client';

// ════════════════════════════════════════════════════════════════════════
// KAYNAK KARŞILAŞTIRICI — Basements'ın imza / yeniden kullanılabilir öğesi.
// "Aynı olay, farklı tanıklara göre." Platformun doğrulama tezini birebir
// anlatır: her tarih içeriğinde kullanılabilir. Palet-bağımsız (accent prop +
// isteğe bağlı per-kaynak `color`), erişilebilir sekmeler.
//
// SSR / crawlability: sekmeli içerik crawler'dan gizlenmesin diye TÜM kaynak
// metinleri ayrıca görünmez ama DOM'da bir SEO bloğunda (aria-hidden) durur;
// görünür sekmeler yalnız etkileşim + a11y içindir (çift okunmaz).
//
// Kullanım:
//   <SourceCompare
//     event="Şehir nasıl düştü? — 29 Mayıs 1453"
//     question="Sekmelere dokun: aynı olay değişsin."
//     bottom="Dördü de oradaydı. Dördü de farklı şey anlatıyor."
//     accent="#4d7cff"
//     sources={[{ name, role, text, color? }]}
//   />
// ════════════════════════════════════════════════════════════════════════

import { useId, useRef, useState } from 'react';

export type CompareSource = {
  name: string;
  role: string;
  text: string;
  color?: string; // gerçek CSS rengi; verilmezse accent kullanılır
};

export default function SourceCompare({
  event, question, bottom, sources, accent = '#4d7cff', kicker = 'KAYNAK KARŞILAŞTIRICI',
}: {
  event: string;
  question?: string;
  bottom?: string;
  sources: CompareSource[];
  accent?: string;
  kicker?: string;
}) {
  const [i, setI] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = sources[i] ?? sources[0];

  // Roving-tabindex: seçimi değiştir VE odağı yeni sekmeye taşı (WCAG 2.1.1).
  const move = (next: number) => { setI(next); tabRefs.current[next]?.focus(); };
  const col = active?.color || accent;

  return (
    <figure className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.04] p-4 pb-7 shadow-[0_0_60px_-15px_rgba(77,124,255,0.35)] backdrop-blur sm:p-5">
      <figcaption className="mb-4">
        <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: accent }}>{kicker}</div>
        <h3 className="text-base font-bold leading-snug text-white sm:text-lg">{event}</h3>
        {question && <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{question}</p>}
      </figcaption>

      {/* Sekme çubuğu */}
      <div role="tablist" aria-label="Kaynaklar" className="mb-3 flex flex-wrap gap-1.5">
        {sources.map((s, k) => {
          const on = k === i;
          const c = s.color || accent;
          return (
            <button
              key={s.name}
              ref={(el) => { tabRefs.current[k] = el; }}
              role="tab"
              id={`${baseId}-tab-${k}`}
              aria-selected={on}
              aria-controls={`${baseId}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => setI(k)}
              onKeyDown={(e) => {
                let next: number | null = null;
                if (e.key === 'ArrowRight') next = (k + 1) % sources.length;
                else if (e.key === 'ArrowLeft') next = (k - 1 + sources.length) % sources.length;
                else if (e.key === 'Home') next = 0;
                else if (e.key === 'End') next = sources.length - 1;
                if (next !== null) { e.preventDefault(); move(next); }
              }}
              className="rounded-full px-3 py-2 text-xs font-bold transition"
              style={on
                ? { background: c, color: '#0a0d17', boxShadow: `0 0 0 1px ${c}` }
                : { border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.03)' }}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      {/* Aktif panel (görünür + a11y) */}
      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${i}`}
        className="rounded-xl border p-4 transition-colors"
        style={{ borderColor: `color-mix(in srgb, ${col} 32%, transparent)`, background: `color-mix(in srgb, ${col} 7%, transparent)` }}
      >
        <div className="mb-0.5 text-base font-black" style={{ color: col }}>{active.name}</div>
        <div className="mb-2.5 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-400">{active.role}</div>
        <p key={i} className="text-sm leading-relaxed text-slate-200" style={{ animation: 'fatih-fade 0.4s ease' }}>{active.text}</p>
      </div>

      {bottom && <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-100">{bottom}</p>}

      {/* Crawlanabilir SEO bloğu: tüm kaynaklar DOM'da (sekmeyle gizlenen metin
          arama motorundan saklanmasın). aria-hidden → ekran okuyucu çift okumaz. */}
      <div className="sr-only" aria-hidden="true">
        {sources.map((s) => (
          <p key={s.name}><strong>{s.name} ({s.role}):</strong> {s.text}</p>
        ))}
      </div>

      <span aria-hidden className="pointer-events-none absolute bottom-2 right-3 select-none font-mono text-[0.55rem] tracking-wider text-white/25">basementonfire.com</span>
    </figure>
  );
}
