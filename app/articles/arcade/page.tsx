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
        <div dangerouslySetInnerHTML={{ __html: HTML }} />
        <style>{`
          .arc-gallery { max-width: 1080px; margin: 0 auto; padding: 8px 22px 44px; }
          .arc-gallery h2 { font-size: clamp(1.15rem, 3vw, 1.6rem); font-weight: 800; color: #e9f6ff; margin: 30px 0 8px; letter-spacing: .04em; }
          .arc-gallery > p { color: #9fb3c8; margin: 0 0 18px; max-width: 68ch; line-height: 1.65; }
          .arc-gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 18px; align-items: start; }
          /* ArticleImage'ın slate varsayılanlarını makalenin neon paletine bağla. */
          .arc-img {
            --ai-caption: #cfe3f2;
            --ai-credit: #7f93a8;
            --ai-border: rgba(44,230,230,0.22);
            --ai-fill: rgba(44,230,230,0.05);
            --ai-mark: rgba(44,230,230,0.28);
          }
        `}</style>

        {/* GÖRSELLER — gövde content.ts'te tek parça HTML string olduğu için galeri
            hâlinde burada. DENETİM NOTU: bu setin sistemik hatası, hayatta kalmış
            ya da yeniden yapılmış bir nesnenin MODERN fotoğrafını oyunun tarihiyle
            etiketlemekti — okur onu dönem fotoğrafı sanardı. Tarihler artık
            nesneye değil OYUNA bağlı; her altyazı fotoğrafın kendi yılını veriyor. */}
        <section className="arc-gallery">
          <h2>Gerçek makineler</h2>
          <p>
            Yukarıdaki kabinler elle çizilmiş piksel ikonlar. Aşağıdakiler ise
            gerçek fotoğraflar — ama dikkat: birkaçı oyunun çıktığı yıldan değil,
            makinenin bugüne kalmış hâlinden. Hangisinin ne zaman çekildiği her
            altyazıda yazıyor.
          </p>
          <div className="arc-gallery-grid">
            <ArticleImage narrow
              className="arc-img"
              src="/articles/arcade/tennis-for-two-osiloskop.webp"
              ratio="1600 / 1257"
              alt="1950'ler siyah beyaz fotoğraf: bir spor salonunda kurulmuş sergi platformu; üzerinde sıra sıra laboratuvar cihazları, arkada “INSTRUMENTATION” yazan bir tabela ve radyasyon konulu bilgi afişleri."
              caption="Brookhaven Ulusal Laboratuvarı'nın 1958 ziyaretçi günü sergisi. Tennis for Two, işte bu standdaki cihazlardan birine bağlı beş inçlik bir osiloskopta oynanıyordu — dünyanın ilk video oyunu, bir laboratuvar açık gününün yan atraksiyonuydu."
              credit="Brookhaven National Laboratory · kamu malı"
            />
            <ArticleImage narrow
              className="arc-img"
              src="/articles/arcade/spacewar-pdp1.webp"
              ratio="1600 / 1076"
              alt="Dolap büyüklüğünde eski bir bilgisayarın önünde yuvarlak ekranlı bir konsol; ekranda parlak noktalardan oluşan basit bir uzay sahnesi görünüyor."
              caption="Spacewar! (1962) çalışırken. Ama bu kare 2007'de çekildi: Computer History Museum'da restore edilmiş bir PDP-1 üzerinde, oyunun doğduğu MIT'de değil."
              credit="Joi Ito · CC BY 2.0"
            />
            <ArticleImage narrow
              className="arc-img"
              src="/articles/arcade/pong-kabin.webp"
              ratio="1461 / 1998"
              alt="Ayaklı, dik duran ahşap ve metal oyun kabini; üst kısmında büyük harflerle PONG yazıyor, ortasında ekran ve iki döner düğme var."
              caption="Bir Atari Pong kabini (foto 2011). Tüm oyun bu kutunun içinde: iki çubuk, bir nokta ve bir skor."
              credit="Rob Boudon · CC BY 2.0"
            />
            <ArticleImage narrow
              className="arc-img"
              src="/articles/arcade/pacman-kabin.webp"
              ratio="1600 / 1200"
              alt="Müze ortamında duran renkli bir oyun kabini; yan panelinde Pac-Man figürleri ve hayaletler resmedilmiş."
              caption="Nagoya'daki Japon Oyun Müzesi koleksiyonunda bir Pac-Man kabini (foto 2020). Oyun 1980'de çıktı; makinelerin çoğu artık müzelerde."
              credit="inunami · CC BY 2.0"
            />
            <ArticleImage narrow
              className="arc-img"
              src="/articles/arcade/toru-iwatani-portre.webp"
              ratio="926 / 1159"
              alt="Gözlüklü, orta yaşlı bir adam bir konferansta konuşurken."
              caption="Toru Iwatani, Pac-Man'in yaratıcısı (GDC 2011)."
              credit="V. Diamante · CC BY 2.0"
            />
            <ArticleImage narrow
              className="arc-img"
              src="/articles/arcade/donkey-kong-kabin.webp"
              ratio="960 / 1280"
              alt="Dik duran oyun kabini; üst panelinde iri bir maymun ve tırmanılacak platformlar çizilmiş, altında kumanda kolu ve düğmeler var."
              caption="QuakeCon 2005'te bir Donkey Kong kabini. Oyun 1981'de çıktı ve Mario'yu — o zamanki adıyla “Jumpman”i — dünyaya tanıttı."
              credit="Joshua Driggs · CC BY-SA 2.0"
            />
            <ArticleImage narrow
              className="arc-img"
              src="/articles/arcade/miyamoto-portre.webp"
              ratio="1250 / 1666"
              alt="Takım elbiseli, gözlüklü bir adam resmî bir törende ayakta duruyor."
              caption="Shigeru Miyamoto, Donkey Kong'un ve Mario'nun yaratıcısı; 2015'te Kültür Liyakat Nişanı töreninde."
              credit="MEXT · CC BY 4.0"
            />
            <ArticleImage narrow
              className="arc-img"
              src="/articles/arcade/oyun-salonu.webp"
              ratio="1600 / 1066"
              alt="Yüksek açıdan çekilmiş geniş salon: sıra sıra dizilmiş onlarca oyun kabini ve aralarında dolaşan kalabalık."
              caption="Kabin sıraları hâlâ dolu: Super MAGFest 2025'in oyun salonu. Altın çağ bitti, ama makineler bitmedi."
              credit="Xarathion · CC BY-SA 4.0"
            />
          </div>
        </section>

        <ArticleBibliography items={refs} accent="#ec4899" />
      </div>
      <ArticleRuntime js={`${JS}\n;\n${GAME_JS}`} />
    </>
  );
}
