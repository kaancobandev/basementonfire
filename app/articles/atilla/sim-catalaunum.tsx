'use client';

// ─────────────────────────────────────────────────────────────────────────
// CATALAUNUM (451) — Aetius ve Atilla. Faz faz savaş animasyonu.
//
// NİYE ANİMASYON, NİYE OYUN DEĞİL: Mohaç'ta (kanuni) okur Macar tarafını
// OYNUYOR, çünkü orada öğretilecek şey bir hataydı — okur o hatayı kendi
// yapsın diye. Burada öğretilecek şey bir hata değil, bir DENGE: iki taraf da
// yıkılmıyor ve Aetius bunu bilerek böyle bırakıyor. Oynanabilir yapılsaydı
// okur "kazanmayı" arardı ve muharebenin asıl anlamı kaçardı.
//
// TEKNİK: hareket TAMAMEN CSS transition + React state. rAF YOK.
//   • Önizleme/arka plan sekmesinde rAF kısılıyor ([[preview-hidden-tab-frozen]]),
//     transition ise kısılsa bile son duruma OTURUYOR → faz her koşulda doğru.
//   • Otomatik oynatma tek bir setTimeout zinciri; unmount'ta temizleniyor.
//   • prefers-reduced-motion: otomatik oynatma KAPALI, geçişler 0 sn, okur
//     fazları elle geziyor. Bilgi kaybı yok.
// ─────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { ACCENT, BONE, GARNET, GOLD, IRON, WidgetFrame, ActionButton, buyuk, useReducedMotion } from './ui';
import { CATALAUNUM, AETIUS } from './data';

const N = CATALAUNUM.fazlar.length; // 7

/** Bir birliğin faz başına [x, y] konumu. Dizi uzunluğu N; ara değer yok, CSS taşıyor. */
type Yol = { ad: string; renk: string; adet: number; satir: number; yol: [number, number][] };

// Alan: 800×470. Üstte Hun hattı, altta Roma+Vizigot. Sırt sağ üstte.
const BIRLIKLER: Yol[] = [
  {
    ad: 'Atilla · merkez', renk: ACCENT, adet: 14, satir: 2,
    // dizil → ilerle → sırt kavgası sürerken merkez baskı → gece dağınık → ordugâha çekil
    yol: [[300, 150], [300, 172], [300, 196], [300, 214], [300, 226], [232, 262], [232, 262]],
  },
  {
    ad: 'Gepid · sağ kanat', renk: GARNET, adet: 9, satir: 1,
    yol: [[512, 150], [530, 168], [556, 158], [572, 176], [560, 200], [300, 268], [300, 268]],
  },
  {
    ad: 'Ostrogot · sol kanat', renk: GOLD, adet: 9, satir: 1,
    yol: [[128, 150], [128, 176], [128, 206], [136, 232], [140, 250], [176, 276], [176, 276]],
  },
  {
    ad: 'Aetius · Roma', renk: IRON, adet: 12, satir: 2,
    yol: [[150, 336], [150, 316], [150, 296], [150, 282], [150, 274], [150, 288], [150, 288]],
  },
  {
    ad: 'Alan · merkez', renk: '#6d7f8f', adet: 8, satir: 1,
    yol: [[320, 348], [320, 330], [320, 306], [318, 288], [316, 282], [330, 306], [330, 306]],
  },
  {
    ad: 'Vizigot · Theodoric', renk: BONE, adet: 11, satir: 2,
    // sırt icin yaris → sirti tut → yuksekten in → kral duser ama hat sertlesir
    yol: [[560, 350], [596, 326], [640, 226], [648, 200], [612, 214], [566, 246], [566, 246]],
  },
];

const KUTU = 11, ARA = 15;

export default function CatalaunumSim() {
  const [faz, setFaz] = useState(0);
  const [oynuyor, setOynuyor] = useState(false);
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
  const gece = faz >= 4;          // Faz 5: gece
  const kralDustu = faz >= 3;     // Faz 4: Theodoric
  const ordugah = faz >= 5;       // Faz 6: araba ordugâhı
  const takipYok = faz >= 6;      // Faz 7: Aetius bırakıyor

  return (
    <WidgetFrame
      hero
      kicker={`SAVAŞ ANİMASYONU · ${CATALAUNUM.yil} · CATALAUNUM`}
      title="Aetius ve Atilla"
      hint="Yedi faz. Oynat ya da fazları elle gez — her fazda sahnede ne değiştiğini altta okuyorsun."
      footnote={CATALAUNUM.yer}
    >
      <svg viewBox="0 0 800 470" className="w-full rounded-xl border border-white/10" style={{ background: '#0a0706' }}
        role="img" aria-label={`Catalaunum, faz ${faz + 1}: ${f.ad}. ${f.metin}`}>
        <defs>
          <linearGradient id="ac-ridge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="rgba(232,222,208,0.17)" />
            <stop offset="1" stopColor="rgba(232,222,208,0.03)" />
          </linearGradient>
        </defs>

        <rect width="800" height="470" fill="#0a0706" />

        {/* Sırt — muharebenin düğümü */}
        <path d="M520 60 L800 40 L800 210 L560 190 Z" fill="url(#ac-ridge)" />
        <path d="M520 60 L800 40" stroke="rgba(232,222,208,0.32)" strokeWidth="2" fill="none" />
        <text x="648" y="112" fill="rgba(232,222,208,0.55)" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">SIRT</text>

        {/* Araba ordugâhı (Faz 6) */}
        <g style={{ opacity: ordugah ? 1 : 0, transition: `opacity ${sure * 0.6}s ease` }}>
          <rect x="176" y="228" width="176" height="72" rx="8" fill="none" stroke={ACCENT} strokeWidth="2" strokeDasharray="7 5" />
          <text x="264" y="320" fill={ACCENT} fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">
            ARABA ORDUGÂHI
          </text>
        </g>

        {/* Birlikler */}
        {BIRLIKLER.map((b) => {
          const [x, y] = b.yol[faz];
          const perSatir = Math.ceil(b.adet / b.satir);
          return (
            <g key={b.ad} style={{ transform: `translate(${x}px, ${y}px)`, transition: `transform ${sure}s cubic-bezier(0.4,0,0.2,1)` }}>
              {Array.from({ length: b.adet }, (_, i) => {
                const r = Math.floor(i / perSatir), c = i % perSatir;
                return (
                  <rect key={i}
                    x={(c - (perSatir - 1) / 2) * ARA - KUTU / 2}
                    y={r * 13 - KUTU / 2}
                    width={KUTU} height="8" rx="2" fill={b.renk}
                    opacity={gece ? 0.5 : 0.92}
                    style={{ transition: `opacity ${sure}s ease` }}
                  />
                );
              })}
            </g>
          );
        })}

        {/* Theodoric düştü (Faz 4) */}
        <g style={{ opacity: kralDustu ? 1 : 0, transition: `opacity ${sure * 0.5}s ease` }}>
          <g transform="translate(648, 186)">
            <line x1="-9" y1="-9" x2="9" y2="9" stroke={GARNET} strokeWidth="3" />
            <line x1="9" y1="-9" x2="-9" y2="9" stroke={GARNET} strokeWidth="3" />
          </g>
          <text x="648" y="166" fill={GARNET} fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="system-ui, sans-serif">
            I. THEODORIC
          </text>
        </g>

        {/* Aetius takip etmiyor (Faz 7) */}
        <g style={{ opacity: takipYok ? 1 : 0, transition: `opacity ${sure * 0.6}s ease` }}>
          <path d="M150 276 L228 264" stroke={IRON} strokeWidth="2" strokeDasharray="6 6" fill="none" />
          <text x="150" y="252" fill={IRON} fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif">takip yok</text>
        </g>

        {/* Gece perdesi */}
        <rect width="800" height="470" fill="#050308"
          style={{ opacity: gece ? 0.46 : 0, transition: `opacity ${sure}s ease`, pointerEvents: 'none' }} />

        {/* Etiketler */}
        <text x="20" y="34" fill="rgba(226,98,43,0.85)" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">ATİLLA</text>
        <text x="20" y="452" fill="rgba(139,149,166,0.85)" fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">AETIUS + VİZİGOTLAR</text>
        <text x="780" y="452" fill="rgba(255,255,255,0.5)" fontSize="14" fontWeight="700" textAnchor="end" fontFamily="ui-monospace, monospace">
          {faz + 1}/{N}
        </text>
      </svg>

      {/* Faz şeridi */}
      <div className="mt-3 flex gap-1">
        {CATALAUNUM.fazlar.map((p, i) => (
          <button
            key={p.id}
            onClick={() => { setOynuyor(false); setFaz(i); }}
            aria-label={`Faz ${i + 1}: ${p.ad}`}
            aria-pressed={faz === i}
            className="h-9 flex-1 rounded-lg border font-mono text-[0.62rem] font-bold transition"
            style={{
              borderColor: faz === i ? ACCENT : 'rgba(255,255,255,0.12)',
              background: faz >= i ? `color-mix(in srgb, ${ACCENT} ${faz === i ? 20 : 8}%, transparent)` : 'rgba(255,255,255,0.02)',
              color: faz === i ? '#fff' : '#a8a29e',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="mt-3 min-h-[104px] rounded-xl border border-white/10 bg-black/25 p-4">
        <div className="text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: ACCENT }}>
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
