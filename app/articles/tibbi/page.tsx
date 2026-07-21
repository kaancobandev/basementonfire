import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import ArticleRuntime from '@/app/components/ArticleRuntime';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import ArticleImage from '@/app/components/article/ArticleImage';
import { CSS, HTML, JS } from './content';

const refs: BibItem[] = [
  { title: 'Gray\'s Anatomy (41. baskı)', source: 'Elsevier' },
  { title: 'MedlinePlus Tıbbi Ansiklopedi', source: 'ABD Ulusal Tıp Kütüphanesi (NIH)', url: 'https://medlineplus.gov/encyclopedia.html' },
  { title: 'Human disease', source: 'Encyclopædia Britannica', url: 'https://www.britannica.com/science/human-disease' },
  { title: 'Scientific American — Health', source: 'Scientific American', url: 'https://www.scientificamerican.com/health/' },
];

// 2026-07-16: 15 → 25. Makale 25 olgu içeriyor, başlık 15 diyordu — yani sitenin
// kendi kuralının ("sıfat değil, sayı") sayısı yanlıştı ve bu yanlış sayı paylaşım
// kartına basılıyordu. Sayım tek yorum değil, dört bağımsız kanıt: content.ts'te
// 25 <article> etiketi, 25 "Kaynak ·" atfı, gövdede iki kez "yirmi beş olgu",
// kaynakça başlığı "Yeni Olgular İçin Kaynaklar (16–25)". Olgu eklersen BURAYI,
// aşağıdaki description'ı ve lib/articles.ts'teki registry başlığını da güncelle.
const title = 'Gerçek Olamayacak Kadar Tuhaf — 25 Tıbbi Olgu';
const description = 'Doğrulanmış ama akıl almaz 25 tıbbi olgu: insan vücudunun ve tıbbın en tuhaf gerçekleri, animasyonlu ve interaktif bir anlatımla.';
const path = '/articles/tibbi';
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=Manrope:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap';
const CDNS = [
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js',
];

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

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONT_URL} />
      <main className="main-content tib-root">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {/* MAKALENİN GÖVDESİ. Bu tek satır content.ts'teki ~3300 kelimenin
            tamamını basar — silinirse sayfada yalnızca galeri + kaynakça kalır
            ve bunu build de tsc de FARK ETMEZ (HTML yine içe aktarılmış
            görünür). Galeri eklerken bir kez silindi; yerinden oynatma. */}
        <div dangerouslySetInnerHTML={{ __html: HTML }} />
        <style>{`
          .tib-gallery { max-width: var(--maxw, 1100px); margin: 0 auto; padding: 8px 24px 48px; }
          .tib-gallery h2 { font-family: Fraunces, Georgia, serif; font-size: clamp(1.2rem, 3vw, 1.7rem); font-weight: 700; color: var(--ink, #1a1714); margin: 32px 0 8px; }
          .tib-gallery > p { color: var(--ink-soft, #544d43); margin: 0 0 18px; max-width: var(--readw, 700px); line-height: 1.6; }
          .tib-gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; align-items: start; }
          /* AÇIK TEMA: ArticleImage varsayılanları koyu zemin içindir (beyaz kenarlık +
             beyaz filigran) ve bu kâğıt zeminde görünmez olur — beşini de çevir. */
          .tib-img {
            --ai-caption: #544d43;
            --ai-credit: #938a7c;
            --ai-border: rgba(26,23,20,0.12);
            --ai-fill: rgba(236,90,19,0.04);
            --ai-mark: rgba(26,23,20,0.28);
          }
        `}</style>

        {/* GÖRSELLER — bu makale content.ts'te tek parça HTML string olduğu için
            gövdeye ArticleImage gömülemiyor; ham <img> ise Netlify Image CDN'ini
            baypas ederdi. Bu yüzden galeri hâlinde burada.
            DENETİM NOTU: 25 olgunun 8'i fotoğraflanabilir, ama bu 8'in 7'sinde
            "ünlü fotoğraf aslında o an değil" tuzağı çıktı — altyazılar bunu
            söylüyor, tarihsel iddialar gövde metninde bırakıldı. */}
        <section className="tib-gallery">
          <h2>Olguların yüzü</h2>
          <p>
            Aşağıdaki sekiz kare, yukarıdaki olguların fotoğraflanabilen olanlarına ait.
            Birkaçı göründüğü şey değil: kimi bir kopya, kimi olaydan onlarca yıl sonra
            yapılmış bir canlandırma. Hangisinin ne olduğu her altyazıda yazıyor.
          </p>
          <div className="tib-gallery-grid">
            <ArticleImage narrow
              className="tib-img"
              src="/articles/tibbi/trepanasyon-kafatasi.webp"
              ratio="1600 / 1200"
              alt="Müze vitrininde duran yaşlı bir insan kafatası; tepesinde düzgün kenarlı, yuvarlağa yakın bir delik açılmış."
              caption="Trepanasyon uygulanmış tarih öncesi kafatası, Prag Şehri Müzesi. Kafatasına delik açmak, bilinen en eski cerrahi işlemlerden biri."
              credit="Zde · CC BY-SA 4.0"
            />
            <ArticleImage narrow
              className="tib-img"
              src="/articles/tibbi/imhotep-heykeli.webp"
              ratio="1600 / 2137"
              alt="Oturur hâlde, kucağında açılmış bir papirüs rulosu tutan küçük bronz Mısır heykelciği."
              caption="Oturan İmhotep heykelciği — ama Batlamyus Dönemi'nden (MÖ 332–30), yani İmhotep'ten yaklaşık 2.300 yıl sonra yapıldı. Bu bir hekimin portresi değil, tanrılaştırılmış hâlinin ikonu."
              credit="The Met · CC0"
            />
            <ArticleImage narrow
              className="tib-img"
              src="/articles/tibbi/leeuwenhoek-mikroskop.webp"
              ratio="1600 / 785"
              alt="Avuç içi kadar, ince metal bir levhadan ibaret basit mikroskop: ortasında minik bir mercek deliği, yanında vida düzeneği."
              caption="Leeuwenhoek'in basit mikroskobunun kopyası (faksimile), Utrecht Üniversitesi. Elinizdeki bu tek mercekli levha, ilk kez bakteri gören alet türüdür — ama bu örnek sonradan yapılmış bir eş nüsha."
              credit="Wellcome Collection · CC BY 4.0"
            />
            <ArticleImage narrow
              className="tib-img"
              src="/articles/tibbi/jenner-ilk-asi.webp"
              ratio="1600 / 1246"
              alt="Yağlıboya tablo: bir hekim, annesinin kucağındaki küçük bir çocuğun kolunu tutarak çizik atıyor; çevrede izleyen birkaç kişi."
              caption="Jenner ilk aşıyı yaparken — ama bu E.-E. Hillemacher'in 1884 tarihli tablosu, yani olaydan 88 yıl sonra hayal edilmiş bir sahne. Kayıt değil, canlandırma."
              credit="Wellcome Collection · CC BY 4.0"
            />
            <ArticleImage narrow
              className="tib-img"
              src="/articles/tibbi/snow-kolera-haritasi.webp"
              ratio="1600 / 1534"
              alt="Elle çizilmiş eski sokak haritası; sokak kenarlarına ölümleri gösteren küçük siyah çubuklar işlenmiş, bazı noktalarda yığılmışlar."
              caption="John Snow'un kolera haritası: her siyah çubuk bir ölüm, kümelenme ise Broad Street pompasının çevresi. Harita 1855'te yayımlandı — yani pompa kolu söküldükten sonra; kanıtı üreten şey haritanın kendisi değil, arkasındaki sayımdı."
              credit="Wellcome Collection · CC BY 4.0"
            />
            <ArticleImage narrow
              className="tib-img"
              src="/articles/tibbi/eter-ilk-ameliyat.webp"
              ratio="1600 / 1286"
              alt="Erken dönem fotoğraf: takım elbiseli bir grup adam, masada yatan bir hastanın çevresinde toplanmış, biri bacağına eğilmiş durumda."
              caption="Eter anestezisi altında bir ameliyat, Massachusetts General Hospital, 3 Temmuz 1847; cerrah John Collins Warren. Uzun süre 16 Ekim 1846'daki ilk ameliyatın canlandırması sanıldı — bu bir katalog hatasıydı. Yine de bilinen en erken cerrahi fotoğraf."
              credit="Southworth & Hawes · kamu malı"
            />
            <ArticleImage narrow
              className="tib-img"
              src="/articles/tibbi/fleming-penisilin.webp"
              ratio="1600 / 1665"
              alt="Beyaz önlüklü, papyonlu yaşlı bir adam laboratuvar tezgâhının başında oturmuş, elindeki küçük yuvarlak kaba bakıyor; tezgâh şişeler ve petri kaplarıyla dolu."
              caption="Alexander Fleming, St Mary's Hastanesi'ndeki laboratuvarında. Penisilini bulmasını sağlayan şey de tam olarak burasıydı: tatile giderken kapatmayı unuttuğu bir kap."
              credit="Bilgi Bakanlığı / IWM · kamu malı"
            />
            <ArticleImage narrow
              className="tib-img"
              src="/articles/tibbi/phineas-gage.webp"
              ratio="1600 / 2719"
              alt="19. yüzyıl portresi: takım elbiseli genç bir adam, elinde uzun bir demir çubuk tutuyor; bir gözü kapalı, yüzünün o yanında yara izi var."
              caption="Phineas Gage, beynini delip geçen demir çubuğu elinde tutarken. Fotoğraftaki kişinin Gage olduğu ancak 2009'da kesinleşti — kazadan 161 yıl sonra."
              credit="Kamu malı"
            />
          </div>
        </section>

        <ArticleBibliography items={refs} accent="#ec5a13" />
      </main>
      <ArticleRuntime js={JS} cdns={CDNS} />
    </>
  );
}
