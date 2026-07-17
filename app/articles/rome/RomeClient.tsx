'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import ArticleImage from '@/app/components/article/ArticleImage';

const refs: BibItem[] = [
  { title: 'SPQR: A History of Ancient Rome', authors: 'Mary Beard', year: '2015', source: 'Profile Books' },
  { title: 'Roma İmparatorluğunun Gerileyiş ve Çöküş Tarihi', authors: 'Edward Gibbon', year: '1776', source: 'Klasik eser' },
  { title: 'Ab Urbe Condita (Roma Tarihi)', authors: 'Titus Livius', source: 'Antik kaynak' },
  { title: 'Roman Empire', source: 'Encyclopædia Britannica', url: 'https://www.britannica.com/place/Roman-Empire' },
];

const tablets = [
  { num: 'I',    title: 'Mahkeme Usulü',      summary: 'Duruşmaya katılım, gün belirleme, davacı hakları.',
    laws: ['Mahkemede iki taraftan biri katılmaz ise davacı tanık çağırır, hakim öğleden sonra diğer tarafın lehine hüküm verir.','İki kişi de hazır bulunursa karar günün akşamına doğru çıkar; anlaşamazlarsa bilgiler pazarda açıklanır.','Davayı her iki taraf kendince savunur.','Davalı şahıs kaçmaya çalışırsa davacı ona el koyar.','Yaşlı veya hasta olan kişiye davacı bir araba tahsis eder.','Bir patriciiye ancak bir patricii kefil olabilir; plebler için her iki grup da kefil olabilir.'] },
  { num: 'II',   title: 'Teminat ve Hastalık', summary: 'Teminat miktarları, duruşma erteleme koşulları.',
    laws: ['Teminat altındaki mallar için cezai tutar 500 ila 50 ekstr arasında değişir; konu kişi özgürlüğüyse teminat 50 ekstirdir.','Taraflardan biri ağır hasta ise yada yabancı davası görülecekse duruşma günü ertelenir.','Delile ihtiyacı olan kimse her üç günde bir şahidin kapısına gidip yüksek sesle bildirecektir.'] },
  { num: 'III',  title: 'Borç ve Ceza',        summary: 'Borçlu kişilerin hakları, ev hapsi koşulları.',
    laws: ['Borçlar için mahkemece 30 gün mühlet verilir; ödeyemezse kefil gelmediği müddetçe davacı borçluyu evine götürebilir.','Borçlu o ev içinde kendi imkânlarıyla yaşayabilir ya da ev sahibi her gün en az bir ekmek vermek zorundadır.','30 günlük süreç sonunda her pazar mahkemeye çıkarılır; sonunda idam edilir. Birden fazla alacaklı varsa beden parçalara ayrılır.'] },
  { num: 'IV',   title: 'Aile Hukuku',         summary: 'Sakat doğan bebekler, boşanma hakkı, miras.',
    laws: ['Aşırı derecede sakat doğan bebekler öldürülür.','Bir adam artık evli kalmak istemiyorsa karısını evden çıkarabilir.','Baba öldükten 10 ay sonra doğan çocuk mirasa giremez; baba oğlunu 3 kez pazarda satmaya çalışır ve alıcı bulunamazsa evlat özgürlüğünü kazanır.'] },
  { num: 'V',    title: 'Miras ve Vesayet',    summary: 'Kadın vesayeti, vasiyet bağlayıcılığı.',
    laws: ['Kadınlar erginliğe ulaşsa dahi akıllarının yeterli olmadığı düşünüldüğünden vesayet altındadırlar; Vesta bakireleri istisnadır.','Vasiyet bırakılmışsa bağlayıcıdır; bırakılmamışsa mallar en yakın erkek akrabaya geçer.','Deliren kişinin malları klan üyelerinin yönetimi altında olur.','Vefat edenin borçları miras alınan paya göre paylaştırılır.'] },
  { num: 'VI',   title: 'Mülkiyet ve Satış',   summary: 'Sözleşme bağlayıcılığı, arazi zamanaşımı.',
    laws: ['Bir kişi söylediği biçimiyle senet yaparsa bu söz yerine getirilmelidir.','Satışı gerçekleştirilen mal ödenmez yada kefil gösterilmezse satış gerçekleşmemiş sayılır.','Arazi için zamanaşımı ile hak iddia etmek için 2 yıl; taşınırlar için 1 yıl geçmesi gerekir.','Yabancılar için zamanaşımı yoktur.','Binalarda sabitlenmiş keresteler alınamaz; alındığı ispatlanırsa iki kat tazminat ödenir.'] },
  { num: 'VII',  title: 'Arazi ve Yollar',     summary: 'Tarla sınırları, yol genişlikleri, ağaç hakları.',
    laws: ['İki tarla arasında 5 ayaklık boşluk hiçbir şekilde mülkiyet hakkına konu olamaz.','Yollar düz olduğunda 8 ayak, köşelerde 16 ayak genişliğine uzar.','Herkes etrafındaki yolları onaracak; onarmazsa vatandaş yoldan istediği gibi geçebilir.','Bir ağaç 15 feet\'ten fazla uzadığında kesilebilir; komşunun ağacı rüzgarla eğilirse kaldırılır.','Ağacınızdan düşen meyveleri komşunuzun bahçesinden almanızda sorun yoktur.'] },
  { num: 'VIII', title: 'Suçlar ve Cezalar',   summary: 'Hakaret, yaralama, hırsızlık, yalancı tanıklık.',
    laws: ['Onursuz sözler söyleyen veya kötü sözlü şarkı söyleyen sopayla vurularak öldürülür.','Bir kişinin uzvuna zarar verilirse taraflar anlaşmazsa aynı şekilde karşılık verilir (kısas).','Özgür kişinin kemiğini kırmak 300 parça; köle için 150 parça tazminat gerektirir.','Gece hırsız suçüstü yakalanırsa öldürülebilir; gündüz ise önce bağırılmalıdır.','Yalancı tanıklık yapanlar Tarpeian Kayasından aşağı atılacaktır.','Faiz on ikide birden fazla olamaz.'] },
  { num: 'IX',   title: 'Kamu Hukuku',         summary: 'Kişiye özel yasa yasağı, rüşvet, idam yetkisi.',
    laws: ['Kişiye özel kanunlar çıkarılamaz; idam yalnızca en büyük meclis tarafından kararlaştırılır.','Yargıçlar rüşvet alırlarsa idam edilecektir.','Halkın düşmanlarını tahrik etmenin cezası idamdır.','Suçu ispatlanmadan kimse öldürülemez.'] },
  { num: 'X',    title: 'Cenaze Hukuku',       summary: 'Ölü gömme kuralları, cenaze masrafı sınırı.',
    laws: ['Ölüler şehire gömülemez ve yakılamaz.','Cenazelerde masraf; üç yas tutan kişi, bir mor tunik giyen ve on flüt çalan kişiyle sınırlıdır.','Kadınlar cenazede yanaklarını yırtmayacak ve ağıt yakmayacaktır.','Yakılan kişinin bedenine altın atılmayacak; fakat altın dişler yerinde kalabilir.','Mezar girişleri uzun süreli kullanımla işgal edilemez.'] },
  { num: 'XI',   title: 'Evlilik Kısıtlaması', summary: 'Plebler ile patriciiler arasındaki evlilik yasağı.',
    laws: ['Plebler (halk) ve patriciler (soylular) birlikte evlenemezler.'] },
  { num: 'XII',  title: 'Son Hükümler',        summary: 'Kurbanlık hayvan, köle zararı, iftira.',
    laws: ['Kurbanlık hayvan satışında bedel ödenmemişse bu para kutsal ziyafet için rehin alınır.','Evin babası sahibi olduğu kölenin verdiği zararı bizzat tespit edip cezalandırabilir.','İftira ile bir şey elde eden kişiden 3 hakem aracılığıyla iki kat tazminat alınır.','Halkın son sözü yasa bağlayıcı niteliktedir.'] },
];

const figures = [
  { name: 'Romulus',         role: 'Kurucu Kral',     era: 'MÖ 753', emoji: '⚔️', desc: 'Roma\'nın efsanevi kurucusu. Kardeşi Remus ile dişi kurt tarafından büyütüldükten sonra şehri kurdu ve ilk kral oldu.' },
  { name: 'Julius Caesar',   role: 'Diktatör',         era: 'MÖ 49',  emoji: '🦅', desc: 'Galya\'yı fethetti, Rubicon Nehrini geçti ve Roma\'nın tek hâkimi oldu. MÖ 44\'te Brutus tarafından suikaste kurban gitti.' },
  { name: 'Brutus',          role: 'Senatör / Katil',  era: 'MÖ 44',  emoji: '🗡️', desc: 'Caesar\'ın eski destekçisi ve senatörü. Cumhuriyeti kurtarmak amacıyla suikastı yönetti; ancak devlet düşmanı ilan edilerek kaçmak zorunda kaldı.' },
  { name: 'Augustus',        role: 'İlk İmparator',    era: 'MÖ 27',  emoji: '👑', desc: 'Caesar\'ın üvey oğlu. Senatoyu ele geçirerek imparatorluğu kurdu ve Roma\'nın en parlak çağını başlattı.' },
  { name: 'Spartacüs',       role: 'Köle Lideri',      era: 'MÖ 73',  emoji: '🔥', desc: 'Patricii baskısına karşı köle ve gladyatörleri örgütleyerek büyük isyan savaşı başlattı. Roma ordusunu defalarca yendi.' },
  { name: 'Pompeius Magnus',  role: 'General / Rakip', era: 'MÖ 48',  emoji: '🛡️', desc: 'Triumvirliğin ortağı. Sezar ile ayrılınca Pharsalus\'ta yenildi, Mısır\'a kaçtı ve karaya çıktığı an öldürüldü.' },
];

const caesarSteps = [
  { step: 'Triumvirlik', icon: '🤝', desc: 'Sezar, Pompeius ve Crassus ile üç kişilik iktidar paylaşımı kurdu. Galya fethi ve Britannya işgali bu dönemde gerçekleşti.' },
  { step: 'Rubicon',     icon: '🌊', desc: 'Crassus\'un ölümü ve Pompeius ile görüş ayrılığının ardından Sezar, generallere yasak olan Rubicon Nehrini ordusuyla geçerek iç savaş başlattı.' },
  { step: 'Pharsalus',   icon: '⚔️', desc: 'Pompeius Yunanistan\'a kaçtı ve Pharsalus\'ta Sezar\'a yenildi. Mısır\'da yeni ordu kurmak isterken karaya çıktığı an kafası kesildi.' },
  { step: 'Diktatörlük', icon: '🗡️', desc: 'Roma\'nın tek hâkimi olan Sezar, eski destekçisi Marcus Junius Brutus ve diğer senatörler tarafından suikaste uğrayarak öldürüldü.' },
  { step: 'Augustus',    icon: '👑', desc: 'Sezar\'ın üvey oğlu Octavius Augustus, Brutus\'u devlet düşmanı ilan etti. 19 lejyonla savaşarak galip geldi ve imparatorluğun kapısını araladı.' },
];

const emperors = [
  { name: 'Augustus',        role: 'İlk İmparator',      era: 'MÖ 27 – MS 14', emoji: '👑', desc: 'Pax Romana\'yı başlattı. "Tuğladan bir Roma devraldım, mermerden bir Roma bıraktım" sözü ona atfedilir.' },
  { name: 'Nero',            role: 'Tiran İmparator',    era: 'MS 54 – 68',    emoji: '🔥', desc: 'MS 64\'teki Büyük Roma Yangını onun döneminde yaşandı; suçu Hristiyanlara attı. Zorbalığıyla anılır.' },
  { name: 'Vespasianus',     role: 'Flavius Hanedanı',   era: 'MS 69 – 79',    emoji: '🏟️', desc: 'Flavius hanedanını kurdu ve Colosseum\'un (Flavius Amfitiyatrosu) inşasını başlattı.' },
  { name: 'Traianus',        role: 'En Geniş Sınırlar',  era: 'MS 98 – 117',   emoji: '🗺️', desc: 'İmparatorluğu tarihteki en geniş sınırlarına ulaştırdı. "Optimus Princeps" (En İyi İmparator) unvanını aldı.' },
  { name: 'Hadrianus',       role: 'Surların İmparatoru',era: 'MS 117 – 138',  emoji: '🧱', desc: 'Britanya\'da kuzey kabilelere karşı Hadrian Surları\'nı yaptırdı; sınırları sağlamlaştırmaya öncelik verdi.' },
  { name: 'Marcus Aurelius', role: 'Filozof İmparator',  era: 'MS 161 – 180',  emoji: '📜', desc: 'Stoacı filozof; "Düşünceler" (Meditationes) eserini yazdı. Ölümüyle Pax Romana sona erdi.' },
  { name: 'Diocletianus',    role: 'Bölen İmparator',    era: 'MS 284 – 305',  emoji: '⚖️', desc: 'İmparatorluğu yönetilebilir kılmak için dörtlü yönetime (Tetrarşi) ayırdı; doğu-batı bölünmesinin temelini attı.' },
  { name: 'Konstantin',      role: 'Hristiyan İmparator', era: 'MS 306 – 337', emoji: '✝️', desc: 'Hristiyanlığı serbest bıraktı (Milano Fermanı, MS 313) ve başkenti Byzantion\'a (Konstantinopolis) taşıdı.' },
];

const achievements = [
  { icon: '🛣️', title: 'Yollar',        desc: '400.000 km\'yi aşan yol ağı. "Bütün yollar Roma\'ya çıkar" sözü buradan gelir; bazı ana yollar bugün hâlâ kullanılır.' },
  { icon: '💧', title: 'Su Kemerleri',  desc: 'Akvedüktlerle şehirlere kilometrelerce uzaktan temiz su taşındı; çeşmeler, hamamlar ve tuvaletler bu sayede çalıştı.' },
  { icon: '🏛️', title: 'Beton & Mimari', desc: 'Roma betonu (opus caementicium) ile devasa kubbe ve kemerler inşa edildi. Pantheon\'un kubbesi ~2000 yıldır ayakta.' },
  { icon: '⚖️', title: 'Hukuk',         desc: '12 Levha\'dan Corpus Juris Civilis\'e uzanan Roma hukuku, modern Batı hukuk sistemlerinin temelini oluşturdu.' },
];

const QUIZ_Q = [
  { q: 'Roma\'nın efsanevi kurucusu hangi hayvan tarafından emzirildiği söylenir?', opts: ['Kartal','Dişi Kurt','Aslan','Boğa'], correct: 1 },
  { q: '12 Levha Kanunu hangi meydana asıldı?', opts: ['Colosseum','Pantheon','Forum Romanum','Capitoline Tepesi'], correct: 2 },
  { q: 'Julius Caesar\'ın Rubicon Nehrini geçmesi neyi sembolize ediyordu?', opts: ['Zafer kutlaması','Senatoya katılım','İç savaş başlatmak','Galya\'ya sefer'], correct: 2 },
  { q: 'Spartaküs hangi sınıfı temsil ediyordu?', opts: ['Patricii','Senato','Köleler ve Gladyatörler','Ordu generalleri'], correct: 2 },
];

const TIMELINE = [
  { year: 'MÖ 753', event: 'Roma\'nın Kuruluşu',      icon: '🏛️' },
  { year: 'MÖ 509', event: 'Cumhuriyete Geçiş',        icon: '📜' },
  { year: 'MÖ 450', event: '12 Levha Kanunu',           icon: '⚖️' },
  { year: 'MÖ 264', event: 'I. Pön Savaşı',             icon: '⚔️' },
  { year: 'MÖ 73',  event: 'Spartaküs İsyanı',          icon: '🔥' },
  { year: 'MÖ 44',  event: 'Caesar Suikastı',            icon: '🗡️' },
  { year: 'MÖ 27',  event: 'İmparatorluk',               icon: '👑' },
  { year: 'MS 476', event: 'Batı Roma\'nın Çöküşü',     icon: '💀' },
];

export default function RomePage() {
  const [openTablet, setOpenTablet] = useState<string | null>(null);
  const [quizQ, setQuizQ] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [answered, setAnswered] = useState<Record<number, number>>({});
  const [quizDone, setQuizDone] = useState(false);
  const [counts, setCounts] = useState({ y: 0, l: 0, r: 0, t: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  const countStarted = useRef(false);

  useEffect(() => {
    const el = statsRef.current; if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting || countStarted.current) return;
      countStarted.current = true;
      const targets = { y: 1229, l: 70, r: 5000, t: 12 };
      const dur = 1800; const start = performance.now();
      function step(now: number) {
        const t = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1 - t, 3);
        setCounts({ y: Math.floor(e * targets.y), l: Math.floor(e * targets.l), r: Math.floor(e * targets.r), t: Math.floor(e * targets.t) });
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  function answerQuiz(qi: number, selected: number) {
    if (answered[qi] !== undefined) return;
    const correct = QUIZ_Q[qi].correct;
    const isRight = selected === correct;
    setAnswered(prev => ({ ...prev, [qi]: selected }));
    if (isRight) setQuizScore(s => s + 1);
    setTimeout(() => {
      if (qi + 1 < QUIZ_Q.length) setQuizQ(qi + 1);
      else setQuizDone(true);
    }, 850);
  }

  function restartQuiz() { setQuizQ(0); setQuizScore(0); setAnswered({}); setQuizDone(false); }

  const quizResult = [
    { icon: '😅', title: 'İyi Denemeydi!', desc: 'Biraz daha çalış ve tekrar dene.' },
    { icon: '🏛️', title: 'Fena Değil!', desc: `${QUIZ_Q.length} sorudan ${quizScore} tanesini bildin.` },
    { icon: '🦅', title: 'Cumhuriyet Senatorü!', desc: `${QUIZ_Q.length} sorudan ${quizScore} tanesini bildin. Harika!` },
    { icon: '👑', title: 'İmparator Adayı!', desc: 'Tebrikler, Roma tarihini avucunun içi gibi biliyorsun!' },
    { icon: '👑', title: 'İmparator Adayı!', desc: 'Mükemmel! Senato seni onaylıyor.' },
  ][quizScore];

  return (
    <main className="main-content ro-page">

      {/* ── Topbar ── */}
      <div className="ro-topbar">
        <Link href="/" className="ro-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <span className="ro-topbar-title">Roma İmparatorluğu</span>
      </div>

      {/* ── Hero ── */}
      <header className="ro-hero">
        <div className="ro-spqr">S · P · Q · R</div>
        <h1 className="ro-hero-title">ROMA <span className="ro-gold">İMPARATORLUĞU</span></h1>
        <p className="ro-hero-sub">MÖ 753 — MS 476 · 1229 Yıllık Yükseliş ve Çöküş</p>
        <div className="ro-stats" ref={statsRef}>
          {[['Yıl', counts.y], ['Lejyon', counts.l], ['km Yol', counts.r], ['Tablet', counts.t]].map(([label, val]) => (
            <div key={label as string} className="ro-stat">
              <span className="ro-stat-num">{val}+</span>
              <span className="ro-stat-lbl">{label}</span>
            </div>
          ))}
        </div>
        <div className="ro-eagle">🦅</div>
      </header>

      {/* ── Timeline strip ── */}
      <div className="ro-tl-strip">
        {TIMELINE.map(t => (
          <div key={t.year} className="ro-tl-item">
            <div className="ro-tl-icon">{t.icon}</div>
            <div className="ro-tl-year">{t.year}</div>
            <div className="ro-tl-event">{t.event}</div>
          </div>
        ))}
      </div>

      {/* ArticleImage'ın slate varsayılanları bu sıcak paletle çakışır → altın/krem'e bağla. */}
      <div
        className="ro-body"
        style={{
          '--ai-caption': 'var(--ro-text)',
          '--ai-credit': 'var(--ro-muted)',
          '--ai-border': 'var(--ro-border)',
          '--ai-fill': 'rgba(197,160,40,0.06)',
          '--ai-mark': 'rgba(197,160,40,0.3)',
        } as React.CSSProperties}
      >

        {/* ══ BÖLÜM 1: Roma KRALLIĞI ══ */}
        <section className="ro-section">
            <div className="ro-section-badge">I</div>
            <h2 className="ro-h2">Roma Krallığı <span className="ro-chip">MÖ 753 – 509</span></h2>

            <h3 className="ro-h3">Kuruluş</h3>
            <div className="ro-two-col">
              <div>
                <p className="ro-p">Roma Krallığı, Roma'nın monarşi ile yönetildiği dönemdi. Kurucuları efsaneye göre bir nehre bırakılan ve bir dişi kurt tarafından emzirilen <strong className="ro-gold">Romulus ve Remus</strong> kardeşlerdi. Babaları savaş tanrısı <strong className="ro-gold">Mars</strong>, anneleri ise rahibe Rhea Silvia'dır.</p>
                <p className="ro-p">İlk kurulduğunda Latinlerden oluşan küçük bir krallıktı. Kurulduğu bölge Latium, Etrüsk krallığının topraklarıydı; mimari tekniklerinden tanrılarına kadar çoğu özelliği Etrüsklerden miras aldılar.</p>
                <p className="ro-p">Romalılar pratik ve disiplinli bir kültüre sahipti. Krallığın yükselişi civar kabileleri bünyeye katmaları ve kanlı savaşları sayesinde oldu. Augustus döneminin tarihçisi Varro'nun hesaplamalarına göre kuruluş tarihi <strong className="ro-gold">MÖ 753</strong>'e karşılık gelmektedir.</p>
              </div>
              <div className="ro-founding-card">
                <ArticleImage
                  className="!my-0"
                  src="/articles/rome/kapitol-kurdu.webp"
                  ratio="1600 / 1042"
                  priority
                  alt="Bronz dişi kurt heykeli, yandan; dişlerini göstererek geriliyor. Altında ona doğru uzanan, emmek üzere olan iki çıplak bebek figürü."
                  caption="Kapitol Kurdu. Uzun süre Etrüsk işi sanıldı; 2007'de yapılan radyokarbon tarihlemesi Orta Çağ'ı işaret edince tartışma açıldı. İkizlerse zaten sonradan: 15. yüzyılda eklendiler."
                  credit="Kamu malı · CC0"
                />
                <details style={{ marginTop: 12 }}>
                  <summary style={{ cursor: 'pointer', fontSize: '0.82rem', color: '#c5a028', fontWeight: 700 }}>Latinler hakkında</summary>
                  <p style={{ fontSize: '0.8rem', color: '#9a8c70', marginTop: 8, lineHeight: 1.6 }}>Lazio bölgesinde iskan eden, ortak dili Latince olan halktır. İlerleyen yüzyıllarda Roma'nın en büyük düşmanları bile bu nüfusa katılacaktı.</p>
                </details>
              </div>
            </div>

            <h3 className="ro-h3">Siyasi Yapı ve Yönetim Şekli</h3>
            <p className="ro-p">Roma Senatosu krallıktan imparatorluğa kadar her dönemde kullanılan başlıca yönetim sistemidir. Savaş zamanlarında kralı diktatör ilan edebilir ya da savaşı kendileri idare edebilirler. "Yaşlılar meclisi" anlamına gelen bu yapı ilk kurulduğunda 100 kişiden oluşurken sonraki imparatorlar tarafından 300 kişiye çıkarıldı.</p>

            {/* Toplumsal hiyerarşi */}
            <div className="ro-pyramid-wrap">
              <div className="ro-pyramid">
                {['⚖️ Kral / Diktatör','🏛️ Patricii · Soylular','🌾 Plebler · Halk','⛓️ Köleler · Göçmenler'].map((level, i) => (
                  <div key={i} className={`ro-pyr-level ro-pyr-${i + 1}`}><span>{level}</span></div>
                ))}
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#9a8c70', marginTop: 12 }}>Roma toplumsal hiyerarşisi</p>
            </div>

            {/* Patricii vs Plebler */}
            <div className="ro-vs-row">
              <div className="ro-class-card ro-patricii">
                <div className="ro-class-icon">👑</div>
                <h4>Patricii — Soylular</h4>
                <ul className="ro-class-list">
                  <li>Senato üyeliği hakkı</li>
                  <li>Tapınak ve kamu binalarının sahibi</li>
                  <li>Orduya subay olarak girebilir</li>
                  <li>Din görevlisi olabilir</li>
                  <li>Yüksek memuriyetlere atanır</li>
                </ul>
              </div>
              <div className="ro-vs-label">VS</div>
              <div className="ro-class-card ro-plebler">
                <div className="ro-class-icon">🌾</div>
                <h4>Plebler — Halk</h4>
                <ul className="ro-class-list">
                  <li>Senato'ya giremezdi</li>
                  <li>Patricii ile evlenemezdi</li>
                  <li>Orduya asker olarak alınmazdı</li>
                  <li>Din görevlisi olamazdı</li>
                  <li>12 Levha Kanunu'nu kazandılar</li>
                </ul>
              </div>
            </div>

            {/* 12 Levha */}
            <h3 className="ro-h3" style={{ marginTop: 48 }}>⚖️ 12 Levha Kanunu <span className="ro-chip">MÖ 450</span></h3>
            <div className="ro-intro-card">
              <p className="ro-p" style={{ margin: 0 }}>MÖ 450'de başlanıp 2 yılda tamamlanan bu yasalar şehrin en büyük meydanı <strong className="ro-gold">Forum Romanum</strong>'a asıldı. Böylece yüzyıllardır zengin ve güçlü olan patriciiler, fakir ve hakkı savunulmayan plebler ile resmi bir eşitlik ilkesini benimsemek zorunda kaldı. Maddeler, o zamana kadar uygulanan örf ve adetlerin yazıya dökülmüş halidir.</p>
            </div>
            <div className="ro-tablets">
              {tablets.map(t => (
                <div key={t.num} className="ro-tablet">
                  <button className="ro-tablet-hdr" onClick={() => setOpenTablet(openTablet === t.num ? null : t.num)}>
                    <span className="ro-tablet-num">{t.num}</span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div className="ro-tablet-title">{t.title}</div>
                      <div className="ro-tablet-summary">{t.summary}</div>
                    </div>
                    <span style={{ color: '#c5a028', fontSize: '1.2rem', transform: openTablet === t.num ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>›</span>
                  </button>
                  {openTablet === t.num && (
                    <ol className="ro-tablet-laws">
                      {t.laws.map((law, i) => <li key={i}>{law}</li>)}
                    </ol>
                  )}
                </div>
              ))}
            </div>
        </section>

        {/* ══ BÖLÜM 2: CUMHURİYET ══ */}
        <section className="ro-section">
            <div className="ro-section-badge">II</div>
            <h2 className="ro-h2">Roma Cumhuriyeti <span className="ro-chip">MÖ 509 – 27</span></h2>

            <p className="ro-p">Roma Krallığı'nın son imparatoru <strong className="ro-gold">Lucius Tarquinius Superbus</strong>'un tahttan indirilmesiyle MÖ 509'da cumhuriyete geçildi. Romalılar barbarları dışarıda tutmak için mükemmele yakın duvarlar inşa etti, dümdüz yollar yaptı; cumhuriyet, savaşta cesur davranan askerlerine arazi kazandırıyordu. Cumhuriyetin Akdeniz'e açılmasının önündeki en büyük engel ise, üç kanlı <Link href="/articles/carthage" className="article-ilink">Pön Savaşları'nda karşı karşıya geldiği Kartaca</Link> oldu.</p>

            <ArticleImage
              src="/articles/rome/senato-cicero.webp"
              ratio="1600 / 1042"
              alt="Fresk: yarım daire hâlinde oturan togalı senatörler; ayakta duran Cicero elini uzatarak konuşuyor, karşısında tek başına oturan Catilina kimsenin oturmadığı sıraya çekilmiş."
              caption="Cumhuriyet'in kalbi Senato'ydu. Cesare Maccari 1880'de Cicero'nun Catilina'yı suçlayışını böyle hayal etti — 1900 yıl sonra, tek bir görgü tanığı olmadan."
              credit="Cesare Maccari · kamu malı"
            />

            <h3 className="ro-h3">Jül Sezar'ın Yükselişi</h3>
            <p className="ro-p">Cumhuriyet'i bitiren şey bir ordu değil, bir adamdı: Galya'yı kanla Roma'ya katan, Rubicon'u tek lejyonla geçen ve sonunda kendisini öldürecek adamların neredeyse hepsini bizzat affetmiş olan <Link href="/articles/sezar" className="article-ilink">Julius Caesar</Link>.</p>
            <ArticleImage
              src="/articles/rome/caesar-portre.webp"
              ratio="1600 / 2132"
              alt="Gri taştan bir büst: kısa saçlı, çökük yanaklı, uzun boyunlu, kırışık alınlı yaşlıca bir adam; bakışları yana dönük."
              caption="Tusculum portresi — Caesar'ın bilinen tek çağdaş büstü, yani onu görmüş birinin elinden. Filmlerdeki muzaffer çeneyi değil, yorgun ve zayıf bir adamı gösteriyor."
              credit="Ángel M. Felicísimo · kamu malı"
            />
            <div className="ro-caesar-tl">
              {caesarSteps.map((s, i) => (
                <div key={i} className="ro-cstep">
                  <div className="ro-cstep-icon">{s.icon}</div>
                  <div className="ro-cstep-body">
                    <h4 className="ro-cstep-title">{s.step}</h4>
                    <p className="ro-cstep-desc">{s.desc}</p>
                  </div>
                  {i < caesarSteps.length - 1 && <div className="ro-cstep-arrow">↓</div>}
                </div>
              ))}
            </div>

            <h3 className="ro-h3" style={{ marginTop: 48 }}>Önemli İsimler</h3>
            <div className="ro-figures">
              {figures.map(f => (
                <div key={f.name} className="ro-figure">
                  <div className="ro-figure-emoji">{f.emoji}</div>
                  <div className="ro-figure-era">{f.era}</div>
                  <h4 className="ro-figure-name">{f.name}</h4>
                  <div className="ro-figure-role">{f.role}</div>
                  <p className="ro-figure-desc">{f.desc}</p>
                </div>
              ))}
            </div>
        </section>

        {/* ══ BÖLÜM 3: İMPARATORLUK ══ */}
        <section className="ro-section">
            <div className="ro-section-badge">III</div>
            <h2 className="ro-h2">Roma İmparatorluğu <span className="ro-chip">MÖ 27 – MS 476</span></h2>

            <div className="ro-two-col">
              <div>
                <p className="ro-p">Romalı imparatorlar kendilerini <em className="ro-gold">orbis terrarum</em>'u (tüm dünyayı) yönettiklerini söylüyor, yalnızca en güçlü tanrıları Jüpiter'e hesap verdiklerini düşünüyorlardı.</p>
                <p className="ro-p">Roma İmparatorluğu, Akdeniz bölgesinin en güçlü devletiydi. Adalet sistemi ve güçlü iaşe düzeniyle çevre devletlere örnek oldu.</p>
              </div>
              <div className="ro-colosseum">
                <ArticleImage
                  className="!mt-0 !mb-4"
                  src="/articles/rome/kolezyum.webp"
                  ratio="1600 / 947"
                  alt="Havadan çekilmiş fotoğraf: dört katlı kemerlerden oluşan devasa eliptik amfitiyatro; üst kısmı yer yer yıkık, arkasında Forum harabeleri ve modern şehir."
                  caption="Colosseum — MS 72'de başlandı. Arkasındaki harabeler Forum: Roma'nın kalbi."
                  credit="Wilfredor · CC0"
                />
                <div className="ro-col-facts">
                  <span>50,000 seyirci kapasitesi</span>
                  <span>80 kapı girişi</span>
                  <span>6 yılda inşa edildi</span>
                </div>
              </div>
            </div>

            {/* Pax Romana */}
            <h3 className="ro-h3">Pax Romana — Roma Barışı <span className="ro-chip">MÖ 27 – MS 180</span></h3>
            <div className="ro-intro-card">
              <p className="ro-p" style={{ margin: 0 }}>Augustus ile başlayan yaklaşık <strong className="ro-gold">200 yıllık</strong> bu dönem, Akdeniz dünyasının görece barış, istikrar ve refah yaşadığı çağdır. Akdeniz artık tümüyle Roma'nın iç denizi — <em className="ro-gold">Mare Nostrum</em> (Bizim Deniz) — olmuştu. Güvenli yollar ve ortak para birimi sayesinde <Link href="/articles/ekonomi" className="article-ilink">ticaret ve para ekonomisi</Link> patladı, şehirler büyüdü ve Roma'nın nüfusu bir milyonu aştı.</p>
            </div>
            <ArticleImage
              src="/articles/rome/augustus-prima-porta.webp"
              ratio="1500 / 2250"
              alt="Beyaz mermer heykel: zırhlı bir adam ayakta, sağ kolunu ileri kaldırmış konuşur gibi; zırhında kabartma sahneler, ayağının dibinde yunus üstünde küçük bir çocuk figürü, çıplak ayak."
              caption={<><Link href="/articles/augustus" className="article-ilink">Augustus</Link>, Prima Porta heykeli. Kırk yaşını geçmişken kendini böyle, hiç yaşlanmayan bir genç olarak yontturdu — ve çıplak ayakla: Romalılar bunu tanrılar için yapardı.</>}
              credit="Till Niermann · kamu malı"
            />

            {/* İmparatorlar galerisi */}
            <h3 className="ro-h3" style={{ marginTop: 40 }}>İmparatorlar Galerisi</h3>
            <div className="ro-figures">
              {emperors.map(f => (
                <div key={f.name} className="ro-figure">
                  <div className="ro-figure-emoji">{f.emoji}</div>
                  <div className="ro-figure-era">{f.era}</div>
                  <h4 className="ro-figure-name">{f.name}</h4>
                  <div className="ro-figure-role">{f.role}</div>
                  <p className="ro-figure-desc">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Mühendislik mirası */}
            <h3 className="ro-h3" style={{ marginTop: 48 }}>Roma'nın Mühendislik Mirası</h3>
            <div className="ro-figures">
              {achievements.map(a => (
                <div key={a.title} className="ro-figure">
                  <div className="ro-figure-emoji">{a.icon}</div>
                  <h4 className="ro-figure-name">{a.title}</h4>
                  <p className="ro-figure-desc">{a.desc}</p>
                </div>
              ))}
            </div>
            <ArticleImage
              src="/articles/rome/pont-du-gard.webp"
              ratio="1600 / 617"
              alt="Nehir üzerinde üç kat kemerden oluşan devasa taş köprü; alt katta geniş kemerler, en üstte küçük ve sık kemerlerden oluşan sıra. Kireçtaşı sarımsı, gökyüzü açık."
              caption="Pont du Gard (Fransa). Üst sıradaki o küçük kemerler bir su kanalı taşır: 50 kilometre boyunca metrede sadece 1 santim alçalır. Harç yok — taşlar kendi ağırlığıyla duruyor."
              credit="Benh Lieu Song · CC BY-SA 3.0"
            />
            <ArticleImage
              src="/articles/rome/pantheon-kubbe.webp"
              ratio="1600 / 1369"
              alt="Aşağıdan yukarı bakış: kaset denen kare girintilerle bezeli yarım küre kubbe, tepesinde açık yuvarlak bir delikten gökyüzü ve gün ışığı giriyor."
              caption="Pantheon'un kubbesi: 2000 yıl sonra hâlâ dünyanın en büyük donatısız beton kubbesi. Tepedeki delik (oculus) açıktır — yağmur içeri yağar, zemindeki gizli kanallar akıtır."
              credit="Wilfredor · CC0"
            />
            <ArticleImage
              src="/articles/rome/via-appia.webp"
              ratio="1600 / 1200"
              alt="İki yanı çam ağaçlarıyla çevrili, düzensiz büyük bazalt taşlarla döşenmiş dar antik yol; taşlar aşınmış ve yer yer çukurlaşmış."
              caption="Via Appia, MÖ 312'de döşendi. Bu taşların üzerinde hâlâ yürünüyor — 2300 yıldır."
              credit="Larry (Charlottetown) · CC BY 2.0"
            />

            {/* Bölünme ve Çöküş */}
            <h3 className="ro-h3" style={{ marginTop: 48 }}>Bölünme ve Çöküş <span className="ro-chip">MS 395 – 476</span></h3>
            <div className="ro-two-col">
              <div>
                <p className="ro-p">MS 395'te İmparator I. Theodosius, imparatorluğu iki oğlu arasında kalıcı biçimde <strong className="ro-gold">Doğu</strong> ve <strong className="ro-gold">Batı Roma</strong> olarak böldü. Sınırlardaki baskı, ekonomik bunalım, salgınlar ve iç çekişmeler Batı'yı giderek zayıflattı.</p>
                <p className="ro-p">Kavimler Göçü ile gelen Germen kabileleri sınırları zorladı; Roma MS 410'da Vizigotlar, MS 455'te Vandallar tarafından yağmalandı. Son Batı Roma imparatoru <strong className="ro-gold">Romulus Augustulus</strong>, MS 476'da Germen komutan Odoacer tarafından tahttan indirildi — bu tarih geleneksel olarak Batı Roma'nın sonu kabul edilir.</p>
                <p className="ro-p">Ancak <Link href="/articles/turkler" className="article-ilink"><strong className="ro-gold">Doğu Roma (Bizans)</strong></Link> İmparatorluğu, başkenti Konstantinopolis'te bin yıl daha yaşadı ve nihayet MS <strong className="ro-gold">1453</strong>'te İstanbul'un fethiyle tarihe karıştı.</p>
              </div>
              <div className="ro-colosseum">
                <ArticleImage
                  className="!mt-0 !mb-4"
                  src="/articles/rome/forum-romanum.webp"
                  ratio="1600 / 582"
                  alt="Geniş panorama: harabe hâlinde tapınak kalıntıları, ayakta kalmış tek tek sütunlar, temel taşları ve patikalar; arkada kubbeli kiliseler ve şehir."
                  caption="Forum Romanum bugün. Cicero'nun konuştuğu, Caesar'ın yakıldığı meydan."
                  credit="BeBo86 · CC BY-SA 3.0"
                />
                <div className="ro-col-facts">
                  <span>MS 395 — Doğu-Batı bölünmesi</span>
                  <span>MS 410 — Roma'nın yağmalanması</span>
                  <span>MS 476 — Son imparator devrildi</span>
                  <span>MS 1453 — Doğu Roma'nın sonu</span>
                </div>
              </div>
            </div>

            {/* Quiz */}
            <div style={{ marginTop: 48 }}>
              <h3 className="ro-h3" style={{ textAlign: 'center' }}>⚔️ Forum Romanum Testi</h3>
              <p style={{ textAlign: 'center', fontSize: '0.88rem', color: '#9a8c70', marginBottom: 28 }}>Roma bilgini sına</p>
              <div className="ro-quiz">
                {!quizDone ? (
                  <>
                    <div className="ro-quiz-progress">
                      <span className="ro-quiz-counter">SORU {quizQ + 1} / {QUIZ_Q.length}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {QUIZ_Q.map((_, i) => {
                          const ans = answered[i];
                          const color = ans === undefined ? 'rgba(197,160,40,0.2)' : ans === QUIZ_Q[i].correct ? '#22c55e' : '#ef4444';
                          return <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i === quizQ && ans === undefined ? '#c5a028' : color, transition: 'background 0.3s' }} />;
                        })}
                      </div>
                    </div>
                    <p className="ro-quiz-q">{QUIZ_Q[quizQ].q}</p>
                    <div className="ro-quiz-opts">
                      {QUIZ_Q[quizQ].opts.map((opt, oi) => {
                        const ans = answered[quizQ];
                        const correct = QUIZ_Q[quizQ].correct;
                        let bg = 'rgba(255,255,255,0.03)', border = 'rgba(197,160,40,0.2)', color = '#e8dfc8';
                        if (ans !== undefined) {
                          if (oi === correct) { bg = 'rgba(34,197,94,0.15)'; border = '#22c55e'; color = '#86efac'; }
                          else if (oi === ans) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; color = '#fca5a5'; }
                        }
                        return (
                          <button key={oi} disabled={ans !== undefined} onClick={() => answerQuiz(quizQ, oi)}
                            style={{ width: '100%', textAlign: 'left', padding: '13px 16px', border: `1px solid ${border}`, borderRadius: 10, background: bg, color, cursor: ans !== undefined ? 'default' : 'pointer', fontSize: '0.88rem', fontFamily: 'inherit', lineHeight: 1.4, transition: 'all 0.15s' }}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>{quizResult.icon}</div>
                    <h4 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#c5a028', marginBottom: 8 }}>{quizResult.title}</h4>
                    <p style={{ fontSize: '0.9rem', color: '#9a8c70', marginBottom: 20, lineHeight: 1.6 }}>{quizResult.desc}</p>
                    <button onClick={restartQuiz} className="ro-btn">Tekrar Dene</button>
                  </div>
                )}
              </div>
            </div>
        </section>

      </div>

      {/* ── Footer ── */}
      <ArticleBibliography items={refs} accent="#c5a028" />

      <footer className="ro-footer">
        <div style={{ fontSize: '2rem' }}>🦅</div>
        <div className="ro-footer-spqr">SENATUS POPULUSQUE ROMANUS</div>
        <p>Hazırlayan: <strong>Kaan Çoban</strong></p>
      </footer>

      <style>{`
        .ro-page {
          --ro-bg:     #0f0c08;
          --ro-surf:   #1a1510;
          --ro-gold:   #c5a028;
          --ro-border: rgba(197,160,40,0.2);
          --ro-text:   #e8dfc8;
          --ro-muted:  #9a8c70;
          background: var(--ro-bg);
          color: var(--ro-text);
          min-height: 100vh;
          font-family: 'Georgia', serif;
        }

        /* Topbar */
        .ro-topbar {
          position: sticky; top: 0; z-index: 40;
          background: rgba(15,12,8,0.94);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--ro-border);
          padding: 10px 16px;
          display: flex; align-items: center; gap: 12px;
        }
        .ro-back {
          color: var(--ro-text); text-decoration: none;
          display: flex; padding: 6px; border-radius: 50%;
          transition: background 0.15s; flex-shrink: 0;
        }
        .ro-back:hover { background: rgba(255,255,255,0.06); }
        .ro-topbar-title { font-weight: 700; font-size: 0.9rem; color: var(--ro-gold); flex-shrink: 0; }

        /* Hero */
        .ro-hero {
          text-align: center; padding: 52px 20px 40px;
          background: radial-gradient(ellipse at 50% 0%, rgba(197,160,40,0.08) 0%, transparent 60%);
        }
        .ro-spqr { font-size: 0.7rem; font-weight: 800; letter-spacing: 0.3em; color: var(--ro-gold); margin-bottom: 14px; }
        .ro-hero-title { font-size: clamp(2rem,8vw,5rem); font-weight: 900; margin: 0 0 12px; letter-spacing: 0.06em; line-height: 1.1; }
        .ro-gold { color: var(--ro-gold); }
        .ro-hero-sub { font-size: clamp(0.8rem,2vw,1rem); color: var(--ro-muted); margin: 0 0 28px; }
        .ro-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 2px; border: 1px solid var(--ro-border); border-radius: 14px;
          overflow: hidden; max-width: 640px; margin: 0 auto 24px;
        }
        .ro-stat {
          padding: 20px 12px; text-align: center;
          background: rgba(197,160,40,0.04);
          border-right: 1px solid var(--ro-border);
          display: flex; flex-direction: column; gap: 4px;
        }
        .ro-stat:last-child { border-right: none; }
        .ro-stat-num { font-size: clamp(1.4rem,3vw,2.2rem); font-weight: 900; color: var(--ro-gold); line-height: 1; }
        .ro-stat-lbl { font-size: 0.7rem; color: var(--ro-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
        .ro-eagle { font-size: 2rem; }

        /* Timeline strip */
        .ro-tl-strip {
          display: flex; gap: 0; overflow-x: auto; scrollbar-width: thin;
          border-top: 1px solid var(--ro-border); border-bottom: 1px solid var(--ro-border);
          padding: 0; scroll-snap-type: x mandatory;
        }
        .ro-tl-strip::-webkit-scrollbar { height: 3px; }
        .ro-tl-strip::-webkit-scrollbar-thumb { background: rgba(197,160,40,0.3); border-radius: 2px; }
        .ro-tl-item {
          flex: 0 0 auto; display: flex; flex-direction: column; align-items: center;
          gap: 4px; padding: 14px 16px; text-align: center;
          border-right: 1px solid var(--ro-border); min-width: 110px;
        }
        .ro-tl-icon { font-size: 1.3rem; }
        .ro-tl-year { font-size: 0.65rem; font-weight: 800; color: var(--ro-gold); letter-spacing: 0.06em; }
        .ro-tl-event { font-size: 0.7rem; color: var(--ro-muted); }

        /* Body */
        .ro-body { padding: 0 16px 60px; }
        .ro-section { max-width: 900px; margin: 0 auto; padding-top: 36px; }
        .ro-section-badge {
          width: 36px; height: 36px; border-radius: 50%;
          border: 2px solid var(--ro-gold); color: var(--ro-gold);
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 0.9rem; margin-bottom: 12px;
        }
        .ro-h2 { font-size: clamp(1.2rem,3vw,1.8rem); color: var(--ro-gold); margin: 0 0 24px; }
        .ro-h3 { font-size: 1.1rem; font-weight: 700; color: var(--ro-gold); margin: 32px 0 12px; border-left: 3px solid var(--ro-gold); padding-left: 12px; }
        .ro-chip { font-size: 0.7rem; border: 1px solid var(--ro-border); border-radius: 6px; padding: 2px 8px; color: var(--ro-muted); font-weight: 400; vertical-align: middle; margin-left: 8px; }
        .ro-p { font-size: 0.92rem; line-height: 1.75; color: var(--ro-text); margin-bottom: 14px; }
        .ro-intro-card { background: rgba(197,160,40,0.06); border: 1px solid var(--ro-border); border-radius: 14px; padding: 18px 20px; margin-bottom: 20px; }

        /* Two col */
        .ro-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; margin-bottom: 24px; }
        .ro-founding-card {
          background: var(--ro-surf); border: 1px solid var(--ro-border); border-radius: 16px;
          padding: 24px; text-align: center;
        }

        /* Pyramid */
        .ro-pyramid-wrap { margin: 20px 0 28px; }
        .ro-pyramid { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .ro-pyr-level {
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 0.82rem; font-weight: 600;
          border-radius: 6px; padding: 10px 16px;
        }
        .ro-pyr-1 { width: 40%; background: #8b1a1a; }
        .ro-pyr-2 { width: 60%; background: #5a3a00; }
        .ro-pyr-3 { width: 78%; background: #1a3a1a; }
        .ro-pyr-4 { width: 96%; background: #1a1a3a; color: #8090a8; }

        /* Patricii vs Plebler */
        .ro-vs-row { display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: start; margin: 24px 0; }
        .ro-vs-label { align-self: center; font-size: 1.2rem; font-weight: 900; color: var(--ro-gold); }
        .ro-class-card { background: var(--ro-surf); border: 1px solid var(--ro-border); border-radius: 14px; padding: 20px; }
        .ro-patricii { border-color: rgba(197,160,40,0.4); }
        .ro-plebler  { border-color: rgba(100,130,180,0.3); }
        .ro-class-icon { font-size: 2rem; margin-bottom: 8px; }
        .ro-class-card h4 { font-size: 0.9rem; font-weight: 700; color: var(--ro-gold); margin: 0 0 12px; }
        .ro-class-list { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 6px; }
        .ro-class-list li { font-size: 0.8rem; color: var(--ro-muted); line-height: 1.4; }

        /* Tablets */
        .ro-tablets { display: flex; flex-direction: column; gap: 6px; }
        .ro-tablet { border: 1px solid var(--ro-border); border-radius: 10px; overflow: hidden; }
        .ro-tablet-hdr {
          width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 16px;
          background: rgba(197,160,40,0.04); border: none; cursor: pointer; font-family: inherit; color: var(--ro-text);
          transition: background 0.15s;
        }
        .ro-tablet-hdr:hover { background: rgba(197,160,40,0.08); }
        .ro-tablet-num { width: 28px; height: 28px; border-radius: 50%; background: var(--ro-gold); color: #0f0c08; font-weight: 900; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ro-tablet-title { font-size: 0.88rem; font-weight: 700; color: var(--ro-gold); text-align: left; }
        .ro-tablet-summary { font-size: 0.74rem; color: var(--ro-muted); text-align: left; margin-top: 2px; }
        .ro-tablet-laws { margin: 0; padding: 12px 16px 16px 56px; display: flex; flex-direction: column; gap: 8px; list-style: decimal; }
        .ro-tablet-laws li { font-size: 0.8rem; color: var(--ro-muted); line-height: 1.55; }

        /* Caesar timeline */
        .ro-caesar-tl { display: flex; flex-direction: column; gap: 0; margin-top: 20px; }
        .ro-cstep {
          display: grid; grid-template-columns: 48px 1fr; gap: 12px;
          position: relative; padding-bottom: 8px;
        }
        .ro-cstep-icon {
          width: 44px; height: 44px; border-radius: 50%;
          background: var(--ro-surf); border: 2px solid var(--ro-border);
          display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;
        }
        .ro-cstep-body { background: var(--ro-surf); border: 1px solid var(--ro-border); border-radius: 12px; padding: 14px 16px; margin-bottom: 8px; }
        .ro-cstep-title { font-size: 0.9rem; font-weight: 700; color: var(--ro-gold); margin: 0 0 6px; }
        .ro-cstep-desc  { font-size: 0.82rem; color: var(--ro-muted); line-height: 1.55; margin: 0; }
        .ro-cstep-arrow { grid-column: 1; text-align: center; font-size: 1.2rem; color: var(--ro-border); margin-bottom: 4px; }

        /* Figures */
        .ro-figures { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-top: 16px; }
        .ro-figure { background: var(--ro-surf); border: 1px solid var(--ro-border); border-radius: 14px; padding: 18px; transition: border-color 0.2s; }
        .ro-figure:hover { border-color: rgba(197,160,40,0.4); }
        .ro-figure-emoji { font-size: 2rem; margin-bottom: 6px; }
        .ro-figure-era   { font-size: 0.7rem; font-weight: 800; color: var(--ro-gold); letter-spacing: 0.08em; margin-bottom: 4px; }
        .ro-figure-name  { font-size: 0.95rem; font-weight: 800; color: var(--ro-gold); margin: 0 0 2px; }
        .ro-figure-role  { font-size: 0.74rem; color: var(--ro-muted); margin-bottom: 8px; }
        .ro-figure-desc  { font-size: 0.8rem; color: var(--ro-text); line-height: 1.55; margin: 0; }

        /* Colosseum */
        .ro-colosseum { background: var(--ro-surf); border: 1px solid var(--ro-border); border-radius: 16px; padding: 24px; text-align: center; }
        .ro-col-facts { display: flex; flex-direction: column; gap: 4px; margin-top: 14px; font-size: 0.78rem; color: var(--ro-muted); }

        /* Quiz */
        .ro-quiz { background: var(--ro-surf); border: 1px solid var(--ro-border); border-radius: 18px; padding: 28px; max-width: 620px; margin: 0 auto; }
        .ro-quiz-progress { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .ro-quiz-counter { font-size: 0.76rem; font-weight: 800; color: var(--ro-gold); letter-spacing: 0.08em; }
        .ro-quiz-q { font-size: 0.98rem; font-weight: 600; line-height: 1.6; margin-bottom: 18px; color: var(--ro-text); }
        .ro-quiz-opts { display: flex; flex-direction: column; gap: 8px; }
        .ro-btn { background: var(--ro-gold); border: none; border-radius: 20px; color: #0f0c08; font-weight: 700; font-size: 0.88rem; padding: 10px 24px; cursor: pointer; font-family: inherit; transition: opacity 0.15s; }
        .ro-btn:hover { opacity: 0.85; }

        /* Footer */
        .ro-footer { text-align: center; padding: 48px 20px; border-top: 1px solid var(--ro-border); color: var(--ro-muted); font-size: 0.82rem; }
        .ro-footer-spqr { font-size: 0.72rem; font-weight: 800; letter-spacing: 0.25em; color: var(--ro-gold); margin: 8px 0 12px; }

        /* Responsive */
        @media (max-width: 640px) {
          .ro-two-col { grid-template-columns: 1fr; }
          .ro-vs-row { grid-template-columns: 1fr; }
          .ro-vs-label { display: none; }
          .ro-stats { grid-template-columns: repeat(2, 1fr); }
          .ro-figures { grid-template-columns: 1fr 1fr; }
          .ro-pyr-1 { width: 55%; } .ro-pyr-2 { width: 70%; } .ro-pyr-3 { width: 85%; } .ro-pyr-4 { width: 100%; }
        }
        @media (max-width: 400px) {
          .ro-figures { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
