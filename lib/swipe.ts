/**
 * Karusel kaydırma kararı — SAF fonksiyon (DOM'a dokunmaz).
 *
 * Neden ayrı: kural "bir kaydırma = bir görsel" ve bunun DOĞRULANABİLİR olması
 * gerekiyordu. Bileşenin içinde gömülüyken tarayıcı ortamında ölçemedim
 * (önizleme sayfayı display:none render ediyor, genişlik 0 kalıyor). Saf
 * fonksiyon olarak node ile doğrudan sınanabiliyor.
 *
 * Kural: parmak ne kadar sürüklenirse sürüklensin hedef, başlangıç indeksinden
 * EN FAZLA 1 uzaklaşır. Eşik altındaki hareket "dokunuş" sayılır, indeks
 * değişmez. Sonuç her zaman [0, count-1] aralığına kırpılır.
 *
 * @param from       Sürükleme başladığındaki indeks
 * @param dx         Yatay yer değiştirme (px). Negatif = sola (ileri).
 * @param slideWidth Slayt genişliği (px)
 * @param count      Toplam slayt sayısı
 */
export function swipeTarget(from: number, dx: number, slideWidth: number, count: number): number {
  if (!Number.isFinite(dx) || !slideWidth || count <= 0) return from;

  // Eşik: slayt genişliğinin %15'i, en çok 60px. Küçük ekranda oransal,
  // büyük ekranda sabit kalsın diye.
  const threshold = Math.min(60, slideWidth * 0.15);

  const step = dx <= -threshold ? 1 : dx >= threshold ? -1 : 0;
  return Math.max(0, Math.min(count - 1, from + step));
}
