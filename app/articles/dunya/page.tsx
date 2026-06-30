import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import DunyaClient from './DunyaClient';
import { refs } from './refs';

const title = 'Dünya\'nın Oluşumu, İç Yapısı ve Onu Eşsiz Kılan Özellikler';
const description = 'Dünya nasıl oluştu? Güneş bulutsusundan demir felaketine, jeodinamo ve manyetik kalkandan Ay\'ı yaratan dev çarpışmaya (Theia) kadar; çekirdek, manto, kabuk ve Dünya\'yı diğer gezegenlerden ayıran özellikler — interaktif iç yapı modeli, gezegen karşılaştırması ve zaman çizelgesiyle.';
const path = '/articles/dunya';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['Dünyanın oluşumu', 'güneş bulutsusu', 'yığışma', 'demir felaketi', 'gezegensel farklılaşma', 'iç çekirdek', 'dış çekirdek', 'manto', 'kabuk', 'jeodinamo', 'manyetik alan', 'manyetik kutup tersine dönmesi', 'dev çarpışma hipotezi', 'Theia', 'Ayın oluşumu', 'levha tektoniği', 'geç cila', 'LLSVP', 'yaşanabilir bölge', 'Dünyanın iç yapısı'],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basements`, description, url: path },
  twitter: { card: 'summary_large_image', title: 'Dünya — Oluşumu, İç Yapısı ve Eşsiz Özellikleri · Basements', description },
};

const jsonLd = articleJsonLd({
  title, description, path,
  datePublished: '2026-06-30',
  about: { type: 'Thing', name: 'Dünya', sameAs: ['https://www.wikidata.org/wiki/Q2', 'https://tr.wikipedia.org/wiki/Dünya'] },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

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
