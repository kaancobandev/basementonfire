// Server-only: persist hashtags + mention notifications after post creation
import { supabase } from './supabase';
import { createNotification } from './notify';
import { parseHashtags, parseMentions } from './caption';

export async function saveHashtagsAndMentions(
  postId: number,
  caption: string,
  actorId: number,
) {
  await Promise.all([
    persistHashtags(postId, caption),
    persistMentions(postId, caption, actorId),
  ]);
}

async function persistHashtags(postId: number, caption: string) {
  const tags = parseHashtags(caption);
  if (!tags.length) return;

  // Upsert all tags, get their IDs
  const { data: rows } = await supabase
    .from('hashtags')
    .upsert(tags.map(tag => ({ tag })), { onConflict: 'tag' })
    .select('id, tag');

  if (!rows?.length) return;

  await supabase
    .from('post_hashtags')
    .upsert(
      rows.map(r => ({ post_id: postId, hashtag_id: r.id })),
      { onConflict: 'post_id,hashtag_id', ignoreDuplicates: true }
    );
}

async function persistMentions(postId: number, caption: string, actorId: number) {
  const handles = parseMentions(caption);
  if (!handles.length) return;

  const { data: users } = await supabase
    .from('users')
    .select('id')
    .in('username', handles);

  if (!users?.length) return;

  await Promise.all(
    users.map(u =>
      createNotification({
        userId: u.id,
        actorId,
        type: 'mention',
        postId,
      })
    )
  );
}
