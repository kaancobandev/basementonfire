import type { NextRequest } from 'next/server';
import { db, logIfError } from '@/lib/supabase/server';

// Netlify istek basliklarindan ulke/sehir cikar. Ham IP KULLANMAYIZ (KVKK) —
// yalniz CDN'in turettigi konum. Yerelde/gelistirmede basliklar yok -> null.
//   x-nf-geo: base64(JSON) -> { country: { code, name }, city, subdivision, ... }
// Yedekler: x-country (Netlify), x-vercel-ip-country (Vercel), cf-ipcountry (CF).
export function readGeo(req: NextRequest): { country_code: string | null; country_name: string | null; city: string | null } {
  const raw = req.headers.get('x-nf-geo');
  if (raw) {
    try {
      const json = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
      return {
        country_code: json?.country?.code ?? null,
        country_name: json?.country?.name ?? null,
        city: json?.city ?? null,
      };
    } catch {
      /* base64/JSON bozuksa yedeklere dus */
    }
  }
  const cc =
    req.headers.get('x-country') ||
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('cf-ipcountry') ||
    null;
  return { country_code: cc, country_name: null, city: null };
}

// Basarili girisi kaydet. En iyi caba: HER TURLU hata yutulur, asla girisi bozmaz.
// authId = Supabase auth kullanici id'si (signIn/signUp sonucundan gelir).
export async function recordLogin(
  req: NextRequest,
  opts: { authId: string; method?: 'password' | 'register' },
): Promise<void> {
  try {
    // auth_id -> public.users.id (login_events bigint user_id bekler)
    const { data: u, error } = await db.from('users').select('id').eq('auth_id', opts.authId).single();
    if (error || !u) {
      // Kayit aninda users satiri henuz olusmamis olabilir -> sessizce atla.
      logIfError('recordLogin user lookup', error);
      return;
    }
    const geo = readGeo(req);
    const { error: insErr } = await db.from('login_events').insert({
      user_id: u.id,
      method: opts.method ?? 'password',
      country_code: geo.country_code,
      country_name: geo.country_name,
      city: geo.city,
    });
    // Tablo/SQL henuz calismadiysa insert hata verir -> yalniz loglanir, girisi bozmaz.
    logIfError('recordLogin insert', insErr);
  } catch (e) {
    console.error('[recordLogin] beklenmeyen hata:', e);
  }
}
