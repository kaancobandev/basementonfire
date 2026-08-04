'use client';

// ─────────────────────────────────────────────────────────────────────────
// CATALAUNUM (451) — Aetius ve Atilla. Faz faz savaş animasyonu.
//
// NİYE ANİMASYON, NİYE OYUN DEĞİL: Mohaç'ta (kanuni) okur Macar tarafını
// OYNUYOR, çünkü orada öğretilecek şey bir hataydı. Burada öğretilecek şey bir
// hata değil, bir DENGE: iki taraf da yıkılmıyor ve Aetius bunu bilerek böyle
// bırakıyor. Oynanabilir yapılsaydı okur "kazanmayı" arardı.
//
// TEKNİK: hareket TAMAMEN CSS transition + React state. rAF YOK.
//   • Önizleme/arka plan sekmesinde rAF kısılıyor ([[preview-hidden-tab-frozen]]),
//     transition ise kısılsa bile son duruma OTURUYOR → faz her koşulda doğru.
//   • prefers-reduced-motion: otomatik oynatma KAPALI, geçişler 0 sn.
//
// ── 2026-08-04 OKUNABİLİRLİK REVİZYONU (ölçümle) ──────────────────────────
// Şikâyet: "hangi ordu hangi tarafta anlaşılsın, yazılar belirgin olsun."
// Beş kök neden bulundu ve beşi de düzeltildi:
//
//  1. TARAF KİMLİĞİ altı ayrı renkteydi ve hiçbiri açıklanmıyordu. Artık İKİ
//     RENK AİLESİ var: Hun sıcak (turuncu-kırmızı), Roma soğuk (gri-kemik).
//     Ordular karışsa bile taraf renkten okunuyor. Üstüne tıklanabilir lejant.
//  2. ETİKETLER SVG içindeydi → fontSize kullanıcı birimi, CSS pikseli değil.
//     800 birimlik viewBox telefonda ~310 px'e sığıyor (0,39×), yani fontSize 13
//     ekranda 5,0 px oluyordu. Etiketler artık HTML katmanında, gerçek CSS
//     pikselinde ve ORDUYLA BİRLİKTE hareket ediyor.
//  3. "Üst = Hun / alt = Roma" kuralı son üç fazda ÇÖKÜYORDU (birlikler ~60
//     birimlik tek banda giriyordu, Vizigot Atilla'nın merkezinden yukarıdaydı).
//     Etiket orduya bağlandığı için kural artık çökmüyor; ayrıca Roma hattı
//     aşağı alınıp aradaki boş şerit korundu.
//  4. GECE PERDESİ birliklerin ÜSTÜNE basılıyordu → son üç fazda kontrast
//     ~1,3:1'e iniyordu, yani tezin geçtiği fazlar en okunmaz kareler oluyordu.
//     Perde artık zeminin hemen üstünde, aktörlerin ALTINDA.
//  5. SIRT ÇELİŞKİSİ: metin "Vizigotlar sırtı tutuyor" diyordu ama poligonun
//     içindeki tek birlik Gepid'di (Hun sağ kanadı). Yollar düzeltildi.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { ACCENT, BONE, GARNET, IRON, WidgetFrame, ActionButton, buyuk, useReducedMotion } from './ui';
import { CATALAUNUM, AETIUS } from './data';

const N = CATALAUNUM.fazlar.length; // 7
const W = 800, H = 470;

type Taraf = 'hun' | 'roma';
type Birlik = {
  id: string; ad: string; kisa: string; taraf: Taraf;
  renk: string; adet: number; satir: number; yol: [number, number][];
};

// İKİ RENK AİLESİ — taraf bilgisini renk taşıyor.
//   Hun  : sıcak (turuncu → kırmızı)
//   Roma : soğuk (gri → kemik)
// GOLD bilerek KULLANILMADI: eski sürümde Ostrogot (Hun tarafı) GOLD, Vizigot
// (Roma tarafı) BONE idi ve ikisi de "açık renk" okunuyordu.
const HUN_ACIK = 'color-mix(in srgb, #e2622b 62%, #f6d9c4)';
const ROMA_KOYU = 'color-mix(in srgb, #8b95a6 68%, #2b3038)';

const BIRLIKLER: Birlik[] = [
  {
    id: 'atilla', ad: 'Atilla · merkez', kisa: 'ATİLLA', taraf: 'hun', renk: ACCENT, adet: 14, satir: 2,
    yol: [[300, 150], [300, 172], [300, 196], [300, 214], [300, 226], [272, 238], [272, 238]],
  },
  {
    id: 'gepid', ad: 'Gepid · sağ kanat', kisa: 'GEPİD', taraf: 'hun', renk: GARNET, adet: 9, satir: 1,
    // Sırt yarışını KAYBEDİYOR: 1-2. fazda poligondan aşağı düşüyor (eskiden içindeydi).
    yol: [[512, 150], [548, 182], [560, 214], [572, 200], [560, 210], [268, 276], [268, 276]],
  },
  {
    id: 'ostrogot', ad: 'Ostrogot · sol kanat', kisa: 'OSTROGOT', taraf: 'hun', renk: HUN_ACIK, adet: 9, satir: 1,
    yol: [[128, 150], [128, 176], [128, 206], [136, 232], [140, 250], [268, 300], [268, 300]],
  },
  {
    id: 'aetius', ad: 'Aetius · Roma', kisa: 'AETIUS', taraf: 'roma', renk: IRON, adet: 12, satir: 2,
    // Son fazda 8 birim İLERLEYİP DURUYOR: hareketin durması tezin kendisi.
    yol: [[150, 366], [150, 340], [150, 316], [150, 300], [150, 292], [150, 348], [150, 340]],
  },
  {
    id: 'alan', ad: 'Alan · merkez', kisa: 'ALAN', taraf: 'roma', renk: ROMA_KOYU, adet: 8, satir: 1,
    yol: [[320, 372], [320, 352], [320, 328], [318, 310], [316, 304], [330, 360], [330, 352]],
  },
  {
    id: 'vizigot', ad: 'Vizigot · Theodoric', kisa: 'VİZİGOT', taraf: 'roma', renk: BONE, adet: 11, satir: 2,
    // SIRTI GERÇEKTEN TUTUYOR: 2. fazda (660,150) poligonun göbeğinde,
    // 3. fazda (640,205) aşağı iniyor → "yüksekten iniyor" artık bir hareket.
    yol: [[560, 366], [600, 250], [660, 150], [640, 205], [612, 220], [566, 250], [566, 242]],
  },
];

/** Fazın odağındaki birlikler; odak dışındakiler soluyor. Boş dizi = hepsi eşit. */
const ODAK: string[][] = [
  [],                      // 1 · diziliş
  ['gepid', 'vizigot'],    // 2 · sırt yarışı
  ['vizigot'],             // 3 · sırt tutuluyor
  ['vizigot'],             // 4 · Theodoric düşüyor
  [],                      // 5 · gece
  ['atilla'],              // 6 · araba ordugâhı
  ['aetius', 'alan'],      // 7 · Aetius bırakıyor
];

const KUTU = 11, ARA = 15;
const TARAF_RENK: Record<Taraf, string> = { hun: ACCENT, roma: IRON };

export default function CatalaunumSim() {
  const [faz, setFaz] = useState(0);
  const [oynuyor, setOynuyor] = useState(false);
  const [yalniz, setYalniz] = useState<Taraf | null>(null);   // lejanttan taraf izole etme
  const reduced = useReducedMotion();
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!oynuyor) return;
    if (faz >= N - 1) { setOynuyor(false); return; }
    t.current = setTimeout(() => setFaz((f) => f + 1), 2100);
    return () => { if (t.current) clearTimeout(t.current); };
  }, [oynuyor, faz]);

  useEffect(() => () => { if (t.current) clearTimeout(t.current); }, []);

  const f = CATALAUNUM.fazlar[faz];
  const sure = reduced ? 0 : 1.5;
  const gece = faz >= 4;
  const kralDustu = faz >= 3;
  const ordugah = faz >= 5;
  const takipYok = faz >= 6;
  const odak = ODAK[faz];

  /** Bir birliğin bu fazdaki opaklığı: taraf izolasyonu × faz odağı. */
  const gorunur = (b: Birlik) => {
    if (yalniz && b.taraf !== yalniz) return 0.18;
    if (odak.length && !odak.includes(b.id)) return 0.42;
    return 1;
  };

  return (
    <WidgetFrame
      hero
      kicker={`SAVAŞ ANİMASYONU · ${CATALAUNUM.yil} · CATALAUNUM`}
      title="Aetius ve Atilla"
      hint="Yedi faz. Bir tarafa dokununca yalnız o ordu kalır; oynat ya da fazları elle gez."
      footnote={CATALAUNUM.yer}
    >
      {/* ── LEJANT: sahnedeki renklerin anahtarı, gerçek CSS pikselinde ── */}
      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        {(['hun', 'roma'] as Taraf[]).map((tr) => {
          const birlikler = BIRLIKLER.filter((b) => b.taraf === tr);
          const on = yalniz === tr;
          return (
            <button
              key={tr}
              type="button"
              onClick={() => setYalniz(on ? null : tr)}
              aria-pressed={on}
              className="rounded-xl border bg-black/25 p-3 text-left transition"
              style={{
                borderColor: on ? TARAF_RENK[tr] : 'rgba(255,255,255,0.1)',
                background: on ? `color-mix(in srgb, ${TARAF_RENK[tr]} 10%, transparent)` : undefined,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: TARAF_RENK[tr] }} />
                <span className="text-[0.78rem] font-bold" style={{ color: TARAF_RENK[tr] }}>
                  {tr === 'hun' ? 'ATİLLA · HUN ORDUSU' : 'AETIUS · ROMA + MÜTTEFİKLER'}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                {birlikler.map((b) => (
                  <span key={b.id} className="flex items-center gap-1.5 text-[0.68rem] text-slate-400">
                    <span className="inline-block h-2 w-3 rounded-[2px]" style={{ background: b.renk }} />
                    {b.ad.split(' · ')[0]}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── SAHNE: SVG + üstünde HTML etiket katmanı ── */}
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-white/10" style={{ background: '#0a0706' }}
          role="img" aria-label={`Catalaunum, faz ${faz + 1}: ${f.ad}. ${f.metin}`}>
          <defs>
            <linearGradient id="ac-ridge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="rgba(232,222,208,0.17)" />
              <stop offset="1" stopColor="rgba(232,222,208,0.03)" />
            </linearGradient>
          </defs>

          <rect width={W} height={H} fill="#0a0706" />

          {/* Sırt — muharebenin düğümü. Sırt yarışının geçtiği fazlarda
              belirginleşiyor: "düğüm burası" fazın kendisinde söylensin.
              ⚠ opacity>1 diye bir şey YOK (kırpılır, sessiz no-op olurdu) —
              vurgu, üstüne binen ikinci bir katmanla veriliyor. */}
          <path d="M520 60 L800 40 L800 210 L560 190 Z" fill="url(#ac-ridge)" />
          <path d="M520 60 L800 40 L800 210 L560 190 Z" fill="rgba(232,222,208,0.13)"
            style={{ opacity: faz >= 1 && faz <= 3 ? 1 : 0, transition: `opacity ${sure}s ease` }} />
          <path d="M520 60 L800 40" stroke="rgba(232,222,208,0.32)" strokeWidth="2" fill="none" />

          {/* GECE PERDESİ — aktörlerin ALTINDA. Eskiden üstteydi ve tezin geçtiği
              üç fazı okunmaz yapıyordu (kontrast ~1,3:1). Renk de mavi-griye
              çevrildi: "gece" hissi karartmadan değil, renk sıcaklığından gelsin. */}
          <rect width={W} height={H} fill="#0b0d18"
            style={{ opacity: gece ? 0.38 : 0, transition: `opacity ${sure}s ease`, pointerEvents: 'none' }} />

          {/* Araba ordugâhı (Faz 6) */}
          <g style={{ opacity: ordugah ? 1 : 0, transition: `opacity ${sure * 0.6}s ease` }}>
            <rect x="150" y="216" width="264" height="100" rx="8" fill="none" stroke={ACCENT} strokeWidth="2" strokeDasharray="7 5" />
          </g>

          {/* Birlikler — kılıf + bloklar aynı <g>'de, transition'ı miras alıyor */}
          {BIRLIKLER.map((b) => {
            const [x, y] = b.yol[faz];
            const perSatir = Math.ceil(b.adet / b.satir);
            const gen = perSatir * ARA + 8, yuk = b.satir * 13 + 8;
            return (
              <g key={b.id}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  opacity: gorunur(b),
                  transition: `transform ${sure}s cubic-bezier(0.4,0,0.2,1), opacity ${sure * 0.6}s ease`,
                }}>
                <rect x={-gen / 2} y={-KUTU / 2 - 4} width={gen} height={yuk} rx="6"
                  fill={`color-mix(in srgb, ${TARAF_RENK[b.taraf]} ${gece ? 6 : 16}%, transparent)`}
                  stroke={`color-mix(in srgb, ${TARAF_RENK[b.taraf]} 45%, transparent)`}
                  strokeWidth={odak.includes(b.id) ? 2 : 1}
                  style={{ transition: `fill ${sure}s ease, stroke-width ${sure * 0.5}s ease` }} />
                {Array.from({ length: b.adet }, (_, i) => {
                  const r = Math.floor(i / perSatir), c = i % perSatir;
                  return (
                    <rect key={i}
                      x={(c - (perSatir - 1) / 2) * ARA - KUTU / 2}
                      y={r * 13 - KUTU / 2}
                      width={KUTU} height="8" rx="2" fill={b.renk}
                      opacity={gece ? 0.78 : 0.95}
                      style={{ transition: `opacity ${sure}s ease` }}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Theodoric düştü (Faz 4) — VİZİGOT'un kendi renginde (BONE).
              Eskiden GARNET'ti, yani Hun sağ kanadının rengi: "Gepidler burayı
              aldı" diye okunabiliyordu. Ölüm vurgusu artık renkle değil FORMLA. */}
          <g style={{ opacity: kralDustu ? 1 : 0, transition: `opacity ${sure * 0.5}s ease` }}>
            <g transform="translate(640, 192)">
              <circle r="15" fill="none" stroke={BONE} strokeWidth={kralDustu ? 2.5 : 1} strokeDasharray="3 4"
                style={{ transition: `stroke-width ${sure * 0.5}s ease` }} />
              <line x1="-8" y1="-8" x2="8" y2="8" stroke={BONE} strokeWidth="3" />
              <line x1="8" y1="-8" x2="-8" y2="8" stroke={BONE} strokeWidth="3" />
            </g>
          </g>

          {/* Aetius takip etmiyor (Faz 7) */}
          <g style={{ opacity: takipYok ? 1 : 0, transition: `opacity ${sure * 0.6}s ease` }}>
            <path d="M196 330 L262 300" stroke={IRON} strokeWidth="2" strokeDasharray="6 6" fill="none" />
          </g>
        </svg>

        {/* ── HTML ETİKET KATMANI ──
            Yazılar SVG'nin ölçeklenen koordinat sisteminden ÇIKARILDI. Konum
            yüzdeyle veriliyor ve aynı CSS transition'ı taşıyor, ama punto gerçek
            CSS pikseli → telefonda da okunuyor. Bileşen dynamic(ssr:false) ile
            yükleniyor, hidrasyon riski yok. */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {BIRLIKLER.map((b) => {
            const [x, y] = b.yol[faz];
            const ust = b.taraf === 'hun';
            const dy = ust ? -(b.satir * 13 + 16) : b.satir * 13 + 10;
            return (
              <span
                key={b.id}
                className="absolute -translate-x-1/2 whitespace-nowrap text-[9px] font-bold tracking-wide sm:text-[11px]"
                style={{
                  left: `${(x / W) * 100}%`,
                  top: `${((y + dy) / H) * 100}%`,
                  color: b.renk,
                  opacity: gorunur(b),
                  textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                  transition: `left ${sure}s cubic-bezier(0.4,0,0.2,1), top ${sure}s cubic-bezier(0.4,0,0.2,1), opacity ${sure * 0.6}s ease`,
                }}
              >
                {b.kisa}
              </span>
            );
          })}

          {/* Sabit sahne etiketleri */}
          <span className="absolute text-[9px] font-bold tracking-wider sm:text-[11px]"
            style={{ left: '80%', top: '22%', color: 'rgba(232,222,208,0.6)', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
            SIRT
          </span>
          {ordugah && (
            <span className="absolute -translate-x-1/2 text-[9px] font-bold tracking-wider sm:text-[11px]"
              style={{ left: '35%', top: '70%', color: ACCENT, textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
              ARABA ORDUGÂHI
            </span>
          )}
          {kralDustu && (
            <span className="absolute -translate-x-1/2 text-[9px] font-bold tracking-wide sm:text-[11px]"
              style={{ left: '80%', top: '33%', color: BONE, textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
              I. THEODORIC · düştü
            </span>
          )}
          {takipYok && (
            <span className="absolute text-[10px] font-bold sm:text-[12px]"
              style={{ left: '24%', top: '61%', color: BONE, textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
              Aetius takip etmiyor
            </span>
          )}
          <span className="absolute right-3 bottom-2 font-mono text-[10px] font-bold text-white/55 sm:text-[13px]">
            {faz + 1}/{N}
          </span>
        </div>
      </div>

      {/* Faz şeridi — dokunma hedefi 44px, masaüstünde faz adı da görünüyor */}
      <div className="mt-3 flex gap-1">
        {CATALAUNUM.fazlar.map((p, i) => (
          <button
            key={p.id}
            onClick={() => { setOynuyor(false); setFaz(i); }}
            aria-label={`Faz ${i + 1}: ${p.ad}`}
            aria-pressed={faz === i}
            className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border px-1 font-mono text-[0.62rem] font-bold transition"
            style={{
              borderColor: faz === i ? ACCENT : 'rgba(255,255,255,0.12)',
              background: faz >= i ? `color-mix(in srgb, ${ACCENT} ${faz === i ? 20 : 8}%, transparent)` : 'rgba(255,255,255,0.02)',
              color: faz === i ? '#fff' : '#a8a29e',
            }}
          >
            <span>{i + 1}</span>
            <span className="hidden w-full truncate text-[0.5rem] font-normal opacity-70 sm:block">{buyuk(p.ad)}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 min-h-[104px] rounded-xl border border-white/10 bg-black/25 p-4" aria-live="polite">
        <div className="text-[0.72rem] font-bold tracking-[0.2em]" style={{ color: ACCENT }}>
          FAZ {faz + 1} · {buyuk(f.ad)}
        </div>
        <p className="mt-1.5 text-[0.88rem] leading-relaxed text-slate-300">{f.metin}</p>
      </div>

      <div className="mt-3 flex gap-2">
        <ActionButton
          onClick={() => { if (faz >= N - 1) setFaz(0); setOynuyor(!oynuyor); }}
          full
        >
          {oynuyor ? '⏸ Duraklat' : faz >= N - 1 ? '↺ Baştan oynat' : '▶ Oynat'}
        </ActionButton>
        <ActionButton onClick={() => { setOynuyor(false); setFaz(Math.max(0, faz - 1)); }} tone="ghost" disabled={faz === 0}>‹</ActionButton>
        <ActionButton onClick={() => { setOynuyor(false); setFaz(Math.min(N - 1, faz + 1)); }} tone="ghost" disabled={faz >= N - 1}>›</ActionButton>
      </div>

      {faz >= N - 1 && (
        <div className="mt-4 space-y-3" style={{ animation: 'atilla-fade 0.5s ease-out' }}>
          <div className="rounded-xl border p-4" style={{ borderColor: `${IRON}55`, background: 'rgba(255,255,255,0.03)' }}>
            <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: IRON }}>KARŞISINDAKİ ADAM</div>
            <p className="text-[0.86rem] leading-relaxed text-slate-300">{AETIUS.gecmis}</p>
            <p className="mt-2 text-[0.86rem] leading-relaxed" style={{ color: BONE }}>{AETIUS.ironi}</p>
          </div>
          <p className="text-[0.92rem] font-semibold leading-relaxed" style={{ color: ACCENT }}>{CATALAUNUM.sonuc}</p>
        </div>
      )}
    </WidgetFrame>
  );
}
