'use client';

// Isaac Newton makalesine ÖZEL interaktif widget'lar + içerik verisi.
// Genel şablon: @/app/components/article/ArticleBlocks
import { useState } from 'react';
import type { BibItem } from '@/app/components/ArticleBibliography';

const AMBER = '#f59e0b';

/* ════════════ VERİ ════════════ */

export const miracleYears = [
  { icon: '∫', title: 'Kalkülüs', text: "Türev ve integrali (“akışlar yöntemi”) icat etti — anlık değişim ve birikimi hesaplamanın dili." },
  { icon: '🌈', title: 'Işığın ayrışması', text: "Prizmayla beyaz ışığın renklere ayrıldığını, sonra yeniden beyaza birleştiğini gösterdi." },
  { icon: '🍎', title: 'Kütleçekimin tohumu', text: "Elmayı düşüren kuvvetle Ay'ı yörüngede tutan kuvvetin aynı olabileceğini düşünmeye başladı." },
];

export const contemporaries = [
  { icon: '🔭', title: 'Galileo Galilei', text: "Newton'ın doğduğu yıl (1642) öldü. Düşen cisimler, eylemsizlik ve teleskopla bilimi deneye dayandırdı." },
  { icon: '🪐', title: 'Johannes Kepler', text: "Gezegenlerin elips çizdiğini gösterdi. Newton daha sonra bunun NEDENİNİ kütleçekimle açıkladı." },
  { icon: '📐', title: 'René Descartes', text: "Analitik geometriyi kurdu; evreni bir makine gibi gören mekanik felsefeyi yaydı." },
  { icon: '⏱️', title: 'Christiaan Huygens', text: "Sarkaçlı saati icat etti, ışığın bir dalga olduğunu savundu — Newton'la görüş ayrılığı." },
  { icon: '🔬', title: 'Robert Hooke', text: "Hücreyi adlandırdı, yay yasasını buldu ve Newton'ın hayat boyu süren rakibi oldu." },
  { icon: '➗', title: 'Gottfried Leibniz', text: "Newton'dan bağımsız kalkülüsü icat etti; aralarında tarihin en ünlü öncelik kavgası çıktı." },
];

export const inventions = [
  { icon: '∫', title: 'Kalkülüs', text: "Türev ve integral. Bugün mühendislikten ekonomiye her yerde — modern dünyanın matematik dili." },
  { icon: '🔭', title: 'Yansıtmalı teleskop', text: "Aynalı tasarım renk bozulmasını yok eder; bugünkü büyük teleskopların çoğu hâlâ bu ilkeye dayanır." },
  { icon: '🌡️', title: 'Soğuma yasası', text: "Soğuma hızı, cisim ile ortam arasındaki sıcaklık farkıyla orantılı. Adli tıpta ölüm saati tahmininde kullanılır." },
  { icon: '🎯', title: 'Newton yöntemi', text: "Bir denklemin kökünü adım adım yaklaşarak bulur. Bugün optimizasyon ve hesaplama yazılımlarının kalbinde." },
  { icon: '🔢', title: 'Binom teoremi', text: "Cebirde genelleştirilmiş binom açılımını geliştirdi." },
];

export const funFacts = [
  { icon: '⚗️', title: 'Simyaya saplantılıydı', text: "Hayatının çok büyük kısmını metalleri altına çevirmeye adadı. Keynes onu “akıl çağının ilki değil, son büyücüsü” diye andı." },
  { icon: '⛪', title: 'Gizli bir “sapkın”', text: "Kutsal Üçleme'yi reddediyordu; bu görüşü ağır bir sapkınlık sayıldığı için ölene dek sakladı." },
  { icon: '📅', title: 'Kıyameti hesapladı', text: "Kutsal kitap hesaplarına göre dünyanın sonunun 2060'tan önce gelmeyeceğini yazdı." },
  { icon: '🍎', title: 'Elma gerçek (ama abartılı)', text: "Kafasına düşmedi. Bahçede bir elmanın düşüşünü görüp “neden hep dik aşağı?” diye düşünmesi onu kütleçekime götürdü." },
  { icon: '👁️', title: 'Kendi gözünü tehlikeye attı', text: "Rengi anlamak için göz çukuruna tığ soktu; görüntü artıkları için doğrudan Güneş'e bakıp gözünü neredeyse kör etti." },
  { icon: '⚔️', title: 'Amansız bir rakipti', text: "Leibniz kavgasında, kararı verecek Kraliyet Cemiyeti komitesini başkan olarak gizlice kendi lehine düzenledi." },
];

export const lawStatus = [
  { idea: 'Üç hareket yasası (F = m·a)', status: 'using', why: "Arabalar, köprüler, makineler, balistik — neredeyse tüm yeryüzü mühendisliği. NASA Ay'a Newton fiziğiyle gitti." },
  { idea: 'Kalkülüs', status: 'using', why: "Bilim, mühendislik, ekonomi, bilgisayar — modern dünyanın temel matematik dili." },
  { idea: 'Yansıtmalı teleskop', status: 'using', why: "Bugünkü büyük teleskopların çoğu bu tasarıma dayanır." },
  { idea: 'Soğuma yasası & Newton yöntemi', status: 'using', why: "Mühendislik, adli tıp (ölüm saati) ve bilgisayar hesaplamalarının içinde." },
  { idea: 'Evrensel kütleçekim', status: 'mostly', why: "Uydular ve yörünge hesapları için yeterince doğru ve çok daha basit; yalnızca aşırı uçlarda görelilik gerekir." },
  { idea: 'Mutlak (değişmez) uzay ve zaman', status: 'superseded', why: "Einstein: uzay ve zaman gözlemciye göre değişir (görelilik)." },
  { idea: 'Işığın yalnızca parçacık olduğu', status: 'superseded', why: "Işık hem dalga hem parçacıktır (dalga-parçacık ikiliği). Newton kısmen haklı ama eksikti." },
  { idea: 'Yüksek hız mekaniği', status: 'superseded', why: "Işık hızına yaklaşınca Özel Görelilik (1905) devralır; zaman yavaşlar, kütle artar." },
  { idea: 'Çok güçlü kütleçekimde hassas hesap', status: 'superseded', why: "Genel Görelilik (1915): Merkür'ün yörünge kayması, kara delikler ve GPS düzeltmesi." },
  { idea: 'Atom-altı dünyadaki davranış', status: 'superseded', why: "Kuantum mekaniği: “kesinlik” yerini olasılığa ve belirsizliğe bırakır." },
];

export const timeline = [
  { year: '1642/43', title: 'Doğum', text: "Woolsthorpe'da, babası ölmüşken, bir litrelik kaba sığacak kadar küçük, erken doğmuş bir bebek olarak dünyaya geldi." },
  { year: '1661', title: 'Trinity College', text: "Cambridge'e parasız, diğer öğrencilere hizmet eden bir “subsizar” olarak girdi." },
  { year: '1665–66', title: 'Mucize Yıllar', text: "Veba Cambridge'i kapatınca köyüne döndü; 18 ayda kalkülüsü, ışığın ayrışmasını ve kütleçekimin tohumunu buldu. 23 yaşındaydı." },
  { year: '1669', title: 'Lucas Kürsüsü', text: "Cambridge'de Lucas Matematik Kürsüsü profesörü oldu (yüzyıllar sonra Hawking de bu kürsüyü tutacaktı)." },
  { year: '1687', title: 'Principia', text: "Halley'in desteğiyle başyapıtını yayımladı: hareket yasaları + evrensel kütleçekim tek çatı altında. Bilim tarihinin en önemli eseri." },
  { year: '1703', title: 'Royal Society', text: "Kraliyet Cemiyeti'nin başkanı oldu." },
  { year: '1705', title: 'Şövalyelik', text: "Kraliçe Anne tarafından şövalye ilan edildi (çoğunlukla devlet hizmetleri sayesinde)." },
  { year: '1720', title: 'Güney Denizi Balonu', text: "Tepe noktasında tekrar girip balon patlayınca ~20.000 sterlin kaybetti — bugünün parasıyla milyonlar." },
  { year: '1727', title: 'Ölüm', text: "Londra'da öldü; büyük bir devlet töreniyle Westminster Abbey'e gömülen ilk bilim insanı oldu." },
];

export const quizQs = [
  { text: "1665–66 “Mucize Yılları”nda Newton'ın YAPMADIĞI şey hangisidir?", opts: ['Kalkülüsü icat etmek', 'Beyaz ışığın renklere ayrıldığını keşfetmek', 'Kütleçekimin ilk adımlarını atmak', 'Buharlı makineyi icat etmek'], a: 3, exp: "Buharlı makine Newton'a ait değildir. Diğer üçünü o olağanüstü 18 ayda başardı." },
  { text: "F = m·a denklemi neyi söyler?", opts: ['Kuvvet = kütle × ivme', 'Kütle = kuvvet × ivme', 'İvme = kuvvet × kütle', 'Kuvvet = kütle ÷ ivme'], a: 0, exp: "Bir şeyi ne kadar sert itersen o kadar hızlanır; ama ne kadar ağırsa o kadar zor hızlanır." },
  { text: "Evrensel kütleçekimde iki cisim arası mesafe 2 katına çıkarsa çekim kuvveti ne olur?", opts: ['2 katına çıkar', 'Yarıya iner', 'Dörtte bire iner', 'Değişmez'], a: 2, exp: "Kuvvet mesafenin KARESİYLE azalır (ters-kare): 2× mesafe → 1/4 kuvvet." },
  { text: "Newton servetini hangi olayda kaybetti?", opts: ['Büyük Londra Yangını', 'Güney Denizi Balonu', 'Kalpazanlık davası', 'Veba salgını'], a: 1, exp: "Balon patlamadan tepe noktasında geri girdi (bir tür FOMO) ve büyük kayıp yaşadı." },
  { text: "Bugün Newton'ın ARTIK tek başına kullanmadığımız fikri hangisidir?", opts: ['F = m·a', 'Kalkülüs', 'Mutlak (değişmez) uzay ve zaman', 'Yansıtmalı teleskop'], a: 2, exp: "Einstein, uzay ve zamanın gözlemciye göre değiştiğini (göreli olduğunu) gösterdi." },
  { text: "Görelilik ve kuantum fiziği, Newton'ı...", opts: ['Tamamen çürüttü', "Çürütmez; kapsar (düşük hızda Newton'a indirgenir)", 'Hiç etkilemedi', 'Yalnızca matematikte değiştirdi'], a: 1, exp: "Hız düşük, kütleçekim zayıfken Einstein'ın denklemleri tam tamına Newton'a dönüşür." },
];

export const refs: BibItem[] = [
  { title: "Philosophiæ Naturalis Principia Mathematica", authors: "Isaac Newton", year: "1687", source: "Londra (Royal Society)" },
  { title: "Never at Rest: A Biography of Isaac Newton", authors: "Richard S. Westfall", year: "1980", source: "Cambridge University Press" },
  { title: "Newton, the Man", authors: "John Maynard Keynes", year: "1946", source: "Royal Society Newton Tercentenary" },
  { title: "Memoirs of Sir Isaac Newton's Life (elma hikâyesi)", authors: "William Stukeley", year: "1752", source: "Royal Society MS/142" },
  { title: "Isaac Newton", source: "Stanford Encyclopedia of Philosophy", url: "https://plato.stanford.edu/entries/newton/" },
  { title: "Isaac Newton", source: "Wikipedia", url: "https://tr.wikipedia.org/wiki/Isaac_Newton" },
  { title: "South Sea Bubble (1720)", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/South_Sea_Bubble" },
];

/* ════════════ İNTERAKTİF 1: F = m·a hesaplayıcı ════════════ */

const F_PRESETS = [
  { label: 'Market arabası', m: 20, a: 2 },
  { label: 'Araba', m: 1200, a: 2 },
  { label: 'Kamyon', m: 5000, a: 1 },
];

export function ForceCalc() {
  const [m, setM] = useState(1200);
  const [a, setA] = useState(2);
  const F = m * a;
  const barW = Math.min(100, (F / 50000) * 100);
  const boxW = 24 + Math.min(70, Math.log10(m) * 26);
  const arrow = 20 + Math.min(120, (F / 50000) * 120);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col justify-center gap-5">
          <label className="block">
            <span className="flex justify-between text-sm text-slate-300"><span>Kütle (m)</span><span className="font-mono text-amber-300">{m} kg</span></span>
            <input type="range" min={10} max={5000} value={m} onChange={e => setM(+e.target.value)} className="mt-2 w-full accent-amber-500" aria-label="Kütle" />
          </label>
          <label className="block">
            <span className="flex justify-between text-sm text-slate-300"><span>İvme (a)</span><span className="font-mono text-amber-300">{a} m/s²</span></span>
            <input type="range" min={0} max={10} step={0.1} value={a} onChange={e => setA(+e.target.value)} className="mt-2 w-full accent-amber-500" aria-label="İvme" />
          </label>
          <div className="flex flex-wrap gap-2">
            {F_PRESETS.map(p => <button key={p.label} onClick={() => { setM(p.m); setA(p.a); }} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:bg-white/10">{p.label}</button>)}
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-amber-400/20 bg-amber-400/5 p-5 text-center">
          <div className="font-mono text-sm text-slate-400">F = m × a = {m} × {a}</div>
          <div className="my-1 font-mono text-4xl font-black text-amber-300">{F.toLocaleString('tr-TR')} N</div>
          <svg viewBox="0 0 240 80" className="mt-2 w-full">
            <line x1="0" y1="64" x2="240" y2="64" stroke="#475569" strokeWidth="1.5" />
            <rect x="30" y={64 - boxW * 0.6} width={boxW} height={boxW * 0.6} rx="3" fill="#334155" stroke="#94a3b8" />
            <line x1={30 + boxW} y1={64 - boxW * 0.3} x2={30 + boxW + arrow} y2={64 - boxW * 0.3} stroke={AMBER} strokeWidth="3" />
            <path d={`M${30 + boxW + arrow} ${64 - boxW * 0.3} l-8 -4 m8 4 l-8 4`} stroke={AMBER} strokeWidth="3" fill="none" />
            <text x={30 + boxW + arrow / 2} y={64 - boxW * 0.3 - 8} textAnchor="middle" fontSize="9" fill={AMBER}>kuvvet</text>
          </svg>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-400 transition-all duration-200" style={{ width: `${barW}%` }} /></div>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Ne kadar sert itersen (büyük a) o kadar çok kuvvet gerekir; cisim ağırlaştıkça (büyük m) aynı ivme için daha çok kuvvet ister.</p>
    </div>
  );
}

/* ════════════ İNTERAKTİF 2: Ters-kare kütleçekim ════════════ */

export function GravityCalc() {
  const [m1, setM1] = useState(5);
  const [m2, setM2] = useState(5);
  const [r, setR] = useState(3);
  const Frel = (m1 * m2) / (r * r);
  const barW = Math.min(100, (Frel / 25) * 100);
  const r1 = 8 + Math.sqrt(m1) * 6;
  const r2 = 8 + Math.sqrt(m2) * 6;
  const gap = 40 + r * 18;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="mb-4 overflow-hidden rounded-xl bg-black/30 ring-1 ring-white/5">
        <svg viewBox="0 0 360 120" className="w-full">
          <circle cx={70} cy="60" r={r1} fill="#fbbf24" />
          <circle cx={70 + gap} cy="60" r={r2} fill="#38bdf8" />
          <line x1={70 + r1} y1="60" x2={70 + gap - r2} y2="60" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
          <text x={(140 + gap) / 2} y="50" textAnchor="middle" fontSize="9" fill="#94a3b8">r</text>
          <text x={70} y={60 - r1 - 6} textAnchor="middle" fontSize="9" fill="#fbbf24">m₁</text>
          <text x={70 + gap} y={60 - r2 - 6} textAnchor="middle" fontSize="9" fill="#38bdf8">m₂</text>
        </svg>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[['Kütle m₁', m1, setM1, '#fbbf24'], ['Kütle m₂', m2, setM2, '#38bdf8'], ['Mesafe r', r, setR, '#a3a3a3']].map(([label, val, set, col], i) => (
          <label key={i} className="block">
            <span className="flex justify-between text-sm text-slate-300"><span>{label as string}</span><span className="font-mono" style={{ color: col as string }}>{val as number}</span></span>
            <input type="range" min={1} max={10} value={val as number} onChange={e => (set as (n: number) => void)(+e.target.value)} className="mt-2 w-full" style={{ accentColor: col as string }} aria-label={label as string} />
          </label>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-center">
        <div className="font-mono text-sm text-slate-400">F ∝ (m₁ × m₂) / r² = ({m1} × {m2}) / {r}²</div>
        <div className="my-1 font-mono text-3xl font-black text-amber-300">{Frel.toFixed(2)}<span className="text-base text-slate-400"> bağıl kuvvet</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-400 transition-all duration-200" style={{ width: `${barW}%` }} /></div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Mesafeyi (r) 2 katına çıkar → kuvvet dörtte bire iner. İşte Newton'ın <span className="text-amber-300">ters-kare</span> yasası: uzaklık arttıkça çekim hızla zayıflar.</p>
    </div>
  );
}

/* ════════════ İNTERAKTİF 3: Hangi yasalar hâlâ geçerli? ════════════ */

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  using: { label: 'Hâlâ kullanıyoruz', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  mostly: { label: 'Çoğunlukla', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  superseded: { label: 'Devri geçti', color: '#fb7185', bg: 'rgba(251,113,133,0.12)' },
};

export function LawStatus() {
  const [filter, setFilter] = useState<'all' | 'keep' | 'gone'>('all');
  const items = lawStatus.filter(l => filter === 'all' ? true : filter === 'keep' ? l.status !== 'superseded' : l.status === 'superseded');
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {([['all', 'Hepsi'], ['keep', 'Hâlâ kullanıyoruz'], ['gone', 'Devri geçti']] as const).map(([k, lbl]) => (
          <button key={k} onClick={() => setFilter(k)} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${filter === k ? 'bg-amber-400 text-amber-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}>{lbl}</button>
        ))}
      </div>
      <div className="space-y-2.5">
        {items.map((l, i) => {
          const s = STATUS_META[l.status];
          return (
            <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-white">{l.idea}</span>
                <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ color: s.color, background: s.bg }}>{s.label}</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">{l.why}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500">Newton'ın yasaları “yanlış” değil, <span className="text-amber-300">sınırlıdır</span>: günlük hız ve boyutlarda kusursuz çalışır.</p>
    </div>
  );
}
