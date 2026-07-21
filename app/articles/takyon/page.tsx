import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import TakyonClient from './TakyonClient';

const title = 'Takyonlar';
const description = 'Işıktan hızlı varsayımsal parçacıklar: takyonlar. Sanal kütle, ışık bariyeri, nedensellik ve "takyon anti-telefonu", takyon yoğunlaşması, 2011 OPERA nötrino olayı ve Cherenkov ışıması — günlük benzetmelerle, efektler ve interaktif anlatımla derin bir keşif.';
const path = '/articles/takyon';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['takyon', 'tachyon', 'ışıktan hızlı', 'sanal kütle', 'görelilik', 'nedensellik', 'takyon anti-telefonu', 'Feinberg', 'OPERA nötrino', 'Cherenkov ışıması', 'takyon yoğunlaşması', 'fizik'],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basementonfire`, description, url: path },
  twitter: { card: 'summary_large_image', title: `${title} · Basementonfire`, description },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  inLanguage: 'tr-TR',
  datePublished: '2026-06-22',
  dateModified: '2026-06-22',
  url: `https://basementonfire.com${path}`,
  image: 'https://basementonfire.com/opengraph-image',
  author: { '@type': 'Organization', name: 'Basementonfire' },
  publisher: { '@type': 'Organization', name: 'Basementonfire' },
};

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: title },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <TakyonClient />
    </>
  );
}
