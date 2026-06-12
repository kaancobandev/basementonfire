import type { Metadata } from 'next';
import BlackHoleClient from './BlackHoleClient';

const title = 'Kara Delikler';
const description = 'Kara delikler nedir, nasıl oluşur? Olay ufku, tekillik ve uzay-zaman bükülmesi — interaktif görsellerle anlatım.';
const path = '/articles/black-hole';

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
      <BlackHoleClient />
    </>
  );
}
