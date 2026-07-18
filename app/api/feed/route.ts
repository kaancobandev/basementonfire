import { db, getMe, logIfError } from '@/lib/supabase/server';
import { getBlockedUserIds } from '@/lib/blocks';
import { NextResponse } from 'next/server';
import { flattenFacts, flattenPosts } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  // Üst sınır ZORUNLU: `?limit=500000` iki tablodan 1M satırı (media jsonb dahil)
  // belleğe çekip JS'te sıralıyordu ve bu uç kimlik doğrulaması istemiyor.
  // NaN de kapatıldı: `parseInt('abc')` → `.limit(NaN)` → her istek boş akış.
  const limitRaw = Number.parseInt(searchParams.get('limit') ?? '12', 10);
  const limit    = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 12;
  const type   = searchParams.get('type') ?? 'facts'; // 'facts' | 'mixed'

  const { me } = await getMe();
  // Engellediğim + beni engelleyen kullanıcıların içeriği akışta gösterilmez.
  const blocked = me ? await getBlockedUserIds(me.id) : new Set<number>();
  // `is_private` embed'de SEÇİLMEMİŞSE `undefined` gelir ve `!undefined === true`
  // olduğu için filtre sessizce HERKESİ geçirir — facts dalında tam bu oldu ve
  // gizli hesapların gönderileri sonsuz kaydırmaya sızdı. Embed var ama kolon
  // yoksa artık GİZLİ sayıyoruz: bir daha unutulursa akış açılmaz, kapanır.
  const visible = (r: any) => {
    const u = r.users;
    if (u && !('is_private' in u)) return false;
    return !u?.is_private && !blocked.has(r.user_id);
  };

  if (type === 'mixed') {
    // Ana sayfa: quick_facts + text posts birleşik
    const since = cursor ?? null;

    // Cursor'ı DB'ye it. Eskiden yalnızca bellekte filtreleniyordu: her istek
    // en yeni 2×limit satırı çekip cursor'dan yenilerini eliyordu → sonuç hep
    // boş kalıyor, `hasMore=false` dönüyordu. Yani 50. öğeden eskisine sonsuz
    // kaydırmayla ULAŞILAMIYORDU ve her deneme aynı satırları boşuna indiriyordu.
    let factsQ = db.from('quick_facts')
      .select('*, users!quick_facts_user_id_fkey(display_name, username, avatar, is_private), comments(count)')
      .order('created_at', { ascending: false })
      .limit(limit * 2);
    let postsQ = db.from('posts')
      .select('*, users!posts_user_id_fkey(display_name, username, avatar, is_private)')
      .order('created_at', { ascending: false })
      .limit(limit * 2);

    if (since) {
      factsQ = factsQ.lt('created_at', since);
      postsQ = postsQ.lt('created_at', since);
    }

    const [factsRes, postsRes] = await Promise.all([factsQ, postsQ]);
    logIfError('feed mixed quick_facts', factsRes.error);
    logIfError('feed mixed posts', postsRes.error);

    // Gizli hesapların gönderileri küresel akışta gösterilmez (yalnız profilinde + takipçilerine);
    // engelli kullanıcılar da elenir. is_private truthy = gizli; NULL/false = herkese açık.
    const facts = flattenFacts((factsRes.data ?? []).filter(visible)).map(f => ({ ...f, kind: 'fact' as const }));
    const posts = flattenPosts((postsRes.data ?? []).filter(visible)).map(p => ({ ...p, kind: 'post' as const }));

    // Tarihe göre sırala ve cursor'dan sonrasını al
    let merged = [...facts, ...posts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (since) {
      const sinceDate = new Date(since).getTime();
      merged = merged.filter(i => new Date(i.created_at).getTime() < sinceDate);
    }

    const hasMore = merged.length > limit;
    const items   = hasMore ? merged.slice(0, limit) : merged;

    // Beğeni durumu
    const factIds = items.filter(i => i.kind === 'fact').map(i => i.id);
    const postIds = items.filter(i => i.kind === 'post').map(i => i.id);

    let likedFactIds = new Set<number>();
    let likedPostIds = new Set<number>();

    if (me) {
      const [fl, pl] = await Promise.all([
        factIds.length ? db.from('fact_likes').select('fact_id').eq('user_id', me.id).in('fact_id', factIds) : { data: [] },
        postIds.length ? db.from('post_likes').select('post_id').eq('user_id', me.id).in('post_id', postIds) : { data: [] },
      ]);
      likedFactIds = new Set((fl.data ?? []).map((r: any) => r.fact_id));
      likedPostIds = new Set((pl.data ?? []).map((r: any) => r.post_id));
    }

    const itemsWithLikes = items.map(i =>
      i.kind === 'fact'
        ? { ...i, liked: likedFactIds.has(i.id) }
        : { ...i, liked: likedPostIds.has(i.id) }
    );

    const nextCursor = hasMore ? items[items.length - 1].created_at : null;

    return NextResponse.json({ posts: itemsWithLikes, nextCursor, hasMore });
  }

  // Varsayılan: sadece quick_facts (Akış sayfası için)
  let query = db
    .from('quick_facts')
    // is_private ŞART: yukarıdaki `visible()` bu kolona bakıyor. Seçilmediğinde
    // filtre sessizce herkesi geçiriyordu (gizli hesaplar /akis'ta sızıyordu).
    .select('*, users!quick_facts_user_id_fkey(display_name, username, avatar, is_private), comments(count)')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit * 2 + 1); // gizli-hesap filtresinden sonra sayfa dolsun diye tampon

  if (cursor) query = query.lt('id', cursor);

  const { data: raw, error } = await query;
  logIfError('feed quick_facts', error);
  // Gizli hesapların ve engelli kullanıcıların gönderileri akışta gösterilmez.
  const all     = flattenFacts((raw ?? []).filter(visible));
  const hasMore = all.length > limit;
  const items   = hasMore ? all.slice(0, limit) : all;

  let likedIds = new Set<number>();
  if (me && items.length) {
    const { data: lr } = await db.from('fact_likes').select('fact_id').eq('user_id', me.id).in('fact_id', items.map(i => i.id));
    likedIds = new Set((lr ?? []).map((r: any) => r.fact_id));
  }

  return NextResponse.json({
    posts:      items.map(i => ({ ...i, liked: likedIds.has(i.id) })),
    nextCursor: hasMore ? items[items.length - 1].id : null,
    hasMore,
  });
}
