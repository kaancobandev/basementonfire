import type { Metadata } from 'next';
import GreeceClient from './GreeceClient';

const title = 'Antik Yunan';
const description = 'Antik Yunan uygarlığı: şehir devletleri, felsefe, mitoloji ve demokrasinin doğuşu — interaktif bir keşif.';
const path = '/articles/greece';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basements`, description, url: path, images: ['/opengraph-image'] },
  twitter: { card: 'summary_large_image', title: `${title} · Basements`, description },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  inLanguage: 'tr-TR',
  url: `https://basementonfire.com${path}`,
  author: { '@type': 'Organization', name: 'Basements' },
  publisher: { '@type': 'Organization', name: 'Basements' },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GreeceClient />
    </>
  );
}
