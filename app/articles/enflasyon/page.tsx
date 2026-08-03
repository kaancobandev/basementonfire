import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import EnflasyonClient from './EnflasyonClient';
import { refs } from './refs';

// ⚠ openGraph.images YAZILMAZ: dosya tabanlı opengraph-image.tsx'i sessizce ezer.

const title = 'Enflasyon Nedir?';
const description =
  'Enflasyon nedir, nasıl ölçülür ve neden herkes farklı yaşar? TÜFE sepeti, çekirdek enflasyon, bileşik etki ve hiperenflasyon — kendi enflasyonunu hesaplayabildiğin interaktif bir dosya.';
const path = '/articles/enflasyon';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basementonfire`, description, url: path },
  twitter: { card: 'summary_large_image', title: `${title} · Basementonfire`, description },
};

const jsonLd = articleJsonLd({
  title,
  description,
  path,
  datePublished: '2026-08-03',
  about: { type: 'Thing', name: 'Enflasyon', sameAs: ['https://tr.wikipedia.org/wiki/Enflasyon'] },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Enflasyon' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <EnflasyonClient />
    </>
  );
}
