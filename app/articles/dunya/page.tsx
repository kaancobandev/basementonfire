import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import DunyaClient from './DunyaClient';

const title = 'Dünya\'nın Oluşumu, İç Yapısı ve Onu Eşsiz Kılan Özellikler';
const description = 'Dünya nasıl oluştu? Güneş bulutsusundan demir felaketine, jeodinamo ve manyetik kalkandan Ay\'ı yaratan dev çarpışmaya (Theia) kadar; çekirdek, manto, kabuk ve Dünya\'yı diğer gezegenlerden ayıran özellikler — interaktif iç yapı modeli, gezegen karşılaştırması ve zaman çizelgesiyle.';
const path = '/articles/dunya';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['Dünyanın oluşumu', 'güneş bulutsusu', 'yığışma', 'demir felaketi', 'gezegensel farklılaşma', 'iç çekirdek', 'dış çekirdek', 'manto', 'kabuk', 'jeodinamo', 'manyetik alan', 'manyetik kutup tersine dönmesi', 'dev çarpışma hipotezi', 'Theia', 'Ayın oluşumu', 'levha tektoniği', 'geç cila', 'LLSVP', 'yaşanabilir bölge', 'Dünyanın iç yapısı'],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basements`, description, url: path, images: ['/opengraph-image'] },
  twitter: { card: 'summary_large_image', title: 'Dünya — Oluşumu, İç Yapısı ve Eşsiz Özellikleri · Basements', description },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  inLanguage: 'tr-TR',
  datePublished: '2026-06-30',
  dateModified: '2026-06-30',
  url: `https://basementonfire.com${path}`,
  image: 'https://basementonfire.com/opengraph-image',
  author: { '@type': 'Organization', name: 'Basements' },
  publisher: { '@type': 'Organization', name: 'Basements' },
};

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Dünya' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <DunyaClient />
    </>
  );
}
