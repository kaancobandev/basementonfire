'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import ArticleImage from '@/app/components/article/ArticleImage';

/* ════════════════════════ VERİ ════════════════════════ */

const waveProps = [
  ['📶', 'Frekans', 'Saniyede kaç dalga tepesinin size ulaştığı. Yüksek frekans = tiz ses / mavi ışık. Düşük frekans = kalın ses / kırmızı ışık.'],
  ['📏', 'Dalga boyu', 'İki tepe arasındaki mesafe. Frekans yükseldikçe dalga boyu kısalır; ikisi ters orantılıdır.'],
];

const techExamples = [
  ['🚓', 'Radar tabancası', 'Polisin cihazı arabaya bir radyo dalgası gönderir; dalga geri yansır. Araç hareketli olduğu için yansıyan dalganın frekansı kayar ve cihaz bu kaymadan hızını anında hesaplar. Hız cezasının faturasını gönül rahatlığıyla Doppler etkisine kesebilirsin.'],
  ['🌪️', 'Meteoroloji (Doppler radarı)', 'Yağmur ve dolu tanelerinden yansıyan sinyalin kaymasını ölçerek yağışın yaklaşıp uzaklaştığını görür. Rüzgârın yönü, fırtına içindeki dönme ve bir tornadonun o ünlü "bir tarafı gelen, öbürü kaçan" dönme imzası erkenden yakalanır.'],
  ['🫀', 'Tıp (Doppler ultrason)', 'Ses dalgaları damarlardaki kırmızı kan hücrelerinden yansır; kayma, kanın yönünü ve hızını ele verir. Kalp kapakçıkları, tıkalı damarlar bununla değerlendirilir. Hamilelikteki ritmik "vuş-vuş" da bebeğin kalbinden gelen Doppler sinyalidir.'],
  ['🪐', 'Astronomi (ötegezegen avı)', 'Bir gezegen, yıldızını yerçekimiyle hafifçe çeker; yıldız bize doğru ve bizden uzağa minik bir salınım yapar, ışığı dönüşümlü maviye ve kırmızıya kayar. İlk bulunan 51 Pegasi b (1995) tam böyle keşfedildi ve 2019 Nobel Fizik Ödülü\'nü getirdi.'],
  ['✨', 'İkili yıldızlar & galaksi dönüşü', 'Birbirinin etrafında dönen iki yıldız sırayla yaklaşıp uzaklaştığı için ışıkları ileri-geri kayar; gözle ayrılamayan çiftler bile böyle bulunur. Bir galaksinin bir kenarı maviye, öbürü kırmızıya kaymışsa, bu onun nasıl döndüğünü gösterir.'],
  ['🛰️', 'Uydular & GPS', 'Yörüngedeki uydular çok hızlı hareket ettiği için sinyallerinin frekansı sürekli kayar. GPS\'in doğru çalışması için bu Doppler kaymaları titizlikle hesaba katılır.'],
  ['🦇', 'Yarasalar, yunuslar & sonar', 'Yarasalar avına ses gönderip yankısını dinler (ekolokasyon) ve yankının kaymasından böceğin hızını çıkarır; bazıları kaymayı dengelemek için kendi frekansını bile ayarlar. Denizaltı sonarları da aynı ilkeyle çalışır.'],
  ['🏎️', 'Formula 1', 'Pistten geçen yarış arabasının o tiz "niiiiiooowww" sesi, ambulansla birebir aynı olaydır; motor sesi çok keskin olduğu için kayma kulağa daha dramatik gelir.'],
];

const tryItYourself = [
  'İşlek bir yolun kenarında durup geçen arabaların sesini dinle — her aracın tam yanından geçerken yaptığı o düşüşü artık fark edeceksin.',
  'Bir arkadaşından kornaya basılı tutarak yanından geçmesini iste; tizden kalına geçişi net duyarsın.',
  'Hemzemin geçitte geçen bir trenin düdüğüne ya da uzaktan geçen bir ambulansa kulak ver.',
];

const quizQs = [
  { text: 'Bir ambulans yanından geçerken aslında değişen nedir?', opts: ['Sirenin gerçek frekansı', 'Sesin sana ulaşma biçimi (senin duyduğun frekans)', 'Havanın sıcaklığı', 'Sirenin ses düzeyi'], a: 1 },
  { text: 'Kaynak sana yaklaşırken dalgalara ne olur?', opts: ['Gerilir, frekans düşer', 'Sıkışır, frekans yükselir (tizleşir)', 'Hiçbir şey olmaz', 'Tamamen durur'], a: 1 },
  { text: 'Buys Ballot 1845 deneyinde Doppler etkisini neyle kanıtladı?', opts: ['Bir teleskopla', 'Trende kesintisiz nota çalan trompetçilerle', 'Bir diyapazonla', 'Şimşekle'], a: 1 },
  { text: 'Işıkta "maviye kayma" ne anlama gelir?', opts: ['Kaynak bizden uzaklaşıyor', 'Kaynak bize yaklaşıyor (dalga boyu kısalır)', 'Kaynak duruyor', 'Kaynak ısınıyor'], a: 1 },
  { text: 'Evrenin genişlediği fikri hangi gözlemden doğdu?', opts: ['Ayın evrelerinden', 'Uzak galaksilerin kırmızıya kaymasından (Hubble, 1929)', 'Güneş lekelerinden', 'Meteor yağmurlarından'], a: 1 },
  { text: 'İlk ötegezegen 51 Pegasi b nasıl bulundu?', opts: ['Doğrudan fotoğrafla', 'Yıldızın Doppler salınımıyla (ışığının ileri-geri kayması)', 'Radyo patlamasıyla', 'Tesadüfen'], a: 1 },
  { text: 'Polis radarı hızı nasıl ölçer?', opts: ['Lastik izinden', 'Araçtan yansıyan dalganın Doppler kaymasından', 'Motor sesinden', 'Far parlaklığından'], a: 1 },
  { text: 'Doppler etkisi ile ses patlaması (sonic boom) farkı nedir?', opts: ['İkisi aynıdır', 'Ses patlaması, kaynak ses hızına ulaşıp şok konisi oluşturunca olur; Doppler ise frekansı kaydırır', 'Doppler sadece uçaklarda olur', 'Ses patlaması sessizdir'], a: 1 },
  { text: 'Ambulans geçerken ses nasıl değişir?', opts: ['Yavaş yavaş kalınlaşır', 'Tizden kalına KESKİN bir basamakla düşer (geçiş anında)', 'Hiç değişmez', 'Önce kalın sonra tiz olur'], a: 1 },
];

const refs: BibItem[] = [
  { title: 'Über das farbige Licht der Doppelsterne und einiger anderer Gestirne des Himmels', authors: 'Christian Doppler', year: '1842', source: 'Kraliyet Bohemya Bilimler Cemiyeti, Prag' },
  { title: 'Akustische Versuche auf der Niederländischen Eisenbahn (trenli trompetçi deneyi)', authors: 'C. H. D. Buys Ballot', year: '1845', source: 'Annalen der Physik 142, 321' },
  { title: 'A relation between distance and radial velocity among extra-galactic nebulae', authors: 'Edwin Hubble', year: '1929', source: 'PNAS 15, 168' },
  { title: 'A Jupiter-mass companion to a solar-type star (51 Pegasi b)', authors: 'M. Mayor & D. Queloz', year: '1995', source: 'Nature 378, 355' },
  { title: 'The Nobel Prize in Physics 2019 (Mayor & Queloz)', source: 'NobelPrize.org', url: 'https://www.nobelprize.org/prizes/physics/2019/summary/' },
  { title: 'Doppler effect', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Doppler_effect' },
  { title: 'Redshift', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Redshift' },
  { title: 'The Doppler Effect', source: 'HyperPhysics (Georgia State Univ.)', url: 'http://hyperphysics.phy-astr.gsu.edu/hbase/Sound/dopp.html' },
];

/* ════════════════════════ YARDIMCILAR ════════════════════════ */

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); o.disconnect(); } }, { threshold: 0.12 });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  return <div ref={ref} className={`transition-all duration-700 ease-out ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>{children}</div>;
}

function Frac({ num, den }: { num: ReactNode; den: ReactNode }) {
  return (
    <span className="inline-flex flex-col items-center align-middle mx-1 text-center leading-none">
      <span className="px-2 pb-0.5 border-b border-current">{num}</span>
      <span className="px-2 pt-0.5">{den}</span>
    </span>
  );
}

/* ─── İnteraktif: hareket eden kaynak + dalga cepheleri ─── */
function DopplerSim() {
  const SOUND = 340;
  const [speedPct, setSpeedPct] = useState(50);
  const [freq, setFreq] = useState(700);
  const v = speedPct / 100; // ses hızının oranı (c = 1)
  const N = 5, SCALE = 34, cx0 = 300, cy = 150;
  const rings = Array.from({ length: N }, (_, i) => {
    const k = i + 1;
    return { cx: cx0 - v * k * SCALE, r: k * SCALE, op: 0.9 - i * 0.13 };
  });
  const fFront = Math.round(freq / (1 - v));
  const fRear = Math.round(freq / (1 + v));
  const speedMs = Math.round(v * SOUND);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="overflow-hidden rounded-xl bg-[#060a14] ring-1 ring-white/5">
        <svg viewBox="0 0 600 300" className="w-full h-auto">
          {/* zemin çizgisi */}
          <line x1="0" y1={cy} x2="600" y2={cy} stroke="#1e293b" strokeWidth="1" />
          {/* dalga cepheleri */}
          {rings.map((r, i) => (
            <circle key={i} cx={r.cx} cy={cy} r={r.r} fill="none" stroke="#38bdf8" strokeOpacity={r.op} strokeWidth="2" />
          ))}
          {/* kaynak */}
          <circle cx={cx0} cy={cy} r="7" fill="#fbbf24" />
          <text x={cx0} y={cy - 14} textAnchor="middle" fontSize="18">🚑</text>
          <path d={`M${cx0 + 12} ${cy} l16 0 m-5 -4 l5 4 -5 4`} stroke="#fbbf24" strokeWidth="2" fill="none" />
          {/* gözlemciler */}
          <g>
            <text x="566" y={cy + 5} textAnchor="middle" fontSize="20">🧍</text>
            <text x="566" y={cy - 18} textAnchor="middle" fontSize="11" fill="#38bdf8" fontWeight="700">{fFront} Hz</text>
            <text x="566" y={cy + 30} textAnchor="middle" fontSize="9" fill="#7dd3fc">tiz ↑</text>
          </g>
          <g>
            <text x="34" y={cy + 5} textAnchor="middle" fontSize="20">🧍</text>
            <text x="34" y={cy - 18} textAnchor="middle" fontSize="11" fill="#fb7185" fontWeight="700">{fRear} Hz</text>
            <text x="34" y={cy + 30} textAnchor="middle" fontSize="9" fill="#fda4af">kalın ↓</text>
          </g>
          {/* etiketler */}
          <text x="430" y="280" textAnchor="middle" fontSize="11" fill="#38bdf8">ÖNDE · sıkışmış · yüksek frekans</text>
          <text x="150" y="280" textAnchor="middle" fontSize="11" fill="#fb7185">ARKADA · gerilmiş · düşük frekans</text>
        </svg>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="flex justify-between text-sm text-slate-300"><span>Kaynağın hızı</span><span className="font-mono text-amber-400">{speedMs} m/s</span></span>
          <input type="range" min={0} max={80} value={speedPct} onChange={e => setSpeedPct(+e.target.value)} className="mt-2 w-full accent-amber-500" aria-label="Kaynak hızı" />
          <span className="text-xs text-slate-500">{speedPct}% ses hızı</span>
        </label>
        <label className="block">
          <span className="flex justify-between text-sm text-slate-300"><span>Yayılan frekans</span><span className="font-mono text-sky-400">{freq} Hz</span></span>
          <input type="range" min={200} max={1000} step={10} value={freq} onChange={e => setFreq(+e.target.value)} className="mt-2 w-full accent-sky-500" aria-label="Yayılan frekans" />
          <span className="text-xs text-slate-500">kaynağın gerçek sesi</span>
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3">
          <div className="font-mono text-xl font-bold text-sky-300">{fFront} Hz</div>
          <div className="text-xs text-sky-200/80">öndeki gözlemci (yaklaşıyor)</div>
        </div>
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
          <div className="font-mono text-xl font-bold text-rose-300">{fRear} Hz</div>
          <div className="text-xs text-rose-200/80">arkadaki gözlemci (uzaklaşıyor)</div>
        </div>
      </div>
      <div className="sr-only" aria-live="polite">Öndeki gözlemci {fFront} hertz, arkadaki gözlemci {fRear} hertz duyar.</div>
      <p className="mt-3 text-xs text-slate-500">Kaydırıcıları oynat: kaynak hızlandıkça önde dalgalar sıkışır (frekans artar, mavi), arkada gerilir (frekans düşer, kırmızı). Sirenin gerçek sesi hiç değişmiyor — değişen, gözlemciye ulaşan frekans.</p>
    </div>
  );
}

/* ─── İnteraktif: kırmızıya / maviye kayma tayfı ─── */
function SpectrumShift() {
  const [vel, setVel] = useState(0); // -100 (uzaklaşıyor/kırmızı) .. +100 (yaklaşıyor/mavi)
  const shift = -vel * 0.16; // yaklaşma (+) → sola (maviye)
  const baseLines = [26, 42, 58, 74];
  const state = vel > 6 ? 'mavi' : vel < -6 ? 'kirmizi' : 'durgun';
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="relative h-16 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-emerald-400 to-red-600">
        {baseLines.map((b, i) => (
          <div key={i} className="absolute top-0 h-full w-[3px] bg-black/70" style={{ left: `${b + shift}%` }} />
        ))}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 text-[0.7rem] font-semibold text-black/70">
          <span>← mavi</span><span>kırmızı →</span>
        </div>
      </div>
      <div className="mt-4">
        <span className="flex justify-between text-sm text-slate-300">
          <span>Göreli hız</span>
          <span className={`font-semibold ${state === 'mavi' ? 'text-sky-400' : state === 'kirmizi' ? 'text-rose-400' : 'text-slate-400'}`}>
            {state === 'mavi' ? 'Maviye kayma — yaklaşıyor' : state === 'kirmizi' ? 'Kırmızıya kayma — uzaklaşıyor' : 'Durağan — kayma yok'}
          </span>
        </span>
        <input type="range" min={-100} max={100} value={vel} onChange={e => setVel(+e.target.value)} className="mt-2 w-full accent-violet-500" aria-label="Göreli hız" />
        <div className="flex justify-between text-xs text-slate-500"><span>uzaklaşıyor</span><span>0</span><span>yaklaşıyor</span></div>
      </div>
    </div>
  );
}

/* ════════════════════════ ANA BİLEŞEN ════════════════════════ */

export default function DopplerClient() {
  const [quizQ, setQuizQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);

  function answerQ(sel: number) {
    if (answered[quizQ] !== undefined) return;
    if (sel === quizQs[quizQ].a) setScore(s => s + 1);
    setAnswered(prev => ({ ...prev, [quizQ]: sel }));
    setTimeout(() => { if (quizQ + 1 < quizQs.length) setQuizQ(q => q + 1); else setDone(true); }, 900);
  }
  function restartQuiz() { setQuizQ(0); setScore(0); setAnswered({}); setDone(false); }

  return (
    <main className="main-content">
      <style>{`
        /* ArticleImage'ın slate varsayılanlarını makalenin gökyüzü mavisine bağla. */
        .dp-img {
          --ai-caption: #cbd5e1;
          --ai-credit: #6f8ba3;
          --ai-border: rgba(56,189,248,0.22);
          --ai-fill: rgba(56,189,248,0.05);
          --ai-mark: rgba(56,189,248,0.28);
        }
        .dp-img-pair { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; align-items: start; }
        @media (max-width: 700px) { .dp-img-pair { grid-template-columns: 1fr; } }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-[#0a1226] via-[#070b16] to-[#070b16] text-slate-300">

        {/* Topbar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#070b16]/80 px-5 py-3 backdrop-blur">
          <Link href="/" aria-label="Ana sayfa" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-sky-400 transition hover:-translate-x-0.5 hover:bg-sky-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </Link>
          <span className="text-sm font-semibold tracking-wide text-slate-400">Doppler Etkisi</span>
        </div>

        {/* Hero */}
        <header className="relative mx-auto max-w-3xl px-6 pb-10 pt-16 text-center">
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-6 -z-0 h-56 w-[120%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(56,189,248,0.16),transparent)] blur-xl" />
          <div className="relative z-10 mb-5 flex justify-center" aria-hidden>
            <svg viewBox="0 0 240 110" width="200">
              <line x1="0" y1="55" x2="240" y2="55" stroke="#1e293b" strokeWidth="1" />
              {[1, 2, 3, 4].map(k => (
                <circle key={`b${k}`} cx={150 - k * 6} cy="55" r={k * 17} fill="none" stroke="#38bdf8" strokeOpacity={0.85 - k * 0.13} strokeWidth="2" />
              ))}
              {[1, 2, 3, 4].map(k => (
                <circle key={`r${k}`} cx={150 - k * 6} cy="55" r={k * 17} fill="none" stroke="#fb7185" strokeOpacity={0.0} strokeWidth="0" />
              ))}
              <circle cx="150" cy="55" r="5" fill="#fbbf24" />
            </svg>
          </div>
          <div className="relative z-10 mb-3 text-xs font-semibold tracking-[0.2em] text-sky-400">HAREKETİN SESİ VE IŞIĞI</div>
          <h1 className="relative z-10 mb-5 bg-gradient-to-r from-sky-400 via-slate-100 to-rose-400 bg-clip-text text-5xl font-extrabold leading-none text-transparent sm:text-6xl">Doppler Etkisi</h1>
          <p className="relative z-10 mx-auto max-w-xl text-lg text-slate-300">
            Bir ambulans yaklaşırken sireni tizdir; geçince aniden kalınlaşır — o klasik <em className="text-sky-300 not-italic">niiii-yaaaov</em> kayması.
            Siren hep aynı sesi çalar; değişen, sesin sana <strong className="font-semibold text-slate-100">ulaşma biçimidir.</strong> Aynı basit fikir,
            hız cezasından evrenin genişlemesine kadar uzanır.
          </p>
          <div className="relative z-10 mt-6 flex flex-wrap justify-center gap-2">
            {['Frekans kayması', 'Kırmızıya/maviye kayma', 'Christian Doppler', 'Radar & ultrason', 'Evrenin genişlemesi'].map(t => (
              <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-sky-300">{t}</span>
            ))}
          </div>
        </header>

        {/* I. Temel Sezgi */}
        <Reveal>
          <section className="mx-auto max-w-3xl border-t border-white/10 px-6 py-10">
            <div className="mb-2 text-sm font-bold tracking-widest text-sky-400">01</div>
            <h2 className="mb-4 text-2xl font-bold text-slate-50 sm:text-3xl">Temel Sezgi: Dalgaların Sıkışması ve Gerilmesi</h2>
            <p className="mb-4 leading-relaxed">Doppler etkisini anlamanın en kolay yolu, onu bir <strong className="font-semibold text-slate-100">dalga olayı</strong> olarak düşünmektir. Ses bir dalgadır; ışık da bir dalgadır — ışığın dalga doğası en çarpıcı biçimde <Link href="/articles/cift-yarik" className="article-ilink">çift yarık deneyinde</Link> ortaya çıkar. Her dalganın iki temel özelliği vardır:</p>
            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              {waveProps.map(([e, t, d]) => (
                <div key={t} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-1 text-2xl">{e}</div>
                  <div className="font-semibold text-slate-100">{t}</div>
                  <div className="text-sm text-slate-400">{d}</div>
                </div>
              ))}
            </div>
            <p className="mb-4 leading-relaxed">Durgun bir göle taş atın: halkalar her yöne eşit hızda, eş merkezli yayılır. Kaynak sabit olduğu için hangi yönden bakarsan bak dalgalar aynıdır. Peki ya kaynak hareket ediyorsa? Bir ördek gölde yüzerken, <strong className="font-semibold text-sky-300">önündeki</strong> dalgaları kovalar ve sıkıştırır; <strong className="font-semibold text-rose-300">arkasında</strong> ise dalgalar gerilip açılır. Sesle de tıpatıp aynısı olur — aşağıdaki simülasyonda kaynağın hızını değiştir:</p>
            <DopplerSim />
            <blockquote className="my-6 rounded-r-xl border-l-4 border-sky-400 bg-sky-400/5 px-5 py-4 text-lg italic text-slate-100">
              Kaynak sana <span className="text-sky-300">yaklaşırken</span> dalgalar sıkışır, frekans yükselir (tizleşir). Kaynak senden <span className="text-rose-300">uzaklaşırken</span> dalgalar gerilir, frekans düşer (kalınlaşır).
            </blockquote>
            <p className="mb-4 leading-relaxed">Ambulans gelirken öndeki sıkışmış dalgaları duyarsın (tiz); geçip uzaklaşınca arkadaki gerilmiş dalgaları (kalın). Sirenin frekansı hiç değişmedi — senin konumun değişti.</p>
            <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="text-xl">🏃</span>
              <p className="text-sm text-slate-300">Etki sadece kaynak hareket edince değil, <strong className="font-semibold text-slate-100">sen hareket edince</strong> de olur. Sabit bir çana doğru koşarsan ses daha tiz gelir; çünkü dalga tepelerine koşarak onlara daha sık çarparsın. Önemli olan <Link href="/articles/newton" className="article-ilink"><strong className="font-semibold text-slate-100">göreli harekettir.</strong></Link></p>
            </div>
          </section>
        </Reveal>

        {/* II. Tarihçe */}
        <Reveal>
          <section className="mx-auto max-w-3xl border-t border-white/10 px-6 py-10">
            <div className="mb-2 text-sm font-bold tracking-widest text-sky-400">02</div>
            <h2 className="mb-4 text-2xl font-bold text-slate-50 sm:text-3xl">Christian Doppler ve Trenli Trompetçiler</h2>
            <p className="mb-4 leading-relaxed">Olay adını Avusturyalı fizikçi <strong className="font-semibold text-slate-100">Christian Doppler</strong>'den (1803–1853) alır. 1842'de Prag'da sunduğu makalede çarpıcı bir öngörüde bulundu: bir yıldız bize yaklaşıyorsa ışığı <span className="text-sky-300">maviye</span>, uzaklaşıyorsa <span className="text-rose-300">kırmızıya</span> kaymalıydı. Temel fikir doğruydu ama örneği yanlıştı — yıldızlar görünür bir renk değişimi yaratamayacak kadar yavaştı.</p>
            <p className="mb-4 leading-relaxed">İlke çok geçmeden, bilim tarihinin en şirin deneylerinden biriyle doğrulandı. 1845'te Hollandalı meteorolog <strong className="font-semibold text-slate-100">Buys Ballot</strong>, Utrecht yakınındaki yeni demiryolunu kullandı: açık bir vagona trompetçiler koyup tek bir notayı kesintisiz çaldırdı; peronda mutlak kulağa sahip müzisyenler bekliyordu. Tren yaklaşırken nota daha tiz, uzaklaşırken daha kalın duyuldu — tam Doppler'in dediği gibi.</p>
            <div className="dp-img-pair my-6">
              <ArticleImage
                className="dp-img"
                src="/articles/doppler/christian-doppler.webp"
                ratio="499 / 640"
                alt="19. yüzyıl gravürü: favorili, ciddi bakışlı bir adamın omuz hizasından portresi, koyu ceket ve papyonla."
                caption="Christian Doppler (1803–1853). Etkinin adını taşıyan Avusturyalı fizikçi, ilkeyi 1842'de yıldız ışığı için önerdi."
                credit="Kamu malı"
              />
              <ArticleImage
                className="dp-img"
                src="/articles/doppler/buys-ballot.webp"
                ratio="1600 / 2611"
                alt="Sakallı, koyu takım elbiseli bir adamın ayakta çekilmiş siyah beyaz stüdyo fotoğrafı."
                caption="Christophorus Buys Ballot: 1845'te açık vagona trompetçiler bindirip yanından geçirerek ilkeyi kulakla doğruladı. Fotoğraf deneyden yıllar sonra, 1860–80 arasında çekilmiş."
                credit="Rijksmuseum · CC0"
              />
            </div>

            <blockquote className="rounded-r-xl border-l-4 border-amber-400 bg-amber-400/5 px-5 py-4 italic text-slate-100">Doppler etkisi, soyut bir formülden önce, bir buharlı lokomotifin üzerinde trompet çalan birkaç müzisyenle kanıtlandı.</blockquote>
          </section>
        </Reveal>

        {/* III. Sesin formülü */}
        <Reveal>
          <section className="mx-auto max-w-3xl border-t border-white/10 px-6 py-10">
            <div className="mb-2 text-sm font-bold tracking-widest text-sky-400">03</div>
            <h2 className="mb-4 text-2xl font-bold text-slate-50 sm:text-3xl">Sesin Doppler Etkisi: Formül ve Bir Örnek</h2>
            <p className="mb-4 leading-relaxed">Korkma, formül göründüğünden basittir. Duyulan frekans:</p>
            <div className="mb-5 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center text-lg text-slate-100">
              <span className="font-mono">f′ = f ×</span>
              <Frac num={<span className="font-mono">v<sub>ses</sub> ± v<sub>gözlemci</sub></span>} den={<span className="font-mono">v<sub>ses</sub> ∓ v<sub>kaynak</sub></span>} />
            </div>
            <p className="mb-4 leading-relaxed">Kural tek cümle: <strong className="font-semibold text-sky-300">yaklaşma frekansı artırır</strong> (paydayı küçültür), <strong className="font-semibold text-rose-300">uzaklaşma azaltır</strong> (paydayı büyütür). Bir ambulans düşünelim — siren 700 Hz, araç 30 m/s (~108 km/s), ses 340 m/s:</p>
            <div className="mb-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 text-center">
                <div className="mb-2 text-sm font-semibold text-sky-300">Yaklaşırken</div>
                <div className="flex items-center justify-center text-slate-100">700 × <Frac num="340" den="310" /> ≈ <span className="ml-1 font-mono text-xl font-bold text-sky-300">768 Hz</span></div>
              </div>
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-center">
                <div className="mb-2 text-sm font-semibold text-rose-300">Uzaklaşırken</div>
                <div className="flex items-center justify-center text-slate-100">700 × <Frac num="340" den="370" /> ≈ <span className="ml-1 font-mono text-xl font-bold text-rose-300">643 Hz</span></div>
              </div>
            </div>
            <p className="mb-4 leading-relaxed">Araç yanından geçtiği anda ses <strong className="font-semibold text-slate-100">768 Hz'den 643 Hz'e</strong>, yani ~125 Hz birden düşer. Müzikal olarak bu kabaca bir <strong className="font-semibold text-slate-100">minör üçlü</strong> aralığıdır (≈3 yarım ses) — piyanoda "mi"den "do"ya inmek gibi. Sesin neden neredeyse şarkı gibi düştüğünün sebebi budur.</p>
            <div className="flex gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
              <span className="text-xl">⚠️</span>
              <p className="text-sm text-slate-300"><strong className="font-semibold text-amber-300">Sık yapılan hata:</strong> Ses yavaş yavaş kalınlaşmaz. Yaklaşırken sabit ve tiz kalır (768 Hz), uzaklaşırken sabit ve kalın (643 Hz). Dramatik düşüş neredeyse tamamen geçiş anında olur — duyduğun şey yumuşak bir iniş değil, <strong className="font-semibold text-slate-100">"yüksek — geçiş — düşük"</strong> şeklinde keskin bir basamaktır.</p>
            </div>
          </section>
        </Reveal>

        {/* IV. Işığın Doppler etkisi */}
        <Reveal>
          <section className="mx-auto max-w-3xl border-t border-white/10 px-6 py-10">
            <div className="mb-2 text-sm font-bold tracking-widest text-sky-400">04</div>
            <h2 className="mb-4 text-2xl font-bold text-slate-50 sm:text-3xl">Işığın Doppler Etkisi: Kırmızıya ve Maviye Kayma</h2>
            <p className="mb-4 leading-relaxed">Işık da bir dalga olduğu için aynısını yapar. Astronomide buna özel isim verilir — aşağıdaki kaydırıcıyla göreli hızı değiştir, tayf çizgilerinin kaymasını izle:</p>
            <SpectrumShift />
            <div className="my-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4">
                <div className="font-semibold text-sky-300">Maviye kayma</div>
                <div className="text-sm text-slate-300">Kaynak bize yaklaşıyorsa dalga boyu kısalır, renk spektrumun mavi ucuna kayar.</div>
              </div>
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                <div className="font-semibold text-rose-300">Kırmızıya kayma</div>
                <div className="text-sm text-slate-300">Kaynak uzaklaşıyorsa dalga boyu uzar, renk kırmızı uca kayar.</div>
              </div>
            </div>
            <p className="mb-4 leading-relaxed">Kritik fark: ses yayılmak için bir <strong className="font-semibold text-slate-100">ortama</strong> (hava, su) muhtaçtır; ışık ise boşlukta da yol alır. Bu yüzden ışıkta "havanın hızı" yoktur, yalnızca göreli hız önemlidir. <Link href="/articles/takyon" className="article-ilink">Işık hızına</Link> yakın hızlarda Einstein'ın göreliliği işe karışır (zaman genleşmesi); kaynak tam yana hareket etse bile küçük bir <strong className="font-semibold text-slate-100">enine Doppler etkisi</strong> görülür — tamamen göreliliğe özgüdür.</p>
            <p className="leading-relaxed">Günlük hayatta arabanın farları maviye kaymaz; araba ışık hızının yanında kaplumbağa kadar yavaştır. Doppler'in yıldız fikrinin ilk başta tutmamasının sebebi de buydu. Ama astronomik hızlarda kayma ölçülebilir hale gelir — ve işte orada işler büyür.</p>
          </section>
        </Reveal>

        {/* V. Evrenin genişlemesi */}
        <Reveal>
          <section className="mx-auto max-w-3xl border-t border-white/10 px-6 py-10">
            <div className="mb-2 text-sm font-bold tracking-widest text-sky-400">05</div>
            <h2 className="mb-4 text-2xl font-bold text-slate-50 sm:text-3xl">Evrenin Genişlemesi: Kozmik Kırmızıya Kayma</h2>
            <p className="mb-4 leading-relaxed">20. yüzyılın en büyük keşiflerinden biri doğrudan bu kırmızıya kaymadan doğdu. 1910'larda <strong className="font-semibold text-slate-100">Vesto Slipher</strong> uzak galaksilerde belirgin kırmızıya kaymalar ölçtü. 1929'da <strong className="font-semibold text-slate-100">Edwin Hubble</strong> bunu uzaklıklarla birleştirip şaşırtıcı bir örüntü buldu: galaksiler bizden uzaklaşıyordu ve <strong className="font-semibold text-slate-100">ne kadar uzaktaysa o kadar hızlı.</strong></p>
            <p className="mb-4 leading-relaxed">Tek mantıklı açıklama vardı: <Link href="/articles/black-hole" className="article-ilink"><strong className="font-semibold text-sky-300">evren genişliyor.</strong></Link> Bu, Büyük Patlama modelinin temel taşlarından biri oldu.</p>
            <div className="mx-auto my-6 max-w-xs">
              <ArticleImage
                className="dp-img"
                src="/articles/doppler/edwin-hubble.webp"
                ratio="846 / 1068"
                alt="Pipo içen, takım elbiseli orta yaşlı bir adamın siyah beyaz portresi; kolları kavuşturulmuş, yana bakıyor."
                caption="Edwin Hubble. Uzak galaksilerin kırmızıya kaymasını uzaklıklarıyla birleştirerek evrenin genişlediğini gösterdi (1929)."
                credit="Johan Hagemeyer · kamu malı"
              />
            </div>

            <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="text-xl">🍞</span>
              <p className="text-sm text-slate-300">Güzel incelik: kozmik kırmızıya kayma, galaksilerin uzayda "fırlatılmış top gibi" koşmasından değil; <strong className="font-semibold text-slate-100">uzayın kendisinin genişlemesinden</strong> kaynaklanır — ışığın dalga boyu da onunla gerilir. Galaksiler boşlukta koşmuyor, aralarındaki boşluk büyüyor. Hamuru gererken üzerindeki iki noktanın uzaklaşması gibi.</p>
            </div>
          </section>
        </Reveal>

        {/* VI. Örnekler */}
        <Reveal>
          <section className="mx-auto max-w-3xl border-t border-white/10 px-6 py-10">
            <div className="mb-2 text-sm font-bold tracking-widest text-sky-400">06</div>
            <h2 className="mb-4 text-2xl font-bold text-slate-50 sm:text-3xl">Günlük Hayattan ve Teknolojiden Örnekler</h2>
            <p className="mb-5 leading-relaxed">Doppler'in büyüsü, aynı basit fikrin ne kadar farklı kılığa girdiğini fark edince başlar:</p>
            <div className="grid gap-3">
              {techExamples.map(([e, t, d]) => (
                <div key={t} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-sky-500/30 hover:bg-sky-500/[0.04]">
                  <div className="shrink-0 text-2xl">{e}</div>
                  <div>
                    <div className="font-semibold text-slate-100">{t}</div>
                    <div className="text-sm text-slate-400">{d}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="dp-img-pair mt-6">
              <ArticleImage
                className="dp-img"
                src="/articles/doppler/doppler-radari.webp"
                ratio="1600 / 1246"
                alt="Açık alanda beyaz küresel bir radar kubbesi; arkasında koyu fırtına bulutları ve yağmur perdesi."
                caption="Meteoroloji radarı: yağmur damlalarından yansıyan sinyalin frekans kayması, damlaların yaklaşıp uzaklaşma hızını verir. Hortum uyarıları bu ölçümden çıkar."
                credit="Eric Kurth, NOAA · kamu malı"
              />
              <ArticleImage
                className="dp-img"
                src="/articles/doppler/doppler-ultrason.webp"
                ratio="1024 / 698"
                alt="Ultrason ekranı: üstte gri damar kesiti, altta düzenli tepeler hâlinde dalgalanan renkli akış grafiği."
                caption="Doppler ultrasonu: alttaki dalgalı iz, kandaki hücrelerden yansıyan sesin frekans kaymasıdır — yani akışın hızı ve yönü. Aynı ilke, bu kez damarın içinde."
                credit="Cerevisae · CC BY-SA 4.0"
              />
              <ArticleImage
                className="dp-img"
                src="/articles/doppler/radar-tabancasi.webp"
                ratio="1600 / 1067"
                alt="Üniformalı bir kişinin elinde tuttuğu, tabanca biçiminde el tipi radar cihazı."
                caption="El tipi radar: cihaz bir sinyal yollar, araçtan dönen sinyalin frekans farkı doğrudan hızı verir."
                credit="U.S. Army · kamu malı"
              />
              <ArticleImage
                className="dp-img"
                src="/articles/doppler/51-pegasi-b.webp"
                ratio="1600 / 1006"
                alt="Çizim: turuncu bir yıldızın çok yakınında dönen, sıcaktan parlayan dev bir gaz gezegeni."
                caption="51 Pegasi b, Güneş benzeri bir yıldızın çevresinde bulunan ilk ötegezegen (1995) — yıldızın Doppler salınımından tespit edildi. Bu bir fotoğraf değil, sanatçı yorumu: gezegen hiç doğrudan görüntülenmedi."
                credit="ESO/M. Kornmesser · CC BY 4.0"
              />
            </div>
          </section>
        </Reveal>

        {/* VII. Doppler ≠ ses patlaması */}
        <Reveal>
          <section className="mx-auto max-w-3xl border-t border-white/10 px-6 py-10">
            <div className="mb-2 text-sm font-bold tracking-widest text-sky-400">07</div>
            <h2 className="mb-4 text-2xl font-bold text-slate-50 sm:text-3xl">Sık Karıştırılan Nokta: Doppler ≠ Ses Patlaması</h2>
            <p className="mb-5 leading-relaxed">İki olay sıkça karıştırılır. <strong className="font-semibold text-slate-100">Doppler</strong>, kaynak dalgalardan yavaş hareket ettiğinde olur: dalgalar önde sıkışır, arkada gerilir, ama düzenli daireler hâlinde yayılmaya devam eder.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-500/30 bg-sky-500/[0.06] p-4">
                <svg viewBox="0 0 160 90" className="mb-2 w-full">
                  <line x1="0" y1="45" x2="160" y2="45" stroke="#1e293b" />
                  {[1, 2, 3].map(k => <circle key={k} cx={95 - k * 5} cy="45" r={k * 13} fill="none" stroke="#38bdf8" strokeOpacity={0.8 - k * 0.18} strokeWidth="1.6" />)}
                  <circle cx="95" cy="45" r="4" fill="#fbbf24" />
                </svg>
                <div className="font-semibold text-sky-300">Doppler (hız &lt; ses)</div>
                <div className="text-sm text-slate-400">Frekansı kaydırır; dalgalar yine de dairesel yayılır.</div>
              </div>
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.06] p-4">
                <svg viewBox="0 0 160 90" className="mb-2 w-full">
                  <line x1="0" y1="45" x2="160" y2="45" stroke="#1e293b" />
                  <path d="M120 45 L40 15 M120 45 L40 75" stroke="#fb7185" strokeWidth="2" fill="none" />
                  {[0, 1, 2].map(k => <circle key={k} cx={50 + k * 28} cy="45" r={18 - k * 2} fill="none" stroke="#fb7185" strokeOpacity="0.45" strokeWidth="1.4" />)}
                  <circle cx="120" cy="45" r="4" fill="#fbbf24" />
                </svg>
                <div className="font-semibold text-rose-300">Ses patlaması (hız ≥ ses)</div>
                <div className="text-sm text-slate-400">Dalgalar üst üste binip şok konisi oluşturur — tek, şiddetli bir basınç darbesi.</div>
              </div>
            </div>

            <ArticleImage
              className="dp-img mt-5"
              src="/articles/doppler/ses-patlamasi.webp"
              ratio="1600 / 1143"
              alt="Deniz üzerinde alçaktan uçan savaş uçağının çevresinde oluşmuş, huni biçiminde beyaz bulut bulutu."
              caption="Ses hızına yaklaşan bir uçağın çevresinde yoğuşan nem konisi. Doppler ile karıştırılan görüntü bu: burada frekans kaymasını değil, üst üste binen dalgaların yarattığı basınç konisini görüyorsunuz."
              credit="Ensign John Gay, U.S. Navy · kamu malı"
            />
          </section>
        </Reveal>

        {/* VIII. Kendin dene */}
        <Reveal>
          <section className="mx-auto max-w-3xl border-t border-white/10 px-6 py-10">
            <div className="mb-2 text-sm font-bold tracking-widest text-sky-400">08</div>
            <h2 className="mb-4 text-2xl font-bold text-slate-50 sm:text-3xl">Kendin Dene</h2>
            <p className="mb-5 leading-relaxed">Doppler etkisini kitap okumadan, doğrudan deneyimleyebilirsin:</p>
            <ul className="grid gap-3">
              {tryItYourself.map((t, i) => (
                <li key={i} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-300">{i + 1}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-slate-400">Bir kez fark ettikten sonra bu sesi her yerde duymaya başlayacaksın.</p>
          </section>
        </Reveal>

        {/* Kapanış */}
        <Reveal>
          <section className="mx-auto max-w-3xl border-t border-white/10 px-6 py-10">
            <h2 className="mb-4 text-2xl font-bold text-slate-50 sm:text-3xl">Kapanış</h2>
            <p className="mb-4 leading-relaxed">Doppler etkisi, tek bir sade fikrin ne kadar uzağa gidebileceğinin en güzel örneklerindendir: <strong className="font-semibold text-slate-100">göreli hareket, dalgaları sıkıştırır ya da gerer.</strong> Bu kadarcık ilke, bir buharlı trenin üzerindeki trompetçilerle kanıtlandı; bugün hız yapan arabaları yakalıyor, tornadoları haber veriyor, atan bir kalbin içine bakıyor, başka güneşlerin gezegenlerini buluyor ve tüm evrenin genişlediğini ölçüyor.</p>
            <blockquote className="rounded-r-xl border-l-4 border-sky-400 bg-gradient-to-r from-sky-400/10 to-rose-400/10 px-5 py-4 text-lg italic text-slate-100">Bir sonraki sefere bir ambulans geçtiğinde sadece bir siren duymayacaksın; aynı zamanda kozmosun en derin sırlarını çözen fiziği duyacaksın.</blockquote>
          </section>
        </Reveal>

        {/* Quiz */}
        <Reveal>
          <section className="mx-auto max-w-3xl border-t border-white/10 px-6 py-10">
            <div className="mb-2 text-sm font-bold tracking-widest text-sky-400">★</div>
            <h2 className="mb-4 text-2xl font-bold text-slate-50 sm:text-3xl">Mini Quiz</h2>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              {!done ? (
                <>
                  <div className="mb-3 flex justify-between text-xs text-slate-500"><span>Soru {quizQ + 1} / {quizQs.length}</span><span className="font-semibold text-sky-400">Puan: {score}</span></div>
                  <h3 className="mb-4 text-lg font-semibold text-slate-100">{quizQs[quizQ].text}</h3>
                  <div className="grid gap-2.5">
                    {quizQs[quizQ].opts.map((o, oi) => {
                      const sel = answered[quizQ]; const isAns = sel !== undefined; const correct = quizQs[quizQ].a;
                      let cls = 'border-white/10 bg-white/[0.02] hover:border-sky-500/40 hover:bg-sky-500/[0.06]';
                      let badge = 'bg-sky-500/15 text-sky-300';
                      if (isAns) {
                        if (oi === correct) { cls = 'border-emerald-500/50 bg-emerald-500/10'; badge = 'bg-emerald-500 text-emerald-950'; }
                        else if (oi === sel) { cls = 'border-rose-500/50 bg-rose-500/10'; badge = 'bg-rose-500 text-white'; }
                        else { cls = 'border-white/10 bg-white/[0.02] opacity-50'; }
                      }
                      return (
                        <button key={oi} onClick={() => answerQ(oi)} disabled={isAns} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm text-slate-200 transition ${cls} ${isAns ? 'cursor-default' : 'cursor-pointer'}`}>
                          <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs font-bold ${badge}`}>{String.fromCharCode(65 + oi)}</span>
                          {o}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="py-4 text-center">
                  <div className="text-5xl">{score >= 8 ? '🏆' : score >= 5 ? '📡' : '📖'}</div>
                  <h3 className="mt-2 text-2xl font-bold text-sky-400">{score} / {quizQs.length} doğru</h3>
                  <p className="mb-4 text-slate-400">{score >= 8 ? 'Dalgaları sen yönetiyorsun!' : score >= 5 ? 'Güzel — frekansın yerinde.' : 'Yukarı kaydırıp bir kez daha dinle.'}</p>
                  <button onClick={restartQuiz} className="rounded-full bg-gradient-to-r from-sky-500 to-sky-400 px-6 py-2.5 font-semibold text-sky-950 transition hover:brightness-110">↺ Tekrar dene</button>
                </div>
              )}
            </div>
          </section>
        </Reveal>

        <ArticleBibliography items={refs} accent="#38bdf8" />

        <footer className="mx-auto max-w-3xl border-t border-white/10 px-6 pb-20 pt-10 text-center">
          <div className="mb-3 text-xs font-bold tracking-[0.3em] text-sky-400">BASEMENTS</div>
          <p className="mx-auto mb-5 max-w-md text-slate-400">Göreli hareket dalgaları sıkıştırır ya da gerer — bu kadarcık fikir, kalpten kozmosa kadar her yere ulaşıyor. 📡</p>
          <Link href="/discover" className="font-semibold text-sky-400 transition hover:text-sky-300">← Diğer içerikleri keşfet</Link>
        </footer>

      </div>
    </main>
  );
}
