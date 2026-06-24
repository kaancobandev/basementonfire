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

  // me, getMe()'de zaten users tablosundan select('*') ile geldi → aynı satırı
  // tekrar çekmeye gerek yok (bir DB turu eksilir).
  const user = me as DbUser;

  const { error } = await searchParams;

  // Alan seçimi (select('*') yerine yalnızca kullanılan kolonlar) → daha küçük
  // satırlar, daha hızlı transfer. Limit yok: ızgara sayısı (.length) doğru kalsın
  // (mevcut ölçekte gönderi sayısı küçük; ileride sayfalama gerekirse ayrı count+limit).
  const [followersRes, followingRes, mediaRes, bookmarksRes, repostsRes, progressRes, badgesRes] = await Promise.all([
    db.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
    db.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
    db.from('quick_facts').select('id, media_url, media_type, caption, likes, created_at, media').eq('user_id', user.id).order('created_at', { ascending: false }),
    db.from('bookmarks').select('id, post:post_id(id, media_url, media_type, caption, likes, created_at, media)').eq('user_id', user.id).order('created_at', { ascending: false }),
    db.from('fact_reposts').select('created_at, fact:fact_id(id, media_url, media_type, caption, likes, created_at, media)').eq('user_id', user.id).order('created_at', { ascending: false }),
    // Bilgi/seri ilerlemesi + rozetler. Tablolar yoksa (SQL henuz calismadiysa)
    // hata doner ama yutulur -> profil yine acilir (logIfError YOK, gurultu olmasin).
    db.from('user_progress').select('xp, current_streak, longest_streak, total_correct, total_answered, last_answer_date').eq('user_id', user.id).maybeSingle(),
    db.from('user_badges').select('badge_key, earned_at').eq('user_id', user.id).order('earned_at', { ascending: true }),
  ]);
  logIfError('profile media', mediaRes.error);
  logIfError('profile bookmarks', bookmarksRes.error);
  logIfError('profile reposts', repostsRes.error);

  const progress = progressRes && !progressRes.error ? (progressRes.data ?? null) : null;
  const badgeKeys: string[] = (badgesRes && !badgesRes.error ? (badgesRes.data ?? []) : []).map((b: any) => b.badge_key);

  type MediaPostRow = { id: number; media_url: string; media_type: string; caption: string; likes: number; created_at: string; media?: { url: string; type: 'image' | 'video' }[] | null };
  const mediaPosts = (mediaRes.data ?? []) as MediaPostRow[];
  const savedPosts = ((bookmarksRes.data ?? []) as any[]).map((b: any) => b.post).filter(Boolean) as MediaPostRow[];
  // Repost edilen akış (quick_facts) gönderileri — medya ızgarasında gösterilir
  const repostedPosts = ((repostsRes.data ?? []) as any[]).map((r: any) => r.fact).filter(Boolean) as MediaPostRow[];

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
      progress={progress}
      badgeKeys={badgeKeys}
      error={error ?? null}
    />
  );
}
