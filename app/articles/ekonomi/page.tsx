import { Fragment } from 'react';
import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import ArticleRuntime from '@/app/components/ArticleRuntime';
import AsyncFonts from '@/app/components/AsyncFonts';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import { ArticleQuiz } from '@/app/components/article/ArticleBlocks';
import ArticleImage from '@/app/components/article/ArticleImage';
import { CSS, HTML, JS } from './content';

const refs: BibItem[] = [
  { title: 'Ekonominin Temelleri (Principles of Economics)', authors: 'N. Gregory Mankiw', source: 'Cengage' },
  { title: 'Investopedia — Finansal Terimler Sözlüğü', source: 'Investopedia', url: 'https://www.investopedia.com/financial-term-dictionary-4769738' },
  { title: 'Terimler Sözlüğü', source: 'TCMB — Türkiye Cumhuriyet Merkez Bankası', url: 'https://www.tcmb.gov.tr/' },
  { title: 'Economics', authors: 'Paul Samuelson & William Nordhaus', source: 'McGraw-Hill' },
];

const title = 'Ekonominin Dili';
const description = 'Faiz, bileşik faiz, emtia, likidite, resesyon, stagflasyon, SWIFT/EFT/FAST, borsa, temettü, parite ve daha fazlası — interaktif araçlarla anlatılan ekonomi sözlüğü.';
const path = '/articles/ekonomi';
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: { type: 'article', title: `${title} · Basementonfire`, description, url: path },
  twitter: { card: 'summary_large_image', title: `${title} · Basementonfire`, description },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  inLanguage: 'tr-TR',
  datePublished: '2026-06-21',
  dateModified: '2026-06-21',
  url: `https://basementonfire.com${path}`,
  image: 'https://basementonfire.com/opengraph-image',
  author: { '@type': 'Organization', name: 'Basementonfire' },
  publisher: { '@type': 'Organization', name: 'Basementonfire' },
};

const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Keşfet', path: '/discover' },
  { name: title },
]);

// ── GÖRSELLER GÖVDEYE DAĞITILDI (einstein-rosen ile aynı desen) ──
// Makale tek parça HTML string'inden üretiliyor (content.ts): gövdeye React
// bileşeni gömülemiyor, ham <img> ise Netlify Image CDN'ini baypas edip tam boy
// webp indirtir. Çözüm: HTML'i üst düzey sınırlardan parçalayıp araya
// ArticleImage sokmak — bileşen CDN'den geçmeye ve SSR'da taranmaya devam ediyor.
// Parçaların etiket dengesi ve toplam uzunluğun korunduğu ölçülerek doğrulandı.
const GOVDE = HTML.replace('<main>', '').replace('</main>', '');
const PARCA = GOVDE.split(/(?=<section[\s>])/);

type Gorsel = { src: string; ratio: string; alt: string; caption: string; credit: string };
const GORSELLER: Record<number, Gorsel[]> = {
  1: [
    {
      src: "/articles/ekonomi/merkez-banka-fed.webp",
      ratio: "1600 / 888",
      alt: "Beyaz mermerden, sütunlu ve simetrik cepheli anıtsal bir devlet binası; önünde geniş çimenlik.",
      caption: "ABD Merkez Bankası'nın Eccles binası, Washington. Faiz kararları böyle binalarda alınır ve etkisi kredi kartı borcundan konut kredisine kadar herkese iner.",
      credit: "AgnosticPreachersKid · CC BY-SA 3.0"
    },
    {
      src: "/articles/ekonomi/enflasyon-banknot-1923.webp",
      ratio: "1600 / 985",
      alt: "Eski bir kâğıt banknot; üzerinde çok basamaklı, olağandışı büyük bir rakam basılı.",
      caption: "5 trilyon marklık banknot, 9 Kasım 1923 — Alman demiryollarının bastığı acil durum parası. Bir hafta sonra yapılan reform fiyatlardan on iki sıfır sildi.",
      credit: "Kamu malı"
    }
  ],
  2: [
    {
      src: "/articles/ekonomi/benzin-krizi-1974.webp",
      ratio: "1600 / 1080",
      alt: "Şehir içindeki bir benzin istasyonu; tabelasında günün kotasının tükendiğini bildiren yazı var, önünden bisikletli biri geçiyor.",
      caption: "Mayıs 1974, Portland: istasyonun günlük benzin kotası tükendi. Petrol ambargosu mart ayında kalkmıştı, sıkıntı yine de sürüyordu — stagflasyonun görünen yüzü.",
      credit: "ABD Ulusal Arşivleri / DOCUMERICA"
    },
    {
      src: "/articles/ekonomi/boga-ayi-heykeli.webp",
      ratio: "1600 / 1064",
      alt: "Meydanda karşı karşıya duran iki bronz heykel: boynuzlarını yukarı kaldırmış bir boğa ve pençesini indiren bir ayı.",
      caption: "Frankfurt Borsası'nın önündeki Boğa ve Ayı. Boğa boynuzuyla yukarı savurur, ayı pençesiyle aşağı indirir — piyasa yönlerinin adı buradan gelir.",
      credit: "Foto: Eva K. · CC BY-SA 2.5 · Heykel: Reinhard Dachlauer"
    }
  ],
  3: [
    {
      src: "/articles/ekonomi/altin-kulce.webp",
      ratio: "1600 / 1200",
      alt: "Üst üste istiflenmiş, üzerlerinde damga ve seri numaraları bulunan parlak sarı külçeler.",
      caption: "Altın külçeler. Emtia dediğimiz şey, en sert hâliyle: değeri bir kurumun sözünden değil, maddenin kendisinden gelen mal.",
      credit: "Pixabay · CC0"
    }
  ],
  4: [
    {
      src: "/articles/ekonomi/borsa-cokusu-1929.webp",
      ratio: "1600 / 1260",
      alt: "Siyah beyaz sokak fotoğrafı: şapkalı yüzlerce insan, taş bir binanın önünde caddeyi tıkamış hâlde toplanmış.",
      caption: "1929'da New York Borsası'nın önünde toplanan kalabalık. Borsa çöküşü ile resesyon aynı şey değildir — ama bu çöküş, Büyük Buhran'a giden resesyonun fitilini ateşledi.",
      credit: "Associated Press · kamu malı"
    },
    {
      src: "/articles/ekonomi/borsa-salonu.webp",
      ratio: "1600 / 2008",
      alt: "Yüksek tavanlı geniş salon; ekranlarla kaplı çalışma istasyonları ve aralarında hareket eden insanlar.",
      caption: "New York Borsası'nın işlem salonu (tarih belirsiz, 1980–2006 arası). Bugünün borsası büyük ölçüde elektronik — bu kalabalık artık ekranların içinde.",
      credit: "Carol M. Highsmith · kamu malı"
    }
  ],
  5: [
    {
      src: "/articles/ekonomi/doviz-banknot.webp",
      ratio: "1600 / 898",
      alt: "Yan yana serilmiş, farklı ülkelere ait çeşitli renk ve boyutlarda kâğıt banknotlar.",
      caption: "Farklı para birimlerinden banknotlar. Parite, bunlardan ikisinin birbiri cinsinden fiyatıdır — ve o fiyat her gün değişir.",
      credit: "epSos.de · CC BY 2.0"
    }
  ]
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <AsyncFonts href={FONT_URL} />
      <div className="main-content eko-root">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {/* MAKALENİN GÖVDESİ. Bu tek satır content.ts'teki ~2900 kelimenin
            tamamını basar — silinirse sayfada yalnızca galeri + kaynakça kalır
            ve bunu build de tsc de FARK ETMEZ (HTML yine içe aktarılmış
            görünür). Galeri eklerken bir kez silindi; yerinden oynatma. */}
        <main>
          {PARCA.map((parca, i) => (
            <Fragment key={i}>
              <div dangerouslySetInnerHTML={{ __html: parca }} />
              {GORSELLER[i] && (
                <div className="eko-gallery">
                  <div className="eko-gallery-grid">
                    {GORSELLER[i].map((g) => <ArticleImage narrow key={g.src} className="eko-img" {...g} />)}
                  </div>
                </div>
              )}
            </Fragment>
          ))}
        </main>
        {/* Quiz — Kaynakça'dan ÖNCE. Sorular quiz_questions tablosunda zaten
            vardı ama bileşen bu sayfada hiç render edilmiyordu, yani makale
            quizsiz görünüyordu. */}
        <ArticleQuiz accent="#38bdf8" bg="#070b16" />

        <ArticleBibliography items={refs} accent="#38bdf8" />
      </div>
      <ArticleRuntime js={JS} />
    </>
  );
}
