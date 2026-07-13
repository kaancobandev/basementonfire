import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { db, getMe, logIfError } from '@/lib/supabase/server';
import { ARTICLES } from '@/lib/articles';
import DiscoverClient from './DiscoverClient';

export const dynamic = 'force-dynamic';

// PAYLAŞILAN içerik (son kullanıcılar + son medya) — herkes için aynı, kişiye özel
// değil → güvenle önbelleğe alınır. 60sn boyunca tekrar DB'ye gidilmez (revalidate).
// getMe/isLoggedIn gibi kişiye özel veri bunun DIŞINDA, canlı kalır.
const getDiscoverContent = unstable_cache(
  async () => {
    const [{ data: users, error: usersErr }, { data: mediaRaw, error: mediaErr }, { data: uaRaw, error: uaErr }] = await Promise.all([
      db.from('users').select('id, username, display_name, bio, avatar').order('created_at', { ascending: false }).limit(20),
      db.from('quick_facts').select('id, media_url, media_type, caption, likes, users!quick_facts_user_id_fkey(username, display_name, is_private)').order('created_at', { ascending: false }).limit(24),
      db.from('user_articles').select('id, slug, title, summary, cover_url, category, users!user_articles_user_id_fkey(username, display_name)').eq('status', 'approved').order('published_at', { ascending: false }).limit(12),
    ]);
    logIfError('discover users', usersErr);
    logIfError('discover quick_facts', mediaErr);
    logIfError('discover user_articles', uaErr);
    // Gizli hesapların gönderi medyası Keşfet ızgarasında gösterilmez (is_private truthy=gizli).
    const media = ((mediaRaw ?? []) as any[]).filter((r) => !r.users?.is_private).slice(0, 12);
    return { users: users ?? [], mediaRaw: media, uaRaw: uaRaw ?? [] };
  },
  ['discover-content-v2'],
  { revalidate: 60, tags: ['feed'] },
);

export const metadata: Metadata = {
  title: 'Keşfet',
  description: 'Basements\'te kullanıcıları, gönderileri ve konuları keşfet; yeni insanlar ve içerikler bul.',
  alternates: { canonical: '/discover' },
  openGraph: {
    title: 'Keşfet · Basements',
    description: 'Kullanıcıları, gönderileri ve konuları keşfet.',
    url: '/discover',
    images: ['/opengraph-image'],
  },
};

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { me } = await getMe();
  const sp = await searchParams;
  const initialQuery = typeof sp.q === 'string' ? sp.q : '';

  // Paylaşılan içerik önbellekten gelir (60sn); kişiye özel değildir.
  const { users, mediaRaw, uaRaw } = await getDiscoverContent();
  const media = (mediaRaw ?? []).map((m: any) => ({ ...m, username: m.users?.username ?? '', display_name: m.users?.display_name ?? '' }));
  const communityArticles = (uaRaw ?? []).map((a: any) => ({
    slug: a.slug, title: a.title, summary: a.summary ?? '', cover_url: a.cover_url ?? null,
    category: a.category ?? null, author: a.users?.display_name || a.users?.username || 'Kullanıcı', username: a.users?.username ?? '',
  }));

  // Makale listesi artik tek kaynaktan (lib/articles.ts). Sira ayni -> görünüm degismez.
  return (
    <DiscoverClient
      users={users ?? []}
      media={media}
      articles={ARTICLES}
      communityArticles={communityArticles}
      isLoggedIn={!!me}
      initialQuery={initialQuery}
    />
  );
}
