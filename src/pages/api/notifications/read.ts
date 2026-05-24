import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return json({ error: 'Giriş gerekli' }, 401);

  const { data: me } = await supabase
    .from('users').select('id').eq('auth_id', authUser.id).single();
  if (!me) return json({ error: 'Kullanıcı bulunamadı' }, 404);

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', me.id)
    .eq('is_read', false);

  if (error) return json({ error: 'Güncellenemedi' }, 500);

  return json({ ok: true });
};
