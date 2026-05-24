import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return json({ error: 'Giriş gerekli' }, 401);

  const { data: me } = await supabase.from('users').select('id').eq('auth_id', authUser.id).single();
  if (!me) return json({ error: 'Kullanıcı bulunamadı' }, 404);

  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      id, created_at,
      post:post_id(
        id, media_url, media_type, caption, likes, created_at,
        users(display_name, username)
      )
    `)
    .eq('user_id', me.id)
    .order('created_at', { ascending: false });

  if (error) return json({ error: 'Kaydedilenler alınamadı' }, 500);

  const posts = (data ?? [])
    .map((b: any) => {
      const p = b.post;
      if (!p) return null;
      return {
        id: p.id,
        media_url: p.media_url,
        media_type: p.media_type,
        caption: p.caption,
        likes: p.likes,
        created_at: p.created_at,
        display_name: p.users?.display_name ?? '',
        username: p.users?.username ?? '',
      };
    })
    .filter(Boolean);

  return json({ posts });
};
