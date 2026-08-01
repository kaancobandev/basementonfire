'use client';

// Atilla makalesinin interaktif modülleri için paylaşılan kabuk + palet.
// (sezar/augustus/fatih/kanuni ui.tsx ile aynı sözleşme.)
//
// TEZ: bozkırdan geldi, öldü, geriye efsanesi kaldı.
//
// PALET — BOZKIR GECESİ. Kanuni'nin kobalt/turkuazından ve Fatih'in takıntı
// mavisinden bilerek uzak, çünkü bu makale bir saray makalesi değil:
//   • BG yanık toprak siyahı — otağ, gece, kül
//   • ACCENT kor turuncusu — ateş, hareket, canlılık (SICAK; bu halk soğuk
//     ve uzak çizilmeyecek, kural 2)
//   • GARNET — Hun elit kuyumculuğunun cloisonné taşı; kılıcın kakması
//   • BONE kemik beyazı — metin vurgusu, kaynak
//   • IRON — belirsizlik, tartışmalı kaynak, ölçülemeyen
//   • GOLD — haraç. SADECE haraç ve miras bağlamında kullanılır ki
//     Perde 5'te sayfaya altın sızdığında okur bunu hissetsin.

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

/* ─────────────────────────────── Palet ─────────────────────────────── */

export const ACCENT = '#e2622b'; // kor turuncusu — ölçüldü: BG üstünde 5.75:1 (AA ✓)
export const BG = '#0a0706'; // yanık toprak siyahı
export const GARNET = '#c8324a'; // cloisonné taşı (kakma #a01f2d'nin metinde okunur tonu)
export const BONE = '#e8ded0'; // kemik
export const IRON = '#8b95a6'; // soğuk demir — belirsiz/tartışmalı
export const GOLD = '#d9a441'; // haraç ve miras
export const ASH = '#7a7269'; // kül — MythNote

/** data.ts'teki renk jetonlarını (string) gerçek hex'e çevirir. */
export const tokenHex: Record<string, string> = {
  accent: ACCENT, ember: ACCENT, garnet: GARNET, bone: BONE, iron: IRON, gold: GOLD, ash: ASH,
};

/* ──────────────────────────── Yardımcılar ──────────────────────────── */

export const prefersReduced = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * SSR-güvenli reduced-motion okuması: ilk (hidrasyon) render'da HER ZAMAN false
 * döner, mount sonrası gerçeğe geçer → SSR'a giren widget'larda hidrasyon
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

/** Deterministik tr-TR sayı biçimi. Intl KULLANMAZ: Node ile tarayıcının ICU'su
 *  ayrıştığında hidrasyon uyuşmazlığı doğuyor. */
export function tr(n: number, dec = 0): string {
  if (!Number.isFinite(n)) return '—';
  const neg = n < 0;
  const [int, frac] = Math.abs(n).toFixed(dec).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '−' : '') + grouped + (frac ? ',' + frac : '');
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * TÜRKÇE BÜYÜK HARF. Düz `toUpperCase()` KULLANMA.
 *
 * ⚠ ÖLÇÜLDÜ (2026-08-01): savaş animasyonunun faz başlığı ekranda "FAZ 1 ·
 * DIZILIŞ" çıkıyordu — "Diziliş" kelimesindeki `i`, `İ` değil `I` oluyor.
 * Aynı hata "MILANO'DAKI TABLO", "TALEBI KABUL ET", "ATILLA'NIN KARARGÂHI"
 * gibi her kicker'da tekrarlıyordu.
 *
 * NİYE `toLocaleUpperCase('tr-TR')` DEĞİL: o çağrı ortamın ICU verisine bağlı;
 * Node ile tarayıcı ayrışırsa SSR/hidrasyon uyuşmazlığı doğar. `i → İ` elle
 * çevrilip sonra toUpperCase çağrılıyor → sonuç her ortamda AYNI string.
 * (Aynı ders `CATEGORY_SLUG`'un elle harita yazılmasına yol açmıştı.)
 */
export const buyuk = (s: string) => s.replace(/i/g, 'İ').toUpperCase();

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
        hero ? 'border-white/20 shadow-[0_0_60px_-15px_rgba(226,98,43,0.45)]' : 'border-white/10'
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
}: { onClick: () => void; children: ReactNode; tone?: 'accent' | 'ghost' | 'garnet' | 'gold'; disabled?: boolean; full?: boolean }) {
  const base = `min-h-[44px] rounded-xl px-4 text-sm font-bold transition disabled:opacity-40 ${full ? 'w-full' : ''}`;
  if (tone === 'ghost') {
    return <button onClick={onClick} disabled={disabled} className={`${base} border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10`}>{children}</button>;
  }
  if (tone === 'garnet') {
    return <button onClick={onClick} disabled={disabled} className={`${base} hover:brightness-110`} style={{ background: GARNET, color: '#fff' }}>{children}</button>;
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

/** "Bu anlatı tartışmalı" kutusu (deprem tarihi, haraç tutarı, Bleda, ölüm). */
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

/**
 * "BU KELİMEYİ SÖKÜYORUZ" kutusu — bu makaleye özel.
 * Kural 2'nin görünür hâli: Roma'nın kategorilerini (barbar, vahşi, istilacı)
 * kullanmak yerine kelimenin nereden geldiğini gösterip kenara koyuyoruz.
 */
export function WordNote({ word, children }: { word: string; children: ReactNode }) {
  return (
    <div className="mt-5 rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${BONE} 26%, transparent)`, background: `color-mix(in srgb, ${BONE} 6%, transparent)` }}>
      <div className="mb-1.5 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: `color-mix(in srgb, ${BONE} 75%, ${ACCENT})` }}>
        KELİMENİN KENDİSİ
      </div>
      <div className="font-mono text-base font-bold" style={{ color: BONE }}>{word}</div>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{children}</p>
    </div>
  );
}
