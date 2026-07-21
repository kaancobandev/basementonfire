import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import SezarClient from './SezarClient';
import { refs } from './refs';

const title = 'Julius Caesar — Kendisini Öldürenleri Affeden Adam';
const description =
  'Caesar’ı öldüren şey en büyük erdemiydi: herkesi affetmesi. Korsanlara fidyesini az bulan çocuktan Galya’daki bir milyon ölüye, Rubicon’dan Alesia’nın çift suruna, 23 bıçaktan Caesar → Kaiser → Çar isim ağacına — Rubicon karar noktası, Alesia çift sur sahnesi ve 23 yara diyagramıyla interaktif. Kaynaklar taraflı, sayılar tartışmalı; çatlaklar gizlenmedi.';
const path = '/articles/sezar';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'Julius Caesar', 'Jül Sezar', 'Gaius Julius Caesar', 'Sezar', 'Roma Cumhuriyeti', 'Rubicon', 'alea iacta est',
    'Galya Savaşları', 'Alesia', 'Vercingetorix', 'Pharsalus', 'Pompeius', 'Crassus', 'Birinci Triumvirlik',
    'clementia', 'Brutus', 'Cassius', 'Mart İdus’u', 'Ides of March', 'Kleopatra', 'veni vidi vici',
    'dictator perpetuo', 'Suetonius', 'Plutarkhos', 'Appianos', 'Kaiser', 'Çar', 'Tsar', 'Kayser-i Rûm',
    'Augustus', 'Octavianus', 'Roma tarihi', 'antik Roma',
  ],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basementonfire`, description, url: path },
  twitter: { card: 'summary_large_image', title: 'Julius Caesar · Basementonfire', description },
};

const jsonLd = articleJsonLd({
  title,
  description,
  path,
  datePublished: '2026-07-15',
  about: {
    type: 'Person',
    name: 'Julius Caesar',
    sameAs: ['https://www.wikidata.org/wiki/Q1048', 'https://tr.wikipedia.org/wiki/Julius_Caesar'],
  },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Julius Caesar' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <SezarClient />
    </>
  );
}
