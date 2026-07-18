import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { db, getMe, logIfError } from '@/lib/supabase/server';
import { flattenFacts, flattenPosts, type QuickFact, type Post, type DidYouKnow } from '@/lib/types';
import { MATCH_MIN_AGE, isAtLeast } from '@/lib/age';
import HomeFeed from '../components/HomeFeed';

// 2026-07-16: Bu sayfa ESKİDEN app/page.tsx idi (ana sayfa). Ana sayfa statik
// landing'e dönüştüğü için zengin akış BUNA TAŞINDI — içerik birebir aynı,
// hiçbir özellik kaybı yok (DailyQuestion, DidYouKnow, hikâyeler, gönderiler,
// öneriler, eşleşme kartı). /akis AYRI kalır: o medya ızgarası + yükleme akışı.
// Girişli kullanıcının nav'daki "Ana Sayfa"sı buraya gelir (AppShell).
export const dynamic = 'force-dynamic';

// Ana feed'in PAYLAŞILAN kısmı (en yeni quick_facts + posts + aktif stories) —
// herkes için aynı, kişiye özel değil → 30sn önbellek. Kişiye özel veriler
// (beğeni/repost durumu, önerilen kullanıcılar, kendi story'n) bunun DIŞINDA,
// canlı kalır. Kendi yeni gönderin akış istemcisinde optimistik görünür.
const getHomeContent = unstable_cache(
  async () => {
    // Üç sorgu da birbirinden bağımsız → tek Promise.all (stories eskiden
    // arkadan seri geliyordu; cache-miss başına 1 tur eksildi).
    const [{ data: rawFacts, error: factsErr }, { data: rawPosts, error: postsErr }, { data: storiesRaw, error: storiesErr }] = await Promise.all([
      db.from('quick_facts').select('*, users!quick_facts_user_id_fkey(display_name, username, avatar, is_private), comments(count)').order('created_at', { ascending: false }).limit(60),
      db.from('posts').select('*, users!posts_user_id_fkey(display_name, username, avatar, is_private)').order('created_at', { ascending: false }).limit(60),
      db.from('stories')
        .select('id, media_url, media_type, created_at, user_id, users(id, username, display_name, avatar, is_private)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        // Büyüme sigortası: şerit zaten en yeni hikâyeleri gösterir; 24 saatte 100+
        // aktif hikâye olursa en eskiler düşer (limitsiz hali tüm tabloyu çekiyordu).
        .limit(100),
    ]);
    logIfError('feed quick_facts', factsErr);
    logIfError('feed posts', postsErr);
    logIfError('feed stories', storiesErr);
    // Gizli hesapların içeriği küresel ana akışta/story şeridinde gösterilmez (is_private truthy=gizli).
    const pub = (r: any) => !r.users?.is_private;
    return {
      rawFacts: (rawFacts ?? []).filter(pub).slice(0, 30),
      rawPosts: (rawPosts ?? []).filter(pub).slice(0, 30),
      storiesRaw: (storiesRaw ?? []).filter(pub),
    };
  },
  ['home-content-v1'],
  { revalidate: 30, tags: ['feed'] },
);

// "Bunu biliyor muydun?" bilgi kartlari — paylasilan, kisiye ozel degil.
// Tablo henuz yoksa (SQL calismadiysa) sessizce bos doner -> sayfa kirilmaz.
const getDidYouKnow = unstable_cache(
  async (): Promise<DidYouKnow[]> => {
    try {
      // Zengin seçim: yazar imzası (FK canlıda mevcut) + beğeni sayısı.
      // dyk_likes tablosu henüz yoksa (SQL çalışmadıysa) embed hata verir →
      // beğenisiz seçime geri düş (upload route'unun media fallback deseni).
      const COLS = 'id, title, body, source_url, source_label, article_slug, image_url, created_at, user_id, users!did_you_know_user_id_fkey(username, display_name, avatar, is_private, is_deleted)';
      let res: { data: any[] | null; error: unknown } = await db
        .from('did_you_know')
        .select(`${COLS}, dyk_likes(count)`)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(8);
      if (res.error) {
        res = await db
          .from('did_you_know')
          .select(COLS)
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(8);
      }
      if (res.error) return [];
      return ((res.data ?? []) as any[]).map((r) => {
        const u = r.users;
        // Gizli/silinmiş hesabın kimliği küresel yüzeyde gösterilmez — kart
        // (baştan beri olduğu gibi) kalır, imza anonimleşir.
        const author = u && !u.is_private && !u.is_deleted
          ? { username: u.username as string, display_name: u.display_name as string, avatar: (u.avatar ?? null) as string | null }
          : null;
        const likes = Array.isArray(r.dyk_likes) && r.dyk_likes[0] ? Number(r.dyk_likes[0].count) || 0 : 0;
        const { users: _u, dyk_likes: _l, user_id: _uid, ...rest } = r;
        return { ...rest, author, likes } as DidYouKnow;
      });
    } catch {
      return [];
    }
  },
  ['did-you-know-v2'],
  { revalidate: 60, tags: ['feed'] },
);

type SuggestedUser = { id: number; username: string; display_name: string; bio: string | null; avatar: string | null; mutual_count: number };

// Önerilen kullanıcılar dakikalar içinde değişmez ama her istekte 2-4 SERİ sorgu
// koşuyordu → kullanıcı başına 5 dk önbellek (unstable_cache argümanı — meId —
// anahtara otomatik dahil olur, kullanıcılar birbirinin önerisini görmez).
const getSuggestedUsers = unstable_cache(
  async (meId: number): Promise<SuggestedUser[]> => {
    let suggestedUsers: SuggestedUser[] = [];
    const { data: myFollows } = await db.from('follows').select('following_id').eq('follower_id', meId);
    const myFollowIds: number[] = (myFollows ?? []).map((f: any) => f.following_id);
    const excludeIds = [meId, ...myFollowIds];
    const excludeStr = `(${excludeIds.join(',')})`;

    if (myFollowIds.length > 0) {
      const { data: fofRaw } = await db.from('follows').select('following_id').in('follower_id', myFollowIds).not('following_id', 'in', excludeStr);
      if (fofRaw?.length) {
        const countMap = new Map<number, number>();
        for (const f of fofRaw as any[]) countMap.set(f.following_id, (countMap.get(f.following_id) ?? 0) + 1);
        const topIds = [...countMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);
        // Silinmiş hesaplar (anonim künye) önerilerde ÇIKMAZ.
        const { data: users } = await db.from('users').select('id, username, display_name, bio, avatar').in('id', topIds)
          .eq('is_deleted', false);
        suggestedUsers = (users ?? []).map((u: any) => ({ ...u, mutual_count: countMap.get(u.id) ?? 0 }));
      }
    }

    if (suggestedUsers.length < 3) {
      const existingIds = new Set([...excludeIds, ...suggestedUsers.map(u => u.id)]);
      const { data: recent } = await db.from('users').select('id, username, display_name, bio, avatar')
        .not('id', 'in', `(${[...existingIds].join(',')})`)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false }).limit(10);
      for (const u of (recent ?? []) as any[]) {
        if (!existingIds.has(u.id) && suggestedUsers.length < 5) {
          suggestedUsers.push({ ...u, mutual_count: 0 });
          existingIds.add(u.id);
        }
      }
    }
    return suggestedUsers;
  },
  ['feed-suggested-users-v1'],
  { revalidate: 300 },
);

// Kişiye özel akış → arama motoruna kapalı (ana sayfa landing'i indekslenir).
export const metadata: Metadata = {
  title: 'Akışın',
  description: 'Basements akışın: en yeni gönderiler, hikâyeler, günün sorusu ve bilgi kartları.',
  alternates: { canonical: '/feed' },
  robots: { index: false, follow: true },
};

export default async function FeedPage() {
  // getMe (2 ağ turu: auth + users) içerik sorgularına bağımlı değil → paralel.
  // Paylaşılan feed içeriği önbellekten (30sn); kişiye özel değil.
  const [{ me }, [{ rawFacts, rawPosts, storiesRaw }, dyks]] = await Promise.all([
    getMe(),
    Promise.all([getHomeContent(), getDidYouKnow()]),
  ]);

  const facts: QuickFact[] = flattenFacts(rawFacts ?? []);
  const posts: Post[] = flattenPosts(rawPosts ?? []);

  type FeedItem = (QuickFact & { kind: 'fact' }) | (Post & { kind: 'post' }) | (DidYouKnow & { kind: 'dyk' });
  const baseItems: FeedItem[] = [
    ...facts.map(f => ({ ...f, kind: 'fact' as const })),
    ...posts.map(p => ({ ...p, kind: 'post' as const })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 50);

  // Bilgi kartlarini her 4 gönderide bir serpiştir. SON öğeyi DEĞİŞTİRME:
  // sonsuz kaydırma imleci son fact/post'un created_at'ine bağlı (dyk imleç bozar).
  const feedItems: FeedItem[] = [];
  let dykIdx = 0;
  for (let i = 0; i < baseItems.length; i++) {
    feedItems.push(baseItems[i]);
    if ((i + 1) % 4 === 0 && i < baseItems.length - 1 && dykIdx < dyks.length) {
      feedItems.push({ ...dyks[dykIdx++], kind: 'dyk' as const });
    }
  }

  let likedFactIds: number[] = [];
  let likedPostIds: number[] = [];
  let repostedFactIds: number[] = [];
  let likedDykIds: number[] = [];
  let suggestedUsers: SuggestedUser[] = [];
  if (me) {
    // Beğeni/repost durumu (içerik listesine bağlı) ile önerilen kullanıcılar
    // (yalnız me.id'ye bağlı) birbirinden BAĞIMSIZ — eskiden ardışıktı, artık
    // paralel; öneriler ayrıca 5 dk önbellekli (cache-hit'te 0 sorgu).
    const dykIds = dyks.map(d => d.id);
    const [[fr, pr, rr, dl], suggested] = await Promise.all([
      Promise.all([
        facts.length ? db.from('fact_likes').select('fact_id').eq('user_id', me.id).in('fact_id', facts.map(f => f.id)) : { data: [] },
        posts.length ? db.from('post_likes').select('post_id').eq('user_id', me.id).in('post_id', posts.map(p => p.id)) : { data: [] },
        facts.length ? db.from('fact_reposts').select('fact_id').eq('user_id', me.id).in('fact_id', facts.map(f => f.id)) : { data: [] },
        // dyk_likes tablosu yoksa error döner, data null kalır → boş liste (defansif).
        dykIds.length ? db.from('dyk_likes').select('dyk_id').eq('user_id', me.id).in('dyk_id', dykIds) : { data: [] },
      ]),
      getSuggestedUsers(me.id),
    ]);
    likedFactIds = (fr.data ?? []).map((r: any) => r.fact_id);
    likedPostIds = (pr.data ?? []).map((r: any) => r.post_id);
    repostedFactIds = (rr.data ?? []).map((r: any) => r.fact_id);
    likedDykIds = ((dl as any).data ?? []).map((r: any) => r.dyk_id);
    suggestedUsers = suggested;
  }

  // Stories
  interface StoryItem { id: number; mediaUrl: string; mediaType: string; createdAt: string; }
  interface StoryUser { userId: number; username: string; displayName: string; avatar: string | null; stories: StoryItem[]; }

  // storiesRaw yukarıda getHomeContent()'ten (önbellekli) geldi.
  const storyMap = new Map<number, StoryUser>();
  for (const s of (storiesRaw ?? []) as any[]) {
    const u = s.users;
    const uid: number = s.user_id;
    if (!storyMap.has(uid)) storyMap.set(uid, { userId: uid, username: u.username, displayName: u.display_name, avatar: u.avatar ?? null, stories: [] });
    storyMap.get(uid)!.stories.push({ id: s.id, mediaUrl: s.media_url, mediaType: s.media_type, createdAt: s.created_at });
  }

  const ownStoryUser = me ? (storyMap.get(me.id) ?? null) : null;
  if (me) storyMap.delete(me.id);
  const otherStoryUsers = [...storyMap.values()];

  return (
    <HomeFeed
      feedItems={feedItems as any}
      likedFactIds={likedFactIds}
      likedPostIds={likedPostIds}
      repostedFactIds={repostedFactIds}
      likedDykIds={likedDykIds}
      suggestedUsers={suggestedUsers}
      currentUser={me ? { id: me.id, username: me.username, display_name: me.display_name, avatar: me.avatar ?? null } : null}
      canMatch={isAtLeast(me?.birthdate, MATCH_MIN_AGE)}
      ownStoryUser={ownStoryUser}
      otherStoryUsers={otherStoryUsers}
    />
  );
}
