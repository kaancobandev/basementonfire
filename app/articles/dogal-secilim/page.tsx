import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import DogalSecilimClient from './DogalSecilimClient';
import { refs } from './refs';

const title = 'Doğal Seçilim — Evrimin Motoru';
const description = 'Darwin\'in büyük fikri sade bir mantıkla: çeşitlilik, kalıtım ve farklı üreme başarısı zamanla canlıları nasıl şekillendirir? Doğal seçilimi interaktif kamuflaj simülasyonu, seçilim türleri, antibiyotik direnci ve Darwin ispinozları örnekleriyle anlatıyoruz.';
const path = '/articles/dogal-secilim';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['doğal seçilim', 'doğal seleksiyon', 'natural selection', 'evrim', 'Charles Darwin', 'Alfred Russel Wallace', 'türlerin kökeni', 'adaptasyon', 'uyum', 'çeşitlilik', 'kalıtım', 'mutasyon', 'genetik sürüklenme', 'antibiyotik direnci', 'biber güvesi', 'Darwin ispinozları', 'en uyumlunun hayatta kalması', 'evrim teorisi'],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basements`, description, url: path },
  twitter: { card: 'summary_large_image', title: `${title} · Basements`, description },
};

const jsonLd = articleJsonLd({
  title, description, path,
  datePublished: '2026-06-29',
  about: { type: 'Thing', name: 'Doğal seçilim', sameAs: ['https://www.wikidata.org/wiki/Q41410', 'https://tr.wikipedia.org/wiki/Doğal_seçilim'] },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

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
