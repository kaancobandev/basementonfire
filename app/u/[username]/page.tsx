import type { Metadata } from 'next';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { db, getMe } from '@/lib/supabase/server';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import { bannerGradient } from '@/lib/avatar';
import UserProfileClient from './UserProfileClient';

export const dynamic = 'force-dynamic';

// generateMetadata + sayfa gövdesi aynı kullanıcı satırını ister → React cache()
// ile istek başına TEK sorgu (getMe deseninin aynısı; iki ayrı select birleşti).
const BASE_COLS = 'id, username, display_name, bio, avatar, is_private, birthdate, location, website, gender, interests';

const getProfileUser = cache(async (username: string) => {
  const { data, error } = await db
    .from('users')
    .select(`${BASE_COLS}, is_deleted`)
    .eq('username', username)
    .single();

  if (error) {
    // sql/features-account-delete.sql henüz çalıştırılmadıysa is_deleted kolonu YOKTUR ve
    // sorgu komple düşer → TÜM profiller 404 olurdu. Eski kolonlarla tekrar dene.
    const { data: fallback } = await db.from('users').select(BASE_COLS).eq('username', username).single();
    return fallback ?? null;
  }

  // Kalıcı silinmiş hesap (anonim künye) → profil YOK say. null döndürmek yeterli:
  // hem sayfa gövdesi hem generateMetadata zaten notFound()'a düşüyor.
  if (!data || data.is_deleted) return null;

  return data;
});

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const u = await getProfileUser(username);

  if (!u) {
    return { title: 'Kullanıcı bulunamadı', robots: { index: false, follow: false } };
  }

  const name = u.display_name || u.username;
  const title = `${name} (@${u.username})`;
  const description = (u.bio && u.bio.trim())
    ? u.bio.trim().slice(0, 160)
    : `${name} (@${u.username}) — Basements'teki profil ve paylaşımlar.`;
  const path = `/u/${u.username}`;

  // Gizli profiller arama motorlarına gösterilmez
  if (u.is_private) {
    return { title, description, alternates: { canonical: path }, robots: { index: false, follow: false } };
  }

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'profile', title: `${title} · Basements`, description, url: path, images: ['/opengraph-image'] },
    twitter: { card: 'summary_large_image', title: `${title} · Basements`, description },
  };
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

  // Profil sorgusu ile getMe (2 tur: auth + users) birbirinden bağımsız → paralel.
  const [profileUser, { me }] = await Promise.all([getProfileUser(username), getMe()]);

  if (!profileUser) redirect('/');

  // Kendi profili ise /profile'a yönlendir
  if (me?.id === profileUser.id) redirect('/profile');

  // Takip + engel durumu: birbirinden bağımsız iki sorgu → tek turda paralel.
  // blocks tablosu yoksa (SQL çalışmadı) sessizce false kalır.
  let isFollowing = false;
  let iBlocked = false, blockedMe = false;
  if (me) {
    const [followRes, blocksRes] = await Promise.all([
      db.from('follows')
        .select('id')
        .eq('follower_id', me.id)
        .eq('following_id', profileUser.id)
        .maybeSingle(),
      db.from('blocks')
        .select('blocker_id')
        .or(`and(blocker_id.eq.${me.id},blocked_id.eq.${profileUser.id}),and(blocker_id.eq.${profileUser.id},blocked_id.eq.${me.id})`),
    ]);
    isFollowing = !!followRes.data;
    for (const r of (blocksRes.data ?? []) as { blocker_id: number }[]) {
      if (r.blocker_id === me.id) iBlocked = true; else blockedMe = true;
    }
  }

  // Gizli hesap VEYA (iki yönlü) engel → içerik gizli.
  const isHidden = (profileUser.is_private && !isFollowing) || iBlocked || blockedMe;

  const [followersRes, followingRes, postsRes, articlesRes, progressRes, badgesRes] = await Promise.all([
    db.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profileUser.id),
    db.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profileUser.id),
    isHidden
      ? Promise.resolve({ data: [] })
      : db.from('quick_facts')
          // Kolon seçimi (kendi profil sayfasındaki listeyle aynı) — select('*')
          // gereksiz kolonları taşıyordu. Limit yok: ızgara sayısı (.length) doğru kalsın.
          .select('id, media_url, media_type, caption, likes, created_at, media')
          .eq('user_id', profileUser.id)
          .order('created_at', { ascending: false }),
    // Yayindaki (onayli) makaleleri — gizli profilde gosterilmez.
    isHidden
      ? Promise.resolve({ data: [] })
      : db.from('user_articles')
          .select('slug, title, summary, cover_url, category')
          .eq('user_id', profileUser.id)
          .eq('status', 'approved')
          .order('published_at', { ascending: false }),
    // Bilgi/seri vitrini (XP, seri, rozetler) — /profile ile aynı veri, artık
    // HERKESE AÇIK profilde de görünür (görünmeyen statü çalışmaz). Gizli
    // profilde gösterilmez; tablolar yoksa hata yutulur, bölüm gizlenir.
    isHidden
      ? Promise.resolve({ data: null, error: null } as any)
      : db.from('user_progress').select('xp, current_streak, longest_streak, total_correct').eq('user_id', profileUser.id).maybeSingle(),
    isHidden
      ? Promise.resolve({ data: [], error: null } as any)
      : db.from('user_badges').select('badge_key, earned_at').eq('user_id', profileUser.id).order('earned_at', { ascending: true }),
  ]);

  const progress = progressRes && !progressRes.error ? ((progressRes.data ?? null) as { xp: number; current_streak: number; longest_streak: number; total_correct: number } | null) : null;
  const badgeKeys: string[] = (badgesRes && !badgesRes.error ? ((badgesRes.data ?? []) as any[]) : []).map((b: any) => b.badge_key);

  const mediaPosts = (postsRes.data ?? []) as Array<{
    id: number; media_url: string; media_type: string; caption: string; likes: number; created_at: string;
    media?: { url: string; type: 'image' | 'video' }[] | null;
  }>;
  const articles = ((articlesRes as any).data ?? []) as Array<{ slug: string; title: string; summary: string; cover_url: string | null; category: string | null }>;

  // Herkese açık profiller için ProfilePage + Person JSON-LD (LinkedIn deseni):
  // takipçi sayısı interactionStatistic olarak Google'a "otorite" sinyali verir.
  const profileJsonLd = !isHidden ? {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: profileUser.display_name || profileUser.username,
      alternateName: `@${profileUser.username}`,
      identifier: profileUser.username,
      url: `https://basementonfire.com/u/${profileUser.username}`,
      ...(profileUser.bio ? { description: String(profileUser.bio).slice(0, 250) } : {}),
      ...(profileUser.avatar && profileUser.avatar !== '/avatars/default.png' ? { image: profileUser.avatar } : {}),
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/FollowAction',
        userInteractionCount: followersRes.count ?? 0,
      },
    },
  } : null;

  // Kırıntı navigasyonu: Ana Sayfa → @kullanıcı (gizli profilde gösterilmez)
  const breadcrumbLd = !isHidden ? breadcrumbJsonLd([
    { name: 'Ana Sayfa', path: '/' },
    { name: profileUser.display_name || `@${profileUser.username}` },
  ]) : null;

  return (
    <>
      {profileJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(profileJsonLd) }} />}
      {breadcrumbLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />}
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
        birthdate: null, // ham DOB'yi istemciye SIZDIRMA — yaş ayrı `age` prop'uyla gidiyor
        interests: (profileUser as any).interests ?? [],
      }}
      bg={bannerGradient(profileUser.username)}
      age={calcAge((profileUser as any).birthdate ?? null)}
      followersCount={followersRes.count ?? 0}
      followingCount={followingRes.count ?? 0}
      isFollowing={isFollowing}
      isHidden={isHidden}
      iBlocked={iBlocked}
      blockedMe={blockedMe}
      mediaPosts={mediaPosts}
      articles={articles}
      progress={progress}
      badgeKeys={badgeKeys}
      me={me ? { id: me.id, username: me.username, display_name: me.display_name, avatar: me.avatar ?? null } : null}
    />
    </>
  );
}
