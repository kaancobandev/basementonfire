'use client';

// Uygulama segmentinde yakalanmayan bir hata olursa markasız Next.js ekranı yerine
// bu görünür. Kök layout (sidebar/nav) etrafta kalır → kullanıcı gezinmeye devam
// edebilir. Kök layout'un KENDİSİ çökerse global-error.tsx devreye girer.

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Bayat sekme × yeni deploy → ChunkLoadError.
 *
 * Netlify'a her push bir deploy demek ve deploy parça (chunk) adlarını
 * değiştiriyor. Sayfası AÇIK duran bir ziyaretçinin HTML'i eski build'e ait
 * olduğu için, o sırada lazy bir modüle (dynamic import) gelirse artık var
 * olmayan bir dosyayı ister → 404 → ChunkLoadError. Sunucu 404 gövdesini
 * text/plain döndürdüğü için tarayıcı ayrıca "MIME type not executable" der;
 * o ikinci mesaj sonuç, sebep değil.
 *
 * `reset()` bunu ÇÖZMEZ: yeniden render aynı ölü URL'i tekrar ister. Tek çözüm
 * sayfayı baştan yükleyip yeni HTML'i (ve yeni parça adlarını) almak.
 *
 * ⚠ Sonsuz döngü koruması: hata yeniden yüklemeyle geçmiyorsa (gerçekten kırık
 * bir deploy) bir kez denenir, sonra normal hata ekranı gösterilir.
 */
const PARCA_HATASI = /ChunkLoadError|Loading chunk \S+ failed|Failed to fetch dynamically imported module|error loading dynamically imported module/i;
const ANAHTAR = 'bof:chunk-reload';

function parcaHatasiMi(e: Error) {
  return e?.name === 'ChunkLoadError' || PARCA_HATASI.test(e?.message ?? '');
}

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [yenileniyor, setYenileniyor] = useState(false);

  useEffect(() => {
    console.error('[app error]', error);

    if (!parcaHatasiMi(error)) return;
    try {
      const son = Number(sessionStorage.getItem(ANAHTAR) || 0);
      // Son 20 sn içinde zaten denediysek tekrar deneme — döngüye girmeyelim.
      if (Date.now() - son < 20_000) return;
      sessionStorage.setItem(ANAHTAR, String(Date.now()));
    } catch { /* sessionStorage kapalıysa yine de bir kez dene */ }
    setYenileniyor(true);
    location.reload();
  }, [error]);

  if (yenileniyor) {
    return (
      <main className="main-content" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '.95rem' }}>Sayfa yenileniyor…</p>
      </main>
    );
  }

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
