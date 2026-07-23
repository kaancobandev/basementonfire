'use client';

import { useEffect } from 'react';

// Google Fonts stylesheet'ini İLK BOYAMADAN SONRA yükler.
//
// NEDEN: <link rel="stylesheet"> gövdede SSR'lanınca tarayıcı, altındaki TÜM
// içeriğin boyanmasını CSS yanıtı gelene kadar bloklar — 2026-07-23 denetimi
// bunu 5 kürate makale + kullanıcı makale görüntüleyicisinde yakaladı (makale
// gövdesi Google'ın yanıtını bekliyordu; soğuk mobil bağlantıda +300-600 ms).
// Bu bileşen mount'ta (hidrasyon sonrası = ilk boyamadan sonra) aynı linki
// head'e ekler: istek kritik yolun dışına çıkar, sayfa hemen boyanır.
// URL'lerde display=swap olduğundan metin önce sistem fontuyla görünür, font
// gelince değişir (kısa FOUT) — boyamayı beklemekten iyidir. Sayfalardaki
// preconnect linkleri kalır ve bu geç isteği hızlandırır.
//
// NOT: gerçek self-host (next/font) burada İŞE YARAMAZ: makale CSS'leri font
// ailelerine gerçek adlarıyla ('Space Grotesk' vb.) başvuruyor; next/font
// aile adını karma (hash) bir adla değiştirir ve bu CSS'ler eşleşmez olurdu.
export default function AsyncFonts({ href }: { href: string }) {
  useEffect(() => {
    // Aynı stylesheet zaten varsa (SPA ile geri dönüş / iki makale aynı URL)
    // kopya ekleme; sahibi olmadığımız linki unmount'ta da silmeyiz.
    if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
    return () => { l.remove(); };
  }, [href]);
  return null;
}
