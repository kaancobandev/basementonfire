import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import NewtonClient from './NewtonClient';

const title = 'Isaac Newton: Bilimi Yeniden Kuran Adam';
const description = 'Isaac Newton kimdi? Üç hareket yasası (F = m·a), evrensel kütleçekim, kalkülüs ve optik; Mucize Yıllar, Principia, Güney Denizi Balonu dolandırılması ve bugün hangi yasalarını hâlâ kullandığımız — F=ma oyun alanı, ters-kare kütleçekim simülasyonu ve interaktif yasalarla.';
const path = '/articles/newton';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['Isaac Newton', 'Newton hareket yasaları', 'F = ma', 'evrensel kütleçekim', 'ters kare yasası', 'kalkülüs', 'Principia', 'annus mirabilis', 'mucize yıllar', 'optik', 'prizma', 'yansıtmalı teleskop', 'Güney Denizi Balonu', 'Newton Leibniz kavgası', 'eylemsizlik', 'etki tepki', 'görelilik', 'kuantum', 'bilim devrimi'],
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
  datePublished: '2026-06-30',
  dateModified: '2026-06-30',
  url: `https://basementonfire.com${path}`,
  image: 'https://basementonfire.com/opengraph-image',
  author: { '@type': 'Organization', name: 'Basements' },
  publisher: { '@type': 'Organization', name: 'Basements' },
  about: { '@type': 'Person', name: 'Isaac Newton' },
};

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Isaac Newton' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <NewtonClient />
    </>
  );
}
