'use client';

import { useEffect } from 'react';

// GERCEK KULLANICI HIZI olcumu (RUM). Cerezsiz, onaysiz, kimliksiz.
//
// NEDEN: hizi bugune kadar kendi makinemizden olctuk -> masaustu, fiber, sicak
// onbellek. Ziyaretcinin gordugu sure bu degil. Netlify de gosteremiyor (ham
// HTTP istek logu yalniz Enterprise'da). Sureyi olcebilecek tek yer ziyaretcinin
// KENDI tarayicisi; burasi o olcumu alip /api/perf'e bir kez gonderir.
//
// KAPSAM: yalnizca ILK (sert) sayfa yuklemesi. Istemci-ici gezinmelerde LCP
// yeniden hesaplanmaz -- olculecek bir sey yok, o yuzden tek atim.
// Sayim tarafi ayri calisiyor (PageviewBeacon -> /api/hit); burasi ona dokunmaz.
//
// ZAMANLAMA: LCP ve INP sayfa acikken DEGISMEYE DEVAM EDER. Bu yuzden gonderim
// sayfa gizlenene kadar bekler (visibilitychange/pagehide) -- web-vitals
// kutuphanesinin yaptigi da budur. Kullanici sekmeyi hic gizlemeden tarayiciyi
// kapatirsa ornegi kaybederiz; dusuk trafikte bu pahali, o yuzden 20 sn'lik bir
// emniyet zamanlayicisi da var (LCP zaten ilk etkilesimden sonra donuyor).

const GONDER_GECIKME_MS = 20_000;

export default function WebVitalsBeacon() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;
    if (location.pathname.startsWith('/yonetim')) return;

    let lcp = 0;
    let cls = 0;
    let inp = 0;
    // CLS'in resmi tanimi: 5 sn'lik / 1 sn araliklı "oturum penceresi"nin en
    // buyugu -- duz toplam degil. Duz toplam uzun sayfalarda sisirir.
    let pencereDeger = 0;
    let pencereIlk = 0;
    let pencereSon = 0;

    const gozlemciler: PerformanceObserver[] = [];
    const gozle = (type: string, cb: (e: any) => void, extra?: PerformanceObserverInit) => {
      try {
        const po = new PerformanceObserver((list) => list.getEntries().forEach(cb));
        po.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
        gozlemciler.push(po);
      } catch {
        /* tarayici bu metrigi bilmiyor -> sutun bos gecer, satir yine yazilir */
      }
    };

    gozle('largest-contentful-paint', (e) => { lcp = e.startTime; });

    gozle('layout-shift', (e) => {
      if (e.hadRecentInput) return; // kullanici kaydirdigi icin kayan sey sayilmaz
      if (pencereDeger && e.startTime - pencereSon < 1000 && e.startTime - pencereIlk < 5000) {
        pencereDeger += e.value;
      } else {
        pencereDeger = e.value;
        pencereIlk = e.startTime;
      }
      pencereSon = e.startTime;
      if (pencereDeger > cls) cls = pencereDeger;
    });

    // INP yaklasigi: interactionId tasiyan (yani gercek etkilesim olan)
    // olaylarin EN KOTUSU. Resmi INP 50+ etkilesimde 98. yuzdelik alir; tek
    // ziyarette etkilesim sayisi zaten az, en kotu deger dogru yaklasim.
    gozle('event', (e) => {
      if (e.interactionId && e.duration > inp) inp = e.duration;
    }, { durationThreshold: 40 } as PerformanceObserverInit);

    let gonderildi = false;
    const gonder = () => {
      if (gonderildi) return;
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (!nav) return;
      gonderildi = true;
      gozlemciler.forEach((po) => { try { po.disconnect(); } catch { /* yoksay */ } });

      const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      const conn = (navigator as any).connection?.effectiveType;
      const yuvarla = (v: number | undefined) => (v && v > 0 ? Math.round(v) : null);

      const govde = JSON.stringify({
        p: location.pathname,
        ttfb: yuvarla(nav.responseStart),
        fcp: yuvarla(fcp?.startTime),
        lcp: yuvarla(lcp),
        load: yuvarla(nav.loadEventEnd),
        inp: yuvarla(inp),
        cls: Math.round(cls * 1000),
        nav: nav.type,
        // Cihaz sinifi GORUNTU ALANINDAN: user-agent tahmini degil, sayfayi
        // gercekten dar ekranda mi acmis, onu soyler.
        dev: window.matchMedia('(max-width: 768px)').matches ? 'mobil' : 'masaustu',
        conn: typeof conn === 'string' ? conn : null,
      });

      try {
        // sendBeacon sayfa kapanirken bile teslim edilir. Blob tipi
        // application/json -> route tarafi req.text() + JSON.parse ile okur.
        const ok = navigator.sendBeacon?.('/api/perf', new Blob([govde], { type: 'application/json' }));
        if (!ok) throw new Error('sendBeacon reddetti');
      } catch {
        fetch('/api/perf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: govde,
          keepalive: true,
        }).catch(() => { /* olcum best-effort, sessiz */ });
      }
    };

    const gizlenince = () => { if (document.visibilityState === 'hidden') gonder(); };
    document.addEventListener('visibilitychange', gizlenince);
    addEventListener('pagehide', gonder);
    const zamanlayici = window.setTimeout(gonder, GONDER_GECIKME_MS);

    return () => {
      clearTimeout(zamanlayici);
      document.removeEventListener('visibilitychange', gizlenince);
      removeEventListener('pagehide', gonder);
      gozlemciler.forEach((po) => { try { po.disconnect(); } catch { /* yoksay */ } });
    };
    // Bos bagimlilik: BILEREK tek atim. Istemci gezinmesinde yeniden kurulmaz.
  }, []);

  return null;
}
