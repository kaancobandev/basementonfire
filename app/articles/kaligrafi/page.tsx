import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import KaligrafiClient from './KaligrafiClient';

const title = 'Kaligrafi — Güzel Yazının Sanatı';
const description = 'Güzel yazının kapsamlı rehberi: İslam ve Osmanlı hat sanatı, Doğu Asya fırça kaligrafisi ve Batı geleneği; yazı türleri, araçlar, teknikler, püf noktaları ve sıfırdan başlangıç yol haritası — derin, interaktif bir anlatımla.';
const path = '/articles/kaligrafi';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['kaligrafi', 'hat sanatı', 'hüsn-i hat', 'hattat', 'aklâm-ı sitte', 'Şeyh Hamdullah', 'Çin kaligrafisi', 'shodō', 'Batı kaligrafisi', 'italik', 'copperplate', 'Edward Johnston', 'yazı türleri', 'broad-edge', 'fırça kalem'],
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
  datePublished: '2026-06-23',
  dateModified: '2026-06-23',
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
      <KaligrafiClient />
    </>
  );
}
