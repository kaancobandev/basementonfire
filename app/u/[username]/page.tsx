import { redirect } from 'next/navigation';
import { db, getMe } from '@/lib/supabase/server';
import UserProfileClient from './UserProfileClient';

export const dynamic = 'force-dynamic';

function avatarBg(u: string): string {
  const gs = ['linear-gradient(135deg,#6366f1,#8b5cf6)','linear-gradient(135deg,#ec4899,#8b5cf6)','linear-gradient(135deg,#f97316,#ef4444)','linear-gradient(135deg,#10b981,#3b82f6)','linear-gradient(135deg,#f59e0b,#f97316)','linear-gradient(135deg,#14b8a6,#06b6d4)','linear-gradient(135deg,#3b82f6,#6366f1)','linear-gradient(135deg,#ef4444,#f97316)'];
  let h = 0; for (const c of u) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return gs[Math.abs(h) % gs.length];
}

function calcAge(bd: string | null): number | null {
  if (!bd) return null;
  const d = new Date(bd), t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
  return a;
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const { data: profileUser } = await db
    .from('users')
    .select('id, username, display_name, bio, avatar, is_private, birthdate, location, website, gender, interests')
    .eq('username', username)
    .single();

  if (!profileUser) redirect('/');

  const { me } = await getMe();

  // Kendi profili ise /profile'a yönlendir
  if (me?.id === profileUser.id) redirect('/profile');

  // Takip durumu
  let isFollowing = false;
  if (me) {
    const { data } = await db
      .from('follows')
      .select('id')
      .eq('follower_id', me.id)
      .eq('following_id', profileUser.id)
      .single();
    isFollowing = !!data;
  }

  const isHidden = profileUser.is_private && !isFollowing;

  const [followersRes, followingRes, postsRes] = await Promise.all([
    db.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profileUser.id),
    db.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profileUser.id),
    isHidden
      ? Promise.resolve({ data: [] })
      : db.from('quick_facts')
          .select('id, media_url, media_type, caption, likes, created_at')
          .eq('user_id', profileUser.id)
          .order('created_at', { ascending: false }),
  ]);

  const mediaPosts = (postsRes.data ?? []) as Array<{
    id: number; media_url: string; media_type: string; caption: string; likes: number; created_at: string;
  }>;

  return (
    <UserProfileClient
      profileUser={{
        id: profileUser.id,
        username: profileUser.username,
        display_name: profileUser.display_name,
        bio: profileUser.bio ?? null,
        avatar: profileUser.avatar ?? null,
        is_private: profileUser.is_private,
        location: (profileUser as any).location ?? null,
        website: (profileUser as any).website ?? null,
        gender: (profileUser as any).gender ?? '',
        birthdate: (profileUser as any).birthdate ?? null,
        interests: (profileUser as any).interests ?? [],
      }}
      bg={avatarBg(profileUser.username)}
      age={calcAge((profileUser as any).birthdate ?? null)}
      followersCount={followersRes.count ?? 0}
      followingCount={followingRes.count ?? 0}
      isFollowing={isFollowing}
      isHidden={isHidden}
      mediaPosts={mediaPosts}
      me={me ? { id: me.id, username: me.username, display_name: me.display_name } : null}
    />
  );
}
