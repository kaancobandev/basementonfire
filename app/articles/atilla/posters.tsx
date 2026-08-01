'use client';

// Lazy (InView) yüklenen ağır modüllerin YER TUTUCU posterleri.
// Saf SVG: JS indirilmeden önce de sayfada "bir şey var" görünür, CLS olmaz ve
// hareket-azaltma modunda etkileşimli sürümün yerine bu kalır.
//
// ⚠ HİDRASYON: rnd() Math.sin tabanlı ve Node ile tarayıcının kayan nokta sonucu
// SON BASAMAKTA ayrışıyor → React "attributes didn't match" veriyor. Değerler iki
// basamağa YUVARLANIYOR (kanuni/posters.tsx'te ölçülmüş ders).

import { ACCENT, BONE, GARNET, GOLD, IRON, rnd } from './ui';

const q = (n: number) => Math.round(n * 100) / 100;

// Ovadaki seyrek ot/toz lekeleri
const otlar = Array.from({ length: 22 }, (_, i) => ({
  cx: q(rnd(i * 3.1) * 800),
  cy: q(250 + rnd(i * 7.7) * 190),
  rx: q(18 + rnd(i) * 34),
  ry: q(3 + rnd(i * 2) * 3),
  fill: i % 2 ? 'rgba(226,98,43,0.07)' : 'rgba(139,149,166,0.07)',
}));

export function CatalaunumPoster() {
  return (
    <figure className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-4 pb-7 sm:p-5">
      <figcaption className="mb-4">
        <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: ACCENT }}>
          SAVAŞ ANİMASYONU · 451 · CATALAUNUM OVALARI
        </div>
        <h3 className="text-base font-bold leading-snug text-white sm:text-lg">
          Atilla’nın karşısındaki adam, gençliğini onun halkının yanında geçirmişti.
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">Kaydırınca yüklenir.</p>
      </figcaption>

      <svg viewBox="0 0 800 470" className="w-full rounded-xl border border-white/10" style={{ background: '#0a0706' }}
        role="img" aria-label="Catalaunum muharebe düzeni: üstte Hun hattı, altta Roma ve Vizigot hattı, sağ üstte muharebeye hâkim sırt">
        <defs>
          <linearGradient id="ap-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#140d0a" />
            <stop offset="1" stopColor="#070504" />
          </linearGradient>
          <linearGradient id="ap-ridge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(232,222,208,0.16)" />
            <stop offset="1" stopColor="rgba(232,222,208,0.03)" />
          </linearGradient>
        </defs>
        <rect width="800" height="470" fill="url(#ap-ground)" />
        {otlar.map((o, i) => <ellipse key={i} cx={o.cx} cy={o.cy} rx={o.rx} ry={o.ry} fill={o.fill} />)}

        {/* Sırt — muharebenin düğümü */}
        <path d="M520 60 L800 40 L800 210 L560 190 Z" fill="url(#ap-ridge)" />
        <path d="M520 60 L800 40" stroke="rgba(232,222,208,0.35)" strokeWidth="2" fill="none" />
        <text x="640" y="118" fill="rgba(232,222,208,0.6)" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">SIRT</text>

        {/* Hun hattı (üst) */}
        {Array.from({ length: 24 }, (_, i) => (
          <rect key={`h${i}`} x={90 + i * 20 - 5} y={148} width="11" height="8" rx="2" fill={ACCENT} opacity="0.9" />
        ))}
        {Array.from({ length: 20 }, (_, i) => (
          <rect key={`h2${i}`} x={110 + i * 20 - 5} y={166} width="11" height="8" rx="2" fill={GARNET} opacity="0.75" />
        ))}
        <rect x="292" y="120" width="3" height="24" fill={GOLD} />
        <path d="M295 120 L322 127 L295 134 Z" fill={GOLD} />

        {/* Roma + Vizigot hattı (alt) */}
        {Array.from({ length: 22 }, (_, i) => (
          <rect key={`r${i}`} x={80 + i * 20 - 5} y={330} width="11" height="8" rx="2" fill={IRON} opacity="0.9" />
        ))}
        {Array.from({ length: 18 }, (_, i) => (
          <rect key={`v${i}`} x={430 + i * 20 - 5} y={348} width="11" height="8" rx="2" fill={BONE} opacity="0.8" />
        ))}

        <text x="22" y="138" fill="rgba(226,98,43,0.85)" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif">HUN HATTI</text>
        <text x="22" y="324" fill="rgba(139,149,166,0.85)" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif">AETIUS</text>
        <text x="430" y="376" fill="rgba(232,222,208,0.8)" fontSize="13" fontWeight="600" fontFamily="system-ui, sans-serif">VİZİGOTLAR</text>
        <text x="778" y="452" fill="rgba(255,255,255,0.45)" fontSize="14" fontWeight="700" textAnchor="end" fontFamily="ui-monospace, monospace">7 FAZ</text>
      </svg>
    </figure>
  );
}
