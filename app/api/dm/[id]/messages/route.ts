import { db, getMe } from '@/lib/supabase/server';
import { markConversationRead } from '@/lib/dm';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const convId = Number(id);
  if (!convId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { data: conv } = await db.from('conversations').select('id, user1_id, user2_id').eq('id', convId).single();
  if (!conv || (conv.user1_id !== me.id && conv.user2_id !== me.id)) return json({ error: 'Erişim reddedildi' }, 403);

  // Limitsizdi → uzun bir sohbeti açmak TÜM geçmişi (her satırda gönderen
  // embed'iyle) taşıyordu. En YENİ 500 mesajı çekip ters çeviriyoruz; artan
  // sıralamayla limit koymak en ESKİ 500'ü verirdi (yanlış uç).
  // TODO: 500'ü aşan sohbetler için cursor'lı sayfalama (yukarı kaydırınca yükle).
  const { data: messages } = await db
    .from('messages')
    .select('id, content, sender_id, is_read, created_at, users:sender_id(id, username, display_name, avatar)')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: false })
    .limit(500);

  await markConversationRead(convId, me.id);

  return json({ messages: (messages ?? []).reverse() });
}
