import { redirect } from 'next/navigation';
import { db, getMe } from '@/lib/supabase/server';
import MessagesClient from './MessagesClient';

export const dynamic = 'force-dynamic';

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}sn`; if (s < 3600) return `${Math.floor(s/60)}dk`; if (s < 86400) return `${Math.floor(s/3600)}sa`; return `${Math.floor(s/86400)}g`;
}

export default async function MessagesPage() {
  const { me } = await getMe();
  if (!me) redirect('/login');

  // Son mesaj önizlemesi embed ile konuşma BAŞINA 1 satır gelir (PostgREST
  // foreignTable limit'i lateral join üretir) — eskiden tüm konuşmaların TÜM
  // mesaj geçmişi indiriliyordu; mesaj sayısı büyüdükçe lineer ağırlaşıyordu.
  // Naif global .limit() önizlemeleri bozar (denendi, geri alındı) — bu bozmaz:
  // her konuşma için en yenisi tam olarak seçilir.
  // Okunmamışlar layout'taki conversations!inner join deseniyle çekilir →
  // convIds beklenmez, iki sorgu TEK turda paralel koşar.
  const [{ data: convs }, { data: unread }] = await Promise.all([
    db.from('conversations')
      .select('id, last_message_at, u1:user1_id(id, username, display_name, avatar), u2:user2_id(id, username, display_name, avatar), messages(conversation_id, content, sender_id, created_at)')
      .or(`user1_id.eq.${me.id},user2_id.eq.${me.id}`)
      .order('last_message_at', { ascending: false })
      .order('created_at', { foreignTable: 'messages', ascending: false })
      .limit(1, { foreignTable: 'messages' }),
    db.from('messages')
      .select('conversation_id, conversations!inner(id)')
      .or(`user1_id.eq.${me.id},user2_id.eq.${me.id}`, { foreignTable: 'conversations' })
      .neq('sender_id', me.id)
      .eq('is_read', false),
  ]);

  let lastMsgMap: Record<number, any> = {};
  let unreadMap: Record<number, number> = {};
  for (const c of (convs ?? []) as any[]) {
    if (c.messages?.[0]) lastMsgMap[c.id] = c.messages[0];
  }
  for (const m of (unread ?? []) as any[]) { unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] ?? 0) + 1; }

  const conversations = (convs ?? []).map((c: any) => ({
    id: c.id,
    otherUser: c.u1.id === me.id ? c.u2 : c.u1,
    lastMessage: lastMsgMap[c.id] ?? null,
    unreadCount: unreadMap[c.id] ?? 0,
    lastTimeAgo: lastMsgMap[c.id] ? timeAgo(lastMsgMap[c.id].created_at) : '',
  }));

  return (
    <MessagesClient
      conversations={conversations}
      me={{ id: me.id, username: me.username, display_name: me.display_name, avatar: me.avatar ?? '' }}
    />
  );
}
