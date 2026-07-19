import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import ArticleRuntime from '@/app/components/ArticleRuntime';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import ArticleImage from '@/app/components/article/ArticleImage';
import { CSS, HTML, JS } from './content';

const refs: BibItem[] = [
  { title: 'The Particle Problem in the General Theory of Relativity', authors: 'A. Einstein & N. Rosen', year: '1935', source: 'Physical Review 48, 73' },
  { title: 'Wormholes in spacetime and their use for interstellar travel', authors: 'M. Morris & K. Thorne', year: '1988', source: 'American Journal of Physics 56, 395' },
  { title: 'Black Holes and Time Warps', authors: 'Kip S. Thorne', year: '1994', source: 'W. W. Norton' },
  { title: 'Wormhole', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Wormhole' },
];

const title = 'Einstein–Rosen Köprüsü';
const description = 'Solucan deliği nedir? Genel görelilik, uzay-zaman eğriliği ve Einstein–Rosen köprüsü; interaktif 3B model, uzay-zaman ızgarası ve quiz ile anlatıldı.';
const path = '/articles/einstein-rosen';
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap';
const CDNS = ['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'];

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
      <div className="main-content erk-root">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <style>{`
          .erk-gallery { max-width: var(--maxw, 1080px); margin: 0 auto; padding: 8px 20px 40px; }
          .erk-gallery h2 { font-size: clamp(1.15rem, 3vw, 1.6rem); font-weight: 800; color: var(--ink, #e9ecf8); margin: 28px 0 14px; }
          .erk-gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 18px; align-items: start; }
          /* ArticleImage'ın slate varsayılanlarını makalenin camgöbeği paletine bağla. */
          .erk-img {
            --ai-caption: #c8cfe6;
            --ai-credit: #7f88ab;
            --ai-border: rgba(84,214,232,0.22);
            --ai-fill: rgba(84,214,232,0.05);
            --ai-mark: rgba(84,214,232,0.28);
          }
        `}</style>
        <div dangerouslySetInnerHTML={{ __html: HTML }} />

        {/* GÖRSELLER — bu makale tek parça HTML string'inden üretildiği için
            (content.ts) gövdeye ArticleImage gömülemiyor; ham <img> ise Netlify
            Image CDN'i baypas edip 8 tam boy webp indirtirdi. Bu yüzden görseller
            bölüm hâlinde burada: bileşen CDN'den geçiyor, SSR'da taranabiliyor.
            Konu soyut — solucan deliğinin fotoğrafı yok (makalenin kendi tezi de bu)
            → fotoğraflanabilir iki şeye bağlandı: fikri kuran insanlar ve
            uzay-zaman bükülmesinin GERÇEKTEN gözlenmiş kanıtları. */}
        <section className="erk-gallery">
          <h2>Fikri kuranlar</h2>
          <div className="erk-gallery-grid">
            <ArticleImage
              className="erk-img"
              src="/articles/einstein-rosen/einstein-portre.webp"
              ratio="1600 / 1980"
              alt="Yaşlı bir adamın siyah beyaz portresi: dağınık beyaz saçlar, gür bıyık, doğrudan objektife bakan gözler."
              caption="Albert Einstein. 1935'te Nathan Rosen ile yazdığı makale “köprü”yü ortaya attı — ama amaçları bir geçit tarif etmek değil, parçacıkları uzay-zaman geometrisiyle açıklamaktı."
              credit="Orren Jack Turner · kamu malı"
            />
            <ArticleImage
              className="erk-img"
              src="/articles/einstein-rosen/schwarzschild-portre.webp"
              ratio="1096 / 1498"
              alt="Bıyıklı, takım elbiseli bir adamın 20. yüzyıl başı siyah beyaz portresi."
              caption="Karl Schwarzschild: Einstein'ın denklemlerinin ilk tam çözümünü 1916'da, Birinci Dünya Savaşı cephesindeyken buldu. Köprünün matematiği bu çözümden çıktı."
              credit="Kamu malı"
            />
            <ArticleImage
              className="erk-img"
              src="/articles/einstein-rosen/wheeler-portre.webp"
              ratio="720 / 900"
              alt="Takım elbiseli, gözlüklü bir adamın 1960'lar siyah beyaz portresi."
              caption="John Archibald Wheeler, 1963. “Solucan deliği” adını 1957'de o koydu; 1962'de Robert Fuller ile birlikte klasik köprünün ışık bile geçemeden çöktüğünü kanıtladı."
              credit="GFHund · CC BY 3.0"
            />
            <ArticleImage
              className="erk-img"
              src="/articles/einstein-rosen/kip-thorne.webp"
              ratio="1600 / 1067"
              alt="Beyaz saçlı, gözlüklü bir adam konuşma yaparken; arkasında sunum perdesi."
              caption="Kip Thorne: 1988'de Michael Morris ile birlikte, bir solucan deliğinin açık tutulabilmesi için gereken “egzotik madde”yi tarif etti — ve aynı makalede zaman makinesi sorununu açtı."
              credit="Victor R. Ruiz · CC BY 2.0"
            />
            <ArticleImage
              className="erk-img"
              src="/articles/einstein-rosen/hawking-portre.webp"
              ratio="1600 / 1067"
              alt="Tekerlekli sandalyedeki bir adam, ağırlıksız ortamda havada süzülürken gülümsüyor; çevresinde birkaç kişi."
              caption="Stephen Hawking. Kronoloji koruma varsayımı onun: fizik yasaları, zaman döngüsü kuracak her düzeneği daha kurulmadan bozuyor olabilir."
              credit="Jim Campbell/Aero-News Network · CC BY 3.0"
            />
          </div>

          <h2>Bükülmenin kanıtı</h2>
          <div className="erk-gallery-grid">
            <ArticleImage
              className="erk-img"
              src="/articles/einstein-rosen/m87-kara-delik.webp"
              ratio="1600 / 932"
              alt="Siyah zeminde turuncu-sarı, bulanık bir ışık halkası; ortası tamamen karanlık."
              caption="M87'nin merkezindeki kara delik (Event Horizon Telescope, 2019). Solucan deliğinin fotoğrafı yok — ama uzay-zamanın gerçekten büküldüğünün fotoğrafı var."
              credit="Event Horizon Telescope · CC BY 4.0"
            />
            <ArticleImage
              className="erk-img"
              src="/articles/einstein-rosen/einstein-carmigi.webp"
              ratio="1600 / 1545"
              alt="Koyu gökyüzünde ortadaki soluk lekenin çevresine haç biçiminde dizilmiş dört parlak nokta."
              caption="Einstein Haçı: tek bir uzak kuazarın, önündeki galaksinin kütleçekimiyle bükülüp dörde katlanmış görüntüsü. Kütle, ışığın yolunu gerçekten eğiyor."
              credit="NASA, ESA, STScI · kamu malı"
            />
            <ArticleImage
              className="erk-img"
              src="/articles/einstein-rosen/nasa-solucan-deligi.webp"
              ratio="1200 / 900"
              alt="Kavramsal çizim: yıldızlı uzayda huni biçiminde bükülmüş bir tünel ve içinden geçen ışık izleri."
              caption="NASA'nın kavramsal solucan deliği çizimi. Bu bir gözlem değil, bir illüstrasyon — ve makalenin çürüttüğü “yıldız geçidi” imgesinin ta kendisi."
              credit="Les Bossinas, NASA · kamu malı"
            />
          </div>
        </section>

        <ArticleBibliography items={refs} accent="#22d3ee" />
      </div>
      <ArticleRuntime js={JS} cdns={CDNS} />
    </>
  );
}
