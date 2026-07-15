'use client';

// PERDE 4 — GECE ROTASI (22 Nisan 1453). Zincir kırılamadı, aşıldı: gemiler bir
// gecede karadan yürütüldü. Mekanizma: ilerleme = devam etme dürtüsü. Okur rotayı
// bitirmek için sürükler; sürüklediği için hikâyeyi de bitirir.
//
// GSAP scroll-pin YOK (makalede zaten hero + yatay çizelge pinli; 3. pin mobil
// scroll'u dondurur — bkz. Alesia/PowerAnatomy). Bunun yerine: görünürken kendi
// kendine oynar + elle sürüklenir. Aynı "rota çiziliyor" etkisi, kırılganlık yok.

import { useEffect, useMemo, useRef, useState } from 'react';
import { ACCENT, GOLD, MARBLE, WATER, ASH, BG, prefersReduced, clamp, tr, clock } from './ui';
import { NIGHT } from './data';

// Rota: Boğaz kıyısından (sağ) Galata sırtından (üst) Haliç'e (sol, zincirin ardı).
const ROUTE: [number, number][] = [
  [268, 158], [244, 132], [214, 96], [178, 70], [150, 62], [120, 74], [98, 104], [82, 140], [72, 162],
];

function cumulative(pts: [number, number][]) {
  const segLen: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    segLen.push(d); total += d;
  }
  return { segLen, total };
}

export default function NightRoute() {
  const [p, setP] = useState(0);
  const [playing, setPlaying] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const raf = useRef(0);

  const { segLen, total } = useMemo(() => cumulative(ROUTE), []);

  const pointAt = useMemo(() => (t: number): [number, number] => {
    const target = clamp(t, 0, 1) * total;
    let acc = 0;
    for (let i = 0; i < segLen.length; i++) {
      if (acc + segLen[i] >= target) {
        const f = segLen[i] === 0 ? 0 : (target - acc) / segLen[i];
        const a = ROUTE[i], b = ROUTE[i + 1];
        return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      }
      acc += segLen[i];
    }
    return ROUTE[ROUTE.length - 1];
  }, [segLen, total]);

  // Reduced-motion → doğrudan son kare.
  useEffect(() => { if (prefersReduced()) { setP(1); setPlaying(false); } }, []);

  // Görünürlük: ekran dışında otomatik oynatmayı GERÇEKTEN durdur (state → efekt
  // yeniden çalışır → rAF döngüsü sökülür; geri görününce yeniden başlar).
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '-10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Otomatik ilerleme (rAF): yalnız oynarken + görünürken. Ekran dışına çıkınca
  // efekt cleanup rAF'ı iptal eder; geri girince yeniden kurulur. p kaldığı yerden.
  useEffect(() => {
    if (!playing || !visible) return;
    let last = 0;
    const tick = (now: number) => {
      if (!last) last = now;
      const dt = (now - last) / 1000; last = now;
      setP((v) => Math.min(1, v + dt / 9)); // ~9 sn tam rota
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, visible]);

  // Rota bitince oynatmayı durdur (state güncellemesi ayrı efektte — updater saf kalır).
  useEffect(() => { if (p >= 1 && playing) setPlaying(false); }, [p, playing]);

  const dist = Math.round(p * NIGHT.distanceM);
  const hour = NIGHT.fromHour + p * (NIGHT.toHour - NIGHT.fromHour);
  const dashOffset = (1 - p) * total;
  const chainDead = p >= 0.995;

  const stage = [...NIGHT.stages].reverse().find((s) => p >= s.at) ?? NIGHT.stages[0];
  const convoy = [0, 0.06, 0.12, 0.18].map((off) => p - off).filter((t) => t >= 0).map(pointAt);

  const go = (v: number) => { setP(v); setPlaying(false); };

  return (
    <figure ref={rootRef} className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.04] p-4 pb-7 shadow-[0_0_60px_-15px_rgba(55,176,184,0.35)] backdrop-blur sm:p-5">
      <figcaption className="mb-4">
        <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: WATER }}>İNTERAKTİF · 22 NİSAN 1453 · GECE</div>
        <h3 className="text-base font-bold leading-snug text-white sm:text-lg">Zincir kırılamadı. Aşıldı.</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">Kendi kendine oynar; sürgüyü çekip elle de gezebilirsin. Rotayı bitir — hikâye de biter.</p>
      </figcaption>

      {/* Sayaçlar */}
      <div className="mb-2 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-center">
          <div className="font-mono text-lg font-black" style={{ color: WATER }}>{tr(dist)}<span className="ml-1 text-xs text-slate-500">/ {tr(NIGHT.distanceM)} m</span></div>
          <div className="text-[0.6rem] text-slate-500">karada alınan yol</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-center">
          <div className="font-mono text-lg font-black" style={{ color: GOLD }}>{clock(hour)}</div>
          <div className="text-[0.6rem] text-slate-500">gece saati</div>
        </div>
      </div>

      {/* Harita */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-2">
        <svg viewBox="0 0 320 220" className="w-full" role="img" aria-label={`Gece rotası: ${Math.round(p * 100)}% tamamlandı, ${tr(dist)} m, saat ${clock(hour)}`}>
          {/* Su */}
          <rect x="0" y="0" width="320" height="220" fill={`color-mix(in srgb, ${WATER} 12%, ${BG})`} />
          {/* Şehir kütlesi (alt) */}
          <path d="M0 175 Q90 165 150 178 T320 172 L320 220 L0 220 Z" fill={`color-mix(in srgb, ${MARBLE} 7%, ${BG})`} />
          <text x="150" y="205" textAnchor="middle" style={{ fontSize: 8, fill: 'rgba(255,255,255,0.45)' }}>Konstantinopolis (surlar)</text>
          {/* Galata kütlesi (üst orta) */}
          <path d="M96 40 Q160 24 224 44 Q210 92 150 100 Q104 90 96 40 Z" fill={`color-mix(in srgb, ${MARBLE} 6%, ${BG})`} stroke="rgba(255,255,255,0.08)" />
          <text x="160" y="62" textAnchor="middle" style={{ fontSize: 8, fill: 'rgba(255,255,255,0.4)' }}>Galata sırtı</text>
          {/* Etiketler: Boğaz / Haliç */}
          <text x="286" y="150" textAnchor="middle" style={{ fontSize: 8, fill: `color-mix(in srgb, ${WATER} 80%, white)` }}>Boğaz</text>
          <text x="44" y="150" textAnchor="middle" style={{ fontSize: 8, fill: `color-mix(in srgb, ${WATER} 80%, white)` }}>Haliç</text>

          {/* Zincir — Haliç ağzında */}
          <g style={{ transition: prefersReduced() ? 'none' : 'all 0.6s ease' }}>
            <line x1="60" y1="176" x2="96" y2="120" stroke={chainDead ? ASH : MARBLE} strokeWidth={chainDead ? 1.5 : 2.5} strokeDasharray="2 5" style={{ opacity: chainDead ? 0.4 : 1 }} />
            {[0, 1, 2, 3].map((k) => (
              <circle key={k} cx={60 + k * 9} cy={176 - k * 14} r="2.4" fill={chainDead ? ASH : MARBLE} style={{ opacity: chainDead ? 0.4 : 1 }} />
            ))}
          </g>

          {/* Rota (çizilen) */}
          <polyline
            points={ROUTE.map((pt) => pt.join(',')).join(' ')}
            fill="none" stroke={`color-mix(in srgb, ${ACCENT} 70%, transparent)`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={total} strokeDashoffset={dashOffset}
            style={{ transition: playing ? 'none' : 'stroke-dashoffset 0.2s linear' }}
          />

          {/* Konvoy gemileri */}
          {convoy.map(([x, y], k) => (
            <g key={k} transform={`translate(${x} ${y})`} style={{ opacity: 1 - k * 0.22 }}>
              <path d="M-6 2 h12 l-2 4 h-8 z" fill={k === 0 ? GOLD : MARBLE} />
              <line x1="0" y1="-5" x2="0" y2="2" stroke={k === 0 ? GOLD : MARBLE} strokeWidth="1.2" />
              <path d="M0 -5 L4 -1 L0 -1 Z" fill={k === 0 ? GOLD : MARBLE} />
            </g>
          ))}

          {/* Başlangıç/bitiş noktaları */}
          <circle cx={ROUTE[0][0]} cy={ROUTE[0][1]} r="3" fill={WATER} />
          <circle cx={ROUTE[ROUTE.length - 1][0]} cy={ROUTE[ROUTE.length - 1][1]} r="3" fill={chainDead ? GOLD : `color-mix(in srgb, ${GOLD} 40%, transparent)`} />
        </svg>
      </div>

      {/* Sahne metni */}
      <div className="mt-3 min-h-[62px]">
        <div className="mb-0.5 text-sm font-bold" style={{ color: GOLD }}>{stage.title}</div>
        <p className="text-sm leading-relaxed text-slate-300" aria-live="polite">{stage.text}</p>
      </div>

      {chainDead && (
        <div className="mt-2 rounded-xl border p-3 text-center" style={{ borderColor: `color-mix(in srgb, ${ASH} 40%, transparent)`, background: `color-mix(in srgb, ${ASH} 8%, transparent)`, animation: prefersReduced() ? 'none' : 'fatih-fade 0.5s ease' }}>
          <span className="text-sm font-black" style={{ color: MARBLE }}>{NIGHT.chainDead}</span>
        </div>
      )}

      {/* Kontroller */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => { if (p >= 1) { setP(0); setPlaying(true); } else setPlaying((v) => !v); }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/5 text-white transition hover:bg-white/10"
          aria-label={p >= 1 ? 'Baştan oynat' : playing ? 'Duraklat' : 'Oynat'}
        >
          {p >= 1 ? '↺' : playing ? '॥' : '▶'}
        </button>
        <input type="range" min={0} max={1} step={0.005} value={p} onChange={(e) => go(Number(e.target.value))} className="flex-1" style={{ accentColor: WATER }} aria-label="Gece rotası zamanı" />
      </div>

      <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-slate-500">{NIGHT.after}</p>
      <span aria-hidden className="pointer-events-none absolute bottom-2 right-3 select-none font-mono text-[0.55rem] tracking-wider text-white/25">basementonfire.com</span>
    </figure>
  );
}
