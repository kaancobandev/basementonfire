import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import ZihinClient from './ZihinClient';
import { refs } from './refs';

const title = 'Zihnini Yükleyebilir misin? — Tek Soru Sandığın Üç Ayrı Soru';
const description =
  'İnsan beynini bilgisayara aktarmak mümkün mü? Konnektom, tam beyin emülasyonu ve kimlik sorusu — neyin ölçüldüğü, neyin hâlâ açık, neyin düpedüz kuruntu olduğu kaynağıyla ayrılıyor. Sinirbilimcilerin kendi tahmini, Matrix’ten SOMA’ya kültür örnekleri ve iddiaları kendin sınıflandırdığın interaktif ayraçla.';
const path = '/articles/zihin-yukleme';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'zihin yükleme', 'mind uploading', 'tam beyin emülasyonu', 'whole brain emulation',
    'konnektom', 'connectome', 'beyin haritalama', 'C. elegans', 'FlyWire', 'MICrONS',
    'Blue Brain Project', 'Human Brain Project', 'Sandberg Bostrom', 'Chalmers', 'Parfit',
    'kişisel kimlik', 'bilinç', 'IIT', 'beyin koruma', 'kriyonik', 'Neuralink',
    'Matrix', 'SOMA', 'Black Mirror', 'dijital ölümsüzlük', 'sinirbilim',
  ],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basementonfire`, description, url: path },
  twitter: { card: 'summary_large_image', title: `${title} · Basementonfire`, description },
};

const jsonLd = articleJsonLd({
  title,
  description,
  path,
  datePublished: '2026-09-07',
  about: {
    type: 'Thing',
    name: 'Zihin yükleme (tam beyin emülasyonu)',
    sameAs: [
      'https://en.wikipedia.org/wiki/Mind_uploading',
      'https://en.wikipedia.org/wiki/Connectome',
    ],
  },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Zihnini Yükleyebilir misin?' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <ZihinClient />
    </>
  );
}
