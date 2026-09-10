'use client';

import { useEffect, useRef } from 'react';
import { useNavUser } from '@/app/components/NavUserContext';

/**
 * Makalenin ne kadarının okunduğunu ölçer ve seyrek olarak sunucuya bildirir.
 * Ekranda HİÇBİR ŞEY çizmez — yalnızca gövdenin bittiği noktayı işaretleyen
 * sıfır yükseklikte bir nişan. Yüzde akıştaki "devam et" kartında kullanılıyor.
 *
 * ⚠ ÖLÇÜM NOKTASI KENDİSİ: bileşen `ArticleSocial` içinde, yani makale
 * gövdesinin hemen SONUNDA duruyor. Bu yüzden "gövde nerede bitiyor"u ayrıca
 * hesaplamaya gerek yok — kendi konumu o. GSAP pinlenmiş bölümler kaydırma
 * uzunluğunu değiştirdiği için bu konum HER ölçümde yeniden okunuyor.
 *
 * ⛔ 100 GÖNDERMEZ, 99'da durur. "Bitti" işaretini yazma sorumluluğu tek bir
 * yerde: ArticleDiscussion'ın kendi beacon'ı (o `article_reads` satırını da
 * yazıyor ve koleksiyon rozetini de tetikliyor). İkisi birden 100 deseydi
 * rozet yazımı yarışa girerdi.
 */

const ESIK = 5;          // en az bu kadar puan ilerlemeden yeni istek atma
const ARALIK = 10_000;   // ve en az bu kadar ms geçmeden

export default function ReadProgress({ slug }: { slug: string }) {
  const nisanRef = useRef<HTMLDivElement>(null);
  const enYuksek = useRef(0);
  const gonderilen = useRef(0);
  const sonZaman = useRef(0);
  const kullanici = useNavUser();
  // Girişli mi? `undefined` = nav-state daha gelmedi. Efekt içinde okuyalım
  // diye ref'te tutuluyor: dinleyicileri her kimlik değişiminde kurup yıkmayalım.
  const girisliRef = useRef(false);
  girisliRef.current = !!kullanici;

  useEffect(() => {
    const nisan = nisanRef.current;
    if (!nisan) return;

    const olc = (): number => {
      const bitis = nisan.getBoundingClientRect().top + window.scrollY;
      if (bitis <= 0) return 0;
      const gecilen = window.scrollY + window.innerHeight;
      // ⛔ 100 değil 99 — yukarıdaki nota bak.
      return Math.max(0, Math.min(99, Math.round((gecilen / bitis) * 100)));
    };

    const gonder = (yuzde: number, beacon: boolean) => {
      if (!girisliRef.current || yuzde <= 0 || yuzde <= gonderilen.current) return;
      gonderilen.current = yuzde;
      sonZaman.current = Date.now();
      const govde = JSON.stringify({ percent: yuzde });
      const yol = `/api/articles/${slug}/progress`;
      /* Sayfa kapanırken `fetch` iptal edilir; `sendBeacon` tarayıcı tarafından
         kuyruğa alınır ve gönderilir. Blob'un type'ı ŞART, yoksa beacon
         `text/plain` gönderir ve rota gövdeyi ayrıştıramaz. */
      if (beacon && navigator.sendBeacon) {
        navigator.sendBeacon(yol, new Blob([govde], { type: 'application/json' }));
        return;
      }
      fetch(yol, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: govde, keepalive: true })
        .catch(() => {});
    };

    const kaydirma = () => {
      const y = olc();
      if (y > enYuksek.current) enYuksek.current = y;
      // Seyrek gönder: hem puan hem zaman eşiği dolmalı.
      if (enYuksek.current - gonderilen.current >= ESIK && Date.now() - sonZaman.current >= ARALIK) {
        gonder(enYuksek.current, false);
      }
    };

    /* Asıl gönderim ANI burası. Kaydırma sırasındaki seyrek istekler yalnızca
       emniyet; okurun çoğu sekmeyi değiştirerek ya da geri giderek ayrılıyor ve
       o an `scroll` artık ateşlenmiyor.
       ⚠ `visibilitychange` + `pagehide` İKİSİ birden: mobil Safari'de sayfa
       çoğu zaman `unload` olmadan bfcache'e giriyor. */
    const bosalt = () => {
      const y = olc();
      if (y > enYuksek.current) enYuksek.current = y;
      gonder(enYuksek.current, true);
    };
    const gorunurluk = () => { if (document.visibilityState === 'hidden') bosalt(); };

    window.addEventListener('scroll', kaydirma, { passive: true });
    document.addEventListener('visibilitychange', gorunurluk);
    window.addEventListener('pagehide', bosalt);
    kaydirma();   // ilk ölçüm: uzun bir makalenin başında bile 1-2 puan olabilir

    return () => {
      window.removeEventListener('scroll', kaydirma);
      document.removeEventListener('visibilitychange', gorunurluk);
      window.removeEventListener('pagehide', bosalt);
      bosalt();   // istemci gezinmesiyle ayrılırken de kaydet
    };
  }, [slug]);

  return <div ref={nisanRef} aria-hidden style={{ height: 0 }} />;
}
