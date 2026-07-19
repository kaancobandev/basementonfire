import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import ArticleRuntime from '@/app/components/ArticleRuntime';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
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
  openGraph: { type: 'article', title: `${title} · Basements`, description, url: path },
  twitter: { card: 'summary_large_image', title: `${title} · Basements`, description },
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
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONT_URL} />
      <div className="main-content eko-root">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {/* MAKALENİN GÖVDESİ. Bu tek satır content.ts'teki ~2900 kelimenin
            tamamını basar — silinirse sayfada yalnızca galeri + kaynakça kalır
            ve bunu build de tsc de FARK ETMEZ (HTML yine içe aktarılmış
            görünür). Galeri eklerken bir kez silindi; yerinden oynatma. */}
        <div dangerouslySetInnerHTML={{ __html: HTML }} />
        <style>{`
          .eko-gallery { max-width: 1080px; margin: 0 auto; padding: 8px 22px 44px; }
          .eko-gallery h2 { font-size: clamp(1.15rem, 3vw, 1.6rem); font-weight: 800; color: #eef2f8; margin: 30px 0 8px; }
          .eko-gallery > p { color: #9fb0c6; margin: 0 0 18px; max-width: 68ch; line-height: 1.65; }
          .eko-gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; align-items: start; }
          /* ArticleImage'ın slate varsayılanlarını makalenin gökmavisi paletine bağla. */
          .eko-img {
            --ai-caption: #c8d4e2;
            --ai-credit: #6b7c92;
            --ai-border: rgba(56,189,248,0.22);
            --ai-fill: rgba(56,189,248,0.05);
            --ai-mark: rgba(56,189,248,0.28);
          }
        `}</style>

        {/* GÖRSELLER — gövde content.ts'te tek parça HTML string olduğu için galeri
            hâlinde burada. Bu bir sözlük makalesi: likidite, arbitraj, F/K, IBAN
            fotoğraflanamaz. Bu yüzden görseller yalnızca metnin ADIYLA andığı
            somut çapalara bağlandı. Bölüm 3 (SWIFT/EFT/IBAN) kasıtlı görselsiz. */}
        <section className="eko-gallery">
          <h2>Terimlerin somut karşılığı</h2>
          <p>
            Bu sayfadaki kavramların çoğunun fotoğrafı yoktur. Aşağıdakiler,
            metnin adını verdiği birkaç somut şeyin gerçek görüntüleri.
          </p>
          <div className="eko-gallery-grid">
            <ArticleImage
              className="eko-img"
              src="/articles/ekonomi/merkez-banka-fed.webp"
              ratio="1600 / 888"
              alt="Beyaz mermerden, sütunlu ve simetrik cepheli anıtsal bir devlet binası; önünde geniş çimenlik."
              caption="ABD Merkez Bankası'nın Eccles binası, Washington. Faiz kararları böyle binalarda alınır ve etkisi kredi kartı borcundan konut kredisine kadar herkese iner."
              credit="AgnosticPreachersKid · CC BY-SA 3.0"
            />
            <ArticleImage
              className="eko-img"
              src="/articles/ekonomi/altin-kulce.webp"
              ratio="1600 / 1200"
              alt="Üst üste istiflenmiş, üzerlerinde damga ve seri numaraları bulunan parlak sarı külçeler."
              caption="Altın külçeler. Emtia dediğimiz şey, en sert hâliyle: değeri bir kurumun sözünden değil, maddenin kendisinden gelen mal."
              credit="Pixabay · CC0"
            />
            <ArticleImage
              className="eko-img"
              src="/articles/ekonomi/borsa-cokusu-1929.webp"
              ratio="1600 / 1260"
              alt="Siyah beyaz sokak fotoğrafı: şapkalı yüzlerce insan, taş bir binanın önünde caddeyi tıkamış hâlde toplanmış."
              caption="1929'da New York Borsası'nın önünde toplanan kalabalık. Borsa çöküşü ile resesyon aynı şey değildir — ama bu çöküş, Büyük Buhran'a giden resesyonun fitilini ateşledi."
              credit="Associated Press · kamu malı"
            />
            <ArticleImage
              className="eko-img"
              src="/articles/ekonomi/benzin-krizi-1974.webp"
              ratio="1600 / 1080"
              alt="Şehir içindeki bir benzin istasyonu; tabelasında günün kotasının tükendiğini bildiren yazı var, önünden bisikletli biri geçiyor."
              caption="Mayıs 1974, Portland: istasyonun günlük benzin kotası tükendi. Petrol ambargosu mart ayında kalkmıştı, sıkıntı yine de sürüyordu — stagflasyonun görünen yüzü."
              credit="ABD Ulusal Arşivleri / DOCUMERICA"
            />
            <ArticleImage
              className="eko-img"
              src="/articles/ekonomi/enflasyon-banknot-1923.webp"
              ratio="1600 / 985"
              alt="Eski bir kâğıt banknot; üzerinde çok basamaklı, olağandışı büyük bir rakam basılı."
              caption="5 trilyon marklık banknot, 9 Kasım 1923 — Alman demiryollarının bastığı acil durum parası. Bir hafta sonra yapılan reform fiyatlardan on iki sıfır sildi."
              credit="Kamu malı"
            />
            <ArticleImage
              className="eko-img"
              src="/articles/ekonomi/boga-ayi-heykeli.webp"
              ratio="1600 / 1064"
              alt="Meydanda karşı karşıya duran iki bronz heykel: boynuzlarını yukarı kaldırmış bir boğa ve pençesini indiren bir ayı."
              caption="Frankfurt Borsası'nın önündeki Boğa ve Ayı. Boğa boynuzuyla yukarı savurur, ayı pençesiyle aşağı indirir — piyasa yönlerinin adı buradan gelir."
              credit="Foto: Eva K. · CC BY-SA 2.5 · Heykel: Reinhard Dachlauer"
            />
            <ArticleImage
              className="eko-img"
              src="/articles/ekonomi/borsa-salonu.webp"
              ratio="1600 / 2008"
              alt="Yüksek tavanlı geniş salon; ekranlarla kaplı çalışma istasyonları ve aralarında hareket eden insanlar."
              caption="New York Borsası'nın işlem salonu (tarih belirsiz, 1980–2006 arası). Bugünün borsası büyük ölçüde elektronik — bu kalabalık artık ekranların içinde."
              credit="Carol M. Highsmith · kamu malı"
            />
            <ArticleImage
              className="eko-img"
              src="/articles/ekonomi/doviz-banknot.webp"
              ratio="1600 / 898"
              alt="Yan yana serilmiş, farklı ülkelere ait çeşitli renk ve boyutlarda kâğıt banknotlar."
              caption="Farklı para birimlerinden banknotlar. Parite, bunlardan ikisinin birbiri cinsinden fiyatıdır — ve o fiyat her gün değişir."
              credit="epSos.de · CC BY 2.0"
            />
          </div>
        </section>

        <ArticleBibliography items={refs} accent="#38bdf8" />
      </div>
      <ArticleRuntime js={JS} />
    </>
  );
}
