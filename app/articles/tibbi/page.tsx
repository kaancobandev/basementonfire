import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import ArticleRuntime from '@/app/components/ArticleRuntime';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import { CSS, HTML, JS } from './content';

const refs: BibItem[] = [
  { title: 'Gray\'s Anatomy (41. baskı)', source: 'Elsevier' },
  { title: 'MedlinePlus Tıbbi Ansiklopedi', source: 'ABD Ulusal Tıp Kütüphanesi (NIH)', url: 'https://medlineplus.gov/encyclopedia.html' },
  { title: 'Human disease', source: 'Encyclopædia Britannica', url: 'https://www.britannica.com/science/human-disease' },
  { title: 'Scientific American — Health', source: 'Scientific American', url: 'https://www.scientificamerican.com/health/' },
];

const title = 'Gerçek Olamayacak Kadar Tuhaf — 15 Tıbbi Olgu';
const description = 'Doğrulanmış ama akıl almaz 15 tıbbi olgu: insan vücudunun ve tıbbın en tuhaf gerçekleri, animasyonlu ve interaktif bir anlatımla.';
const path = '/articles/tibbi';
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=Manrope:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap';
const CDNS = [
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js',
];

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
      <main className="main-content tib-root">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div dangerouslySetInnerHTML={{ __html: HTML }} />
        <ArticleBibliography items={refs} accent="#ec5a13" />
      </main>
      <ArticleRuntime js={JS} cdns={CDNS} />
    </>
  );
}
