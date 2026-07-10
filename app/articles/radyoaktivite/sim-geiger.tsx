'use client';

// Sanal Geiger–Müller sayacı. Tıklar Poisson dağılımlıdır: aralar rastgele,
// ortalama sabit. Doğal fonda seyrek; uranyum cevherine yaklaştıkça ayrı tıklar
// birbirine karışıp çığlığa dönüşür.
//
// SES VARSAYILAN OLARAK KAPALI. AudioContext yalnızca kullanıcı dokunuşuyla açılır
// (tarayıcı otomatik-oynatma politikası) ve modül sökülünce kapatılır.

import { useEffect, useRef, useState } from 'react';
import { GEIGER_BG_CPM, SCENES } from './data';
import { ACCENT, WidgetFrame, tr } from './ui';

const CLICK_CAP = 50;       // saniyede en fazla bu kadar ayrı tık duyulur
const ORE_REF_CM = 5;

const randn = () => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/* gösterge: 10 → 100.000 CPM, logaritmik, −120° → +120° */
const GAUGE_MIN = 1, GAUGE_MAX = 5;
const angleOf = (cpm: number) => {
  const l = Math.log10(Math.max(10, cpm));
  return -120 + ((l - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 240;
};

export default function GeigerCounter() {
  const [sceneKey, setSceneKey] = useState('fon');
  const [dist, setDist] = useState(40);
  const [sound, setSound] = useState(false);
  const [total, setTotal] = useState(0);

  const scene = SCENES.find(s => s.key === sceneKey)!;
  const cpm = scene.ore
    ? Math.round(GEIGER_BG_CPM + (scene.cpm - GEIGER_BG_CPM) * Math.pow(ORE_REF_CM / dist, 2))
    : scene.cpm;
  const cps = cpm / 60;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audio = useRef<{ ctx: AudioContext; click: AudioBuffer; master: GainNode; noise: AudioBufferSourceNode; noiseGain: GainNode } | null>(null);
  // pending: bu karede üretilen ayrı tık sayısı · xs: şeritte çizili tıkların x'i
  const w = useRef({ cps: 0, sound: false, nextIn: 0, total: 0, pending: 0, xs: [] as number[] });
  w.current.cps = cps;
  w.current.sound = sound;

  /* sahne değişince sayacı sıfırla */
  useEffect(() => { w.current.total = 0; w.current.xs = []; w.current.pending = 0; setTotal(0); }, [sceneKey]);

  /* ── ses kurulumu (yalnızca kullanıcı dokunuşuyla) ── */
  async function enableSound() {
    if (audio.current) {
      // sekme değişiminde askıya alınmış olabilir
      if (audio.current.ctx.state === 'suspended') await audio.current.ctx.resume().catch(() => {});
      setSound(s => !s);
      return;
    }
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      await ctx.resume();

      // kısa, sönümlü gürültü patlaması = tık
      const clickLen = Math.floor(ctx.sampleRate * 0.006);
      const click = ctx.createBuffer(1, clickLen, ctx.sampleRate);
      const cd = click.getChannelData(0);
      for (let i = 0; i < clickLen; i++) cd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / clickLen, 3);

      // sürekli cızırtı ("çığlık") için döngüsel beyaz gürültü
      const noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

      const master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 0.8;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf; noise.loop = true;
      noise.connect(bp); bp.connect(noiseGain); noiseGain.connect(master);
      noise.start();

      audio.current = { ctx, click, master, noise, noiseGain };
      setSound(true);
    } catch {
      setSound(false);
    }
  }

  function playClick() {
    const a = audio.current;
    if (!a || a.ctx.state !== 'running') return;
    const src = a.ctx.createBufferSource();
    src.buffer = a.click;
    const g = a.ctx.createGain();
    g.gain.value = 0.22;
    const hp = a.ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 1200;
    src.connect(hp); hp.connect(g); g.connect(a.master);
    src.start();
  }

  /* ── döngü: Poisson tıklar + çizim ── */
  useEffect(() => {
    let raf = 0, last = performance.now(), acc = 0;
    const loop = (now: number) => {
      const s = w.current;
      const dt = Math.min(0.06, (now - last) / 1000);
      last = now;

      // Duyulabilir bölge: üstel bekleme süreleriyle tam Poisson.
      const audible = Math.min(s.cps, CLICK_CAP);
      s.pending = 0;
      if (audible > 0) {
        s.nextIn -= dt;
        let guard = 0;
        while (s.nextIn <= 0 && guard++ < 8) {
          if (s.sound) playClick();
          s.pending++;
          s.nextIn += -Math.log(1 - Math.random()) / audible;
        }
      }
      // Çığlık bölgesi: tek tek çizilmeyen fazlalık, normal yaklaşımıyla sayaca eklenir.
      const extra = Math.max(0, s.cps - CLICK_CAP) * dt;
      const extraN = extra > 0 ? Math.max(0, Math.round(extra + randn() * Math.sqrt(extra))) : 0;
      s.total += extraN + s.pending;

      // sürekli cızırtı
      const a = audio.current;
      if (a) {
        const target = !s.sound ? 0 : s.cps <= CLICK_CAP ? 0 : Math.min(0.18, 0.02 + 0.16 * (Math.log10(s.cps) - Math.log10(CLICK_CAP)) / (Math.log10(300) - Math.log10(CLICK_CAP)));
        a.noiseGain.gain.setTargetAtTime(target, a.ctx.currentTime, 0.08);
      }

      // şerit çizimi
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const cw = canvas.clientWidth, ch = canvas.clientHeight;
        if (ctx && cw > 0) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          if (canvas.width !== Math.round(cw * dpr)) { canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr); }
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, cw, ch);

          // mevcut tıkları sola kaydır, yenilerini sağ kenara ekle
          const px = 70 * dt; // px/sn
          for (let i = 0; i < s.xs.length; i++) s.xs[i] -= px;
          for (let i = 0; i < s.pending; i++) s.xs.push(cw - 2 - Math.random() * 2);
          while (s.xs.length && s.xs[0] < -4) s.xs.shift();
          if (s.xs.length > 600) s.xs.splice(0, s.xs.length - 600);

          ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.85;
          ctx.beginPath();
          for (const x of s.xs) { ctx.moveTo(x, ch); ctx.lineTo(x, ch * 0.18); }
          ctx.stroke();

          if (extraN > 0) {
            ctx.globalAlpha = Math.min(0.5, extraN / 12);
            ctx.fillStyle = ACCENT;
            ctx.fillRect(0, ch * 0.18, cw, ch * 0.82);
          }
          ctx.globalAlpha = 1;
        }
      }

      acc += dt;
      if (acc > 0.12) { acc = 0; setTotal(w.current.total); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── sökülürken sesi kapat ── */
  useEffect(() => () => {
    const a = audio.current;
    if (!a) return;
    try { a.noise.stop(); } catch { /* zaten durmuş */ }
    a.ctx.close().catch(() => {});
    audio.current = null;
  }, []);

  /* sessize alınca cızırtıyı hemen kes */
  useEffect(() => {
    const a = audio.current;
    if (a && !sound) a.noiseGain.gain.setTargetAtTime(0, a.ctx.currentTime, 0.05);
  }, [sound]);

  const angle = angleOf(cpm);

  return (
    <WidgetFrame
      kicker="İNTERAKTİF · SES"
      title="Sanal Geiger sayacı"
      hint="Sessiz başlar. Sesi açıp uranyum cevherine yaklaş: ayrı tıklar birbirine karışıp çığlığa dönüşür."
      footnote={<>CPM değerleri <strong className="text-slate-400">temsilîdir</strong>: gerçek okuma dedektör tüpünün hacmine ve verimine bağlıdır. Tıkların arası rastgele, ortalaması sabittir — Poisson dağılımı.</>}
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        {/* gösterge */}
        <div className="order-2 sm:order-1">
          <div className="overflow-hidden rounded-xl bg-black/40 p-3 ring-1 ring-white/5">
            <div className="mb-2 flex items-baseline justify-between">
              <div>
                <span className="font-mono text-3xl font-black" style={{ color: ACCENT }}>{tr(cpm)}</span>
                <span className="ml-1.5 text-xs text-slate-500">CPM</span>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm text-slate-300">{tr(cps, cps < 10 ? 1 : 0)}</div>
                <div className="text-[0.6rem] text-slate-600">tık / saniye</div>
              </div>
            </div>
            <canvas ref={canvasRef} className="block h-12 w-full" aria-hidden />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={enableSound}
              className={`min-h-[44px] flex-1 rounded-xl px-4 text-sm font-bold transition ${sound ? 'text-[#04120c]' : 'border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'}`}
              style={sound ? { background: ACCENT } : undefined}
            >
              {sound ? '🔊 Ses açık — kapat' : '🔈 Sesi aç'}
            </button>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
              <div className="font-mono text-sm font-bold text-slate-200">{tr(total)}</div>
              <div className="text-[0.6rem] text-slate-600">toplam tık</div>
            </div>
          </div>
        </div>

        {/* kadran */}
        <div className="order-1 mx-auto sm:order-2">
          <svg viewBox="0 0 140 96" className="h-24 w-36" aria-hidden>
            <path d="M 14 84 A 56 56 0 0 1 126 84" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="9" strokeLinecap="round" />
            <path d="M 14 84 A 56 56 0 0 1 126 84" fill="none" stroke={ACCENT} strokeWidth="9" strokeLinecap="round"
              strokeDasharray={`${Math.max(0, (angle + 120) / 240) * 176} 400`} opacity={0.85} />
            <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '70px 84px', transition: 'transform 220ms ease-out' }}>
              <line x1="70" y1="84" x2="70" y2="34" stroke="#f8fafc" strokeWidth="2.2" strokeLinecap="round" />
            </g>
            <circle cx="70" cy="84" r="4.5" fill="#f8fafc" />
            <text x="12" y="94" fill="#475569" fontSize="7" fontFamily="monospace">10</text>
            <text x="108" y="94" fill="#475569" fontSize="7" fontFamily="monospace">100k</text>
          </svg>
        </div>
      </div>

      {/* sahneler */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SCENES.map(s => (
          <button
            key={s.key}
            onClick={() => setSceneKey(s.key)}
            aria-pressed={sceneKey === s.key}
            className={`min-h-[52px] rounded-xl border px-2.5 py-2 text-left transition ${
              sceneKey === s.key ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span aria-hidden>{s.icon}</span>
              <span className="text-xs font-bold text-white">{s.label}</span>
            </div>
            <div className="mt-0.5 font-mono text-[0.6rem]" style={{ color: sceneKey === s.key ? ACCENT : '#64748b' }}>
              ~{tr(s.cpm)} CPM
            </div>
          </button>
        ))}
      </div>

      {/* cevher mesafesi */}
      {scene.ore && (
        <label className="mt-3 block rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <span className="flex items-center justify-between text-sm text-slate-300">
            <span>Cevhere uzaklık</span>
            <span className="font-mono" style={{ color: ACCENT }}>{tr(dist)} cm</span>
          </span>
          <input
            type="range" min={5} max={100} value={dist}
            onChange={e => setDist(+e.target.value)}
            className="mt-2 h-8 w-full"
            style={{ accentColor: ACCENT }}
            aria-label="Uranyum cevherine uzaklık"
          />
          <span className="mt-1 block text-xs text-slate-500">Ters-kare yasası: mesafeyi yarıya indir, sayım dörde katlansın.</span>
        </label>
      )}

      <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-relaxed text-slate-300">
        <span className="mr-1" aria-hidden>{scene.icon}</span>
        <strong className="text-white">{scene.label}.</strong> {scene.blurb}
      </p>
    </WidgetFrame>
  );
}
