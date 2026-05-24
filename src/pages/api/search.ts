import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const url = new URL(request.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  const type = url.searchParams.get('type') ?? 'all'; // 'users' | 'posts' | 'all'

  if (!q || q.length < 1) return json({ users: [], posts: [], hashtags: [] });

  const pattern = `%${q}%`;

  const promises: [Promise<any>, Promise<any>] = [
    type !== 'posts'
      ? supabase
          .from('users')
          .select('id, username, display_name, avatar, bio')
          .or(`username.ilike.${pattern},display_name.ilike.${pattern}`)
          .limit(15)
      : Promise.resolve({ data: [] }),

    type !== 'users'
      ? supabase
          .from('quick_facts')
          .select('id, caption, media_url, media_type, created_at, user:user_id(id, username, display_name, avatar)')
          .ilike('caption', pattern)
          .order('created_at', { ascending: false })
          .limit(20)
      : Promise.resolve({ data: [] }),
  ];

  const tagQ = q.startsWith('#') ? q.slice(1).toLowerCase() : q.toLowerCase();
  const [usersRes, postsRes, hashtagsRes] = await Promise.all([
    ...promises,
    supabase
      .from('hashtags')
      .select('id, tag')
      .ilike('tag', `%${tagQ}%`)
      .limit(8),
  ]);

  // Check if requester is logged in (to include follow state)
  let myId: number | null = null;
  try {
    const authHeaders = new Headers();
    const authClient = createAuthClient(request, authHeaders);
    const { data: { user: authUser } } = await authClient.auth.getUser();
    if (authUser) {
      const { data: me } = await supabase.from('users').select('id').eq('auth_id', authUser.id).single();
      myId = me?.id ?? null;
    }
  } catch { /* non-fatal */ }

  let followingIds: Set<number> = new Set();
  if (myId && (type === 'users' || type === 'all') && (usersRes.data ?? []).length > 0) {
    const targetIds = (usersRes.data ?? []).map((u: any) => u.id);
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', myId)
      .in('following_id', targetIds);
    if (follows) follows.forEach((f: any) => followingIds.add(f.following_id));
  }

  const users = (usersRes.data ?? []).map((u: any) => ({
    ...u,
    is_following: followingIds.has(u.id),
    is_me: u.id === myId,
  }));

  return json({ users, posts: postsRes.data ?? [], hashtags: hashtagsRes.data ?? [] });
};
