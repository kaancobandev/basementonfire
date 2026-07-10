'use client';

// Radyoaktivite makalesinin HAFİF modülleri (canvas/ses yok → SSR'a girer, taranır):
//  · BodyActivity  — "Sen ne kadar radyoaktifsin?" + paylaşım kartı
//  · DoseSlider    — logaritmik doz kıyaslama
//  · DecayChain    — U-238 → Pb-206, 14 adım, radon vurgulu

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BANANA_SV, BODY, CHAIN, DEFAULT_WEIGHT, DOSES, DOSE_MAX_SV, DOSE_MIN_SV,
} from './data';
import { ACCENT, ActionButton, RAY, WidgetFrame, refreshScroll, tr } from './ui';

export { refs } from './refs';

/* ══════════════════ Sen ne kadar radyoaktifsin? ══════════════════ */

export function BodyActivity() {
  const [kg, setKg] = useState(DEFAULT_WEIGHT);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState('');
  const started = useRef(0);

  const k40 = Math.round(kg * BODY.k40);
  const c14 = Math.round(kg * BODY.c14);
  const other = Math.round(kg * BODY.other);
  const total = k40 + c14 + other;

  useEffect(() => {
    started.current = performance.now();
    const id = setInterval(() => setElapsed((performance.now() - started.current) / 1000), 120);
    return () => clearInterval(id);
  }, []);

  const sinceOpen = Math.floor(elapsed * total);
  const parts = [
    { label: 'Potasyum-40', v: k40, color: '#a3e635', why: 'Kaslarınız ve sinirleriniz potasyumsuz çalışmaz. Her 10.000 potasyum atomundan yaklaşık biri radyoaktif.' },
    { label: 'Karbon-14', v: c14, color: '#22d3ee', why: 'Nefes aldığınız ve yediğiniz her şeyden gelir. Öldüğünüz an alım durur — ve saat başlar.' },
    { label: 'Rubidyum-87 + eser', v: other, color: '#c084fc', why: 'Kalanı: rubidyum-87, biraz polonyum-210, kurşun-210, trityum.' },
  ];

  /* ── paylaşım kartı (1080×1080 PNG) ── */
  async function shareCard() {
    const size = 1080;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const x = c.getContext('2d');
    if (!x) return;

    const g = x.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, '#04120c'); g.addColorStop(0.55, '#0d2818'); g.addColorStop(1, '#1a2e05');
    x.fillStyle = g; x.fillRect(0, 0, size, size);

    const glow = x.createRadialGradient(size * 0.5, size * 0.42, 40, size * 0.5, size * 0.42, size * 0.55);
    glow.addColorStop(0, 'rgba(163,230,53,0.22)'); glow.addColorStop(1, 'rgba(163,230,53,0)');
    x.fillStyle = glow; x.fillRect(0, 0, size, size);

    x.strokeStyle = 'rgba(163,230,53,0.35)'; x.lineWidth = 6;
    x.strokeRect(40, 40, size - 80, size - 80);

    x.textAlign = 'center';
    x.fillStyle = ACCENT;
    x.font = 'bold 30px system-ui, sans-serif';
    x.fillText('☢  V Ü C U D U M D A  Ş U  A N', size / 2, 250);

    x.fillStyle = '#ffffff';
    x.font = 'bold 190px system-ui, sans-serif';
    x.fillText(tr(total), size / 2, 470);

    x.fillStyle = 'rgba(255,255,255,0.9)';
    x.font = '46px system-ui, sans-serif';
    x.fillText('atom çekirdeği', size / 2, 550);
    x.fillText('her saniye parçalanıyor', size / 2, 615);

    x.fillStyle = 'rgba(255,255,255,0.55)';
    x.font = '30px system-ui, sans-serif';
    x.fillText(`${tr(kg)} kg · potasyum-40: ${tr(k40)} · karbon-14: ${tr(c14)}`, size / 2, 720);

    x.fillStyle = 'rgba(163,230,53,0.85)';
    x.font = 'bold 34px system-ui, sans-serif';
    x.fillText('Ve bu tamamen normal.', size / 2, 800);

    x.fillStyle = 'rgba(255,255,255,0.4)';
    x.font = '28px system-ui, sans-serif';
    x.fillText('basementonfire.com', size / 2, 985);

    const blob: Blob | null = await new Promise(res => c.toBlob(res, 'image/png'));
    if (!blob) return;
    const file = new File([blob], 'radyoaktivite.png', { type: 'image/png' });

    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Vücudumda saniyede ' + tr(total) + ' atom parçalanıyor' }); return; } catch { /* iptal edildi */ }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'radyoaktivite-basements.png';
    a.click();
    URL.revokeObjectURL(url);
    setCopied('indirildi');
    setTimeout(() => setCopied(''), 2000);
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(`Vücudumda saniyede ${tr(total)} atom parçalanıyor. Ve bu tamamen normal. — basementonfire.com`);
      setCopied('kopyalandı');
      setTimeout(() => setCopied(''), 2000);
    } catch { /* pano izni yok */ }
  }

  return (
    <WidgetFrame
      kicker="İNTERAKTİF · KENDİNİ ÖLÇ"
      title="Sen ne kadar radyoaktifsin?"
      hint="Kilonu gir. Şu an vücudunda saniyede kaç atom çekirdeğinin parçalandığını gör."
      footnote={
        <>
          Kaba bir tahmin. Potasyum yağ dokusunda neredeyse hiç bulunmaz, bu yüzden vücut yağ oranı yüksek kişilerde
          kilogram başına aktivite bu değerin altına düşer. Referans: 70 kg yetişkin ≈ {tr(70 * BODY.total)} Bq
          (ICRP Yayın 23; UNSCEAR 2000).
        </>
      }
    >
      {/* sonuç */}
      <div className="rounded-xl border p-5 text-center" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 8%, transparent)` }}>
        <div className="text-[0.65rem] font-bold tracking-[0.25em] text-slate-400">SANİYEDE</div>
        <div className="my-1 font-mono text-4xl font-black tabular-nums sm:text-6xl" style={{ color: ACCENT }}>{tr(total)}</div>
        <div className="text-sm text-slate-300">atom çekirdeği parçalanıyor</div>
        <div className="mt-1 font-mono text-xs text-slate-500">{tr(total)} bekerel (Bq)</div>
      </div>

      {/* kilo */}
      <label className="mt-4 block">
        <span className="flex items-center justify-between text-sm text-slate-300">
          <span>Vücut ağırlığın</span>
          <span className="font-mono" style={{ color: ACCENT }}>{tr(kg)} kg</span>
        </span>
        <input
          type="range" min={3} max={150} value={kg}
          onChange={e => setKg(+e.target.value)}
          className="mt-2 h-8 w-full" style={{ accentColor: ACCENT }}
          aria-label="Vücut ağırlığı (kg)"
        />
      </label>

      {/* dağılım */}
      <div className="mt-4 space-y-2">
        {parts.map(p => (
          <div key={p.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold" style={{ color: p.color }}>{p.label}</span>
              <span className="shrink-0 font-mono text-sm text-slate-300">{tr(p.v)} Bq</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(p.v / total) * 100}%`, background: p.color }} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{p.why}</p>
          </div>
        ))}
      </div>

      {/* açıldığından beri sayaç */}
      <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3.5 text-center">
        <div className="text-xs text-slate-500">Bu bölümü açtığından beri vücudunda</div>
        <div className="my-0.5 font-mono text-2xl font-bold tabular-nums text-white">{tr(sinceOpen)}</div>
        <div className="text-xs text-slate-500">atom parçalandı. Ve hiçbir şey hissetmedin.</div>
      </div>

      {/* paylaş */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        <ActionButton onClick={shareCard}>📸 Kartı paylaş</ActionButton>
        <ActionButton onClick={copyText} tone="ghost">{copied || '📋 Metni kopyala'}</ActionButton>
      </div>
    </WidgetFrame>
  );
}

/* ══════════════════════ Doz kıyaslama ══════════════════════ */

const L_MIN = Math.log10(DOSE_MIN_SV), L_MAX = Math.log10(DOSE_MAX_SV);
const STEPS = 1000;
const svOf = (i: number) => Math.pow(10, L_MIN + (i / STEPS) * (L_MAX - L_MIN));
const idxOf = (sv: number) => Math.round(((Math.log10(sv) - L_MIN) / (L_MAX - L_MIN)) * STEPS);

function formatSv(sv: number) {
  if (sv < 1e-3) return { n: tr(sv * 1e6, sv * 1e6 < 10 ? 1 : 0), u: 'µSv' };
  if (sv < 1) return { n: tr(sv * 1e3, sv * 1e3 < 10 ? 1 : 0), u: 'mSv' };
  return { n: tr(sv, 1), u: 'Sv' };
}

const TONE = { calm: '#a3e635', mid: '#fbbf24', hot: '#f43f5e' } as const;

export function DoseSlider() {
  const [i, setI] = useState(() => idxOf(4e-5)); // uçuşla aç
  const sv = svOf(i);
  const fmt = formatSv(sv);

  const nearest = useMemo(
    () => DOSES.reduce((best, d) => Math.abs(Math.log10(d.sv) - Math.log10(sv)) < Math.abs(Math.log10(best.sv) - Math.log10(sv)) ? d : best, DOSES[0]),
    [sv],
  );
  const bananas = sv / BANANA_SV;
  const tone = TONE[nearest.tone];

  return (
    <WidgetFrame
      kicker="İNTERAKTİF · ÖLÇEK DUYGUSU"
      title="Doz kıyaslama"
      hint="Kaydırıcı logaritmiktir: her adım on katı. Amaç korkutmak değil, büyüklük mertebesini hissettirmek."
      footnote={
        <>
          <strong className="text-slate-400">Dipnot — muz eşdeğer dozu neden biraz sahtekârdır:</strong> vücudunuz potasyum seviyesini
          sıkı biçimde sabit tutar. Fazladan bir muz yediğinizde fazla potasyum idrarla gider ve toplam radyoaktivite
          yükünüz birkaç saat içinde eski hâline döner. Yani muzlar birikmez. Sağlık Fiziği Derneği (HPS) de bunu resmî
          bir birim olarak tanımaz. Muz dozu gerçek bir birikimden çok, &quot;radyasyon&quot; kelimesinin kendi başına bir
          felaket ilanı olmadığını anlatan bir pedagoji numarasıdır.
        </>
      }
    >
      {/* okuma */}
      <div className="rounded-xl border p-4 text-center transition-colors" style={{ borderColor: `color-mix(in srgb, ${tone} 32%, transparent)`, background: `color-mix(in srgb, ${tone} 8%, transparent)` }}>
        <div className="font-mono text-3xl font-black sm:text-4xl" style={{ color: tone }}>
          {fmt.n}<span className="ml-1 text-lg">{fmt.u}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-slate-300">
          <span aria-hidden>{nearest.icon}</span>
          <span>en yakın: <strong className="text-white">{nearest.label}</strong></span>
        </div>
        <div className="mt-1 font-mono text-xs text-slate-500">≈ {tr(bananas, bananas < 10 ? 1 : 0)} muz</div>
      </div>

      <input
        type="range" min={0} max={STEPS} value={i}
        onChange={e => setI(+e.target.value)}
        className="mt-4 h-8 w-full" style={{ accentColor: tone }}
        aria-label="Radyasyon dozu (logaritmik)"
        aria-valuetext={`${fmt.n} ${fmt.u}`}
      />

      {/* ölçek çizgisi */}
      <div className="relative mt-1 h-1.5 rounded-full bg-gradient-to-r from-lime-500/40 via-amber-500/40 to-rose-500/50">
        {DOSES.map(d => (
          <span key={d.key} className="absolute top-1/2 h-2 w-0.5 -translate-y-1/2 bg-white/40" style={{ left: `${(idxOf(d.sv) / STEPS) * 100}%` }} aria-hidden />
        ))}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[0.6rem] text-slate-600">
        <span>0,1 µSv</span><span>1 µSv</span><span>1 mSv</span><span>10 Sv</span>
      </div>

      {/* atlama noktaları */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {DOSES.map(d => {
          const on = d.key === nearest.key;
          return (
            <button
              key={d.key}
              onClick={() => setI(idxOf(d.sv))}
              aria-pressed={on}
              className={`min-h-[38px] rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? 'text-slate-950' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
              style={on ? { background: TONE[d.tone], borderColor: TONE[d.tone] } : undefined}
            >
              <span className="mr-1" aria-hidden>{d.icon}</span>{d.label}
            </button>
          );
        })}
      </div>

      <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-relaxed text-slate-300">
        <strong className="text-white">{nearest.label}</strong> — {nearest.note}
      </p>
    </WidgetFrame>
  );
}

/* ══════════════════════ Bozunma zinciri ══════════════════════ */

const LOG_MIN = Math.log10(CHAIN.reduce((m, s) => Math.min(m, s.halfLifeS), Infinity));
const LOG_MAX = Math.log10(CHAIN.reduce((m, s) => Math.max(m, s.halfLifeS), 0));

export function DecayChain() {
  const [open, setOpenState] = useState<number | null>(6); // radon adımı açık başlasın
  // Adım aç/kapa yüksekliği değiştirir; çizelge bunun altında → pin konumunu tazele.
  const setOpen = (v: number | null) => { setOpenState(v); refreshScroll(); };
  const alphas = CHAIN.filter(s => s.mode === 'alpha').length;
  const betas = CHAIN.filter(s => s.mode === 'beta').length;

  return (
    <WidgetFrame
      kicker="İNTERAKTİF · HARİTA"
      title="Uranyum-238'den kurşun-206'ya: 14 adım"
      hint="Her ok bir bozunma. Bir adıma dokun — ne kadar sürdüğünü ve neyin çıktığını gör."
      footnote={
        <>
          Dallanan basamaklarda ana kol (&gt;%99,9) gösterildi; gerçek zincir birkaç ince yan yola da ayrılır.
          Yarılanma süreleri: NNDC (Brookhaven) çekirdek veri tabanı.
        </>
      }
    >
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border px-3 py-1 font-semibold" style={{ color: RAY.alpha.color, borderColor: `color-mix(in srgb, ${RAY.alpha.color} 35%, transparent)`, background: `color-mix(in srgb, ${RAY.alpha.color} 10%, transparent)` }}>
          {alphas} × alfa (α)
        </span>
        <span className="rounded-full border px-3 py-1 font-semibold" style={{ color: RAY.beta.color, borderColor: `color-mix(in srgb, ${RAY.beta.color} 35%, transparent)`, background: `color-mix(in srgb, ${RAY.beta.color} 10%, transparent)` }}>
          {betas} × beta (β)
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-400">
          8 alfa çekirdeği 238&rarr;206, 6 beta yükü 82&apos;ye taşır
        </span>
      </div>

      <ol className="space-y-1">
        {CHAIN.map((s, i) => {
          const c = RAY[s.mode].color;
          const isOpen = open === i;
          const isRadon = s.to === 'Radon-222';
          const w = (Math.log10(s.halfLifeS) - LOG_MIN) / (LOG_MAX - LOG_MIN);
          return (
            <li key={s.from}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className={`w-full rounded-xl border p-2.5 text-left transition ${isOpen ? 'border-white/25 bg-white/[0.07]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-center font-mono text-[0.6rem] text-slate-600">{i + 1}</span>
                  <span className="shrink-0 font-mono text-sm font-bold text-slate-200">{s.fromSym}</span>
                  <span className="flex min-w-0 flex-1 items-center gap-1">
                    <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${c})` }} />
                    <span className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[0.6rem] font-bold" style={{ color: c, background: `color-mix(in srgb, ${c} 15%, transparent)` }}>
                      {RAY[s.mode].symbol}
                    </span>
                    <span className="shrink-0 text-xs" style={{ color: c }}>&rarr;</span>
                  </span>
                  <span className={`shrink-0 font-mono text-sm font-bold ${isRadon ? '' : 'text-slate-200'}`} style={isRadon ? { color: ACCENT } : undefined}>
                    {s.toSym}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2 pl-7">
                  <span className="h-1 rounded-full" style={{ width: `${Math.max(3, w * 62)}%`, background: `color-mix(in srgb, ${c} 45%, transparent)` }} aria-hidden />
                  <span className="font-mono text-[0.62rem] text-slate-500">{s.halfLife}</span>
                </div>
                {isOpen && s.note && (
                  <p className="mt-2 border-t border-white/10 pl-7 pt-2 text-xs leading-relaxed text-slate-400">{s.note}</p>
                )}
              </button>
            </li>
          );
        })}
        <li className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
          <span className="w-5 shrink-0 text-center font-mono text-[0.6rem] text-slate-600">✓</span>
          <span className="font-mono text-sm font-bold text-slate-400">²⁰⁶Pb</span>
          <span className="text-xs text-slate-500">kararlı — zincir burada durur. 4,5 milyar yıllık yolculuk biter.</span>
        </li>
      </ol>

      {/* radon çağrısı */}
      <div className="mt-4 rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 32%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 8%, transparent)` }}>
        <div className="mb-1.5 flex items-center gap-2">
          <span aria-hidden>🏚️</span>
          <h4 className="text-sm font-bold" style={{ color: ACCENT }}>Radon-222 — evinizin bodrumunda bu var</h4>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">
          Zincirin yedinci adımı bir <strong className="text-white">soy gaz</strong> üretir. Katı değil, gaz: kayanın
          çatlaklarından sızar, temelden içeri girer ve havadan ağır olduğu için en alt katta birikir. Soluduğunuzda
          alfa yayıcısı ciğerinizin içine yerleşir. Radon, sigaradan sonra akciğer kanserinin ikinci nedenidir.
          Bir mahzen sitesinde bunu söylemek biraz tuhaf, farkındayız.
        </p>
      </div>
    </WidgetFrame>
  );
}
