import type { Metadata } from 'next';
import { db, getMe } from '@/lib/supabase/server';
import { getBlockedUserIds } from '@/lib/blocks';
import { factMediaList } from '@/lib/types';
import ReelsClient, { type Reel } from './ReelsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reels',
  description: 'Basementonfire videolarını tam ekran, tek tek keşfet.',
  alternates: { canonical: '/reels' },
};

// Dikey, tam ekran video akışı. Mevcut VİDEO gönderilerini (quick_facts) çeker;
// medyası video olanları süzer. Kişiye özel (beğeni durumu) canlı; gizli hesap +
// engellenen kullanıcı içeriği küresel yüzeydeki gibi elenir.
export default async function ReelsPage() {
  const { me } = await getMe();

  const { data } = await db
    .from('quick_facts')
    .select('id, caption, media_url, media_type, media, likes, created_at, user_id, users!quick_facts_user_id_fkey(username, display_name, avatar, is_private), comments(count)')
    .order('created_at', { ascending: false })
    .limit(80);

  const blocked = me ? await getBlockedUserIds(me.id) : new Set<number>();

  // Video taşıyan + gizli olmayan + engellenmemiş gönderiler → ilk video URL'i.
  const rows = (data ?? []).filter((r: any) => !r.users?.is_private && !blocked.has(r.user_id));
  const reels: Reel[] = [];
  for (const r of rows as any[]) {
    const video = factMediaList(r).find((m) => m.type === 'video');
    if (!video) continue;
    reels.push({
      id: r.id,
      videoUrl: video.url,
      caption: r.caption ?? '',
      likes: r.likes ?? 0,
      comments: Array.isArray(r.comments) && r.comments[0] ? Number(r.comments[0].count) || 0 : 0,
      liked: false, // aşağıda doldurulur
      username: r.users?.username ?? '',
      displayName: r.users?.display_name ?? '',
      avatar: r.users?.avatar ?? null,
    });
  }

  // İzleyicinin beğendiği reels (tek sorgu, Set ile işaretle).
  if (me && reels.length) {
    const { data: mineLikes } = await db
      .from('fact_likes').select('fact_id').eq('user_id', me.id).in('fact_id', reels.map((r) => r.id));
    const likedSet = new Set((mineLikes ?? []).map((x: any) => x.fact_id));
    for (const r of reels) r.liked = likedSet.has(r.id);
  }

  return <ReelsClient reels={reels} loggedIn={!!me} />;
}
