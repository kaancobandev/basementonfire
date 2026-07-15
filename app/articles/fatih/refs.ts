import type { BibItem } from '@/app/components/ArticleBibliography';

// Kaynakça — düz (client-olmayan) modül; page.tsx (JSON-LD citation) + Client ortak kaynağı.
//
// Kaynaklar taraflıdır ve bilerek yan yana konur: Kritovulos sultanın tarihçisidir
// ama Rum'dur; Dukas düşman kalemdir; Barbaro Venedikli, Tursun Bey Osmanlı. Zehir
// tezi (Heywood) KANITLANMAMIŞ dolaylı delildir. Otranto'nun düşüş tarihi bile
// kaynaklarda çelişir (26 Temmuz ↔ 11 Ağustos 1480). Doğrulama tezi burada başlar.
export const refs: BibItem[] = [
  {
    title: 'History of Mehmed the Conqueror (Fatih\'in Tarihi) — sultanın kendi tarihçisi; Truva ziyareti buradan',
    authors: 'Kritovulos (Michael Critobulus)',
    year: '~1467',
    source: 'Princeton University Press (C. T. Riggs çevirisi)',
  },
  {
    title: 'Historia Turco-Bizantina — Bizans perspektifi; Kerkoporta anlatısı',
    authors: 'Dukas',
    year: '15. yy',
    source: 'Wayne State University Press (H. J. Magoulias çevirisi)',
  },
  {
    title: 'Giornale dell\'assedio di Costantinopoli — kuşatma günlüğü; donanma sayıları',
    authors: 'Nicolò Barbaro',
    year: '1453',
    source: 'Venedikli gemi doktorunun gün gün tuttuğu günlük',
  },
  {
    title: 'Târîh-i Ebü\'l-Feth — olayda hazır bulunan Osmanlı kâtibi',
    authors: 'Tursun Bey',
    year: '~1488',
    source: 'Türkçe kroniği (Mertol Tulum yayını)',
  },
  {
    title: 'Fatih Sultan Mehmed ve Zamanı (standart modern biyografi)',
    authors: 'Franz Babinger',
    year: '1953',
    source: 'Mehmed the Conqueror and His Time, Princeton University Press',
  },
  {
    title: '"Mehmed II" maddesi',
    authors: 'Halil İnalcık',
    year: '',
    source: 'Encyclopædia Britannica (madde İnalcık\'a aittir)',
    url: 'https://www.britannica.com/biography/Mehmed-II-Ottoman-sultan',
  },
  {
    title: 'Osmanlı Kaynaklarına Göre Fatih Sultan Mehmed\'in Siyasî ve Askerî Faaliyeti',
    authors: 'Selâhattin Tansel',
    year: '1953',
    source: 'Türk Tarih Kurumu',
  },
  {
    title: 'Colin Heywood — Fatih\'in ölümü ve zehirlenme tezi (dolaylı delil; kanıtlanmamış)',
    authors: 'Colin Heywood',
    year: '',
    source: 'Osmanlı tarihi makaleleri',
  },
  {
    title: '1453: The Holy War for Constantinople (popüler ama sağlam; anlatı ritmi için model)',
    authors: 'Roger Crowley',
    year: '2005',
    source: 'Hyperion',
  },
  {
    title: '"Otranto Seferi" maddesi (düşüş tarihi çelişkisi)',
    authors: 'TDV İslâm Ansiklopedisi',
    year: '',
    source: 'İslam Ansiklopedisi',
    url: 'https://islamansiklopedisi.org.tr/otranto-seferi',
  },
  {
    title: 'Fatih Sultan Mehmed — Wikipedia (genel çerçeve; Truva, Akhilleus mezarı, İskender kıyası)',
    authors: 'Vikipedi',
    year: '',
    source: 'tr.wikipedia.org',
    url: 'https://tr.wikipedia.org/wiki/II._Mehmed',
  },
];
