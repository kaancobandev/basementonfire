'use client';

// AĞIR MODÜL — dynamic(ssr:false) ile yüklenir, InView + TabloPoster arkasında.
// 118 hücre + dört renklendirme modu + arama + detay kartı.
//
// rAF YOK, canvas YOK: hareketin tamamı CSS transition. Atilla'nın dersi —
// önizlemede/arka plan sekmesinde rAF kısılıyor, CSS transition kısılmıyor.

import { useMemo, useState } from 'react';
import { ACCENT, BLOK, Chip, WidgetFrame, dizilim, tr, type BlokKey } from './ui';
import { ELEMENTLER, type Element } from './elements';

type Mod = 'blok' | 'kategori' | 'hal' | 'kesif';

const MODLAR: { key: Mod; label: string }[] = [
  { key: 'blok', label: 'Blok' },
  { key: 'kategori', label: 'Kategori' },
  { key: 'hal', label: 'Hâl (25 °C)' },
  { key: 'kesif', label: 'Keşif yılı' },
];

const KATEGORI_RENK: Record<string, string> = {
  'Nonmetal': '#4ade80', 'Noble gas': '#a78bfa', 'Alkali metal': '#fb7185',
  'Alkaline earth metal': '#fbbf24', 'Metalloid': '#2dd4bf', 'Halogen': '#38bdf8',
  'Transition metal': '#f472b6', 'Post-transition metal': '#94a3b8',
  'Lanthanide': '#e879f9', 'Actinide': '#c084fc',
};
const HAL_RENK: Record<string, string> = { Solid: '#94a3b8', Liquid: '#38bdf8', Gas: '#4ade80', Expected: '#52525b' };
const HAL_TR: Record<string, string> = { Solid: 'Katı', Liquid: 'Sıvı', Gas: 'Gaz', Expected: 'Öngörülen' };

/** Keşif yılı → renk. "Ancient" ve boşlar en koyu. */
function kesifRenk(k: string): string {
  const y = parseInt(k, 10);
  if (!Number.isFinite(y)) return '#3f3f46';           // Ancient / bilinmiyor
  const f = Math.min(1, Math.max(0, (y - 1750) / 270)); // 1750 → 2020
  return `color-mix(in srgb, ${ACCENT} ${Math.round(18 + f * 72)}%, #1e1b2e)`;
}

function renkAl(e: Element, mod: Mod): string {
  if (mod === 'blok') return BLOK[e.blok as BlokKey].color;
  if (mod === 'kategori') return KATEGORI_RENK[e.kategori] ?? '#64748b';
  if (mod === 'hal') return HAL_RENK[e.hal] ?? '#52525b';
  return kesifRenk(e.kesif);
}

/** Izgara konumu: ana gövde 18 sütun x 7 satır, f-blok iki ayrı satır. */
function konum(e: Element): { c: number; r: number } {
  if (e.blok === 'f') {
    const bas = e.z <= 71 ? 58 : 90;      // Ce / Th
    return { c: 3 + (e.z - bas), r: e.z <= 71 ? 9 : 10 };
  }
  return { c: e.grup, r: e.periyot };
}

export default function SimTablo() {
  const [mod, setMod] = useState<Mod>('blok');
  const [sec, setSec] = useState<Element | null>(null);
  const [ara, setAra] = useState('');

  const q = ara.trim().toLocaleLowerCase('tr');
  const eslesen = useMemo(() => {
    if (!q) return null;
    return new Set(
      ELEMENTLER.filter((e) =>
        e.ad.toLocaleLowerCase('tr').includes(q) ||
        e.s.toLocaleLowerCase('tr').includes(q) ||
        e.en.toLowerCase().includes(q) ||
        String(e.z) === q,
      ).map((e) => e.z),
    );
  }, [q]);

  const W = 13, H = 14, G = 1.6;
  const gx = (c: number) => (c - 1) * (W + G);
  const gy = (r: number) => (r - 1) * (H + G) + (r >= 9 ? 6 : 0);

  return (
    <WidgetFrame
      hero
      kicker="İNTERAKTİF TABLO"
      title="118 element"
      hint="Bir hücreye dokun. Renklendirmeyi değiştirip aynı tabloyu farklı sorularla oku."
      footnote="Veri: PubChem (NCBI / U.S. National Library of Medicine) — kamu malı. Türkçe adlar: Wikidata (CC0). 3. grupta lantan ve aktinyum duruyor (TKD biçimi)."
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {MODLAR.map((m) => (
          <Chip key={m.key} active={mod === m.key} onClick={() => setMod(m.key)}>{m.label}</Chip>
        ))}
        <input
          value={ara}
          onChange={(e) => setAra(e.target.value)}
          placeholder="Ara: altın, Fe, 26…"
          aria-label="Element ara"
          className="ml-auto min-w-[130px] flex-1 rounded-full border border-white/10 bg-black/30 px-3.5 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-white/25 sm:max-w-[200px] sm:flex-none"
        />
      </div>

      <div className="overflow-x-auto pb-1">
        <svg
          viewBox={`-1 -1 ${18 * (W + G) + 2} ${10 * (H + G) + 10}`}
          className="w-full min-w-[560px]"
          role="img"
          aria-label="Periyodik tablo, 118 element"
        >
          {ELEMENTLER.map((e) => {
            const { c, r } = konum(e);
            const renk = renkAl(e, mod);
            const sonuk = eslesen ? !eslesen.has(e.z) : false;
            const secili = sec?.z === e.z;
            return (
              <g
                key={e.z}
                transform={`translate(${gx(c)},${gy(r)})`}
                onClick={() => setSec(secili ? null : e)}
                style={{ cursor: 'pointer', opacity: sonuk ? 0.16 : 1, transition: 'opacity .25s' }}
                role="button"
                tabIndex={-1}
                aria-label={`${e.ad}, ${e.s}, atom numarası ${e.z}`}
              >
                <rect
                  width={W} height={H} rx={1.8}
                  fill={renk} fillOpacity={secili ? 0.95 : 0.32}
                  stroke={secili ? '#fff' : renk} strokeWidth={secili ? 1.1 : 0.5}
                  style={{ transition: 'fill-opacity .2s' }}
                />
                <text x={1.4} y={4.4} fontSize={3} fill="rgba(255,255,255,0.65)">{e.z}</text>
                <text
                  x={W / 2} y={9.6} textAnchor="middle" fontSize={5.4} fontWeight={700}
                  fill={secili ? '#0a0716' : '#fff'}
                >
                  {e.s}
                </text>
                <text x={W / 2} y={12.7} textAnchor="middle" fontSize={2.5} fill={secili ? 'rgba(10,7,22,0.75)' : 'rgba(255,255,255,0.5)'}>
                  {e.ad.length > 9 ? e.ad.slice(0, 8) + '…' : e.ad}
                </text>
              </g>
            );
          })}
          {/* f-blok satırlarının başındaki işaretler */}
          <text x={gx(3) - 3} y={gy(9) + 9} textAnchor="end" fontSize={3.4} fill="#7d8590">57–71</text>
          <text x={gx(3) - 3} y={gy(10) + 9} textAnchor="end" fontSize={3.4} fill="#7d8590">89–103</text>
        </svg>
      </div>

      {/* Detay kartı */}
      <div className="mt-3 min-h-[132px]">
        {sec ? (
          <div className="rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${renkAl(sec, mod)} 40%, transparent)`, background: `color-mix(in srgb, ${renkAl(sec, mod)} 9%, transparent)` }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-3xl font-bold" style={{ color: renkAl(sec, mod) }}>{sec.s}</span>
                  <span className="text-lg font-bold text-white">{sec.ad}</span>
                  <span className="text-xs text-slate-500">{sec.en}</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {sec.z} · {sec.periyot}. periyot{sec.grup ? ` · ${sec.grup}. grup` : ' · f bloğu'} · {BLOK[sec.blok as BlokKey].label}
                </div>
              </div>
              <button onClick={() => setSec(null)} aria-label="Kapat" className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-400 hover:bg-white/5">✕</button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
              {sec.kutle != null && <Alan k="Atom kütlesi" v={tr(sec.kutle, 3)} />}
              <Alan k="Hâl (25 °C)" v={HAL_TR[sec.hal] ?? sec.hal} />
              {sec.enegatiflik != null && <Alan k="Elektronegatiflik" v={tr(sec.enegatiflik, 2)} />}
              {sec.yogunluk != null && <Alan k="Yoğunluk" v={`${tr(sec.yogunluk, 2)} g/cm³`} />}
              {sec.erime != null && <Alan k="Erime" v={`${tr(sec.erime, 1)} °C`} />}
              <Alan k="Keşif" v={sec.kesif === 'Ancient' ? 'Antik çağ' : sec.kesif || '—'} />
            </div>

            <div className="mt-2.5 border-t border-white/10 pt-2.5 font-mono text-xs text-slate-400">
              {dizilim(sec.dizilim)}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5 rounded-xl border border-white/10 bg-black/20 p-4">
            {mod === 'blok' && (Object.keys(BLOK) as BlokKey[]).map((b) => (
              <Efsane key={b} renk={BLOK[b].color} label={`${BLOK[b].label} · ${BLOK[b].kapasite} sütun`} />
            ))}
            {mod === 'kategori' && Object.entries(KATEGORI_RENK).map(([k, c]) => <Efsane key={k} renk={c} label={k} />)}
            {mod === 'hal' && Object.entries(HAL_RENK).map(([k, c]) => <Efsane key={k} renk={c} label={HAL_TR[k] ?? k} />)}
            {mod === 'kesif' && (
              <div className="w-full">
                <div className="mb-1.5 text-xs text-slate-400">Koyudan açığa: antik çağdan 2010’lara</div>
                <div className="h-2.5 rounded-full" style={{ background: `linear-gradient(90deg, #3f3f46, ${kesifRenk('1800')}, ${kesifRenk('1900')}, ${kesifRenk('2010')})` }} />
              </div>
            )}
          </div>
        )}
      </div>
    </WidgetFrame>
  );
}

function Alan({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[0.66rem] text-slate-500">{k}</div>
      <div className="font-mono text-slate-200">{v}</div>
    </div>
  );
}

function Efsane({ renk, label }: { renk: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[0.7rem] text-slate-400">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: renk }} />
      {label}
    </span>
  );
}
