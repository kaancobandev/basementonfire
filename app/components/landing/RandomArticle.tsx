'use client';

// Çıkış rampası: buraya kadar kaydırıp hâlâ tıklamamış ziyaretçi seçim
// felcinde. 17 kapı gösterdik; burada seçme yükünü kaldırıyoruz.
//
// /rastgele ROTASINA GİTMEZ: o route force-dynamic → her tıkta soğuk fonksiyon
// (2,4-3,7s boş ekran). Hız vaat eden sayfanın çıkış rampasında bu, tezin tam
// tersi olurdu. Yerine: href sunucuda SABİT bir slug'a (JS'siz çalışır +
// crawlable), onClick istemcide build-zamanı listesinden rastgele seçip push
// eder → statik makaleye anında, sunucu turu yok.
// Hidrasyon uyuşmazlığı olmaz: rastgelelik render'da değil, TIKLAMADA.

import { useRouter } from 'next/navigation';
import { ARTICLES } from '@/lib/articles';
import s from '../../landing.module.css';

export default function RandomArticle({ fallbackSlug }: { fallbackSlug: string }) {
  const router = useRouter();

  function go(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const pick = ARTICLES[Math.floor(Math.random() * ARTICLES.length)];
    router.push(`/articles/${pick?.slug ?? fallbackSlug}`);
  }

  return (
    <a className={s.ctaPrimary} href={`/articles/${fallbackSlug}`} onClick={go}>
      🎲 Rastgele bir makale aç →
    </a>
  );
}
