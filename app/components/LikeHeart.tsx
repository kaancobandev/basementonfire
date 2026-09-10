'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

/**
 * Sitedeki TEK kalp çizimi.
 *
 * Önceden bu path 13 ayrı dosyada elle kopyalanmıştı: 5 farklı boyut, dolu/boş
 * için iki ayrı bileşen, üç yerde token yerine sabit `#ef4444`. Görünümün
 * tamamı artık `globals.css`teki `.bof-like` kuralında; buradaki iş sadece
 * durumu `aria-pressed`e yazmak.
 */
const KALP =
  'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z';

/** Tıklanamayan kalp — ızgara örtülerindeki ve lightbox'taki salt sayaç. */
export function HeartGlyph({
  size = 14,
  filled = true,
  style,
}: {
  size?: number;
  filled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={filled ? undefined : 2}
      aria-hidden
      style={style}
    >
      <path d={KALP} />
    </svg>
  );
}

export default function LikeHeart({
  liked,
  count,
  onToggle,
  size = 22,
  disabled,
  className,
  style,
  children,
}: {
  liked: boolean;
  /** Verilirse kalbin yanına düz bir `.tnum` olarak basılır. */
  count?: number;
  /** Sayacını kendi animasyonuyla basan yerler (akış) bunu kullanır — düğmenin
   *  İÇİNDE kalır, yani sayıya basmak da beğenir ve rengi düğmeden miras alır. */
  children?: ReactNode;
  onToggle: () => void;
  size?: number;
  disabled?: boolean;
  className?: string;
  /** Yerleşim (gap/padding/font) çağrı yerinde kalır. ⚠ `color` YAZMA — inline stil CSS'i ezer, renk için `--bof-like-idle` / `--bof-like-on` kullan. */
  style?: CSSProperties;
}) {
  // Zıplama yalnız bir SÜS. Kalbin dolu/boş görünümü buna hiç bağlı değil —
  // eski beğeni hatası tam olarak görünümün animasyona bağlanmasından çıkmıştı.
  const [zipla, setZipla] = useState(false);
  const ilkRender = useRef(true);

  useEffect(() => {
    // Montajda zıplama: zaten beğenilmiş bir gönderi ekrana girerken oynamasın.
    if (ilkRender.current) {
      ilkRender.current = false;
      return;
    }
    // Beğenince aç, geri alınca KAPAT. Kapanması şart: attribute silinmezse
    // bir sonraki beğenide yeniden eklenmiş olmaz ve animasyon restart etmez.
    setZipla(liked);
  }, [liked]);

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={liked}
      aria-label={liked ? 'Beğeniyi geri al' : 'Beğen'}
      className={className ? `bof-like ${className}` : 'bof-like'}
      style={{ ['--bof-like-size' as string]: `${size}px`, ...style }}
    >
      {/* TEK ve KALICI svg: `liked` ile key'lenmez, koşullu render edilmez,
          iki ikon bileşeni arasında geçiş yaptırılmaz. fill/stroke attribute
          YAZILMAZ — CSS'ten gelir, yoksa iki kaynak doğruluk olur. */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden
        data-bump={zipla ? '' : undefined}
        onAnimationEnd={() => setZipla(false)}
      >
        <path d={KALP} />
      </svg>
      {typeof count === 'number' && <span className="tnum">{count}</span>}
      {children}
    </button>
  );
}
