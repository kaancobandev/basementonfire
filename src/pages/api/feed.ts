import type { APIRoute } from 'astro';
import { supabase, flattenFacts } from '../../lib/supabase';

const PAGE_SIZE = 12;

export const GET: APIRoute = async ({ request }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const url    = new URL(request.url);
  const cursor = url.searchParams.get('cursor'); // last seen id (exclusive)
  const limit  = Math.min(parseInt(url.searchParams.get('limit') ?? String(PAGE_SIZE)), 50);

  let query = supabase
    .from('quick_facts')
    .select('*, users(display_name, username)')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit + 1); // fetch one extra to detect hasMore

  if (cursor) {
    query = query.lt('id', parseInt(cursor));
  }

  const { data: raw, error } = await query;
  if (error) return json({ error: 'Feed alınamadı' }, 500);

  const all   = flattenFacts(raw ?? []);
  const hasMore = all.length > limit;
  const posts   = hasMore ? all.slice(0, limit) : all;
  const nextCursor = hasMore ? posts[posts.length - 1].id : null;

  return json({ posts, nextCursor, hasMore });
};
