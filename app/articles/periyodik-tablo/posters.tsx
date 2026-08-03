'use client';

// Ağır modülün (sim-tablo) InView posteri: saf SVG, JS gerekmez.
// Üç işi birden görür:
//  1. JS inmeden önce "burada bir şey var" demek,
//  2. minHeight ile CLS'i önlemek,
//  3. hareket-azaltma modunda ağır modülün KALICI yerine geçmek.
// Atilla biçimi seçildi: poster kendi figure+figcaption kabuğunu taşır.

import { BLOK } from './ui';

/** 18x7 ızgara silüeti + iki f-blok satırı. Gerçek yerleşimin kabası. */
export function TabloPoster() {
  const H = 13, W = 13, G = 2.4;
  const hucre = (c: number, r: number, blok: keyof typeof BLOK, k: number) => (
    <rect
      key={k}
      x={c * (W + G)} y={r * (H + G)} width={W} height={H} rx={2.4}
      fill={BLOK[blok].color} opacity={0.55}
    />
  );

  const kareler: React.ReactNode[] = [];
  let k = 0;
  // Ana gövde: her satır için (grup, blok) kabası
  const satirlar: [number, number, keyof typeof BLOK][][] = [
    [[1, 1, 's'], [18, 18, 'p']],
    [[1, 2, 's'], [13, 18, 'p']],
    [[1, 2, 's'], [13, 18, 'p']],
    [[1, 2, 's'], [3, 12, 'd'], [13, 18, 'p']],
    [[1, 2, 's'], [3, 12, 'd'], [13, 18, 'p']],
    [[1, 2, 's'], [3, 12, 'd'], [13, 18, 'p']],
    [[1, 2, 's'], [3, 12, 'd'], [13, 18, 'p']],
  ];
  satirlar.forEach((aralikar, r) => {
    aralikar.forEach(([a, b, blok]) => {
      for (let g = a; g <= b; g++) kareler.push(hucre(g - 1, r, blok, k++));
    });
  });
  // f-blok iki satır (grup 3'ten itibaren)
  for (let i = 0; i < 14; i++) {
    kareler.push(hucre(2 + i, 8, 'f', k++));
    kareler.push(hucre(2 + i, 9, 'f', k++));
  }

  return (
    <figure className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <figcaption className="mb-3">
        <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: BLOK.f.color }}>
          İNTERAKTİF TABLO
        </div>
        <h3 className="text-base font-bold text-white sm:text-lg">118 element, dört blok</h3>
      </figcaption>
      <svg viewBox={`-2 -2 ${18 * (W + G) + 2} ${10 * (H + G) + 4}`} className="w-full" role="img" aria-label="Periyodik tablonun blok renkleriyle boyanmış silüeti">
        {kareler}
      </svg>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {(Object.keys(BLOK) as (keyof typeof BLOK)[]).map((b) => (
          <span key={b} className="flex items-center gap-1.5 text-[0.68rem] text-slate-400">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: BLOK[b].color }} />
            {BLOK[b].label}
          </span>
        ))}
      </div>
      <span aria-hidden className="pointer-events-none absolute bottom-2 right-3 select-none font-mono text-[0.55rem] tracking-wider text-white/25">
        basementonfire.com
      </span>
    </figure>
  );
}
