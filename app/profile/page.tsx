import { redirect } from 'next/navigation';
import { db, getMe, logIfError } from '@/lib/supabase/server';
import type { DbUser } from '@/lib/types';
import ProfileClient from './ProfileClient';

export const dynamic = 'force-dynamic';

function avatarBg(u: string): string {
  const gs = ['linear-gradient(135deg,#6366f1,#8b5cf6)','linear-gradient(135deg,#ec4899,#8b5cf6)','linear-gradient(135deg,#f97316,#ef4444)','linear-gradient(135deg,#10b981,#3b82f6)','linear-gradient(135deg,#f59e0b,#f97316)','linear-gradient(135deg,#14b8a6,#06b6d4)','linear-gradient(135deg,#3b82f6,#6366f1)','linear-gradient(135deg,#ef4444,#f97316)'];
  let h = 0; for (const c of u) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return gs[Math.abs(h) % gs.length];
}

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { me } = await getMe();
  if (!me) redirect('/login');

  const { data: userData } = await db.from('users').select('*').eq('id', me.id).single();
  if (!userData) redirect('/login');
  const user = userData as DbUser;

  const { error } = await searchParams;

  const [followersRes, followingRes, mediaRes, bookmarksRes, repostsRes] = await Promise.all([
    db.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
    db.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
    db.from('quick_facts').select('id, media_url, media_type, caption, likes, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
    db.from('bookmarks').select('id, post:post_id(id, media_url, media_type, caption, likes, created_at)').eq('user_id', user.id).order('created_at', { ascending: false }),
    db.from('reposts').select('created_at, post:post_id(id, content, image_url, category, likes, reposts, created_at, users!posts_user_id_fkey(display_name, username))').eq('user_id', user.id).order('created_at', { ascending: false }),
  ]);
  logIfError('profile media', mediaRes.error);
  logIfError('profile bookmarks', bookmarksRes.error);
  logIfError('profile reposts', repostsRes.error);

  const mediaPosts = (mediaRes.data ?? []) as Array<{ id: number; media_url: string; media_type: string; caption: string; likes: number; created_at: string }>;
  const savedPosts = ((bookmarksRes.data ?? []) as any[]).map((b: any) => b.post).filter(Boolean) as Array<{ id: number; media_url: string; media_type: string; caption: string; likes: number; created_at: string }>;
  const repostedPosts = ((repostsRes.data ?? []) as any[]).map((r: any) => {
    const p = r.post; if (!p) return null;
    return { id: p.id, content: p.content, image_url: p.image_url, category: p.category, likes: p.likes, reposts: p.reposts, created_at: p.created_at, display_name: p.users?.display_name ?? '', username: p.users?.username ?? '' };
  }).filter(Boolean) as any[];

  const bg = avatarBg(user.username);
  const hasPhoto = !!user.avatar && user.avatar !== '/avatars/default.png';

  function calcAge(bd: string | null): number | null {
    if (!bd) return null;
    const d = new Date(bd), t = new Date();
    let a = t.getFullYear() - d.getFullYear();
    const m = t.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
    return a;
  }

  return (
    <ProfileClient
      user={user}
      bg={bg}
      hasPhoto={hasPhoto}
      age={calcAge(user.birthdate ?? null)}
      followersCount={followersRes.count ?? 0}
      followingCount={followingRes.count ?? 0}
      mediaPosts={mediaPosts}
      savedPosts={savedPosts}
      repostedPosts={repostedPosts}
      error={error ?? null}
    />
  );
}
