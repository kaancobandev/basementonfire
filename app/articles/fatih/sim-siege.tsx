'use client';

// PERDE 3 — KUŞATMA YARIŞI (sayfanın kalbi). Metnin yapamadığı şey: okur problemi
// KENDİ eliyle çözemeyince cevabı öğrenmeye mecbur hisseder ("üretken başarısızlık").
// Model KASITLI: hangi slider ayarında olursa olsun sur DÜŞMEZ — denge integritesi
// E = 100·cF/(cF+sF) her zaman > 0 (18..82'ye kırpılır). Çünkü tez bu: gündüz top
// gedik açar, gece savunma doldurur; kuşatmayı top bitirmedi.
//
// GSAP scroll-pin YOK (mobil scroll'u dondurur). rAF ile 54 günlük hızlandırılmış
// oynatım; reduced-motion → anında son kare.

import { useEffect, useMemo, useRef, useState } from 'react';
import { ACCENT, BG, CRIMSON, MARBLE, prefersReduced, clamp, tr } from './ui';
import { SIEGE } from './data';

type Day = { dayLow: number; night: number };

function simulate(shots: number, crew: number): { E: number; days: Day[] } {
  const cF = crew / SIEGE.crewDivisor;
  const sF = shots;
  const E = clamp(Math.round((100 * cF) / (cF + sF)), SIEGE.eqFloor, SIEGE.eqCeil);
  const days: Day[] = [];
  let I = 100;
  for (let d = 0; d < SIEGE.days; d++) {
    const prev = I;
    I = prev + (E - prev) * 0.14; // gece: dengeye doğru onarım
    const dayLow = Math.max(E - 3, Math.min(prev, I) - shots * 1.2); // gündüz gediği
    days.push({ dayLow: Math.round(dayLow), night: Math.round(I) });
  }
  return { E, days };
}

const barColor = (i: number) => `color-mix(in srgb, ${CRIMSON} ${Math.round(100 - i)}%, ${ACCENT})`;

export default function SiegeRace() {
  const [shots, setShots] = useState<number>(SIEGE.shots.default);
  const [crew, setCrew] = useState<number>(SIEGE.crew.default);
  const [head, setHead] = useState(0); // oynatım başı: 0..days
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  const { E, days } = useMemo(() => simulate(shots, crew), [shots, crew]);

  // Aktif değerler (oynatım başına göre)
  const idx = Math.min(SIEGE.days - 1, Math.max(0, Math.ceil(head) - 1));
  const cur = head <= 0 ? 100 : days[idx].night;
  const isDayPhase = running && Math.floor(head * 2) % 2 === 0;

  const reset = () => { cancelAnimationFrame(rafRef.current); setHead(0); setRunning(false); setDone(false); };

  function run() {
    cancelAnimationFrame(rafRef.current);
    setDone(false);
    if (prefersReduced()) { setHead(SIEGE.days); setRunning(false); setDone(true); return; }
    setRunning(true);
    setHead(0);
    const total = 4200; // ms
    const t0 = performance.now();
    const step = (now: number) => {
      const k = clamp((now - t0) / total, 0, 1);
      const h = k * SIEGE.days;
      setHead(h);
      if (k < 1) rafRef.current = requestAnimationFrame(step);
      else { setHead(SIEGE.days); setRunning(false); setDone(true); }
    };
    rafRef.current = requestAnimationFrame(step);
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);
  // Slider değişince oynatımı sıfırla (yeni deneme).
  useEffect(() => { reset(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [shots, crew]);

  const dayNum = Math.min(SIEGE.days, Math.ceil(head));
  const shownIntegrity = head <= 0 ? 100 : Math.round(cur);

  return (
    <figure ref={rootRef} className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.04] p-4 pb-7 shadow-[0_0_60px_-15px_rgba(77,124,255,0.4)] backdrop-blur sm:p-5">
      <figcaption className="mb-4">
        <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: ACCENT }}>İNTERAKTİF · YILDIZ MODÜL · KUŞATMA YARIŞI</div>
        <h3 className="text-base font-bold leading-snug text-white sm:text-lg">Suru düşür. Deneyebildiğin kadar dene.</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">İki ayarı değiştir, “Çalıştır”a bas. Gündüz top gediği açar, gece savunma doldurur. 54 gün.</p>
      </figcaption>

      {/* Sur bütünlüğü barı */}
      <div className="rounded-xl border border-white/10 bg-black/25 p-4">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-xs text-slate-400">Sur bütünlüğü</span>
          <span className="font-mono text-2xl font-black" style={{ color: barColor(shownIntegrity) }}>%{shownIntegrity}</span>
        </div>
        <div className="h-5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full" style={{ width: `${shownIntegrity}%`, background: barColor(shownIntegrity), transition: running ? 'none' : 'width 0.4s ease' }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-[0.7rem] text-slate-500">
          <span>Gün <span className="font-mono font-bold text-slate-300">{dayNum}</span> / {SIEGE.days}</span>
          <span aria-hidden>{running ? (isDayPhase ? '☀ gündüz — top' : '☾ gece — onarım') : done ? '— bitti' : '— hazır'}</span>
        </div>

        {/* Sawtooth sparkline: gündüz düşer, gece yükselir */}
        <svg viewBox="0 0 216 44" className="mt-3 w-full" role="img" aria-label="54 günlük sur bütünlüğü: her gün düşüp gece yükseliyor, dengeye oturuyor">
          <line x1="0" y1={44 - (E / 100) * 40} x2="216" y2={44 - (E / 100) * 40} stroke={`color-mix(in srgb, ${MARBLE} 25%, transparent)`} strokeWidth="1" strokeDasharray="3 3" />
          <polyline
            points={days.slice(0, Math.max(0, Math.ceil(head))).flatMap((d, i) => {
              const x = (i / (SIEGE.days - 1)) * 216;
              return [`${x},${44 - (d.dayLow / 100) * 40}`, `${x},${44 - (d.night / 100) * 40}`];
            }).join(' ')}
            fill="none" stroke={barColor(shownIntegrity)} strokeWidth="1.4" strokeLinejoin="round"
          />
        </svg>
        <div className="text-right text-[0.55rem] text-slate-400">denge çizgisi · %{E}</div>
      </div>

      {/* Sliderlar */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex justify-between text-xs"><span className="text-slate-400">{SIEGE.shots.label}</span><span className="font-mono font-bold" style={{ color: CRIMSON }}>{shots}</span></div>
          <input type="range" min={SIEGE.shots.min} max={SIEGE.shots.max} step={SIEGE.shots.step} value={shots} disabled={running} onChange={(e) => setShots(Number(e.target.value))} className="w-full" style={{ accentColor: CRIMSON }} aria-label={SIEGE.shots.label} />
          <div className="flex justify-between text-[0.6rem] text-slate-400"><span>{SIEGE.shots.min}</span><span>{SIEGE.shots.max}</span></div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs"><span className="text-slate-400">{SIEGE.crew.label}</span><span className="font-mono font-bold" style={{ color: ACCENT }}>{tr(crew)}</span></div>
          <input type="range" min={SIEGE.crew.min} max={SIEGE.crew.max} step={SIEGE.crew.step} value={crew} disabled={running} onChange={(e) => setCrew(Number(e.target.value))} className="w-full" style={{ accentColor: ACCENT }} aria-label={SIEGE.crew.label} />
          <div className="flex justify-between text-[0.6rem] text-slate-400"><span>{SIEGE.crew.min}</span><span>{SIEGE.crew.max}</span></div>
        </div>
      </div>

      <button onClick={done ? reset : run} disabled={running} className="mt-4 w-full rounded-xl px-4 py-3.5 text-sm font-black transition hover:brightness-110 disabled:opacity-50" style={{ background: done ? 'rgba(255,255,255,0.08)' : ACCENT, color: done ? MARBLE : BG, border: done ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
        {running ? `Kuşatma sürüyor… gün ${dayNum}` : done ? '↻ Başka ayarla dene' : '▶ Çalıştır (54 gün)'}
      </button>

      {/* Sonuç — sur her zaman ayakta kalır */}
      {done && (
        <div className="mt-4 rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${CRIMSON} 32%, transparent)`, background: `color-mix(in srgb, ${CRIMSON} 6%, transparent)`, animation: prefersReduced() ? 'none' : 'fatih-fade 0.5s ease' }}>
          <div className="mb-1 font-mono text-sm font-bold" style={{ color: barColor(E) }}>Sur bütünlüğü: %{E} · Düşmedi.</div>
          <p className="text-sm font-semibold leading-relaxed text-slate-100">{SIEGE.closer}</p>
          <a href="#perde-4" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: ACCENT }}>
            {SIEGE.next}
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
          </a>
        </div>
      )}

      <span aria-hidden className="pointer-events-none absolute bottom-2 right-3 select-none font-mono text-[0.55rem] tracking-wider text-white/25">basementonfire.com</span>
    </figure>
  );
}
