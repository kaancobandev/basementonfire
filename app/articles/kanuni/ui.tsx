'use client';

// Kanuni makalesinin interaktif modülleri için paylaşılan kabuk + palet.
// (sezar/augustus/fatih ui.tsx ile aynı sözleşme.)
//
// TEZ: kanunu yazan adamın kendi kanununa yenilmesi. Palet İZNİK: kobalt gece
// zemin (divan, mürekkep, gece infazları) + turkuaz (nizam, su, düzen) + altın
// (tuğra, taç, Batı’nın gördüğü ihtişam) + mercan kırmızısı (kesme, infaz —
// AZ kullanılır; Perde 5’ten sonra sayfaya sızar).

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

/* ─────────────────────────────── Palet ─────────────────────────────── */

export const ACCENT = '#2fb8ae'; // İznik turkuazı — nizam, düzen, kanun
export const BG = '#070c1e'; // kobalt gece — divan, mürekkep, otağ
export const GOLD = '#d9a441'; // tuğra, dört taçlı miğfer, "Muhteşem"
export const CORAL = '#dd4b3e'; // İznik mercanı — infaz, kesme, sınır
export const COBALT = '#3355c4'; // çini mavisi — ferman, hukuk metni
export const MARBLE = '#e8e6df'; // Süleymaniye mermeri
export const ASH = '#7c8190'; // kül — belirsiz, tartışmalı, ölü

/** data.ts’teki renk jetonlarını (string) gerçek hex’e çevirir. */
export const tokenHex: Record<string, string> = {
  accent: ACCENT, gold: GOLD, coral: CORAL, cobalt: COBALT, marble: MARBLE, ash: ASH,
};

/* ──────────────────────────── Yardımcılar ──────────────────────────── */

export const prefersReduced = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * SSR-güvenli reduced-motion okuması: ilk (hidrasyon) render’da HER ZAMAN false
 * döner, mount sonrası gerçeğe geçer → SSR’a giren widget’larda hidrasyon
 * uyuşmazlığı olmaz.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => { setReduced(prefersReduced()); }, []);
  return reduced;
}

/** Pinlenmiş GSAP bölümlerinin konumunu tazeler (açılan kart → yükseklik değişimi). */
export function refreshScroll() {
  if (typeof window === 'undefined') return;
  requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
}

/** Deterministik tr-TR sayı biçimi. Intl KULLANMAZ: Node ile tarayıcının ICU’su
 *  ayrıştığında hidrasyon uyuşmazlığı doğuyor. */
export function tr(n: number, dec = 0): string {
  if (!Number.isFinite(n)) return '—';
  const neg = n < 0;
  const [int, frac] = Math.abs(n).toFixed(dec).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '−' : '') + grouped + (frac ? ',' + frac : '');
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Deterministik sahte-rastgele (posterler; Math.random YASAK — SSR tutarlılığı). */
export const rnd = (i: number) => (((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1;

/* ─────────────────── Görünürlük + animasyon kancaları ─────────────────── */

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

/* ─────────────────────────── Modül çerçevesi ─────────────────────────── */

export function WidgetFrame({
  title, kicker, hint, children, hero = false, footnote,
}: {
  title: string; kicker?: string; hint?: string; children: ReactNode; hero?: boolean; footnote?: ReactNode;
}) {
  return (
    <figure
      className={`relative overflow-hidden rounded-2xl border bg-white/[0.035] p-4 pb-7 backdrop-blur sm:p-5 sm:pb-7 ${
        hero ? 'border-white/20 shadow-[0_0_60px_-15px_rgba(47,184,174,0.4)]' : 'border-white/10'
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

export function ActionButton({
  onClick, children, tone = 'accent', disabled, full,
}: { onClick: () => void; children: ReactNode; tone?: 'accent' | 'ghost' | 'coral' | 'gold'; disabled?: boolean; full?: boolean }) {
  const base = `min-h-[44px] rounded-xl px-4 text-sm font-bold transition disabled:opacity-40 ${full ? 'w-full' : ''}`;
  if (tone === 'ghost') {
    return <button onClick={onClick} disabled={disabled} className={`${base} border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10`}>{children}</button>;
  }
  if (tone === 'coral') {
    return <button onClick={onClick} disabled={disabled} className={`${base} hover:brightness-110`} style={{ background: CORAL, color: '#fff' }}>{children}</button>;
  }
  if (tone === 'gold') {
    return <button onClick={onClick} disabled={disabled} className={`${base} hover:brightness-110`} style={{ background: GOLD, color: BG }}>{children}</button>;
  }
  return <button onClick={onClick} disabled={disabled} className={`${base} hover:brightness-110`} style={{ background: ACCENT, color: BG }}>{children}</button>;
}

/** Kaynağı belirsiz/tartışmalı bir detayın yanına konan küçük tarihsel not. */
export function SourceNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 border-l-2 pl-3 text-xs leading-relaxed text-slate-500" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 45%, transparent)` }}>
      <span className="font-semibold" style={{ color: `color-mix(in srgb, ${ACCENT} 82%, white)` }}>Tarihsel not · </span>
      {children}
    </p>
  );
}

/** "Bu anlatı tartışmalı" kutusu (42 gün, kardeş katli maddesi, entrika anlatısı). */
export function MythNote({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-4 rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${ASH} 40%, transparent)`, background: `color-mix(in srgb, ${ASH} 8%, transparent)` }}>
      <div className="mb-1 flex items-center gap-2 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: `color-mix(in srgb, ${ASH} 85%, white)` }}>
        <span aria-hidden>⚠</span> KAYNAKLAR NE DİYOR?
      </div>
      <div className="text-sm font-semibold text-slate-200">{title}</div>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{children}</p>
    </div>
  );
}
