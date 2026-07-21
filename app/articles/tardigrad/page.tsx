import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import TardigradClient from './TardigradClient';

const title = 'Tardigradlar (Su Ayıları)';
const description = 'Su ayıları (tardigradlar): yarım milimetrelik bu minik canlılar uzayın boşluğunda, mutlak sıfıra yakın soğukta, kaynar suda ve ölümcül radyasyonda hayatta kalır. Kriptobiyoz (tun hali), Dsup proteini, uzay ve Ay deneyleri, oynanabilir mini 2B oyun ve eğlenceli gerçeklerle derin bir keşif.';
const path = '/articles/tardigrad';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['tardigrad', 'su ayısı', 'water bear', 'kriptobiyoz', 'tun hali', 'anhidrobiyoz', 'Dsup', 'ekstremofil', 'uzayda hayatta kalma', 'trehaloz', 'mini oyun'],
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
      <TardigradClient />
    </>
  );
}
