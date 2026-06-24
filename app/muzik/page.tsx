import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { db, getMe, logIfError } from '@/lib/supabase/server';
import MuzikClient from './MuzikClient';

export const dynamic = 'force-dynamic';

// Müzik listeleri PAYLAŞILAN (topluluğun paylaştığı son müzikler) — kişiye özel
// değil, sık değişmez → 120sn önbellek.
const getMusic = unstable_cache(
  async () => {
    const [spResult, ytResult] = await Promise.all([
      db.from('spotify_playlists').select('id, playlist_id, title, created_at, user_id, users(username, display_name, avatar)').order('created_at', { ascending: false }).limit(30),
      db.from('youtube_items').select('id, item_type, item_id, title, created_at, user_id, users(username, display_name, avatar)').order('created_at', { ascending: false }).limit(30),
    ]);
    logIfError('muzik spotify_playlists', spResult.error);
    logIfError('muzik youtube_items', ytResult.error);
    return { sp: spResult.data ?? [], yt: ytResult.data ?? [] };
  },
  ['muzik-content-v1'],
  { revalidate: 120, tags: ['muzik'] },
);

export const metadata: Metadata = {
  title: 'Müzik',
  description: 'Basements topluluğunun paylaştığı Spotify çalma listeleri ve YouTube müzikleri — keşfet ve dinle.',
  alternates: { canonical: '/muzik' },
  openGraph: {
    title: 'Müzik · Basements',
    description: 'Topluluğun paylaştığı Spotify ve YouTube müzikleri.',
    url: '/muzik',
    images: ['/opengraph-image'],
  },
};

function avatarBg(u: string): string {
  const gs = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#1db954,#1ed760)',
    'linear-gradient(135deg,#ec4899,#8b5cf6)',
    'linear-gradient(135deg,#f97316,#ef4444)',
    'linear-gradient(135deg,#14b8a6,#06b6d4)',
    'linear-gradient(135deg,#3b82f6,#6366f1)',
  ];
  let h = 0;
  for (const c of u) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return gs[Math.abs(h) % gs.length];
}

export default async function MuzikPage() {
  const { me } = await getMe();

  // Paylaşılan müzik içeriği önbellekten gelir (120sn).
  const { sp: spRaw, yt: ytRaw } = await getMusic();

  const spotifyItems = (spRaw ?? []).map((r: any) => ({
    id:           r.id           as number,
    playlist_id:  r.playlist_id  as string,
    title:        r.title        as string,
    created_at:   r.created_at   as string,
    user_id:      r.user_id      as number,
    username:     (r.users?.username     ?? '') as string,
    display_name: (r.users?.display_name ?? '') as string,
    avatar:       (r.users?.avatar ?? null) as string | null,
    avatarBg:     avatarBg(r.users?.username ?? 'a'),
  }));

  const youtubeItems = (ytRaw ?? []).map((r: any) => ({
    id:           r.id           as number,
    item_type:    r.item_type    as 'video' | 'playlist',
    item_id:      r.item_id      as string,
    title:        r.title        as string,
    created_at:   r.created_at   as string,
    user_id:      r.user_id      as number,
    username:     (r.users?.username     ?? '') as string,
    display_name: (r.users?.display_name ?? '') as string,
    avatar:       (r.users?.avatar ?? null) as string | null,
    avatarBg:     avatarBg(r.users?.username ?? 'a'),
  }));

  return (
    <MuzikClient
      spotifyItems={spotifyItems}
      youtubeItems={youtubeItems}
      currentUserId={me?.id ?? null}
    />
  );
}
