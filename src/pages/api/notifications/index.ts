import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return json({ error: 'Giriş gerekli' }, 401);

  const { data: me } = await supabase
    .from('users').select('id').eq('auth_id', authUser.id).single();
  if (!me) return json({ error: 'Kullanıcı bulunamadı' }, 404);

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select(`
      id, type, is_read, created_at, post_id, comment_id,
      actor:actor_id ( id, username, display_name, avatar )
    `)
    .eq('user_id', me.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return json({ error: 'Bildirimler alınamadı' }, 500);

  return json({ notifications: notifications ?? [] });
};
