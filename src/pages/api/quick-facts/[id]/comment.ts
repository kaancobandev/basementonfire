import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../../lib/supabase';
import { createNotification } from '../../../../lib/notify';

export const POST: APIRoute = async ({ request, params }) => {
  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  const authHeaders = new Headers();
  const authClient  = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return json({ error: 'Giriş gerekli' }, 401);

  const { data: me } = await supabase
    .from('users').select('id, display_name, username').eq('auth_id', authUser.id).single();
  if (!me) return json({ error: 'Kullanıcı bulunamadı' }, 404);

  const postId = parseInt(params.id!);
  if (isNaN(postId)) return json({ error: 'Geçersiz id' }, 400);

  // Check post owner's comment_privacy
  const { data: post } = await supabase
    .from('quick_facts')
    .select('user_id, users(comment_privacy)')
    .eq('id', postId)
    .single();

  if (post && post.user_id !== me.id) {
    const policy: string = (post.users as any)?.comment_privacy ?? 'everyone';
    if (policy === 'none') {
      return json({ error: 'Bu gönderiye yorum kapalı' }, 403);
    }
    if (policy === 'followers') {
      const { data: follows } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', me.id)
        .eq('following_id', post.user_id)
        .maybeSingle();
      if (!follows) return json({ error: 'Yorum yapabilmek için takip etmelisiniz' }, 403);
    }
  }

  let content: string;
  try {
    const body = await request.json();
    content = (body.content ?? '').trim();
  } catch {
    return json({ error: 'Geçersiz istek' }, 400);
  }

  if (!content || content.length > 300)
    return json({ error: 'Yorum 1–300 karakter olmalı' }, 400);

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: me.id, content })
    .select('id, content, created_at, user_id')
    .single();

  if (error) return json({ error: 'Yorum eklenemedi' }, 500);

  // notify the post owner (if someone else commented) — reuse already-fetched post
  if (post) {
    await createNotification({
      userId: post.user_id,
      actorId: me.id,
      type: 'comment',
      postId,
      commentId: comment.id,
    });
  }

  return json({
    comment: { ...comment, display_name: me.display_name, username: me.username },
  });
};
