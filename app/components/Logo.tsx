// Basements logo — recreated as a scalable SVG.
// Two overlapping red circles (heart lobes) above three cyan-outlined
// black 8-pointed stars (octagrams) that taper into the heart's point.

/** Build an 8-pointed star (octagram / Rub el Hizb) path centered at (cx,cy). */
function octagram(cx: number, cy: number, R: number): string {
  const r = R * 0.765; // inner radius ratio of two overlapping squares
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const rad = i % 2 === 0 ? R : r;
    const a = ((-90 + i * 22.5) * Math.PI) / 180;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
}

const STARS = [
  { cx: 180, cy: 322 },
  { cx: 340, cy: 312 },
  { cx: 261, cy: 408 },
];

export default function Logo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="Basements"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Heart lobes — bright red left, darker red right (overlapping) */}
      <circle cx="166" cy="152" r="120" fill="#ff1212" />
      <circle cx="338" cy="152" r="120" fill="#c10000" />

      {/* Three octagram stars: dark outer edge + cyan stroke + black fill */}
      {STARS.map((s, i) => {
        const d = octagram(s.cx, s.cy, 74);
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="#0b2742" strokeWidth="14" strokeLinejoin="round" />
            <path d={d} fill="#070707" stroke="#18b6d6" strokeWidth="7" strokeLinejoin="round" />
          </g>
        );
      })}
    </svg>
  );
}
