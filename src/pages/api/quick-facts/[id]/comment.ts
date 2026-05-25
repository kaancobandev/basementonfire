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

  const { data: post } = await supabase
    .from('quick_facts')
    .select('user_id, users(comment_privacy)')
    .eq('id', postId)
    .single();

  if (post && post.user_id !== me.id) {
    const policy: string = (post.users as any)?.comment_privacy ?? 'everyone';
    if (policy === 'none') return json({ error: 'Bu gönderiye yorum kapalı' }, 403);
    if (policy === 'followers') {
      const { data: follows } = await supabase
        .from('follows').select('id')
        .eq('follower_id', me.id).eq('following_id', post.user_id).maybeSingle();
      if (!follows) return json({ error: 'Yorum yapabilmek için takip etmelisiniz' }, 403);
    }
  }

  let content: string;
  let parent_id: number | null = null;
  try {
    const body = await request.json();
    content   = (body.content ?? '').trim();
    parent_id = body.parent_id ? Number(body.parent_id) : null;
  } catch {
    return json({ error: 'Geçersiz istek' }, 400);
  }

  if (!content || content.length > 300)
    return json({ error: 'Yorum 1–300 karakter olmalı' }, 400);

  // parent_id geçerliyse aynı post'a ait olduğunu doğrula
  if (parent_id) {
    const { data: parent } = await supabase
      .from('comments').select('id, user_id, post_id').eq('id', parent_id).single();
    if (!parent || parent.post_id !== postId || parent.parent_id !== null) {
      // sadece üst seviye yorumlara yanıt verilebilir (max 1 katman)
      parent_id = null;
    }
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: me.id, content, parent_id })
    .select('id, content, created_at, user_id, parent_id')
    .single();

  if (error) return json({ error: 'Yorum eklenemedi' }, 500);

  // Gönderi sahibini bildir (yanıt değilse veya yanıt sahibi farklıysa)
  if (post && post.user_id !== me.id) {
    await createNotification({ userId: post.user_id, actorId: me.id, type: 'comment', postId, commentId: comment.id });
  }

  // Yanıtlanan yorum sahibini bildir (farklıysa ve gönderi sahibinden farklıysa)
  if (parent_id) {
    const { data: parentCm } = await supabase
      .from('comments').select('user_id').eq('id', parent_id).single();
    if (parentCm && parentCm.user_id !== me.id && parentCm.user_id !== post?.user_id) {
      await createNotification({ userId: parentCm.user_id, actorId: me.id, type: 'comment', postId, commentId: comment.id });
    }
  }

  return json({
    comment: { ...comment, display_name: me.display_name, username: me.username },
  });
};
