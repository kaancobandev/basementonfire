import { redirect } from 'next/navigation';
import { db, getMe, logIfError } from '@/lib/supabase/server';
import BookmarksClient from './BookmarksClient';

export const dynamic = 'force-dynamic';

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
      };
    })
    .filter(Boolean) as Array<{
      id: number; user_id: number; media_url: string; media_type: string; caption: string;
      likes: number; created_at: string; display_name: string; username: string;
      media?: { url: string; type: 'image' | 'video' }[] | null;
    }>;

  return <BookmarksClient initialPosts={posts} meId={me.id} />;
}
