import { supabase } from './supabase';

type NotifType = 'follow' | 'comment' | 'like' | 'mention';

interface NotifPayload {
  userId: number;   // recipient
  actorId: number;  // who triggered it
  type: NotifType;
  postId?: number;
  commentId?: number;
}

export async function createNotification(p: NotifPayload) {
  if (p.userId === p.actorId) return; // never notify yourself

  if (p.type === 'like' && p.postId) {
    // upsert to avoid duplicates
    await supabase.from('notifications').upsert(
      {
        user_id: p.userId,
        actor_id: p.actorId,
        type: 'like',
        post_id: p.postId,
        is_read: false,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,actor_id,post_id', ignoreDuplicates: false }
    );
    return;
  }

  await supabase.from('notifications').insert({
    user_id: p.userId,
    actor_id: p.actorId,
    type: p.type,
    post_id: p.postId ?? null,
    comment_id: p.commentId ?? null,
  });
}
