'use client';

// "Kuantum Ölümsüzlüğü" makalesine ÖZEL interaktifler + arka plan (çok-dünyalı dallanma) + veri.
// Genel şablon: @/app/components/article/ArticleBlocks
import { useEffect, useRef, useState } from 'react';

export { refs } from './refs';

const TEAL = '#2dd4bf';
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
// Locale-bağımsız binlik ayracı (Intl KULLANMA → hydration mismatch riski)
const grp = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/* ════════════ ARKA PLAN: çok-dünyalı dallanan zaman çizgileri ════════════ */

export function BranchField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = reduced();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0, h = 0, raf = 0;
    type P = { x: number; y: number; vx: number; vy: number; age: number; hue: number };
    let ps: P[] = [];
    const CAP = 150;
    const seed = () => ({ x: Math.random() * w, y: Math.random() * h, vx: 0.5 + Math.random() * 0.7, vy: (Math.random() - 0.5) * 0.5, age: 0, hue: 165 + Math.random() * 40 });
    const init = () => { ps = []; const n = Math.min(40, Math.floor((w * h) / 42000)); for (let i = 0; i < n; i++) ps.push(seed()); };
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); init();
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        const ox = p.x, oy = p.y;
        p.x += p.vx; p.y += p.vy; p.age++;
        // hafif dikey sürüklenme
        p.vy += (Math.random() - 0.5) * 0.03; if (p.vy > 0.8) p.vy = 0.8; else if (p.vy < -0.8) p.vy = -0.8;
        // dallanma (Everett): ara sıra ikiye ayrıl
        if (ps.length < CAP && p.age > 12 && Math.random() < 0.02) {
          ps.push({ x: p.x, y: p.y, vx: p.vx, vy: p.vy + (Math.random() < 0.5 ? 0.6 : -0.6), age: 0, hue: p.hue });
        }
        // çizgi + baş nokta
        ctx.strokeStyle = 'hsla(' + p.hue + ',80%,60%,0.28)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.fillStyle = 'hsla(' + p.hue + ',90%,72%,0.6)';
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
        if (p.x > w + 8 || p.y < -8 || p.y > h + 8 || p.age > 900) ps[i] = seed();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener('resize', resize);
    if (reduce) draw(); else raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0" style={{ zIndex: 1, opacity: 0.5 }} />;
}

/* ════════════ İNTERAKTİF 1: süperpozisyon parası (yazı-tura) ════════════ */

export function SuperpositionCoin() {
  const coin = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'super' | 'collapsed'>('super');
  const [result, setResult] = useState<'Yazı' | 'Tura' | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  useEffect(() => {
    const el = coin.current;
    if (!el) return;
    const reduce = reduced();
    let raf = 0, a = 0;
    const spin = () => {
      if (phaseRef.current === 'super') {
        a += 0.22;
        el.style.transform = 'scaleX(' + Math.cos(a).toFixed(3) + ')';
        el.textContent = Math.cos(a) >= 0 ? 'Y' : 'T';
        el.style.background = Math.cos(a) >= 0 ? 'linear-gradient(135deg,#2dd4bf,#0e7490)' : 'linear-gradient(135deg,#a78bfa,#6d28d9)';
      }
      if (!reduce) raf = requestAnimationFrame(spin);
    };
    if (reduce) { el.textContent = '?'; } else raf = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(raf);
  }, []);
  const measure = () => {
    const r = Math.random() < 0.5 ? 'Yazı' : 'Tura';
    setResult(r); setPhase('collapsed');
    const el = coin.current;
    if (el) { el.style.transform = 'scaleX(1)'; el.textContent = r === 'Yazı' ? 'Y' : 'T'; el.style.background = r === 'Yazı' ? 'linear-gradient(135deg,#2dd4bf,#0e7490)' : 'linear-gradient(135deg,#a78bfa,#6d28d9)'; }
  };
  const reset = () => { setResult(null); setPhase('super'); };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
      <div className="flex flex-col items-center gap-4">
        <div ref={coin} className="grid h-24 w-24 place-items-center rounded-full font-mono text-4xl font-black text-white ring-2 ring-white/20" style={{ background: 'linear-gradient(135deg,#2dd4bf,#0e7490)' }}>Y</div>
        <div className="min-h-[2.5rem] text-center">
          {phase === 'super'
            ? <p className="text-sm text-slate-300">Para havada dönüyor: <strong className="text-teal-300">hem yazı hem tura</strong>. Henüz bir sonuç <em className="not-italic text-violet-300">yok</em> — yalnızca ihtimallerin karışımı (süperpozisyon).</p>
            : <p className="text-sm text-slate-300">Ölçtün, süperpozisyon çöktü: sonuç <strong className="text-teal-300">{result}</strong>. Diğer ihtimal silindi (Kopenhag) — ya da komşu bir dalda gerçekleşti (Çok Dünyalı).</p>}
        </div>
        <div className="flex gap-3">
          {phase === 'super'
            ? <button onClick={measure} className="rounded-full bg-teal-400 px-5 py-2 text-sm font-bold text-teal-950 transition hover:bg-teal-300">👁 Gözlemle / Ölç</button>
            : <button onClick={reset} className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10">↺ Yeniden süperpozisyona koy</button>}
        </div>
      </div>
    </div>
  );
}

/* ════════════ İNTERAKTİF 2: kuantum intiharı — dallanma simülatörü ════════════ */

export function QuantumSuicideSim() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [pulls, setPulls] = useState(0);
  const [running, setRunning] = useState(false);
  const auto = useRef<ReturnType<typeof setInterval> | null>(null);
  const pullsRef = useRef(0);
  pullsRef.current = pulls;

  const draw = () => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const w = c.width = c.clientWidth * (Math.min(2, window.devicePixelRatio || 1));
    const h = c.height = c.clientHeight * (Math.min(2, window.devicePixelRatio || 1));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = c.clientWidth, H = c.clientHeight;
    ctx.clearRect(0, 0, W, H);
    const n = pullsRef.current;
    const y0 = H / 2;
    const step = Math.max(10, Math.min(46, (W - 40) / Math.max(n, 1)));
    let x = 20;
    ctx.lineWidth = 2;
    for (let i = 0; i < n; i++) {
      // ölen dal (sönük, kırmızı) — sırayla yukarı/aşağı
      const dir = i % 2 ? -1 : 1;
      ctx.strokeStyle = 'rgba(244,63,94,0.28)';
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + step * 0.8, y0 + dir * (26 + (i % 3) * 8)); ctx.stroke();
      ctx.fillStyle = 'rgba(244,63,94,0.35)';
      ctx.beginPath(); ctx.arc(x + step * 0.8, y0 + dir * (26 + (i % 3) * 8), 3, 0, Math.PI * 2); ctx.fill();
      // hayatta kalan dal (parlak teal)
      ctx.strokeStyle = TEAL;
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + step, y0); ctx.stroke();
      x += step;
    }
    // baş (sen) — parlayan nokta
    ctx.fillStyle = '#eafffb'; ctx.shadowColor = TEAL; ctx.shadowBlur = 14;
    ctx.beginPath(); ctx.arc(x, y0, 5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('sen', x - 10, y0 - 12);
  };
  useEffect(() => { draw(); const onR = () => draw(); window.addEventListener('resize', onR); return () => { window.removeEventListener('resize', onR); if (auto.current) clearInterval(auto.current); }; /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { draw(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [pulls]);

  const trigger = () => setPulls((p) => Math.min(p + 1, 40));
  const stopAuto = () => { if (auto.current) clearInterval(auto.current); auto.current = null; setRunning(false); };
  const toggleAuto = () => {
    if (running) { stopAuto(); return; }
    setRunning(true);
    auto.current = setInterval(() => { setPulls((p) => { if (p >= 40) { stopAuto(); return p; } return p + 1; }); }, 550);
  };
  const reset = () => { stopAuto(); setPulls(0); };

  const denom = Math.pow(2, pulls);
  const pct = 100 / denom;
  const pctStr = pulls === 0 ? '100' : (pct >= 0.01 ? pct.toFixed(pct >= 1 ? 1 : 3) : pct.toExponential(1));
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
      <canvas ref={cv} className="h-40 w-full rounded-xl bg-black/30 sm:h-44" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-teal-400/25 bg-teal-400/5 p-4 text-center">
          <div className="text-xs text-slate-500">Öznel (sen, içeriden)</div>
          <div className="mt-1 text-lg font-black text-teal-300">HAYATTASIN</div>
          <div className="mt-1 font-mono text-sm text-slate-300">{pulls} tetik hayatta geçti</div>
        </div>
        <div className="rounded-xl border border-rose-400/25 bg-rose-400/5 p-4 text-center">
          <div className="text-xs text-slate-500">Nesnel olasılık (dışarıdan)</div>
          <div className="mt-1 font-mono text-lg font-black text-rose-300">1 / {grp(denom)}</div>
          <div className="mt-1 font-mono text-sm text-slate-300">≈ %{pctStr} sağ kalma</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button onClick={trigger} disabled={pulls >= 40} className="rounded-full bg-rose-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-rose-400 disabled:opacity-40">🔫 Tetikle</button>
        <button onClick={toggleAuto} className="rounded-full border border-teal-400/40 bg-teal-400/10 px-4 py-2 text-sm font-semibold text-teal-200 transition hover:bg-teal-400/20">{running ? '⏸ Durdur' : '▶ Otomatik'}</button>
        <button onClick={reset} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10">↺ Sıfırla</button>
      </div>
      <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
        {pulls === 0 ? 'Tetikle: her seferinde bir dalda ölür, komşu dalda yaşarsın. Öznel deneyimin hep hayatta kalan dalı takip eder.'
          : pulls < 8 ? 'Öznel olarak hep hayattasın — ama var olduğun dalın olasılığı her tetikte yarıya iniyor.'
            : 'Hâlâ hayattasın… ama dışarıdan bakan biri seni neredeyse kesin ölmüş görürdü. Öznel ölümsüzlük, nesnel yok oluş.'}
      </p>
    </div>
  );
}

/* ════════════ İNTERAKTİF 3: dönen Möbius şeridi ════════════ */

export function MobiusStrip() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const reduce = reduced();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let raf = 0, ang = 0.6;
    const resize = () => { c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    const draw = () => {
      const W = c.clientWidth, H = c.clientHeight, cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.28, wid = R * 0.42;
      ctx.clearRect(0, 0, W, H);
      const ca = Math.cos(ang), sa = Math.sin(ang), tilt = 0.5, ct = Math.cos(tilt), st = Math.sin(tilt);
      const N = 80;
      const quads: { z: number; p: number[][]; hue: number }[] = [];
      const pt = (u: number, v: number) => {
        const x0 = (R + v * Math.cos(u / 2)) * Math.cos(u);
        const y0 = (R + v * Math.cos(u / 2)) * Math.sin(u);
        const z0 = v * Math.sin(u / 2);
        // Y ekseni dönüşü + hafif tilt
        const x1 = x0 * ca - z0 * sa, z1 = x0 * sa + z0 * ca;
        const y1 = y0 * ct - z1 * st, z2 = y0 * st + z1 * ct;
        return [cx + x1, cy + y1, z2];
      };
      for (let i = 0; i < N; i++) {
        const u0 = (i / N) * Math.PI * 2, u1 = ((i + 1) / N) * Math.PI * 2;
        const a = pt(u0, -wid), b = pt(u0, wid), d = pt(u1, wid), e = pt(u1, -wid);
        quads.push({ z: (a[2] + b[2] + d[2] + e[2]) / 4, p: [a, b, d, e], hue: 168 + (i / N) * 60 });
      }
      quads.sort((p, q) => p.z - q.z);
      for (const q of quads) {
        const shade = Math.max(0.25, Math.min(1, 0.6 + q.z / (R * 1.6)));
        ctx.fillStyle = 'hsla(' + q.hue + ',70%,' + Math.round(38 + shade * 34) + '%,0.95)';
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.moveTo(q.p[0][0], q.p[0][1]); ctx.lineTo(q.p[1][0], q.p[1][1]); ctx.lineTo(q.p[2][0], q.p[2][1]); ctx.lineTo(q.p[3][0], q.p[3][1]); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ang += 0.012;
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    window.addEventListener('resize', resize);
    if (reduce) draw(); else raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
      <canvas ref={ref} className="h-48 w-full sm:h-56" />
      <p className="mt-2 text-center text-xs text-slate-500">Möbius şeridi: tek yüzü vardır. Üzerinde yürürsen başladığın yere — ama ters dönmüş hâlde — geri dönersin.</p>
    </div>
  );
}

/* ════════════ VERİ: zaman çizelgesi · itirazlar · quiz ════════════ */

export const timeline = [
  { year: '1935', title: "Schrödinger'in kedisi", text: "Schrödinger, kutudaki kediyi 'hem ölü hem diri' göstererek teoriye İTİRAZ eder — ama tuhaflık gitmez." },
  { year: '1957', title: 'Everett: Çok Dünyalı Yorum', text: "Hugh Everett, dalga fonksiyonunun hiç çökmediğini; her ihtimalin ayrı bir evrende gerçekleştiğini önerir." },
  { year: '1986', title: 'Squires: ilk iz', text: "Kuantum intiharı düşüncesi Euan Squires ile bilim çevrelerine sızar." },
  { year: '1987–88', title: 'Moravec & Marchal', text: "Hans Moravec ve Bruno Marchal, birbirinden habersiz, benzer düşünce deneyini önerir." },
  { year: '1998', title: 'Tegmark: resmî biçim', text: "Max Tegmark 'kuantum silahı' kurgusuyla deneyi netleştirir ve üç koşulunu (ani, tam öldürücü, kuantum-rastlantılı) belirtir." },
  { year: '2000–01', title: 'Filozofların itirazı', text: "Peter J. Lewis ve David Lewis konuyu ele alır; ikisi de teselli edici okumaya mesafeli durur." },
  { year: '2024', title: 'Fikir romana kaçar: Mobius', text: "Adam Fawer'ın Mobius'u aynı çok-dünyalı mekaniği bir 'pişmanlık makinesine' çevirir." },
];

export const objections = [
  { icon: '🔒', title: 'Dışarıdan yanlışlanamaz', text: "Seni izleyen biri, seni gayet normal bir olasılıkla ölürken görür. 'Kanıtlamak' için ölmen gerekir — ve ölüp kimseye anlatamazsın. Yalnızca birinci şahsa özel bir iddia." },
  { icon: '⚖️', title: 'Ölçü/ağırlık problemi', text: "Her kurtuluşta hayatta kaldığın dalların olasılık 'ağırlığı' küçülür, sıfıra yaklaşır. Sonsuza var olan o dal, gerçekliğin gitgide incelen bir dilimidir." },
  { icon: '🩺', title: 'Ölmek ikili değildir', text: "Tegmark'ın koşulları (ani, tam öldürücü, kuantum-rastlantılı) gerçek ölümlerin çoğunda yoktur; bilinç genelde bir süreklilik boyunca söner." },
  { icon: '🤔', title: 'Filozofların içi rahat değil', text: "Peter J. Lewis (2000) ve David Lewis (2001) teselli edici okumaya mesafeli durdu; 'hayatta kalanın yanılgısı' da cabası." },
];

export const quizQs = [
  { text: "Süperpozisyon nedir?", opts: ['Parçacığın çok hızlı olması', 'Ölçülene kadar birbirini dışlayan ihtimallerin bir arada bulunması', 'Parçacığın iki parçaya bölünmesi', 'Bir ölçüm hatası'], a: 1, exp: "Havada dönen yazı-tura gibi: henüz ne yazı ne tura, ikisinin ihtimali aynı anda." },
  { text: "Kopenhag yorumunda ölçüm ne yapar?", opts: ['Hiçbir şey', 'Dalga fonksiyonunu çökertir; tek bir sonuç gerçek olur', 'Parçacığı yok eder', 'Evreni ikiye ayırır'], a: 1, exp: "Sayısız ihtimalden yalnızca biri gerçek olur; hangisi olacağını Born kuralı belirler." },
  { text: "Çok Dünyalı Yorum'a göre ölçümde ne olur?", opts: ['Dalga çöker', 'Hiçbir ihtimal gerçekleşmez', 'Her ihtimal ayrı bir dalda/evrende gerçekleşir; gözlemci de çatallanır', 'Sadece en olası sonuç gerçekleşir'], a: 2, exp: "Everett: hiçbir şey çökmez; evren her karar anında sessizce dallanır." },
  { text: "Kuantum ölümsüzlüğünün özü nedir?", opts: ['Bedenin hiç yaşlanmaması', 'Öznel deneyimin hep hayatta kaldığın dalı takip etmesi', 'Ölümün tamamen imkânsız olması', 'Bilincin başka bedene geçmesi'], a: 1, exp: "Dışarıdan ölürsün; içeriden asla — çünkü öldüğün dalda bunu fark edecek bir 'sen' kalmaz." },
  { text: "Fizikçilerin en temel itirazı nedir?", opts: ['Matematik yanlış', 'İddia dışarıdan yanlışlanamaz; kanıtlamak için ölmen gerekir', 'Kuantum mekaniği yanlış', 'Çok pahalı bir deney'], a: 1, exp: "Yalnızca birinci şahsa özel, test edilemez bir 'ya öyleyse?' sorusudur." },
  { text: "Adam Fawer'ın Mobius'u bu fikri neye çevirir?", opts: ['Bir fizik ders kitabına', 'Bir pişmanlık makinesine — geçmişi değiştirme sorusuna', 'Bir korku filmine', 'Bir matematik problemine'], a: 1, exp: "Fizik cevabı verir; roman bedeli gösterir: elimizde her şeyi geri alma şansı olsa daha iyisini yapar mıydık?" },
];
