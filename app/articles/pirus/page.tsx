import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import PyrrhusClient from './PyrrhusClient';

const title = 'Kral Pirus';
const description = 'Epir Kralı Pirus: Büyük İskender\'in akrabası, savaş filleriyle Roma\'yı sarsan efsanevi komutan. Pahalıya mal olan zaferleri ("Pirus zaferi"), meşhur sözleri, savaşları (Herakleia, Asculum, Beneventum) ve trajik sonu — destansı, interaktif ve uzun bir anlatım.';
const path = '/articles/pirus';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['Kral Pirus', 'Pirus', 'Pyrrhus', 'Epir', 'Pirus zaferi', 'Pyrrhic victory', 'Herakleia', 'Asculum', 'savaş filleri', 'Roma', 'Büyük İskender', 'antik tarih'],
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
  datePublished: '2026-06-22',
  dateModified: '2026-06-22',
  url: `https://basementonfire.com${path}`,
  image: 'https://basementonfire.com/opengraph-image',
  author: { '@type': 'Organization', name: 'Basements' },
  publisher: { '@type': 'Organization', name: 'Basements' },
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
      <PyrrhusClient />
    </>
  );
}
