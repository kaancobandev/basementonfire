import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import InternetClient from './InternetClient';

const title = 'İnternet Nasıl Çalışır?';
const description = 'OSI ve TCP/IP modelleri, paketler, protokoller, yönlendiriciler ve anahtarlar, DNS, HTTP/HTTPS, SSL/TLS, TCP/UDP, IP ve MAC adresleri, ISP ve DSL: internetin nasıl çalıştığını bol diyagram ve interaktif anlatımlarla derinlemesine keşfet.';
const path = '/articles/internet';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['internet nasıl çalışır', 'OSI modeli', 'TCP/IP', 'DNS', 'HTTP', 'HTTPS', 'SSL', 'TLS', 'router', 'switch', 'paket', 'protokol', 'IP adresi', 'MAC adresi', 'UDP', 'ISP', 'DSL'],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basements`, description, url: path },
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
      <InternetClient />
    </>
  );
}
