import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import ArticleRuntime from '@/app/components/ArticleRuntime';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import { CSS, HTML, JS } from './content';

const refs: BibItem[] = [
  { title: 'The Particle Problem in the General Theory of Relativity', authors: 'A. Einstein & N. Rosen', year: '1935', source: 'Physical Review 48, 73' },
  { title: 'Wormholes in spacetime and their use for interstellar travel', authors: 'M. Morris & K. Thorne', year: '1988', source: 'American Journal of Physics 56, 395' },
  { title: 'Black Holes and Time Warps', authors: 'Kip S. Thorne', year: '1994', source: 'W. W. Norton' },
  { title: 'Wormhole', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Wormhole' },
];

const title = 'Einstein–Rosen Köprüsü';
const description = 'Solucan deliği nedir? Genel görelilik, uzay-zaman eğriliği ve Einstein–Rosen köprüsü; interaktif 3B model, uzay-zaman ızgarası ve quiz ile anlatıldı.';
const path = '/articles/einstein-rosen';
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap';
const CDNS = ['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'];

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
      <div className="main-content erk-root">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div dangerouslySetInnerHTML={{ __html: HTML }} />
        <ArticleBibliography items={refs} accent="#22d3ee" />
      </div>
      <ArticleRuntime js={JS} cdns={CDNS} />
    </>
  );
}
