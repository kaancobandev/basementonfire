import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const now = new Date().toISOString();

  // optional auth — to put own stories first
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

  const { data: raw, error } = await supabase
    .from('stories')
    .select('id, media_url, media_type, created_at, expires_at, user_id, users(id, username, display_name, avatar)')
    .gt('expires_at', now)
    .order('created_at', { ascending: false });

  if (error) return json({ error: 'Hikayeler alınamadı' }, 500);

  // Group by user, own stories first
  const map = new Map<number, any>();
  for (const s of raw ?? []) {
    const u: any = s.users;
    const uid: number = s.user_id;
    if (!map.has(uid)) {
      map.set(uid, {
        userId: uid,
        username: u.username,
        displayName: u.display_name,
        avatar: u.avatar ?? null,
        stories: [],
      });
    }
    map.get(uid).stories.push({
      id: s.id,
      mediaUrl: s.media_url,
      mediaType: s.media_type,
      createdAt: s.created_at,
    });
  }

  const users = [...map.values()];
  // own user first
  if (myId) {
    users.sort((a, b) => (b.userId === myId ? 1 : 0) - (a.userId === myId ? 1 : 0));
  }

  return json({ users });
};
