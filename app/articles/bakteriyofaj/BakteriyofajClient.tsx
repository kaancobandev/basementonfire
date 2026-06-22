'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';

/* ════════════════════════ VERİ ════════════════════════ */

const infectionSteps = [
  { t: 'Tanıma & Bağlanma', d: `Kuyruk lifleri, bakteri yüzeyindeki belirli reseptör moleküllerini bir anahtarın kilide oturması gibi yoklar. Doğru reseptör yoksa faj içeri giremez — fajı türe özgü yapan şey tam da budur.` },
  { t: 'Kasılma & Enjeksiyon', d: `Bağlanma gerçekleşince kuyruk bir şırınga gibi kasılır ve fajın DNA'sı bakterinin içine zerk edilir. Boş protein kabuk dışarıda asılı kalır.` },
  { t: 'Komutayı Ele Geçirme', d: `İçeri giren genetik kod artık patrondur. Bakterinin tüm hücresel makinesini gasp eder ve onu yalnızca kendi kopyalarını üretmeye zorlar.` },
  { t: 'Seri Üretim (Montaj)', d: `Yeni kapsidler, kuyruklar ve DNA kopyaları bir üretim bandındaki gibi birleştirilir. Hücrenin içi yüzlerce yeni fajla dolar.` },
  { t: 'Liziz (Patlama)', d: `Lizin adlı bir enzim bakteri duvarını içeriden patlatır. Hücre parçalanır; 50–200 yeni faj saçılır ve komşu bakterilere saldırır. Tüm döngü 20–40 dakikada biter.` },
];

const advantages = [
  ['🎯', 'Cerrahi hassasiyet', `Geniş etkili antibiyotik, hedefle birlikte bağırsaktaki dost bakterileri de katleder. Faj ise yalnızca hedef türü öldürür, mikrobiyomun geri kalanına dokunmaz — "halı bombardımanı" değil, "akıllı bomba".`],
  ['📈', 'Kendi dozunu üretir', `Antibiyotik dozu zamanla azalır. Faj ise hedef bakteri bulduğu sürece çoğalmayı sürdürür — yani kendi dozunu artıran canlı bir ilaçtır. Bakteri tükenince faj da ortamdan kendiliğinden temizlenir.`],
  ['🧬', 'Birlikte evrimleşme', `Antibiyotik sabit bir moleküldür; faj ise uyum sağlayan bir avcı. Üstelik bakteri faja direnç kazanmak için çoğu zaman fajın bağlandığı reseptörü değiştirmek zorunda kalır — bu değişim de onu antibiyotiklere yeniden duyarlı yapar (evrimsel ödünleşme).`],
  ['🛡️', 'Biyofilme nüfuz', `Bazı fajlar, bakterilerin antibiyotiklerden korunmak için ördüğü yapışkan kalkanları (biyofilmleri) parçalayan enzimler üretir.`],
];

const challenges = [
  ['🔬', 'Dar konak aralığı', `En büyük güç, aynı zamanda en büyük engel: bir faj genelde tek bir suşu öldürür. Önce hastanın suşunu belirleyip ona uygun fajı bulmak gerekir — güçlü ama yavaş bir "kişiye özel tıp". Çözüm: birçok faj karıştırılan faj kokteylleri.`],
  ['🦠', 'Bağışıklık yanıtı', `Faj de bir virüstür; vücut onu yabancı görüp temizleyebilir. Bu durum, özellikle uzun süreli tedavilerde etkinliği azaltabilir.`],
  ['📋', 'Düzenleyici sistem', `İlaç onayı "tek ilaç, tek hastalık, tek onay" üzerine kurulu. Oysa her hastaya farklı, canlı ve değişen bir faj verilebilir. Bu yüzden Batı'da fajlar çoğunlukla "şefkat amaçlı kullanım" (son çare) kapsamında uygulanıyor.`],
];

const cases = [
  { y: '2016', t: 'Tom Patterson', s: 'Acinetobacter baumannii', d: `San Diego'lu psikiyatri profesörü, Mısır'da tatildeyken çoklu ilaca dirençli bir enfeksiyon kapıp komaya girdi. Hiçbir antibiyotik işe yaramıyordu. Epidemiyolog eşi Steffanie Strathdee, dünya çapında laboratuvarlardan kocasını öldüren bakteriyi hedefleyen fajları topladı. Damardan verilen kokteylle hasta birkaç günde komadan çıktı — ABD'de damar yoluyla faj terapisinin ilk büyük başarısı.` },
  { y: '2019', t: 'Isabelle Carnell-Holdaway', s: 'Mycobacterium abscessus', d: `Londra Great Ormond Street Hastanesi'nde kistik fibrozlu genç, akciğer nakli sonrası dirençli bir enfeksiyon kaptı. Doktorlar, onu hedefleyen fajları genetik olarak değiştirip öldürücü hale getirdi — mühendislik ürünü fajların bir hastada kullanıldığı ilk vakalardan biri. Kız iyileşti.` },
  { y: 'Bugün', t: '100 vaka & CRISPR-faj', s: 'Pirnay · Locus Biosciences', d: `Belçika Queen Astrid Askeri Hastanesi'nden Dr. Jean-Paul Pirnay'in koordine ettiği 100 ardışık vakada, özellikle fajlar antibiyotiklerle birleştirildiğinde hastaların %77'sinde klinik iyileşme görüldü. Locus Biosciences ise idrar yolu E. coli'sini hedefleyen, CRISPR-Cas3 ile silahlandırılmış bir faj (LBP-EC01) geliştirdi: iki bakteriyel silah birleşip insanlığın hizmetine girdi.` },
];

const beyond = [
  ['🧪', 'Hershey–Chase, 1952', `Fajlarla yapılan ünlü deney, kalıtsal materyalin protein değil DNA olduğunu kanıtladı — modern genetiğin başlangıç noktası. Max Delbrück'ün öncülük ettiği "Faj Grubu", moleküler biyolojiyi bir bilim dalı olarak kurdu.`],
  ['🔎', 'Faj gösterimi (phage display)', `İstenen proteinler fajın yüzeyinde sergilenip milyonlarca varyant arasından en iyi bağlanan seçilir. Smith ve Winter bu buluşla 2018 Nobel Kimya Ödülü'nü kazandı; bugün birçok kanser ve otoimmün antikor ilacı bu teknikle geliştiriliyor.`],
  ['🥩', 'Gıda güvenliği', `Fajlar; ette Listeria ya da Salmonella gibi patojenleri öldürmek için kullanılıyor ve bazı ürünler ABD'de gıda katkısı olarak onaylandı.`],
  ['🌱', 'Tarım & tanı', `Bitki hastalıklarına karşı koruma ve belirli bakterileri hızla tespit eden tanı araçları da faj temelli. Laboratuvarların her gün kullandığı T7 RNA polimeraz gibi araçlar da faj kökenlidir.`],
];

const timeline = [
  { y: '1915', t: 'İlk ipucu', d: `İngiliz bakteriyolog Frederick Twort, bakteri kolonilerinin "camsı" şekilde eriyip kaybolduğunu fark eder — ama I. Dünya Savaşı araştırmasını yarıda keser.` },
  { y: '1917', t: 'Bir ad doğuyor', d: `Fransız-Kanadalı Félix d'Hérelle, dizanteri hastalarının dışkısında bakterileri öldüren görünmez bir etken bulur ve ona "bakteriyofaj" adını verir. Bunların canlı virüsler olduğunu ve hastalıkları tedavi edebileceğini öne sürer.` },
  { y: '1919', t: 'İlk tedavi', d: `D'Hérelle, Paris'te dizanteri kapan çocukları faj vererek tedavi eder — modern faj terapisinin doğuşu.` },
  { y: '1923', t: 'Tiflis: ilk enstitü', d: `D'Hérelle, Gürcü bilim insanı George Eliava ile birlikte dünyanın ilk faj enstitüsünü kurar. Eliava Enstitüsü bugün hâlâ ayakta ve yüz yıldır faj terapisinin merkezi.` },
  { y: '1937', t: 'Trajik bir kayıp', d: `George Eliava, Stalin'in gizli polis şefi Beria tarafından "halk düşmanı" ilan edilip idam edilir. Ama kurduğu enstitü hayatta kalır.` },
  { y: '1928–40', t: 'Antibiyotik çağı', d: `Penisilin keşfedilir, 1940'larda antibiyotikler kitlesel üretime geçer. Ucuz, geniş etkili ve patentlenebilir oldukları için Batı, zahmetli fajları neredeyse tamamen terk eder.` },
  { y: 'Soğuk Savaş', t: "Demir Perde'nin ardında", d: `Antibiyotiğe erişimi kısıtlı Sovyet bloku faj araştırmasını sürdürür. Gürcistan, Rusya ve Polonya'da faj terapisi rutin tıp olur; askerler çantasında yara enfeksiyonu için faj solüsyonu taşır.` },
  { y: 'Bugün', t: 'Yeniden keşif', d: `Demir Perde yıkılınca Batı, on yıllardır görmezden geldiği tedavinin dünyanın öbür ucunda sessizce gelişmeye devam ettiğini şaşkınlıkla görür — tam da antibiyotiklerin sonu görünmeye başlarken.` },
];

const quizQs = [
  { text: 'Bakteriyofaj nedir?', opts: ['İnsanı enfekte eden bir bakteri', 'Bakterileri enfekte eden bir virüs', 'Bir antibiyotik türü', 'Bir mantar'], a: 1 },
  { text: '"Faj" adı hangi kökten gelir?', opts: ['Latince "ışık"', 'Yunanca phagein ("yemek")', 'Rusça "küçük"', 'Gürcüce "avcı"'], a: 1 },
  { text: 'Gezegende tahminen kaç bakteriyofaj vardır?', opts: ['10⁹', '10³¹', '1 milyon', '10⁴'], a: 1 },
  { text: 'Litik döngünün sonunda bakteriye ne olur?', opts: ['Sağlıklı kalır', 'Lizin enzimiyle patlar ve yüzlerce faj saçılır', 'Daha hızlı çoğalır', 'Antibiyotiğe dönüşür'], a: 1 },
  { text: 'Lizojenik döngüde faj DNA\'sı ne yapar?', opts: ['Hücreyi hemen patlatır', 'Bakterinin kromozomuna eklenip profaj olarak gizlenir', 'Anında yok olur', 'Antibiyotik üretir'], a: 1 },
  { text: 'CRISPR aslında doğada neyin parçasıdır?', opts: ['Bir faj silahı', 'Bakterilerin fajlara karşı geliştirdiği bağışıklık sistemi', 'İnsan bağışıklığı', 'Bir antibiyotik'], a: 1 },
  { text: 'Dünyanın ilk faj enstitüsü nerede kuruldu?', opts: ['Paris', 'Londra', 'Tiflis (Gürcistan)', 'New York'], a: 2 },
  { text: 'Fajın antibiyotiğe göre temel avantajı nedir?', opts: ['Daha ucuz olması', 'Yalnızca hedef bakteriyi öldürüp mikrobiyomu koruması', 'Hiç direnç oluşturmaması', 'Bitkileri de tedavi etmesi'], a: 1 },
  { text: 'The Lancet\'e göre 2019\'da doğrudan antibiyotik direncine bağlı kaç ölüm gerçekleşti?', opts: ['~10 bin', '~1,27 milyon', '~100', '~50 milyon'], a: 1 },
];

const refs: BibItem[] = [
  { title: 'Global burden of bacterial antimicrobial resistance in 2019: a systematic analysis', authors: 'Antimicrobial Resistance Collaborators', year: '2022', source: 'The Lancet 399, 629', url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(21)02724-0/fulltext' },
  { title: 'Global burden of bacterial antimicrobial resistance 1990–2021 and forecasts to 2050', authors: 'GBD 2021 AMR Collaborators', year: '2024', source: 'The Lancet 404, 1199', url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(24)01867-1/fulltext' },
  { title: 'The Perfect Predator: A Scientist\'s Race to Save Her Husband from a Deadly Superbug', authors: 'Steffanie Strathdee & Thomas Patterson', year: '2019', source: 'Hachette Books' },
  { title: 'Personalized bacteriophage therapy of difficult-to-treat infections: 100 consecutive cases', authors: 'J.-P. Pirnay et al.', year: '2024', source: 'Nature Microbiology' },
  { title: 'Engineered bacteriophages for treatment of a patient with disseminated drug-resistant Mycobacterium abscessus', authors: 'R. M. Dedrick et al.', year: '2019', source: 'Nature Medicine 25, 730' },
  { title: 'A programmable dual-RNA–guided DNA endonuclease in adaptive bacterial immunity', authors: 'M. Jinek, J. Doudna, E. Charpentier ve ark.', year: '2012', source: 'Science 337, 816' },
  { title: 'The Nobel Prize in Chemistry 2020 — CRISPR/Cas9', source: 'NobelPrize.org', url: 'https://www.nobelprize.org/prizes/chemistry/2020/summary/' },
  { title: 'The Nobel Prize in Chemistry 2018 — phage display', source: 'NobelPrize.org', url: 'https://www.nobelprize.org/prizes/chemistry/2018/summary/' },
  { title: 'Independent functions of viral protein and nucleic acid in growth of bacteriophage', authors: 'A. D. Hershey & M. Chase', year: '1952', source: 'Journal of General Physiology 36, 39' },
  { title: 'George Eliava Institute of Bacteriophages, Microbiology and Virology', source: 'eliava-institute.org', url: 'https://eliava-institute.org/' },
  { title: 'Bacteriophage', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Bacteriophage' },
  { title: 'Phage therapy', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Phage_therapy' },
];

/* ════════════════════════ STEPPER ════════════════════════ */

function Stepper({ steps, children }: { steps: { t: string; d: string }[]; children: (i: number) => ReactNode }) {
  const [i, setI] = useState(0);
  return (
    <div className="phg-stepper">
      <div className="phg-stepper-viz">{children(i)}</div>
      <div className="phg-stepper-panel">
        <div className="phg-dots">
          {steps.map((_, k) => (<button key={k} className={`phg-dot ${k === i ? 'on' : ''}`} onClick={() => setI(k)} aria-label={`Adım ${k + 1}`} />))}
        </div>
        <div className="phg-step-meta">ADIM {i + 1} / {steps.length}</div>
        <h4 className="phg-step-title">{steps[i].t}</h4>
        <p className="phg-step-desc">{steps[i].d}</p>
        <div className="phg-stepper-ctrl">
          <button className="phg-ctrl-btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>← Geri</button>
          <button className="phg-ctrl-btn phg-ctrl-primary" onClick={() => setI(Math.min(steps.length - 1, i + 1))} disabled={i === steps.length - 1}>İleri →</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════ ANA BİLEŞEN ════════════════════════ */

export default function BakteriyofajClient() {
  const [cycle, setCycle] = useState<'litik' | 'lizojenik'>('litik');
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
    <main className="main-content phg-page">

      <div className="phg-topbar">
        <Link href="/" className="phg-back" aria-label="Ana sayfa">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        </Link>
        <span className="phg-topbar-title">Bakteriyofajlar</span>
      </div>

      {/* HERO */}
      <header className="phg-hero">
        <div className="phg-hero-glow" aria-hidden="true" />
        <div className="phg-hero-art" aria-hidden="true">
          <svg viewBox="0 0 140 220" width="104">
            <defs>
              <linearGradient id="phgG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4ade80" /><stop offset="0.6" stopColor="#5eead4" /><stop offset="1" stopColor="#38bdf8" /></linearGradient>
            </defs>
            {/* kapsid */}
            <polygon points="70,18 96,33 96,63 70,78 44,63 44,33" fill="rgba(74,222,128,0.10)" stroke="url(#phgG)" strokeWidth="2.4" />
            <polygon points="70,30 84,38 84,58 70,66 56,58 56,38" fill="none" stroke="rgba(94,234,212,0.5)" strokeWidth="1.1" />
            {/* boyun + kuyruk */}
            <line x1="70" y1="78" x2="70" y2="86" stroke="#5eead4" strokeWidth="2" />
            <rect x="62" y="86" width="16" height="46" rx="3" fill="none" stroke="#5eead4" strokeWidth="2" />
            <line x1="64" y1="94" x2="76" y2="94" stroke="rgba(94,234,212,0.45)" strokeWidth="1" />
            <line x1="64" y1="104" x2="76" y2="104" stroke="rgba(94,234,212,0.45)" strokeWidth="1" />
            <line x1="64" y1="114" x2="76" y2="114" stroke="rgba(94,234,212,0.45)" strokeWidth="1" />
            <line x1="64" y1="124" x2="76" y2="124" stroke="rgba(94,234,212,0.45)" strokeWidth="1" />
            {/* taban plakası */}
            <line x1="52" y1="134" x2="88" y2="134" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            {/* kuyruk lifleri */}
            <path d="M52 134 q-16 14 -22 40 M88 134 q16 14 22 40 M62 134 q-8 18 -12 42 M78 134 q8 18 12 42" fill="none" stroke="#38bdf8" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </div>
        <div className="phg-hero-eyebrow">GÖRÜNMEZ AVCILAR · ANTİBİYOTİK SONRASI ÇAĞIN UMUDU</div>
        <h1 className="phg-hero-title">Bakteriyofajlar</h1>
        <p className="phg-hero-sub">
          Gezegendeki en bol biyolojik varlık, çıplak gözle hiç göremeyeceğimiz bir avcı. Bakteri yiyen virüsler;
          okyanusların nefesini ayarlayan, gen düzenleme devrimini doğuran ve belki de antibiyotik sonrası çağda
          insanlığı kurtaracak <strong>milyarlarca yıllık bir savaşın</strong> kahramanları.
        </p>
        <div className="phg-hero-tags">
          {['Faj terapisi', 'T4 nano-makine', 'Litik / Lizojenik', 'CRISPR', 'Antibiyotik direnci', 'Eliava Enstitüsü'].map((t) => (
            <span key={t} className="phg-tag">{t}</span>
          ))}
        </div>
      </header>

      {/* I. BOLLUK */}
      <section className="phg-section reveal">
        <div className="phg-num">I</div>
        <h2 className="phg-h2">Sayılarla Anlatılamayan Bir Bolluk</h2>
        <p className="phg-lead">
          Şu an okuduğunuz cümleyi bitirene kadar, dünya okyanuslarında yaklaşık <strong>10²³ kez</strong> bir
          virüs bir bakteriye saldırıp onu öldürdü.
        </p>
        <p className="phg-p">
          Gezegende tahminen <strong>10³¹ adet</strong> bakteriyofaj bulunuyor — bu, evrendeki yıldız sayısından
          milyonlarca kat fazla. Hepsini uç uca dizebilseydiniz, oluşan zincir <strong>200 milyon ışıkyılı</strong>
          uzanırdı. Bir kaşık deniz suyunda yaklaşık on milyon, bir gram bağırsak içeriğinde milyarlarca faj yaşar.
        </p>
        <div className="phg-bignums">
          {[
            ['10³¹', 'gezegendeki faj sayısı', 'yıldızlardan kat kat fazla'],
            ['200 milyon', 'ışıkyılı', 'uç uca dizilse uzanacağı mesafe'],
            ['~10 milyon', 'faj / kaşık deniz suyu', 'gözden uzak bir kalabalık'],
            ['%20–40', 'okyanus bakterisi / gün', 'fajlarca öldürülen oran — "viral şant"'],
          ].map(([v, l, s], i) => (
            <div key={i} className="phg-bignum"><span className="phg-bignum-v">{v}</span><span className="phg-bignum-l">{l}</span><span className="phg-bignum-s">{s}</span></div>
          ))}
        </div>
        <p className="phg-p">
          Bakteriyofajlar (kısaca <strong>"faj"</strong>) bakterileri enfekte eden virüslerdir. Adları Yunanca
          <em> phagein</em> (yemek) kökünden gelir: kelimenin tam anlamıyla "bakteri yiyenler". İnsanları,
          hayvanları ya da bitkileri hiç enfekte edemezler; tek hedefleri çoğu zaman tek bir bakteri türüdür. Bu
          olağanüstü hassasiyet, hem onları gezegenin en başarılı yırtıcısı yapar hem de modern tıbbın yeniden
          ilgisini çeken özelliktir.
        </p>
        <div className="phg-note">
          <span>🌊</span>
          <p>Fajlar görünmez olsa da Dünya'nın işleyişini sessizce yönetir. Okyanus bakterilerinin her gün
          %20–40'ını öldürüp devasa miktarda organik maddeyi suya geri salarlar — buna <strong>"viral şant"</strong>
          denir. Bu süreç karbon, azot ve fosfor döngülerini şekillendirir; yani gezegenin nefes alıp verme
          ritminin görünmez bir parçasıdır.</p>
        </div>
      </section>

      {/* II. NANO-MAKİNE */}
      <section className="phg-section reveal">
        <div className="phg-num">II</div>
        <h2 className="phg-h2">Bir Nano-Makine Olarak Faj</h2>
        <p className="phg-p">
          Birçok faj, doğanın ürettiği en zarif moleküler makinelerden biri gibi görünür. En çok çalışılan
          <strong> T4 fajını</strong> gözünüzün önüne getirin: tepesinde DNA'sını saklayan çok yüzlü bir
          <strong> kapsid</strong> (baş), altında <strong>kasılabilen bir kuyruk</strong>, en altta da örümcek
          bacağını andıran <strong>kuyruk lifleri</strong>. Çoğu kişi bu yapıyı bir "ay modülüne" benzetir — gerçekten
          de bir bakteri yüzeyine inen minik bir iniş aracı gibidir. Mekanizmayı adım adım izle:
        </p>
        <Stepper steps={infectionSteps}>
          {(i) => (
            <svg viewBox="0 0 200 210" className="phg-svg" aria-hidden="true">
              {/* bakteri hücresi */}
              <ellipse cx="100" cy="172" rx="76" ry="31"
                fill={i >= 2 ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.02)'}
                stroke={i === 4 ? 'rgba(232,121,249,0.75)' : 'rgba(94,234,212,0.5)'}
                strokeWidth="2" strokeDasharray={i === 4 ? '5 6' : '0'} />
              {/* içerideki DNA */}
              {i >= 2 && i < 4 && <path d="M68 170 q12 -11 24 0 t24 0" stroke="#4ade80" strokeWidth="2" fill="none" />}
              {/* montaj: minik fajlar */}
              {i >= 3 && [0, 1, 2].map((k) => (
                <polygon key={k} transform={`translate(${80 + k * 22} 168) scale(0.42)`} points="0,-11 9,-6 9,6 0,11 -9,6 -9,-6" fill="none" stroke="#5eead4" strokeWidth="2.6" />
              ))}
              {/* liziz: saçılan fajlar */}
              {i === 4 && [0, 1, 2, 3, 4, 5].map((k) => {
                const ang = (k / 6) * Math.PI * 2; const x = 100 + Math.cos(ang) * 64; const y = 150 + Math.sin(ang) * 32;
                return <polygon key={k} transform={`translate(${x} ${y}) scale(0.34)`} points="0,-11 9,-6 9,6 0,11 -9,6 -9,-6" fill="none" stroke="#e879f9" strokeWidth="3" />;
              })}
              {/* FAJ — liziz'de gizlenir */}
              {i < 4 && (
                <g transform={`translate(100 ${i === 0 ? 38 : 50})`}>
                  <polygon points="0,-26 18,-15 18,8 0,19 -18,8 -18,-15" fill={i >= 1 ? 'none' : 'rgba(74,222,128,0.14)'} stroke="#4ade80" strokeWidth="2.5" />
                  {i < 1 && <text x="0" y="2" textAnchor="middle" fontSize="8.5" fill="#4ade80">DNA</text>}
                  <line x1="0" y1="19" x2="0" y2="26" stroke="#5eead4" strokeWidth="2" />
                  <rect x={i >= 1 ? -7 : -4} y="26" width={i >= 1 ? 14 : 8} height={i >= 1 ? 20 : 34} rx="2" fill="none" stroke="#5eead4" strokeWidth="2" />
                  <line x1="-12" y1={i >= 1 ? 48 : 62} x2="12" y2={i >= 1 ? 48 : 62} stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                  <path d={`M-12 ${i >= 1 ? 48 : 62} q-9 8 -13 22 M12 ${i >= 1 ? 48 : 62} q9 8 13 22 M-6 ${i >= 1 ? 48 : 62} q-3 10 -5 24 M6 ${i >= 1 ? 48 : 62} q3 10 5 24`} stroke="#38bdf8" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                  {i === 1 && <path d="M0 48 L0 126" stroke="#4ade80" strokeWidth="2.5" strokeDasharray="4 5"><animate attributeName="stroke-dashoffset" values="18;0" dur="0.8s" repeatCount="indefinite" /></path>}
                </g>
              )}
            </svg>
          )}
        </Stepper>
        <p className="phg-p">
          Mekanizma neredeyse mekanik bir kesinlikte işler. Kuyruk lifleri, bakteri yüzeyindeki belirli reseptörleri
          bir anahtarın kilide oturması gibi tanır — doğru reseptör yoksa faj o bakteriye giremez. İşte fajı
          <strong> türe özgü</strong> yapan da budur. İçeri giren genetik kod, artık komutayı ele geçirmiştir.
        </p>
      </section>

      {/* III. İKİ YOL */}
      <section className="phg-section reveal">
        <div className="phg-num">III</div>
        <h2 className="phg-h2">İki Yol: Hemen Öldürmek mi, Saklanmak mı?</h2>
        <p className="phg-p">
          Faj DNA'sı bakteriye girdikten sonra iki farklı yaşam stratejisinden birini izleyebilir. Aşağıdaki
          düğmeyle iki yolu karşılaştır:
        </p>
        <div className="phg-toggle" role="tablist">
          <button role="tab" aria-selected={cycle === 'litik'} className={`phg-toggle-btn ${cycle === 'litik' ? 'on' : ''}`} onClick={() => setCycle('litik')}>⚡ Litik döngü</button>
          <button role="tab" aria-selected={cycle === 'lizojenik'} className={`phg-toggle-btn ${cycle === 'lizojenik' ? 'on' : ''}`} onClick={() => setCycle('lizojenik')}>🌙 Lizojenik döngü</button>
        </div>
        {cycle === 'litik' ? (
          <div className="phg-cycle phg-cycle-litik">
            <h4>⚡ Acımasız ve hızlı</h4>
            <p>Faj, bakterinin tüm hücresel makinesini ele geçirir, onu yüzlerce yeni faj üretmeye zorlar, sonra
            <strong> lizin</strong> adlı bir enzimle bakteri duvarını içeriden patlatır. Hücre parçalanır ve saçılan
            yeni fajlar komşu bakterilere saldırmaya başlar.</p>
            <div className="phg-cycle-stats">
              <span><b>20–40 dk</b> tek döngü</span>
              <span><b>50–200</b> yeni faj / enfeksiyon</span>
              <span><b>Tıpta kullanılan tip</b> — amaç öldürmek</span>
            </div>
          </div>
        ) : (
          <div className="phg-cycle phg-cycle-lizo">
            <h4>🌙 Sabırlı ve gizli</h4>
            <p>Faj, DNA'sını öldürmek yerine sessizce bakterinin kendi kromozomuna ekler ve orada bir
            <strong> profaj</strong> olarak gizlenir. Bakteri böldükçe bu gizli DNA da kopyalanır ve tüm yeni
            hücrelere miras kalır. Bazen nesiller boyu uyur — ta ki bir stres sinyali (UV ışını, besin kıtlığı) onu
            uyandırana dek; o zaman yeniden litik moda geçip hücreyi öldürür.</p>
            <div className="phg-cycle-stats">
              <span><b>Profaj</b> kromozoma gizlenir</span>
              <span><b>Nesiller boyu</b> uyku</span>
              <span><b>Difteri & kolera toksinleri</b> aslında fajlardan gelir</span>
            </div>
          </div>
        )}
      </section>

      {/* IV. TARİH */}
      <section className="phg-section reveal">
        <div className="phg-num">IV</div>
        <h2 className="phg-h2">Unutulmuş Bir Tarih: İki Mucit, Bir Tiflis, Bir Soğuk Savaş</h2>
        <p className="phg-p">
          Fajların hikâyesi, bilim tarihinin en dramatik ve en haksızca unutulmuş bölümlerinden biridir. Bir tedavi
          yöntemi keşfedildi, terk edildi, Demir Perde'nin bir yanında sessizce hayatta tutuldu — ve tam
          antibiyotiklerin sonu görünürken yeniden parladı.
        </p>
        <ol className="phg-timeline">
          {timeline.map((e, i) => (
            <li key={i} className="phg-tl-item">
              <span className="phg-tl-dot" aria-hidden="true" />
              <span className="phg-tl-year">{e.y}</span>
              <div className="phg-tl-body"><strong>{e.t}</strong><span>{e.d}</span></div>
            </li>
          ))}
        </ol>
      </section>

      {/* V. CRISPR */}
      <section className="phg-section reveal">
        <div className="phg-num">V</div>
        <h2 className="phg-h2">CRISPR'ın Doğduğu Yer: Bir Milyar Yıllık Silah Yarışı</h2>
        <p className="phg-p">
          Fajların belki de en şaşırtıcı mirası, modern biyolojinin en güçlü aracını doğurmuş olmalarıdır:
          <strong> CRISPR</strong>. Bakteriler ve fajlar en az <strong>üç milyar yıldır</strong> kıyasıya bir
          silahlanma yarışı içinde — gezegenin en eski ve en yoğun evrimsel mücadelesi.
        </p>
        <p className="phg-p">
          Bir bakteri bir faj saldırısından sağ kurtulduğunda, fajın DNA'sının küçük bir parçasını kendi genomuna
          bir <strong>"vesikalık"</strong> gibi kaydeder — bu, bir tür bağışıklık hafızasıdır. Aynı faj bir daha
          saldırdığında, bakteri bu hafızayla fajın DNA'sını tanır ve <strong>Cas proteinleri</strong> denen
          moleküler makaslarla onu tam doğru noktadan keser. Yani CRISPR aslında bakterilerin virüslere karşı
          geliştirdiği <strong>uyarlanabilir bir bağışıklık sistemidir</strong>.
        </p>
        <div className="phg-note">
          <span>🏅</span>
          <p>2012'de Jennifer Doudna ve Emmanuelle Charpentier'in dehası, bu bakteriyel savunmayı "programlanabilir
          bir gen düzenleme aracına" dönüştürmek oldu — ve bu buluş onlara <strong>2020 Nobel Kimya Ödülü'nü</strong>
          getirdi. Ama o aracın özünde, bir bakterinin bir faja karşı milyarlarca yıl önce geliştirdiği bir savunma
          vardı: gen düzenleme devrimi, görünmez bir savaşın ganimetiydi.</p>
        </div>
        <p className="phg-p">
          Bakterilerin tek savunması CRISPR değil: kendi DNA'sını işaretleyip yabancı DNA'yı kesen
          <strong> kısıtlama-modifikasyon</strong> sistemleri ve enfekte hücrenin kendini feda ederek komşularını
          koruduğu <strong>abortif enfeksiyon</strong> mekanizmaları da var. Fajlar ise buna karşı
          <strong> anti-CRISPR proteinleri</strong> geliştirerek karşılık verdi. Bu sonsuz satranç oyunu hâlâ sürüyor
          — ve her hamle, biyologlara yeni moleküler araçlar armağan ediyor.
        </p>
      </section>

      {/* VI. SESSİZ PANDEMİ */}
      <section className="phg-section reveal phg-crisis-sec">
        <div className="phg-num">VI</div>
        <h2 className="phg-h2">Sessiz Pandemi: Antibiyotiklerin Tükendiği Çağ</h2>
        <p className="phg-p">
          Fajların yeniden gündeme gelmesinin asıl nedeni, modern tıbbın temel direklerinden birinin çatlamaya
          başlaması. Antibiyotikler 20. yüzyılın en büyük tıbbi zaferiydi; ama bakteriler evrimleşir — ve onları ne
          kadar çok kullanırsak, dirençli suşları o kadar seçeriz. Bugün hiçbir mevcut ilaca yanıt vermeyen
          <strong> "süper bakteriler"</strong> hastanelerde yayılıyor.
        </p>
        <div className="phg-crisis">
          {[
            ['1,27 milyon', '2019\'da doğrudan dirence bağlı ölüm'],
            ['4,95 milyon', 'direncin rol oynadığı toplam ölüm'],
            ['39 milyon', '2025–2050 öngörülen ölüm'],
            ['dakikada 3', 'bu tempoda kaybedilen can'],
          ].map(([v, l], i) => (
            <div key={i} className="phg-crisis-card"><span className="phg-crisis-v">{v}</span><span className="phg-crisis-l">{l}</span></div>
          ))}
        </div>
        <p className="phg-p">
          Rakamlar <em>The Lancet</em>'te yayımlanan kapsamlı çalışmalardan geliyor. Doğrudan dirençten kaynaklanan
          yıllık ölümlerin 2021'deki ~1,14 milyondan 2050'de ~1,91 milyona yükselmesi bekleniyor. Daha da kötüsü,
          <strong> yeni antibiyotik geliştirme neredeyse durdu</strong>: bir hasta antibiyotiği yalnızca birkaç gün
          kullanır ve direnç gelişmesin diye olabildiğince az reçete edilir, dolayısıyla ilaç şirketleri için kârlı
          değildir. Böylece çağımızın paradokslarından biri doğdu: en çok ihtiyaç duyduğumuz ilaçları üretmek için
          ekonomik teşvik yok. İşte tam bu boşlukta, yüz yıl önce terk edilen bir fikir yeniden parladı.
        </p>
      </section>

      {/* VII. NEDEN CAZİP */}
      <section className="phg-section reveal">
        <div className="phg-num">VII</div>
        <h2 className="phg-h2">Faj Terapisi Neden Bu Kadar Cazip?</h2>
        <p className="phg-p">Fajların tıbbi bir silah olarak antibiyotiklere göre bazı eşsiz avantajları var:</p>
        <div className="phg-cards">
          {advantages.map(([e, t, d], i) => (
            <div key={i} className="phg-card"><div className="phg-card-e">{e}</div><div><strong>{t}</strong><span>{d}</span></div></div>
          ))}
        </div>
      </section>

      {/* VIII. ZORLUKLAR */}
      <section className="phg-section reveal">
        <div className="phg-num">VIII</div>
        <h2 className="phg-h2">Zorluklar: Neden Hâlâ Eczanede Faj Satılmıyor?</h2>
        <p className="phg-p">Tüm bu avantajlara rağmen faj terapisi henüz standart tıbbın parçası değil — ve sebepleri öğretici:</p>
        <div className="phg-cards">
          {challenges.map(([e, t, d], i) => (
            <div key={i} className="phg-card"><div className="phg-card-e">{e}</div><div><strong>{t}</strong><span>{d}</span></div></div>
          ))}
        </div>
      </section>

      {/* IX. GERÇEK VAKALAR */}
      <section className="phg-section reveal">
        <div className="phg-num">IX</div>
        <h2 className="phg-h2">Modern Mucizeler: Kanıt Olarak Gerçek Vakalar</h2>
        <p className="phg-p">Teoriden çıkıp gerçek hayata bakalım — çünkü son on yılda faj terapisi, dramatik vakalarla yeniden gündeme oturdu:</p>
        <div className="phg-cases">
          {cases.map((c, i) => (
            <div key={i} className="phg-case">
              <div className="phg-case-head"><span className="phg-case-year">{c.y}</span><div><strong className="phg-case-title">{c.t}</strong><span className="phg-case-sub">{c.s}</span></div></div>
              <p>{c.d}</p>
            </div>
          ))}
        </div>
        <div className="phg-note"><span>📊</span><p>Şubat 2025 itibarıyla ClinicalTrials.gov'da <strong>60'tan fazla</strong> girişimsel faj çalışması listeleniyor. Lisanslı bir ürün olmadığından Belçika, Gürcistan, Polonya ve Portekiz gibi ülkeler faj terapisini kendi çerçevelerinde uyguluyor.</p></div>
      </section>

      {/* X. TIBBIN ÖTESİNDE */}
      <section className="phg-section reveal">
        <div className="phg-num">X</div>
        <h2 className="phg-h2">Tıbbın Ötesinde: Fajların Gizli Kariyeri</h2>
        <p className="phg-p">Fajların değeri yalnızca enfeksiyon tedavisiyle sınırlı değil; sessizce modern biyolojinin ve teknolojinin pek çok alanını dönüştürdüler:</p>
        <div className="phg-cards">
          {beyond.map(([e, t, d], i) => (
            <div key={i} className="phg-card"><div className="phg-card-e">{e}</div><div><strong>{t}</strong><span>{d}</span></div></div>
          ))}
        </div>
      </section>

      {/* XI. GELECEK */}
      <section className="phg-section reveal">
        <div className="phg-num">XI</div>
        <h2 className="phg-h2">Açık Sorular ve Gelecek</h2>
        <p className="phg-p">Faj araştırması, cevaplanmayı bekleyen büyüleyici sorularla dolu:</p>
        <ul className="phg-qlist">
          <li>Vücudun fajlara verdiği bağışıklık yanıtını nasıl yönetebiliriz?</li>
          <li>Geniş bir bakteri yelpazesini hedefleyen "evrensel" faj kokteylleri tasarlanabilir mi?</li>
          <li>Düzenleyici kurumlar, kişiye özel ve canlı bir tedaviyi onaylamak için yeni bir çerçeve kurabilir mi?</li>
          <li>Yapay zekâ, bir hastanın enfeksiyonuna en uygun fajı saniyeler içinde eşleştirebilir mi?</li>
        </ul>
        <blockquote className="phg-quote">
          Muhtemel gelecek "ya faj ya antibiyotik" değil; ikisinin birlikte kullanıldığı bir model. Çünkü bu iki silah
          birbirinin zayıflığını kapatıyor: bakteri birinden kaçmaya çalışırken diğerine yakalanıyor.
        </blockquote>
      </section>

      {/* XII. KAPANIŞ */}
      <section className="phg-section reveal">
        <div className="phg-num">XII</div>
        <h2 className="phg-h2">Görünmezin İçindeki Devrim</h2>
        <p className="phg-p">
          Bakteriyofajların hikâyesi, bilimin en güzel paradokslarından birini anlatır. Gezegendeki en bol biyolojik
          varlık, çıplak gözle hiç göremeyeceğimiz bir avcı. Bir zamanlar terk edilmiş, sonra Soğuk Savaş'ın bir
          tarafında sessizce hayatta tutulmuş bir tedavi. Bakterilerin milyarlarca yıl önce kendilerini korumak için
          geliştirdiği bir silahın, bugün gen düzenleme devrimine ve belki de antibiyotik sonrası çağın kurtuluşuna
          dönüşmesi.
        </p>
        <blockquote className="phg-quote">
          Fajlar bize şunu hatırlatır: en büyük cevaplar bazen en küçük, en görünmez yerlerde — milyarlarca yıldır
          sessizce süren bir savaşın içinde — gizlidir.
        </blockquote>
      </section>

      {/* XIII. QUIZ */}
      <section className="phg-section reveal">
        <div className="phg-num">XIII</div>
        <h2 className="phg-h2">Mini Quiz</h2>
        <div className="phg-quiz">
          {!done ? (
            <>
              <div className="phg-quiz-top"><span>Soru {quizQ + 1} / {quizQs.length}</span><span className="phg-quiz-score">Puan: {score}</span></div>
              <h3 className="phg-quiz-q">{quizQs[quizQ].text}</h3>
              <div className="phg-quiz-opts">
                {quizQs[quizQ].opts.map((o, oi) => {
                  const sel = answered[quizQ]; const isAns = sel !== undefined; const correct = quizQs[quizQ].a;
                  let cls = 'phg-opt'; if (isAns) { if (oi === correct) cls += ' correct'; else if (oi === sel) cls += ' wrong'; else cls += ' dim'; }
                  return (<button key={oi} className={cls} onClick={() => answerQ(oi)} disabled={isAns}><span className="phg-opt-letter">{String.fromCharCode(65 + oi)}</span>{o}</button>);
                })}
              </div>
            </>
          ) : (
            <div className="phg-quiz-result">
              <div className="phg-quiz-emoji">{score >= 8 ? '🏆' : score >= 5 ? '🧬' : '📖'}</div>
              <h3 className="phg-quiz-rtitle">{score} / {quizQs.length} doğru</h3>
              <p className="phg-quiz-rdesc">{score >= 8 ? 'Görünmez avcıların gerçek uzmanısın!' : score >= 5 ? 'Sağlam — fajların dilini çözüyorsun.' : 'Yukarı kaydırıp bir kez daha keşfet.'}</p>
              <button className="phg-ctrl-btn phg-ctrl-primary" onClick={restartQuiz}>↺ Tekrar dene</button>
            </div>
          )}
        </div>
      </section>

      <ArticleBibliography items={refs} accent="#4ade80" />

      <footer className="phg-footer">
        <div className="phg-footer-mark">BASEMENTS</div>
        <p>Mikrobiyoloji, görünmez bir dramı görünür kılma sanatıdır — ve bakteriyofajlar, o dramın hem en eski kahramanları hem de geleceğimizin en umut verici müttefikleridir. 🦠</p>
        <Link href="/discover" className="phg-footer-link">← Diğer içerikleri keşfet</Link>
      </footer>

      <style>{`
        .phg-page { --bg:#070f0d; --bg2:#0b1714; --panel:rgba(255,255,255,0.03); --line:rgba(94,234,212,0.14); --ink:#e9f3ef; --muted:#92a79f; --green:#4ade80; --teal:#5eead4; --cyan:#38bdf8; --viral:#e879f9; --amber:#fbbf24;
          background:
            radial-gradient(1100px 520px at 78% -8%, rgba(74,222,128,0.10), transparent 60%),
            radial-gradient(900px 600px at 0% 12%, rgba(56,189,248,0.07), transparent 55%),
            var(--bg);
          color: var(--ink); font-family: -apple-system, 'Segoe UI', system-ui, sans-serif; line-height: 1.7;
          font-size: 17px; -webkit-font-smoothing: antialiased; overflow-x: hidden; padding-bottom: 0;
        }
        .phg-page *::selection { background: rgba(74,222,128,0.28); color: #fff; }

        .phg-topbar { position: sticky; top: 0; z-index: 30; display: flex; align-items: center; gap: 12px; padding: 12px 20px;
          background: rgba(7,15,13,0.72); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); }
        .phg-back { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 10px; color: var(--teal);
          border: 1px solid var(--line); background: var(--panel); transition: .2s; flex-shrink: 0; }
        .phg-back:hover { background: rgba(94,234,212,0.10); transform: translateX(-2px); }
        .phg-topbar-title { font-family: ui-monospace,'SF Mono',Menlo,Consolas,monospace; font-weight: 700; letter-spacing: .06em; font-size: .82rem; color: var(--muted); text-transform: uppercase; }

        .phg-hero { position: relative; max-width: 820px; margin: 0 auto; padding: 78px 24px 40px; text-align: center; }
        .phg-hero-glow { position: absolute; inset: -10% 0 auto; height: 360px; margin: auto;
          background: radial-gradient(closest-side, rgba(74,222,128,0.18), transparent 72%); filter: blur(20px); pointer-events: none; z-index: 0; }
        .phg-hero-art { position: relative; z-index: 1; display: flex; justify-content: center; margin-bottom: 14px; filter: drop-shadow(0 0 22px rgba(74,222,128,0.32)); animation: phg-float 7s ease-in-out infinite; }
        @keyframes phg-float { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-9px); } }
        .phg-hero-eyebrow { position: relative; z-index: 1; font-family: ui-monospace,'SF Mono',Menlo,Consolas,monospace; font-size: .72rem; letter-spacing: .22em; color: var(--teal); margin-bottom: 12px; }
        .phg-hero-title { position: relative; z-index: 1; font-size: clamp(2.7rem, 8vw, 4.6rem); line-height: 1.02; margin: 0 0 18px; font-weight: 800; letter-spacing: -.02em;
          background: linear-gradient(105deg, #d8ffe9 0%, var(--green) 42%, var(--teal) 70%, var(--cyan) 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .phg-hero-sub { position: relative; z-index: 1; font-size: 1.12rem; color: #c7d6cf; max-width: 660px; margin: 0 auto; }
        .phg-hero-sub strong { color: var(--ink); font-weight: 700; }
        .phg-hero-tags { position: relative; z-index: 1; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 24px; }
        .phg-tag { font-family: ui-monospace,'SF Mono',Menlo,Consolas,monospace; font-size: .73rem; padding: 6px 12px; border-radius: 999px; border: 1px solid var(--line);
          color: var(--teal); background: var(--panel); letter-spacing: .02em; }

        .phg-section { position: relative; max-width: 760px; margin: 0 auto; padding: 40px 24px; border-top: 1px solid var(--line); }
        .phg-num { font-family: ui-monospace,'SF Mono',Menlo,Consolas,monospace; font-size: .82rem; font-weight: 700; color: var(--green); letter-spacing: .12em; margin-bottom: 8px; }
        .phg-h2 { font-size: clamp(1.5rem, 4.4vw, 2.05rem); line-height: 1.18; margin: 0 0 18px; font-weight: 800; letter-spacing: -.015em; color: #f4faf7; }
        .phg-lead { font-size: 1.18rem; color: #d4e2db; margin: 0 0 16px; font-weight: 500; }
        .phg-p { margin: 0 0 16px; color: #c4d3cc; }
        .phg-p:last-child { margin-bottom: 0; }
        .phg-p strong, .phg-lead strong { color: var(--ink); font-weight: 700; }
        .phg-p em, .phg-lead em { color: var(--teal); font-style: italic; }

        .phg-quote { margin: 22px 0 4px; padding: 16px 22px; border-left: 3px solid var(--green); border-radius: 0 12px 12px 0;
          background: linear-gradient(90deg, rgba(74,222,128,0.08), transparent); font-size: 1.12rem; font-style: italic; color: #e3efe9; }

        .phg-note { display: flex; gap: 13px; align-items: flex-start; margin: 20px 0 4px; padding: 15px 18px; border-radius: 14px;
          background: var(--panel); border: 1px solid var(--line); }
        .phg-note span:first-child { font-size: 1.25rem; line-height: 1.3; flex-shrink: 0; }
        .phg-note p { margin: 0; font-size: .95rem; color: #b9cbc3; }
        .phg-note strong { color: var(--teal); }

        .phg-bignums { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 22px 0 4px; }
        .phg-bignum { padding: 16px; border-radius: 14px; background: var(--panel); border: 1px solid var(--line); text-align: center; }
        .phg-bignum-v { display: block; font-family: ui-monospace,'SF Mono',Menlo,Consolas,monospace; font-size: 1.55rem; font-weight: 800; color: var(--green); letter-spacing: -.01em; }
        .phg-bignum-l { display: block; font-size: .9rem; color: var(--ink); margin-top: 3px; font-weight: 600; }
        .phg-bignum-s { display: block; font-size: .76rem; color: var(--muted); margin-top: 3px; }

        /* STEPPER */
        .phg-stepper { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 18px; align-items: stretch; margin: 22px 0 6px;
          background: var(--panel); border: 1px solid var(--line); border-radius: 18px; padding: 16px; }
        .phg-stepper-viz { display: grid; place-items: center; background: radial-gradient(circle at 50% 38%, rgba(74,222,128,0.08), transparent 70%); border-radius: 12px; min-height: 230px; }
        .phg-svg { width: 100%; max-width: 240px; height: auto; }
        .phg-stepper-panel { display: flex; flex-direction: column; }
        .phg-dots { display: flex; gap: 7px; margin-bottom: 12px; }
        .phg-dot { width: 9px; height: 9px; border-radius: 50%; border: none; background: rgba(94,234,212,0.22); cursor: pointer; transition: .2s; padding: 0; }
        .phg-dot.on { background: var(--green); box-shadow: 0 0 10px rgba(74,222,128,0.7); transform: scale(1.25); }
        .phg-step-meta { font-family: ui-monospace,'SF Mono',Menlo,Consolas,monospace; font-size: .72rem; letter-spacing: .1em; color: var(--teal); }
        .phg-step-title { font-size: 1.16rem; margin: 4px 0 8px; color: #f4faf7; font-weight: 700; }
        .phg-step-desc { font-size: .95rem; color: #bdcfc7; margin: 0 0 16px; flex: 1; }
        .phg-stepper-ctrl { display: flex; gap: 10px; }
        .phg-ctrl-btn { flex: 1; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--line); background: rgba(255,255,255,0.02);
          color: var(--ink); font-size: .88rem; font-weight: 600; cursor: pointer; transition: .2s; font-family: inherit; }
        .phg-ctrl-btn:hover:not(:disabled) { border-color: var(--teal); background: rgba(94,234,212,0.10); }
        .phg-ctrl-btn:disabled { opacity: .38; cursor: not-allowed; }
        .phg-ctrl-primary { background: linear-gradient(120deg, var(--green), var(--teal)); border-color: transparent; color: #062012; }
        .phg-ctrl-primary:hover:not(:disabled) { filter: brightness(1.08); }

        /* TOGGLE / CYCLE */
        .phg-toggle { display: flex; gap: 8px; margin: 16px 0; padding: 5px; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; }
        .phg-toggle-btn { flex: 1; padding: 11px; border-radius: 10px; border: none; background: transparent; color: var(--muted);
          font-size: .94rem; font-weight: 700; cursor: pointer; transition: .2s; font-family: inherit; }
        .phg-toggle-btn.on { color: #062012; background: linear-gradient(120deg, var(--green), var(--teal)); box-shadow: 0 4px 18px rgba(74,222,128,0.22); }
        .phg-toggle-btn:not(.on):hover { color: var(--ink); }
        .phg-cycle { padding: 18px 20px; border-radius: 16px; border: 1px solid var(--line); background: var(--panel); animation: phg-fade .35s ease; }
        .phg-cycle-litik { border-left: 3px solid var(--green); }
        .phg-cycle-lizo { border-left: 3px solid var(--viral); }
        @keyframes phg-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .phg-cycle h4 { margin: 0 0 8px; font-size: 1.16rem; color: #f4faf7; }
        .phg-cycle p { margin: 0 0 14px; color: #c4d3cc; font-size: .98rem; }
        .phg-cycle p strong { color: var(--ink); }
        .phg-cycle-stats { display: flex; flex-wrap: wrap; gap: 8px; }
        .phg-cycle-stats span { font-size: .8rem; padding: 6px 11px; border-radius: 999px; background: rgba(255,255,255,0.03); border: 1px solid var(--line); color: var(--muted); }
        .phg-cycle-stats b { color: var(--teal); }
        .phg-cycle-lizo .phg-cycle-stats b { color: var(--viral); }

        /* TIMELINE */
        .phg-timeline { list-style: none; margin: 22px 0 0; padding: 0 0 0 6px; position: relative; }
        .phg-timeline::before { content: ''; position: absolute; left: 11px; top: 6px; bottom: 6px; width: 2px;
          background: linear-gradient(var(--green), var(--cyan), var(--viral)); opacity: .42; }
        .phg-tl-item { position: relative; padding: 0 0 22px 38px; }
        .phg-tl-item:last-child { padding-bottom: 0; }
        .phg-tl-dot { position: absolute; left: 4px; top: 5px; width: 16px; height: 16px; border-radius: 50%; background: var(--bg);
          border: 3px solid var(--green); box-shadow: 0 0 12px rgba(74,222,128,0.5); }
        .phg-tl-year { font-family: ui-monospace,'SF Mono',Menlo,Consolas,monospace; font-size: .8rem; font-weight: 700; color: var(--green); letter-spacing: .04em; }
        .phg-tl-body { margin-top: 3px; }
        .phg-tl-body strong { display: block; color: #f4faf7; font-size: 1.04rem; margin-bottom: 3px; }
        .phg-tl-body span { color: #b6c8c0; font-size: .94rem; }

        /* CRISIS */
        .phg-crisis-sec { background: linear-gradient(180deg, rgba(251,191,36,0.05), transparent 40%); }
        .phg-crisis-sec .phg-num, .phg-crisis-sec .phg-h2 { color: var(--amber); }
        .phg-crisis { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 18px 0; }
        .phg-crisis-card { padding: 16px; border-radius: 14px; background: rgba(251,191,36,0.06); border: 1px solid rgba(251,191,36,0.22); text-align: center; }
        .phg-crisis-v { display: block; font-family: ui-monospace,'SF Mono',Menlo,Consolas,monospace; font-size: 1.5rem; font-weight: 800; color: var(--amber); }
        .phg-crisis-l { display: block; font-size: .82rem; color: #d8d2c2; margin-top: 4px; }

        /* CARDS */
        .phg-cards { display: grid; gap: 12px; margin: 20px 0 4px; }
        .phg-card { display: flex; gap: 14px; align-items: flex-start; padding: 16px 18px; border-radius: 14px; background: var(--panel); border: 1px solid var(--line); transition: .25s; }
        .phg-card:hover { border-color: rgba(94,234,212,0.34); transform: translateY(-2px); background: rgba(94,234,212,0.04); }
        .phg-card-e { font-size: 1.5rem; line-height: 1.2; flex-shrink: 0; }
        .phg-card strong { display: block; color: #f4faf7; font-size: 1.04rem; margin-bottom: 4px; }
        .phg-card span { display: block; color: #b6c8c0; font-size: .93rem; }

        /* CASES */
        .phg-cases { display: grid; gap: 14px; margin: 20px 0 6px; }
        .phg-case { padding: 18px; border-radius: 16px; background: var(--panel); border: 1px solid var(--line); border-left: 3px solid var(--cyan); }
        .phg-case-head { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
        .phg-case-year { font-family: ui-monospace,'SF Mono',Menlo,Consolas,monospace; font-size: .9rem; font-weight: 800; color: #062012; background: linear-gradient(120deg, var(--cyan), var(--teal));
          padding: 6px 10px; border-radius: 9px; flex-shrink: 0; min-width: 64px; text-align: center; }
        .phg-case-title { display: block; color: #f4faf7; font-size: 1.08rem; font-weight: 700; }
        .phg-case-sub { display: block; font-style: italic; color: var(--teal); font-size: .86rem; }
        .phg-case p { margin: 0; color: #bdcfc7; font-size: .95rem; }

        /* Q-LIST */
        .phg-qlist { margin: 14px 0 4px; padding: 0; list-style: none; display: grid; gap: 10px; }
        .phg-qlist li { position: relative; padding: 12px 16px 12px 40px; border-radius: 12px; background: var(--panel); border: 1px solid var(--line); color: #cad9d2; font-size: .96rem; }
        .phg-qlist li::before { content: '?'; position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          font-family: ui-monospace,monospace; font-weight: 800; color: var(--green); font-size: 1.1rem; }

        /* QUIZ */
        .phg-quiz { background: var(--panel); border: 1px solid var(--line); border-radius: 18px; padding: 22px; }
        .phg-quiz-top { display: flex; justify-content: space-between; font-family: ui-monospace,'SF Mono',Menlo,Consolas,monospace; font-size: .78rem; color: var(--muted); margin-bottom: 12px; letter-spacing: .04em; }
        .phg-quiz-score { color: var(--green); font-weight: 700; }
        .phg-quiz-q { font-size: 1.2rem; margin: 0 0 16px; color: #f4faf7; line-height: 1.4; }
        .phg-quiz-opts { display: grid; gap: 10px; }
        .phg-opt { display: flex; align-items: center; gap: 13px; text-align: left; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--line);
          background: rgba(255,255,255,0.02); color: var(--ink); font-size: .94rem; cursor: pointer; transition: all .2s; font-family: inherit; }
        .phg-opt:not(:disabled):hover { border-color: var(--teal); background: rgba(94,234,212,0.08); }
        .phg-opt-letter { width: 25px; height: 25px; border-radius: 7px; display: grid; place-items: center; font-weight: 700; font-size: .78rem;
          background: rgba(94,234,212,0.12); color: var(--teal); flex-shrink: 0; }
        .phg-opt.correct { border-color: var(--green) !important; background: rgba(74,222,128,0.14) !important; }
        .phg-opt.correct .phg-opt-letter { background: var(--green) !important; color: #062012; }
        .phg-opt.wrong { border-color: var(--viral) !important; background: rgba(232,121,249,0.13) !important; }
        .phg-opt.wrong .phg-opt-letter { background: var(--viral) !important; color: #fff; }
        .phg-opt.dim { opacity: .45; }
        .phg-opt:disabled { cursor: default; }
        .phg-quiz-result { text-align: center; padding: 14px; }
        .phg-quiz-emoji { font-size: 3rem; }
        .phg-quiz-rtitle { font-size: 1.5rem; margin: 6px 0 6px; color: var(--green); }
        .phg-quiz-rdesc { color: #bdcfc7; margin: 0 0 16px; }
        .phg-quiz-result .phg-ctrl-primary { display: inline-block; padding: 11px 22px; flex: none; }

        /* FOOTER */
        .phg-footer { max-width: 760px; margin: 0 auto; padding: 44px 24px 70px; text-align: center; border-top: 1px solid var(--line); }
        .phg-footer-mark { font-family: ui-monospace,'SF Mono',Menlo,Consolas,monospace; font-weight: 800; letter-spacing: .3em; color: var(--green); font-size: .82rem; margin-bottom: 14px; }
        .phg-footer p { color: #bdcfc7; font-size: 1rem; max-width: 560px; margin: 0 auto 18px; }
        .phg-footer-link { color: var(--teal); font-weight: 600; text-decoration: none; border-bottom: 1px solid transparent; transition: .2s; }
        .phg-footer-link:hover { border-bottom-color: var(--teal); }

        /* REVEAL */
        .reveal { opacity: 0; transform: translateY(22px); transition: opacity .7s ease, transform .7s ease; }
        .reveal.visible { opacity: 1; transform: none; }

        @media (max-width: 720px) {
          .phg-stepper { grid-template-columns: 1fr; }
          .phg-stepper-viz { min-height: 180px; }
        }
        @media (max-width: 540px) {
          .phg-page { font-size: 16px; }
          .phg-bignums, .phg-crisis { grid-template-columns: 1fr; }
          .phg-toggle { flex-direction: column; }
          .phg-case-head { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
        html.reduced-motion .phg-hero-art { animation: none; }
        @media (prefers-reduced-motion: reduce) {
          .phg-hero-art { animation: none; }
          .reveal { transition: none; opacity: 1; transform: none; }
          .phg-cycle { animation: none; }
        }
      `}</style>
    </main>
  );
}
