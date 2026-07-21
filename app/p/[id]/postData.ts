import { cache } from 'react';
import { db } from '@/lib/supabase/server';

// Tam gönderi sayfası (/p/[id]) ve intercepting-route modalı (@modal/(.)p/[id])
// aynı veriyi kullanır — tek kaynak.

// React cache(): generateMetadata + sayfa gövdesi aynı istekte aynı gönderiyi
// ister — sorgu bir kez çalışır (getMe deseninin aynısı).
export const getPost = cache(async (id: number) => {
  const { data } = await db
    .from('quick_facts')
    .select('*, users!quick_facts_user_id_fkey(username, display_name, avatar, is_private)')
    .eq('id', id)
    .single();
  return data as any;
});

export type DetailComment = {
  id: number; content: string; created_at: string; parent_id: number | null; user_id: number;
  username: string; display_name: string; avatar: string | null;
  likes: number; liked: boolean;
};

export type PostProp = {
  id: number; user_id: number; caption: string; media_url: string; media_type: string; media: any;
  likes: number; created_at: string; username: string; display_name: string; avatar: string | null;
};

export type PostDetail = {
  post: any;
  u: any;
  comments: DetailComment[];
  commentLikesEnabled: boolean;
  initialLiked: boolean;
  initialBookmarked: boolean;
  initialReposted: boolean;
  postProp: PostProp;
};

/** Gönderi + yorumlar + (oturum varsa) beğeni/kaydetme durumu. Yoksa null. */
export async function getPostDetail(postId: number, meId: number | null): Promise<PostDetail | null> {
  const post = await getPost(postId);
  if (!post) return null;

  // Gizli hesabın gönderisi: yalnızca SAHİBİ ve TAKİPÇİLERİ görebilir; aksi halde
  // yokmuş gibi davran (çağıranlar null'ı notFound()'a çevirir). is_private truthy = gizli.
  if (post.users?.is_private && post.user_id !== meId) {
    if (!meId) return null;
    const { data: follow } = await db
      .from('follows')
      .select('id')
      .eq('follower_id', meId)
      .eq('following_id', post.user_id)
      .maybeSingle();
    if (!follow) return null;
  }

  // Yorumlar ile beğeni/kaydetme/repost durumu birbirinden bağımsız → tek turda paralel.
  // Yorum beğeni SAYISI comment_likes(count) embed'inden gelir; tablo
  // sql/features-comment-likes.sql çalıştırılana kadar YOKtur → embed patlar,
  // embed'siz sorguya düşer ve özellik uykuda kalır (enabled=false).
  const COMMENT_COLS = 'id, content, created_at, parent_id, user_id, users(username, display_name, avatar)';
  const [commentsRes0, likesRes] = await Promise.all([
    db.from('comments')
      .select(`${COMMENT_COLS}, comment_likes(count)`)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      // Büyüme sigortası: viral bir gönderide tüm yorumların SSR'a girmesini
      // engeller (ilk 500 kronolojik; sayfalama gerekirse ileride eklenir).
      .limit(500),
    meId
      ? Promise.all([
          db.from('fact_likes').select('fact_id').eq('user_id', meId).eq('fact_id', postId).maybeSingle(),
          db.from('bookmarks').select('id').eq('user_id', meId).eq('post_id', postId).maybeSingle(),
          db.from('fact_reposts').select('fact_id').eq('user_id', meId).eq('fact_id', postId).maybeSingle(),
        ])
      : Promise.resolve(null),
  ]);
  let commentsRes = commentsRes0;
  const commentLikesEnabled = !commentsRes0.error;
  if (commentsRes0.error) {
    // Embed'siz sorgu comment_likes taşımaz → tip farklı; holding değişkenine cast.
    commentsRes = await db.from('comments')
      .select(COMMENT_COLS).eq('post_id', postId).order('created_at', { ascending: true }).limit(500) as typeof commentsRes0;
  }
  const comments: DetailComment[] = (commentsRes.data ?? []).map((c: any) => ({
    id: c.id, content: c.content, created_at: c.created_at, parent_id: c.parent_id, user_id: c.user_id,
    username: c.users?.username ?? '', display_name: c.users?.display_name ?? '', avatar: c.users?.avatar ?? null,
    likes: Array.isArray(c.comment_likes) && c.comment_likes[0] ? Number(c.comment_likes[0].count) || 0 : 0,
    liked: false, // izleyicinin kendi beğenisi aşağıda doldurulur
  }));
  // İzleyicinin beğendiği yorumlar (tek sorgu, sonra Set ile işaretle).
  if (commentLikesEnabled && meId && comments.length) {
    const { data: mineLikes } = await db.from('comment_likes')
      .select('comment_id').eq('user_id', meId).in('comment_id', comments.map(c => c.id));
    const likedSet = new Set((mineLikes ?? []).map((r: any) => r.comment_id));
    for (const c of comments) c.liked = likedSet.has(c.id);
  }

  let initialLiked = false;
  let initialBookmarked = false;
  let initialReposted = false;
  if (likesRes) {
    const [lk, bm, rp] = likesRes;
    initialLiked = !!lk.data;
    initialBookmarked = !!bm.data;
    initialReposted = !!rp.data;
  }

  const u = post.users || {};
  const postProp: PostProp = {
    id: post.id,
    user_id: post.user_id,
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

  return { post, u, comments, commentLikesEnabled, initialLiked, initialBookmarked, initialReposted, postProp };
}
