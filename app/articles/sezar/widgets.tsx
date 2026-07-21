'use client';

// Sezar makalesinin HAFİF interaktif modülleri (canvas/GSAP yok → SSR'a girer,
// Google tarar). Ağır olanlar sim-*.tsx'te ve InView ile lazy yüklenir.

import { useEffect, useMemo, useRef, useState } from 'react';
import { ProofShare } from '@/app/components/article/ProofCard';
import {
  ACCENT, BG, GOLD, MARBLE, ASH, TRIUMVIR_COLOR,
  WidgetFrame, Stat, ActionButton, SourceNote,
  tr, yearLabel, prefersReduced, useInViewOnce, useProgress, refreshScroll,
} from './ui';
import {
  RANSOM, ransomVerdict,
  TRIUMVIRS, BONDS, JULIA, type TriumvirKey,
  GAUL_YEARS, GAUL_TOLL, GAUL_MODERN_NOTE, GAUL_THIRD_MYTH,
  RHINE,
  RUBICON, RUBICON_CHOICES, RUBICON_TRUTH,
  PHARSALUS,
  NAME_TREE, NAME_PAYOFF, NAME_EXTRA,
} from './data';

/* ══════════════════ 1 · Fidye kaydırıcısı (Perde 1, ~%5) ══════════════════ */

const RANSOM_TONE = { low: ASH, mid: '#c9a227', high: GOLD, caesar: ACCENT } as const;

export function RansomSlider() {
  const [t, setT] = useState<number>(RANSOM.asked);
  const v = ransomVerdict(t);
  const tone = RANSOM_TONE[v.tone];
  const kg = Math.round(t * RANSOM.kgPerTalent);
  const years = Math.round((t * RANSOM.denariiPerTalent) / RANSOM.legionaryYearDenarii);

  return (
    <WidgetFrame
      kicker="İNTERAKTİF · MÖ 75"
      title="Korsanlar 20 talent istedi. Sen ne kadar ederdin?"
      hint="Kaydır. Talent, antik dünyanın en büyük para birimiydi — bir talent yaklaşık 26 kilo gümüş."
      footnote={<>{v.text}</>}
    >
      <div
        className="rounded-xl border p-4 text-center transition-colors"
        style={{ borderColor: `color-mix(in srgb, ${tone} 32%, transparent)`, background: `color-mix(in srgb, ${tone} 8%, transparent)` }}
      >
        <div className="font-mono text-4xl font-black sm:text-5xl" style={{ color: tone }}>
          {tr(t)}<span className="ml-2 text-xl font-bold">talent</span>
        </div>
        <div className="mt-1 text-xs text-slate-400">
          ≈ {tr(kg)} kg gümüş · bir lejyonerin {tr(years)} yıllık maaşı
        </div>
      </div>

      <input
        type="range"
        min={RANSOM.min}
        max={RANSOM.max}
        value={t}
        onChange={(e) => setT(+e.target.value)}
        className="mt-4 h-8 w-full"
        style={{ accentColor: tone }}
        aria-label="Fidye (talent)"
        aria-valuetext={`${t} talent`}
      />
      <div className="mt-1 flex justify-between text-[0.65rem] text-slate-500">
        <span>{RANSOM.min}</span>
        <button onClick={() => setT(RANSOM.asked)} className="hover:text-slate-300">korsanların isteği: 20 ↑</button>
        <button onClick={() => setT(RANSOM.demanded)} className="hover:text-slate-300">↑ Caesar: 50</button>
        <span>{RANSOM.max}</span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-300">
        Bu adam riski senin gibi hesaplamıyordu. Serbest kalınca döndü, korsanların hepsini yakaladı ve
        söz verdiği gibi çarmıha gerdi — ama önce, acı çekmesinler diye boğazlarını kestirdi. Onlara ısınmıştı.
      </p>

      {/* Okurun kendi rakamı: kaç talent ettiğini seçti, kart onu somutlaştırıyor. */}
      <ProofShare
        label="Kendi fiyatını paylaş"
        spec={{
          kicker: '⚔  M Ö  7 5  ·  K O R S A N  F İ D Y E S İ',
          value: `${tr(t)} talent`,
          lines: ['Kendime biçtiğim fidye bu.'],
          detail: `≈ ${tr(kg)} kg gümüş · bir lejyonerin ${tr(years)} yıllık maaşı`,
          punch: `Korsanlar Sezar için 20 istedi. O 50 dayattı.`,
          accent: tone,
          bg: ['#0d0709', '#241109', '#3b1d0d'],
          shareText: `Korsanlar beni kaçırsa ${tr(t)} talent ederdim — bir lejyonerin ${tr(years)} yıllık maaşı`,
          fileName: 'sezar-fidye',
        }}
      />
    </WidgetFrame>
  );
}

/* ══════════════════ 2 · Üçlü denge diyagramı + çöküşü (Perde 2 & 4) ══════════════════ */

// Üçgen düğüm konumları (viewBox 0 0 320 260).
const NODE_POS: Record<TriumvirKey, { x: number; y: number }> = {
  pompeius: { x: 70, y: 70 },
  crassus: { x: 250, y: 70 },
  caesar: { x: 160, y: 205 },
};

export function TriumvirateBalance({ collapse = false }: { collapse?: boolean }) {
  const [sel, setSel] = useState<TriumvirKey | null>(collapse ? null : 'caesar');
  const rootRef = useRef<HTMLDivElement>(null);
  const seen = useInViewOnce(rootRef);
  const broken = collapse && seen; // çöküş yalnızca görünürken tetiklenir

  const selData = sel ? TRIUMVIRS.find((t) => t.key === sel) : null;

  return (
    <div ref={rootRef}>
      <WidgetFrame
        kicker={collapse ? 'GERİ DÖNÜŞ · MÖ 54–53' : 'İNTERAKTİF · MÖ 60'}
        title={collapse ? 'Ve sonra iki ip birden koptu' : 'Roma tarihinin en pahalı el sıkışması'}
        hint={collapse ? 'Dünyayı bir arada tutan iki bağ, on iki ay içinde koptu.' : 'Düğümlere dokun. Üçünün de ihtiyacı olan şeye yalnızca biri sahipti.'}
      >
        <svg viewBox="0 0 320 260" className="w-full" role="img" aria-label="Birinci Triumvirlik: Caesar, Pompeius, Crassus arasındaki güç dengesi diyagramı">
          {/* Bağlar */}
          {BONDS.map((b) => {
            const p1 = NODE_POS[b.a], p2 = NODE_POS[b.b];
            const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
            return (
              <g key={b.label}>
                <line
                  x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={broken ? ASH : `color-mix(in srgb, ${MARBLE} 55%, transparent)`}
                  strokeWidth={broken ? 1.4 : 2.4}
                  strokeDasharray={broken ? '5 7' : undefined}
                  style={{ transition: 'stroke 0.8s ease, stroke-width 0.8s ease' }}
                />
                <text
                  x={mx} y={my - 6} textAnchor="middle"
                  className="font-mono"
                  style={{ fontSize: 11, fill: broken ? ASH : MARBLE, textDecoration: broken ? 'line-through' : 'none' }}
                >
                  {b.label}
                </text>
              </g>
            );
          })}

          {/* Düğümler */}
          {TRIUMVIRS.map((t) => {
            const p = NODE_POS[t.key];
            const c = TRIUMVIR_COLOR[t.key];
            const active = sel === t.key;
            return (
              <g
                key={t.key}
                onClick={() => !collapse && setSel(active ? null : t.key)}
                style={{ cursor: collapse ? 'default' : 'pointer', opacity: broken ? 0.55 : 1, transition: 'opacity 0.8s ease' }}
                role={collapse ? undefined : 'button'}
                aria-label={collapse ? undefined : `${t.name} — ${t.title}`}
              >
                <circle cx={p.x} cy={p.y} r={active ? 34 : 30} fill={`color-mix(in srgb, ${c} ${active ? 28 : 16}%, ${BG})`} stroke={c} strokeWidth={active ? 3 : 2} style={{ transition: 'all 0.3s ease' }} />
                <text x={p.x} y={p.y - 2} textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fill: '#fff' }}>{t.name}</text>
                <text x={p.x} y={p.y + 13} textAnchor="middle" style={{ fontSize: 9, fill: c, fontWeight: 700 }}>{t.has}</text>
              </g>
            );
          })}
        </svg>

        {/* Perde 2: seçilen düğümün kartı */}
        {!collapse && selData && (
          <div
            className="mt-2 rounded-xl border p-4"
            style={{ borderColor: `color-mix(in srgb, ${TRIUMVIR_COLOR[selData.key]} 32%, transparent)`, background: `color-mix(in srgb, ${TRIUMVIR_COLOR[selData.key]} 8%, transparent)` }}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-bold text-white">{selData.name}</span>
              <span className="text-xs" style={{ color: TRIUMVIR_COLOR[selData.key] }}>{selData.title}</span>
            </div>
            <div className="mb-2 flex gap-4 text-xs">
              <span className="text-emerald-300">✓ {selData.has}</span>
              <span className="text-rose-300">✗ {selData.lacks}</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{selData.note}</p>
          </div>
        )}

        {/* Perde 4: kopan bağların hikâyesi */}
        {collapse && (
          <div className="mt-2 space-y-2">
            {BONDS.filter((b) => b.a === 'caesar' || b.b === 'caesar').map((b) => (
              <div key={b.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="mb-0.5 flex items-baseline gap-2">
                  <span className="font-mono text-xs" style={{ color: GOLD }}>{yearLabel(b.breaks.year)}</span>
                  <span className="text-sm font-bold text-white line-through" style={{ textDecorationColor: ASH }}>{b.label}</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">{b.breaks.how}</p>
              </div>
            ))}
            <p className="pt-1 text-sm leading-relaxed text-slate-400">
              Geriye iki adam kaldı, aralarında hiçbir şey yoktu ve ikisi de ikinci olmayı bilmiyordu.
            </p>
          </div>
        )}

        {!collapse && (
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Caesar mührü sağlamlaştırmak için kızı Julia’yı ({JULIA.juliaAge}) Pompeius’la ({JULIA.pompeiusAge}) evlendirdi —
            damat, kayınpederinden {JULIA.pompeiusOlderThanCaesar} yaş büyüktü. Sonra ikisi birbirine gerçekten âşık oldu.
            Bu evlilik, tüm dünyayı bir arada tutan iki ipten biriydi.
          </p>
        )}
      </WidgetFrame>
    </div>
  );
}

/* ══════════════════ 3 · Bedel haritası (Perde 3, ~%35) ══════════════════ */

// Galya'nın şematik bölgeleri (coğrafi hassasiyet iddiası yok — beş kaba blok).
const GAUL_REGIONS: Record<string, string> = {
  gu: 'M60,150 L130,150 L120,205 L55,200 Z',       // güney (Provincia)
  or: 'M60,95 L130,95 L130,150 L60,150 Z',          // orta
  me: 'M130,120 L185,115 L185,175 L130,150 Z',      // merkez (Arverni/Alesia)
  ku: 'M60,40 L150,35 L150,95 L60,95 Z',            // kuzey (Belgae)
  ba: 'M15,90 L60,85 L60,150 L20,150 Z',            // batı (Armorika)
  do: 'M150,45 L200,55 L185,115 L150,95 Z',         // doğu (Ren boyu)
};

export function GaulTollMap() {
  const [i, setI] = useState(0);
  const y = GAUL_YEARS[i];
  const rootRef = useRef<HTMLDivElement>(null);
  const atEnd = i === GAUL_YEARS.length - 1;
  const seen = useInViewOnce(rootRef);
  const count = useProgress(seen && atEnd, 2200);

  // O yıla kadar (dahil) "Roma"ya geçmiş tüm bölgeler.
  const filled = useMemo(() => {
    const s = new Set<string>();
    for (let k = 0; k <= i; k++) GAUL_YEARS[k].regions.forEach((r) => s.add(r));
    return s;
  }, [i]);

  const toneColor = y.tone === 'katliam' ? ACCENT : y.tone === 'yenilgi' ? '#6ba8c9' : y.tone === 'zafer' ? GOLD : MARBLE;

  return (
    <div ref={rootRef}>
      <WidgetFrame
        hero
        kicker="İNTERAKTİF · MÖ 58–50"
        title="Sekiz yılda Galya diye bir yer kalmadı"
        hint="Yılları kaydır. Roma’ya geçen her bölge kızıla boyanır. Zafer ve dehşet, aynı ekranda."
      >
        <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
          {/* Harita */}
          <div>
            <svg viewBox="0 0 215 220" className="w-full" role="img" aria-label={`Galya haritası, ${yearLabel(y.year)}: ${filled.size}/6 bölge Roma denetiminde`}>
              {Object.entries(GAUL_REGIONS).map(([key, d]) => {
                const on = filled.has(key);
                return (
                  <path
                    key={key}
                    d={d}
                    fill={on ? `color-mix(in srgb, ${ACCENT} 62%, ${BG})` : 'rgba(255,255,255,0.05)'}
                    stroke={on ? ACCENT : 'rgba(255,255,255,0.15)'}
                    strokeWidth={1}
                    style={{ transition: 'fill 0.6s ease, stroke 0.6s ease' }}
                  />
                );
              })}
            </svg>
            <div className="mt-1 text-center font-mono text-2xl font-black text-white">{yearLabel(y.year)}</div>
          </div>

          {/* O yılın kartı */}
          <div className="flex flex-col">
            <div className="mb-1 text-xs font-bold uppercase tracking-wide" style={{ color: toneColor }}>{y.title}</div>
            <p className="text-sm leading-relaxed text-slate-300">{y.text}</p>
            {y.figure && (
              <div className="mt-3 rounded-lg border p-3" style={{ borderColor: `color-mix(in srgb, ${toneColor} 30%, transparent)`, background: `color-mix(in srgb, ${toneColor} 8%, transparent)` }}>
                <div className="font-mono text-lg font-black" style={{ color: toneColor }}>{y.figure.value}</div>
                <div className="text-xs text-slate-300">{y.figure.label}</div>
                <div className="mt-1 text-[0.68rem] leading-snug text-slate-500">{y.figure.source}</div>
              </div>
            )}
          </div>
        </div>

        {/* Yıl kaydırıcı */}
        <input
          type="range"
          min={0}
          max={GAUL_YEARS.length - 1}
          value={i}
          onChange={(e) => setI(+e.target.value)}
          className="mt-4 h-8 w-full"
          style={{ accentColor: ACCENT }}
          aria-label="Galya seferi yılı"
          aria-valuetext={yearLabel(y.year)}
        />

        {/* Sona gelince: bedel — üç kaynak, üç rakam */}
        {atEnd && (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              <Stat value={tr(Math.round(count * 1_000_000))} label="ölü — Plutarkhos’a göre" color={ACCENT} />
              <Stat value={tr(Math.round(count * 1_000_000))} label="köle — Plutarkhos’a göre" color={GOLD} />
            </div>
            <div className="mt-3 space-y-1.5">
              {GAUL_TOLL.map((s) => (
                <div key={s.key} className="flex items-baseline justify-between gap-2 border-b border-white/5 pb-1.5 text-xs">
                  <span className="text-slate-400"><span className="font-semibold text-slate-200">{s.who}</span> · {s.when}</span>
                  <span className="shrink-0 font-mono text-slate-300">{s.dead} ölü</span>
                </div>
              ))}
            </div>
            <SourceNote>{GAUL_MODERN_NOTE}</SourceNote>
            <SourceNote>{GAUL_THIRD_MYTH}</SourceNote>
          </div>
        )}
      </WidgetFrame>
    </div>
  );
}

/* ══════════════════ 4 · RUBICON karar noktası + oylama (Perde 4, ~%45) ══════════════════ */

type PollState =
  | { phase: 'idle' }
  | { phase: 'revealing'; choice: string; screen: number }
  | { phase: 'done'; choice: string };

type PollData = { available: boolean; counts?: Record<string, number>; total?: number; mine?: string | null };

export function RubiconDecision() {
  const [st, setSt] = useState<PollState>({ phase: 'idle' });
  const [poll, setPoll] = useState<PollData | null>(null);

  // Mount'ta mevcut dağılımı + bu okurun önceki oyunu çek (defansif).
  useEffect(() => {
    let alive = true;
    fetch(`/api/article-poll/${RUBICON.pollKey}`)
      .then((r) => r.json())
      .then((d: PollData) => {
        if (!alive) return;
        setPoll(d);
        if (d.available && d.mine) setSt({ phase: 'done', choice: d.mine });
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => { refreshScroll(); }, [st.phase]);

  function choose(choice: string) {
    const reduce = prefersReduced();
    setSt(reduce ? { phase: 'done', choice } : { phase: 'revealing', choice, screen: 0 });
    // Oyu kaydet (giriş gerektirmez); sonucu güncelle.
    fetch(`/api/article-poll/${RUBICON.pollKey}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ choice }),
    })
      .then((r) => r.json())
      .then((d: PollData) => { if (d.available) setPoll(d); })
      .catch(() => {});
  }

  const active = st.phase !== 'idle' ? RUBICON_CHOICES.find((c) => c.key === st.choice) : null;

  return (
    <WidgetFrame
      hero
      kicker="KARAR NOKTASI · MÖ 49, OCAK"
      title="Senato ültimatom gönderdi: ordunu dağıt ve tek başına Roma’ya dön."
      hint="İki yol var. Sen ne yapardın? Seçiminden sonra ne olacağını öğreneceksin — ve kaç okurun seninle aynı seçimi yaptığını."
    >
      {st.phase === 'idle' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {RUBICON_CHOICES.map((c) => (
            <button
              key={c.key}
              onClick={() => choose(c.key)}
              className="group rounded-xl border border-white/12 bg-white/[0.03] p-4 text-left transition hover:border-white/30 hover:bg-white/[0.06]"
            >
              <div className="mb-1 text-base font-bold text-white">{c.label}</div>
              <div className="text-sm text-slate-400">{c.sub}</div>
            </button>
          ))}
        </div>
      )}

      {st.phase === 'revealing' && active && (
        <div className="rounded-xl border p-5" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 6%, transparent)` }}>
          <div className="mb-3 text-sm font-bold" style={{ color: ACCENT }}>{active.headline}</div>
          <ul className="space-y-2.5">
            {active.screens.slice(0, st.screen + 1).map((s, k) => (
              <li key={k} className="flex gap-2 text-sm leading-relaxed text-slate-200" style={{ animation: 'sezar-fade 0.5s ease' }}>
                <span style={{ color: ACCENT }}>▸</span><span>{s}</span>
              </li>
            ))}
          </ul>
          {st.screen + 1 < active.screens.length ? (
            <button
              onClick={() => setSt({ phase: 'revealing', choice: st.choice, screen: st.screen + 1 })}
              className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-bold"
              style={{ background: ACCENT, color: BG }}
            >
              Devam →
            </button>
          ) : (
            <button
              onClick={() => setSt({ phase: 'done', choice: st.choice })}
              className="mt-4 w-full rounded-xl border px-4 py-3 text-sm font-bold"
              style={{ borderColor: `color-mix(in srgb, ${ACCENT} 40%, transparent)`, color: ACCENT }}
            >
              Peki o ne yaptı? →
            </button>
          )}
        </div>
      )}

      {st.phase === 'done' && active && (
        <div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs text-slate-500">Senin seçimin: {active.label}</div>
            <div className="mt-1 text-sm leading-relaxed text-slate-300">{active.verdict}</div>
          </div>

          <div className="my-5 text-center">
            <div className="font-mono text-3xl font-black tracking-tight" style={{ color: GOLD }}>{RUBICON_TRUTH}</div>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
              Tek bir lejyonla — Legio XIII, ~5.000 adam — Cumhuriyet’in emrindeki yüz binlere karşı dereyi geçti.
              Sebebini tek kelimeyle açıkladı: <em>dignitas.</em>
            </p>
          </div>

          <PollBars poll={poll} choices={RUBICON_CHOICES} mine={st.choice} />
        </div>
      )}
    </WidgetFrame>
  );
}

function PollBars({ poll, choices, mine }: { poll: PollData | null; choices: typeof RUBICON_CHOICES; mine: string }) {
  if (!poll || !poll.available || !poll.counts || !poll.total) {
    // Tablo yoksa (SQL çalışmadıysa) dağılım gizlenir — karar deneyimi bozulmaz.
    return null;
  }
  const total = poll.total;
  const mineChoice = choices.find((c) => c.key === mine) ?? null;
  const minePct = mineChoice ? Math.round(((poll.counts![mineChoice.key] ?? 0) / total) * 100) : 0;
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 text-xs font-bold tracking-wide text-slate-400">
        {tr(total)} okur bu kararı verdi
      </div>
      <div className="space-y-2.5">
        {choices.map((c) => {
          const n = poll.counts![c.key] ?? 0;
          const pct = total ? Math.round((n / total) * 100) : 0;
          const isMine = c.key === mine;
          return (
            <div key={c.key}>
              <div className="mb-1 flex justify-between text-xs">
                <span className={isMine ? 'font-bold text-white' : 'text-slate-400'}>
                  {c.label} {isMine && <span style={{ color: ACCENT }}>· sen</span>}
                </span>
                <span className="font-mono text-slate-300">%{pct}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: isMine ? ACCENT : `color-mix(in srgb, ${MARBLE} 45%, transparent)` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Okur artık kendisine ait bir SAYI'ya sahip: hangi tarafı seçtiği ve
          kaç kişinin onunla aynı fikirde olduğu. Paylaşılan şey link değil,
          bu sonuç. Kart istemcide çizilir. */}
      {mineChoice && (
        <ProofShare
          label="Kararını paylaş"
          spec={{
            kicker: '⚔  M Ö  4 9  ·  R U B I C O N',
            value: `%${minePct}`,
            lines: [
              mineChoice.key === 'gec' ? 'okurun Rubicon\'u geçti.' : 'okurun orduyu dağıttı.',
              'Ben de öyle yaptım.',
            ],
            detail: `${tr(total)} okur bu kararı verdi · senin seçimin: ${mineChoice.label}`,
            punch: 'Sezar geçti. Sen ne yapardın?',
            accent: ACCENT,
            bg: ['#0d0709', '#2a0a12', '#3b0d16'],
            shareText: `Sezar'ın yerinde olsam ${mineChoice.key === 'gec' ? 'Rubicon\'u geçerdim' : 'orduyu dağıtırdım'} — okurların %${minePct}'i benimle aynı fikirde`,
            fileName: 'sezar-rubicon',
          }}
        />
      )}
    </div>
  );
}

/* ══════════════════ 5 · Ren köprüsü (Perde 3, görsel) ══════════════════ */

export function RhineBridge() {
  const [built, setBuilt] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const seen = useInViewOnce(rootRef);
  useEffect(() => { if (seen && !prefersReduced()) { const t = setTimeout(() => setBuilt(true), 350); return () => clearTimeout(t); } if (seen) setBuilt(true); }, [seen]);

  // Eğik kazık çiftleri: biri akıntı yönünde, karşısındaki akıntıya karşı.
  const piles = Array.from({ length: 7 }, (_, k) => 24 + k * 40);

  return (
    <div ref={rootRef}>
      <WidgetFrame
        kicker="MÖ 55 · GÖSTERİ"
        title="Tekneyle bir günde geçebilirdi. Onun yerine köprü kurdu."
        hint="Kazıklar dik değil, eğik çakılıyordu — su ne kadar sertleşirse yapı o kadar sıkışsın diye. On günde bitti."
        footnote={<SourceNote>{RHINE.fateNote}</SourceNote>}
      >
        <svg viewBox="0 0 300 130" className="w-full" role="img" aria-label="Ren Nehri üzerine kurulan eğik kazıklı Roma köprüsü şeması">
          {/* Su */}
          <rect x="0" y="70" width="300" height="60" fill="rgba(107,168,201,0.12)" />
          {[80, 95, 110].map((yy) => (
            <line key={yy} x1="0" y1={yy} x2="300" y2={yy} stroke="rgba(107,168,201,0.18)" strokeWidth="1" />
          ))}
          {/* Eğik kazık çiftleri */}
          {piles.map((x, k) => (
            <g key={x} style={{ opacity: built ? 1 : 0, transition: `opacity 0.4s ease ${k * 0.08}s` }}>
              <line x1={x - 6} y1="66" x2={x + 4} y2="120" stroke={GOLD} strokeWidth="2.5" />
              <line x1={x + 14} y1="66" x2={x + 4} y2="120" stroke={`color-mix(in srgb, ${GOLD} 70%, ${BG})`} strokeWidth="2.5" />
            </g>
          ))}
          {/* Tabliye */}
          <rect x="12" y="58" width="272" height="8" rx="2" fill={built ? MARBLE : 'transparent'} style={{ transition: 'fill 0.5s ease 0.6s' }} />
          {/* Gün rozeti */}
          <g style={{ opacity: built ? 1 : 0, transition: 'opacity 0.4s ease 0.9s' }}>
            <text x="150" y="34" textAnchor="middle" style={{ fontSize: 30, fontWeight: 900, fill: '#fff', fontFamily: 'monospace' }}>10</text>
            <text x="150" y="48" textAnchor="middle" style={{ fontSize: 11, fill: GOLD }}>GÜN</text>
          </g>
        </svg>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Ordusuyla köprüden geçti, {RHINE.daysAcross} gün Germen topraklarında dolaştı, kimse savaşmaya cesaret edemedi,
          geri döndü — ve köprüyü söktü. Mesaj şuydu: <em>ne zaman istersem gelirim, ve bu benim için bu kadar kolay.</em>
        </p>
      </WidgetFrame>
    </div>
  );
}

/* ══════════════════ 6 · Pharsalus dördüncü hat (Perde 4, görsel) ══════════════════ */

export function PharsalusLine() {
  const [reveal, setReveal] = useState(false);

  return (
    <WidgetFrame
      kicker="MÖ 48 · PHARSALUS"
      title="Bir orduyu değil, bir kuşağın kibrini yendi"
      hint="Pompeius’un süvarisi Caesar’ınkinin yedi katıydı. Caesar arkaya gizli bir dördüncü hat kurdu — ve tuhaf bir emir verdi."
    >
      <svg viewBox="0 0 300 170" className="w-full" role="img" aria-label="Pharsalus muharebe şeması: Pompeius süvarisi ve Caesar’ın gizli dördüncü hattı">
        {/* Caesar hatları (alt) */}
        {[130, 142, 154].map((yy, k) => (
          <line key={yy} x1="30" y1={yy} x2="270" y2={yy} stroke={`color-mix(in srgb, ${ACCENT} ${70 - k * 12}%, transparent)`} strokeWidth="4" strokeLinecap="round" />
        ))}
        <text x="150" y="168" textAnchor="middle" style={{ fontSize: 9, fill: ACCENT }}>Caesar</text>

        {/* Pompeius süvarisi (üst) — oklarla iniyor */}
        {[70, 110, 150, 190, 230].map((x) => (
          <g key={x} style={{ transition: 'transform 0.6s ease', transform: reveal ? 'translateY(-14px)' : 'translateY(0)' }}>
            <line x1={x} y1="18" x2={x} y2="60" stroke={GOLD} strokeWidth="3" />
            <path d={`M${x - 5},52 L${x},62 L${x + 5},52`} fill="none" stroke={GOLD} strokeWidth="3" />
          </g>
        ))}
        <text x="150" y="14" textAnchor="middle" style={{ fontSize: 9, fill: GOLD }}>Pompeius süvarisi (7.000)</text>

        {/* Gizli dördüncü hat */}
        <g style={{ opacity: reveal ? 1 : 0, transition: 'opacity 0.5s ease' }}>
          {[70, 100, 130, 160, 190, 220].map((x) => (
            <line key={x} x1={x} y1="70" x2={x} y2="95" stroke={MARBLE} strokeWidth="3" strokeLinecap="round" />
          ))}
          <text x="150" y="108" textAnchor="middle" style={{ fontSize: 9, fill: MARBLE }}>gizli dördüncü hat — mızraklar yüze doğrultuldu</text>
        </g>
      </svg>

      <ActionButton onClick={() => setReveal((v) => !v)} tone={reveal ? 'ghost' : 'accent'} full>
        {reveal ? '↺ Baştan' : 'Dördüncü hattı ortaya çıkar'}
      </ActionButton>

      {reveal && (
        <p className="mt-3 text-sm leading-relaxed text-slate-300" style={{ animation: 'sezar-fade 0.5s ease' }}>
          Caesar askerlerine mızrağı fırlatmayın, saplamayın; <strong className="text-white">yüzlerine doğrultun</strong> dedi.
          Çünkü karşıdaki süvari Roma’nın en zengin ailelerinin genç oğullarıydı — ve ölmekten değil,
          çirkinleşmekten korkuyorlardı. Mızraklar yüzlerine gelince geri çekildiler. Süvari dağıldı, savaş bitti.
        </p>
      )}
      <SourceNote>{PHARSALUS.faceOrder}</SourceNote>
    </WidgetFrame>
  );
}

/* ══════════════════ 7 · İsim ağacı (Perde 7, ~%100) ══════════════════ */

export function NameTree() {
  const [open, setOpen] = useState<string | null>('kayser');
  const [shared, setShared] = useState(false);

  async function share() {
    const url = 'https://basementonfire.com/articles/sezar';
    const text = 'Caesar → Kaiser → Çar → Kayser-i Rûm. Bir adamın soyadı, iki bin yıl boyunca üç kıtada tek bir anlama geldi: hükmeden.';
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'Julius Caesar · Basementonfire', text, url });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setShared(true);
        setTimeout(() => setShared(false), 2200);
      }
    } catch { /* kullanıcı iptal etti */ }
  }

  return (
    <WidgetFrame
      hero
      kicker="SONUNA KADAR OKUYANIN MADALYASI · MÖ 100 – 1453"
      title="Onu öldürdüler. Adını, sildikleri şeye çevirdiler."
      hint="Her düğüme dokun. Bir aile lakabının unvana, sonra üç imparatorluğun tacına dönüşmesi."
    >
      <div className="space-y-2">
        {NAME_TREE.map((n, k) => {
          const isOpen = open === n.key;
          const isRoot = k === 0;
          return (
            <div key={n.key} className="relative">
              {k > 0 && <div className="absolute -top-2 left-5 h-2 w-px bg-white/15" aria-hidden />}
              <button
                onClick={() => setOpen(isOpen ? null : n.key)}
                aria-expanded={isOpen}
                className="w-full rounded-xl border p-3 text-left transition"
                style={{
                  borderColor: isOpen ? `color-mix(in srgb, ${GOLD} 40%, transparent)` : 'rgba(255,255,255,0.1)',
                  background: isOpen ? `color-mix(in srgb, ${GOLD} 8%, transparent)` : 'rgba(255,255,255,0.02)',
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`font-black ${isRoot ? 'text-xl' : 'text-lg'}`} style={{ color: isRoot ? ACCENT : GOLD }}>{n.word}</span>
                  <span className="shrink-0 font-mono text-[0.65rem] text-slate-500">{n.where}</span>
                </div>
                {isOpen && (
                  <div style={{ animation: 'sezar-fade 0.4s ease' }}>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{n.text}</p>
                    {n.until && <p className="mt-2 text-xs font-semibold" style={{ color: `color-mix(in srgb, ${GOLD} 85%, white)` }}>{n.until}</p>}
                    {n.caveat && <SourceNote>{n.caveat}</SourceNote>}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border p-4 text-center" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 25%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 6%, transparent)` }}>
        <p className="text-sm leading-relaxed text-slate-200">{NAME_PAYOFF}</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">{NAME_EXTRA}</p>
      </div>

      <button
        onClick={share}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition hover:brightness-110"
        style={{ background: ACCENT, color: BG }}
      >
        {shared ? '✓ Kopyalandı' : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>
            Bu hikâyeyi paylaş
          </>
        )}
      </button>

      <p className="mt-4 text-center text-sm italic leading-relaxed text-slate-400">
        Zar atıldı. Ve hâlâ dönüyor.
      </p>
    </WidgetFrame>
  );
}
