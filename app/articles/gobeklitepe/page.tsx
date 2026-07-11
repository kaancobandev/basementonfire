import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import GobeklitepeClient from './GobeklitepeClient';
import { refs } from './refs';

const title = 'Göbeklitepe — Tarladan Önce Tapınak';
const description = 'Göbeklitepe nedir, ne kadar eski ve neden tarihi yeniden yazdı? Yaklaşık MÖ 9600’de avcı-toplayıcıların diktiği T-biçimli taş devler: piramitlerden 7.000, yazıdan 6.000 yıl önce. İnteraktif derin zaman kaydırıcısı, T-pilar kâşifi, çevre haritası ve doğrulanmış kaynaklarla.';
const path = '/articles/gobeklitepe';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'Göbeklitepe', 'Göbekli Tepe', 'Şanlıurfa', 'Neolitik', 'T-biçimli pilar', 'T pillars', 'Klaus Schmidt',
    'dünyanın ilk tapınağı', 'avcı toplayıcılar', 'Çanak Çömleksiz Neolitik', 'Akbaba Taşı', 'Pilar 43',
    'Karahantepe', 'Taş Tepeler', 'tarımın kökeni', 'Neolitik devrim', 'megalitik', 'kafatası kültü',
    'Anadolu arkeolojisi', 'UNESCO Dünya Mirası', 'PPNA', 'uygarlığın kökeni', 'Urfa Adamı',
  ],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basements`, description, url: path },
  twitter: { card: 'summary_large_image', title: 'Göbeklitepe · Basements', description },
};

const jsonLd = articleJsonLd({
  title, description, path,
  datePublished: '2026-07-11',
  about: { type: 'Thing', name: 'Göbekli Tepe', sameAs: ['https://www.wikidata.org/wiki/Q669619', 'https://tr.wikipedia.org/wiki/Göbeklitepe'] },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Göbeklitepe' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <GobeklitepeClient />
    </>
  );
}
