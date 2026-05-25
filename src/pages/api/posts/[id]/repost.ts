import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../../lib/supabase';

export const POST: APIRoute = async ({ request, params }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const id = Number(params.id);
  if (!id) return json({ error: 'Geçersiz id' }, 400);

  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return json({ error: 'Giriş gerekli' }, 401);

  const { data: me } = await supabase
    .from('users').select('id').eq('auth_id', authUser.id).single();
  if (!me) return json({ error: 'Kullanıcı bulunamadı' }, 404);

  const { data, error } = await supabase.rpc('toggle_post_repost', {
    p_user_id: me.id,
    p_post_id: id,
  });

  if (error) return json({ error: error.message }, 500);

  return json(data);
};
