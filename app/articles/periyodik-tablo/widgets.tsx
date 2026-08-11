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
      kicker="ŞEKLİN SEBEBİ · ORBİTALLER"
      title="Her blok neden tam o kadar sütun geniş?"
      hint="Aşağıdaki dört bloğa sırayla dokun: her biri bir orbital türü. Orbitalin kaba biçimini, kaç elektron alabildiğini ve tabloda kaç sütuna karşılık geldiğini görürsün. Sütun sayıları keyfî değil — s = 2, p = 6, d = 10, f = 14; tablonun genişliği doğrudan buradan çıkıyor."
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
  // ⚠ TELEFONDA KÜÇÜK KALIYORDU. viewBox genişliği sabit, SVG kabına göre
  // ölçekleniyor: 360 px'lik ekranda 620 birimlik kutu 0,58 ile çarpılıyordu,
  // yani 8 birimlik yazılar 4,6 px'e düşüyordu — okunmuyordu.
  // Çözüm kutuyu DARALTMAK: viewBox küçüldükçe aynı kapta her şey büyür.
  // 620 → 420 ile 375 px'lik telefonda yazı 3,8 px'den 7,7 px'e çıkıyor (ölçüldü).
  // Yazılar ayrıca 8 → 11, noktalar büyütüldü, grafik yükseltildi (190 → 235):
  // ekrandaki yükseklik 89 px'den ~164 px'e çıktı, testere dişi artık belirgin.
  //
  // ⚠ Dar viewBox tek başına MASAÜSTÜNÜ BOZARDI: orada kap ~700 px, ölçek 1,7'ye
  // fırlar ve eksen yazıları 19 px'lik başlıklara dönerdi. `max-w-[480px]` o ucu
  // kesiyor — mobilde büyüt, masaüstünde şişirme.
  const W = 420, H = 235, SOL = 40, SAG = 8, UST = 14, ALT = 34;
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

      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-[480px]" role="img"
        aria-label={`${t.label} değerinin atom numarasına göre değişimi: her periyotta tekrarlayan testere dişi desen`}>
        {[0, 0.5, 1].map((f) => (
          <line key={f} x1={SOL} y1={iy(enB * f)} x2={W - SAG} y2={iy(enB * f)} stroke="rgba(255,255,255,0.08)" />
        ))}
        <text x={SOL - 6} y={iy(enB) + 4} textAnchor="end" fontSize="11" fill="#7d8590">{tr(enB, 1)}</text>
        <text x={SOL - 6} y={iy(0) + 4} textAnchor="end" fontSize="11" fill="#7d8590">0</text>
        <path d={cizgi} fill="none" stroke={ACCENT} strokeWidth={2.2} strokeLinejoin="round" />
        {veri.map((d) => (
          <circle key={d.z} cx={ix(d.z)} cy={iy(d.v)} r={2.2} fill={BLOK[d.blok].color} />
        ))}
        {soy.map((d) => (
          <g key={d.z}>
            <circle cx={ix(d.z)} cy={iy(d.v)} r={4.4} fill="none" stroke="#fff" strokeWidth={1.2} opacity={0.7} />
            <text x={ix(d.z)} y={iy(d.v) - 9} textAnchor="middle" fontSize="11" fill="#e2e8f0">{d.s}</text>
          </g>
        ))}
        {alkali.map((d) => (
          <text key={d.z} x={ix(d.z)} y={iy(d.v) + 16} textAnchor="middle" fontSize="11" fill="#94a3b8">{d.s}</text>
        ))}
        <text x={SOL} y={H - 10} fontSize="11" fill="#7d8590">atom numarası →</text>
      </svg>

      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        {t.key === 'yaricap'
          ? 'Yarıçapta desen ters yönde: her periyodun başındaki alkali metal en şişkin, sonundaki soy gaz en küçüktür.'
          : 'Tepeler hep aynı sütunda: soy gazlar. Dipler de öyle: alkali metaller. Aynı sütun, aynı davranış — çünkü aynı dış kabuk.'}
      </p>
    </WidgetFrame>
  );
}

/* ══════════ 6 · Janet'nin sol-adım tablosu ══════════ */

// Sol-adım tablosunun kuruluşu: satırlar n+ℓ değerine göre ayrılır, her satır
// SAĞA DAYALIDIR ve HER ZAMAN s-bloğuyla biter. Satır uzunlukları 2, 2, 8, 8,
// 18, 18, 32, 32 — yani doldurma sırasının kendisi.
const JANET_SATIRLAR = [
  { bas: 1, uzunluk: 2 }, { bas: 3, uzunluk: 2 },
  { bas: 5, uzunluk: 8 }, { bas: 13, uzunluk: 8 },
  { bas: 21, uzunluk: 18 }, { bas: 39, uzunluk: 18 },
  { bas: 57, uzunluk: 32 }, { bas: 89, uzunluk: 32 },
];

// Blok VERİDEN değil KONUMDAN türetilir — sol-adım tablosunun tanımı budur.
// Satırın sonundan geriye doğru: son 2 = s, önceki 6 = p, önceki 10 = d, kalan 14 = f.
// Bunun bir yan sonucu var ve makaleyle doğrudan ilgili: bu tanım gereği lantan
// f-bloğunda, lutesyum d-bloğunda kalır — yani Janet'nin biçimi, 4. perdede
// anlatılan Sc-Y-Lu-Lr tarafını ima eder.
function janetBlok(i: number, uzunluk: number): BlokKey {
  const sagdan = uzunluk - 1 - i;
  if (sagdan < 2) return 's';
  if (sagdan < 8) return 'p';
  if (sagdan < 18) return 'd';
  return 'f';
}

const SEMBOL = new Map(ELEMENTLER.map((e) => [e.z, e.s]));

export function JanetTablosu() {
  const KW = 10, KH = 10, SOL = 20, UST = 4;   // hücre adımı + kenar boşlukları
  const gx = (c: number) => SOL + (c - 1) * KW;
  const gy = (r: number) => UST + (r - 1) * KH;

  // Blok bantları: f 1-14, d 15-24, p 25-30, s 31-32 (sağa dayalı 32 sütunda).
  const BANTLAR: { b: BlokKey; ilk: number; son: number }[] = [
    { b: 'f', ilk: 1, son: 14 }, { b: 'd', ilk: 15, son: 24 },
    { b: 'p', ilk: 25, son: 30 }, { b: 's', ilk: 31, son: 32 },
  ];

  return (
    <WidgetFrame
      kicker="ALTERNATİF BİÇİM"
      title="Charles Janet'nin “sol-adım” tablosu (1928)"
      hint="Aynı 118 element, başka bir dizilişte. Satırlar sağa dayalı ve hepsi s-bloğuyla bitiyor; sıralama doğrudan orbital doldurma sırasını izliyor. Lantanitler burada aşağı sarkmıyor — çünkü sarkma zaten kimyasal değil, sayfaya sığdırma kararıydı."
      footnote="Bloklar konumdan türetilmiştir (sol-adım tanımı gereği). Renkler makalenin blok paletiyle aynı."
    >
      <svg viewBox="0 0 344 122" className="w-full" role="img"
        aria-label="Janet'nin sol-adım periyodik tablosu: sekiz satır, hepsi sağa dayalı, soldan sağa f, d, p ve s blokları; lantanitler ayrı bir satıra sarkmıyor.">
        {JANET_SATIRLAR.map((sat, r) =>
          Array.from({ length: sat.uzunluk }, (_, i) => {
            const z = sat.bas + i;
            const c = 33 - sat.uzunluk + i;
            const blok = janetBlok(i, sat.uzunluk);
            const renk = BLOK[blok].color;
            const hayalet = z > 118;   // 119 ve 120: satırı tamamlayan, henüz yok
            return (
              <rect
                key={z} x={gx(c)} y={gy(r + 1)} width={KW - 1} height={KH - 1} rx={1.4}
                fill={renk} fillOpacity={hayalet ? 0 : 0.34}
                stroke={renk} strokeWidth={hayalet ? 0.7 : 0.5}
                strokeOpacity={hayalet ? 0.55 : 1}
                strokeDasharray={hayalet ? '1.6 1.4' : undefined}
              >
                <title>{hayalet ? `${z} · henüz sentezlenmedi` : `${z} · ${SEMBOL.get(z) ?? ''}`}</title>
              </rect>
            );
          }),
        )}

        {/* Sol kenar: satırı belirleyen n+ℓ değeri */}
        {JANET_SATIRLAR.map((_, r) => (
          <text key={r} x={SOL - 4} y={gy(r + 1) + 6.6} textAnchor="end" fontSize="5" fill="#7d8590">{r + 1}</text>
        ))}
        <text x={SOL - 4} y={gy(9) + 4} textAnchor="end" fontSize="4.4" fill="#5c6370">n+ℓ</text>

        {/* Alt kenar: blok bantları ve kapasiteleri */}
        {BANTLAR.map(({ b, ilk, son }) => (
          <g key={b}>
            <rect x={gx(ilk)} y={gy(9) + 1} width={(son - ilk + 1) * KW - 1} height={3.4} rx={1.2}
              fill={BLOK[b].color} fillOpacity={0.55} />
            <text x={gx(ilk) + ((son - ilk + 1) * KW - 1) / 2} y={gy(9) + 12} textAnchor="middle"
              fontSize="6" fontWeight={700} fill={BLOK[b].color}>{b}</text>
            <text x={gx(ilk) + ((son - ilk + 1) * KW - 1) / 2} y={gy(9) + 18.5} textAnchor="middle"
              fontSize="4.6" fill="#7d8590">{(son - ilk + 1)} sütun</text>
          </g>
        ))}
      </svg>

      <p className="mt-4 text-sm leading-relaxed text-slate-300">
        Karşılaştır: bu yazının başındaki tabloda lantanitler ana gövdenin altında ayrı bir
        şeritte duruyor. Burada durmuyorlar — <strong className="text-white">7. satırın
        solunda</strong>, ait oldukları yerdeler. Fark kimyada değil, sayfa genişliğinde:
        alışıldık tablo 18 sütuna sığsın diye f-bloğu aşağı indirilir, Janet indirmez ve
        32 sütun basar.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        Bedeli de var, o yüzden yaygınlaşmadı. Helyum burada berilyumun üstüne, s-bloğuna
        oturuyor — orbital doldurma açısından doğru, ama helyum kimyasal olarak bir soy gaz
        ve okurun onu neonun üstünde görmesi beklenir. Ayrıca 32 sütun bir sınıf duvarına da,
        bir kitap sayfasına da zor sığar. Yani iki tablo arasındaki seçim bir doğruluk
        meselesi değil, <em>neyi öne çıkarmak istediğin</em> meselesi.
      </p>
    </WidgetFrame>
  );
}
