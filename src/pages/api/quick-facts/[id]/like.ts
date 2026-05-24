import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../../lib/supabase';
import { createNotification } from '../../../../lib/notify';

export const POST: APIRoute = async ({ request, params }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const id = Number(params.id);
  if (!id) return json({ error: 'Geçersiz id' }, 400);

  const { data: likes, error } = await supabase.rpc('increment_fact_likes', { fact_id: id });
  if (error) return json({ error: error.message }, 500);

  // Try to notify the post owner (optional auth — fire and forget)
  try {
    const authHeaders = new Headers();
    const authClient = createAuthClient(request, authHeaders);
    const { data: { user: authUser } } = await authClient.auth.getUser();
    if (authUser) {
      const [{ data: me }, { data: post }] = await Promise.all([
        supabase.from('users').select('id').eq('auth_id', authUser.id).single(),
        supabase.from('quick_facts').select('user_id').eq('id', id).single(),
      ]);
      if (me && post) {
        await createNotification({ userId: post.user_id, actorId: me.id, type: 'like', postId: id });
      }
    }
  } catch {
    // non-fatal
  }

  return json({ likes: likes ?? 0 });
};
