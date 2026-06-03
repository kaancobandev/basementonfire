import { db } from './supabase/server';

type NotifType = 'follow' | 'comment' | 'like' | 'mention';

interface NotifPayload {
  userId: number;
  actorId: number;
  type: NotifType;
  postId?: number;
  commentId?: number;
}

export async function createNotification(p: NotifPayload) {
  if (p.userId === p.actorId) return;

  if (p.type === 'like' && p.postId) {
    await db.from('notifications').upsert(
      { user_id: p.userId, actor_id: p.actorId, type: 'like', post_id: p.postId, is_read: false, created_at: new Date().toISOString() },
      { onConflict: 'user_id,actor_id,post_id', ignoreDuplicates: false },
    );
    return;
  }

  await db.from('notifications').insert({
    user_id: p.userId,
    actor_id: p.actorId,
    type: p.type,
    post_id: p.postId ?? null,
    comment_id: p.commentId ?? null,
  });
}
