'use client';

// PERDE 5 — GÜCÜN ANATOMİSİ (~%56). Sayfanın Alesia'sı: metnin yapamayacağı
// tek şey. "Anayasal görünüyordu ama değildi" bir iddiadır; anahtarı çeviren
// okur bunu KANIT olarak yaşar — çünkü ikinci hâli görmeden birinciye inanamaz.
//
// GSAP scroll-pin YOK (Alesia'daki gerekçe). Çizim animasyonu strokeDashoffset +
// CSS transition ile; toggle tek buton, iki state. Reduced-motion → anında.

import { useMemo, useState } from 'react';
import { ACCENT, CRIMSON, MARBLE, BG, prefersReduced, refreshScroll } from './ui';
import { POWER_NODES, POWER_EDGES_CONST, POWER_EDGES_REAL, POWER_LEGIONS, POWER_POWERS, POWER_CONCLUSION } from './data';

const pos = Object.fromEntries(POWER_NODES.map((n) => [n.key, n])) as Record<string, (typeof POWER_NODES)[number]>;
const len = (a: string, b: string) => Math.hypot(pos[a].x - pos[b].x, pos[a].y - pos[b].y);

export default function PowerAnatomy() {
  const [real, setReal] = useState(false);
  const reduce = typeof window !== 'undefined' && prefersReduced();

  const constEdges = useMemo(() => POWER_EDGES_CONST.map(([a, b]) => ({ a, b, L: len(a, b) })), []);
  const realEdges = useMemo(() => POWER_EDGES_REAL.map(([a, b]) => ({ a, b, L: len(a, b) })), []);

  const toggle = () => { setReal((v) => !v); refreshScroll(); };

  return (
    <figure className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.04] p-4 pb-7 shadow-[0_0_60px_-15px_rgba(201,164,78,0.35)] backdrop-blur sm:p-5">
      <figcaption className="mb-4">
        <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: ACCENT }}>İNTERAKTİF · YILDIZ MODÜL · MÖ 27 SONRASI</div>
        <h3 className="text-base font-bold leading-snug text-white sm:text-lg">{real ? 'Numara buradaydı.' : 'Bir cumhuriyet gibi görünüyor. Çünkü öyle görünüyordu.'}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">Anahtarı çevir. Aynı devlet — bir kez anayasal görünümüyle, bir kez gerçek yetki hatlarıyla.</p>
      </figcaption>

      <div className="rounded-xl border border-white/10 bg-black/25 p-2">
        <svg viewBox="0 0 320 300" className="w-full" role="img" aria-label={real ? 'Gerçek: bütün yetki hatları Augustus\'a akıyor, sınır eyaletlerinde 25+ lejyon' : 'Anayasal görünüm: yetki Senato, konsüller ve meclisler arasında dağılmış'}>
          {/* Anayasal hatlar */}
          {constEdges.map((e, i) => (
            <line
              key={'c' + i} x1={pos[e.a].x} y1={pos[e.a].y} x2={pos[e.b].x} y2={pos[e.b].y}
              stroke={`color-mix(in srgb, ${MARBLE} 45%, transparent)`} strokeWidth="1.5"
              strokeDasharray={e.L} strokeDashoffset={real ? e.L : 0}
              style={{ transition: reduce ? 'none' : `stroke-dashoffset 0.7s ease`, opacity: real ? 0 : 1 }}
            />
          ))}
          {/* Gerçek hatlar */}
          {realEdges.map((e, i) => (
            <line
              key={'r' + i} x1={pos[e.a].x} y1={pos[e.a].y} x2={pos[e.b].x} y2={pos[e.b].y}
              stroke={`color-mix(in srgb, ${CRIMSON} 60%, transparent)`} strokeWidth="2"
              strokeDasharray={e.L} strokeDashoffset={real ? 0 : e.L}
              style={{ transition: reduce ? 'none' : `stroke-dashoffset 0.8s ease 0.2s`, opacity: real ? 1 : 0 }}
            />
          ))}
          {/* Düğümler */}
          {POWER_NODES.map((n) => {
            const isAug = n.kind === 'augustus';
            const r = isAug ? (real ? 30 : 22) : 20;
            return (
              <g key={n.key} style={{ transition: 'all 0.5s ease' }}>
                <circle
                  cx={n.x} cy={n.y} r={r}
                  fill={isAug ? `color-mix(in srgb, ${ACCENT} ${real ? 26 : 14}%, ${BG})` : `color-mix(in srgb, ${MARBLE} 8%, ${BG})`}
                  stroke={isAug ? ACCENT : 'rgba(255,255,255,0.25)'} strokeWidth={isAug ? 2 : 1}
                  style={{ transition: 'all 0.5s ease' }}
                />
                <text x={n.x} y={n.y + 3} textAnchor="middle" style={{ fontSize: n.label.length > 10 ? 7 : 9, fill: isAug ? '#fff' : MARBLE, fontWeight: isAug ? 800 : 400 }}>{n.label}</text>
                {/* Lejyon rozetleri (yalnız gerçek modda) */}
                {real && POWER_LEGIONS[n.key as keyof typeof POWER_LEGIONS] && (
                  <g style={{ animation: reduce ? 'none' : 'aug-fade 0.5s ease 0.6s both' }}>
                    <text x={n.x} y={n.y + 40} textAnchor="middle" style={{ fontSize: 15, fontWeight: 900, fontFamily: 'monospace', fill: n.key === 'aug-eyalet' ? CRIMSON : MARBLE }}>
                      {POWER_LEGIONS[n.key as keyof typeof POWER_LEGIONS].count}
                    </text>
                    <text x={n.x} y={n.y + 52} textAnchor="middle" style={{ fontSize: 7, fill: 'rgba(255,255,255,0.5)' }}>lejyon</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <button onClick={toggle} className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-bold transition hover:brightness-110" style={{ background: real ? CRIMSON : ACCENT, color: real ? '#fff' : BG }} aria-pressed={real}>
        {real ? '← Anayasal görünüme dön' : 'Gerçek yetki hatlarını göster →'}
      </button>

      {real && (
        <div className="mt-4 space-y-2" style={{ animation: 'aug-fade 0.5s ease' }}>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border p-2.5 text-center" style={{ borderColor: `color-mix(in srgb, ${MARBLE} 25%, transparent)` }}>
              <div className="font-mono text-xl font-black" style={{ color: MARBLE }}>1</div>
              <div className="text-[0.62rem] text-slate-400">Senato eyaletlerinde lejyon</div>
            </div>
            <div className="rounded-lg border p-2.5 text-center" style={{ borderColor: `color-mix(in srgb, ${CRIMSON} 35%, transparent)`, background: `color-mix(in srgb, ${CRIMSON} 8%, transparent)` }}>
              <div className="font-mono text-xl font-black" style={{ color: CRIMSON }}>25+</div>
              <div className="text-[0.62rem] text-slate-400">Augustus’un eyaletlerinde</div>
            </div>
          </div>
          {POWER_POWERS.map((p) => (
            <div key={p.title} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <div className="font-mono text-xs font-bold" style={{ color: ACCENT }}>{p.title}</div>
              <p className="mt-0.5 text-sm leading-relaxed text-slate-300">{p.text}</p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-slate-500">{POWER_CONCLUSION}</p>
      <span aria-hidden className="pointer-events-none absolute bottom-2 right-3 select-none font-mono text-[0.55rem] tracking-wider text-white/25">basementonfire.com</span>
    </figure>
  );
}
