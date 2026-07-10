'use client';

// YILDIZ MODÜL — 1.000 noktalık ızgara, her nokta bir atom çekirdeği.
// Hangi noktanın söneceğini kimse bilmiyor; ama eğri her seferinde aynı çıkıyor.
// Önceki koşuların eğrileri hayalet olarak üst üste binerek bunu gösterir.

import { useCallback, useEffect, useRef, useState } from 'react';
import { GRID_COLS, GRID_N, GRID_ROWS, ISOTOPES } from './data';
import { ActionButton, Chip, Stat, WidgetFrame, humanTime, refreshScroll, tr } from './ui';

const MAX_T = 8;              // grafikte gösterilen yarılanma sayısı
const SPEED = 0.45;           // saniyede kaç yarılanma
const CHART_W = 300, CHART_H = 80, TOP = 4, BOT = 76;

const yOf = (aliveCount: number) => TOP + (1 - aliveCount / GRID_N) * (BOT - TOP);
const xOf = (t: number) => Math.min(t, MAX_T) / MAX_T * CHART_W;

function pathOf(hist: [number, number][]) {
  if (hist.length < 2) return '';
  const stride = Math.max(1, Math.floor(hist.length / 240));
  const pts: string[] = [];
  for (let i = 0; i < hist.length; i += stride) pts.push(`${xOf(hist[i][0]).toFixed(1)},${yOf(hist[i][1]).toFixed(1)}`);
  const last = hist[hist.length - 1];
  pts.push(`${xOf(last[0]).toFixed(1)},${yOf(last[1]).toFixed(1)}`);
  return 'M' + pts.join(' L');
}

// Teorik eğri: N(t) = N₀ · 2^(−t)
const THEORY = 'M' + Array.from({ length: 81 }, (_, i) => {
  const t = (i / 80) * MAX_T;
  return `${xOf(t).toFixed(1)},${yOf(GRID_N * Math.pow(2, -t)).toFixed(1)}`;
}).join(' L');

export default function HalfLifeSim() {
  const [isoIdx, setIsoIdx] = useState(1); // karbon-14 ile aç
  const [playing, setPlaying] = useState(false);
  const [alive, setAlive] = useState(GRID_N);
  const [t, setT] = useState(0);
  const [curve, setCurve] = useState('');
  const [ghosts, setGhosts] = useState<string[]>([]);
  const [runs, setRuns] = useState(0);

  const iso = ISOTOPES[isoIdx];
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sim = useRef({
    alive: new Uint8Array(GRID_N).fill(1),
    flash: new Float32Array(GRID_N),
    t: 0, count: GRID_N, playing: false,
    color: ISOTOPES[1].color,
    hist: [[0, GRID_N]] as [number, number][],
  });
  sim.current.color = iso.color;

  /* ── çizim ── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const cw = w / GRID_COLS, chh = h / GRID_ROWS;
    const r = Math.max(1.2, Math.min(cw, chh) * 0.3);
    const s = sim.current;

    for (let i = 0; i < GRID_N; i++) {
      const cx = (i % GRID_COLS) * cw + cw / 2;
      const cy = Math.floor(i / GRID_COLS) * chh + chh / 2;
      const f = s.flash[i];
      if (s.alive[i]) {
        ctx.fillStyle = s.color;
        ctx.globalAlpha = 0.95;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      } else if (f > 0) {
        ctx.globalAlpha = f;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(cx, cy, r + f * r * 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(148,163,184,0.16)';
        ctx.beginPath(); ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }, []);

  /* ── döngü ── */
  useEffect(() => {
    refreshScroll(); // modül mount olup yükseklik değişti → pinli çizelgeyi tazele
    let raf = 0, last = performance.now(), acc = 0;
    const loop = (now: number) => {
      const s = sim.current;
      const dtms = Math.min(64, now - last);
      last = now;

      if (s.playing && s.count > 0) {
        const dt = (dtms / 1000) * SPEED;
        const p = 1 - Math.pow(2, -dt);
        for (let i = 0; i < GRID_N; i++) {
          if (s.alive[i] && Math.random() < p) { s.alive[i] = 0; s.flash[i] = 1; s.count--; }
        }
        s.t += dt;
        s.hist.push([s.t, s.count]);
        if (s.count === 0 || s.t >= MAX_T) s.playing = false;
      }
      for (let i = 0; i < GRID_N; i++) if (s.flash[i] > 0) s.flash[i] = Math.max(0, s.flash[i] - dtms / 240);

      draw();

      acc += dtms;
      if (acc > 90) {
        acc = 0;
        setAlive(s.count); setT(s.t); setCurve(pathOf(s.hist));
        setPlaying(s.playing);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [draw]);

  /* ── eylemler ── */
  function reset(keepGhost: boolean) {
    const s = sim.current;
    if (keepGhost && s.t > 0.4) {
      const g = pathOf(s.hist);
      setGhosts(prev => [...prev, g].slice(-4));
      setRuns(n => n + 1);
    }
    s.alive.fill(1); s.flash.fill(0); s.t = 0; s.count = GRID_N; s.playing = false;
    s.hist = [[0, GRID_N]];
    setAlive(GRID_N); setT(0); setCurve(''); setPlaying(false);
  }

  function stepOneHalfLife() {
    const s = sim.current;
    if (s.count === 0) return;
    for (let i = 0; i < GRID_N; i++) {
      if (s.alive[i] && Math.random() < 0.5) { s.alive[i] = 0; s.flash[i] = 1; s.count--; }
    }
    s.t += 1;
    s.hist.push([s.t, s.count]);
    setAlive(s.count); setT(s.t); setCurve(pathOf(s.hist));
  }

  function toggle() {
    const s = sim.current;
    // Biten koşuyu hayalete çevirip yeni bir tanesini hemen başlat: iki eğriyi
    // üst üste görmek modülün bütün anlatısı.
    if (s.count === 0 || s.t >= MAX_T) { reset(true); s.playing = true; setPlaying(true); return; }
    s.playing = !s.playing;
    setPlaying(s.playing);
  }

  function pickIsotope(i: number) {
    if (i === isoIdx) return;
    setIsoIdx(i);
    setGhosts([]); setRuns(0);
    reset(false);
  }

  const finished = alive === 0 || t >= MAX_T;
  const halfLives = t;
  const elapsed = humanTime(t * iso.halfLifeS);

  return (
    <WidgetFrame
      hero
      kicker="İNTERAKTİF · YILDIZ MODÜL"
      title="1.000 atom. Hangisinin söneceğini kimse bilmiyor."
      hint="Başlat'a bas. Noktalar rastgele söner. Sonra sıfırla, bir daha çalıştır — ve iki eğriyi üst üste koy."
      footnote={
        <>
          Simülasyon gerçek fizik kullanır: her adımda ayakta kalan her çekirdeğin bozunma olasılığı{' '}
          <span className="font-mono text-slate-400">1 − 2⁻ᵈᵗ</span>. Hiçbir çekirdek diğerinden daha &quot;yorgun&quot; değildir.
        </>
      }
    >
      {/* izotop seçici */}
      <div className="mb-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {ISOTOPES.map((o, i) => (
          <div key={o.key} className="shrink-0">
            <Chip active={i === isoIdx} color={o.color} onClick={() => pickIsotope(i)}>
              <span className="font-mono">{o.symbol}</span>
              <span className="ml-1.5 hidden sm:inline">{o.name.split('-')[0]}</span>
            </Chip>
          </div>
        ))}
      </div>

      {/* ızgara */}
      <div className="relative overflow-hidden rounded-xl bg-black/40 p-2 ring-1 ring-white/5">
        <canvas
          ref={canvasRef}
          className="block h-auto w-full"
          style={{ aspectRatio: `${GRID_COLS} / ${GRID_ROWS}` }}
          aria-hidden
        />
        {finished && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="rounded-full bg-black/70 px-4 py-1.5 text-xs font-bold text-white backdrop-blur">
              {alive === 0 ? 'hepsi bozundu' : `${MAX_T} yarılanma geçti`} · ↻ ile tekrar çalıştır
            </span>
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">Kalan çekirdek: {alive}. Geçen süre: {tr(halfLives, 1)} yarılanma.</p>

      {/* sayaçlar */}
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <Stat value={tr(alive)} label={`kalan / ${tr(GRID_N)}`} color={iso.color} />
        <Stat value={tr(halfLives, 1)} label="yarılanma geçti" color="#f8fafc" />
        <Stat value={elapsed} label="gerçek zamanda" color="#94a3b8" />
      </div>

      {/* denetimler — başparmak menzilinde */}
      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <ActionButton onClick={toggle} tone={playing ? 'stop' : 'accent'}>
          {playing ? '⏸ Duraklat' : finished ? '↻ Tekrar çalıştır' : '▶ Başlat'}
        </ActionButton>
        <ActionButton onClick={stepOneHalfLife} tone="ghost" disabled={playing || finished}>
          ⏭ Bir yarılanma
        </ActionButton>
        <ActionButton onClick={() => reset(true)} tone="ghost">↺ Sıfırla</ActionButton>
      </div>

      {/* eğri */}
      <div className="mt-4">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-slate-400">
          <span>Kalan çekirdek — zaman (yarılanma cinsinden)</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><i className="inline-block h-0.5 w-4 bg-slate-500" style={{ borderTop: '2px dashed #64748b', height: 0 }} />teori</span>
            {ghosts.length > 0 && <span className="flex items-center gap-1"><i className="inline-block h-0.5 w-4" style={{ background: iso.color, opacity: 0.35 }} />önceki {tr(runs)} koşu</span>}
          </span>
        </div>
        <div className="overflow-hidden rounded-xl bg-black/40 ring-1 ring-white/5">
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="h-24 w-full sm:h-28" preserveAspectRatio="none" aria-hidden>
            {Array.from({ length: MAX_T }, (_, i) => (
              <line key={i} x1={xOf(i + 1)} y1={TOP} x2={xOf(i + 1)} y2={BOT} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            ))}
            <line x1="0" y1={yOf(GRID_N / 2)} x2={CHART_W} y2={yOf(GRID_N / 2)} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="2 3" />
            <path d={THEORY} fill="none" stroke="#64748b" strokeWidth="1.6" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
            {ghosts.map((g, i) => (
              <path key={i} d={g} fill="none" stroke={iso.color} strokeWidth="1.6" opacity={0.28} vectorEffect="non-scaling-stroke" />
            ))}
            {curve && <path d={curve} fill="none" stroke={iso.color} strokeWidth="2.4" vectorEffect="non-scaling-stroke" />}
          </svg>
        </div>
        <div className="mt-1 flex justify-between px-0.5 font-mono text-[0.6rem] text-slate-600">
          {Array.from({ length: MAX_T + 1 }, (_, i) => <span key={i}>{i}</span>)}
        </div>
      </div>

      {/* izotopun hikâyesi + ölçek şoku */}
      <div className="mt-4 rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${iso.color} 28%, transparent)`, background: `color-mix(in srgb, ${iso.color} 7%, transparent)` }}>
        <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-mono text-lg font-bold" style={{ color: iso.color }}>{iso.symbol}</span>
          <span className="text-sm font-semibold text-white">{iso.name}</span>
          <span className="text-xs text-slate-400">· yarılanma süresi <strong className="font-mono text-slate-300">{iso.halfLife}</strong></span>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">{iso.blurb}</p>
      </div>

      {ghosts.length > 0 && (
        <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-relaxed text-slate-300">
          <strong className="text-white">Bak.</strong> Her koşuda <em className="not-italic" style={{ color: iso.color }}>farklı</em> noktalar söndü.
          Ama eğriler neredeyse üst üste bindi — ve kesikli teorik çizgiyi takip etti. Tek tek atomlar tahmin edilemez;
          bir milyon atom kusursuz bir saat.
        </p>
      )}
    </WidgetFrame>
  );
}
