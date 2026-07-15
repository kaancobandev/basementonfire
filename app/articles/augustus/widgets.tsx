'use client';

// Augustus makalesinin HAFİF modülleri (canvas/GSAP yok → SSR'a girer).
// Tema: Caesar okuru KAHRAMAN yaptı; burada her etkileşim bir DEDEKTİFLİK anı —
// okur "dediği"nin altındaki "olan"ı kendi eliyle açar.

import { useEffect, useRef, useState } from 'react';
import {
  ACCENT, BG, CRIMSON, MARBLE, ASH,
  WidgetFrame, SourceNote, roman, tr,
  prefersReduced, useInViewOnce, refreshScroll,
} from './ui';
import {
  ANKARA, SAID_VS_REAL,
  NAME_SWITCH, TOLLENDUM, PROSCRIPTIO,
  PROPAGANDA,
  RESTORE, RESTORE_CHOICES,
  JANUS, TEUTOBURG, APPLAUSE,
} from './data';

const toneColor = (t: 'gold' | 'crimson' | 'marble') => (t === 'gold' ? ACCENT : t === 'crimson' ? CRIMSON : MARBLE);

/* ══════════════════ 1 · Ankara duvarı: Dediği / Olan (~%3) ══════════════════ */

export function SaidVsReal() {
  const [reveal, setReveal] = useState(false);
  const [lieOpen, setLieOpen] = useState(false);

  return (
    <WidgetFrame
      hero
      kicker="İNTERAKTİF · ANKARA · RES GESTAE"
      title="Dünyanın en zarif yalanı Ulus’ta, bir duvarda duruyor"
      hint={`${ANKARA.where}. İki bin yıldır bir adam kendi hayatını kendi ağzından anlatıyor. Burada söylenene değil — olana bakacaksın.`}
      footnote={<>{ANKARA.what}. {ANKARA.note}</>}
    >
      {/* Anahtar cümle */}
      <div className="rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 7%, transparent)` }}>
        <div className="mb-1 font-mono text-[0.7rem] tracking-wide" style={{ color: `color-mix(in srgb, ${ACCENT} 75%, white)` }}>{ANKARA.keyLineLatin}</div>
        <p className="text-sm font-semibold leading-relaxed text-slate-100">“{ANKARA.keyLine}”</p>
        <button onClick={() => setLieOpen((v) => !v)} className="mt-2 text-xs font-bold" style={{ color: CRIMSON }} aria-expanded={lieOpen}>
          {lieOpen ? '−' : '+'} bu cümle hem doğru hem yalan · nasıl?
        </button>
        {lieOpen && <p className="mt-2 text-sm leading-relaxed text-slate-300" style={{ animation: 'aug-fade 0.4s ease' }}>{ANKARA.keyLineVerdict}</p>}
      </div>

      {/* Master anahtar */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3">
        <span className="text-sm font-semibold text-slate-300">{reveal ? 'Gerçeği görüyorsun.' : 'Sadece anıtın anlattığını görüyorsun.'}</span>
        <button
          onClick={() => setReveal((v) => !v)}
          className="rounded-full px-4 py-2 text-xs font-bold transition"
          style={{ background: reveal ? CRIMSON : `color-mix(in srgb, ${ACCENT} 20%, transparent)`, color: reveal ? '#fff' : ACCENT }}
          aria-pressed={reveal}
        >
          {reveal ? 'olanı gizle' : 'olanı göster →'}
        </button>
      </div>

      {/* İki sütun */}
      <div className="mt-3 space-y-2">
        {SAID_VS_REAL.map((row, i) => (
          <div key={i} className={`grid gap-2 ${reveal ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
            <div className="rounded-xl border p-3" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 25%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 6%, transparent)` }}>
              <div className="mb-1 text-[0.6rem] font-bold tracking-[0.2em]" style={{ color: ACCENT }}>DEDİĞİ</div>
              <p className="text-sm leading-relaxed text-slate-200">{row.said}</p>
            </div>
            {reveal && (
              <div className="rounded-xl border p-3" style={{ borderColor: `color-mix(in srgb, ${CRIMSON} 30%, transparent)`, background: `color-mix(in srgb, ${CRIMSON} 8%, transparent)`, animation: 'aug-fade 0.45s ease' }}>
                <div className="mb-1 text-[0.6rem] font-bold tracking-[0.2em]" style={{ color: CRIMSON }}>OLAN</div>
                <p className="text-sm leading-relaxed text-slate-200">{row.real}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </WidgetFrame>
  );
}

/* ══════════════════ 2 · İsim anahtarı (~%12) ══════════════════ */

export function NameSwitch() {
  const [asCaesar, setAsCaesar] = useState(false);
  const p = asCaesar ? NAME_SWITCH.caesar : NAME_SWITCH.plain;
  const col = asCaesar ? ACCENT : ASH;

  // Deterministik kalabalık noktaları.
  const crowd = Array.from({ length: 60 }, (_, k) => ({ x: (k % 12) * 8 + 6, y: Math.floor(k / 12) * 9 + 6, d: (k % 7) * 0.03 }));

  return (
    <WidgetFrame
      kicker="İNTERAKTİF · MÖ 44"
      title="Aynı çocuk. İki isim. İki dünya."
      hint="Anahtarı çevir. Kalabalığın tepkisine bak — değişen tek şey bir isim."
      footnote={<>{NAME_SWITCH.note}</>}
    >
      <div className="rounded-xl border p-4 text-center transition-colors" style={{ borderColor: `color-mix(in srgb, ${col} 32%, transparent)`, background: `color-mix(in srgb, ${col} 8%, transparent)` }}>
        <div className="font-mono text-2xl font-black sm:text-3xl transition-colors" style={{ color: col }}>{p.name}</div>
        <div className="mt-0.5 text-xs text-slate-400">{p.title}</div>
      </div>

      {/* Kalabalık */}
      <svg viewBox="0 0 104 52" className="mt-3 w-full" role="img" aria-label={`Kalabalığın tepkisi: ${p.crowd}`}>
        {crowd.map((c, k) => (
          <circle
            key={k} cx={c.x} cy={asCaesar ? c.y - 1.5 : c.y} r={asCaesar ? 2.4 : 1.8}
            fill={asCaesar ? `color-mix(in srgb, ${ACCENT} ${55 + (k % 5) * 9}%, transparent)` : 'rgba(148,163,184,0.3)'}
            style={{ transition: `all 0.4s ease ${c.d}s` }}
          />
        ))}
      </svg>
      <div className="mt-1 text-center text-xs font-semibold" style={{ color: col }}>{p.crowd === 'coşku' ? '⚡ COŞKU' : '— kayıtsız'}</div>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{p.crowdText}</p>

      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setAsCaesar((v) => !v)}
          className="rounded-full px-5 py-2.5 text-sm font-bold transition hover:brightness-110"
          style={{ background: asCaesar ? ACCENT : 'rgba(255,255,255,0.08)', color: asCaesar ? BG : MARBLE, border: asCaesar ? 'none' : '1px solid rgba(255,255,255,0.15)' }}
          aria-pressed={asCaesar}
        >
          {asCaesar ? '← Octavius’a dön' : 'Adını “Caesar” yap →'}
        </button>
      </div>
    </WidgetFrame>
  );
}

/* ══════════════════ 3 · TOLLENDUM cinası (~%20) ══════════════════ */

export function Tollendum() {
  const [flipped, setFlipped] = useState(false);
  const m = TOLLENDUM.meanings[flipped ? 1 : 0];
  const col = toneColor(m.color);

  return (
    <WidgetFrame
      kicker="İNTERAKTİF · CICERO’NUN KELİME OYUNU"
      title="Tek kelime. İki anlam. Bir ölüm fermanı."
      hint="Latince cümledeki altı çizili kelimeye dokun. Octavianus’un gördüğü şeyi kendi parmağınla gör."
    >
      <div className="rounded-xl border border-white/10 bg-black/25 p-5 text-center">
        <p className="font-mono text-base leading-relaxed text-slate-200 sm:text-lg">
          Laudandum adulescentem, ornandum,{' '}
          <button
            onClick={() => setFlipped((v) => !v)}
            className="inline-block rounded px-1.5 font-bold underline decoration-2 underline-offset-4 transition"
            style={{ color: col, textDecorationColor: col, background: `color-mix(in srgb, ${col} 12%, transparent)` }}
            aria-label="tollendum kelimesinin anlamını çevir"
          >
            tollendum
          </button>.
        </p>
        <div className="mt-4">
          <div className="font-mono text-2xl font-black transition-colors sm:text-3xl" style={{ color: col }}>{m.label}</div>
          <div className="mt-1 text-xs text-slate-400">{m.sub}</div>
        </div>
        <div className="mt-3 text-[0.7rem] text-slate-500">↕ iki anlam arasında dönüyor · dokun</div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-300">{TOLLENDUM.reveal}</p>
      <SourceNote>{TOLLENDUM.payoff}</SourceNote>
    </WidgetFrame>
  );
}

/* ══════════════════ 4 · Proscriptio listesi (~%28) ══════════════════ */

export function ProscriptioList() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [passed, setPassed] = useState(0);
  const [reachedEnd, setReachedEnd] = useState(false);

  // Deterministik isim üretimi (gerçek 2.300 değil — "bitmiyor" hissi için ~150).
  const names = (() => {
    const { praenomina: pr, nomina: no, cognomina: co } = PROSCRIPTIO;
    const out: string[] = [];
    for (let i = 0; i < 150; i++) {
      const a = pr[(i * 7 + 3) % pr.length];
      const b = no[(i * 13 + 5) % no.length];
      const c = co[(i * 17 + 2) % co.length];
      out.push(`${a} ${b} ${c}`);
    }
    return out;
  })();

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const ratio = el.scrollHeight <= el.clientHeight ? 1 : el.scrollTop / (el.scrollHeight - el.clientHeight);
    setPassed(Math.round(ratio * PROSCRIPTIO.total));
    if (ratio > 0.98) setReachedEnd(true);
  };

  return (
    <WidgetFrame
      kicker="İNTERAKTİF · MÖ 43 · PROSCRIPTIO"
      title="Kaydır. Ve kaydır. Ve kaydırmaya devam et."
      hint="Bu liste bitmeyecek gibi hissettirecek — çünkü asıl mesele bu. Cevap: 2.300 kişi."
    >
      {/* Sayaç */}
      <div className="mb-3 flex items-baseline justify-between rounded-xl border border-white/10 bg-black/25 px-4 py-2.5">
        <span className="text-xs text-slate-400">geçtiğin isim</span>
        <span className="font-mono text-2xl font-black" style={{ color: CRIMSON }}>{tr(passed)}<span className="ml-1 text-sm text-slate-500">/ {tr(PROSCRIPTIO.total)}</span></span>
      </div>

      <div ref={scrollRef} onScroll={onScroll} className="h-72 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3" style={{ scrollbarWidth: 'thin' }}>
        <div className="mb-2 text-[0.7rem] text-slate-500">{PROSCRIPTIO.senators} senatör · {tr(PROSCRIPTIO.knights)} şövalye</div>
        <ol className="space-y-0.5">
          {names.map((n, i) => (
            <li key={i} className="flex gap-2 border-b border-white/[0.04] py-1 font-mono text-[0.78rem] text-slate-400">
              <span className="w-8 shrink-0 text-right text-slate-600">{i + 1}</span>
              <span>{n}</span>
            </li>
          ))}
          <li className="py-3 text-center text-xs italic text-slate-500">…ve {tr(PROSCRIPTIO.total - names.length - 1)} kişi daha…</li>
          {/* En sonda: gerçek isim */}
          <li className="flex gap-2 rounded-lg border py-2.5 pl-2 font-mono text-sm font-bold" style={{ borderColor: `color-mix(in srgb, ${CRIMSON} 40%, transparent)`, background: `color-mix(in srgb, ${CRIMSON} 10%, transparent)`, color: '#fff' }}>
            <span className="w-8 shrink-0 text-right" style={{ color: CRIMSON }}>{tr(PROSCRIPTIO.total)}</span>
            <span>{PROSCRIPTIO.finalName}</span>
          </li>
          <li className="pt-2 text-sm font-semibold" style={{ color: `color-mix(in srgb, ${CRIMSON} 85%, white)` }}>{PROSCRIPTIO.resisted}</li>
        </ol>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-400">{PROSCRIPTIO.caption}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{PROSCRIPTIO.contrast}</p>
      {reachedEnd && (
        <p className="mt-3 text-sm font-semibold" style={{ color: CRIMSON, animation: 'aug-fade 0.5s ease' }}>
          Bu adamı sevmek zorunda değilsin. Ama Augustus’un iki yüzü yok — tek yüzü var ve bu o.
        </p>
      )}
    </WidgetFrame>
  );
}

/* ══════════════════ 4.5 · Propaganda çevirici (~%42) ══════════════════ */

export function PropagandaToggle() {
  const [i, setI] = useState(0);
  const f = PROPAGANDA.frames[i];
  const col = toneColor(f.color);

  return (
    <WidgetFrame
      kicker="İNTERAKTİF · MÖ 32 · ALGI YÖNETİMİ"
      title="Aynı savaş. Çarkı çevir, düşman değişsin."
      hint="Octavianus’un problemi: Roma iç savaştan bıkmıştı. Çözümü modern siyasetin doğum belgesiydi."
      footnote={<>{PROPAGANDA.will}</>}
    >
      <div className="mb-3 flex gap-2">
        {PROPAGANDA.frames.map((fr, k) => (
          <button
            key={fr.key}
            onClick={() => setI(k)}
            aria-pressed={k === i}
            className="flex-1 rounded-full px-3 py-2 text-xs font-bold transition"
            style={k === i ? { background: toneColor(fr.color), color: fr.color === 'gold' ? BG : '#fff' } : { border: '1px solid rgba(255,255,255,0.12)', color: MARBLE, background: 'rgba(255,255,255,0.03)' }}
          >
            {fr.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border p-4 transition-colors" style={{ borderColor: `color-mix(in srgb, ${col} 32%, transparent)`, background: `color-mix(in srgb, ${col} 7%, transparent)` }}>
        <div className="mb-2 text-lg font-black" style={{ color: col }}>{f.headline}</div>
        <ul className="space-y-1.5">
          {f.lines.map((l, k) => (
            <li key={k} className="flex gap-2 text-sm leading-relaxed text-slate-200"><span style={{ color: col }}>▸</span><span>{l}</span></li>
          ))}
        </ul>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-400">{PROPAGANDA.same}</p>
      <p className="mt-2 text-sm font-semibold" style={{ color: `color-mix(in srgb, ${ACCENT} 85%, white)` }}>{PROPAGANDA.actium}</p>
    </WidgetFrame>
  );
}

/* ══════════════════ 5 · SAHTE SEÇİM (Rubicon’un tersi, ~%48) ══════════════════ */

type RState =
  | { phase: 'idle' }
  | { phase: 'revealing'; choice: string; screen: number }
  | { phase: 'done'; choice: string };

type PollData = { available: boolean; counts?: Record<string, number>; total?: number; mine?: string | null };

export function RestoreDecision() {
  const [st, setSt] = useState<RState>({ phase: 'idle' });
  const [poll, setPoll] = useState<PollData | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/article-poll/${RESTORE.pollKey}`)
      .then((r) => r.json())
      .then((d: PollData) => { if (!alive) return; setPoll(d); if (d.available && d.mine) setSt({ phase: 'done', choice: d.mine }); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => { refreshScroll(); }, [st.phase]);

  function choose(choice: string) {
    setSt(prefersReduced() ? { phase: 'done', choice } : { phase: 'revealing', choice, screen: 0 });
    fetch(`/api/article-poll/${RESTORE.pollKey}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ choice }) })
      .then((r) => r.json())
      .then((d: PollData) => { if (d.available) setPoll(d); })
      .catch(() => {});
  }

  const active = st.phase !== 'idle' ? RESTORE_CHOICES.find((c) => c.key === st.choice) : null;

  return (
    <WidgetFrame
      hero
      kicker="SAHTE SEÇİM · MÖ 27"
      title="Sen bir senatörsün. Augustus her şeyi geri verdi. Ne yaparsın?"
      hint="Caesar’ın Rubicon’unu hatırlıyor musun? Bu, onun kasıtlı tersi. Orada seçim dünyayı değiştirdi. Burada…"
    >
      <p className="mb-4 text-sm leading-relaxed text-slate-300">{RESTORE.setup}</p>

      {st.phase === 'idle' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {RESTORE_CHOICES.map((c) => (
            <button key={c.key} onClick={() => choose(c.key)} className="group rounded-xl border border-white/12 bg-white/[0.03] p-4 text-left transition hover:border-white/30 hover:bg-white/[0.06]">
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
              <li key={k} className="flex gap-2 text-sm leading-relaxed text-slate-200" style={{ animation: 'aug-fade 0.5s ease' }}>
                <span style={{ color: ACCENT }}>▸</span><span>{s}</span>
              </li>
            ))}
          </ul>
          {st.screen + 1 < active.screens.length ? (
            <button onClick={() => setSt({ phase: 'revealing', choice: st.choice, screen: st.screen + 1 })} className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-bold" style={{ background: ACCENT, color: BG }}>Devam →</button>
          ) : (
            <button onClick={() => setSt({ phase: 'done', choice: st.choice })} className="mt-4 w-full rounded-xl border px-4 py-3 text-sm font-bold" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 40%, transparent)`, color: ACCENT }}>Peki fark eder miydi? →</button>
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
            <div className="font-mono text-3xl font-black tracking-tight" style={{ color: CRIMSON }}>{RESTORE.truth}</div>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">{RESTORE.truthSub}</p>
          </div>
          <PollBars poll={poll} mine={st.choice} />
        </div>
      )}
    </WidgetFrame>
  );
}

function PollBars({ poll, mine }: { poll: PollData | null; mine: string }) {
  if (!poll || !poll.available || !poll.counts || !poll.total) return null;
  const total = poll.total;
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 text-xs font-bold tracking-wide text-slate-400">{tr(total)} okur bu sahnede seçim yaptı</div>
      <div className="space-y-2.5">
        {RESTORE_CHOICES.map((c) => {
          const n = poll.counts![c.key] ?? 0;
          const pct = total ? Math.round((n / total) * 100) : 0;
          const isMine = c.key === mine;
          return (
            <div key={c.key}>
              <div className="mb-1 flex justify-between text-xs">
                <span className={isMine ? 'font-bold text-white' : 'text-slate-400'}>{c.label}{isMine && <span style={{ color: ACCENT }}> · sen</span>}</span>
                <span className="font-mono text-slate-300">%{pct}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: isMine ? ACCENT : `color-mix(in srgb, ${MARBLE} 40%, transparent)` }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[0.7rem] leading-relaxed text-slate-500">Ne seçersen seç, sonuç aynıydı — ama okurların dağılımı yine de bir şey söylüyor. İki bin yıl sonra bile insanlar aynı sahnede bölünüyor.</p>
    </div>
  );
}

/* ══════════════════ 6 · Janus / mermer sayacı (~%56 sonrası, küçük) ══════════════════ */

export function JanusCounter() {
  const rootRef = useRef<HTMLDivElement>(null);
  const seen = useInViewOnce(rootRef);

  return (
    <div ref={rootRef}>
      <WidgetFrame
        kicker="MÖ 29 → · PAX ROMANA"
        title="Janus’un kapıları: 700 yılda 2, Augustus’ta 3"
        hint="Janus Tapınağı’nın kapıları yalnızca Roma hiçbir yerde savaşmazken kapatılırdı."
        footnote={<>{JANUS.marble} {JANUS.month}</>}
      >
        <div className="flex items-end justify-center gap-6 py-2">
          <div className="text-center">
            <div className="flex gap-1">
              {[0, 1].map((i) => <Door key={i} closed={seen} delay={i * 0.15} color={ASH} />)}
            </div>
            <div className="mt-2 font-mono text-lg font-black" style={{ color: ASH }}>2</div>
            <div className="text-[0.62rem] text-slate-500">önceki 700 yıl</div>
          </div>
          <div className="pb-6 text-2xl text-slate-600">→</div>
          <div className="text-center">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => <Door key={i} closed={seen} delay={0.3 + i * 0.15} color={ACCENT} />)}
            </div>
            <div className="mt-2 font-mono text-lg font-black" style={{ color: ACCENT }}>3</div>
            <div className="text-[0.62rem] text-slate-500">Augustus</div>
          </div>
        </div>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-300">İşe yaradı: Pax Romana onunla başladı ve iki yüzyıl sürdü.</p>
      </WidgetFrame>
    </div>
  );
}

function Door({ closed, delay, color }: { closed: boolean; delay: number; color: string }) {
  return (
    <svg viewBox="0 0 24 40" width="22" height="36" aria-hidden>
      <rect x="1" y="2" width="22" height="36" rx="2" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <rect x="2" y="3" width="10" height="34" fill={`color-mix(in srgb, ${color} 30%, transparent)`} style={{ transform: closed ? 'translateX(0)' : 'translateX(-9px)', transformOrigin: 'left', transition: `transform 0.6s ease ${delay}s`, opacity: closed ? 1 : 0.2 }} />
      <rect x="12" y="3" width="10" height="34" fill={`color-mix(in srgb, ${color} 30%, transparent)`} style={{ transform: closed ? 'translateX(0)' : 'translateX(9px)', transformOrigin: 'right', transition: `transform 0.6s ease ${delay}s`, opacity: closed ? 1 : 0.2 }} />
    </svg>
  );
}

/* ══════════════════ 7 · ÜÇ BOŞLUK: lejyon ızgarası (~%88) ══════════════════ */

export function LegionGrid() {
  const gone = new Set<number>(TEUTOBURG.legions);
  return (
    <WidgetFrame
      kicker="MS 9 · TEUTOBURG"
      title="Otuz lejyon. Üçü bir daha asla."
      hint="Roma lejyon numaralarını geri dönüştürürdü — bir lejyon yok olsa numarası yeniden kullanılırdı. Bu üçü hariç."
    >
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
        {Array.from({ length: 30 }, (_, k) => {
          const n = k + 1;
          const empty = gone.has(n);
          return (
            <div
              key={n}
              className="grid aspect-square place-items-center rounded-lg border font-mono text-xs font-bold sm:text-sm"
              style={
                empty
                  ? { borderColor: `color-mix(in srgb, ${CRIMSON} 45%, transparent)`, background: 'transparent', color: `color-mix(in srgb, ${CRIMSON} 70%, transparent)` }
                  : { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: MARBLE }
              }
            >
              {empty ? '—' : roman(n)}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded border" style={{ borderColor: `color-mix(in srgb, ${CRIMSON} 45%, transparent)` }} /> XVII · XVIII · XIX — boş</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{TEUTOBURG.vanish}</p>
    </WidgetFrame>
  );
}

/* ══════════════════ 8 · ALKIŞ: kapanış + tuzak (~%100) ══════════════════ */

export function ApplauseFinale() {
  const [clapped, setClapped] = useState(false);
  const [shared, setShared] = useState(false);

  async function share() {
    const url = 'https://basementonfire.com/articles/augustus';
    const text = 'Caesar tacı istediği için öldürüldü. Augustus istemiyormuş gibi yaparak her şeyi aldı — ve ölüm döşeğinde "oyun bitti, alkışlayın" dedi. 2000 yıldır değişmeyen oyun.';
    try {
      if (typeof navigator !== 'undefined' && navigator.share) await navigator.share({ title: 'Augustus · Basements', text, url });
      else if (typeof navigator !== 'undefined' && navigator.clipboard) { await navigator.clipboard.writeText(`${text}\n${url}`); setShared(true); setTimeout(() => setShared(false), 2200); }
    } catch { /* iptal */ }
  }

  return (
    <WidgetFrame hero kicker="SONUNA KADAR OKUYANIN ÖDÜLÜ — VE TUZAĞI" title="Augustus rolünü sordu. Onayladılar. Sonra repliğini söyledi.">
      <div className="rounded-xl border border-white/10 bg-black/25 p-5 text-center">
        <div className="font-mono text-xl font-black tracking-tight sm:text-2xl" style={{ color: ACCENT }}>{APPLAUSE.button === 'Alkışla' ? 'Acta est fabula, plaudite.' : ''}</div>
        <div className="mt-1 text-sm italic text-slate-400">“Oyun bitti. Alkışlayın.”</div>
      </div>

      {!clapped ? (
        <button
          onClick={() => { setClapped(true); refreshScroll(); }}
          className="mt-4 w-full rounded-xl px-4 py-4 text-base font-black transition hover:brightness-110"
          style={{ background: ACCENT, color: BG }}
        >
          👏 {APPLAUSE.button}
        </button>
      ) : (
        <div className="mt-4" style={{ animation: 'aug-fade 0.5s ease' }}>
          <div className="rounded-xl border p-4 text-center" style={{ borderColor: `color-mix(in srgb, ${CRIMSON} 35%, transparent)`, background: `color-mix(in srgb, ${CRIMSON} 8%, transparent)` }}>
            <div className="text-lg font-black text-white">{APPLAUSE.result}</div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">{APPLAUSE.reveal}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{APPLAUSE.today}</p>
          <button onClick={share} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition hover:brightness-110" style={{ background: ACCENT, color: BG }}>
            {shared ? '✓ Kopyalandı' : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>
                Kandırıldığını paylaş
              </>
            )}
          </button>
          <p className="mt-4 text-center text-sm italic text-slate-400">Alkışlayın.</p>
        </div>
      )}
    </WidgetFrame>
  );
}
