import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import DolaniklikClient from './DolaniklikClient';
import { refs } from './refs';

const title = 'Kuantum Dolanıklık: Mesaj Göndermeyen Bağ';
const description =
  'Kuantum dolanıklık nedir, neden ışıktan hızlı haberleşme sağlamaz ve neden “cevaplar baştan belliydi” açıklaması da çalışmaz? Bell eşitsizliğinden 2022 Nobel’ine, Leibniz’in iki saatinden Gazâlî’nin nedensellik itirazına, Üç Cisim Problemi’nden Ant-Man’e. Her terim kullanılmadan önce açıklanıyor; Bell testini kendin oynayabildiğin interaktif Mermin kutularıyla.';
const path = '/articles/kuantum-dolaniklik';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'kuantum dolanıklık', 'quantum entanglement', 'dolanıklık nedir', 'Bell eşitsizliği',
    'Bell testi', 'EPR paradoksu', 'Einstein Podolsky Rosen', 'Schrödinger', 'John Bell',
    'yerel gizli değişken', 'mesajlaşamama teoremi', 'kuantum ışınlama', 'kuantum şifreleme',
    'Micius', 'Nobel 2022', 'Aspect Clauser Zeilinger', 'süperpozisyon', 'dekoherans',
    'Leibniz önceden kurulmuş uyum', 'Gazâlî nedensellik', 'Üç Cisim Problemi', 'sofon',
    'kuantum mistisizmi', 'kuantum şifacılığı',
  ],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basementonfire`, description, url: path },
  twitter: { card: 'summary_large_image', title: `${title} · Basementonfire`, description },
};

const jsonLd = articleJsonLd({
  title,
  description,
  path,
  datePublished: '2026-09-08',
  about: {
    type: 'Thing',
    name: 'Kuantum dolanıklık',
    sameAs: [
      'https://en.wikipedia.org/wiki/Quantum_entanglement',
      'https://en.wikipedia.org/wiki/Bell%27s_theorem',
    ],
  },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Kuantum Dolanıklık' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <DolaniklikClient />
    </>
  );
}
