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
    const [{ data: users, error: usersErr }, { data: mediaRaw, error: mediaErr }] = await Promise.all([
      db.from('users').select('id, username, display_name, bio, avatar').order('created_at', { ascending: false }).limit(20),
      db.from('quick_facts').select('id, media_url, media_type, caption, likes, users!quick_facts_user_id_fkey(username, display_name)').order('created_at', { ascending: false }).limit(12),
    ]);
    logIfError('discover users', usersErr);
    logIfError('discover quick_facts', mediaErr);
    return { users: users ?? [], mediaRaw: mediaRaw ?? [] };
  },
  ['discover-content-v1'],
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

function avatarBg(u: string) {
  const gs = ['linear-gradient(135deg,#6366f1,#8b5cf6)','linear-gradient(135deg,#ec4899,#8b5cf6)','linear-gradient(135deg,#f97316,#ef4444)','linear-gradient(135deg,#10b981,#3b82f6)','linear-gradient(135deg,#f59e0b,#f97316)','linear-gradient(135deg,#14b8a6,#06b6d4)','linear-gradient(135deg,#3b82f6,#6366f1)','linear-gradient(135deg,#ef4444,#f97316)'];
  let h = 0; for (const c of u) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return gs[Math.abs(h) % gs.length];
}

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { me } = await getMe();
  const sp = await searchParams;
  const initialQuery = typeof sp.q === 'string' ? sp.q : '';

  // Paylaşılan içerik önbellekten gelir (60sn); kişiye özel değildir.
  const { users, mediaRaw } = await getDiscoverContent();
  const media = (mediaRaw ?? []).map((m: any) => ({ ...m, username: m.users?.username ?? '', display_name: m.users?.display_name ?? '' }));

  // Makale listesi artik tek kaynaktan (lib/articles.ts). Sira ayni -> görünüm degismez.
  return (
    <DiscoverClient
      users={(users ?? []).map((u: any) => ({ ...u, avatarBg: avatarBg(u.username) }))}
      media={media}
      articles={ARTICLES}
      isLoggedIn={!!me}
      initialQuery={initialQuery}
    />
  );
}
