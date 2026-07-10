'use client';

// Ağır modüller yüklenene kadar (ya da hareket azaltma modunda hiç yüklenmezken)
// görünen STATİK posterler. Boş kutu değil: her biri kendi başına anlamlı ve
// ekran görüntüsü alınabilir. Deterministik — SSR/hydration uyuşmazlığı yok.

import { ACCENT, RAY } from './ui';

/** Deterministik sahte-rastgele: aynı i her zaman aynı değeri verir. */
const rnd = (i: number) => ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-black/40 ring-1 ring-white/5">
      {children}
      <span className="pointer-events-none absolute bottom-1.5 left-2 text-[0.6rem] text-slate-600">{label}</span>
    </div>
  );
}

const POSTER_COLS = 20, POSTER_ROWS = 13;

export function HalfLifePoster() {
  return (
    <Frame label="etkileşimli sürüm kaydırınca yüklenir">
      <svg viewBox={`0 0 ${POSTER_COLS * 10} ${POSTER_ROWS * 10 + 46}`} className="h-auto w-full" role="img" aria-label="Yarılanma süresi: 1.000 çekirdeğin yarısı sönmüş bir ızgara ve üstel azalma eğrisi">
        {Array.from({ length: POSTER_COLS * POSTER_ROWS }, (_, i) => {
          const alive = rnd(i + 1) > 0.5;
          return (
            <circle
              key={i}
              cx={(i % POSTER_COLS) * 10 + 5}
              cy={Math.floor(i / POSTER_COLS) * 10 + 5}
              r={alive ? 2.6 : 1.5}
              fill={alive ? ACCENT : 'rgba(148,163,184,0.18)'}
            />
          );
        })}
        <g transform={`translate(0 ${POSTER_ROWS * 10 + 6})`}>
          <path
            d={'M' + Array.from({ length: 41 }, (_, i) => {
              const t = (i / 40) * 8;
              return `${(t / 8 * POSTER_COLS * 10).toFixed(1)},${(2 + (1 - Math.pow(2, -t)) * 30).toFixed(1)}`;
            }).join(' L')}
            fill="none" stroke={ACCENT} strokeWidth="1.6"
          />
          <line x1="0" y1="17" x2={POSTER_COLS * 10} y2="17" stroke="rgba(255,255,255,0.14)" strokeWidth="0.6" strokeDasharray="2 2" />
        </g>
      </svg>
    </Frame>
  );
}

export function PenetrationPoster() {
  const rows = [
    { ray: RAY.alpha, stop: 0, label: 'kâğıt durdurur' },
    { ray: RAY.beta, stop: 1, label: 'alüminyum durdurur' },
    { ray: RAY.gamma, stop: 2, label: 'kurşun büyük ölçüde durdurur' },
  ];
  return (
    <Frame label="engelleri sürüklemek için kaydır">
      <svg viewBox="0 0 300 160" className="h-auto w-full" role="img" aria-label="Alfayı kâğıt, betayı alüminyum, gamayı kurşun durdurur">
        {[70, 130, 190].map((x, i) => (
          <g key={x}>
            <rect x={x - 4} y="14" width="8" height="118" rx="2" fill="rgba(226,232,240,0.14)" stroke="rgba(255,255,255,0.22)" strokeWidth="0.7" />
            <text x={x} y="146" fill="#64748b" fontSize="7" textAnchor="middle">{['kâğıt', 'alüminyum', 'kurşun'][i]}</text>
          </g>
        ))}
        <rect x="4" y="14" width="14" height="118" rx="3" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.7" />
        <rect x="282" y="14" width="14" height="118" rx="3" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.7" />
        {rows.map((r, i) => {
          const y = 40 + i * 34;
          const endX = [70, 130, 190][r.stop] - 6;
          return (
            <g key={r.ray.key}>
              <line x1="20" y1={y} x2={endX} y2={y} stroke={r.ray.color} strokeWidth="2" strokeLinecap="round" />
              {r.stop === 2 && <line x1="196" y1={y} x2="280" y2={y} stroke={r.ray.color} strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />}
              <circle cx={endX} cy={y} r="3.4" fill={r.ray.color} />
              <text x="24" y={y - 6} fill={r.ray.color} fontSize="9" fontWeight="bold">{r.ray.symbol}</text>
              <text x={endX + 8} y={y + 3} fill="#64748b" fontSize="6.5">{r.label}</text>
            </g>
          );
        })}
      </svg>
    </Frame>
  );
}

export function GeigerPoster() {
  return (
    <Frame label="sesli sürüm kaydırınca yüklenir · sessiz başlar">
      <svg viewBox="0 0 300 120" className="h-auto w-full" role="img" aria-label="Geiger sayacı kadranı ve seyrek tıklar">
        <path d="M 40 92 A 50 50 0 0 1 140 92" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="8" strokeLinecap="round" />
        <path d="M 40 92 A 50 50 0 0 1 140 92" fill="none" stroke={ACCENT} strokeWidth="8" strokeLinecap="round" strokeDasharray="34 400" opacity="0.85" />
        <line x1="90" y1="92" x2="66" y2="53" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
        <circle cx="90" cy="92" r="4" fill="#f8fafc" />
        <text x="90" y="40" fill={ACCENT} fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">25</text>
        <text x="90" y="50" fill="#64748b" fontSize="6" textAnchor="middle">CPM · doğal fon</text>
        {[172, 188, 197, 214, 231, 240, 258, 276, 289].map((x, i) => (
          <line key={x} x1={x} y1={100} x2={x} y2={100 - (16 + rnd(i + 7) * 8)} stroke={ACCENT} strokeWidth="1.2" opacity="0.85" />
        ))}
        <line x1="165" y1="100" x2="295" y2="100" stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" />
      </svg>
    </Frame>
  );
}
