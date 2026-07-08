'use client';

// "Bilgisayar Nasıl Çalışır?" makalesine ÖZEL interaktif widget'lar + veri.
// Genel şablon: @/app/components/article/ArticleBlocks
import { useEffect, useRef, useState } from 'react';

export { refs } from './refs';

const CYAN = '#22d3ee';

/* ════════════ VERİ (kart ızgaraları, timeline, quiz) ════════════ */

export const ddrGens = [
  { icon: '3️⃣', title: 'DDR3', text: "~2007 sonrası uzun yıllar standarttı; bugüne göre düşük hız." },
  { icon: '4️⃣', title: 'DDR4', text: "~2014 sonrası: daha hızlı, daha verimli — hâlâ çok yaygın." },
  { icon: '5️⃣', title: 'DDR5', text: "~2021 sonrası: çok daha yüksek bant genişliği, daha az enerji." },
];

export const motherboardParts = [
  { icon: '🔲', title: 'CPU soketi', text: "İşlemcinin oturduğu yer." },
  { icon: '📊', title: 'RAM yuvaları (DIMM)', text: "Bellek çubuklarının takıldığı yuvalar." },
  { icon: '🎮', title: 'PCIe yuvaları', text: "Ekran kartı ve genişleme kartları için yüksek hızlı yuvalar." },
  { icon: '🚦', title: 'Yonga seti (chipset)', text: "Anakartın trafik polisi: parçalar arası veri akışını yönetir." },
  { icon: '🛣️', title: 'Veri yolları (bus)', text: "Parçalar arasında veri taşıyan elektronik otoyollar." },
  { icon: '⚙️', title: 'BIOS/UEFI çipi', text: "İşletim sistemi yüklenmeden donanımı tanıyıp başlatan temel yazılım." },
];

export const otherParts = [
  { icon: '❄️', title: 'Soğutma', text: "Isınan CPU/GPU'yu soğutucu blok çeker, fan üfler; termal macun ısı aktarımını iyileştirir. Sıvı soğutma da vardır." },
  { icon: '🔌', title: 'BIOS/UEFI', text: "Açılışta işletim sisteminden önce çalışan, donanımı başlatıp OS'yi yüklemeye hazırlayan yazılım." },
  { icon: '🌐', title: 'Ağ kartı / Wi-Fi', text: "İnternete ve yerel ağa bağlanmayı sağlar; verileri gönderip alır." },
  { icon: '🔊', title: 'Ses kartı', text: "Dijital sesi hoparlörün kullanacağı analog sinyale çevirir (mikrofonda tersini yapar). Çoğu anakartta tümleşik." },
  { icon: '🖱️', title: 'Çevre birimleri', text: "Fare, yazıcı, web kamerası — hepsi kendi içinde sensör → sinyal → bilgisayar prensibiyle çalışır." },
];

// Klavye → ekran yolculuğu (yatay zaman çizelgesi için)
export const journey = [
  { year: 'DEVRE', title: 'Devre kapanır', text: "Tuş matrisinde o tuşun satırı ile sütunu birbirine değer, elektrik devresi kapanır." },
  { year: 'TARAMA', title: 'Kontrolcü tarar', text: "Klavyedeki mikrodenetleyici ızgarayı tarar; hangi satır+sütun kesişiminin kapandığını, yani hangi tuşa basıldığını algılar." },
  { year: 'KOD', title: 'Tarama kodu üretilir', text: "Tuşa karşılık gelen bir “tarama kodu” oluşur. Bu harfin kendisi değil, “şu konumdaki tuş basıldı” bilgisidir." },
  { year: 'İLET', title: 'Bilgisayara gönderilir', text: "Kod, USB (veya Bluetooth) üzerinden bilgisayara iletilir." },
  { year: 'ÇEVİR', title: 'İşletim sistemi çevirir', text: "Klavye sürücüsü, düzene göre (Türkçe Q/F...) kodun hangi karaktere karşılık geldiğini belirler." },
  { year: 'ODAK', title: 'Aktif uygulamaya iletilir', text: "İşletim sistemi karakteri o an odakta olan uygulamaya (not defteri, tarayıcı...) gönderir." },
  { year: 'İŞLE', title: 'Uygulama işler', text: "Uygulama “buraya bir A eklendi” der ve metnini günceller." },
  { year: 'ÇİZ', title: 'Ekrana çizilir', text: "Uygulama, harfin görselini (glif) çizmesi için OS ve GPU'ya talimat verir; GPU o bölgeyi günceller." },
  { year: 'GÖSTER', title: 'Monitör gösterir', text: "LCD o pikselleri yakarak harfi sana gösterir. Tüm zincir göz açıp kapayana kadar biter." },
];

export const gameFlow = [
  "Güç kaynağı (PSU) prizden gelen elektriği uygun voltajlara çevirip her parçaya dağıtır.",
  "Sistem kristali ritmi belirler; tüm parçalar bu tempoda senkron çalışır.",
  "SSD/HDD'deki oyun dosyaları okunup hızlı çalışma alanı RAM'e yüklenir.",
  "CPU oyunun mantığını (kurallar, fizik, yapay zekâ) işler, ne çizileceğine karar verir.",
  "GPU milyonlarca pikseli paralel hesaplayıp her kareyi çizer.",
  "Bütün trafik anakart üzerindeki veri yollarından akar.",
  "Çizilen görüntü LCD ekrana gönderilir, sen görürsün.",
  "Sesler ses kartı → hoparlör yoluyla havaya çıkar.",
  "Klavye ve fareyle komut verirsin; döngü baştan başlar.",
];

export const quizQs = [
  { text: "Bir transistör temelde ne yapar?", opts: ['Işık üretir', 'Akımı geçirir (1) veya geçirmez (0) — minik bir anahtar', 'Isıyı depolar', 'Ses üretir'], a: 1, exp: "Milyarlarca transistörü doğru birleştirince toplama, karşılaştırma gibi mantık işlemleri ortaya çıkar." },
  { text: "CPU ile GPU arasındaki temel fark nedir?", opts: ['GPU daha yavaştır', 'CPU az sayıda güçlü çekirdek, GPU binlerce basit çekirdek içerir', 'CPU görüntü çizemez', 'İkisi aynıdır'], a: 1, exp: "CPU karmaşık sıralı işler için; GPU aynı basit işi aynı anda binlerce veri üzerinde yapmak (paralel işleme) için idealdir." },
  { text: "RAM'in “uçucu (volatile)” olması ne demektir?", opts: ['Çok ısınır', 'Elektrik kesilince içindeki her şey silinir', 'Asla dolmaz', 'Sadece oyunlarda çalışır'], a: 1, exp: "Bu yüzden kaydetmeden bilgisayar kapanırsa belgeni kaybedersin — o veri RAM'deydi, kalıcı diske yazılmamıştı." },
  { text: "DDR (Double Data Rate) ismi nereden gelir?", opts: ['İki kat pahalı olduğu için', 'Veriyi saatin hem yükselen hem alçalan kenarında taşıdığı için', 'İki çekirdeği olduğu için', 'İki voltaj kullandığı için'], a: 1, exp: "Her saat tıkında bir yerine iki kez veri aktarır — bu yüzden “çift veri hızı”." },
  { text: "SSD'nin HDD'ye göre en temel farkı nedir?", opts: ['Daha ucuzdur', 'Hiç hareketli parçası yoktur (flash çipi kullanır)', 'Veriyi kalıcı tutmaz', 'Daha sesli çalışır'], a: 1, exp: "HDD dönen manyetik plak + kafa kullanır; SSD elektronik NAND flash. Bu yüzden SSD çok daha hızlı, sessiz ve dayanıklıdır." },
  { text: "Mikrofon ile hoparlörün ilişkisi nedir?", opts: ['Alakasızdırlar', 'Aynı fizik prensibinin (manyetizma ↔ hareket) iki yöne çalıştırılmış hâlidir', 'İkisi de ışık kullanır', 'Hoparlör sesi elektriğe çevirir'], a: 1, exp: "Mikrofon: ses → titreşim → akım. Hoparlör: akım → manyetik kuvvet → hareket → ses. Bir hoparlörü mikrofon gibi bile kullanabilirsin." },
];

/* ════════════ İNTERAKTİF 1: İkili sayı (bit) oyun alanı ════════════ */

const PLACE = [128, 64, 32, 16, 8, 4, 2, 1];
export function BinaryPlayground() {
  const [bits, setBits] = useState<boolean[]>([false, true, false, false, false, false, false, true]); // 01000001 = 65 = 'A'
  const value = bits.reduce((acc, on, i) => acc + (on ? PLACE[i] : 0), 0);
  const ch = value >= 32 && value <= 126 ? String.fromCharCode(value) : '·';
  const toggle = (i: number) => setBits((b) => b.map((v, k) => (k === i ? !v : v)));
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="flex flex-wrap justify-center gap-2">
        {bits.map((on, i) => (
          <button key={i} onClick={() => toggle(i)} className="flex flex-col items-center gap-1" aria-label={`bit ${PLACE[i]}`}>
            <span className="grid h-12 w-12 place-items-center rounded-lg font-mono text-xl font-black transition" style={{ background: on ? CYAN : 'rgba(255,255,255,0.06)', color: on ? '#04121a' : '#64748b', boxShadow: on ? `0 0 16px ${CYAN}66` : 'none' }}>{on ? 1 : 0}</span>
            <span className="font-mono text-[0.6rem] text-slate-500">{PLACE[i]}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3"><div className="text-xs text-slate-500">ikili</div><div className="font-mono text-lg font-bold text-cyan-300">{bits.map((b) => (b ? 1 : 0)).join('')}</div></div>
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3"><div className="text-xs text-slate-500">onluk</div><div className="font-mono text-2xl font-black text-cyan-300">{value}</div></div>
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3"><div className="text-xs text-slate-500">harf (ASCII)</div><div className="font-mono text-2xl font-black text-white">{ch}</div></div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Anahtarlara tıkla: 8 tane “açık/kapalı” bir sayı, sayı da bir harf oluyor. Bilgisayarın tamamı işte bunun milyarlarcasıdır. (Şu an: 01000001 = 65 = “A”.)</p>
    </div>
  );
}

/* ════════════ İNTERAKTİF 2: Komut döngüsü ════════════ */

const STAGES = [
  { name: 'Getir', en: 'Fetch', desc: "Yapılacak komutu bellekten (RAM'den) alır." },
  { name: 'Çöz', en: 'Decode', desc: "Bu komutun ne anlama geldiğini çözer." },
  { name: 'Yürüt', en: 'Execute', desc: "İşlemi gerçekleştirir (örneğin iki sayıyı toplar)." },
  { name: 'Yaz', en: 'Writeback', desc: "Sonucu kaydeder." },
];
export function CommandCycle() {
  const [step, setStep] = useState(0);
  const [cycles, setCycles] = useState(0);
  const advance = () => setStep((s) => { const n = (s + 1) % 4; if (n === 0) setCycles((c) => c + 1); return n; });
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {STAGES.map((s, i) => (
          <div key={s.en} className="flex items-center">
            <div className="rounded-xl border px-4 py-3 text-center transition" style={{ borderColor: i === step ? CYAN : 'rgba(255,255,255,0.1)', background: i === step ? 'rgba(34,211,238,0.14)' : 'rgba(255,255,255,0.03)', boxShadow: i === step ? `0 0 18px ${CYAN}44` : 'none' }}>
              <div className="font-bold" style={{ color: i === step ? '#a5f3fc' : '#cbd5e1' }}>{s.name}</div>
              <div className="font-mono text-[0.62rem] text-slate-500">{s.en}</div>
            </div>
            {i < 3 && <span className="px-1 text-slate-600">→</span>}
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-center">
        <div className="text-sm font-semibold text-cyan-300">{step + 1}. {STAGES[step].name} ({STAGES[step].en})</div>
        <p className="mt-1 text-sm text-slate-300">{STAGES[step].desc}</p>
      </div>
      <div className="mt-3 flex items-center justify-center gap-3">
        <button onClick={advance} className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-bold text-cyan-950 transition hover:bg-cyan-300">▶ Sonraki adım</button>
        <span className="text-xs text-slate-500">Tamamlanan döngü: <span className="font-mono text-cyan-300">{cycles}</span></span>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">İşlemci bu 4 adımı saniyede milyarlarca kez tekrarlar. 3 GHz ≈ saniyede 3 milyar döngü.</p>
    </div>
  );
}

/* ════════════ İNTERAKTİF 3: Karşılaştırma (CPU↔GPU, SSD↔HDD) ════════════ */

export function Compare({ items }: { items: { name: string; tint: string; rows: [string, string][] }[] }) {
  const [sel, setSel] = useState(0);
  const it = items[sel];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {items.map((x, i) => (
          <button key={x.name} onClick={() => setSel(i)} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${sel === i ? 'text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`} style={sel === i ? { background: x.tint } : undefined}>{x.name}</button>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10">
        {it.rows.map((r, i) => (
          <div key={i} className={`flex items-start gap-3 px-4 py-2.5 text-sm ${i % 2 ? 'bg-white/[0.02]' : ''}`}>
            <span className="w-36 shrink-0 text-slate-500">{r[0]}</span>
            <span className="text-slate-200">{r[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const CPU_GPU = [
  { name: '🧠 CPU', tint: '#22d3ee', rows: [['Çekirdek', 'Az sayıda, çok güçlü'], ['En iyi olduğu', 'Karmaşık, sıralı işler'], ['Benzetme', 'Birkaç dâhi profesör'], ['Örnek', 'Oyun mantığı, işletim sistemi']] as [string, string][] },
  { name: '🎨 GPU', tint: '#a78bfa', rows: [['Çekirdek', 'Binlerce, basit'], ['En iyi olduğu', 'Aynı işi aynı anda binlerce veriye (paralel)'], ['Benzetme', 'Binlerce öğrenci aynı anda çarpım'], ['Örnek', 'Grafik, video, yapay zekâ (matris çarpımı)']] as [string, string][] },
];
export const SSD_HDD = [
  { name: '⚡ SSD', tint: '#34d399', rows: [['Çalışma', 'Elektronik NAND flash çipi'], ['Hareketli parça', 'Yok'], ['Hız', 'SATA ~500 MB/s · NVMe ~3500–7000 MB/s'], ['Dayanıklılık', 'Çok sağlam, sessiz'], ['Fiyat (GB)', 'Pahalı']] as [string, string][] },
  { name: '💽 HDD', tint: '#f59e0b', rows: [['Çalışma', 'Dönen manyetik plak + okuma kafası'], ['Hareketli parça', 'Var'], ['Hız', '~80–160 MB/s'], ['Dayanıklılık', 'Düşme/sarsıntıya hassas'], ['Fiyat (GB)', 'Ucuz']] as [string, string][] },
];

/* ════════════ İNTERAKTİF 4: RGB piksel karıştırıcı ════════════ */

export function RgbMixer() {
  const [r, setR] = useState(255);
  const [g, setG] = useState(210);
  const [b, setB] = useState(0);
  const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-center">
          <div className="h-32 w-32 rounded-2xl ring-1 ring-white/20" style={{ background: `rgb(${r},${g},${b})`, boxShadow: `0 0 40px rgba(${r},${g},${b},0.5)` }} />
          <div className="mt-3 font-mono text-sm text-slate-300">rgb({r}, {g}, {b}) · <span className="uppercase text-cyan-300">{hex}</span></div>
        </div>
        <div className="flex flex-col justify-center gap-4">
          {([['Kırmızı', r, setR, '#ef4444'], ['Yeşil', g, setG, '#22c55e'], ['Mavi', b, setB, '#3b82f6']] as const).map(([label, val, set, col]) => (
            <label key={label} className="block">
              <span className="flex justify-between text-sm text-slate-300"><span style={{ color: col }}>{label} alt piksel</span><span className="font-mono" style={{ color: col }}>{val}</span></span>
              <input type="range" min={0} max={255} value={val} onChange={(e) => set(+e.target.value)} className="mt-2 w-full" style={{ accentColor: col }} aria-label={label} />
            </label>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Her piksel kırmızı, yeşil ve mavi üç alt pikselden oluşur. Kırmızı + yeşil açık, mavi kapalı → <span className="text-amber-300">sarı</span>. Üçünü kısarak milyonlarca renk çıkar.</p>
    </div>
  );
}

/* ════════════ İSTATİSTİK: animasyonlu sayaç (SSR'da son değer = crawlable) ════════════ */

// Locale'den bağımsız binlik ayracı (Intl KULLANMA → hydration mismatch riski). SSR ve
// istemci ilk render'da aynı metni (son değer) üretir; useEffect sadece 0'dan yukarı anime eder.
const grp = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export function CountUp({ to, suffix = '', prefix = '', duration = 1500 }: { to: number; suffix?: string; prefix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let t0 = 0;
    const step = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + grp(to * eased) + suffix;
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, suffix, prefix, duration]);
  return <span ref={ref}>{prefix + grp(to) + suffix}</span>;
}

export function StatStrip() {
  const items: [React.ReactNode, string, string][] = [
    [<CountUp key="t" to={30000000000} />, 'transistör', 'Modern bir işlemcide (minik anahtar sayısı)'],
    [<CountUp key="c" to={3000000000} />, 'döngü / saniye', '3 GHz işlemci — her biri getir-çöz-yürüt-yaz'],
    [<CountUp key="p" to={8294400} />, 'piksel', "4K ekranda GPU'nun her karede boyadığı"],
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map(([val, label, sub]) => (
        <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center backdrop-blur">
          <div className="font-mono text-2xl font-black text-cyan-300 sm:text-3xl">{val}</div>
          <div className="mt-1 text-sm font-semibold text-white">{label}</div>
          <div className="mt-1 text-xs leading-relaxed text-slate-500">{sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ════════════ OYUN 1: Mantık kapıları (transistör → mantık) ════════════ */

type Gate = 'VE' | 'VEYA' | 'DEĞİL' | 'XOR';
const GATE_FN: Record<Gate, (a: boolean, b: boolean) => boolean> = {
  'VE': (a, b) => a && b,
  'VEYA': (a, b) => a || b,
  'DEĞİL': (a) => !a,
  'XOR': (a, b) => a !== b,
};
const GATE_DESC: Record<Gate, string> = {
  'VE': 'Her iki giriş de 1 ise çıkış 1 olur. (AND)',
  'VEYA': 'Girişlerden en az biri 1 ise çıkış 1 olur. (OR)',
  'DEĞİL': 'Çıkış, A girişinin tam tersidir. (NOT)',
  'XOR': 'Girişler birbirinden FARKLI ise çıkış 1 olur. (özel VEYA)',
};
export function LogicGates() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const [gate, setGate] = useState<Gate>('VE');
  const single = gate === 'DEĞİL';
  const out = GATE_FN[gate](a, single ? false : b);
  const Sw = ({ on, set, label }: { on: boolean; set: () => void; label: string }) => (
    <button onClick={set} className="flex flex-col items-center gap-1" aria-label={label}>
      <span className="text-[0.65rem] text-slate-500">{label}</span>
      <span className="grid h-11 w-11 place-items-center rounded-lg font-mono text-lg font-black transition" style={{ background: on ? CYAN : 'rgba(255,255,255,0.06)', color: on ? '#04121a' : '#64748b', boxShadow: on ? `0 0 14px ${CYAN}66` : 'none' }}>{on ? 1 : 0}</span>
    </button>
  );
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="mb-5 flex flex-wrap justify-center gap-2">
        {(Object.keys(GATE_FN) as Gate[]).map((g) => (
          <button key={g} onClick={() => setGate(g)} className="rounded-full px-4 py-1.5 text-sm font-bold transition" style={gate === g ? { background: CYAN, color: '#04121a' } : { background: 'rgba(255,255,255,0.05)', color: '#cbd5e1' }}>{g}</button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3 sm:gap-6">
        <div className="flex flex-col gap-3">
          <Sw on={a} set={() => setA((v) => !v)} label="Giriş A" />
          {!single && <Sw on={b} set={() => setB((v) => !v)} label="Giriş B" />}
        </div>
        <div className="text-xl text-slate-600">→</div>
        <div className="grid place-items-center rounded-xl border px-5 py-4 text-center" style={{ borderColor: `${CYAN}55`, background: 'rgba(34,211,238,0.06)' }}>
          <span className="text-lg">🔀</span>
          <span className="mt-1 text-[0.65rem] font-semibold text-cyan-300">{gate} kapısı</span>
        </div>
        <div className="text-xl text-slate-600">→</div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[0.65rem] text-slate-500">Çıkış</span>
          <span className="grid h-14 w-14 place-items-center rounded-full font-mono text-2xl font-black transition" style={{ background: out ? CYAN : 'rgba(255,255,255,0.06)', color: out ? '#04121a' : '#64748b', boxShadow: out ? `0 0 26px ${CYAN}` : 'none' }}>{out ? 1 : 0}</span>
        </div>
      </div>
      <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">{GATE_DESC[gate]}<br /><span className="text-slate-600">Girişlere tıklayıp değiştir. Milyarlarca kapı birleşince toplama, karşılaştırma ve tüm hesaplama bundan doğar.</span></p>
    </div>
  );
}

/* ════════════ OYUN 2: CPU ↔ GPU yarışı (sıralı vs paralel) ════════════ */

export function CpuGpuRace() {
  const TOTAL = 2000;
  const [cpu, setCpu] = useState(0);
  const [gpu, setGpu] = useState(0);
  const [running, setRunning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const start = () => {
    if (running) return;
    setCpu(0); setGpu(0); setWinner(null); setRunning(true);
    let c = 0, g = 0, done = false;
    timer.current = setInterval(() => {
      c = Math.min(TOTAL, c + 20);   // sıralı: az çekirdek, teker teker
      g = Math.min(TOTAL, g + 340);  // paralel: binlerce çekirdek, hepsi aynı anda
      setCpu(c); setGpu(g);
      if (!done && g >= TOTAL) { done = true; setWinner('GPU'); }
      if (c >= TOTAL && g >= TOTAL) {
        if (timer.current) clearInterval(timer.current);
        setRunning(false);
      }
    }, 55);
  };
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const bar = (val: number, color: string, label: string, sub: string) => (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm"><span className="font-bold" style={{ color }}>{label}</span><span className="font-mono text-xs text-slate-400">{val}/{TOTAL} piksel</span></div>
      <div className="h-5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full" style={{ width: `${(val / TOTAL) * 100}%`, background: color, transition: 'width 0.05s linear' }} /></div>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
  );
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <p className="mb-4 text-center text-sm text-slate-400">Görev: <strong className="text-slate-200">2000 pikseli boya.</strong> Kim önce bitirir?</p>
      <div className="space-y-4">
        {bar(cpu, '#22d3ee', '🧠 CPU', 'Az ama güçlü çekirdek — pikselleri sırayla boyar.')}
        {bar(gpu, '#a78bfa', '🎨 GPU', 'Binlerce basit çekirdek — hepsini aynı anda (paralel) boyar.')}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button onClick={start} disabled={running} className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-bold text-cyan-950 transition hover:bg-cyan-300 disabled:opacity-50">▶ Yarışı başlat</button>
        {winner && <span className="text-sm font-bold text-violet-300">🏆 {winner} kazandı — paralel işleme işte bu!</span>}
      </div>
    </div>
  );
}

/* ════════════ OYUN 3: DRAM tazeleme refleks oyunu ════════════ */

export function DramRefreshGame() {
  const N = 24;
  const DURATION = 18;
  const [cells, setCells] = useState<number[]>(() => Array(N).fill(100));
  const [running, setRunning] = useState(false);
  const [refreshes, setRefreshes] = useState(0);
  const [time, setTime] = useState(DURATION);
  const leak = useRef<ReturnType<typeof setInterval> | null>(null);
  const clock = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => {
    if (leak.current) clearInterval(leak.current);
    if (clock.current) clearInterval(clock.current);
    setRunning(false);
  };
  const start = () => {
    if (running) return;
    setCells(Array(N).fill(100)); setRefreshes(0); setTime(DURATION); setRunning(true);
    leak.current = setInterval(() => {
      // sızıntı: her hücre yükünü biraz kaybeder (mount'tan SONRA, render'da değil → hydration güvenli)
      setCells((cs) => cs.map((c) => (c <= 0 ? 0 : Math.max(0, c - (7 + Math.floor(Math.random() * 13))))));
    }, 400);
    clock.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) { stop(); return 0; }
        return t - 1;
      });
    }, 1000);
  };
  useEffect(() => () => stop(), []);
  const refresh = (i: number) => {
    if (!running || cells[i] <= 0) return; // veri kaybolduysa geri gelmez (DRAM gerçeği)
    setCells((cs) => cs.map((c, k) => (k === i ? 100 : c)));
    setRefreshes((r) => r + 1);
  };
  const lost = cells.filter((c) => c <= 0).length;
  const alive = N - lost;
  const color = (c: number) => (c <= 0 ? '#7f1d1d' : c < 35 ? '#f59e0b' : c < 70 ? '#22d3ee' : '#34d399');
  const ended = !running && time === 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-slate-400">Sızan hücrelere tıklayıp <strong className="text-cyan-300">tazele</strong>, 0'a düşmeden!</span>
        <span className="font-mono text-slate-300">⏱ {time}s · 🟢 {alive} · ✗ {lost} · ↻ {refreshes}</span>
      </div>
      <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
        {cells.map((c, i) => (
          <button key={i} onClick={() => refresh(i)} aria-label={`bit ${i}`} className="relative h-10 overflow-hidden rounded-md border border-white/10 bg-black/30 transition-transform active:scale-95 sm:h-12">
            <span className="absolute inset-x-0 bottom-0 transition-all" style={{ height: `${Math.max(4, c)}%`, background: color(c), opacity: c <= 0 ? 0.6 : 1 }} />
            <span className="relative z-10 grid h-full place-items-center font-mono text-xs font-bold" style={{ color: c > 40 ? '#04121a' : '#e2e8f0' }}>{c <= 0 ? '✗' : c >= 70 ? '1' : ''}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button onClick={start} disabled={running} className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-bold text-cyan-950 transition hover:bg-cyan-300 disabled:opacity-50">{ended ? '↻ Tekrar dene' : '▶ Başlat'}</button>
        {ended && <span className="text-sm font-bold text-cyan-200">{alive}/{N} bit korundu — gerçek RAM bunu saniyede <span className="text-violet-300">binlerce kez</span>, kusursuz yapar.</span>}
      </div>
    </div>
  );
}

/* ════════════ OYUN 4: İkili sayı meydan okuması (skorlu) ════════════ */

const CH_TARGETS: [string, number][] = [['A', 65], ['H', 72], ['i', 105], ['5', 53], ['Z', 90], ['?', 63], ['e', 101], ['!', 33]];
export function BinaryChallenge() {
  const [idx, setIdx] = useState(0);
  const [bits, setBits] = useState<boolean[]>(() => Array(8).fill(false));
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(false);
  const target = CH_TARGETS[idx];
  const value = bits.reduce((acc, on, i) => acc + (on ? PLACE[i] : 0), 0);
  const match = value === target[1];
  const toggle = (i: number) => { if (!solved) setBits((b) => b.map((v, k) => (k === i ? !v : v))); };
  useEffect(() => {
    if (match && !solved) {
      setSolved(true);
      setScore((s) => s + 1);
      const t = setTimeout(() => {
        setIdx((i) => (i + 1) % CH_TARGETS.length); // sıradaki hedef (deterministik → hydration güvenli)
        setBits(Array(8).fill(false));
        setSolved(false);
      }, 950);
      return () => clearTimeout(t);
    }
  }, [match, solved]);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-slate-400">Bu harfi <strong className="text-cyan-300">ikili</strong> yap:</div>
        <div className="text-sm text-slate-400">Skor: <span className="font-mono font-bold text-cyan-300">{score}</span></div>
      </div>
      <div className="mb-4 flex items-center justify-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-400/5 font-mono text-3xl font-black text-white">{target[0]}</div>
        <div className="text-slate-500">=</div>
        <div className="font-mono text-lg text-slate-400">? = <span className="text-cyan-300">{target[1]}</span></div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {bits.map((on, i) => (
          <button key={i} onClick={() => toggle(i)} className="flex flex-col items-center gap-1" aria-label={`bit ${PLACE[i]}`}>
            <span className="grid h-11 w-11 place-items-center rounded-lg font-mono text-lg font-black transition" style={{ background: on ? CYAN : 'rgba(255,255,255,0.06)', color: on ? '#04121a' : '#64748b', boxShadow: on ? `0 0 14px ${CYAN}66` : 'none' }}>{on ? 1 : 0}</span>
            <span className="font-mono text-[0.55rem] text-slate-500">{PLACE[i]}</span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-sm">
        {solved ? <span className="font-bold text-emerald-300">✓ Doğru! Sıradaki geliyor…</span> : <span className="text-slate-500">Şu an: <span className="font-mono text-slate-300">{value}</span> — açık bitlerin değerlerini toplayıp <span className="font-mono text-cyan-300">{target[1]}</span> yap.</span>}
      </p>
    </div>
  );
}

/* ════════════ OYUN 5: Bilgisayarını kur (eşleştirme) ════════════ */

const PC_PAIRS: { part: string; job: string }[] = [
  { part: '🧠 CPU', job: 'Düşünür: komutları işler, kararları verir' },
  { part: '🎨 GPU', job: 'Binlerce pikseli aynı anda çizer (paralel)' },
  { part: '⚡ RAM', job: 'Açık programların hızlı ama geçici hafızası' },
  { part: '💾 SSD', job: 'Veriyi kalıcı, elektronik ve sessiz saklar' },
  { part: '🔌 PSU', job: "Prizdeki AC'yi parçalara uygun DC'ye çevirir" },
  { part: '🧩 Anakart', job: 'Tüm parçaları birbirine bağlayan omurga' },
  { part: '⏱️ Kristal', job: 'Ritmi tutar: senkronizasyon sinyali üretir' },
  { part: '🔊 Hoparlör', job: 'Elektriği havadaki ses dalgasına çevirir' },
];
const JOB_ORDER = [4, 0, 6, 2, 7, 1, 3, 5]; // sabit karışık sıra (deterministik → hydration güvenli)
export function PartMatchGame() {
  const [sel, setSel] = useState<number | null>(null);
  const [solved, setSolved] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const wt = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (wt.current) clearTimeout(wt.current); }, []);
  const pickPart = (i: number) => { if (!solved.includes(i)) { setSel(i); setWrong(null); } };
  const pickJob = (partIdx: number) => {
    if (sel === null || solved.includes(partIdx)) return;
    if (partIdx === sel) { setSolved((s) => [...s, sel]); setSel(null); setWrong(null); }
    else {
      setWrong(partIdx);
      if (wt.current) clearTimeout(wt.current);
      wt.current = setTimeout(() => setWrong(null), 600);
    }
  };
  const done = solved.length === PC_PAIRS.length;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-slate-400">Bir <strong className="text-cyan-300">parça</strong> seç, sonra doğru <strong className="text-violet-300">görevi</strong> tıkla.</span>
        <span className="font-mono text-slate-300">{solved.length}/{PC_PAIRS.length}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        <div className="space-y-2">
          {PC_PAIRS.map((p, i) => {
            const s = solved.includes(i);
            const active = sel === i;
            return (
              <button key={i} onClick={() => pickPart(i)} disabled={s} className="w-full rounded-lg border px-3 py-2.5 text-left text-sm font-semibold transition" style={{ borderColor: s ? '#34d39955' : active ? CYAN : 'rgba(255,255,255,0.1)', background: s ? 'rgba(52,211,153,0.12)' : active ? 'rgba(34,211,238,0.14)' : 'rgba(255,255,255,0.03)', color: s ? '#6ee7b7' : '#e2e8f0', opacity: s ? 0.7 : 1 }}>
                {p.part} {s && '✓'}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {JOB_ORDER.map((partIdx) => {
            const s = solved.includes(partIdx);
            const isWrong = wrong === partIdx;
            return (
              <button key={partIdx} onClick={() => pickJob(partIdx)} disabled={s} className="w-full rounded-lg border px-3 py-2.5 text-left text-xs leading-snug transition" style={{ borderColor: s ? '#34d39955' : isWrong ? '#ef4444' : 'rgba(255,255,255,0.1)', background: s ? 'rgba(52,211,153,0.12)' : isWrong ? 'rgba(239,68,68,0.14)' : 'rgba(255,255,255,0.03)', color: s ? '#6ee7b7' : '#cbd5e1' }}>
                {PC_PAIRS[partIdx].job} {s && '✓'}
              </button>
            );
          })}
        </div>
      </div>
      {done && <p className="mt-4 text-center text-sm font-bold text-emerald-300">🎉 Tebrikler! Bilgisayarın tüm parçalarını doğru eşleştirdin.</p>}
    </div>
  );
}
