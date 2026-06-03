'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, minHeight: '100vh', padding: 20, textAlign: 'center', background: 'var(--color-surface)' }}>
      {/* Astro app'tekinin aynısı */}
      <img
        src="https://media3.giphy.com/media/1EmBoG0IL50VIJLWTs/giphy.gif"
        alt="Kayboldum"
        style={{ height: '70vh', width: 'auto', maxWidth: '100%', borderRadius: 16, objectFit: 'contain' }}
      />
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
        Galiba yolumuzu kaybettik.
      </h1>
      <Link
        href="/"
        style={{ marginTop: 4, padding: '10px 22px', background: '#6366f1', color: '#fff', borderRadius: 20, fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'opacity 0.15s' }}
        onMouseOver={e => ((e.target as HTMLElement).style.opacity = '0.85')}
        onMouseOut={e => ((e.target as HTMLElement).style.opacity = '1')}
      >
        Ana sayfaya dön
      </Link>
    </main>
  );
}
