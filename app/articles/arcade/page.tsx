import { Fragment } from 'react';
import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import ArticleRuntime from '@/app/components/ArticleRuntime';
import AsyncFonts from '@/app/components/AsyncFonts';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import ArticleImage from '@/app/components/article/ArticleImage';
import { CSS, HTML, JS } from './content';
import { GAME_CSS, GAME_JS } from './games';

const refs: BibItem[] = [
  { title: 'The Ultimate History of Video Games', authors: 'Steven L. Kent', year: '2001', source: 'Three Rivers Press' },
  { title: 'Replay: The History of Video Games', authors: 'Tristan Donovan', year: '2010', source: 'Yellow Ant' },
  { title: 'Video Game History', source: 'The Strong National Museum of Play', url: 'https://www.museumofplay.org/' },
  { title: 'Arcade video game', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Arcade_video_game' },

  { title: 'Brookhaven National Laboratory — "The First Video Game?" (Tennis for Two, 1958)', url: 'https://www.bnl.gov/about/history/firstvideo.php' },
  { title: 'Wikipedia — Tennis for Two (Higinbotham, osiloskop)', url: 'https://en.wikipedia.org/wiki/Tennis_for_Two' },
  { title: 'Wikipedia — Pac-Man (Namco, 1980, Toru Iwatani)', url: 'https://en.wikipedia.org/wiki/Pac-Man' },
  { title: 'Wikipedia — Donkey Kong (Nintendo, 1981, Mario\'nun doğuşu)', url: 'https://en.wikipedia.org/wiki/Donkey_Kong_(1981_video_game)' },
  { title: 'Golden age of arcade video games (Pong 1972, Space Invaders 1978, Asteroids 1979)', url: 'https://en.wikipedia.org/wiki/Golden_age_of_arcade_video_games' },
];

const title = 'Arcade — Oyun Salonunun Tarihi';
const description = 'Arcade oyunlarının tarihi, altın çağı ve efsane makineler; tarayıcıda oynanabilir Pong, Pac-Man ve platform klasikleriyle interaktif bir gezinti.';
const path = '/articles/arcade';
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Oxanium:wght@400;500;600;700;800&display=swap';

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
      src: "/articles/arcade/tennis-for-two-osiloskop.webp",
      ratio: "1600 / 1257",
      alt: "1950'ler siyah beyaz fotoğraf: bir spor salonunda kurulmuş sergi platformu; üzerinde sıra sıra laboratuvar cihazları, arkada “INSTRUMENTATION” yazan bir tabela ve radyasyon konulu bilgi afişleri.",
      caption: "Brookhaven Ulusal Laboratuvarı'nın 1958 ziyaretçi günü sergisi. Tennis for Two, işte bu standdaki cihazlardan birine bağlı beş inçlik bir osiloskopta oynanıyordu — dünyanın ilk video oyunu, bir laboratuvar açık gününün yan atraksiyonuydu.",
      credit: "Brookhaven National Laboratory · kamu malı"
    },
    {
      src: "/articles/arcade/spacewar-pdp1.webp",
      ratio: "1600 / 1076",
      alt: "Dolap büyüklüğünde eski bir bilgisayarın önünde yuvarlak ekranlı bir konsol; ekranda parlak noktalardan oluşan basit bir uzay sahnesi görünüyor.",
      caption: "Spacewar! (1962) çalışırken. Ama bu kare 2007'de çekildi: Computer History Museum'da restore edilmiş bir PDP-1 üzerinde, oyunun doğduğu MIT'de değil.",
      credit: "Joi Ito · CC BY 2.0"
    }
  ],
  2: [
    {
      src: "/articles/arcade/pong-kabin.webp",
      ratio: "1461 / 1998",
      alt: "Ayaklı, dik duran ahşap ve metal oyun kabini; üst kısmında büyük harflerle PONG yazıyor, ortasında ekran ve iki döner düğme var.",
      caption: "Bir Atari Pong kabini (foto 2011). Tüm oyun bu kutunun içinde: iki çubuk, bir nokta ve bir skor.",
      credit: "Rob Boudon · CC BY 2.0"
    }
  ],
  3: [
    {
      src: "/articles/arcade/pacman-kabin.webp",
      ratio: "1600 / 1200",
      alt: "Müze ortamında duran renkli bir oyun kabini; yan panelinde Pac-Man figürleri ve hayaletler resmedilmiş.",
      caption: "Nagoya'daki Japon Oyun Müzesi koleksiyonunda bir Pac-Man kabini (foto 2020). Oyun 1980'de çıktı; makinelerin çoğu artık müzelerde.",
      credit: "inunami · CC BY 2.0"
    },
    {
      src: "/articles/arcade/toru-iwatani-portre.webp",
      ratio: "926 / 1159",
      alt: "Gözlüklü, orta yaşlı bir adam bir konferansta konuşurken.",
      caption: "Toru Iwatani, Pac-Man'in yaratıcısı (GDC 2011).",
      credit: "V. Diamante · CC BY 2.0"
    }
  ],
  4: [
    {
      src: "/articles/arcade/donkey-kong-kabin.webp",
      ratio: "960 / 1280",
      alt: "Dik duran oyun kabini; üst panelinde iri bir maymun ve tırmanılacak platformlar çizilmiş, altında kumanda kolu ve düğmeler var.",
      caption: "QuakeCon 2005'te bir Donkey Kong kabini. Oyun 1981'de çıktı ve Mario'yu — o zamanki adıyla “Jumpman”i — dünyaya tanıttı.",
      credit: "Joshua Driggs · CC BY-SA 2.0"
    },
    {
      src: "/articles/arcade/miyamoto-portre.webp",
      ratio: "1250 / 1666",
      alt: "Takım elbiseli, gözlüklü bir adam resmî bir törende ayakta duruyor.",
      caption: "Shigeru Miyamoto, Donkey Kong'un ve Mario'nun yaratıcısı; 2015'te Kültür Liyakat Nişanı töreninde.",
      credit: "MEXT · CC BY 4.0"
    }
  ],
  5: [
    {
      src: "/articles/arcade/oyun-salonu.webp",
      ratio: "1600 / 1066",
      alt: "Yüksek açıdan çekilmiş geniş salon: sıra sıra dizilmiş onlarca oyun kabini ve aralarında dolaşan kalabalık.",
      caption: "Kabin sıraları hâlâ dolu: Super MAGFest 2025'in oyun salonu. Altın çağ bitti, ama makineler bitmedi.",
      credit: "Xarathion · CC BY-SA 4.0"
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
      <div className="main-content arc-root">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <style dangerouslySetInnerHTML={{ __html: GAME_CSS }} />
        {/* MAKALENİN GÖVDESİ. Bu tek satır content.ts'teki ~2500 kelimenin
            tamamını basar — silinirse sayfada yalnızca galeri + kaynakça kalır
            ve bunu build de tsc de FARK ETMEZ (HTML yine içe aktarılmış
            görünür). Galeri eklerken bir kez silindi; yerinden oynatma. */}
        <main>
          {PARCA.map((parca, i) => (
            <Fragment key={i}>
              <div dangerouslySetInnerHTML={{ __html: parca }} />
              {GORSELLER[i] && (
                <div className="arc-gallery">
                  <div className="arc-gallery-grid">
                    {GORSELLER[i].map((g) => <ArticleImage narrow key={g.src} className="arc-img" {...g} />)}
                  </div>
                </div>
              )}
            </Fragment>
          ))}
        </main>
        <ArticleBibliography items={refs} accent="#ec4899" />
      </div>
      <ArticleRuntime js={`${JS}\n;\n${GAME_JS}`} />
    </>
  );
}
