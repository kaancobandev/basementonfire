'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GoogleAnalytics } from '@next/third-parties/google';

const STORAGE_KEY = 'cookie-consent'; // 'accepted' | 'rejected'

/**
 * KVKK/GDPR çerez onayı. Google Analytics YALNIZCA ziyaretçi "Kabul Et"
 * dediğinde yüklenir; "Reddet"te hiç yüklenmez. Seçim localStorage'da saklanır
 * ve /gizlilik sayfasındaki "sıfırla" butonuyla geri alınabilir.
 */
export default function CookieConsent({ gaId }: { gaId?: string }) {
  const [choice, setChoice] = useState<'accepted' | 'rejected' | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'accepted' || saved === 'rejected') setChoice(saved);
    } catch {}
    setReady(true);
  }, []);

  function decide(value: 'accepted' | 'rejected') {
    try { localStorage.setItem(STORAGE_KEY, value); } catch {}
    setChoice(value);
  }

  return (
    <>
      {/* GA yalnızca onay verildiyse yüklenir */}
      {gaId && choice === 'accepted' && <GoogleAnalytics gaId={gaId} />}

      {ready && choice === null && (
        <div
          role="dialog"
          aria-label="Çerez onayı"
          style={{
            position: 'fixed', left: 16, right: 16, bottom: 16, zIndex: 1000,
            maxWidth: 560, margin: '0 auto',
            background: 'var(--color-surface)', color: 'var(--color-text)',
            border: '1px solid var(--color-border)', borderRadius: 14,
            boxShadow: '0 10px 34px rgba(0,0,0,0.28)',
            padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
          }}
        >
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.55 }}>
            Bu site, ziyaret deneyimini ölçmek için <strong>analitik çerezler</strong> (Google
            Analytics) kullanır. Bu çerezler yalnızca <strong>onayınla</strong> etkinleşir. Ayrıntılar:{' '}
            <Link href="/gizlilik" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              Gizlilik ve Çerez Politikası
            </Link>.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => decide('rejected')}
              style={{ padding: '9px 18px', borderRadius: 9999, border: '1.5px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Reddet
            </button>
            <button
              type="button"
              onClick={() => decide('accepted')}
              style={{ padding: '9px 18px', borderRadius: 9999, border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Kabul Et
            </button>
          </div>
        </div>
      )}
    </>
  );
}
