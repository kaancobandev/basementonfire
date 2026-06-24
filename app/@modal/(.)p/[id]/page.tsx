import { getMe } from '@/lib/supabase/server';
import { getPostDetail } from '@/app/p/[id]/postData';
import PostModal from './PostModal';

export const dynamic = 'force-dynamic';

// Yumuşak gezinmede (Link tıklaması) /p/[id]'yi yakalar → modal olarak gösterir.
// Yenileme / derin-bağlantı / krawler hard-nav yaptığında interception devre dışı
// kalır ve tam app/p/[id]/page.tsx sayfası (metadata + JSON-LD ile) render olur.
export default async function InterceptedPostModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return null;

  const { me } = await getMe();
  const detail = await getPostDetail(postId, me?.id ?? null);
  if (!detail) return null;

  return (
    <PostModal
      post={detail.postProp}
      initialComments={detail.comments}
      initialLiked={detail.initialLiked}
      initialBookmarked={detail.initialBookmarked}
      initialReposted={detail.initialReposted}
      currentUser={me ? { id: me.id, username: me.username, display_name: me.display_name, avatar: me.avatar ?? null } : null}
    />
  );
}
