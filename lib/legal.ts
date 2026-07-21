/**
 * VERİ SORUMLUSU — TEK KAYNAK (KVKK m. 10 / GDPR m. 13/1-a).
 *
 * Dört hukuki metin (/gizlilik, /aydinlatma, /acik-riza, /kosullar) bu dosyadan okur.
 * Bilgi değişirse SADECE BURAYI düzenle — yoksa metinler birbiriyle çelişir.
 *
 * ÖNEMLİ: "Basementonfire" bir MARKA/site adıdır, hukuken bir kişi değildir. KVKK
 * veri sorumlusunun KİMLİĞİNİ ister; bu yüzden gerçek kişinin adı yazılır.
 */
export const VERI_SORUMLUSU = {
  /** Hukuki kimlik — veri sorumlusu budur. */
  unvan: 'Kaan Çoban',

  /** 'gerçek kişi' | 'şahıs şirketi' | 'tüzel kişi' */
  tip: 'gerçek kişi',

  /** Marka / site adı (hukuki kimlikten AYRI). */
  marka: 'Basementonfire',
  alanAdi: 'basementonfire.com',

  /** Başvuru ve iletişim kanalı. */
  eposta: 'info@basementonfire.com',

  /**
   * Fiziksel adres BİLİNÇLİ OLARAK yayımlanmıyor.
   *
   * Gerekçe: şahsi proje; tek adres ev adresi olurdu. KVKK m.10 "kimlik" ister,
   * fiziksel adresi ŞART KOŞMAZ. Veri Sorumlusuna Başvuru Tebliği uyarınca, veri
   * sorumlusunun sistemindeki kayıtlı e-posta geçerli bir başvuru kanalıdır.
   *
   * Şirketleşirsen (şahıs/limited/A.Ş.) buraya iş adresini + MERSİS/vergi bilgisini
   * ekle — o durumda adres yayımlamak standart ve beklenendir.
   */
  adres: null as string | null,

  /** Tüzel kişi olunca doldurulacak (şimdilik yok). */
  mersis: null as string | null,
  vergiDairesiNo: null as string | null,
  kep: null as string | null,
} as const;
