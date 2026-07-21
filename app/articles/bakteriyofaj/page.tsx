import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import BakteriyofajClient from './BakteriyofajClient';

const title = 'Bakteriyofajlar — Görünmez Avcılar';
const description = 'Gezegenin en bol canlısı, bakteri yiyen virüsler. T4 nano-makinesi, litik/lizojenik döngü, faj terapisinin unutulmuş tarihi, CRISPR\'ın doğuşu, antibiyotik direnci krizi ve gerçek vakalarla derin, interaktif bir keşif.';
const path = '/articles/bakteriyofaj';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['bakteriyofaj', 'faj', 'faj terapisi', 'bacteriophage', 'antibiyotik direnci', 'CRISPR', 'litik döngü', 'lizojenik döngü', 'T4 faj', 'mikrobiyom', 'd Herelle', 'Eliava Enstitüsü', 'süper bakteri'],
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
  datePublished: '2026-06-23',
  dateModified: '2026-06-23',
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
      <BakteriyofajClient />
    </>
  );
}
