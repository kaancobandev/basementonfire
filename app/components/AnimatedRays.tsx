'use client';

import { useEffect, useState, type ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// Animasyonlu ışın/aurora arka planı (Ibelick / kullanıcının verdiği bileşen).
// RENK PALETİ kullanıcı isteğiyle: lacivert → mavi → pembe → mor → kırmızı →
// turkuvaz (rainbow gradient). Dikiş olmasın diye ilk renk (lacivert) sonda
// tekrar edilir. Yalnız bu projeye çalışması için gereken 4 işlevsel uyum yapıldı:
//   1) `cn` (@/lib/utils) yok, clsx/tailwind-merge de yok → düz string.
//   2) Tema: proje `.dark` CLASS'ı değil `data-theme` ATTRIBUTE'u kullanır;
//      orijinal kod karanlık modu HİÇ göremezdi → attribute + sistem tercihi.
//   3) `animate-aurora-bg` Tailwind utility'si yok (v4) → keyframe globals.css.
//   4) `background-attachment: fixed` iOS'ta bozuk → kaldırıldı; animasyon
//      background-position ile akıyor, fixed'e gerek yok.
// `--stripe-color` orijinalde tanımsızdı (gradient render olmazdı) → beyaz
// (Ibelick standardı); renk değil, eksik değişkenin doldurulması.
// ─────────────────────────────────────────────────────────────────────────

const stripes = `repeating-linear-gradient(100deg,
  var(--stripe-color) 0%, var(--stripe-color) 7%,
  transparent 10%, transparent 12%, var(--stripe-color) 16%)`;
const rainbow = `repeating-linear-gradient(100deg,
  #1e3a8a 8%, #3b82f6 12%, #ec4899 16%, #a855f7 20%, #ef4444 24%, #2dd4bf 28%, #1e3a8a 32%)`;

export default function AnimatedRays({ className = '', children }: { className?: string; children?: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkDark = () => {
      const t = document.documentElement.getAttribute('data-theme');
      if (t === 'dark') return true;
      if (t === 'light') return false;
      return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;
    };
    setIsDark(checkDark());
    const observer = new MutationObserver(() => setIsDark(checkDark()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  return (
    <section className={`relative h-full w-full overflow-hidden ${className}`} aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          ['--stripe-color' as string]: '#fff',
          backgroundImage: `${stripes}, ${rainbow}`,
          backgroundSize: '300%, 200%',
          backgroundPosition: '50% 50%, 50% 50%',
          filter: isDark
            ? 'blur(10px) opacity(50%) saturate(200%)'
            : 'blur(10px) invert(100%)',
          maskImage: 'radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%)',
        }}
      >
        <div
          className="animate-aurora-bg absolute inset-0"
          style={{
            ['--stripe-color' as string]: '#fff',
            backgroundImage: `${stripes}, ${rainbow}`,
            backgroundSize: '200%, 100%',
            mixBlendMode: 'difference',
          }}
        />
      </div>

      {children && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </section>
  );
}
