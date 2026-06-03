import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q    = (searchParams.get('q') ?? '').trim();
  const type = searchParams.get('type') ?? 'all';

  if (!q) return NextResponse.json({ users: [], posts: [], hashtags: [] });

  const pattern = `%${q}%`;

  const [usersRes, postsRes, hashtagsRes] = await Promise.all([
    type !== 'posts'
      ? db.from('users').select('id, username, display_name, avatar, bio').or(`username.ilike.${pattern},display_name.ilike.${pattern}`).limit(15)
      : { data: [] },
    type !== 'users'
      ? db.from('quick_facts').select('id, caption, media_url, media_type, created_at, user:user_id(id, username, display_name, avatar)').ilike('caption', pattern).order('created_at', { ascending: false }).limit(20)
      : { data: [] },
    db.from('hashtags').select('id, tag').ilike('tag', `%${q.replace(/^#/, '').toLowerCase()}%`).limit(8),
  ]);

  const { me } = await getMe();
  let followingIds = new Set<number>();

  if (me && (type === 'users' || type === 'all') && (usersRes.data ?? []).length > 0) {
    const targetIds = (usersRes.data ?? []).map((u: any) => u.id);
    const { data: follows } = await db.from('follows').select('following_id').eq('follower_id', me.id).in('following_id', targetIds);
    if (follows) follows.forEach((f: any) => followingIds.add(f.following_id));
  }

  const users = (usersRes.data ?? []).map((u: any) => ({
    ...u,
    is_following: followingIds.has(u.id),
    is_me: u.id === me?.id,
  }));

  return NextResponse.json({ users, posts: postsRes.data ?? [], hashtags: hashtagsRes.data ?? [] });
}
