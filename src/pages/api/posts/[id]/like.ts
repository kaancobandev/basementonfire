import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const POST: APIRoute = async ({ params }) => {
  const id = Number(params.id);
  if (!id) return new Response('Bad request', { status: 400 });

  const { data, error } = await supabase.rpc('increment_post_likes', { post_id: id });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ likes: data ?? 0 }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
