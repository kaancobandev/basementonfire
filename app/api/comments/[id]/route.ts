import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const commentId = Number(id);
  if (!commentId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { error } = await db.from('comments').delete().eq('id', commentId).eq('user_id', me.id);
  if (error) return json({ error: 'Yorum silinemedi' }, 500);
  return json({ ok: true });
}
