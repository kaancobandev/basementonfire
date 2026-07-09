'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// "Şu an online" ve sayaçlar canlı kalsın diye sayfayı periyodik olarak
// sunucudan tazeler (router.refresh → RSC yeniden çalışır, tam reload yok).
export default function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
