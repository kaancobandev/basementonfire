import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const convId = Number(id);
  if (!convId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { data: conv } = await db.from('conversations').select('id, user1_id, user2_id').eq('id', convId).single();
  if (!conv || (conv.user1_id !== me.id && conv.user2_id !== me.id)) return json({ error: 'Erişim reddedildi' }, 403);

  const body = await req.json();
  const content = (body.content ?? '').trim();
  if (!content || content.length > 1000) return json({ error: 'Mesaj 1–1000 karakter olmalı' }, 400);

  const { data: msg, error } = await db.from('messages').insert({ conversation_id: convId, sender_id: me.id, content }).select('id, content, sender_id, is_read, created_at').single();
  if (error) return json({ error: 'Mesaj gönderilemedi' }, 500);

  await db.from('conversations').update({ last_message_at: msg.created_at }).eq('id', convId);

  return json({ message: { ...msg, sender: { id: me.id, username: me.username, display_name: me.display_name, avatar: me.avatar } } });
}
