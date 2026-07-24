'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';

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
  // gtag.js İLK BOYAMADAN SONRAYA ertelenir (2026-07-23 denetimi): dosya 183 KB
  // gzip — sitenin TÜM kendi JS'inden büyük — ve SSR'da render edilince
  // @next/third-parties head'e <link rel=preload> basıyordu (HTML'in 2.318.
  // baytında; LCP hero'nun referansı 17.147'de) → indirme kritik pencerede hero
  // ve fontlarla bant genişliği yarışıyordu. Bu kapı sayesinde bileşen SSR'a
  // hiç girmez (preload yok), yükleme load+idle'a kayar. Consent Mode akışı
  // BOZULMAZ: window.gtag stub'ı layout head'inde senkron tanımlı; aradaki
  // consent update / sign_up çağrıları dataLayer'da kuyruklanır ve gtag.js
  // gelince sırayla işlenir. Ölçüm kaybı yalnız ilk ~2-4 sn'de sekmeyi
  // kapatan ziyaretçi. Advanced mod (onay öncesi çerezsiz ping) aynen korunur.
  const [gaReady, setGaReady] = useState(false);

  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const arm = () => {
      // timeout: gizli/kısılmış sekmede bile en geç 4 sn'de tetiklenir.
      if (typeof w.requestIdleCallback === 'function') idleId = w.requestIdleCallback(() => setGaReady(true), { timeout: 4000 });
      else timeoutId = window.setTimeout(() => setGaReady(true), 2000);
    };
    if (document.readyState === 'complete') arm();
    else window.addEventListener('load', arm, { once: true });
    return () => {
      window.removeEventListener('load', arm);
      if (idleId !== undefined && typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

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
          onaya kadar çerezsiz ping) ama gaReady kapısıyla İLK BOYAMADAN SONRA —
          gerekçe yukarıda. Cihaz ?notrack ile hariç tutulduysa hiç yüklenmez.

          ⚠ YALNIZ KÜTÜPHANE yüklenir; `js`/`config` çağrıları layout.tsx'teki
          SENKRON head script'inde. @next/third-parties'in <GoogleAnalytics>
          bileşenini buraya geri KOYMA: o kendi `config`'ini de basar ve gtag
          ertelendiği için config, hidrasyonda çalışan SignupEvent'in `sign_up`
          etkinliğinden SONRA kuyruğa girerdi — GA4 mülke bağlanmamış etkinliği
          düşürür ve dönüşüm sessizce kaybolur (2026-07-24'te tam bu yaşandı).
          Ayrıca iki config = çift page_view. */}
      {gaId && !trackDisabled && gaReady && (
        <Script id="gtag-lib" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      )}

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
