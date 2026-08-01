'use client';

// Anket tabanlı karar modülleri (çerezsiz anonim oy — lib/polls.ts + /api/article-poll).
// widgets.tsx'ten AYRI tutuldu: bunlar ağ isteği yapan tek modüller, ötekiler saf state.
//
// Seçenek id'leri data.ts ile lib/polls.ts arasında BİREBİR aynı olmalı; API
// istemciden gelen serbest metni reddediyor, uyuşmazlık sessiz "oy gitmedi"
// olarak görünür (hata vermez) → id değiştirirsen üç yeri birlikte değiştir.

import { useEffect, useState } from 'react';
import { ACCENT, BONE, GARNET, GOLD, IRON, WidgetFrame, buyuk, refreshScroll, tr } from './ui';
import { HONORIA, ITALYA_ANKET, OLUM } from './data';

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

/** Paylaşılan oy çubukları. Oy yoksa (tablo/ağ yoksa) sessizce küçük bir not. */
export function PollBars({ poll, choices, mine, color = ACCENT }: {
  poll: PollData | null;
  choices: { key: string; label: string }[];
  mine: string | null;
  color?: string;
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
                  {c.label}{isMine && <span style={{ color }}> · sen</span>}
                </span>
                <span className="shrink-0 font-mono text-slate-300">%{pct}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: isMine ? color : `color-mix(in srgb, ${BONE} 34%, transparent)` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════ Perde 6 · Honoria karar noktası ══════════════ */

export function HonoriaKarar() {
  const { poll, mine, vote } = usePoll('atilla-honoria');
  useEffect(() => { refreshScroll(); }, [mine]);

  const secilen = HONORIA.karar.secenekler.find((s) => s.id === mine) ?? null;
  const gercek = HONORIA.karar.secenekler.find((s) => s.id === HONORIA.karar.gercek)!;
  const choices = HONORIA.karar.secenekler.map((s) => ({ key: s.id, label: s.label }));

  return (
    <WidgetFrame
      hero
      kicker={`KARAR DÜĞÜMÜ · ${HONORIA.yil}`}
      title={HONORIA.karar.soru}
      hint="Bir seçim yap. Sonra gerçekte ne olduğunu ve okurların nerede durduğunu gör."
    >
      <p className="mb-4 text-sm leading-relaxed text-slate-300">
        {HONORIA.olay} {HONORIA.yorum}
      </p>

      {!mine ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {HONORIA.karar.secenekler.map((s) => (
            <button
              key={s.id}
              onClick={() => vote(s.id)}
              className="min-h-[52px] rounded-xl border px-4 py-3 text-left text-sm font-bold text-white transition hover:brightness-125"
              style={{ borderColor: `color-mix(in srgb, ${ACCENT} 38%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 10%, transparent)` }}
            >
              {s.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4" style={{ animation: 'atilla-fade 0.5s ease-out' }}>
          {secilen && (
            <div className="rounded-xl border p-4" style={{ borderColor: `${ACCENT}55`, background: `color-mix(in srgb, ${ACCENT} 9%, transparent)` }}>
              <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: ACCENT }}>SENİN KARARIN · {buyuk(secilen.label)}</div>
              <p className="text-sm leading-relaxed text-slate-200">{secilen.sonuc}</p>
            </div>
          )}

          {mine !== HONORIA.karar.gercek && (
            <div className="rounded-xl border p-4" style={{ borderColor: `${GOLD}44`, background: `color-mix(in srgb, ${GOLD} 8%, transparent)` }}>
              <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: GOLD }}>GERÇEKTE OLAN · {buyuk(gercek.label)}</div>
              <p className="text-sm leading-relaxed text-slate-200">{gercek.sonuc}</p>
            </div>
          )}

          <PollBars poll={poll} choices={choices} mine={mine} color={ACCENT} />

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="mb-2 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: IRON }}>İKİ OKUMA</div>
            {HONORIA.ikiOkuma.map((o, i) => (
              <p key={i} className="mt-1.5 text-sm leading-relaxed text-slate-400">{o}</p>
            ))}
          </div>

          <p className="text-sm font-semibold leading-relaxed" style={{ color: BONE }}>{HONORIA.sonuc}</p>
        </div>
      )}
    </WidgetFrame>
  );
}

/* ══════════════ Perde 8 · İtalya anketi (ifşadan ÖNCE sorulur) ══════════════ */

/**
 * Sıra önemli: okur kaynakları GÖRMEDEN oy veriyor. Amaç okuru yakalamak değil,
 * kendi ön kabulünü görünür kılmak — kaynak karşılaştırıcısı hemen ardından
 * geliyor ve cevabı vermiyor, dördünü yan yana koyuyor.
 */
export function ItalyaAnketi({ onVote }: { onVote?: () => void }) {
  const { poll, mine, vote } = usePoll('atilla-italya');
  useEffect(() => { refreshScroll(); }, [mine]);

  const choices = ITALYA_ANKET.secenekler.map((s) => ({ key: s.id, label: s.label }));

  return (
    <WidgetFrame
      kicker="PERDE 8 · ÖNCE SEN SÖYLE"
      title={ITALYA_ANKET.soru}
      hint="Kaynakları görmeden cevapla. Hemen ardından dördünü yan yana koyacağız."
      footnote={ITALYA_ANKET.not}
    >
      {!mine ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {ITALYA_ANKET.secenekler.map((s) => (
            <button
              key={s.id}
              onClick={() => { vote(s.id); onVote?.(); }}
              className="min-h-[52px] rounded-xl border px-4 py-3 text-left text-sm font-bold text-white transition hover:brightness-125"
              style={{ borderColor: `color-mix(in srgb, ${GARNET} 40%, transparent)`, background: `color-mix(in srgb, ${GARNET} 10%, transparent)` }}
            >
              {s.label}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ animation: 'atilla-fade 0.5s ease-out' }}>
          <PollBars poll={poll} choices={choices} mine={mine} color={GARNET} />
        </div>
      )}
    </WidgetFrame>
  );
}

/* ══════════════ Perde 9 · Otağ — okur ölümü karara bağlıyor ══════════════ */

/**
 * Makalenin en zor modülü, çünkü DOĞRU CEVABI YOK ve olmadığını söylemek
 * zorunda. Fatih'in zehir jürisi ile aynı hat: seçim yaptıktan sonra okura
 * "doğru bildin / yanlış bildin" DEMİYORUZ — seçtiği ihtimalin kaynağını,
 * gücünü ve zaafını gösterip ötekileri de açık bırakıyoruz.
 *
 * Kasıtlı tasarım: seçimden sonra DİĞER ÜÇ ihtimal de okunabilir kalıyor.
 * Kapatsaydık, okur kendi seçtiğini "kazanan" sanırdı.
 */
export function OtagKarari() {
  const { poll, mine, vote } = usePoll('atilla-otag');
  const [acik, setAcik] = useState<string | null>(null);
  useEffect(() => { refreshScroll(); }, [mine, acik]);

  const secilen = OLUM.secenekler.find((s) => s.id === mine) ?? null;
  const choices = OLUM.secenekler.map((s) => ({ key: s.id, label: s.label }));
  const digerleri = OLUM.secenekler.filter((s) => s.id !== mine);

  return (
    <WidgetFrame
      hero
      kicker={`OTAĞ · ${OLUM.yil} · SEN İÇERİ GİRİYORSUN`}
      title="Kim öldürdü — yoksa kendi mi öldü?"
      hint="Dört ihtimalin dördünün de arkasında gerçek bir kaynak var. Seçtikten sonra hepsini okuyabileceksin."
    >
      {/* Sahne */}
      <div className="rounded-xl border p-4" style={{ borderColor: `${GARNET}44`, background: `color-mix(in srgb, ${GARNET} 8%, transparent)` }}>
        <p className="text-sm leading-relaxed text-slate-200">{OLUM.sahne}</p>
      </div>

      {!mine ? (
        <>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">{OLUM.girisMetni}</p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {OLUM.secenekler.map((s) => (
              <button
                key={s.id}
                onClick={() => vote(s.id)}
                className="min-h-[76px] rounded-xl border px-4 py-3 text-left transition hover:brightness-125"
                style={{ borderColor: `color-mix(in srgb, ${ACCENT} 38%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 9%, transparent)` }}
              >
                <span className="block text-sm font-bold text-white">{s.label}</span>
                <span className="mt-1 block text-xs leading-snug text-slate-400">{s.ozet}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-4 space-y-4" style={{ animation: 'atilla-fade 0.5s ease-out' }}>
          {secilen && (
            <div className="rounded-xl border p-4" style={{ borderColor: `${ACCENT}66`, background: `color-mix(in srgb, ${ACCENT} 10%, transparent)` }}>
              <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: ACCENT }}>
                SENİN KARARIN · {buyuk(secilen.label)}
              </div>
              <p className="text-sm leading-relaxed text-slate-200">{secilen.delil}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border p-3" style={{ borderColor: `${BONE}33`, background: 'rgba(255,255,255,0.03)' }}>
                  <div className="text-[0.58rem] font-bold tracking-[0.16em]" style={{ color: BONE }}>GÜCÜ</div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">{secilen.guc}</p>
                </div>
                <div className="rounded-lg border p-3" style={{ borderColor: `${IRON}44`, background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-[0.58rem] font-bold tracking-[0.16em]" style={{ color: IRON }}>ZAAFI</div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{secilen.zaaf}</p>
                </div>
              </div>
              <p className="mt-3 font-mono text-[0.68rem]" style={{ color: IRON }}>Kaynak · {secilen.kaynak}</p>
            </div>
          )}

          <PollBars poll={poll} choices={choices} mine={mine} color={ACCENT} />

          {/* Diğer üç ihtimal AÇIK kalıyor — bilerek. */}
          <div>
            <div className="mb-2 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: IRON }}>
              ÖTEKİ ÜÇ İHTİMAL — HÂLÂ AÇIK
            </div>
            <div className="space-y-2">
              {digerleri.map((s) => {
                const on = acik === s.id;
                return (
                  <div key={s.id} className="overflow-hidden rounded-xl border transition"
                    style={{ borderColor: on ? `${BONE}44` : 'rgba(255,255,255,0.1)', background: on ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
                    <button onClick={() => setAcik(on ? null : s.id)} aria-expanded={on}
                      className="flex w-full items-center gap-3 px-3.5 py-3 text-left">
                      <span className="flex-1">
                        <span className="block text-sm font-bold" style={{ color: on ? BONE : '#d6d3d1' }}>{s.label}</span>
                        <span className="mt-0.5 block text-xs text-slate-500">{s.ozet}</span>
                      </span>
                      <span aria-hidden className="text-xs transition" style={{ color: IRON, transform: on ? 'rotate(90deg)' : 'none' }}>›</span>
                    </button>
                    {on && (
                      <div className="px-3.5 pb-3.5">
                        <p className="text-[0.84rem] leading-relaxed text-slate-300">{s.delil}</p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-400"><strong style={{ color: BONE }}>Gücü:</strong> {s.guc}</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-400"><strong style={{ color: IRON }}>Zaafı:</strong> {s.zaaf}</p>
                        <p className="mt-2 font-mono text-[0.66rem]" style={{ color: IRON }}>Kaynak · {s.kaynak}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/25 p-4">
            <p className="text-sm font-semibold leading-relaxed" style={{ color: BONE }}>{OLUM.kapanis}</p>
          </div>
        </div>
      )}
    </WidgetFrame>
  );
}
