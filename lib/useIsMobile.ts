'use client';

import { useEffect, useState } from 'react';

/**
 * Telefon kırılımı — globals.css'teki `@media (max-width: 699px)` ile aynı eşik.
 * (700px+ tabletler ikon sidebar'lı masaüstü düzenini kullanır.)
 */
export function useIsMobile(breakpoint = 699) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [breakpoint]);
  return isMobile;
}
