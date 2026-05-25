import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../../lib/supabase';
import { createNotification } from '../../../../lib/notify';

export const POST: APIRoute = async ({ request, params }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const id = Number(params.id);
  if (!id) return json({ error: 'Geçersiz id' }, 400);

  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return json({ error: 'Giriş gerekli' }, 401);

  const { data: me } = await supabase.from('users').select('id').eq('auth_id', authUser.id).single();
  if (!me) return json({ error: 'Kullanıcı bulunamadı' }, 404);

  const { data, error } = await supabase.rpc('toggle_fact_like', { p_user_id: me.id, p_fact_id: id });
  if (error) return json({ error: error.message }, 500);

  // Bildirim gönder (sadece beğenirken, geri alırken değil)
  if (data?.liked) {
    try {
      const { data: post } = await supabase.from('quick_facts').select('user_id').eq('id', id).single();
      if (post) {
        await createNotification({ userId: post.user_id, actorId: me.id, type: 'like', postId: id });
      }
    } catch { /* non-fatal */ }
  }

  return json(data);
};
