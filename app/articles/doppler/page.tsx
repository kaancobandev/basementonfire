import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import DopplerClient from './DopplerClient';

const title = 'Doppler Etkisi — Hareketin Sesi ve Işığı';
const description = 'Bir ambulans sireninden evrenin genişlemesine: göreli hareket dalgaları nasıl sıkıştırıp gerer? Doppler etkisi, sesin formülü, kırmızıya/maviye kayma, radar, ultrason ve ötegezegen avı — interaktif simülasyonlarla derin bir anlatım.';
const path = '/articles/doppler';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['doppler etkisi', 'doppler effect', 'kırmızıya kayma', 'maviye kayma', 'redshift', 'blueshift', 'frekans', 'dalga boyu', 'Christian Doppler', 'Hubble', 'evrenin genişlemesi', 'radar', 'doppler ultrason', '51 Pegasi b'],
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
  datePublished: '2026-06-24',
  dateModified: '2026-06-24',
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
      <DopplerClient />
    </>
  );
}
