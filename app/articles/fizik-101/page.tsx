import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import FizikClient from './FizikClient';
import { refs } from './refs';

const title = 'Sıfırdan Fizik — Temel Kavramlar: Kütle, Kuvvet, Newton, Momentum';
const description = "Fizik dersi hiç bilmeyenler için sıfırdan rehber: kütle, ağırlık, kuvvet, Newton (F=ma), ivme, hız, sürat, momentum, enerji, iş, güç, sürtünme ve yerçekimi — hepsi gündelik örnekler ve bolca interaktif deneyle (kuvvet laboratuvarı, çarpışma simülatörü, enerji rampası, aramalı fizik sözlüğü). Açık, sade ve eğlenceli.";
const path = '/articles/fizik-101';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['fizik temel kavramlar', 'kütle nedir', 'ağırlık nedir', 'kuvvet nedir', 'Newton yasaları', 'F=ma', 'ivme', 'hız ve sürat farkı', 'momentum nedir', 'kinetik enerji', 'potansiyel enerji', 'iş ve güç', 'sürtünme', 'yerçekimi', 'newton birimi', 'joule watt', 'sıfırdan fizik', 'fizik sözlüğü'],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basementonfire`, description, url: path },
  twitter: { card: 'summary_large_image', title: `${title} · Basementonfire`, description },
};

const jsonLd = articleJsonLd({
  title, description, path,
  datePublished: '2026-07-09',
  about: { type: 'Thing', name: 'Klasik mekanik (temel fizik)', sameAs: ['https://en.wikipedia.org/wiki/Classical_mechanics', 'https://en.wikipedia.org/wiki/Newton%27s_laws_of_motion'] },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Sıfırdan Fizik' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <FizikClient />
    </>
  );
}
