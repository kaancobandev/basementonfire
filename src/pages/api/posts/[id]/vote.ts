import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../../lib/supabase';

export const POST: APIRoute = async ({ request, params }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const postId = Number(params.id);
  if (!postId) return json({ error: 'Geçersiz id' }, 400);

  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return json({ error: 'Giriş gerekli' }, 401);

  const { data: me } = await supabase
    .from('users').select('id').eq('auth_id', authUser.id).single();
  if (!me) return json({ error: 'Kullanıcı bulunamadı' }, 404);

  const body = await request.json() as { option_id?: number };
  const optionId = Number(body.option_id);
  if (!optionId) return json({ error: 'Seçenek gerekli' }, 400);

  const { data: poll } = await supabase
    .from('polls').select('id').eq('post_id', postId).single();
  if (!poll) return json({ error: 'Anket bulunamadı' }, 404);

  const { data: result, error } = await supabase.rpc('cast_poll_vote', {
    p_user_id:   me.id,
    p_poll_id:   poll.id,
    p_option_id: optionId,
  });

  if (error) return json({ error: error.message }, 500);
  if (result?.error === 'already_voted') return json({ error: 'Zaten oy kullandın' }, 409);

  return json({ ...result, voted_option_id: optionId });
};
