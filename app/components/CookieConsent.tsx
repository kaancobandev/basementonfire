'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GoogleAnalytics } from '@next/third-parties/google';

const STORAGE_KEY = 'cookie-consent'; // 'accepted' | 'rejected'

/**
 * KVKK/GDPR çerez onayı — Google Consent Mode v2 ile.
 * gtag/GA HER ZAMAN yüklenir (cihaz ?notrack ile hariç tutulmadıysa) ama izinler
 * layout'taki head script'inde 'denied' başlar → onaya kadar ÇEREZSİZ ping (uyumlu).
 * "Kabul Et" → consent update: granted (tam ölçüm). "Reddet" → denied kalır
 * (Google modeller). Seçim localStorage'da; /gizlilik'ten sıfırlanabilir.
 */
const GRANTED = { ad_storage: 'granted', analytics_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' } as const;
const DENIED = { ad_storage: 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' } as const;
export default function CookieConsent({ gaId }: { gaId?: string }) {
  const [choice, setChoice] = useState<'accepted' | 'rejected' | null>(null);
  const [ready, setReady] = useState(false);
  // Kendi cihazlarını (bilgisayar/tablet/telefon) ziyaretçi istatistiklerinden
  // hariç tutmak için: o cihazda BİR KEZ siteyi ?notrack=1 ile aç → kalıcı kapanır.
  // Geri açmak için ?notrack=0 ile aç. Seçim localStorage'da o cihaza özel saklanır.
  const [trackDisabled, setTrackDisabled] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('notrack') === '1') localStorage.setItem('ga-disabled', 'true');
      if (params.get('notrack') === '0') localStorage.removeItem('ga-disabled');

      const disabled = localStorage.getItem('ga-disabled') === 'true';
      // gtag'in resmî kapatma bayrağı — GA bu cihazda hiç yüklenmese de güvence için
      if (disabled && gaId) (window as unknown as Record<string, boolean>)[`ga-disable-${gaId}`] = true;
      setTrackDisabled(disabled);

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'accepted' || saved === 'rejected') setChoice(saved);
    } catch {}
    setReady(true);
  }, [gaId]);

  function decide(value: 'accepted' | 'rejected') {
    try { localStorage.setItem(STORAGE_KEY, value); } catch {}
    setChoice(value);
    // Consent Mode: izinleri güncelle. gtag layout head script'inde tanımlı.
    try {
      (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.(
        'consent', 'update', value === 'accepted' ? GRANTED : DENIED,
      );
    } catch {}
  }

  return (
    <>
      {/* Consent Mode v2: GA HER ZAMAN yüklenir (izinler head'de 'denied' başlar,
          onaya kadar çerezsiz ping). Cihaz ?notrack ile hariç tutulduysa hiç yüklenmez. */}
      {gaId && !trackDisabled && <GoogleAnalytics gaId={gaId} />}

      {ready && choice === null && (
        <div
          role="dialog"
          aria-label="Çerez onayı"
          className="cc-banner"
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
