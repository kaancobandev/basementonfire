import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import EndosimbiyozClient from './EndosimbiyozClient';

const title = 'Endosimbiyoz — İki Hücrenin Birleşmesi';
const description = 'Karmaşık yaşam bir savaşın değil, bir birleşmenin ürünü. Mitokondri ve kloroplastın bakteriyel kökeni, Lynn Margulis, Asgard arkeleri, enerji devrimi ve 2024\'te keşfedilen nitroplast — derin, interaktif bir keşif.';
const path = '/articles/endosimbiyoz';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['endosimbiyoz', 'endosimbiyotik kuram', 'mitokondri', 'kloroplast', 'Lynn Margulis', 'simbiyogenez', 'Asgard arkeleri', 'Lokiarchaeota', 'nitroplast', 'ökaryot kökeni', 'siyanobakteri', 'evrim'],
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
      <EndosimbiyozClient />
    </>
  );
}
