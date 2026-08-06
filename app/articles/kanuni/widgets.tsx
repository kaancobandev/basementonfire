'use client';

// Kanuni makalesinin HAFİF interaktif modülleri (canvas/GSAP yok → SSR'a girer).
// Tez: kanunu yazan adamın kendi kanununa yenilmesi. Her etkileşim okuru yorum
// yapmaya değil, mekanizmayı kendi eliyle çalıştırmaya davet eder — ve iki
// yerde (Perde 5, Perde 8) mekanizmayı çalıştıran KENDİSİ olur.

import { useEffect, useState } from 'react';
import { buyuk } from '@/lib/turkce';
import { ProofShare, type ProofSpec } from '@/app/components/article/ProofCard';
import {
  ACCENT, BG, GOLD, CORAL, COBALT, MARBLE, ASH,
  WidgetFrame, tr, refreshScroll,
} from './ui';
import {
  CROWN, CASES, CASES_NOTE, CAMPAIGNS, VIYANA,
  IBRAHIM, MUSTAFA, MUSTAFA_CHOICES, KARDES, TUGRA_PARTS, FINALE,
} from './data';

type PollData = { available: boolean; counts?: Record<string, number>; total?: number; mine?: string | null };

/* ══════════════ Şematik tuğra (mühür tuzakları + sözlük) ══════════════
   Bu ÇİZİM Süleyman’ın gerçek tuğrasının kopyası DEĞİL, parçalarını gösteren
   şematik bir temsildir (beyze / tuğ / zülfe / sere / kol). Böyle çizildi ki
   ne bir müze görselinin lisansına ne de yanlış bir "orijinal" iddiasına
   ihtiyaç olsun; widget da bunu açıkça yazar. */
function TugraMark({ size = 200, color = GOLD, highlight, dim = false }: { size?: number; color?: string; highlight?: string; dim?: boolean }) {
  const on = (k: string) => (highlight ? (highlight === k ? color : `color-mix(in srgb, ${ASH} 55%, transparent)`) : color);
  return (
    <svg viewBox="0 0 300 170" width={size} height={size * 0.567} role="img" aria-label="Şematik tuğra" style={{ opacity: dim ? 0.5 : 1 }}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* beyze: soldaki iki yumurta kavis */}
        <path d="M96 128 C 34 132, 14 96, 34 70 C 52 46, 92 52, 100 78" stroke={on('beyze')} strokeWidth="7" />
        <path d="M99 122 C 56 124, 42 98, 56 80 C 70 63, 96 70, 101 88" stroke={on('beyze')} strokeWidth="5" />
        {/* sere: gövde (isim satırı) */}
        <path d="M96 128 L 232 128" stroke={on('sere')} strokeWidth="8" />
        <path d="M104 141 L 214 141" stroke={on('sere')} strokeWidth="5" />
        {/* tuğ: üç dikey elif */}
        <path d="M124 128 C 121 88, 122 52, 126 20" stroke={on('tug')} strokeWidth="7" />
        <path d="M150 128 C 147 88, 148 52, 152 20" stroke={on('tug')} strokeWidth="7" />
        <path d="M176 128 C 173 88, 174 52, 178 20" stroke={on('tug')} strokeWidth="7" />
        {/* zülfe: tuğ tepelerinden sola savrulan kıvrımlar */}
        <path d="M126 24 C 112 12, 92 16, 84 30" stroke={on('zulfe')} strokeWidth="4" />
        <path d="M152 24 C 138 12, 118 16, 110 30" stroke={on('zulfe')} strokeWidth="4" />
        <path d="M178 24 C 164 12, 144 16, 136 30" stroke={on('zulfe')} strokeWidth="4" />
        {/* kol: sağa uzanan kuyruk */}
        <path d="M204 128 C 236 126, 266 116, 288 96" stroke={on('kol')} strokeWidth="6" />
        <path d="M206 141 C 232 140, 252 134, 268 122" stroke={on('kol')} strokeWidth="4" />
      </g>
    </svg>
  );
}

/* ══════════════════ 1 · Dört taçlı miğfer: katman katman (Perde 1) ══════════════════ */

export function VenetianCrown() {
  const [open, setOpen] = useState(0); // kaç taç açıldı
  const done = open >= CROWN.tiers;

  useEffect(() => { refreshScroll(); }, [open]);

  return (
    <WidgetFrame
      hero
      kicker={`VENEDİK · ${CROWN.year} · SİPARİŞ: ${buyuk(CROWN.buyer)}`}
      title="Sayfanın başındaki taç. Kaç katlı olduğuna dikkat ettin mi?"
      hint="Taçlara sırayla dokun."
      footnote={<>Kaynak · Gülru Necipoğlu, <em>The Art Bulletin</em> (1989); miğfer {CROWN.city}’te kuyumcu {CROWN.maker} tarafından yapıldı.</>}
    >
      <div className="grid gap-2.5">
        {CROWN.layers.map((l, i) => {
          const shown = i < open;
          const next = i === open;
          return (
            <button
              key={l.n}
              onClick={() => next && setOpen(i + 1)}
              // YALNIZ sıradaki kart etkin. Önce `!next && !shown` idi: açılmış
              // kartlar da buton olarak etkin kalıyordu, tıklanınca hiçbir şey
              // olmuyordu (klavyeyle de odak alıyorlardı) — ölü etkileşim.
              disabled={!next}
              className={`rounded-xl border p-3.5 text-left transition ${next ? 'hover:brightness-110' : ''} ${shown ? '' : 'opacity-70'}`}
              style={{
                borderColor: shown ? `color-mix(in srgb, ${GOLD} 40%, transparent)` : 'rgba(255,255,255,0.12)',
                background: shown ? `color-mix(in srgb, ${GOLD} 8%, transparent)` : 'rgba(255,255,255,0.03)',
                cursor: next ? 'pointer' : 'default',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border font-mono text-sm font-black"
                  style={{ borderColor: shown ? GOLD : 'rgba(255,255,255,0.2)', color: shown ? GOLD : 'rgba(255,255,255,0.45)' }}>
                  {l.n}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white">{l.label}</div>
                  <div className="mt-0.5 text-sm leading-relaxed text-slate-300">
                    {shown ? l.text : next ? 'Dokun →' : '—'}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {done && (
        <div className="mt-5 space-y-3" style={{ animation: 'kanuni-fade 0.5s ease' }}>
          <div className="rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${GOLD} 35%, transparent)`, background: `color-mix(in srgb, ${GOLD} 7%, transparent)` }}>
            <div className="mb-1 font-mono text-2xl font-black" style={{ color: GOLD }}>{CROWN.tiers} &gt; {CROWN.popeTiers}</div>
            <p className="text-sm leading-relaxed text-slate-200">{CROWN.reveal}</p>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">{CROWN.never}</p>
          <p className="text-base font-semibold leading-relaxed text-white">{CROWN.punch}</p>
        </div>
      )}
    </WidgetFrame>
  );
}

/* ══════════════════ 2 · Divan’da bir dava: kadı sensin (Perde 2) ══════════════════ */

export function DivandaBirDava() {
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const c = CASES[i];
  const picked = picks[c.id];
  const right = picked === c.answer;
  const last = i === CASES.length - 1;
  const score = CASES.filter((k) => picks[k.id] === k.answer).length;
  const allDone = Object.keys(picks).length === CASES.length;

  useEffect(() => { refreshScroll(); }, [i, picked]);

  return (
    <WidgetFrame
      kicker={`DAVA ${i + 1} / ${CASES.length} · SEN KADISIN`}
      title={c.title}
      hint="Hükmü ver, sonra kanunnâmenin ne dediğini gör."
      footnote={CASES_NOTE}
    >
      <p className="mb-4 text-sm leading-relaxed text-slate-300">{c.setup}</p>

      <div className="grid gap-2.5">
        {c.opts.map((o) => {
          const isPick = picked === o.key;
          const isAnswer = o.key === c.answer;
          let border = 'rgba(255,255,255,0.12)';
          let bg = 'rgba(255,255,255,0.03)';
          if (picked) {
            if (isAnswer) { border = `color-mix(in srgb, ${ACCENT} 45%, transparent)`; bg = `color-mix(in srgb, ${ACCENT} 10%, transparent)`; }
            else if (isPick) { border = `color-mix(in srgb, ${CORAL} 45%, transparent)`; bg = `color-mix(in srgb, ${CORAL} 8%, transparent)`; }
          }
          return (
            <button
              key={o.key}
              onClick={() => !picked && setPicks((p) => ({ ...p, [c.id]: o.key }))}
              disabled={!!picked}
              className="flex items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition hover:brightness-110"
              style={{ borderColor: border, background: bg }}
            >
              <span className="text-white">{o.label}</span>
              {picked && isAnswer && <span className="ml-auto" style={{ color: ACCENT }}>✓</span>}
              {picked && isPick && !isAnswer && <span className="ml-auto" style={{ color: CORAL }}>✗</span>}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="mt-4" style={{ animation: 'kanuni-fade 0.4s ease' }}>
          <div className="rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${COBALT} 40%, transparent)`, background: `color-mix(in srgb, ${COBALT} 9%, transparent)` }}>
            <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: `color-mix(in srgb, ${COBALT} 70%, white)` }}>
              KANUNNÂME NE DİYOR
            </div>
            <p className="text-sm leading-relaxed text-slate-200">{c.reveal}</p>
          </div>
          {!last ? (
            <button onClick={() => setI(i + 1)} className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-bold" style={{ background: ACCENT, color: BG }}>
              Sonraki dava →
            </button>
          ) : allDone ? (
            <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-4 text-center">
              <div className="font-mono text-2xl font-black" style={{ color: right || score > 1 ? ACCENT : GOLD }}>{score} / {CASES.length}</div>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                Kaç tanesini bildiğin önemli değil. Önemli olan şu: bu bir makineydi ve makine <strong className="text-slate-200">çalışıyordu</strong>.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </WidgetFrame>
  );
}

/* ══════════════════ 3 · Sefer takvimi: imparatorluğun sınırı (Perde 4) ══════════════════ */

export function SeferTakvimi() {
  const [k, setK] = useState('viyana');
  const c = CAMPAIGNS.find((x) => x.key === k) ?? CAMPAIGNS[0];
  const maxKm = Math.max(...CAMPAIGNS.map((x) => x.km));

  useEffect(() => { refreshScroll(); }, [k]);

  return (
    <WidgetFrame
      hero
      kicker="SEFER TAKVİMİ · KAYITLI TARİHLER"
      title="Sefer mevsimi bahar sonunda açılır, ekim ortasında kapanır. Aradaki her gün yürüyüşe gider."
      hint="Bir hedef seç. Yolun ne kadarını yürümekle geçirdiğine bak."
      footnote="Mesafeler yürüyüş güzergâhı üzerinden yaklaşıktır; tarihler kayıtlıdır. 1529 seferi bu hesabın kendi kanıtıdır: 10 Mayıs’ta çıkıldı, 27 Eylül’de varıldı."
    >
      <div className="mb-4 flex flex-wrap gap-1.5">
        {CAMPAIGNS.map((x) => {
          const on = x.key === k;
          return (
            <button
              key={x.key}
              onClick={() => setK(x.key)}
              className="rounded-lg border px-3 py-2 text-xs font-bold transition"
              style={on
                ? { background: ACCENT, color: BG, borderColor: ACCENT }
                : { borderColor: 'rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.75)' }}
            >
              {x.label} <span className="font-mono opacity-70">{x.year}</span>
            </button>
          );
        })}
      </div>

      {/* mesafe çubuğu */}
      <div className="mb-4">
        <div className="mb-1.5 flex justify-between text-xs text-slate-400">
          <span>İstanbul</span>
          <span className="font-mono">~{tr(c.km)} km</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(c.km / maxKm) * 100}%`, background: `linear-gradient(90deg, ${COBALT}, ${ACCENT})` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-[0.62rem] text-slate-500">ÇIKIŞ</div>
          <div className="text-sm font-bold text-white">{c.departure}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-[0.62rem] text-slate-500">VARIŞ</div>
          <div className="text-sm font-bold text-white">{c.arrival}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-[0.62rem] text-slate-500">SONUÇ</div>
          <div className="text-sm font-bold" style={{ color: c.result === 'alınamadı' ? CORAL : MARBLE }}>{c.result}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-[0.62rem] text-slate-500">SEFER MEVSİMİ BİTİŞİ</div>
          <div className="text-sm font-bold" style={{ color: CORAL }}>{VIYANA.seasonEnd}</div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-300">{c.note}</p>

      {k === 'viyana' && (
        <div className="mt-4 rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${CORAL} 35%, transparent)`, background: `color-mix(in srgb, ${CORAL} 7%, transparent)`, animation: 'kanuni-fade 0.4s ease' }}>
          <div className="flex items-end gap-3">
            <div>
              <div className="font-mono text-3xl font-black" style={{ color: CORAL }}>{VIYANA.marchDays}</div>
              <div className="text-[0.68rem] text-slate-400">gün yürüyüş</div>
            </div>
            <div className="pb-1 text-slate-600">/</div>
            <div>
              <div className="font-mono text-3xl font-black" style={{ color: MARBLE }}>{VIYANA.siegeDays}</div>
              <div className="text-[0.68rem] text-slate-400">gün kuşatma</div>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">{VIYANA.why}</p>
          <p className="mt-2 text-base font-semibold text-white">{VIYANA.punch}</p>
        </div>
      )}
    </WidgetFrame>
  );
}

/* ══════════════════ 4 · TUZAK 1: mührü bas (Perde 5) ══════════════════ */

export function MuhruBas() {
  const [stamped, setStamped] = useState(false);
  useEffect(() => { refreshScroll(); }, [stamped]);

  return (
    <WidgetFrame
      hero
      kicker={IBRAHIM.ferman.kicker}
      title="Hüküm hazır. Tek eksik mühür."
    >
      <div className="rounded-xl border p-5" style={{ borderColor: `color-mix(in srgb, ${COBALT} 40%, transparent)`, background: 'rgba(0,0,0,0.28)' }}>
        <p className="text-center text-sm leading-relaxed text-slate-200 sm:text-base">{IBRAHIM.ferman.body}</p>
        <div className="mt-4 grid place-items-center">
          {stamped ? (
            <div style={{ animation: 'kanuni-stamp 0.35s cubic-bezier(.2,1.4,.4,1)' }}>
              <TugraMark size={190} color={CORAL} />
            </div>
          ) : (
            <div className="grid h-[108px] w-[190px] place-items-center rounded-lg border border-dashed border-white/20 text-[0.62rem] tracking-[0.2em] text-slate-600">
              MÜHÜR YERİ
            </div>
          )}
        </div>
      </div>

      {!stamped ? (
        <button
          onClick={() => { setStamped(true); refreshScroll(); }}
          className="mt-4 w-full rounded-xl px-4 py-4 text-base font-black transition hover:brightness-110"
          style={{ background: GOLD, color: BG }}
        >
          🖋 {IBRAHIM.ferman.button}
        </button>
      ) : (
        <div className="mt-4 space-y-3" style={{ animation: 'kanuni-fade 0.5s ease' }}>
          <div className="rounded-xl border p-4 text-center" style={{ borderColor: `color-mix(in srgb, ${CORAL} 40%, transparent)`, background: `color-mix(in srgb, ${CORAL} 8%, transparent)` }}>
            <div className="text-lg font-black text-white">{IBRAHIM.trapReveal}</div>
          </div>
          <p className="text-sm leading-relaxed text-slate-200">{IBRAHIM.trapBody}</p>
          <p className="text-base font-semibold leading-relaxed" style={{ color: `color-mix(in srgb, ${GOLD} 88%, white)` }}>{IBRAHIM.trapPunch}</p>
        </div>
      )}
    </WidgetFrame>
  );
}

/* ══════════════════ 5 · Otağ: karar düğümü + oylama (Perde 6) ══════════════════ */

type DState = { phase: 'idle' } | { phase: 'chosen'; choice: string } | { phase: 'all'; choice: string };

export function Cadir() {
  const [st, setSt] = useState<DState>({ phase: 'idle' });
  const [poll, setPoll] = useState<PollData | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/article-poll/${MUSTAFA.pollKey}`)
      .then((r) => r.json())
      .then((d: PollData) => { if (!alive) return; setPoll(d); if (d.available && d.mine) setSt({ phase: 'all', choice: d.mine }); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => { refreshScroll(); }, [st.phase]);

  function choose(choice: string) {
    setSt({ phase: 'chosen', choice });
    fetch(`/api/article-poll/${MUSTAFA.pollKey}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ choice }) })
      .then((r) => r.json())
      .then((d: PollData) => { if (d.available) setPoll(d); })
      .catch(() => {});
  }

  const mine = st.phase !== 'idle' ? MUSTAFA_CHOICES.find((c) => c.key === st.choice) : null;

  return (
    <WidgetFrame
      hero
      kicker={`KARAR DÜĞÜMÜ · ${buyuk(MUSTAFA.date)}`}
      title="Sen Şehzade Mustafa’sın. Otağa çağrıldın."
      hint="Bir seçim yap. Sonra üç kapının da nereye çıktığını gör."
    >
      <p className="mb-4 text-sm leading-relaxed text-slate-300">{MUSTAFA.setup}</p>

      {st.phase === 'idle' && (
        <div className="grid gap-2.5">
          {MUSTAFA_CHOICES.map((c) => (
            <button key={c.key} onClick={() => choose(c.key)} className="rounded-xl border border-white/12 bg-white/[0.03] p-4 text-left transition hover:border-white/30 hover:bg-white/[0.06]">
              <div className="mb-0.5 text-base font-bold text-white">{c.label}</div>
              <div className="text-sm text-slate-400">{c.sub}</div>
            </button>
          ))}
        </div>
      )}

      {st.phase === 'chosen' && mine && (
        <div className="rounded-xl border p-5" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 6%, transparent)`, animation: 'kanuni-fade 0.5s ease' }}>
          <div className="mb-1 text-xs text-slate-500">Senin seçimin: {mine.label}</div>
          <p className="text-sm leading-relaxed text-slate-200">{mine.reveal}</p>
          <div className="mt-3 text-sm font-semibold" style={{ color: `color-mix(in srgb, ${CORAL} 88%, white)` }}>{mine.verdict}</div>
          <button onClick={() => setSt({ phase: 'all', choice: st.choice })} className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-bold" style={{ background: ACCENT, color: BG }}>
            Üç kapının da sonunu gör →
          </button>
        </div>
      )}

      {st.phase === 'all' && (
        <div style={{ animation: 'kanuni-fade 0.5s ease' }}>
          <div className="space-y-2">
            {MUSTAFA_CHOICES.map((c) => {
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
            <div className="font-mono text-2xl font-black tracking-tight" style={{ color: CORAL }}>{MUSTAFA.truth}</div>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">{MUSTAFA.truthSub}</p>
          </div>
          <PollBars
            poll={poll}
            choices={MUSTAFA_CHOICES.map((c) => ({ key: c.key, label: c.label }))}
            mine={st.choice}
            color={ACCENT}
            proof={({ label, pct, total }) => ({
              kicker: '⚖️  1 5 5 3  ·  O T A Ğ',
              value: `%${pct}`,
              lines: ['okur benimle aynı kapıyı seçti.'],
              detail: `${tr(total)} okur oy verdi · senin seçimin: ${label}`,
              punch: 'Üç kapı da aynı yere çıkıyordu.',
              accent: ACCENT,
              bg: ['#070c1e', '#101a3a', '#1b2b57'],
              shareText: `Şehzade Mustafa’nın yerinde "${label}" derdim — okurların %${pct}’i benimle aynı fikirde`,
              fileName: 'kanuni-otag',
            })}
          />
        </div>
      )}
    </WidgetFrame>
  );
}

/* ══════════════════ 6 · Kardeş katli maddesi: jüri (Perde 7) ══════════════════ */

export function KardesKatliJuri() {
  const [choice, setChoice] = useState<string | null>(null);
  const [poll, setPoll] = useState<PollData | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/article-poll/${KARDES.pollKey}`)
      .then((r) => r.json())
      .then((d: PollData) => { if (!alive) return; setPoll(d); if (d.available && d.mine) setChoice(d.mine); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => { refreshScroll(); }, [choice]);

  function vote(k: string) {
    setChoice(k);
    fetch(`/api/article-poll/${KARDES.pollKey}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ choice: k }) })
      .then((r) => r.json())
      .then((d: PollData) => { if (d.available) setPoll(d); })
      .catch(() => {});
  }

  return (
    <WidgetFrame
      kicker="JÜRİ · SEN NE DİYORSUN"
      title={KARDES.question}
      hint="Dört kaynağı okudun. Şimdi oyunu ver."
    >
      {!choice ? (
        <div className="grid gap-2.5">
          {KARDES.choices.map((c) => (
            <button key={c.key} onClick={() => vote(c.key)} className="rounded-xl border border-white/12 bg-white/[0.03] p-4 text-left text-base font-bold text-white transition hover:border-white/30 hover:bg-white/[0.06]">
              {c.label}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ animation: 'kanuni-fade 0.5s ease' }}>
          <PollBars
            poll={poll}
            choices={KARDES.choices.map((c) => ({ key: c.key, label: c.label }))}
            mine={choice}
            color={GOLD}
            emptyNote="Oylar henüz sayılamıyor — ama senin oyun kaydedildi."
            proof={({ label, pct, total }) => ({
              kicker: '📜  K A R D E Ş  K A T L İ  M A D D E S İ',
              value: `%${pct}`,
              lines: ['okur benimle aynı yerde duruyor.'],
              detail: `${tr(total)} okur oy verdi · senin oyun: ${label}`,
              punch: KARDES.proofPunch,
              accent: GOLD,
              bg: ['#070c1e', '#171331', '#2a1f2a'],
              shareText: `Fatih Kanunnâmesi’ndeki kardeş katli maddesi için "${label}" diyorum — okurların %${pct}’i benimle aynı fikirde`,
              fileName: 'kanuni-kardes-katli',
            })}
          />
          <p className="mt-4 text-sm leading-relaxed text-slate-400">{KARDES.bottom}</p>
        </div>
      )}
    </WidgetFrame>
  );
}

/* ══════════════════ 7 · Tuğrayı çöz (Perde 8, küçük) ══════════════════ */

export function TugrayiCoz() {
  const [k, setK] = useState<string>('tug');
  const part = TUGRA_PARTS.find((p) => p.key === k) ?? TUGRA_PARTS[0];

  return (
    <WidgetFrame
      kicker="TUĞRA · PADİŞAHIN İMZASI"
      title="Bir imzanın anatomisi"
      hint="Parçaya dokun, tuğrada nereye denk geldiğini gör."
      footnote="Yandaki çizim şematiktir: tuğranın parçalarını göstermek için çizilmiştir, belirli bir tuğranın kopyası değildir."
    >
      <div className="grid items-center gap-4 sm:grid-cols-[1fr_1.1fr]">
        <div className="grid place-items-center rounded-xl border border-white/10 bg-black/25 p-3">
          <TugraMark size={230} color={GOLD} highlight={k} />
        </div>
        <div className="grid gap-2">
          {TUGRA_PARTS.map((p) => {
            const on = p.key === k;
            return (
              <button
                key={p.key}
                onClick={() => setK(p.key)}
                className="rounded-lg border p-3 text-left transition hover:brightness-110"
                style={on
                  ? { borderColor: `color-mix(in srgb, ${GOLD} 45%, transparent)`, background: `color-mix(in srgb, ${GOLD} 9%, transparent)` }
                  : { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="text-sm font-bold" style={{ color: on ? GOLD : '#fff' }}>{p.label}</div>
                {on && <div className="mt-0.5 text-xs leading-relaxed text-slate-300">{part.text}</div>}
              </button>
            );
          })}
        </div>
      </div>
    </WidgetFrame>
  );
}

/* ══════════════════ 8 · FİNAL TUZAĞI: tuğrayı bas (Perde 8) ══════════════════ */

export function TugrayiBas() {
  const [stamped, setStamped] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => { refreshScroll(); }, [stamped]);

  async function share() {
    const url = 'https://basementonfire.com/articles/kanuni';
    try {
      if (typeof navigator !== 'undefined' && navigator.share) await navigator.share({ title: 'Kanuni · Basementonfire', text: FINALE.shareText, url });
      else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${FINALE.shareText}\n${url}`);
        setShared(true); setTimeout(() => setShared(false), 2200);
      }
    } catch { /* iptal */ }
  }

  return (
    <WidgetFrame hero kicker={FINALE.kicker} title={FINALE.title}>
      <p className="text-sm leading-relaxed text-slate-300">{FINALE.body}</p>

      <div className="mt-4 grid place-items-center rounded-xl border p-5" style={{ borderColor: `color-mix(in srgb, ${GOLD} 28%, transparent)`, background: 'rgba(0,0,0,0.3)' }}>
        {stamped ? (
          <div style={{ animation: 'kanuni-stamp 0.35s cubic-bezier(.2,1.4,.4,1)' }}>
            <TugraMark size={220} color={GOLD} />
          </div>
        ) : (
          <div className="grid h-[125px] w-[220px] place-items-center rounded-lg border border-dashed border-white/20 text-[0.62rem] tracking-[0.2em] text-slate-600">
            MÜHÜR YERİ
          </div>
        )}
      </div>

      {!stamped ? (
        <button
          onClick={() => { setStamped(true); refreshScroll(); }}
          className="mt-4 w-full rounded-xl px-4 py-4 text-base font-black transition hover:brightness-110"
          style={{ background: GOLD, color: BG }}
        >
          🖋 {FINALE.button}
        </button>
      ) : (
        <div className="mt-4" style={{ animation: 'kanuni-fade 0.5s ease' }}>
          <div className="rounded-xl border p-4 text-center" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 35%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 7%, transparent)` }}>
            <div className="text-lg font-black text-white">{FINALE.result}</div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">{FINALE.reveal}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{FINALE.today}</p>
          <button onClick={share} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition hover:brightness-110" style={{ background: ACCENT, color: BG }}>
            {shared ? '✓ Kopyalandı' : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>
                Kırk iki günü paylaş
              </>
            )}
          </button>
        </div>
      )}
    </WidgetFrame>
  );
}

/* ═══════════════════════ Ortak: oy dağılımı çubukları ═══════════════════════ */

function PollBars({ poll, choices, mine, color = ACCENT, emptyNote, proof }: {
  poll: PollData | null; choices: { key: string; label: string }[]; mine: string; color?: string; emptyNote?: string;
  proof?: (a: { label: string; key: string; pct: number; total: number }) => ProofSpec;
}) {
  if (!poll || !poll.available || !poll.counts || !poll.total) {
    return emptyNote ? <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center text-xs text-slate-500">{emptyNote}</div> : null;
  }
  const total = poll.total;
  const mineChoice = choices.find((c) => c.key === mine) ?? null;
  const minePct = mineChoice ? Math.round(((poll.counts[mineChoice.key] ?? 0) / total) * 100) : 0;
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
      {proof && mineChoice && (
        <ProofShare label="Kararını paylaş" spec={proof({ label: mineChoice.label, key: mineChoice.key, pct: minePct, total })} />
      )}
    </div>
  );
}
