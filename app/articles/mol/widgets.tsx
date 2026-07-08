'use client';

// "Kimyada Mol Kavramı" makalesine ÖZEL interaktifler + arka plan (tanecik alanı) + veri.
// Genel şablon: @/app/components/article/ArticleBlocks
import { useEffect, useRef, useState } from 'react';

export { refs } from './refs';

const AMBER = '#f59e0b';
const NA = 6.022e23;
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* sayı biçimleme (deterministik → hydration güvenli; Türkçe ondalık virgül) */
function sup(n: number | string) {
  const map: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  return String(n).split('').map((c) => map[c] ?? c).join('');
}
function sci(n: number, d = 2) {
  if (!isFinite(n) || n === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(n)));
  const m = n / Math.pow(10, e);
  return m.toFixed(d).replace('.', ',') + '×10' + sup(e);
}
function numTr(n: number) {
  if (!isFinite(n)) return '—';
  if (n !== 0 && (Math.abs(n) >= 100000 || Math.abs(n) < 0.001)) return sci(n, 2);
  const r = Math.abs(n) >= 100 ? Math.round(n) : Number(n.toPrecision(4));
  return String(r).replace('.', ',');
}

/* ════════════ ARKA PLAN: sayılamayacak kadar çok tanecik ════════════ */

export function MoleculeField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const reduce = reduced();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0, h = 0, raf = 0, t = 0;
    type P = { x: number; y: number; vx: number; vy: number; r: number; hue: number };
    let ps: P[] = [];
    const count = () => Math.min(110, Math.max(40, Math.floor((w * h) / 15000)));
    const init = () => { ps = Array.from({ length: count() }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: 0.7 + Math.random() * 1.4, hue: 28 + Math.random() * 22 })); };
    const resize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); init(); };
    const draw = () => {
      t += 0.016; ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y, d2 = dx * dx + dy * dy;
          if (d2 < 8000) { ctx.strokeStyle = 'rgba(245,158,11,' + (0.09 * (1 - d2 / 8000)) + ')'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y); ctx.stroke(); }
        }
      }
      for (const p of ps) {
        p.x += p.vx + Math.sin(t * 0.4 + p.y * 0.01) * 0.06; p.y += p.vy;
        if (p.x < -8) p.x = w + 8; else if (p.x > w + 8) p.x = -8; if (p.y < -8) p.y = h + 8; else if (p.y > h + 8) p.y = -8;
        ctx.fillStyle = 'hsla(' + p.hue + ',90%,62%,0.6)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    resize(); window.addEventListener('resize', resize);
    if (reduce) draw(); else raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0" style={{ zIndex: 1, opacity: 0.5 }} />;
}

/* ════════════ İNTERAKTİF 1: mol hesaplayıcı (kütle ↔ mol ↔ tanecik) ════════════ */

const SUBS: { name: string; formula: string; M: number; gas: boolean }[] = [
  { name: 'Su', formula: 'H₂O', M: 18.02, gas: false },
  { name: 'Karbondioksit', formula: 'CO₂', M: 44.01, gas: true },
  { name: 'Oksijen', formula: 'O₂', M: 32.0, gas: true },
  { name: 'Tuz', formula: 'NaCl', M: 58.44, gas: false },
  { name: 'Glikoz', formula: 'C₆H₁₂O₆', M: 180.16, gas: false },
  { name: 'Altın', formula: 'Au', M: 196.97, gas: false },
  { name: 'Hidrojen', formula: 'H₂', M: 2.02, gas: true },
  { name: 'Karbon', formula: 'C', M: 12.01, gas: false },
];
export function MolCalculator() {
  const [si, setSi] = useState(0);
  const [grams, setGrams] = useState(18);
  const s = SUBS[si];
  const mol = grams / s.M;
  const particles = mol * NA;
  const vol = mol * 22.4;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {SUBS.map((x, i) => (
          <button key={x.formula} onClick={() => setSi(i)} className="rounded-full px-3 py-1.5 text-xs font-semibold transition" style={si === i ? { background: AMBER, color: '#1a1206' } : { background: 'rgba(255,255,255,0.05)', color: '#cbd5e1' }}>{x.name} <span className="opacity-70">{x.formula}</span></button>
        ))}
      </div>
      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="mb-1 flex items-baseline justify-between text-sm">
          <span className="text-slate-300">Kütle</span>
          <span className="font-mono text-amber-300">{numTr(grams)} g</span>
        </div>
        <input type="range" min={0} max={500} step={0.5} value={grams} onChange={(e) => setGrams(+e.target.value)} className="w-full" style={{ accentColor: AMBER }} aria-label="Kütle (gram)" />
        <div className="mt-1 text-center text-xs text-slate-500">Molar kütle (M) = <span className="font-mono text-slate-300">{numTr(s.M)} g/mol</span></div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-400/25 bg-amber-400/5 p-4 text-center">
          <div className="text-xs text-slate-500">Mol sayısı (n = m ÷ M)</div>
          <div className="mt-1 font-mono text-2xl font-black text-amber-300">{numTr(mol)}</div>
          <div className="text-xs text-slate-500">mol</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
          <div className="text-xs text-slate-500">Tanecik (N = n × Nₐ)</div>
          <div className="mt-1 font-mono text-lg font-black text-white">{sci(particles, 2)}</div>
          <div className="text-xs text-slate-500">{s.gas ? 'molekül' : (s.formula.length <= 2 ? 'atom' : 'molekül')}</div>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ borderColor: s.gas ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)', opacity: s.gas ? 1 : 0.5 }}>
          <div className="text-xs text-slate-500">Gaz hacmi (N.K.)</div>
          <div className="mt-1 font-mono text-2xl font-black text-amber-200">{s.gas ? numTr(vol) : '—'}</div>
          <div className="text-xs text-slate-500">{s.gas ? 'litre (0°C, 1 atm)' : 'sadece gazlar'}</div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">Maddeyi seç, kütleyi kaydır. Mola <em className="not-italic text-amber-300">giderken böl</em>, moldan <em className="not-italic text-amber-300">çıkarken çarp</em>.</p>
    </div>
  );
}

/* ════════════ İNTERAKTİF 2: merkez-mol dönüşüm haritası ════════════ */

type NodeId = 'kutle' | 'tanecik' | 'gaz' | 'derisim';
const MAP_NODES: Record<NodeId, { label: string; sub: string; x: number; y: number; toMol: string; fromMol: string; factor: string }> = {
  kutle: { label: 'KÜTLE', sub: 'm (gram)', x: 60, y: 55, toMol: 'n = m ÷ M', fromMol: 'm = n × M', factor: 'molar kütle (M)' },
  tanecik: { label: 'TANECİK', sub: 'N (atom/molekül)', x: 340, y: 55, toMol: 'n = N ÷ Nₐ', fromMol: 'N = n × Nₐ', factor: 'Avogadro sayısı (Nₐ)' },
  gaz: { label: 'GAZ HACMİ', sub: 'V (litre)', x: 60, y: 205, toMol: 'n = V ÷ 22,4', fromMol: 'V = n × 22,4 L', factor: '22,4 L (N.K.)' },
  derisim: { label: 'DERİŞİM', sub: 'C (mol/L)', x: 340, y: 205, toMol: 'n = C × V₍çöz₎', fromMol: 'C = n ÷ V₍çöz₎', factor: 'çözelti hacmi' },
};
const CENTER = { x: 200, y: 130 };
export function ConversionMap() {
  const [sel, setSel] = useState<NodeId | null>(null);
  const ids = Object.keys(MAP_NODES) as NodeId[];
  const n = sel ? MAP_NODES[sel] : null;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <svg viewBox="0 0 400 260" className="w-full" style={{ maxHeight: 300 }} role="img" aria-label="Mol dönüşüm haritası">
        {ids.map((id) => {
          const nd = MAP_NODES[id]; const on = sel === id;
          return <line key={'l' + id} x1={CENTER.x} y1={CENTER.y} x2={nd.x} y2={nd.y} stroke={on ? AMBER : 'rgba(255,255,255,0.18)'} strokeWidth={on ? 3 : 1.5} />;
        })}
        {ids.map((id) => {
          const nd = MAP_NODES[id]; const on = sel === id;
          return (
            <g key={id} onClick={() => setSel(on ? null : id)} style={{ cursor: 'pointer' }}>
              <rect x={nd.x - 56} y={nd.y - 20} width={112} height={40} rx={8} fill={on ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.05)'} stroke={on ? AMBER : 'rgba(255,255,255,0.15)'} strokeWidth={1.5} />
              <text x={nd.x} y={nd.y - 2} textAnchor="middle" fontSize="12" fontWeight="700" fill={on ? '#fcd34d' : '#e2e8f0'}>{nd.label}</text>
              <text x={nd.x} y={nd.y + 12} textAnchor="middle" fontSize="8" fill="#94a3b8">{nd.sub}</text>
            </g>
          );
        })}
        <circle cx={CENTER.x} cy={CENTER.y} r={34} fill={AMBER} />
        <text x={CENTER.x} y={CENTER.y - 2} textAnchor="middle" fontSize="15" fontWeight="900" fill="#1a1206">MOL</text>
        <text x={CENTER.x} y={CENTER.y + 13} textAnchor="middle" fontSize="9" fontWeight="700" fill="#5a3f10">n</text>
      </svg>
      <div className="mt-2 min-h-[4.5rem] rounded-xl border border-white/10 bg-black/20 p-4 text-center">
        {n ? (
          <>
            <div className="text-sm font-bold text-amber-300">{n.label} ↔ MOL</div>
            <div className="mt-1 text-xs text-slate-500">bağlayan çarpan: {n.factor}</div>
            <div className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-1 font-mono text-sm text-slate-200">
              <span>→ mola: <span className="text-amber-200">{n.toMol}</span></span>
              <span>moldan →: <span className="text-amber-200">{n.fromMol}</span></span>
            </div>
          </>
        ) : <p className="m-0 text-sm text-slate-400">Bir kutuya tıkla: onu <strong className="text-amber-300">mole</strong> (ve molden geri) çeviren formülü gör. Mol her zaman merkezdedir.</p>}
      </div>
    </div>
  );
}

/* ════════════ İNTERAKTİF 3: Avogadro ölçeği (ne kadar büyük?) ════════════ */

const SCALE_ROWS: { label: string; n: number; note: string }[] = [
  { label: 'Samanyolu’ndaki yıldızlar', n: 1e11, note: '~100 milyar' },
  { label: 'İnsan vücudundaki hücreler', n: 3.7e13, note: '~37 trilyon' },
  { label: 'Evrenin yaşı (saniye)', n: 4.35e17, note: '~13,8 milyar yıl' },
  { label: 'Dünyadaki tüm kum taneleri', n: 7.5e18, note: 'plajlar + çöller' },
  { label: 'AVOGADRO SAYISI (1 mol)', n: NA, note: 'bir yudum suda!' },
];
export function AvogadroScale() {
  const max = Math.log10(NA);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="space-y-3">
        {SCALE_ROWS.map((r, i) => {
          const hot = i === SCALE_ROWS.length - 1;
          const pct = Math.max(6, (Math.log10(r.n) / max) * 100);
          return (
            <div key={r.label}>
              <div className="mb-1 flex items-baseline justify-between text-xs">
                <span className={hot ? 'font-bold text-amber-300' : 'text-slate-300'}>{r.label}</span>
                <span className="font-mono text-slate-400">{sci(r.n, 1)} <span className="text-slate-600">· {r.note}</span></span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full" style={{ width: pct + '%', background: hot ? 'linear-gradient(90deg,#f59e0b,#fcd34d)' : 'rgba(148,163,184,0.5)' }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">Çubuklar <strong className="text-amber-300">logaritmik</strong> ölçekte. Avogadro sayısı, dünyadaki tüm kum tanelerinin bile ~80.000 katıdır — ama bir yudum suya sığar.</p>
    </div>
  );
}

/* ════════════ İNTERAKTİF 4: periyodik tablodan molar kütle ════════════ */

const ELEMENTS: { sym: string; name: string; M: number }[] = [
  { sym: 'H', name: 'Hidrojen', M: 1.008 }, { sym: 'C', name: 'Karbon', M: 12.01 }, { sym: 'N', name: 'Azot', M: 14.01 }, { sym: 'O', name: 'Oksijen', M: 16.0 },
  { sym: 'Na', name: 'Sodyum', M: 22.99 }, { sym: 'Mg', name: 'Magnezyum', M: 24.31 }, { sym: 'S', name: 'Kükürt', M: 32.06 }, { sym: 'Cl', name: 'Klor', M: 35.45 },
  { sym: 'Ca', name: 'Kalsiyum', M: 40.08 }, { sym: 'Fe', name: 'Demir', M: 55.85 }, { sym: 'Cu', name: 'Bakır', M: 63.55 }, { sym: 'Au', name: 'Altın', M: 196.97 },
];
export function PeriodicPicker() {
  const [i, setI] = useState(1);
  const e = ELEMENTS[i];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-6">
        {ELEMENTS.map((el, k) => (
          <button key={el.sym} onClick={() => setI(k)} className="rounded-lg border py-2 text-center transition" style={i === k ? { borderColor: AMBER, background: 'rgba(245,158,11,0.15)' } : { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-base font-black" style={{ color: i === k ? '#fcd34d' : '#e2e8f0' }}>{el.sym}</div>
            <div className="font-mono text-[0.55rem] text-slate-500">{el.M}</div>
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/5 p-4 text-center">
        <div className="text-sm text-slate-300"><strong className="text-amber-300">{e.name} ({e.sym})</strong></div>
        <div className="mt-1 font-mono text-lg text-white">bağıl atom kütlesi = {numTr(e.M)}</div>
        <div className="mt-1 text-sm text-slate-300">→ 1 mol {e.sym} = <span className="font-mono text-amber-200">{numTr(e.M)} gram</span></div>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">Periyodik tablodaki sayı, aynı zamanda o elementin <strong className="text-amber-300">gram cinsinden molar kütlesidir</strong>. Tesadüf değil — birimler böyle tanımlanmıştır.</p>
    </div>
  );
}

/* ════════════ VERİ: zaman çizelgesi · günlük kullanım · terimler · SSS · quiz ════════════ */

export const timeline = [
  { year: '1811', title: 'Avogadro hipotezi', text: "Amedeo Avogadro: aynı sıcaklık ve basınçta, eşit hacimdeki gazlar eşit sayıda parçacık içerir. Neredeyse 50 yıl göz ardı edildi." },
  { year: '1856', title: 'Avogadro ölür', text: "Fikri henüz kabul görmeden hayatını kaybeder — kendi adını taşıyan sayıyı hiç görmedi." },
  { year: '1860', title: 'Karlsruhe · Cannizzaro', text: "Stanislao Cannizzaro, Avogadro'nun fikrini yeniden gündeme getirir; atom kütlelerinin tutarlı hesabının önü açılır." },
  { year: '1908', title: 'Perrin & Brown hareketi', text: "Jean Perrin, suda asılı parçacıkların titreşiminden Avogadro sayısını ölçer; atomların gerçekliğini kanıtlar." },
  { year: '1926', title: 'Perrin Nobel', text: "Perrin bu çalışmayla Nobel Fizik Ödülü alır. Sayıya 'Avogadro' adını veren de odur — onun onuruna." },
  { year: '2019', title: 'SI yeniden tanımı', text: "Mol artık tam olarak 6,02214076 × 10²³ olarak TANIMLANIR; deneyle ölçülen değil, sabit bir sayı. Kilogramın tanımı da değişir." },
];

export const everyday = [
  { icon: '🚗', title: 'Hava yastığı', text: "Sodyum azür, çarpışmada patlayıp azot gazına döner. Mühendisler yastığı ~30 ms'de şişirecek gaz için tam kaç mol gerektiğini hesaplar; bir mol hatası ölümcül olurdu." },
  { icon: '🩸', title: 'Kan tahlili', text: "Sodyum, potasyum gibi değerler 'mmol/L' (milimol) cinsinden yazılır — vücudundaki iyon derişimi mol diliyle ölçülür." },
  { icon: '🍰', title: 'Mutfak', text: "Kabartma tozu + asit (limon, yoğurt) tepkimesi hamuru kabartan gazı üretir. Tarifin 'tutması', farkında olmadan doğru mol oranını yakalamandır." },
  { icon: '💧', title: 'Vücudun', text: "~70 kg bir insanın içindeki su kabaca 2.300 mol eder — yani şu an bedeninde 1,4 × 10²⁷ dolayında su molekülü dolaşıyor." },
  { icon: '🌍', title: 'Karbon ayak izi', text: "Bir litre benzinin yanmasıyla çıkan karbondioksitin kilograma çevrilmesi tümüyle mol hesabıdır." },
  { icon: '💊', title: 'İlaç dozu', text: "Etken maddenin doğru etkiyi vermesi, kandaki molar derişimine bağlıdır — az molsa etkisiz, çok molsa zehirli olabilir." },
];

export const terms = [
  { icon: '🔢', title: 'Bağıl atom kütlesi', text: "Periyodik tablodaki o sayı; bir atomun kütlesi karbon-12'ye kıyasla ifade edilir. Birimi 'atomik kütle birimi (akb)'; 1 akb = C-12 atomunun 1/12'si." },
  { icon: '⚖️', title: 'Molekül / formül kütlesi', text: "Bir moleküldeki atom kütlelerinin toplamı. Su (H₂O): 2×1 + 16 = 18 akb → 18 g/mol. Moleküllü bileşiklerde 'molekül', iyonik olanlarda (NaCl) 'formül' kütlesi." },
  { icon: '🎈', title: 'Molar hacim (Avogadro yasası)', text: "Aynı şart ve hacimdeki gazlar eşit sayıda molekül içerir. Normal Koşullar'da (0°C, 1 atm) her ideal gazın 1 molü 22,4 litre yer kaplar — molekülü ne olursa olsun." },
  { icon: '🧪', title: 'Derişim / Molarite', text: "1 litre çözeltide kaç mol madde çözünmüş? Birimi mol/L (kısaca M). '1 M tuzlu su' = her litresinde 1 mol tuz. İlaç dozu, kan şekeri, deniz tuzluluğu — hepsi birer derişim." },
];

export const faqs = [
  { q: 'Mol nedir kısaca?', a: "6,022 × 10²³ tanelik bir sayma birimidir; kimyanın 'düzinesi'. Atom, molekül, iyon — istediğini sayabilirsin." },
  { q: '1 mol kaç gramdır?', a: "Maddeye göre değişir: molar kütlesi kadar gram gelir. 1 mol karbon 12 g, 1 mol su 18 g, 1 mol altın ~197 g." },
  { q: 'Avogadro sayısı nedir?', a: "Bir moldeki tanecik sayısı: 6,022 × 10²³. 2019'dan beri tam olarak 6,02214076 × 10²³ olarak tanımlıdır." },
  { q: 'Mol ile molekül arasındaki fark nedir?', a: "Molekül tek bir parçacıktır; mol ise 6,022 × 10²³ parçacıklık bir yığındır. Mol illa molekül saymaz — atom, iyon, hatta elektron da sayabilir." },
  { q: "Normal Koşullar'da 1 mol gaz kaç litredir?", a: "İdeal bir gaz için 22,4 litre (0°C, 1 atm). Bu kural sadece gazlar ve sadece N.K. için geçerlidir." },
  { q: 'Molar kütle nasıl bulunur?', a: "Bileşikteki atomların bağıl atom kütlelerini toplayarak. Su (H₂O) = 2×1 + 16 = 18 g/mol." },
];

export const quizQs = [
  { text: "Mol temelde nedir?", opts: ['Bir kütle birimi (gram gibi)', 'Bir hacim birimi (litre gibi)', 'Bir sayma birimi — 6,022 × 10²³ tane', 'Bir sıcaklık birimi'], a: 2, exp: "Mol, 'düzine' gibi bir sayma birimidir; sadece temsil ettiği sayı akıl almaz büyüktür." },
  { text: "36 gram su (M = 18 g/mol) kaç moldür?", opts: ['0,5 mol', '2 mol', '18 mol', '36 mol'], a: 1, exp: "n = m ÷ M = 36 ÷ 18 = 2 mol. Sonra 2 × 6,022×10²³ = 1,2×10²⁴ molekül." },
  { text: "1 mol hidrojen ile 1 mol altının tanecik sayısı için hangisi doğru?", opts: ['Altında daha çok tane var', 'Hidrojende daha çok tane var', 'İkisinde de aynı sayıda tane var (6,022×10²³), kütleleri farklı', 'Karşılaştırılamaz'], a: 2, exp: "Sayı hep aynıdır; altın atomu daha ağır olduğu için kütlesi (197 g) hidrojeninkinden (1 g) fazladır." },
  { text: "Periyodik tablodaki 'bağıl atom kütlesi' sayısı ne işe yarar?", opts: ['Atomun boyunu verir', 'Aynı zamanda o elementin gram cinsinden molar kütlesidir', 'Elektron sayısını verir', 'Kaynama noktasıdır'], a: 1, exp: "Karbon 12 → 1 mol karbon 12 gram. Birimler tam da bunu sağlayacak şekilde tanımlanmıştır." },
  { text: "Normal Koşullar'da 1 mol ideal gaz kaç litre yer kaplar?", opts: ['1 litre', '18 litre', '22,4 litre', 'Gaza göre değişir'], a: 2, exp: "Avogadro yasası: molekülü ne olursa olsun, N.K.'da 1 mol gaz = 22,4 L." },
  { text: "Tepkimelerdeki mol oranı matematiğinin adı nedir?", opts: ['Termodinamik', 'Stokiyometri', 'Kinetik', 'Elektroliz'], a: 1, exp: "2H₂ + O₂ → 2H₂O denklemi 2:1:2 mol oranını verir; tarif matematiği gibi." },
];
