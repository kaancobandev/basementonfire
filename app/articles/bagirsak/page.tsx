import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import BagirsakClient from './BagirsakClient';

const title = 'Bağırsaklar — İkinci Beyin';
const description = 'Bağırsak-beyin ekseni: bağırsaklarımız kararlarımızı ve ruh halimizi nasıl etkiliyor? İkinci beyin (enterik sinir sistemi), vagus siniri, serotoninin %90\'ı, mikrobiyom, içgüdüsel kararlar ve stres döngüsü — derin araştırma ve premium, interaktif bir anlatımla.';
const path = '/articles/bagirsak';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['bağırsak', 'bağırsak beyin ekseni', 'ikinci beyin', 'enterik sinir sistemi', 'vagus siniri', 'serotonin', 'mikrobiyom', 'ruh hali', 'içgüdüsel karar', 'gut feeling', 'psikobiyotik', 'interosepsiyon'],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basements`, description, url: path, images: ['/opengraph-image'] },
  twitter: { card: 'summary_large_image', title: `${title} · Basements`, description },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  inLanguage: 'tr-TR',
  datePublished: '2026-06-22',
  dateModified: '2026-06-22',
  url: `https://basementonfire.com${path}`,
  image: 'https://basementonfire.com/opengraph-image',
  author: { '@type': 'Organization', name: 'Basements' },
  publisher: { '@type': 'Organization', name: 'Basements' },
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
      <BagirsakClient />
    </>
  );
}
