'use client';

// PERDE 4 — Gece rotası haritasının PAYLAŞILAN geometrisi + statik zemini.
// Hem canlı modül (sim-night-route) hem poster (posters) aynı kaynaktan çizer:
// böylece lazy-yükleme sırasında poster→canlı geçişi sıçramaz ve harita tek
// yerden küçültülür. Tuval eski 320×220'den 320×168'e alçaltıldı (dikey ~%24
// kompaktlık) — koordinatlar orantılı taşındı, kompozisyon aynı, modül boyu küçük.

import { MARBLE, WATER, BG, ASH } from './ui';

export const NIGHT_VIEW = { w: 320, h: 168 } as const;

// Rota: Boğaz kıyısından (sağ-alt) Galata sırtından (üst-orta) Haliç'e (sol-alt).
export const ROUTE: [number, number][] = [
  [268, 121], [244, 101], [214, 73], [178, 53], [150, 47], [120, 57], [98, 79], [82, 107], [72, 124],
];

/** Statik harita zemini: su, şehir, Galata, etiketler, zincir. chainDead → zincir soluk/kül. */
export function NightBackdrop({ chainDead = false }: { chainDead?: boolean }) {
  return (
    <>
      {/* Su */}
      <rect x="0" y="0" width={NIGHT_VIEW.w} height={NIGHT_VIEW.h} fill={`color-mix(in srgb, ${WATER} 12%, ${BG})`} />
      {/* Şehir kütlesi (alt) */}
      <path d="M0 134 Q90 126 150 136 T320 131 L320 168 L0 168 Z" fill={`color-mix(in srgb, ${MARBLE} 7%, ${BG})`} />
      <text x="150" y="157" textAnchor="middle" style={{ fontSize: 8, fill: 'rgba(255,255,255,0.45)' }}>Konstantinopolis (surlar)</text>
      {/* Galata kütlesi (üst orta) */}
      <path d="M96 31 Q160 18 224 34 Q210 70 150 76 Q104 69 96 31 Z" fill={`color-mix(in srgb, ${MARBLE} 6%, ${BG})`} stroke="rgba(255,255,255,0.08)" />
      <text x="160" y="47" textAnchor="middle" style={{ fontSize: 8, fill: 'rgba(255,255,255,0.4)' }}>Galata sırtı</text>
      {/* Etiketler: Boğaz / Haliç */}
      <text x="286" y="115" textAnchor="middle" style={{ fontSize: 8, fill: `color-mix(in srgb, ${WATER} 80%, white)` }}>Boğaz</text>
      <text x="44" y="115" textAnchor="middle" style={{ fontSize: 8, fill: `color-mix(in srgb, ${WATER} 80%, white)` }}>Haliç</text>
      {/* Zincir — Haliç ağzında */}
      <g style={{ transition: 'all 0.6s ease' }}>
        <line x1="60" y1="134" x2="96" y2="92" stroke={chainDead ? ASH : MARBLE} strokeWidth={chainDead ? 1.5 : 2.5} strokeDasharray="2 5" style={{ opacity: chainDead ? 0.4 : 1 }} />
        {[0, 1, 2, 3].map((k) => (
          <circle key={k} cx={60 + k * 9} cy={134 - k * 11} r="2.4" fill={chainDead ? ASH : MARBLE} style={{ opacity: chainDead ? 0.4 : 1 }} />
        ))}
      </g>
    </>
  );
}
