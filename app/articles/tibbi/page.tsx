import { Fragment } from 'react';
import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import ArticleRuntime from '@/app/components/ArticleRuntime';
import AsyncFonts from '@/app/components/AsyncFonts';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import ArticleImage from '@/app/components/article/ArticleImage';
import { CSS, HTML, JS } from './content';

const refs: BibItem[] = [
  { title: 'Gray\'s Anatomy (41. baskı)', source: 'Elsevier' },
  { title: 'MedlinePlus Tıbbi Ansiklopedi', source: 'ABD Ulusal Tıp Kütüphanesi (NIH)', url: 'https://medlineplus.gov/encyclopedia.html' },
  { title: 'Human disease', source: 'Encyclopædia Britannica', url: 'https://www.britannica.com/science/human-disease' },
  { title: 'Scientific American — Health', source: 'Scientific American', url: 'https://www.scientificamerican.com/health/' },

  { title: 'FamilySearch — Medicine in History: What Medical Advancements Have Happened in Your Lifetime?', url: 'https://www.familysearch.org/en/blog/medicine-in-history' },
  { title: 'Worldwide Cancer Research — 7 Incredible Medical Breakthroughs That Changed the World', url: 'https://www.worldwidecancerresearch.org/cancer-and-research-information/understanding-discovery-research/7-incredible-medical-breakthroughs-that-changed-the-world/' },
  { title: 'Reddit r/medicine — Favorite Obscure Medical Facts (konu kaynağı)', url: 'https://www.reddit.com/r/medicine/comments/16tb6i6/what_are_some_of_your_favorite_obscure_medical/' },
  { title: 'PLOS One (2009), Kobayashi, Kikuchi & Okamura — İnsan biyolüminesansı (vaka 01)', url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0006256' },
  { title: 'ABD Gıda ve İlaç Dairesi (FDA) — Grapefruit Juice and Some Drugs Don\'t Mix (vaka 06)', url: 'https://www.fda.gov/consumers/consumer-updates/grapefruit-juice-and-some-drugs-dont-mix' },
  { title: 'London Museum — John Snow: Cholera & the Broad Street Pump (vaka 10)', url: 'https://www.londonmuseum.org.uk/collections/london-stories/john-snow-cholera-broad-street-pump/' },
  { title: 'Scientific American — Why Dying People Often Experience a Burst of Lucidity (vaka 11)', url: 'https://www.scientificamerican.com/article/why-dying-people-often-experience-a-burst-of-lucidity/' },
  { title: 'ABD Ulusal Yaşlanma Enstitüsü (NIH / NIA) — Paradoksal (terminal) lucidity araştırması (vaka 11)', url: 'https://www.nia.nih.gov/news/study-caregivers-finds-brief-bouts-lucidity-are-common-among-people-dementia' },
  { title: 'Britannica — Barry J. Marshall (vaka 16)', url: 'https://www.britannica.com/biography/Barry-J-Marshall' },
  { title: 'Science History Institute — Ignaz Semmelweis (vaka 17)', url: 'https://www.sciencehistory.org/education/scientific-biographies/ignaz-semmelweis/' },
  { title: 'McGill OSS — Phineas Gage, Neuroscience and Count Dracula (vaka 18)', url: 'https://www.mcgill.ca/oss/article/history/phineas-gage-neuroscience-and-count-dracula' },
  { title: 'Harvard Health — The Real Power of Placebos (vaka 19)', url: 'https://www.health.harvard.edu/staying-healthy/the-real-power-of-placebos' },
  { title: 'NobelPrize.org — Karl Landsteiner, 1930 (vaka 20)', url: 'https://www.nobelprize.org/prizes/medicine/1930/landsteiner/facts/' },
  { title: 'Duke Health — Appendix Isn\'t Useless: A Safe House for Bacteria (vaka 21)', url: 'https://corporate.dukehealth.org/news/appendix-isnt-useless-all-its-safe-house-bacteria' },
  { title: 'PBS NewsHour — The Excruciating Final Hours of President George Washington (vaka 22)', url: 'https://www.pbs.org/newshour/health/dec-14-1799-excruciating-final-hours-president-george-washington' },
  { title: 'PLOS Biology — Sender, Fuchs & Milo (2016), İnsan ve bakteri hücre sayıları (vaka 23)', url: 'https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.1002533' },
  { title: 'Scientific American — Why Can\'t a Person Tickle Himself? (vaka 24)', url: 'https://www.scientificamerican.com/article/why-cant-a-person-tickle/' },
  { title: 'PMC / NIH — V. S. Ramachandran ve hayalet uzuv araştırması (vaka 25)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4904333/' },
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
// Self-host (2026-07-24): cdnjs'e yeni origin bağlantısı (DNS+TLS ~100-250ms)
// + ~122KB dış indirme yerine kendi CDN'imizden 1 yıl immutable kopyalar.
// gsap/ScrollTrigger node_modules/gsap/dist'ten (3.15.0 — makale 3.12.5 için
// yazıldı, minor uyumlu), lottie devDependency lottie-web@5.12.2'den kopyalandı.
// Sürüm yükseltirken: dosyayı public/vendor'a YENİ sürümlü adla kopyala + burayı güncelle.
const CDNS = [
  '/vendor/gsap-3.15.0.min.js',
  '/vendor/ScrollTrigger-3.15.0.min.js',
  '/vendor/lottie-5.12.2.min.js',
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

// ── GÖRSELLER VAKA KARTLARININ ARASINA DAĞITILDI ──
// Makale tek parça HTML string'inden üretiliyor (content.ts) ve 25 tane
// <article class="entry"> vaka kartından oluşuyor. Görseller eskiden en sonda
// tek bir galeride toplanıyordu; artık her biri anlattığı vakanın yanında.
//
// ⚠ ÜÇ SARMALAYICI JSX'E TAŞINDI: div.shell, section.gallery ve div.entries
// kartlardan ÖNCE açılıp SONRA kapanıyor. String öylece bölününce parça 0'da
// üç etiket açık kalıyor, son parçada fazladan kapanış oluyordu (ölçüldü).
// Sarmalayıcılar burada kuruluyor, aradaki içerik ham HTML olarak basılıyor.
const _EN = '<div class="entries">';
const _i = HTML.indexOf(_EN);
const _sonKart = HTML.lastIndexOf('</article>') + '</article>'.length;
const ONCE = HTML.slice(0, HTML.indexOf('<div class="shell">'));
const HERO = HTML.slice(HTML.indexOf('<div class="shell">') + '<div class="shell">'.length, HTML.indexOf('<section class="gallery"'));
const LEJANT = HTML.slice(HTML.indexOf('>', HTML.indexOf('<section class="gallery"')) + 1, _i);
const KARTLAR = HTML.slice(_i + _EN.length, _sonKart).split(/(?=<article[\s>])/).filter((k: string) => k.trim());  // basli bosluk parcasi indeksi kaydiriyordu
// Kartlardan sonrası: </div></section> atılır (JSX kapatıyor), footer kalır.
const _kuyruk = HTML.slice(_sonKart).replace('</div>', '').replace('</section>', '');
const _sonDiv = _kuyruk.lastIndexOf('</div>');
// Son </div> shell'i kapatıyordu; onu da JSX kapatıyor.
const SON = _sonDiv >= 0 ? _kuyruk.slice(0, _sonDiv) + _kuyruk.slice(_sonDiv + 6) : _kuyruk;

type Gorsel = { src: string; ratio: string; alt: string; caption: string; credit: string };
const GORSELLER: Record<number, Gorsel[]> = {
  2: [
    {
      src: "/articles/tibbi/trepanasyon-kafatasi.webp",
      ratio: "1600 / 1200",
      alt: "Müze vitrininde duran yaşlı bir insan kafatası; tepesinde düzgün kenarlı, yuvarlağa yakın bir delik açılmış.",
      caption: "Trepanasyon uygulanmış tarih öncesi kafatası, Prag Şehri Müzesi. Kafatasına delik açmak, bilinen en eski cerrahi işlemlerden biri.",
      credit: "Zde · CC BY-SA 4.0"
    }
  ],
  4: [
    {
      src: "/articles/tibbi/imhotep-heykeli.webp",
      ratio: "1600 / 2137",
      alt: "Oturur hâlde, kucağında açılmış bir papirüs rulosu tutan küçük bronz Mısır heykelciği.",
      caption: "Oturan İmhotep heykelciği — ama Batlamyus Dönemi'nden (MÖ 332–30), yani İmhotep'ten yaklaşık 2.300 yıl sonra yapıldı. Bu bir hekimin portresi değil, tanrılaştırılmış hâlinin ikonu.",
      credit: "The Met · CC0"
    }
  ],
  5: [
    {
      src: "/articles/tibbi/fleming-penisilin.webp",
      ratio: "1600 / 1665",
      alt: "Beyaz önlüklü, papyonlu yaşlı bir adam laboratuvar tezgâhının başında oturmuş, elindeki küçük yuvarlak kaba bakıyor; tezgâh şişeler ve petri kaplarıyla dolu.",
      caption: "Alexander Fleming, St Mary's Hastanesi'ndeki laboratuvarında. Penisilini bulmasını sağlayan şey de tam olarak burasıydı: tatile giderken kapatmayı unuttuğu bir kap.",
      credit: "Bilgi Bakanlığı / IWM · kamu malı"
    }
  ],
  7: [
    {
      src: "/articles/tibbi/jenner-ilk-asi.webp",
      ratio: "1600 / 1246",
      alt: "Yağlıboya tablo: bir hekim, annesinin kucağındaki küçük bir çocuğun kolunu tutarak çizik atıyor; çevrede izleyen birkaç kişi.",
      caption: "Jenner ilk aşıyı yaparken — ama bu E.-E. Hillemacher'in 1884 tarihli tablosu, yani olaydan 88 yıl sonra hayal edilmiş bir sahne. Kayıt değil, canlandırma.",
      credit: "Wellcome Collection · CC BY 4.0"
    }
  ],
  9: [
    {
      src: "/articles/tibbi/leeuwenhoek-mikroskop.webp",
      ratio: "1600 / 785",
      alt: "Avuç içi kadar, ince metal bir levhadan ibaret basit mikroskop: ortasında minik bir mercek deliği, yanında vida düzeneği.",
      caption: "Leeuwenhoek'in basit mikroskobunun kopyası (faksimile), Utrecht Üniversitesi. Elinizdeki bu tek mercekli levha, ilk kez bakteri gören alet türüdür — ama bu örnek sonradan yapılmış bir eş nüsha.",
      credit: "Wellcome Collection · CC BY 4.0"
    }
  ],
  10: [
    {
      src: "/articles/tibbi/snow-kolera-haritasi.webp",
      ratio: "1600 / 1534",
      alt: "Elle çizilmiş eski sokak haritası; sokak kenarlarına ölümleri gösteren küçük siyah çubuklar işlenmiş, bazı noktalarda yığılmışlar.",
      caption: "John Snow'un kolera haritası: her siyah çubuk bir ölüm, kümelenme ise Broad Street pompasının çevresi. Harita 1855'te yayımlandı — yani pompa kolu söküldükten sonra; kanıtı üreten şey haritanın kendisi değil, arkasındaki sayımdı.",
      credit: "Wellcome Collection · CC BY 4.0"
    }
  ],
  12: [
    {
      src: "/articles/tibbi/eter-ilk-ameliyat.webp",
      ratio: "1600 / 1286",
      alt: "Erken dönem fotoğraf: takım elbiseli bir grup adam, masada yatan bir hastanın çevresinde toplanmış, biri bacağına eğilmiş durumda.",
      caption: "Eter anestezisi altında bir ameliyat, Massachusetts General Hospital, 3 Temmuz 1847; cerrah John Collins Warren. Uzun süre 16 Ekim 1846'daki ilk ameliyatın canlandırması sanıldı — bu bir katalog hatasıydı. Yine de bilinen en erken cerrahi fotoğraf.",
      credit: "Southworth & Hawes · kamu malı"
    }
  ],
  18: [
    {
      src: "/articles/tibbi/phineas-gage.webp",
      ratio: "1600 / 2719",
      alt: "19. yüzyıl portresi: takım elbiseli genç bir adam, elinde uzun bir demir çubuk tutuyor; bir gözü kapalı, yüzünün o yanında yara izi var.",
      caption: "Phineas Gage, beynini delip geçen demir çubuğu elinde tutarken. Fotoğraftaki kişinin Gage olduğu ancak 2009'da kesinleşti — kazadan 161 yıl sonra.",
      credit: "Kamu malı"
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
      <main className="main-content tib-root">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {/* MAKALENİN GÖVDESİ. Bu tek satır content.ts'teki ~3300 kelimenin
            tamamını basar — silinirse sayfada yalnızca galeri + kaynakça kalır
            ve bunu build de tsc de FARK ETMEZ (HTML yine içe aktarılmış
            görünür). Galeri eklerken bir kez silindi; yerinden oynatma. */}
        <div dangerouslySetInnerHTML={{ __html: ONCE }} />
        <div className="shell">
          <div dangerouslySetInnerHTML={{ __html: HERO }} />
          <section className="gallery" id="dosya">
            <div dangerouslySetInnerHTML={{ __html: LEJANT }} />
            <div className="entries">
              {KARTLAR.map((kart, i) => (
                <Fragment key={i}>
                  <div dangerouslySetInnerHTML={{ __html: kart }} />
                  {GORSELLER[i + 1] && (
                    <div className="tib-gallery-grid">
                      {GORSELLER[i + 1].map((g) => <ArticleImage narrow key={g.src} className="tib-img" {...g} />)}
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          </section>
          <div dangerouslySetInnerHTML={{ __html: SON }} />
        </div>
        <ArticleBibliography items={refs} accent="#ec5a13" />
      </main>
      <ArticleRuntime js={JS} cdns={CDNS} />
    </>
  );
}
