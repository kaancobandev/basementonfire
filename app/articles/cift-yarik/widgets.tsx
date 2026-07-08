'use client';

// "Çift Yarık Deneyi" makalesine ÖZEL interaktif oyunlar + arka plan elektron alanı + veri.
// Genel şablon: @/app/components/article/ArticleBlocks
import { useEffect, useRef, useState } from 'react';

export { refs } from './refs';

const VIOLET = '#a855f7';
const CYAN = '#22d3ee';
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ════════════ ARKA PLAN: hareket eden elektron alanı (tüm sayfa) ════════════ */

export function ElectronField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = reduced();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0, h = 0, raf = 0, t = 0;
    type P = { x: number; y: number; vx: number; vy: number; r: number; hue: number; ph: number };
    let ps: P[] = [];
    const count = () => Math.min(80, Math.max(28, Math.floor((w * h) / 22000)));
    const init = () => {
      ps = Array.from({ length: count() }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: 0.8 + Math.random() * 1.8, hue: 255 + Math.random() * 65, ph: Math.random() * Math.PI * 2,
      }));
    };
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
    };
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      // atom bağı hissi: yakın elektronlar arası ince çizgiler
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 13000) {
            ctx.strokeStyle = `rgba(168,85,247,${0.12 * (1 - d2 / 13000)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(ps[i].x, ps[i].y); ctx.lineTo(ps[j].x, ps[j].y); ctx.stroke();
          }
        }
      }
      for (const p of ps) {
        p.x += p.vx + Math.sin(t * 0.5 + p.ph) * 0.14;
        p.y += p.vy + Math.cos(t * 0.4 + p.ph) * 0.1;
        if (p.x < -12) p.x = w + 12; else if (p.x > w + 12) p.x = -12;
        if (p.y < -12) p.y = h + 12; else if (p.y > h + 12) p.y = -12;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 7);
        g.addColorStop(0, `hsla(${p.hue},90%,72%,0.85)`);
        g.addColorStop(1, `hsla(${p.hue},90%,62%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `hsla(${p.hue},95%,88%,0.95)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener('resize', resize);
    if (reduce) draw(); else raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0" style={{ zIndex: 1, opacity: 0.55 }} />;
}

/* ════════════ OYUN 1: Çift yarık laboratuvarı (elektron birikimi) ════════════ */

type Mode = 'serbest' | 'dedektor' | 'silgi';
const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: 'serbest', label: 'Serbest', hint: 'Kimse bakmıyor: her elektron iki yarıktan da geçer ve kendisiyle girişim yapar.' },
  { id: 'dedektor', label: 'Dedektör açık 👁', hint: 'Hangi yarıktan geçtiği ölçülüyor: girişim kaybolur, iki bant belirir.' },
  { id: 'silgi', label: 'Kuantum silgi 🧽', hint: 'Ölçüldü ama bilgi silindi: girişim deseni geri döner!' },
];

// Ekran konumu s ∈ [-1,1] için olasılık yoğunluğu (moda göre).
function density(s: number, mode: Mode) {
  const env = Math.exp(-(s * s) / (0.5 * 0.5)); // zarf (tek yarık kırınımı)
  if (mode === 'dedektor') {
    const a = Math.exp(-((s - 0.32) ** 2) / (2 * 0.14 * 0.14));
    const b = Math.exp(-((s + 0.32) ** 2) / (2 * 0.14 * 0.14));
    return a + b;
  }
  // serbest & silgi: girişim şeritleri, zarf altında
  const fringe = Math.cos(Math.PI * 5.2 * s) ** 2;
  return fringe * env + 0.02;
}

export function DoubleSlitLab() {
  const cv = useRef<HTMLCanvasElement>(null);
  const hits = useRef<{ x: number; y: number }[]>([]);
  const cdf = useRef<number[]>([]);
  const auto = useRef<ReturnType<typeof setInterval> | null>(null);
  const [mode, setMode] = useState<Mode>('serbest');
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const modeRef = useRef<Mode>('serbest');

  const M = 500;
  const buildCdf = (m: Mode) => {
    const arr: number[] = [];
    let acc = 0;
    for (let i = 0; i < M; i++) {
      const s = (i / (M - 1)) * 2 - 1;
      acc += density(s, m);
      arr.push(acc);
    }
    cdf.current = arr;
  };
  const sample = () => {
    const arr = cdf.current;
    const total = arr[arr.length - 1];
    const r = Math.random() * total;
    let lo = 0, hi = M - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (arr[mid] < r) lo = mid + 1; else hi = mid; }
    return (lo / (M - 1)) * 2 - 1;
  };

  const geom = () => {
    const c = cv.current!;
    const w = c.clientWidth, h = c.clientHeight;
    return { w, h, gunX: w * 0.06, barX: w * 0.4, scrX: w * 0.9, midY: h / 2 };
  };
  const drawFrame = () => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const { w, h, gunX, barX, scrX, midY } = geom();
    ctx.clearRect(0, 0, w, h);
    // tabanca
    ctx.fillStyle = VIOLET;
    ctx.beginPath(); ctx.arc(gunX, midY, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '10px system-ui'; ctx.fillText('elektron', gunX - 6, midY - 14);
    // bariyer + iki yarık
    const slit = h * 0.12, gap = h * 0.055;
    ctx.fillStyle = 'rgba(148,163,184,0.5)';
    ctx.fillRect(barX - 3, 0, 6, midY - slit - gap);
    ctx.fillRect(barX - 3, midY - slit + gap, 6, 2 * slit - 2 * gap);
    ctx.fillRect(barX - 3, midY + slit - gap, 6, h - (midY + slit - gap));
    // dedektör göstergesi
    if (modeRef.current === 'dedektor') {
      ctx.fillStyle = CYAN;
      ctx.beginPath(); ctx.arc(barX + 12, midY - slit, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(barX + 12, midY + slit, 3, 0, Math.PI * 2); ctx.fill();
    }
    // ekran çizgisi
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.moveTo(scrX, 6); ctx.lineTo(scrX, h - 6); ctx.stroke();
    // birikmiş vuruşlar
    for (const p of hits.current) {
      ctx.fillStyle = 'rgba(216,180,254,0.5)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill();
    }
  };
  const plot = (n: number) => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const { h, scrX, midY } = geom();
    for (let k = 0; k < n; k++) {
      const s = sample();
      const y = midY + s * (h * 0.42);
      const x = scrX + (Math.random() - 0.5) * 10;
      hits.current.push({ x, y });
      ctx.fillStyle = 'rgba(233,213,255,0.85)';
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    setCount((c2) => c2 + n);
  };

  const reset = (m: Mode) => {
    hits.current = [];
    setCount(0);
    buildCdf(m);
    modeRef.current = m;
    drawFrame();
  };
  const pickMode = (m: Mode) => { setMode(m); reset(m); };

  const stopAuto = () => { if (auto.current) clearInterval(auto.current); auto.current = null; setRunning(false); };
  const toggleAuto = () => {
    if (running) { stopAuto(); return; }
    setRunning(true);
    auto.current = setInterval(() => plot(12), 60);
  };

  useEffect(() => {
    buildCdf('serbest');
    const onResize = () => {
      const c = cv.current; if (!c) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr;
      const ctx = c.getContext('2d'); if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame();
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); if (auto.current) clearInterval(auto.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = MODES.find((m) => m.id === mode)!;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {MODES.map((m) => (
          <button key={m.id} onClick={() => pickMode(m.id)} className="rounded-full px-4 py-1.5 text-sm font-bold transition" style={mode === m.id ? { background: VIOLET, color: '#0b0614' } : { background: 'rgba(255,255,255,0.05)', color: '#cbd5e1' }}>{m.label}</button>
        ))}
      </div>
      <canvas ref={cv} className="h-56 w-full rounded-xl bg-black/40 sm:h-64" />
      <p className="mt-2 min-h-[2.5rem] text-center text-xs leading-relaxed text-slate-400">{active.hint}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button onClick={() => plot(1)} className="rounded-full border border-violet-400/40 bg-violet-400/10 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:bg-violet-400/20">1 elektron gönder</button>
        <button onClick={toggleAuto} className="rounded-full bg-violet-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-violet-400">{running ? '⏸ Durdur' : '▶ Otomatik ateşle'}</button>
        <button onClick={() => reset(mode)} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10">Temizle</button>
        <span className="font-mono text-sm text-slate-400">{count.toLocaleString('tr-TR')} elektron</span>
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">{count > 220 ? (mode === 'dedektor' ? '→ İki bant oluştu: parçacık gibi davrandı.' : '→ Girişim şeritleri belirdi: her elektron kendisiyle girişim yaptı.') : 'Yüzlerce elektron biriktikçe desen ortaya çıkar — “Otomatik ateşle”ye bas.'}</p>
    </div>
  );
}

/* ════════════ OYUN 2: Dalga havuzu (iki kaynaklı girişim) ════════════ */

export function RippleTank() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [sep, setSep] = useState(46);
  const [wl, setWl] = useState(20);
  const sepR = useRef(sep), wlR = useRef(wl);
  sepR.current = sep; wlR.current = wl;
  useEffect(() => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const reduce = reduced();
    const CW = 220, CH = 132;
    c.width = CW; c.height = CH;
    const img = ctx.createImageData(CW, CH);
    let raf = 0, t = 0;
    const render = () => {
      const sepv = sepR.current, wlv = wlR.current;
      const s1y = CH / 2 - sepv / 2, s2y = CH / 2 + sepv / 2, sx = 26;
      const d = img.data;
      for (let y = 0; y < CH; y++) {
        for (let x = 0; x < CW; x++) {
          const d1 = Math.hypot(x - sx, y - s1y);
          const d2 = Math.hypot(x - sx, y - s2y);
          const a = Math.sin((d1 / wlv) * Math.PI * 2 - t) + Math.sin((d2 / wlv) * Math.PI * 2 - t);
          const v = (a + 2) / 4; // 0..1
          const i = (y * CW + x) * 4;
          d[i] = 40 + v * 150;         // R (mor-cyan karışımı)
          d[i + 1] = 20 + v * 120;     // G
          d[i + 2] = 70 + v * 185;     // B
          d[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      // kaynakları işaretle
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.arc(sx, s1y, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx, s2y, 2.4, 0, Math.PI * 2); ctx.fill();
      t += 0.22;
      if (!reduce) raf = requestAnimationFrame(render);
    };
    if (reduce) render(); else raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <canvas ref={cv} className="h-44 w-full rounded-xl sm:h-52" style={{ imageRendering: 'auto' }} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="flex justify-between text-sm text-slate-300"><span>Yarık aralığı</span><span className="font-mono text-violet-300">{sep}</span></span>
          <input type="range" min={16} max={90} value={sep} onChange={(e) => setSep(+e.target.value)} className="mt-2 w-full" style={{ accentColor: VIOLET }} aria-label="Yarık aralığı" />
        </label>
        <label className="block">
          <span className="flex justify-between text-sm text-slate-300"><span>Dalga boyu</span><span className="font-mono text-cyan-300">{wl}</span></span>
          <input type="range" min={9} max={40} value={wl} onChange={(e) => setWl(+e.target.value)} className="mt-2 w-full" style={{ accentColor: CYAN }} aria-label="Dalga boyu" />
        </label>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">İki kaynağın dalgaları bazı yerlerde birbirini güçlendirir (parlak), bazı yerlerde yok eder (koyu). Aralığı ve dalga boyunu değiştir; şeritlerin nasıl açılıp sıklaştığını izle.</p>
    </div>
  );
}

/* ════════════ OYUN 3: de Broglie dalga boyu (λ = h/p) ════════════ */

const H_PLANCK = 6.626e-34;
const DB_OBJECTS: { name: string; icon: string; mass: number; v: number; vmin: number; vmax: number }[] = [
  { name: 'Elektron', icon: '⚛️', mass: 9.11e-31, v: 2e6, vmin: 1e5, vmax: 6e6 },
  { name: 'Proton', icon: '🔴', mass: 1.67e-27, v: 5e5, vmin: 1e4, vmax: 3e6 },
  { name: 'C60 (buckyball)', icon: '⚽', mass: 1.2e-24, v: 200, vmin: 50, vmax: 500 },
  { name: 'Toz zerresi', icon: '🌫️', mass: 1e-15, v: 0.01, vmin: 0.001, vmax: 1 },
  { name: 'Futbol topu', icon: '🥅', mass: 0.43, v: 10, vmin: 1, vmax: 40 },
  { name: 'İnsan', icon: '🚶', mass: 70, v: 1.4, vmin: 0.5, vmax: 10 },
];
function sci(n: number) {
  if (n === 0) return '0';
  const exp = Math.floor(Math.log10(n));
  const mant = n / Math.pow(10, exp);
  return `${mant.toFixed(2)}×10${sup(exp)}`;
}
function sup(n: number) {
  const map: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  return String(n).split('').map((c) => map[c] ?? c).join('');
}
export function DeBroglie() {
  const [oi, setOi] = useState(0);
  const [v, setV] = useState(DB_OBJECTS[0].v);
  const obj = DB_OBJECTS[oi];
  const lambda = H_PLANCK / (obj.mass * v);
  // referans: atom ~1e-10 m. λ atom çapından büyük/yakınsa dalga gözlenebilir.
  const observable = lambda > 1e-12;
  const pick = (i: number) => { setOi(i); setV(DB_OBJECTS[i].v); };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {DB_OBJECTS.map((o, i) => (
          <button key={o.name} onClick={() => pick(i)} className="rounded-full px-3 py-1.5 text-xs font-semibold transition" style={oi === i ? { background: VIOLET, color: '#0b0614' } : { background: 'rgba(255,255,255,0.05)', color: '#cbd5e1' }}>{o.icon} {o.name}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="text-xs text-slate-500">Kütle</div>
          <div className="font-mono text-sm text-slate-300">{sci(obj.mass)} kg</div>
          <label className="mt-3 block">
            <span className="flex justify-between text-xs text-slate-400"><span>Hız</span><span className="font-mono text-violet-300">{sci(v)} m/s</span></span>
            <input type="range" min={obj.vmin} max={obj.vmax} step={(obj.vmax - obj.vmin) / 200} value={v} onChange={(e) => setV(+e.target.value)} className="mt-2 w-full" style={{ accentColor: VIOLET }} aria-label="Hız" />
          </label>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ borderColor: observable ? `${CYAN}55` : 'rgba(239,68,68,0.4)', background: observable ? 'rgba(34,211,238,0.06)' : 'rgba(239,68,68,0.06)' }}>
          <div className="text-xs text-slate-500">de Broglie dalga boyu (λ = h/p)</div>
          <div className="mt-1 font-mono text-xl font-black" style={{ color: observable ? CYAN : '#fca5a5' }}>{sci(lambda)} m</div>
          <div className="mt-2 text-sm font-bold" style={{ color: observable ? '#67e8f9' : '#fca5a5' }}>{observable ? '✓ Dalga davranışı gözlenebilir' : '✗ Dalga boyu ölçülemeyecek kadar küçük'}</div>
          <div className="mt-1 text-[0.7rem] leading-relaxed text-slate-500">Karşılaştırma: bir atom ≈ 10⁻¹⁰ m. λ bundan çok küçükse girişim asla görülemez.</div>
        </div>
      </div>
    </div>
  );
}

/* ════════════ VERİ: zaman çizelgesi · yorumlar · quiz ════════════ */

export const timeline = [
  { year: '1801', title: 'Young ışığı böler', text: "Thomas Young, ışığı ikiye bölüp perdede aydınlık-karanlık şeritler elde eder; ışığın dalga olduğunu gösterir ve Newton'ın parçacık görüşünü gölgede bırakır." },
  { year: '1905', title: 'Einstein: foton', text: "Einstein, ışığın bazen parçacık (foton) gibi davrandığını gösterir. Işık hem dalga hem parçacıktır." },
  { year: '1924', title: 'de Broglie: madde dalgası', text: "Louis de Broglie her parçacığın bir dalga boyu olduğunu öne sürer: λ = h/p. Madde de dalga olabilir." },
  { year: '1927', title: 'Davisson–Germer', text: "Elektronlar bir nikel kristalinde tıpkı dalgalar gibi kırınıma uğrar. de Broglie doğrulanır." },
  { year: '1961', title: 'Jönsson: tek elektron', text: "Claus Jönsson, deneyi gerçek çift yarıkla ve elektronlarla yapar." },
  { year: '1989', title: 'Tonomura', text: "Hitachi ekibi, tek tek elektronların ekranda önce dağınık, sonra girişim desenine dönüşerek birikişini kaydeder — ikonik kareler." },
  { year: '1999', title: 'Buckyball girişimi', text: "Zeilinger ekibi, 60 karbon atomlu C60 molekülleriyle girişim gözler. Koca moleküller bile dalga gibi davranır." },
  { year: '2019', title: '2000+ atom', text: "İki binden fazla atomlu devasa moleküllerle bile girişim gözlenir. Sınır giderek yukarı taşınıyor." },
];

export const interpretations = [
  { icon: '🌀', title: 'Kopenhag yorumu', text: 'Parçacık ölçülene kadar tüm olasılıkların üst üste binmesi (süperpozisyon) halindedir; ölçüm anında dalga fonksiyonu “çöker” ve tek bir sonuç gerçekleşir. Soru sorulana kadar cevap yoktur.' },
  { icon: '🌌', title: 'Çoklu dünyalar', text: 'Dalga fonksiyonu hiç çökmez; her olası sonuç gerçekleşir ama birbirinden ayrılan farklı evrenlerde. Elektron bir evrende şu yarıktan, başka evrende bu yarıktan geçer.' },
  { icon: '🧭', title: 'Pilot dalga (Bohm)', text: 'Parçacığın her zaman belirli bir konumu ve gerçek bir yörüngesi vardır; görünmez bir “kılavuz dalga” onu yönlendirir. Determinizmi geri kazandırma çabası.' },
];

export const quizQs = [
  { text: "Tek tek gönderilen elektronlar ekranda ne oluşturur?", opts: ['İki basit yığın', 'Girişim şeritleri (aydınlık-karanlık bantlar)', 'Tek bir nokta', 'Hiçbir şey'], a: 1, exp: "Her elektron tek bir noktaya çarpar ama binlercesi birikince girişim deseni ortaya çıkar — her biri sanki kendisiyle girişim yapar." },
  { text: "Hangi yarıktan geçtiğini ölçmeye başlarsan ne olur?", opts: ['Desen daha net çıkar', 'Girişim kaybolur, iki bant belirir', 'Elektron durur', 'Değişmez'], a: 1, exp: "Yol bilgisi kaydedildiği an dalga davranışı yok olur; elektron “uslu bir parçacık” gibi davranır." },
  { text: "Buradaki “gözlem/ölçüm” ne demektir?", opts: ['Bir insanın gözüyle bakması', 'Bilincin gerçekliği yaratması', 'Sistemin çevresiyle etkileşip yol bilgisinin fiziksel kaydedilmesi', 'Işığın açılması'], a: 2, exp: "Kimsenin bakması gerekmez; bilgi ortamda iz bırakacak şekilde kaydedildiği an desen bozulur. Buna dekoherans denir." },
  { text: "de Broglie'nin λ = h/p formülü neyi açıklar?", opts: ['Neden ışık hızlıdır', 'Neden büyük nesneler dalga gibi davranmaz (dalga boyları çok küçük)', 'Neden atomlar kararlıdır', 'Elektronun kütlesini'], a: 1, exp: "Momentum büyüdükçe dalga boyu küçülür; futbol topunun dalga boyu ölçülemeyecek kadar minik kalır." },
  { text: "Girişim desenini yok eden asıl şey nedir?", opts: ['İnsan bilinci', 'Bilginin çevreye yayılması (dekoherans)', 'Elektronun yavaşlaması', 'Yarıkların kapanması'], a: 1, exp: "Elektron, yol bilgisini taşıyan aygıtla dolanır; bu dolanıklık bir kez oluşunca girişim geri gelmez." },
  { text: "60 karbon atomlu C60 molekülleriyle yapılan deneyde ne görüldü?", opts: ['Hiç girişim yok', 'Girişim deseni — koca moleküller de dalga gibi davrandı', 'Moleküller parçalandı', 'Sadece ısı'], a: 1, exp: "1999'da Zeilinger ekibi bunu gösterdi; sonra sınır 2000+ atoma taşındı." },
];
