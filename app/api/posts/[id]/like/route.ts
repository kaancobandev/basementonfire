import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) =>
  NextResponse.json(data, { status });

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { data, error } = await db.rpc('toggle_post_like', { p_user_id: me.id, p_post_id: postId });
  if (error) return json({ error: error.message }, 500);
  return json(data);
}
