import { db, getMe } from '@/lib/supabase/server';
import { MATCH_MIN_AGE, isAtLeast, birthdateCutoff } from '@/lib/age';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

const SELECT = 'id, username, display_name, avatar, bio, interests, location, birthdate';

// Dogum tarihinden yas hesapla (kartta "Ad, 24" gostermek icin). Gecersizse null.
function ageFrom(birthdate: string | null): number | null {
  if (!birthdate) return null;
  const b = new Date(birthdate);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
  return a >= 0 && a < 120 ? a : null;
}

// GET /api/match/deck — bana onerilecek sonraki adaylar.
// Ilgi alani ortusen havuz + son kullanicilar birlestirilir, daha once
// kaydirdiklarim ve kendim cikarilir, ortak ilgi sayisina gore siralanir.
export async function GET() {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  // 18+ KAPISI — sayfayı gizlemek yetmez, bu route doğrudan çağrılabilir.
  // Doğum tarihi olmayan (yaş kapısından önce kayıt olmuş) eski kullanıcılar da geçemez.
  if (!isAtLeast(me.birthdate, MATCH_MIN_AGE))
    return json({ error: `Eşleştirme ${MATCH_MIN_AGE} yaş ve üzeri içindir.` }, 403);

  const myInterests: string[] = Array.isArray(me.interests) ? me.interests : [];

  // HAVUZ da 18+ ile sınırlı: 18 yaşındaki birine 16-17 yaşında biri GÖSTERİLMEZ.
  // Asıl korunmak istenen şey bu. `birthdate <= cutoff` → NULL olanlar da elenir.
  const cutoff = birthdateCutoff(MATCH_MIN_AGE);

  // Daha once kaydirdiklarim — tekrar gosterme.
  const { data: swipedRows } = await db.from('swipes').select('target_id').eq('swiper_id', me.id);
  const swiped = new Set<number>((swipedRows ?? []).map((r: { target_id: number }) => r.target_id));
  swiped.add(me.id);

  // Iki havuz: (1) ilgi alani ortusenler, (2) son kullanicilar (deste asla bos kalmasin).
  // .not('is_private','is',true): gizli hesaplar deste'ye girmez (yalnız true olan; NULL/false açık).
  const queries: PromiseLike<{ data: unknown[] | null }>[] = [];
  if (myInterests.length) {
    queries.push(db.from('users').select(SELECT).neq('id', me.id).not('is_private', 'is', true).eq('is_deleted', false).lte('birthdate', cutoff).overlaps('interests', myInterests).limit(80));
  }
  queries.push(db.from('users').select(SELECT).neq('id', me.id).not('is_private', 'is', true).eq('is_deleted', false).lte('birthdate', cutoff).order('created_at', { ascending: false }).limit(40));

  const results = await Promise.all(queries);

  const seen = new Set<number>();
  const pool: Record<string, unknown>[] = [];
  for (const res of results) {
    for (const u of ((res?.data ?? []) as Record<string, unknown>[])) {
      const id = u.id as number;
      if (seen.has(id) || swiped.has(id)) continue;
      seen.add(id);
      pool.push(u);
    }
  }

  // Ortak ilgi sayisina gore sirala (cok ortak -> once), ilk 20'yi don.
  const ranked = pool
    .map((u) => {
      const ui: string[] = Array.isArray(u.interests) ? (u.interests as string[]) : [];
      const shared = ui.filter((t) => myInterests.includes(t));
      // Ham doğum tarihini (DOB) istemciye SIZDIRMA — sunucuda yaşa çevir, birthdate'i çıkar.
      const { birthdate, ...rest } = u as Record<string, unknown>;
      return { ...rest, shared, age: ageFrom((birthdate as string) ?? null) };
    })
    .sort((a, b) => b.shared.length - a.shared.length)
    .slice(0, 20);

  return json({ deck: ranked, myInterests });
}
