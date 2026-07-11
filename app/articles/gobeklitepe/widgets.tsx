'use client';

// Göbeklitepe'ye ÖZEL interaktif modüller (hepsi SVG/DOM — hafif, SSR'a girer):
//  · DeepTimeScale   — YILDIZ: derin zaman kaydırıcısı ("piramitlerden de eski")
//  · PillarExplorer  — T-pilar kâşifi (tıklanabilir kabartma noktaları)
//  · EnclosureMap    — çevre haritası (A–D, tıkla → istatistik)
//  · NotYetInvented  — "MÖ 9600'de henüz yoktu" ızgarası
//  · quiz/timeline verisi data.ts'te

import { useMemo, useState } from 'react';
import { ACCENT, Chip, Stat, WidgetFrame, formatYear, tr } from './ui';
import { MILESTONES, GOBEKLI_BCE, PILLAR_HOTSPOTS, ENCLOSURES, NOT_YET } from './data';

export { refs } from './refs';

/* ══════════════════════ YILDIZ: Derin zaman kaydırıcısı ══════════════════════ */

const T_MIN = 11000;   // MÖ 11000
const T_MAX = -2025;   // MS 2025 (negatif = MS)
const SPAN = T_MIN - T_MAX;
const STEPS = 1000;
// slider konumu (0..STEPS) ↔ yıl. 0 = en eski (MÖ 12000), STEPS = bugün.
const yearOf = (i: number) => Math.round(T_MIN - (i / STEPS) * SPAN);
const idxOf = (yBCE: number) => Math.round(((T_MIN - yBCE) / SPAN) * STEPS);

export function DeepTimeScale() {
  const [i, setI] = useState(() => idxOf(GOBEKLI_BCE));
  const year = yearOf(i);

  // O ana en yakın kilometre taşı
  const nearest = useMemo(
    () => MILESTONES.reduce((b, m) => Math.abs(m.yearBCE - year) < Math.abs(b.yearBCE - year) ? m : b, MILESTONES[0]),
    [year],
  );

  const sorted = useMemo(() => [...MILESTONES].sort((a, b) => b.yearBCE - a.yearBCE), []);
  const yearsAgo = year >= 0 ? year + 2025 : 2025 - (-year);
  const atGobekli = Math.abs(year - GOBEKLI_BCE) < SPAN / STEPS * 1.5;

  return (
    <WidgetFrame
      hero
      kicker="İNTERAKTİF · YILDIZ MODÜL"
      title="Göbeklitepe ne kadar eski? Kaydır ve gör."
      hint="Zamanı geriye it. Her durakta insanlığın o an ne yapabildiğini gör — ve Göbeklitepe'nin nerede durduğunu."
      footnote={<>Tarihler en yaygın kabul gören radyokarbon/arkeolojik değerlerdir; bazıları ±birkaç yüzyıl tartışmalıdır. Göbeklitepe en eski tabaka ≈ {formatYear(GOBEKLI_BCE)}.</>}
    >
      {/* okuma */}
      <div className="rounded-xl border p-4 text-center transition-colors" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 32%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 9%, transparent)` }}>
        <div className="font-mono text-3xl font-black sm:text-4xl" style={{ color: ACCENT }}>{formatYear(year)}</div>
        <div className="mt-1 font-mono text-xs text-slate-500">≈ {tr(Math.round(yearsAgo / 100) * 100)} yıl önce</div>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-sm text-slate-300">
          <span aria-hidden>{nearest.icon}</span>
          <span>en yakın: <strong className="text-white">{nearest.label}</strong></span>
        </div>
      </div>

      <input
        type="range" min={0} max={STEPS} value={i}
        onChange={e => setI(+e.target.value)}
        className="mt-4 h-8 w-full" style={{ accentColor: ACCENT }}
        aria-label="Zaman (MÖ/MS yıl)" aria-valuetext={formatYear(year)}
      />

      {/* eksen + Göbeklitepe işareti */}
      <div className="relative mt-1 h-2 rounded-full bg-gradient-to-r from-amber-500/40 via-stone-500/30 to-sky-500/30">
        {sorted.map(m => (
          <span key={m.label} className="absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 bg-white/35" style={{ left: `${(idxOf(m.yearBCE) / STEPS) * 100}%` }} aria-hidden />
        ))}
        <span
          className="absolute top-1/2 z-10 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ left: `${(idxOf(GOBEKLI_BCE) / STEPS) * 100}%`, background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }}
          aria-hidden
        />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[0.6rem] text-slate-600">
        <span>MÖ 12.000</span><span>MÖ 6.000</span><span>MÖ 1</span><span>bugün</span>
      </div>

      {/* atlama düğmeleri */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {sorted.map(m => {
          const on = m.label === nearest.label;
          return (
            <button
              key={m.label}
              onClick={() => setI(idxOf(m.yearBCE))}
              aria-pressed={on}
              className={`min-h-[38px] rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? 'text-slate-950' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}
              style={on ? { background: ACCENT, borderColor: ACCENT } : undefined}
            >
              <span className="mr-1" aria-hidden>{m.icon}</span>{m.label}
            </button>
          );
        })}
      </div>

      <div className={`mt-3 rounded-xl border p-3.5 ${atGobekli ? '' : 'border-white/10 bg-white/[0.03]'}`}
        style={atGobekli ? { borderColor: `color-mix(in srgb, ${ACCENT} 40%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 10%, transparent)` } : undefined}>
        <p className="text-sm leading-relaxed text-slate-300">
          <span className="mr-1" aria-hidden>{nearest.icon}</span>
          <strong className="text-white">{nearest.label} · {formatYear(nearest.yearBCE)}.</strong> {nearest.note}
        </p>
      </div>
    </WidgetFrame>
  );
}

/* ══════════════════════ T-pilar kâşifi ══════════════════════ */

export function PillarExplorer() {
  const [sel, setSel] = useState<string | null>('eller');
  const active = PILLAR_HOTSPOTS.find(h => h.id === sel) ?? null;

  return (
    <WidgetFrame
      kicker="İNTERAKTİF · KEŞFET"
      title="Bir T-pilar aslında ne?"
      hint="Noktalara dokun. T biçimli taş, yüzü olmayan dev bir insan — kolları, elleri, kemeri ve peştamalıyla."
      footnote={<>Betimleme şematiktir; ayrıntılar Göbeklitepe Çevre D’deki merkezi pilarlar (Pilar 18 &amp; 31) temel alınarak basitleştirilmiştir.</>}
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-start">
        {/* SVG pilar */}
        <div className="mx-auto w-full max-w-[220px]">
          <svg viewBox="0 0 200 300" className="h-auto w-full select-none" role="img" aria-label="T biçimli pilar şeması">
            {/* gövde */}
            <defs>
              <linearGradient id="stone" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#c9a06a" /><stop offset="0.5" stopColor="#a97e49" /><stop offset="1" stopColor="#8a6236" />
              </linearGradient>
            </defs>
            {/* dikey gövde */}
            <rect x="66" y="70" width="68" height="215" rx="5" fill="url(#stone)" stroke="#6b4a28" strokeWidth="1.5" />
            {/* T başı */}
            <rect x="30" y="34" width="140" height="46" rx="6" fill="url(#stone)" stroke="#6b4a28" strokeWidth="1.5" />
            {/* kollar (yan) */}
            <path d="M70 96 q-8 3 -8 60" fill="none" stroke="#6b4a28" strokeWidth="2.5" opacity="0.7" />
            <path d="M130 96 q8 3 8 60" fill="none" stroke="#6b4a28" strokeWidth="2.5" opacity="0.7" />
            {/* eller (önde, karında birleşen parmaklar) */}
            <path d="M74 156 q26 14 52 0" fill="none" stroke="#5c3f22" strokeWidth="2.5" />
            {[0,1,2,3].map(k => <line key={k} x1={86+k*7} y1="163" x2={86+k*7} y2="150" stroke="#5c3f22" strokeWidth="1.6" />)}
            {[0,1,2,3].map(k => <line key={'r'+k} x1={114-k*7} y1="163" x2={114-k*7} y2="150" stroke="#5c3f22" strokeWidth="1.6" />)}
            {/* kemer */}
            <rect x="66" y="196" width="68" height="12" fill="#7a532c" stroke="#5c3f22" strokeWidth="1" />
            {/* toka */}
            <rect x="94" y="197" width="12" height="10" rx="2" fill="#5c3f22" />
            {/* peştamal (tilki postu) */}
            <path d="M74 208 h52 l-6 34 h-40 z" fill="#8a5a2e" stroke="#5c3f22" strokeWidth="1" opacity="0.85" />
            {/* hayvan kabartması (gövdede, sağda — örnek: sıçrayan tilki silüeti) */}
            <path d="M140 118 q10 -6 20 0 q-3 9 -10 9 q-8 0 -10 -9z M158 116 l5 -4" fill="#6b4a28" stroke="#5c3f22" strokeWidth="0.8" opacity="0.85" />

            {/* hotspot noktaları */}
            {PILLAR_HOTSPOTS.map((h, idx) => {
              const on = h.id === sel;
              return (
                <g key={h.id} onClick={() => setSel(h.id)} style={{ cursor: 'pointer' }}>
                  <circle cx={h.x} cy={h.y} r={on ? 11 : 8} fill={on ? ACCENT : 'rgba(0,0,0,0.5)'} stroke={on ? '#fff' : ACCENT} strokeWidth="2" />
                  <text x={h.x} y={h.y + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill={on ? '#3a2410' : '#fff'}>{idx + 1}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* seçili nokta açıklaması + liste */}
        <div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {PILLAR_HOTSPOTS.map((h, idx) => (
              <Chip key={h.id} active={h.id === sel} onClick={() => setSel(h.id)}>
                <span className="font-mono">{idx + 1}</span><span className="ml-1.5">{h.label}</span>
              </Chip>
            ))}
          </div>
          {active && (
            <div className="rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 7%, transparent)` }}>
              <h4 className="mb-1.5 font-bold text-white">{active.label}</h4>
              <p className="text-sm leading-relaxed text-slate-300">{active.desc}</p>
            </div>
          )}
        </div>
      </div>
    </WidgetFrame>
  );
}

/* ══════════════════════ Çevre haritası ══════════════════════ */

export function EnclosureMap() {
  const [sel, setSel] = useState(ENCLOSURES[0]?.id ?? 'D');
  const active = ENCLOSURES.find(e => e.id === sel) ?? ENCLOSURES[0];

  return (
    <WidgetFrame
      kicker="İNTERAKTİF · HARİTA"
      title="Dört taş çember"
      hint="Her biri yüzlerce yıl arayla kazılmış dev bir çember. Birine dokun, içindekini gör."
      footnote={<>Ölçüler yaklaşıktır; kazı sürdükçe güncellenir. Alanın yalnızca küçük bir bölümü açıldı — jeofizik taramalar toprak altında daha fazla çember olduğunu gösteriyor.</>}
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,240px)_1fr] sm:items-center">
        {/* şematik plan */}
        <svg viewBox="0 0 240 240" className="mx-auto h-auto w-full max-w-[240px]" role="img" aria-label="Çevrelerin şematik yerleşimi">
          {ENCLOSURES.map((e) => {
            const on = e.id === sel;
            return (
              <g key={e.id} onClick={() => setSel(e.id)} style={{ cursor: 'pointer' }}>
                <circle cx={e.cx} cy={e.cy} r={e.r} fill={on ? `color-mix(in srgb, ${ACCENT} 22%, transparent)` : 'rgba(255,255,255,0.03)'} stroke={on ? ACCENT : 'rgba(255,255,255,0.25)'} strokeWidth={on ? 2.5 : 1.5} />
                {/* çevredeki T pilarları (küçük çizgiler) */}
                {Array.from({ length: 10 }).map((_, k) => {
                  const a = (k / 10) * Math.PI * 2;
                  const x1 = e.cx + Math.cos(a) * (e.r - 7), y1 = e.cy + Math.sin(a) * (e.r - 7);
                  const x2 = e.cx + Math.cos(a) * (e.r - 1), y2 = e.cy + Math.sin(a) * (e.r - 1);
                  return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={on ? ACCENT : 'rgba(255,255,255,0.3)'} strokeWidth="2" />;
                })}
                {/* merkezi ikiz pilar */}
                <rect x={e.cx - 5} y={e.cy - 8} width="3.5" height="16" fill={on ? '#fff' : 'rgba(255,255,255,0.5)'} />
                <rect x={e.cx + 1.5} y={e.cy - 8} width="3.5" height="16" fill={on ? '#fff' : 'rgba(255,255,255,0.5)'} />
                <text x={e.cx} y={e.cy + e.r + 12} textAnchor="middle" fontSize="12" fontWeight="800" fill={on ? ACCENT : 'rgba(255,255,255,0.5)'}>{e.id}</text>
              </g>
            );
          })}
        </svg>

        {/* seçili çevre bilgisi */}
        {active && (
          <div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {ENCLOSURES.map(e => <Chip key={e.id} active={e.id === sel} onClick={() => setSel(e.id)}>Çevre {e.id}</Chip>)}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Stat value={active.diameter} label="çap (m)" />
              <Stat value={active.pillars} label="T-pilar" />
              <Stat value={active.dominant} label="baskın figür" mono={false} />
            </div>
            <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-relaxed text-slate-300">{active.note}</p>
          </div>
        )}
      </div>
    </WidgetFrame>
  );
}

/* ══════════════════════ "Henüz icat edilmemişti" ══════════════════════ */

export function NotYetInvented() {
  return (
    <WidgetFrame
      kicker="ÖLÇEK ŞOKU"
      title="Göbeklitepe inşa edilirken henüz…"
      hint="Bu çemberleri kaldıran insanlar, aşağıdakilerin HİÇBİRİNE sahip değildi."
    >
      <div className="grid gap-2.5 sm:grid-cols-2">
        {NOT_YET.map(n => (
          <div key={n.label} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-lg" style={{ background: `color-mix(in srgb, ${ACCENT} 12%, transparent)` }} aria-hidden>{n.icon}</span>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-white">{n.label}</span>
                <span className="font-mono text-[0.62rem]" style={{ color: ACCENT }}>{n.after}</span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{n.note}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm font-medium text-slate-300">
        Ne yazı, ne tekerlek, ne metal, ne çömlek. Bazılarına göre daha tarım bile yoktu. Yine de{' '}
        <span style={{ color: ACCENT }}>onlarca tonluk taşları diktiler.</span>
      </p>
    </WidgetFrame>
  );
}
