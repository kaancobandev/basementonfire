import { db, getMe } from '@/lib/supabase/server';
import { MATCH_MIN_AGE, isAtLeast, birthdateCutoff } from '@/lib/age';
import { MATCHING_ENABLED } from '@/lib/features';
import { ARTICLE_MAP } from '@/lib/articles';
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
  // ÖZELLİK BAYRAĞI — kapalıyken rota yokmuş gibi 404 (sayfayı gizlemek yetmez).
  if (!MATCHING_ENABLED) return json({ error: 'Bulunamadı' }, 404);

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

  // ORTAK MERAK (2026-07-19): "ikiniz de X okudunuz" — okumak eşleşme
  // kalitesini artıran bir eyleme dönüşür. article_reads/article_saves yoksa
  // (SQL çalışmadıysa) sessizce boş kalır, sıralama eski haliyle çalışır.
  const poolIds = pool.map((u) => u.id as number);
  const commonBySlug = new Map<number, string[]>();
  if (poolIds.length) {
    try {
      const readsOf = async (userIds: number[]) => {
        const [reads, saves] = await Promise.all([
          db.from('article_reads').select('user_id, article_slug').in('user_id', userIds),
          db.from('article_saves').select('user_id, article_slug').in('user_id', userIds),
        ]);
        const map = new Map<number, Set<string>>();
        for (const row of [...((reads.data ?? []) as any[]), ...((saves.data ?? []) as any[])]) {
          if (!map.has(row.user_id)) map.set(row.user_id, new Set());
          map.get(row.user_id)!.add(row.article_slug);
        }
        return map;
      };
      const [mineMap, poolMap] = await Promise.all([readsOf([me.id]), readsOf(poolIds)]);
      const mySlugs = mineMap.get(me.id) ?? new Set<string>();
      if (mySlugs.size) {
        for (const [uid, slugs] of poolMap) {
          const common = [...slugs].filter((s) => mySlugs.has(s));
          if (common.length) commonBySlug.set(uid, common);
        }
      }
    } catch { /* ortak-okuma best-effort */ }
  }

  // Sıralama: ortak ilgi BİRİNCİL, ortak okuma İKİNCİL.
  const ranked = pool
    .map((u) => {
      const ui: string[] = Array.isArray(u.interests) ? (u.interests as string[]) : [];
      const shared = ui.filter((t) => myInterests.includes(t));
      // Ham doğum tarihini (DOB) istemciye SIZDIRMA — sunucuda yaşa çevir, birthdate'i çıkar.
      const { birthdate, ...rest } = u as Record<string, unknown>;
      const commonSlugs = commonBySlug.get(u.id as number) ?? [];
      // Slug yerine BAŞLIK gönder (kartta okunur metin; kürate makale registry'si).
      const commonArticles = commonSlugs
        .map((s) => ARTICLE_MAP[s]?.title)
        .filter(Boolean)
        .slice(0, 3) as string[];
      return { ...rest, shared, age: ageFrom((birthdate as string) ?? null), commonArticles };
    })
    .sort((a, b) => b.shared.length - a.shared.length || b.commonArticles.length - a.commonArticles.length)
    .slice(0, 20);

  return json({ deck: ranked, myInterests });
}
