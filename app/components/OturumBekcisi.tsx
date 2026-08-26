'use client';

import { useEffect } from 'react';
import { cerezdenKimlik } from '@/lib/oturumKimlik';

/**
 * OTURUM BEKÇİSİ — sekme geri geldiğinde kimlik hâlâ aynı mı?
 *
 * BULGU (kullanıcı bildirdi, 23.08.2026): aynı tarayıcıda iki sekme açıkken
 * ikinci sekmede çıkış yapılıp BAŞKA bir hesapla girildi; birinci sekme eski
 * hesabın arayüzünü göstermeye devam etti ve oradan yönetim sayfası açılabildi.
 *
 * 🚨 BU BİR YETKİ AÇIĞI DEĞİLDİ — ölçüldü. Oturum çerezi SEKMEYE değil
 *    TARAYICIYA aittir (web'in tanımı budur); birinci sekmeden atılan her istek
 *    zaten YENİ hesabın çerezini taşıyordu ve sunucu onu doğruluyordu. Yönetim
 *    sayfasının açılabilmesinin sebebi yeni hesabın (kaancoban) GERÇEKTEN admin
 *    olmasıydı. Yani sızan veri yok; yanlış olan tek şey EKRANDAKİ İSİMDİ.
 *
 *    Ama yanlış isim tek başına yeterince kötü: kullanıcı hangi hesapla
 *    yazdığını ekrandan okur. "muratby" görünürken kaancoban olarak gönderi
 *    atmak, açık olmasa bile kullanıcıyı yanıltır.
 *
 * ÇÖZÜM: sekme yeniden görünür olduğunda çerezdeki auth kimliğini SIFIR AĞ TURU
 * ile yeniden okuyup mount anındakiyle karşılaştır. Değiştiyse sayfayı tazele.
 *
 * ⚠ NEDEN AĞ İSTEĞİ DEĞİL: bu kontrol her sekme odağında koşuyor. `/api/nav-state`
 *   atmak her odaklanmaya bir Supabase auth turu (ölçüldü: 114-740 ms) eklerdi.
 *   Çerez zaten `httpOnly` DEĞİL (createBrowserClient onu okumak zorunda,
 *   bkz. cookieOptions.ts) — yani bu okuma bize yeni bir yüzey açmıyor.
 * ⚠ KİMLİK, TOKEN DEĞİL: `user.id` okunuyor. Erişim jetonu düzenli olarak
 *   yenilenir ve çerez değişir; jetonun kendisi karşılaştırılsaydı her yenileme
 *   sahte bir "hesap değişti" üretir, sayfa durduk yere tazelenirdi.
 */

export default function OturumBekcisi() {
  useEffect(() => {
    const ilk = cerezdenKimlik();
    // Mount anında okunamadıysa karşılaştıracak bir taban yok → bekçiyi kurma.
    if (ilk === null) return;

    let tazelendi = false;
    const bak = () => {
      if (tazelendi || document.visibilityState !== 'visible') return;
      const simdi = cerezdenKimlik();
      if (simdi === null || simdi === ilk) return;
      tazelendi = true; // çift tetikleme olmasın (focus + visibilitychange birlikte gelir)
      /* Neden tam tazeleme: bu sayfanın SUNUCUDA üretilmiş kişisel içeriği
         (profil, mesaj, akış) eski kimliğe ait. `router.refresh()` sunucu
         bileşenlerini tazeler ama AppShell'in mount'ta bir kez doldurduğu
         istemci durumu (kullanıcı, sayaçlar, kişisel kat) eski kalırdı. */
      window.location.reload();
    };

    document.addEventListener('visibilitychange', bak);
    window.addEventListener('focus', bak);
    // bfcache'ten geri gelen sayfa: hiçbir efekt yeniden koşmaz, `pageshow` tek sinyal.
    window.addEventListener('pageshow', bak);
    // Diğer sekme localStorage'a yazarsa (tema, çıkış…) burada da bir kez bakalım —
    // sekme ARKA PLANDA olsa bile çerez değişmişse bir sonraki odakta yakalanır.
    window.addEventListener('storage', bak);
    return () => {
      document.removeEventListener('visibilitychange', bak);
      window.removeEventListener('focus', bak);
      window.removeEventListener('pageshow', bak);
      window.removeEventListener('storage', bak);
    };
  }, []);

  return null;
}
