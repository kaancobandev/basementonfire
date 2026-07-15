'use client';

// Fatih makalesinin HAFİF interaktif modülleri (canvas/GSAP yok → SSR'a girer).
// Tez: OBSESYON + "sıfat değil, sayı". Her etkileşim okuru yorum yapmaya değil,
// mekanizmayı kendi eliyle kurmaya davet eder (IKEA etkisi + üretken başarısızlık).

import { useEffect, useState } from 'react';
import {
  ACCENT, BG, GOLD, CRIMSON, MARBLE, WATER, ASH,
  WidgetFrame, tr, clamp,
  useReducedMotion, refreshScroll,
} from './ui';
import {
  COURT, BOSPHORUS, LIBRARY_BOOKS,
  DECISION, DECISION_CHOICES,
  POISON, POISON_EVIDENCE, POISON_CHOICES,
} from './data';

type PollData = { available: boolean; counts?: Record<string, number>; total?: number; mine?: string | null };

/* ══════════════════ 1 · Bölünmüş Saray: terazi (Perde 1) ══════════════════ */

export function DividedCourt() {
  const [tilt, setTilt] = useState(0); // -100 (sol/temkin) .. +100 (sağ/risk)
  const [touched, setTouched] = useState(false);
  const [openL, setOpenL] = useState(false);
  const [openR, setOpenR] = useState(false);
  const reduced = useReducedMotion();

  const deg = clamp(tilt, -100, 100) * 0.12; // ±12°
  const leftDown = tilt < -4, rightDown = tilt > 4;

  return (
    <WidgetFrame
      hero
      kicker="İNTERAKTİF · 1444–1446 · BÖLÜNMÜŞ SARAY"
      title="Terazi hangi tarafa yatarsa yatsın, sonu aynı"
      hint="Kolu sürükle. Her iki kefenin argümanını aç. Sonra alttaki tek satıra bak."
    >
      <p className="mb-4 text-sm leading-relaxed text-slate-300">{COURT.setup}</p>

      {/* Terazi */}
      <div className="rounded-xl border border-white/10 bg-black/25 p-3">
        <svg viewBox="0 0 320 150" className="w-full" role="img" aria-label={`Terazi ${tilt < 0 ? 'temkine' : tilt > 0 ? 'riske' : 'dengede'} yatık`}>
          {/* Direk + pivot */}
          <line x1="160" y1="30" x2="160" y2="120" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
          <polygon points="160,26 150,42 170,42" fill={`color-mix(in srgb, ${MARBLE} 55%, transparent)`} />
          <rect x="120" y="120" width="80" height="8" rx="2" fill="rgba(255,255,255,0.12)" />
          {/* Dönen kiriş + kefeler */}
          <g style={{ transform: `rotate(${deg}deg)`, transformOrigin: '160px 34px', transition: reduced ? 'none' : 'transform 0.35s ease' }}>
            <line x1="40" y1="34" x2="280" y2="34" stroke={`color-mix(in srgb, ${MARBLE} 60%, transparent)`} strokeWidth="4" strokeLinecap="round" />
            {/* Sol kefe (temkin) */}
            <line x1="60" y1="34" x2="60" y2="66" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            <path d="M40 66 h40 l-6 20 h-28 z" fill={`color-mix(in srgb, ${ACCENT} ${leftDown ? 26 : 14}%, ${BG})`} stroke={ACCENT} strokeWidth="1.5" />
            {/* Sağ kefe (risk) */}
            <line x1="260" y1="34" x2="260" y2="66" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            <path d="M240 66 h40 l-6 20 h-28 z" fill={`color-mix(in srgb, ${CRIMSON} ${rightDown ? 26 : 14}%, ${BG})`} stroke={CRIMSON} strokeWidth="1.5" />
          </g>
          <text x="60" y="108" textAnchor="middle" style={{ fontSize: 9, fill: ACCENT, fontWeight: 700 }}>temkin</text>
          <text x="260" y="108" textAnchor="middle" style={{ fontSize: 9, fill: CRIMSON, fontWeight: 700 }}>risk</text>
        </svg>

        <input
          type="range" min={-100} max={100} step={1} value={tilt}
          onChange={(e) => { setTilt(Number(e.target.value)); setTouched(true); }}
          aria-label="Terazi kolu: temkin ↔ risk"
          className="mt-1 w-full"
          style={{ accentColor: tilt < 0 ? ACCENT : tilt > 0 ? CRIMSON : MARBLE }}
        />
        <div className="flex justify-between text-[0.62rem] text-slate-500"><span>← Çandarlı Halil</span><span>Zağanos →</span></div>
      </div>

      {/* İki argüman kartı */}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <SideCard side={COURT.left} color={ACCENT} open={openL} onToggle={() => setOpenL((v) => !v)} />
        <SideCard side={COURT.right} color={CRIMSON} open={openR} onToggle={() => setOpenR((v) => !v)} />
      </div>

      {/* Kayıpsız spoiler — okuru rahatsız edip devam ettiriyor */}
      {touched && (
        <div className="mt-4 rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${CRIMSON} 32%, transparent)`, background: `color-mix(in srgb, ${CRIMSON} 7%, transparent)`, animation: 'fatih-fade 0.5s ease' }}>
          <p className="text-sm font-semibold leading-relaxed text-slate-100">{COURT.verdict}</p>
        </div>
      )}
    </WidgetFrame>
  );
}

function SideCard({ side, color, open, onToggle }: {
  side: { name: string; title: string; stance: string; args: readonly string[] }; color: string; open: boolean; onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border p-3.5" style={{ borderColor: `color-mix(in srgb, ${color} 28%, transparent)`, background: `color-mix(in srgb, ${color} 5%, transparent)` }}>
      <div className="text-sm font-bold text-white">{side.name}</div>
      <div className="text-[0.7rem] text-slate-400">{side.title}</div>
      <div className="mt-1 text-xs font-semibold" style={{ color }}>“{side.stance}”</div>
      <button onClick={onToggle} className="mt-2 text-xs font-bold" style={{ color }} aria-expanded={open}>
        {open ? '− argümanları gizle' : '+ argümanları oku'}
      </button>
      {open && (
        <ul className="mt-2 space-y-1.5" style={{ animation: 'fatih-fade 0.35s ease' }}>
          {side.args.map((a, i) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed text-slate-300"><span style={{ color }}>▸</span><span>{a}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ══════════════════ 2 · Boğaz Kilidi: sürgülü kesit (Perde 2) ══════════════════ */

export function BosphorusLock() {
  const [p, setP] = useState(0); // Nisan(0) → Ağustos(1)
  const reduced = useReducedMotion();
  const monthIdx = Math.min(BOSPHORUS.months.length - 1, Math.floor(p * BOSPHORUS.months.length));
  const month = BOSPHORUS.months[monthIdx];
  const locked = p >= 0.92;

  // Kalenin toplam yüksekliği (kesitte), p ile artar.
  const H = 8 + p * 78; // 8..86 px

  return (
    <WidgetFrame
      hero
      kicker="İNTERAKTİF · NİSAN → AĞUSTOS 1452"
      title="Kimse “savaş” demedi. Sadece bir bina yapıldı."
      hint="Sürgüyü çek. Kale katman katman yükselsin. Tamamlandığı an Boğaz’a bak."
      footnote={<>{BOSPHORUS.gun}</>}
    >
      <div className="rounded-xl border border-white/10 bg-black/30 p-2">
        <svg viewBox="0 0 320 170" className="w-full" role="img" aria-label={`Boğaz kesiti, ${month} 1452, kale ${Math.round(p * 100)}% tamamlandı`}>
          {/* Su */}
          <rect x="0" y="120" width="320" height="50" fill={`color-mix(in srgb, ${WATER} 22%, ${BG})`} />
          {[0, 1, 2].map((k) => (
            <line key={k} x1="0" y1={128 + k * 10} x2="320" y2={128 + k * 10} stroke={`color-mix(in srgb, ${WATER} 30%, transparent)`} strokeWidth="1" />
          ))}
          {/* Sağ kıyı — Anadolu Hisarı (hep var) */}
          <rect x="270" y="96" width="50" height="24" fill={`color-mix(in srgb, ${MARBLE} 10%, ${BG})`} />
          <rect x="286" y="80" width="12" height="40" fill={`color-mix(in srgb, ${MARBLE} 16%, ${BG})`} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <text x="295" y="112" textAnchor="middle" style={{ fontSize: 6, fill: 'rgba(255,255,255,0.5)' }}>Anadolu H.</text>
          {/* Sol kıyı — Boğazkesen (yükselen) */}
          <rect x="0" y="96" width="70" height="24" fill={`color-mix(in srgb, ${MARBLE} 10%, ${BG})`} />
          {/* Üç kule, p ile yükselir */}
          {[10, 30, 50].map((x, k) => {
            const grown = p >= [0.34, 0.56, 0.74][k];
            const h = grown ? H : 0;
            return (
              <rect key={k} x={x} y={96 - h} width="14" height={h}
                fill={`color-mix(in srgb, ${GOLD} 16%, ${BG})`} stroke={grown ? GOLD : 'transparent'} strokeWidth="1"
                style={{ transition: reduced ? 'none' : 'all 0.35s ease' }} />
            );
          })}
          {/* Ara sur (son katman) */}
          {p >= 0.92 && (
            <rect x="8" y={96 - H * 0.55} width="56" height={H * 0.55} fill={`color-mix(in srgb, ${GOLD} 10%, ${BG})`} stroke={GOLD} strokeWidth="1" style={{ animation: reduced ? 'none' : 'fatih-fade 0.4s ease' }} />
          )}

          {/* Menzil konisi — kilitlenince iki kıyıyı birleştirir */}
          {locked && (
            <g style={{ animation: reduced ? 'none' : 'fatih-fade 0.5s ease' }}>
              <path d="M52 60 L286 96 L286 108 L52 74 Z" fill={`color-mix(in srgb, ${CRIMSON} 18%, transparent)`} />
              <line x1="52" y1="67" x2="286" y2="102" stroke={CRIMSON} strokeWidth="1.5" strokeDasharray="4 3" />
            </g>
          )}

          {/* Geçmeye çalışan buğday gemisi */}
          <g style={{ transform: `translateX(${locked ? 150 : 40 + p * 40}px)`, transition: reduced ? 'none' : 'transform 0.4s ease', opacity: locked ? 0.35 : 1 }}>
            <path d="M150 118 h22 l-4 8 h-14 z" fill={MARBLE} />
            <line x1="161" y1="104" x2="161" y2="118" stroke={MARBLE} strokeWidth="1.5" />
          </g>
        </svg>
      </div>

      <input
        type="range" min={0} max={1} step={0.01} value={p}
        onChange={(e) => setP(Number(e.target.value))}
        aria-label="Zaman: Nisan → Ağustos 1452"
        className="mt-3 w-full" style={{ accentColor: locked ? CRIMSON : GOLD }}
      />
      <div className="mt-1 flex items-center justify-between">
        <span className="font-mono text-sm font-bold" style={{ color: GOLD }}>{month} 1452</span>
        {locked ? (
          <span className="font-mono text-sm font-black" style={{ color: CRIMSON }}>Geçen gemi: {tr(BOSPHORUS.shipsPassed)}</span>
        ) : (
          <span className="font-mono text-xs text-slate-500">kale %{Math.round(p * 100)}</span>
        )}
      </div>

      {locked && (
        <p className="mt-3 text-sm leading-relaxed text-slate-300" style={{ animation: 'fatih-fade 0.5s ease' }}>{BOSPHORUS.protest}</p>
      )}
    </WidgetFrame>
  );
}

/* ══════════════════ 3 · Fatih’in Kütüphanesi: tıklanabilir raf (Perde 6A) ══════════════════ */

export function Library() {
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const [sel, setSel] = useState<string | null>(null);
  const book = LIBRARY_BOOKS.find((b) => b.key === sel) ?? null;
  const total = LIBRARY_BOOKS.length;

  const spineColor = (i: number) => {
    const pool = [GOLD, ACCENT, WATER, MARBLE, CRIMSON];
    return pool[i % pool.length];
  };

  function open(key: string) {
    setSel(key);
    setOpened((prev) => { if (prev.has(key)) return prev; const n = new Set(prev); n.add(key); return n; });
    refreshScroll();
  }

  return (
    <WidgetFrame
      kicker="İNTERAKTİF · FATİH’İN KÜTÜPHANESİ"
      title="Aynı raf hem İlyada’yı hem Kur’an’ı taşıyordu"
      hint="Her kitap sırtına dokun: neden bu kitap? Rafı kaydır."
    >
      {/* Sayaç (Zeigarnik) */}
      <div className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-4 py-2">
        <span className="text-xs text-slate-400">açtığın kitap</span>
        <span className="font-mono text-lg font-black" style={{ color: GOLD }}>{tr(opened.size)}<span className="ml-1 text-sm text-slate-500">/ {tr(total)}</span></span>
      </div>

      {/* Raf — yatay kaydırmalı */}
      <div className="flex snap-x gap-1.5 overflow-x-auto rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-black/30 p-3" style={{ scrollbarWidth: 'thin' }}>
        {LIBRARY_BOOKS.map((b, i) => {
          const on = b.key === sel;
          const isOpen = opened.has(b.key);
          const c = spineColor(i);
          return (
            <button
              key={b.key}
              onClick={() => open(b.key)}
              aria-pressed={on}
              title={b.title}
              className="relative grid h-32 w-9 shrink-0 snap-start place-items-end overflow-hidden rounded-sm border transition hover:-translate-y-1"
              style={{
                borderColor: on ? c : 'rgba(255,255,255,0.12)',
                background: `linear-gradient(180deg, color-mix(in srgb, ${c} ${on ? 34 : 20}%, ${BG}), color-mix(in srgb, ${c} 8%, ${BG}))`,
                boxShadow: on ? `0 0 0 1px ${c}` : undefined,
              }}
            >
              <span className="absolute inset-x-0 top-2 text-center text-[0.5rem]" style={{ color: isOpen ? c : 'rgba(255,255,255,0.35)' }}>{isOpen ? '●' : '○'}</span>
              <span className="mb-1 max-h-24 truncate px-0.5 text-[0.6rem] font-bold leading-none text-white/90" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{b.title}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-1 text-center text-[0.62rem] text-slate-400">← kaydır →</div>

      {/* Seçili kitap kartı */}
      {book ? (
        <div className="mt-3 rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${GOLD} 30%, transparent)`, background: `color-mix(in srgb, ${GOLD} 6%, transparent)`, animation: 'fatih-fade 0.35s ease' }}>
          <div className="text-base font-bold text-white">{book.title}</div>
          {book.author !== '—' && <div className="text-xs text-slate-400">{book.author}</div>}
          <div className="mt-1.5 text-[0.62rem] font-bold tracking-[0.15em]" style={{ color: GOLD }}>NEDEN BU KİTAP?</div>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">{book.why}</p>
        </div>
      ) : (
        <p className="mt-3 text-center text-sm text-slate-500">Bir kitap sırtına dokun.</p>
      )}
    </WidgetFrame>
  );
}

/* ══════════════════ 4 · “Sen olsaydın?” karar düğümü (Perde 5, oylama) ══════════════════ */

type DState = { phase: 'idle' } | { phase: 'chosen'; choice: string } | { phase: 'all'; choice: string };

export function EmperorDecision() {
  const [st, setSt] = useState<DState>({ phase: 'idle' });
  const [poll, setPoll] = useState<PollData | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/article-poll/${DECISION.pollKey}`)
      .then((r) => r.json())
      .then((d: PollData) => { if (!alive) return; setPoll(d); if (d.available && d.mine) setSt({ phase: 'all', choice: d.mine }); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => { refreshScroll(); }, [st.phase]);

  function choose(choice: string) {
    setSt({ phase: 'chosen', choice });
    fetch(`/api/article-poll/${DECISION.pollKey}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ choice }) })
      .then((r) => r.json())
      .then((d: PollData) => { if (d.available) setPoll(d); })
      .catch(() => {});
  }

  const mine = st.phase !== 'idle' ? DECISION_CHOICES.find((c) => c.key === st.choice) : null;

  return (
    <WidgetFrame
      hero
      kicker="KARAR DÜĞÜMÜ · 27 MAYIS 1453"
      title="Sen XI. Konstantin’sin. 7.000 adamın var. Karşında 80.000."
      hint="Bir seçim yap. Sonra gerçekte ne olduğunu gör — ve okurların nerede durduğunu."
    >
      <p className="mb-4 text-sm leading-relaxed text-slate-300">{DECISION.setup}</p>

      {st.phase === 'idle' && (
        <div className="grid gap-2.5">
          {DECISION_CHOICES.map((c) => (
            <button key={c.key} onClick={() => choose(c.key)} className="group rounded-xl border border-white/12 bg-white/[0.03] p-4 text-left transition hover:border-white/30 hover:bg-white/[0.06]">
              <div className="mb-0.5 text-base font-bold text-white">{c.label}</div>
              <div className="text-sm text-slate-400">{c.sub}</div>
            </button>
          ))}
        </div>
      )}

      {st.phase === 'chosen' && mine && (
        <div className="rounded-xl border p-5" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 6%, transparent)`, animation: 'fatih-fade 0.5s ease' }}>
          <div className="mb-1 text-xs text-slate-500">Senin seçimin: {mine.label}</div>
          <p className="text-sm leading-relaxed text-slate-200">{mine.reveal}</p>
          <div className="mt-3 text-sm font-semibold" style={{ color: `color-mix(in srgb, ${ACCENT} 88%, white)` }}>{mine.verdict}</div>
          <button onClick={() => setSt({ phase: 'all', choice: st.choice })} className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-bold" style={{ background: ACCENT, color: BG }}>Üçünün de sonunu gör →</button>
        </div>
      )}

      {st.phase === 'all' && (
        <div style={{ animation: 'fatih-fade 0.5s ease' }}>
          <div className="space-y-2">
            {DECISION_CHOICES.map((c) => {
              const isMine = c.key === st.choice;
              return (
                <div key={c.key} className="rounded-xl border p-3.5" style={{ borderColor: isMine ? `color-mix(in srgb, ${ACCENT} 40%, transparent)` : 'rgba(255,255,255,0.1)', background: isMine ? `color-mix(in srgb, ${ACCENT} 6%, transparent)` : 'rgba(255,255,255,0.02)' }}>
                  <div className="text-sm font-bold text-white">{c.label}{isMine && <span style={{ color: ACCENT }}> · senin seçimin</span>}</div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">{c.reveal}</p>
                </div>
              );
            })}
          </div>
          <div className="my-5 text-center">
            <div className="font-mono text-2xl font-black tracking-tight" style={{ color: CRIMSON }}>{DECISION.truth}</div>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">{DECISION.truthSub}</p>
          </div>
          <PollBars poll={poll} choices={DECISION_CHOICES.map((c) => ({ key: c.key, label: c.label }))} mine={st.choice} color={ACCENT} />
        </div>
      )}
    </WidgetFrame>
  );
}

/* ══════════════════ 5 · Jüri: “Sence zehirlendi mi?” (Perde 7, oylama) ══════════════════ */

export function PoisonJury() {
  const [voted, setVoted] = useState<string | null>(null);
  const [poll, setPoll] = useState<PollData | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/article-poll/${POISON.pollKey}`)
      .then((r) => r.json())
      .then((d: PollData) => { if (!alive) return; setPoll(d); if (d.available && d.mine) setVoted(d.mine); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => { refreshScroll(); }, [voted]);

  function vote(choice: string) {
    if (voted) return;
    setVoted(choice);
    fetch(`/api/article-poll/${POISON.pollKey}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ choice }) })
      .then((r) => r.json())
      .then((d: PollData) => { if (d.available) setPoll(d); })
      .catch(() => {});
  }

  const stanceColor = (s: string) => (s === 'lehte' ? CRIMSON : s === 'aleyhte' ? WATER : ASH);

  return (
    <WidgetFrame
      hero
      kicker="JÜRİ · 3 MAYIS 1481 · HÜNKÂR ÇAYIRI"
      title="Sence zehirlendi mi?"
      hint="Üç kanıt kartını oku. Sonra oy ver — ama kesin olamayacağını bilerek."
    >
      <div className="grid gap-2 sm:grid-cols-3">
        {POISON_EVIDENCE.map((e) => {
          const c = stanceColor(e.stance);
          return (
            <div key={e.key} className="rounded-xl border p-3.5" style={{ borderColor: `color-mix(in srgb, ${c} 30%, transparent)`, background: `color-mix(in srgb, ${c} 6%, transparent)` }}>
              <div className="mb-1 text-[0.6rem] font-bold tracking-[0.15em]" style={{ color: c }}>{e.title.toUpperCase()}</div>
              <p className="text-xs leading-relaxed text-slate-300">{e.text}</p>
            </div>
          );
        })}
      </div>

      {!voted ? (
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {POISON_CHOICES.map((c) => (
            <button key={c.key} onClick={() => vote(c.key)} className="rounded-xl border px-4 py-3.5 text-sm font-bold text-white transition hover:brightness-110" style={{ borderColor: c.key === 'zehir' ? `color-mix(in srgb, ${CRIMSON} 40%, transparent)` : `color-mix(in srgb, ${WATER} 40%, transparent)`, background: c.key === 'zehir' ? `color-mix(in srgb, ${CRIMSON} 12%, transparent)` : `color-mix(in srgb, ${WATER} 12%, transparent)` }}>
              {c.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4" style={{ animation: 'fatih-fade 0.5s ease' }}>
          <PollBars
            poll={poll}
            choices={POISON_CHOICES}
            mine={voted}
            color={voted === 'zehir' ? CRIMSON : WATER}
            emptyNote="Oyun kaydedildi."
          />
          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-center">
            <div className="text-base font-black" style={{ color: GOLD }}>{POISON.historiansVerdict}</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{POISON.heywood}</p>
          </div>
          <p className="mt-3 text-center text-sm font-semibold text-slate-300">{POISON.discuss}</p>
        </div>
      )}
    </WidgetFrame>
  );
}

/* ══════════════════ Paylaşılan oy çubukları ══════════════════ */

function PollBars({ poll, choices, mine, color = ACCENT, emptyNote }: {
  poll: PollData | null; choices: { key: string; label: string }[]; mine: string; color?: string; emptyNote?: string;
}) {
  if (!poll || !poll.available || !poll.counts || !poll.total) {
    return emptyNote ? <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center text-xs text-slate-500">{emptyNote}</div> : null;
  }
  const total = poll.total;
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 text-xs font-bold tracking-wide text-slate-400">{tr(total)} okur oy verdi</div>
      <div className="space-y-2.5">
        {choices.map((c) => {
          const n = poll.counts![c.key] ?? 0;
          const pct = total ? Math.round((n / total) * 100) : 0;
          const isMine = c.key === mine;
          return (
            <div key={c.key}>
              <div className="mb-1 flex justify-between text-xs">
                <span className={isMine ? 'font-bold text-white' : 'text-slate-400'}>{c.label}{isMine && <span style={{ color }}> · sen</span>}</span>
                <span className="font-mono text-slate-300">%{pct}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: isMine ? color : `color-mix(in srgb, ${MARBLE} 40%, transparent)` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
