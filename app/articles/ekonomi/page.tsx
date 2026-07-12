import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import ArticleRuntime from '@/app/components/ArticleRuntime';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import { CSS, HTML, JS } from './content';

const refs: BibItem[] = [
  { title: 'Ekonominin Temelleri (Principles of Economics)', authors: 'N. Gregory Mankiw', source: 'Cengage' },
  { title: 'Investopedia — Finansal Terimler Sözlüğü', source: 'Investopedia', url: 'https://www.investopedia.com/financial-term-dictionary-4769738' },
  { title: 'Terimler Sözlüğü', source: 'TCMB — Türkiye Cumhuriyet Merkez Bankası', url: 'https://www.tcmb.gov.tr/' },
  { title: 'Economics', authors: 'Paul Samuelson & William Nordhaus', source: 'McGraw-Hill' },
];

const title = 'Ekonominin Dili';
const description = 'Faiz, bileşik faiz, emtia, likidite, resesyon, stagflasyon, SWIFT/EFT/FAST, borsa, temettü, parite ve daha fazlası — interaktif araçlarla anlatılan ekonomi sözlüğü.';
const path = '/articles/ekonomi';
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap';

export const metadata: Metadata = {
  title,
  description,
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
  datePublished: '2026-06-21',
  dateModified: '2026-06-21',
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
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONT_URL} />
      <div className="main-content eko-root">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div dangerouslySetInnerHTML={{ __html: HTML }} />
        <ArticleBibliography items={refs} accent="#38bdf8" />
      </div>
      <ArticleRuntime js={JS} />
    </>
  );
}
