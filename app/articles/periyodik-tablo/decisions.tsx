'use client';

// Anket tabanlı karar modülleri (çerezsiz anonim oy — lib/polls.ts + /api/article-poll).
// widgets.tsx'ten AYRI: bunlar ağ isteği yapan tek modüller, ötekiler saf state.
//
// ⚠ Seçenek id'leri data.ts ile lib/polls.ts arasında BİREBİR aynı olmalı. API
// serbest metni reddeder; uyuşmazlık hata vermez, sessizce "oy gitmedi" olur.

import { useEffect, useState } from 'react';
import { ACCENT, WidgetFrame, refreshScroll, tr } from './ui';
import { BOSLUK_KARARI, ADLANDIRMA_KARARI } from './data';

type PollData = { available: boolean; counts?: Record<string, number>; total?: number; mine?: string | null };

function usePoll(key: string) {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [mine, setMine] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/article-poll/${key}`)
      .then((r) => r.json())
      .then((d: PollData) => { if (!alive) return; setPoll(d); if (d.available && d.mine) setMine(d.mine); })
      .catch(() => {});
    return () => { alive = false; };
  }, [key]);

  const vote = (choice: string) => {
    setMine(choice);
    fetch(`/api/article-poll/${key}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ choice }),
    })
      .then((r) => r.json())
      .then((d: PollData) => { if (d.available) setPoll(d); })
      .catch(() => {});
  };

  return { poll, mine, vote };
}

function PollBars({ poll, choices, mine }: {
  poll: PollData | null; choices: { key: string; label: string }[]; mine: string | null;
}) {
  if (!poll || !poll.available || !poll.counts || !poll.total) {
    return <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center text-xs text-slate-500">Oyun kaydedildi.</div>;
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
              <div className="mb-1 flex justify-between gap-3 text-xs">
                <span className={isMine ? 'font-bold text-white' : 'text-slate-400'}>
                  {c.label}{isMine && <span style={{ color: ACCENT }}> · sen</span>}
                </span>
                <span className="shrink-0 font-mono text-slate-300">%{pct}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: isMine ? ACCENT : 'rgba(255,255,255,0.28)' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** İki karar düğümü aynı iskeleti paylaşıyor. */
function KararModulu({ veri, kicker }: {
  veri: typeof BOSLUK_KARARI | typeof ADLANDIRMA_KARARI;
  kicker: string;
}) {
  const { poll, mine, vote } = usePoll(veri.pollKey);
  useEffect(() => { refreshScroll(); }, [mine]);

  const choices = veri.secenekler.map((s) => ({ key: s.id, label: s.label }));
  const dogru = veri.secenekler.find((s) => s.id === veri.gercek)!;

  return (
    <WidgetFrame
      hero
      kicker={`${kicker} · ${veri.yil}`}
      title={veri.soru}
      hint="Bir seçim yap. Sonra gerçekte ne olduğunu ve okurların nerede durduğunu gör."
    >
      <p className="mb-4 text-sm leading-relaxed text-slate-300">{veri.olay}</p>

      {!mine ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {veri.secenekler.map((s) => (
            <button
              key={s.id}
              onClick={() => vote(s.id)}
              className="min-h-[52px] rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm font-bold text-white transition hover:border-white/30 hover:bg-white/10"
            >
              {s.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className="rounded-xl border p-3.5"
            style={{ borderColor: `color-mix(in srgb, ${ACCENT} 35%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 8%, transparent)` }}
          >
            <div className="mb-1 text-[0.62rem] font-bold tracking-[0.18em]" style={{ color: ACCENT }}>
              GERÇEKTE NE OLDU
            </div>
            <div className="mb-1.5 text-sm font-bold text-white">{dogru.label}</div>
            <p className="text-sm leading-relaxed text-slate-300">{veri.sonuc}</p>
          </div>
          <PollBars poll={poll} choices={choices} mine={mine} />
        </div>
      )}
    </WidgetFrame>
  );
}

export function BoslukKarari() {
  return <KararModulu veri={BOSLUK_KARARI} kicker="KARAR DÜĞÜMÜ" />;
}

export function AdlandirmaKarari() {
  return <KararModulu veri={ADLANDIRMA_KARARI} kicker="KARAR DÜĞÜMÜ" />;
}
