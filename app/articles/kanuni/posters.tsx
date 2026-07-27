'use client';

// Lazy (InView) yüklenen ağır modüllerin YER TUTUCU posterleri.
// Saf SVG: JS indirilmeden önce de sayfada "bir şey var" görünür, CLS olmaz ve
// hareket-azaltma modunda etkileşimli sürümün yerine bu kalır.

import { ACCENT, BG, GOLD, CORAL, COBALT, MARBLE, rnd } from './ui';

// ⚠ HİDRASYON: rnd() Math.sin tabanlı ve Node ile tarayıcının kayan nokta
// sonucu SON BASAMAKTA ayrışıyor (ölçüldü: ry 4.171654508070787 ↔ 4.1716545080489595)
// → React "attributes didn't match" hatası veriyordu. Değerler iki basamağa
// YUVARLANIYOR: aynı string iki tarafta da üretilir, görünüm değişmez.
const q = (n: number) => Math.round(n * 100) / 100;
const bog = Array.from({ length: 18 }, (_, i) => ({
  cx: q(rnd(i * 3.1) * 800),
  cy: q(200 + rnd(i * 7.7) * 40),
  rx: q(26 + rnd(i) * 30),
  ry: q(4 + rnd(i * 2) * 3),
  fill: i % 2 ? 'rgba(47,184,174,0.10)' : 'rgba(51,85,196,0.10)',
}));

export function MohacPoster() {
  return (
    <figure className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-4 pb-7 sm:p-5">
      <figcaption className="mb-4">
        <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: ACCENT }}>
          SAVAŞ SİMÜLASYONU · 29 AĞUSTOS 1526
        </div>
        <h3 className="text-base font-bold leading-snug text-white sm:text-lg">
          Sen Macar tarafındasın. Avrupa’nın en iyi ağır süvarisi senin elinde.
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">Kaydırınca yüklenir.</p>
      </figcaption>

      <svg viewBox="0 0 800 470" className="w-full rounded-xl border border-white/10" style={{ background: BG }} role="img" aria-label="Mohaç muharebe düzeni: üstte Macar ağır süvari bloğu, altta üç hatlı Osmanlı düzeni">
        <defs>
          <linearGradient id="kp-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1226" />
            <stop offset="1" stopColor="#060a17" />
          </linearGradient>
        </defs>
        <rect width="800" height="470" fill="url(#kp-ground)" />

        {/* bataklık lekeleri (yuvarlanmış → SSR/istemci aynı string) */}
        {bog.map((b, i) => (
          <ellipse key={i} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill={b.fill} />
        ))}

        {/* Macar ağır süvari bloğu */}
        {Array.from({ length: 5 }, (_, r) =>
          Array.from({ length: 20 }, (_, i) => (
            <rect key={`h${r}-${i}`} x={400 + (i - 9.5) * 26 - 6} y={92 + r * 20 - 4.5} width="12" height="9" rx="2"
              fill={r === 0 ? MARBLE : CORAL} opacity="0.95" />
          )),
        )}
        <rect x="399" y="58" width="2" height="26" fill={MARBLE} />
        <path d="M401 58 L427 64 L401 71 Z" fill={CORAL} />

        {/* hafif süvari */}
        {Array.from({ length: 18 }, (_, i) => (
          <rect key={`l${i}`} x={400 + (i - 8.5) * 26 - 5} y={310} width="10" height="7" rx="2" fill={ACCENT} opacity="0.9" />
        ))}

        {/* sipahi hattı */}
        {Array.from({ length: 22 }, (_, i) => (
          <rect key={`s${i}`} x={160 + i * 22 - 5.5} y={348} width="11" height="8" rx="2" fill={COBALT} opacity="0.85" />
        ))}

        {/* zincirli top hattı */}
        <line x1="150" y1="392" x2="650" y2="392" stroke="rgba(217,164,65,0.5)" strokeWidth="2" />
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={`c${i}`} x={158 + i * 32 - 8} y={387.5} width="16" height="9" rx="2" fill={GOLD} opacity="0.9" />
        ))}
        {/* yeniçeri */}
        {Array.from({ length: 26 }, (_, i) => (
          <rect key={`y${i}`} x={150 + i * 20 - 4.5} y={409.5} width="9" height="9" rx="2" fill="#e8e6df" opacity="0.75" />
        ))}

        <text x="22" y="34" fill="rgba(232,230,223,0.75)" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif">MACAR AĞIR SÜVARİ — sen</text>
        <text x="22" y="448" fill="rgba(217,164,65,0.8)" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif">TOP HATTI + YENİÇERİ</text>
        <text x="22" y="306" fill="rgba(47,184,174,0.8)" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif">hafif süvari</text>
        <text x="778" y="34" fill="rgba(255,255,255,0.55)" fontSize="15" fontWeight="700" textAnchor="end" fontFamily="ui-monospace, monospace">15:00</text>
      </svg>
    </figure>
  );
}
