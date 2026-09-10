'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  /** Sayacın BAŞLANGIÇ değeri — yalnız ilk render'da okunur, sonradan değişmesi
   *  yok sayılır. Verilmezse 0 (eski davranış: mount'ta 0'dan sayar).
   *  Enerji kartı bunu kullanıyor: 57'den 72'ye saymalı, 0'dan değil. */
  startAt?: number;
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
export default function AnimatedNumber({ value, startAt = 0, className, style }: Props) {
  const [display, setDisplay] = useState(startAt);
  const fromRef = useRef(startAt);
  const rafRef = useRef<number | null>(null);
  const emniyetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    let bitti = false;
    const tick = (t: number) => {
      if (bitti) return;
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        bitti = true;
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    /* ⚠ EMNİYET KEMERİ — arka plan sekmesinde `requestAnimationFrame` HİÇ
       çalışmaz, yani sayaç başladığı yerde ASILI KALIR ve kullanıcı sekmeye
       dönünce yanlış sayıyı görür (ölçüldü: 72 yerine 68'de kalıyordu).
       `setTimeout` gizli sekmede de -kısılmış ama- çalışır; süre dolduğunda
       son değeri kesin olarak yazar. */
    emniyetRef.current = setTimeout(() => {
      if (bitti) return;
      bitti = true;
      fromRef.current = to;
      setDisplay(to);
    }, duration + 80);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (emniyetRef.current) clearTimeout(emniyetRef.current);
    };
  }, [value]);

  return (
    <span className={className} style={style}>
      {display.toLocaleString('tr-TR')}
    </span>
  );
}
