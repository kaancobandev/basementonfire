'use client';

// Doğal Seçilim v2 (immersive) — yeniden kullanılan interaktif widget'lar + veri.
// İçerik v1 ile AYNI (adil "yalnızca tasarım" karşılaştırması); yalnızca çevreleyen
// düzen/hareket farklı. v1 dosyasına dokunulmadı.
import { useState, useEffect, useRef, type ReactNode } from 'react';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';

export const ingredients = [
  { icon: '🎲', title: 'Çeşitlilik', color: 'emerald', text: 'Aynı türün bireyleri birbirinin kopyası değildir: kimi daha hızlı, kimi daha koyu, kimi daha kalın gagalı. Bu farklar büyük ölçüde rastgele mutasyonlardan doğar. Seçecek bir çeşitlilik yoksa seçilim de olmaz.' },
  { icon: '🧬', title: 'Kalıtım', color: 'lime', text: 'Bu farkların bir kısmı kalıtsaldır — ebeveynden yavruya genlerle geçer. Avantajlı bir özellik miras kalmıyorsa, o bireyle birlikte kaybolur.' },
  { icon: '⚔️', title: 'Mücadele', color: 'amber', text: 'Canlılar ortamın kaldırabileceğinden çok daha fazla yavru üretir. Yiyecek, alan ve eş sınırlıdır; herkes hayatta kalamaz. İşte farkların önem kazandığı elek budur.' },
  { icon: '⏳', title: 'Zaman', color: 'fuchsia', text: 'Her nesilde ortama biraz daha uyan bireyler ortalama olarak biraz daha çok yavru bırakır. Bu küçük fark, binlerce nesil üst üste binince popülasyonu baştan aşağı dönüştürür.' },
];

export const misconceptions = [
  { wrong: '“En güçlü hayatta kalır.”', right: 'Önemli olan kas değil, uyum ve üreme başarısı. “En uyumlu” = o ortamda en çok yavru bırakan.' },
  { wrong: '“Birey yaşarken evrimleşir.”', right: 'Evrimleşen birey değil, popülasyondur — nesiller boyunca özelliklerin oranı değişir.' },
  { wrong: '“Evrimin bir amacı vardır.”', right: 'Plan ya da “mükemmele doğru ilerleme” yoktur. Sadece o an işe yarayan kalır.' },
  { wrong: '“Doğal seçilim rastgeledir.”', right: 'Mutasyon rastgeledir; ama seçilim rastgele DEĞİLDİR. Ortam, kazananı sistematik belirler.' },
  { wrong: '“Sadece bir teori.”', right: 'Bilimde “teori”, kanıtlarla defalarca sınanmış en üst düzey açıklayıcı çerçevedir.' },
];

export const examples = [
  { icon: '💊', title: 'Antibiyotik direnci', text: 'Antibiyotik duyarlıları temizler, şans eseri dirençli olanlar hayatta kalıp çoğalır. Birkaç günde koloni baştan aşağı dirençli olur — gerçek zamanlı doğal seçilim.' },
  { icon: '🦋', title: 'Biber güvesi', text: 'Sanayi Devrimi’nde kurum ağaçları karartınca açık güveler kuşlara yem oldu; koyu form kamufle olup yayıldı. Hava temizlenince açık form geri döndü.' },
  { icon: '🐦', title: 'Darwin ispinozları', text: 'Galápagos’ta 1977 kuraklığında yalnızca sert iri tohumlar kaldı; onları kırabilen büyük gagalılar hayatta kaldı ve bir nesilde ortalama gaga büyüdü.' },
  { icon: '🥛', title: 'Süt sindirimi', text: 'Hayvancılık yapan toplumlarda yetişkinlikte laktaz üretmeyi sürdüren gen son ~10.000 yılda seçildi — insanda hâlâ süren bir evrim.' },
  { icon: '🩸', title: 'Orak hücre & sıtma', text: 'Tek kopya orak hücre geni sıtmaya karşı korur; sıtma bölgelerinde bu yüzden gen korunur — uçların değil, ortanın kazandığı dengeleyici seçilim.' },
  { icon: '🦎', title: 'Kamuflaj', text: 'Ortam hangi rengi gizliyorsa popülasyon nesiller içinde tam o tona kayar. Aşağıdaki simülasyonda kendin çalıştırabilirsin.' },
];

export const otherMechanisms = [
  { icon: '✨', title: 'Mutasyon', text: 'Çeşitliliğin ham maddesi. Rastgele, yönsüz; ama seçilimin malzemesini sağlar.' },
  { icon: '🎰', title: 'Genetik sürüklenme', text: 'Saf şans. Küçük popülasyonlarda bir varyant tesadüfen yayılabilir ya da kaybolabilir.' },
  { icon: '🧳', title: 'Gen akışı', text: 'Göç, genleri popülasyonlar arasında taşır; farklılıkları azaltıp yeni varyantları yayar.' },
  { icon: '💘', title: 'Cinsel seçilim', text: 'Hayatta kalmaya yaramasa da eş bulmayı kolaylaştıran özellikler (tavus kuyruğu) yayılabilir.' },
];

export const timeline = [
  { year: '1798', title: 'Malthus’un kıtlık fikri', text: 'Nüfusun kaynaklardan hızlı arttığı ve kaçınılmaz bir mücadele doğduğu fikri Darwin ve Wallace’a kıvılcım olur.' },
  { year: '1831–36', title: 'Beagle yolculuğu', text: 'Genç Darwin HMS Beagle ile dünyayı dolaşır; Galápagos’ta adadan adaya değişen canlılar aklına takılır.' },
  { year: '1858', title: 'Darwin & Wallace', text: 'Wallace bağımsızca aynı fikre ulaşınca çalışma Linnean Society’de birlikte sunulur.' },
  { year: '1859', title: 'Türlerin Kökeni', text: 'Darwin kitabını yayımlar; ilk gün tükenir, biyolojiyi ikiye böler.' },
  { year: '1865', title: 'Mendel’in bezelyeleri', text: 'Mendel kalıtım yasalarını bulur ama dönemin gözünden kaçar — Darwin’in eksik parçası.' },
  { year: '1930–42', title: 'Modern Sentez', text: 'Doğal seçilim ve genetik birleşir; evrim sağlam bir genetik temele oturur.' },
  { year: '1953', title: 'DNA’nın yapısı', text: 'Kalıtımın moleküler dili çözülür; mutasyon ve çeşitlilik fiziksel bir adres kazanır.' },
  { year: 'Bugün', title: 'Gözümüzün önünde', text: 'Antibiyotik direnci, ispinoz gagaları ve laboratuvar bakterileri evrimi gerçek zamanlı gözlemliyoruz.' },
];

export const quizQs = [
  { text: 'Doğal seçilimde “en uyumlu birey” kimdir?', opts: ['En güçlü ve en iri olan', 'Ortamına en iyi uyup en çok yavru bırakan', 'En uzun yaşayan', 'En zeki olan'], a: 1, exp: 'Uyum = ortama uygunluk ve üreme başarısı; kas ya da zekâ şart değil.' },
  { text: 'Bir popülasyonda hiç çeşitlilik yoksa ne olur?', opts: ['Seçilim daha hızlı işler', 'Doğal seçilim işleyemez — seçecek bir fark yoktur', 'Mutasyonlar durur', 'Tüm bireyler ölür'], a: 1, exp: 'Seçilim var olan farklar arasından seçer. Fark yoksa süreç durur.' },
  { text: 'Aslında “evrimleşen” nedir?', opts: ['Tek bir birey, yaşamı boyunca', 'Popülasyon, nesiller boyunca', 'Sadece DNA, anında', 'Ortam, kendi başına'], a: 1, exp: 'Birey yaşamı boyunca evrimleşmez; değişen, popülasyondaki özellik oranıdır.' },
  { text: 'Antibiyotik direncinin yayılması neyin örneğidir?', opts: ['Bireysel öğrenme', 'Gerçek zamanlı doğal seçilim', 'Genetik sürüklenme', 'Rastgele şans'], a: 1, exp: 'Dirençliler çoğalır, duyarlılar elenir — gözlemlenebilir doğal seçilim.' },
  { text: 'Mutasyon ile seçilim arasındaki ilişki nedir?', opts: ['İkisi de rastgeledir', 'İkisi de yönlüdür', 'Mutasyon rastgeledir; seçilim rastgele değildir', 'Seçilim rastgeledir; mutasyon yönlüdür'], a: 2, exp: 'Mutasyonlar yönsüz oluşur; hangi varyantın yayılacağını ortam belirler.' },
  { text: 'Biber güvesinin koyu formu neden çoğaldı?', opts: ['Daha sıcak olduğu için', 'Kurumlu ağaçlarda kuşlardan saklanıp daha çok ürediği için', 'Koyu renk daha hızlı uçtuğu için', 'Tesadüfen'], a: 1, exp: 'Kararmış ağaçlarda koyu güveler saklandı, daha çok üredi.' },
];

export const refs: BibItem[] = [
  { title: 'On the Origin of Species by Means of Natural Selection', authors: 'Charles Darwin', year: '1859', source: 'John Murray, Londra' },
  { title: 'On the Tendency of Species to form Varieties (Darwin–Wallace ortak bildirisi)', authors: 'C. Darwin & A. R. Wallace', year: '1858', source: 'J. Proc. Linnean Society (Zoology) 3, 45' },
  { title: '40 Years of Evolution: Darwin’s Finches on Daphne Major Island', authors: 'P. R. Grant & B. R. Grant', year: '2014', source: 'Princeton University Press' },
  { title: 'The industrial melanism mutation in British peppered moths is a transposable element', authors: 'A. E. van’t Hof ve ark.', year: '2016', source: 'Nature 534, 102' },
  { title: 'Understanding Evolution — Natural selection', source: 'UC Berkeley', url: 'https://evolution.berkeley.edu/evolution-101/mechanisms-the-processes-of-evolution/natural-selection/' },
  { title: 'Natural selection', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Natural_selection' },
];

export { ArticleBibliography };

/* renk + stil yardımcıları */
export function shadeColor(s: number) {
  const t = Math.max(0, Math.min(100, s)) / 100;
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${lerp(196, 20)},${lerp(244, 74)},${lerp(110, 40)})`;
}
export const BORDER: Record<string, string> = {
  emerald: 'border-emerald-500/30 bg-emerald-500/10',
  lime: 'border-lime-500/30 bg-lime-500/10',
  amber: 'border-amber-500/30 bg-amber-500/10',
  fuchsia: 'border-fuchsia-500/30 bg-fuchsia-500/10',
};
export const ICONBG: Record<string, string> = {
  emerald: 'bg-emerald-400/15 text-emerald-300',
  lime: 'bg-lime-400/15 text-lime-300',
  amber: 'bg-amber-400/15 text-amber-300',
  fuchsia: 'bg-fuchsia-400/15 text-fuchsia-300',
};

/* ─── Kamuflaj seçilim simülatörü ─── */
const POP_SIZE = 32, HIST_BINS = 14, GEN_CAP = 80;
const initialPop = () => Array.from({ length: POP_SIZE }, (_, i) => Math.round((i / (POP_SIZE - 1)) * 100));
const camoOf = (pop: number[], bg: number) => Math.round(100 - pop.reduce((a, s) => a + Math.abs(s - bg), 0) / pop.length);
const INIT_BG = 74;

export function CamouflageSim() {
  const [bg, setBg] = useState(INIT_BG);
  const [pop, setPop] = useState<number[]>(initialPop);
  const [gen, setGen] = useState(0);
  const [mut, setMut] = useState(9);
  const [playing, setPlaying] = useState(false);
  const [history, setHistory] = useState<number[]>(() => [camoOf(initialPop(), INIT_BG)]);

  const camo = camoOf(pop, bg);
  const mean = Math.round(pop.reduce((a, b) => a + b, 0) / pop.length);
  const hist = Array.from({ length: HIST_BINS }, () => 0);
  pop.forEach(s => { hist[Math.min(HIST_BINS - 1, Math.floor((s / 100) * HIST_BINS))]++; });
  const maxBin = Math.max(...hist, 1);

  const ref = useRef({ bg, mut, gen });
  ref.current = { bg, mut, gen };

  function step() {
    const { bg: b, mut: m } = ref.current;
    setPop(prev => {
      const fit = prev.map(s => 1 - Math.abs(s - b) / 100);
      const survivors = prev.filter((_, i) => Math.random() < fit[i] * 0.92 + 0.05);
      const base = survivors.length ? survivors : prev;
      const next = Array.from({ length: POP_SIZE }, () => {
        const parent = base[Math.floor(Math.random() * base.length)];
        return Math.max(0, Math.min(100, Math.round(parent + (Math.random() * 2 - 1) * m)));
      });
      setHistory(h => [...h, camoOf(next, b)].slice(-46));
      return next;
    });
    setGen(g => g + 1);
  }
  const stepRef = useRef(step);
  stepRef.current = step;
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => { if (ref.current.gen >= GEN_CAP) { setPlaying(false); return; } stepRef.current(); }, 620);
    return () => clearInterval(id);
  }, [playing]);

  function reset() { setPop(initialPop()); setGen(0); setHistory([camoOf(initialPop(), bg)]); setPlaying(false); }
  function flip() { setBg(b => (b > 50 ? 16 : 84)); }
  const spark = history.length > 1
    ? 'M' + history.map((c, i) => `${(i / (history.length - 1) * 300).toFixed(1)},${(54 - (c / 100) * 48).toFixed(1)}`).join(' L')
    : '';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="rounded-xl p-4 ring-1 ring-black/20 transition-colors duration-500" style={{ background: shadeColor(bg) }}>
        <div className="grid grid-cols-8 gap-2 sm:grid-cols-[repeat(16,minmax(0,1fr))]">
          {pop.map((s, i) => <span key={i} className="aspect-square rounded-full ring-1 ring-black/10 transition-colors duration-500" style={{ background: shadeColor(s) }} aria-hidden />)}
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-slate-400"><span>Renk dağılımı</span><span className="font-mono text-emerald-300">ortalama: {mean}</span></div>
        <div className="relative flex h-20 items-end gap-1 rounded-xl bg-black/30 p-2 ring-1 ring-white/5">
          {hist.map((n, i) => <div key={i} className="flex-1 rounded-sm transition-all duration-500" style={{ height: `${Math.max(4, (n / maxBin) * 100)}%`, background: shadeColor((i + 0.5) / HIST_BINS * 100) }} />)}
          <div className="pointer-events-none absolute bottom-0 top-0 w-0.5 bg-white/80" style={{ left: `calc(8px + ${bg / 100} * (100% - 16px))` }}><span className="absolute -top-0.5 left-1 whitespace-nowrap text-[0.6rem] font-bold text-white/90">↑ ortam</span></div>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="flex justify-between text-sm text-slate-300"><span>Ortam rengi</span><span className="font-mono text-emerald-300">{bg < 38 ? 'açık' : bg > 70 ? 'koyu' : 'orta'}</span></span><input type="range" min={0} max={100} value={bg} onChange={e => setBg(+e.target.value)} className="mt-2 w-full accent-emerald-500" aria-label="Ortam rengi" /></label>
        <label className="block"><span className="flex justify-between text-sm text-slate-300"><span>Mutasyon oranı</span><span className="font-mono text-fuchsia-300">{mut}</span></span><input type="range" min={1} max={20} value={mut} onChange={e => setMut(+e.target.value)} className="mt-2 w-full accent-fuchsia-500" aria-label="Mutasyon oranı" /></label>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center"><div className="font-mono text-2xl font-bold text-emerald-300">{gen}</div><div className="text-xs text-emerald-200/80">nesil</div></div>
        <div className="rounded-xl border border-lime-500/30 bg-lime-500/10 p-3 text-center"><div className="font-mono text-2xl font-bold text-lime-300">{camo}%</div><div className="text-xs text-lime-200/80">kamuflaj uyumu</div></div>
        <button onClick={step} disabled={playing} className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-40">🧬 Bir nesil</button>
        <button onClick={() => setPlaying(p => !p)} className={`rounded-xl px-3 py-2 text-sm font-bold transition ${playing ? 'bg-rose-500 text-rose-950 hover:bg-rose-400' : 'bg-amber-400 text-amber-950 hover:bg-amber-300'}`}>{playing ? '⏸ Durdur' : '▶ Otomatik'}</button>
      </div>
      <div className="mt-2 flex gap-2">
        <button onClick={flip} className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10">🌗 Ortamı tersine çevir</button>
        <button onClick={reset} className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10">↺ Sıfırla</button>
      </div>
      {history.length > 1 && (
        <div className="mt-4"><div className="mb-1 text-xs text-slate-400">Kamuflaj uyumu — nesil geçmişi</div><div className="overflow-hidden rounded-xl bg-black/30 ring-1 ring-white/5"><svg viewBox="0 0 300 54" className="h-12 w-full" preserveAspectRatio="none"><path d={spark} fill="none" stroke="#a3e635" strokeWidth="2" /></svg></div></div>
      )}
    </div>
  );
}

/* ─── Seçilim türleri (canlı slider-morph) ─── */
function gaussPath(cx: number, sd: number, amp: number) {
  const pts: string[] = [];
  for (let x = 10; x <= 290; x += 3) { const y = 96 - amp * Math.exp(-((x - cx) ** 2) / (2 * sd * sd)); pts.push(`${x},${Math.max(6, y).toFixed(1)}`); }
  return 'M' + pts.join(' L');
}
function gauss2Path(amp: number, c1: number, c2: number, sd: number) {
  const pts: string[] = [];
  for (let x = 10; x <= 290; x += 3) { const y = 96 - amp * (Math.exp(-((x - c1) ** 2) / (2 * sd * sd)) + Math.exp(-((x - c2) ** 2) / (2 * sd * sd))); pts.push(`${x},${Math.max(6, y).toFixed(1)}`); }
  return 'M' + pts.join(' L');
}
const BASE_CURVE = gaussPath(150, 40, 70);
const SEL_TYPES = [
  { key: 'yonlu', label: 'Yönlü', color: '#34d399', ex: 'Kuraklıkta büyük gagaların, antibiyotik altında dirençli bakterilerin seçilmesi.' },
  { key: 'dengeleyici', label: 'Dengeleyici', color: '#fbbf24', ex: 'İnsan doğum ağırlığı; sıtma bölgelerinde orak hücre taşıyıcılığı: çok küçük de çok büyük de dezavantajlı.' },
  { key: 'ayirici', label: 'Ayırıcı', color: '#e879f9', ex: 'İki uç da kazanır, orta elenir. Bazen türleşmenin ilk adımı.' },
] as const;

export function SelectionTypes() {
  const [type, setType] = useState<typeof SEL_TYPES[number]['key']>('yonlu');
  const [strength, setStrength] = useState(60);
  const cur = SEL_TYPES.find(t => t.key === type)!;
  const k = strength / 100;
  const after = type === 'yonlu' ? gaussPath(150 + k * 78, 40 - k * 6, 70 + k * 6)
    : type === 'dengeleyici' ? gaussPath(150, 40 - k * 28, 70 + k * 48)
      : gauss2Path(58 + k * 18, 150 - (16 + k * 46), 150 + (16 + k * 46), 19);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {SEL_TYPES.map(t => <button key={t.key} onClick={() => setType(t.key)} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${type === t.key ? 'text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`} style={type === t.key ? { background: t.color } : undefined}>{t.label}</button>)}
      </div>
      <div className="overflow-hidden rounded-xl bg-[#04140d] ring-1 ring-white/5">
        <svg viewBox="0 0 300 110" className="h-auto w-full">
          <line x1="10" y1="96" x2="290" y2="96" stroke="#1e3a2e" strokeWidth="1" />
          <path d={BASE_CURVE} fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />
          <path d={after} fill="none" stroke={cur.color} strokeWidth="3" />
        </svg>
      </div>
      <div className="mt-4">
        <span className="flex justify-between text-sm text-slate-300"><span>Seçilim baskısı</span><span className="font-mono" style={{ color: cur.color }}>{strength}%</span></span>
        <input type="range" min={0} max={100} value={strength} onChange={e => setStrength(+e.target.value)} className="mt-2 w-full" style={{ accentColor: cur.color }} aria-label="Seçilim baskısı" />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{cur.ex}</p>
    </div>
  );
}

/* ─── Mini test ─── */
export function Quiz() {
  const [quizQ, setQuizQ] = useState(0);
  const [score, setScore] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const q = quizQs[quizQ];
  const answered = pick !== null;
  function answerQ(sel: number) { if (answered) return; setPick(sel); if (sel === q.a) setScore(s => s + 1); }
  function next() { if (quizQ + 1 < quizQs.length) { setQuizQ(n => n + 1); setPick(null); } else setDone(true); }
  function restart() { setQuizQ(0); setScore(0); setPick(null); setDone(false); }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur sm:p-6">
      {!done ? (
        <>
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500"><span>Soru {quizQ + 1} / {quizQs.length}</span><span className="font-mono text-emerald-400">{score} doğru</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-400 transition-all duration-500" style={{ width: `${((quizQ + (answered ? 1 : 0)) / quizQs.length) * 100}%` }} /></div>
          </div>
          <p className="mb-5 text-lg font-semibold text-slate-100">{q.text}</p>
          <div className="space-y-2.5">
            {q.opts.map((opt, i) => {
              const correct = i === q.a;
              let cls = 'border-white/10 bg-white/5 hover:border-emerald-400/40 hover:bg-emerald-400/5';
              if (answered && correct) cls = 'border-emerald-400 bg-emerald-400/15 text-emerald-100';
              else if (answered && i === pick) cls = 'border-rose-400 bg-rose-400/15 text-rose-100';
              else if (answered) cls = 'border-white/10 bg-white/5 opacity-50';
              return (
                <button key={i} onClick={() => answerQ(i)} disabled={answered} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${cls}`}>
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-xs font-bold">{String.fromCharCode(65 + i)}</span><span>{opt}</span>
                  {answered && correct && <span className="ml-auto">✓</span>}{answered && i === pick && !correct && <span className="ml-auto">✗</span>}
                </button>
              );
            })}
          </div>
          {answered && (
            <div className="mt-4">
              <div className={`rounded-xl border p-4 text-sm leading-relaxed ${pick === q.a ? 'border-emerald-400/30 bg-emerald-400/5 text-emerald-100/90' : 'border-amber-400/30 bg-amber-400/5 text-amber-100/90'}`}><span className="font-bold">{pick === q.a ? 'Doğru! ' : 'Doğru cevap: ' + q.opts[q.a] + '. '}</span>{q.exp}</div>
              <button onClick={next} className="mt-3 w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400">{quizQ + 1 < quizQs.length ? 'Sonraki soru →' : 'Sonucu gör 🎉'}</button>
            </div>
          )}
        </>
      ) : (
        <div className="py-6 text-center">
          <div className="mb-2 text-5xl">{score === quizQs.length ? '🏆' : score >= quizQs.length / 2 ? '🌿' : '🌱'}</div>
          <p className="mb-1 text-2xl font-bold text-slate-100">{score} / {quizQs.length}</p>
          <p className="mb-5 text-slate-400">{score === quizQs.length ? 'Kusursuz — Darwin gurur duyardı!' : score >= quizQs.length / 2 ? 'Güzel! Mantığı yakaladın.' : 'Fena değil — tekrar dene.'}</p>
          <button onClick={restart} className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400">↻ Tekrar dene</button>
        </div>
      )}
    </div>
  );
}

/* ─── Motion tabanlı scroll-reveal sarmalayıcı (immersive) ─── */
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); o.disconnect(); } }, { threshold: 0.1 });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  return <div ref={ref} className={`transition-all duration-[900ms] ease-out ${shown ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-10 opacity-0 blur-[6px]'} ${className}`}>{children}</div>;
}
