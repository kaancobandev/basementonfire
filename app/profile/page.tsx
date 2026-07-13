import { redirect } from 'next/navigation';
import { db, getMe, isAdmin, logIfError } from '@/lib/supabase/server';
import { bannerGradient } from '@/lib/avatar';
import type { DbUser } from '@/lib/types';
import ProfileClient from './ProfileClient';

export const dynamic = 'force-dynamic';

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
  const [followersRes, followingRes, mediaRes, bookmarksRes, repostsRes, progressRes, badgesRes, articlesRes] = await Promise.all([
    db.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
    db.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
    db.from('quick_facts').select('id, media_url, media_type, caption, likes, created_at, media').eq('user_id', user.id).order('created_at', { ascending: false }),
    db.from('bookmarks').select('id, post:post_id(id, media_url, media_type, caption, likes, created_at, media)').eq('user_id', user.id).order('created_at', { ascending: false }),
    db.from('fact_reposts').select('created_at, fact:fact_id(id, media_url, media_type, caption, likes, created_at, media)').eq('user_id', user.id).order('created_at', { ascending: false }),
    // Bilgi/seri ilerlemesi + rozetler. Tablolar yoksa (SQL henuz calismadiysa)
    // hata doner ama yutulur -> profil yine acilir (logIfError YOK, gurultu olmasin).
    db.from('user_progress').select('xp, current_streak, longest_streak, total_correct, total_answered, last_answer_date').eq('user_id', user.id).maybeSingle(),
    db.from('user_badges').select('badge_key, earned_at').eq('user_id', user.id).order('earned_at', { ascending: true }),
    // Kendi makaleleri (her durum). Tablo yoksa hata yutulur -> profil yine acilir.
    db.from('user_articles').select('id, slug, title, status, cover_url, reject_reason').eq('user_id', user.id).order('created_at', { ascending: false }),
  ]);
  logIfError('profile media', mediaRes.error);
  logIfError('profile bookmarks', bookmarksRes.error);
  logIfError('profile reposts', repostsRes.error);

  const progress = progressRes && !progressRes.error ? (progressRes.data ?? null) : null;
  const badgeKeys: string[] = (badgesRes && !badgesRes.error ? (badgesRes.data ?? []) : []).map((b: any) => b.badge_key);
  const myArticles = (articlesRes && !articlesRes.error ? (articlesRes.data ?? []) : []) as Array<{ id: number; slug: string; title: string; status: string; cover_url: string | null; reject_reason: string | null }>;

  type MediaPostRow = { id: number; media_url: string; media_type: string; caption: string; likes: number; created_at: string; media?: { url: string; type: 'image' | 'video' }[] | null };
  const mediaPosts = (mediaRes.data ?? []) as MediaPostRow[];
  const savedPosts = ((bookmarksRes.data ?? []) as any[]).map((b: any) => b.post).filter(Boolean) as MediaPostRow[];
  // Repost edilen akış (quick_facts) gönderileri — medya ızgarasında gösterilir
  const repostedPosts = ((repostsRes.data ?? []) as any[]).map((r: any) => r.fact).filter(Boolean) as MediaPostRow[];

  const bg = bannerGradient(user.username);

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
      age={calcAge(user.birthdate ?? null)}
      followersCount={followersRes.count ?? 0}
      followingCount={followingRes.count ?? 0}
      mediaPosts={mediaPosts}
      savedPosts={savedPosts}
      repostedPosts={repostedPosts}
      myArticles={myArticles}
      isAdmin={isAdmin(user as any)}
      progress={progress}
      badgeKeys={badgeKeys}
      error={error ?? null}
    />
  );
}
