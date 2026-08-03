'use client';

// Hafif interaktif modüller: saf SVG + useState. rAF yok, canvas yok.
// Client'a STATİK import ediliyorlar → SSR'a girerler, HTML'de vardırlar, taranırlar.
// Ağır olan tek modül sim-tablo.tsx (118 hücre + arama + renklendirme modları).
//
// SSR KURALI: Math.random ve Date.now render'a GİRMEZ (hidrasyon).

import { useState } from 'react';
import { ACCENT, BLOK, Chip, Stat, WidgetFrame, tr, type BlokKey } from './ui';
import { EKA_SILISYUM, HAYALETLER, FATURA, YONTEM } from './data';
import { ELEMENTLER } from './elements';

/* ══════════ 1 · Tahmin masası — makalenin imza anı ══════════ */

export function TahminMasasi() {
  const [acik, setAcik] = useState(false);
  const satirlar = acik ? EKA_SILISYUM.satirlar : EKA_SILISYUM.satirlar.slice(0, 6);

  return (
    <WidgetFrame
      hero
      kicker={`TAHMİN ${EKA_SILISYUM.tahminYil} · ÖLÇÜM ${EKA_SILISYUM.olcumYil}`}
      title="eka-silisyum ile germanyum yan yana"
      hint="Solda Mendeleyev’in henüz bulunmamış bir element için yazdıkları. Sağda on beş yıl sonra ölçülenler."
      footnote={EKA_SILISYUM.kapanis}
    >
      <div className="overflow-hidden rounded-xl border border-white/10">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-2 text-[0.62rem] font-bold tracking-wider">
          <span className="text-slate-400">ÖZELLİK · TAHMİN</span>
          <span aria-hidden />
          <span className="text-right" style={{ color: BLOK.p.color }}>ÖLÇÜM</span>
        </div>
        {satirlar.map((s) => (
          <div key={s.ozellik} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-white/5 px-3 py-2.5 last:border-0">
            <div className="min-w-0">
              <div className="truncate text-[0.68rem] text-slate-500">{s.ozellik}</div>
              <div className="font-mono text-sm text-slate-300">{s.tahmin}</div>
            </div>
            <span className="font-mono text-xs" style={{ color: BLOK.p.color }} aria-label="eşleşiyor">→</span>
            <div className="min-w-0 text-right">
              <div className="text-[0.68rem] text-slate-500">germanyum</div>
              <div className="font-mono text-sm font-bold text-white">{s.gercek}</div>
            </div>
          </div>
        ))}
      </div>
      {!acik && (
        <button
          onClick={() => setAcik(true)}
          className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/10"
        >
          Kalan {EKA_SILISYUM.satirlar.length - 6} satırı göster
        </button>
      )}
    </WidgetFrame>
  );
}

/* ══════════ 2 · Yöntem: sihir değil, ortalama ══════════ */

export function YontemKutusu() {
  return (
    <WidgetFrame kicker="YÖNTEM" title={YONTEM.baslik} hint={YONTEM.not}>
      <div className="space-y-2.5">
        {YONTEM.ornekler.map((o) => (
          <div key={o.ad} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="mb-1 font-mono text-sm font-bold" style={{ color: ACCENT }}>{o.ad}</div>
            <div className="font-mono text-xs leading-relaxed text-slate-400">{o.hesap}</div>
            <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
              <span className="font-mono font-bold text-white">{o.sonuc}</span>
              <span className="text-slate-500">→</span>
              <span className="text-slate-300">{o.gercek}</span>
            </div>
          </div>
        ))}
      </div>
    </WidgetFrame>
  );
}

/* ══════════ 3 · Fatura: hiç bulunamayanlar ══════════ */

export function HayaletListesi() {
  return (
    <WidgetFrame
      kicker="FATURA"
      title="Hiç bulunamayan tahminler"
      hint="Aynı yöntem, aynı tablo. Bu on dört element için yazdıkları hiçbir zaman karşılığını bulmadı."
      footnote={<><strong className="text-slate-300">{FATURA.kaynak}:</strong> “{FATURA.hukum}”</>}
    >
      <div className="mb-4 grid grid-cols-2 gap-2.5">
        <Stat value={FATURA.bulunan} label="karşılığı bulunan tahmin" color={BLOK.p.color} />
        <Stat value={FATURA.bulunamayan} label="hiç bulunamayan" color="#fb7185" />
      </div>
      <div className="space-y-1.5">
        {HAYALETLER.map((h) => (
          <div key={h.ad} className="flex items-baseline justify-between gap-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2">
            <span className="text-sm text-slate-300">{h.ad}</span>
            <span className="shrink-0 text-right">
              <span className="font-mono text-sm text-slate-500">{h.agirlik}</span>
              <span className="ml-2 hidden text-[0.66rem] text-slate-600 sm:inline">{h.neden}</span>
            </span>
          </div>
        ))}
        <div className="px-3 pt-1 text-xs text-slate-500">…ve altı tanesi daha, hiçbiri adlandırılmadı.</div>
      </div>
      <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-relaxed text-slate-300">
        {FATURA.kokNeden}
      </p>
    </WidgetFrame>
  );
}

/* ══════════ 4 · Orbital anatomisi: tablo neden BU şekilde ══════════ */

const LOB: Record<BlokKey, string> = {
  // Kaba orbital silüetleri (ölçekli değil, kimlik taşır).
  s: 'M0,0 m-26,0 a26,26 0 1,0 52,0 a26,26 0 1,0 -52,0',
  p: 'M0,0 C14,-6 22,-22 0,-40 C-22,-22 -14,-6 0,0 C14,6 22,22 0,40 C-22,22 -14,6 0,0',
  d: 'M0,0 C12,-10 30,-14 34,-34 C14,-30 10,-12 0,0 C-12,-10 -30,-14 -34,-34 C-14,-30 -10,-12 0,0 C12,10 30,14 34,34 C14,30 10,12 0,0 C-12,10 -30,14 -34,34 C-14,30 -10,12 0,0',
  f: 'M0,0 C10,-12 26,-16 30,-36 C12,-28 8,-10 0,0 C-10,-12 -26,-16 -30,-36 C-12,-28 -8,-10 0,0 C10,12 26,16 30,36 C12,28 8,10 0,0 C-10,12 -26,16 -30,36 C-12,28 -8,10 0,0 M-38,0 L38,0',
};

export function OrbitalAnatomisi() {
  const [sec, setSec] = useState<BlokKey>('s');
  const b = BLOK[sec];

  return (
    <WidgetFrame
      kicker="ŞEKLİN SEBEBİ"
      title="Blok genişliği = orbital kapasitesi"
      hint="Tablodaki sütun sayıları keyfî değil: her blok, o orbitalin alabildiği elektron sayısı kadar geniş."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(BLOK) as BlokKey[]).map((k) => (
          <Chip key={k} active={sec === k} color={BLOK[k].color} onClick={() => setSec(k)}>
            {BLOK[k].label}
          </Chip>
        ))}
      </div>

      <div className="grid items-center gap-4 sm:grid-cols-[150px_1fr]">
        <svg viewBox="-50 -50 100 100" className="mx-auto w-[130px]" role="img" aria-label={`${b.label} orbitalinin kaba biçimi`}>
          <path d={LOB[sec]} fill={b.color} fillOpacity={0.22} stroke={b.color} strokeWidth={1.6} />
          {sec === 'd' && <path d={LOB.d} fill={b.color} fillOpacity={0.12} stroke={b.color} strokeWidth={1} transform="rotate(45)" />}
          <circle r={3} fill="#fff" />
        </svg>

        <div>
          <div className="mb-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold" style={{ color: b.color }}>{b.kapasite}</span>
            <span className="text-sm text-slate-400">elektron · {b.kapasite} sütun</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">{b.aciklama}</p>
          <div className="mt-3 flex gap-1" aria-hidden>
            {Array.from({ length: b.kapasite }, (_, i) => (
              <span key={i} className="h-6 flex-1 rounded-sm" style={{ background: b.color, opacity: 0.25 + (i / b.kapasite) * 0.5 }} />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-sm leading-relaxed text-slate-300">
        Ve ilk satırın neden kısa olduğu buradan çıkıyor: bir elektronun açısal momentum
        sayısı <span className="font-mono" style={{ color: ACCENT }}>ℓ ≤ n−1</span> olmak zorunda.
        n = 1 için yalnız ℓ = 0 var — yani <strong className="text-white">1p orbitali yoktur</strong>.
        Hidrojen ve helyum, o satıra sığabilen her şey.
      </p>
    </WidgetFrame>
  );
}

/* ══════════ 5 · Periyodiklik: testere dişi ══════════ */

type Trend = { key: 'enegatiflik' | 'iyonlasma' | 'yaricap'; label: string; birim: string };
const TRENDLER: Trend[] = [
  { key: 'iyonlasma', label: 'İyonlaşma enerjisi', birim: 'eV' },
  { key: 'enegatiflik', label: 'Elektronegatiflik', birim: '' },
  { key: 'yaricap', label: 'Atom yarıçapı', birim: 'pm' },
];

export function TrendGrafigi() {
  const [t, setT] = useState<Trend>(TRENDLER[0]);

  const veri = ELEMENTLER.filter((e) => e.z <= 86 && e[t.key] != null)
    .map((e) => ({ z: e.z, v: e[t.key] as number, blok: e.blok, s: e.s, ad: e.ad }));
  const enB = Math.max(...veri.map((d) => d.v));
  const W = 620, H = 190, SOL = 34, SAG = 8, UST = 12, ALT = 26;
  const ix = (z: number) => SOL + ((z - 1) / 85) * (W - SOL - SAG);
  const iy = (v: number) => UST + (1 - v / enB) * (H - UST - ALT);
  const cizgi = veri.map((d, i) => `${i ? 'L' : 'M'}${ix(d.z).toFixed(1)},${iy(d.v).toFixed(1)}`).join('');

  // Soy gazlar (tepe) ve alkali metaller (dip) — periyodikliğin çapaları.
  const soy = veri.filter((d) => [2, 10, 18, 36, 54, 86].includes(d.z));
  const alkali = veri.filter((d) => [3, 11, 19, 37, 55].includes(d.z));

  return (
    <WidgetFrame
      kicker="PERİYODİKLİK"
      title="“Periyodik” kelimesi tam olarak neyi anlatıyor?"
      hint="Atom numarasına göre çiz: değer düzgün artmaz, tekrar tekrar aynı deseni yapar. Tablonun adı buradan geliyor."
      footnote="Veri: PubChem (NCBI) — kamu malı. İlk 86 element gösteriliyor; ötesinde ölçüm boşlukları var."
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {TRENDLER.map((x) => (
          <Chip key={x.key} active={t.key === x.key} onClick={() => setT(x)}>{x.label}</Chip>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
        aria-label={`${t.label} değerinin atom numarasına göre değişimi: her periyotta tekrarlayan testere dişi desen`}>
        {[0, 0.5, 1].map((f) => (
          <line key={f} x1={SOL} y1={iy(enB * f)} x2={W - SAG} y2={iy(enB * f)} stroke="rgba(255,255,255,0.08)" />
        ))}
        <text x={SOL - 5} y={iy(enB) + 3} textAnchor="end" fontSize="8" fill="#7d8590">{tr(enB, 1)}</text>
        <text x={SOL - 5} y={iy(0) + 3} textAnchor="end" fontSize="8" fill="#7d8590">0</text>
        <path d={cizgi} fill="none" stroke={ACCENT} strokeWidth={1.6} strokeLinejoin="round" />
        {veri.map((d) => (
          <circle key={d.z} cx={ix(d.z)} cy={iy(d.v)} r={1.7} fill={BLOK[d.blok].color} />
        ))}
        {soy.map((d) => (
          <g key={d.z}>
            <circle cx={ix(d.z)} cy={iy(d.v)} r={3.4} fill="none" stroke="#fff" strokeWidth={1} opacity={0.7} />
            <text x={ix(d.z)} y={iy(d.v) - 7} textAnchor="middle" fontSize="8" fill="#e2e8f0">{d.s}</text>
          </g>
        ))}
        {alkali.map((d) => (
          <text key={d.z} x={ix(d.z)} y={iy(d.v) + 12} textAnchor="middle" fontSize="8" fill="#94a3b8">{d.s}</text>
        ))}
        <text x={SOL} y={H - 8} fontSize="8" fill="#7d8590">atom numarası →</text>
      </svg>

      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        {t.key === 'yaricap'
          ? 'Yarıçapta desen ters yönde: her periyodun başındaki alkali metal en şişkin, sonundaki soy gaz en küçüktür.'
          : 'Tepeler hep aynı sütunda: soy gazlar. Dipler de öyle: alkali metaller. Aynı sütun, aynı davranış — çünkü aynı dış kabuk.'}
      </p>
    </WidgetFrame>
  );
}
