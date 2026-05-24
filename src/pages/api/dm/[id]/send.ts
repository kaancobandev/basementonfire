import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../../lib/supabase';

export const POST: APIRoute = async ({ request, params }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return json({ error: 'Giriş gerekli' }, 401);

  const { data: me } = await supabase.from('users').select('id, display_name, username, avatar').eq('auth_id', authUser.id).single();
  if (!me) return json({ error: 'Kullanıcı bulunamadı' }, 404);

  const convId = parseInt(params.id!);
  if (isNaN(convId)) return json({ error: 'Geçersiz id' }, 400);

  const { data: conv } = await supabase
    .from('conversations').select('id, user1_id, user2_id').eq('id', convId).single();
  if (!conv || (conv.user1_id !== me.id && conv.user2_id !== me.id))
    return json({ error: 'Erişim reddedildi' }, 403);

  let content: string;
  try {
    const body = await request.json();
    content = (body.content ?? '').trim();
  } catch { return json({ error: 'Geçersiz istek' }, 400); }

  if (!content || content.length > 1000)
    return json({ error: 'Mesaj 1–1000 karakter olmalı' }, 400);

  const { data: msg, error: msgErr } = await supabase
    .from('messages')
    .insert({ conversation_id: convId, sender_id: me.id, content })
    .select('id, content, sender_id, is_read, created_at')
    .single();

  if (msgErr) return json({ error: 'Mesaj gönderilemedi' }, 500);

  // Update last_message_at
  await supabase
    .from('conversations')
    .update({ last_message_at: msg.created_at })
    .eq('id', convId);

  return json({
    message: {
      ...msg,
      sender: { id: me.id, username: me.username, display_name: me.display_name, avatar: me.avatar },
    },
  });
};
