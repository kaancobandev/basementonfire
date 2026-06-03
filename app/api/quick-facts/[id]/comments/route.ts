import { db } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return NextResponse.json({ error: 'Geçersiz id' }, { status: 400 });

  const { data, error } = await db
    .from('comments')
    .select('id, content, created_at, parent_id, user_id, users(username, display_name, avatar)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: 'Yorumlar alınamadı' }, { status: 500 });

  const comments = (data ?? []).map((c: any) => ({
    id: c.id,
    content: c.content,
    created_at: c.created_at,
    parent_id: c.parent_id,
    user_id: c.user_id,
    username: c.users?.username ?? '',
    display_name: c.users?.display_name ?? '',
    avatar: c.users?.avatar ?? null,
  }));

  return NextResponse.json({ comments });
}
