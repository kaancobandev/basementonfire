'use client';

// Solda kaynak, ortada sürüklenebilir engeller, sağda dedektör.
// Engeli beam kutusuna sürükle (ya da dokun) — kaç parçacığın geçtiğini gör.
// Sürükleme delight yolu; dokunma erişilebilir yol. İkisi de aynı işi yapar.

import { useEffect, useRef, useState } from 'react';
import { BARRIERS, RAY_INFO, type BarrierKey } from './data';
import { ActionButton, RAY, WidgetFrame, tr, type RayKey } from './ui';

const SLOT_X = [0.345, 0.49, 0.635];
const SRC_X = 0.085, DET_X = 0.915;
const SLAB_W = 0.045;

type P = { x: number; y: number; vx: number; next: number; };
type Burst = { x: number; y: number; life: number; color: string };

const SPEED: Record<RayKey, number> = { alpha: 0.16, beta: 0.34, gamma: 0.52 };

export default function PenetrationBox() {
  const [ray, setRay] = useState<RayKey>('alpha');
  const [active, setActive] = useState<BarrierKey[]>([]);
  const [sent, setSent] = useState(0);
  const [hit, setHit] = useState(0);
  const [drag, setDrag] = useState<{ key: BarrierKey; x: number; y: number; moved: boolean } | null>(null);

  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const world = useRef({
    ray: 'alpha' as RayKey,
    active: [] as BarrierKey[],
    parts: [] as P[],
    bursts: [] as Burst[],
    sent: 0, hit: 0, detFlash: 0, spawnAcc: 0,
  });
  world.current.ray = ray;
  world.current.active = active;

  const expected = active.reduce((p, k) => p * BARRIERS.find(b => b.key === k)!.pass[ray], 1);
  const observed = sent > 0 ? hit / sent : null;

  /* sayaçları sıfırla: kaynak ya da engel dizilimi değişince ölçüm baştan başlar */
  useEffect(() => {
    const w = world.current;
    w.parts = []; w.bursts = []; w.sent = 0; w.hit = 0;
    setSent(0); setHit(0);
  }, [ray, active]);

  /* animasyon */
  useEffect(() => {
    let raf = 0, last = performance.now(), acc = 0;
    const loop = (now: number) => {
      const canvas = canvasRef.current;
      const w = world.current;
      const dt = Math.min(48, now - last) / 1000;
      last = now;

      if (canvas) {
        const ctx = canvas.getContext('2d');
        const cw = canvas.clientWidth, ch = canvas.clientHeight;
        if (ctx && cw > 0) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          if (canvas.width !== Math.round(cw * dpr)) { canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr); }
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, cw, ch);

          const rayDef = RAY[w.ray];
          const slabs = w.active.map((k, i) => ({ b: BARRIERS.find(x => x.key === k)!, x: SLOT_X[i] }));

          // doğur
          w.spawnAcc += dt * 26;
          while (w.spawnAcc >= 1) {
            w.spawnAcc -= 1;
            w.parts.push({ x: SRC_X, y: 0.5 + (Math.random() - 0.5) * 0.42, vx: SPEED[w.ray] * (0.85 + Math.random() * 0.3), next: 0 });
            w.sent++;
          }

          // ilerlet: her engel merkezinde bir kez zar at (p.next monoton ilerler)
          for (let i = w.parts.length - 1; i >= 0; i--) {
            const p = w.parts[i];
            p.x += p.vx * dt;

            let absorbed = false;
            while (p.next < slabs.length && p.x >= slabs[p.next].x) {
              const s = slabs[p.next];
              p.next++;
              if (Math.random() >= s.b.pass[w.ray]) {
                w.bursts.push({ x: s.x, y: p.y, life: 1, color: rayDef.color });
                absorbed = true;
                break;
              }
            }
            if (absorbed) { w.parts.splice(i, 1); continue; }
            if (p.x >= DET_X) { w.hit++; w.detFlash = 1; w.parts.splice(i, 1); continue; }
            if (p.x > 1.05) w.parts.splice(i, 1);
          }
          if (w.parts.length > 400) w.parts.splice(0, w.parts.length - 400);

          // çiz: ışın izleri
          ctx.lineCap = 'round';
          for (const p of w.parts) {
            const X = p.x * cw, Y = p.y * ch;
            if (w.ray === 'gamma') {
              ctx.strokeStyle = rayDef.color; ctx.globalAlpha = 0.9; ctx.lineWidth = 1.6;
              ctx.beginPath(); ctx.moveTo(X - 11, Y); ctx.lineTo(X, Y); ctx.stroke();
            } else {
              const r = w.ray === 'alpha' ? 3.4 : 2.2;
              ctx.globalAlpha = 0.22; ctx.strokeStyle = rayDef.color; ctx.lineWidth = r * 1.1;
              ctx.beginPath(); ctx.moveTo(X - (w.ray === 'alpha' ? 6 : 10), Y); ctx.lineTo(X, Y); ctx.stroke();
              ctx.globalAlpha = 1; ctx.fillStyle = rayDef.color;
              ctx.beginPath(); ctx.arc(X, Y, r, 0, Math.PI * 2); ctx.fill();
            }
          }

          // soğurma patlamaları
          ctx.globalAlpha = 1;
          for (let i = w.bursts.length - 1; i >= 0; i--) {
            const b = w.bursts[i];
            b.life -= dt * 2.6;
            if (b.life <= 0) { w.bursts.splice(i, 1); continue; }
            ctx.globalAlpha = b.life * 0.8;
            ctx.strokeStyle = b.color; ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.arc(b.x * cw, b.y * ch, (1 - b.life) * 13 + 2, 0, Math.PI * 2); ctx.stroke();
          }

          // dedektör parlaması
          if (w.detFlash > 0) {
            w.detFlash = Math.max(0, w.detFlash - dt * 4.5);
            ctx.globalAlpha = w.detFlash * 0.5;
            ctx.fillStyle = rayDef.color;
            ctx.fillRect(DET_X * cw, 0, cw - DET_X * cw, ch);
          }
          ctx.globalAlpha = 1;
        }
      }

      acc += dt;
      if (acc > 0.14) { acc = 0; setSent(world.current.sent); setHit(world.current.hit); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── engel ekle/çıkar ── */
  const toggle = (k: BarrierKey) =>
    setActive(prev => prev.includes(k) ? prev.filter(x => x !== k) : BARRIERS.map(b => b.key).filter(b => prev.includes(b) || b === k));
  const add = (k: BarrierKey) => setActive(prev => prev.includes(k) ? prev : BARRIERS.map(b => b.key).filter(b => prev.includes(b) || b === k));
  const remove = (k: BarrierKey) => setActive(prev => prev.filter(x => x !== k));

  /* ── sürükleme (pointer; mobil dâhil) ── */
  function onDown(e: React.PointerEvent, key: BarrierKey) {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY };
    setDrag({ key, x: e.clientX, y: e.clientY, moved: false });
  }
  function onMove(e: React.PointerEvent) {
    if (!drag) return;
    const d = Math.hypot(e.clientX - dragStart.current.x, e.clientY - dragStart.current.y);
    setDrag({ ...drag, x: e.clientX, y: e.clientY, moved: drag.moved || d > 8 });
  }
  function onUp(e: React.PointerEvent) {
    if (!drag) return;
    const box = boxRef.current?.getBoundingClientRect();
    if (!drag.moved) toggle(drag.key);
    else if (box && e.clientX >= box.left && e.clientX <= box.right && e.clientY >= box.top && e.clientY <= box.bottom) add(drag.key);
    else remove(drag.key);
    setDrag(null);
  }

  const rayDef = RAY[ray];
  const info = RAY_INFO[ray];

  return (
    <WidgetFrame
      kicker="İNTERAKTİF · SÜRÜKLE"
      title="Kâğıt, folyo, kurşun"
      hint="Engeli kutuya sürükle — ya da üstüne dokun. Dedektöre kaç parçacık ulaşıyor?"
      footnote={<>Geçirgenlikler tipik enerjiler için (α ≈ 5 MeV, β ≈ 1 MeV, γ ≈ 1 MeV). Gerçek zırhlama enerjiye ve geometriye bağlıdır.</>}
    >
      {/* kaynak seçici */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        {(Object.keys(RAY) as RayKey[]).map(k => (
          <button
            key={k}
            onClick={() => setRay(k)}
            aria-pressed={ray === k}
            className={`min-h-[44px] rounded-xl border px-2 py-2 text-sm font-bold transition ${ray === k ? 'text-slate-950' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
            style={ray === k ? { background: RAY[k].color, borderColor: RAY[k].color } : undefined}
          >
            <span className="mr-1.5 font-mono text-base">{RAY[k].symbol}</span>{RAY[k].label}
          </button>
        ))}
      </div>

      {/* beam kutusu */}
      <div ref={boxRef} className="relative h-[190px] overflow-hidden rounded-xl bg-black/45 ring-1 ring-white/5 sm:h-[230px]">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

        {/* kaynak */}
        <div className="absolute inset-y-0 left-0 flex w-[8.5%] items-center justify-center border-r border-white/10 bg-white/[0.03]">
          <span className="rotate-180 text-lg [writing-mode:vertical-rl]" aria-hidden style={{ color: rayDef.color }}>☢</span>
        </div>

        {/* engel dilimleri */}
        {active.map((k, i) => {
          const b = BARRIERS.find(x => x.key === k)!;
          return (
            <button
              key={k}
              onClick={() => remove(k)}
              title={`${b.label} — çıkarmak için dokun`}
              className="group absolute inset-y-2 flex flex-col items-center justify-center rounded-md border border-white/25 bg-slate-300/15 backdrop-blur-[1px] transition hover:border-rose-400/60 hover:bg-rose-400/10"
              style={{ left: `${(SLOT_X[i] - SLAB_W / 2) * 100}%`, width: `${SLAB_W * 100}%` }}
            >
              <span className="text-sm" aria-hidden>{b.icon}</span>
              <span className="sr-only">{b.label} engelini çıkar</span>
              <span className="mt-0.5 hidden text-[0.55rem] font-bold text-rose-300 group-hover:block">✕</span>
            </button>
          );
        })}

        {/* dedektör */}
        <div className="absolute inset-y-0 right-0 flex w-[8.5%] flex-col items-center justify-center border-l border-white/10 bg-white/[0.03]">
          <span className="text-[0.6rem] font-bold tracking-wider text-slate-500 [writing-mode:vertical-rl]">DEDEKTÖR</span>
        </div>

        {active.length === 0 && (
          <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-1 text-[0.68rem] text-slate-400 backdrop-blur">
            engel yok — hepsi geçiyor
          </span>
        )}
      </div>

      {/* ölçüm */}
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
          <div className="font-mono text-lg font-bold text-slate-300">{tr(sent)}</div>
          <div className="text-[0.68rem] text-slate-500">gönderilen</div>
        </div>
        <div className="rounded-xl border p-3 text-center" style={{ borderColor: `color-mix(in srgb, ${rayDef.color} 32%, transparent)`, background: `color-mix(in srgb, ${rayDef.color} 10%, transparent)` }}>
          <div className="font-mono text-lg font-bold" style={{ color: rayDef.color }}>{tr(hit)}</div>
          <div className="text-[0.68rem] text-slate-500">ulaşan</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
          <div className="font-mono text-lg font-bold text-white">{observed === null ? '—' : `%${tr(observed * 100, 1)}`}</div>
          <div className="text-[0.68rem] text-slate-500">ölçülen · beklenen %{tr(expected * 100, 1)}</div>
        </div>
      </div>

      {/* engel tepsisi */}
      <div className="mt-3">
        <div className="mb-2 text-xs text-slate-500">Engelleri kutuya sürükle ya da dokun:</div>
        <div className="grid grid-cols-3 gap-2.5" onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => setDrag(null)}>
          {BARRIERS.map(b => {
            const on = active.includes(b.key);
            const pass = b.pass[ray];
            return (
              <button
                key={b.key}
                onPointerDown={e => onDown(e, b.key)}
                aria-pressed={on}
                className={`min-h-[64px] touch-none select-none rounded-xl border p-2.5 text-center transition ${
                  on ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'
                } ${drag?.key === b.key && drag.moved ? 'opacity-40' : ''}`}
              >
                <div className="text-lg" aria-hidden>{b.icon}</div>
                <div className="text-xs font-bold text-white">{b.label}</div>
                <div className="text-[0.6rem] leading-tight text-slate-500">{b.spec}</div>
                <div className="mt-1 font-mono text-[0.6rem]" style={{ color: pass > 0.5 ? RAY[ray].color : pass > 0 ? '#fbbf24' : '#f43f5e' }}>
                  {pass === 0 ? 'durdurur' : `%${tr(pass * 100, pass < 0.1 ? 1 : 0)} geçer`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* açıklama */}
      <div className="mt-3 rounded-xl border p-3.5" style={{ borderColor: `color-mix(in srgb, ${rayDef.color} 26%, transparent)`, background: `color-mix(in srgb, ${rayDef.color} 6%, transparent)` }}>
        <p className="text-sm leading-relaxed text-slate-300">
          <strong style={{ color: rayDef.color }}>{rayDef.label} ({rayDef.symbol})</strong> — {info.mass}, menzil {info.range}. {info.note}
        </p>
      </div>

      {active.length > 0 && (
        <div className="mt-2 flex justify-end">
          <ActionButton onClick={() => setActive([])} tone="ghost">↺ Engelleri kaldır</ActionButton>
        </div>
      )}

      {/* sürükleme hayaleti */}
      {drag?.moved && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/30 bg-slate-800/90 px-3 py-2 text-center shadow-2xl backdrop-blur"
          style={{ left: drag.x, top: drag.y }}>
          <div className="text-lg" aria-hidden>{BARRIERS.find(b => b.key === drag.key)!.icon}</div>
          <div className="text-[0.65rem] font-bold text-white">{BARRIERS.find(b => b.key === drag.key)!.label}</div>
        </div>
      )}
    </WidgetFrame>
  );
}
