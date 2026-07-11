'use client';

// FAZ 1 — Derin Zaman Ekseni.
// Sticky sahne (eksen rayı + çapraz-geçen siluet) + üzerinden kayan metin beat'leri.
// Okuyucu aşağı kaydırdıkça geriye gider; hangi beat ekranın ortasına gelirse o
// aktifleşir (IntersectionObserver — ağır kütüphane yok). Kapanışta bütün eksen
// tek ekranda açığa çıkar (serbest keşif: dokun → detay). Palet: siyah-lacivert-
// elektrik mavisi. Fotoğraf yok; siluetler saf SVG.

import { useEffect, useRef, useState } from 'react';
import { ACCENT, NAVY, NAVY_MID } from './ui';
import { BEATS, FINALE_LINES, FINALE_PUNCH } from './data';

/* ───────────────────────── Siluetler (elektrik mavisi çizgi) ───────────────────────── */

function Silhouette({ kind }: { kind: string }) {
  const s = { fill: 'none', stroke: ACCENT, strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const P = (props: React.SVGProps<SVGPathElement>) => <path {...s} {...props} />;
  const common = { viewBox: '0 0 120 120', width: '100%', height: '100%', 'aria-hidden': true } as const;

  switch (kind) {
    case 'now':
      return <svg {...common}><circle cx="60" cy="46" r="16" {...s} /><circle cx="60" cy="46" r="4" fill={ACCENT} stroke="none" /><P d="M44 74 l16 14 16-14" opacity="0.8" /><P d="M44 90 l16 14 16-14" opacity="0.45" /></svg>;
    case 'ottoman':
      return <svg {...common}><P d="M34 92 V60 a26 26 0 0 1 52 0 V92" /><P d="M34 92 h52" /><P d="M60 34 a10 10 0 1 0 6 18 a8 8 0 1 1 -6 -18" /><P d="M46 92 V74 a6 8 0 0 1 12 0 V92" opacity="0.6" /></svg>;
    case 'roma':
      return <svg {...common}><P d="M40 30 h40 l-6 8 h-28 z" /><P d="M46 38 v46 M74 38 v46" /><P d="M54 42 v40 M66 42 v40" opacity="0.5" /><P d="M40 84 h40 M44 92 h32" /></svg>;
    case 'pyramid':
      return <svg {...common}><P d="M60 26 L96 92 H24 Z" /><P d="M60 26 L60 92" opacity="0.4" /><P d="M24 92 h72" /></svg>;
    case 'stonehenge':
      return <svg {...common}><P d="M34 44 h36 v10 h-36 z" /><P d="M38 54 v40 M66 54 v40" /><P d="M76 58 h22 v8 h-22 z" opacity="0.6" /><P d="M80 66 v28 M94 66 v28" opacity="0.6" /><P d="M28 94 h74" /></svg>;
    case 'writing':
      return <svg {...common}><rect x="34" y="30" width="52" height="62" rx="5" {...s} /><P d="M44 44 l6 4 l-6 4 M56 46 h20 M44 60 l6 4 l-6 4 M56 62 h16 M44 76 l6 4 l-6 4 M56 78 h22" opacity="0.75" /></svg>;
    case 'pottery':
      return <svg {...common}><P d="M50 34 h20 v6 q14 8 14 28 q0 22 -24 22 q-24 0 -24 -22 q0 -20 14 -28 z" /><P d="M50 40 q-14 6 -14 18 M70 40 q14 6 14 18" opacity="0.5" /><P d="M52 92 h16" /></svg>;
    case 'catalhoyuk':
      return <svg {...common}><P d="M30 92 v-26 h22 v26 M52 92 v-40 h24 v40 M76 92 v-20 h16 v20" /><P d="M30 66 h22 M52 52 h24 M76 72 h16" /><circle cx="64" cy="60" r="2.4" fill={ACCENT} stroke="none" /><P d="M42 66 v-10 M44 62 h-4 M44 58 h-4" opacity="0.6" /></svg>;
    case 'wheat':
      return <svg {...common}><P d="M60 96 V44" /><P d="M60 44 q-8 -8 -2 -18 q8 6 2 18 M60 44 q8 -8 2 -18" opacity="0.9" /><P d="M60 58 q-12 -4 -14 -14 M60 58 q12 -4 14 -14 M60 72 q-12 -4 -14 -14 M60 72 q12 -4 14 -14 M60 86 q-12 -4 -14 -14 M60 86 q12 -4 14 -14" /></svg>;
    case 'gobekli':
      return <svg {...common}><P d="M32 30 h56 v16 h-20 v58 a8 8 0 0 1 -16 0 v-58 h-20 z" strokeWidth={2.8} /><P d="M52 70 h16" opacity="0.7" /><P d="M56 78 q4 4 8 0" opacity="0.55" /><P d="M44 54 q6 -4 10 2 q-3 5 -8 3 q-4 -2 -2 -5z" opacity="0.6" /></svg>;
    default:
      return null; // 'void'
  }
}

/* ───────────────────────── Ana bileşen ───────────────────────── */

export default function DeepTimeAxis() {
  const [active, setActive] = useState(0);
  const beatRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.beat);
            if (!Number.isNaN(i)) setActive(i);
          }
        });
      },
      { rootMargin: '-48% 0px -48% 0px', threshold: 0 }, // ekran-ortası çizgisini kesen beat aktif
    );
    beatRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const progress = active / (BEATS.length - 1);
  const activeBeat = BEATS[active];
  const arrival = activeBeat.kind === 'gobekli';

  return (
    <div className="dta-root" style={{ background: NAVY }}>
      <div className="dta-wrap">
        {/* ── Sticky sahne ── */}
        <div className="dta-stage" aria-hidden>
          {/* zemin ışıması */}
          <div className="dta-glow" style={{ opacity: arrival ? 1 : 0.5 }} />
          {/* eksen rayı (sol) */}
          <div className="dta-rail">
            <div className="dta-rail-line" />
            <div className="dta-rail-fill" style={{ height: `${progress * 100}%` }} />
            <div className="dta-rail-marker" style={{ top: `${progress * 100}%` }} />
          </div>
          {/* çapraz-geçen siluetler */}
          <div className="dta-silo-box">
            {BEATS.map((b, i) => (
              <div key={b.n} className="dta-silo" style={{ opacity: i === active ? (arrival ? 1 : 0.85) : 0, transform: `scale(${i === active ? 1 : 0.9})` }}>
                <Silhouette kind={b.kind} />
              </div>
            ))}
          </div>
          {/* aktif etiket */}
          <div className="dta-stage-label">{activeBeat.label}</div>
        </div>

        {/* ── Kayan metin beat'leri ── */}
        <div className="dta-beats">
          {BEATS.map((b, i) => (
            <section
              key={b.n}
              data-beat={i}
              ref={(el) => { beatRefs.current[i] = el; }}
              className={`dta-beat${b.kind === 'void' ? ' dta-beat--void' : ''}${b.kind === 'gobekli' ? ' dta-beat--arrival' : ''}`}
              style={{ minHeight: `${b.scroll}svh` }}
            >
              {b.kind === 'void' ? (
                <div className="dta-void">
                  {b.lines.map((l, k) => <p key={k} className="dta-void-line">{l}</p>)}
                </div>
              ) : (
                <div className="dta-card">
                  <div className="dta-card-n">{b.n}</div>
                  {b.lines.map((l, k) => (
                    <p key={k} className={(k === 0 || (b.kind === 'gobekli' && k === 1)) ? 'dta-card-lead' : 'dta-card-line'}>{l}</p>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      {/* ── Kapanış: bütün eksen açığa çıkar + serbest keşif ── */}
      <Finale />

      <style>{`
        .dta-root { position: relative; color: #e6f2ff; }
        .dta-wrap { position: relative; }
        .dta-stage { position: sticky; top: 0; height: 100svh; overflow: hidden; display: grid; place-items: center; }
        .dta-glow { position: absolute; inset: 0; pointer-events: none; transition: opacity .6s ease;
          background:
            radial-gradient(60% 45% at 50% 42%, color-mix(in srgb, ${ACCENT} 20%, transparent), transparent 70%),
            radial-gradient(80% 60% at 50% 100%, ${NAVY_MID}, transparent 75%); }
        .dta-rail { position: absolute; left: clamp(14px, 5vw, 46px); top: 0; bottom: 0; width: 2px; }
        .dta-rail-line { position: absolute; inset: 0; background: linear-gradient(to bottom, color-mix(in srgb, ${ACCENT} 22%, transparent) 0%, color-mix(in srgb, ${ACCENT} 8%, transparent) 55%, transparent 100%); }
        .dta-rail-fill { position: absolute; left: 0; top: 0; width: 100%; background: ${ACCENT}; box-shadow: 0 0 10px ${ACCENT}; transition: height .5s cubic-bezier(.4,0,.2,1); }
        .dta-rail-marker { position: absolute; left: 50%; width: 15px; height: 15px; margin: -7.5px 0 0 -7.5px; border-radius: 50%; background: ${ACCENT}; box-shadow: 0 0 0 4px color-mix(in srgb, ${ACCENT} 22%, transparent), 0 0 16px ${ACCENT}; transition: top .5s cubic-bezier(.4,0,.2,1); }
        .dta-silo-box { position: relative; width: min(46vmin, 340px); aspect-ratio: 1; opacity: .9; }
        .dta-silo { position: absolute; inset: 0; transition: opacity .6s ease, transform .6s ease; filter: drop-shadow(0 0 14px color-mix(in srgb, ${ACCENT} 45%, transparent)); }
        .dta-stage-label { position: absolute; top: clamp(46px, 12svh, 120px); left: 0; right: 0; text-align: center;
          font-size: .72rem; font-weight: 700; letter-spacing: .32em; text-transform: uppercase;
          color: color-mix(in srgb, ${ACCENT} 85%, white); text-shadow: 0 0 12px color-mix(in srgb, ${ACCENT} 40%, transparent); }

        .dta-beats { position: relative; margin-top: -100svh; z-index: 3; }
        .dta-beat { display: flex; align-items: center; justify-content: flex-end; padding: 0 clamp(18px, 6vw, 64px); }
        .dta-card { width: min(100%, 440px); border: 1px solid color-mix(in srgb, ${ACCENT} 22%, transparent);
          background: color-mix(in srgb, ${NAVY} 82%, transparent); backdrop-filter: blur(9px);
          border-radius: 18px; padding: 24px 22px; box-shadow: 0 24px 60px -30px #000; }
        .dta-card-n { font-family: ui-monospace, monospace; font-size: .7rem; letter-spacing: .3em; color: color-mix(in srgb, ${ACCENT} 60%, transparent); margin-bottom: 12px; }
        .dta-card-line { font-size: 1.02rem; line-height: 1.6; color: #cfe3f5; margin: 0 0 10px; }
        .dta-card-line:last-child { margin-bottom: 0; }
        .dta-card-lead { font-size: clamp(1.4rem, 5.4vw, 1.95rem); font-weight: 800; line-height: 1.2; color: #fff; margin: 0 0 12px; text-shadow: 0 0 24px color-mix(in srgb, ${ACCENT} 38%, transparent); }
        .dta-card-lead + .dta-card-lead { margin-top: -4px; }

        .dta-beat--arrival .dta-card { border-color: color-mix(in srgb, ${ACCENT} 55%, transparent); box-shadow: 0 0 60px -12px color-mix(in srgb, ${ACCENT} 60%, transparent); }
        .dta-beat--void { justify-content: center; }
        .dta-void { display: flex; flex-direction: column; justify-content: space-between; align-items: center; min-height: 82svh; text-align: center; }
        .dta-void-line { font-size: 1.05rem; letter-spacing: .04em; color: color-mix(in srgb, #cfe3f5 60%, transparent); margin: 0; }
        .dta-void-line:nth-child(2) { font-size: 1.6rem; color: color-mix(in srgb, ${ACCENT} 55%, transparent); letter-spacing: .5em; }

        @media (min-width: 720px) { .dta-beat { justify-content: center; } }
        @media (prefers-reduced-motion: reduce) {
          .dta-silo, .dta-rail-fill, .dta-rail-marker, .dta-glow { transition: none; }
        }
      `}</style>
    </div>
  );
}

/* ───────────────────────── Kapanış / serbest keşif ───────────────────────── */

// Bugünden Göbeklitepe'ye linear "yıl önce" (BP, 2026 taban) — piramitin bize
// Göbeklitepe'den daha yakın oluşu bu ölçekte GÖZLE görülür.
// Piramit + Stonehenge tek noktada (neredeyse yaşıt; ayrı gösterilince etiketleri çakışıyor).
const OV = [
  { label: 'Bugün', bp: 0, kind: 'now', detail: BEATS[0].detail! },
  { label: '1453 · Fetih', bp: 573, kind: 'ottoman', detail: BEATS[1].detail! },
  { label: 'MÖ 27 · Roma', bp: 2053, kind: 'roma', detail: BEATS[2].detail! },
  { label: 'MÖ ~2500 · Piramit & Stonehenge', bp: 4586, kind: 'pyramid', detail: 'Giza’daki Büyük Piramit ve neredeyse yaşıtı Stonehenge. Çoğu insanın “en eski” sandığı yer.', arrival: false },
  { label: 'MÖ 3400 · Yazı', bp: 5426, kind: 'writing', detail: BEATS[5].detail! },
  { label: 'MÖ 7000 · Çömlek', bp: 9026, kind: 'pottery', detail: BEATS[6].detail! },
  { label: 'MÖ 7400 · Çatalhöyük', bp: 9426, kind: 'catalhoyuk', detail: BEATS[7].detail! },
  { label: 'MÖ 9000 · Tarım', bp: 11026, kind: 'wheat', detail: BEATS[8].detail! },
  { label: 'MÖ 9600 · Göbeklitepe', bp: 11626, kind: 'gobekli', detail: BEATS[10].detail!, arrival: true },
] as const;
const BP_MAX = 11626;

function Finale() {
  const [sel, setSel] = useState<number | null>(OV.length - 1); // Göbeklitepe açık başlar
  const chosen = sel !== null ? OV[sel] : null;

  return (
    <section className="dta-finale" style={{ background: NAVY }}>
      <div className="dta-finale-inner">
        {FINALE_LINES.map((l, i) => <p key={i} className={i === 0 ? 'dta-fin-up' : 'dta-fin-lead'}>{l}</p>)}

        {/* Bütün eksen tek ekranda — dokun, keşfet */}
        <div className="dta-ov">
          <div className="dta-ov-axis" role="group" aria-label="Zaman ekseni — dokunup keşfet">
            <div className="dta-ov-line" />
            {/* piramit ↔ bugün / piramit ↔ Göbeklitepe kıyas parantezleri */}
            <div className="dta-ov-bracket dta-ov-bracket--near" style={{ top: 0, height: `${(4586 / BP_MAX) * 100}%` }}>
              <span>piramitler → bugün<br /><b>~4.600 yıl</b></span>
            </div>
            <div className="dta-ov-bracket dta-ov-bracket--far" style={{ top: `${(4586 / BP_MAX) * 100}%`, height: `${((BP_MAX - 4586) / BP_MAX) * 100}%` }}>
              <span>piramitler → Göbeklitepe<br /><b>~7.000 yıl</b></span>
            </div>
            {OV.map((o, i) => (
              <button
                key={o.label}
                onClick={() => setSel(i)}
                aria-pressed={sel === i}
                className={`dta-ov-dot${sel === i ? ' is-sel' : ''}${'arrival' in o && o.arrival ? ' is-arrival' : ''}`}
                style={{ top: `${(o.bp / BP_MAX) * 100}%` }}
              >
                <span className="dta-ov-tick" />
                <span className="dta-ov-name">{o.label}</span>
              </button>
            ))}
          </div>

          <div className="dta-ov-detail">
            {chosen && (
              <>
                <div className="dta-ov-silo"><Silhouette kind={chosen.kind} /></div>
                <div className="dta-ov-detail-label">{chosen.label}</div>
                <p className="dta-ov-detail-text">{chosen.detail}</p>
              </>
            )}
          </div>
        </div>

        <div className="dta-punch">
          {FINALE_PUNCH.map((l, i) => <p key={i} className={i === FINALE_PUNCH.length - 1 ? 'dta-punch-final' : 'dta-punch-line'}>{l}</p>)}
        </div>
      </div>

      <style>{`
        .dta-finale { position: relative; padding: 14svh 0 12svh; color: #e6f2ff; }
        .dta-finale-inner { max-width: 900px; margin: 0 auto; padding: 0 clamp(18px, 6vw, 40px); }
        .dta-fin-up { font-family: ui-monospace, monospace; letter-spacing: .3em; text-transform: uppercase; font-size: .74rem; color: color-mix(in srgb, ${ACCENT} 75%, white); margin: 0 0 18px; }
        .dta-fin-lead { font-size: clamp(1.15rem, 3.4vw, 1.5rem); line-height: 1.55; color: #dcecfb; margin: 0 0 8px; max-width: 640px; }

        .dta-ov { display: grid; gap: 22px; margin: 40px 0; grid-template-columns: 1fr; }
        @media (min-width: 760px) { .dta-ov { grid-template-columns: 1fr 1fr; align-items: stretch; } }
        .dta-ov-axis { position: relative; min-height: 640px; padding-left: 8px; }
        .dta-ov-line { position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, color-mix(in srgb, ${ACCENT} 60%, transparent), color-mix(in srgb, ${ACCENT} 30%, transparent)); }
        .dta-ov-dot { position: absolute; left: 0; transform: translateY(-50%); display: flex; align-items: center; gap: 9px; background: none; border: none; cursor: pointer; padding: 3px 0; color: inherit; text-align: left; }
        .dta-ov-tick { width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0; margin-left: 1px; background: ${NAVY}; border: 2px solid color-mix(in srgb, ${ACCENT} 55%, transparent); transition: all .2s; }
        .dta-ov-dot.is-sel .dta-ov-tick { background: ${ACCENT}; border-color: ${ACCENT}; box-shadow: 0 0 12px ${ACCENT}; }
        .dta-ov-dot.is-arrival .dta-ov-tick { border-color: ${ACCENT}; box-shadow: 0 0 10px color-mix(in srgb, ${ACCENT} 60%, transparent); }
        .dta-ov-name { font-size: .82rem; color: #b9d3ea; white-space: nowrap; transition: color .2s; }
        .dta-ov-dot.is-sel .dta-ov-name { color: #fff; font-weight: 700; }
        .dta-ov-dot.is-arrival .dta-ov-name { color: ${ACCENT}; font-weight: 700; }
        .dta-ov-bracket { position: absolute; right: 4px; width: 2px; background: color-mix(in srgb, ${ACCENT} 18%, transparent); }
        .dta-ov-bracket span { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); white-space: nowrap; font-size: .64rem; line-height: 1.35; text-align: right; color: color-mix(in srgb, #b9d3ea 70%, transparent); }
        .dta-ov-bracket b { color: color-mix(in srgb, ${ACCENT} 90%, white); font-size: .72rem; }
        .dta-ov-bracket--far span { color: color-mix(in srgb, ${ACCENT} 70%, white); }

        .dta-ov-detail { border: 1px solid color-mix(in srgb, ${ACCENT} 20%, transparent); border-radius: 18px; background: color-mix(in srgb, ${NAVY_MID} 60%, transparent); padding: 24px; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center; min-height: 220px; }
        .dta-ov-silo { width: 96px; height: 96px; margin-bottom: 14px; filter: drop-shadow(0 0 12px color-mix(in srgb, ${ACCENT} 40%, transparent)); }
        .dta-ov-detail-label { font-weight: 800; color: #fff; margin-bottom: 8px; }
        .dta-ov-detail-text { font-size: .95rem; line-height: 1.55; color: #c6dcef; margin: 0; max-width: 320px; }

        @media (max-width: 759px) { .dta-ov-bracket span { display: none; } }

        .dta-punch { margin-top: 30px; border-top: 1px solid color-mix(in srgb, ${ACCENT} 18%, transparent); padding-top: 26px; }
        .dta-punch-line { font-size: clamp(1rem, 3vw, 1.2rem); color: #cfe3f5; margin: 0 0 8px; }
        .dta-punch-final { font-size: clamp(1.3rem, 4.4vw, 1.9rem); font-weight: 800; line-height: 1.3; color: #fff; margin: 12px 0 0; text-shadow: 0 0 26px color-mix(in srgb, ${ACCENT} 45%, transparent); }
      `}</style>
    </section>
  );
}
