'use client';

import { BADGES, badgeProgress } from '@/lib/badges';

/**
 * Rozet rafı — 17 rozetin HEPSİ, kazanılmayanlar kilitli.
 *
 * Önceden yalnız KAZANILMIŞ rozetler yatay hap olarak basılıyordu; hiç rozeti
 * olmayan kullanıcı rozet sisteminin varlığını bile görmüyordu. Kilitli rozeti
 * göstermek "neyi hedefleyeceğim" sorusunu cevaplıyor.
 *
 * `hepsi=false` (başkasının profili) kilitlileri ve sayaçları GİZLER: orada
 * ilerleme çubuğunun olmaması bilinçli bir karardı ve korunuyor — başkasının
 * neyi kaçırdığı bizim göstereceğimiz bir şey değil.
 */
export default function BadgeShelf({
  kazanilan,
  ilerleme = null,
  kategoriRaf,
  hepsi = false,
}: {
  /** Kazanılmış rozet anahtarları. */
  kazanilan: Set<string> | string[];
  /** Sayaçlar için ilerleme; yoksa sayaç çizilmez. */
  ilerleme?: { xp: number; current_streak: number; longest_streak: number; total_correct: number } | null;
  /** Koleksiyon rozetleri için kategori başına okunan/toplam. */
  kategoriRaf?: Record<string, { read: number; total: number }>;
  /** true → 17 rozetin hepsi (kendi profilin). false → yalnız kazanılanlar. */
  hepsi?: boolean;
}) {
  const set = kazanilan instanceof Set ? kazanilan : new Set(kazanilan);
  const liste = hepsi ? BADGES : BADGES.filter((b) => set.has(b.key));
  if (!liste.length) return null;

  return (
    <div className="bof-raf" role="list">
      {liste.map((b) => {
        const acik = set.has(b.key);
        const p = acik ? null : badgeProgress(b.key, ilerleme, kategoriRaf);
        return (
          <div
            key={b.key}
            role="listitem"
            className={acik ? 'bof-rozet acik' : 'bof-rozet'}
            /* Ekran okuyucuya durum METİNLE gider; gri filtre ve opaklık
               yalnız görsel işaret ve tek başına bilgi taşımaz. */
            title={b.desc}
          >
            <span className="c" aria-hidden>{b.emoji}</span>
            <span className="n">{b.name}</span>
            {p && (
              <span className="p tnum">{Math.min(p.simdi, p.hedef)}/{p.hedef}</span>
            )}
            <span className="bof-gizli">
              {b.name} — {acik ? 'kazanıldı' : p ? `kilitli, ${Math.min(p.simdi, p.hedef)} / ${p.hedef}` : 'kilitli'}. {b.desc}
            </span>
          </div>
        );
      })}
    </div>
  );
}
