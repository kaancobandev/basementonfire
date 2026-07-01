'use client';

// "Bilgisayar Nasıl Çalışır?" makalesine ÖZEL interaktif widget'lar + veri.
// Genel şablon: @/app/components/article/ArticleBlocks
import { useState } from 'react';

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
