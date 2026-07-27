'use client';

// ─────────────────────────────────────────────────────────────────────────
// MOHAÇ · 29 AĞUSTOS 1526 — okur MACAR tarafında.
//
// Fatih’teki kuşatma simülasyonundan MEKANİK OLARAK farklı olsun diye tasarlandı:
// orada kaynak/zaman yönetimi vardı, burada TEMPO TUZAĞI var. Üç karar anının
// hepsi aynı yere çıkar — çünkü tarihsel durum buydu. Sim bunu "kaybettin"
// diye değil, NEDEN kaybedildiğini göstererek anlatır: muharebe, top hattı
// kurulup yeniçeri arkasına yerleştiğinde çoktan kararlaşmıştı.
//
// Teknik: canvas 2D (WebGL değil), yalnız TAP (sürükleme yok → mobil scroll’u
// çalmaz), Math.random YOK (deterministik), ekran dışında rAF DURUR,
// reduced-motion’da animasyon yerine son kare çizilir.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { ACCENT, BG, GOLD, CORAL, COBALT, MARBLE, ASH, WidgetFrame, rnd, clamp, useReducedMotion, refreshScroll } from './ui';
import { MOHAC, MOHAC_SIM } from './data';

const W = 800, H = 470;

type Anim = { adv: number; retreat: number; flank: number; fire: number };
const ZERO: Anim = { adv: 0, retreat: 0, flank: 0, fire: 0 };

/** Adım sonuçlarının hedef animasyon değerleri. */
function targetFor(step: number, key: string): Anim {
  if (step === 0) {
    if (key === 'sarj') return { adv: 0.42, retreat: 0.9, flank: 0, fire: 0 };
    return { adv: 0.06, retreat: 0.15, flank: 0, fire: 0 };
  }
  if (step === 1) {
    if (key === 'peşine') return { adv: 0.78, retreat: 1, flank: 0.85, fire: 0.15 };
    if (key === 'kanat') return { adv: 0.5, retreat: 1, flank: 0.5, fire: 0.1 };
    return { adv: 0.44, retreat: 1, flank: 0.35, fire: 0.08 };
  }
  if (key === 'ikinci') return { adv: 0.95, retreat: 1, flank: 1, fire: 1 };
  if (key === 'kral') return { adv: 0.82, retreat: 1, flank: 1, fire: 0.9 };
  return { adv: 0.66, retreat: 1, flank: 1, fire: 0.85 };
}

export default function MohacSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<Anim>({ ...ZERO });
  const targetRef = useRef<Anim>({ ...ZERO });
  const [step, setStep] = useState(0);          // 0..2 aktif adım, 3 = bitti
  const [picks, setPicks] = useState<{ key: string; out: string; trap: boolean }[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => { refreshScroll(); }, [step, picks.length]);

  /* ── Çizim ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0, visible = true, t = 0;

    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    const fit = () => {
      const cssW = canvas.clientWidth || W;
      const cssH = Math.round((cssW * H) / W);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.height = `${cssH}px`;
    };

    /** Küçük süvari/piyade işareti. */
    const unit = (x: number, y: number, w: number, h: number, color: string, alpha = 1) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x - w / 2, y - h / 2, w, h, 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const draw = () => {
      const a = animRef.current;
      fit();
      const s = canvas.width / W;
      ctx.setTransform(s, 0, 0, s, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // zemin
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0b1226');
      g.addColorStop(1, '#060a17');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // bataklık şeridi (Mohaç ovası) — dekoratif, deterministik
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 26; i++) {
        const x = rnd(i * 3.1) * W;
        const y = 200 + rnd(i * 7.7) * 40;
        ctx.fillStyle = i % 2 ? 'rgba(47,184,174,0.10)' : 'rgba(51,85,196,0.10)';
        ctx.beginPath();
        ctx.ellipse(x, y, 26 + rnd(i) * 30, 4 + rnd(i * 2) * 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* ── OSMANLI: üç hat (aşağıda) ── */
      const baseY = 392;
      // 3. hat: toplar + yeniçeri (zincirli top hattı)
      ctx.strokeStyle = `rgba(217,164,65,${0.45 + a.fire * 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(150, baseY);
      ctx.lineTo(650, baseY);
      ctx.stroke();
      for (let i = 0; i < 16; i++) {
        const x = 158 + i * 32;
        unit(x, baseY, 16, 9, GOLD, 0.9);
        if (a.fire > 0.02) {
          // namlu alevi
          const f = a.fire * (0.55 + 0.45 * Math.sin(t * 0.22 + i));
          ctx.globalAlpha = clamp(f, 0, 1) * 0.85;
          ctx.fillStyle = '#ffd9a0';
          ctx.beginPath();
          ctx.ellipse(x, baseY - 12 - f * 8, 4 + f * 4, 9 + f * 10, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
      // yeniçeri sırası (topların hemen arkası)
      for (let i = 0; i < 26; i++) unit(150 + i * 20, baseY + 22, 9, 9, '#e8e6df', 0.75);

      // 2. hat: sipahi
      for (let i = 0; i < 22; i++) unit(160 + i * 22, baseY - 40, 11, 8, COBALT, 0.85);

      // 1. hat: hafif süvari — geri çekiliyor (sahte ricat)
      const lightY = baseY - 78 + a.retreat * 46;
      for (let i = 0; i < 18; i++) {
        const spread = 1 + a.retreat * 0.55;                     // çekilirken yanlara açılır
        const x = W / 2 + (i - 8.5) * 26 * spread;
        unit(x, lightY + Math.sin(i * 1.3) * 3, 10, 7, ACCENT, 0.9 - a.retreat * 0.25);
      }

      /* ── KANATLAR: kontrollü kapanma ── */
      if (a.flank > 0.01) {
        ctx.globalAlpha = 0.9;
        for (const side of [-1, 1]) {
          for (let i = 0; i < 9; i++) {
            const px = W / 2 + side * (330 - a.flank * (120 + i * 8));
            const py = baseY - 120 + i * 13;
            unit(px, py, 10, 7, COBALT, 0.55 + a.flank * 0.35);
          }
        }
        ctx.globalAlpha = 1;
      }

      /* ── MACAR: ağır süvari bloğu (yukarıda, aşağı iner) ── */
      const hungY = 92 + a.adv * 215;
      const losses = a.fire;                                     // ateş altında erime
      for (let r = 0; r < 5; r++) {
        for (let i = 0; i < 20; i++) {
          const gone = losses > 0.15 && rnd(r * 31 + i * 7) < losses * 0.75;
          const x = W / 2 + (i - 9.5) * 26;
          const y = hungY + r * 20;
          if (gone) { unit(x, y, 12, 9, ASH, 0.18); continue; }
          unit(x, y, 12, 9, r === 0 ? MARBLE : CORAL, 0.95);
        }
      }
      // kral sancağı
      ctx.fillStyle = MARBLE;
      ctx.fillRect(W / 2 - 1, hungY - 34, 2, 26);
      ctx.fillStyle = CORAL;
      ctx.beginPath();
      ctx.moveTo(W / 2 + 1, hungY - 34);
      ctx.lineTo(W / 2 + 26, hungY - 28);
      ctx.lineTo(W / 2 + 1, hungY - 21);
      ctx.closePath();
      ctx.fill();

      /* ── Etiketler ── */
      ctx.font = '600 13px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(232,230,223,0.75)';
      ctx.fillText('MACAR AĞIR SÜVARİ — sen', 22, 34);
      ctx.fillStyle = 'rgba(217,164,65,0.8)';
      ctx.fillText('TOP HATTI + YENİÇERİ', 22, H - 22);
      ctx.fillStyle = 'rgba(47,184,174,0.8)';
      ctx.fillText('hafif süvari', 22, baseY - 86);

      // saat
      const clockTxt = step >= MOHAC_SIM.steps.length ? '17:00' : MOHAC_SIM.steps[step].clock;
      ctx.font = '700 15px ui-monospace, monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.textAlign = 'right';
      ctx.fillText(clockTxt, W - 22, 34);
      ctx.textAlign = 'left';
    };

    const ease = () => {
      const a = animRef.current, tg = targetRef.current;
      const k = reduced ? 1 : 0.055;
      a.adv += (tg.adv - a.adv) * k;
      a.retreat += (tg.retreat - a.retreat) * k;
      a.flank += (tg.flank - a.flank) * k;
      a.fire += (tg.fire - a.fire) * k;
    };

    const loop = () => {
      if (!visible) { raf = 0; return; }
      t += 1;
      ease();
      draw();
      raf = requestAnimationFrame(loop);
    };

    fit();
    ease(); draw();
    if (!reduced) raf = requestAnimationFrame(loop);

    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([e]) => {
          visible = e.isIntersecting;
          if (visible && !raf && !reduced) raf = requestAnimationFrame(loop);
        }, { rootMargin: '150px' })
      : null;
    io?.observe(canvas);

    const onResize = () => { fit(); draw(); };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [reduced, step]);

  function choose(key: string) {
    const s = MOHAC_SIM.steps[step];
    const opt = s.opts.find((o) => o.key === key);
    if (!opt) return;
    targetRef.current = targetFor(step, key);
    if (reduced) animRef.current = { ...targetRef.current };
    setPicks((p) => [...p, { key, out: opt.out, trap: opt.trap }]);
    setStep((n) => n + 1);
  }

  const done = step >= MOHAC_SIM.steps.length;
  const cur = done ? null : MOHAC_SIM.steps[step];

  return (
    <WidgetFrame
      hero
      kicker={`SAVAŞ SİMÜLASYONU · ${MOHAC.date.toUpperCase()}`}
      title="Sen Macar tarafındasın. Avrupa’nın en iyi ağır süvarisi senin elinde."
      hint="Üç karar vereceksin. Sonra hepsinin nereye çıktığını göreceksin."
      footnote={MOHAC.dispute}
    >
      <canvas ref={canvasRef} className="w-full rounded-xl border border-white/10" style={{ background: BG }} aria-label="Mohaç muharebe düzeni şeması" />

      {!done && cur && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md px-2 py-0.5 font-mono text-xs font-bold" style={{ background: `color-mix(in srgb, ${ACCENT} 18%, transparent)`, color: ACCENT }}>{cur.clock}</span>
            <span className="text-sm font-bold text-white">{cur.title}</span>
          </div>
          <div className="grid gap-2.5">
            {cur.opts.map((o) => (
              <button
                key={o.key}
                onClick={() => choose(o.key)}
                className="rounded-xl border border-white/12 bg-white/[0.03] p-3.5 text-left text-sm font-bold text-white transition hover:border-white/30 hover:bg-white/[0.06]"
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {picks.length > 0 && (
        <div className="mt-4 space-y-2">
          {picks.map((p, i) => (
            <div key={i} className="rounded-xl border p-3.5" style={{ borderColor: p.trap ? `color-mix(in srgb, ${CORAL} 35%, transparent)` : 'rgba(255,255,255,0.1)', background: p.trap ? `color-mix(in srgb, ${CORAL} 6%, transparent)` : 'rgba(255,255,255,0.02)' }}>
              <div className="mb-0.5 text-[0.62rem] font-bold tracking-[0.2em] text-slate-500">{MOHAC_SIM.steps[i].clock}</div>
              <p className="text-sm leading-relaxed text-slate-200">{p.out}</p>
            </div>
          ))}
        </div>
      )}

      {done && (
        <div className="mt-5" style={{ animation: 'kanuni-fade 0.5s ease' }}>
          <div className="rounded-xl border p-5 text-center" style={{ borderColor: `color-mix(in srgb, ${CORAL} 40%, transparent)`, background: `color-mix(in srgb, ${CORAL} 8%, transparent)` }}>
            <div className="font-mono text-2xl font-black" style={{ color: CORAL }}>{MOHAC_SIM.verdict}</div>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-300">{MOHAC_SIM.verdictSub}</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border p-3 text-center" style={{ borderColor: `color-mix(in srgb, ${GOLD} 30%, transparent)`, background: `color-mix(in srgb, ${GOLD} 9%, transparent)` }}>
              <div className="font-mono text-xl font-bold" style={{ color: GOLD }}>{MOHAC.marchDays}</div>
              <div className="mt-0.5 text-[0.68rem] text-slate-400">gün yürüyüş</div>
            </div>
            <div className="rounded-xl border p-3 text-center" style={{ borderColor: `color-mix(in srgb, ${CORAL} 30%, transparent)`, background: `color-mix(in srgb, ${CORAL} 9%, transparent)` }}>
              <div className="font-mono text-xl font-bold" style={{ color: CORAL }}>~{MOHAC.battleHours} saat</div>
              <div className="mt-0.5 text-[0.68rem] text-slate-400">muharebe</div>
            </div>
            <div className="rounded-xl border p-3 text-center" style={{ borderColor: `color-mix(in srgb, ${MARBLE} 25%, transparent)`, background: 'rgba(255,255,255,0.04)' }}>
              <div className="font-mono text-xl font-bold" style={{ color: MARBLE }}>1</div>
              <div className="mt-0.5 text-[0.68rem] text-slate-400">krallık</div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">{MOHAC.king}</p>
          <button
            onClick={() => { setPicks([]); setStep(0); targetRef.current = { ...ZERO }; if (reduced) animRef.current = { ...ZERO }; }}
            className="mt-4 w-full rounded-xl border px-4 py-3 text-sm font-bold transition hover:brightness-110"
            style={{ color: ACCENT, borderColor: `color-mix(in srgb, ${ACCENT} 35%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 8%, transparent)` }}
          >
            ↻ Başka bir kapıyı dene
          </button>
        </div>
      )}
    </WidgetFrame>
  );
}
