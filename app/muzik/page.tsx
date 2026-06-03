import { db, getMe, logIfError } from '@/lib/supabase/server';
import MuzikClient from './MuzikClient';

export const dynamic = 'force-dynamic';

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

  // Tablolar henüz oluşturulmamış olabilir — hata olsa bile boş array döner
  const [spResult, ytResult] = await Promise.all([
    db.from('spotify_playlists')
      .select('id, playlist_id, title, created_at, user_id, users(username, display_name)')
      .order('created_at', { ascending: false })
      .limit(30),
    db.from('youtube_items')
      .select('id, item_type, item_id, title, created_at, user_id, users(username, display_name)')
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  const spRaw = spResult.data;
  const ytRaw = ytResult.data;
  logIfError('muzik spotify_playlists', spResult.error);
  logIfError('muzik youtube_items', ytResult.error);

  const spotifyItems = (spRaw ?? []).map((r: any) => ({
    id:           r.id           as number,
    playlist_id:  r.playlist_id  as string,
    title:        r.title        as string,
    created_at:   r.created_at   as string,
    user_id:      r.user_id      as number,
    username:     (r.users?.username     ?? '') as string,
    display_name: (r.users?.display_name ?? '') as string,
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
