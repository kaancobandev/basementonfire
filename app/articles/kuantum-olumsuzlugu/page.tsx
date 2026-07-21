import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import KuantumClient from './KuantumClient';
import { refs } from './refs';

const title = 'Kuantum Ölümsüzlüğü: Kendi Ölümünü Neden Hiç Deneyimlemeyebilirsin';
const description = "Kuantum ölümsüzlüğü nedir? Süperpozisyon, ölçüm/çöküş, Everett'in Çok Dünyalı Yorumu ve kuantum intiharı düşünce deneyi — ve aynı fikrin Adam Fawer'ın Mobius romanına kaçmış hâli. İnteraktif süperpozisyon parası, dallanma simülatörü ve dönen Möbius şeridiyle; fizikçilerin itirazlarıyla birlikte.";
const path = '/articles/kuantum-olumsuzlugu';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['kuantum ölümsüzlüğü', 'kuantum intiharı', 'çok dünyalı yorum', 'many-worlds', 'süperpozisyon', 'dalga fonksiyonu çöküşü', 'Kopenhag yorumu', 'Hugh Everett', 'Max Tegmark', 'Schrödinger kedisi', 'dekoherans', 'Born kuralı', 'düşünce deneyi', 'Adam Fawer Mobius', 'Möbius şeridi', 'kuantum felsefesi'],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basementonfire`, description, url: path },
  twitter: { card: 'summary_large_image', title: `${title} · Basementonfire`, description },
};

const jsonLd = articleJsonLd({
  title, description, path,
  datePublished: '2026-07-08',
  about: { type: 'Thing', name: 'Kuantum ölümsüzlüğü', sameAs: ['https://en.wikipedia.org/wiki/Quantum_suicide_and_immortality', 'https://en.wikipedia.org/wiki/Many-worlds_interpretation'] },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Kuantum Ölümsüzlüğü' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <KuantumClient />
    </>
  );
}
