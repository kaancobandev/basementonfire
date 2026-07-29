/**
 * SOSYAL MEDYA HESAPLARI — TEK KAYNAK.
 *
 * Üç yerde okunur: /basin (basın kiti), /iletisim ve ana sayfadaki Organization
 * JSON-LD'sinin `sameAs` alanı. Yeni hesap açarsan SADECE burayı düzenle.
 *
 * NEDEN `sameAs` ÖNEMLİ: Google'a "bu profiller aynı markaya ait" der. Marka
 * adı arandığında sağdaki bilgi panelinin ve doğru profillerin eşleşmesi bu
 * düğüme bağlıdır. Yanlış/ölü URL koymak sinyali zayıflatır → hesap kapanırsa
 * satırı SİL, boş bırakma.
 *
 * ⚠ URL'ler MUTLAK ve https olmalı (sameAs göreli yol kabul etmez).
 */
export type SosyalHesap = {
  ad: string;
  kullaniciAdi: string;
  url: string;
};

export const SOSYAL: SosyalHesap[] = [
  {
    ad: 'Instagram',
    kullaniciAdi: '@basementonfireofficial',
    url: 'https://www.instagram.com/basementonfireofficial/',
  },
  {
    ad: 'Facebook',
    kullaniciAdi: 'Basementonfireofficial',
    url: 'https://www.facebook.com/Basementonfireofficial',
  },
];

/** JSON-LD `sameAs` için düz URL dizisi. */
export const SOSYAL_URLLER: string[] = SOSYAL.map((s) => s.url);
