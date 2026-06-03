import { db, getMe, logIfError } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { flattenFacts, flattenPosts } from '@/lib/types';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const limit  = parseInt(searchParams.get('limit') ?? '12');
  const type   = searchParams.get('type') ?? 'facts'; // 'facts' | 'mixed'

  const { me } = await getMe();

  if (type === 'mixed') {
    // Ana sayfa: quick_facts + text posts birleşik
    const since = cursor ?? null;

    const [factsRes, postsRes] = await Promise.all([
      db.from('quick_facts')
        .select('*, users!quick_facts_user_id_fkey(display_name, username, avatar)')
        .order('created_at', { ascending: false })
        .limit(limit * 2),
      db.from('posts')
        .select('*, users!posts_user_id_fkey(display_name, username, avatar)')
        .order('created_at', { ascending: false })
        .limit(limit * 2),
    ]);
    logIfError('feed mixed quick_facts', factsRes.error);
    logIfError('feed mixed posts', postsRes.error);

    const facts = flattenFacts(factsRes.data ?? []).map(f => ({ ...f, kind: 'fact' as const }));
    const posts = flattenPosts(postsRes.data ?? []).map(p => ({ ...p, kind: 'post' as const }));

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
    .select('*, users!quick_facts_user_id_fkey(display_name, username, avatar)')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit + 1);

  if (cursor) query = query.lt('id', cursor);

  const { data: raw, error } = await query;
  logIfError('feed quick_facts', error);
  const all     = flattenFacts(raw ?? []);
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
