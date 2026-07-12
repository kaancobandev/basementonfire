import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import ArticleRuntime from '@/app/components/ArticleRuntime';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import { CSS, HTML, JS } from './content';
import { GAME_CSS, GAME_JS } from './games';

const refs: BibItem[] = [
  { title: 'The Ultimate History of Video Games', authors: 'Steven L. Kent', year: '2001', source: 'Three Rivers Press' },
  { title: 'Replay: The History of Video Games', authors: 'Tristan Donovan', year: '2010', source: 'Yellow Ant' },
  { title: 'Video Game History', source: 'The Strong National Museum of Play', url: 'https://www.museumofplay.org/' },
  { title: 'Arcade video game', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Arcade_video_game' },
];

const title = 'Arcade — Oyun Salonunun Tarihi';
const description = 'Arcade oyunlarının tarihi, altın çağı ve efsane makineler; tarayıcıda oynanabilir Pong, Pac-Man ve platform klasikleriyle interaktif bir gezinti.';
const path = '/articles/arcade';
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Oxanium:wght@400;500;600;700;800&display=swap';

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
      <div className="main-content arc-root">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <style dangerouslySetInnerHTML={{ __html: GAME_CSS }} />
        <div dangerouslySetInnerHTML={{ __html: HTML }} />
        <ArticleBibliography items={refs} accent="#ec4899" />
      </div>
      <ArticleRuntime js={`${JS}\n;\n${GAME_JS}`} />
    </>
  );
}
