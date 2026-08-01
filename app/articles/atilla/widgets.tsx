'use client';

// Atilla — Perde 0-4 interaktif modülleri.
// Hepsi HAFİF (SVG + state). Ağır olanlar (Catalaunum savaş animasyonu, otağ
// karar modülü) ayrı sim-* dosyalarında ve InView + dynamic(ssr:false) ile
// yükleniyor — bkz. [[article-interactive-heavy-pattern]].
//
// SSR KURALI: Math.random ve Date.now render'a GİRMEZ (hidrasyon). Zamana
// bağlı tek şey KavimlerGocu'nun oynatıcısı ve o da mount sonrası çalışıyor.

import { useEffect, useRef, useState } from 'react';
import { ACCENT, BONE, GARNET, GOLD, IRON, WidgetFrame, ActionButton, WordNote, useReducedMotion } from './ui';
import { ONCEKILER, GOC, KAGAN, BARBAR, ISIM, KILIC } from './data';

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
      footnote={GOC.onemli}
    >
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

const SEMA = [
  { id: 'kut', ust: 'GÖK', ad: 'Kut', renk: GOLD },
  { id: 'kagan', ust: 'YETKİ', ad: 'Kağan', renk: ACCENT },
  { id: 'ikili', ust: 'İKİ KANAT', ad: 'Sol / Sağ', renk: GARNET },
  { id: 'boy', ust: 'TABAN', ad: 'Boylar', renk: IRON },
  { id: 'kurultay', ust: 'MECLİS', ad: 'Kurultay', renk: BONE },
] as const;

export function KaganlikSemasi() {
  const [sel, setSel] = useState<string>('kut');

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
      hint="Beş parça. Her birine dokun — Atilla’nın oturduğu koltuğun nasıl kurulduğunu görürsün."
    >
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {SEMA.map((s) => {
          const on = sel === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSel(s.id)}
              aria-pressed={on}
              className="min-h-[68px] rounded-xl border px-1 py-2 text-center transition hover:brightness-125"
              style={{
                borderColor: on ? s.renk : 'rgba(255,255,255,0.1)',
                background: on ? `color-mix(in srgb, ${s.renk} 16%, transparent)` : 'rgba(255,255,255,0.02)',
              }}
            >
              <span className="block text-[0.5rem] font-bold tracking-[0.12em]" style={{ color: on ? s.renk : 'rgba(255,255,255,0.4)' }}>
                {s.ust}
              </span>
              <span className="mt-1 block text-[0.72rem] font-bold leading-tight sm:text-sm" style={{ color: on ? '#fff' : '#a8a29e' }}>
                {s.ad}
              </span>
            </button>
          );
        })}
      </div>

      {/* akış oku */}
      <div aria-hidden className="my-3 h-px w-full" style={{ background: `linear-gradient(90deg, ${GOLD}55, ${ACCENT}55, ${GARNET}55, ${IRON}55, ${BONE}44)` }} />

      <div className="rounded-xl border border-white/10 bg-black/25 p-4">
        <div className="text-sm font-bold" style={{ color: BONE }}>{m.ad}</div>
        <p className="mt-1.5 text-[0.86rem] leading-relaxed text-slate-300">{m.tanim}</p>
        {m.ek && (
          <p className="mt-3 border-l-2 pl-3 text-[0.82rem] leading-relaxed text-slate-400" style={{ borderColor: `${ACCENT}66` }}>
            {m.ek}
          </p>
        )}
      </div>
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

export function KilicIfsa() {
  const [acildi, setAcildi] = useState(false);

  return (
    <WidgetFrame
      hero
      kicker="PERDE 4 · SAYFANIN BAŞINDAKİ OBJE"
      title="Mars’ın Kılıcı"
      hint="Bu sayfayı açtığında dönen kılıcı gördün. Şimdi ne olduğunu öğreniyorsun."
    >
      <p className="text-[0.92rem] leading-relaxed text-slate-300">{KILIC.hikaye}</p>

      <div className="mt-4 rounded-xl border p-4" style={{ borderColor: `${GOLD}44`, background: `color-mix(in srgb, ${GOLD} 8%, transparent)` }}>
        <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: GOLD }}>BUNUN ADI VAR</div>
        <p className="text-[0.88rem] leading-relaxed text-slate-200">{KILIC.anlam}</p>
      </div>

      {!acildi ? (
        <div className="mt-4">
          <ActionButton onClick={() => setAcildi(true)} full tone="ghost">
            Peki bugün Viyana’da sergilenen kılıç?
          </ActionButton>
        </div>
      ) : (
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
