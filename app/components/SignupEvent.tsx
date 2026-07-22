'use client';

// GA4/Google Ads `sign_up` dönüşümü. Kayıt route'u başarıda hedefe `?signup=1`
// ekler (/?welcome=1&signup=1 ya da /eposta-onayi?signup=1); bu bileşen o
// bayrağı görünce BİR KEZ `sign_up` etkinliğini gönderir, sonra bayrağı URL'den
// siler (yenileme/geri gezinmede tekrar tetiklenmesin). Bayrak yalnız GERÇEK
// kayıt başarısında geldiğinden dönüşüm birebir doğru sayılır (resend/confirm/
// öylesine /eposta-onayi ziyareti sayılmaz).
//
// Consent Mode: gtag layout head script'inde tanımlı (hep var). Onay yoksa
// etkinlik ÇEREZSİZ ping olarak gider (Google modeller); onay varsa gclid ile
// tam atıf. window.location kullanır — useSearchParams DEĞİL (Suspense/client-
// tree'ye kaydırma tuzağı yok).

import { useEffect } from 'react';

export default function SignupEvent() {
  useEffect(() => {
    try {
      if (new URL(window.location.href).searchParams.get('signup') !== '1') return;
      // Oturum başına BİR KEZ: yenileme/geri gitme dönüşümü tekrar saymasın
      // (asıl güvence budur; URL temizliği kozmetik + paylaşım sızıntısını azaltır).
      const already = sessionStorage.getItem('su_fired') === '1';
      if (!already) {
        sessionStorage.setItem('su_fired', '1');
        (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.('event', 'sign_up', { method: 'email' });
      }
      // Bayrağı URL'den sil — hidrasyondan SONRA (erken replaceState Next tarafından
      // SSR URL'ine geri alınıyor, konsolda doğrulandı).
      setTimeout(() => {
        try {
          const u = new URL(window.location.href);
          if (!u.searchParams.has('signup')) return;
          u.searchParams.delete('signup');
          window.history.replaceState({}, '', u.pathname + u.search + u.hash);
        } catch { /* yoksay */ }
      }, 0);
    } catch { /* gtag yoksa / storage yoksa sessiz */ }
  }, []);
  return null;
}
