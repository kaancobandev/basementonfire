import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import DogalSecilimClient from './DogalSecilimClient';

const title = 'Doğal Seçilim — Evrimin Motoru';
const description = 'Darwin\'in büyük fikri sade bir mantıkla: çeşitlilik, kalıtım ve farklı üreme başarısı zamanla canlıları nasıl şekillendirir? Doğal seçilimi interaktif kamuflaj simülasyonu, seçilim türleri, antibiyotik direnci ve Darwin ispinozları örnekleriyle anlatıyoruz.';
const path = '/articles/dogal-secilim';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['doğal seçilim', 'doğal seleksiyon', 'natural selection', 'evrim', 'Charles Darwin', 'Alfred Russel Wallace', 'türlerin kökeni', 'adaptasyon', 'uyum', 'çeşitlilik', 'kalıtım', 'mutasyon', 'genetik sürüklenme', 'antibiyotik direnci', 'biber güvesi', 'Darwin ispinozları', 'en uyumlunun hayatta kalması', 'evrim teorisi'],
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
  datePublished: '2026-06-29',
  dateModified: '2026-06-29',
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
      <DogalSecilimClient />
    </>
  );
}
