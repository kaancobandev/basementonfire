'use client';

// PERDE 3 — Alesia çift sur (~%55). Sayfanın teknik zirvesi ve metnin
// yapamadığı tek şey: SIRA. Metinde ikinci suru okumadan önce görürsünüz;
// burada iç sur çizilir → ufukta noktalar belirir → DIŞ sur çizilir.
// "Aa" anı tamamen zamanlamadan doğar.
//
// Bilinçli tasarım kararı: GSAP scroll-pin YOK. Makalede zaten iki pinli bölüm
// var (hero + yatay çizelge) ve pinler mobilde scroll'u dondurabiliyor. Bunun
// yerine: görünüre girince kendi kendine oynayan sahneler + manuel adımlama.
// Aynı "aa" zamanlaması, kırılganlık olmadan; her sahne ekran görüntüsüne uygun.

import { useEffect, useRef, useState } from 'react';
import { ACCENT, GOLD, MARBLE, BG, prefersReduced, refreshScroll } from './ui';
import { ALESIA, ALESIA_STAGES, VERCINGETORIX_NOTE } from './data';

const LAST = ALESIA_STAGES.length - 1;
const STEP_MS = 2600;

// Daire çevreleri (strokeDashoffset ile "çizim" animasyonu için).
const R_INNER = 62;
const R_OUTER = 92;
const C_INNER = 2 * Math.PI * R_INNER;
const C_OUTER = 2 * Math.PI * R_OUTER;

// Kurtarma ordusu noktaları — deterministik (Math.random YOK).
const RELIEF_DOTS = Array.from({ length: 22 }, (_, k) => {
  const deg = (k / 22) * 360 + (k % 3) * 4;
  const r = (deg * Math.PI) / 180;
  const dist = 110 + (k % 4) * 6;
  return { x: 140 + Math.cos(r) * dist, y: 130 + Math.sin(r) * dist, d: k * 0.05 };
});

export default function AlesiaSiege() {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(true);

  useEffect(() => { refreshScroll(); }, [stage]);

  // Hareket azaltma: animasyon yok, doğrudan son sahne (her şey görünür).
  useEffect(() => {
    if (prefersReduced()) { setStage(LAST); setPlaying(false); }
  }, []);

  // Görünürlük: ekran dışındayken otomatik oynatmayı durdur.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => { inViewRef.current = e.isIntersecting; }, { rootMargin: '-10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Otomatik ilerleme — yalnızca oynarken, görünürken ve son sahneye varmadan.
  useEffect(() => {
    if (!playing || stage >= LAST) return;
    const t = setTimeout(() => {
      if (inViewRef.current) setStage((s) => Math.min(LAST, s + 1));
      else setPlaying(false); // ekran dışındaysa durakla, kullanıcı dönünce elle sürsün
    }, STEP_MS);
    return () => clearTimeout(t);
  }, [playing, stage]);

  const active = ALESIA_STAGES[stage];
  const show = {
    inner: stage >= 1,
    dots: stage >= 2,
    outer: stage >= 3,
    crisis: stage >= 4,
    surrender: stage >= 5,
  };

  const go = (s: number) => { setStage(s); setPlaying(false); };

  return (
    <figure ref={rootRef} className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.04] p-4 pb-7 shadow-[0_0_60px_-15px_rgba(217,164,65,0.3)] backdrop-blur sm:p-5">
      <figcaption className="mb-4">
        <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: ACCENT }}>İNTERAKTİF · YILDIZ MODÜL · MÖ 52</div>
        <h3 className="text-base font-bold leading-snug text-white sm:text-lg">Kazanmanın matematiksel yolu yoktu. Kazandı.</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">Kendi kendine oynar; noktalara dokunup elle de gezebilirsin. İzle: sıra, hikâyenin kendisi.</p>
      </figcaption>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,240px)_1fr]">
        {/* Diyagram */}
        <div className="mx-auto w-full max-w-[280px]">
          <svg viewBox="0 0 280 260" className="w-full" role="img" aria-label={`Alesia sahne ${stage + 1}/${ALESIA_STAGES.length}: ${active.title}`}>
            {/* İki hat arasındaki Roma bölgesi */}
            <circle cx="140" cy="130" r="77" fill={show.outer ? `color-mix(in srgb, ${ACCENT} 6%, transparent)` : 'transparent'} style={{ transition: 'fill 0.6s ease' }} />

            {/* Dış hat (kurtarma ordusuna bakan) */}
            <circle
              cx="140" cy="130" r={R_OUTER}
              fill="none" stroke={`color-mix(in srgb, ${MARBLE} 55%, transparent)`} strokeWidth="2.5" strokeDasharray={C_OUTER}
              strokeDashoffset={show.outer ? 0 : C_OUTER}
              style={{ transition: prefersReduced() ? 'none' : 'stroke-dashoffset 1s ease' }}
              transform="rotate(-90 140 130)"
            />

            {/* Kurtarma ordusu noktaları */}
            {RELIEF_DOTS.map((p, k) => (
              <circle
                key={k} cx={p.x} cy={p.y} r="2.4"
                fill={show.surrender ? 'rgba(148,163,184,0.25)' : MARBLE}
                style={{ opacity: show.dots ? 1 : 0, transition: `opacity 0.5s ease ${p.d}s` }}
              />
            ))}

            {/* İç hat (kaleye bakan) */}
            <circle
              cx="140" cy="130" r={R_INNER}
              fill="none" stroke={ACCENT} strokeWidth="2.5" strokeDasharray={C_INNER}
              strokeDashoffset={show.inner ? 0 : C_INNER}
              style={{ transition: prefersReduced() ? 'none' : 'stroke-dashoffset 1s ease' }}
              transform="rotate(-90 140 130)"
            />
            {/* İç hat üzerinde 23 tabya */}
            {show.inner && Array.from({ length: ALESIA.castella }, (_, k) => {
              const a = (k / ALESIA.castella) * 2 * Math.PI;
              return <circle key={k} cx={140 + Math.cos(a) * R_INNER} cy={130 + Math.sin(a) * R_INNER} r="1.6" fill="#fff" style={{ opacity: 0.6 }} />;
            })}

            {/* Kale + Vercingetorix */}
            <circle cx="140" cy="130" r="30" fill={`color-mix(in srgb, ${GOLD} 16%, ${BG})`} stroke={GOLD} strokeWidth="1.5" />
            <text x="140" y="126" textAnchor="middle" style={{ fontSize: 9, fill: GOLD, fontWeight: 700 }}>80.000</text>
            <text x="140" y="138" textAnchor="middle" style={{ fontSize: 7, fill: `color-mix(in srgb, ${GOLD} 80%, white)` }}>Vercingetorix</text>

            {/* Kriz: Mont Réa zayıf noktası + Caesar'ın kırmızı pelerini */}
            {show.crisis && !show.surrender && (
              <g style={{ animation: prefersReduced() ? 'none' : 'sezar-pulse 1s ease infinite' }}>
                <circle cx={140 + Math.cos(-2.4) * 84} cy={130 + Math.sin(-2.4) * 84} r="7" fill="none" stroke={ACCENT} strokeWidth="2" />
                <circle cx={140 + Math.cos(-2.4) * 70} cy={130 + Math.sin(-2.4) * 70} r="3" fill={ACCENT} />
              </g>
            )}

            {/* Teslim: kılıç bırakıldı */}
            {show.surrender && (
              <g style={{ animation: prefersReduced() ? 'none' : 'sezar-fade 0.6s ease' }}>
                <line x1="140" y1="118" x2="140" y2="142" stroke={MARBLE} strokeWidth="2" />
                <line x1="133" y1="122" x2="147" y2="122" stroke={MARBLE} strokeWidth="2" />
              </g>
            )}

            {/* Etiketler */}
            <text x="140" y="20" textAnchor="middle" style={{ fontSize: 8, fill: show.outer ? MARBLE : 'transparent', transition: 'fill 0.4s' }}>dış hat · {ALESIA.outerMiles} mil ({ALESIA.outerKm} km)</text>
            <text x="140" y="248" textAnchor="middle" style={{ fontSize: 8, fill: show.inner ? ACCENT : 'transparent', transition: 'fill 0.4s' }}>iç hat · {ALESIA.innerMiles} mil ({ALESIA.innerKm} km)</text>
          </svg>
        </div>

        {/* Sahne metni */}
        <div className="flex min-h-[180px] flex-col">
          <div className="mb-1 font-mono text-xs" style={{ color: GOLD }}>Sahne {stage + 1} / {ALESIA_STAGES.length}</div>
          <div className="mb-2 text-lg font-bold text-white">{active.title}</div>
          <p className="text-sm leading-relaxed text-slate-300" aria-live="polite">{active.text}</p>
        </div>
      </div>

      {/* Kontroller */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => { if (stage >= LAST) { setStage(0); setPlaying(true); } else setPlaying((p) => !p); }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/5 text-white transition hover:bg-white/10"
          aria-label={stage >= LAST ? 'Baştan oynat' : playing ? 'Duraklat' : 'Oynat'}
        >
          {stage >= LAST ? '↺' : playing ? '॥' : '▶'}
        </button>
        {/* Sahne segmentleri */}
        <div className="flex flex-1 gap-1" role="group" aria-label="Sahneler">
          {ALESIA_STAGES.map((s, k) => (
            <button
              key={s.key}
              onClick={() => go(k)}
              aria-label={`Sahne ${k + 1}: ${s.title}`}
              aria-pressed={k === stage}
              className="h-2.5 flex-1 rounded-full transition"
              style={{ background: k <= stage ? ACCENT : 'rgba(255,255,255,0.12)' }}
            />
          ))}
        </div>
      </div>

      <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-slate-500">
        <span className="font-semibold" style={{ color: `color-mix(in srgb, ${GOLD} 80%, white)` }}>Tarihsel not · </span>
        {VERCINGETORIX_NOTE}
      </p>

      <span aria-hidden className="pointer-events-none absolute bottom-2 right-3 select-none font-mono text-[0.55rem] tracking-wider text-white/25">basementonfire.com</span>
    </figure>
  );
}
