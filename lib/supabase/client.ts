'use client';
import { createBrowserClient } from '@supabase/ssr';
import { AUTH_COOKIE_OPTIONS } from './cookieOptions';

let client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Tarayıcı Supabase istemcisi (realtime + oturum tazeleme).
 *
 * 🚨 `cookieOptions` GEÇMEK ZORUNDA — 23.08.2026 güvenlik denetimi.
 *
 * Sunucu tarafı (middleware, createAuthClient, createAuthClientForResponse)
 * oturum çerezini `AUTH_COOKIE_OPTIONS` ile, yani **Secure** bayrağıyla
 * yazıyor. Bu istemci ise ayar geçmediği için `@supabase/ssr`ın
 * DEFAULT_COOKIE_OPTIONS'ını kullanıyordu ve o nesnede `secure` alanı YOK.
 *
 * Sonuç: kullanıcı sitede gezerken tarayıcıdaki `autoRefreshToken` çerezi
 * yeniden yazıyor ve **Secure bayrağını düşürüyordu**. Yani sunucunun koyduğu
 * koruma, ilk otomatik tazelemede sessizce kayboluyordu. Halka açık Wi-Fi'da
 * tek bir `http://` isteği (bir bağlantı, bir resim, bir yönlendirme) token'ı
 * düz metin taşırdı — çerez httpOnly de olmadığı için bu doğrudan hesap devri
 * demek.
 *
 * `cookieOptions.ts`in hiçbir import'u yok, istemci paketine güvenle girer
 * (zaten Edge/middleware bu yüzden ayrı dosyada tutuluyor).
 *
 * ⛔ Buradaki ayarı sunucudakinden AYIRMA. İki taraf aynı çerezi yazıyor;
 *    bayraklar ayrışırsa hangi tarafın en son yazdığına göre koruma değişir.
 */
export function getSupa() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookieOptions: AUTH_COOKIE_OPTIONS },
    );
  }
  return client;
}
