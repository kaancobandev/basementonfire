import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../../lib/supabase';

export const GET: APIRoute = async ({ request, params }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return json({ error: 'Giriş gerekli' }, 401);

  const { data: me } = await supabase.from('users').select('id').eq('auth_id', authUser.id).single();
  if (!me) return json({ error: 'Kullanıcı bulunamadı' }, 404);

  const convId = parseInt(params.id!);
  if (isNaN(convId)) return json({ error: 'Geçersiz id' }, 400);

  // Verify membership
  const { data: conv } = await supabase
    .from('conversations').select('id, user1_id, user2_id').eq('id', convId).single();
  if (!conv || (conv.user1_id !== me.id && conv.user2_id !== me.id))
    return json({ error: 'Erişim reddedildi' }, 403);

  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, content, sender_id, is_read, created_at, sender:sender_id(id, username, display_name, avatar)')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) return json({ error: 'Mesajlar alınamadı' }, 500);

  // Mark incoming messages as read
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', convId)
    .neq('sender_id', me.id)
    .eq('is_read', false);

  return json({ messages: messages ?? [], myId: me.id });
};
