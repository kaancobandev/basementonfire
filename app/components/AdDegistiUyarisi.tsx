'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useNavUser } from './NavUserContext';

/**
 * "Kullanıcı adın istediğinden farklı açıldı" bildirimi.
 *
 * BULGU (26.08.2026 denetimi): kayıtta seçilen ad, e-posta onayına kadar HİÇ
 * REZERVE EDİLMİYOR. `api/auth/register` müsaitliği `public.users`ta kontrol
 * ediyor, ama profil satırı ancak ONAYDA doğuyor (fix-profile-on-email-confirm)
 * → kontrol, onay bekleyen tüm kayıtlara yapısal olarak KÖR. Arada başkası aynı
 * adı alırsa tetikleyici kaydı düşürmüyor (doğru karar) ama sessizce `ad2`,
 * `ad3` yapıyor. Kullanıcı bunu hiçbir yerde öğrenmiyordu.
 *
 * Ad ayrıca ÇAKIŞMA DIŞI sebeplerle de değişebiliyor: tetikleyici adı
 * temizliyor (küçük harf, `[a-z0-9_]` dışını atma, 30 karaktere kırpma).
 * Tek karşılaştırma ikisini de yakalar.
 *
 * NEDEN REZERVASYON DEĞİL DE BİLDİRİM: rezervasyon yeni bir tablo + süre
 * yönetimi + tetikleyicide tüketim demek; asıl rahatsız edici olan kısım ise
 * adın değişmesi değil, SESSİZCE değişmesi. En küçük dürüst düzeltme bu.
 *
 * ⚠ `useSearchParams` BİLEREK KULLANILMIYOR. Bu bileşen AppShell'in içinde,
 *   yani HER sayfada mount oluyor; o hook bir Suspense sınırı gerektirir ve
 *   sınırsız kullanımı sayfaları statik üretimden düşürür. Bayrağı doğrudan
 *   `window.location`dan okumak bir efekt içinde zaten güvenli.
 */
export default function AdDegistiUyarisi() {
  const navUser = useNavUser();
  const gosterildi = useRef(false);

  useEffect(() => {
    if (gosterildi.current) return;
    let bayrak = false;
    try {
      bayrak = new URLSearchParams(window.location.search).get('ad_degisti') === '1';
    } catch { return; }
    if (!bayrak) return;

    // `undefined` = nav-state cevabı HENÜZ GELMEDİ. Beklemezsek gerçek adı
    // bilmeden genel mesaja düşerdik; `null` (çıkışlı) ise beklemenin anlamı yok.
    if (navUser === undefined) return;

    gosterildi.current = true;
    const ad = navUser?.username;
    toast(
      ad
        ? `Hesabın @${ad} adıyla açıldı. Kayıtta yazdığın ad bu arada başkası tarafından alınmıştı — Ayarlar'dan değiştirebilirsin.`
        : 'Kullanıcı adın kayıtta yazdığından farklı açıldı. Ayarlar\'dan değiştirebilirsin.',
      { duration: 12000, icon: 'ℹ️' },
    );

    // Bayrağı URL'den düşür → tazeleme/geri gezinme mesajı tekrarlamasın.
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('ad_degisti');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    } catch { /* yoksay */ }
  }, [navUser]);

  return null;
}
