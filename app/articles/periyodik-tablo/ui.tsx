'use client';

// Periyodik tablo makalesinin paylaşılan kabuğu, paleti ve yardımcıları.
// radyoaktivite/ui.tsx sözleşmesiyle aynı; palet ve makaleye özel parçalar farklı.
//
// Üç kural buradan uygulanır:
//  1. Ekran görüntüsü alınabilirlik → her modülün köşesinde basementonfire.com.
//  2. Performans → ağır modüller görünür alana girene kadar yüklenmez.
//  3. Hareket azaltma → boş kutu değil, statik SVG poster + "yine de aç".

import { useEffect, useRef, useState, type ReactNode } from 'react';

export const ACCENT = '#e879f9'; // fuşya — mevcut 20 makale accent'inin hiçbirine yakın değil
export const BG = '#0a0716';

/**
 * BLOK RENK KİMLİĞİ — bu makalenin en önemli sabiti.
 * s/p/d/f dört blok, TÜM modüllerde aynı renkle görünür (tablo, orbital
 * animasyonu, trend grafiği, posterler). Makalenin tezi "tablonun şekli orbital
 * doldurmasından çıkıyor" olduğu için renk burada süs değil, ARGÜMAN: okur aynı
 * dört rengi üç ayrı modülde görüp bağlantıyı kendi kuruyor.
 * radyoaktivite'deki RAY sabitiyle birebir aynı rol.
 */
export const BLOK = {
  s: { key: 's', label: 's bloğu', kapasite: 2, color: '#60a5fa', aciklama: 'Küresel orbital. İki elektron alır.' },
  p: { key: 'p', label: 'p bloğu', kapasite: 6, color: '#4ade80', aciklama: 'İki loblu dambıl, üç yönde. Altı elektron.' },
  d: { key: 'd', label: 'd bloğu', kapasite: 10, color: '#fbbf24', aciklama: 'Dört loblu yonca, beş yönelim. On elektron.' },
  f: { key: 'f', label: 'f bloğu', kapasite: 14, color: '#e879f9', aciklama: 'Yedi yönelim, karmaşık loblar. On dört elektron.' },
} as const;
export type BlokKey = keyof typeof BLOK;

export const prefersReduced = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Pinlenmiş HorizontalTimeline'ın ScrollTrigger konumunu tazeler (GSAP yoksa no-op). */
export function refreshScroll() {
  if (typeof window === 'undefined') return;
  requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
}

/** Deterministik tr-TR sayı biçimi. Intl KULLANMAZ: Node ile tarayıcının ICU'su
 *  ayrışınca hidrasyon kırılıyor (projede yaşandı). */
export function tr(n: number, dec = 0): string {
  if (!Number.isFinite(n)) return '—';
  const neg = n < 0;
  const [int, frac] = Math.abs(n).toFixed(dec).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '−' : '') + grouped + (frac ? ',' + frac : '');
}

/** Türkçe büyük harf: toUpperCase() 'i'yi 'I' yapar, 'İ' değil. ICU'ya güvenme. */
export function buyuk(s: string): string {
  const m: Record<string, string> = { i: 'İ', 'ı': 'I', 'ş': 'Ş', 'ğ': 'Ğ', 'ü': 'Ü', 'ö': 'Ö', 'ç': 'Ç' };
  return s.split('').map((c) => m[c] ?? c.toUpperCase()).join('');
}

export const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

/** Elektron dizilimini üst simgeli parçalara böler: "1s2 2s2" → okunur JSX. */
export function dizilim(s: string): ReactNode {
  if (!s) return '—';
  return s.split(' ').filter(Boolean).map((par, i) => {
    const m = par.match(/^(\d+)([spdf])(\d+)$/);
    if (!m) return <span key={i} className="mr-1.5">{par}</span>;
    return (
      <span key={i} className="mr-1.5 whitespace-nowrap">
        {m[1]}<span style={{ color: BLOK[m[2] as BlokKey]?.color }}>{m[2]}</span><sup>{m[3]}</sup>
      </span>
    );
  });
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
        hero ? 'border-white/20 shadow-[0_0_60px_-15px_rgba(232,121,249,0.35)]' : 'border-white/10'
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

  useEffect(() => {
    if (!active) return;
    refreshScroll();
    const t1 = setTimeout(refreshScroll, 150);
    const t2 = setTimeout(refreshScroll, 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active]);

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

export function ActionButton({
  onClick, children, tone = 'accent', disabled,
}: { onClick: () => void; children: ReactNode; tone?: 'accent' | 'ghost'; disabled?: boolean }) {
  const base = 'min-h-[44px] rounded-xl px-4 text-sm font-bold transition disabled:opacity-40';
  if (tone === 'ghost') return <button onClick={onClick} disabled={disabled} className={`${base} border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10`}>{children}</button>;
  return <button onClick={onClick} disabled={disabled} className={`${base} text-[#170520] hover:brightness-110`} style={{ background: ACCENT }}>{children}</button>;
}

/* ────────────────────── Makaleye özel not kutuları ────────────────────── */

/** Mendeleyev'in bir tahmini — tuttu ya da tutmadı, ikisi de aynı kutuda. */
export function TahminNotu({ tuttu, children }: { tuttu: boolean; children: ReactNode }) {
  const c = tuttu ? '#4ade80' : '#fb7185';
  return (
    <div
      className="my-4 flex gap-3 rounded-xl border p-3.5 text-sm leading-relaxed"
      style={{ borderColor: `color-mix(in srgb, ${c} 30%, transparent)`, background: `color-mix(in srgb, ${c} 8%, transparent)` }}
    >
      <span className="shrink-0 font-mono text-base font-bold" style={{ color: c }} aria-hidden>
        {tuttu ? '✓' : '✕'}
      </span>
      <div className="text-slate-300">
        <span className="mr-1.5 font-bold" style={{ color: c }}>
          {tuttu ? 'TUTTU' : 'TUTMADI'}
        </span>
        {children}
      </div>
    </div>
  );
}

/** Adlandırma / IUPAC tartışması notu. */
export function AdlandirmaNotu({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
      <div className="mb-1 text-[0.6rem] font-bold tracking-[0.18em] text-slate-500">IUPAC · ADLANDIRMA</div>
      <div className="text-sm leading-relaxed text-slate-300">{children}</div>
    </div>
  );
}
