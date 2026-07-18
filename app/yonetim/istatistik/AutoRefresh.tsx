'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// "Şu an online" ve sayaçlar canlı kalsın diye sayfayı periyodik olarak
// sunucudan tazeler (router.refresh → RSC yeniden çalışır, tam reload yok).
//
// SEKME GİZLİYKEN TAZELEMEZ: açık unutulan tek yönetim sekmesi günde ~1.440
// fonksiyon çağrısı + DB sorgusu üretiyordu (kredi tavanlı planda sessiz sızıntı).
// Sekme geri görünür olunca bir kez hemen tazeler, sonra döngü devam eder.
export default function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      router.refresh();
    }, seconds * 1000);
    const onVisible = () => { if (!document.hidden) router.refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [router, seconds]);
  return null;
}
