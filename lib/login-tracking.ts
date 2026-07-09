import type { NextRequest } from 'next/server';
import { db, logIfError } from '@/lib/supabase/server';
import { readGeoFromHeaders } from '@/lib/geo';

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
    const geo = readGeoFromHeaders(req.headers);
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
