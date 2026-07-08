import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import CiftYarikClient from './CiftYarikClient';
import { refs } from './refs';

const title = 'Çift Yarık Deneyi: Gerçekliğin Kalbindeki Çatlak';
const description = "Çift yarık deneyi nedir ve neden kuantum fiziğinin tek gerçek gizemi sayılır? Dalga-parçacık ikiliği, tek tek gönderilen elektronların girişimi, gözlemin etkisi (dekoherans) ve yorumlar — interaktif çift yarık simülatörü, dalga havuzu ve de Broglie hesaplayıcısıyla, arka planda hareket eden elektronlarla anlatıyoruz.";
const path = '/articles/cift-yarik';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['çift yarık deneyi', 'dalga parçacık ikiliği', 'kuantum mekaniği', 'girişim deseni', 'elektron girişimi', 'süperpozisyon', 'dalga fonksiyonu', 'dekoherans', 'kuantum dolanıklık', 'de Broglie dalga boyu', 'belirsizlik ilkesi', 'tamamlayıcılık ilkesi', 'kuantum silgi', 'geciktirilmiş seçim', 'Feynman', 'gözlemci etkisi'],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basements`, description, url: path },
  twitter: { card: 'summary_large_image', title: `${title} · Basements`, description },
};

const jsonLd = articleJsonLd({
  title, description, path,
  datePublished: '2026-07-08',
  about: { type: 'Thing', name: 'Çift yarık deneyi', sameAs: ['https://en.wikipedia.org/wiki/Double-slit_experiment', 'https://tr.wikipedia.org/wiki/%C3%87ift_yar%C4%B1k_deneyi'] },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Çift Yarık Deneyi' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <CiftYarikClient />
    </>
  );
}
