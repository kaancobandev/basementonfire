import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript, articleJsonLd } from '@/lib/seo';
import SanatClient from './SanatClient';
import { refs } from './refs';

const title = "Sanat Akımları: Rönesans'tan Bugüne Kronolojik ve Coğrafi Harita";
const description = "Rönesans'tan yapay zekâya 60'tan fazla sanat akımı: hangi akım, nerede, kim tarafından, neden çıktı? Rönesans, Barok, İzlenimcilik, Kübizm, Sürrealizm, Soyut Dışavurumculuk, Pop, kavramsal ve çağdaş sanat — beş “motor” çerçevesiyle ve aranıp filtrelenebilen interaktif akım kâşifiyle. Batı-dışı gelenekler ve Türkiye dahil.";
const path = '/articles/sanat-akimlari';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['sanat akımları', 'sanat tarihi', 'Rönesans', 'Barok', 'İzlenimcilik', 'Kübizm', 'Sürrealizm', 'Soyut Dışavurumculuk', 'Pop Art', 'kavramsal sanat', 'çağdaş sanat', 'Neoklasizm', 'Romantizm', 'Realizm', 'avangard', 'Türk resim sanatı', 'sanat akımları kronolojisi', 'modern sanat'],
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basements`, description, url: path },
  twitter: { card: 'summary_large_image', title: `${title} · Basements`, description },
};

const jsonLd = articleJsonLd({
  title, description, path,
  datePublished: '2026-07-09',
  about: { type: 'Thing', name: 'Sanat akımları', sameAs: ['https://en.wikipedia.org/wiki/Art_movement', 'https://en.wikipedia.org/wiki/History_of_art'] },
  citation: refs.map((r) => ({ title: r.title, url: r.url })),
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: 'Sanat Akımları' },
]);

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <SanatClient />
    </>
  );
}
