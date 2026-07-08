'use client';

// "Sıfırdan Fizik" makalesine ÖZEL, AÇIK TEMA interaktif simülasyonlar + veri.
// Bu makale ArticleShell (koyu) KULLANMAZ; kendi açık temasını taşır.
import { useEffect, useRef, useState } from 'react';

export { refs } from './refs';

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const f = (n: number, d = 1) => (isFinite(n) ? n.toFixed(d).replace('.', ',') : '—');

// açık tema renk paleti
export const C = {
  blue: '#2563eb', green: '#16a34a', orange: '#ea580c', violet: '#7c3aed',
  amber: '#d97706', cyan: '#0891b2', red: '#dc2626', ink: '#0f172a', muted: '#475569',
};

/* ════════════ HERO ARKA PLANI: zıplayan toplar (hareket + yerçekimi) ════════════ */

export function BouncingHero() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const reduce = reduced();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0, h = 0, raf = 0;
    const cols = ['#2563eb', '#16a34a', '#ea580c', '#7c3aed', '#0891b2', '#d97706'];
    type B = { x: number; y: number; vx: number; vy: number; r: number; c: string };
    let bs: B[] = [];
    const init = () => { bs = Array.from({ length: 14 }, (_, i) => ({ x: Math.random() * w, y: Math.random() * h * 0.5, vx: (Math.random() - 0.5) * 3, vy: Math.random() * 2, r: 8 + Math.random() * 16, c: cols[i % cols.length] })); };
    const resize = () => { w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); if (!bs.length) init(); };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const b of bs) {
        b.vy += 0.18; b.x += b.vx; b.y += b.vy;
        if (b.y + b.r > h) { b.y = h - b.r; b.vy *= -0.82; }
        if (b.x - b.r < 0) { b.x = b.r; b.vx *= -1; } else if (b.x + b.r > w) { b.x = w - b.r; b.vx *= -1; }
        if (Math.abs(b.vy) < 0.4 && b.y + b.r >= h - 1) b.vy = -(3 + Math.random() * 4);
        ctx.globalAlpha = 0.55; ctx.fillStyle = b.c; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.9; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.28, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    resize(); window.addEventListener('resize', resize);
    if (reduce) draw(); else raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />;
}

/* ════════════ 1. Kütle vs Ağırlık (+ yerçekimi) ════════════ */

const PLANETS = [
  { name: 'Dünya', g: 9.8, icon: '🌍' }, { name: 'Ay', g: 1.6, icon: '🌙' },
  { name: 'Mars', g: 3.7, icon: '🔴' }, { name: 'Jüpiter', g: 24.8, icon: '🪐' }, { name: 'Uzay', g: 0, icon: '🚀' },
];
export function MassWeightScale() {
  const [mass, setMass] = useState(10);
  const [pi, setPi] = useState(0);
  const g = PLANETS[pi].g;
  const weight = mass * g;
  const barPct = Math.min(100, (weight / (mass * 24.8)) * 100 || 0);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {PLANETS.map((p, i) => (
          <button key={p.name} onClick={() => setPi(i)} className="rounded-full px-3 py-1.5 text-sm font-semibold transition" style={pi === i ? { background: C.green, color: '#fff' } : { background: '#f1f5f9', color: C.ink }}>{p.icon} {p.name}</button>
        ))}
      </div>
      <label className="block">
        <span className="flex justify-between text-sm"><span className="text-slate-600">Kütle</span><span className="font-mono font-bold" style={{ color: C.green }}>{f(mass, 0)} kg</span></span>
        <input type="range" min={1} max={100} value={mass} onChange={(e) => setMass(+e.target.value)} className="mt-2 w-full" style={{ accentColor: C.green }} aria-label="Kütle" />
      </label>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border-2 p-4 text-center" style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}>
          <div className="text-xs text-slate-500">KÜTLE (her yerde AYNI)</div>
          <div className="mt-1 font-mono text-2xl font-black" style={{ color: C.green }}>{f(mass, 0)} kg</div>
          <div className="text-xs text-slate-500">içindeki madde miktarı</div>
        </div>
        <div className="rounded-xl border-2 p-4 text-center" style={{ borderColor: '#fed7aa', background: '#fff7ed' }}>
          <div className="text-xs text-slate-500">AĞIRLIK (gezegene göre DEĞİŞİR)</div>
          <div className="mt-1 font-mono text-2xl font-black" style={{ color: C.orange }}>{f(weight, 0)} N</div>
          <div className="text-xs text-slate-500">yerçekiminin çekme kuvveti (g = {f(g)})</div>
        </div>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-all" style={{ width: barPct + '%', background: C.orange }} /></div>
      <p className="mt-3 text-center text-xs text-slate-500">Aynı kütle, farklı gezegen → farklı ağırlık. Ay'da daha az çekilirsin ama <strong style={{ color: C.green }}>içindeki madde</strong> değişmez. Uzayda ağırlığın 0, ama kütlen aynı.</p>
    </div>
  );
}

/* ════════════ 2. Kuvvet ve F = m·a (merkez) ════════════ */

export function ForceLab() {
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef({ x: 0, v: 0, running: false });
  const [mass, setMass] = useState(4);
  const [force, setForce] = useState(20);
  const [running, setRunning] = useState(false);
  const [vDisp, setVDisp] = useState(0);
  const mRef = useRef(mass), fRef = useRef(force);
  mRef.current = mass; fRef.current = force;
  const a = force / mass;

  useEffect(() => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let raf = 0;
    const resize = () => { c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    const loop = () => {
      const W = c.clientWidth, H = c.clientHeight;
      const s = st.current;
      const acc = fRef.current / mRef.current;
      if (s.running) { s.v += acc * 0.03; s.x += s.v * 0.9; if (s.x > W - 120) { s.running = false; setRunning(false); } setVDisp(s.v); }
      ctx.clearRect(0, 0, W, H);
      // zemin
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(0, H - 24, W, 24);
      for (let i = 0; i < W; i += 40) { ctx.fillStyle = '#cbd5e1'; ctx.fillRect(i - (s.x % 40), H - 24, 2, 24); }
      // kutu (kütle ile boyu artar)
      const bs = 34 + mRef.current * 3.2;
      const bx = 20 + s.x, by = H - 24 - bs;
      ctx.fillStyle = C.blue; ctx.fillRect(bx, by, bs, bs);
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(mRef.current + ' kg', bx + bs / 2, by + bs / 2 + 4);
      // kuvvet oku
      const al = 18 + fRef.current * 0.9;
      ctx.strokeStyle = C.orange; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bx - al, by + bs / 2); ctx.lineTo(bx - 4, by + bs / 2); ctx.stroke();
      ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(bx - 2, by + bs / 2); ctx.lineTo(bx - 12, by + bs / 2 - 7); ctx.lineTo(bx - 12, by + bs / 2 + 7); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.orange; ctx.font = 'bold 12px system-ui'; ctx.fillText('F', bx - al - 10, by + bs / 2 + 4);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  const push = () => { const s = st.current; if (s.running) { s.running = false; setRunning(false); return; } s.x = 0; s.v = 0; setVDisp(0); s.running = true; setRunning(true); };
  const reset = () => { const s = st.current; s.x = 0; s.v = 0; s.running = false; setRunning(false); setVDisp(0); };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <canvas ref={cv} className="h-40 w-full rounded-xl" style={{ background: '#f8fafc' }} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="flex justify-between text-sm"><span className="text-slate-600">Kütle (m)</span><span className="font-mono font-bold" style={{ color: C.blue }}>{mass} kg</span></span>
          <input type="range" min={1} max={20} value={mass} onChange={(e) => setMass(+e.target.value)} className="mt-2 w-full" style={{ accentColor: C.blue }} aria-label="Kütle" />
        </label>
        <label className="block">
          <span className="flex justify-between text-sm"><span className="text-slate-600">Kuvvet (F)</span><span className="font-mono font-bold" style={{ color: C.orange }}>{force} N</span></span>
          <input type="range" min={0} max={100} value={force} onChange={(e) => setForce(+e.target.value)} className="mt-2 w-full" style={{ accentColor: C.orange }} aria-label="Kuvvet" />
        </label>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border-2 border-orange-100 bg-orange-50 p-3"><div className="text-xs text-slate-500">Kuvvet</div><div className="font-mono text-lg font-black" style={{ color: C.orange }}>{force} N</div></div>
        <div className="rounded-xl border-2 border-blue-100 bg-blue-50 p-3"><div className="text-xs text-slate-500">İvme (a = F ÷ m)</div><div className="font-mono text-lg font-black" style={{ color: C.blue }}>{f(a, 1)} m/s²</div></div>
        <div className="rounded-xl border-2 border-slate-100 bg-slate-50 p-3"><div className="text-xs text-slate-500">Hız</div><div className="font-mono text-lg font-black text-slate-700">{f(vDisp, 1)}</div></div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <button onClick={push} className="rounded-full px-5 py-2 text-sm font-bold text-white transition" style={{ background: running ? C.red : C.orange }}>{running ? '⏸ Durdur' : '▶ İt (kuvvet uygula)'}</button>
        <button onClick={reset} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50">↺ Sıfırla</button>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500"><strong style={{ color: C.blue }}>F = m × a.</strong> Aynı kuvveti ağır kutuya uygula → daha yavaş hızlanır. <strong>1 Newton</strong> = 1 kg'ı 1 m/s² ivmelendiren kuvvettir.</p>
    </div>
  );
}

/* ════════════ 3. Hareket: hız, sürat, ivme ════════════ */

export function MotionSim() {
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef({ t: 0, running: false });
  const [v0, setV0] = useState(6);
  const [acc, setAcc] = useState(2);
  const [running, setRunning] = useState(false);
  const [disp, setDisp] = useState({ x: 0, v: v0, t: 0 });
  const v0R = useRef(v0), aR = useRef(acc);
  v0R.current = v0; aR.current = acc;
  useEffect(() => {
    const c = cv.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let raf = 0;
    const resize = () => { c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    const loop = () => {
      const W = c.clientWidth, H = c.clientHeight, s = st.current;
      if (s.running) { s.t += 0.03; }
      const t = s.t, v = v0R.current + aR.current * t, x = v0R.current * t + 0.5 * aR.current * t * t;
      if (s.running) setDisp({ x, v, t });
      const px = (x * 6) % (W + 80);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(0, H - 20, W, 20);
      for (let i = 0; i < W + 80; i += 60) { ctx.fillStyle = '#cbd5e1'; ctx.fillRect(i - (px % 60), H - 20, 3, 20); }
      // araba
      const cx = 30 + px, cy = H - 20;
      ctx.fillStyle = C.cyan; ctx.fillRect(cx, cy - 26, 52, 18); ctx.fillStyle = '#0e7490'; ctx.fillRect(cx + 8, cy - 34, 30, 10);
      ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.arc(cx + 13, cy - 6, 7, 0, Math.PI * 2); ctx.arc(cx + 40, cy - 6, 7, 0, Math.PI * 2); ctx.fill();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop); window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  const toggle = () => { const s = st.current; if (s.running) { s.running = false; setRunning(false); } else { if (s.t > 12) { s.t = 0; } s.running = true; setRunning(true); } };
  const reset = () => { st.current.t = 0; st.current.running = false; setRunning(false); setDisp({ x: 0, v: v0, t: 0 }); };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <canvas ref={cv} className="h-36 w-full rounded-xl" style={{ background: '#f8fafc' }} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="flex justify-between text-sm"><span className="text-slate-600">Başlangıç hızı (v₀)</span><span className="font-mono font-bold" style={{ color: C.cyan }}>{v0} m/s</span></span>
          <input type="range" min={-8} max={12} value={v0} onChange={(e) => setV0(+e.target.value)} className="mt-2 w-full" style={{ accentColor: C.cyan }} aria-label="Başlangıç hızı" />
        </label>
        <label className="block">
          <span className="flex justify-between text-sm"><span className="text-slate-600">İvme (a)</span><span className="font-mono font-bold" style={{ color: C.violet }}>{f(acc)} m/s²</span></span>
          <input type="range" min={-4} max={6} step={0.5} value={acc} onChange={(e) => setAcc(+e.target.value)} className="mt-2 w-full" style={{ accentColor: C.violet }} aria-label="İvme" />
        </label>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
        <div className="rounded-xl border-2 border-cyan-100 bg-cyan-50 p-3"><div className="text-xs text-slate-500">Hız (yönlü)</div><div className="font-mono text-lg font-black" style={{ color: C.cyan }}>{f(disp.v)}</div><div className="text-[0.6rem] text-slate-500">m/s · {disp.v >= 0 ? 'ileri →' : '← geri'}</div></div>
        <div className="rounded-xl border-2 border-slate-100 bg-slate-50 p-3"><div className="text-xs text-slate-500">Sürat (yönsüz)</div><div className="font-mono text-lg font-black text-slate-700">{f(Math.abs(disp.v))}</div><div className="text-[0.6rem] text-slate-500">m/s</div></div>
        <div className="rounded-xl border-2 border-violet-100 bg-violet-50 p-3"><div className="text-xs text-slate-500">Konum</div><div className="font-mono text-lg font-black" style={{ color: C.violet }}>{f(disp.x, 0)}</div><div className="text-[0.6rem] text-slate-500">metre</div></div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <button onClick={toggle} className="rounded-full px-5 py-2 text-sm font-bold text-white" style={{ background: running ? C.red : C.cyan }}>{running ? '⏸ Durdur' : '▶ Başlat'}</button>
        <button onClick={reset} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">↺ Sıfırla</button>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500"><strong style={{ color: C.cyan }}>Hız</strong> yön içerir (vektör), <strong>sürat</strong> yalnızca büyüklüktür. <strong style={{ color: C.violet }}>İvme</strong> ise hızın ne kadar hızlı değiştiğidir — ivme varsa hız sürekli değişir.</p>
    </div>
  );
}

/* ════════════ 4. Momentum ve korunumu (çarpışma) ════════════ */

export function MomentumCollision() {
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef({ x1: 0, x2: 0, v1: 0, v2: 0, phase: 'idle' as 'idle' | 'run' | 'done', vf: 0 });
  const [m1, setM1] = useState(2); const [m2, setM2] = useState(4);
  const [iv1, setIv1] = useState(5); const [iv2, setIv2] = useState(-1);
  const [phase, setPhase] = useState<'idle' | 'run' | 'done'>('idle');
  const refIn = useRef({ m1, m2, iv1, iv2 }); refIn.current = { m1, m2, iv1, iv2 };
  const pBefore = m1 * iv1 + m2 * iv2;
  const vf = pBefore / (m1 + m2);
  useEffect(() => {
    const c = cv.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let raf = 0;
    const resize = () => { c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    const size = (m: number) => 24 + m * 8;
    const draw = () => {
      const W = c.clientWidth, H = c.clientHeight, s = st.current, IN = refIn.current, y = H - 22;
      if (s.phase === 'run') {
        s.x1 += s.v1 * 0.6; s.x2 += s.v2 * 0.6;
        const s1 = size(IN.m1), s2 = size(IN.m2);
        if (s.x1 + s1 >= s.x2 && s.x1 < s.x2) { s.v1 = s.vf; s.v2 = s.vf; s.phase = 'done'; setPhase('done'); }
      } else if (s.phase === 'done') { s.x1 += s.v1 * 0.6; s.x2 += s.v2 * 0.6; }
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(0, y + 18, W, 6);
      const drawCart = (x: number, m: number, col: string, label: string) => {
        const sz = size(m); ctx.fillStyle = col; ctx.fillRect(x, y - sz + 18, sz, sz);
        ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(x + sz * 0.25, y + 18, 5, 0, Math.PI * 2); ctx.arc(x + sz * 0.75, y + 18, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText(label, x + sz / 2, y - sz / 2 + 22);
      };
      drawCart(s.x1, IN.m1, C.violet, IN.m1 + 'kg');
      drawCart(s.x2, IN.m2, C.blue, IN.m2 + 'kg');
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw); window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  const run = () => {
    const c = cv.current; if (!c) return; const W = c.clientWidth; const s = st.current;
    s.x1 = 30; s.x2 = W - 30 - (24 + m2 * 8); s.v1 = iv1; s.v2 = iv2; s.vf = vf; s.phase = 'run'; setPhase('run');
  };
  const reset = () => { st.current.phase = 'idle'; setPhase('idle'); };
  const Slider = ({ label, val, set, min, max, col }: { label: string; val: number; set: (n: number) => void; min: number; max: number; col: string }) => (
    <label className="block"><span className="flex justify-between text-xs"><span className="text-slate-600">{label}</span><span className="font-mono font-bold" style={{ color: col }}>{val}</span></span>
      <input type="range" min={min} max={max} value={val} onChange={(e) => set(+e.target.value)} className="mt-1 w-full" style={{ accentColor: col }} aria-label={label} /></label>
  );
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <canvas ref={cv} className="h-32 w-full rounded-xl" style={{ background: '#f8fafc' }} />
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
        <Slider label="Mor kütle (kg)" val={m1} set={setM1} min={1} max={8} col={C.violet} />
        <Slider label="Mavi kütle (kg)" val={m2} set={setM2} min={1} max={8} col={C.blue} />
        <Slider label="Mor hız (m/s)" val={iv1} set={setIv1} min={0} max={8} col={C.violet} />
        <Slider label="Mavi hız (m/s)" val={iv2} set={setIv2} min={-8} max={0} col={C.blue} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl border-2 border-slate-100 bg-slate-50 p-3"><div className="text-xs text-slate-500">Toplam momentum ÖNCE</div><div className="font-mono text-lg font-black text-slate-700">{f(pBefore, 0)} kg·m/s</div></div>
        <div className="rounded-xl border-2 p-3" style={{ borderColor: '#e9d5ff', background: '#faf5ff' }}><div className="text-xs text-slate-500">SONRA (yapışıp beraber)</div><div className="font-mono text-lg font-black" style={{ color: C.violet }}>{f(pBefore, 0)} kg·m/s</div></div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <button onClick={run} disabled={phase === 'run'} className="rounded-full px-5 py-2 text-sm font-bold text-white disabled:opacity-40" style={{ background: C.violet }}>💥 Çarpıştır</button>
        <button onClick={reset} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">↺ Sıfırla</button>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500"><strong style={{ color: C.violet }}>Momentum = kütle × hız.</strong> Çarpışmadan önceki toplam momentum, sonrakine <strong>eşittir</strong> — momentum korunur. İkisi yapışınca ortak hız = toplam momentum ÷ toplam kütle.</p>
    </div>
  );
}

/* ════════════ 5. Enerji: kinetik ↔ potansiyel (rampa) ════════════ */

export function EnergyRamp() {
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef({ s: 0, v: 0, running: false });
  const [running, setRunning] = useState(false);
  const [bars, setBars] = useState({ pe: 100, ke: 0 });
  useEffect(() => {
    const c = cv.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let raf = 0;
    const resize = () => { c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    const loop = () => {
      const W = c.clientWidth, H = c.clientHeight, s = st.current;
      // rampa: sol üstten sağ alta eğri (çeyrek daire benzeri)
      const x0 = 30, y0 = 24, x1 = W - 30, y1 = H - 28;
      const path = (u: number) => { const x = x0 + (x1 - x0) * u; const yy = y1 - (y1 - y0) * Math.cos(u * Math.PI / 2); return { x, y: yy }; };
      if (s.running) { const slope = Math.sin((s.s) * Math.PI / 2); s.v += (0.35 * slope + 0.06); s.s += s.v * 0.006; if (s.s >= 1) { s.s = 1; s.running = false; setRunning(false); } const h = Math.cos(s.s * Math.PI / 2); setBars({ pe: Math.round(h * 100), ke: Math.round((1 - h) * 100) }); }
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 4; ctx.beginPath();
      for (let u = 0; u <= 1.001; u += 0.02) { const p = path(u); if (u === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); } ctx.stroke();
      ctx.fillStyle = '#cbd5e1'; ctx.fillRect(0, y1 + 2, W, 6);
      const p = path(Math.min(1, s.s));
      ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(p.x, p.y - 10, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(p.x - 3, p.y - 13, 3, 0, Math.PI * 2); ctx.fill();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop); window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  const drop = () => { const s = st.current; s.s = 0; s.v = 0; s.running = true; setRunning(true); setBars({ pe: 100, ke: 0 }); };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <canvas ref={cv} className="h-40 w-full rounded-xl" style={{ background: '#f8fafc' }} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex justify-between text-xs"><span style={{ color: C.green }}>Potansiyel enerji (yükseklik)</span><span className="font-mono">{bars.pe}%</span></div>
          <div className="h-4 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: bars.pe + '%', background: C.green }} /></div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs"><span style={{ color: C.orange }}>Kinetik enerji (hız)</span><span className="font-mono">{bars.ke}%</span></div>
          <div className="h-4 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: bars.ke + '%', background: C.orange }} /></div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <button onClick={drop} className="rounded-full px-5 py-2 text-sm font-bold text-white" style={{ background: C.amber }}>🎢 Topu bırak</button>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">Top yukarıdayken tüm enerji <strong style={{ color: C.green }}>potansiyeldir</strong> (yükseklikte gizli). İnerken bu enerji <strong style={{ color: C.orange }}>kinetiğe</strong> (harekete) dönüşür. Toplam enerji sabit kalır — enerji yoktan var olmaz, yalnızca biçim değiştirir.</p>
    </div>
  );
}

/* ════════════ VERİ: sözlük · birimler · quiz ════════════ */

export const glossary: { term: string; unit: string; cat: keyof typeof C; def: string; ex: string }[] = [
  { term: 'Kütle', unit: 'kg', cat: 'green', def: 'Bir cismin içindeki madde miktarı. Nerede olursan ol değişmez.', ex: '1 litre su ≈ 1 kg.' },
  { term: 'Ağırlık', unit: 'N', cat: 'orange', def: 'Yerçekiminin kütleye uyguladığı çekim kuvveti. Ağırlık = kütle × g.', ex: "Ay'da ağırlığın Dünya'nın ~1/6'sı." },
  { term: 'Kuvvet', unit: 'N', cat: 'orange', def: 'Bir cismi itmek, çekmek, hızlandırmak, yavaşlatmak ya da yönünü değiştirmek. F = m·a.', ex: 'Kapıyı itmek, topu tekmelemek.' },
  { term: 'Newton', unit: 'N', cat: 'blue', def: "Kuvvetin birimi. 1 N, 1 kg'ı 1 m/s² ivmelendiren kuvvettir.", ex: "Bir elmanın ağırlığı ~1 N." },
  { term: 'İvme', unit: 'm/s²', cat: 'violet', def: 'Hızın zamanla ne kadar hızlı değiştiği. Hızlanma da yavaşlama da ivmedir.', ex: 'Gaza basınca araba ivmelenir.' },
  { term: 'Hız', unit: 'm/s', cat: 'cyan', def: 'Yön içeren yer değiştirme oranı (vektör). Hem büyüklüğü hem yönü vardır.', ex: '"Kuzeye 20 m/s" bir hızdır.' },
  { term: 'Sürat', unit: 'm/s', cat: 'cyan', def: 'Hızın yalnızca büyüklüğü (skaler); yön bilgisi yoktur.', ex: '"20 m/s" bir sürattir.' },
  { term: 'Momentum', unit: 'kg·m/s', cat: 'violet', def: 'Hareketin "durdurulması zorluğu"; kütle × hız. Çarpışmalarda korunur.', ex: 'Ağır kamyon yavaş bile olsa büyük momentumludur.' },
  { term: 'Kinetik enerji', unit: 'J', cat: 'orange', def: 'Hareket enerjisi. ½ × kütle × hız². Hız arttıkça kareyle artar.', ex: 'Hızlı topun çarpması daha çok acıtır.' },
  { term: 'Potansiyel enerji', unit: 'J', cat: 'green', def: 'Konumda "gizli" enerji. Yerçekiminde: kütle × g × yükseklik.', ex: 'Yüksekteki su, aşağı düşünce iş yapabilir.' },
  { term: 'İş', unit: 'J', cat: 'amber', def: 'Kuvvet × yol. Bir kuvvet cismi hareket ettirdiğinde iş yapılır.', ex: 'Çantayı yukarı kaldırmak iştir.' },
  { term: 'Güç', unit: 'W', cat: 'red', def: 'Birim zamanda yapılan iş. 1 watt = saniyede 1 joule.', ex: 'Güçlü motor aynı işi daha hızlı yapar.' },
  { term: 'Enerji', unit: 'J', cat: 'amber', def: 'İş yapabilme kapasitesi. Yoktan var olmaz, yalnızca biçim değiştirir (korunum).', ex: 'Potansiyel → kinetik → ısı.' },
  { term: 'Sürtünme', unit: 'N', cat: 'red', def: 'Yüzeyler arasında harekete karşı koyan kuvvet. Hareketi yavaşlatır, ısı üretir.', ex: 'Buzda kaymak: az sürtünme.' },
  { term: 'Yerçekimi', unit: 'm/s²', cat: 'blue', def: 'Kütleli her şeyin birbirini çekmesi. Dünya yüzeyinde g ≈ 9,8 m/s².', ex: 'Bırakılan cisim aşağı düşer.' },
  { term: 'Atalet', unit: '—', cat: 'blue', def: 'Cismin hareket durumunu koruma eğilimi (Newton 1). Duran durur, giden gider.', ex: 'Ani frende öne savrulman.' },
  { term: 'Etki-Tepki', unit: '—', cat: 'green', def: 'Her kuvvete eşit ve zıt bir tepki vardır (Newton 3).', ex: 'Roketin gazı iter, roket ileri gider.' },
  { term: 'Vektör / Skaler', unit: '—', cat: 'violet', def: 'Vektör: yön içeren büyüklük (hız, kuvvet). Skaler: yönsüz (sürat, kütle, enerji).', ex: 'Kuvvet vektör, sıcaklık skalerdir.' },
];

export const units = [
  ['Kütle', 'kilogram (kg)', 'içindeki madde'],
  ['Kuvvet / Ağırlık', 'newton (N)', 'itme-çekme; 1 N = 1 kg·m/s²'],
  ['Hız / Sürat', 'm/s', 'saniyede kaç metre'],
  ['İvme', 'm/s²', 'hızın saniyedeki değişimi'],
  ['Momentum', 'kg·m/s', 'kütle × hız'],
  ['Enerji / İş', 'joule (J)', '1 J = 1 N·m'],
  ['Güç', 'watt (W)', '1 W = 1 J/s'],
];

export const quizQs = [
  { text: "Kütle ile ağırlık arasındaki temel fark nedir?", opts: ['Aynı şeydir', 'Kütle madde miktarıdır (hep aynı), ağırlık yerçekimi kuvvetidir (gezegene göre değişir)', 'Ağırlık her yerde aynıdır', 'Kütlenin birimi newton'], a: 1, exp: "Kütlen Ay'da da aynıdır; ama daha az çekildiğin için ağırlığın azalır." },
  { text: "F = m·a neyi söyler?", opts: ['Kuvvet = kütle bölü ivme', 'Kuvvet = kütle × ivme', 'Kütle = kuvvet × ivme', 'İvme = kuvvet × kütle'], a: 1, exp: "Aynı kuvvet, daha büyük kütleye daha küçük ivme verir." },
  { text: "1 Newton nedir?", opts: ['1 kg kütle', "1 kg'ı 1 m/s² ivmelendiren kuvvet", '1 joule enerji', '1 metre yol'], a: 1, exp: "Newton kuvvetin birimidir: 1 N = 1 kg·m/s². Bir elma ~1 N ağırlığındadır." },
  { text: "Hız ile sürat farkı nedir?", opts: ['Fark yoktur', 'Hız yön içerir (vektör), sürat yalnızca büyüklüktür (skaler)', 'Sürat daha hızlıdır', 'Hız sadece arabalar için'], a: 1, exp: "'Kuzeye 20 m/s' hız; '20 m/s' sürattir." },
  { text: "Çarpışmada momentum ne olur?", opts: ['Yok olur', 'Korunur — toplam momentum önce ve sonra aynıdır', 'İkiye katlanır', 'Sadece hızlı cisimde kalır'], a: 1, exp: "Momentum = kütle × hız; kapalı sistemde toplamı sabittir." },
  { text: "Yukarıdaki top aşağı inerken enerjisine ne olur?", opts: ['Yok olur', 'Potansiyel enerji kinetik enerjiye dönüşür; toplam sabit kalır', 'İkiye katlanır', 'Isıya dönüşüp biter'], a: 1, exp: "Enerji yoktan var olmaz; yalnızca biçim değiştirir (enerjinin korunumu)." },
];
