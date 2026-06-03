import { db, getMe, logIfError } from '@/lib/supabase/server';
import { flattenFacts, type QuickFact } from '@/lib/types';
import AkisClient from './AkisClient';

export const dynamic = 'force-dynamic';

export default async function AkisPage() {
  const { me } = await getMe();

  const PAGE_SIZE = 12;
  const { data: raw, error } = await db
    .from('quick_facts')
    .select('*, users!quick_facts_user_id_fkey(display_name, username)')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(PAGE_SIZE + 1);
  logIfError('akis quick_facts', error);

  const allFetched: QuickFact[] = flattenFacts(raw ?? []);
  const hasMore = allFetched.length > PAGE_SIZE;
  const posts: QuickFact[] = hasMore ? allFetched.slice(0, PAGE_SIZE) : allFetched;
  const initialNextCursor = hasMore ? posts[posts.length - 1].id : null;

  return (
    <AkisClient
      initialPosts={posts}
      initialNextCursor={initialNextCursor}
      initialHasMore={hasMore}
      currentUser={me ? { id: me.id, username: me.username, display_name: me.display_name } : null}
    />
  );
}
