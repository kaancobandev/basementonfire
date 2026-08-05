'use client';

// Atilla — Perde 0-4 interaktif modülleri.
// Hepsi HAFİF (SVG + state). Ağır olanlar (Catalaunum savaş animasyonu, otağ
// karar modülü) ayrı sim-* dosyalarında ve InView + dynamic(ssr:false) ile
// yükleniyor — bkz. [[article-interactive-heavy-pattern]].
//
// SSR KURALI: Math.random ve Date.now render'a GİRMEZ (hidrasyon). Zamana
// bağlı tek şey KavimlerGocu'nun oynatıcısı ve o da mount sonrası çalışıyor.

import { useEffect, useRef, useState } from 'react';
import { ACCENT, BONE, GARNET, GOLD, IRON, WidgetFrame, ActionButton, WordNote, buyuk, clamp, tr, useReducedMotion } from './ui';
import { ONCEKILER, GOC, KAGAN, BARBAR, ISIM, KILIC, HARAC, SURLAR, CATALAUNUM, DEFIN, EFSANE } from './data';

/* ══════════════ Perde 1 · Bozkır zaman şeridi ══════════════ */

export function BozkirSeridi() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <WidgetFrame
      kicker="PERDE 1 · ONDAN ÖNCEKİLER"
      title="Atilla 434’te boş bir sayfaya oturmadı"
      hint="Devraldığı şey bir ganimet yığını değil, en az altı yüzyıllık bir devlet geleneğiydi. Satırlara dokun."
    >
      <ol className="relative space-y-1">
        {/* dikey hat */}
        <span aria-hidden className="pointer-events-none absolute bottom-4 left-[4.6rem] top-4 w-px" style={{ background: `linear-gradient(to bottom, transparent, ${ACCENT}55, transparent)` }} />
        {ONCEKILER.map((o, i) => {
          const on = open === i;
          return (
            <li key={o.ad}>
              <button
                onClick={() => setOpen(on ? null : i)}
                aria-expanded={on}
                className="flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-white/5"
              >
                <span className="w-[3.9rem] shrink-0 pt-0.5 text-right font-mono text-[0.68rem] font-bold" style={{ color: ACCENT }}>
                  {o.yil}
                </span>
                <span
                  aria-hidden
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full ring-2 transition"
                  style={{ background: on ? ACCENT : 'transparent', borderColor: ACCENT, boxShadow: `0 0 0 1px ${ACCENT}`, ...(on ? {} : { background: '#0a0706' }) }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold" style={{ color: on ? BONE : '#d6d3d1' }}>{o.ad}</span>
                  <span className="mt-0.5 block text-[0.82rem] leading-relaxed text-slate-400">{o.ne}</span>
                  {on && o.not && (
                    <span className="mt-2 block border-l-2 pl-3 text-xs leading-relaxed text-slate-500" style={{ borderColor: `${ACCENT}66` }}>
                      {o.not}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </WidgetFrame>
  );
}

/* ══════════════ Perde 1 · Kavimler Göçü zinciri ══════════════ */

/**
 * NİYE HARİTA DEĞİL: gerçek bir göç haritası çizmek, elimizde olmayan bir
 * kesinlik iddia etmek olurdu (güzergâhlar tartışmalı). Bunun yerine
 * MEKANİZMA gösteriliyor: basınç zinciri. Dalga soldan sağa ilerliyor.
 */
export function KavimlerGocu() {
  const [step, setStep] = useState(0); // 0 = henüz başlamadı
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const N = GOC.zincir.length;

  useEffect(() => {
    if (!playing) return;
    if (step >= N) { setPlaying(false); return; }
    timer.current = setTimeout(() => setStep((s) => s + 1), 1150);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [playing, step, N]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const start = () => { setStep(0); setPlaying(true); };
  const showAll = () => { setPlaying(false); setStep(N); };

  return (
    <WidgetFrame
      kicker="PERDE 1 · BASINÇ ZİNCİRİ"
      title="Kavimler Göçü — ve Atilla’nın henüz doğmamış olması"
      hint="Bir halk yerinden olunca komşusunu iter, o da kendi komşusunu. Zincirin sonu Roma sınırı."
      footnote="Zincirin tarihleri Atilla’nın doğumundan (~406) ve kağan oluşundan (434) öncedir."
    >
      {/* ── BASINÇ ARTIK GÖRÜNÜYOR ──
          Eskiden modülün adında basınç vardı ama ekranda yalnız sırayla beliren
          beş kutu vardı: yön yok, itme yok, duvar yok. Şimdi doğudan batıya bir
          koridor var; her halk bir sonrakini İTİYOR ve zincirin sonunda Roma
          sınırı duruyor. Basınç sınıra ulaşınca duvarda çatlak beliriyor. */}
      <svg viewBox="0 0 360 150" className="mb-3 w-full rounded-xl border border-white/10 bg-black/25" role="img"
        aria-label="Doğudan batıya bir koridor: her halk bir sonrakini itiyor, zincirin sonunda Roma sınırı ve 378'de duvarda çatlak.">
        <text x="10" y="18" fontSize="7.5" fontWeight="800" letterSpacing="1" fill={IRON} fontFamily="system-ui, sans-serif">DOĞU · BOZKIR</text>
        <text x="350" y="18" fontSize="7.5" fontWeight="800" letterSpacing="1" fill={IRON} textAnchor="end" fontFamily="system-ui, sans-serif">ROMA SINIRI</text>
        <line x1="10" y1="26" x2="350" y2="26" stroke="rgba(255,255,255,0.08)" />

        {/* Roma sınırı — basınç arttıkça çatlıyor */}
        <rect x="318" y="38" width="12" height="76" rx="2"
          fill={`color-mix(in srgb, ${BONE} ${step >= 3 ? 10 : 18}%, transparent)`}
          stroke={step >= 3 ? GARNET : BONE} strokeWidth={step >= 3 ? 2 : 1.4}
          style={{ transition: 'stroke .5s ease, fill .5s ease' }} />
        <path d="M324 60 L318 72 L328 82 L320 96" fill="none" stroke={GARNET} strokeWidth="1.6"
          style={{ opacity: step >= 3 ? 1 : 0, transition: 'opacity .6s ease' }} />

        {GOC.zincir.map((z, i) => {
          const on = step > i;
          const x = 34 + i * 62;
          return (
            <g key={z.n} style={{ opacity: on ? 1 : 0.3, transition: 'opacity .5s ease' }}>
              {/* itme oku — bu halk bir sonrakini itiyor */}
              {i < GOC.zincir.length - 1 && (
                <g style={{ opacity: step > i + 1 ? 1 : 0, transition: 'opacity .5s ease' }}>
                  <line x1={x + 15} y1="76" x2={x + 50} y2="76" stroke={ACCENT} strokeWidth="1.6" />
                  <path d="M-5 -4 L2 0 L-5 4 Z" fill={ACCENT} transform={`translate(${x + 54},76)`} />
                </g>
              )}
              <rect x={x - 13} y="62" width="27" height="28" rx="5"
                fill={`color-mix(in srgb, ${ACCENT} ${on ? 22 : 6}%, transparent)`}
                stroke={on ? ACCENT : 'rgba(255,255,255,0.18)'} strokeWidth={on ? 1.8 : 1}
                style={{ transition: 'fill .5s ease, stroke .5s ease' }} />
              <text x={x} y="80" textAnchor="middle" fontSize="11" fontWeight="800"
                fill={on ? '#fff' : 'rgba(255,255,255,0.4)'} fontFamily="ui-monospace, monospace">{z.n}</text>
              <text x={x} y="106" textAnchor="middle" fontSize="7.5" fontWeight="700"
                fill={on ? ACCENT : IRON} fontFamily="ui-monospace, monospace"
                style={{ transition: 'fill .5s ease' }}>{z.yil}</text>
            </g>
          );
        })}

        {/* Zaman ekseni: zincirin tamamı Atilla sahneye çıkmadan bitiyor */}
        <line x1="24" y1="130" x2="336" y2="130" stroke="rgba(255,255,255,0.14)" />
        <text x="24" y="144" fontSize="7" fontWeight="700" fill={IRON} fontFamily="system-ui, sans-serif">~370</text>
        <text x="238" y="144" fontSize="7" fontWeight="700" fill={BONE} fontFamily="system-ui, sans-serif">~406 Atilla doğuyor</text>
        <circle cx="232" cy="130" r="3" fill={BONE} />
        <text x="336" y="144" fontSize="7" fontWeight="700" fill={IRON} textAnchor="end" fontFamily="system-ui, sans-serif">434 kağan</text>
        <circle cx="330" cy="130" r="3" fill={IRON} />
      </svg>

      {/* Modülün varlık sebebi olan cümle dipnottan ÇIKARILDI: zincirin tamamının
          Atilla doğmadan başladığı, bu widget'ın söylediği asıl şey. */}
      <p className="mb-3 rounded-xl border p-3 text-[0.86rem] font-semibold leading-relaxed"
        style={{ borderColor: `${BONE}44`, background: `color-mix(in srgb, ${BONE} 6%, transparent)`, color: BONE }}>
        {GOC.onemli}
      </p>

      <div className="space-y-2">
        {GOC.zincir.map((z, i) => {
          const on = step > i;
          const cur = step === i + 1 && playing;
          return (
            <div
              key={z.n}
              className="flex items-start gap-3 rounded-xl border p-3 transition-all duration-500"
              style={{
                borderColor: on ? `${ACCENT}55` : 'rgba(255,255,255,0.08)',
                background: on ? `color-mix(in srgb, ${ACCENT} ${cur ? 16 : 8}%, transparent)` : 'transparent',
                opacity: on ? 1 : 0.42,
                transform: reduced ? undefined : `translateX(${on ? 0 : -6}px)`,
              }}
            >
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-[0.7rem] font-bold transition"
                style={on ? { background: ACCENT, color: '#0a0706' } : { border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.45)' }}
              >
                {z.n}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[0.68rem] font-bold" style={{ color: on ? ACCENT : IRON }}>{z.yil}</div>
                <div className="mt-0.5 text-[0.86rem] leading-relaxed" style={{ color: on ? '#e7e5e4' : '#a8a29e' }}>{z.olay}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        <ActionButton onClick={start} full disabled={playing}>
          {playing ? 'zincir ilerliyor…' : step >= N ? '↺ Baştan oynat' : '▶ Zinciri oynat'}
        </ActionButton>
        {step < N && <ActionButton onClick={showAll} tone="ghost">Hepsini göster</ActionButton>}
      </div>

      {step >= N && (
        <p className="mt-4 text-sm font-semibold leading-relaxed" style={{ color: BONE }}>
          {GOC.punch}
        </p>
      )}
    </WidgetFrame>
  );
}

/* ══════════════ Perde 2 · Kağanlık şeması ══════════════ */

// SEMA sabiti kaldırıldı: eski beş-sekme düzeninin verisiydi, düğümler artık
// şemanın kendi içinde konumlarıyla birlikte tanımlı.

const ASAGI = 'M-4 -4 L0 3 L4 -4 Z';
const YUKARI = 'M-4 4 L0 -3 L4 4 Z';

/** Şema oku — ok başı elle çiziliyor (SurKesiti deseni), marker/defs gerekmiyor. */
function Ok({ d, renk, yon, kesik = false }: {
  d: string; renk: string; yon: [number, number, string]; kesik?: boolean;
}) {
  return (
    <g>
      <path d={d} fill="none" stroke={renk} strokeWidth="1.6" strokeDasharray={kesik ? '4 4' : undefined}
        style={{ transition: 'stroke .3s ease' }} />
      <path d={yon[2]} fill={renk} transform={`translate(${yon[0]},${yon[1]})`}
        style={{ transition: 'fill .3s ease' }} />
    </g>
  );
}

/** Tıklanabilir şema düğümü. ⚠ <g onClick> tek başına klavyeyle erişilemez —
 *  SurKesiti'nde bu eksik; burada tekrarlanmıyor (role+tabIndex+onKeyDown). */
function Dugum({ id, x, y, w, ust, ad, renk, sel, setSel, ariza }: {
  id: string; x: number; y: number; w: number; ust: string; ad: string; renk: string;
  sel: string; setSel: (s: string) => void; ariza: boolean;
}) {
  const on = sel === id;
  const c = ariza && id === 'kagan' ? IRON : renk;
  return (
    <g role="button" tabIndex={0} aria-pressed={on} aria-label={ad}
      onClick={() => setSel(id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(id); } }}
      style={{ cursor: 'pointer' }}>
      <rect x={x - w / 2} y={y - 17} width={w} height={34} rx={8}
        fill={`color-mix(in srgb, ${c} ${on ? 22 : 8}%, transparent)`}
        stroke={on ? c : `color-mix(in srgb, ${c} 40%, transparent)`}
        strokeWidth={on ? 2 : 1}
        style={{ transition: 'fill .3s ease, stroke .3s ease, stroke-width .3s ease' }} />
      <text x={x} y={y - 4} textAnchor="middle" fontSize="7" fontWeight="800" letterSpacing="1.2"
        fill={on ? c : 'rgba(255,255,255,0.45)'} fontFamily="system-ui, sans-serif"
        style={{ transition: 'fill .3s ease' }}>{ust}</text>
      <text x={x} y={y + 10} textAnchor="middle" fontSize="12" fontWeight="800"
        fill={on ? '#fff' : '#a8a29e'} fontFamily="system-ui, sans-serif"
        style={{ transition: 'fill .3s ease' }}>{ad}</text>
    </g>
  );
}

export function KaganlikSemasi() {
  const [sel, setSel] = useState<string>('kut');
  const [ariza, setAriza] = useState(false);          // "kut kalkarsa" senaryosu
  const kanatX = ariza ? 34 : 0;                       // arızada iki kanat AYRILIYOR

  const metin: Record<string, { ad: string; tanim: string; ek?: string }> = {
    kut: { ad: KAGAN.kut.ad, tanim: KAGAN.kut.tanim },
    kagan: { ad: 'Kağan', tanim: 'Kut’u taşıyan hükümdar. Yetkisi Gök’ten gelir ama boyların rızasına ve başarıya bağlıdır — mutlak değildir.' },
    ikili: { ad: KAGAN.ikili.ad, tanim: KAGAN.ikili.tanim, ek: KAGAN.ikili.sonuc },
    boy: { ad: KAGAN.federasyon.ad, tanim: KAGAN.federasyon.tanim, ek: KAGAN.federasyon.aDNA },
    kurultay: { ad: KAGAN.kurultay.ad, tanim: KAGAN.kurultay.tanim },
  };
  const m = metin[sel];

  return (
    <WidgetFrame
      kicker="PERDE 2 · DEVLET NASIL İŞLER"
      title="Bozkır devletinin şeması"
      hint="Yetki yukarıdan iner, rıza aşağıdan çıkar. Bir düğüme dokun — ya da kutu kaldırıp ne olduğunu gör."
    >
      {/* ── ŞEMA ARTIK GERÇEKTEN ŞEMA ──
          Eskiden yan yana beş sekme + aria-hidden 1px gradyan çizgi vardı; adı
          "şema" olan modülde parçalar arasındaki İLİŞKİ hiç çizilmiyordu.
          Asıl iddia iki okta: Gök'ten AŞAĞI inen yetki, kurultaydan YUKARI çıkan
          rıza. "Kağan mutlak değildir" cümlesi böylece çizimin kendisi oluyor.
          viewBox 360 birim (Catalaunum'un 800'ü değil) → SVG metni telefonda da
          ~10 px'e denk geliyor, ölçek burada lehimize çalışıyor. */}
      <svg viewBox="0 0 360 306" className="w-full rounded-xl border border-white/10 bg-black/25" role="img"
        aria-label="Bozkır devletinin şeması: Gök'ten kağana inen yetki, kurultaydan kağana çıkan rıza, iki kanat ve boylar.">
        <Ok d="M180 50 L180 84" renk={ariza ? IRON : GOLD} yon={[180, 86, ASAGI]} kesik={ariza} />
        <Ok d={`M168 122 L${118 - kanatX} 152`} renk={GARNET} yon={[116 - kanatX, 154, ASAGI]} />
        <Ok d={`M192 122 L${242 + kanatX} 152`} renk={GARNET} yon={[244 + kanatX, 154, ASAGI]} />
        <Ok d={`M${92 - kanatX} 190 L164 214`} renk={IRON} yon={[166, 216, ASAGI]} />
        <Ok d={`M${268 + kanatX} 190 L196 214`} renk={IRON} yon={[194, 216, ASAGI]} />
        <Ok d="M180 250 L180 262" renk={BONE} yon={[180, 264, ASAGI]} />
        {/* Şemanın asıl iddiası: rıza AŞAĞIDAN YUKARI çıkıyor. */}
        <Ok d="M148 282 C 26 272, 26 132, 150 108" renk={ariza ? GARNET : BONE} yon={[152, 107, YUKARI]} />

        <text x="30" y="196" fontSize="7.5" fontWeight="800" letterSpacing="1"
          fill={ariza ? GARNET : `color-mix(in srgb, ${BONE} 70%, transparent)`}
          fontFamily="system-ui, sans-serif" transform="rotate(-90 30 196)"
          style={{ transition: 'fill .3s ease' }}>RIZA</text>
        <text x="196" y="72" fontSize="7.5" fontWeight="800" letterSpacing="1"
          fill={ariza ? IRON : `color-mix(in srgb, ${GOLD} 75%, transparent)`}
          fontFamily="system-ui, sans-serif" style={{ transition: 'fill .3s ease' }}>YETKİ</text>

        <Dugum id="kut" x={180} y={32} w={132} ust="GÖK" ad="Kut" renk={GOLD} sel={sel} setSel={setSel} ariza={ariza} />
        <Dugum id="kagan" x={180} y={104} w={126} ust="YETKİ" ad="Kağan" renk={ACCENT} sel={sel} setSel={setSel} ariza={ariza} />
        <g transform={`translate(${-kanatX},0)`} style={{ transition: 'transform .45s ease' }}>
          <Dugum id="ikili" x={92} y={172} w={104} ust="SOL KANAT" ad="Yabgu" renk={GARNET} sel={sel} setSel={setSel} ariza={ariza} />
        </g>
        <g transform={`translate(${kanatX},0)`} style={{ transition: 'transform .45s ease' }}>
          <Dugum id="ikili" x={268} y={172} w={104} ust="SAĞ KANAT" ad="Yabgu" renk={GARNET} sel={sel} setSel={setSel} ariza={ariza} />
        </g>
        <Dugum id="boy" x={180} y={232} w={148} ust="TABAN" ad="Boylar" renk={IRON} sel={sel} setSel={setSel} ariza={ariza} />
        <Dugum id="kurultay" x={180} y={282} w={148} ust="MECLİS" ad="Kurultay" renk={BONE} sel={sel} setSel={setSel} ariza={ariza} />

        {/* Arıza modunda her kanadın üstünde AYRI taç: iki meşru veraset hattı. */}
        {ariza && [92 - kanatX, 268 + kanatX].map((cx) => (
          <g key={cx} transform={`translate(${cx},144)`}>
            <path d="M-9 4 L-9 -4 L-4 1 L0 -6 L4 1 L9 -4 L9 4 Z" fill={GARNET} />
          </g>
        ))}
      </svg>

      <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-4">
        <div className="text-sm font-bold" style={{ color: BONE }}>{m.ad}</div>
        <p className="mt-1.5 text-[0.86rem] leading-relaxed text-slate-300">{m.tanim}</p>
        {m.ek && (
          <p className="mt-3 border-l-2 pl-3 text-[0.82rem] leading-relaxed text-slate-400" style={{ borderColor: `${ACCENT}66` }}>
            {m.ek}
          </p>
        )}
      </div>

      {/* Tek düğme, üç paragraflık iddiayı çizime çeviriyor: kut kalkınca yetki
          oku kesiliyor, kağan soluyor ve iki kanat ayrılıyor — yani veraset
          krizinin NEDEN yapısal olduğu anlatılmıyor, gösteriliyor. */}
      <div className="mt-3">
        <ActionButton tone="ghost" full onClick={() => setAriza(!ariza)}>
          {ariza ? '↺ Kutu geri ver' : 'Peki kut kalkarsa ne olur?'}
        </ActionButton>
      </div>
      {ariza && (
        <p className="mt-3 rounded-xl border p-3 text-[0.84rem] leading-relaxed text-slate-300"
          style={{ borderColor: `${GARNET}55`, background: `color-mix(in srgb, ${GARNET} 7%, transparent)`, animation: 'atilla-fade 0.4s ease-out' }}>
          Yetki oku kesildi, kağan soldu — ve iki kanat birbirinden ayrıldı: her birinin
          başında artık ayrı bir meşru hat var. {KAGAN.ikili.sonuc}
        </p>
      )}
    </WidgetFrame>
  );
}

/* ══════════════ Perde 2 · "Barbar" kanıt panosu ══════════════ */

export function BarbarPanosu() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <WidgetFrame
      kicker="PERDE 2 · KANIT PANOSU"
      title="Roma’nın kendi kayıtlarından beş kanıt"
      hint="Aşağıdaki maddelerin hepsi Roma kaynaklıdır. Yani bu tabloyu çizen, o halkı “barbar” diye adlandıran tarafın kendi kalemidir."
      footnote={BARBAR.punch}
    >
      <div className="space-y-2">
        {BARBAR.kanitlar.map((k, i) => {
          const on = open === i;
          return (
            <div key={k.baslik} className="overflow-hidden rounded-xl border transition" style={{ borderColor: on ? `${ACCENT}55` : 'rgba(255,255,255,0.1)', background: on ? `color-mix(in srgb, ${ACCENT} 7%, transparent)` : 'transparent' }}>
              <button
                onClick={() => setOpen(on ? null : i)}
                aria-expanded={on}
                className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
              >
                <span className="font-mono text-[0.7rem] font-bold" style={{ color: ACCENT }}>{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 text-sm font-bold" style={{ color: on ? BONE : '#d6d3d1' }}>{k.baslik}</span>
                <span aria-hidden className="text-xs transition" style={{ color: IRON, transform: on ? 'rotate(90deg)' : 'none' }}>›</span>
              </button>
              {on && (
                <div className="px-3.5 pb-3.5">
                  <p className="text-[0.86rem] leading-relaxed text-slate-300">{k.metin}</p>
                  <p className="mt-2 font-mono text-[0.68rem]" style={{ color: IRON }}>Kaynak · {k.kaynak}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <WordNote word="βάρβαρος — barbaros">{BARBAR.kelime}</WordNote>
    </WidgetFrame>
  );
}

/* ══════════════ Perde 3 · İsim ağacı ══════════════ */

export function IsimAgaci() {
  const [sel, setSel] = useState(0);
  const o = ISIM.okumalar[sel];

  return (
    <WidgetFrame
      kicker="PERDE 3 · KELİMENİN KÖKÜ"
      title={ISIM.soru}
      hint="Üç okuma var: biri Germen, ikisi Türk. Hangisinin doğru olduğunu söylemiyoruz — üçünü de yan yana koyuyoruz."
    >
      <div className="flex gap-1.5">
        {ISIM.okumalar.map((r, i) => (
          <button
            key={r.hat}
            onClick={() => setSel(i)}
            aria-pressed={sel === i}
            className="min-h-[44px] flex-1 rounded-xl border px-2 text-[0.72rem] font-bold leading-tight transition sm:text-xs"
            style={{
              borderColor: sel === i ? ACCENT : 'rgba(255,255,255,0.12)',
              background: sel === i ? `color-mix(in srgb, ${ACCENT} 15%, transparent)` : 'rgba(255,255,255,0.02)',
              color: sel === i ? '#fff' : '#a8a29e',
            }}
          >
            {r.hat}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-4">
        <div className="font-mono text-sm font-bold" style={{ color: ACCENT }}>{o.koken}</div>
        <div className="mt-1 text-base font-bold" style={{ color: BONE }}>{o.anlam}</div>
        <p className="mt-2 text-[0.86rem] leading-relaxed text-slate-400">{o.not}</p>
      </div>

      {/* Adın yolculuğu — sezar'daki Caesar→Kaiser→Çar ağacının kardeşi */}
      <div className="mt-5">
        <div className="mb-2 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: IRON }}>ADIN YOLCULUĞU</div>
        <div className="space-y-1.5">
          {ISIM.agac.map((a) => (
            <div key={a.dil} className="flex items-baseline gap-3 rounded-lg px-2 py-1.5 hover:bg-white/5">
              <span className="w-[7.2rem] shrink-0 text-[0.68rem] font-semibold" style={{ color: IRON }}>{a.dil}</span>
              <span className="shrink-0 font-mono text-sm font-bold" style={{ color: GOLD }}>{a.ad}</span>
              <span className="min-w-0 flex-1 text-[0.78rem] leading-snug text-slate-500">{a.not}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-xl border p-4" style={{ borderColor: `${GARNET}44`, background: `color-mix(in srgb, ${GARNET} 8%, transparent)` }}>
        <div className="text-sm font-bold" style={{ color: GARNET }}>{ISIM.kirbac.baslik}</div>
        <p className="mt-1.5 text-[0.86rem] leading-relaxed text-slate-300">{ISIM.kirbac.metin}</p>
      </div>
    </WidgetFrame>
  );
}

/* ══════════════ Perde 4 · Mars’ın Kılıcı — hero ifşası ══════════════ */

/** Viyana sabresini tarihlendiren üç ölçüt. Sıra serbest; üçü de açılınca hüküm gelir. */
const ADIMLAR = [
  {
    ad: 'Ağız sayısı',
    bulgu: 'Tek ağızlı.',
    metin: '5. yüzyıl bozkır kılıcı çift ağızlıydı — iki yandan da keser, doğrudan saplamaya uygundur. Viyana’daki nesne tek ağızlı: sırtı kalın, yalnız bir yüzü keskin.',
  },
  {
    ad: 'Eğrilik',
    bulgu: 'Kavisli.',
    metin: 'Sabre biçimi, yani kavisli tek ağızlı kılıç, bu coğrafyaya Atilla’dan çok sonra geldi. 5. yüzyılda burada kimsenin elinde bu eğrilikte bir kılıç yoktu.',
  },
  {
    ad: 'Kabza ve teknik',
    bulgu: '10. yüzyıl işçiliği.',
    metin: 'Kabza topuzu, süsleme ve dövme tekniği 9.-10. yüzyıla işaret ediyor. Nesnenin kendisi gerçek ve dönemin gerçek bir eseri — sadece o dönem Atilla’nın dönemi değil.',
  },
] as const;

export function KilicIfsa() {
  const [adim, setAdim] = useState(0);     // 0 = hiçbiri açık değil
  const [acilan, setAcilan] = useState(0); // kaç ölçüt açıldı (geri dönüşte azalmaz)

  useEffect(() => { if (adim > acilan) setAcilan(adim); }, [adim, acilan]);

  return (
    <WidgetFrame
      hero
      kicker="PERDE 4 · SAYFANIN BAŞINDAKİ OBJE"
      title="Mars’ın Kılıcı"
      hint="Bu sayfayı açtığında dönen kılıcı gördün. Viyana’da da bu adla sergilenen bir kılıç var — üç ölçütü aç ve kendin karar ver."
    >
      <p className="text-[0.92rem] leading-relaxed text-slate-300">{KILIC.hikaye}</p>

      <div className="mt-4 rounded-xl border p-4" style={{ borderColor: `${GOLD}44`, background: `color-mix(in srgb, ${GOLD} 8%, transparent)` }}>
        <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: GOLD }}>BUNUN ADI VAR</div>
        <p className="text-[0.88rem] leading-relaxed text-slate-200">{KILIC.anlam}</p>
      </div>

      {/* ── NESNEYİ TARİHLENDİRME ──
          Eskiden tek bir "Peki Viyana'daki kılıç?" düğmesi vardı ve düğmenin
          kendisi cevabı ele veriyordu; okur tıklamadan önce hükmü biliyordu.
          Şimdi okur üç ölçütü tek tek açıyor ve hükmü KENDİ kuruyor —
          SayiDedektoru'nun (Perde 7) nesne versiyonu. */}
      <div className="mt-5">
        <div className="mb-2 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: IRON }}>
          İKİ KILIÇ, AYNI ÖLÇEKTE
        </div>
        <svg viewBox="0 0 360 176" className="w-full rounded-xl border border-white/10 bg-black/25" role="img"
          aria-label="Üstte 5. yüzyıl bozkır kılıcı: düz ve çift ağızlı. Altta Viyana'daki sabre: kavisli, tek ağızlı, süslü kabza.">
          <text x="12" y="20" fontSize="8" fontWeight="800" letterSpacing="1" fill={BONE} fontFamily="system-ui, sans-serif">5. YÜZYIL · BOZKIR</text>
          {/* düz, çift ağızlı */}
          <g style={{ opacity: adim >= 1 ? 1 : 0.75, transition: 'opacity .35s ease' }}>
            <path d="M60 44 L300 44 L316 52 L300 60 L60 60 Z" fill="none"
              stroke={adim === 1 ? ACCENT : BONE} strokeWidth={adim === 1 ? 2.4 : 1.4}
              style={{ transition: 'stroke .35s ease, stroke-width .35s ease' }} />
            <line x1="60" y1="52" x2="300" y2="52" stroke={BONE} strokeWidth="0.6" strokeDasharray="2 3" opacity="0.5" />
            <rect x="44" y="36" width="8" height="32" rx="2" fill="none" stroke={adim === 3 ? ACCENT : BONE} strokeWidth={adim === 3 ? 2.4 : 1.4}
              style={{ transition: 'stroke .35s ease, stroke-width .35s ease' }} />
            <rect x="16" y="48" width="28" height="8" rx="3" fill="none" stroke={adim === 3 ? ACCENT : BONE} strokeWidth={adim === 3 ? 2.4 : 1.4}
              style={{ transition: 'stroke .35s ease, stroke-width .35s ease' }} />
          </g>

          <text x="12" y="112" fontSize="8" fontWeight="800" letterSpacing="1" fill={GOLD} fontFamily="system-ui, sans-serif">VİYANA’DAKİ SABRE</text>
          {/* kavisli, tek ağızlı, süslü kabza */}
          <g style={{ opacity: adim >= 1 ? 1 : 0.75, transition: 'opacity .35s ease' }}>
            <path d="M60 132 Q 190 118 316 142 Q 306 152 300 150 Q 180 132 60 146 Z" fill="none"
              stroke={adim === 1 || adim === 2 ? ACCENT : GOLD} strokeWidth={adim === 1 || adim === 2 ? 2.4 : 1.4}
              style={{ transition: 'stroke .35s ease, stroke-width .35s ease' }} />
            <rect x="44" y="126" width="8" height="26" rx="2" fill="none" stroke={adim === 3 ? ACCENT : GOLD} strokeWidth={adim === 3 ? 2.4 : 1.4}
              style={{ transition: 'stroke .35s ease, stroke-width .35s ease' }} />
            <circle cx="24" cy="139" r="9" fill="none" stroke={adim === 3 ? ACCENT : GOLD} strokeWidth={adim === 3 ? 2.4 : 1.4}
              style={{ transition: 'stroke .35s ease, stroke-width .35s ease' }} />
            <circle cx="24" cy="139" r="4" fill="none" stroke={adim === 3 ? ACCENT : GOLD} strokeWidth="1" opacity="0.7" />
          </g>
          {/* eğrilik referans çizgisi — 2. adımda beliriyor */}
          <line x1="60" y1="132" x2="316" y2="132" stroke={ACCENT} strokeWidth="0.8" strokeDasharray="4 4"
            style={{ opacity: adim === 2 ? 0.9 : 0, transition: 'opacity .35s ease' }} />
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {ADIMLAR.map((a, i) => (
          <button
            key={a.ad}
            onClick={() => setAdim(i + 1)}
            aria-pressed={adim === i + 1}
            className="min-h-[44px] rounded-lg border px-2 py-2 text-[0.68rem] font-bold transition"
            style={{
              borderColor: adim === i + 1 ? ACCENT : acilan > i ? `${ACCENT}55` : 'rgba(255,255,255,0.12)',
              background: acilan > i ? `color-mix(in srgb, ${ACCENT} ${adim === i + 1 ? 18 : 7}%, transparent)` : 'rgba(255,255,255,0.02)',
              color: adim === i + 1 ? '#fff' : acilan > i ? '#d6d3d1' : '#a8a29e',
            }}
          >
            {a.ad}
          </button>
        ))}
      </div>

      {adim > 0 && (
        <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-[0.84rem] leading-relaxed text-slate-300"
          style={{ animation: 'atilla-fade 0.35s ease-out' }}>
          <span className="font-bold" style={{ color: ACCENT }}>{ADIMLAR[adim - 1].bulgu}</span>{' '}
          {ADIMLAR[adim - 1].metin}
        </p>
      )}

      {acilan >= 3 && (
        <div className="mt-4 space-y-3" style={{ animation: 'atilla-fade 0.5s ease-out' }}>
          <div className="rounded-xl border p-4" style={{ borderColor: `${IRON}55`, background: 'rgba(255,255,255,0.03)' }}>
            <div className="mb-1 text-sm font-bold" style={{ color: BONE }}>{KILIC.viyana.baslik}</div>
            <p className="text-[0.86rem] leading-relaxed text-slate-300">{KILIC.viyana.metin}</p>
          </div>
          <p className="text-[0.9rem] font-semibold leading-relaxed" style={{ color: ACCENT }}>
            {KILIC.viyana.ders}
          </p>
        </div>
      )}
    </WidgetFrame>
  );
}

/* ══════════════ Perde 5 · Haraç sayacı ══════════════ */

// ÇEVRİMLER BELGELİ, UYDURMA DEĞİL:
//   1 Roma librası ≈ 327 g  ·  1 libra = 72 solidus (Constantinus sonrası darp standardı)
// Bilerek YAPILMAYAN şey: "bu altın bugün kaç dolar / kaç askerin maaşı" demek.
// 5. yy asker maaşı için güvenilir tek rakam yok; uydurulmuş bir satın alma gücü
// makalenin "sıfat değil sayı" kuralını tam da en görünür yerde çiğnerdi.
const GRAM_PER_LIBRA = 327;
const SOLIDI_PER_LIBRA = 72;

export function HaracSayaci() {
  const [i, setI] = useState(0);
  const b = HARAC.basamaklar[i];
  const enBuyuk = HARAC.basamaklar[HARAC.basamaklar.length - 1].tutar;
  const [gosterBorc, setGosterBorc] = useState(false);

  const tutar = gosterBorc ? HARAC.birikmis : b.tutar;
  const kg = (tutar * GRAM_PER_LIBRA) / 1000;
  const solidi = tutar * SOLIDI_PER_LIBRA;
  const oran = clamp(tutar / HARAC.birikmis, 0, 1);

  return (
    <WidgetFrame
      hero
      kicker="PERDE 5 · HARAÇ MAKİNESİ"
      title="Yıllık ödeme, basamak basamak"
      hint="Yılları gez. Sütun büyüdükçe Doğu Roma’nın bütçesinden çıkan altın da büyüyor."
      footnote={HARAC.dispute}
    >
      <div className="flex gap-1.5">
        {HARAC.basamaklar.map((s, k) => (
          <button
            key={s.yil}
            onClick={() => { setI(k); setGosterBorc(false); }}
            aria-pressed={!gosterBorc && i === k}
            className="min-h-[44px] flex-1 rounded-xl border px-2 font-mono text-xs font-bold transition"
            style={{
              borderColor: !gosterBorc && i === k ? GOLD : 'rgba(255,255,255,0.12)',
              background: !gosterBorc && i === k ? `color-mix(in srgb, ${GOLD} 16%, transparent)` : 'rgba(255,255,255,0.02)',
              color: !gosterBorc && i === k ? '#fff' : '#a8a29e',
            }}
          >
            {s.yil}
          </button>
        ))}
        <button
          onClick={() => setGosterBorc(true)}
          aria-pressed={gosterBorc}
          className="min-h-[44px] flex-1 rounded-xl border px-2 text-[0.68rem] font-bold leading-tight transition"
          style={{
            borderColor: gosterBorc ? GARNET : 'rgba(255,255,255,0.12)',
            background: gosterBorc ? `color-mix(in srgb, ${GARNET} 16%, transparent)` : 'rgba(255,255,255,0.02)',
            color: gosterBorc ? '#fff' : '#a8a29e',
          }}
        >
          birikmiş<br />borç
        </button>
      </div>

      {/* Altın sütunu */}
      <div className="mt-4 flex items-end gap-4 rounded-xl border border-white/10 bg-black/25 p-4" style={{ minHeight: 190 }}>
        <div className="flex h-[150px] w-16 shrink-0 items-end overflow-hidden rounded-lg border border-white/10 bg-black/40">
          <div
            className="w-full rounded-b-lg transition-all duration-700"
            style={{
              height: `${Math.max(4, oran * 100)}%`,
              background: gosterBorc
                ? `linear-gradient(to top, ${GARNET}, color-mix(in srgb, ${GARNET} 55%, ${GOLD}))`
                : `linear-gradient(to top, color-mix(in srgb, ${GOLD} 70%, black), ${GOLD})`,
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-3xl font-bold leading-none" style={{ color: gosterBorc ? GARNET : GOLD }}>
            {tr(tutar)}
          </div>
          <div className="mt-1 text-xs text-slate-400">{HARAC.birim} · {gosterBorc ? 'tek seferlik birikmiş borç' : 'yıllık'}</div>
          <div className="mt-3 space-y-1 font-mono text-[0.72rem] text-slate-300">
            <div>≈ {tr(kg, 0)} kg altın</div>
            <div>= {tr(solidi)} solidus</div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-300">
        {gosterBorc
          ? 'Bu tutar yıllık değil: geçmiş ödemelerin toplamı olarak, peşin isteniyor.'
          : b.olay}
      </p>

      {!gosterBorc && b.tutar === enBuyuk && (
        <p className="mt-3 border-l-2 pl-3 text-sm leading-relaxed text-slate-400" style={{ borderColor: `${GARNET}66` }}>
          {HARAC.etki}
        </p>
      )}

      <div className="mt-5 rounded-xl border p-4" style={{ borderColor: `${ACCENT}44`, background: `color-mix(in srgb, ${ACCENT} 8%, transparent)` }}>
        <div className="text-sm font-bold" style={{ color: ACCENT }}>{HARAC.strateji.baslik}</div>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{HARAC.strateji.metin}</p>
      </div>
    </WidgetFrame>
  );
}

/* ══════════════ Perde 5 · Theodosius surları kesiti ══════════════ */

export function SurKesiti() {
  const [sel, setSel] = useState(3); // ic sur (asil duvar)
  const k = SURLAR.katmanlar[sel];

  // Kesit geometrisi: soldan saga hendek → dis sur → teras → ic sur.
  const bloklar = [
    { x: 30, w: 90, h: 26, y: 150, ad: 'Hendek' },
    { x: 150, w: 46, h: 62, y: 114, ad: 'Dış sur' },
    { x: 210, w: 74, h: 12, y: 164, ad: 'Teras' },
    { x: 300, w: 70, h: 120, y: 56, ad: 'İç sur' },
  ];

  return (
    <WidgetFrame
      kicker={`PERDE 5 · ${SURLAR.deprem.yil} · KONSTANTİNOPOLİS`}
      title="Atilla’nın önüne geldiği duvar"
      hint="Katmanlara dokun. Saldıran taraf soldan geliyor — dördünü de geçmesi gerekiyor."
    >
      <div className="grid grid-cols-3 gap-2.5">
        <Stat2 value={tr(SURLAR.deprem.kuleler)} label="yıkılan kule" color={GARNET} />
        <Stat2 value={tr(SURLAR.onarim.gun)} label="günde onarıldı" color={ACCENT} />
        <Stat2 value="4" label="katman" color={IRON} />
      </div>

      <svg viewBox="0 0 400 200" className="mt-4 w-full rounded-xl border border-white/10" style={{ background: '#0a0706' }} role="img" aria-label="Theodosius surlarının kesiti: soldan sağa hendek, dış sur, teras ve iç sur">
        {/* zemin */}
        <rect x="0" y="176" width="400" height="24" fill="rgba(255,255,255,0.05)" />
        {/* saldiri yonu */}
        <path d="M6 96 L26 96 M20 90 L26 96 L20 102" stroke={GARNET} strokeWidth="2" fill="none" />
        <text x="6" y="86" fill={GARNET} fontSize="9" fontWeight="700" fontFamily="system-ui, sans-serif">SALDIRI</text>

        {bloklar.map((b, i) => {
          const on = sel === i;
          return (
            <g key={b.ad} onClick={() => setSel(i)} style={{ cursor: 'pointer' }}>
              <rect
                x={b.x} y={b.y} width={b.w} height={b.h} rx="3"
                fill={on ? ACCENT : 'rgba(255,255,255,0.14)'}
                stroke={on ? ACCENT : 'rgba(255,255,255,0.25)'}
                strokeWidth={on ? 2 : 1}
                opacity={i === 0 ? 0.55 : 1}
              />
              {/* ic surun kuleleri */}
              {i === 3 && [0, 1].map((t) => (
                <rect key={t} x={b.x + 6 + t * 40} y={b.y - 16} width="24" height="18" rx="2"
                  fill={on ? ACCENT : 'rgba(255,255,255,0.2)'} />
              ))}
              <text x={b.x + b.w / 2} y={b.y + b.h + 13} fill={on ? '#fff' : 'rgba(255,255,255,0.5)'}
                fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">
                {b.ad}
              </text>
            </g>
          );
        })}
        <text x="394" y="16" fill="rgba(255,255,255,0.4)" fontSize="9" textAnchor="end" fontWeight="600" fontFamily="system-ui, sans-serif">ŞEHİR →</text>
      </svg>

      <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-4">
        <div className="text-sm font-bold" style={{ color: BONE }}>{k.ad}</div>
        <p className="mt-1.5 text-[0.88rem] leading-relaxed text-slate-300">{k.ne}</p>
      </div>

      <div className="mt-4 rounded-xl border p-4" style={{ borderColor: `${ACCENT}44`, background: `color-mix(in srgb, ${ACCENT} 8%, transparent)` }}>
        <p className="text-[0.88rem] leading-relaxed text-slate-200">
          {SURLAR.onarim.faktiyonlar} {SURLAR.onarim.eklenen}
        </p>
        <p className="mt-2 text-[0.82rem] leading-relaxed text-slate-400">{SURLAR.onarim.kitabe}</p>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-300">{SURLAR.sonuc}</p>
    </WidgetFrame>
  );
}

/** SurKesiti içi küçük istatistik (ui.tsx'teki Stat ile aynı görünüm, yerel kopya değil). */
function Stat2({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="rounded-xl border p-3 text-center"
      style={{ borderColor: `color-mix(in srgb, ${color} 30%, transparent)`, background: `color-mix(in srgb, ${color} 10%, transparent)` }}>
      <div className="font-mono text-xl font-bold leading-tight sm:text-2xl" style={{ color }}>{value}</div>
      <div className="mt-0.5 text-[0.68rem] leading-tight text-slate-400">{label}</div>
    </div>
  );
}

/* ══════════════ Perde 7 · "Bu sayı mümkün mü?" ══════════════ */

/**
 * Jordanes Catalaunum için 165.000 ölü verir. Bu widget o sayıyı SIFATLA değil
 * ARİTMETİKLE sınıyor: bir orduyu yürüten şey cesaret değil tahıl, su ve yoldur.
 * Varsayımlar data.ts'te açıkça yazılı ve ekranda gösteriliyor — okur beğenmezse
 * kaydırıcıyı kendi kabulüne çekip sonucu yeniden okuyabilsin diye.
 */
export function SayiDedektoru() {
  const v = CATALAUNUM.sayi.varsayimlar;
  // ⚠ <number> ŞART: data.ts `as const` olduğu için `iddia` literal tip (165000);
  // açık tip vermezsen useState state'i o literale kilitler ve kaydırıcı derlenmez.
  const [n, setN] = useState<number>(CATALAUNUM.sayi.iddia);

  const at = Math.round(n * v.atOrani);
  const tahilKg = n * v.tahilKisiGun + at * v.atYemGun;
  const suL = n * v.suKisiGun + at * v.suAtGun;
  const kolonKm = (n / v.siraBoyu) * v.kolonMetreKisi / 1000;

  return (
    <WidgetFrame
      kicker="PERDE 7 · SIFAT DEĞİL, SAYI"
      title="Bu sayı mümkün mü?"
      hint="Kaydırıcıyı Jordanes’in verdiği rakama getir. Sonra o ordunun bir GÜNDE ne yemesi gerektiğine bak."
      footnote={`Varsayımlar: asker ${v.tahilKisiGun} kg tahıl ve ${v.suKisiGun} L su/gün · at ${v.atYemGun} kg yem ve ${v.suAtGun} L su/gün · kişi başına ${v.atOrani} at · ${v.siraBoyu} kişilik sıra, kişi başı ${v.kolonMetreKisi} m. Bunlar kaba büyüklük tahminleridir; amaç kesin rakam değil, MERTEBE.`}
    >
      <label className="block text-xs font-semibold text-slate-400" htmlFor="atilla-ordu">
        Ordu mevcudu: <span className="font-mono font-bold" style={{ color: ACCENT }}>{tr(n)}</span> kişi
      </label>
      <input
        id="atilla-ordu"
        type="range" min={10000} max={200000} step={5000} value={n}
        onChange={(e) => setN(Number(e.target.value))}
        className="mt-2 w-full accent-orange-500"
      />

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <Stat2 value={`${tr(tahilKg / 1000, 0)} t`} label="tahıl + yem / gün" color={GOLD} />
        <Stat2 value={`${tr(suL / 1000, 0)} m³`} label="su / gün" color={ACCENT} />
        <Stat2 value={`${tr(kolonKm, 0)} km`} label="yürüyüş kolonu" color={GARNET} />
      </div>

      {n >= CATALAUNUM.sayi.iddia && (
        <div className="mt-4 rounded-xl border p-4" style={{ borderColor: `${GARNET}55`, background: `color-mix(in srgb, ${GARNET} 9%, transparent)` }}>
          <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: GARNET }}>
            JORDANES’İN RAKAMI · {tr(CATALAUNUM.sayi.iddia)}
          </div>
          <p className="text-sm leading-relaxed text-slate-200">
            Bu mevcut, her gün {tr(tahilKg / 1000, 0)} ton yiyecek ve {tr(suL / 1000, 0)} m³ su ister; kolon
            yaklaşık {tr(kolonKm, 0)} km uzar — yani öncü kamp kurarken artçı hâlâ bir önceki konaktadır.
            5. yüzyıl Galya’sında bunu günlerce sürdürecek bir ikmal düzeni yok.
          </p>
        </div>
      )}

      <p className="mt-4 text-sm leading-relaxed text-slate-400">{CATALAUNUM.sayi.itiraz}</p>
    </WidgetFrame>
  );
}

/* ══════════════ Perde 9 · Üç tabut ══════════════ */

// Jordanes'in anlattığı defin: demir, gümüş, altın iç içe. Okur üçünü tek tek
// açıyor ve MERKEZDE HİÇBİR ŞEY BULMUYOR — çünkü mezar hiç bulunamadı.
// Bu, makalenin kapanış tezinin görsel hâli: elde kalan şey ceset değil, ad.
const TABUT_RENK: Record<string, string> = { Demir: IRON, Gümüş: '#c9ccd4', Altın: GOLD };

export function UcTabut() {
  const [acilan, setAcilan] = useState(0); // kaç tabut açıldı (0..3)
  const bitti = acilan >= DEFIN.tabutlar.length;
  const siradaki = DEFIN.tabutlar[acilan];

  return (
    <WidgetFrame
      hero
      kicker={`PERDE 9 · ${buyuk(DEFIN.ad)}`}
      title="Üç tabut"
      hint={DEFIN.tanim}
    >
      <svg viewBox="0 0 320 200" className="w-full rounded-xl border border-white/10" style={{ background: '#0a0706' }}
        role="img" aria-label={`İç içe üç tabut; ${acilan} tanesi açıldı`}>
        {DEFIN.tabutlar.map((t, i) => {
          const acik = i < acilan;
          const pad = i * 26;
          const renk = TABUT_RENK[t.madde] ?? IRON;
          return (
            <g key={t.madde} style={{ opacity: acik ? 0.16 : 1, transition: 'opacity 0.7s ease' }}>
              <rect x={30 + pad} y={30 + pad * 0.62} width={260 - pad * 2} height={140 - pad * 1.24} rx="8"
                fill="none" stroke={renk} strokeWidth={acik ? 1 : 2.5} />
              <text x={38 + pad} y={46 + pad * 0.62} fill={renk} fontSize="11" fontWeight="700"
                fontFamily="system-ui, sans-serif">{t.madde}</text>
            </g>
          );
        })}
        {bitti && (
          <text x="160" y="106" fill={BONE} fontSize="15" fontWeight="700" textAnchor="middle"
            fontFamily="system-ui, sans-serif" style={{ animation: 'atilla-fade 0.8s ease-out' }}>
            boş
          </text>
        )}
      </svg>

      <div className="mt-3 space-y-2">
        {DEFIN.tabutlar.slice(0, acilan).map((t) => (
          <div key={t.madde} className="rounded-xl border px-3.5 py-2.5"
            style={{ borderColor: `color-mix(in srgb, ${TABUT_RENK[t.madde] ?? IRON} 40%, transparent)`, background: `color-mix(in srgb, ${TABUT_RENK[t.madde] ?? IRON} 8%, transparent)` }}>
            <span className="text-sm font-bold" style={{ color: TABUT_RENK[t.madde] ?? IRON }}>{t.madde}</span>
            <span className="ml-2 text-[0.84rem] text-slate-300">{t.anlam}</span>
          </div>
        ))}
      </div>

      {!bitti ? (
        <div className="mt-4">
          <ActionButton onClick={() => setAcilan(acilan + 1)} full tone="ghost">
            {siradaki.madde} tabutu aç
          </ActionButton>
        </div>
      ) : (
        <div className="mt-4 space-y-3" style={{ animation: 'atilla-fade 0.6s ease-out' }}>
          <p className="text-sm leading-relaxed text-slate-300">{DEFIN.gomu}</p>
          <p className="text-base font-bold" style={{ color: GARNET }}>{DEFIN.bugun}</p>
          <p className="text-[0.92rem] font-semibold leading-relaxed" style={{ color: ACCENT }}>{DEFIN.punch}</p>
        </div>
      )}
    </WidgetFrame>
  );
}

/* ══════════════ Perde 10 · Efsane karşılaştırıcı ══════════════ */

export function EfsaneKarsilastirici() {
  const [sel, setSel] = useState(0);
  const g = EFSANE.gelenekler[sel];
  const renk = ({ iron: IRON, gold: GOLD, ember: ACCENT, garnet: GARNET } as Record<string, string>)[g.renk] ?? ACCENT;

  return (
    <WidgetFrame
      hero
      kicker="PERDE 10 · DÖRT GELENEK"
      title="Aynı adam, dört ayrı portre"
      hint="Dördü de onu sahiplendi ve dördü de başka birini anlattı. Sekmelere dokun."
      footnote={EFSANE.punch}
    >
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {EFSANE.gelenekler.map((x, i) => {
          const r = ({ iron: IRON, gold: GOLD, ember: ACCENT, garnet: GARNET } as Record<string, string>)[x.renk] ?? ACCENT;
          const on = sel === i;
          return (
            <button
              key={x.ad}
              onClick={() => setSel(i)}
              aria-pressed={on}
              className="min-h-[56px] rounded-xl border px-2 py-2 text-center text-[0.7rem] font-bold leading-tight transition"
              style={{
                borderColor: on ? r : 'rgba(255,255,255,0.12)',
                background: on ? `color-mix(in srgb, ${r} 16%, transparent)` : 'rgba(255,255,255,0.02)',
                color: on ? '#fff' : '#a8a29e',
              }}
            >
              {x.ad}
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl border p-4" style={{ borderColor: `${renk}55`, background: `color-mix(in srgb, ${renk} 8%, transparent)` }}>
        <div className="font-mono text-[0.66rem]" style={{ color: renk }}>{g.nerede}</div>
        <div className="mt-1 text-base font-bold" style={{ color: BONE }}>{g.eser}</div>
        <p className="mt-2 text-[0.88rem] leading-relaxed text-slate-300">{g.portre}</p>
      </div>

      {/* Aynı ölüm, dört anlatı */}
      <div className="mt-5">
        <div className="mb-2 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: IRON }}>
          {buyuk(EFSANE.ayniSahne.baslik)}
        </div>
        {/* İki bant: ÇAĞDAŞ KAYIT ve DESTAN. Destan satırları yukarıdaki sekmeye
            bağlı — tıklanınca o geleneğe geçiyor. Kayıt satırları buton DEĞİL,
            çünkü sekmelerde karşılıkları yok; hover vaadi de onlardan kaldırıldı. */}
        <div className="space-y-1.5">
          {EFSANE.ayniSahne.satirlar.map((s) => {
            const destan = s.gelenek !== null;
            const etiket = (
              <span
                className="w-[5.4rem] shrink-0 font-mono text-[0.56rem] font-bold tracking-[0.12em]"
                style={{ color: destan ? ACCENT : IRON }}
              >
                {destan ? 'DESTAN' : 'ÇAĞDAŞ KAYIT'}
              </span>
            );
            const govde = (
              <>
                {etiket}
                <span className="w-[8.6rem] shrink-0 text-[0.7rem] font-semibold" style={{ color: destan ? BONE : IRON }}>{s.kim}</span>
                <span className="min-w-0 flex-1 text-[0.84rem] leading-snug text-slate-300">{s.ne}</span>
              </>
            );
            return destan ? (
              <button
                key={s.kim}
                type="button"
                onClick={() => setSel(s.gelenek as number)}
                aria-pressed={sel === s.gelenek}
                className="flex w-full items-baseline gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-white/5"
                style={sel === s.gelenek ? { background: `${ACCENT}14` } : undefined}
              >
                {govde}
              </button>
            ) : (
              <div key={s.kim} className="flex items-baseline gap-3 rounded-lg px-2 py-2">
                {govde}
              </div>
            );
          })}
        </div>
        <p className="mt-3 border-l-2 pl-3 text-xs leading-relaxed text-slate-500" style={{ borderColor: `${IRON}66` }}>
          {EFSANE.ayniSahne.bosluk}
        </p>
      </div>
    </WidgetFrame>
  );
}
