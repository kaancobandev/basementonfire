import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();

  if (!authUser)
    return new Response(null, { status: 303, headers: { Location: '/login' } });

  const { data: dbUser } = await supabase
    .from('users').select('id').eq('auth_id', authUser.id).single();

  if (!dbUser)
    return new Response(null, { status: 303, headers: { Location: '/login' } });

  const formData = await request.formData();
  const content  = formData.get('content')?.toString().trim() ?? '';
  const category = formData.get('category')?.toString() ?? 'general';

  if (!content || content.length > 500)
    return new Response(null, { status: 303, headers: { Location: '/' } });

  const { data: newPost } = await supabase
    .from('posts')
    .insert({ user_id: dbUser.id, content, category })
    .select('id')
    .single();

  // Anket seçenekleri varsa oluştur
  if (newPost) {
    const opts = [1, 2, 3, 4]
      .map(n => formData.get(`poll_opt_${n}`)?.toString().trim() ?? '')
      .filter(o => o.length > 0);

    if (opts.length >= 2) {
      const { data: poll } = await supabase
        .from('polls')
        .insert({ post_id: newPost.id })
        .select('id')
        .single();

      if (poll) {
        await supabase.from('poll_options').insert(
          opts.map((text, i) => ({ poll_id: poll.id, text, position: i }))
        );
      }
    }
  }

  return new Response(null, { status: 303, headers: { Location: '/' } });
};
