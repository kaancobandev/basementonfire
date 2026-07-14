import Link from 'next/link';
import type { ReactNode, CSSProperties } from 'react';

/** Hukuki metin sayfaları (gizlilik, aydınlatma, açık rıza, koşullar) için ortak kabuk. */

export const h2: CSSProperties = { fontSize: '1.12rem', fontWeight: 700, margin: '26px 0 6px' };
export const h3: CSSProperties = { fontSize: '0.98rem', fontWeight: 700, margin: '16px 0 4px' };
export const p: CSSProperties = { margin: '0 0 10px', fontSize: '0.92rem' };
export const ul: CSSProperties = { margin: '0 0 10px', paddingLeft: 20, fontSize: '0.92rem' };
export const linkStyle: CSSProperties = { color: 'var(--color-primary)', fontWeight: 700 };

/** Tablo — "hangi veri / neden / hukuki sebep" gibi dökümler için. */
export const table: CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', margin: '0 0 12px' };
export const th: CSSProperties = { textAlign: 'left', padding: '7px 9px', borderBottom: '2px solid var(--color-border)', fontWeight: 700, verticalAlign: 'top' };
export const td: CSSProperties = { textAlign: 'left', padding: '7px 9px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'top' };

/** Metinler arası gezinme — KVKK aydınlatma ve açık rıza AYRI belgeler olmak zorunda. */
const DOCS = [
  { href: '/gizlilik', label: 'Gizlilik ve Çerez' },
  { href: '/aydinlatma', label: 'KVKK Aydınlatma' },
  { href: '/acik-riza', label: 'Açık Rıza' },
  { href: '/kosullar', label: 'Kullanım Koşulları' },
];

export default function LegalLayout({
  title, updated, intro, children,
}: { title: string; updated: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '26px 18px 64px', color: 'var(--color-text)', lineHeight: 1.7 }}>
        <Link href="/" style={{ ...linkStyle, fontSize: '0.85rem', textDecoration: 'none' }}>← Ana sayfa</Link>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '14px 0 4px' }}>{title}</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 14px' }}>Son güncelleme: {updated}</p>

        {/* Belgeler arası geçiş */}
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '0 0 20px' }}>
          {DOCS.map(d => (
            <Link
              key={d.href}
              href={d.href}
              style={{
                fontSize: '0.76rem', fontWeight: 600, textDecoration: 'none',
                padding: '4px 10px', borderRadius: 9999,
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)', background: 'var(--color-surface)',
              }}
            >
              {d.label}
            </Link>
          ))}
        </nav>

        {intro}
        {children}
      </div>
    </main>
  );
}
