import type { Metadata } from 'next';
import { db, getMe, logIfError } from '@/lib/supabase/server';
import { flattenFacts, flattenPosts, type QuickFact, type Post } from '@/lib/types';
import HomeFeed from './components/HomeFeed';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Basements',
  url: 'https://basementonfire.com',
  inLanguage: 'tr-TR',
  description: 'Bilim, tarih ve kültürü interaktif makaleler ve toplulukla keşfet.',
};

export default async function HomePage() {
  const { me } = await getMe();

  const [{ data: rawFacts, error: factsErr }, { data: rawPosts, error: postsErr }] = await Promise.all([
    db.from('quick_facts').select('*, users!quick_facts_user_id_fkey(display_name, username, avatar)').order('created_at', { ascending: false }).limit(30),
    db.from('posts').select('*, users!posts_user_id_fkey(display_name, username, avatar)').order('created_at', { ascending: false }).limit(30),
  ]);
  logIfError('home quick_facts', factsErr);
  logIfError('home posts', postsErr);

  const facts: QuickFact[] = flattenFacts(rawFacts ?? []);
  const posts: Post[] = flattenPosts(rawPosts ?? []);

  type FeedItem = (QuickFact & { kind: 'fact' }) | (Post & { kind: 'post' });
  const feedItems: FeedItem[] = [
    ...facts.map(f => ({ ...f, kind: 'fact' as const })),
    ...posts.map(p => ({ ...p, kind: 'post' as const })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 50);

  let likedFactIds: number[] = [];
  let likedPostIds: number[] = [];
  if (me) {
    const [fr, pr] = await Promise.all([
      facts.length ? db.from('fact_likes').select('fact_id').eq('user_id', me.id).in('fact_id', facts.map(f => f.id)) : { data: [] },
      posts.length ? db.from('post_likes').select('post_id').eq('user_id', me.id).in('post_id', posts.map(p => p.id)) : { data: [] },
    ]);
    likedFactIds = (fr.data ?? []).map((r: any) => r.fact_id);
    likedPostIds = (pr.data ?? []).map((r: any) => r.post_id);
  }

  // Suggested users
  let suggestedUsers: Array<{ id: number; username: string; display_name: string; bio: string | null; mutual_count: number }> = [];
  if (me) {
    const { data: myFollows } = await db.from('follows').select('following_id').eq('follower_id', me.id);
    const myFollowIds: number[] = (myFollows ?? []).map((f: any) => f.following_id);
    const excludeIds = [me.id, ...myFollowIds];
    const excludeStr = `(${excludeIds.join(',')})`;

    if (myFollowIds.length > 0) {
      const { data: fofRaw } = await db.from('follows').select('following_id').in('follower_id', myFollowIds).not('following_id', 'in', excludeStr);
      if (fofRaw?.length) {
        const countMap = new Map<number, number>();
        for (const f of fofRaw as any[]) countMap.set(f.following_id, (countMap.get(f.following_id) ?? 0) + 1);
        const topIds = [...countMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);
        const { data: users } = await db.from('users').select('id, username, display_name, bio').in('id', topIds);
        suggestedUsers = (users ?? []).map((u: any) => ({ ...u, mutual_count: countMap.get(u.id) ?? 0 }));
      }
    }

    if (suggestedUsers.length < 3) {
      const existingIds = new Set([...excludeIds, ...suggestedUsers.map(u => u.id)]);
      const { data: recent } = await db.from('users').select('id, username, display_name, bio')
        .not('id', 'in', `(${[...existingIds].join(',')})`)
        .order('created_at', { ascending: false }).limit(10);
      for (const u of (recent ?? []) as any[]) {
        if (!existingIds.has(u.id) && suggestedUsers.length < 5) {
          suggestedUsers.push({ ...u, mutual_count: 0 });
          existingIds.add(u.id);
        }
      }
    }
  }

  // Stories
  interface StoryItem { id: number; mediaUrl: string; mediaType: string; createdAt: string; }
  interface StoryUser { userId: number; username: string; displayName: string; avatar: string | null; stories: StoryItem[]; }

  const { data: storiesRaw, error: storiesErr } = await db
    .from('stories')
    .select('id, media_url, media_type, created_at, user_id, users(id, username, display_name, avatar)')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });
  logIfError('home stories', storiesErr);

  const storyMap = new Map<number, StoryUser>();
  for (const s of (storiesRaw ?? []) as any[]) {
    const u = s.users;
    const uid: number = s.user_id;
    if (!storyMap.has(uid)) storyMap.set(uid, { userId: uid, username: u.username, displayName: u.display_name, avatar: u.avatar ?? null, stories: [] });
    storyMap.get(uid)!.stories.push({ id: s.id, mediaUrl: s.media_url, mediaType: s.media_type, createdAt: s.created_at });
  }

  const ownStoryUser = me ? (storyMap.get(me.id) ?? null) : null;
  if (me) storyMap.delete(me.id);
  const otherStoryUsers = [...storyMap.values()];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <HomeFeed
        feedItems={feedItems as any}
        likedFactIds={likedFactIds}
        likedPostIds={likedPostIds}
        suggestedUsers={suggestedUsers}
        currentUser={me ? { id: me.id, username: me.username, display_name: me.display_name } : null}
        ownStoryUser={ownStoryUser}
        otherStoryUsers={otherStoryUsers}
      />
    </>
  );
}
