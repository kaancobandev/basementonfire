/**
 * TÜRKÇE BÜYÜK HARF — tek kaynak.
 *
 * `'kitap'.toUpperCase()` → `'KITAP'` verir; doğrusu `'KİTAP'`. JS'in varsayılan
 * eşlemesi `i` → `I` yapar, Türkçedeki `i` → `İ` karşılığını bilmez. Bu yüzden
 * makale başlıklarında "6 EKIM", "KAZVIN", "GECESI" gibi hatalar çıkıyordu.
 *
 * `toLocaleUpperCase('tr')` doğru sonucu verir AMA çalışma ortamının ICU
 * verisine bağlıdır: sunucuda ve tarayıcıda farklı sonuç üretirse SSR ile
 * istemci çıktısı ayrışır ve React hidrasyonu kırılır. O yüzden eşleme ELLE
 * yapılıyor — sonuç her ortamda birebir aynı.
 *
 * NOT: CSS `text-transform: uppercase` bu soruna GİRMEZ; sayfada `lang="tr"`
 * ayarlı olduğu için tarayıcı doğru çeviriyor (ölçüldü). Sorun yalnızca
 * JavaScript içinde çevirdiğimiz metinlerde.
 */

/** Küçük harften büyüğe, Türkçeye özgü olanlar. */
const ESLEME: Record<string, string> = {
  i: 'İ',   // asıl mesele bu
  'ı': 'I',
  'ş': 'Ş',
  'ğ': 'Ğ',
  'ü': 'Ü',
  'ö': 'Ö',
  'ç': 'Ç',
};

/** Türkçe kurallarına göre büyük harfe çevirir. Ortamdan bağımsız, deterministik. */
export function buyuk(s: string): string {
  return String(s ?? '').split('').map((c) => ESLEME[c] ?? c.toUpperCase()).join('');
}

/** Tek harflik baş harf (avatar rozetleri) — boş girdide boş döner. */
export const basHarf = (s: string | null | undefined): string => buyuk(String(s ?? '').charAt(0));
