import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import PeriyodikTabloClient from './PeriyodikTabloClient';
import { refs } from './refs';

// ⚠ openGraph.images YAZILMAZ: dosya tabanlı opengraph-image.tsx'i sessizce ezer.

const title = 'Periyodik Tablo';
const description =
  'Periyodik tablo neden bu şekilde ve nasıl olup da henüz bulunmamış elementleri tarif edebildi? Mendeleyev’in tutan tahminleri, hiç bulunamayan on dört hayaleti, orbital blokları ve hâlâ karara bağlanmamış 3. grup — 118 elementlik interaktif tabloyla.';
const path = '/articles/periyodik-tablo';

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
  about: { type: 'Thing', name: 'Periyodik tablo', sameAs: ['https://tr.wikipedia.org/wiki/Periyodik_tablo'] },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Periyodik Tablo' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <PeriyodikTabloClient />
    </>
  );
}
