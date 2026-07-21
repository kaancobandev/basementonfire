import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import NewtonClient from './NewtonClient';
import { refs } from './refs';

const title = 'Isaac Newton: Bilimi Yeniden Kuran Adam';
const description = 'Isaac Newton kimdi? Üç hareket yasası (F = m·a), evrensel kütleçekim, kalkülüs ve optik; Mucize Yıllar, Principia, Güney Denizi Balonu dolandırılması ve bugün hangi yasalarını hâlâ kullandığımız — F=ma oyun alanı, ters-kare kütleçekim simülasyonu ve interaktif yasalarla.';
const path = '/articles/newton';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['Isaac Newton', 'Newton hareket yasaları', 'F = ma', 'evrensel kütleçekim', 'ters kare yasası', 'kalkülüs', 'Principia', 'annus mirabilis', 'mucize yıllar', 'optik', 'prizma', 'yansıtmalı teleskop', 'Güney Denizi Balonu', 'Newton Leibniz kavgası', 'eylemsizlik', 'etki tepki', 'görelilik', 'kuantum', 'bilim devrimi'],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basementonfire`, description, url: path },
  twitter: { card: 'summary_large_image', title: `${title} · Basementonfire`, description },
};

const jsonLd = articleJsonLd({
  title, description, path,
  datePublished: '2026-06-30',
  about: { type: 'Person', name: 'Isaac Newton', sameAs: ['https://www.wikidata.org/wiki/Q935', 'https://tr.wikipedia.org/wiki/Isaac_Newton'] },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

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
