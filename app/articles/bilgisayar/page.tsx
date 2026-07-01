import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import BilgisayarClient from './BilgisayarClient';
import { refs } from './refs';

const title = 'Bilgisayar Nasıl Çalışır? Parçaların Tam Rehberi';
const description = 'CPU, GPU, RAM, SSD/HDD, anakart, güç kaynağı, sistem kristali, LCD, mikrofon ve hoparlör nasıl çalışır? Bilgisayarın tüm ana parçalarını bol benzetme ve interaktif araçlarla (ikili sayı oyun alanı, komut döngüsü, CPU↔GPU ve SSD↔HDD karşılaştırma, RGB piksel karıştırıcı) adım adım anlatıyoruz.';
const path = '/articles/bilgisayar';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['bilgisayar nasıl çalışır', 'CPU nedir', 'GPU nedir', 'RAM nedir', 'DDR', 'DDR4 DDR5', 'SSD HDD farkı', 'anakart', 'transistör', 'ikili sayı sistemi', 'güç kaynağı PSU', 'sistem kristali', 'LCD ekran nasıl çalışır', 'mikrofon nasıl çalışır', 'hoparlör', 'komut döngüsü', 'önbellek cache', 'çekirdek core', 'bilgisayar parçaları'],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basements`, description, url: path },
  twitter: { card: 'summary_large_image', title: `${title} · Basements`, description },
};

const jsonLd = articleJsonLd({
  title, description, path,
  datePublished: '2026-06-30',
  about: { type: 'Thing', name: 'Bilgisayar', sameAs: ['https://www.wikidata.org/wiki/Q68', 'https://tr.wikipedia.org/wiki/Bilgisayar'] },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Bilgisayar Nasıl Çalışır?' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <BilgisayarClient />
    </>
  );
}
