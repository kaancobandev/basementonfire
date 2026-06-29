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
  { text: 'Doğal seçilimde “en uyumlu birey” kimdir?', opts: ['En güçlü ve en iri olan', 'Ortamına en iyi uyup en çok yavru bırakan', 'En uzun yaşayan', 'En zeki olan'], a: 1, exp: 'Uyum = ortama uygunluk ve üreme başarısı; kas ya da zekâ şart değil. Bir mağara balığı için gözler bile gereksizdir.' },
  { text: 'Bir popülasyonda hiç çeşitlilik (varyasyon) yoksa ne olur?', opts: ['Seçilim daha hızlı işler', 'Doğal seçilim işleyemez — seçecek bir fark yoktur', 'Mutasyonlar durur', 'Tüm bireyler ölür'], a: 1, exp: 'Seçilim, var olan farklar arasından “seçer”. Fark yoksa seçecek bir şey de yoktur; süreç durur.' },
  { text: 'Aslında “evrimleşen” nedir?', opts: ['Tek bir birey, yaşamı boyunca', 'Popülasyon, nesiller boyunca', 'Sadece DNA, anında', 'Ortam, kendi başına'], a: 1, exp: 'Birey yaşamı boyunca evrimleşmez. Değişen, popülasyondaki özelliklerin oranıdır — nesiller boyunca.' },
  { text: 'Antibiyotik direncinin yayılması neyin örneğidir?', opts: ['Bireysel öğrenme', 'Gerçek zamanlı doğal seçilim', 'Genetik sürüklenme', 'Rastgele şans'], a: 1, exp: 'Dirençliler hayatta kalıp çoğalır, duyarlılar elenir. Bu gözlemlenebilir, gerçek zamanlı doğal seçilimdir.' },
  { text: 'Mutasyon ile seçilim arasındaki ilişki nedir?', opts: ['İkisi de rastgeledir', 'İkisi de yönlüdür', 'Mutasyon rastgeledir; seçilim rastgele değildir', 'Seçilim rastgeledir; mutasyon yönlüdür'], a: 2, exp: 'Mutasyonlar yönsüz/rastgele oluşur; ama hangi varyantın yayılacağını ortam (seçilim) sistematik biçimde belirler.' },
  { text: 'Biber güvesinin koyu formu Sanayi Devrimi’nde neden çoğaldı?', opts: ['Daha sıcak olduğu için', 'Kurumlu ağaçlarda kuşlardan saklanıp daha çok ürediği için', 'Koyu renk daha hızlı uçtuğu için', 'Tesadüfen, hiçbir nedenle'], a: 1, exp: 'Kararmış ağaçlarda koyu güveler kuşlardan saklandı, daha çok üredi. Çevre temizlenince açık form geri döndü.' },
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

/* ─── İnteraktif 1: Kamuflaj seçilim simülatörü (geliştirildi) ─── */
const POP_SIZE = 32;
const HIST_BINS = 14;
const GEN_CAP = 80;
// Deterministik başlangıç (SSR/hydration uyumlu — Math.random YOK): 0..100 yelpazesi.
const initialPop = () => Array.from({ length: POP_SIZE }, (_, i) => Math.round((i / (POP_SIZE - 1)) * 100));
const camoOf = (pop: number[], bg: number) => Math.round(100 - pop.reduce((a, s) => a + Math.abs(s - bg), 0) / pop.length);
const INIT_BG = 74;

function CamouflageSim() {
  const [bg, setBg] = useState(INIT_BG);
  const [pop, setPop] = useState<number[]>(initialPop);
  const [gen, setGen] = useState(0);
  const [mut, setMut] = useState(9);
  const [playing, setPlaying] = useState(false);
  const [history, setHistory] = useState<number[]>(() => [camoOf(initialPop(), INIT_BG)]);

  const camo = camoOf(pop, bg);
  const mean = Math.round(pop.reduce((a, b) => a + b, 0) / pop.length);

  // dağılım histogramı
  const hist = Array.from({ length: HIST_BINS }, () => 0);
  pop.forEach(s => { hist[Math.min(HIST_BINS - 1, Math.floor((s / 100) * HIST_BINS))]++; });
  const maxBin = Math.max(...hist, 1);

  // güncel değerleri zamanlayıcıdan okumak için ref'ler
  const ref = useRef({ bg, mut, gen });
  ref.current = { bg, mut, gen };

  function step() {
    const { bg: b, mut: m } = ref.current;
    setPop(prev => {
      const fit = prev.map(s => 1 - Math.abs(s - b) / 100);           // 0..1 (ortama yakınlık)
      const survivors = prev.filter((_, i) => Math.random() < fit[i] * 0.92 + 0.05);
      const base = survivors.length ? survivors : prev;               // hiç kalmazsa boş kalmasın
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
    const id = setInterval(() => {
      if (ref.current.gen >= GEN_CAP) { setPlaying(false); return; }
      stepRef.current();
    }, 620);
    return () => clearInterval(id);
  }, [playing]);

  function reset() { setPop(initialPop()); setGen(0); setHistory([camoOf(initialPop(), bg)]); setPlaying(false); }
  function flip() { setBg(b => (b > 50 ? 16 : 84)); }

  const spark = history.length > 1
    ? 'M' + history.map((c, i) => `${(i / (history.length - 1) * 300).toFixed(1)},${(54 - (c / 100) * 48).toFixed(1)}`).join(' L')
    : '';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      {/* ortam + popülasyon */}
      <div className="rounded-xl p-4 ring-1 ring-black/20 transition-colors duration-500" style={{ background: shadeColor(bg) }}>
        <div className="grid grid-cols-8 gap-2 sm:grid-cols-[repeat(16,minmax(0,1fr))]">
          {pop.map((s, i) => (
            <span key={i} className="aspect-square rounded-full ring-1 ring-black/10 transition-colors duration-500" style={{ background: shadeColor(s) }} aria-hidden />
          ))}
        </div>
      </div>

      {/* dağılım histogramı */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-slate-400">
          <span>Renk dağılımı (popülasyon)</span>
          <span className="font-mono text-emerald-300">ortalama: {mean}</span>
        </div>
        <div className="relative flex h-20 items-end gap-1 rounded-xl bg-black/30 p-2 ring-1 ring-white/5">
          {hist.map((n, i) => (
            <div key={i} className="flex-1 rounded-sm transition-all duration-500" style={{ height: `${Math.max(4, (n / maxBin) * 100)}%`, background: shadeColor((i + 0.5) / HIST_BINS * 100) }} />
          ))}
          {/* ortam çizgisi */}
          <div className="pointer-events-none absolute bottom-0 top-0 w-0.5 bg-white/80" style={{ left: `calc(8px + ${bg / 100} * (100% - 16px))` }}>
            <span className="absolute -top-0.5 left-1 whitespace-nowrap text-[0.6rem] font-bold text-white/90">↑ ortam</span>
          </div>
        </div>
      </div>

      {/* kontroller */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="flex justify-between text-sm text-slate-300"><span>Ortam rengi</span><span className="font-mono text-emerald-300">{bg < 38 ? 'açık' : bg > 70 ? 'koyu' : 'orta'}</span></span>
          <input type="range" min={0} max={100} value={bg} onChange={e => setBg(+e.target.value)} className="mt-2 w-full accent-emerald-500" aria-label="Ortam rengi" />
        </label>
        <label className="block">
          <span className="flex justify-between text-sm text-slate-300"><span>Mutasyon oranı</span><span className="font-mono text-fuchsia-300">{mut}</span></span>
          <input type="range" min={1} max={20} value={mut} onChange={e => setMut(+e.target.value)} className="mt-2 w-full accent-fuchsia-500" aria-label="Mutasyon oranı" />
          <span className="text-xs text-slate-500">çeşitliliğin yenilenme hızı</span>
        </label>
      </div>

      {/* istatistik + butonlar */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
          <div className="font-mono text-2xl font-bold text-emerald-300">{gen}</div>
          <div className="text-xs text-emerald-200/80">nesil</div>
        </div>
        <div className="rounded-xl border border-lime-500/30 bg-lime-500/10 p-3 text-center">
          <div className="font-mono text-2xl font-bold text-lime-300">{camo}%</div>
          <div className="text-xs text-lime-200/80">kamuflaj uyumu</div>
        </div>
        <button onClick={step} disabled={playing} className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-40">🧬 Bir nesil</button>
        <button onClick={() => setPlaying(p => !p)} className={`rounded-xl px-3 py-2 text-sm font-bold transition ${playing ? 'bg-rose-500 text-rose-950 hover:bg-rose-400' : 'bg-amber-400 text-amber-950 hover:bg-amber-300'}`}>{playing ? '⏸ Durdur' : '▶ Otomatik'}</button>
      </div>
      <div className="mt-2 flex gap-2">
        <button onClick={flip} className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10">🌗 Ortamı tersine çevir</button>
        <button onClick={reset} className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10">↺ Sıfırla</button>
      </div>

      {/* kamuflaj uyumu geçmişi */}
      {history.length > 1 && (
        <div className="mt-4">
          <div className="mb-1 text-xs text-slate-400">Kamuflaj uyumu — nesil geçmişi</div>
          <div className="overflow-hidden rounded-xl bg-black/30 ring-1 ring-white/5">
            <svg viewBox="0 0 300 54" className="h-12 w-full" preserveAspectRatio="none">
              <line x1="0" y1="6" x2="300" y2="6" stroke="#1e3a2e" strokeWidth="1" />
              <line x1="0" y1="54" x2="300" y2="54" stroke="#1e3a2e" strokeWidth="1" />
              <path d={spark} fill="none" stroke="#a3e635" strokeWidth="2" />
            </svg>
          </div>
        </div>
      )}

      <div className="sr-only" aria-live="polite">Nesil {gen}, kamuflaj uyumu yüzde {camo}.</div>
      <p className="mt-3 text-xs leading-relaxed text-slate-400">Zemini bir renge ayarla, <strong className="text-emerald-300">▶ Otomatik</strong>’e bas ve seyret: zemine uymayan bireyler avcılara yem olur, uyanlar çoğalır — dağılım birkaç nesilde tam <em className="not-italic text-slate-200">ortam çizgisinin</em> üstüne toplanır. <strong className="text-amber-300">🌗 Ortamı tersine çevir</strong>’le seçilim yön değiştirir; mutasyonu kısarsan uyum yavaşlar. Hiçbir birey rengini değiştirmiyor — değişen, kimin hayatta kaldığı.</p>
    </div>
  );
}

/* ─── İnteraktif 2: Seçilim türleri (canlı slider-morph) ─── */
function gaussPath(cx: number, sd: number, amp: number) {
  const pts: string[] = [];
  for (let x = 10; x <= 290; x += 3) {
    const y = 96 - amp * Math.exp(-((x - cx) ** 2) / (2 * sd * sd));
    pts.push(`${x},${Math.max(6, y).toFixed(1)}`);
  }
  return 'M' + pts.join(' L');
}
function gauss2Path(amp: number, c1: number, c2: number, sd: number) {
  const pts: string[] = [];
  for (let x = 10; x <= 290; x += 3) {
    const y = 96 - amp * (Math.exp(-((x - c1) ** 2) / (2 * sd * sd)) + Math.exp(-((x - c2) ** 2) / (2 * sd * sd)));
    pts.push(`${x},${Math.max(6, y).toFixed(1)}`);
  }
  return 'M' + pts.join(' L');
}
const BASE_CURVE = gaussPath(150, 40, 70);
const SEL_TYPES = [
  { key: 'yonlu', label: 'Yönlü', color: '#34d399', ex: 'Kuraklıkta büyük gagaların, antibiyotik altında dirençli bakterilerin seçilmesi. En tanıdık seçilim türü.' },
  { key: 'dengeleyici', label: 'Dengeleyici', color: '#fbbf24', ex: 'İnsan doğum ağırlığı ve sıtma bölgelerinde orak hücre taşıyıcılığı: çok küçük de çok büyük de dezavantajlı.' },
  { key: 'ayirici', label: 'Ayırıcı', color: '#e879f9', ex: 'İki uç da kazanır, orta elenir. Farklı tohum boylarına uyan iki gaga tipi gibi — bazen türleşmenin ilk adımı.' },
] as const;

function SelectionTypes() {
  const [type, setType] = useState<typeof SEL_TYPES[number]['key']>('yonlu');
  const [strength, setStrength] = useState(60);
  const cur = SEL_TYPES.find(t => t.key === type)!;
  const k = strength / 100;
  const after =
    type === 'yonlu' ? gaussPath(150 + k * 78, 40 - k * 6, 70 + k * 6)
      : type === 'dengeleyici' ? gaussPath(150, 40 - k * 28, 70 + k * 48)
        : gauss2Path(58 + k * 18, 150 - (16 + k * 46), 150 + (16 + k * 46), 19);

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
          {/* seçilim bandı: hangi değerler avantajlı */}
          {type === 'dengeleyici' && <rect x={150 - 18} y="6" width="36" height="90" fill={cur.color} opacity="0.08" />}
          {type === 'yonlu' && <rect x={Math.min(288, 150 + k * 78 - 6)} y="6" width="20" height="90" fill={cur.color} opacity="0.08" />}
          {type === 'ayirici' && <><rect x={150 - (16 + k * 46) - 10} y="6" width="20" height="90" fill={cur.color} opacity="0.08" /><rect x={150 + (16 + k * 46) - 10} y="6" width="20" height="90" fill={cur.color} opacity="0.08" /></>}
          <path d={BASE_CURVE} fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />
          <path d={after} fill="none" stroke={cur.color} strokeWidth="3" />
          <text x="150" y="108" textAnchor="middle" fontSize="8" fill="#475569">özellik değeri (örn. gaga boyu) →</text>
        </svg>
      </div>
      <div className="mt-4">
        <span className="flex justify-between text-sm text-slate-300"><span>Seçilim baskısı</span><span className="font-mono" style={{ color: cur.color }}>{strength}%</span></span>
        <input type="range" min={0} max={100} value={strength} onChange={e => setStrength(+e.target.value)} className="mt-2 w-full" style={{ accentColor: cur.color }} aria-label="Seçilim baskısı" />
        <div className="flex justify-between text-xs text-slate-500"><span>zayıf</span><span>güçlü</span></div>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-slate-500" />önce</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-5" style={{ background: cur.color }} />sonra</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{cur.ex} <span className="text-slate-400">Baskıyı artırdıkça etkiyi abartılı gör.</span></p>
    </div>
  );
}

/* ════════════════════════ ANA BİLEŞEN ════════════════════════ */

export default function DogalSecilimClient() {
  const [quizQ, setQuizQ] = useState(0);
  const [score, setScore] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const q = quizQs[quizQ];
  const answered = pick !== null;

  function answerQ(sel: number) {
    if (answered) return;
    setPick(sel);
    if (sel === q.a) setScore(s => s + 1);
  }
  function next() {
    if (quizQ + 1 < quizQs.length) { setQuizQ(n => n + 1); setPick(null); }
    else setDone(true);
  }
  function restartQuiz() { setQuizQ(0); setScore(0); setPick(null); setDone(false); }

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
            <p className="mb-6 text-slate-400">Avcı, zemine uymayan böcekleri yer. Zemini seç, otomatiğe bas ve dağılımın ortam çizgisine toplanışını izle.</p>
            <CamouflageSim />
          </section>
        </Reveal>

        {/* IV. İnteraktif: seçilim türleri */}
        <Reveal>
          <section className="mx-auto max-w-3xl px-6 py-8">
            <div className="mb-3 text-xs font-semibold tracking-[0.2em] text-fuchsia-400">İNTERAKTİF · KARŞILAŞTIR</div>
            <h2 className="mb-2 text-2xl font-bold text-slate-100">Seçilim her zaman aynı yöne itmez</h2>
            <p className="mb-6 text-slate-400">Türü seç, baskı kaydırıcısını oynat: seçilim dağılımı kaydırabilir, daraltabilir ya da ikiye bölebilir.</p>
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
                  {/* ilerleme çubuğu */}
                  <div className="mb-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                      <span>Soru {quizQ + 1} / {quizQs.length}</span>
                      <span className="font-mono text-emerald-400">{score} doğru</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-400 transition-all duration-500" style={{ width: `${((quizQ + (answered ? 1 : 0)) / quizQs.length) * 100}%` }} />
                    </div>
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
                        <button key={i} onClick={() => answerQ(i)} disabled={answered}
                          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${cls}`}>
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                          <span>{opt}</span>
                          {answered && correct && <span className="ml-auto">✓</span>}
                          {answered && i === pick && !correct && <span className="ml-auto">✗</span>}
                        </button>
                      );
                    })}
                  </div>
                  {/* açıklama + ilerleme */}
                  {answered && (
                    <div className="mt-4">
                      <div className={`rounded-xl border p-4 text-sm leading-relaxed ${pick === q.a ? 'border-emerald-400/30 bg-emerald-400/5 text-emerald-100/90' : 'border-amber-400/30 bg-amber-400/5 text-amber-100/90'}`}>
                        <span className="font-bold">{pick === q.a ? 'Doğru! ' : 'Doğru cevap: ' + q.opts[q.a] + '. '}</span>{q.exp}
                      </div>
                      <button onClick={next} className="mt-3 w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400">
                        {quizQ + 1 < quizQs.length ? 'Sonraki soru →' : 'Sonucu gör 🎉'}
                      </button>
                    </div>
                  )}
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
