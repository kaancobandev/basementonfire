import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../../lib/supabase';
import { createNotification } from '../../../../lib/notify';

export const POST: APIRoute = async ({ request, params }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return json({ error: 'Giriş gerekli' }, 401);

  const { data: me } = await supabase
    .from('users').select('id').eq('auth_id', authUser.id).single();
  if (!me) return json({ error: 'Kullanıcı bulunamadı' }, 404);

  const { data: target } = await supabase
    .from('users').select('id').eq('username', params.username).single();
  if (!target) return json({ error: 'Hedef kullanıcı bulunamadı' }, 404);

  if (me.id === target.id) return json({ error: 'Kendinizi takip edemezsiniz' }, 400);

  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', me.id)
    .eq('following_id', target.id)
    .single();

  if (existing) {
    await supabase.from('follows')
      .delete()
      .eq('follower_id', me.id)
      .eq('following_id', target.id);
  } else {
    await supabase.from('follows')
      .insert({ follower_id: me.id, following_id: target.id });
    await createNotification({ userId: target.id, actorId: me.id, type: 'follow' });
  }

  const { count } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', target.id);

  return json({ following: !existing, followers_count: count ?? 0 });
};
