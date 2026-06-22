'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';

/* ════════════════════════ VERİ ════════════════════════ */

const axisFlow = [
  { t: 'Bağırsakta bir olay', d: `Yediğin yemek, bir mikrop ya da bir gerginlik... Bağırsak duvarındaki milyonlarca sinir hücresi ve trilyonlarca mikrop durumu anında algılar.` },
  { t: 'Kimyasal mektup', d: `Bağırsak; serotonin, kısa zincirli yağ asitleri ve hormonlar gibi kimyasal mesajlar yazar. Bu, bedenin sessiz dilidir.` },
  { t: 'Vagus otoyolu', d: `Mesajların çoğu, bağırsakla beyni birleştiren kalın vagus siniri üzerinden yukarı çıkar. Trafiğin yaklaşık %90'ı bağırsaktan beyne doğrudur — yani beyin, çoğunlukla dinleyen taraftır.` },
  { t: 'Beyin bir "his"e çevirir', d: `Beyindeki insula ve amigdala bu içsel sinyalleri bir duyguya dönüştürür: huzur, kaygı, açlık ya da o tanıdık "içime doğdu" hissi.` },
  { t: 'Çift yönlü sohbet', d: `Beyin de aşağıya emir yollar: stresliyken sindirimi kısar, sakinken açar. Bağırsak ile beyin, ömür boyu süren bir sohbetin içindedir.` },
];

const molecules = [
  { n: 'Serotonin', tag: 'mutluluk · sakinlik', pct: 90, c: '#4338ca', d: `Vücuttaki serotoninin tahminen %90'ı bağırsakta üretilir. Bu serotonin doğrudan beyne geçmez; ama vagus siniri üzerinden ruh halini, iştahı ve sindirimi etkiler.` },
  { n: 'Dopamin', tag: 'motivasyon · ödül', pct: 50, c: '#ea580c', d: `Motivasyon ve ödül molekülü dopaminin önemli bir bölümü de bağırsakta üretilir; mikroplar bu üretimi etkileyebilir.` },
  { n: 'GABA', tag: 'sakinleştirici', pct: 30, c: '#0d9488', d: `Beyni yatıştıran GABA'yı, bağırsaktaki bazı dost bakteriler (Lactobacillus, Bifidobacterium) doğrudan üretebilir. Mikroplar adeta minik bir eczanedir.` },
];

const feed = [
  { icon: '🌾', t: 'Lif', d: `Sebze, meyve, tam tahıl ve baklagil. Lif, dost mikropların baş yakıtıdır; onlar da karşılığında sağlıklı yağ asitleri üretir.` },
  { icon: '🥬', t: 'Çeşitlilik', d: `Tek tip değil, rengârenk ve çeşitli beslenme. Mikrobiyom ne kadar çeşitliyse o kadar dayanıklıdır.` },
  { icon: '🥒', t: 'Fermente besin', d: `Yoğurt, kefir, turşu, boza... Canlı kültürler bağırsak ekosistemini zenginleştirir.` },
  { icon: '😴', t: 'Uyku & sükûnet', d: `Düzenli uyku ve azalan stres, çift yönlü hattı sakinleştirir. Bağırsağın da dinlenmeye ihtiyacı vardır.` },
];

const numbers = [
  { v: '~500 milyon', l: 'bağırsaktaki sinir hücresi', s: 'bir kedinin beynindekine yakın' },
  { v: '~%90', l: 'vagus trafiği bağırsaktan beyne', s: 'beyin çoğunlukla dinler' },
  { v: '~38 trilyon', l: 'bağırsaktaki bakteri', s: '2016 revizyonu; eskiden 100 trilyon/10:1 denirdi, artık ~1:1' },
  { v: '~7–8 m', l: 'toplam bağırsak uzunluğu', s: 'boyunun yaklaşık 4–5 katı' },
  { v: '~30–40 m²', l: 'iç yüzey alanı', s: 'eskiden "tenis kortu" denirdi; güncel ölçüm yarım badminton kortu kadar' },
  { v: '~1000+', l: 'farklı mikrop türü', s: 'her insanda kendine özgü bir karışım' },
];

const quizQs = [
  { text: 'Bağırsaklara "ikinci beyin" denmesinin sebebi nedir?', opts: ['Kafatasında ikinci bir beyin olması', 'Bağırsak duvarında ~500 milyon nöronluk kendi sinir ağı bulunması', 'İki ayrı bağırsak olması', 'Beyinle aynı şekle sahip olması'], a: 1 },
  { text: 'Vücuttaki serotoninin yaklaşık ne kadarı bağırsakta üretilir?', opts: ['%5', '%30', '%90', 'hiç'], a: 2 },
  { text: 'Bağırsak ile beyin arasındaki ana iletişim siniri hangisidir?', opts: ['Optik sinir', 'Vagus siniri', 'Siyatik sinir', 'Koku siniri'], a: 1 },
  { text: '"İçime doğdu" türü içgüdüsel kararlarda beynin hangi yeteneği rol oynar?', opts: ['Görme keskinliği', 'İnterosepsiyon (iç beden sinyallerini algılama)', 'Denge', 'Kas hafızası'], a: 1 },
  { text: 'Mikrobiyom–ruh hali ilişkisini gösteren çarpıcı deney hangisidir?', opts: ['Aya canlı göndermek', 'Stresli farelerin bağırsak mikrobunu sağlıklı farelere nakletmek (FMT)', 'Beyin ameliyatı', 'Açlık deneyi'], a: 1 },
  { text: 'Bağırsak sağlığı için en temel besin grubu hangisidir?', opts: ['Şeker', 'Lif (sebze/meyve/tahıl)', 'Kızartma', 'Beyaz un'], a: 1 },
];

const refs: BibItem[] = [
  { title: 'The Second Brain', authors: 'Michael D. Gershon', year: '1998', source: 'HarperCollins' },
  { title: 'The Mind-Gut Connection', authors: 'Emeran Mayer', year: '2016', source: 'Harper Wave' },
  { title: 'Mind-altering microorganisms: the impact of the gut microbiota on brain and behaviour', authors: 'J. F. Cryan & T. G. Dinan', year: '2012', source: 'Nature Reviews Neuroscience 13, 701' },
  { title: 'Gut feelings: the emerging biology of gut–brain communication', authors: 'Emeran A. Mayer', year: '2011', source: 'Nature Reviews Neuroscience 12, 453' },
  { title: 'Descartes\' Error (somatik işaretleyici hipotezi)', authors: 'Antonio Damasio', year: '1994', source: 'G. P. Putnam' },
  { title: 'Gut–brain axis', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Gut%E2%80%93brain_axis' },
  { title: 'Gut microbiota', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Gut_microbiota' },
  { title: 'The Gut-Brain Connection', source: 'Healthline', url: 'https://www.healthline.com/nutrition/gut-brain-connection' },
  { title: 'Trust Your Gut: How the Brain-Gut Connection Helps Us Decide Intuitively', source: 'BrainFacts.org', url: 'https://www.brainfacts.org/brain-anatomy-and-function/body-systems/2021/trust-your-gut-how-the-brain-gut-connection-helps-us-decide-intuitively-100121' },
];

/* ════════════════════════ STEPPER ════════════════════════ */

function Stepper({ steps, children }: { steps: { t: string; d: string }[]; children: (i: number) => ReactNode }) {
  const [i, setI] = useState(0);
  return (
    <div className="gut-stepper">
      <div className="gut-stepper-viz">{children(i)}</div>
      <div className="gut-stepper-panel">
        <div className="gut-dots">
          {steps.map((_, k) => (<button key={k} className={`gut-dot ${k === i ? 'on' : ''}`} onClick={() => setI(k)} aria-label={`Adım ${k + 1}`} />))}
        </div>
        <div className="gut-step-meta">ADIM {i + 1} / {steps.length}</div>
        <h4 className="gut-step-title">{steps[i].t}</h4>
        <p className="gut-step-desc">{steps[i].d}</p>
        <div className="gut-stepper-ctrl">
          <button className="gut-ctrl-btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>← Geri</button>
          <button className="gut-ctrl-btn gut-ctrl-primary" onClick={() => setI(Math.min(steps.length - 1, i + 1))} disabled={i === steps.length - 1}>İleri →</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════ ANA BİLEŞEN ════════════════════════ */

export default function BagirsakClient() {
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
    <main className="main-content gut-page">

      <div className="gut-topbar">
        <Link href="/" className="gut-back" aria-label="Ana sayfa">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        </Link>
        <span className="gut-topbar-title">Bağırsaklar</span>
      </div>

      {/* HERO */}
      <header className="gut-hero">
        <div className="gut-hero-glow" aria-hidden="true" />
        <div className="gut-hero-art" aria-hidden="true">
          <svg viewBox="0 0 120 220" width="92">
            <defs><linearGradient id="gutAx" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2563eb" /><stop offset="1" stopColor="#0d9488" /></linearGradient></defs>
            {/* beyin */}
            <path d="M60 18 C40 18 30 34 34 48 C24 50 24 66 36 70 C36 82 52 86 60 78 C68 86 84 82 84 70 C96 66 96 50 86 48 C90 34 80 18 60 18 Z" fill="none" stroke="url(#gutAx)" strokeWidth="2" />
            <path d="M60 26 L60 78 M48 40 q12 8 0 18 M72 40 q-12 8 0 18" stroke="rgba(37,99,235,0.4)" strokeWidth="1.2" fill="none" />
            {/* vagus */}
            <path d="M60 86 C56 100 64 110 58 124" stroke="url(#gutAx)" strokeWidth="2" fill="none" strokeDasharray="3 4" />
            {/* bağırsak kıvrımları */}
            <path d="M40 130 C90 124 92 150 56 150 C24 150 30 176 80 170 C100 168 96 192 52 190 C36 189 40 200 64 198" fill="none" stroke="url(#gutAx)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <div className="gut-hero-eyebrow">İKİNCİ BEYNİMİZ · BAĞIRSAK-BEYİN EKSENİ</div>
        <h1 className="gut-hero-title">Bağırsaklar</h1>
        <p className="gut-hero-sub">
          Kararlarımızı verdiğimiz yer sandığımız beyin, aslında karnımızdaki sessiz bir ortağıyla sürekli
          fısıldaşır. <em>“İçime doğdu”, “midem kaldırmadı”, “içim rahat”...</em> Dilimiz bunu çoktan biliyordu;
          bilim ise yeni yeni doğruluyor: <strong>ruh halimiz ve sezgilerimiz, bağırsaklarımızda başlıyor.</strong>
        </p>
        <div className="gut-hero-tags">
          {['İkinci beyin', 'Vagus siniri', 'Serotonin', 'Mikrobiyom', 'İçgüdüsel karar', 'Ruh hali'].map((t) => (
            <span key={t} className="gut-tag">{t}</span>
          ))}
        </div>
      </header>

      {/* I. İKİNCİ BEYİN */}
      <section className="gut-section reveal">
        <div className="gut-num">I</div>
        <h2 className="gut-h2">İçimizdeki İkinci Beyin</h2>
        <p className="gut-lead">Bağırsak duvarı, baştan aşağı ince bir sinir ağıyla örülüdür. Bu ağ o kadar gelişmiştir ki bilim insanları ona bir ad verdi: <strong>enterik sinir sistemi</strong> — ya da sevdiğimiz adıyla, <strong>ikinci beyin</strong>.</p>
        <p className="gut-p">
          Bu ağda yaklaşık <strong>500 milyon sinir hücresi</strong> bulunur — neredeyse bir kedinin beynindeki
          kadar. En şaşırtıcı yanı: Beyinle bağlantısı tamamen kesilse bile sindirimi <strong>kendi başına</strong>
          yönetmeye devam eder. Yani karnımızda, emir beklemeden çalışan özerk bir zekâ taşıyoruz.
        </p>
        <blockquote className="gut-quote">Bağırsak, beynin bir uzantısı değil; onun en eski ve en sadık danışmanıdır.</blockquote>
      </section>

      {/* II. EKSEN */}
      <section className="gut-section reveal">
        <div className="gut-num">II</div>
        <h2 className="gut-h2">Bağırsak–Beyin Ekseni</h2>
        <p className="gut-p">
          Bağırsak ve beyin, gün boyu kesintisiz bir konuşma hâlindedir. Bu çift yönlü hatta
          <strong> bağırsak-beyin ekseni</strong> denir. Mesajların büyük çoğunluğu aşağıdan yukarı — yani
          bağırsaktan beyne — akar. Bir sinyalin yolculuğunu adım adım izle:
        </p>
        <Stepper steps={axisFlow}>
          {(i) => (
            <svg viewBox="0 0 200 200" className="gut-svg">
              <circle cx="100" cy="38" r="26" fill="none" stroke="#2563eb" strokeWidth="2" opacity={i >= 3 ? 1 : 0.4} />
              <text x="100" y="44" textAnchor="middle" fontSize="20">🧠</text>
              <circle cx="100" cy="162" r="30" fill="none" stroke="#0d9488" strokeWidth="2" opacity={i <= 2 ? 1 : 0.5} />
              <text x="100" y="170" textAnchor="middle" fontSize="22">🌀</text>
              <path d="M100 132 C92 110 108 92 100 66" stroke={i >= 2 ? '#2563eb' : 'rgba(37,99,235,0.3)'} strokeWidth={i === 2 ? 4 : 2} fill="none" strokeDasharray="4 5">
                {i === 2 && <animate attributeName="stroke-dashoffset" values="18;0" dur="0.9s" repeatCount="indefinite" />}
              </path>
              <text x="118" y="104" fontSize="9" fill="#64748b">vagus</text>
              {i >= 1 && i <= 2 && <text x="100" y="120" textAnchor="middle" fontSize="13">↑✉️</text>}
              {i === 4 && <text x="78" y="108" textAnchor="middle" fontSize="13">↓</text>}
            </svg>
          )}
        </Stepper>
      </section>

      {/* III. MUTLULUK FABRİKASI */}
      <section className="gut-section reveal">
        <div className="gut-num">III</div>
        <h2 className="gut-h2">Karnımızdaki Mutluluk Fabrikası</h2>
        <p className="gut-p">
          Beynimizin ruh halini ayarladığı kimyasalların büyük kısmı, aslında bağırsakta üretilir. İşte
          karnımızdaki kimyager:
        </p>
        <div className="gut-mols">
          {molecules.map((m) => (
            <div key={m.n} className="gut-mol" style={{ borderColor: `${m.c}40` }}>
              <div className="gut-mol-top">
                <span className="gut-mol-name" style={{ color: m.c }}>{m.n}</span>
                <span className="gut-mol-tag">{m.tag}</span>
              </div>
              <div className="gut-mol-bar"><div className="gut-mol-fill" style={{ width: `${m.pct}%`, background: m.c }} /></div>
              <p className="gut-mol-d">{m.d}</p>
            </div>
          ))}
        </div>
        <div className="gut-note">
          <span>✱</span>
          <p>Önemli ayrım: Bağırsaktaki serotonin kan–beyin bariyerini geçip doğrudan beyne <em>gitmez</em>. Beyin kendi serotoninini üretir. Ama bağırsak, vagus siniri ve mikroplar aracılığıyla beynin ruh hali ayarını <strong>dolaylı ama güçlü</strong> biçimde etkiler.</p>
        </div>
      </section>

      {/* IV. MİKROBİYOM */}
      <section className="gut-section reveal">
        <div className="gut-num">IV</div>
        <h2 className="gut-h2">Mikrobiyom: Unutulan Organ</h2>
        <p className="gut-p">
          Bağırsaklarımızda <strong>yaklaşık 38 trilyon bakteri</strong> yaşar — neredeyse kendi vücut
          hücrelerimiz kadar. Bin türden fazla bu canlı topluluğa <strong>mikrobiyom</strong> denir. O kadar
          önemlidir ki bilim insanları onu çoğu zaman <strong>“unutulan organ”</strong> olarak anar.
        </p>
        <div className="gut-stat-row">
          <div className="gut-stat"><span className="gut-stat-v">~38 trilyon</span><span className="gut-stat-l">bakteri</span></div>
          <div className="gut-stat"><span className="gut-stat-v">1000+</span><span className="gut-stat-l">farklı tür</span></div>
          <div className="gut-stat"><span className="gut-stat-v">%70+</span><span className="gut-stat-l">kalın bağırsakta</span></div>
        </div>
        <div className="gut-note"><span>✓</span><p>Bir düzeltme: Yıllarca “bakteriler vücut hücrelerimizin 10 katı, ~100 trilyon” denirdi. 2016'da yapılan daha titiz bir hesap (Sender, Fuchs &amp; Milo) bu rakamı <strong>~38 trilyona</strong> ve oranı yaklaşık <strong>1:1</strong>'e indirdi — yani bakteriler bizimle neredeyse eşit sayıda.</p></div>
        <p className="gut-p">Bu mikroplar sadece sindirime yardım etmez; vitamin üretir, bağışıklığı eğitir ve — en ilginci — <strong>ruh halimize karışır.</strong></p>
      </section>

      {/* V. MİKROPLAR VE RUH HALİ */}
      <section className="gut-section reveal">
        <div className="gut-num">V</div>
        <h2 className="gut-h2">Mikroplar Ruh Halini Nasıl Yönetir?</h2>
        <p className="gut-p">
          Son yılların en çarpıcı keşfi: bağırsaktaki mikroplar duygularımızı etkileyebilir. Kanıtlar oldukça güçlü:
        </p>
        <div className="gut-cards">
          {[
            ['🧪', 'Kısa zincirli yağ asitleri', `Lifle beslenen dost bakteriler "bütirat" gibi yağ asitleri üretir. Bunlar kan–beyin bariyerini geçip beyindeki iltihabı azaltır ve antidepresan benzeri etkiler gösterir.`],
            ['🐭', 'Steril fareler', `Hiç mikrobu olmayan farelerin beyin kimyası ve stres tepkisi bozuk çıkar. Mikroplar yerleştirilince davranışları normalleşir.`],
            ['🔄', 'Nakil deneyi (FMT)', `Stresli ve "depresif" farelerin bağırsak mikrobu sağlıklı farelere nakledildiğinde, sağlıklı fareler de depresif davranmaya başlar. Yani ruh hali bir ölçüde bulaşıcıdır.`],
            ['💊', 'Psikobiyotikler', `Belirli probiyotik suşları, insanlarda kaygı ve stresi azaltabiliyor. Bu yeni nesil "ruh hali bakterilerine" psikobiyotik deniyor.`],
          ].map(([e, t, d], i) => (
            <div key={i} className="gut-card"><div className="gut-card-e">{e}</div><div><strong>{t}</strong><span>{d}</span></div></div>
          ))}
        </div>
      </section>

      {/* VI. İÇGÜDÜSEL KARARLAR */}
      <section className="gut-section reveal">
        <div className="gut-num">VI</div>
        <h2 className="gut-h2">“İçime Doğdu”: Kararların Bilimi</h2>
        <p className="gut-p">
          Bazen mantıklı bir gerekçe bulamadan “bu doğru değil” deriz. Bu <strong>içgüdüsel karar</strong>, sihir
          değil; beynin beden sinyallerini okumasıdır. Buna <strong>interosepsiyon</strong> denir — kalp atışından
          bağırsak hareketine, içimizdeki sessiz verileri hissetme yeteneği.
        </p>
        <p className="gut-p">
          Beyindeki <strong>insula</strong> bu içsel sinyalleri toplar; <strong>amigdala</strong> ise önemli ya da
          tehlikeli olanları “işaretler”. Sinir bilimci Antonio Damasio bunu <strong>somatik işaretleyici</strong>
          kuramıyla açıkladı: Geçmiş deneyimlerin bedensel izleri (mide bulantısı, içe doğan huzursuzluk) gelecekteki
          kararlarımıza sessizce rehberlik eder. Bilinç daha durumu çözmeden, bağırsak çoktan oy kullanmıştır.
        </p>
        <blockquote className="gut-quote">Mantık bize seçenekleri verir; bağırsak hangisinin “doğru hissettirdiğini” fısıldar.</blockquote>
        <div className="gut-note">
          <span>📈</span>
          <p>Bir araştırmada, beden sinyallerini daha iyi “okuyan” borsacılar, baskı altındaki hızlı kararlarda daha başarılı çıktı. Yani doğru koşullarda, sezgine güvenmenin gerçek bir bedeli/değeri var.</p>
        </div>
      </section>

      {/* VII. STRES DÖNGÜSÜ */}
      <section className="gut-section reveal">
        <div className="gut-num">VII</div>
        <h2 className="gut-h2">Stresin Kısır Döngüsü</h2>
        <p className="gut-p">
          Hat çift yönlü olduğundan, stres de iki yönlü çalışır. Beyin gerginken bağırsağa “alarm” yollar:
          sindirim bozulur, mikrop dengesi sarsılır. Bozulan bağırsak ise beyne <strong>daha çok kaygı sinyali</strong>
          gönderir. Böylece <strong>stres → bozuk bağırsak → daha çok stres</strong> kısır döngüsü kurulur.
        </p>
        <p className="gut-p">
          Huzursuz bağırsak sendromu (IBS) gibi durumların kaygı ve depresyonla bu kadar sık birlikte görülmesi
          tesadüf değil — ikisi aynı hattın iki ucudur. İyi haber: Döngü iki uçtan da kırılabilir; bağırsağı
          sakinleştirmek beyni, beyni sakinleştirmek bağırsağı rahatlatır.
        </p>
      </section>

      {/* VIII. BESLEMEK */}
      <section className="gut-section reveal">
        <div className="gut-num">VIII</div>
        <h2 className="gut-h2">İkinci Beynini Beslemek</h2>
        <p className="gut-p">Ruh haline iyi gelmek için bazen yapılacak en iyi şey, karnındaki ortağına iyi bakmaktır:</p>
        <div className="gut-feed">
          {feed.map((f) => (
            <div key={f.t} className="gut-feed-card"><div className="gut-feed-ico">{f.icon}</div><h4>{f.t}</h4><p>{f.d}</p></div>
          ))}
        </div>
        <p className="gut-disc">Not: Bu yazı genel bilgilendirme amaçlıdır, tıbbi tavsiye değildir. Kalıcı sindirim ya da ruh hali sorunlarında bir uzmana danışmak en doğrusudur.</p>
      </section>

      {/* IX. RAKAMLAR */}
      <section className="gut-section reveal">
        <div className="gut-num">IX</div>
        <h2 className="gut-h2">Rakamlarla Bağırsak</h2>
        <div className="gut-numbers">
          {numbers.map((n, i) => (
            <div key={i} className="gut-number"><span className="gut-number-v">{n.v}</span><span className="gut-number-l">{n.l}</span><span className="gut-number-s">{n.s}</span></div>
          ))}
        </div>
      </section>

      {/* X. QUIZ */}
      <section className="gut-section reveal">
        <div className="gut-num">X</div>
        <h2 className="gut-h2">Mini Quiz</h2>
        <div className="gut-quiz">
          {!done ? (
            <>
              <div className="gut-quiz-top"><span>Soru {quizQ + 1} / {quizQs.length}</span><span className="gut-quiz-score">Puan: {score}</span></div>
              <h3 className="gut-quiz-q">{quizQs[quizQ].text}</h3>
              <div className="gut-quiz-opts">
                {quizQs[quizQ].opts.map((o, oi) => {
                  const sel = answered[quizQ]; const isAns = sel !== undefined; const correct = quizQs[quizQ].a;
                  let cls = 'gut-opt'; if (isAns) { if (oi === correct) cls += ' correct'; else if (oi === sel) cls += ' wrong'; else cls += ' dim'; }
                  return (<button key={oi} className={cls} onClick={() => answerQ(oi)} disabled={isAns}><span className="gut-opt-letter">{String.fromCharCode(65 + oi)}</span>{o}</button>);
                })}
              </div>
            </>
          ) : (
            <div className="gut-quiz-result">
              <div className="gut-quiz-emoji">{score >= 5 ? '🏆' : score >= 3 ? '🧠' : '📖'}</div>
              <h3 className="gut-quiz-rtitle">{score} / {quizQs.length} doğru</h3>
              <p className="gut-quiz-rdesc">{score >= 5 ? 'İkinci beynine kulak veriyorsun!' : score >= 3 ? 'Güzel — sezgilerin sağlam.' : 'Yukarı kaydırıp bir kez daha sindir.'}</p>
              <button className="gut-ctrl-btn gut-ctrl-primary" onClick={restartQuiz}>↺ Tekrar dene</button>
            </div>
          )}
        </div>
      </section>

      <ArticleBibliography items={refs} accent="#2563eb" />

      <footer className="gut-footer">
        <div className="gut-footer-mark">BASEMENTS</div>
        <p>Bir dahaki sefere “içime sinmedi” dediğinde, bunu söyleyenin yalnızca aklın olmadığını hatırla. Karnındaki o sessiz beyin de masada bir oy sahibi. 🌀</p>
        <Link href="/discover" className="gut-footer-link">← Diğer içerikleri keşfet</Link>
      </footer>

      <style>{`
        .gut-page {
          --accent:#2563eb; --accent-dk:#1d4ed8; --rose:#db2777; --teal:#0d9488;
          --bg:#ffffff; --bg2:#f8fafc; --line:#e2e8f0;
          --ink:#0f172a; --body:#334155; --muted:#64748b;
          background: var(--bg); color: var(--body); min-height: 100vh;
          font-family: system-ui, -apple-system, "Segoe UI", sans-serif; line-height: 1.7; overflow-x: clip;
        }

        .gut-topbar { position: sticky; top: 0; z-index: 40; background: rgba(255,255,255,0.88); backdrop-filter: blur(14px); border-bottom: 1px solid var(--line); padding: 11px 16px; display: flex; align-items: center; gap: 10px; }
        .gut-back { color: var(--ink); display: flex; padding: 6px; border-radius: 50%; transition: background .15s; }
        .gut-back:hover { background: #eef2f7; }
        .gut-topbar-title { font-weight: 600; font-size: .92rem; color: var(--accent); letter-spacing: .04em; font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif; }

        /* HERO */
        .gut-hero { position: relative; text-align: center; padding: 60px 22px 46px; overflow: hidden; border-bottom: 1px solid var(--line); }
        .gut-hero-glow { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 60% 45% at 50% 0%, rgba(37,99,235,0.06), transparent 70%); }
        .gut-hero-art { position: relative; display: flex; justify-content: center; margin-bottom: 16px; }
        .gut-hero-eyebrow { position: relative; font-size: .64rem; font-weight: 700; letter-spacing: .3em; color: var(--accent); margin-bottom: 16px; }
        .gut-hero-title { position: relative; font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif; font-weight: 600; font-size: clamp(2.6rem, 9vw, 5rem); margin: 0 0 18px; letter-spacing: -.01em; line-height: 1; color: var(--ink); }
        .gut-hero-sub { position: relative; max-width: 600px; margin: 0 auto 24px; color: var(--body); font-size: clamp(.96rem, 2.1vw, 1.12rem); }
        .gut-hero-sub em { color: var(--rose); font-style: italic; font-family: "Iowan Old Style", Georgia, serif; }
        .gut-hero-sub strong { color: var(--ink); }
        .gut-hero-tags { position: relative; display: flex; flex-wrap: wrap; gap: 9px; justify-content: center; }
        .gut-tag { padding: 7px 15px; font-size: .76rem; font-weight: 600; color: var(--accent); background: #eff4ff; border: 1px solid #dbe6fb; border-radius: 9999px; letter-spacing: .01em; }

        /* SECTION */
        .gut-section { max-width: 740px; margin: 0 auto; padding: 48px 18px; position: relative; }
        .gut-section::before { content: ''; display: block; width: 44px; height: 2px; background: var(--accent); border-radius: 2px; margin-bottom: 24px; }
        .gut-num { font-size: .72rem; font-weight: 700; letter-spacing: .28em; color: var(--accent); margin-bottom: 10px; }
        .gut-h2 { font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif; font-weight: 600; font-size: clamp(1.7rem, 4.6vw, 2.4rem); margin: 0 0 18px; letter-spacing: -.01em; color: var(--ink); line-height: 1.18; }
        .gut-lead { font-size: 1.18rem; line-height: 1.6; color: #1e293b; margin: 0 0 18px; font-family: "Iowan Old Style", Georgia, serif; }
        .gut-p { color: var(--body); font-size: 1.04rem; margin: 0 0 18px; }
        .gut-p strong, .gut-lead strong, .gut-note strong, .gut-card strong { color: var(--ink); font-weight: 700; }
        .gut-p em, .gut-note em { color: var(--accent-dk); font-style: italic; }

        .reveal { opacity: 0; transform: translateY(24px); transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1); }
        .reveal.visible { opacity: 1; transform: none; }

        /* Quote */
        .gut-quote { font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif; font-style: italic; font-size: clamp(1.18rem, 3vw, 1.5rem); line-height: 1.45; color: var(--ink); margin: 28px 0; padding: 8px 0 8px 24px; border-left: 3px solid var(--accent); position: relative; }
        .gut-quote::before { content: '“'; position: absolute; left: 8px; top: -6px; font-size: 2.2rem; color: rgba(37,99,235,0.25); }

        /* Note */
        .gut-note { display: flex; gap: 14px; background: var(--bg2); border: 1px solid var(--line); border-left: 3px solid var(--accent); border-radius: 12px; padding: 16px 18px; margin: 22px 0; }
        .gut-note > span { font-size: 1.15rem; color: var(--accent); flex-shrink: 0; font-weight: 700; }
        .gut-note p { margin: 0; font-size: .94rem; color: var(--body); }

        /* Şekil / Stepper */
        .gut-stepper { display: grid; grid-template-columns: 1fr 1.1fr; gap: 16px; background: var(--bg2); border: 1px solid var(--line); border-radius: 14px; padding: 18px; margin: 18px 0; box-shadow: 0 1px 2px rgba(15,23,42,0.04); }
        .gut-stepper-viz { display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid var(--line); border-radius: 10px; padding: 10px; min-height: 200px; }
        .gut-svg { width: 100%; height: auto; max-height: 210px; }
        .gut-stepper-panel { display: flex; flex-direction: column; }
        .gut-dots { display: flex; gap: 8px; margin-bottom: 14px; }
        .gut-dot { width: 9px; height: 9px; border-radius: 50%; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; padding: 0; transition: all .25s; }
        .gut-dot.on { background: var(--accent); border-color: var(--accent); transform: scale(1.3); }
        .gut-step-meta { font-size: .68rem; font-weight: 700; letter-spacing: .16em; color: var(--accent); margin-bottom: 8px; }
        .gut-step-title { font-family: "Iowan Old Style", Georgia, serif; font-size: 1.2rem; font-weight: 600; margin: 0 0 8px; color: var(--ink); }
        .gut-step-desc { font-size: .94rem; color: var(--body); margin: 0 0 18px; flex: 1; }
        .gut-stepper-ctrl { display: flex; gap: 8px; }
        .gut-ctrl-btn { flex: 1; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--line); background: #fff; color: var(--ink); font-weight: 600; font-size: .86rem; cursor: pointer; transition: all .2s; }
        .gut-ctrl-btn:disabled { opacity: .4; cursor: not-allowed; }
        .gut-ctrl-btn:not(:disabled):hover { border-color: var(--accent); color: var(--accent); }
        .gut-ctrl-primary { background: var(--accent); border-color: var(--accent); color: #fff; }
        .gut-ctrl-primary:not(:disabled):hover { background: var(--accent-dk); color: #fff; }

        /* Molecules */
        .gut-mols { display: flex; flex-direction: column; gap: 12px; margin: 18px 0; }
        .gut-mol { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; box-shadow: 0 1px 2px rgba(15,23,42,0.04); }
        .gut-mol-top { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 4px; }
        .gut-mol-name { font-family: "Iowan Old Style", Georgia, serif; font-size: 1.25rem; font-weight: 700; }
        .gut-mol-tag { font-size: .76rem; color: var(--muted); letter-spacing: .04em; }
        .gut-mol-bar { height: 8px; background: #eef2f7; border-radius: 5px; overflow: hidden; margin-bottom: 11px; }
        .gut-mol-fill { height: 100%; border-radius: 5px; transition: width 1s cubic-bezier(.2,.7,.2,1); }
        .gut-mol-d { margin: 0; font-size: .9rem; color: var(--body); }

        /* Stats */
        .gut-stat-row { display: flex; gap: 12px; margin: 20px 0; }
        .gut-stat { flex: 1; text-align: center; background: var(--bg2); border: 1px solid var(--line); border-radius: 14px; padding: 18px 10px; }
        .gut-stat-v { display: block; font-family: "Iowan Old Style", Georgia, serif; font-size: clamp(1.1rem, 3.4vw, 1.6rem); font-weight: 600; color: var(--accent-dk); }
        .gut-stat-l { display: block; font-size: .78rem; color: var(--muted); margin-top: 4px; }

        /* Cards */
        .gut-cards { display: flex; flex-direction: column; gap: 12px; margin: 18px 0; }
        .gut-card { display: flex; gap: 16px; background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 18px; box-shadow: 0 1px 2px rgba(15,23,42,0.04); transition: border-color .25s, box-shadow .25s, transform .25s; }
        .gut-card:hover { border-color: #bcd0f5; box-shadow: 0 6px 18px rgba(37,99,235,0.1); transform: translateY(-2px); }
        .gut-card-e { font-size: 1.8rem; flex-shrink: 0; }
        .gut-card strong { display: block; font-family: "Iowan Old Style", Georgia, serif; font-size: 1.08rem; color: var(--accent-dk); margin-bottom: 5px; }
        .gut-card span { font-size: .92rem; color: var(--body); }

        /* Feed */
        .gut-feed { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 18px 0; }
        .gut-feed-card { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 18px; box-shadow: 0 1px 2px rgba(15,23,42,0.04); transition: border-color .25s, box-shadow .25s, transform .25s; }
        .gut-feed-card:hover { border-color: #a7e0d6; box-shadow: 0 6px 18px rgba(13,148,136,0.12); transform: translateY(-3px); }
        .gut-feed-ico { font-size: 1.8rem; margin-bottom: 8px; }
        .gut-feed-card h4 { font-family: "Iowan Old Style", Georgia, serif; margin: 0 0 6px; font-size: 1.05rem; color: var(--teal); }
        .gut-feed-card p { margin: 0; font-size: .88rem; color: var(--body); }
        .gut-disc { font-size: .82rem; color: var(--muted); font-style: italic; margin-top: 16px; }

        /* Numbers */
        .gut-numbers { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 18px 0; }
        .gut-number { background: var(--bg2); border: 1px solid var(--line); border-radius: 14px; padding: 18px; }
        .gut-number-v { display: block; font-family: "Iowan Old Style", Georgia, serif; font-size: 1.5rem; font-weight: 600; color: var(--rose); }
        .gut-number-l { display: block; font-size: .92rem; color: var(--ink); margin: 4px 0 6px; font-weight: 600; }
        .gut-number-s { display: block; font-size: .8rem; color: var(--muted); }

        /* Quiz */
        .gut-quiz { background: var(--bg2); border: 1px solid var(--line); border-radius: 18px; padding: 22px; }
        .gut-quiz-top { display: flex; justify-content: space-between; font-size: .8rem; font-weight: 600; color: var(--muted); margin-bottom: 14px; }
        .gut-quiz-score { color: var(--accent); }
        .gut-quiz-q { font-family: "Iowan Old Style", Georgia, serif; font-size: 1.18rem; font-weight: 600; margin: 0 0 16px; color: var(--ink); }
        .gut-quiz-opts { display: flex; flex-direction: column; gap: 9px; }
        .gut-opt { display: flex; align-items: center; gap: 13px; text-align: left; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--line); background: #fff; color: var(--ink); font-size: .94rem; cursor: pointer; transition: all .2s; }
        .gut-opt:not(:disabled):hover { border-color: var(--accent); background: #eff4ff; }
        .gut-opt-letter { width: 25px; height: 25px; border-radius: 7px; display: grid; place-items: center; font-weight: 700; font-size: .78rem; background: #eef2f7; color: var(--muted); flex-shrink: 0; }
        .gut-opt.correct { border-color: var(--teal) !important; background: #ecfdf6 !important; }
        .gut-opt.correct .gut-opt-letter { background: var(--teal) !important; color: #fff; }
        .gut-opt.wrong { border-color: var(--rose) !important; background: #fdf2f8 !important; }
        .gut-opt.wrong .gut-opt-letter { background: var(--rose) !important; color: #fff; }
        .gut-opt.dim { opacity: .5; }
        .gut-opt:disabled { cursor: default; }
        .gut-quiz-result { text-align: center; padding: 14px; }
        .gut-quiz-emoji { font-size: 3rem; margin-bottom: 8px; }
        .gut-quiz-rtitle { font-family: "Iowan Old Style", Georgia, serif; font-size: 1.5rem; font-weight: 600; margin: 0 0 6px; color: var(--accent-dk); }
        .gut-quiz-rdesc { color: var(--muted); font-size: .94rem; margin: 0 0 18px; }

        /* Footer */
        .gut-footer { max-width: 640px; margin: 0 auto; text-align: center; padding: 44px 22px 66px; border-top: 1px solid var(--line); }
        .gut-footer-mark { font-weight: 700; letter-spacing: .3em; color: var(--accent); font-size: .82rem; margin-bottom: 14px; }
        .gut-footer p { color: var(--body); font-size: 1rem; max-width: 480px; margin: 0 auto 18px; font-family: "Iowan Old Style", Georgia, serif; font-style: italic; }
        .gut-footer-link { color: var(--accent); text-decoration: none; font-weight: 600; font-size: .9rem; }
        .gut-footer-link:hover { text-decoration: underline; }

        @media (max-width: 680px) {
          .gut-section { padding: 38px 16px; }
          .gut-stepper { grid-template-columns: 1fr; }
          .gut-stepper-viz { min-height: 170px; }
          .gut-feed, .gut-numbers { grid-template-columns: 1fr; }
          .gut-stat-row { flex-direction: column; }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal { transition: opacity .3s; transform: none; }
        }
      `}</style>
    </main>
  );
}
