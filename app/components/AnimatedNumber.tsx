'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Animasyonlu tam sayı — mount'ta 0'dan başlar ve `value` her değiştiğinde
 * (ör. takip edince takipçi sayısı) yeni değere yumuşakça (easeOutCubic) sayar.
 * Önceden react-spring kullanıyordu; tek kullanım olduğu için bağımlılık
 * kaldırıldı, hafif rAF tabanlı sayaca geçildi. prefers-reduced-motion'da
 * anında atlar.
 */
export default function AnimatedNumber({ value, className, style }: Props) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const from = fromRef.current;
    const to = value;
    if (reduce || from === to) {
      setDisplay(to);
      fromRef.current = to;
      return;
    }

    const duration = 600;
    let start: number | null = null;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return (
    <span className={className} style={style}>
      {display.toLocaleString('tr-TR')}
    </span>
  );
}
