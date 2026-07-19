'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import ArticleImage from '@/app/components/article/ArticleImage';

/* ════════════════════════ VERİ ════════════════════════ */

const mergerSteps = [
  { t: 'İki yalnız hücre', d: `Yaklaşık iki milyar yıl önce: bir tarafta konak hücre (bir arke), diğer tarafta serbest yaşayan bir bakteri (geleceğin mitokondrisi). Henüz birbirlerinden bağımsızlar.` },
  { t: 'Kucaklaşma', d: `Konak, bakteriyi içine alır. Bakteri, konağın zarından bir "ceket" giyer (dış zar) ama kendi öz zarını hiç çıkarmaz (iç zar). İşte mitokondrinin çifte zarının sırrı budur.` },
  { t: 'Gen göçü', d: `Milyarlarca yıl boyunca bakterinin genleri yavaşça konağın çekirdeğine taşınır. Binlerce genden geriye yalnızca 37 kalır; bakteri bağımsızlığını yitirir.` },
  { t: 'Tek varlık', d: `Artık bakteri bir organeldir: mitokondri. İki taraf birbirine öyle kilitlenmiştir ki "iki organizma" demek anlamsızdır — onlar tek bir hücre olmuştur.` },
];

const evidence = [
  ['🧬', 'Çifte zar', `Mitokondrinin iki katmanlı zarı vardır: dış zar onu yutan konağın zarından, iç zar ise eski bakterinin kendi derisinden gelir. İç zarda hâlâ bakterilere özgü bir lipid — kardiyolipin — bulunur.`],
  ['⭕', 'Halkasal kendi DNA\'sı', `Mitokondri ve kloroplastın kendi genetik materyali vardır ve bu DNA, çekirdekteki düz kromozomlara değil, bakterilerin halka biçimli DNA'sına benzer. İnsan mitokondrisinde yalnızca 37 gen kalmıştır — kökeninin sessiz tanığı.`],
  ['🔬', 'Bakteriyel ribozomlar', `Sitoplazmamızdaki ribozomlar "80S" tipiyken, mitokondrinin içindekiler bakteriyel "70S" tipidir. Mitokondri, proteinlerinin bir kısmını hâlâ tıpkı bir bakteri gibi üretir.`],
  ['➗', 'Kendi başına bölünme', `Mitokondri ve kloroplastlar, hücre bölünmesinden bağımsız olarak, tıpkı bakteriler gibi ikiye bölünerek çoğalır. Hücre onları sıfırdan inşa edemez; yalnızca var olanlardan türerler.`],
  ['💊', 'Antibiyotik hassasiyeti', `Bazı antibiyotikler (örn. kloramfenikol) tam olarak bakteriyel ribozomları hedef alır — ve mitokondrininkini de etkiler. Bazı ilaç yan etkilerinin sebebi budur: ilaç, içimizdeki "eski bakteriyi" tanıyıp ona saldırır.`],
  ['🌳', 'Moleküler soy ağacı', `Mitokondrinin genleri onu Alfaproteobakterilerle (muhtemelen bugünkü Rickettsia akrabaları) kardeş gösterir; kloroplastın genleri ise doğrudan siyanobakterilere işaret eder. Her organel, atalarının adresini taşır.`],
];

const everywhere = [
  ['🪸', 'Mercan resifleri', `Mercan hayvanı ile içindeki algler (zooksantellalar) ortak yaşar: alg fotosentezle merceni besler, mercan ona barınak verir. İklim değişimiyle ortaklık bozulunca mercan "ağarır" ve ölür.`],
  ['🐛', 'Yaprak bitleri', `Afitler, kendileri üretemedikleri amino asitleri sağlayan Buchnera bakterilerini hücrelerinde taşır ve onları yavrularına aktarır.`],
  ['🦑', 'Bobtail kalamarı', `Hawaii'nin bobtail kalamarı, ışık üreten Vibrio fischeri bakterilerini bir organda barındırır ve gece avlanırken bu ışıkla gölgesini gizler.`],
  ['🍃', 'Likenler', `Bir mantar ile bir alg ya da siyanobakterinin öyle sıkı bir ortaklığıdır ki, yüzyıllarca tek bir organizma sanıldılar.`],
  ['🐌', 'Elysia salyangozu', `Bazı deniz salyangozları yedikleri alglerden kloroplastları çalıp kendi hücrelerinde tutar ve haftalarca güneşle beslenir — buna "kleptoplasti" denir.`],
  ['🦎', 'Benekli semender', `Yumurtalarının içinde algler yaşar — bir omurgalıda bilinen ender hücre-içi simbiyoz örneklerinden biri.`],
];

const quizQs = [
  { text: 'Hücrelerimizdeki mitokondrinin kökeni nedir?', opts: ['Çekirdeğin bir parçası', 'Bir zamanlar serbest yaşayan bir bakteri', 'Bir virüs', 'Cansız bir kristal'], a: 1 },
  { text: 'Endosimbiyotik kuramı kanıtlarla savunup kabul ettiren bilim insanı kimdir?', opts: ['Charles Darwin', 'Lynn Margulis', 'Gregor Mendel', 'Louis Pasteur'], a: 1 },
  { text: 'Aşağıdakilerden hangisi mitokondrinin bakteriyel kökenine kanıt DEĞİLDİR?', opts: ['Halkasal kendi DNA\'sı', '70S bakteriyel ribozomları', 'Düz, kromozomlara paketlenmiş DNA\'sı', 'Çifte zarı'], a: 2 },
  { text: 'Mitokondri neden artık hücreden bağımsız yaşayamaz?', opts: ['Çok yaşlandığı için', 'Genlerinin çoğu çekirdeğe taşındığı için (gen transferi)', 'Oksijenden korktuğu için', 'Donduğu için'], a: 1 },
  { text: 'Karmaşık (ökaryotik) hücrenin konağı büyük olasılıkla hangi gruptandı?', opts: ['Mantarlar', 'Virüsler', 'Asgard arkeleri', 'Yeşil algler'], a: 2 },
  { text: 'Endosimbiyozun karmaşık yaşamı mümkün kılmasının temel nedeni nedir?', opts: ['Hücreyi küçülttüğü için', 'Enerji üretimini iç zarlara taşıyıp enerji bariyerini aştığı için', 'Sıcaklığı düşürdüğü için', 'Renk kattığı için'], a: 1 },
  { text: 'Kloroplastın atası hangi bakteri grubudur?', opts: ['Siyanobakteriler', 'Rickettsia', 'Salmonella', 'Spiroketler'], a: 0 },
  { text: '2024\'te keşfedilen, azot bağlayan dördüncü büyük organel tipinin adı nedir?', opts: ['Kromatofor', 'Nitroplast', 'Lizozom', 'Ribozom'], a: 1 },
  { text: 'İkincil endosimbiyozda kloroplastın 3-4 zarla çevrili olmasının sebebi nedir?', opts: ['Çok yaşlı olması', 'Bir ökaryotun, içinde zaten kloroplast olan başka bir ökaryotu yutması', 'Radyasyon', 'Tesadüf'], a: 1 },
];

const refs: BibItem[] = [
  { title: 'On the origin of mitosing cells', authors: 'Lynn Sagan (Margulis)', year: '1967', source: 'Journal of Theoretical Biology 14, 255' },
  { title: 'Symbiosis in Cell Evolution', authors: 'Lynn Margulis', year: '1981', source: 'W. H. Freeman' },
  { title: 'Complex archaea that bridge the eukaryotic and archaeal domains (Lokiarchaeota)', authors: 'A. Spang et al.', year: '2015', source: 'Nature 521, 173' },
  { title: 'Asgard archaea illuminate the origin of eukaryotic cellular complexity', authors: 'K. Zaremba-Niedzwiedzka et al.', year: '2017', source: 'Nature 541, 353' },
  { title: 'Isolation of an archaeon at the prokaryote–eukaryote interface (Prometheoarchaeum)', authors: 'H. Imachi et al.', year: '2020', source: 'Nature 577, 519' },
  { title: 'The energetics of genome complexity', authors: 'N. Lane & W. Martin', year: '2010', source: 'Nature 467, 929' },
  { title: 'The Vital Question: Energy, Evolution, and the Origins of Complex Life', authors: 'Nick Lane', year: '2015', source: 'W. W. Norton' },
  { title: 'Nitrogen-fixing organelle in a marine alga (nitroplast / UCYN-A)', authors: 'T. H. Coale et al.', year: '2024', source: 'Science 384, 217' },
  { title: 'The hydrogen hypothesis for the first eukaryote', authors: 'W. Martin & M. Müller', year: '1998', source: 'Nature 392, 37' },
  { title: 'Endosymbiotic gene transfer in Paulinella chromatophora', authors: 'E. C. M. Nowack et al.', year: '2008', source: 'Current Biology 18, 410' },
  { title: 'Symbiogenesis', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Symbiogenesis' },
  { title: 'Nitroplast', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Nitroplast' },
];

/* ════════════════════════ STEPPER ════════════════════════ */

function Stepper({ steps, children }: { steps: { t: string; d: string }[]; children: (i: number) => ReactNode }) {
  const [i, setI] = useState(0);
  return (
    <div className="endo-stepper">
      <div className="endo-stepper-viz">{children(i)}</div>
      <div className="endo-stepper-panel">
        <div className="endo-dots">
          {steps.map((_, k) => (<button key={k} className={`endo-dot ${k === i ? 'on' : ''}`} onClick={() => setI(k)} aria-label={`Adım ${k + 1}`} />))}
        </div>
        <div className="endo-step-meta">ADIM {i + 1} / {steps.length}</div>
        <h4 className="endo-step-title">{steps[i].t}</h4>
        <p className="endo-step-desc">{steps[i].d}</p>
        <div className="endo-stepper-ctrl">
          <button className="endo-ctrl-btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>← Geri</button>
          <button className="endo-ctrl-btn endo-ctrl-primary" onClick={() => setI(Math.min(steps.length - 1, i + 1))} disabled={i === steps.length - 1}>İleri →</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════ ANA BİLEŞEN ════════════════════════ */

export default function EndosimbiyozClient() {
  const [nest, setNest] = useState<'birincil' | 'ikincil'>('birincil');
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
    <main className="main-content endo-page">

      <div className="endo-topbar">
        <Link href="/" className="endo-back" aria-label="Ana sayfa">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        </Link>
        <span className="endo-topbar-title">Endosimbiyoz</span>
      </div>

      {/* HERO */}
      <header className="endo-hero">
        <div className="endo-hero-glow" aria-hidden="true" />
        <div className="endo-hero-art" aria-hidden="true">
          <svg viewBox="0 0 200 150" width="170">
            {/* konak hücre (arke) */}
            <ellipse cx="118" cy="75" rx="64" ry="54" fill="rgba(176,140,240,0.08)" stroke="#b08cf0" strokeWidth="2" />
            {/* çekirdek */}
            <circle cx="118" cy="75" r="22" fill="rgba(176,140,240,0.12)" stroke="#b08cf0" strokeWidth="1.6" strokeDasharray="3 4" />
            {/* mitokondri (içeride, çifte zar + krista) */}
            <g transform="translate(150 95) rotate(28)">
              <ellipse cx="0" cy="0" rx="22" ry="11" fill="rgba(244,183,64,0.14)" stroke="#f4b740" strokeWidth="2" />
              <ellipse cx="0" cy="0" rx="17" ry="7" fill="none" stroke="#f4b740" strokeWidth="1" opacity="0.7" />
              <path d="M-13 -5 q4 5 0 10 M-5 -6 q4 6 0 12 M3 -6 q4 6 0 12 M11 -5 q3 5 0 10" stroke="#f4b740" strokeWidth="0.9" fill="none" opacity="0.7" />
            </g>
            {/* serbest bakteri (yaklaşan) */}
            <ellipse cx="36" cy="44" rx="20" ry="11" fill="rgba(52,211,153,0.10)" stroke="#34d399" strokeWidth="2" />
            <path d="M28 44 q8 -5 16 0" stroke="#34d399" strokeWidth="1.1" fill="none" />
          </svg>
        </div>
        <div className="endo-hero-eyebrow">İKİ HÜCRENİN BİRLEŞİP KARMAŞIK YAŞAMI YARATTIĞI AN</div>
        <h1 className="endo-hero-title">Endosimbiyoz</h1>
        <p className="endo-hero-sub">
          Gözle görebildiğimiz tüm karmaşık yaşam — bitkiler, hayvanlar, mantarlar, sen ve ben — bir savaşın değil,
          bir <strong>birleşmenin</strong> ürünüyüz. Hayatın tarihindeki en büyük sıçrama, bir mutasyonla değil,
          iki tamamen farklı canlının tek bir varlıkta kaynaşmasıyla gerçekleşti.
        </p>
        <div className="endo-hero-tags">
          {['Mitokondri', 'Lynn Margulis', 'Asgard arkeleri', 'Kloroplast', 'Nitroplast', 'Ökaryot kökeni'].map((t) => (
            <span key={t} className="endo-tag">{t}</span>
          ))}
        </div>
      </header>

      {/* I. BEDENİNDEKİ YABANCI */}
      <section className="endo-section reveal">
        <div className="endo-num">I</div>
        <h2 className="endo-h2">Bedeninizdeki Yabancı</h2>
        <p className="endo-lead">
          Şu an bu cümleyi okumanızı sağlayan enerjinin neredeyse tamamı, bir zamanlar serbest yaşayan bir bakterinin
          torunları tarafından üretiliyor.
        </p>
        <p className="endo-p">
          Vücudunuzdaki her hücrenin içinde yüzlerce, bazen binlerce <strong>mitokondri</strong> var — ve bunlar sizin
          bir parçanız değil, sizinle birlikte yaşamaya karar vermiş kadim bir konuğun soyu. Kendi DNA'ları var, kendi
          ribozomları var, kendi başlarına bölünüyorlar. Annenizden, onun annesinden, kesintisiz bir hatla yaklaşık
          <strong> iki milyar yıl</strong> öncesine — tek bir bakterinin başka bir hücrenin içine girip oradan bir daha
          çıkmadığı o ana kadar — uzanıyorlar.
        </p>
        <p className="endo-p">
          Bu, <strong>endosimbiyoz</strong> (içeride birlikte yaşama) denen olgudur. En büyük versiyonu —
          <em> endosimbiyotik kuram</em> — fikrin ortaya atıldığı dönemde o kadar radikaldi ki, savunan kişi onlarca yıl
          bilim camiasının alayına maruz kaldı. Bugün ise lise biyoloji kitaplarında yazıyor.
        </p>
      </section>

      {/* II. ÇILGIN FİKİR (TARİH) */}
      <section className="endo-section reveal">
        <div className="endo-num">II</div>
        <h2 className="endo-h2">Çılgın Fikir ve Onu Savunan İnatçı Kadın</h2>
        <p className="endo-p">
          Fikrin tohumları çok eskiye dayanır — ama bedelini ödeyen biri oldu. İşte unutulmuş öncülerden büyük zafere
          uzanan yol:
        </p>
        <div className="endo-img-pair" style={{ marginBottom: 20 }}>
          <ArticleImage
            className="endo-img"
            src="/articles/endosimbiyoz/lynn-margulis.webp"
            ratio="1600 / 2400"
            priority
            alt="Kısa saçlı, gözlüklü bir kadın konuşma yaparken; elleriyle bir şey anlatıyor."
            caption="Lynn Margulis. Makalesi on beş dergiden geri çevrildi, yayımlandığında da yıllarca alaya alındı. Kuramı kanıtlarla kabul ettiren kişi oldu."
            credit="Javier Pedreira · CC BY 2.0"
          />
          <ArticleImage
            className="endo-img"
            src="/articles/endosimbiyoz/mereschkowski.webp"
            ratio="1600 / 1965"
            alt="Bıyıklı, koyu ceketli bir adamın 20. yüzyıl başı siyah beyaz portresi."
            caption="Konstantin Mereschkowski: “simbiyogenez” terimini 1905–10 arasında ortaya attı. Fikir Margulis'ten yarım yüzyıl önce ortadaydı, ama kimse üzerine kanıt koymadı."
            credit="Kamu malı"
          />
        </div>

        <ol className="endo-timeline">
          {[
            ['1883', 'İlk fısıltı', 'Alman botanikçi Andreas Schimper, bitki hücrelerindeki kloroplastların tıpkı serbest bakteriler gibi ikiye bölünerek çoğaldığını fark eder ve bunların bir ortaklıktan doğmuş olabileceğini öne sürer.'],
            ['1905–10', 'Simbiyogenez', 'Rus botanikçi Konstantin Mereschkowski fikri cesurca genişletir ve "simbiyogenez" terimini ortaya atar: yeni türler mutasyonla değil, farklı organizmaların birleşmesiyle de doğabilir.'],
            ['1920\'ler', 'Mitokondri de mi?', 'Amerikalı Ivan Wallin, mitokondrilerin de bir zamanlar bakteri olduğunu öne sürer. Ama dönemin bilimi fikri "ciddiyetsiz" bulup reddeder; onlarca yıl unutulur.'],
            ['1967', 'İnatçı kahraman', 'Genç biyolog Lynn Margulis, mitokondri ve kloroplastların bir zamanlar serbest bakteriler olduğunu savunan makalesini yazar. Makale yaklaşık on beş dergiden reddedilir — sonunda biri yayımlar. Yıllarca "bilim kurgu yazıyor" diye küçümsenir.'],
            ['1981', 'Zafer', 'Symbiosis in Cell Evolution kitabıyla fikir artık görmezden gelinemez hale gelir. Margulis bir hikâye değil, test edilebilir bir iddia ortaya koymuştu — ve kanıtlar teker teker geldi.'],
          ].map((e, i) => (
            <li key={i} className="endo-tl-item">
              <span className="endo-tl-dot" aria-hidden="true" />
              <span className="endo-tl-year">{e[0]}</span>
              <div className="endo-tl-body"><strong>{e[1]}</strong><span>{e[2]}</span></div>
            </li>
          ))}
        </ol>
      </section>

      {/* III. PARMAK İZLERİ (KANIT) */}
      <section className="endo-section reveal">
        <div className="endo-num">III</div>
        <h2 className="endo-h2">Suç Mahallindeki Parmak İzleri</h2>
        <p className="endo-p">
          Kuramın bu kadar sağlam kabul edilmesinin nedeni "olabilir" demesi değil, bıraktığı izlerin reddedilemez
          olmasıdır. Mitokondri ve kloroplastı incelediğinizde sürekli aynı şeyi haykırırlar: <strong>Biz bir zamanlar
          bağımsız bakterilerdik.</strong>
        </p>
        <div className="endo-img-pair" style={{ marginBottom: 18 }}>
          <ArticleImage
            className="endo-img"
            src="/articles/endosimbiyoz/mitokondri-tem.webp"
            ratio="640 / 433"
            alt="Elektron mikroskobu görüntüsü: oval bir yapı, dıştan iki zarla çevrili ve içinde kıvrımlı katmanlar bulunuyor."
            caption="Bir mitokondri, elektron mikroskobunda. Kanıtın kendisi burada görünüyor: dıştan iki ayrı zar (biri yutulan bakteriye, diğeri onu saran keseye ait) ve içeriyi katlayan kristalar."
            credit="Louisa Howard · kamu malı"
          />
          <ArticleImage
            className="endo-img"
            src="/articles/endosimbiyoz/kloroplast.webp"
            ratio="1600 / 1629"
            alt="Mikroskop görüntüsü: bitki hücrelerinin içinde sıralanmış, canlı yeşil renkli oval yapılar."
            caption="Bitki hücrelerindeki kloroplastlar. Aynı hikâyenin ikinci perdesi: bunlar da bir zamanlar serbest yaşayan siyanobakterilerdi ve hâlâ kendi DNA'larını taşıyorlar."
            credit="Wikimedia Commons · CC BY-SA"
          />
        </div>

        <div className="endo-cards">
          {evidence.map(([e, t, d], i) => (
            <div key={i} className="endo-card"><div className="endo-card-e">{e}</div><div><strong>{t}</strong><span>{d}</span></div></div>
          ))}
        </div>
      </section>

      {/* IV. KÖLELEŞTİRME + BİRLEŞME ADIMLARI */}
      <section className="endo-section reveal">
        <div className="endo-num">IV</div>
        <h2 className="endo-h2">Büyük Köleleştirme: O Tarihi Kucaklaşma</h2>
        <p className="endo-p">
          Eğer mitokondri bir zamanlar bağımsız bir bakteriyse, neden bugün hücreden çıkıp tek başına yaşayamıyor?
          Cevap, endosimbiyozun en sinsi ve en güzel kısmında saklı: <strong>endosimbiyotik gen transferi</strong>.
          O tarihi birleşmeyi adım adım izle:
        </p>
        <Stepper steps={mergerSteps}>
          {(i) => (
            <svg viewBox="0 0 220 180" className="endo-svg" aria-hidden="true">
              {/* KONAK (arke) — adım ilerledikçe büyür */}
              <ellipse cx={i === 0 ? 140 : 116} cy="90" rx={i === 0 ? 50 : 70} ry={i === 0 ? 44 : 62}
                fill="rgba(176,140,240,0.07)" stroke="#b08cf0" strokeWidth="2" />
              {/* çekirdek — adım 2'den itibaren belirginleşir */}
              {i >= 2 && <circle cx="104" cy="86" r="22" fill="rgba(176,140,240,0.12)" stroke="#b08cf0" strokeWidth="1.6" strokeDasharray="3 4" />}
              {i >= 3 && <text x="104" y="90" textAnchor="middle" fontSize="8" fill="#c8b3f5">çekirdek</text>}

              {/* SERBEST BAKTERİ (adım 0: dışarıda solda) */}
              {i === 0 && (
                <g transform="translate(40 80)">
                  <ellipse cx="0" cy="0" rx="22" ry="13" fill="rgba(244,183,64,0.12)" stroke="#f4b740" strokeWidth="2" />
                  <path d="M-12 0 q6 -6 12 0 t12 0" stroke="#f4b740" strokeWidth="1.1" fill="none" />
                  <text x="0" y="26" textAnchor="middle" fontSize="8" fill="#f4cd7a">bakteri</text>
                </g>
              )}

              {/* YUTULAN BAKTERİ (adım 1: içeride, çifte zar) */}
              {i === 1 && (
                <g transform="translate(132 96)">
                  <ellipse cx="0" cy="0" rx="26" ry="15" fill="none" stroke="#b08cf0" strokeWidth="1.6" strokeDasharray="3 3" />
                  <ellipse cx="0" cy="0" rx="20" ry="11" fill="rgba(244,183,64,0.14)" stroke="#f4b740" strokeWidth="2" />
                  <path d="M-10 0 q5 -5 10 0 t10 0" stroke="#f4b740" strokeWidth="1" fill="none" />
                  <text x="0" y="-22" textAnchor="middle" fontSize="7.5" fill="#c8b3f5">çifte zar</text>
                </g>
              )}

              {/* GEN GÖÇÜ (adım 2: bakteriden çekirdeğe noktalar) */}
              {i === 2 && (
                <g transform="translate(150 104)">
                  <ellipse cx="0" cy="0" rx="20" ry="12" fill="rgba(244,183,64,0.14)" stroke="#f4b740" strokeWidth="2" />
                  {[0, 1, 2].map((k) => (
                    <circle key={k} cx={-8 - k * 14} cy={-4 - k * 4} r="2.4" fill="#f4b740">
                      <animate attributeName="opacity" values="1;0.2;1" dur="1.1s" begin={`${k * 0.25}s`} repeatCount="indefinite" />
                    </circle>
                  ))}
                  <text x="0" y="24" textAnchor="middle" fontSize="7.5" fill="#f4cd7a">genler → çekirdek</text>
                </g>
              )}

              {/* MİTOKONDRİ (adım 3: organel, krista) */}
              {i === 3 && (
                <g transform="translate(150 108) rotate(20)">
                  <ellipse cx="0" cy="0" rx="24" ry="13" fill="rgba(244,183,64,0.16)" stroke="#f4b740" strokeWidth="2" />
                  <ellipse cx="0" cy="0" rx="19" ry="9" fill="none" stroke="#f4b740" strokeWidth="1" opacity="0.7" />
                  <path d="M-14 -6 q4 6 0 12 M-6 -7 q4 7 0 14 M2 -7 q4 7 0 14 M11 -6 q3 6 0 12" stroke="#f4b740" strokeWidth="0.9" fill="none" opacity="0.75" />
                  <text x="0" y="-19" textAnchor="middle" fontSize="7.5" fill="#f4cd7a">mitokondri</text>
                </g>
              )}
            </svg>
          )}
        </Stepper>
        <div className="endo-note">
          <span>🔒</span>
          <p>Bu ortaklığı <strong>geri dönülmez</strong> kıldı: mitokondri artık çekirdek olmadan yaşayamaz (proteinlerinin çoğunu üretemez), çekirdek de mitokondri olmadan yaşayamaz (enerjisini ondan alır). Rekabet değil, <strong>bağımlılığa dönüşen iş birliği</strong> — Margulis'in dehası tam buydu.</p>
        </div>
      </section>

      {/* V. KONAK KİMDİ? (ASGARD) */}
      <section className="endo-section reveal">
        <div className="endo-num">V</div>
        <h2 className="endo-h2">Peki Konak Kimdi? Yaşam Ağacının Yeniden Çizilmesi</h2>
        <p className="endo-p">
          Mitokondrinin bir bakteri olduğunu biliyoruz. Peki onu yutan o ilk konak neydi? Uzun süre yaşamı üç alana
          böldük: <strong>Bakteriler</strong>, <strong>Arkeler</strong> ve <strong>Ökaryotlar</strong> (çekirdekli,
          karmaşık hücreler — yani biz). Ama yeni kanıtlar resmi değiştirdi: o konak bir bakteri değil, bir
          <strong> arke</strong> idi.
        </p>
        <p className="endo-p">
          2015'te bilim insanları, Atlantik'in derinliklerinde <strong>"Loki Kalesi"</strong> adlı bir hidrotermal
          bacanın çamurunda olağanüstü bir mikrop buldu: <em>Lokiarchaeota</em>. Bu mikrobun ve sonradan keşfedilen
          akrabalarının — İskandinav mitolojisinden esinle <strong>Asgard arkeleri</strong> (Loki, Thor, Odin, Heimdall)
          adını aldılar — genomları, o zamana dek yalnızca bizim gibi karmaşık hücrelerde bulunduğu sanılan
          <strong> "ökaryotik imza proteinleri"</strong> taşıyordu.
        </p>
        <blockquote className="endo-quote">
          Senin hücrenin çekirdeği bir arkeden, enerji santralin ise bir bakteriden geliyor. Sen, kelimenin tam
          anlamıyla, iki ayrı yaşam alanının birleşmesinden doğan bir <em>kimerasın</em>.
        </blockquote>
        <div className="endo-note">
          <span>🤝</span>
          <p>2020'de Japon bilim insanı Imachi ve ekibi, on yılı aşkın uğraşla bir Asgard arkesini laboratuvarda
          yetiştirdi: <em>Prometheoarchaeum syntrophicum</em>. Elektron mikroskobunda, bu arkenin hücre dışına uzattığı
          kollarla bakteri hücrelerine dolandığı görüldü. Belki de iki milyar yıl önceki o tarihi kucaklaşma, tam olarak
          böyle başlamıştı: bir arkenin, bir bakteriyi kollarıyla sarması.</p>
        </div>

        <ArticleImage
          className="endo-img mx-auto"
          src="/articles/endosimbiyoz/asgard-arkesi.webp"
          ratio="1600 / 1600"
          alt="Elektron mikroskobu görüntüsü: küresel bir hücreden dışa doğru uzanan uzun, dallanan ince uzantılar."
          caption="Laboratuvarda yetiştirilen Asgard arkesi (Imachi ve ekibi, 2020): hücreden uzanan dallanan kollar. Bu kare kolların bir bakteriyi sardığını göstermiyor — gösterdiği şey, sarmayı mümkün kılan yapının gerçekten var olduğu."
          credit="Wikimedia Commons · CC BY"
        />
      </section>

      {/* VI. ENERJİ DEVRİMİ */}
      <section className="endo-section reveal">
        <div className="endo-num">VI</div>
        <h2 className="endo-h2">Bu Birleşme Neden Bu Kadar Önemliydi? Enerjinin Devrimi</h2>
        <p className="endo-p">
          Bakteriler ve arkeler dört milyar yıldır var, ama hiçbiri bir köpekbalığı, bir meşe ağacı ya da bir insan
          beyni yaratamadı; hep mikroskobik kaldı. Neden? Biyokimyacı <strong>Nick Lane</strong>'in argümanına göre
          sorun <strong>enerjiydi</strong>. Bir bakteri enerjisini hücre zarının üzerinde üretir; hücre büyüdükçe
          yüzey alanı yetersiz kalır. Enerji üretimi, hücre boyutunu sınırlar.
        </p>
        <div className="mx-auto" style={{ maxWidth: 300, margin: '0 auto 18px' }}>
          <ArticleImage
            className="endo-img"
            src="/articles/endosimbiyoz/nick-lane.webp"
            ratio="1600 / 2133"
            alt="Gözlüklü, kısa saçlı bir adamın konuşma yaparken çekilmiş fotoğrafı."
            caption="Nick Lane: karmaşık hayatın neden yalnızca bir kez ortaya çıktığını enerjiyle açıklayan biyokimyacı. Bu bölümün argümanı onun."
            credit="Ian Alexander · CC BY-SA 4.0"
          />
        </div>

        <p className="endo-p">
          Mitokondri bu sınırı yok etti. Onu içeri alarak ökaryot hücre, enerji üretimini iç zarlara taşıdı;yüzlerce
          mitokondri, her biri kendi enerji-üreten zarıyla paralel çalıştı. Bu devasa enerji fazlasıyla ökaryotlar dev
          genomlar taşıyabildi, binlerce yeni protein üretti, büyüdü, uzmanlaştı ve sonunda dokulara, organlara,
          beyinlere dönüştü.
        </p>
        <div className="endo-note endo-note-warn">
          <span>🌌</span>
          <p>Ürkütücü gerçek: Bakteriler ve arkeler dört milyar yılda sayısız kez bir araya geldi, ama ökaryotik
          karmaşıklığa yol açan bu birleşme bilinen tüm tarihte <strong>yalnızca bir kez</strong> gerçekleşti. Tüm
          bitkiler, hayvanlar, mantarlar o tek olaydan türedi. Belki basit mikrobik yaşam yaygındır — ama karmaşık
          yaşam, gerçekleşmesi inanılmaz zor bir kazadan ibaret olabilir.</p>
        </div>
      </section>

      {/* VII. MATRUŞKA (BİRİNCİL/İKİNCİL) */}
      <section className="endo-section reveal">
        <div className="endo-num">VII</div>
        <h2 className="endo-h2">Matruşka Bebekleri: Birincil ve İkincil Endosimbiyoz</h2>
        <p className="endo-p">
          Endosimbiyoz tek seferlik bir olay değil; tekrar tekrar yaşandı ve bazen iç içe geçti. Düğmeyle iki türünü
          karşılaştır:
        </p>
        <div className="endo-toggle" role="tablist">
          <button role="tab" aria-selected={nest === 'birincil'} className={`endo-toggle-btn ${nest === 'birincil' ? 'on' : ''}`} onClick={() => setNest('birincil')}>① Birincil</button>
          <button role="tab" aria-selected={nest === 'ikincil'} className={`endo-toggle-btn ${nest === 'ikincil' ? 'on' : ''}`} onClick={() => setNest('ikincil')}>②③ İkincil</button>
        </div>
        <div className="endo-nest">
          <div className="endo-nest-viz" aria-hidden="true">
            <svg viewBox="0 0 200 160" width="100%">
              {(nest === 'birincil' ? [78, 60] : [82, 68, 54, 40]).map((r, k, arr) => (
                <ellipse key={k} cx="100" cy="80" rx={r} ry={r * 0.82}
                  fill={k === arr.length - 1 ? 'rgba(52,211,153,0.16)' : 'none'}
                  stroke={k === 0 ? '#b08cf0' : k === arr.length - 1 ? '#34d399' : '#7dd3fc'}
                  strokeWidth="2" strokeDasharray={k > 0 && k < arr.length - 1 ? '4 4' : '0'} />
              ))}
              <text x="100" y="84" textAnchor="middle" fontSize="11" fill="#34d399">🌿</text>
            </svg>
          </div>
          {nest === 'birincil' ? (
            <div className="endo-nest-body">
              <h4>① Birincil endosimbiyoz</h4>
              <p>Bir ökaryot, doğrudan bir bakteriyi (bir <strong>siyanobakteriyi</strong>) yutup onu kloroplasta
              dönüştürür. Bu olay bitkilerin, kırmızı ve yeşil alglerin ortak atasında <strong>bir kez</strong> yaşandı
              ve fotosentezi ökaryot dünyasına soktu. Sonuç: <strong>iki zarlı</strong> kloroplast.</p>
            </div>
          ) : (
            <div className="endo-nest-body">
              <h4>②③ İkincil endosimbiyoz</h4>
              <p>Bir ökaryot, içinde <em>zaten kloroplast bulunan</em> başka bir ökaryotu yutar — bir matruşka bebeği
              gibi. İşte bu yüzden <strong>diatom, dinoflagellat ve euglena</strong> gibi alglerin kloroplastları
              <strong> üç ya da dört zarla</strong> çevrilidir; her zar katmanı, bir yutma olayının fosilleşmiş izidir.</p>
            </div>
          )}
        </div>
      </section>

      {/* VIII. ŞU AN OLUYOR (NİTROPLAST) */}
      <section className="endo-section reveal">
        <div className="endo-num">VIII</div>
        <h2 className="endo-h2">En Sarsıcı Kısım: Endosimbiyoz Şu An Gözümüzün Önünde Oluyor</h2>
        <p className="endo-p">
          Bu süreç iki milyar yıl önce olup bitmiş bir tarih değil — hâlâ devam ediyor ve bilim insanları onu canlı
          yakaladı. İlk modern örnek <em>Paulinella chromatophora</em>: bu minik su canlısı, kloroplastını o eski tek
          olaydan miras almadı; yaklaşık <strong>100 milyon yıl önce</strong> bağımsız olarak kendi siyanobakterisini
          yutup onu "kromatofor" adlı yeni bir organele dönüştürdü.
        </p>
        <p className="endo-p">
          Ama asıl bomba <strong>2024'te</strong> düştü: bilim insanları dördüncü bir büyük organel tipi keşfetti ve
          ona <strong>"nitroplast"</strong> adını verdiler. Hikâye 1998'de deniz bilimci Jonathan Zehr'in Pasifik'te
          azot bağlayan gizemli bir bakteri dizisi (<em>UCYN-A</em>) bulmasıyla başladı; yıllar sonra bu bakterinin
          konağı <em>Braarudosphaera bigelowii</em> adlı alg olarak ortaya çıktı.
        </p>
        <ArticleImage
          className="endo-img"
          src="/articles/endosimbiyoz/braarudosphaera.webp"
          ratio="1600 / 1072"
          alt="Çok panelli bilimsel figür: mikroskop altında farklı tekniklerle görüntülenmiş, plakalarla kaplı küresel tek hücreli algler; panellerde harf etiketleri ve ölçek çubukları var."
          caption="Braarudosphaera bigelowii: nitroplastı taşıyan alg. Bilimsel yayından alınan çok panelli figür — her panel aynı canlıyı farklı görüntüleme tekniğiyle gösteriyor."
          credit="Hagino ve ark., PLOS ONE · CC BY"
        />

        <div className="endo-facts">
          {[
            ['Senkronize bölünme', 'Yumuşak X-ışını tomografisiyle UCYN-A\'nın bölünmesinin konağıyla sıkı sıkıya eşleştiği gösterildi — bir organelin yapması gereken şey.'],
            ['İçeri protein ithali', 'UCYN-A proteinlerinin yaklaşık yarısının konak alg tarafından üretilip nitroplasta gönderildiği bulundu — artık bir simbiyont değil, hücrenin parçası.'],
            ['Çok daha genç', 'Mitokondri ve kloroplast milyarlarca yaşındayken, nitroplast yalnızca ~100 milyon yaşında — organel oluşumuna taze bir bakış.'],
            ['Yılın çalışması', 'Organel evrimine ışık tuttuğu için Science/AAAS tarafından 2024\'ün en seçkin çalışmalarından sayıldı.'],
          ].map(([t, d], i) => (
            <div key={i} className="endo-fact"><strong>{t}</strong><span>{d}</span></div>
          ))}
        </div>
        <div className="endo-note">
          <span>🌾</span>
          <p>Pratik boyutu da var: azotu bağlayan UCYN-A, tropiklerden Arktik'e okyanus ekosistemleri için küresel
          öneme sahip. Nitroplastın bir gün ürün bitkilerine aktarılması, kimyasal gübre bağımlılığını azaltıp tarımda
          devrim yaratabilir — milyarlarca yıllık bir doğal süreç, geleceğin sürdürülebilir tarımının anahtarı olabilir.</p>
        </div>
      </section>

      {/* IX. HER YERDEKİ SİMBİYOZ */}
      <section className="endo-section reveal">
        <div className="endo-num">IX</div>
        <h2 className="endo-h2">Her Yerdeki Simbiyoz</h2>
        <p className="endo-p">
          Hücre içindeki dramatik versiyonu en ünlüsü olsa da, ortak yaşam doğanın her köşesinde. Bir kez bu gözle
          bakınca, yaşamın iş birliği üzerine kurulu olduğunu görürsünüz. Aynı mikroskobik ölçekte, bu ortaklıkların
          yaşandığı dünyanın en dayanıklı sakinlerinden biri, uzayın boşluğuna bile katlanabilen{' '}
          <Link href="/articles/tardigrad" className="article-ilink">su ayıları (tardigradlar)</Link>dır.
        </p>
        <ArticleImage
          className="endo-img"
          src="/articles/endosimbiyoz/mercan-zooksantella.webp"
          ratio="1600 / 1068"
          alt="Su altı fotoğrafı: canlı renklerde mercan kolonileri, dokuları kahverengi-yeşil tonlarda."
          caption="Mercanın rengi kendisinin değil: dokusunda yaşayan alglerin. Alg fotosentezle mercanı besliyor, mercan ona barınak veriyor — ısınan suda bu ortaklık bozulunca mercan ağarıyor ve ölüyor."
          credit="Wikimedia Commons · CC BY-SA"
        />

        <div className="endo-cards">
          {everywhere.map(([e, t, d], i) => (
            <div key={i} className="endo-card"><div className="endo-card-e">{e}</div><div><strong>{t}</strong><span>{d}</span></div></div>
          ))}
        </div>
      </section>

      {/* X. TARTIŞILANLAR */}
      <section className="endo-section reveal">
        <div className="endo-num">X</div>
        <h2 className="endo-h2">Hâlâ Tartışılanlar ve Margulis'in Sınırı</h2>
        <p className="endo-p">
          Bilimde dürüstlük önemlidir. Margulis bir dahiydi, ama her fikri kabul görmedi. Simbiyozun, mutasyonun rolünü
          gölgeleyecek kadar baskın olduğunu savundu — çoğu biyoloğun aşırı bulduğu bir iddia. Ayrıca hücre kamçılarının
          (flagella) bir zamanlar <strong>spiroketler</strong>den geldiğini öne sürdü; bu fikir kanıtlanmadı ve bugün
          reddedilir. Mitokondri ve kloroplastın endosimbiyotik kökeni kesinken, kamçı hipotezi onun aşamadığı sınırdır.
        </p>
        <p className="endo-p">
          Açık sorular sürüyor: Mitokondri tam olarak ne zaman geldi — çekirdek oluşmadan <em>önce</em> mi, <em>sonra</em>
          mı? Ünlü <strong>"hidrojen hipotezi"</strong>, ilk birleşmenin bir av-avcı ilişkisi değil, metabolik bir
          alışveriş (bir tarafın ürettiği hidrojeni diğerinin tüketmesi) olduğunu öne sürer. Asgard arkelerinin içsel
          yapısı ve o ilk yutma olayının tam mekaniği hâlâ aktif araştırma konusu.
        </p>
      </section>

      {/* XI. KAPANIŞ */}
      <section className="endo-section reveal">
        <div className="endo-num">XI</div>
        <h2 className="endo-h2">İş Birliğinin Yaratıcı Gücü</h2>
        <p className="endo-p">
          <Link href="/articles/dogal-secilim" className="article-ilink">Evrim</Link> deyince çoğumuzun aklına "doğanın acımasız rekabeti" gelir. Endosimbiyoz, bu resmin yarım olduğunu
          gösterir. Hayatın tarihindeki en büyük sıçrama — basit mikroptan karmaşık yaşama geçiş — bir rekabetle değil,
          bir <strong>ortaklıkla</strong> gerçekleşti. İki farklı canlı, birbirini yok etmek yerine birbirine teslim oldu
          ve hiçbirinin tek başına olamayacağı bir şeye dönüştü.
        </p>
        <p className="endo-p">
          Sen bu birleşmenin canlı kanıtısın. Her nefesinde, hücrelerindeki kadim bakteri torunları oksijeni enerjiye
          çevirir. Ve okyanusta şu an <em>Braarudosphaera bigelowii</em> adlı minik bir alg, bir bakteriyi tam da
          atalarımızın iki milyar yıl önce yaptığı gibi yavaşça bir organele dönüştürüyor — evrim, gözümüzün önünde aynı
          mucizeyi tekrar ediyor.
        </p>
        <blockquote className="endo-quote endo-quote-final">
          Bazen en büyük yenilik, daha güçlü olmaktan değil, birleşmekten doğar. Karmaşıklık, yalnızlıkta değil,
          ortaklıkta yatar.
        </blockquote>
      </section>

      {/* XII. QUIZ */}
      <section className="endo-section reveal">
        <div className="endo-num">XII</div>
        <h2 className="endo-h2">Mini Quiz</h2>
        <div className="endo-quiz">
          {!done ? (
            <>
              <div className="endo-quiz-top"><span>Soru {quizQ + 1} / {quizQs.length}</span><span className="endo-quiz-score">Puan: {score}</span></div>
              <h3 className="endo-quiz-q">{quizQs[quizQ].text}</h3>
              <div className="endo-quiz-opts">
                {quizQs[quizQ].opts.map((o, oi) => {
                  const sel = answered[quizQ]; const isAns = sel !== undefined; const correct = quizQs[quizQ].a;
                  let cls = 'endo-opt'; if (isAns) { if (oi === correct) cls += ' correct'; else if (oi === sel) cls += ' wrong'; else cls += ' dim'; }
                  return (<button key={oi} className={cls} onClick={() => answerQ(oi)} disabled={isAns}><span className="endo-opt-letter">{String.fromCharCode(65 + oi)}</span>{o}</button>);
                })}
              </div>
            </>
          ) : (
            <div className="endo-quiz-result">
              <div className="endo-quiz-emoji">{score >= 8 ? '🏆' : score >= 5 ? '🧬' : '📖'}</div>
              <h3 className="endo-quiz-rtitle">{score} / {quizQs.length} doğru</h3>
              <p className="endo-quiz-rdesc">{score >= 8 ? 'İçindeki kadim bakteriyi tam anlamışsın!' : score >= 5 ? 'Güzel — birleşmenin mantığını çözüyorsun.' : 'Yukarı kaydırıp bir kez daha sindir.'}</p>
              <button className="endo-ctrl-btn endo-ctrl-primary" onClick={restartQuiz}>↺ Tekrar dene</button>
            </div>
          )}
        </div>
      </section>

      <ArticleBibliography items={refs} accent="#f4b740" />

      <footer className="endo-footer">
        <div className="endo-footer-mark">BASEMENTS</div>
        <p>Bir dahaki nefesinde, o enerjiyi üreten şeyin bir zamanlar serbest yüzen bir bakteri olduğunu hatırla. Sen, iki kadim canlının iki milyar yıl önce verdiği bir kararın yaşayan devamısın. 🧬</p>
        <Link href="/discover" className="endo-footer-link">← Diğer içerikleri keşfet</Link>
      </footer>

      <style>{`
        /* ArticleImage'ın slate varsayılanlarını makalenin menekşe-altın paletine bağla. */
        .endo-img {
          --ai-caption: #ded6e4;
          --ai-credit: #a99fb0;
          --ai-border: rgba(176,140,240,0.22);
          --ai-fill: rgba(176,140,240,0.05);
          --ai-mark: rgba(176,140,240,0.28);
        }
        .endo-img-pair { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; align-items: start; }
        @media (max-width: 700px) { .endo-img-pair { grid-template-columns: 1fr; } }
        .endo-page { --bg:#0c0a14; --panel:rgba(255,255,255,0.03); --line:rgba(176,140,240,0.15); --ink:#efe9f2; --muted:#a99fb0; --gold:#f4b740; --violet:#b08cf0; --green:#34d399; --cyan:#7dd3fc; --rose:#f472b6;
          background:
            radial-gradient(1100px 540px at 80% -6%, rgba(244,183,64,0.08), transparent 60%),
            radial-gradient(900px 620px at 0% 10%, rgba(176,140,240,0.10), transparent 55%),
            var(--bg);
          color: var(--ink); font-family: -apple-system, 'Segoe UI', system-ui, sans-serif; line-height: 1.72;
          font-size: 17px; -webkit-font-smoothing: antialiased; overflow-x: hidden;
        }
        .endo-page *::selection { background: rgba(244,183,64,0.30); color: #1a1206; }

        .endo-topbar { position: sticky; top: 0; z-index: 30; display: flex; align-items: center; gap: 12px; padding: 12px 20px;
          background: rgba(12,10,20,0.74); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); }
        .endo-back { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 10px; color: var(--violet);
          border: 1px solid var(--line); background: var(--panel); transition: .2s; flex-shrink: 0; }
        .endo-back:hover { background: rgba(176,140,240,0.12); transform: translateX(-2px); }
        .endo-topbar-title { font-weight: 700; letter-spacing: .04em; font-size: .9rem; color: var(--muted); }

        .endo-hero { position: relative; max-width: 840px; margin: 0 auto; padding: 76px 24px 40px; text-align: center; }
        .endo-hero-glow { position: absolute; inset: -10% 0 auto; height: 360px; margin: auto;
          background: radial-gradient(closest-side, rgba(244,183,64,0.16), transparent 72%); filter: blur(22px); pointer-events: none; z-index: 0; }
        .endo-hero-art { position: relative; z-index: 1; display: flex; justify-content: center; margin-bottom: 16px;
          filter: drop-shadow(0 0 22px rgba(176,140,240,0.30)); animation: endo-float 8s ease-in-out infinite; }
        @keyframes endo-float { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-9px); } }
        .endo-hero-eyebrow { position: relative; z-index: 1; font-size: .73rem; letter-spacing: .2em; color: var(--gold); margin-bottom: 12px; font-weight: 600; }
        .endo-hero-title { position: relative; z-index: 1; font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif;
          font-size: clamp(2.8rem, 8vw, 4.8rem); line-height: 1.02; margin: 0 0 18px; font-weight: 700; letter-spacing: -.01em;
          background: linear-gradient(105deg, var(--gold) 0%, #f6d28a 30%, var(--rose) 62%, var(--violet) 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent; }
        .endo-hero-sub { position: relative; z-index: 1; font-size: 1.14rem; color: #d6cee0; max-width: 680px; margin: 0 auto; }
        .endo-hero-sub strong { color: var(--ink); font-weight: 700; }
        .endo-hero-tags { position: relative; z-index: 1; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 24px; }
        .endo-tag { font-size: .76rem; padding: 6px 13px; border-radius: 999px; border: 1px solid var(--line); color: var(--violet); background: var(--panel); }

        .endo-section { position: relative; max-width: 760px; margin: 0 auto; padding: 40px 24px; border-top: 1px solid var(--line); }
        .endo-num { font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; font-size: 1.1rem; font-weight: 700; color: var(--gold); letter-spacing: .08em; margin-bottom: 6px; }
        .endo-h2 { font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; font-size: clamp(1.55rem, 4.4vw, 2.15rem); line-height: 1.2; margin: 0 0 18px; font-weight: 700; letter-spacing: -.01em; color: #f6f1f8; }
        .endo-lead { font-size: 1.2rem; color: #e0d8e6; margin: 0 0 16px; font-weight: 500; }
        .endo-p { margin: 0 0 16px; color: #cabfd2; }
        .endo-p:last-child { margin-bottom: 0; }
        .endo-p strong, .endo-lead strong { color: var(--ink); font-weight: 700; }
        .endo-p em, .endo-lead em { color: var(--gold); font-style: italic; }

        .endo-quote { margin: 22px 0 4px; padding: 16px 22px; border-left: 3px solid var(--violet); border-radius: 0 12px 12px 0;
          background: linear-gradient(90deg, rgba(176,140,240,0.09), transparent); font-size: 1.14rem; font-style: italic; color: #ece4f2;
          font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; }
        .endo-quote em { color: var(--gold); }
        .endo-quote-final { border-left-color: var(--gold); background: linear-gradient(90deg, rgba(244,183,64,0.10), transparent); }

        .endo-note { display: flex; gap: 13px; align-items: flex-start; margin: 20px 0 4px; padding: 15px 18px; border-radius: 14px; background: var(--panel); border: 1px solid var(--line); }
        .endo-note span:first-child { font-size: 1.3rem; line-height: 1.3; flex-shrink: 0; }
        .endo-note p { margin: 0; font-size: .96rem; color: #c2b6cd; }
        .endo-note strong { color: var(--violet); }
        .endo-note-warn { background: rgba(244,183,64,0.06); border-color: rgba(244,183,64,0.22); }
        .endo-note-warn strong { color: var(--gold); }

        /* STEPPER */
        .endo-stepper { display: grid; grid-template-columns: 0.95fr 1.05fr; gap: 18px; align-items: stretch; margin: 22px 0 6px; background: var(--panel); border: 1px solid var(--line); border-radius: 18px; padding: 16px; }
        .endo-stepper-viz { display: grid; place-items: center; background: radial-gradient(circle at 50% 42%, rgba(176,140,240,0.08), transparent 70%); border-radius: 12px; min-height: 230px; }
        .endo-svg { width: 100%; max-width: 280px; height: auto; }
        .endo-stepper-panel { display: flex; flex-direction: column; }
        .endo-dots { display: flex; gap: 7px; margin-bottom: 12px; }
        .endo-dot { width: 9px; height: 9px; border-radius: 50%; border: none; background: rgba(176,140,240,0.25); cursor: pointer; transition: .2s; padding: 0; }
        .endo-dot.on { background: var(--gold); box-shadow: 0 0 10px rgba(244,183,64,0.7); transform: scale(1.25); }
        .endo-step-meta { font-size: .73rem; letter-spacing: .08em; color: var(--violet); font-weight: 600; }
        .endo-step-title { font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; font-size: 1.2rem; margin: 4px 0 8px; color: #f6f1f8; font-weight: 700; }
        .endo-step-desc { font-size: .95rem; color: #c4b9d0; margin: 0 0 16px; flex: 1; }
        .endo-stepper-ctrl { display: flex; gap: 10px; }
        .endo-ctrl-btn { flex: 1; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--line); background: rgba(255,255,255,0.02); color: var(--ink); font-size: .88rem; font-weight: 600; cursor: pointer; transition: .2s; font-family: inherit; }
        .endo-ctrl-btn:hover:not(:disabled) { border-color: var(--violet); background: rgba(176,140,240,0.10); }
        .endo-ctrl-btn:disabled { opacity: .38; cursor: not-allowed; }
        .endo-ctrl-primary { background: linear-gradient(120deg, var(--gold), #f6d28a); border-color: transparent; color: #3a2a06; }
        .endo-ctrl-primary:hover:not(:disabled) { filter: brightness(1.06); }

        /* TOGGLE / NEST */
        .endo-toggle { display: flex; gap: 8px; margin: 16px 0; padding: 5px; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; }
        .endo-toggle-btn { flex: 1; padding: 11px; border-radius: 10px; border: none; background: transparent; color: var(--muted); font-size: .94rem; font-weight: 700; cursor: pointer; transition: .2s; font-family: inherit; }
        .endo-toggle-btn.on { color: #2a1640; background: linear-gradient(120deg, var(--violet), #c8b3f5); box-shadow: 0 4px 18px rgba(176,140,240,0.22); }
        .endo-toggle-btn:not(.on):hover { color: var(--ink); }
        .endo-nest { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 16px; align-items: center; padding: 18px; border-radius: 16px; border: 1px solid var(--line); background: var(--panel); }
        .endo-nest-viz { display: grid; place-items: center; }
        .endo-nest-body { animation: endo-fade .35s ease; }
        @keyframes endo-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .endo-nest-body h4 { margin: 0 0 8px; font-size: 1.16rem; color: #f6f1f8; font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; }
        .endo-nest-body p { margin: 0; color: #cabfd2; font-size: .97rem; }
        .endo-nest-body strong { color: var(--ink); }
        .endo-nest-body em { color: var(--gold); font-style: italic; }

        /* TIMELINE */
        .endo-timeline { list-style: none; margin: 22px 0 0; padding: 0 0 0 6px; position: relative; }
        .endo-timeline::before { content: ''; position: absolute; left: 11px; top: 6px; bottom: 6px; width: 2px; background: linear-gradient(var(--gold), var(--rose), var(--violet)); opacity: .42; }
        .endo-tl-item { position: relative; padding: 0 0 22px 38px; }
        .endo-tl-item:last-child { padding-bottom: 0; }
        .endo-tl-dot { position: absolute; left: 4px; top: 5px; width: 16px; height: 16px; border-radius: 50%; background: var(--bg); border: 3px solid var(--gold); box-shadow: 0 0 12px rgba(244,183,64,0.5); }
        .endo-tl-year { font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; font-size: .92rem; font-weight: 700; color: var(--gold); }
        .endo-tl-body { margin-top: 3px; }
        .endo-tl-body strong { display: block; color: #f6f1f8; font-size: 1.05rem; margin-bottom: 3px; }
        .endo-tl-body span { color: #c2b6cd; font-size: .95rem; }

        /* CARDS */
        .endo-cards { display: grid; gap: 12px; margin: 20px 0 4px; }
        .endo-card { display: flex; gap: 14px; align-items: flex-start; padding: 16px 18px; border-radius: 14px; background: var(--panel); border: 1px solid var(--line); transition: .25s; }
        .endo-card:hover { border-color: rgba(176,140,240,0.36); transform: translateY(-2px); background: rgba(176,140,240,0.04); }
        .endo-card-e { font-size: 1.5rem; line-height: 1.2; flex-shrink: 0; }
        .endo-card strong { display: block; color: #f6f1f8; font-size: 1.05rem; margin-bottom: 4px; }
        .endo-card span { display: block; color: #c2b6cd; font-size: .93rem; }

        /* FACTS GRID */
        .endo-facts { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 18px 0 4px; }
        .endo-fact { padding: 15px 16px; border-radius: 14px; background: rgba(52,211,153,0.06); border: 1px solid rgba(52,211,153,0.20); }
        .endo-fact strong { display: block; color: var(--green); font-size: .98rem; margin-bottom: 4px; }
        .endo-fact span { display: block; color: #c2cdc8; font-size: .87rem; }

        /* QUIZ */
        .endo-quiz { background: var(--panel); border: 1px solid var(--line); border-radius: 18px; padding: 22px; }
        .endo-quiz-top { display: flex; justify-content: space-between; font-size: .82rem; color: var(--muted); margin-bottom: 12px; }
        .endo-quiz-score { color: var(--gold); font-weight: 700; }
        .endo-quiz-q { font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; font-size: 1.22rem; margin: 0 0 16px; color: #f6f1f8; line-height: 1.4; }
        .endo-quiz-opts { display: grid; gap: 10px; }
        .endo-opt { display: flex; align-items: center; gap: 13px; text-align: left; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--line); background: rgba(255,255,255,0.02); color: var(--ink); font-size: .94rem; cursor: pointer; transition: all .2s; font-family: inherit; }
        .endo-opt:not(:disabled):hover { border-color: var(--violet); background: rgba(176,140,240,0.08); }
        .endo-opt-letter { width: 25px; height: 25px; border-radius: 7px; display: grid; place-items: center; font-weight: 700; font-size: .78rem; background: rgba(176,140,240,0.14); color: var(--violet); flex-shrink: 0; }
        .endo-opt.correct { border-color: var(--green) !important; background: rgba(52,211,153,0.14) !important; }
        .endo-opt.correct .endo-opt-letter { background: var(--green) !important; color: #06241a; }
        .endo-opt.wrong { border-color: var(--rose) !important; background: rgba(244,114,182,0.13) !important; }
        .endo-opt.wrong .endo-opt-letter { background: var(--rose) !important; color: #fff; }
        .endo-opt.dim { opacity: .45; }
        .endo-opt:disabled { cursor: default; }
        .endo-quiz-result { text-align: center; padding: 14px; }
        .endo-quiz-emoji { font-size: 3rem; }
        .endo-quiz-rtitle { font-family: 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; font-size: 1.5rem; margin: 6px 0; color: var(--gold); }
        .endo-quiz-rdesc { color: #c4b9d0; margin: 0 0 16px; }
        .endo-quiz-result .endo-ctrl-primary { display: inline-block; padding: 11px 22px; flex: none; }

        /* FOOTER */
        .endo-footer { max-width: 760px; margin: 0 auto; padding: 44px 24px 70px; text-align: center; border-top: 1px solid var(--line); }
        .endo-footer-mark { font-weight: 800; letter-spacing: .3em; color: var(--gold); font-size: .82rem; margin-bottom: 14px; }
        .endo-footer p { color: #c4b9d0; font-size: 1rem; max-width: 580px; margin: 0 auto 18px; }
        .endo-footer-link { color: var(--violet); font-weight: 600; text-decoration: none; border-bottom: 1px solid transparent; transition: .2s; }
        .endo-footer-link:hover { border-bottom-color: var(--violet); }

        /* REVEAL */
        .reveal { opacity: 0; transform: translateY(22px); transition: opacity .7s ease, transform .7s ease; }
        .reveal.visible { opacity: 1; transform: none; }

        @media (max-width: 720px) {
          .endo-stepper, .endo-nest { grid-template-columns: 1fr; }
          .endo-stepper-viz { min-height: 180px; }
        }
        @media (max-width: 540px) {
          .endo-page { font-size: 16px; }
          .endo-facts { grid-template-columns: 1fr; }
          .endo-toggle { flex-direction: row; }
        }
        @media (prefers-reduced-motion: reduce) {
          .endo-hero-art { animation: none; }
          .reveal { transition: none; opacity: 1; transform: none; }
          .endo-nest-body { animation: none; }
        }
      `}</style>
    </main>
  );
}
