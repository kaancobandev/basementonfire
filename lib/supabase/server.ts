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
/** Oturum çerezinden auth id'yi çıkarır — İMZA DOĞRULANMAZ, GÜVENİLMEZ.
 *
 *  TEK KULLANIM AMACI: users sorgusunu, auth.getUser() daha koşarken ERKEN
 *  başlatmak. Döndürdüğü değer bir yetki kararında ASLA kullanılmaz; aşağıda
 *  yalnızca DOĞRULANMIŞ kimlikle birebir eşleşirse sonucu kabul ediyoruz.
 *
 *  Çerez biçimi @supabase/ssr'ın kendi biçimi: "base64-<base64url(JSON)>",
 *  gerekirse `sb-…-auth-token.0/.1` diye parçalanmış. middleware.ts'teki
 *  tokenNeedsRefresh AYNI çözümlemeyi yapıyor — biçim değişirse İKİSİ DE bozulur. */
async function cerezdenAuthId(): Promise<string | null> {
  try {
    const store = await cookies();
    const parcalar = store.getAll()
      .filter((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name))
      .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
    if (!parcalar.length) return null;
    let ham = parcalar.map((c) => c.value).join('');
    if (ham.startsWith('base64-')) {
      const b64 = ham.slice(7).replace(/-/g, '+').replace(/_/g, '/');
      ham = Buffer.from(b64 + '='.repeat((4 - (b64.length % 4)) % 4), 'base64').toString('utf8');
    } else {
      ham = decodeURIComponent(ham);
    }
    const id = (JSON.parse(ham) as { user?: { id?: string } })?.user?.id;
    return typeof id === 'string' && id ? id : null;
  } catch { return null; }
}

// ════════════════════════════════════════════════════════════════════════
// auth.getUser() ve users sorgusu ÇAKIŞTIRILDI (2026-08-14).
//
// ÖLÇÜM (gerçek oturum, kullanıcının tarayıcısı): iki adım ARDIŞIKken
//   auth=743  urow=736  → 1479 ms, /api/nav-state'in `all`ı 2305 ms
// Supabase'e tek tur o an ~740 ms sürüyordu (Seul) ve iki adım da TAM bir tur.
// users sorgusu auth'un döndürdüğü id'ye bağlı olduğu için "doğal olarak
// ardışık" görünüyordu — ama id'yi çerezden ÖNCEDEN okuyup sorguyu erken
// başlatmak mümkün: doğrulama paralelde koşar, sonuç sadece EŞLEŞİRSE kabul
// edilir. Böylece iki tur bire iner.
//
// ⚠ GÜVENLİK — BU SIRAYI BOZMA: `tahmin` imzası doğrulanmamış bir çerezden
// geliyor ve TEK BAŞINA hiçbir şeye yetki vermiyor. Spekülatif satır yalnızca
// `tahmin === user.id` koşulunda kullanılıyor; `user` ise auth.getUser()'ın
// SUNUCUDA doğruladığı kimlik. Eşleşmezse sonuç ATILIR ve gerçek sorgu koşar.
// Yani saldırgan çereze başka bir id yazarsa elde ettiği tek şey, sonucu
// çöpe giden fazladan bir sorgudur.
//
// `sure.spek`: spekülasyon tuttu mu (1/0) — Server-Timing'den izlenebilir.
// ════════════════════════════════════════════════════════════════════════
export const getMe = cache(async () => {
  const client = await createAuthClient();
  const t0 = Date.now();

  const tahmin = await cerezdenAuthId();
  // .then(ok, hata) ile sarıldı: spekülatif sorgu patlarsa yakalanmamış promise
  // reddi bırakmasın — bu yol tamamen best-effort.
  const onSorgu = tahmin
    ? db.from('users').select('*').eq('auth_id', tahmin).single().then((r) => r, () => null)
    : null;

  const { data: { user } } = await client.auth.getUser();
  const authMs = Date.now() - t0;
  if (!user) return { authUser: null, me: null, client, sure: { auth: authMs, urow: 0, spek: 0 } };

  const t1 = Date.now();
  let me: any = null;
  let spek = 0;
  if (onSorgu && tahmin === user.id) {
    const r = await onSorgu;
    me = r?.data ?? null;
    if (me) spek = 1;
  }
  // Spekülasyon tutmadıysa (çerez yok, bayat, ya da satır gelmedi) gerçek sorgu.
  if (!me) {
    const { data } = await db.from('users').select('*').eq('auth_id', user.id).single();
    me = data ?? null;
  }
  return { authUser: user, me, client, sure: { auth: authMs, urow: Date.now() - t1, spek } };
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
