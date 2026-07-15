'use client';

// Ağır modüllerin (Gücün Anatomisi, Vâris Ağacı) statik SVG posterleri.
// Boş kutu değil — her biri tek başına anlamlı ve ekran görüntüsü alınabilir.
// Deterministik → SSR/hydration uyuşmazlığı yok.

import { ACCENT, CRIMSON, MARBLE, BG } from './ui';
import { POWER_NODES, POWER_EDGES_REAL, HEIRS, HEIR_SURVIVOR } from './data';

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-black/40 p-4">
      {children}
      <span className="pointer-events-none absolute bottom-2 left-3 text-[0.6rem] text-slate-600">{label}</span>
      <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-[0.55rem] tracking-wider text-white/20">basementonfire.com</span>
    </div>
  );
}

/** Gücün anatomisi: her yetki hattı tek düğüme akar (gerçek görünüm). */
export function AnatomyPoster() {
  const pos = Object.fromEntries(POWER_NODES.map((n) => [n.key, n]));
  return (
    <Frame label="etkileşimli sürüm kaydırınca yüklenir">
      <div className="mb-3 text-xs font-bold tracking-[0.2em]" style={{ color: ACCENT }}>MÖ 27 SONRASI · GÜCÜN ANATOMİSİ</div>
      <h3 className="mb-3 text-base font-bold text-white">Cumhuriyet gibi görünüyordu. Değildi.</h3>
      <svg viewBox="0 0 320 300" className="w-full" role="img" aria-label="Roma devlet şeması: bütün yetki hatları Augustus düğümüne akıyor">
        {POWER_EDGES_REAL.map(([a, b], i) => (
          <line key={i} x1={pos[a].x} y1={pos[a].y} x2={pos[b].x} y2={pos[b].y} stroke={`color-mix(in srgb, ${CRIMSON} 55%, transparent)`} strokeWidth="1.5" />
        ))}
        {POWER_NODES.map((n) => {
          const isAug = n.kind === 'augustus';
          return (
            <g key={n.key}>
              <circle cx={n.x} cy={n.y} r={isAug ? 26 : 20} fill={isAug ? `color-mix(in srgb, ${ACCENT} 22%, ${BG})` : `color-mix(in srgb, ${MARBLE} 8%, ${BG})`} stroke={isAug ? ACCENT : 'rgba(255,255,255,0.25)'} strokeWidth={isAug ? 2 : 1} />
              <text x={n.x} y={n.y + 3} textAnchor="middle" style={{ fontSize: n.label.length > 10 ? 7 : 9, fill: isAug ? '#fff' : MARBLE, fontWeight: isAug ? 800 : 400 }}>{n.label}</text>
            </g>
          );
        })}
      </svg>
    </Frame>
  );
}

/** Vâris ağacı: hepsi sönmüş, tek Tiberius yanık. */
export function HeirsPoster() {
  const all = [...HEIRS, HEIR_SURVIVOR];
  return (
    <Frame label="kaydırınca teker teker sönen sürüm yüklenir">
      <div className="mb-3 text-xs font-bold tracking-[0.2em]" style={{ color: ACCENT }}>MÖ 23 → MS 4 · VÂRİSLER</div>
      <h3 className="mb-4 text-base font-bold text-white">Beş vâris. Hepsi genç. Hepsi o hayattayken.</h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {all.map((h) => {
          const survivor = h.key === 'tiberius';
          return (
            <div key={h.key} className="rounded-lg border p-2 text-center" style={{ borderColor: survivor ? `color-mix(in srgb, ${ACCENT} 45%, transparent)` : 'rgba(255,255,255,0.08)', background: survivor ? `color-mix(in srgb, ${ACCENT} 10%, transparent)` : 'transparent', opacity: survivor ? 1 : 0.3 }}>
              <div className="text-[0.7rem] font-bold" style={{ color: survivor ? ACCENT : 'rgba(255,255,255,0.4)' }}>{h.name}</div>
              {h.age && <div className="mt-0.5 font-mono text-[0.6rem] text-slate-500">{h.age}</div>}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-400">Geriye kalan tek kişi: Tiberius — istemediği adam.</p>
    </Frame>
  );
}
