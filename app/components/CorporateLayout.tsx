import Link from 'next/link';
import type { ReactNode, CSSProperties } from 'react';

/**
 * KURUMSAL SAYFA KABUĞU — /hakkimizda, /teknoloji, /basin, /iletisim.
 *
 * LegalLayout'un kardeşi ama AYRI: hukuki metinler kendi aralarında gezinir
 * (KVKK aydınlatma ↔ açık rıza ayrı belge olmak ZORUNDA), kurumsal sayfalar
 * kendi aralarında. İkisini tek bileşende birleştirmek nav'ı sekiz sekmeye
 * çıkarır ve iki farklı okuyucu kitlesini birbirine karıştırır.
 *
 * Stil sabitleri LegalLayout'tan İÇE AKTARILMAZ, burada tekrar tanımlanır:
 * kurumsal sayfalar hukuki metinden daha büyük punto ve daha geniş kolon
 * kullanır (okunması gereken metin değil, taranan metin).
 */

export const h2: CSSProperties = { fontSize: '1.25rem', fontWeight: 800, margin: '34px 0 8px', letterSpacing: '-0.01em' };
export const h3: CSSProperties = { fontSize: '1rem', fontWeight: 700, margin: '20px 0 5px' };
export const p: CSSProperties = { margin: '0 0 12px', fontSize: '0.97rem' };
export const ul: CSSProperties = { margin: '0 0 12px', paddingLeft: 20, fontSize: '0.97rem' };
export const linkStyle: CSSProperties = { color: 'var(--color-primary)', fontWeight: 700 };

export const table: CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', margin: '0 0 14px' };
export const th: CSSProperties = { textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--color-border)', fontWeight: 700, verticalAlign: 'top' };
export const td: CSSProperties = { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'top' };

/** Çerçeveli vurgu kutusu — "şunu bil" kutuları için. */
export function Kutu({ children, ton = 'notr' }: { children: ReactNode; ton?: 'notr' | 'vurgu' }) {
  const vurgu = ton === 'vurgu';
  return (
    <div
      style={{
        border: `1px solid ${vurgu ? 'var(--color-primary)' : 'var(--color-border)'}`,
        background: vurgu ? 'var(--color-primary-soft)' : 'var(--color-surface)',
        borderRadius: 12,
        padding: '13px 15px',
        margin: '0 0 14px',
        fontSize: '0.93rem',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Sayı ızgarası — "sıfat değil, sayı" kuralının kurumsal sayfalardaki karşılığı.
 * Değerler ÇAĞIRAN sayfada türetilir (lib/articles.ts vb.), burada elle yazılmaz.
 */
export function Sayilar({ items }: { items: { n: string; label: string }[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 10,
        margin: '0 0 18px',
      }}
    >
      {items.map((it) => (
        <div
          key={it.label}
          style={{
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            borderRadius: 12,
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{it.n}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 3 }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

const SAYFALAR = [
  { href: '/hakkimizda', label: 'Hakkımızda' },
  { href: '/teknoloji', label: 'Teknoloji' },
  { href: '/yol-haritasi', label: 'Yol Haritası' },
  { href: '/basin', label: 'Basın' },
  { href: '/iletisim', label: 'İletişim' },
];

export default function CorporateLayout({
  title, lede, updated, children,
}: { title: string; lede?: string; updated?: string; children: ReactNode }) {
  return (
    <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '26px 18px 72px', color: 'var(--color-text)', lineHeight: 1.7 }}>
        <Link href="/" style={{ ...linkStyle, fontSize: '0.85rem', textDecoration: 'none' }}>← Ana sayfa</Link>

        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '14px 0 6px', letterSpacing: '-0.02em' }}>{title}</h1>
        {lede && (
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', margin: '0 0 16px', lineHeight: 1.6 }}>{lede}</p>
        )}

        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '0 0 26px' }}>
          {SAYFALAR.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              style={{
                fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none',
                padding: '5px 11px', borderRadius: 9999,
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)', background: 'var(--color-surface)',
              }}
            >
              {s.label}
            </Link>
          ))}
        </nav>

        {children}

        {updated && (
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '34px 0 0', borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
            Son güncelleme: {updated}
          </p>
        )}
      </div>
    </main>
  );
}
