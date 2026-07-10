'use client';

// Radyoaktivite makalesinin interaktif modülleri için paylaşılan kabuk.
//
// Üç kural buradan uygulanır (tasarım notlarından):
//  1. Ekran görüntüsü alınabilirlik → her modül köşesinde basementonfire.com işareti,
//     ve "durdurulmuş" hâli tek başına anlamlı görünür.
//  2. Performans → ağır (canvas/ses) modüller görünür alana girene kadar yüklenmez.
//  3. Hareket azaltma → boş kutu değil, statik bir SVG poster + isteğe bağlı "yine de aç".

import { useEffect, useRef, useState, type ReactNode } from 'react';

export const ACCENT = '#a3e635'; // radyum parıltısı (lime-400)

// Işıma türlerinin sabit renk kimliği — tüm modüllerde aynı.
export const RAY = {
  alpha: { key: 'alpha', label: 'Alfa', symbol: 'α', color: '#fbbf24' },
  beta: { key: 'beta', label: 'Beta', symbol: 'β', color: '#22d3ee' },
  gamma: { key: 'gamma', label: 'Gama', symbol: 'γ', color: '#c084fc' },
} as const;
export type RayKey = keyof typeof RAY;

export const prefersReduced = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Deterministik tr-TR sayı biçimi (binlik "." ondalık ","). Intl KULLANMAZ:
 *  Node ile tarayıcının ICU'su farklı olduğunda hidrasyon uyuşmazlığı doğuyor. */
export function tr(n: number, dec = 0): string {
  if (!Number.isFinite(n)) return '—';
  const neg = n < 0;
  const [int, frac] = Math.abs(n).toFixed(dec).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '−' : '') + grouped + (frac ? ',' + frac : '');
}

/** Çok büyük/küçük süreleri okunur hâle getirir: 6 saat → 4,5 milyar yıl. */
export function humanTime(seconds: number): string {
  const MIN = 60, HR = 3600, DAY = 86400, YR = 3.1557e7;
  if (seconds < 1e-3) return `${tr(seconds * 1e6, 0)} mikrosaniye`;
  if (seconds < 1) return `${tr(seconds * 1e3, 0)} milisaniye`;
  if (seconds < MIN) return `${tr(seconds, 1)} saniye`;
  if (seconds < HR) return `${tr(seconds / MIN, 1)} dakika`;
  if (seconds < DAY) return `${tr(seconds / HR, 1)} saat`;
  if (seconds < YR) return `${tr(seconds / DAY, 1)} gün`;
  const y = seconds / YR;
  if (y < 1e3) return `${tr(y, 1)} yıl`;
  if (y < 1e6) return `${tr(y, 0)} yıl`;
  if (y < 1e9) return `${tr(y / 1e6, y / 1e6 < 10 ? 1 : 0)} milyon yıl`;
  return `${tr(y / 1e9, 2)} milyar yıl`;
}

/* ─────────────────────────── Modül çerçevesi ─────────────────────────── */

export function WidgetFrame({
  title, kicker, hint, children, hero = false, footnote,
}: {
  title: string; kicker?: string; hint?: string; children: ReactNode; hero?: boolean; footnote?: ReactNode;
}) {
  return (
    <figure
      className={`relative overflow-hidden rounded-2xl border bg-white/[0.04] p-4 pb-7 backdrop-blur sm:p-5 sm:pb-7 ${
        hero ? 'border-white/20 shadow-[0_0_60px_-15px_rgba(163,230,53,0.35)]' : 'border-white/10'
      }`}
    >
      <figcaption className="mb-4">
        {kicker && (
          <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: ACCENT }}>
            {kicker}
          </div>
        )}
        <h3 className="text-base font-bold leading-snug text-white sm:text-lg">{title}</h3>
        {hint && <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{hint}</p>}
      </figcaption>

      {children}

      {footnote && <div className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-slate-500">{footnote}</div>}

      <span
        aria-hidden
        className="pointer-events-none absolute bottom-2 right-3 select-none font-mono text-[0.55rem] tracking-wider text-white/25"
      >
        basementonfire.com
      </span>
    </figure>
  );
}

/* ───────────────── Görünür alana girince yükle (lazy) ───────────────── */

/**
 * Ağır modülü yalnızca ekrana yaklaşınca mount eder. Hareket azaltma modunda
 * hiç mount etmez; yerine `poster` (statik SVG) + "yine de aç" düğmesi gösterir.
 * `minHeight` düzen kaymasını (CLS) önlemek için yeri baştan ayırır.
 */
export function InView({
  poster, children, minHeight = 340,
}: { poster: ReactNode; children: ReactNode; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [forced, setForced] = useState(false);

  useEffect(() => {
    if (prefersReduced()) { setReduced(true); return; }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { rootMargin: '250px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const active = visible || forced;

  return (
    <div ref={ref} style={{ minHeight: active ? undefined : minHeight }}>
      {active ? children : (
        <div className="relative">
          {poster}
          {reduced && (
            <button
              onClick={() => setForced(true)}
              className="mt-3 w-full rounded-xl border px-4 py-2.5 text-sm font-bold transition hover:brightness-110"
              style={{ color: ACCENT, borderColor: `color-mix(in srgb, ${ACCENT} 35%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 10%, transparent)` }}
            >
              ▶ Etkileşimli sürümü yine de aç
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Ağır modül indirilirken görünen iskelet (next/dynamic `loading`). */
export function WidgetSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="grid animate-pulse place-items-center rounded-xl border border-white/10 bg-black/30"
      style={{ height }}
      aria-label="Modül yükleniyor"
    >
      <span className="text-xs text-slate-500">yükleniyor…</span>
    </div>
  );
}

/* ─────────────────────────── Küçük parçalar ─────────────────────────── */

export function Stat({ value, label, color = ACCENT, mono = true }: { value: ReactNode; label: string; color?: string; mono?: boolean }) {
  return (
    <div
      className="rounded-xl border p-3 text-center"
      style={{ borderColor: `color-mix(in srgb, ${color} 30%, transparent)`, background: `color-mix(in srgb, ${color} 10%, transparent)` }}
    >
      <div className={`text-xl font-bold leading-tight sm:text-2xl ${mono ? 'font-mono' : ''}`} style={{ color }}>{value}</div>
      <div className="mt-0.5 text-[0.68rem] leading-tight text-slate-400">{label}</div>
    </div>
  );
}

export function Chip({ active, color = ACCENT, onClick, children }: { active: boolean; color?: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
        active ? 'text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
      }`}
      style={active ? { background: color } : undefined}
    >
      {children}
    </button>
  );
}

/** Başparmak menzilinde, en az 44px dokunma hedefli düğme. */
export function ActionButton({
  onClick, children, tone = 'accent', disabled,
}: { onClick: () => void; children: ReactNode; tone?: 'accent' | 'ghost' | 'stop'; disabled?: boolean }) {
  const base = 'min-h-[44px] rounded-xl px-4 text-sm font-bold transition disabled:opacity-40';
  if (tone === 'ghost') return <button onClick={onClick} disabled={disabled} className={`${base} border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10`}>{children}</button>;
  if (tone === 'stop') return <button onClick={onClick} disabled={disabled} className={`${base} bg-rose-500 text-rose-950 hover:bg-rose-400`}>{children}</button>;
  return <button onClick={onClick} disabled={disabled} className={`${base} text-[#04120c] hover:brightness-110`} style={{ background: ACCENT }}>{children}</button>;
}
