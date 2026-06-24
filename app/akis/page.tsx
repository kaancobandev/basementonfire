import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { db, getMe, logIfError } from '@/lib/supabase/server';
import { flattenFacts, type QuickFact } from '@/lib/types';
import AkisClient from './AkisClient';

export const dynamic = 'force-dynamic';

// İlk sayfa feed'i PAYLAŞILAN (en yeni gönderiler, kişiye özel değil) → 30sn
// önbellek. Kendi yeni gönderini akış istemcisi zaten optimistik gösterir;
// önbellek yalnızca başkalarının görünümünü en fazla 30sn geciktirir.
const getInitialFeed = unstable_cache(
  async (limit: number) => {
    const { data, error } = await db
      .from('quick_facts')
      .select('*, users!quick_facts_user_id_fkey(display_name, username)')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit);
    logIfError('akis quick_facts', error);
    return data ?? [];
  },
  ['akis-initial-feed-v1', 'limit-13'],
  { revalidate: 30, tags: ['feed'] },
);

export const metadata: Metadata = {
  title: 'Akış',
  description: 'Basements topluluğunun en yeni fotoğraf, video ve ses paylaşımları — akışı keşfet.',
  alternates: { canonical: '/akis' },
  openGraph: {
    title: 'Akış · Basements',
    description: 'Basements topluluğunun en yeni fotoğraf, video ve ses paylaşımları.',
    url: '/akis',
    images: ['/opengraph-image'],
  },
};

export default async function AkisPage() {
  const { me } = await getMe();

  const PAGE_SIZE = 12;
  const raw = await getInitialFeed(PAGE_SIZE + 1);

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
