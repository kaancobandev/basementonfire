import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import RadyoaktiviteClient from './RadyoaktiviteClient';
import { refs } from './refs';

const title = 'Radyoaktivite — Bulutlu Bir Paris Günü ve İçinizdeki Saniyede 8.000 Bozunma';
const description = 'Radyoaktivite nedir, neden durdurulamaz ve neden sizin de içinizde? Yarılanma süresi, alfa-beta-gama ışıması, bozunma zinciri, doz ve radon — interaktif yarılanma simülatörü, sürüklenebilir nüfuz kutusu, sesli Geiger sayacı ve "sen ne kadar radyoaktifsin?" hesaplayıcısıyla.';
const path = '/articles/radyoaktivite';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'radyoaktivite', 'radyoaktif bozunma', 'yarılanma süresi', 'yarı ömür', 'alfa ışıması', 'beta ışıması', 'gama ışıması',
    'radyasyon', 'iyonlaştırıcı radyasyon', 'Henri Becquerel', 'Marie Curie', 'radyum', 'uranyum', 'polonyum',
    'karbon-14', 'radyokarbon tarihleme', 'potasyum-40', 'radon', 'radon gazı', 'bozunma zinciri', 'kuantum tünelleme',
    'George Gamow', 'Oklo reaktörü', 'radyum kızları', 'teknesyum-99m', 'sievert', 'bekerel', 'doz', 'Geiger sayacı',
    'muz eşdeğer dozu', 'jeo-nötrino', 'Voyager', 'plütonyum-238',
  ],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basementonfire`, description, url: path },
  twitter: { card: 'summary_large_image', title: 'Radyoaktivite · Basementonfire', description },
};

const jsonLd = articleJsonLd({
  title, description, path,
  datePublished: '2026-07-10',
  about: { type: 'Thing', name: 'Radyoaktivite', sameAs: ['https://www.wikidata.org/wiki/Q11448', 'https://tr.wikipedia.org/wiki/Radyoaktivite'] },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Radyoaktivite' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <RadyoaktiviteClient />
    </>
  );
}
