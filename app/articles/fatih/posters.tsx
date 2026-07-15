'use client';

// Ağır modüllerin (Kuşatma Yarışı, Gece Rotası) statik SVG posterleri.
// Boş kutu değil — her biri tek başına anlamlı ve ekran görüntüsüne uygun.
// Deterministik → SSR/hydration uyuşmazlığı yok.

import { ACCENT, GOLD, CRIMSON, MARBLE, WATER, ASH, BG } from './ui';
import { SIEGE, NIGHT } from './data';

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-black/40 p-4">
      {children}
      <span className="pointer-events-none absolute bottom-2 left-3 text-[0.6rem] text-slate-600">{label}</span>
      <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-[0.55rem] tracking-wider text-white/20">basementonfire.com</span>
    </div>
  );
}

/** Kuşatma yarışı posteri: yarı-dolu sur barı + testere-dişi eğrisi. */
export function SiegePoster() {
  // Örnek denge (5 atış / 1500 ekip) ≈ %50.
  const teeth = Array.from({ length: SIEGE.days }, (_, i) => {
    const decay = 100 - (100 - 50) * (1 - Math.pow(0.86, i));
    const low = Math.max(47, decay - 6);
    const x = (i / (SIEGE.days - 1)) * 216;
    return `${x},${44 - (low / 100) * 40} ${x},${44 - (decay / 100) * 40}`;
  }).join(' ');

  return (
    <Frame label="etkileşimli sürüm kaydırınca yüklenir">
      <div className="mb-3 text-xs font-bold tracking-[0.2em]" style={{ color: ACCENT }}>YILDIZ MODÜL · KUŞATMA YARIŞI</div>
      <h3 className="mb-3 text-base font-bold text-white">Suru düşür. Deneyebildiğin kadar dene.</h3>
      <div className="rounded-xl border border-white/10 bg-black/25 p-4">
        <div className="mb-1.5 flex items-baseline justify-between"><span className="text-xs text-slate-400">Sur bütünlüğü</span><span className="font-mono text-2xl font-black" style={{ color: `color-mix(in srgb, ${CRIMSON} 50%, ${ACCENT})` }}>%50</span></div>
        <div className="h-5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: '50%', background: `color-mix(in srgb, ${CRIMSON} 50%, ${ACCENT})` }} /></div>
        <svg viewBox="0 0 216 44" className="mt-3 w-full" aria-hidden>
          <line x1="0" y1={44 - (50 / 100) * 40} x2="216" y2={44 - (50 / 100) * 40} stroke={`color-mix(in srgb, ${MARBLE} 25%, transparent)`} strokeWidth="1" strokeDasharray="3 3" />
          <polyline points={teeth} fill="none" stroke={`color-mix(in srgb, ${CRIMSON} 50%, ${ACCENT})`} strokeWidth="1.4" />
        </svg>
      </div>
      <p className="mt-3 text-xs text-slate-400">Gündüz top gedik açar, gece savunma doldurur. 54 gün — ve sur ayakta kalır.</p>
    </Frame>
  );
}

/** Gece rotası posteri: yarı çizili rota + zincir + gemiler. */
export function NightRoutePoster() {
  const ROUTE: [number, number][] = [[268, 158], [244, 132], [214, 96], [178, 70], [150, 62], [120, 74], [98, 104], [82, 140], [72, 162]];
  return (
    <Frame label="kaydırınca sürüklenebilir sürüm yüklenir">
      <div className="mb-3 text-xs font-bold tracking-[0.2em]" style={{ color: WATER }}>22 NİSAN 1453 · GECE ROTASI</div>
      <h3 className="mb-3 text-base font-bold text-white">Zincir kırılamadı. Aşıldı.</h3>
      <div className="rounded-xl border border-white/10 bg-black/30 p-2">
        <svg viewBox="0 0 320 220" className="w-full" aria-hidden>
          <rect x="0" y="0" width="320" height="220" fill={`color-mix(in srgb, ${WATER} 12%, ${BG})`} />
          <path d="M0 175 Q90 165 150 178 T320 172 L320 220 L0 220 Z" fill={`color-mix(in srgb, ${MARBLE} 7%, ${BG})`} />
          <path d="M96 40 Q160 24 224 44 Q210 92 150 100 Q104 90 96 40 Z" fill={`color-mix(in srgb, ${MARBLE} 6%, ${BG})`} stroke="rgba(255,255,255,0.08)" />
          <text x="286" y="150" textAnchor="middle" style={{ fontSize: 8, fill: `color-mix(in srgb, ${WATER} 80%, white)` }}>Boğaz</text>
          <text x="44" y="150" textAnchor="middle" style={{ fontSize: 8, fill: `color-mix(in srgb, ${WATER} 80%, white)` }}>Haliç</text>
          <line x1="60" y1="176" x2="96" y2="120" stroke={MARBLE} strokeWidth="2.5" strokeDasharray="2 5" />
          {[0, 1, 2, 3].map((k) => <circle key={k} cx={60 + k * 9} cy={176 - k * 14} r="2.4" fill={MARBLE} />)}
          <polyline points={ROUTE.map((p) => p.join(',')).join(' ')} fill="none" stroke={`color-mix(in srgb, ${ACCENT} 70%, transparent)`} strokeWidth="2.5" strokeDasharray="240" strokeDashoffset="120" strokeLinecap="round" />
          <g transform="translate(178 70)"><path d="M-6 2 h12 l-2 4 h-8 z" fill={GOLD} /><line x1="0" y1="-5" x2="0" y2="2" stroke={GOLD} strokeWidth="1.2" /><path d="M0 -5 L4 -1 L0 -1 Z" fill={GOLD} /></g>
        </svg>
      </div>
      <p className="mt-3 text-xs text-slate-400">Yaklaşık {NIGHT.ships} gemi, ~{(NIGHT.distanceM / 1000).toString().replace('.', ',')} km, tek gecede karadan. <span style={{ color: ASH }}>Zincir yerinde; işlevi yok.</span></p>
    </Frame>
  );
}
