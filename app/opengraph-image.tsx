// Ana sayfanın paylaşım görseli (og:image + twitter:image).
//
// 2026-07-16: kart lib/og.tsx'e taşındı. Öncesinde bu dosya, fabrikayı KULLANMAYAN
// tek OG'ydi ve iki bedelini birden ödüyordu: (1) 2026-07-11 kimlik yenilemesinden
// önceki paleti taşıyordu, (2) Inter yüklenmediği için Türkçe glifler düşüyordu →
// kartta "BILIM · TARIH · KULTUR" yazıyordu. İkisi de taşınmayla çözüldü.
//
// Artık yalnız ANA SAYFAYI temsil ediyor: 32 makalenin 19'u da buraya düşüyordu,
// hepsine kendi kartı verildi (app/articles/<slug>/opengraph-image.tsx).
// Kartın metnini/paletini değiştirmek istiyorsan lib/og.tsx → rootOgImage().
import { rootOgImage, OG_SIZE } from '@/lib/og';

export const alt = 'Basements — Okumak yetmez. Oyna, karar ver, ölç, kuşkulan.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return rootOgImage();
}
