import type { Metadata } from 'next';
import { jsonLdScript } from '@/lib/seo';
import ArticleRuntime from '@/app/components/ArticleRuntime';
import { CSS, HTML, JS } from './content';

const title = 'Einstein–Rosen Köprüsü';
const description = 'Solucan deliği nedir? Genel görelilik, uzay-zaman eğriliği ve Einstein–Rosen köprüsü; interaktif 3B model, uzay-zaman ızgarası ve quiz ile anlatıldı.';
const path = '/articles/einstein-rosen';
const FONTS = "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');";
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

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <style dangerouslySetInnerHTML={{ __html: FONTS }} />
      <main className="main-content erk-root">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div dangerouslySetInnerHTML={{ __html: HTML }} />
      </main>
      <ArticleRuntime js={JS} cdns={CDNS} />
    </>
  );
}
