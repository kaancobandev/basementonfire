import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import KanuniClient from './KanuniClient';
import { refs } from './refs';

// ⚠ openGraph.images YAZILMAZ: dosya tabanlı opengraph-image.tsx'i sessizce ezer.
const title = 'Kanuni Sultan Süleyman — Kanunu Yazan Adamın Kendi Kanununa Yenilmesi';
const description =
  'Kanuni\'yi bir bayrak değil bir vaka olarak anlatan interaktif makale. Batı ona "Muhteşem" dedi, Doğu "Kanunî" — ikisi de aynı adamı anlatıyor: biri süsünü, öteki mekanizmasını. Venedik\'te sipariş edilen dört taçlı miğferden Divan\'daki bir davaya, 128 gün yürünüp 2 saatte biten Mohaç\'tan 140 gün yürünüp 19 gün süren Viyana kuşatmasına, Makbul\'den Maktul\'e giden bir geceden otağdaki üç kilitli kapıya ve ölümünden sonra 42 gün daha basılan bir tuğraya. Dört taçlı 3B miğfer hero, Mohaç savaş simülasyonu (Macar tarafındasın), "sen kadısın" dava modülü, sefer takvimi, mühür tuzağı, otağ karar noktası ve Kaynak Karşılaştırıcı ile interaktif — Sezar serisinin 4. parçası. Kural: sıfat değil, sayı.';
const path = '/articles/kanuni';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'Kanuni Sultan Süleyman', 'I. Süleyman', 'Muhteşem Süleyman', 'Kanunî', 'Osmanlı',
    'kanunnâme', 'Ebussuud Efendi', 'şeriat ve kanun', 'Mohaç Muharebesi', '1526',
    'Viyana Kuşatması', '1529', 'Pargalı İbrahim Paşa', 'Makbul Maktul', 'Şehzade Mustafa',
    'Şehzade Bayezid', 'kardeş katli', 'Fatih Kanunnâmesi', 'Süleymaniye', 'Mimar Sinan',
    'Zigetvar', 'Sokollu Mehmed Paşa', 'dört taçlı miğfer', 'Venedik miğferi', 'tuğra',
    'Hürrem Sultan', 'Rüstem Paşa', 'Osmanlı tarihi', 'Osmanlı padişahları',
  ],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basementonfire`, description, url: path },
  twitter: { card: 'summary_large_image', title: 'Kanuni Sultan Süleyman · Basementonfire', description },
};

const jsonLd = articleJsonLd({
  title,
  description,
  path,
  datePublished: '2026-07-27',
  about: {
    type: 'Person',
    name: 'Kanuni Sultan Süleyman',
    sameAs: ['https://www.wikidata.org/wiki/Q8474', 'https://tr.wikipedia.org/wiki/I._S%C3%BCleyman'],
  },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Kanuni Sultan Süleyman' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <KanuniClient />
    </>
  );
}
