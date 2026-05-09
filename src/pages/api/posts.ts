import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const content  = formData.get('content')?.toString().trim() ?? '';
  const category = formData.get('category')?.toString() ?? 'general';

  if (!content || content.length > 500) {
    return new Response(JSON.stringify({ error: 'Geçersiz içerik' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { error } = await supabase
    .from('posts')
    .insert({ user_id: 1, content, category });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(null, { status: 303, headers: { Location: '/' } });
};
