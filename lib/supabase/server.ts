import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { type NextRequest, type NextResponse } from 'next/server';
import { cache } from 'react';
import { AUTH_COOKIE_OPTIONS } from './cookieOptions';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_KEY!;

// Service-role client — server only, never sent to browser
export const db = createClient(url, service, { auth: { persistSession: false } });

// Auth-aware client for reading the current user's session from cookies
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookieOptions: AUTH_COOKIE_OPTIONS,
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {}
      },
    },
  });
}

// Auth client for ROUTE HANDLERS that REDIRECT. Supabase'in kurduğu (veya
// signOut'ta sildiği) auth cookie'lerini DOĞRUDAN döndürülecek redirect
// yanıtına yazar. Neden: Route Handler'da `next/headers` cookies() mutasyonları
// elle döndürülen NextResponse.redirect()'e iliştirilmez → cookie kaybolur,
// giriş başarılı görünür ama sonraki istekte oturum yoktur (/login'e geri atar).
export function createAuthClientForResponse(req: NextRequest, res: NextResponse) {
  return createServerClient(url, anon, {
    cookieOptions: AUTH_COOKIE_OPTIONS,
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
}

// Helper: get authenticated user's db row in one call.
// React cache() ile sarıldı → aynı istek (request) boyunca layout + sayfa +
// metadata aynı getMe()'yi çağırsa bile auth.getUser() + users sorgusu YALNIZCA
// BİR KEZ çalışır (2 ağ turu tekrarlanmaz). TTFB kazancı.
// `sure` alani: iki ADIMIN ayri ayri maliyeti (ms). Rota bunu Server-Timing
// basligina basar; boylece "getMe yavas" demek yerine HANGI adimin yavas
// oldugu tarayicinin ag panelinden okunabilir. Iki adim ARDISIK olmak
// zorunda (users sorgusu auth'un dondurdugu id'ye bagli), o yuzden hangisinin
// baskin oldugu optimizasyonun yonunu belirliyor.
export const getMe = cache(async () => {
  const client = await createAuthClient();
  const t0 = Date.now();
  const { data: { user } } = await client.auth.getUser();
  const authMs = Date.now() - t0;
  if (!user) return { authUser: null, me: null, client, sure: { auth: authMs, urow: 0 } };
  const t1 = Date.now();
  const { data: me } = await db.from('users').select('*').eq('auth_id', user.id).single();
  return { authUser: user, me: me ?? null, client, sure: { auth: authMs, urow: Date.now() - t1 } };
});

// Admin mi? Onay kuyrugu (kullanici makaleleri) gibi yetkili islemler icin.
// Iki kaynak: users.is_admin = true VEYA ADMIN_USERNAMES ortam degiskeni
// (virgulle ayrilmis kullanici adlari). Ikisi de sunucu tarafinda kontrol edilir.
export function isAdmin(me: { username?: string; is_admin?: boolean } | null | undefined): boolean {
  if (!me) return false;
  if (me.is_admin === true) return true;
  const env = (process.env.ADMIN_USERNAMES ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return !!me.username && env.includes(me.username.toLowerCase());
}

/**
 * "Bu özelliğin SQL'i henüz çalıştırılmamış" hatası mı? Uykuda-güvenli
 * route'lar bunu 500 yerine { available:false } ile karşılar.
 *
 * ⚠ Yalnız 42P01 bakmak YETMEZ: eksik TABLO için PostgREST çoğu zaman kendi
 * kodunu döner (PGRST205, "Could not find the table ... in the schema cache");
 * 42P01'i ancak sorgu Postgres'e ulaşırsa görürsün. Eksik KOLON ise 42703
 * (ya da yazma yolunda PGRST204). Dördü de aynı anlama gelir: göç yapılmamış.
 */
export function isMissingSchema(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  return code === '42P01' || code === 'PGRST205' || code === '42703' || code === 'PGRST204';
}

// Surface Supabase query errors in the server console instead of silently
// rendering empty pages. Call with the `error` from any `await db...` result.
export function logIfError(label: string, error: unknown) {
  if (error) {
    const e = error as { message?: string; code?: string };
    console.error(`[supabase] ${label}:`, e?.code ? `${e.code} ${e.message ?? ''}` : (e?.message ?? error));
  }
}
