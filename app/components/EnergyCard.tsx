'use client';

import { useEffect, useRef } from 'react';
import AnimatedNumber from '@/app/components/AnimatedNumber';
import { kisaSinif } from '@/app/components/rewardMotion';

/**
 * Enerji kartı — seviye küresi + XP barı + seri çipi.
 *
 * Props DEĞİŞTİĞİNDE kendiliğinden canlanır: bar genişliği ve kürenin `--bof-p`
 * yüzdesi CSS geçişiyle dolar, sayı sayarak yükselir, seri çipi zıplar.
 * Yani çağıran yalnız yeni ilerlemeyi vermekle yükümlü; koreografi burada.
 *
 * ⚠ `useState(prop)` YOK. Bu sayfada kişisel veri sonradan geliyor ve
 * prop'u state'e dondurmak bu depoda dört kez yanlış değer üretti.
 */
export default function EnergyCard({
  level, into, perLevel, streak, style,
}: {
  level: number;
  into: number;
  perLevel: number;
  streak: number;
  /** Varsayilan kenar/bosluk Gunun Sorusu karti icindir; kenar cubugundaki
   *  surum kendi kutusuna sahip oldugu icin bunlari sifirliyor. */
  style?: React.CSSProperties;
}) {
  const kutuRef = useRef<HTMLDivElement>(null);
  const seriRef = useRef<HTMLSpanElement>(null);
  const ilkInto = useRef(into);
  const oncekiInto = useRef(into);
  const oncekiSeri = useRef(streak);

  useEffect(() => {
    if (into === oncekiInto.current) return;
    oncekiInto.current = into;
    const kutu = kutuRef.current;
    if (!kutu) return;
    // Bar dolarken uçtaki parıltı bir kez nabız atar.
    kutu.setAttribute('data-surge', '');
    const t = setTimeout(() => kutu.removeAttribute('data-surge'), 640);
    return () => clearTimeout(t);
  }, [into]);

  useEffect(() => {
    if (streak === oncekiSeri.current) return;
    oncekiSeri.current = streak;
    kisaSinif(seriRef.current, 'bof-zipla', 460);
  }, [streak]);

  const oran = perLevel > 0 ? Math.min(100, Math.round((into / perLevel) * 100)) : 0;

  return (
    <div
      ref={kutuRef}
      className="bof-enerji"
      style={{ marginTop: 13, paddingTop: 12, borderTop: '1px solid var(--color-border)', ...style }}
    >
      <span
        className="bof-orb"
        aria-hidden
        // Yüzde satır içinde, çünkü değere bağlı. Geçişi `@property --bof-p`
        // kaydı sayesinde CSS yapıyor (kayıt olmasa SIÇRARDI).
        style={{ ['--bof-p' as string]: `${oran}%` }}
      >
        <b>{level}</b>
      </span>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.74rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>
          <span>Seviye {level}</span>
          <span
            ref={seriRef}
            title="Seri"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 800, color: streak > 0 ? 'var(--color-accent-ink)' : 'var(--color-text-muted)' }}
          >
            🔥 {streak}
          </span>
          <span className="tnum" style={{ marginLeft: 'auto' }}>
            <AnimatedNumber startAt={ilkInto.current} value={into} /> / {perLevel} XP
          </span>
        </div>
        <div className="bof-bar">
          <i style={{ width: `${oran}%` }} />
        </div>
      </div>
    </div>
  );
}
