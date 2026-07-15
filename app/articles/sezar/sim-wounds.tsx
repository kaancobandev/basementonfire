'use client';

// PERDE 6 — 23 yara (~%85). Yazının tezini okur kendi parmağıyla keşfeder:
// işaretlerin çoğunda "Caesar onu affetmiş ya da terfi ettirmişti" çıkar.
// Ben söylemiyorum — o buluyor. Bu, ikna edilmekten çok daha kalıcı.
//
// DÜRÜSTLÜK KURALI: hangi bıçağın kimden geldiği BİLİNMİYOR (yalnızca ilk
// vuruş, Casca, kaynakla sabit). İşaretlerin konumu temsilîdir. Diyagram
// yaraları değil, MASADAKİ ADAMLARI ve Caesar'a borçlarını sayar.

import { useMemo, useState } from 'react';
import { ACCENT, GOLD, MARBLE, BG, refreshScroll } from './ui';
import { Silhouette } from './posters';
import { MARKS, DEBT_META, WOUNDS_DISCLAIMER, WOUNDS_PAYOFF, IDES, type Debt, type Mark } from './data';

export default function WoundsDiagram() {
  const [sel, setSel] = useState<number | null>(1);
  const active = MARKS.find((m) => m.id === sel) ?? null;

  const open = (id: number) => { setSel(id); refreshScroll(); };

  // Adı bilinen komplocular arasında borç dağılımı — tezin kanıtı.
  const tally = useMemo(() => {
    const named = MARKS.filter((m) => m.kind === 'komplocu' && m.debt);
    const owed = named.filter((m) => m.debt === 'affedildi' || m.debt === 'odullendirildi' || m.debt === 'ikisi-de').length;
    return { total: named.length, owed };
  }, []);

  return (
    <figure className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/[0.04] p-4 pb-7 shadow-[0_0_60px_-15px_rgba(225,29,72,0.4)] backdrop-blur sm:p-5">
      <figcaption className="mb-4">
        <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: ACCENT }}>MÖ 44 · 15 MART · İNTERAKTİF</div>
        <h3 className="text-base font-bold leading-snug text-white sm:text-lg">23 bıçak. Yalnızca biri öldürücü. Peki bıçakları kim tutuyordu?</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">Her işarete dokun. Kim vurdu — ve Caesar onu affetmiş, hatta terfi ettirmiş miydi?</p>
      </figcaption>

      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        {/* Silüet + işaretler */}
        <div className="mx-auto w-full max-w-[200px]">
          <svg viewBox="0 0 200 440" className="w-full touch-manipulation" role="img" aria-label="Caesar'ın silüeti üzerinde 23 işaret; dokunulabilir">
            <Silhouette />
            {MARKS.map((m) => {
              const isSel = m.id === sel;
              const fill = markFill(m);
              return (
                <g key={m.id} onClick={() => open(m.id)} style={{ cursor: 'pointer' }}>
                  {/* Görünmez, büyük dokunma hedefi */}
                  <circle cx={m.x} cy={m.y} r={14} fill="transparent" />
                  {isSel && <circle cx={m.x} cy={m.y} r={9} fill="none" stroke={fill} strokeWidth="1.5" opacity="0.6" />}
                  <circle cx={m.x} cy={m.y} r={m.kind === 'olumcul' ? 5.5 : isSel ? 5 : 3.6} fill={fill} stroke={m.kind === 'olumcul' ? '#fff' : isSel ? '#fff' : 'none'} strokeWidth={m.kind === 'olumcul' || isSel ? 1 : 0} style={{ transition: 'r 0.15s ease' }} />
                </g>
              );
            })}
          </svg>
          {/* Erişilebilir metin karşılığı */}
          <p className="sr-only" aria-live="polite">
            {active ? (active.name ? `${active.name}: ${DEBT_META[active.debt as Debt]?.label ?? ''}` : active.detail) : ''}
          </p>
        </div>

        {/* Seçilen işaretin kartı */}
        <div className="min-h-[220px]">
          {active && <MarkCard mark={active} />}
        </div>
      </div>

      {/* Numaralı hızlı erişim (dokunması zor SVG noktaları için) */}
      <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Yaraları numarayla seç">
        {MARKS.map((m) => (
          <button
            key={m.id}
            onClick={() => open(m.id)}
            aria-pressed={m.id === sel}
            aria-label={`${m.id}. işaret`}
            className="grid h-7 w-7 place-items-center rounded-md border text-[0.7rem] font-bold transition"
            style={
              m.id === sel
                ? { background: markFill(m), color: BG, borderColor: markFill(m) }
                : { borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.03)' }
            }
          >
            {m.id}
          </button>
        ))}
      </div>

      {/* Tezin kanıtı: borç dağılımı */}
      <div className="mt-5 rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 25%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 6%, transparent)` }}>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm font-bold text-white">Geçmişi bilinen {tally.total} komplocudan {tally.owed}’i</span>
          <span className="font-mono text-2xl font-black" style={{ color: ACCENT }}>{tally.owed}/{tally.total}</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">{WOUNDS_PAYOFF}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {(Object.entries(DEBT_META) as [Debt, typeof DEBT_META[Debt]][]).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5 text-[0.7rem] text-slate-400">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: v.color }} />
              {v.short}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-relaxed text-slate-500">{WOUNDS_DISCLAIMER}</p>
      <p className="mt-3 text-sm italic leading-relaxed text-slate-400">{IDES.lastWords}</p>

      <span aria-hidden className="pointer-events-none absolute bottom-2 right-3 select-none font-mono text-[0.55rem] tracking-wider text-white/25">basementonfire.com</span>
    </figure>
  );
}

function markFill(m: Mark): string {
  if (m.kind === 'olumcul') return ACCENT;
  if (m.kind === 'isimsiz') return 'rgba(148,163,184,0.5)';
  return m.debt ? DEBT_META[m.debt].color : MARBLE;
}

function MarkCard({ mark }: { mark: Mark }) {
  if (mark.kind === 'olumcul') {
    return (
      <div className="rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 40%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 10%, transparent)` }}>
        <div className="mb-1 flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full text-xs font-black" style={{ background: ACCENT, color: BG }}>2</span>
          <span className="text-sm font-bold text-white">Ölümcül yara</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">{mark.sourced}</p>
      </div>
    );
  }
  if (mark.kind === 'isimsiz') {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-1 text-sm font-bold text-slate-300">Adı yazılmamış bir komplocu</div>
        <p className="text-sm leading-relaxed text-slate-400">{mark.detail}</p>
      </div>
    );
  }
  // komplocu
  const meta = mark.debt ? DEBT_META[mark.debt] : null;
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: meta ? `color-mix(in srgb, ${meta.color} 32%, transparent)` : 'rgba(255,255,255,0.1)', background: meta ? `color-mix(in srgb, ${meta.color} 8%, transparent)` : 'rgba(255,255,255,0.03)' }}>
      <div className="mb-0.5 text-sm font-bold text-white">{mark.name}</div>
      <div className="mb-2 text-xs text-slate-400">{mark.who}</div>
      {meta && (
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-bold" style={{ background: `color-mix(in srgb, ${meta.color} 18%, transparent)`, color: meta.color }}>
          {meta.label}
        </div>
      )}
      <p className="text-sm leading-relaxed text-slate-300">{mark.detail}</p>
      {mark.sourced && <p className="mt-2 border-l-2 pl-2.5 text-xs leading-relaxed text-slate-500" style={{ borderColor: `color-mix(in srgb, ${GOLD} 40%, transparent)` }}>{mark.sourced}</p>}
      {mark.fate && <p className="mt-2 text-xs text-slate-500">⚰ {mark.fate}</p>}
    </div>
  );
}
