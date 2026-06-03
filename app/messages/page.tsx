import { redirect } from 'next/navigation';
import { db, getMe } from '@/lib/supabase/server';
import MessagesClient from './MessagesClient';

export const dynamic = 'force-dynamic';

function avatarBg(u: string) {
  const cs = ['linear-gradient(135deg,#667eea,#764ba2)','linear-gradient(135deg,#f093fb,#f5576c)','linear-gradient(135deg,#4facfe,#00f2fe)','linear-gradient(135deg,#43e97b,#38f9d7)','linear-gradient(135deg,#fa709a,#fee140)','linear-gradient(135deg,#a18cd1,#fbc2eb)','linear-gradient(135deg,#fda085,#f6d365)','linear-gradient(135deg,#96fbc4,#f9f586)'];
  let h = 0; for (const c of u) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return cs[Math.abs(h) % cs.length];
}
function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}sn`; if (s < 3600) return `${Math.floor(s/60)}dk`; if (s < 86400) return `${Math.floor(s/3600)}sa`; return `${Math.floor(s/86400)}g`;
}

export default async function MessagesPage() {
  const { me } = await getMe();
  if (!me) redirect('/login');

  const { data: convs } = await db
    .from('conversations')
    .select('id, last_message_at, u1:user1_id(id, username, display_name, avatar), u2:user2_id(id, username, display_name, avatar)')
    .or(`user1_id.eq.${me.id},user2_id.eq.${me.id}`)
    .order('last_message_at', { ascending: false });

  const convIds = (convs ?? []).map((c: any) => c.id);
  let lastMsgMap: Record<number, any> = {};
  let unreadMap: Record<number, number> = {};

  if (convIds.length > 0) {
    const [{ data: allMsgs }, { data: unread }] = await Promise.all([
      db.from('messages').select('conversation_id, content, sender_id, created_at').in('conversation_id', convIds).order('created_at', { ascending: false }),
      db.from('messages').select('conversation_id').in('conversation_id', convIds).neq('sender_id', me.id).eq('is_read', false),
    ]);
    for (const m of allMsgs ?? []) { if (!lastMsgMap[m.conversation_id]) lastMsgMap[m.conversation_id] = m; }
    for (const m of unread ?? []) { unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] ?? 0) + 1; }
  }

  const conversations = (convs ?? []).map((c: any) => ({
    id: c.id,
    otherUser: c.u1.id === me.id ? c.u2 : c.u1,
    lastMessage: lastMsgMap[c.id] ?? null,
    unreadCount: unreadMap[c.id] ?? 0,
    avatarBg: avatarBg((c.u1.id === me.id ? c.u2 : c.u1).username),
    lastTimeAgo: lastMsgMap[c.id] ? timeAgo(lastMsgMap[c.id].created_at) : '',
  }));

  return (
    <MessagesClient
      conversations={conversations}
      me={{ id: me.id, username: me.username, display_name: me.display_name, avatar: me.avatar ?? '' }}
    />
  );
}
