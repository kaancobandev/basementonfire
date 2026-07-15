'use client';

// PERDE 6 — VÂRİS AĞACI (~%78). Sayfanın duygusal finali. Metinde bu bir liste;
// ekranda yas. Vârisler ölüm sırasıyla teker teker söner, sonunda tek Tiberius
// (istemediği adam) yanık kalır. Birikim duygusu zamanla kurulur — zamanı scroll
// (ve auto-play) verir. Alesia deseni: scroll-pin yok, görünüre girince oynar.

import { useEffect, useRef, useState } from 'react';
import { ACCENT, CRIMSON, MARBLE, ASH, prefersReduced, refreshScroll, yearLabel } from './ui';
import { HEIRS, HEIR_SURVIVOR, HEIR_PAYOFF } from './data';

const LAST = HEIRS.length; // 0..LAST; stage = kaç vâris öldü
const STEP_MS = 2400;

export default function HeirsTree() {
  const [dead, setDead] = useState(0);
  const [playing, setPlaying] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(true);

  useEffect(() => { refreshScroll(); }, [dead]);
  useEffect(() => { if (prefersReduced()) { setDead(LAST); setPlaying(false); } }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => { inViewRef.current = e.isIntersecting; }, { rootMargin: '-10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || dead >= LAST) return;
    const t = setTimeout(() => { if (inViewRef.current) setDead((d) => Math.min(LAST, d + 1)); else setPlaying(false); }, STEP_MS);
    return () => clearTimeout(t);
  }, [playing, dead]);

  const lastDied = dead > 0 ? HEIRS[dead - 1] : null;
  const complete = dead >= LAST;
  const go = (d: number) => { setDead(d); setPlaying(false); };

  return (
    <figure ref={rootRef} className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.04] p-4 pb-7 shadow-[0_0_60px_-15px_rgba(192,69,90,0.3)] backdrop-blur sm:p-5">
      <figcaption className="mb-4">
        <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: ACCENT }}>İNTERAKTİF · MÖ 23 → MS 4</div>
        <h3 className="text-base font-bold leading-snug text-white sm:text-lg">Beş vâris. Ölüm hepsini sırayla yedi.</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">Kendi kendine oynar; noktalara dokunup elle de gezebilirsin. İzle — her sönüş, Livia’nın oğlunu tahta bir adım yaklaştırdı.</p>
      </figcaption>

      {/* Augustus + vârisler */}
      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="mx-auto mb-4 w-fit rounded-lg border px-4 py-1.5 text-center" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 35%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 8%, transparent)` }}>
          <span className="text-sm font-bold" style={{ color: ACCENT }}>Augustus</span>
          <span className="ml-2 text-xs text-slate-500">bir hanedan istiyor</span>
        </div>
        <div className="mx-auto mb-3 h-3 w-px" style={{ background: 'rgba(255,255,255,0.15)' }} />

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {HEIRS.map((h, i) => {
            const isDead = i < dead;
            return (
              <button
                key={h.key} onClick={() => go(i + 1)} aria-pressed={dead === i + 1}
                className="rounded-lg border p-2 text-center transition-all"
                style={{
                  borderColor: isDead ? 'rgba(255,255,255,0.06)' : `color-mix(in srgb, ${MARBLE} 30%, transparent)`,
                  background: isDead ? 'transparent' : `color-mix(in srgb, ${MARBLE} 6%, transparent)`,
                  opacity: isDead ? 0.28 : 1,
                }}
              >
                <div className="text-[0.7rem] font-bold leading-tight" style={{ color: isDead ? ASH : MARBLE, textDecoration: isDead ? 'line-through' : 'none' }}>{h.name}</div>
                <div className="mt-0.5 font-mono text-[0.58rem] text-slate-500">{yearLabel(h.year)}{h.age ? ` · ${h.age}` : ''}</div>
                {isDead && <div className="text-[0.7rem]" style={{ color: CRIMSON }}>✝</div>}
              </button>
            );
          })}
          {/* Tiberius — survivor */}
          <div
            className="rounded-lg border p-2 text-center transition-all"
            style={{
              borderColor: complete ? `color-mix(in srgb, ${ACCENT} 50%, transparent)` : 'rgba(255,255,255,0.08)',
              background: complete ? `color-mix(in srgb, ${ACCENT} 12%, transparent)` : 'transparent',
              opacity: complete ? 1 : 0.4,
              boxShadow: complete ? `0 0 20px -6px ${ACCENT}` : 'none',
            }}
          >
            <div className="text-[0.7rem] font-bold leading-tight" style={{ color: complete ? ACCENT : 'rgba(255,255,255,0.5)' }}>{HEIR_SURVIVOR.name}</div>
            <div className="mt-0.5 font-mono text-[0.58rem] text-slate-500">kalan</div>
          </div>
        </div>
      </div>

      {/* Durum kartı */}
      <div className="mt-4 min-h-[92px]">
        {!complete && lastDied && (
          <div className="rounded-xl border p-3.5" style={{ borderColor: `color-mix(in srgb, ${CRIMSON} 28%, transparent)`, background: `color-mix(in srgb, ${CRIMSON} 7%, transparent)`, animation: 'aug-fade 0.4s ease' }}>
            <div className="mb-0.5 flex items-baseline gap-2">
              <span className="text-sm font-bold text-white">{lastDied.name}</span>
              <span className="font-mono text-xs" style={{ color: CRIMSON }}>{yearLabel(lastDied.year)}{lastDied.age ? ` · ${lastDied.age} yaşında` : ''}</span>
            </div>
            <div className="text-xs text-slate-400">{lastDied.rel}</div>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">{lastDied.fate}</p>
          </div>
        )}
        {!complete && !lastDied && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-sm leading-relaxed text-slate-400">
            Augustus bir hanedan kurmak istedi ve her adayını özenle seçti. İzle.
          </div>
        )}
        {complete && (
          <div className="rounded-xl border p-3.5" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 32%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 8%, transparent)`, animation: 'aug-fade 0.5s ease' }}>
            <div className="mb-0.5 text-sm font-bold text-white">{HEIR_SURVIVOR.name}</div>
            <div className="text-xs text-slate-400">{HEIR_SURVIVOR.rel}</div>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">{HEIR_SURVIVOR.fate}</p>
            <p className="mt-2 text-sm italic leading-relaxed" style={{ color: `color-mix(in srgb, ${MARBLE} 85%, ${CRIMSON})` }}>{HEIR_PAYOFF.adoptionLine}</p>
          </div>
        )}
      </div>

      {/* Kontroller */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => { if (complete) { setDead(0); setPlaying(true); } else setPlaying((p) => !p); }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/5 text-white transition hover:bg-white/10"
          aria-label={complete ? 'Baştan oynat' : playing ? 'Duraklat' : 'Oynat'}
        >
          {complete ? '↺' : playing ? '॥' : '▶'}
        </button>
        <div className="flex flex-1 gap-1" role="group" aria-label="Vâris ölümleri">
          {Array.from({ length: LAST }, (_, k) => (
            <button key={k} onClick={() => go(k + 1)} aria-label={`${k + 1}. ölüm`} aria-pressed={dead === k + 1} className="h-2.5 flex-1 rounded-full transition" style={{ background: k < dead ? CRIMSON : 'rgba(255,255,255,0.12)' }} />
          ))}
        </div>
      </div>

      {complete && (
        <>
          <p className="mt-4 border-t border-white/10 pt-3 text-sm leading-relaxed text-slate-400">{HEIR_PAYOFF.tacitus}</p>
          <p className="mt-2 border-l-2 pl-3 text-xs leading-relaxed text-slate-500" style={{ borderColor: `color-mix(in srgb, ${CRIMSON} 40%, transparent)` }}>{HEIR_PAYOFF.livia}</p>
        </>
      )}
      <span aria-hidden className="pointer-events-none absolute bottom-2 right-3 select-none font-mono text-[0.55rem] tracking-wider text-white/25">basementonfire.com</span>
    </figure>
  );
}
