// ÜRETİLMİŞ DOSYA — elle düzenleme.
// Kaynak: scripts/sitemap-tarihleri.mjs · git geçmişinden okunur.
// Yeniden üret:  node scripts/sitemap-tarihleri.mjs
//
// Sitemap'teki lastModified bu tarihlerden gelir. Öncesinde her URL
// "new Date()" yazıyordu; harita saatte bir yenilendiği için tüm sayfalar
// sürekli "az önce değişti" diyordu ve Google bu sinyali yok sayıyordu.

export const MAKALE_TARIH: Record<string, string> = {
  "black-hole": "2026-08-06T21:43:17+03:00",
  "turkler": "2026-08-06T21:43:17+03:00",
  "atilla": "2026-08-06T10:17:21+03:00",
  "rome": "2026-08-13T20:03:58+03:00",
  "greece": "2026-08-06T21:43:17+03:00",
  "carthage": "2026-08-06T21:43:17+03:00",
  "ekonomi": "2026-08-06T21:43:17+03:00",
  "enflasyon": "2026-08-13T20:03:58+03:00",
  "einstein-rosen": "2026-08-06T21:43:17+03:00",
  "arcade": "2026-08-06T21:43:17+03:00",
  "tibbi": "2026-08-06T21:43:17+03:00",
  "internet": "2026-08-13T20:03:58+03:00",
  "pirus": "2026-08-06T10:43:58+03:00",
  "takyon": "2026-08-06T10:20:20+03:00",
  "tardigrad": "2026-08-06T10:43:58+03:00",
  "bagirsak": "2026-08-06T10:43:58+03:00",
  "bakteriyofaj": "2026-08-06T10:43:58+03:00",
  "endosimbiyoz": "2026-08-06T10:43:58+03:00",
  "kaligrafi": "2026-08-13T20:03:58+03:00",
  "doppler": "2026-08-06T10:43:58+03:00",
  "dogal-secilim": "2026-08-06T10:17:21+03:00",
  "dunya": "2026-08-06T10:17:21+03:00",
  "newton": "2026-08-06T10:17:21+03:00",
  "bilgisayar": "2026-08-13T20:03:58+03:00",
  "cift-yarik": "2026-08-06T10:17:21+03:00",
  "kuantum-olumsuzlugu": "2026-08-06T10:17:21+03:00",
  "periyodik-tablo": "2026-08-13T20:03:58+03:00",
  "mol": "2026-08-06T10:17:21+03:00",
  "fizik-101": "2026-08-06T10:43:58+03:00",
  "sanat-akimlari": "2026-08-06T10:17:21+03:00",
  "radyoaktivite": "2026-08-06T10:17:21+03:00",
  "ayna-noronlari": "2026-08-06T21:43:17+03:00",
  "sezar": "2026-08-06T10:17:21+03:00",
  "augustus": "2026-08-06T10:17:21+03:00",
  "kanuni": "2026-08-06T10:17:21+03:00",
  "fatih": "2026-08-06T10:17:21+03:00"
};

export const SAYFA_TARIH: Record<string, string> = {
  "/": "2026-08-14T18:16:03+03:00",
  "/discover": "2026-08-14T18:16:03+03:00",
  "/akis": "2026-08-10T17:15:43+03:00",
  "/reels": "2026-08-14T18:16:03+03:00",
  "/muzik": "2026-07-28T16:38:37+03:00",
  "/lig": "2026-08-14T18:16:03+03:00",
  "/hakkimizda": "2026-07-29T19:12:46+03:00",
  "/teknoloji": "2026-07-29T19:12:46+03:00",
  "/yol-haritasi": "2026-07-29T19:21:17+03:00",
  "/iletisim": "2026-07-29T20:27:41+03:00",
  "/basin": "2026-07-29T21:28:56+03:00",
  "/en": "2026-07-29T19:12:46+03:00",
  "/gizlilik": "2026-07-21T16:39:36+03:00",
  "/kosullar": "2026-07-21T16:39:36+03:00",
  "/aydinlatma": "2026-07-21T16:39:36+03:00",
  "/acik-riza": "2026-07-21T16:39:36+03:00"
};

/** Bilinmeyen rota için güvenli geri düşüş: dosyanın üretildiği an. */
export const URETIM_TARIHI = '2026-08-14T15:16:21.765Z';
