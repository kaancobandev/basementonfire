import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../../lib/supabase';

const json = (data: object, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

async function getMe(request: Request) {
  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return null;
  const { data: me } = await supabase.from('users').select('id').eq('auth_id', authUser.id).single();
  return me ?? null;
}

// GET — check if current post is bookmarked
export const GET: APIRoute = async ({ request, params }) => {
  const me = await getMe(request);
  if (!me) return json({ bookmarked: false });

  const postId = parseInt(params.id!);
  if (isNaN(postId)) return json({ error: 'Geçersiz id' }, 400);

  const { data } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', me.id)
    .eq('post_id', postId)
    .maybeSingle();

  return json({ bookmarked: !!data });
};

// POST — toggle bookmark
export const POST: APIRoute = async ({ request, params }) => {
  const me = await getMe(request);
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const postId = parseInt(params.id!);
  if (isNaN(postId)) return json({ error: 'Geçersiz id' }, 400);

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', me.id)
    .eq('post_id', postId)
    .maybeSingle();

  if (existing) {
    await supabase.from('bookmarks').delete().eq('id', existing.id);
    return json({ bookmarked: false });
  }

  await supabase.from('bookmarks').insert({ user_id: me.id, post_id: postId });
  return json({ bookmarked: true });
};
