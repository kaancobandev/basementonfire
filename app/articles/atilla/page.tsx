import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import AtillaClient from './AtillaClient';
import { refs } from './refs';

// ⚠ openGraph.images YAZILMAZ: dosya tabanlı opengraph-image.tsx'i sessizce ezer.
const title = 'Atilla — Bozkırdan Gelen Kağan';
const description =
  'Atilla’yı bir korku hikâyesi değil bir devlet olarak anlatan interaktif makale. 449’da otağda tahta kadehten içen adamın yıllık 2.100 libre altın topladığı yerden başlıyor; Mete Han’dan Rua’ya uzanan bozkır devlet geleneğine, kut ve ikili teşkilata, Kavimler Göçü’nün Atilla doğmadan başlamış olmasına, adının hem Gotça hem Türkçe okumasına, 57 kulesi yıkılıp 60 günde örülen Konstantinopolis surlarına, Aetius’la Catalaunum’a, Mincio’da Papa Leo’ya ve otağdaki o son geceye gidiyor. Kaynaklar çelişince taraf tutulmuyor, yan yana konuyor. Mars’ın Kılıcı 3B hero, Kavimler Göçü zinciri, kağanlık şeması, haraç sayacı, sur kesiti, Catalaunum savaş animasyonu, otağ karar modülü ve efsane karşılaştırıcı ile interaktif — Sezar serisinin 5. parçası. Ve kapanışta: Batı Roma’yı o yıkmadı.';
const path = '/articles/atilla';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'Atilla', 'Attila', 'Attila the Hun', 'Hunlar', 'Avrupa Hunları', 'Hun İmparatorluğu',
    'kağan', 'kut', 'ikili teşkilat', 'kurultay', 'bozkır devleti', 'Mete Han', 'Xiongnu',
    'Kavimler Göçü', 'Bleda', 'Rua', 'Muncuk', 'Ernak', 'Dengizich', 'Ellac',
    'Priskos', 'Priscus', 'Jordanes', 'Getica', 'Mars’ın Kılıcı',
    'Catalaunum', 'Flavius Aetius', 'Theodoric', 'Konstantinopolis surları',
    'Theodosius surları', '447 depremi', 'Honoria', 'Papa I. Leo', 'Aquileia',
    'Nibelungenlied', 'Etzel', 'Şiirsel Edda', 'Atli', 'Bulgar Hanları Nominaliası',
    'Kézai Simon', 'Odoacer', 'Romulus Augustulus', 'Orestes', 'Batı Roma’nın çöküşü',
  ],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basementonfire`, description, url: path },
  twitter: { card: 'summary_large_image', title: 'Atilla · Basementonfire', description },
};

const jsonLd = articleJsonLd({
  title,
  description,
  path,
  datePublished: '2026-08-01',
  about: {
    type: 'Person',
    name: 'Atilla',
    sameAs: ['https://www.wikidata.org/wiki/Q36724', 'https://tr.wikipedia.org/wiki/Atilla'],
  },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Tarih', path: '/discover/tarih' },
  { name: 'Atilla' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <AtillaClient />
    </>
  );
}
