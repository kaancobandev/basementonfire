import { redirect } from 'next/navigation';
import { db, getMe, logIfError } from '@/lib/supabase/server';
import BookmarksClient from './BookmarksClient';

export const dynamic = 'force-dynamic';

export default async function BookmarksPage() {
  const { me } = await getMe();
  if (!me) redirect('/login');

  // collection_id, sql/features-bookmark-collections.sql çalıştırılana kadar YOK.
  // O hâlde bu sorgu tümüyle patlar ve sayfa BOŞ görünürdü → kolonsuz sorguya
  // düşüp özelliği uykuda bırakıyoruz (comment_likes deseni).
  const COLS = 'id, post:post_id(*, users!quick_facts_user_id_fkey(display_name, username, avatar))';
  let res = await db
    .from('bookmarks')
    .select(`${COLS}, collection_id`)
    .eq('user_id', me.id)
    .order('created_at', { ascending: false });
  const collectionsEnabled = !res.error;
  if (res.error) {
    res = await db.from('bookmarks').select(COLS).eq('user_id', me.id)
      .order('created_at', { ascending: false }) as typeof res;
  }
  const { data: raw, error } = res;
  logIfError('bookmarks', error);

  // Koleksiyon listesi — kayıt sayıları istemcide hesaplanır (elimizde zaten
  // tüm kayıtlar var; ayrıca sorgu atmaya gerek yok).
  let collections: { id: number; name: string }[] = [];
  if (collectionsEnabled) {
    const { data: cols } = await db
      .from('collections').select('id, name').eq('user_id', me.id).order('created_at', { ascending: true });
    collections = (cols ?? []) as { id: number; name: string }[];
  }

  const posts = (raw ?? [])
    .map((b: any) => {
      const p = b.post;
      if (!p) return null;
      return {
        collectionId: (b.collection_id ?? null) as number | null,
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
        avatar:       (p.users?.avatar ?? null)     as string | null,
      };
    })
    .filter(Boolean) as Array<{
      id: number; user_id: number; media_url: string; media_type: string; caption: string;
      likes: number; created_at: string; display_name: string; username: string;
      avatar: string | null; collectionId: number | null;
      media?: { url: string; type: 'image' | 'video' }[] | null;
    }>;

  return (
    <BookmarksClient
      initialPosts={posts}
      meId={me.id}
      collections={collections}
      collectionsEnabled={collectionsEnabled}
    />
  );
}
