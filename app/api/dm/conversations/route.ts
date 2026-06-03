import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { me } = await getMe();
  if (!me) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });

  const { data } = await db
    .from('conversations')
    .select('id, user1_id, user2_id, last_message_at, user1:user1_id(id, username, display_name, avatar), user2:user2_id(id, username, display_name, avatar)')
    .or(`user1_id.eq.${me.id},user2_id.eq.${me.id}`)
    .order('last_message_at', { ascending: false });

  return NextResponse.json({ conversations: data ?? [], myId: me.id });
}
