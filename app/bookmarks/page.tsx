import { redirect } from 'next/navigation';
import { db, getMe, logIfError } from '@/lib/supabase/server';
import BookmarksClient from './BookmarksClient';

export const dynamic = 'force-dynamic';

function avatarBg(u: string): string {
  const gs = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)', 'linear-gradient(135deg,#ec4899,#8b5cf6)',
    'linear-gradient(135deg,#f97316,#ef4444)', 'linear-gradient(135deg,#10b981,#3b82f6)',
    'linear-gradient(135deg,#f59e0b,#f97316)', 'linear-gradient(135deg,#14b8a6,#06b6d4)',
    'linear-gradient(135deg,#3b82f6,#6366f1)', 'linear-gradient(135deg,#ef4444,#f97316)',
  ];
  let h = 0;
  for (const c of u) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return gs[Math.abs(h) % gs.length];
}

export default async function BookmarksPage() {
  const { me } = await getMe();
  if (!me) redirect('/login');

  const { data: raw, error } = await db
    .from('bookmarks')
    .select('id, post:post_id(*, users!quick_facts_user_id_fkey(display_name, username))')
    .eq('user_id', me.id)
    .order('created_at', { ascending: false });
  logIfError('bookmarks', error);

  const posts = (raw ?? [])
    .map((b: any) => {
      const p = b.post;
      if (!p) return null;
      return {
        id:           p.id           as number,
        user_id:      p.user_id      as number,
        media_url:    p.media_url    as string,
        media_type:   p.media_type   as string,
        caption:      p.caption      as string,
        likes:        p.likes        as number,
        created_at:   p.created_at   as string,
        media:        (p.media ?? null) as { url: string; type: 'image' | 'video' }[] | null,
        display_name: (p.users?.display_name ?? '') as string,
        username:     (p.users?.username ?? '')     as string,
        avatarBg:     avatarBg(p.users?.username ?? 'a'),
      };
    })
    .filter(Boolean) as Array<{
      id: number; user_id: number; media_url: string; media_type: string; caption: string;
      likes: number; created_at: string; display_name: string; username: string; avatarBg: string;
      media?: { url: string; type: 'image' | 'video' }[] | null;
    }>;

  return <BookmarksClient initialPosts={posts} meId={me.id} />;
}
