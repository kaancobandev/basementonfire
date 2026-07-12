'use client';

// Kök layout'un KENDİSİ hata verirse çalışır → kendi <html>/<body>'sini render
// eder ve globals.css/next-font'a GÜVENEMEZ (layout hiç kurulmadı). Bu yüzden
// stiller satır-içi ve bağımsız; marka renkleri elle gömülü. Nadir bir durumdur.

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b0917', color: '#f2f0fb', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: 440, padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 6 }} aria-hidden>⚠️</div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 10px' }}>Bir şeyler ters gitti</h1>
          <p style={{ color: '#9d96b8', lineHeight: 1.6, margin: '0 0 24px' }}>
            Beklenmedik bir hata oluştu. Sayfayı yeniden yüklemeyi dene.
            {error?.digest && <><br /><span style={{ fontSize: '.78rem', opacity: .6, fontFamily: 'ui-monospace, monospace' }}>Hata kodu: {error.digest}</span></>}
          </p>
          <button
            onClick={reset}
            style={{ background: '#5b2eef', color: '#fff', border: 'none', borderRadius: 14, padding: '13px 26px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Yeniden dene
          </button>
          <div style={{ marginTop: 16 }}>
            <a href="/" style={{ color: '#8f74ff', fontSize: '.92rem', textDecoration: 'none' }}>Ana sayfaya dön</a>
          </div>
        </div>
      </body>
    </html>
  );
}
