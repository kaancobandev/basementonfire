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
