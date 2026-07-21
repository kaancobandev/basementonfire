'use client';

import { useState } from 'react';
import Link from 'next/link';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import ArticleImage from '@/app/components/article/ArticleImage';

const refs: BibItem[] = [
  { title: 'Carthage Must Be Destroyed', authors: 'Richard Miles', year: '2010', source: 'Allen Lane' },
  { title: 'Tarihler (Pön Savaşları)', authors: 'Polybios', year: 'MÖ ~150', source: 'Antik kaynak' },
  { title: 'Carthage (ancient city)', source: 'Encyclopædia Britannica', url: 'https://www.britannica.com/place/Carthage-ancient-city-Tunisia' },
  { title: 'Ancient Carthage', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Ancient_Carthage' },
];

const chapters = [
  {
    icon: '⚓',
    cardTitle: 'Liman Efsanesi',
    cardQuestion: 'Doğal bir koy mu?',
    backTitle: 'Mühendislik Harikası',
    backText: 'Hayır! Anakaranın kalbi oyularak yapılan, 220 gemilik gizli bir yapay liman kompleksi.',
    h2: 'İnsan Yapımı Bir Harika',
    paragraphs: [
      'Kartaca\'nın Akdeniz\'deki deniz hakimiyetinin temelinde yatan limanlarının belki de en şaşırtıcı özelliği, doğal bir coğrafi oluşum olmamalarıdır. Kartacalılar anakaranın kalbini oyarak, yüz binlerce metreküp toprak çıkararak tarihin en etkileyici yapay liman komplekslerinden birini inşa ettiler.',
      '<strong>Ticari Liman:</strong> Dikdörtgen ilk liman, Akdeniz\'in dört bir yanından gelen tüccar gemilerine hizmet veriyordu. Burası imparatorluğun ekonomik kalbiydi.',
      '<strong>Askeri Liman:</strong> Ticari limanın hemen arkasında, düşman gözlerinden gizli, dairesel askeri liman bulunuyordu. Ortasında, admiralın gözetleme kulesi ve tersane mevcuttu.',
    ],
    quote: '"Bu liman, 220 savaş gemisini aynı anda barındırabilecek kapasitedeydi. Ortasında, gemilerin bakım ve onarım için kızaklarla çekildiği bir ada bulunuyordu."',
  },
  {
    icon: '⚔️',
    cardTitle: 'Savaşın Nedeni',
    cardQuestion: 'Büyük bir plan mı?',
    backTitle: 'Tesadüfler Zinciri',
    backText: 'Büyük imparatorluk hedefleri değil, Sicilya\'daki yerel bir kriz ve karşılıklı blöfler savaşı başlattı.',
    h2: 'Kazayla Başlayan Yüzyıllık Savaş',
    paragraphs: [
      'Tarihin en büyük rekabetlerinden biri olan <a href="/articles/rome" class="article-ilink">Roma-Kartaca savaşları</a>nın büyük imparatorluk hedeflerinin sonucu olarak başladığı düşünülür. Ancak gerçek çok daha farklıdır. Akdeniz\'in kaderini değiştirecek Birinci Pön Savaşı, Sicilya\'daki yerel bir krizin kontrolden çıkmasıyla neredeyse kazara patlak verdi.',
      '"Mamertinler" adıyla bilinen bir grup paralı askerin Messana\'yı ele geçirmesiyle başlayan süreç, önce Kartaca\'dan, sonra Roma\'dan yardım istenmesiyle devam etti. Her iki güç de diğerinin geri çekileceğini sandı.',
      'Roma\'nın Sicilya\'ya adım atması bir ilk değildi; henüz on yıl önce Roma ordularını dize getirmenin ne kadar pahalı olabileceğini <a href="/articles/pirus" class="article-ilink">Roma\'ya karşı savaşan komutan Kral Pirus</a> acı bir zaferle göstermişti.',
    ],
    quote: '"Kimse, bu yerel krizin fitilini ateşlediği barut fıçısının tüm Akdeniz\'i havaya uçuracağını öngöremedi."',
  },
  {
    icon: '🐘',
    cardTitle: 'Hannibal\'in Filleri',
    cardQuestion: 'Askeri bir zafer mi?',
    backTitle: 'Lojistik Fiyasko',
    backText: '37 filin neredeyse tamamı ilk kışta donarak öldü. Sadece psikolojik bir şok silahıydı.',
    h2: 'Lojistik Bir Kabus',
    paragraphs: [
      'Hannibal\'in Alpleri fillerle geçişi, askeri tarihin en ikonik sahnelerinden biridir. Filler; onlarla hiç karşılaşmamış Roma atlarını ve askerlerini korkutmak için tasarlanmış bir şok silahıydı.',
      'Bu strateji başlangıçta işe yaradı. Trebia Muharebesi\'nde filler Roma süvari kanatlarını darmadağın etti. Ancak bu neredeyse tek başarılarıydı.',
      'İspanya\'dan yola çıkan 37 filin neredeyse tamamı Kuzey İtalya\'nın ilk zorlu kışına dayanamayarak öldü. Geriye Hannibal\'ın binek fili "Surus" kalmıştı.',
    ],
    quote: null,
  },
  {
    icon: '🏺',
    cardTitle: 'Çocuk Kurbanı',
    cardQuestion: 'Roma Propagandası mı?',
    backTitle: 'Acı Gerçek',
    backText: 'Arkeolojik kazılar "Tophet" alanlarında binlerce yanmış bebek kemiği buldu. Bu bir ritüeldi.',
    h2: 'Karanlık Ritüeller ve Tophet',
    paragraphs: [
      'Kartacalıların tanrılarına kendi çocuklarını kurban ettiklerine dair iddialar uzun yıllar Roma propagandası olarak görüldü. Ancak modern arkeoloji bu söylentilerin acı bir gerçeğe dayandığını ortaya çıkardı.',
      'Antik Kartaca\'da "Tophet" adlı kutsal alanda yapılan kazılarda içinde yanmış kemik kalıntıları bulunan binlerce küçük küp bulundu. Analizler bu küplerin çoğunda yeni doğmuş bebeklere ait yanmış kemikler olduğunu gösterdi.',
    ],
    quote: '"Kent büyük bir tehlikeyle karşılaştığında, Kartacalı soylular... en soylu ailelerden 200 çocuğu alenen kurban ettiler." — Diodorus Siculus',
  },
  {
    icon: '🏛️',
    cardTitle: 'Kartaca\'nın Sonu',
    cardQuestion: 'Askeri Tehdit mi?',
    backTitle: 'Ekonomik Kıskançlık',
    backText: 'Savaş sonrası ticari başarıları Roma\'yı korkuttu. Cato\'nun "Kartaca Yıkılmalı" ısrarı bu yüzdendi.',
    h2: 'Barıştaki Başarıları Yüzünden Yok Edildiler',
    paragraphs: [
      'İkinci Pön Savaşı\'nın sonunda Kartaca askeri olarak çökmüştü. Ancak Kartacalılar en iyi bildikleri şeye, ticarete geri döndüler. Birkaç on yıl içinde tarım ve deniz ticareti sayesinde inanılmaz hızda toparlandılar.',
      'Bu barışçıl diriliş onları yeniden Roma\'nın hedefi yaptı. Roma senatörü Cato her konuşmasını şu cümleyle bitirdi: "Carthago delenda est!" ("Kartaca yıkılmalıdır!").',
      'Üçüncü Pön Savaşı\'nı tetikleyen şey askeri bir tehdit değil, Roma\'nın ekonomik rekabetten duyduğu korku ve kıskançlıktı.',
      'Hikâyenin en tuhaf sonu ise yüz yıl sonra geldi: Kartaca\'yı küle çeviren Roma, aynı yere yeni bir şehir kurmaya karar verdi. Bunu emreden kişi, gazilerini yerleştirecek toprak arayan <a href="/articles/sezar" class="article-ilink">Julius Caesar</a>\'dı; kolonisi onun ölümünden sonra, Augustus döneminde tamamlandı ve Kartaca Roma Afrikası\'nın en zengin şehri olarak yeniden doğdu.',
    ],
    quote: null,
  },
];

// Bölüm görselleri — chapters ile index hizalı. Wikimedia Commons'tan lisans
// doğrulanmış (scripts/source-images.mjs); atıf + "temsilî" künyeleri manifest'te.
const chapterImages = [
  [ // ⚓ Liman
    {
      src: '/articles/carthage/ports-punik.webp', ratio: '1600 / 1063',
      alt: 'Havadan görünüm: iç içe geçmiş, yarım daire biçiminde iki su havuzu; çevresi modern evlerle sarılı, dairesel havuzun ortasında küçük bir ada.',
      caption: 'Kartaca limanlarının bugünkü hâli (Salammbô, Tunus). O dairesel havuz doğal değil — anakara oyularak açıldı; ortasındaki adada tersane ve amiralin kulesi vardı, 220 savaş gemisi gizlenebiliyordu.',
      credit: 'Citizen59 · CC BY 3.0',
    },
  ],
  [ // ⚔️ Savaşın nedeni
    {
      src: '/articles/carthage/deniz-mahmuzu.webp', ratio: '1600 / 1200',
      alt: 'Cam vitrinde, yeşil patina kaplı tunç bir gemi mahmuzu; öne doğru sivrilen üç yatay bıçak, yan yüzeyinde kabartma bir yazıt.',
      caption: 'Egad Adaları açıklarında 80 metre derinden çıkarılan bir savaş gemisi mahmuzu (MÖ 241, I. Pön Savaşı\'nın son çarpışması). Üzerindeki Punik yazıt Baal\'e adanmış. Replika değil; savaşın kendisinden kalma.',
      credit: 'Sb2s3 · CC BY-SA 4.0',
    },
  ],
  [ // 🐘 Filler
    {
      src: '/articles/carthage/hannibal-fil-alpler.webp', ratio: '1600 / 1187',
      alt: 'Barok tablo: karlı bir dağ geçidinde sırtında ahşap kule taşıyan bir fil, çevresinde zırhlı askerler ve atlılar; koyu bulutlu gökyüzü.',
      caption: 'Hannibal\'ın Alpler\'i fillerle aşışı — Nicolas Poussin\'e atfedilen ~1625 tablosu. Temsilî: olaydan yaklaşık 1.800 yıl sonra hayal edildi. Gerçek çok daha acı — 37 filin neredeyse tamamı ilk kışta dondu.',
      credit: 'Poussin\'e atfedilen · kamu malı',
    },
  ],
  [ // 🏺 Tophet
    {
      src: '/articles/carthage/tophet-alani.webp', ratio: '1600 / 969',
      alt: 'Açık hava kazı alanı: toprağa dik saplanmış yüzlerce küçük taş stel ve dikili taş, sıra sıra dizili.',
      caption: 'Kartaca Tophet\'i: binlerce adak küpü ve stelin bulunduğu kutsal alan. Küplerin çoğundan yeni doğmuş bebeklere ait yanmış kemikler çıktı — uzun süre Roma iftirası sanılan şey.',
      credit: 'IssamBarhoumi · CC BY-SA 4.0',
    },
    {
      src: '/articles/carthage/tanit-steli.webp', ratio: '1600 / 2400',
      alt: 'Dikey taş stel: en üstte hilal ve disk, ortada kollarını yana açmış üçgen gövdeli soyut bir figür, en altta palmiye kabartması.',
      caption: 'Tanrıça Tanit\'in işaretini taşıyan adak steli (MÖ 3. yy, Kartaca Tophet\'inden; bugün Lyon Güzel Sanatlar Müzesi). Üçgen gövde, açık kollar ve yuvarlak baş — Kartaca\'nın en yaygın kutsal simgesi.',
      credit: 'Rama · CC BY-SA 2.0 fr',
    },
  ],
  [ // 🏛️ Kartaca'nın sonu ve yeniden doğuşu
    {
      src: '/articles/carthage/byrsa-tepesi.webp', ratio: '1600 / 1200',
      alt: 'Tepe yamacında düzenli taş temellerden oluşan kalıntılar; aralarında patikalar, geride serviler ve modern binalar.',
      caption: 'Byrsa tepesindeki Punik mahallenin kalıntıları — MÖ 146\'daki kuşatmada son direniş noktası. Roma şehri yerle bir etti; yanan mahalle bu temellerin altında korundu.',
      credit: 'BishkekRocks · kamu malı',
    },
    {
      src: '/articles/carthage/antonine-hamamlari.webp', ratio: '1600 / 1066',
      alt: 'Deniz kıyısında geniş harabe: ayakta kalmış tek bir yüksek granit sütun ve yayılan taş temeller; arkada mavi Akdeniz.',
      caption: 'Antonine Hamamları — Kartaca\'nın ikinci hayatından. Caesar\'ın planlayıp Augustus\'un tamamladığı Roma kolonisi, şehri Afrika\'nın en zengin kentlerinden biri yaptı.',
      credit: 'Silar · CC BY-SA 4.0',
    },
  ],
];

const chronology = [
  { date: 'MÖ 814', title: 'Kartaca\'nın Kuruluşu', desc: 'Fenikeli yerleşimciler tarafından Kuzey Afrika\'da kuruldu' },
  { date: 'MÖ 264–241', title: 'I. Pön Savaşı', desc: 'Sicilya üzerinde Roma ile ilk büyük çatışma (23 yıl)' },
  { date: 'MÖ 218–201', title: 'II. Pön Savaşı', desc: 'Hannibal\'ın Alp geçişi ve İtalya seferi' },
  { date: 'MÖ 149–146', title: 'III. Pön Savaşı', desc: 'Roma\'nın 3 yıllık kuşatması ve Kartaca\'nın yıkılması' },
];

export default function CarthagePage() {
  const [flipped, setFlipped] = useState<number | null>(null);

  return (
    <main className="main-content ca-page">

      {/* Sticky topbar */}
      <div className="ca-topbar">
        <Link href="/" className="ca-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <span className="ca-topbar-title">Kartaca</span>
        <span className="ca-topbar-badge">Tarih Makalesi</span>
      </div>

      {/* Hero */}
      <header className="ca-hero">
        <h1 className="ca-hero-title">KARTACA</h1>
        <p className="ca-hero-quote">
          "Tarihin en büyük trajedilerinden biri, savaş alanındaki yenilgisiyle değil,<br />
          barış zamanındaki ekonomik başarısıyla kendi ölüm fermanını imzalamasıydı."
        </p>
      </header>

      {/* Ana konteyner */}
      <div
        className="ca-container"
        style={{
          // ArticleImage varsayılanları koyu-tema; carthage AÇIK (#fdfbf6) →
          // altyazı/atıf/kenar koyu-metin ve altın tonlara bağlanır.
          '--ai-caption': '#4a4038',
          '--ai-credit': '#8a7f6f',
          '--ai-border': 'rgba(26,38,52,0.15)',
          '--ai-fill': 'rgba(197,160,89,0.08)',
        } as React.CSSProperties}
      >

        {/* Giriş paragrafı */}
        <article className="ca-intro">
          <p className="ca-intro-p">
            Kartaca denince akla hemen Hannibal, Alpleri aşan efsanevi filleri ve Roma'ya diz çöktüren o cüretkâr sefer gelir. Ancak bu destansı hikayelerin gölgesinde çok daha karmaşık, şaşırtıcı ve çoğu zaman yanlış anlaşılmış bir gerçeklik yatar. Kartaca, sadece askeri bir güç değil; mühendislik dehası, politik entrikalar, rahatsız edici dini ritüeller ve trajik sonuyla tarihe damgasını vurmuş bir medeniyetti.
          </p>
        </article>

        {/* Bölümler */}
        {chapters.map((ch, i) => (
          <section key={i} className="ca-chapter">

            {/* Sol: Flip kart */}
            <div className="ca-card-wrapper">
              <div
                className={`ca-flip-card${flipped === i ? ' flipped' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={flipped === i}
                aria-label={`${ch.cardTitle} — kartı çevir, gerçeği gör`}
                onClick={() => setFlipped(flipped === i ? null : i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setFlipped(flipped === i ? null : i);
                  }
                }}
              >
                <div className="ca-flip-inner">
                  <div className="ca-flip-front">
                    <div className="ca-card-icon">{ch.icon}</div>
                    <div className="ca-card-title">{ch.cardTitle}</div>
                    <p className="ca-card-q">{ch.cardQuestion}</p>
                    <div className="ca-card-hint">Gerçeği Gör ↻</div>
                  </div>
                  <div className="ca-flip-back">
                    <h3 className="ca-back-title">{ch.backTitle}</h3>
                    <p className="ca-back-text">{ch.backText}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ: Makale içeriği */}
            <div className="ca-content">
              <h2 className="ca-chapter-h2">{ch.h2}</h2>
              {ch.paragraphs.map((p, j) => (
                <p key={j} className="ca-para" dangerouslySetInnerHTML={{ __html: p }} />
              ))}
              {ch.quote && (
                <blockquote className="ca-highlight">{ch.quote}</blockquote>
              )}
              {chapterImages[i]?.map((img, k) => (
                <ArticleImage key={img.src} priority={i === 0 && k === 0} {...img} />
              ))}
            </div>
          </section>
        ))}

        {/* Kronoloji */}
        <div className="ca-timeline">
          <h2 className="ca-tl-title">Kronoloji</h2>
          {chronology.map((t, i) => (
            <div key={i} className="ca-tl-item">
              <div className="ca-tl-date">{t.date}</div>
              <div>
                <div className="ca-tl-event">{t.title}</div>
                <div className="ca-tl-desc">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Footer */}
      <ArticleBibliography items={refs} accent="#c5a059" />

      <footer className="ca-footer">
        <p>Hazırlayan: <strong>Kaan Çoban</strong></p>
        <p className="ca-footer-copy">&copy; 2025 Basementonfire — Savaş ve Uygarlıklar</p>
      </footer>

      <style>{`
        .ca-page {
          background: #fdfbf6;
          color: #1a2634;
          min-height: 100vh;
          font-family: 'Georgia', serif;
        }

        /* Topbar */
        .ca-topbar {
          position: sticky; top: 0; z-index: 40;
          background: rgba(253,251,246,0.96);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid #d4b896;
          padding: 11px 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .ca-back {
          color: #1a2634; text-decoration: none;
          display: flex; align-items: center; padding: 6px; border-radius: 50%;
          transition: background 0.15s; flex-shrink: 0;
        }
        .ca-back:hover { background: rgba(0,0,0,0.06); }
        .ca-topbar-title { font-weight: 700; font-size: 0.95rem; color: #1a2634; }
        .ca-topbar-badge { font-size: 0.72rem; color: #999; margin-left: 4px; }

        /* Hero */
        .ca-hero {
          min-height: 55vh;
          background:
            linear-gradient(rgba(26,38,52,0.45), rgba(26,38,52,0.88)),
            url('https://images.unsplash.com/photo-1551468134-297c1d355829?q=80&w=1920&auto=format&fit=crop')
            center / cover no-repeat;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 4rem 2rem 3rem;
          color: #fff;
        }
        .ca-hero-title {
          font-family: 'Georgia', serif;
          font-size: clamp(2.5rem, 8vw, 5rem);
          font-weight: 900;
          line-height: 1;
          margin: 0 0 1.2rem;
          text-shadow: 2px 2px 12px rgba(0,0,0,0.6);
          border-left: 5px solid #c5a059;
          padding-left: 1.5rem;
          letter-spacing: 0.06em;
        }
        .ca-hero-quote {
          font-size: clamp(0.88rem, 2.2vw, 1.2rem);
          font-style: italic;
          max-width: 700px;
          margin: 0 0 0 calc(1.5rem + 5px);
          opacity: 0.88;
          color: #e8d5b0;
          line-height: 1.65;
        }

        /* Container */
        .ca-container { max-width: 1100px; margin: 0 auto; padding: 3rem 1.5rem 2rem; }

        /* Intro */
        .ca-intro { margin-bottom: 4rem; border-bottom: 1px solid #ddd; padding-bottom: 2.5rem; }
        .ca-intro-p {
          font-size: 1.05rem; color: #444; line-height: 1.85;
          text-align: justify;
        }
        .ca-intro-p::first-letter {
          font-family: 'Georgia', serif;
          font-size: 3.5rem;
          float: left;
          margin-right: 0.7rem;
          line-height: 0.78;
          color: #c5a059;
        }

        /* Chapter */
        .ca-chapter {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 3rem;
          margin-bottom: 6rem;
          align-items: start;
        }

        /* Flip card */
        .ca-card-wrapper { position: sticky; top: 60px; }
        .ca-flip-card {
          width: 100%; aspect-ratio: 3/4; perspective: 1000px; cursor: pointer;
          max-height: 360px;
        }
        .ca-flip-inner {
          position: relative; width: 100%; height: 100%;
          transition: transform 0.75s; transform-style: preserve-3d;
          box-shadow: 0 12px 32px rgba(0,0,0,0.18); border-radius: 12px;
        }
        .ca-flip-card:hover .ca-flip-inner,
        .ca-flip-card.flipped .ca-flip-inner { transform: rotateY(180deg); }
        .ca-flip-front, .ca-flip-back {
          position: absolute; inset: 0;
          backface-visibility: hidden; -webkit-backface-visibility: hidden;
          border-radius: 12px;
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          padding: 1.5rem; text-align: center;
        }
        .ca-flip-front { background: #2c3e50; color: #c5a059; border: 2px solid #c5a059; }
        .ca-flip-back  { background: #c5a059; color: #1a2634; transform: rotateY(180deg); }
        .ca-card-icon  { font-size: 2.5rem; margin-bottom: 0.8rem; }
        .ca-card-title { font-size: 1.1rem; font-weight: 700; letter-spacing: 1px; margin-bottom: 0.6rem; }
        .ca-card-q     { font-size: 0.85rem; opacity: 0.8; margin: 0 0 0.8rem; }
        .ca-card-hint  { font-size: 0.72rem; color: rgba(255,255,255,0.65); margin-top: 0.5rem; }
        .ca-back-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.8rem; }
        .ca-back-text  { font-size: 0.88rem; line-height: 1.6; }

        /* Content */
        .ca-chapter-h2 {
          font-size: clamp(1.3rem,3vw,1.9rem); color: #1a2634; margin-bottom: 1.2rem;
          padding-bottom: 0.5rem;
          border-bottom: 3px solid #c5a059;
        }
        .ca-para { color: #333; line-height: 1.82; margin-bottom: 1.2rem; font-size: 0.96rem; }
        .ca-highlight {
          background: #f5efe2; border-left: 4px solid #2c3e50;
          padding: 1.1rem 1.4rem; margin: 1.5rem 0;
          font-style: italic; color: #555; font-size: 0.94rem; line-height: 1.65;
          border-radius: 0 8px 8px 0;
        }

        /* Timeline */
        .ca-timeline { border-top: 2px solid #d4b896; padding-top: 2.5rem; margin-top: 1rem; }
        .ca-tl-title { font-size: 1.6rem; color: #1a2634; margin-bottom: 28px; border-bottom: 2px solid #c5a059; padding-bottom: 10px; }
        .ca-tl-item { display: flex; gap: 16px; margin-bottom: 20px; align-items: flex-start; }
        .ca-tl-date { background: #1a2634; color: #c5a059; padding: 5px 12px; border-radius: 20px; font-size: 0.76rem; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
        .ca-tl-event { font-weight: 700; color: #1a2634; margin-bottom: 3px; font-size: 0.9rem; }
        .ca-tl-desc  { font-size: 0.82rem; color: #777; }

        /* Footer */
        .ca-footer { background: #1a2634; color: #8a9db5; text-align: center; padding: 36px 24px; font-size: 0.82rem; }
        .ca-footer-copy { font-size: 0.74rem; margin-top: 6px; opacity: 0.6; }

        /* Responsive */
        @media (max-width: 768px) {
          .ca-chapter {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            margin-bottom: 4rem;
          }
          .ca-card-wrapper { position: relative; top: auto; }
          .ca-flip-card { max-height: 240px; aspect-ratio: unset; height: 240px; }
          .ca-hero { padding: 3rem 1.2rem 2rem; min-height: 40vh; }
          .ca-hero-title { padding-left: 1rem; font-size: clamp(2rem,8vw,3rem); }
          .ca-hero-quote { margin-left: calc(1rem + 5px); font-size: 0.88rem; }
          .ca-intro-p { font-size: 0.95rem; }
          .ca-container { padding: 2rem 1rem; }
        }

        @media (max-width: 480px) {
          .ca-topbar-badge { display: none; }
          .ca-flip-card { height: 200px; }
          .ca-tl-item { flex-direction: column; gap: 6px; }
        }
      `}</style>
    </main>
  );
}
