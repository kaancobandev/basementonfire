import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function GET() {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { data, error } = await db
    .from('notifications')
    .select('id, type, is_read, created_at, post_id, comment_id, actor:actor_id(id, username, display_name, avatar)')
    .eq('user_id', me.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return json({ error: 'Bildirimler alınamadı' }, 500);
  return json({ notifications: data ?? [] });
}
