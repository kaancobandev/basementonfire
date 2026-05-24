import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return json({ error: 'Giriş gerekli' }, 401);

  const { data: me } = await supabase.from('users').select('id').eq('auth_id', authUser.id).single();
  if (!me) return json({ error: 'Kullanıcı bulunamadı' }, 404);

  const { data: convs, error } = await supabase
    .from('conversations')
    .select(`id, last_message_at,
      u1:user1_id(id, username, display_name, avatar),
      u2:user2_id(id, username, display_name, avatar)`)
    .or(`user1_id.eq.${me.id},user2_id.eq.${me.id}`)
    .order('last_message_at', { ascending: false });

  if (error) return json({ error: 'Konuşmalar alınamadı' }, 500);
  if (!convs?.length) return json({ conversations: [] });

  const ids = convs.map((c: any) => c.id);

  // Last message per conversation
  const { data: allMsgs } = await supabase
    .from('messages')
    .select('conversation_id, content, sender_id, created_at')
    .in('conversation_id', ids)
    .order('created_at', { ascending: false });

  const lastMsg = new Map<number, any>();
  for (const m of allMsgs ?? []) {
    if (!lastMsg.has(m.conversation_id)) lastMsg.set(m.conversation_id, m);
  }

  // Unread counts
  const { data: unread } = await supabase
    .from('messages')
    .select('conversation_id')
    .in('conversation_id', ids)
    .neq('sender_id', me.id)
    .eq('is_read', false);

  const unreadMap = new Map<number, number>();
  for (const m of unread ?? []) {
    unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) ?? 0) + 1);
  }

  const conversations = (convs as any[]).map(c => {
    const other = c.u1.id === me.id ? c.u2 : c.u1;
    return {
      id:             c.id,
      lastMessageAt:  c.last_message_at,
      otherUser:      other,
      lastMessage:    lastMsg.get(c.id) ?? null,
      unreadCount:    unreadMap.get(c.id) ?? 0,
    };
  });

  return json({ conversations });
};
