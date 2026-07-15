'use client';

// Ağır modüllerin (Alesia çift sur, 23 yara) statik SVG posterleri.
// Kural: boş kutu değil — her biri tek başına anlamlı ve ekran görüntüsü
// alınabilir. Deterministik (Math.random YOK) → SSR/hydration uyuşmazlığı yok.

import { ACCENT, GOLD, MARBLE, BG } from './ui';
import { MARKS } from './data';

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-black/40 p-4">
      {children}
      <span className="pointer-events-none absolute bottom-2 left-3 text-[0.6rem] text-slate-600">{label}</span>
      <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-[0.55rem] tracking-wider text-white/20">basementonfire.com</span>
    </div>
  );
}

/** Alesia: iki eşmerkezli sur — kaydırınca sahne sahne canlanan sürüm yüklenir. */
export function AlesiaPoster() {
  return (
    <Frame label="etkileşimli sürüm kaydırınca yüklenir">
      <div className="mb-3 text-xs font-bold tracking-[0.2em]" style={{ color: ACCENT }}>MÖ 52 · ALESIA</div>
      <h3 className="mb-3 text-base font-bold text-white">Aynı anda hem kuşatan hem kuşatılan</h3>
      <svg viewBox="0 0 280 200" className="w-full" role="img" aria-label="Alesia'nın iki eşmerkezli kuşatma hattı: iç hat 11 mil, dış hat 14 mil, ortada kale">
        {/* Dış hat (kurtarma ordusuna bakan) */}
        <circle cx="140" cy="100" r="92" fill="none" stroke={`color-mix(in srgb, ${MARBLE} 40%, transparent)`} strokeWidth="2" strokeDasharray="3 4" />
        {/* İç hat (kaleye bakan) */}
        <circle cx="140" cy="100" r="62" fill="none" stroke={`color-mix(in srgb, ${ACCENT} 70%, transparent)`} strokeWidth="2" />
        {/* İki hat arasındaki Roma bölgesi */}
        <circle cx="140" cy="100" r="77" fill={`color-mix(in srgb, ${ACCENT} 6%, transparent)`} />
        {/* Kale */}
        <circle cx="140" cy="100" r="30" fill={`color-mix(in srgb, ${GOLD} 18%, ${BG})`} stroke={GOLD} strokeWidth="1.5" />
        <text x="140" y="104" textAnchor="middle" style={{ fontSize: 10, fill: GOLD, fontWeight: 700 }}>80.000</text>
        {/* Dış düşman noktaları */}
        {[20, 60, 130, 200, 250, 300, 340].map((deg) => {
          const r = (deg * Math.PI) / 180;
          return <circle key={deg} cx={140 + Math.cos(r) * 108} cy={100 + Math.sin(r) * 108} r="2.5" fill={MARBLE} />;
        })}
        <text x="140" y="16" textAnchor="middle" style={{ fontSize: 8, fill: MARBLE }}>dış hat · 14 mil</text>
        <text x="140" y="176" textAnchor="middle" style={{ fontSize: 8, fill: ACCENT }}>iç hat · 11 mil</text>
      </svg>
    </Frame>
  );
}

/** 23 yara: bir vücut silüeti ve üzerinde 23 işaret. */
export function WoundsPoster() {
  return (
    <Frame label="dokunulabilir sürüm kaydırınca yüklenir">
      <div className="mb-3 text-xs font-bold tracking-[0.2em]" style={{ color: ACCENT }}>MÖ 44 · 15 MART</div>
      <h3 className="mb-1 text-base font-bold text-white">23 bıçak. Yalnızca biri öldürücü.</h3>
      <p className="mb-3 text-xs text-slate-400">Her işarete dokun: kim vurdu — ve Caesar onu affetmiş miydi?</p>
      <div className="mx-auto max-w-[200px]">
        <svg viewBox="0 0 200 440" className="w-full" role="img" aria-label="Caesar'ın vücut silüeti üzerinde 23 bıçak yarasının konumu">
          <Silhouette />
          {MARKS.map((m) => (
            <circle
              key={m.id}
              cx={m.x} cy={m.y} r={m.kind === 'olumcul' ? 5 : 3.4}
              fill={m.kind === 'olumcul' ? ACCENT : m.kind === 'isimsiz' ? 'rgba(148,163,184,0.4)' : `color-mix(in srgb, ${ACCENT} 70%, transparent)`}
              stroke={m.kind === 'olumcul' ? '#fff' : 'none'}
              strokeWidth={m.kind === 'olumcul' ? 1 : 0}
            />
          ))}
        </svg>
      </div>
    </Frame>
  );
}

/** Toga giymiş insan silüeti — iki modülde ortak. */
export function Silhouette() {
  return (
    <path
      d="M100 20 C112 20 121 30 121 44 C121 55 116 62 116 62 C130 66 138 74 141 92 L150 190 C151 200 143 203 140 194 L130 130 L128 150 C132 220 134 300 130 400 C129 418 118 420 115 405 L100 300 L85 405 C82 420 71 418 70 400 C66 300 68 220 72 150 L70 130 L59 194 C56 203 48 200 49 190 L58 92 C61 74 69 66 84 62 C84 62 79 55 79 44 C79 30 88 20 100 20 Z"
      fill="rgba(232,228,222,0.07)"
      stroke="rgba(232,228,222,0.22)"
      strokeWidth="1.2"
    />
  );
}
