// ─────────────────────────────────────────────────────────────────────────
// HERO 3D PERFORMANS KORUMASI (ogl + three.js hero'larının ortak modülü)
//
// Neden: eski/zayıf telefonlarda ağır hero sahnesi ilk ekranda kasabilir.
// IntersectionObserver zaten hero ekrandan çıkınca rAF'ı durduruyor, ama asıl
// risk KAYDIRMADAN ÖNCEKİ ilk ekran. Burada iki katman var:
//
//   1) CİHAZ SINIFI (deviceTier): çekirdek/bellek/dokunmatik+küçük ekran ile
//      kaba bir sınıf; sahneler buna göre daha ucuz kurulur (dpr, geometri
//      yoğunluğu, parçacık sayısı, pahalı materyal katmanları).
//   2) FPS BEKÇİSİ (makeFpsGuard): TAHMİN DEĞİL, cihazın kendi kare süresini
//      ölçer. Yavaşsa önce çözünürlüğü düşürür; hâlâ yavaşsa animasyonu
//      DONDURUR (son kare durur → hero hâlâ güzel bir durağan görsel).
//
// Böylece hiçbir cihazda donma yaşanmaz; karar o cihazın ölçümüyle verilir.
// ─────────────────────────────────────────────────────────────────────────

export type Tier = 'low' | 'mid' | 'high';

/** Kaba cihaz sınıfı. Tarayıcı ipuçları eksikse güvenli tarafta ('mid') kalır. */
export function deviceTier(): Tier {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return 'mid';
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 520;
  if (cores <= 4 || mem <= 4) return coarse || small ? 'low' : 'mid';
  if (coarse && small) return 'mid';
  return 'high';
}

/** Sınıfa göre piksel oranı tavanı (retina'da bile boşuna 4× piksel boyamayalım). */
export function dprCap(tier: Tier): number {
  return tier === 'low' ? 1 : tier === 'mid' ? 1.5 : 1.75;
}

/**
 * Kare süresi bekçisi. Her karede `tick(now)` çağır.
 *
 * ISINMA (WARMUP): ilk 60 kare SAYILMAZ. Ölçüm penceresi mount anında başlar —
 * yani tam hidrasyon + görsel çözme + GSAP kurulumu sırasında. O kareler her
 * cihazda yavaştır; ölçseydik sağlam telefonları da haksız yere kısıtlardık.
 *
 * AYKIRI DEĞER: 200ms'i aşan kare aralığı çizim maliyeti değildir (sekme
 * kısıtlaması, GC, kaydırma takılması) → ortalamayı kirletmesin diye atılır.
 *
 * Sonra 90 karelik pencerelerde ortalama:
 *   >26ms (<38fps)        → onLowerRes()  (bir kez)
 *   ardından >30ms (<33fps) → onFreeze()  (bir kez; animasyon durur)
 * Hızlıysa hiçbir şey yapmaz.
 */
export function makeFpsGuard(onLowerRes: () => void, onFreeze: () => void) {
  const WARMUP = 60, WINDOW = 90, MAX_DT = 200;
  let last = 0, acc = 0, n = 0, warm = 0, stage = 0;
  return function tick(now: number) {
    if (stage >= 2) return;
    const dt = last ? now - last : 0;
    last = now;
    if (!dt || dt > MAX_DT) return;      // ilk kare / aykırı değer
    if (warm < WARMUP) { warm++; return; } // sayfa otursun
    acc += dt; n++;
    if (n < WINDOW) return;
    const avg = acc / n;
    acc = 0; n = 0;
    if (stage === 0) {
      if (avg > 26) { stage = 1; onLowerRes(); }
    } else if (avg > 30) {
      stage = 2; onFreeze();
    }
  };
}
