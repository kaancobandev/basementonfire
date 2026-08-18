// Oturum çerezi ayarları — TEK KAYNAK.
//
// Neden ayrı dosya: middleware (Edge) de bunu kullanıyor ve `server.ts`'i import
// etseydi service-role client'ı (SUPABASE_SERVICE_KEY) Edge bundle'ına girerdi.
// Bu dosyanın hiçbir import'u yok, güvenle her katmandan çekilebilir.
//
// @supabase/ssr'ın DEFAULT_COOKIE_OPTIONS'ında `secure` alanı YOK ve hiçbir
// çağrı noktası `cookieOptions` geçmiyordu → oturum çerezi (access + refresh
// token, 400 gün ömürlü) Secure bayrağı olmadan yazılıyordu. HSTS de olmadığı
// için halka açık Wi-Fi'da ilk http:// isteğinde token düz metin gidiyordu.
//
// httpOnly DEĞİŞTİRİLMEZ: `createBrowserClient` oturumu document.cookie'den
// okur, httpOnly:true tarayıcı tarafını komple kırar. Buradaki savunma Secure
// + HSTS (netlify.toml) ikilisi.
export const AUTH_COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production', // localhost http olduğu için dev'de kapalı
  sameSite: 'lax' as const,
  path: '/',
};

// ════════════════════════════════════════════════════════════════════════
// OTURUM ÇEREZİ EŞLEME — TEK KAYNAK.
//
// @supabase/ssr çerezi PROJE REF'İ ile adlandırır: `sb-<ref>-auth-token`,
// büyükse `.0` / `.1` diye bölünür. İki yer bu çerezi ELLE çözümlüyor:
// middleware'deki tokenNeedsRefresh ve server.ts'teki cerezdenAuthId.
//
// 🚨 18.08.2026, Frankfurt göçünde ISIRDI. İkisi de `/^sb-.+-auth-token$/`
// kullanıyordu — yani ESKİ projenin çerezini de eşliyordu. Kullanıcının
// tarayıcısında hem eski hem yeni ref'in çerezi vardı; parçalar sıralanıp
// BİRLEŞTİRİLİNCE ortaya bozuk bir dize çıkıyor ve JSON.parse patlıyordu.
// Kullanıcının tarayıcısında ölçüldü:
//   · cerezdenAuthId → null  → `spek=0`, spekülatif users sorgusu ÖLÜ
//   · tokenNeedsRefresh → catch → `true` → middleware HER istekte fazladan
//     bir getUser() ağ turu atıyor
// Ref'e bağlanınca ikisi de düzeldi. Ref değişimi (yeni proje, ortam ayrımı)
// bu kodu SESSİZCE bozar; testte görünmez, çünkü tek çerez varken çalışır.
const PROJE_REF = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
  .match(/^https?:\/\/([a-z0-9]+)\.supabase\./i)?.[1] ?? null;

/** Eşlemenin gerçekten ref'e daraltılıp daraltılmadığı. Ref okunamazsa geniş
 *  desene düşülür ve YUKARIDAKİ HATA GERİ GELİR — bu yüzden sessiz kalmamalı:
 *  /api/nav-state bunu Server-Timing'e `cerez` alanı olarak basıyor. */
export const CEREZ_KAPSAMI = PROJE_REF ? 'dar' : 'genis';

/** YALNIZ şu anki projenin oturum çerezini eşler. Ref okunamazsa eski geniş
 *  desene düşer — o hâlde bile davranış bugünküyle aynı, daha kötü değil. */
export const OTURUM_CEREZI = PROJE_REF
  ? new RegExp(`^sb-${PROJE_REF}-auth-token(\.\d+)?$`)
  : /^sb-.+-auth-token(\.\d+)?$/;

/** Çerez listesinden oturum parçalarını sırayla çıkarır (`.0`, `.1`, …). */
export function oturumParcalari<T extends { name: string }>(liste: T[]): T[] {
  return liste
    .filter((c) => OTURUM_CEREZI.test(c.name))
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
}
