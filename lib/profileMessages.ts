import { MIN_AGE } from './age';

/**
 * Profil düzenleme hata mesajları — KOD tabanlı.
 *
 * NEDEN VAR (23.08.2026 denetimi, İKİNCİ TUR): `lib/authMessages.ts` bu sorunu
 * /login için zaten çözmüş ve gerekçesini de yazmıştı, ama İKİ SAYFA atlanmıştı:
 * `/profile` ve `/forgot-password` hâlâ `?error=` içeriğini OLDUĞU GİBİ
 * basıyordu. Ölçüldü (yerel, düzeltmeden önce):
 *
 *   /forgot-password?error=Hesabiniz+askiya+alindi+0555+555+55+55
 *     → HTTP 200, metin sitenin KENDİ hata kutusunda birebir göründü.
 *
 * React HTML'i kaçırdığı için bu XSS değil; kimlik avı zemini. Saldırganın
 * yazdığı cümle sitenin gerçek alan adında, gerçek stilinde, "uyarı" kutusunda
 * çıkıyor. /profile'da kullanıcı ÜSTELİK GİRİŞLİ — yani en ikna edici hâli.
 *
 * İKİNCİ HATA, aynı satırda: `decodeURIComponent(error)`. Next zaten çözülmüş
 * searchParams veriyor, yani bu ÇİFT ÇÖZME idi. Ölçüldü: `?error=%25` ve
 * `?error=%E0%A4%A` → HTTP 500. Yani parametre aynı zamanda çökertme aracıydı.
 * Kod tabanlı yolda decodeURIComponent hiç yok, ikisi birden kapandı.
 *
 * Bazı mesajlar SAYI taşıyor ("5 saat sonra"). Sayı ayrı bir parametrede
 * geliyor ve tam sayı olarak doğrulanıp sınırlanıyor → serbest metin yok.
 */

const SABIT: Record<string, string> = {
  ad_uzunluk:    'İsim 1-50 karakter olmalı.',
  bio_uzun:      'Bio en fazla 160 karakter olabilir.',
  kullanici_yok: 'Kullanıcı bulunamadı.',
  ad_format:     'Kullanıcı adı 3-30 karakter olmalı; sadece küçük harf, rakam ve alt çizgi (_) içerebilir.',
  ad_alinmis:    'Bu kullanıcı adı zaten alınmış. Başka birini dene.',
  dogum_bos:     'Doğum tarihi boş bırakılamaz.',
  dogum_gecersiz:'Geçerli bir doğum tarihi gir.',
  yas_kucuk:     `En az ${MIN_AGE} yaşında olmalısın.`,
  dogum_yon:     'Doğum tarihini yalnızca daha küçük bir yaşa doğru düzeltebilirsin. Yaşını büyütmen gerekiyorsa bizimle iletişime geç.',
  kaydedilemedi: 'Kaydedilemedi. Lütfen tekrar dene.',
  bilinmeyen:    'Bir şeyler ters gitti. Lütfen tekrar dene.',
};

/** Sayı taşıyan mesajlar. Sayı doğrulanamazsa sayısız bir metne düşülür. */
const SAYILI: Record<string, (n: number | null) => string> = {
  ad_limit: (n) =>
    n === null
      ? 'Adını günde bir kez değiştirebilirsin. Daha sonra tekrar dene.'
      : `Adını günde bir kez değiştirebilirsin. ${n} saat sonra tekrar deneyebilirsin.`,
  ad_limit_gun: (n) =>
    n === null
      ? 'Kullanıcı adını 30 günde bir değiştirebilirsin. Daha sonra tekrar dene.'
      : `Kullanıcı adını 30 günde bir değiştirebilirsin. ${n} gün sonra tekrar deneyebilirsin.`,
};

/** URL'den gelen sayıyı tam sayıya çevirir; makul aralığın dışındaysa null. */
function sayi(ham: string | undefined): number | null {
  if (!ham) return null;
  const n = Number(ham);
  return Number.isInteger(n) && n >= 1 && n <= 9999 ? n : null;
}

/** Kod → Türkçe metin. Bilinmeyen/uydurma kod genel mesaja düşer. */
export function profilMesaji(kod: string | undefined, ham?: string): string | null {
  if (!kod) return null;
  const sayili = SAYILI[kod];
  if (sayili) return sayili(sayi(ham));
  return SABIT[kod] ?? SABIT.bilinmeyen;
}
