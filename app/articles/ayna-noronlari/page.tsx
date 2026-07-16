import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import ArticleRuntime from '@/app/components/ArticleRuntime';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import { CSS, HTML, JS } from './content';

const refs: BibItem[] = [
  { title: 'Understanding motor events: a neurophysiological study', authors: 'G. di Pellegrino, L. Fadiga, L. Fogassi, V. Gallese, G. Rizzolatti', year: '1992', source: 'Experimental Brain Research 91, 176–180' },
  { title: 'Action recognition in the premotor cortex', authors: 'V. Gallese, L. Fadiga, L. Fogassi, G. Rizzolatti', year: '1996', source: 'Brain 119, 593–609' },
  { title: 'The mirror-neuron system', authors: 'G. Rizzolatti & L. Craighero', year: '2004', source: 'Annual Review of Neuroscience 27, 169–192' },
  { title: 'Single-neuron responses in humans during execution and observation of actions', authors: 'R. Mukamel, A. Ekstrom, J. Kaplan, M. Iacoboni, I. Fried', year: '2010', source: 'Current Biology 20, 750–756' },
  { title: 'The Myth of Mirror Neurons', authors: 'Gregory Hickok', year: '2014', source: 'W. W. Norton' },
  { title: 'Mirror neurons: from origin to function', authors: 'R. Cook, G. Bird, C. Catmur, C. Press, C. Heyes', year: '2014', source: 'Behavioral and Brain Sciences 37, 177–192' },
  { title: 'Overexposure Distorted the Science of Mirror Neurons', year: '2024', source: 'Quanta Magazine', url: 'https://www.quantamagazine.org/overexposure-distorted-the-science-of-mirror-neurons-20240402/' },
  { title: 'Ayna nöronu', source: 'Vikipedi', url: 'https://tr.wikipedia.org/wiki/Ayna_n%C3%B6ronu' },
];

const title = 'Ayna Nöronları';
const description = 'Sen bir şeyi yaptığında da başkasının yaptığını izlediğinde de ateşlenen nöronlar. Parma’daki kazara keşiften empati/otizm hype’ına, Hickok ve Heyes’in geri tepkisine — sinirsel aynalamanın çekişmeli hikâyesi; 3B ayna-nöron ağı ve interaktif deneylerle.';
const path = '/articles/ayna-noronlari';
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&family=Manrope:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap';
const CDNS = ['/vendor/three-r128.min.js'];

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basements`, description, url: path },
  twitter: { card: 'summary_large_image', title: `${title} · Basements`, description },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  inLanguage: 'tr-TR',
  datePublished: '2026-07-13',
  dateModified: '2026-07-13',
  url: `https://basementonfire.com${path}`,
  image: 'https://basementonfire.com/opengraph-image',
  author: { '@type': 'Organization', name: 'Basements' },
  publisher: { '@type': 'Organization', name: 'Basements' },
  about: { '@type': 'Thing', name: 'Ayna nöronları', sameAs: 'https://tr.wikipedia.org/wiki/Ayna_n%C3%B6ronu' },
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
      <div className="main-content ayn-root">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div dangerouslySetInnerHTML={{ __html: HTML }} />
        <ArticleBibliography items={refs} accent="#43e8c9" />
      </div>
      <ArticleRuntime js={JS} cdns={CDNS} />
    </>
  );
}
