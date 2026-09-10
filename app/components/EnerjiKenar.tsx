'use client';

import Link from 'next/link';
import EnergyCard from '@/app/components/EnergyCard';
import { useNavIlerleme } from '@/app/components/NavUserContext';

/**
 * Kenar çubuğundaki enerji kartı — seviye, XP barı, seri.
 *
 * Veri `/api/nav-state`in MEVCUT paralel dalgasından geliyor; bu bileşen
 * hiçbir istek atmıyor. Ölçüldü (10.09.2026, canlı DB, 7 tur, en iyi süreler):
 * dalgaya dördüncü sorguyu eklemek 93 → 87 ms, yani fark gürültü içinde;
 * ardışık ek bir tur ise 148 ms olurdu. Bu projede gecikme sorgu sayısında
 * değil TUR sayısında.
 *
 * ⚠ Kenar çubuğu 699px altında tamamen gizli. Bu kart masaüstüne özel; telefonda
 * aynı ilerleme Günün Sorusu kartının içinde görünüyor.
 */
export default function EnerjiKenar() {
  const p = useNavIlerleme();
  // undefined = nav-state daha gelmedi, null = çıkışlı. İkisinde de çizme;
  // yer tutmuyor, dolayısıyla geç gelmesi menüyü aşağı itmiyor.
  if (!p) return null;

  return (
    <Link
      /* Hedef /lig DEĞİL /profile: kartın anlattığı şeyin tamamı orada —
         seviye, seri, ve 17 rozetlik raf. Lig ayrı bir soru (başkalarına
         göre neredeyim) ve sağ panelde kendi widget'ı var. */
      href="/profile"
      prefetch={false}
      /* Uçan XP çipinin hedefi. Masaüstünde bu görünür, telefonda kenar
         çubuğu gizli olduğu için ölçüsü sıfır kalır ve çip karttaki bara gider. */
      data-bof-enerji-kenar=""
      aria-label={`Seviye ${p.level}, ${p.intoLevel} / ${p.perLevel} XP, ${p.current_streak} günlük seri`}
      style={{
        display: 'block', margin: '4px 0 8px', padding: '10px 12px',
        borderRadius: 14, border: '1px solid var(--color-border)',
        background: 'var(--color-surface)', textDecoration: 'none', color: 'inherit',
      }}
    >
      {/* EnergyCard'ın kendi üst kenarlığı/boşluğu Günün Sorusu kartı içindi;
          burada kutunun kendisi var, o yüzden sıfırlanıyor. */}
      <EnergyCard
        level={p.level}
        into={p.intoLevel}
        perLevel={p.perLevel}
        streak={p.current_streak}
        style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}
      />
    </Link>
  );
}
