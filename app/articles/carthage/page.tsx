import type { Metadata } from 'next';
import CarthageClient from './CarthageClient';

const title = 'Kartaca';
const description = 'Kartaca\'nın yükselişi ve Roma ile Pön Savaşları: Hannibal, Akdeniz ticareti ve bir uygarlığın sonu.';
const path = '/articles/carthage';

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
      <CarthageClient />
    </>
  );
}
