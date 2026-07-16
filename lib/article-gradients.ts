// Her makalenin İMZA GRADYANI — tek kaynak (registry).
// Önceden app/discover/DiscoverClient.tsx içinde yerel bir sabitti; ana sayfa
// landing'i de (sunucu bileşeni) aynı haritayı kullandığı için buraya çıkarıldı.
// Düz modül ('use client' YOK) → hem sunucu hem istemci import edebilir.
//
// Kullanım: kart zemini / hero ışıması. Değerler makalenin İÇERİĞİYLE ilişkili
// (kara delik = mor-lacivert, Kartaca = deniz-mor); marka paleti DEĞİL — makale
// editöryel renkleri kasıtlıdır, tokene bağlanmaz ([[design-token-system]]).

export const ARTICLE_GRADIENTS: Record<string, string> = {
  'black-hole': 'linear-gradient(135deg,#1e1b4b,#4c1d95)',
  'turkler': 'linear-gradient(135deg,#7f1d1d,#b45309)',
  'rome': 'linear-gradient(135deg,#7f1d1d,#9a3412)',
  'greece': 'linear-gradient(135deg,#1e3a8a,#0369a1)',
  'carthage': 'linear-gradient(135deg,#0f766e,#6d28d9)',
  'ekonomi': 'linear-gradient(135deg,#065f46,#15803d)',
  'einstein-rosen': 'linear-gradient(135deg,#4c1d95,#0e7490)',
  'arcade': 'linear-gradient(135deg,#be185d,#7c3aed)',
  'tibbi': 'linear-gradient(135deg,#0e7490,#1d4ed8)',
  'internet': 'linear-gradient(135deg,#1e40af,#0e7490)',
  'pirus': 'linear-gradient(135deg,#78350f,#991b1b)',
  'takyon': 'linear-gradient(135deg,#6d28d9,#2563eb)',
  'tardigrad': 'linear-gradient(135deg,#0e7490,#15803d)',
  'bagirsak': 'linear-gradient(135deg,#be123c,#0f766e)',
  'bakteriyofaj': 'linear-gradient(135deg,#15803d,#0d9488)',
  'endosimbiyoz': 'linear-gradient(135deg,#b45309,#6d28d9)',
  'kaligrafi': 'linear-gradient(135deg,#92400e,#57534e)',
  'doppler': 'linear-gradient(135deg,#2563eb,#b91c1c)',
  'dogal-secilim': 'linear-gradient(135deg,#059669,#65a30d)',
  'dunya': 'linear-gradient(135deg,#0c4a6e,#0891b2)',
  'newton': 'linear-gradient(135deg,#312e81,#b45309)',
  'bilgisayar': 'linear-gradient(135deg,#0e3a4a,#6d28d9)',
  'cift-yarik': 'linear-gradient(135deg,#3b0764,#0e7490)',
  'kuantum-olumsuzlugu': 'linear-gradient(135deg,#1e1b4b,#0f766e)',
  'mol': 'linear-gradient(135deg,#78350f,#f59e0b)',
  'fizik-101': 'linear-gradient(135deg,#2563eb,#f59e0b)',
  'sanat-akimlari': 'linear-gradient(135deg,#6b0f2a,#e11d48)',
  'radyoaktivite': 'linear-gradient(135deg,#1a2e05,#65a30d)',
  // ── 2026-07-16'da eklendi: bu dördü FALLBACK (jenerik mor) alıyordu, yani
  // en yeni makaleler keşifte kimliksiz görünüyordu. Değerler uydurulmadı;
  // makalelerin KENDİ opengraph-image paletlerinden türetildi.
  'sezar': 'linear-gradient(135deg,#4c0519,#9f1239)', // OG accent #e11d48 — kan/obsidyen
  'augustus': 'linear-gradient(135deg,#2a1f4a,#6d5ba6)', // OG accent #c9a44e — porfir/mermer
  'fatih': 'linear-gradient(135deg,#16224d,#3a56b0)', // OG accent #4d7cff — gece-mavisi/obsesyon
  'ayna-noronlari': 'linear-gradient(135deg,#1e293b,#7c3aed)', // OG'si yok — ayna gümüşü → nöron moru
};

export const FALLBACK_GRADIENT = 'linear-gradient(135deg,#6366f1,#8b5cf6)';

/** Makalenin imza gradyanı; kayıtlı değilse jenerik fallback. */
export const gradientFor = (slug: string): string => ARTICLE_GRADIENTS[slug] ?? FALLBACK_GRADIENT;
