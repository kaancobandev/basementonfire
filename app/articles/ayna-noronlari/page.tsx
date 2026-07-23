import type { Metadata } from 'next';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import ArticleRuntime from '@/app/components/ArticleRuntime';
import AsyncFonts from '@/app/components/AsyncFonts';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import ArticleImage from '@/app/components/article/ArticleImage';
import { CSS, HTML, JS } from './content';

const refs: BibItem[] = [
  { title: 'Understanding motor events: a neurophysiological study', authors: 'G. di Pellegrino, L. Fadiga, L. Fogassi, V. Gallese, G. Rizzolatti', year: '1992', source: 'Experimental Brain Research 91, 176–180' },
  { title: 'Action recognition in the premotor cortex', authors: 'V. Gallese, L. Fadiga, L. Fogassi, G. Rizzolatti', year: '1996', source: 'Brain 119, 593–609' },
  { title: 'The mirror-neuron system', authors: 'G. Rizzolatti & L. Craighero', year: '2004', source: 'Annual Review of Neuroscience 27, 169–192' },
  { title: 'Single-neuron responses in humans during execution and observation of actions', authors: 'R. Mukamel, A. Ekstrom, J. Kaplan, M. Iacoboni, I. Fried', year: '2010', source: 'Current Biology 20, 750–756' },
  { title: 'The Myth of Mirror Neurons', authors: 'Gregory Hickok', year: '2014', source: 'W. W. Norton' },
  { title: 'Mirror neurons: from origin to function', authors: 'R. Cook, G. Bird, C. Catmur, C. Press, C. Heyes', year: '2014', source: 'Behavioral and Brain Sciences 37, 177–192' },
  { title: 'Overexposure Distorted the Science of Mirror Neurons', year: '2024', source: 'Quanta Magazine', url: 'https://www.quantamagazine.org/overexposure-distorted-the-science-of-mirror-neurons-20240402/' },
  { title: 'Ayna nöronu', source: 'Vikipedi', url: 'https://tr.wikipedia.org/wiki/Ayna_n%C3%B6ronu' },
];

const title = 'Ayna Nöronları';
const description = 'Sen bir şeyi yaptığında da başkasının yaptığını izlediğinde de ateşlenen nöronlar. Parma’daki kazara keşiften empati/otizm hype’ına, Hickok ve Heyes’in geri tepkisine — sinirsel aynalamanın çekişmeli hikâyesi; 3B ayna-nöron ağı ve interaktif deneylerle.';
const path = '/articles/ayna-noronlari';
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&family=Manrope:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap';
const CDNS = ['/vendor/three-r128.min.js'];

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
  datePublished: '2026-07-13',
  dateModified: '2026-07-13',
  url: `https://basementonfire.com${path}`,
  image: 'https://basementonfire.com/opengraph-image',
  author: { '@type': 'Organization', name: 'Basementonfire' },
  publisher: { '@type': 'Organization', name: 'Basementonfire' },
  about: { '@type': 'Thing', name: 'Ayna nöronları', sameAs: 'https://tr.wikipedia.org/wiki/Ayna_n%C3%B6ronu' },
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
      <div className="main-content ayn-root">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {/* MAKALENİN GÖVDESİ. Bu tek satır content.ts'teki metnin tamamını
            basar — silinirse sayfada yalnızca galeri + kaynakça kalır ve bunu
            build de tsc de FARK ETMEZ (HTML yine içe aktarılmış görünür).
            Galeri eklerken bir kez silindi; yerinden oynatma. */}
        <div dangerouslySetInnerHTML={{ __html: HTML }} />
        <style>{`
          .ayn-gallery { max-width: 1080px; margin: 0 auto; padding: 8px 22px 44px; }
          .ayn-gallery h2 { font-size: clamp(1.15rem, 3vw, 1.6rem); font-weight: 800; color: #eef1f8; margin: 30px 0 8px; }
          .ayn-gallery > p { color: #939cbb; margin: 0 0 18px; max-width: 68ch; line-height: 1.65; }
          .ayn-gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 18px; align-items: start; }
          /* ArticleImage'ın slate varsayılanlarını makalenin ayna-turkuazı paletine bağla. */
          .ayn-img {
            --ai-caption: #c6ccdf;
            --ai-credit: #5f6789;
            --ai-border: rgba(67,232,201,0.22);
            --ai-fill: rgba(67,232,201,0.05);
            --ai-mark: rgba(67,232,201,0.28);
          }
        `}</style>

        {/* GÖRSELLER — gövde content.ts'te tek parça HTML string olduğu için galeri
            hâlinde burada. DENETİM NOTU: spec'teki sekizinci görsel ("bir üzüm
            tanesini kavrayan el") indirilmeden önce gözle kontrol edildi ve
            aslında gün doğumunda TRAKTÖRLÜ bir bağ manzarası olduğu görüldü —
            setten çıkarıldı, yerine uydurma bir kare konmadı. */}
        <section className="ayn-gallery">
          <h2>Hikâyenin yerleri ve yüzleri</h2>
          <p>
            Ayna nöronlarının hikâyesi belirli bir şehirde, belirli bir türle ve
            adı bilinen birkaç kişiyle geçiyor. Aşağıdakiler o hikâyenin
            fotoğraflanabilen parçaları.
          </p>
          <div className="ayn-gallery-grid">
            <ArticleImage narrow
              className="ayn-img"
              src="/articles/ayna-noronlari/parma-universitesi.webp"
              ratio="1600 / 2146"
              alt="Tarihî bir taş binanın cephesi: kemerli büyük bir giriş kapısı, üst katlarda simetrik dizilmiş pencereler."
              caption="Parma Üniversitesi. Keşif bu üniversitede yapıldı — ama bu bina merkezî yönetim binası; Rizzolatti'nin laboratuvarı şehrin başka bir yerindeki Nörobilim Bölümü'ndeydi."
              credit="Parma1983 · CC BY-SA 4.0"
            />
            <ArticleImage narrow
              className="ayn-img"
              src="/articles/ayna-noronlari/makak-maymunu.webp"
              ratio="1600 / 1066"
              alt="Ormanlık bir alanda, betondan bir kenarın üzerinde iki ayağı üstünde dikilmiş, açık kahverengi tüylü iri bir maymun doğrudan objektife bakıyor."
              caption="Bir domuz kuyruklu makak (Macaca nemestrina) — Parma deneylerinde kullanılan tür. Bu kare 2022'de doğada çekildi; deneydeki hayvan değil."
              credit="Thompson Hyggen · CC0"
            />
            <ArticleImage narrow
              className="ayn-img"
              src="/articles/ayna-noronlari/f5-premotor-korteks.webp"
              ratio="1200 / 1108"
              alt="Bilimsel şema: makak beyninin düzleştirilmiş bir haritası, bölgeler çizgilerle ayrılmış ve her birine kısaltmalarla isim verilmiş."
              caption="Makak premotor korteksinin düzleştirilmiş haritası. Makalede F5 dediğimiz bölge burada PMv-r olarak etiketli — yani ventral premotor korteksin ön kısmı; iki adlandırma da aynı yeri gösterir."
              credit="Boussaoud ve ark., BMC Neuroscience 2005 · CC BY 2.0"
            />
            <ArticleImage narrow
              className="ayn-img"
              src="/articles/ayna-noronlari/rizzolatti-portre.webp"
              ratio="1600 / 2400"
              alt="Beyaz saçlı, gözlüklü yaşlı bir adam bir sunum sırasında mikrofona doğru konuşuyor."
              caption="Giacomo Rizzolatti, keşfi yöneten ekibin başındaki isim."
              credit="Festival della Scienza / Cirone-Musi · CC BY-SA 2.0"
            />
            <ArticleImage narrow
              className="ayn-img"
              src="/articles/ayna-noronlari/ramachandran-portre.webp"
              ratio="1600 / 2284"
              alt="Sakallı, koyu takım elbiseli bir adam bir etkinlikte fotoğraf için poz veriyor."
              caption="V. S. Ramachandran. Ayna nöronlarının “medeniyeti şekillendirdiğini” ilan eden ve tartışmayı asıl büyüten isim."
              credit="David Shankbone · CC BY 3.0"
            />
            <ArticleImage narrow
              className="ayn-img"
              src="/articles/ayna-noronlari/heyes-portre.webp"
              ratio="1600 / 2134"
              alt="Kısa saçlı bir kadının stüdyo portresi; doğrudan objektife bakıyor."
              caption="Cecilia Heyes. Ayna nöronlarının doğuştan gelmediğini, sıradan çağrışımsal öğrenmeyle kazanılmış olabileceğini savunan itirazın arkasındaki isim."
              credit="Robert Taylor · CC BY-SA 4.0"
            />
            <ArticleImage narrow
              className="ayn-img"
              src="/articles/ayna-noronlari/esneyen-kadin.webp"
              ratio="1600 / 1067"
              alt="Bir kişi gözleri kapalı, ağzını kocaman açmış esniyor."
              caption="Bulaşıcı esneme: birinin esnediğini görmek çoğu insanda esneme dürtüsü başlatır. Aynalamanın laboratuvar gerektirmeyen, gündelik hâli."
              credit="Wheeler Cowperthwaite · CC BY 2.0"
            />
          </div>
        </section>

        <ArticleBibliography items={refs} accent="#43e8c9" />
      </div>
      <ArticleRuntime js={JS} cdns={CDNS} />
    </>
  );
}
