import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return json({ bookmarked: false });

  const { me } = await getMe();
  if (!me) return json({ bookmarked: false });

  const { data } = await db.from('bookmarks').select('id').eq('user_id', me.id).eq('post_id', postId).maybeSingle();
  return json({ bookmarked: !!data });
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { data: existing } = await db.from('bookmarks').select('id').eq('user_id', me.id).eq('post_id', postId).maybeSingle();

  if (existing) {
    await db.from('bookmarks').delete().eq('id', existing.id);
    return json({ bookmarked: false });
  }

  await db.from('bookmarks').insert({ user_id: me.id, post_id: postId });
  return json({ bookmarked: true });
}
