import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import MolClient from './MolClient';
import { refs } from './refs';

const title = 'Kimyada Mol Kavramı — Kapsamlı Rehber';
const description = "Mol nedir? Kimyanın en temel kavramı, gündelik örneklerle: 1 mol = 6,022 × 10²³ tane (Avogadro sayısı). Molar kütle, dönüşüm haritası, molarite ve stokiyometri — interaktif mol hesaplayıcı, Avogadro ölçeği ve periyodik tablodan molar kütle çekme aracıyla.";
const path = '/articles/mol';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['mol nedir', 'mol kavramı', 'Avogadro sayısı', '6.022 x 10^23', 'molar kütle', 'bağıl atom kütlesi', 'molekül kütlesi', 'molar hacim', '22.4 litre', 'molarite', 'derişim', 'stokiyometri', 'mol hesaplama', 'mol gram çevirme', 'kimya mol', 'normal koşullar'],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basementonfire`, description, url: path },
  twitter: { card: 'summary_large_image', title: `${title} · Basementonfire`, description },
};

const jsonLd = articleJsonLd({
  title, description, path,
  datePublished: '2026-07-09',
  about: { type: 'Thing', name: 'Mol (kimya)', sameAs: ['https://en.wikipedia.org/wiki/Mole_(unit)', 'https://en.wikipedia.org/wiki/Avogadro_constant'] },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Kimyada Mol Kavramı' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <MolClient />
    </>
  );
}
