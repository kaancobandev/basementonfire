import { db, getMe } from '@/lib/supabase/server';
import { createNotification } from '@/lib/notify';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function POST(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { data: target } = await db.from('users').select('id').eq('username', username).single();
  if (!target) return json({ error: 'Hedef kullanıcı bulunamadı' }, 404);
  if (me.id === target.id) return json({ error: 'Kendinizi takip edemezsiniz' }, 400);

  const { data: existing } = await db.from('follows').select('id').eq('follower_id', me.id).eq('following_id', target.id).single();

  if (existing) {
    await db.from('follows').delete().eq('follower_id', me.id).eq('following_id', target.id);
  } else {
    await db.from('follows').insert({ follower_id: me.id, following_id: target.id });
    await createNotification({ userId: target.id, actorId: me.id, type: 'follow' });
  }

  const { count } = await db.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', target.id);
  return json({ following: !existing, followers_count: count ?? 0 });
}
