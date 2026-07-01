'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';

/* ════════════════════════ VERİ ════════════════════════ */

const distinctions = [
  ['✒️', 'Kaligrafi', `Belirli bir aracı (geniş uçlu kalem, fırça, esnek uç) tutarlı kurallarla kullanarak harfleri tek seferde, akıcı bir hareketle yazma sanatı. Yazı, hareketin doğrudan izidir.`],
  ['✏️', 'Hand lettering', `Harfleri tek hamlede yazmak yerine çizmek: taslak yapıp doldurmak, rötuşlamak. İllüstrasyona daha yakındır.`],
  ['🔠', 'Tipografi', `Önceden tasarlanmış harf kalıplarını (font) düzenleme sanatı. Matbaa harfleriyle ilgilidir; kaligrafiden doğmuş ama farklı bir daldır.`],
];

const islamTimeline = [
  ['7. yy', 'Kûfî ve Kur\'an', 'Hat sanatının kökeni Kur\'an-ı Kerim\'in yazıya geçirilmesine dayanır. Erken dönemde köşeli, sert, anıtsal kûfî egemendi. Geleneğe göre Hz. Ali, erken hattın önemli isimlerinden.'],
  ['886–940', 'İbn Mukle: ölçünün doğuşu', 'Abbâsî veziri ve hattatı İbn Mukle, yazıyı "göz kararı"ndan çıkarıp orana oturttu: her harf, kalemin ürettiği baklava biçimli noktaya ve hayalî bir daireye göre ölçülür. Bu "nispetli yazı" tüm İslam hattının temelini attı.'],
  ['ö. 1022', 'İbn Bevvâb', 'Ali bin Hilâl, yazıyı inceltip zarifleştirdi.'],
  ['ö. 1298', 'Yâkût el-Musta\'sımî', '"Hattatların kıblesi" Yâkût, aklâm-ı sitte (altı temel kalem) sistemini olgunlaştırdı; kalemin ucunu eğik kesme tekniğiyle yeni bir incelik kattı.'],
  ['1436–1520', 'Şeyh Hamdullah', 'Osmanlı hat ekolünün kurucusu, "Kıbletü\'l-küttâb". Aklâm-ı sitte\'yi Osmanlı zevkine uyarladı; "Şeyh vadisi" üslubunu kurdu. Sultan II. Bayezid\'in hocasıydı.'],
  ['1468–1556', 'Ahmed Karahisârî', 'Daha anıtsal bir tarz geliştirdi; Süleymaniye Camii\'ndeki büyük yazılarıyla tanınır.'],
  ['1642–1698', 'Hâfız Osman', 'Şeyh çizgisini olgunlaştırdı; eserleri bugün dahi mükemmellik ölçüsü. Standartlaştırdığı hilye düzeni asırlarca taklit edildi.'],
  ['1758–1826', 'Mustafa Râkım', 'Celî sülüs ve tuğra estetiğinde devrim yaptı; tuğrayı bir şaheserine dönüştürdü. II. Mahmud onun ekolünden yetişti.'],
  ['1838–1912', 'Sâmi Efendi ve geç dönem', 'Sâmi Efendi, Mehmed Şevki, Yesârîzâde Mustafa İzzet: celî, talik ve nesih ustaları geleneği zirvede tuttu.'],
];

const islamForms = [
  ['🖼️', 'Levha', 'Çerçevelenip duvara asılan tek parça yazı eseri.'],
  ['📜', 'Hilye-i Şerif', 'Hz. Muhammed\'in fiziksel ve ahlaki özelliklerini belirli bir düzende anlatan, çoğu zaman tezhiple bezenmiş levha.'],
  ['📖', 'Murakka', 'Hattatların meşk parçalarının mukavva üzerine yapıştırılıp akordeon gibi katlanan albümü.'],
  ['👑', 'Tuğra', 'Padişahın sembolik imzası; başlı başına bir kompozisyon sanatı.'],
  ['🌀', 'İstif', 'Harf ve kelimeleri iç içe, üst üste yerleştirerek görsel bir bütün oluşturma — İslam hattının en yaratıcı yönlerinden.'],
];

const chineseStyles = [
  ['篆', 'Mühür yazısı', 'zhuànshū — En eski stil; resme yakın, simetrik, köşesiz, eğrisel. Adını mühür ve kaşelerde kullanılmasından alır. Bugün bile okunması zordur.'],
  ['隸', 'Kâtip / resmî yazı', 'lìshū — Han Hanedanı\'nda yaygınlaştı; daha düz, yatay vurgulu, okunaklı. Mühür yazısından moderne köprü.'],
  ['楷', 'Standart / düz yazı', 'kǎishū — Kare, dik, net yapı. Tang\'da olgunlaştı; bugün matbaa ve dijital yazının temeli. Başlangıç için en uygun stil.'],
  ['行', 'Yürüyen yazı', 'xíngshū — Günlük el yazısına yakın; fırça kâğıttan az kalkar, harfler yumuşar ve birbirine akar.'],
  ['草', 'Bitişik / "çayır" yazı', 'cǎoshū — Hızlı, akışkan, neredeyse soyut. En özgür ve ifade gücü yüksek stil; okunması en zor olanı.'],
];

const westTimeline = [
  ['MS 113', 'Roma kapital harfleri', 'Trajan Sütunu\'ndaki anıtsal büyük harfler, Batı yazısının ve bugünkü büyük harflerimizin atasıdır.'],
  ['4.–5. yy', 'Uncial & half-uncial', 'Roma kitap yazılarından gelişen yuvarlak hatlı, az hamleli stiller; Hristiyan elyazmalarının ana yazısı. Küçük harflerin ilk tohumları burada.'],
  ['7.–9. yy', 'Insular (Ada yazısı)', 'İrlanda ve Britanya\'nın görkemli tezhipli yazısı. Başyapıtları: Kells Kitabı ve Durrow Kitabı.'],
  ['~800', 'Karolenj minüskülü', 'Büyük Karl\'ın eğitim reformunda Alcuin ve ekibi geliştirdi. Net, okunaklı, ayrık küçük harfler; modern kitap harflerinin doğrudan atası. Johnston bunu sonra "Foundational Hand" olarak canlandırdı.'],
  ['12.–15. yy', 'Gotik / blackletter', 'Parşömen pahalı olduğundan sıkışık, dikey, köşeli yazı; sayfaya çok metin sığdırır. Textura, Fraktur, Rotunda. Gutenberg ilk matbu İncil\'ini (~1455) gotikle bastı.'],
  ['1522', 'Rönesans & italik', 'Hümanistler gotiği "karanlık çağ" yazısı sayıp klasik Roma/Karolenj modeline döndü; eğik, hızlı italik / chancery doğdu. Arrighi ilk pratik el kitabını (La Operina) yayımladı.'],
  ['17.–19. yy', 'Copperplate & Spencerian', 'Esnek sivri uçla baskı değiştirilerek yazılan ince-kalın, süslü stiller. Spencer\'ın oval temelli Spencerian yazısı, daktiloya dek Amerika\'nın standart el yazısıydı.'],
  ['1906', 'Johnston: modern diriliş', 'Modern kaligrafinin babası Edward Johnston, British Museum elyazmalarını inceleyip teknikleri yeniden kurdu. Writing & Illuminating, & Lettering bir kuşağı etkiledi; 1916 London Underground yazı tipi hâlâ kullanılıyor.'],
];

const islamScripts = [
  ['Kûfî', 'Köşeli, anıtsal; erken Kur\'anlar ve mimari süsleme. "Celî kûfî" geometrik çizimle yapılır.'],
  ['Sülüs', 'Görkemli, iri, "yazıların anası"; levha ve kitabelerin yazısı. Hat eğitimi genelde bununla başlar.'],
  ['Nesih', 'Okunaklı, küçük, akıcı; Kur\'an ve kitapların metin yazısı.'],
  ['Muhakkak / Reyhânî', 'Aklâm-ı sitte\'nin diğer iki kalemi; muhakkak iri ve görkemli, reyhânî onun ince hali.'],
  ['Tevkî', 'Resmî üst yazışmaların yuvarlak hatlı yazısı.'],
  ['Talik (nesta\'lik)', 'İran kökenli; asılı, akışkan; şiir ve edebî levhalar.'],
  ['Divânî / Celî Divânî', 'Osmanlı sarayının resmî yazısı; ferman ve beratlarda, çok süslü.'],
  ['Rik\'a', 'En hızlı, en sade günlük yazı; herkesin kullandığı pratik el yazısı.'],
  ['Siyâkat', 'Maliye kayıtlarının okunması güç, şifre benzeri yazısı.'],
];

const tips = [
  ['🛒', 'Araç seçiminde tuzaklar', '"Calligraphy pen" yazan her kalemi alma — modern script için esnek bir uç ya da fırça kalem gerekir; hazır "starter kit"lerin çoğu başlangıç dostu değildir. Az ama doğru malzemeyle başla; pahalı set gerekmez.'],
  ['🔤', 'Önce temeller', 'Harfe değil, önce 8 temel harekete çalış — bunu atlamak en yaygın hatadır. Mutlaka kılavuz çizgi, özellikle eğim (slant) çizgisi kullan; eğimi tutarsız harfler tek tek güzel olsa bile bütünü amatör gösterir.'],
  ['🐢', 'Yavaşla', 'İnce-kalın geçişlerin pürüzsüzlüğü, yavaş ve sabit hızla yazmaya bağlıdır; hız çizgi boyunca sabit kalmalı. Baskıyı sandığından erken ayarla — dönüşten hemen sonra değil, biraz önce.'],
  ['🪶', 'Çıkışta baskıyı bırak', 'Sivri uçta yukarı çıkışlarda baskıyı neredeyse tamamen bırak; fazla bastırmak ucu çatallar, mürekkep damlatır, kâğıdı yırtar ve yeni ucu bozabilir. Amaç gerginlik değil kontrol — kalemi sıkma.'],
  ['⬜', 'Boşlukları eşitle', 'Harf içi ve arası beyaz boşlukların (counter) dengesi yazıyı "oturmuş" gösterir. Eğimi denetlemek için iniş çizgilerinin üzerinden kurşunla hat geçir; çizgiler birbirini kesiyorsa eğim tutarsızdır.'],
  ['📅', 'Düzenli pratik & zihniyet', 'Günde 10–15 dakika, haftada bir uzun seanstan etkilidir. Sayfaları tarihlendir. Pratikten önce kahve içme (kafein el titremesini artırır). Faux kaligrafiyle başla; kendi 1. gününü bir ustanın 2.000. günüyle kıyaslama.'],
];

const roadmapSteps = [
  { t: 'Aracını seç', d: `Başlangıç için bir fırça kalem (ör. Tombow Fudenosuke) + pürüzsüz kâğıt (Rhodia ya da yüksek gramajlı lazer kâğıdı) + kılavuz çizgili pratik sayfaları.` },
  { t: 'Kalemi tanı', d: `Yukarı hafif → ince, aşağı bastır → kalın. Önce sadece bunu hisset.` },
  { t: '8 temel hareket', d: `Giriş/çıkış, üstten/alttan dönüş, bileşik eğri, oval, yukarı/aşağı ilmek. Her birini sayfalarca, akıcı ve tutarlı olana dek tekrarla.` },
  { t: 'Küçük harf alfabesi', d: `Temel hareketleri birleştirerek harfleri kur — neredeyse tüm küçük harf alfabesi o 8 hareketten doğar.` },
  { t: 'Kelime & bağlantılar', d: `Çıkış çizgileriyle harfleri birleştir; harf içi ve arası boşlukları dengele.` },
  { t: 'Kompozisyon & stil', d: `Temeller oturunca büyük harfler, süslemeler (flourishing) ve kendi tarzın gelir.` },
];
const roadmapIcons = ['🖊️', '✍️', '〰️', '🔡', '🔗', '🎨'];

const quizQs = [
  { text: '"Kaligrafi" kelimesi hangi köklerden gelir?', opts: ['Latince calidus + grafia', 'Yunanca kallos (güzellik) + graphein (yazmak)', 'Arapça hat + hüsn', 'Çince shū + fǎ'], a: 1 },
  { text: 'Kaligrafi ile tipografi arasındaki temel fark nedir?', opts: ['İkisi aynıdır', 'Tipografi önceden tasarlanmış harf kalıplarını (font) düzenler', 'Kaligrafi sadece bilgisayarda yapılır', 'Tipografi fırçayla yapılır'], a: 1 },
  { text: 'İslam hattını "göz kararı"ndan çıkarıp matematiksel orana oturtan kişi kimdir?', opts: ['Yâkût el-Musta\'sımî', 'İbn Mukle', 'Şeyh Hamdullah', 'Hâfız Osman'], a: 1 },
  { text: 'Osmanlı hat ekolünün kurucusu kabul edilen hattat kimdir?', opts: ['Ahmed Karahisârî', 'Mustafa Râkım', 'Şeyh Hamdullah', 'Sâmi Efendi'], a: 2 },
  { text: 'Doğu Asya kaligrafisinin temel aracı nedir?', opts: ['Geniş uçlu çelik kalem', 'Fırça', 'Esnek sivri uç', 'Kamış kalem'], a: 1 },
  { text: 'Çin yazısında başlangıç için en uygun, bugünkü matbaa ve dijital yazının temeli olan stil hangisidir?', opts: ['Mühür yazısı (zhuànshū)', 'Bitişik yazı (cǎoshū)', 'Standart / düz yazı (kǎishū)', 'Yürüyen yazı (xíngshū)'], a: 2 },
  { text: 'Modern (Batı) kaligrafinin babası kabul edilen, geleneği yeniden canlandıran isim kimdir?', opts: ['Ludovico Arrighi', 'Edward Johnston', 'Platt Rogers Spencer', 'Johannes Gutenberg'], a: 1 },
  { text: 'Sivri esnek uçta "altın kural" nedir?', opts: ['Hep aynı baskı', 'Yukarı çıkarken ince (baskısız), aşağı inerken kalın (baskılı)', 'Yukarı kalın, aşağı ince', 'Baskı hiç değişmez'], a: 1 },
  { text: 'Geniş uçlu (broad-edge) kalemde ince-kalın farkı neyden gelir?', opts: ['Baskıdan', 'Ucun sabit açısından', 'Mürekkebin renginden', 'Kâğıdın türünden'], a: 1 },
];

const refs: BibItem[] = [
  { title: 'Writing & Illuminating, & Lettering', authors: 'Edward Johnston', year: '1906', source: 'Batı kaligrafisinin klasik el kitabı' },
  { title: 'Medieval Calligraphy: Its History and Technique', authors: 'Marc Drogin', year: '1980', source: 'Dover' },
  { title: 'İslam Kültür Mirasında Hat Sanatı', authors: 'M. Uğur Derman', source: 'IRCICA' },
  { title: 'Türk Hat Sanatının Şaheserleri', authors: 'M. Uğur Derman', source: 'Hat sanatının en yetkin Türkçe kaynaklarından' },
  { title: 'Hat Sanatımız', authors: 'Muhittin Serin', source: 'Hat tarihi ve teknikleri' },
  { title: 'Türk Hattatları', authors: 'Şevket Rado', source: 'Hattatların hayatları ve örnekleri' },
  { title: 'Hüsn-i Hat (İnsanlığın Somut Olmayan Kültürel Mirası, 2021)', source: 'UNESCO', url: 'https://ich.unesco.org/en/RL/art-of-the-musahheb-and-the-art-of-hat-01703' },
  { title: 'Islamic calligraphy', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Islamic_calligraphy' },
  { title: 'Chinese calligraphy', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Chinese_calligraphy' },
  { title: 'Western calligraphy', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Western_calligraphy' },
];

/* ════════════════════════ STEPPER ════════════════════════ */

function Stepper({ steps, children }: { steps: { t: string; d: string }[]; children: (i: number) => ReactNode }) {
  const [i, setI] = useState(0);
  return (
    <div className="cal-stepper">
      <div className="cal-stepper-viz">{children(i)}</div>
      <div className="cal-stepper-panel">
        <div className="cal-dots">
          {steps.map((_, k) => (<button key={k} className={`cal-dot ${k === i ? 'on' : ''}`} onClick={() => setI(k)} aria-label={`Adım ${k + 1}`} />))}
        </div>
        <div className="cal-step-meta">ADIM {i + 1} / {steps.length}</div>
        <h4 className="cal-step-title">{steps[i].t}</h4>
        <p className="cal-step-desc">{steps[i].d}</p>
        <div className="cal-stepper-ctrl">
          <button className="cal-ctrl-btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>← Geri</button>
          <button className="cal-ctrl-btn cal-ctrl-primary" onClick={() => setI(Math.min(steps.length - 1, i + 1))} disabled={i === steps.length - 1}>İleri →</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════ ANA BİLEŞEN ════════════════════════ */

export default function KaligrafiClient() {
  const [tool, setTool] = useState<'genis' | 'sivri'>('genis');
  const [quizQ, setQuizQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) (e.target as HTMLElement).classList.add('visible'); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  function answerQ(sel: number) {
    if (answered[quizQ] !== undefined) return;
    if (sel === quizQs[quizQ].a) setScore((s) => s + 1);
    setAnswered((prev) => ({ ...prev, [quizQ]: sel }));
    setTimeout(() => { if (quizQ + 1 < quizQs.length) setQuizQ((q) => q + 1); else setDone(true); }, 900);
  }
  function restartQuiz() { setQuizQ(0); setScore(0); setAnswered({}); setDone(false); }

  return (
    <main className="main-content cal-page">

      <div className="cal-topbar">
        <Link href="/" className="cal-back" aria-label="Ana sayfa">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        </Link>
        <span className="cal-topbar-title">Kaligrafi</span>
      </div>

      {/* HERO */}
      <header className="cal-hero">
        <div className="cal-hero-art" aria-hidden="true">
          <svg viewBox="0 0 260 110" width="220">
            <defs><linearGradient id="calG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a87d2c" /><stop offset="1" stopColor="#2c2620" /></linearGradient></defs>
            {/* zarif ince-kalın flourish */}
            <path d="M18 70 C44 22 96 22 116 62 C131 92 168 92 184 64 C197 41 224 44 236 56 C226 50 200 50 190 70 C172 106 124 106 106 70 C90 38 48 38 34 76 C29 90 23 84 18 70 Z" fill="url(#calG)" />
            <circle cx="236" cy="56" r="4" fill="#a87d2c" />
            <circle cx="14" cy="73" r="3" fill="#2c2620" />
          </svg>
        </div>
        <div className="cal-hero-eyebrow">GÜZEL YAZININ SANATI · KAPSAMLI REHBER</div>
        <h1 className="cal-hero-title">Kaligrafi</h1>
        <p className="cal-hero-sub">
          Yazıyı bir iletişim aracı olmaktan çıkarıp; <strong>ölçü, ritim, oran ve estetiğin</strong> bir araya geldiği
          görsel bir sanata dönüştürme disiplini. Üç büyük gelenek — İslam hattı, Doğu Asya fırçası ve Batı kalemi —
          aynı arzudan doğdu: <em>harfi güzelleştirmek.</em>
        </p>
        <div className="cal-hero-tags">
          {['Hüsn-i hat', 'Aklâm-ı sitte', 'Shodō', 'İtalik', 'Copperplate', 'Başlangıç rehberi'].map((t) => (
            <span key={t} className="cal-tag">{t}</span>
          ))}
        </div>
      </header>

      {/* I. NEDİR */}
      <section className="cal-section reveal">
        <div className="cal-num">I</div>
        <h2 className="cal-h2">Kaligrafi Nedir?</h2>
        <p className="cal-lead">
          Kelime, <Link href="/articles/greece" className="article-ilink"><em>Yunanca</em></Link> <em>kallos</em> (güzellik) ve <em>graphein</em> (yazmak) köklerinden gelir: kelimenin tam
          anlamıyla "güzel yazı."
        </p>
        <p className="cal-p">
          Ancak kaligrafi yalnızca düzgün yazı yazmak değildir; yazıyı bir iletişim aracı olmaktan çıkarıp ölçü, ritim,
          oran ve estetiğin bir araya geldiği görsel bir sanata dönüştürme disiplinidir. <strong>Her harf bilinçli bir
          karar, her satır bir kompozisyondur.</strong> Yakın ama farklı üç kavramı ayırmakta fayda var:
        </p>
        <div className="cal-cards">
          {distinctions.map(([e, t, d], i) => (
            <div key={i} className="cal-card"><div className="cal-card-e">{e}</div><div><strong>{t}</strong><span>{d}</span></div></div>
          ))}
        </div>
        <div className="cal-note">
          <span>🌍</span>
          <p>Kaligrafi, dünya tarihinde birbirinden bağımsız doğmuş <strong>üç büyük gelenek</strong> üzerinden gelişti: İslam dünyasının hat sanatı, Doğu Asya'nın fırça kaligrafisi ve Batı'nın geniş uçlu kalem geleneği. Üçü de yazıyı yüceltti — ama her biri kendi araçlarını, estetiğini ve felsefesini geliştirdi.</p>
        </div>
      </section>

      {/* II. İSLAM HAT */}
      <section className="cal-section reveal">
        <div className="cal-num">II</div>
        <h2 className="cal-h2">İslam ve Osmanlı Hat Sanatı</h2>
        <p className="cal-p">
          İslam kültüründe yazı, resmin görece geri planda kaldığı bir ortamda en yüksek görsel sanat haline geldi.
          Türkçede bu sanata <strong>hat</strong> (Arapça "çizgi"), güzeline <strong>hüsn-i hat</strong>, sanatçısına ise
          <strong> hattat</strong> denir. İşte ölçünün doğuşundan <Link href="/articles/turkler" className="article-ilink">Osmanlı</Link> zirvesine uzanan yol:
        </p>
        <ol className="cal-timeline">
          {islamTimeline.map((e, i) => (
            <li key={i} className="cal-tl-item">
              <span className="cal-tl-dot" aria-hidden="true" />
              <span className="cal-tl-year">{e[0]}</span>
              <div className="cal-tl-body"><strong>{e[1]}</strong><span>{e[2]}</span></div>
            </li>
          ))}
        </ol>
        <blockquote className="cal-quote">"Kur'an Mekke'de indi, Mısır'da (Kahire'de) okundu, İstanbul'da yazıldı."</blockquote>
        <div className="cal-note">
          <span>🧑‍🏫</span>
          <p>Hat, kitaptan değil <strong>usta-çırak ilişkisiyle (meşk)</strong> öğrenildi: öğrenci hocanın örneklerini tekrar tekrar taklit eder, hoca düzeltir; yıllar sonra yeterli görülen öğrenci, eserini imzalama (ketebe) hakkı veren <strong>icazet</strong> alırdı. Bu icazet zinciri sayesinde gelenek asırlarca kopmadan aktarıldı. 2021'de hat sanatı, "Hüsn-i Hat" adıyla UNESCO mirası ilan edildi.</p>
        </div>
        <h3 className="cal-h3">Klasik formlar</h3>
        <div className="cal-cards">
          {islamForms.map(([e, t, d], i) => (
            <div key={i} className="cal-card"><div className="cal-card-e">{e}</div><div><strong>{t}</strong><span>{d}</span></div></div>
          ))}
        </div>
      </section>

      {/* III. DOĞU ASYA */}
      <section className="cal-section reveal">
        <div className="cal-num">III</div>
        <h2 className="cal-h2">Doğu Asya Kaligrafisi</h2>
        <p className="cal-p">
          Doğu Asya'da kaligrafi (<em>shūfǎ</em> Çince, <em>shodō</em> Japonca) resim, şiir ve felsefeyle iç içe, "üç
          mükemmellik"ten biri sayılan en saygın sanattır. Temel araç kalem değil <strong>fırçadır</strong>; estetiği de
          baskı ve hareketin dinamizmi üzerine kuruludur. Çin kaligrafisi 3.000 yılı aşkın bir geçmişe, Shang
          Hanedanı'nın kemik yazıtlarına (<em>oracle bone</em>) uzanır. Zamanla beş temel stil gelişti:
        </p>
        <div className="cal-styles">
          {chineseStyles.map(([g, t, d], i) => (
            <div key={i} className="cal-style"><span className="cal-glyph">{g}</span><div><strong>{t}</strong><span>{d}</span></div></div>
          ))}
        </div>
        <blockquote className="cal-quote">Sung şairi Su Shi'nin sözüyle: düz yazı <em>durmak</em>, yürüyen yazı <em>yürümek</em>, bitişik yazı <em>koşmak</em> gibidir.</blockquote>
        <p className="cal-p">
          En saygın hattat, "Kaligrafi Bilgesi" lakaplı <strong>Wang Xizhi</strong> (303–361); en ünlü eseri
          <em> Lantingji Xu</em> (Orkide Köşkü Önsözü) asırlarca taklit edildi. Tang döneminde Yan Zhenqing ve Liu
          Gongquan düz yazıyı zirveye taşıdı. Çin karakterleri (<strong>kanji</strong>) Japonya'ya 5.–6. yüzyılda
          ulaştı; Heian döneminde bunlardan türeyen <strong>hiragana</strong> ve <strong>katakana</strong> alfabeleri,
          şiire akışkan ve zarif bir Japon estetiği kazandırdı. Bu sanatın bütününe <strong>shodō</strong> ("yazı yolu")
          denir.
        </p>
        <div className="cal-note">
          <span>🍵</span>
          <p>Fırçanın hareketi, yazanın iç dünyasını yansıtır; Zen'de tek nefeste çizilen bir daire (<strong>ensō</strong>) meditasyonun kendisidir. Geleneğin vazgeçilmez dört aracı <strong>"Çalışma Odasının Dört Hazinesi"</strong> (文房四宝) olarak anılır: fırça, mürekkep çubuğu, kâğıt ve mürekkep taşı.</p>
        </div>
      </section>

      {/* IV. BATI */}
      <section className="cal-section reveal">
        <div className="cal-num">IV</div>
        <h2 className="cal-h2">Batı Kaligrafisi</h2>
        <p className="cal-p">
          Batı geleneği, <strong>geniş uçlu kalemin</strong> (önce kamış, sonra kaz tüyü, sonra metal uç) doğal olarak
          ürettiği <strong>kalın-ince çizgi karşıtlığı</strong> üzerine kuruludur. Antikiteden modern dirilişe uzanan
          yolculuk:
        </p>
        <ol className="cal-timeline">
          {westTimeline.map((e, i) => (
            <li key={i} className="cal-tl-item">
              <span className="cal-tl-dot" aria-hidden="true" />
              <span className="cal-tl-year">{e[0]}</span>
              <div className="cal-tl-body"><strong>{e[1]}</strong><span>{e[2]}</span></div>
            </li>
          ))}
        </ol>
        <p className="cal-p">
          Matbaanın yaygınlaşması kaligrafiyi geriletti; ama 19. yüzyıl sonunda William Morris ve Arts and Crafts
          hareketiyle bir uyanış başladı. Bugün Batı kaligrafisi, tarihsel yazıların hassas yeniden üretiminden, sosyal
          medyada popülerleşen <strong>modern kaligrafi ve fırça lettering</strong>'e kadar geniş bir yelpazede yaşıyor:
          düğün davetiyeleri, marka kimlikleri ve sanat galerileri başlıca uygulama alanları.
        </p>
      </section>

      {/* V. YAZI TÜRLERİ SÖZLÜĞÜ */}
      <section className="cal-section reveal">
        <div className="cal-num">V</div>
        <h2 className="cal-h2">Yazı Türleri Sözlüğü</h2>
        <p className="cal-p">İslam hattının başlıca türleri:</p>
        <div className="cal-gloss">
          {islamScripts.map(([n, d], i) => (
            <div key={i} className="cal-gloss-row"><span className="cal-gloss-name">{n}</span><span className="cal-gloss-desc">{d}</span></div>
          ))}
        </div>
        <div className="cal-note">
          <span>✱</span>
          <p><strong>"Celî"</strong> bir yazı türü değil, <em>iri/kalın yazılmış</em> anlamına gelir (örn. celî sülüs = büyük boy sülüs).</p>
        </div>
        <p className="cal-p" style={{ marginTop: 18 }}>
          <strong>Doğu Asya:</strong> Mühür (zhuanshu), Kâtip (lishu), Düz (kaishu), Yürüyen (xingshu), Bitişik (caoshu).<br />
          <strong>Batı:</strong> Roma kapital, Uncial/Half-uncial, Insular, Karolenj (Foundational), Gotik
          (Textura/Fraktur/Rotunda), İtalik/Chancery, Copperplate/Roundhand, Spencerian, Modern.
        </p>
      </section>

      {/* VI. ARAÇLAR */}
      <section className="cal-section reveal">
        <div className="cal-num">VI</div>
        <h2 className="cal-h2">Araçlar ve Malzemeler</h2>
        <p className="cal-p">
          Kaligrafide ince-kalın farkı iki temel yoldan üretilir — ve bu fark, hangi aracı kullanacağını belirler.
          Düğmeyle iki mantığı karşılaştır:
        </p>
        <div className="cal-toggle" role="tablist">
          <button role="tab" aria-selected={tool === 'genis'} className={`cal-toggle-btn ${tool === 'genis' ? 'on' : ''}`} onClick={() => setTool('genis')}>Geniş uçlu</button>
          <button role="tab" aria-selected={tool === 'sivri'} className={`cal-toggle-btn ${tool === 'sivri' ? 'on' : ''}`} onClick={() => setTool('sivri')}>Sivri esnek uç</button>
        </div>
        <div className="cal-tool">
          <div className="cal-tool-viz" aria-hidden="true">
            {tool === 'genis' ? (
              <svg viewBox="0 0 200 150" width="100%">
                <g transform="translate(40 36) rotate(-40)"><rect x="-15" y="-6" width="30" height="12" rx="2" fill="#a87d2c" /></g>
                <path d="M58 44 L150 128" stroke="#2c2620" strokeWidth="17" strokeLinecap="round" />
                <path d="M58 128 L150 44" stroke="#2c2620" strokeWidth="3" strokeLinecap="round" />
                <text x="100" y="146" textAnchor="middle" fontSize="11" fill="#8a7d6c">aynı uç · sabit açı</text>
              </svg>
            ) : (
              <svg viewBox="0 0 200 150" width="100%">
                <path d="M44 24 L38 50 M44 24 L50 50" stroke="#a87d2c" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M95 34 C100 60 102 96 98 122 C94 96 90 60 95 34 Z" fill="#2c2620" />
                <path d="M120 122 C126 92 138 60 156 36" stroke="#2c2620" strokeWidth="2.6" fill="none" strokeLinecap="round" />
                <text x="86" y="142" textAnchor="middle" fontSize="10" fill="#8a7d6c">↓ kalın (baskı)</text>
                <text x="150" y="60" textAnchor="middle" fontSize="10" fill="#8a7d6c">↑ ince</text>
              </svg>
            )}
          </div>
          {tool === 'genis' ? (
            <div className="cal-tool-body">
              <h4>Geniş uçlu — fark <em>açıdan</em> gelir</h4>
              <p>Düz, geniş bir uç sabit bir açıda tutulur; çizginin yönü değiştikçe kalınlık otomatik değişir. İtalik,
              gotik, foundational ve İslam hattı bu mantıkla çalışır.</p>
              <ul className="cal-tool-list">
                <li><strong>Kamış kalem (kalem):</strong> İslam hattının klasik aracı; ucu özel açıyla kesilip yarılır.</li>
                <li><strong>Geniş uçlu çelik / Pilot Parallel:</strong> Modern broad-edge araçları.</li>
                <li><strong>Düz uçlu fırça / keçeli kalem:</strong> Daha rahat başlangıç seçenekleri.</li>
              </ul>
            </div>
          ) : (
            <div className="cal-tool-body">
              <h4>Sivri esnek uç — fark <em>baskıdan</em> gelir</h4>
              <p>Sivri, esnek bir uç bastırıldıkça çatallanıp kalın iz bırakır; hafif dokununca ince çizgi verir.
              Copperplate, Spencerian ve modern kaligrafi bu mantıkla çalışır.</p>
              <ul className="cal-tool-list">
                <li><strong>Daldırmalı esnek uçlar (dip nib):</strong> Başlangıç için fazla keskin olmayan Nikko G.</li>
                <li><strong>Kalemlik (oblique/straight holder):</strong> Ucu tutan sap.</li>
                <li><strong>Fırça kalem (brush pen):</strong> Başlangıç için ideal (Tombow Fudenosuke, Pentel Touch).</li>
              </ul>
            </div>
          )}
        </div>
        <div className="cal-note">
          <span>📄</span>
          <p><strong>Kâğıt — en çok hafife alınan ama en kritik malzeme.</strong> Yanlış kâğıt, teknik olarak doğru yazıyı bile kötü gösterir. İslam hattında <strong>aharlı kâğıt</strong> (nişasta/yumurta akı ve şapla terbiye edilip mührelenmiş, mürekkep emmeyen yüzey); sivri uç için hot-pressed/yüksek gramajlı pürüzsüz kâğıt (Rhodia, Clairefontaine); geniş uç için pürüzsüz çizim kâğıdı kullanılır. Sıradan fotokopi kâğıdı mürekkebi dağıtır ve fırça uçlarını bozar.</p>
        </div>
        <p className="cal-p">
          <strong>Mürekkep:</strong> İslam hattında is mürekkebi (kurum + arap zamkı), Doğu Asya'da sumi, modern
          kaligrafide şişe veya sumi mürekkepleri. <strong>Yardımcılar:</strong> cetvel ve kılavuz çizgiler, kurşun
          kalem, kamışı kesmek için <em>makta</em> (kemik altlık), mürekkebin fazlasını almak için hokkaya konan
          <em> lika</em> (ham ipek).
        </p>
      </section>

      {/* VII. TEKNİKLER */}
      <section className="cal-section reveal">
        <div className="cal-num">VII</div>
        <h2 className="cal-h2">Temel Teknikler</h2>
        <div className="cal-tech">
          <div className="cal-tech-item"><strong>Altın kural (sivri uç & fırça)</strong><p>Yukarı çıkarken <em>ince</em> (baskısız), aşağı inerken <em>kalın</em> (baskılı). Çıkış çizgilerinde uç neredeyse kâğıttan kalkacak kadar hafif; iniş çizgilerinde tam baskı. Tüm modern kaligrafinin belkemiği budur.</p></div>
          <div className="cal-tech-item"><strong>Sabit açı (geniş uç)</strong><p>Burada baskı değil <em>uç açısı</em> belirleyicidir; ucu yazı boyunca aynı açıda tutarsın (italik/gotik ~45°, foundational ~30°). Kalınlık, çizgi yönü açıyla kesiştikçe kendiliğinden oluşur. Açıyı korumak için çoğu zaman kalemi değil kâğıdı döndürürsün.</p></div>
          <div className="cal-tech-item"><strong>8 temel hareket</strong><p>Harfler doğrudan değil, önce yapı taşlarıyla öğrenilir: giriş/çıkış, üstten dönüş, alttan dönüş, bileşik eğri, oval, yukarı/aşağı ilmek. Bu hareketler kas hafızasına yerleşince neredeyse tüm küçük harf alfabesi onlardan kurulur.</p></div>
          <div className="cal-tech-item"><strong>Kılavuz çizgiler</strong><p>Asla boş kâğıda yazılmaz: baseline (taban), x-height (gövde), ascender (üst uzantı), descender (alt uzantı) ve tutarlı eğim için slant çizgisi. Bu eğim Copperplate'te ~55°, Spencerian'da ~52°'dir.</p></div>
          <div className="cal-tech-item"><strong>Duruş ve vücut</strong><p>İyi kaligrafi parmaktan değil <em>kol ve omuzdan</em> gelir; hareketin pivotu omuzdur. Dirsek ~90°, ayaklar yere düz, omuzlar gevşek. Doğu Asya kaligrafisinde ise tüm vücut koordinasyonu ve fırçanın dik tutuluşu esastır.</p></div>
        </div>
      </section>

      {/* VIII. PÜF NOKTALARI */}
      <section className="cal-section reveal">
        <div className="cal-num">VIII</div>
        <h2 className="cal-h2">Püf Noktaları</h2>
        <p className="cal-p">Deneyimli hattatların ve eğitmenlerin en sık tekrarladığı pratik ipuçları:</p>
        <div className="cal-cards">
          {tips.map(([e, t, d], i) => (
            <div key={i} className="cal-card"><div className="cal-card-e">{e}</div><div><strong>{t}</strong><span>{d}</span></div></div>
          ))}
        </div>
      </section>

      {/* IX. YOL HARİTASI */}
      <section className="cal-section reveal">
        <div className="cal-num">IX</div>
        <h2 className="cal-h2">Sıfırdan Başlangıç Yol Haritası</h2>
        <p className="cal-p">Modern / Latin kaligrafisi için en erişilebilir başlangıç — adım adım:</p>
        <Stepper steps={roadmapSteps}>
          {(i) => (
            <svg viewBox="0 0 160 160" className="cal-svg" aria-hidden="true">
              <circle cx="80" cy="80" r="58" fill="rgba(168,125,44,0.08)" stroke="#a87d2c" strokeWidth="2" strokeDasharray="2 5" />
              <circle cx="80" cy="80" r="44" fill="#fdfaf3" stroke="rgba(110,85,45,0.2)" strokeWidth="1.4" />
              <text x="80" y="70" textAnchor="middle" fontSize="34">{roadmapIcons[i]}</text>
              <text x="80" y="104" textAnchor="middle" fontSize="13" fill="#a87d2c" fontWeight="700" fontFamily="Georgia, serif">{i + 1} / {roadmapSteps.length}</text>
            </svg>
          )}
        </Stepper>
        <div className="cal-note">
          <span>🪶</span>
          <p><strong>Geleneksel hat sanatı (hüsn-i hat) için:</strong> Bir hocaya/kursa yazıl — hat, gerçekten usta-çırak (meşk) sistemiyle öğrenilir, tek başına ilerlemek çok zordur. Genelde <strong>sülüs ve nesih</strong> ile başlanır; kamış kalem, is mürekkebi, aharlı kâğıt ve makta ile temel harf formları çalışılır. Meşk düzeni: taklit et, düzeltme al, tekrarla. Yıllar süren bu yol, ilerledikçe <strong>icazete</strong> kadar uzanır.</p>
        </div>
        <blockquote className="cal-quote">İster Latin ister hat olsun, ilerlemenin formülü aynı: <em>az araç, çok tekrar, sabır ve düzenli pratik.</em></blockquote>
      </section>

      {/* X. MANEVİ BOYUT */}
      <section className="cal-section reveal">
        <div className="cal-num">X</div>
        <h2 className="cal-h2">Manevi ve Bilişsel Boyut</h2>
        <p className="cal-p">
          Kaligrafi üç gelenekte de salt teknik değil, bir <strong>iç disiplin</strong> olarak görülmüştür. İslam
          hattında yazı, kutsal sözü en güzel biçimde taşıma sorumluluğuyla manevi bir adanmışlığa dönüşür; hattatlar
          yazıya başlamadan abdest alıp belli bir ruh hâliyle otururdu. Doğu Asya'da fırçanın izinin yazanın karakterini
          yansıttığına inanılır; Zen'de tek nefeste çizilen daire bir meditasyon nesnesidir.
        </p>
        <p className="cal-p">
          Modern psikoloji de bunu doğruluyor: kaligrafi yavaşlığı, odağı ve ritmi gerektirdiği için yaygın bir
          <strong> mindfulness</strong> (bilinçli farkındalık) pratiği olarak öneriliyor. Tekrarlı hareketler, nefes ve
          dikkatin tek noktaya toplanması, anksiyeteyi azaltan ve odağı güçlendiren bir <strong>akış (flow)</strong> hâli
          yaratıyor. Yani kaligrafi, hem üretilen esere hem de üretene iyi gelen ender uğraşlardandır.
        </p>
      </section>

      {/* XI. QUIZ */}
      <section className="cal-section reveal">
        <div className="cal-num">XI</div>
        <h2 className="cal-h2">Mini Quiz</h2>
        <div className="cal-quiz">
          {!done ? (
            <>
              <div className="cal-quiz-top"><span>Soru {quizQ + 1} / {quizQs.length}</span><span className="cal-quiz-score">Puan: {score}</span></div>
              <h3 className="cal-quiz-q">{quizQs[quizQ].text}</h3>
              <div className="cal-quiz-opts">
                {quizQs[quizQ].opts.map((o, oi) => {
                  const sel = answered[quizQ]; const isAns = sel !== undefined; const correct = quizQs[quizQ].a;
                  let cls = 'cal-opt'; if (isAns) { if (oi === correct) cls += ' correct'; else if (oi === sel) cls += ' wrong'; else cls += ' dim'; }
                  return (<button key={oi} className={cls} onClick={() => answerQ(oi)} disabled={isAns}><span className="cal-opt-letter">{String.fromCharCode(65 + oi)}</span>{o}</button>);
                })}
              </div>
            </>
          ) : (
            <div className="cal-quiz-result">
              <div className="cal-quiz-emoji">{score >= 8 ? '🏆' : score >= 5 ? '✒️' : '📖'}</div>
              <h3 className="cal-quiz-rtitle">{score} / {quizQs.length} doğru</h3>
              <p className="cal-quiz-rdesc">{score >= 8 ? 'Kalemin de zevkin de yerinde!' : score >= 5 ? 'Güzel — güzel yazının dilini çözüyorsun.' : 'Yukarı kaydırıp bir kez daha sindir.'}</p>
              <button className="cal-ctrl-btn cal-ctrl-primary" onClick={restartQuiz}>↺ Tekrar dene</button>
            </div>
          )}
        </div>
      </section>

      <ArticleBibliography items={refs} accent="#a87d2c" />

      <footer className="cal-footer">
        <div className="cal-footer-mark">BASEMENTS</div>
        <p>Bir harfi güzelleştirmek için bir ömür yetmeyebilir — ama o ömrün her dakikası, hem kâğıda hem de yazana iyi gelir. Az araç, çok tekrar, sabır. ✒️</p>
        <Link href="/discover" className="cal-footer-link">← Diğer içerikleri keşfet</Link>
      </footer>

      <style>{`
        .cal-page { --bg:#f5efe3; --panel:#fdfaf3; --line:rgba(110,85,45,0.20); --line-soft:rgba(110,85,45,0.12); --ink:#2c2620; --ink2:#4a4138; --muted:#8a7d6c; --gold:#a87d2c; --gold-deep:#8a6420; --crimson:#a8332b;
          background:
            radial-gradient(1100px 520px at 82% -8%, rgba(168,125,44,0.10), transparent 60%),
            radial-gradient(900px 600px at 0% 8%, rgba(168,51,43,0.05), transparent 55%),
            var(--bg);
          color: var(--ink); font-family: -apple-system, 'Segoe UI', system-ui, sans-serif; line-height: 1.74;
          font-size: 17px; -webkit-font-smoothing: antialiased; overflow-x: hidden;
        }
        .cal-page *::selection { background: rgba(168,125,44,0.28); color: #1a140a; }

        .cal-topbar { position: sticky; top: 0; z-index: 30; display: flex; align-items: center; gap: 12px; padding: 12px 20px;
          background: rgba(245,239,227,0.82); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); }
        .cal-back { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 10px; color: var(--gold-deep);
          border: 1px solid var(--line); background: var(--panel); transition: .2s; flex-shrink: 0; }
        .cal-back:hover { background: rgba(168,125,44,0.10); transform: translateX(-2px); }
        .cal-topbar-title { font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; font-weight: 700; letter-spacing: .03em; font-size: .95rem; color: var(--ink2); }

        .cal-hero { position: relative; max-width: 820px; margin: 0 auto; padding: 64px 24px 36px; text-align: center; }
        .cal-hero-art { display: flex; justify-content: center; margin-bottom: 14px; filter: drop-shadow(0 4px 10px rgba(110,85,45,0.14)); }
        .cal-hero-eyebrow { font-size: .72rem; letter-spacing: .22em; color: var(--gold-deep); margin-bottom: 12px; font-weight: 700; }
        .cal-hero-title { font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; font-size: clamp(2.9rem, 9vw, 5rem); line-height: 1.0; margin: 0 0 18px; font-weight: 700; letter-spacing: -.01em; color: var(--ink); }
        .cal-hero-sub { font-size: 1.14rem; color: var(--ink2); max-width: 660px; margin: 0 auto; }
        .cal-hero-sub strong { color: var(--ink); font-weight: 700; }
        .cal-hero-sub em { color: var(--gold-deep); font-style: italic; }
        .cal-hero-tags { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 24px; }
        .cal-tag { font-size: .76rem; padding: 6px 13px; border-radius: 999px; border: 1px solid var(--line); color: var(--gold-deep); background: var(--panel); }

        .cal-section { position: relative; max-width: 760px; margin: 0 auto; padding: 40px 24px; border-top: 1px solid var(--line-soft); }
        .cal-num { font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; font-size: 1.1rem; font-weight: 700; color: var(--gold); letter-spacing: .08em; margin-bottom: 6px; }
        .cal-h2 { font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; font-size: clamp(1.55rem, 4.4vw, 2.15rem); line-height: 1.2; margin: 0 0 18px; font-weight: 700; letter-spacing: -.01em; color: var(--ink); }
        .cal-h3 { font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; font-size: 1.2rem; margin: 26px 0 12px; color: var(--ink); font-weight: 700; }
        .cal-lead { font-size: 1.2rem; color: var(--ink2); margin: 0 0 16px; font-weight: 500; }
        .cal-p { margin: 0 0 16px; color: var(--ink2); }
        .cal-p:last-child { margin-bottom: 0; }
        .cal-p strong, .cal-lead strong { color: var(--ink); font-weight: 700; }
        .cal-p em, .cal-lead em { color: var(--gold-deep); font-style: italic; }

        .cal-quote { margin: 22px 0 4px; padding: 16px 22px; border-left: 3px solid var(--gold); border-radius: 0 12px 12px 0;
          background: linear-gradient(90deg, rgba(168,125,44,0.09), transparent); font-size: 1.16rem; font-style: italic; color: var(--ink);
          font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; }
        .cal-quote em { color: var(--gold-deep); }

        .cal-note { display: flex; gap: 13px; align-items: flex-start; margin: 20px 0 4px; padding: 15px 18px; border-radius: 14px; background: var(--panel); border: 1px solid var(--line); box-shadow: 0 1px 4px rgba(110,85,45,0.05); }
        .cal-note span:first-child { font-size: 1.3rem; line-height: 1.3; flex-shrink: 0; }
        .cal-note p { margin: 0; font-size: .96rem; color: var(--ink2); }
        .cal-note strong { color: var(--gold-deep); }

        /* CARDS */
        .cal-cards { display: grid; gap: 12px; margin: 20px 0 4px; }
        .cal-card { display: flex; gap: 14px; align-items: flex-start; padding: 16px 18px; border-radius: 14px; background: var(--panel); border: 1px solid var(--line); transition: .25s; box-shadow: 0 1px 4px rgba(110,85,45,0.05); }
        .cal-card:hover { border-color: rgba(168,125,44,0.4); transform: translateY(-2px); }
        .cal-card-e { font-size: 1.5rem; line-height: 1.2; flex-shrink: 0; }
        .cal-card strong { display: block; color: var(--ink); font-size: 1.05rem; margin-bottom: 4px; }
        .cal-card span { display: block; color: var(--ink2); font-size: .93rem; }

        /* CHINESE STYLES */
        .cal-styles { display: grid; gap: 12px; margin: 20px 0 4px; }
        .cal-style { display: flex; gap: 16px; align-items: center; padding: 14px 18px; border-radius: 14px; background: var(--panel); border: 1px solid var(--line); box-shadow: 0 1px 4px rgba(110,85,45,0.05); }
        .cal-glyph { font-family: 'Songti SC','SimSun','STSong',serif; font-size: 2.6rem; line-height: 1; color: var(--crimson); flex-shrink: 0; width: 48px; text-align: center; }
        .cal-style strong { display: block; color: var(--ink); font-size: 1.05rem; }
        .cal-style span { display: block; color: var(--ink2); font-size: .9rem; margin-top: 2px; }

        /* TIMELINE */
        .cal-timeline { list-style: none; margin: 22px 0 0; padding: 0 0 0 6px; position: relative; }
        .cal-timeline::before { content: ''; position: absolute; left: 11px; top: 6px; bottom: 6px; width: 2px; background: linear-gradient(var(--gold), var(--crimson)); opacity: .42; }
        .cal-tl-item { position: relative; padding: 0 0 22px 38px; }
        .cal-tl-item:last-child { padding-bottom: 0; }
        .cal-tl-dot { position: absolute; left: 4px; top: 5px; width: 16px; height: 16px; border-radius: 50%; background: var(--bg); border: 3px solid var(--gold); box-shadow: 0 0 0 3px rgba(168,125,44,0.12); }
        .cal-tl-year { font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; font-size: .92rem; font-weight: 700; color: var(--gold-deep); }
        .cal-tl-body { margin-top: 3px; }
        .cal-tl-body strong { display: block; color: var(--ink); font-size: 1.05rem; margin-bottom: 3px; }
        .cal-tl-body span { color: var(--ink2); font-size: .95rem; }

        /* GLOSSARY */
        .cal-gloss { display: grid; gap: 0; margin: 18px 0 4px; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; background: var(--panel); }
        .cal-gloss-row { display: grid; grid-template-columns: 150px 1fr; gap: 14px; padding: 13px 18px; border-top: 1px solid var(--line-soft); }
        .cal-gloss-row:first-child { border-top: none; }
        .cal-gloss-name { font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; font-weight: 700; color: var(--gold-deep); font-size: 1rem; }
        .cal-gloss-desc { color: var(--ink2); font-size: .93rem; }

        /* STEPPER */
        .cal-stepper { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 18px; align-items: stretch; margin: 22px 0 6px; background: var(--panel); border: 1px solid var(--line); border-radius: 18px; padding: 16px; box-shadow: 0 2px 8px rgba(110,85,45,0.06); }
        .cal-stepper-viz { display: grid; place-items: center; min-height: 200px; }
        .cal-svg { width: 100%; max-width: 200px; height: auto; }
        .cal-stepper-panel { display: flex; flex-direction: column; }
        .cal-dots { display: flex; gap: 7px; margin-bottom: 12px; }
        .cal-dot { width: 9px; height: 9px; border-radius: 50%; border: none; background: rgba(168,125,44,0.28); cursor: pointer; transition: .2s; padding: 0; }
        .cal-dot.on { background: var(--gold); box-shadow: 0 0 8px rgba(168,125,44,0.6); transform: scale(1.25); }
        .cal-step-meta { font-size: .73rem; letter-spacing: .08em; color: var(--gold-deep); font-weight: 700; }
        .cal-step-title { font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; font-size: 1.2rem; margin: 4px 0 8px; color: var(--ink); font-weight: 700; }
        .cal-step-desc { font-size: .95rem; color: var(--ink2); margin: 0 0 16px; flex: 1; }
        .cal-stepper-ctrl { display: flex; gap: 10px; }
        .cal-ctrl-btn { flex: 1; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--line); background: #fff; color: var(--ink); font-size: .88rem; font-weight: 600; cursor: pointer; transition: .2s; font-family: inherit; }
        .cal-ctrl-btn:hover:not(:disabled) { border-color: var(--gold); background: rgba(168,125,44,0.08); }
        .cal-ctrl-btn:disabled { opacity: .4; cursor: not-allowed; }
        .cal-ctrl-primary { background: linear-gradient(120deg, var(--gold), var(--gold-deep)); border-color: transparent; color: #fff; }
        .cal-ctrl-primary:hover:not(:disabled) { filter: brightness(1.07); }

        /* TOOL TOGGLE */
        .cal-toggle { display: flex; gap: 8px; margin: 16px 0; padding: 5px; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; }
        .cal-toggle-btn { flex: 1; padding: 11px; border-radius: 10px; border: none; background: transparent; color: var(--muted); font-size: .94rem; font-weight: 700; cursor: pointer; transition: .2s; font-family: inherit; }
        .cal-toggle-btn.on { color: #fff; background: linear-gradient(120deg, var(--gold), var(--gold-deep)); box-shadow: 0 4px 14px rgba(168,125,44,0.25); }
        .cal-toggle-btn:not(.on):hover { color: var(--ink); }
        .cal-tool { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 16px; align-items: center; padding: 18px; border-radius: 16px; border: 1px solid var(--line); background: var(--panel); box-shadow: 0 2px 8px rgba(110,85,45,0.06); }
        .cal-tool-viz { display: grid; place-items: center; }
        .cal-tool-body { animation: cal-fade .35s ease; }
        @keyframes cal-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .cal-tool-body h4 { margin: 0 0 8px; font-size: 1.12rem; color: var(--ink); font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; }
        .cal-tool-body h4 em { color: var(--gold-deep); font-style: italic; }
        .cal-tool-body p { margin: 0 0 10px; color: var(--ink2); font-size: .95rem; }
        .cal-tool-list { margin: 0; padding-left: 18px; color: var(--ink2); font-size: .9rem; }
        .cal-tool-list li { margin-bottom: 5px; }
        .cal-tool-list strong { color: var(--ink); }

        /* TECHNIQUES */
        .cal-tech { display: grid; gap: 12px; margin: 8px 0 4px; }
        .cal-tech-item { padding: 16px 18px; border-radius: 14px; background: var(--panel); border: 1px solid var(--line); border-left: 3px solid var(--gold); }
        .cal-tech-item strong { display: block; color: var(--ink); font-size: 1.05rem; margin-bottom: 5px; font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; }
        .cal-tech-item p { margin: 0; color: var(--ink2); font-size: .94rem; }
        .cal-tech-item em { color: var(--gold-deep); font-style: italic; }

        /* QUIZ */
        .cal-quiz { background: var(--panel); border: 1px solid var(--line); border-radius: 18px; padding: 22px; box-shadow: 0 2px 8px rgba(110,85,45,0.06); }
        .cal-quiz-top { display: flex; justify-content: space-between; font-size: .82rem; color: var(--muted); margin-bottom: 12px; }
        .cal-quiz-score { color: var(--gold-deep); font-weight: 700; }
        .cal-quiz-q { font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; font-size: 1.22rem; margin: 0 0 16px; color: var(--ink); line-height: 1.4; }
        .cal-quiz-opts { display: grid; gap: 10px; }
        .cal-opt { display: flex; align-items: center; gap: 13px; text-align: left; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--line); background: #fff; color: var(--ink); font-size: .94rem; cursor: pointer; transition: all .2s; font-family: inherit; }
        .cal-opt:not(:disabled):hover { border-color: var(--gold); background: rgba(168,125,44,0.06); }
        .cal-opt-letter { width: 25px; height: 25px; border-radius: 7px; display: grid; place-items: center; font-weight: 700; font-size: .78rem; background: rgba(168,125,44,0.14); color: var(--gold-deep); flex-shrink: 0; }
        .cal-opt.correct { border-color: #2f8f5b !important; background: rgba(47,143,91,0.12) !important; }
        .cal-opt.correct .cal-opt-letter { background: #2f8f5b !important; color: #fff; }
        .cal-opt.wrong { border-color: var(--crimson) !important; background: rgba(168,51,43,0.10) !important; }
        .cal-opt.wrong .cal-opt-letter { background: var(--crimson) !important; color: #fff; }
        .cal-opt.dim { opacity: .5; }
        .cal-opt:disabled { cursor: default; }
        .cal-quiz-result { text-align: center; padding: 14px; }
        .cal-quiz-emoji { font-size: 3rem; }
        .cal-quiz-rtitle { font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; font-size: 1.5rem; margin: 6px 0; color: var(--gold-deep); }
        .cal-quiz-rdesc { color: var(--ink2); margin: 0 0 16px; }
        .cal-quiz-result .cal-ctrl-primary { display: inline-block; padding: 11px 22px; flex: none; }

        /* FOOTER */
        .cal-footer { max-width: 760px; margin: 0 auto; padding: 44px 24px 70px; text-align: center; border-top: 1px solid var(--line); }
        .cal-footer-mark { font-weight: 800; letter-spacing: .3em; color: var(--gold-deep); font-size: .82rem; margin-bottom: 14px; }
        .cal-footer p { color: var(--ink2); font-size: 1rem; max-width: 580px; margin: 0 auto 18px; }
        .cal-footer-link { color: var(--gold-deep); font-weight: 600; text-decoration: none; border-bottom: 1px solid transparent; transition: .2s; }
        .cal-footer-link:hover { border-bottom-color: var(--gold-deep); }

        /* REVEAL */
        .reveal { opacity: 0; transform: translateY(22px); transition: opacity .7s ease, transform .7s ease; }
        .reveal.visible { opacity: 1; transform: none; }

        @media (max-width: 720px) {
          .cal-stepper, .cal-tool { grid-template-columns: 1fr; }
          .cal-stepper-viz { min-height: 150px; }
        }
        @media (max-width: 540px) {
          .cal-page { font-size: 16px; }
          .cal-gloss-row { grid-template-columns: 1fr; gap: 3px; }
          .cal-toggle { flex-direction: row; }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal { transition: none; opacity: 1; transform: none; }
          .cal-tool-body { animation: none; }
        }
      `}</style>
    </main>
  );
}
