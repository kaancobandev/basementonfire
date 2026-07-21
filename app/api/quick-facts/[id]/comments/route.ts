import { db, getMe } from '@/lib/supabase/server';
import { getBlockedUserIds } from '@/lib/blocks';
import { canViewFact } from '@/lib/visibility';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return NextResponse.json({ error: 'Geçersiz id' }, { status: 400 });

  // GÖRÜNÜRLÜK — eskiden bu uç kimlik doğrulaması BİLE yapmıyordu: gizli bir
  // hesabın gönderisinin yorumları (yazan kullanıcı adları dahil) çıkışlı
  // ziyaretçiye açıktı. Gönderiyi görme hakkı yoksa yorumları da görülmez.
  const { me } = await getMe();
  if (!(await canViewFact(postId, me?.id ?? null))) {
    return NextResponse.json({ error: 'Bu gönderiye erişemezsiniz' }, { status: 403 });
  }

  // Yorum beğeni SAYISI comment_likes(count) embed'inden. Tablo
  // sql/features-comment-likes.sql çalıştırılana kadar YOKtur → embed patlar,
  // embed'siz sorguya düşülür ve likesEnabled=false döner (özellik uykuda).
  const COLS = 'id, content, created_at, parent_id, user_id, users(username, display_name, avatar)';
  let res = await db
    .from('comments')
    .select(`${COLS}, comment_likes(count)`)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .limit(300); // limitsizdi: tek gönderiye binlerce yorum gelirse yanıt patlıyordu
  const likesEnabled = !res.error;
  if (res.error) {
    // Embed'siz sorgu comment_likes taşımaz → tip farklı; holding değişkenine cast.
    res = await db.from('comments').select(COLS).eq('post_id', postId).order('created_at', { ascending: true }).limit(300) as typeof res;
  }
  if (res.error) return NextResponse.json({ error: 'Yorumlar alınamadı' }, { status: 500 });

  // Engellediğim + beni engelleyen kullanıcıların yorumları görünmez (feed/arama deseni).
  const blocked = me ? await getBlockedUserIds(me.id) : new Set<number>();

  const visible = (res.data ?? []).filter((c: any) => !blocked.has(c.user_id));

  // İzleyicinin beğendiği yorumlar (tek sorgu, Set ile işaretle).
  let likedSet = new Set<number>();
  if (likesEnabled && me && visible.length) {
    const { data: mineLikes } = await db.from('comment_likes')
      .select('comment_id').eq('user_id', me.id).in('comment_id', visible.map((c: any) => c.id));
    likedSet = new Set((mineLikes ?? []).map((r: any) => r.comment_id));
  }

  const comments = visible.map((c: any) => ({
    id: c.id,
    content: c.content,
    created_at: c.created_at,
    parent_id: c.parent_id,
    user_id: c.user_id,
    username: c.users?.username ?? '',
    display_name: c.users?.display_name ?? '',
    avatar: c.users?.avatar ?? null,
    likes: Array.isArray(c.comment_likes) && c.comment_likes[0] ? Number(c.comment_likes[0].count) || 0 : 0,
    liked: likedSet.has(c.id),
  }));

  return NextResponse.json({ comments, likesEnabled });
}
