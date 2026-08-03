'use client';

// Enflasyon makalesinin üç interaktif parçası. KATMAN B KURALI: saf React + SVG.
// WebGL yok, canvas yok, GSAP yok, harici grafik kütüphanesi yok.
//
// ⚠ SAYI BİÇİMİ: toLocaleString('tr-TR') KULLANILMIYOR. Locale biçimlendirmesi
// ICU verisine bağlı ve sunucu ile tarayıcı ayrı çıktı verirse hidrasyon kırılır
// (projede daha önce yaşandı). Aşağıdaki tr()/trBin() deterministik.

import { useState } from 'react';

const tr = (n: number, d = 1) => n.toFixed(d).replace('.', ',');
const trBin = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const kis = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

// ══════════════════════════════════════════════════════════════════════════
// VERİ — TÜİK, Tüketici Fiyat Endeksi, Temmuz 2026 (yıllık değişim).
//
// Bültende AÇIKÇA yazan üç grup: yıllık oran + enflasyona katkı puanı.
//   Gıda ve alkolsüz içecekler  %37,53   8,94 puan
//   Konut, su, elektrik, gaz    %40,32   5,21 puan
//   Ulaştırma                   %30,83   5,22 puan
//   Genel TÜFE                  %31,75
//
// AĞIRLIKLAR TÜRETİLDİ, UYDURULMADI: katkı = ağırlık × oran olduğundan
// ağırlık = katkı ÷ oran →  8,94/37,53 = %23,82 · 5,21/40,32 = %12,92
//                           5,22/30,83 = %16,93
// Kalan ağırlık 100 − 53,67 = %46,33 ve kalan katkı 31,75 − 19,37 = 12,38 puan
// → "diğer her şey"in örtük yıllık oranı 12,38 / 0,4633 = %26,72.
//
// DOĞRULAMA (bu dördü çarpılıp toplandığında açıklanan genel orana dönmeli):
//   0,2382×37,53 + 0,1292×40,32 + 0,1693×30,83 + 0,4633×26,72 = 31,748 ≈ 31,75 ✓
// ══════════════════════════════════════════════════════════════════════════

export const RESMI_TUFE = 31.75;

type Grup = { ad: string; kisa: string; agirlik: number; oran: number; katki: number; renk: string };

export const GRUPLAR: Grup[] = [
  { ad: 'Gıda ve alkolsüz içecekler', kisa: 'Gıda', agirlik: 23.82, oran: 37.53, katki: 8.94, renk: '#e8a33d' },
  { ad: 'Konut, su, elektrik, gaz', kisa: 'Konut ve enerji', agirlik: 12.92, oran: 40.32, katki: 5.21, renk: '#d97757' },
  { ad: 'Ulaştırma', kisa: 'Ulaşım', agirlik: 16.93, oran: 30.83, katki: 5.22, renk: '#6ea8d8' },
  { ad: 'Diğer her şey', kisa: 'Diğer', agirlik: 46.33, oran: 26.72, katki: 12.38, renk: '#8b93a1' },
];

// ══════════════════════════════════════════════════════════════════════════
// 1) SEPET — hangi grup enflasyonun kaç puanını taşıyor?
// ══════════════════════════════════════════════════════════════════════════

export function SepetKatki() {
  const enBuyukKatki = Math.max(...GRUPLAR.map((g) => g.katki));

  return (
    <figure className="enf-w">
      <figcaption className="enf-w-baslik">
        <span className="enf-w-etiket">SEPET</span>
        Yıllık enflasyonun {tr(RESMI_TUFE, 2)} puanı nereden geliyor?
      </figcaption>

      <div className="enf-bar-liste">
        {GRUPLAR.map((g) => (
          <div className="enf-bar-satir" key={g.kisa}>
            <div className="enf-bar-ad">
              <span>{g.ad}</span>
              <span className="enf-bar-agirlik">sepetin %{tr(g.agirlik)}&apos;i</span>
            </div>
            <div className="enf-bar-yol">
              <div
                className="enf-bar-dolu"
                style={{ width: `${(g.katki / enBuyukKatki) * 100}%`, background: g.renk }}
              />
            </div>
            <div className="enf-bar-sayi">
              <strong style={{ color: g.renk }}>{tr(g.katki, 2)}</strong>
              <span>puan · yıllık %{tr(g.oran, 2)}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="enf-w-not">
        Bir grubun enflasyona katkısı, sepetteki ağırlığı ile kendi fiyat artışının çarpımıdır.
        Konut kalemi en hızlı pahalanan grup olduğu hâlde (%{tr(40.32, 2)}) toplam katkısı gıdanın
        altında kalıyor — çünkü sepetteki ağırlığı gıdanın yarısından az.
      </p>
      <p className="enf-w-kaynak">
        Kaynak: TÜİK, Tüketici Fiyat Endeksi, Temmuz 2026. Ağırlıklar bültendeki katkı
        puanı ile yıllık orandan türetildi; &quot;diğer her şey&quot; kalan gruplarin toplamıdır.
      </p>
    </figure>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// 2) SENİN ENFLASYONUN — kişisel sepet hesaplayıcı
//
// Kişisel enflasyon = Σ (senin ağırlığın × o grubun resmî yıllık oranı).
// Başlangıç değerleri TÜİK'in kendi ağırlıkları olduğu için widget açıldığında
// sonuç resmî orana denk düşer; okur kaydırdıkça kendi hayatına ayrışır.
// ══════════════════════════════════════════════════════════════════════════

export function KisiselEnflasyon() {
  const [agirliklar, setAgirliklar] = useState<number[]>(GRUPLAR.map((g) => g.agirlik));

  // Bir kalem değişince kalanlar, aralarındaki oranı koruyarak 100'e tamamlanır.
  const ayarla = (i: number, ham: number) => {
    const v = kis(ham, 0, 100);
    const digerToplam = agirliklar.reduce((a, w, j) => (j === i ? a : a + w), 0);
    const kalan = 100 - v;
    setAgirliklar(
      agirliklar.map((w, j) => {
        if (j === i) return v;
        if (digerToplam === 0) return kalan / (agirliklar.length - 1);
        return (w * kalan) / digerToplam;
      }),
    );
  };

  const kisisel = agirliklar.reduce((a, w, i) => a + (w / 100) * GRUPLAR[i].oran, 0);
  const fark = kisisel - RESMI_TUFE;
  const sifirla = () => setAgirliklar(GRUPLAR.map((g) => g.agirlik));

  return (
    <figure className="enf-w">
      <figcaption className="enf-w-baslik">
        <span className="enf-w-etiket">HESAPLA</span>
        Senin sepetin neye benziyor?
      </figcaption>

      <p className="enf-w-yonerge">
        Aylık harcamanı dört kaleme dağıt. Başlangıç değerleri TÜİK&apos;in ortalama hane
        sepetidir — kaydırdıkça kendi hayatına ayrışır.
      </p>

      <div className="enf-kaydirici-liste">
        {GRUPLAR.map((g, i) => (
          <div className="enf-kaydirici" key={g.kisa}>
            <label className="enf-kaydirici-ust" htmlFor={`enf-k-${i}`}>
              <span>
                <span className="enf-nokta" style={{ background: g.renk }} aria-hidden="true" />
                {g.kisa}
              </span>
              <strong style={{ color: g.renk }}>%{tr(agirliklar[i])}</strong>
            </label>
            <input
              id={`enf-k-${i}`}
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(agirliklar[i])}
              onChange={(e) => ayarla(i, Number(e.target.value))}
              aria-label={`${g.ad} harcama payı, yüzde`}
              aria-valuetext={`yüzde ${tr(agirliklar[i])}`}
              style={{ accentColor: g.renk }}
            />
          </div>
        ))}
      </div>

      <div className="enf-sonuc">
        <div className="enf-sonuc-kutu">
          <span className="enf-sonuc-etiket">Senin enflasyonun</span>
          <strong className="enf-sonuc-buyuk">%{tr(kisisel)}</strong>
        </div>
        <div className="enf-sonuc-ayrac" aria-hidden="true" />
        <div className="enf-sonuc-kutu">
          <span className="enf-sonuc-etiket">Resmî TÜFE (Temmuz 2026)</span>
          <strong className="enf-sonuc-orta">%{tr(RESMI_TUFE, 2)}</strong>
        </div>
      </div>

      <p className={`enf-fark ${Math.abs(fark) < 0.35 ? 'enf-fark-notr' : ''}`}>
        {Math.abs(fark) < 0.35
          ? 'Senin sepetin şu an ortalama haneye çok yakın.'
          : fark > 0
            ? `Senin sepetin resmî ortalamadan ${tr(Math.abs(fark))} puan daha hızlı pahalanıyor.`
            : `Senin sepetin resmî ortalamadan ${tr(Math.abs(fark))} puan daha yavaş pahalanıyor.`}
      </p>

      <button type="button" className="enf-sifirla" onClick={sifirla}>
        Ortalama haneye dön
      </button>

      <p className="enf-w-kaynak">
        Bu bir tahmindir, resmî bir ölçüm değil: grup içi oranlar herkes için aynı varsayılıyor,
        oysa aynı kalemde bile ne aldığın fiyat artışını değiştirir. Grup oranları TÜİK Temmuz
        2026 bülteninden alınmıştır.
      </p>
    </figure>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// 3) ALIM GÜCÜ — bileşik etki ve yarılanma süresi
// ══════════════════════════════════════════════════════════════════════════

const YILLAR = [1, 5, 10, 20];

export function AlimGucu() {
  const [oran, setOran] = useState(Math.round(RESMI_TUFE));

  const r = oran / 100;
  const deger = (t: number) => 100 / Math.pow(1 + r, t);
  // Gerçek yarılanma: ln2 / ln(1+r).  70 kuralı: 70 / oran — bir YAKLAŞIM.
  const gercekYari = r > 0 ? Math.log(2) / Math.log(1 + r) : Infinity;
  const kural70 = oran > 0 ? 70 / oran : Infinity;

  // SVG eğrisi: 0–20 yıl, 100 TL'nin bugünkü karşılığı.
  const G = { w: 320, h: 132, sol: 34, sag: 8, ust: 10, alt: 22 };
  const ix = (t: number) => G.sol + (t / 20) * (G.w - G.sol - G.sag);
  const iy = (v: number) => G.ust + (1 - v / 100) * (G.h - G.ust - G.alt);
  const nokta = Array.from({ length: 61 }, (_, k) => {
    const t = (k / 60) * 20;
    return `${ix(t).toFixed(1)},${iy(deger(t)).toFixed(1)}`;
  }).join(' ');

  return (
    <figure className="enf-w">
      <figcaption className="enf-w-baslik">
        <span className="enf-w-etiket">BİLEŞİK ETKİ</span>
        100 lira, yıllar içinde ne kadar kalır?
      </figcaption>

      <div className="enf-kaydirici enf-kaydirici-tek">
        <label className="enf-kaydirici-ust" htmlFor="enf-oran">
          <span>Yıllık enflasyon</span>
          <strong style={{ color: 'var(--c1)' }}>%{oran}</strong>
        </label>
        <input
          id="enf-oran"
          type="range"
          min={1}
          max={120}
          step={1}
          value={oran}
          onChange={(e) => setOran(Number(e.target.value))}
          aria-label="Yıllık enflasyon oranı, yüzde"
          style={{ accentColor: 'var(--c1)' }}
        />
        <div className="enf-kaydirici-iz">
          <span>%1</span>
          <span>%120</span>
        </div>
      </div>

      <svg className="enf-grafik" viewBox={`0 0 ${G.w} ${G.h}`} role="img"
        aria-label={`Yüzde ${oran} enflasyonda 100 liranın alım gücü 20 yıl boyunca azalarak ${tr(deger(20))} liraya iner.`}>
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={G.sol} y1={iy(v)} x2={G.w - G.sag} y2={iy(v)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <text x={G.sol - 6} y={iy(v) + 3} textAnchor="end" fontSize="7" fill="#8b93a1">{v}</text>
          </g>
        ))}
        {[0, 5, 10, 15, 20].map((t) => (
          <text key={t} x={ix(t)} y={G.h - 7} textAnchor="middle" fontSize="7" fill="#8b93a1">{t}</text>
        ))}
        <polyline points={nokta} fill="none" stroke="var(--c1)" strokeWidth="2" strokeLinejoin="round" />
        {Number.isFinite(gercekYari) && gercekYari <= 20 && (
          <g>
            <line x1={ix(gercekYari)} y1={iy(50)} x2={ix(gercekYari)} y2={G.h - G.alt}
              stroke="#d97757" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={ix(gercekYari)} cy={iy(50)} r="3" fill="#d97757" />
          </g>
        )}
      </svg>

      <div className="enf-yil-izgara">
        {YILLAR.map((t) => (
          <div className="enf-yil" key={t}>
            <span className="enf-yil-ust">{t} yıl sonra</span>
            <strong>{tr(deger(t))} ₺</strong>
          </div>
        ))}
      </div>

      <div className="enf-yari">
        <div>
          <span className="enf-sonuc-etiket">Gerçek yarılanma süresi</span>
          <strong className="enf-sonuc-orta">{tr(gercekYari)} yıl</strong>
        </div>
        <div>
          <span className="enf-sonuc-etiket">70 kuralının dediği</span>
          <strong className="enf-sonuc-orta enf-soluk">{tr(kural70)} yıl</strong>
        </div>
      </div>

      <p className="enf-w-not">
        70 kuralı bir <em>kısayol</em>: düşük oranlarda neredeyse birebir tutar, yüksek oranlarda
        sapar. Kaydırıcıyı %5&apos;e getirip iki sayıyı karşılaştır, sonra %80&apos;e çek — makas
        oran büyüdükçe açılıyor.
      </p>
    </figure>
  );
}
