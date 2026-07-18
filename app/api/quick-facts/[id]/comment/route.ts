import { db, getMe } from '@/lib/supabase/server';
import { createNotification } from '@/lib/notify';
import { isBlockedBetween } from '@/lib/blocks';
import { canViewOwnerContent } from '@/lib/visibility';
import { NextResponse, after } from 'next/server';
import { notifyMentions } from '@/lib/mentions';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  // is_private ŞART: eskiden yalnız comment_privacy okunuyordu ve varsayılanı
  // 'everyone' olduğu için GİZLİ hesabın gönderisine takip etmeyen herkes yorum
  // yazabiliyordu. Okuma yolu (comments GET) ile aynı kuralı paylaşmalı.
  const { data: post } = await db.from('quick_facts').select('user_id, users!quick_facts_user_id_fkey(comment_privacy, is_private)').eq('id', postId).single();

  if (post && post.user_id !== me.id && await isBlockedBetween(me.id, post.user_id)) {
    return json({ error: 'Bu gönderiye yorum yapamazsınız' }, 403);
  }

  if (post && post.user_id !== me.id) {
    const canView = await canViewOwnerContent(post.user_id, (post.users as any)?.is_private, me.id);
    if (!canView) return json({ error: 'Bu gönderiye erişemezsiniz' }, 403);
  }

  if (post && post.user_id !== me.id) {
    const policy: string = (post.users as any)?.comment_privacy ?? 'everyone';
    if (policy === 'none') return json({ error: 'Bu gönderiye yorum kapalı' }, 403);
    if (policy === 'followers') {
      const { data: follows } = await db.from('follows').select('id').eq('follower_id', me.id).eq('following_id', post.user_id).maybeSingle();
      if (!follows) return json({ error: 'Yorum yapabilmek için takip etmelisiniz' }, 403);
    }
  }

  const body = await req.json();
  const content = (body.content ?? '').trim();
  const parent_id: number | null = body.parent_id ? Number(body.parent_id) : null;

  if (!content || content.length > 300) return json({ error: 'Yorum 1–300 karakter olmalı' }, 400);

  const { data: comment, error } = await db
    .from('comments')
    .insert({ post_id: postId, user_id: me.id, content, parent_id })
    .select('id, content, created_at, user_id, parent_id')
    .single();

  if (error) return json({ error: 'Yorum eklenemedi' }, 500);

  if (post && post.user_id !== me.id)
    await createNotification({ userId: post.user_id, actorId: me.id, type: 'comment', postId, commentId: comment.id });

  if (parent_id) {
    const { data: parentCm } = await db.from('comments').select('user_id').eq('id', parent_id).single();
    if (parentCm && parentCm.user_id !== me.id && parentCm.user_id !== post?.user_id)
      await createNotification({ userId: parentCm.user_id, actorId: me.id, type: 'comment', postId, commentId: comment.id });
  }

  // Yorumdaki @bahsetmelere bildirim — yanıt sonrası, best-effort.
  after(() => notifyMentions({ actorId: me.id, text: content, postId, commentId: comment.id }));

  return json({ comment: { ...comment, display_name: me.display_name, username: me.username, avatar: me.avatar ?? null } });
}
