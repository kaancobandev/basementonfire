import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import FatihClient from './FatihClient';
import { refs } from './refs';

const title = 'Fatih Sultan Mehmed — Bir Fikrin Ele Geçirdiği Adam';
const description =
  'Fatih\'i bir bayrak değil bir vaka olarak anlatan interaktif makale: kahraman da değil canavar da — takıntılı. 12 yaşında tahta çıkarılıp indirilen, 21\'inde Konstantinopolis\'i alan, 49\'unda Roma\'ya yürürken çayırda ölen adam. Truva\'daki mezardan Boğazkesen\'e, Urban\'ın topundan gemilerin bir gecede karadan yürütülmesine, Kerkoporta\'dan Kayser-i Rûm unvanına ve Hünkâr Çayırı\'ndaki zehir şüphesine. Bölünmüş saray terazisi, oynanabilir kuşatma simülasyonu, "sen XI. Konstantin\'sin" karar noktası, dört kronikçiyi yan yana koyan Kaynak Karşılaştırıcı ve zehir jürisiyle. Kural: sıfat değil, sayı.';
const path = '/articles/fatih';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'Fatih Sultan Mehmed', 'II. Mehmed', 'Fatih', 'İstanbul\'un Fethi', 'Konstantinopolis',
    '1453', 'Boğazkesen', 'Rumeli Hisarı', 'Urban topu', 'Şahi topu', 'Teodosius Surları',
    'Haliç', 'gemilerin karadan yürütülmesi', 'Kerkoporta', 'XI. Konstantin', 'Giustiniani',
    'Kayser-i Rûm', 'Gennadios', 'Sahn-ı Seman', 'Ali Kuşçu', 'Gentile Bellini', 'Fatih Kanunnâmesi',
    'Otranto Seferi', 'Hünkâr Çayırı', 'Çandarlı Halil Paşa', 'Zağanos Paşa', 'Kritovulos',
    'Dukas', 'Tursun Bey', 'Nicolò Barbaro', 'Truva', 'Akhilleus', 'Osmanlı tarihi',
  ],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basementonfire`, description, url: path },
  twitter: { card: 'summary_large_image', title: 'Fatih Sultan Mehmed · Basementonfire', description },
};

const jsonLd = articleJsonLd({
  title,
  description,
  path,
  datePublished: '2026-07-15',
  about: {
    type: 'Person',
    name: 'Fatih Sultan Mehmed',
    sameAs: ['https://www.wikidata.org/wiki/Q34503', 'https://tr.wikipedia.org/wiki/II._Mehmed'],
  },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Fatih Sultan Mehmed' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <FatihClient />
    </>
  );
}
