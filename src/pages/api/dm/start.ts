import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return json({ error: 'Giriş gerekli' }, 401);

  const { data: me } = await supabase.from('users').select('id').eq('auth_id', authUser.id).single();
  if (!me) return json({ error: 'Kullanıcı bulunamadı' }, 404);

  let targetId: number;
  try {
    const body = await request.json();
    if (body.userId) {
      targetId = parseInt(body.userId);
    } else if (body.username) {
      const { data: t } = await supabase.from('users').select('id').eq('username', body.username).single();
      if (!t) return json({ error: 'Kullanıcı bulunamadı' }, 404);
      targetId = t.id;
    } else {
      return json({ error: 'userId veya username gerekli' }, 400);
    }
  } catch { return json({ error: 'Geçersiz istek' }, 400); }

  if (targetId === me.id) return json({ error: 'Kendinize mesaj gönderemezsiniz' }, 400);

  // Enforce target's dm_privacy
  const { data: target } = await supabase
    .from('users').select('dm_privacy').eq('id', targetId).single();
  if (target) {
    const policy = target.dm_privacy ?? 'everyone';
    if (policy === 'none') {
      return json({ error: 'Bu kullanıcı mesajlara kapalı' }, 403);
    }
    if (policy === 'followers') {
      const { data: follows } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', me.id)
        .eq('following_id', targetId)
        .maybeSingle();
      if (!follows) return json({ error: 'Mesaj göndermek için bu kişiyi takip etmelisiniz' }, 403);
    }
  }

  const u1 = Math.min(me.id, targetId);
  const u2 = Math.max(me.id, targetId);

  // Get or create
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('user1_id', u1)
    .eq('user2_id', u2)
    .single();

  if (existing) return json({ id: existing.id });

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({ user1_id: u1, user2_id: u2 })
    .select('id')
    .single();

  if (error) return json({ error: 'Konuşma başlatılamadı' }, 500);

  return json({ id: created.id });
};
