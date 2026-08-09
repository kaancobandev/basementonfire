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

    // YOL, GONDERIM ANINDA DEGIL SIMDI OKUNUR. Bu efekt hidrasyondan hemen
    // sonra, yani OLCULEN dokuman hala ekrandayken calisir. Gonderim ise
    // pagehide'da ya da 20 sn sonra olur; o ana kadar kullanici yumusak
    // gezinmeyle bambaska bir sayfada olabilir. Eskiden location.pathname
    // gonderim aninda okunuyordu -> sureler A sayfasinin, yol B sayfasinin
    // yaziliyordu. (Olculdu: 531 page_view / 207 perf satiri = satir basina
    // 2,57 sayfa goruntuleme, yani atif hatasi yaygindi.) Bagimlilik dizisi
    // bos oldugu icin bu deger tum yasam boyu sabit kalir -- istenen de bu.
    const yol = location.pathname;

    let lcp = 0;
    let cls = 0;
    let inp = 0;

    // BOYAMA GECERLILIGI. Spec geregi sayfa gizliyken boya zamanlamasi ya hic
    // raporlanmaz ya da gorunur olundugu ana kayar. Arka planda acilan sekme,
    // onizleme bolmesi ve prerender bu yuzden 10+ saniyelik SAHTE LCP uretir.
    // Olculdu: 186 ornegin 14'unde fcp > load + 200 ms (fiziksel olarak
    // imkansiz) ve o 14 satirin LCP p75'i 10.784 ms -- panelin p75'ini tek
    // baslarina ~500 ms sisiriyorlardi.
    //
    // Satiri ATMIYORUZ, ISARETLIYORUZ: kirliligin ne kadar oldugunu olcmek de
    // degerli, ayrica esik degisirse gecmis yeniden yorumlanabilir.
    //
    // ⚠ Bu efekt HIDRASYONDAN SONRA kosuyor, yani sayfa coktan boyanmis
    // olabilir. "Su an gizli -> ornek kirli" demek, boyamayi gorup HEMEN
    // sekme degistiren gercek kullanicinin GECERLI olcumunu atardi. O yuzden
    // zaten bir boyama kaydi varsa damgayi boyamadan SONRAYA koyuyoruz.
    let ilkGizlenme = Infinity;
    if (document.visibilityState === 'hidden') {
      ilkGizlenme = performance.getEntriesByName('first-contentful-paint')[0] ? performance.now() : 0;
    }
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

      // Sayfa, RAPORLANAN boyamadan ONCE gizlendiyse bu satirin boya
      // metrikleri guvenilmez. Hic boyama olmadiysa (ikisi de Infinity degil,
      // boyamaAni Infinity) da guvenilmez -- olculecek bir sey yok demektir.
      const boyamaAni = fcp?.startTime ?? (lcp || Infinity);
      const gizli = ilkGizlenme < boyamaAni;

      // Gelistirici/ekip trafigi. Cihazi BIR KEZ ?notrack=1 ile acmak
      // localStorage'a 'ga-disabled' yaziyor (CookieConsent.tsx:61) -- ayni
      // isareti burada da okuyoruz, ikinci bir mekanizma uydurmuyoruz.
      // Cerezsizlik korunur: localStorage o cihaza ozel, sunucuya gitmiyor.
      // NEDEN: perf-tracking.ts yalniz localhost'u eliyordu; PROD'da kendi
      // gezinmemiz p75'e giriyordu. Olculdu: "reload p75 = 576 ms" diye
      // guvendigimiz taban cizgisinin 17 orneginin 14'u masaustu ve ayni yola
      // 3 dakika icinde tekrarlardi -- gercek kullanici degil, bizdik.
      let ekip = false;
      try { ekip = localStorage.getItem('ga-disabled') === 'true'; } catch { /* private mode */ }

      const govde = JSON.stringify({
        p: yol,
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
        giz: gizli,
        ekip,
        // Baglanti protokolu (h2 / h3 / http/1.1). TTFB'nin ~2,5 sn'lik
        // aciklanamayan kalemini kovalarken h3'un yayginligini bilmemiz
        // gerekiyor; yerel curl derlemesi h2/h3 desteklemedigi icin bunu
        // olcebilecek tek yer yine ziyaretcinin tarayicisi.
        prt: typeof nav.nextHopProtocol === 'string' ? nav.nextHopProtocol : null,
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

    // SIRA ONEMLI: once gizlenme anini damgala, sonra gonder. gonder() bu
    // damgayi boyama aniyla karsilastiriyor; damgalamadan gondersek sayfa
    // gizliyken bile "gorunurdu" diye yazardik. Boyama zaten olduysa damga
    // boyamadan SONRA dustugu icin satir temiz isaretlenir -- istenen bu.
    const damgala = () => {
      if (document.visibilityState === 'hidden' && ilkGizlenme === Infinity) {
        ilkGizlenme = performance.now();
      }
    };
    const gizlenince = () => { damgala(); if (document.visibilityState === 'hidden') gonder(); };
    document.addEventListener('visibilitychange', gizlenince);
    // pagehide = sayfa gorunurlukten cikiyor; visibilitychange atesLENMEDEN
    // dogrudan buraya dusen tarayicilar icin damgayi burada da at.
    const sayfaGizleniyor = () => { damgala(); gonder(); };
    addEventListener('pagehide', sayfaGizleniyor);
    const zamanlayici = window.setTimeout(gonder, GONDER_GECIKME_MS);

    return () => {
      clearTimeout(zamanlayici);
      document.removeEventListener('visibilitychange', gizlenince);
      removeEventListener('pagehide', sayfaGizleniyor);
      gozlemciler.forEach((po) => { try { po.disconnect(); } catch { /* yoksay */ } });
    };
    // Bos bagimlilik: BILEREK tek atim. Istemci gezinmesinde yeniden kurulmaz.
  }, []);

  return null;
}
