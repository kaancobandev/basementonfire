'use client';

import { useEffect, useState, type ReactNode, type CSSProperties } from 'react';
import Link from 'next/link';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import ArticleImage from '@/app/components/article/ArticleImage';

/* ════════════════════════ VERİ ════════════════════════ */

const families = [
  { key: 'tardyon', name: 'Tardyon', tr: 'Yavaşlar', icon: '🐢', color: '#22d3ee', speed: 'Işıktan YAVAŞ (v < c)', ex: 'Sen, ben, elektron, gezegenler', note: 'Gerçek kütleli sıradan madde. Hızlandıkça enerji ister; ışık hızına asla ulaşamaz.' },
  { key: 'luxon', name: 'Luxon', tr: 'Işık hızında', icon: '💡', color: '#fbbf24', speed: 'Tam ışık hızında (v = c)', ex: 'Foton (ışık), kütlesiz parçacıklar', note: 'Kütlesizdir, hep tam ışık hızında gider — ne hızlanır ne yavaşlar. Tam bariyerin üstünde sörf yapar.' },
  { key: 'tachyon', name: 'Takyon', tr: 'Hızlılar', icon: '⚡', color: '#f472b6', speed: 'Işıktan HIZLI (v > c)', ex: 'Varsayımsal — kanıtı yok', note: 'Sanal kütleli farazi parçacık. Hep ışıktan hızlıdır; asla ışık hızına yavaşlayamaz.' },
];

const ftlLegal = [
  { id: 'shadow', t: 'Gölge', icon: '🌑', color: '#22d3ee',
    d: 'Elini lambanın önünde azıcık oynat; uzaktaki bir duvarda gölge metrelerce kayar. Duvar yeterince uzaksa gölge ışıktan hızlı hareket edebilir — çünkü gölge bir "şey" değil, ışığın yokluğudur. Hiçbir madde ya da bilgi taşımaz, o yüzden kural bozulmaz.' },
  { id: 'scissors', t: 'Makasın ucu', icon: '✂️', color: '#a78bfa',
    d: 'Çok uzun bir makası kapatırken, bıçakların kesişme noktası uçlara doğru ışıktan hızlı ilerleyebilir. Ama o "nokta" fiziksel bir nesne değil; sadece iki kenarın buluştuğu yerin adı. Hiçbir parça oraya ışıktan hızlı seyahat etmez.' },
  { id: 'laser', t: 'Lazer beneği', icon: '🔦', color: '#f472b6',
    d: 'Bir lazeri Ay\'a tutup bileğini hızlıca çevir; benek, Ay yüzeyinde ışıktan hızlı süpürülebilir. Yine bilgi gönderimi yok — benek bir desen, taşıyıcı değil. Aydaki bir noktadan diğerine hiçbir şey gitmiyor.' },
  { id: 'expansion', t: 'Evrenin genişlemesi', icon: '🌌', color: '#fbbf24',
    d: 'Çok uzak galaksiler bizden ışıktan hızlı uzaklaşıyor olabilir — ama uzayın kendisi genişlediği için. Galaksiler uzayın İÇİNDE ışıktan hızlı gitmiyor. Kural, uzayın içindeki harekete konmuştur; uzayın kendi esnemesine değil.' },
];

const history = [
  { t: 'Işık bariyeri çiziliyor', y: '1905', d: 'Einstein\'ın özel görelilik kuramı, kütleli hiçbir şeyin ışık hızına ulaşamayacağını gösterir. Işık, evrenin hız limiti olur.' },
  { t: '"Meta-Relativite"', y: '1962', d: 'Bilaniuk, Deshpande ve Sudarshan, görelilik denklemlerinin aslında ışıktan hızlı parçacıkları YASAKLAMADIĞINI gösterir — yeter ki bu parçacıklar asla ışık hızının altına inmesin.' },
  { t: '"Takyon" doğuyor', y: '1967', d: 'Gerald Feinberg bu farazi parçacıklara Yunanca "tachys" (hızlı) kökünden "takyon" adını verir. İlhamı, James Blish\'in "Beep" adlı bilimkurgu öyküsüydü.' },
  { t: 'Avlar başlıyor', y: '1970\'ler+', d: 'Hızlandırıcılarda, kozmik ışınlarda ve astrofiziksel gözlemlerde takyon aranır. Onlarca yıl süren aramalardan tek bir kanıt çıkmaz.' },
  { t: 'OPERA telaşı', y: '2011', d: 'Nötrinoların ışıktan 60 nanosaniye hızlı göründüğü ölçüm dünyayı sarsar — ama suçlu gevşek bir fiber-optik kablo çıkar. Hata düzeltilir, ışık limiti yerinde kalır.' },
];

const quizQs = [
  { text: 'Takyon nedir?', opts: ['Işıktan yavaş bir parçacık', 'Varsayımsal, hep ışıktan hızlı bir parçacık', 'Bir tür ışık', 'Kara delik çekirdeği'], a: 1 },
  { text: 'Bir takyonun (varsa) kütlesi nasıl tanımlanır?', opts: ['Sıfır', 'Negatif', 'Sanal (imajiner)', 'Sonsuz'], a: 2 },
  { text: 'Takyonlar neden nedenselliği (sebep-sonucu) tehdit eder?', opts: ['Çok ağır oldukları için', 'Işıktan hızlı bilgi → kendi geçmişine mesaj göndermek', 'Görünmez oldukları için', 'Kara deliklerden çıktıkları için'], a: 1 },
  { text: '2011 OPERA "ışıktan hızlı nötrino" sonucunun gerçek sebebi neydi?', opts: ['Gerçek takyonlar', 'Gevşek bir fiber-optik kablo', 'Güneş patlaması', 'Yazılım virüsü'], a: 1 },
  { text: 'Aşağıdakilerden hangisi ışıktan hızlı olabilir ama kuralı BOZMAZ?', opts: ['Bir elektron', 'Duvardaki bir gölge', 'Bir uzay gemisi', 'Bir foton'], a: 1 },
  { text: 'Modern fizikte (kuantum alan kuramı) "takyon" çoğunlukla neyi ifade eder?', opts: ['Gerçek ışıktan hızlı parçacık', 'Bir alanın kararsızlığı (negatif kütle-kare)', 'Yeni bir enerji türü', 'Antimadde'], a: 1 },
];

const refs: BibItem[] = [
  { title: 'Possibility of Faster-Than-Light Particles', authors: 'Gerald Feinberg', year: '1967', source: 'Physical Review 159 (5), 1089' },
  { title: 'Meta Relativity', authors: 'Bilaniuk, Deshpande & Sudarshan', year: '1962', source: 'American Journal of Physics 30 (10), 718' },
  { title: 'Tachyon', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Tachyon' },
  { title: 'What is known about tachyons?', source: 'Scientific American', url: 'https://www.scientificamerican.com/article/what-is-known-about-tachy/' },
  { title: 'Tachyons: Facts about these faster-than-light particles', source: 'Space.com', url: 'https://www.space.com/tachyons-facts-about-particles' },
  { title: 'Do tachyons exist? (Physics FAQ)', authors: 'John Baez', source: 'UC Riverside', url: 'https://math.ucr.edu/home/baez/physics/ParticleAndNuclear/tachyons.html' },
  { title: 'Tachyons and Faster-than-Light (FTL)', source: 'Physics LibreTexts', url: 'https://phys.libretexts.org/Bookshelves/Relativity/Special_Relativity_(Crowell)/04%3A_Dynamics/4.07%3A_Tachyons_and_Faster-than-Light_(FTL)' },
  { title: 'Tachyonic field (tachyon condensation)', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Tachyonic_field' },
  { title: '2011 OPERA faster-than-light neutrino anomaly', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/2011_OPERA_faster-than-light_neutrino_anomaly' },
];

/* ════════════════════════ YARDIMCI: STEPPER ════════════════════════ */

function Stepper({ steps, accent, children }: { steps: { t: string; d: string; y?: string }[]; accent: string; children: (i: number) => ReactNode }) {
  const [i, setI] = useState(0);
  return (
    <div className="tky-stepper">
      <div className="tky-stepper-viz">{children(i)}</div>
      <div className="tky-stepper-panel">
        <div className="tky-dots">
          {steps.map((_, k) => (
            <button key={k} className={`tky-dot ${k === i ? 'on' : ''}`} onClick={() => setI(k)} aria-label={`Adım ${k + 1}`}
              style={k <= i ? { background: accent, borderColor: accent } : undefined} />
          ))}
        </div>
        <div className="tky-step-meta" style={{ color: accent }}>{steps[i].y ? steps[i].y : `ADIM ${i + 1} / ${steps.length}`}</div>
        <h4 className="tky-step-title">{steps[i].t}</h4>
        <p className="tky-step-desc">{steps[i].d}</p>
        <div className="tky-stepper-ctrl">
          <button className="tky-ctrl-btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>← Geri</button>
          <button className="tky-ctrl-btn tky-ctrl-primary" style={{ background: accent, borderColor: accent }} onClick={() => setI(Math.min(steps.length - 1, i + 1))} disabled={i === steps.length - 1}>İleri →</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════ ANA BİLEŞEN ════════════════════════ */

export default function TakyonClient() {
  const [speed, setSpeed] = useState(50); // % ışık hızı
  const [openFtl, setOpenFtl] = useState<string | null>('shadow');

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
    setTimeout(() => {
      if (quizQ + 1 < quizQs.length) setQuizQ((q) => q + 1);
      else setDone(true);
    }, 900);
  }
  function restartQuiz() { setQuizQ(0); setScore(0); setAnswered({}); setDone(false); }

  // Lorentz faktörü (enerji ~ gamma): hız arttıkça patlar
  const v = speed / 100;
  const gamma = speed >= 100 ? Infinity : 1 / Math.sqrt(1 - v * v);
  const energyPct = Math.min(100, ((gamma - 1) / (10 - 1)) * 100); // görsel bar (gamma 1→10)

  return (
    <main className="main-content tky-page">

      {/* ── Üst bar ── */}
      <div className="tky-topbar">
        <Link href="/" className="tky-back" aria-label="Ana sayfa">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        </Link>
        <span className="tky-topbar-title">Takyonlar</span>
      </div>

      {/* ── HERO ── */}
      <header className="tky-hero">
        <div className="tky-warp" aria-hidden="true">
          {Array.from({ length: 22 }).map((_, i) => (
            <span key={i} className="tky-streak" style={{ ['--i' as any]: i, top: `${(i * 4.5) % 100}%`, animationDelay: `${(i % 7) * 0.35}s` } as CSSProperties} />
          ))}
        </div>
        <div className="tky-hero-eyebrow">IŞIK BARİYERİNİN ÖTESİ</div>
        <h1 className="tky-hero-title"><span className="tky-grad">TAKYONLAR</span></h1>
        <p className="tky-hero-sub">
          Evrenin en katı kuralı şudur: hiçbir şey ışıktan hızlı gidemez. Ama ya bu kuralı doğuştan çiğneyen,
          <strong> hiç yavaşlayamayacak kadar hızlı</strong> bir parçacık olsaydı? Karşınızda fiziğin en kışkırtıcı
          hayaleti: ışıktan hızlı doğan, zamanı tersine akıtabilecek farazi parçacık.
        </p>
        <div className="tky-hero-tags">
          {['Sanal kütle', 'Işık bariyeri', 'Nedensellik', 'Anti-telefon', 'OPERA 2011', 'Cherenkov', 'Görelilik'].map((t) => (
            <span key={t} className="tky-tag">{t}</span>
          ))}
        </div>
      </header>

      {/* ── 1. NEDİR ── */}
      <section className="tky-section reveal">
        <div className="tky-kicker">01 — Tanışma</div>
        <h2 className="tky-h2">Takyon Nedir?</h2>
        <p className="tky-p">
          <strong>Takyon</strong>, her zaman ışıktan hızlı hareket ettiği varsayılan kuramsal bir parçacıktır.
          Henüz hiç gözlenmedi; sadece denklemlerin köşesinde yaşayan bir olasılık. Adı Yunanca <em>tachys</em>
          (hızlı) kelimesinden gelir.
        </p>
        <p className="tky-p">
          İşte en şaşırtıcı yanı: Bizim dünyamızda hiçbir şey ışık hızını <em>aşamaz</em>. Takyonlar içinse tam tersi
          geçerli olurdu — onlar ışık hızının <em>altına inemezdi</em>. Sanki ışık hızı, iki ayrı ülkeyi bölen bir
          nehir gibi: biz bu yakada, takyonlar karşı yakada; ikimiz de o nehri geçemeyiz.
        </p>
        <div className="tky-callout">
          <span className="tky-callout-icon">🧭</span>
          <p><strong>Benzetme:</strong> Hız limiti bir duvar değil, bir <strong>uçurum</strong> gibidir. Biz uçurumun
          yamacında yukarı tırmanırız ama tepeye (ışık hızına) asla varamayız. Takyonlar ise uçurumun
          <strong> öbür tarafında</strong> doğmuş, aşağı inemeyenlerdir.</p>
        </div>
      </section>

      {/* ── 2. ÜÇ AİLE ── */}
      <section className="tky-section reveal">
        <div className="tky-kicker">02 — Parçacık Aileleri</div>
        <h2 className="tky-h2">Evrenin Üç Hız Ailesi</h2>
        <p className="tky-p">Göreliliğe göre parçacıklar, ışık bariyerine göre üç gruba ayrılır. Takyon, en uçtaki farazi ailedir:</p>
        <div className="tky-families">
          {families.map((f) => (
            <div key={f.key} className="tky-fam" style={{ ['--fc' as any]: f.color } as CSSProperties}>
              <div className="tky-fam-ico">{f.icon}</div>
              <h3 className="tky-fam-name">{f.name}<small>{f.tr}</small></h3>
              <div className="tky-fam-speed">{f.speed}</div>
              <p className="tky-fam-note">{f.note}</p>
              <div className="tky-fam-ex">örn: {f.ex}</div>
            </div>
          ))}
        </div>
        {/* bariyer diyagramı */}
        <div className="tky-diagram">
          <svg viewBox="0 0 680 120" className="tky-svg">
            <line x1="20" y1="80" x2="660" y2="80" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            {/* bariyer */}
            <line x1="340" y1="24" x2="340" y2="96" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="5 4" />
            <text x="340" y="16" textAnchor="middle" fontSize="11" fill="#fbbf24" fontWeight="700">IŞIK HIZI (c)</text>
            <text x="170" y="106" textAnchor="middle" fontSize="11" fill="#22d3ee">🐢 Tardyonlar (v &lt; c)</text>
            <text x="510" y="106" textAnchor="middle" fontSize="11" fill="#f472b6">⚡ Takyonlar (v &gt; c)</text>
            <circle cx="120" cy="80" r="8" fill="#22d3ee" /><circle cx="220" cy="80" r="8" fill="#22d3ee" />
            <circle cx="340" cy="80" r="8" fill="#fbbf24" />
            <circle cx="460" cy="80" r="8" fill="#f472b6" /><circle cx="560" cy="80" r="8" fill="#f472b6" />
            <text x="340" y="68" textAnchor="middle" fontSize="14">💡</text>
          </svg>
        </div>
      </section>

      {/* ── 3. IŞIK BARİYERİ (interaktif) ── */}
      <section className="tky-section reveal">
        <div className="tky-kicker">03 — Aşılmaz Duvar</div>
        <h2 className="tky-h2">Neden Işık Hızı Bir Limit?</h2>

        <div className="tky-img-wrap">
          <ArticleImage
            className="tky-img"
            src="/articles/takyon/einstein-patent-ofisi.webp"
            ratio="1600 / 2303"
            alt="Genç, bıyıklı bir adamın siyah beyaz portresi; takım elbise ve kravatla, kollarını kavuşturmuş oturuyor."
            caption="Albert Einstein, Bern'deki patent ofisinde çalıştığı yıllarda. Işık bariyerini çizen 1905 tarihli özel görelilik kuramı bu dönemin ürünü."
            credit="Lucien Chavan · kamu malı"
          />
        </div>
        <p className="tky-p">
          Bir nesneyi ne kadar hızlandırırsan, onu daha da hızlandırmak o kadar zorlaşır. Işık hızına yaklaştıkça
          gereken enerji <strong>roket gibi tırmanır</strong>; tam ışık hızı için <strong>sonsuz enerji</strong>
          gerekir. İşte bariyer bu: sonsuz enerjiyi kimse karşılayamaz. Kaydırağı çek, enerjinin nasıl patladığını gör:
        </p>
        <div className="tky-energy">
          <div className="tky-energy-row">
            <span className="tky-energy-label">Hız</span>
            <input type="range" min={0} max={99} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="tky-slider" aria-label="Hız (ışık hızının yüzdesi)" />
            <span className="tky-energy-num">%{speed} c</span>
          </div>
          <div className="tky-energy-bars">
            <div className="tky-eb">
              <span>Gereken enerji</span>
              <div className="tky-eb-track"><div className="tky-eb-fill" style={{ width: `${energyPct}%`, background: energyPct > 80 ? 'linear-gradient(90deg,#f472b6,#ef4444)' : 'linear-gradient(90deg,#22d3ee,#a78bfa)' }} /></div>
              <span className="tky-eb-v">×{gamma === Infinity ? '∞' : gamma.toFixed(2)}</span>
            </div>
          </div>
          <p className="tky-energy-msg">
            {speed < 50 && 'Düşük hızda enerji makul artıyor — günlük dünyamız böyle.'}
            {speed >= 50 && speed < 85 && 'Hız arttıkça enerji belirgin şekilde tırmanmaya başladı.'}
            {speed >= 85 && speed < 97 && 'Dikkat! Enerji çığ gibi büyüyor — bariyere yaklaşıyorsun.'}
            {speed >= 97 && '🚧 %100\'e ulaşmak SONSUZ enerji ister. İşte aşılamaz duvar bu.'}
          </p>
        </div>
        <p className="tky-hint">💡 Takyonlar bu sorunu “hile” ile çözer: onlar zaten bariyerin öbür yanında doğar, yani hiç tırmanmaları gerekmez. Ama bunun bedeli, kütlelerinin <strong>sanal</strong> olmasıdır.</p>
      </section>

      {/* ── 4. SANAL KÜTLE ── */}
      <section className="tky-section reveal">
        <div className="tky-kicker">04 — Tuhaf Matematik</div>
        <h2 className="tky-h2">Sanal Kütle (Imaginary Mass)</h2>
        <p className="tky-p">
          Görelilik denklemleri bir takyonun kütlesinin <strong>sanal sayı</strong> olmasını gerektirir — yani
          karesi <strong>negatif</strong> olan bir sayı. Okulda “negatif sayının karekökü yoktur” diye öğrendiğin
          o tuhaf bölge. Matematikçiler buna <em>i</em> (= √−1) der.
        </p>
        <div className="tky-formula">
          <span className="tky-f-main">m = i · |m|</span>
          <span className="tky-f-sub">(kütlenin karesi negatif: m² &lt; 0)</span>
        </div>
        <div className="tky-callout">
          <span className="tky-callout-icon">🍋</span>
          <p><strong>Benzetme:</strong> “Sanal kütle”yi, tarifte yazan ama markette olmayan bir malzeme gibi düşün.
          Hesapta işe yarıyor, denklem güzelce çözülüyor — ama onu elimize alıp tartamayız. Fizikçileri rahatsız eden
          tam da budur: matematik “olabilir” diyor, ama doğada karşılığı görünmüyor.</p>
        </div>
      </section>

      {/* ── 5. TERS DAVRANIŞ ── */}
      <section className="tky-section reveal">
        <div className="tky-kicker">05 — Tersine Dünya</div>
        <h2 className="tky-h2">Enerji Azalınca Hızlanmak</h2>
        <p className="tky-p">
          Bizim dünyamızda enerji verirsen hızlanırsın. Takyonlar bunun <strong>tam tersini</strong> yapar:
          enerjisi azaldıkça <strong>daha da hızlanır</strong>. Bir takyon enerjisini tümüyle kaybederse
          <strong> sonsuz hıza</strong> ulaşır; onu yavaşlatmak için ise enerji <em>yüklemen</em> gerekir.
        </p>
        <div className="tky-vs">
          <div className="tky-vs-col" style={{ borderColor: 'rgba(34,211,238,0.3)' }}>
            <div className="tky-vs-h" style={{ color: '#22d3ee' }}>🚗 Sıradan madde</div>
            <p>Gaza bas (enerji ver) → hızlan. Fren yap (enerji al) → yavaşla. Sezgilerimize uyar.</p>
          </div>
          <div className="tky-vs-col" style={{ borderColor: 'rgba(244,114,182,0.3)' }}>
            <div className="tky-vs-h" style={{ color: '#f472b6' }}>⚡ Takyon</div>
            <p>Frene bas (enerji kaybet) → <strong>hızlanır!</strong> Sonsuz hız için enerjisi sıfır olmalı. Sezgilerimizi baş aşağı çevirir.</p>
          </div>
        </div>
      </section>

      {/* ── 6. NEDENSELLİK ── */}
      <section className="tky-section reveal">
        <div className="tky-kicker">06 — Asıl Sorun</div>
        <h2 className="tky-h2">Nedensellik & “Takyon Anti-Telefonu”</h2>
        <p className="tky-p">
          Takyonların fizikçileri asıl ürküten yanı hızları değil, <strong>zamanla</strong> ilişkileridir. Görelilikte
          ışıktan hızlı bir sinyal, bazı gözlemcilere göre <strong>gönderilmeden önce varır</strong>. Yani takyonlarla
          mesaj atabilseydik, kendi <strong>geçmişimize</strong> haber yollayabilirdik.
        </p>
        <div className="tky-diagram">
          <svg viewBox="0 0 460 170" className="tky-svg">
            <text x="80" y="20" textAnchor="middle" fontSize="20">📞</text>
            <text x="80" y="40" textAnchor="middle" fontSize="10" fill="#9b96b8">Sen (bugün)</text>
            <text x="380" y="20" textAnchor="middle" fontSize="20">🧓</text>
            <text x="380" y="40" textAnchor="middle" fontSize="10" fill="#9b96b8">Sen (dün)</text>
            <line x1="80" y1="50" x2="80" y2="150" stroke="rgba(255,255,255,0.12)" />
            <line x1="380" y1="50" x2="380" y2="150" stroke="rgba(255,255,255,0.12)" />
            <line x1="100" y1="70" x2="360" y2="120" stroke="#f472b6" strokeWidth="2.5" markerEnd="url(#tkyArr)" />
            <text x="230" y="84" textAnchor="middle" fontSize="11" fill="#f472b6" fontWeight="700">takyon mesajı ışıktan hızlı →</text>
            <text x="230" y="150" textAnchor="middle" fontSize="11" fill="#fbbf24">“Mesaj, gönderilmeden önce dünkü sana ulaşır.”</text>
            <defs><marker id="tkyArr" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6" fill="#f472b6" /></marker></defs>
          </svg>
        </div>
        <div className="tky-callout tky-callout-warn">
          <span className="tky-callout-icon">⏳</span>
          <p><strong>Büyükbaba paradoksu:</strong> Geçmişe mesaj gönderebilseydin, dünkü kendine “o işi yapma” diyebilir
          ve böylece bugün o mesajı gönderme sebebini ortadan kaldırabilirdin. Sebep, sonuçtan sonra gelirse evren
          kendi kuyruğunu yutar. İşte fizikçilerin takyonlardan en çok bu yüzden kaçındığı nokta.</p>
        </div>
      </section>

      {/* ── 7. TARİHÇE ── */}
      <section className="tky-section reveal">
        <div className="tky-kicker">07 — Fikrin Tarihi</div>
        <h2 className="tky-h2">Takyon Fikrinin Yolculuğu</h2>

        <div className="tky-img-wrap">
          <ArticleImage
            className="tky-img"
            src="/articles/takyon/gargamelle-notrino-izi.webp"
            ratio="1021 / 1506"
            alt="Kabarcık odası fotoğrafı: koyu zeminde kıvrılan ince beyaz izler ve bir noktadan yayılan çizgiler."
            caption="Kabarcık odasında gerçek bir nötrino etkileşiminin izi (Gargamelle, CERN). Nötrino görünmez; varlığını ancak çarptığı noktadan fırlayan parçacıkların izinden anlıyoruz."
            credit="CERN · CC BY 4.0"
          />
        </div>

        <Stepper steps={history} accent="#a78bfa">
          {(i) => (
            <svg viewBox="0 0 300 180" className="tky-svg">
              <circle cx="150" cy="80" r="46" fill="rgba(167,139,250,0.1)" stroke="#a78bfa" strokeWidth="2" />
              <text x="150" y="72" textAnchor="middle" fontSize="26" fontWeight="800" fill="#a78bfa" fontFamily="monospace">{history[i].y}</text>
              <text x="150" y="100" textAnchor="middle" fontSize="11" fill="#9b96b8">{['📏', '🧮', '✒️', '🔭', '⚠️'][i]}</text>
              {history.map((_, k) => (
                <circle key={k} cx={60 + k * 45} cy="160" r={k === i ? 6 : 3.5} fill={k <= i ? '#a78bfa' : 'rgba(255,255,255,0.2)'} />
              ))}
            </svg>
          )}
        </Stepper>
      </section>

      {/* ── 8. IŞIKTAN HIZLI AMA YASAL ── */}
      <section className="tky-section reveal">
        <div className="tky-kicker">08 — Yanılgıyı Dağıtmak</div>
        <h2 className="tky-h2">Işıktan Hızlı Ama Kuralı Bozmayan Şeyler</h2>

        <div className="tky-img-pair">
          <ArticleImage
            className="tky-img"
            src="/articles/takyon/hubble-derin-alan.webp"
            ratio="1600 / 1600"
            alt="Derin uzay fotoğrafı: siyah zeminde farklı renk ve biçimlerde yüzlerce galaksi, kimi sarmal kimi lekemsi."
            caption="Çok uzak galaksiler bizden ışıktan hızlı uzaklaşıyor olabilir — ama uzayda koştukları için değil, aradaki uzayın kendisi genişlediği için. Kural bozulmuyor."
            credit="NASA ve ESA · kamu malı"
          />
          <ArticleImage
            className="tky-img"
            src="/articles/takyon/ay-lazer-olcumu.webp"
            ratio="1600 / 1063"
            alt="Gece gökyüzüne doğru ince yeşil bir lazer huzmesi gönderen gözlemevi kubbesi."
            caption="Ay'a lazer gönderen bir ölçüm istasyonu. Bileğinizi çevirseniz Ay yüzeyindeki benek ışıktan hızlı süpürülebilir — ama benek bir desendir, taşıyıcı değil; oraya hiçbir şey ışıktan hızlı gitmez."
            credit="Wikimedia Commons · CC BY-SA"
          />
        </div>
        <p className="tky-p">
          “Hiçbir şey ışıktan hızlı gidemez” derken kastedilen aslında şudur: hiçbir <strong>madde, enerji ya da
          bilgi</strong> ışıktan hızlı yolculuk edemez. Ama bir <strong>desen</strong> ya da <strong>gölge</strong>
          rahatça aşabilir — çünkü ortada giden bir “şey” yoktur. Bir örneğe dokun:
        </p>
        <div className="tky-ftl">
          {ftlLegal.map((f) => (
            <div key={f.id} className={`tky-ftl-row ${openFtl === f.id ? 'open' : ''}`} style={{ ['--rc' as any]: f.color } as CSSProperties}>
              <button className="tky-ftl-head" onClick={() => setOpenFtl(openFtl === f.id ? null : f.id)} aria-expanded={openFtl === f.id}>
                <span className="tky-ftl-ico">{f.icon}</span>
                <span className="tky-ftl-t">{f.t}</span>
                <span className="tky-ftl-chev">{openFtl === f.id ? '−' : '+'}</span>
              </button>
              {openFtl === f.id && <div className="tky-ftl-body"><p>{f.d}</p></div>}
            </div>
          ))}
        </div>
        <p className="tky-hint">🔑 Anahtar fark: Takyonlar tehlikelidir çünkü gerçek <strong>bilgi</strong> taşırlar. Gölge ve lazer beneği taşımaz — o yüzden serbesttirler.</p>
        <p className="tky-p">
          Bizden uzaklaşan galaksilerin ışığı, tıpkı uzaklaşan bir sirenin sesinin kalınlaşması gibi daha uzun dalga
          boylarına, yani <strong>kırmızıya</strong> kayar; ışık ve gölgenin bu davranışının ardında yatan <Link href="/articles/doppler" className="article-ilink">Doppler etkisi</Link>, dalga boyunun hareketle nasıl esnediğini anlatır.
        </p>
      </section>

      {/* ── 9. CHERENKOV ── */}
      <section className="tky-section reveal">
        <div className="tky-kicker">09 — Gerçek Bir Işık-Üstü</div>
        <h2 className="tky-h2">Cherenkov Işıması — Suyun İçindeki “Ses Patlaması”</h2>
        <p className="tky-p">
          Nükleer reaktörlerin o ürpertici <strong>mavi parıltısını</strong> gördün mü? İşte gerçek bir “ışıktan
          hızlı” olay — ama bir hile ile. Işık <em>boşlukta</em> en hızlıdır; suyun içinde ise yavaşlar. Bazı
          parçacıklar suda, <strong>ışığın sudaki hızından daha hızlı</strong> ilerleyebilir ve geride bir ışık
          “şok dalgası” bırakır: o mavi parıltı.
        </p>
        <div className="tky-img-pair">
          <ArticleImage
            className="tky-img"
            src="/articles/takyon/cherenkov-mavi-parilti.webp"
            ratio="1600 / 2102"
            alt="Su altındaki reaktör çekirdeğinden yayılan yoğun, elektrik mavisi parıltı; çevresinde metal yapı elemanları."
            caption="Cherenkov ışıması: bir araştırma reaktörünün çekirdeğinden yayılan mavi parıltı. Parçacıklar suda, ışığın sudaki hızından hızlı ilerliyor — boşluktaki ışık hızını değil."
            credit="Wikimedia Commons · CC BY-SA"
          />
          <ArticleImage
            className="tky-img"
            src="/articles/takyon/ses-bariyeri-koni.webp"
            ratio="1600 / 1143"
            alt="Alçaktan uçan savaş uçağının çevresinde huni biçiminde yoğuşmuş beyaz bulut."
            caption="Görsel benzetme: uçağın çevresindeki yoğuşma konisi. Cherenkov ışıması bunun ışıktaki karşılığıdır — ama bu fotoğraftaki koni tek başına uçağın ses hızını aştığını kanıtlamaz, nem yoğuşması ses altında da oluşabilir."
            credit="U.S. Navy · kamu malı"
          />
        </div>

        <div className="tky-callout">
          <span className="tky-callout-icon">💧</span>
          <p><strong>Benzetme:</strong> Bir uçak sesten hızlı uçunca <em>ses patlaması</em> (sonic boom) yaratır.
          Cherenkov ışıması da onun ışık versiyonudur — parçacık, içinde bulunduğu ortamdaki ışığı geçince oluşan bir
          “ışık patlaması”. Yani evrensel ışık hızı (boşluktaki) hâlâ aşılmaz; aşılan, sadece suyun içindeki yavaşlamış ışıktır.</p>
        </div>
      </section>

      {/* ── 10. MODERN GÖRÜŞ ── */}
      <section className="tky-section reveal">
        <div className="tky-kicker">10 — Anlam Değişimi</div>
        <h2 className="tky-h2">Modern Fizikte “Takyon” Ne Demek?</h2>
        <p className="tky-p">
          İşte sürpriz: Bugün fizikçiler “takyon” dediğinde genellikle ışıktan hızlı bir parçacığı kastetmezler.
          Kuantum alan kuramında ve sicim kuramında <strong>takyon, bir alanın kararsız olduğunun işaretidir</strong> —
          “negatif kütle-kare” taşıyan bu alan, ışıktan hızlı sinyal göndermez; sadece bulunduğu durumun
          <strong> dengesiz</strong> olduğunu, yuvarlanıp daha kararlı bir tepeye geçmek istediğini söyler.
        </p>
        <p className="tky-p">
          Bu sürece <strong>takyon yoğunlaşması (tachyon condensation)</strong> denir. Yani modern takyon, ışıktan
          hızlı bir kaçak değil; kararsız bir vadiden kararlı bir vadiye yuvarlanmak isteyen bir top gibidir.
        </p>
        <div className="tky-callout">
          <span className="tky-callout-icon">⛰️</span>
          <p><strong>Benzetme:</strong> Bir tepenin <em>zirvesinde</em> duran top dengesizdir; en ufak dokunuşla
          yuvarlanır. “Takyonik alan” işte bu zirvedeki toptur — tehlikeli bir hız değil, bir <strong>kararsızlık</strong>
          halidir. Yuvarlanıp dibe (kararlı duruma) yerleşince “takyon” ortadan kalkar.</p>
        </div>
      </section>

      {/* ── 11. OPERA ── */}
      <section className="tky-section reveal">
        <div className="tky-kicker">11 — Büyük Telaş</div>
        <h2 className="tky-h2">2011: Işıktan Hızlı Nötrino Yanılgısı</h2>
        <p className="tky-p">
          Eylül 2011'de bilim dünyası çalkalandı: CERN'den Gran Sasso'ya gönderilen nötrinolar, ışıktan
          <strong> 60 nanosaniye hızlı</strong> görünüyordu. Einstein yanılmış mıydı? Manşetler patladı.
        </p>

        <div className="tky-img-pair">
          <ArticleImage
            className="tky-img"
            src="/articles/takyon/cngs-notrino-tuneli.webp"
            ratio="1600 / 1071"
            alt="Yeraltı tünelinde uzanan büyük metal boru hattı ve çevresindeki kablo tesisatı."
            caption="Nötrinoları CERN'den 730 km uzaktaki Gran Sasso laboratuvarına gönderen demet hattı. Nötrinolar Alpler'in altından, doğrudan kayanın içinden geçiyordu."
            credit="Maximilien Brice, CERN · CC BY 4.0"
          />
          <ArticleImage
            className="tky-img"
            src="/articles/takyon/opera-dedektoru.webp"
            ratio="1024 / 768"
            alt="Devasa, çok katmanlı ve turuncu çerçeveli parçacık dedektörü; yanında ölçek veren bir çalışan."
            caption="OPERA dedektörü. Ölçümün sonu bir devrim değil, gevşek bir fiber-optik kablo oldu: düzeltilince nötrinolar tam ışık hızında çıktı."
            credit="Wikimedia Commons · CC BY-SA 3.0"
          />
        </div>
        <p className="tky-p">
          Aylar süren titiz kontrolden sonra suçlu bulundu: <strong>gevşek bir fiber-optik kablo</strong>, zamanlama
          sinyalini tam 60 nanosaniye geciktiriyordu. Bağlantı sıkıştırılınca “ışıktan hızlı” sonuç buharlaştı.
          Temmuz 2012'de nötrino hızı, ışık hızıyla uyumlu ölçüldü.
        </p>
        <div className="tky-callout tky-callout-warn">
          <span className="tky-callout-icon">🔌</span>
          <p><strong>Dersi:</strong> Olağanüstü iddialar olağanüstü kanıt ister. Bazen evreni değil, sadece
          <strong> kabloyu</strong> kontrol etmek gerekir. Bilimin kendini düzeltme gücünün güzel bir örneğidir bu.</p>
        </div>
      </section>

      {/* ── 12. VAR MI? ── */}
      <section className="tky-section reveal">
        <div className="tky-kicker">12 — Karar</div>
        <h2 className="tky-h2">Peki, Takyon Var mı?</h2>
        <p className="tky-p">
          Kısa cevap: <strong>Bildiğimiz kadarıyla hayır.</strong> 1960'lardan beri hızlandırıcılarda, kozmik
          ışınlarda ve gökyüzünde takyon arandı; tek bir doğrulanmış iz bulunamadı. Üstelik nedenselliği bozma
          tehlikesi, çoğu fizikçiyi “var olmamaları daha olası” demeye götürür.
        </p>
        <p className="tky-p">
          Yine de takyonlar değerlidir: Bizi <strong>neyin neden mümkün olmadığını</strong> derinlemesine
          düşünmeye, görelilik ile nedenselliğin ne kadar sıkı örülü olduğunu görmeye zorlarlar. Bazen bir fikrin en
          büyük armağanı, doğru çıkması değil; bize evrenin sınırlarını öğretmesidir.
        </p>
        <p className="tky-p">
          Işıktan hızlı bir parçacık olmadan da uzayda kestirmeden gitmenin bir yolu olabilir mi? Bazı fizikçiler,
          uzay-zamanın kendisini bükerek iki uzak noktayı birleştiren <Link href="/articles/einstein-rosen" className="article-ilink">solucan deliği (Einstein-Rosen köprüsü)</Link> gibi
          egzotik geçitlerin, takyonlara başvurmadan da bir “kestirme yol” vaat edebileceğini düşünür.
        </p>
      </section>

      {/* ── 13. QUIZ ── */}
      <section className="tky-section reveal">
        <div className="tky-kicker">13 — Sınav</div>
        <h2 className="tky-h2">Mini Quiz</h2>
        <div className="tky-quiz">
          {!done ? (
            <>
              <div className="tky-quiz-top">
                <span>Soru {quizQ + 1} / {quizQs.length}</span>
                <span className="tky-quiz-score">Puan: {score}</span>
              </div>
              <h3 className="tky-quiz-q">{quizQs[quizQ].text}</h3>
              <div className="tky-quiz-opts">
                {quizQs[quizQ].opts.map((o, oi) => {
                  const sel = answered[quizQ];
                  const isAns = sel !== undefined;
                  const correct = quizQs[quizQ].a;
                  let cls = 'tky-opt';
                  if (isAns) { if (oi === correct) cls += ' correct'; else if (oi === sel) cls += ' wrong'; else cls += ' dim'; }
                  return (
                    <button key={oi} className={cls} onClick={() => answerQ(oi)} disabled={isAns}>
                      <span className="tky-opt-letter">{String.fromCharCode(65 + oi)}</span>{o}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="tky-quiz-result">
              <div className="tky-quiz-emoji">{score >= 5 ? '🌌' : score >= 3 ? '⚡' : '📖'}</div>
              <h3 className="tky-quiz-rtitle">{score} / {quizQs.length} doğru</h3>
              <p className="tky-quiz-rdesc">{score >= 5 ? 'Işık bariyerini zihninde aştın! Gerçek bir takyon avcısısın.' : score >= 3 ? 'Sağlam bir görelilik sezgisi! Birkaç tekrar yeter.' : 'Sorun değil — yukarı kaydırıp bariyere tekrar yaklaş.'}</p>
              <button className="tky-ctrl-btn tky-ctrl-primary" style={{ background: '#22d3ee', borderColor: '#22d3ee' }} onClick={restartQuiz}>↺ Tekrar dene</button>
            </div>
          )}
        </div>
      </section>

      {/* ── Kaynakça ── */}
      <ArticleBibliography items={refs} accent="#22d3ee" />

      {/* ── Footer ── */}
      <footer className="tky-footer">
        <div className="tky-footer-mark">BASEMENTS</div>
        <p>Takyonlar belki hiç var olmadı. Ama ışığın ötesini hayal etme cesaretimiz, evrenin kurallarını ne kadar derin anladığımızı gösteriyor. ⚡</p>
        <Link href="/discover" className="tky-footer-link">← Diğer içerikleri keşfet</Link>
      </footer>

      <style>{`
        .tky-page {
          --cyan:#22d3ee; --violet:#a78bfa; --magenta:#f472b6; --gold:#fbbf24;
          --bg:#0a0712; --panel:rgba(255,255,255,0.035); --line:rgba(167,139,250,0.16);
          --ink:#e7e3f2; --muted:#9b96b8;
          background: var(--bg);
          color: var(--ink);
          min-height: 100vh;
          font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
          line-height: 1.65;
          overflow-x: clip;
        }

        /* Topbar */
        .tky-topbar { position: sticky; top: 0; z-index: 40; background: rgba(10,7,18,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); padding: 10px 16px; display: flex; align-items: center; gap: 10px; }
        .tky-back { color: var(--ink); display: flex; padding: 6px; border-radius: 50%; transition: background .15s; }
        .tky-back:hover { background: rgba(167,139,250,0.14); }
        .tky-topbar-title { font-weight: 700; font-size: .94rem; color: var(--violet); }

        /* Hero */
        .tky-hero { position: relative; text-align: center; padding: 60px 20px 46px; overflow: hidden; background: radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.18), transparent 60%); }
        .tky-warp { position: absolute; inset: 0; pointer-events: none; mask-image: radial-gradient(ellipse at 50% 40%, #000, transparent 78%); -webkit-mask-image: radial-gradient(ellipse at 50% 40%, #000, transparent 78%); }
        .tky-streak { position: absolute; left: -30%; height: 2px; width: 28%; border-radius: 2px; background: linear-gradient(90deg, transparent, var(--cyan), var(--magenta)); opacity: .5; animation: tky-streak 2.4s linear infinite; }
        @keyframes tky-streak { 0% { transform: translateX(0) scaleX(.4); opacity: 0; } 30% { opacity: .6; } 100% { transform: translateX(520%) scaleX(1.6); opacity: 0; } }
        .tky-hero-eyebrow { position: relative; font-size: .66rem; font-weight: 800; letter-spacing: .3em; color: var(--cyan); margin-bottom: 14px; }
        .tky-hero-title { position: relative; font-size: clamp(2.4rem, 9vw, 5rem); font-weight: 900; margin: 0 0 18px; letter-spacing: .04em; line-height: 1; }
        .tky-grad { background: linear-gradient(100deg, var(--cyan), var(--violet), var(--magenta)); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 0 24px rgba(167,139,250,0.4)); }
        .tky-hero-sub { position: relative; max-width: 620px; margin: 0 auto 24px; color: #c4bfd8; font-size: clamp(.92rem, 2vw, 1.05rem); }
        .tky-hero-sub strong { color: var(--ink); }
        .tky-hero-tags { position: relative; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
        .tky-tag { padding: 6px 13px; font-size: .76rem; font-weight: 600; color: var(--violet); background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.24); border-radius: 9999px; }

        /* Section */
        .tky-section { max-width: 820px; margin: 0 auto; padding: 40px 16px; border-top: 1px solid rgba(167,139,250,0.08); }
        /* ArticleImage'ın slate varsayılanlarını makalenin menekşe aksanına bağla. */
        .tky-img {
          --ai-caption: #cdc7e0;
          --ai-credit: #9b96b8;
          --ai-border: rgba(167,139,250,0.24);
          --ai-fill: rgba(167,139,250,0.05);
          --ai-mark: rgba(167,139,250,0.28);
        }
        .tky-img-wrap { max-width: 340px; margin: 0 auto; }
        .tky-img-pair { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; align-items: start; }
        @media (max-width: 700px) { .tky-img-pair { grid-template-columns: 1fr; } }
        .tky-kicker { font-size: .7rem; font-weight: 800; letter-spacing: .2em; color: var(--magenta); margin-bottom: 8px; text-transform: uppercase; }
        .tky-h2 { font-size: clamp(1.4rem, 4.4vw, 2.05rem); font-weight: 800; margin: 0 0 14px; letter-spacing: -.01em; color: var(--ink); }
        .tky-h3 { font-size: 1.05rem; font-weight: 700; margin: 28px 0 12px; color: var(--cyan); }
        .tky-p { color: #cbc6dc; font-size: 1rem; margin: 0 0 18px; }
        .tky-p strong { color: var(--ink); font-weight: 700; }
        .tky-p em { color: var(--cyan); font-style: italic; }
        .tky-hint { font-size: .86rem; color: var(--muted); margin-top: 16px; background: var(--panel); border: 1px dashed var(--line); border-radius: 10px; padding: 12px 14px; }
        .tky-hint strong { color: var(--ink); }

        .reveal { opacity: 0; transform: translateY(28px); transition: opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1); }
        .reveal.visible { opacity: 1; transform: none; }

        /* Callout */
        .tky-callout { display: flex; gap: 12px; background: linear-gradient(90deg, rgba(34,211,238,0.08), transparent); border: 1px solid rgba(34,211,238,0.2); border-left: 3px solid var(--cyan); border-radius: 12px; padding: 14px 16px; margin: 18px 0; }
        .tky-callout-warn { background: linear-gradient(90deg, rgba(251,191,36,0.08), transparent); border-color: rgba(251,191,36,0.3); border-left-color: var(--gold); }
        .tky-callout-icon { font-size: 1.5rem; flex-shrink: 0; }
        .tky-callout p { margin: 0; font-size: .92rem; color: #cbc6dc; }
        .tky-callout strong { color: var(--ink); }

        /* Diagram */
        .tky-diagram { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 16px; margin: 16px 0; }
        .tky-svg { width: 100%; height: auto; display: block; }

        /* Families */
        .tky-families { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 18px 0; }
        .tky-fam { background: var(--panel); border: 1px solid var(--line); border-top: 3px solid var(--fc); border-radius: 14px; padding: 16px; }
        .tky-fam-ico { font-size: 2rem; margin-bottom: 6px; }
        .tky-fam-name { margin: 0 0 4px; font-size: 1.05rem; color: var(--fc); display: flex; flex-direction: column; }
        .tky-fam-name small { font-size: .72rem; color: var(--muted); font-weight: 500; }
        .tky-fam-speed { font-size: .76rem; font-weight: 700; color: var(--fc); margin-bottom: 8px; }
        .tky-fam-note { margin: 0 0 8px; font-size: .85rem; color: #cbc6dc; }
        .tky-fam-ex { font-size: .76rem; color: var(--muted); border-top: 1px solid var(--line); padding-top: 8px; }

        /* Energy interactive */
        .tky-energy { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 18px; margin: 16px 0; }
        .tky-energy-row { display: flex; align-items: center; gap: 14px; }
        .tky-energy-label { font-size: .85rem; color: var(--muted); width: 36px; }
        .tky-slider { flex: 1; accent-color: var(--cyan); height: 6px; }
        .tky-slider:focus-visible { outline: 2px solid var(--cyan); outline-offset: 4px; }
        .tky-energy-num { font-family: monospace; font-weight: 700; color: var(--cyan); width: 70px; text-align: right; }
        .tky-energy-bars { margin: 16px 0 10px; }
        .tky-eb { display: flex; align-items: center; gap: 12px; }
        .tky-eb > span:first-child { font-size: .82rem; color: var(--muted); width: 100px; }
        .tky-eb-track { flex: 1; height: 16px; background: rgba(255,255,255,0.05); border-radius: 8px; overflow: hidden; border: 1px solid var(--line); }
        .tky-eb-fill { height: 100%; border-radius: 8px; transition: width .15s linear; }
        .tky-eb-v { font-family: monospace; font-weight: 800; color: var(--magenta); width: 60px; text-align: right; }
        .tky-energy-msg { margin: 4px 0 0; font-size: .88rem; color: var(--gold); font-weight: 600; min-height: 1.4em; }

        /* Formula */
        .tky-formula { text-align: center; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 22px; margin: 16px 0; }
        .tky-f-main { display: block; font-family: "Cambria Math", Georgia, serif; font-size: 2rem; font-weight: 700; color: var(--violet); letter-spacing: .04em; }
        .tky-f-sub { display: block; margin-top: 8px; font-size: .82rem; color: var(--muted); }

        /* vs */
        .tky-vs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
        .tky-vs-col { background: var(--panel); border: 1px solid; border-radius: 12px; padding: 16px; }
        .tky-vs-h { font-weight: 800; font-size: 1rem; margin-bottom: 8px; }
        .tky-vs-col p { margin: 0; font-size: .88rem; color: #cbc6dc; }
        .tky-vs-col strong { color: var(--ink); }

        /* FTL accordion */
        .tky-ftl { display: flex; flex-direction: column; gap: 8px; margin: 18px 0; }
        .tky-ftl-row { border: 1px solid var(--line); border-radius: 12px; overflow: hidden; background: var(--panel); border-left: 3px solid var(--rc); transition: background .2s; }
        .tky-ftl-row.open { background: color-mix(in srgb, var(--rc) 9%, transparent); }
        .tky-ftl-head { width: 100%; display: flex; align-items: center; gap: 12px; padding: 13px 15px; background: none; border: none; color: var(--ink); cursor: pointer; text-align: left; font-size: 1rem; font-weight: 700; }
        .tky-ftl-ico { font-size: 1.3rem; }
        .tky-ftl-t { flex: 1; }
        .tky-ftl-chev { font-size: 1.3rem; color: var(--muted); width: 16px; text-align: center; }
        .tky-ftl-body { padding: 0 16px 15px 50px; }
        .tky-ftl-body p { margin: 0; font-size: .92rem; color: #cbc6dc; }

        /* Stepper */
        .tky-stepper { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 16px; margin: 16px 0; }
        .tky-stepper-viz { display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.25); border-radius: 10px; padding: 10px; min-height: 180px; }
        .tky-stepper-panel { display: flex; flex-direction: column; }
        .tky-dots { display: flex; gap: 7px; margin-bottom: 12px; }
        .tky-dot { width: 11px; height: 11px; border-radius: 50%; border: 1.5px solid var(--muted); background: transparent; cursor: pointer; padding: 0; transition: all .2s; }
        .tky-dot.on { transform: scale(1.25); }
        .tky-step-meta { font-size: .72rem; font-weight: 800; letter-spacing: .1em; margin-bottom: 6px; font-family: monospace; }
        .tky-step-title { font-size: 1.08rem; font-weight: 800; margin: 0 0 8px; }
        .tky-step-desc { font-size: .9rem; color: #cbc6dc; margin: 0 0 16px; flex: 1; }
        .tky-stepper-ctrl { display: flex; gap: 8px; }
        .tky-ctrl-btn { flex: 1; padding: 9px 14px; border-radius: 9px; border: 1px solid var(--line); background: rgba(255,255,255,0.04); color: var(--ink); font-weight: 700; font-size: .85rem; cursor: pointer; transition: opacity .2s, transform .1s; }
        .tky-ctrl-btn:disabled { opacity: .35; cursor: not-allowed; }
        .tky-ctrl-btn:not(:disabled):active { transform: scale(.96); }
        .tky-ctrl-primary { color: #0a0712; }

        /* Quiz */
        .tky-quiz { background: var(--panel); border: 1px solid var(--line); border-radius: 16px; padding: 20px; }
        .tky-quiz-top { display: flex; justify-content: space-between; font-size: .8rem; font-weight: 700; color: var(--muted); margin-bottom: 12px; }
        .tky-quiz-score { color: var(--cyan); }
        .tky-quiz-q { font-size: 1.1rem; font-weight: 700; margin: 0 0 16px; }
        .tky-quiz-opts { display: flex; flex-direction: column; gap: 8px; }
        .tky-opt { display: flex; align-items: center; gap: 12px; text-align: left; padding: 13px 15px; border-radius: 11px; border: 1px solid var(--line); background: rgba(255,255,255,0.03); color: var(--ink); font-size: .92rem; cursor: pointer; transition: all .18s; }
        .tky-opt:not(:disabled):hover { border-color: var(--cyan); background: rgba(34,211,238,0.07); }
        .tky-opt-letter { width: 24px; height: 24px; border-radius: 6px; display: grid; place-items: center; font-weight: 800; font-size: .78rem; background: rgba(167,139,250,0.12); color: var(--muted); flex-shrink: 0; }
        .tky-opt.correct { border-color: var(--cyan); background: rgba(34,211,238,0.14); }
        .tky-opt.correct .tky-opt-letter { background: var(--cyan); color: #0a0712; }
        .tky-opt.wrong { border-color: var(--magenta); background: rgba(244,114,182,0.14); }
        .tky-opt.wrong .tky-opt-letter { background: var(--magenta); color: #0a0712; }
        .tky-opt.dim { opacity: .5; }
        .tky-opt:disabled { cursor: default; }
        .tky-quiz-result { text-align: center; padding: 12px; }
        .tky-quiz-emoji { font-size: 3rem; margin-bottom: 8px; }
        .tky-quiz-rtitle { font-size: 1.45rem; font-weight: 800; margin: 0 0 6px; color: var(--cyan); }
        .tky-quiz-rdesc { color: var(--muted); font-size: .92rem; margin: 0 0 18px; }

        /* Footer */
        .tky-footer { max-width: 680px; margin: 0 auto; text-align: center; padding: 40px 20px 64px; border-top: 1px solid var(--line); }
        .tky-footer-mark { font-weight: 800; letter-spacing: .3em; color: var(--cyan); font-size: .85rem; margin-bottom: 14px; }
        .tky-footer p { color: var(--muted); font-size: .95rem; max-width: 500px; margin: 0 auto 18px; }
        .tky-footer-link { color: var(--cyan); text-decoration: none; font-weight: 700; font-size: .9rem; }
        .tky-footer-link:hover { text-decoration: underline; }

        /* Responsive */
        @media (max-width: 680px) {
          .tky-section { padding: 32px 14px; }
          .tky-families { grid-template-columns: 1fr; }
          .tky-vs { grid-template-columns: 1fr; }
          .tky-stepper { grid-template-columns: 1fr; }
          .tky-stepper-viz { min-height: 150px; }
          .tky-energy-row { flex-wrap: wrap; }
          .tky-slider { flex-basis: 100%; order: 3; }
        }
      `}</style>

    </main>
  );
}
