'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Cerezsiz sayfa goruntuleme beacon'i. Her gercek sayfa goruntulemesinde (ilk
// yukleme + istemci gezinmeleri) bir kez /api/hit'e POST atar. Cerez KOYMAZ,
// onay gerektirmez -> GA'nin kacirdigi (onay vermeyen) ziyaretcileri de yakalar.
//
// lastPath modul seviyesinde: React strict-mode'un (dev) effect'i iki kez
// calistirmasi ve remount'ta ref sifirlanmasi durumunda bile ayni yol icin
// TEK atim garantiler. Uretimde zaten tek calisir.
let lastPath: string | null = null;

export default function PageviewBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname === lastPath) return;
    if (pathname.startsWith('/yonetim') || pathname.startsWith('/api')) return;
    lastPath = pathname;
    try {
      fetch('/api/hit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p: pathname }),
        keepalive: true, // sekme kapansa bile gonderilir
      }).catch(() => { /* analitik best-effort, sessiz */ });
    } catch { /* yoksay */ }
  }, [pathname]);

  return null;
}
