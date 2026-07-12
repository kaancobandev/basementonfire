'use client';

// Uygulama segmentinde yakalanmayan bir hata olursa markasız Next.js ekranı yerine
// bu görünür. Kök layout (sidebar/nav) etrafta kalır → kullanıcı gezinmeye devam
// edebilir. Kök layout'un KENDİSİ çökerse global-error.tsx devreye girer.

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Hatayı sunucu/istemci konsoluna düşür (ileride hata izleme kancası buraya).
    console.error('[app error]', error);
  }, [error]);

  return (
    <main className="main-content" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ fontSize: 46, marginBottom: 6 }} aria-hidden>😵‍💫</div>
        <h1 style={{ fontFamily: 'var(--font-display), system-ui, sans-serif', fontSize: 'clamp(1.6rem, 5vw, 2.1rem)', fontWeight: 800, margin: '0 0 10px', color: 'var(--color-text)' }}>
          Bir şeyler ters gitti
        </h1>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, margin: '0 0 24px' }}>
          Beklenmedik bir hata oluştu. Tekrar deneyebilir ya da ana sayfaya dönebilirsin.
          {error?.digest && <><br /><span style={{ fontSize: '.78rem', opacity: .6, fontFamily: 'ui-monospace, monospace' }}>Hata kodu: {error.digest}</span></>}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', borderRadius: 14, padding: '12px 24px', fontSize: '.98rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Tekrar dene
          </button>
          <Link
            href="/"
            style={{ display: 'inline-flex', alignItems: 'center', padding: '12px 24px', borderRadius: 14, border: '1.5px solid var(--color-border)', color: 'var(--color-text)', fontWeight: 700, fontSize: '.98rem', textDecoration: 'none' }}
          >
            Ana sayfa
          </Link>
        </div>
      </div>
    </main>
  );
}
