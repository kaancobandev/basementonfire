import { db } from '@/lib/supabase/server';

// Tam gönderi sayfası (/p/[id]) ve intercepting-route modalı (@modal/(.)p/[id])
// aynı veriyi kullanır — tek kaynak.

export async function getPost(id: number) {
  const { data } = await db
    .from('quick_facts')
    .select('*, users!quick_facts_user_id_fkey(username, display_name, avatar, is_private)')
    .eq('id', id)
    .single();
  return data as any;
}

export type DetailComment = {
  id: number; content: string; created_at: string; parent_id: number | null; user_id: number;
  username: string; display_name: string; avatar: string | null;
};

export type PostProp = {
  id: number; caption: string; media_url: string; media_type: string; media: any;
  likes: number; created_at: string; username: string; display_name: string; avatar: string | null;
};

export type PostDetail = {
  post: any;
  u: any;
  comments: DetailComment[];
  initialLiked: boolean;
  initialBookmarked: boolean;
  initialReposted: boolean;
  postProp: PostProp;
};

/** Gönderi + yorumlar + (oturum varsa) beğeni/kaydetme durumu. Yoksa null. */
export async function getPostDetail(postId: number, meId: number | null): Promise<PostDetail | null> {
  const post = await getPost(postId);
  if (!post) return null;

  const { data: rawComments } = await db
    .from('comments')
    .select('id, content, created_at, parent_id, user_id, users(username, display_name, avatar)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  const comments: DetailComment[] = (rawComments ?? []).map((c: any) => ({
    id: c.id, content: c.content, created_at: c.created_at, parent_id: c.parent_id, user_id: c.user_id,
    username: c.users?.username ?? '', display_name: c.users?.display_name ?? '', avatar: c.users?.avatar ?? null,
  }));

  let initialLiked = false;
  let initialBookmarked = false;
  let initialReposted = false;
  if (meId) {
    const [lk, bm, rp] = await Promise.all([
      db.from('fact_likes').select('fact_id').eq('user_id', meId).eq('fact_id', postId).maybeSingle(),
      db.from('bookmarks').select('id').eq('user_id', meId).eq('post_id', postId).maybeSingle(),
      db.from('fact_reposts').select('fact_id').eq('user_id', meId).eq('fact_id', postId).maybeSingle(),
    ]);
    initialLiked = !!lk.data;
    initialBookmarked = !!bm.data;
    initialReposted = !!rp.data;
  }

  const u = post.users || {};
  const postProp: PostProp = {
    id: post.id,
    caption: post.caption ?? '',
    media_url: post.media_url,
    media_type: post.media_type,
    media: post.media ?? null,
    likes: post.likes ?? 0,
    created_at: post.created_at,
    username: u.username ?? '',
    display_name: u.display_name ?? '',
    avatar: u.avatar ?? null,
  };

  return { post, u, comments, initialLiked, initialBookmarked, initialReposted, postProp };
}
