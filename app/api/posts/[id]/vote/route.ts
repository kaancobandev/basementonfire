import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const body = await req.json();
  const optionId = Number(body.option_id);
  if (!optionId) return json({ error: 'Seçenek gerekli' }, 400);

  const { data: poll } = await db.from('polls').select('id').eq('post_id', postId).single();
  if (!poll) return json({ error: 'Anket bulunamadı' }, 404);

  const { data: result, error } = await db.rpc('cast_poll_vote', {
    p_user_id: me.id, p_poll_id: poll.id, p_option_id: optionId,
  });
  if (error) return json({ error: error.message }, 500);
  if (result?.error === 'already_voted') return json({ error: 'Zaten oy kullandın' }, 409);
  return json({ ...result, voted_option_id: optionId });
}
