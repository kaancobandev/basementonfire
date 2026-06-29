'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';

/* ════════════════════════ VERİ ════════════════════════ */

const ingredients = [
  { icon: '🎲', title: 'Çeşitlilik', color: 'emerald', text: 'Aynı türün bireyleri birbirinin kopyası değildir: kimi daha hızlı, kimi daha koyu, kimi daha kalın gagalı. Bu farklar büyük ölçüde rastgele mutasyonlardan ve genlerin yeniden karılmasından doğar. Seçecek bir çeşitlilik yoksa seçilim de olmaz.' },
  { icon: '🧬', title: 'Kalıtım', color: 'lime', text: 'Bu farkların bir kısmı kalıtsaldır — ebeveynden yavruya genlerle geçer. Avantajlı bir özellik miras kalmıyorsa, o bireyle birlikte kaybolur; geleceğe taşınamaz.' },
  { icon: '⚔️', title: 'Mücadele', color: 'amber', text: 'Canlılar ortamın kaldırabileceğinden çok daha fazla yavru üretir. Yiyecek, alan ve eş sınırlıdır; herkes hayatta kalamaz. İşte bu kıtlık, farkların önem kazandığı eleği kurar.' },
  { icon: '⏳', title: 'Zaman', color: 'fuchsia', text: 'Her nesilde ortama biraz daha uyan bireyler ortalama olarak biraz daha çok yavru bırakır. Bu küçük fark, yüzlerce-binlerce nesil üst üste binince popülasyonu baştan aşağı dönüştürür.' },
];

const misconceptions = [
  { wrong: '“En güçlü hayatta kalır.”', right: 'Önemli olan kas değil, uyum ve üreme başarısı. Bir köstebek için iyi görme bile gereksizdir; “en uyumlu” = o ortamda en çok yavru bırakan.' },
  { wrong: '“Birey yaşarken evrimleşir.”', right: 'Bir zürafa boynunu uzatmaya çalışınca uzamaz. Evrimleşen birey değil, popülasyondur — nesiller boyunca özelliklerin oranı değişir.' },
  { wrong: '“Evrimin bir amacı/hedefi vardır.”', right: 'Plan, yön ya da “mükemmele doğru ilerleme” yoktur. Sadece o an işe yarayan kalır. İnsan da evrimin “zirvesi” değil, bir dalıdır.' },
  { wrong: '“Doğal seçilim rastgeledir.”', right: 'Çeşitliliğin kaynağı (mutasyon) rastgeledir; ama seçilim rastgele DEĞİLDİR. Ortam, hangi varyantın kazanacağını sistematik olarak belirler.' },
  { wrong: '“Sadece bir teori.”', right: 'Bilimde “teori”, tahmin değil; kanıtlarla defalarca sınanmış, en üst düzey açıklayıcı çerçevedir — yerçekimi teorisi gibi.' },
];

const examples = [
  { icon: '💊', title: 'Antibiyotik direnci', text: 'Bir bakteri kolonisinde şans eseri dirençli birkaç birey vardır. Antibiyotik duyarlıları temizler, dirençliler hayatta kalıp çoğalır. Birkaç gün içinde koloni baştan aşağı dirençli olur — gözümüzün önünde, gerçek zamanlı doğal seçilim.' },
  { icon: '🦋', title: 'Biber güvesi', text: 'Sanayi Devrimi’nde kurum, ağaç gövdelerini karartınca açık renkli güveler kuşlara yem oldu; nadir koyu (carbonaria) form kamufle olup yayıldı. Temiz hava yasalarından sonra ağaçlar açılınca açık form geri döndü. 2016’da koyu formun kökeni cortex genine bağlandı.' },
  { icon: '🐦', title: 'Darwin ispinozları', text: 'Galápagos’ta Daphne Major adasında Grant çifti onlarca yıl gaga ölçtü. 1977 kuraklığında yalnızca sert, iri tohumlar kaldı; onları kırabilen büyük güçlü gagalı kuşlar hayatta kaldı ve bir nesilde ortalama gaga belirgin biçimde büyüdü.' },
  { icon: '🥛', title: 'Süt sindirimi', text: 'Çoğu memeli sütteki laktozu yalnızca bebekken sindirir. Hayvancılık yapan toplumlarda, yetişkinlikte de laktaz üretmeyi sürdüren gen varyantı son ~10.000 yılda hızla seçildi. İnsanda hâlâ süren bir evrim örneği — gen ile kültürün el ele yürüdüğü.' },
  { icon: '🩸', title: 'Orak hücre & sıtma', text: 'Orak hücre geninin iki kopyası ağır hastalık yapar; ama tek kopya (taşıyıcı) sıtmaya karşı koruma sağlar. Sıtmanın yaygın olduğu bölgelerde bu yüzden gen yok olmadan korunur — uçların değil, ortanın kazandığı “dengeleyici seçilim”.' },
  { icon: '🦎', title: 'Kamuflaj', text: 'Avcıların gözünden kaçan renk her zaman avantajlıdır. Çöl, orman ya da kayalık — ortam hangi rengi gizliyorsa, popülasyon nesiller içinde tam o tona kayar. Aşağıdaki simülasyonda bunu kendin çalıştırabilirsin.' },
];

const otherMechanisms = [
  { icon: '✨', title: 'Mutasyon', text: 'Çeşitliliğin ham maddesi. Rastgele, yönsüz; ama seçilimin üzerinde çalışacağı malzemeyi sağlar.' },
  { icon: '🎰', title: 'Genetik sürüklenme', text: 'Saf şans. Özellikle küçük popülasyonlarda, bir varyant “işe yaradığı için değil” sadece tesadüfen yayılabilir ya da kaybolabilir.' },
  { icon: '🧳', title: 'Gen akışı', text: 'Bireylerin göçü genleri popülasyonlar arasında taşır; farklılıkları azaltıp yeni varyantları yayabilir.' },
  { icon: '💘', title: 'Cinsel seçilim', text: 'Hayatta kalmaya yaramasa da eş bulmayı kolaylaştıran özellikler (tavus kuyruğu gibi) yayılabilir.' },
];

const timeline = [
  { year: '1798', title: 'Malthus’un kıtlık fikri', text: 'Thomas Malthus, nüfusun kaynaklardan hızlı arttığını ve kaçınılmaz bir mücadele doğduğunu yazar. Bu fikir hem Darwin’e hem Wallace’a kıvılcım olur.' },
  { year: '1831–36', title: 'Beagle yolculuğu', text: 'Genç Darwin, HMS Beagle ile dünyayı dolaşır; Galápagos’taki adadan adaya değişen canlılar aklına takılır.' },
  { year: '1858', title: 'Darwin & Wallace', text: 'Wallace bağımsızca aynı fikre ulaşınca, iki bilim insanının çalışması Linnean Society’de birlikte sunulur. Doğal seçilim ilk kez ortak imzayla duyurulur.' },
  { year: '1859', title: 'Türlerin Kökeni', text: 'Darwin “On the Origin of Species”i yayımlar; kitap ilk gün tükenir ve biyolojiyi ikiye böler.' },
  { year: '1865', title: 'Mendel’in bezelyeleri', text: 'Gregor Mendel kalıtım yasalarını bulur ama dönemin gözünden kaçar — Darwin’in eksik parçası budur.' },
  { year: '1930–42', title: 'Modern Sentez', text: 'Doğal seçilim ve genetik birleşir; evrim sağlam bir matematiksel-genetik temele oturur.' },
  { year: '1953', title: 'DNA’nın yapısı', text: 'Watson, Crick, Franklin ve Wilkins ile kalıtımın moleküler dili çözülür; mutasyon ve çeşitlilik fiziksel bir adres kazanır.' },
  { year: 'Bugün', title: 'Gözümüzün önünde', text: 'Antibiyotik direnci, ispinoz gagaları ve laboratuvar bakterileri evrimi artık gerçek zamanlı, doğrudan gözlemliyoruz.' },
];

const quizQs = [
  { text: 'Doğal seçilimde “en uyumlu birey” kimdir?', opts: ['En güçlü ve en iri olan', 'Ortamına en iyi uyup en çok yavru bırakan', 'En uzun yaşayan', 'En zeki olan'], a: 1 },
  { text: 'Bir popülasyonda hiç çeşitlilik (varyasyon) yoksa ne olur?', opts: ['Seçilim daha hızlı işler', 'Doğal seçilim işleyemez — seçecek bir fark yoktur', 'Mutasyonlar durur', 'Tüm bireyler ölür'], a: 1 },
  { text: 'Aslında “evrimleşen” nedir?', opts: ['Tek bir birey, yaşamı boyunca', 'Popülasyon, nesiller boyunca', 'Sadece DNA, anında', 'Ortam, kendi başına'], a: 1 },
  { text: 'Antibiyotik direncinin yayılması neyin örneğidir?', opts: ['Bireysel öğrenme', 'Gerçek zamanlı doğal seçilim', 'Genetik sürüklenme', 'Rastgele şans'], a: 1 },
  { text: 'Mutasyon ile seçilim arasındaki ilişki nedir?', opts: ['İkisi de rastgeledir', 'İkisi de yönlüdür', 'Mutasyon rastgeledir; seçilim rastgele değildir', 'Seçilim rastgeledir; mutasyon yönlüdür'], a: 2 },
  { text: 'Biber güvesinin koyu formu Sanayi Devrimi’nde neden çoğaldı?', opts: ['Daha sıcak olduğu için', 'Kurumlu ağaçlarda kuşlardan saklanıp daha çok ürediği için', 'Koyu renk daha hızlı uçtuğu için', 'Tesadüfen, hiçbir nedenle'], a: 1 },
];

const refs: BibItem[] = [
  { title: 'On the Origin of Species by Means of Natural Selection', authors: 'Charles Darwin', year: '1859', source: 'John Murray, Londra' },
  { title: 'On the Tendency of Species to form Varieties (Darwin–Wallace ortak bildirisi)', authors: 'C. Darwin & A. R. Wallace', year: '1858', source: 'J. Proc. Linnean Society (Zoology) 3, 45' },
  { title: '40 Years of Evolution: Darwin’s Finches on Daphne Major Island', authors: 'P. R. Grant & B. R. Grant', year: '2014', source: 'Princeton University Press' },
  { title: 'The industrial melanism mutation in British peppered moths is a transposable element', authors: 'A. E. van’t Hof ve ark.', year: '2016', source: 'Nature 534, 102' },
  { title: 'Understanding Evolution — Natural selection', source: 'University of California, Berkeley', url: 'https://evolution.berkeley.edu/evolution-101/mechanisms-the-processes-of-evolution/natural-selection/' },
  { title: 'Natural selection', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Natural_selection' },
  { title: 'Misconceptions about evolution', source: 'Understanding Evolution (Berkeley)', url: 'https://evolution.berkeley.edu/teach-evolution/misconceptions-about-evolution/' },
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

// Renk tonu: 0 (açık limon) → 100 (koyu orman yeşili). Kamuflaj ölçeği.
function shadeColor(s: number) {
  const t = Math.max(0, Math.min(100, s)) / 100;
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${lerp(196, 20)},${lerp(244, 74)},${lerp(110, 40)})`;
}

const BORDER: Record<string, string> = {
  emerald: 'border-emerald-500/30 bg-emerald-500/10',
  lime: 'border-lime-500/30 bg-lime-500/10',
  amber: 'border-amber-500/30 bg-amber-500/10',
  fuchsia: 'border-fuchsia-500/30 bg-fuchsia-500/10',
};
const ICONBG: Record<string, string> = {
  emerald: 'bg-emerald-400/15 text-emerald-300',
  lime: 'bg-lime-400/15 text-lime-300',
  amber: 'bg-amber-400/15 text-amber-300',
  fuchsia: 'bg-fuchsia-400/15 text-fuchsia-300',
};

/* ─── İnteraktif 1: Kamuflaj seçilim simülatörü ─── */
const POP_SIZE = 28;
// Deterministik başlangıç (SSR/hydration uyumlu — Math.random YOK): 0..100 yelpazesi.
const initialPop = () => Array.from({ length: POP_SIZE }, (_, i) => Math.round((i / (POP_SIZE - 1)) * 100));

function CamouflageSim() {
  const [bg, setBg] = useState(72);
  const [pop, setPop] = useState<number[]>(initialPop);
  const [gen, setGen] = useState(0);

  const camo = Math.round(100 - pop.reduce((a, s) => a + Math.abs(s - bg), 0) / pop.length);

  function step() {
    setPop(prev => {
      const fit = prev.map(s => 1 - Math.abs(s - bg) / 100); // 0..1 (arka plana yakınlık)
      const survivors = prev.filter((_, i) => Math.random() < fit[i] * 0.92 + 0.04);
      const base = survivors.length ? survivors : prev; // hiç kalmazsa boş kalmasın
      return Array.from({ length: POP_SIZE }, () => {
        const parent = base[Math.floor(Math.random() * base.length)];
        const mut = parent + (Math.random() * 2 - 1) * 9; // küçük mutasyon
        return Math.max(0, Math.min(100, Math.round(mut)));
      });
    });
    setGen(g => g + 1);
  }
  function reset() { setPop(initialPop()); setGen(0); }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="rounded-xl p-4 ring-1 ring-black/20 transition-colors duration-500" style={{ background: shadeColor(bg) }}>
        <div className="grid grid-cols-7 gap-2.5 sm:grid-cols-14">
          {pop.map((s, i) => (
            <span key={i} className="aspect-square rounded-full ring-1 ring-black/10 transition-colors duration-500" style={{ background: shadeColor(s) }} aria-hidden />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <span className="flex justify-between text-sm text-slate-300"><span>Ortam rengi (avcının gördüğü zemin)</span><span className="font-mono text-emerald-300">{bg < 40 ? 'açık' : bg > 70 ? 'koyu' : 'orta'}</span></span>
        <input type="range" min={0} max={100} value={bg} onChange={e => setBg(+e.target.value)} className="mt-2 w-full accent-emerald-500" aria-label="Ortam rengi" />
        <div className="flex justify-between text-xs text-slate-500"><span>açık limon</span><span>koyu orman</span></div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
          <div className="font-mono text-2xl font-bold text-emerald-300">{gen}</div>
          <div className="text-xs text-emerald-200/80">nesil</div>
        </div>
        <div className="rounded-xl border border-lime-500/30 bg-lime-500/10 p-3">
          <div className="font-mono text-2xl font-bold text-lime-300">{camo}%</div>
          <div className="text-xs text-lime-200/80">kamuflaj uyumu</div>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={step} className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400">🧬 Bir nesil</button>
          <button onClick={reset} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10">↺ Sıfırla</button>
        </div>
      </div>
      <div className="sr-only" aria-live="polite">Nesil {gen}, kamuflaj uyumu yüzde {camo}.</div>
      <p className="mt-3 text-xs leading-relaxed text-slate-400">Zemini bir renge ayarla ve <strong className="text-emerald-300">“Bir nesil”</strong>e arka arkaya bas. Zemine uymayan bireyler avcılara yem olur, uyanlar çoğalır — popülasyon birkaç nesilde tam o tona kayar. Zemini değiştirirsen seçilim yön değiştirir. Hiçbir birey rengini <em className="not-italic text-slate-200">değiştirmiyor</em>; değişen, hangi bireylerin hayatta kaldığı.</p>
    </div>
  );
}

/* ─── İnteraktif 2: Seçilim türleri ─── */
function gaussPath(cx: number, sd: number, amp: number) {
  const pts: string[] = [];
  for (let x = 10; x <= 290; x += 4) {
    const y = 96 - amp * Math.exp(-((x - cx) ** 2) / (2 * sd * sd));
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return 'M' + pts.join(' L');
}
function gauss2Path(amp: number) {
  const pts: string[] = [];
  for (let x = 10; x <= 290; x += 4) {
    const y = 96 - amp * (Math.exp(-((x - 96) ** 2) / (2 * 22 * 22)) + Math.exp(-((x - 204) ** 2) / (2 * 22 * 22)));
    pts.push(`${x},${Math.max(8, y).toFixed(1)}`);
  }
  return 'M' + pts.join(' L');
}
const BASE_CURVE = gaussPath(150, 40, 72);
const SEL_TYPES = [
  { key: 'yonlu', label: 'Yönlü', color: '#34d399', after: gaussPath(206, 36, 74), desc: 'Bir uç avantajlıdır → dağılım o yöne kayar. Kuraklıkta büyük gagaların seçilmesi gibi. En tanıdık seçilim türü.' },
  { key: 'dengeleyici', label: 'Dengeleyici', color: '#fbbf24', after: gaussPath(150, 22, 92), desc: 'Orta değer kazanır, uçlar elenir → dağılım daralır. İnsan doğum ağırlığı: çok küçük ve çok büyük bebekler dezavantajlıdır.' },
  { key: 'ayirici', label: 'Ayırıcı', color: '#e879f9', after: gauss2Path(74), desc: 'İki uç da kazanır, orta elenir → dağılım ikiye bölünür. Bazen yeni türlerin doğuşuna giden ilk adımdır.' },
] as const;

function SelectionTypes() {
  const [type, setType] = useState<typeof SEL_TYPES[number]['key']>('yonlu');
  const cur = SEL_TYPES.find(t => t.key === type)!;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {SEL_TYPES.map(t => (
          <button key={t.key} onClick={() => setType(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${type === t.key ? 'text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
            style={type === t.key ? { background: t.color } : undefined}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl bg-[#04140d] ring-1 ring-white/5">
        <svg viewBox="0 0 300 110" className="h-auto w-full">
          <line x1="10" y1="96" x2="290" y2="96" stroke="#1e3a2e" strokeWidth="1" />
          <path d={BASE_CURVE} fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />
          <path d={cur.after} fill="none" stroke={cur.color} strokeWidth="3" />
          <text x="150" y="108" textAnchor="middle" fontSize="8" fill="#475569">özellik değeri (örn. gaga boyu) →</text>
        </svg>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-slate-500" />önce</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-5" style={{ background: cur.color }} />seçilimden sonra</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{cur.desc}</p>
    </div>
  );
}

/* ════════════════════════ ANA BİLEŞEN ════════════════════════ */

export default function DogalSecilimClient() {
  const [quizQ, setQuizQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);

  function answerQ(sel: number) {
    if (answered[quizQ] !== undefined) return;
    if (sel === quizQs[quizQ].a) setScore(s => s + 1);
    setAnswered(prev => ({ ...prev, [quizQ]: sel }));
    setTimeout(() => { if (quizQ + 1 < quizQs.length) setQuizQ(q => q + 1); else setDone(true); }, 850);
  }
  function restartQuiz() { setQuizQ(0); setScore(0); setAnswered({}); setDone(false); }

  return (
    <main className="main-content">
      <div className="min-h-screen bg-gradient-to-b from-[#06160f] via-[#04120c] to-[#04120c] text-slate-300">

        {/* Topbar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#04120c]/80 px-5 py-3 backdrop-blur">
          <Link href="/" aria-label="Ana sayfa" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-emerald-400 transition hover:-translate-x-0.5 hover:bg-emerald-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </Link>
          <span className="text-sm font-semibold tracking-wide text-slate-400">Doğal Seçilim</span>
        </div>

        {/* Hero */}
        <header className="relative mx-auto max-w-3xl px-6 pb-10 pt-16 text-center">
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-4 -z-0 h-60 w-[130%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(52,211,153,0.20),transparent)] blur-2xl" />
          <div className="relative z-10 mb-5 flex justify-center" aria-hidden>
            {/* popülasyonun zamanla bir tona kayışı */}
            <svg viewBox="0 0 260 60" width="220">
              {Array.from({ length: 13 }, (_, i) => {
                const t = i / 12;
                const spread = (1 - t) * 46;
                return Array.from({ length: 3 }, (_, j) => {
                  const base = 30 + (j - 1) * spread;
                  const shade = Math.round((1 - t) * (j === 0 ? 12 : j === 2 ? 95 : 55) + t * 88);
                  return <circle key={`${i}-${j}`} cx={10 + i * 20} cy={base} r="4.4" fill={shadeColor(shade)} />;
                });
              })}
            </svg>
          </div>
          <div className="relative z-10 mb-3 text-xs font-semibold tracking-[0.22em] text-emerald-400">EVRİMİN MOTORU</div>
          <h1 className="relative z-10 mb-5 bg-gradient-to-r from-emerald-400 via-lime-300 to-amber-400 bg-clip-text text-5xl font-extrabold leading-none text-transparent sm:text-6xl">Doğal Seçilim</h1>
          <p className="relative z-10 mx-auto max-w-xl text-lg text-slate-300">
            Ne bir tasarımcı ne bir amaç var — yalnızca bir <strong className="font-semibold text-emerald-300">filtre.</strong> Çeşitlilik, kalıtım ve kıtlık bir araya gelince,
            doğa hiç düşünmeden en uyumluyu eler gibi <em className="not-italic text-lime-300">seçer.</em> Aynı sade mantık, bir bakteriyi de bir balinayı da biçimlendiriyor.
          </p>
          <div className="relative z-10 mt-6 flex flex-wrap justify-center gap-2">
            {['Çeşitlilik', 'Kalıtım', 'Uyum', 'Darwin & Wallace', 'Antibiyotik direnci'].map(t => (
              <span key={t} className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-xs text-emerald-200">{t}</span>
            ))}
          </div>
        </header>

        {/* I. Temel fikir */}
        <Reveal>
          <section className="mx-auto max-w-3xl px-6 py-8">
            <h2 className="mb-4 text-2xl font-bold text-slate-100">Tek cümlede büyük fikir</h2>
            <p className="mb-4 leading-relaxed text-slate-300">
              Doğal seçilim, neredeyse bir <strong className="text-emerald-300">algoritma</strong> kadar basittir: bir popülasyonda <strong className="text-lime-300">kalıtsal farklılıklar</strong> varsa
              ve bu farklılıklar <strong className="text-amber-300">kimin daha çok yavru bıraktığını</strong> etkiliyorsa, işe yarayan varyantlar her nesilde biraz daha yaygınlaşır.
              Hepsi bu. Ne ileri görüşlülük, ne niyet, ne de “gelişme isteği” gerekir.
            </p>
            <blockquote className="rounded-xl border-l-4 border-emerald-400 bg-emerald-400/5 px-5 py-4 text-lg italic text-slate-200">
              “Bu kadar basit bir ilkeden, sonsuz sayıda en güzel ve en harika biçimin doğmuş ve doğmakta olması içinde bir ululuk var.”
              <span className="mt-1 block text-sm not-italic text-slate-400">— Charles Darwin, Türlerin Kökeni (1859), kapanış cümlesi</span>
            </blockquote>
          </section>
        </Reveal>

        {/* II. Dört bileşen */}
        <Reveal>
          <section className="mx-auto max-w-3xl px-6 py-8">
            <h2 className="mb-2 text-2xl font-bold text-slate-100">Tarifin dört malzemesi</h2>
            <p className="mb-6 text-slate-400">Bu dördü bir aradaysa, doğal seçilim kaçınılmazdır.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {ingredients.map(c => (
                <div key={c.title} className={`rounded-2xl border p-5 ${BORDER[c.color]}`}>
                  <div className={`mb-3 grid h-11 w-11 place-items-center rounded-xl text-2xl ${ICONBG[c.color]}`}>{c.icon}</div>
                  <h3 className="mb-1.5 text-lg font-bold text-slate-100">{c.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-300">{c.text}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* III. İnteraktif: kamuflaj */}
        <Reveal>
          <section className="mx-auto max-w-3xl px-6 py-8">
            <div className="mb-3 text-xs font-semibold tracking-[0.2em] text-lime-400">İNTERAKTİF · DENE</div>
            <h2 className="mb-2 text-2xl font-bold text-slate-100">Bir popülasyonu kendin evrimleştir</h2>
            <p className="mb-6 text-slate-400">Avcı, zemine uymayan böcekleri yer. Zemini seç, nesilleri ilerlet ve seçilimi iş başında izle.</p>
            <CamouflageSim />
          </section>
        </Reveal>

        {/* IV. İnteraktif: seçilim türleri */}
        <Reveal>
          <section className="mx-auto max-w-3xl px-6 py-8">
            <div className="mb-3 text-xs font-semibold tracking-[0.2em] text-fuchsia-400">İNTERAKTİF · KARŞILAŞTIR</div>
            <h2 className="mb-2 text-2xl font-bold text-slate-100">Seçilim her zaman aynı yöne itmez</h2>
            <p className="mb-6 text-slate-400">Ortama göre seçilim dağılımı kaydırabilir, daraltabilir ya da ikiye bölebilir. Sekmeleri değiştir.</p>
            <SelectionTypes />
          </section>
        </Reveal>

        {/* V. Yanlış anlamalar */}
        <Reveal>
          <section className="mx-auto max-w-3xl px-6 py-8">
            <h2 className="mb-2 text-2xl font-bold text-slate-100">Çok duyulan beş yanlış</h2>
            <p className="mb-6 text-slate-400">Doğal seçilim kadar yanlış anlaşılan az fikir vardır. Düzeltelim.</p>
            <div className="space-y-3">
              {misconceptions.map((m, i) => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                  <div className="mb-2 flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose-500/15 text-sm text-rose-400">✗</span>
                    <p className="font-semibold text-rose-200/90">{m.wrong}</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-sm text-emerald-400">✓</span>
                    <p className="text-sm leading-relaxed text-slate-300">{m.right}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* VI. Gerçek örnekler */}
        <Reveal>
          <section className="mx-auto max-w-3xl px-6 py-8">
            <h2 className="mb-2 text-2xl font-bold text-slate-100">Laboratuvar değil, gerçek hayat</h2>
            <p className="mb-6 text-slate-400">Doğal seçilim soyut bir fikir değil; çevremizde, hatta kendi bedenimizde işliyor.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {examples.map(e => (
                <div key={e.title} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-5 transition hover:border-emerald-400/30">
                  <div className="mb-2 text-3xl">{e.icon}</div>
                  <h3 className="mb-1.5 text-lg font-bold text-slate-100">{e.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-300">{e.text}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* VII. Tek mekanizma değil */}
        <Reveal>
          <section className="mx-auto max-w-3xl px-6 py-8">
            <h2 className="mb-2 text-2xl font-bold text-slate-100">Önemli bir nüans: tek motor değil</h2>
            <p className="mb-6 text-slate-400">Doğal seçilim, evrimin <em className="not-italic text-emerald-300">uyumu</em> açıklayan ana mekanizmasıdır — ama tek değildir. Yanında çalışan başkaları da var.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {otherMechanisms.map(o => (
                <div key={o.title} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="text-2xl">{o.icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-100">{o.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-400">{o.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* VIII. Zaman çizelgesi */}
        <Reveal>
          <section className="mx-auto max-w-3xl px-6 py-8">
            <h2 className="mb-6 text-2xl font-bold text-slate-100">Bir fikrin yolculuğu</h2>
            <div className="relative space-y-6 pl-8">
              <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-gradient-to-b from-emerald-400 via-lime-400 to-amber-400 opacity-50" />
              {timeline.map(t => (
                <div key={t.year} className="relative">
                  <span className="absolute -left-8 top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-emerald-400 bg-[#04120c] shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
                  <div className="font-mono text-sm font-bold text-emerald-400">{t.year}</div>
                  <h3 className="mb-0.5 mt-0.5 font-semibold text-slate-100">{t.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{t.text}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* IX. Quiz */}
        <Reveal>
          <section className="mx-auto max-w-3xl px-6 py-8">
            <div className="mb-3 text-xs font-semibold tracking-[0.2em] text-amber-400">MİNİ TEST</div>
            <h2 className="mb-6 text-2xl font-bold text-slate-100">Anladın mı? Hadi bakalım</h2>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              {!done ? (
                <>
                  <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
                    <span>Soru {quizQ + 1} / {quizQs.length}</span>
                    <span className="font-mono text-emerald-400">{score} doğru</span>
                  </div>
                  <p className="mb-5 text-lg font-semibold text-slate-100">{quizQs[quizQ].text}</p>
                  <div className="space-y-2.5">
                    {quizQs[quizQ].opts.map((opt, i) => {
                      const picked = answered[quizQ];
                      const isAns = picked !== undefined;
                      const correct = i === quizQs[quizQ].a;
                      let cls = 'border-white/10 bg-white/5 hover:border-emerald-400/40 hover:bg-emerald-400/5';
                      if (isAns && correct) cls = 'border-emerald-400 bg-emerald-400/15 text-emerald-100';
                      else if (isAns && i === picked) cls = 'border-rose-400 bg-rose-400/15 text-rose-100';
                      else if (isAns) cls = 'border-white/10 bg-white/5 opacity-50';
                      return (
                        <button key={i} onClick={() => answerQ(i)} disabled={isAns}
                          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${cls}`}>
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                          <span>{opt}</span>
                          {isAns && correct && <span className="ml-auto">✓</span>}
                          {isAns && i === picked && !correct && <span className="ml-auto">✗</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="py-6 text-center">
                  <div className="mb-2 text-5xl">{score === quizQs.length ? '🏆' : score >= quizQs.length / 2 ? '🌿' : '🌱'}</div>
                  <p className="mb-1 text-2xl font-bold text-slate-100">{score} / {quizQs.length}</p>
                  <p className="mb-5 text-slate-400">{score === quizQs.length ? 'Kusursuz — Darwin gurur duyardı!' : score >= quizQs.length / 2 ? 'Güzel! Doğal seçilimin mantığını yakaladın.' : 'Fena değil — bir kez daha okuyup tekrar dene.'}</p>
                  <button onClick={restartQuiz} className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400">↻ Tekrar dene</button>
                </div>
              )}
            </div>
          </section>
        </Reveal>

        <ArticleBibliography items={refs} accent="#34d399" />

        <footer className="mx-auto max-w-3xl border-t border-white/10 px-6 pb-20 pt-10 text-center">
          <div className="mb-3 text-xs font-bold tracking-[0.3em] text-emerald-400">BASEMENTS</div>
          <p className="mx-auto mb-5 max-w-md text-slate-400">Çeşitlilik + kalıtım + zaman. Üç sade malzeme, dünyadaki tüm canlı çeşitliliğinin tarifi. 🌍</p>
          <Link href="/discover" className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/10">
            Diğer içerikleri keşfet
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
          </Link>
        </footer>
      </div>
    </main>
  );
}
