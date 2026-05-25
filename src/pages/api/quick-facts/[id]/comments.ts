import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const postId = parseInt(params.id!);
  if (isNaN(postId)) return json({ error: 'Geçersiz id' }, 400);

  const { data, error } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id, parent_id, users(display_name, username)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) return json({ error: 'Yorumlar alınamadı' }, 500);

  const comments = (data ?? []).map((c: any) => ({
    id:           c.id,
    parent_id:    c.parent_id ?? null,
    content:      c.content,
    created_at:   c.created_at,
    user_id:      c.user_id,
    display_name: c.users?.display_name ?? '',
    username:     c.users?.username ?? '',
  }));

  return json({ comments });
};
