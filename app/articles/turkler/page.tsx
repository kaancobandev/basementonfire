import type { Metadata } from 'next';
import TurklerClient from './TurklerClient';

const title = 'Türkler';
const description = 'Türklerin tarihi: Orta Asya\'dan göçler, kurulan devletler ve kültürel miras — interaktif bir zaman yolculuğu.';
const path = '/articles/turkler';

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
      <TurklerClient />
    </>
  );
}
