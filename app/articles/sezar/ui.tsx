'use client';

// Sezar makalesinin interaktif modülleri için paylaşılan kabuk.
// (radyoaktivite/ui.tsx ile aynı sözleşme — kanıtlanmış desen.)
//
// Üç kural buradan uygulanır:
//  1. Ekran görüntüsü alınabilirlik → her modülün "durmuş" hâli tek başına anlamlı,
//     köşesinde basementonfire.com işareti var.
//  2. Performans → ağır (GSAP/pin/canvas) modüller görünür alana girene kadar yüklenmez.
//  3. Hareket azaltma → boş kutu değil, statik SVG poster + isteğe bağlı "yine de aç".

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

/* ─────────────────────────────── Palet ─────────────────────────────── */

export const ACCENT = '#e11d48'; // kan (rose-600) — makalenin tema rengi
export const BG = '#0d0709'; // obsidyen-kan siyahı (ArticleShell bg prop'una gider)
export const GOLD = '#d9a441'; // Roma altını — iktidar, zafer, taç
export const MARBLE = '#e8e4de'; // mermer — heykel, Senato
export const ASH = '#8a7f84'; // kül — ölü, geçmiş, kaybeden

/** Üçlü'nün sabit renk kimliği — hem denge diyagramında hem çöküşünde aynı. */
export const TRIUMVIR_COLOR = {
  caesar: ACCENT,
  pompeius: GOLD,
  crassus: '#6ba8c9', // gümüş-mavi: para
} as const;

/* ──────────────────────────── Yardımcılar ──────────────────────────── */

export const prefersReduced = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Pinlenmiş GSAP bölümlerinin (hero, yatay çizelge, Alesia) konumunu tazeler.
 * Bu sayfada onların ÜSTÜNDE yüksekliği sonradan değişen öğeler var (lazy mount
 * olan modüller, açılan Rubicon sonuç ekranı, açılan komplocu kartı). Onlar
 * yükseklik değiştirince pin konumu bayatlar ve bölümler çakışır.
 * Native 'resize' → ScrollTrigger.refresh(). GSAP yoksa zararsız no-op.
 */
export function refreshScroll() {
  if (typeof window === 'undefined') return;
  requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
}

/** Deterministik tr-TR sayı biçimi (binlik "." ondalık ","). Intl KULLANMAZ:
 *  Node ile tarayıcının ICU'su farklı olduğunda hidrasyon uyuşmazlığı doğuyor. */
export function tr(n: number, dec = 0): string {
  if (!Number.isFinite(n)) return '—';
  const neg = n < 0;
  const [int, frac] = Math.abs(n).toFixed(dec).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '−' : '') + grouped + (frac ? ',' + frac : '');
}

/** MÖ/MS etiketi. Negatif yıl = MÖ. (-44 → "MÖ 44", 1453 → "1453") */
export function yearLabel(y: number): string {
  return y < 0 ? `MÖ ${Math.abs(y)}` : `${y}`;
}

/** Deterministik sahte-rastgele: aynı i her zaman aynı değeri verir.
 *  Posterlerde ve SSR'a giren dekoratif dağılımlarda Math.random() YASAK
 *  (hidrasyon uyuşmazlığı) — bunun yerine bu. */
export const rnd = (i: number) => (((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1;

/* ─────────────────── Görünürlük + animasyon kancaları ─────────────────── */

/** Öğe ekrana girdiğinde bir kez true olur (ve öyle kalır). Sayaç/çizim
 *  animasyonlarını tetiklemek için. */
export function useInViewOnce<T extends Element>(ref: RefObject<T | null>, rootMargin = '-15% 0px'): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return seen;
}

/**
 * `active` true olunca 0'dan 1'e giden, ease-out'lu ilerleme. rAF tabanlı,
 * bitince kendini durdurur (uzun ömürlü döngü YOK).
 * Hareket azaltma modunda anında 1 döner — animasyon yok ama sonuç görünür.
 */
export function useProgress(active: boolean, durationMs = 1600): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (prefersReduced()) { setP(1); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / durationMs);
      setP(1 - Math.pow(1 - k, 3)); // ease-out cubic
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, durationMs]);
  return p;
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
        hero ? 'border-white/20 shadow-[0_0_60px_-15px_rgba(225,29,72,0.4)]' : 'border-white/10'
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
 * `minHeight` düzen kaymasını (CLS) önlemek için yeri baştan ayırır — dynamic()
 * loading iskeletinin yüksekliğiyle AYNI olmalı.
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

  // Modül mount olup yükseklik değiştikçe pinli bölümlerin ScrollTrigger
  // konumunu tazele: hemen (poster→iskelet) ve sonra (dynamic chunk yüklenince).
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
      className={`min-h-[38px] rounded-full px-3.5 py-2 text-sm font-semibold transition ${
        active ? '' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
      }`}
      style={active ? { background: color, color: BG } : undefined}
    >
      {children}
    </button>
  );
}

/** Başparmak menzilinde, en az 44px dokunma hedefli düğme. */
export function ActionButton({
  onClick, children, tone = 'accent', disabled, full,
}: { onClick: () => void; children: ReactNode; tone?: 'accent' | 'ghost' | 'gold'; disabled?: boolean; full?: boolean }) {
  const base = `min-h-[44px] rounded-xl px-4 text-sm font-bold transition disabled:opacity-40 ${full ? 'w-full' : ''}`;
  if (tone === 'ghost') {
    return <button onClick={onClick} disabled={disabled} className={`${base} border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10`}>{children}</button>;
  }
  if (tone === 'gold') {
    return <button onClick={onClick} disabled={disabled} className={`${base} hover:brightness-110`} style={{ background: GOLD, color: BG }}>{children}</button>;
  }
  return <button onClick={onClick} disabled={disabled} className={`${base} hover:brightness-110`} style={{ background: ACCENT, color: BG }}>{children}</button>;
}

/** Kaynağı belirsiz/tartışmalı bir detayın yanına konan küçük tarihsel not. */
export function SourceNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 border-l-2 pl-3 text-xs leading-relaxed text-slate-500" style={{ borderColor: `color-mix(in srgb, ${GOLD} 40%, transparent)` }}>
      <span className="font-semibold" style={{ color: `color-mix(in srgb, ${GOLD} 80%, white)` }}>Tarihsel not · </span>
      {children}
    </p>
  );
}
