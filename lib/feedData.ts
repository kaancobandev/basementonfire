// ════════════════════════════════════════════════════════════════════════
// /feed'in PAYLAŞILAN veri katmanı — app/feed/page.tsx'ten 2026-07-28'de
// çıkarıldı (ISR dönüşümü).
//
// NEDEN AYRI DOSYA: artık İKİ tüketici var ve ikisinin de AYNI önbellek
// girdisini kullanması şart:
//   1. app/feed/page.tsx      → ISR kabuğu (paylaşılan HTML, herkese aynı)
//   2. app/api/feed/personal  → kişiye özel kat (no-store)
// İkisi ayrı ayrı sorgulasaydı unstable_cache anahtarları da ayrı olur,
// her /feed açılışı DB turunu İKİ kez öderdi. Buradan import edilince
// aynı anahtar paylaşılır → ikinci tüketici cache-hit'te 0 sorgu yapar.
//
// ⚠ SINIR: bu dosyadaki HER ŞEY paylaşılabilir olmalı (herkese aynı).
// Kişiye özel hiçbir şey (beğeni durumu, kitle filtresi, "gördüm" halkası)
// buraya GİREMEZ — paylaşılan önbelleğe kişisel veri koymak, onu 30 saniye
// boyunca herkese servis etmek demektir.
// ════════════════════════════════════════════════════════════════════════

import { unstable_cache } from 'next/cache';
import { db, logIfError } from '@/lib/supabase/server';
import { flattenFacts, flattenPosts, type QuickFact, type Post, type DidYouKnow } from '@/lib/types';

export type SuggestedUser = { id: number; username: string; display_name: string; bio: string | null; avatar: string | null; mutual_count: number };

export type FeedItem = (QuickFact & { kind: 'fact' }) | (Post & { kind: 'post' }) | (DidYouKnow & { kind: 'dyk' });

// `music` opsiyonel — SQL çalıştırılana kadar hiç gelmez (bkz. aşağıdaki geri düşüş).
export interface StoryItem {
  id: number; mediaUrl: string; mediaType: string; createdAt: string;
  music?: { title: string; artist: string | null; src: string; startSec: number } | null;
  linkUrl?: string | null; linkLabel?: string | null;
  poll?: { question: string; options: string[]; correct?: number | null } | null;
  caption?: string | null; seen?: boolean;
}
export interface StoryUser { userId: number; username: string; displayName: string; avatar: string | null; stories: StoryItem[]; }

// Ana feed'in PAYLAŞILAN kısmı (en yeni quick_facts + posts + aktif stories) —
// herkes için aynı, kişiye özel değil → 30sn önbellek. Kişiye özel veriler
// (beğeni/repost durumu, önerilen kullanıcılar, kendi story'n) bunun DIŞINDA,
// /api/feed/personal'da canlı kalır.
export const getHomeContent = unstable_cache(
  async () => {
    // Üç sorgu da birbirinden bağımsız → tek Promise.all.
    // Anket seçenekleri (post_polls) gönderiyle birlikte gelir — herkese aynı
    // veri, paylaşılan önbellekte kalabilir; SAYIMLAR ve kendi oyun istemciden
    // çekilir (kişiye özel). post_polls tablosu yoksa embed'li sorgu hata verir;
    // embed'siz yedek YALNIZ hata dönerse (nadir yol) arkadan koşar.
    const [{ data: rawFacts, error: factsErr }, postsPrimary, { data: storiesRaw, error: storiesErr }] = await Promise.all([
      db.from('quick_facts').select('*, users!quick_facts_user_id_fkey(display_name, username, avatar, is_private), comments(count)').order('created_at', { ascending: false }).limit(60),
      db.from('posts').select('*, users!posts_user_id_fkey(display_name, username, avatar, is_private), post_polls(options)').order('created_at', { ascending: false }).limit(60),
      // `users!stories_user_id_fkey` ŞART — çıplak `users(...)` DEĞİL. story_views
      // tablosu stories↔users arasında ikinci bir ilişki yolu açtığından PostgREST
      // gömmeyi belirsiz sayıp hata veriyor; sonuç sessizce BOŞ hikâye şeridi olur.
      db.from('stories')
        .select('id, media_url, media_type, created_at, user_id, music_track_id, music_start_sec, link_url, link_label, poll_question, poll_options, poll_correct, audience, caption, music:music_tracks(id, title, artist, src), users!stories_user_id_fkey(id, username, display_name, avatar, is_private)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        // Büyüme sigortası: şerit zaten en yeni hikâyeleri gösterir; 24 saatte 100+
        // aktif hikâye olursa en eskiler düşer (limitsiz hali tüm tabloyu çekiyordu).
        .limit(100),
    ]);
    // Nadir yol: post_polls kolonu/tablosu yoksa embed'siz sorguya düş.
    let postsRes = postsPrimary;
    if (postsRes.error) {
      postsRes = await db.from('posts').select('*, users!posts_user_id_fkey(display_name, username, avatar, is_private)').order('created_at', { ascending: false }).limit(60) as any;
    }
    const { data: rawPosts, error: postsErr } = postsRes;
    logIfError('feed quick_facts', factsErr);
    logIfError('feed posts', postsErr);
    // Müzik alanları sql/features-story-music.sql çalıştırılana kadar YOK. O hâlde
    // yukarıdaki sorgu patlar; sade sorguya düşmezsek hikâye şeridi tamamen boş kalır.
    let storiesFinal = storiesRaw;
    if (storiesErr && /music_track_id|music_start_sec|music_tracks|link_url|link_label|poll_question|poll_options|poll_correct|audience|caption/i.test(storiesErr.message)) {
      const { data: sade } = await db.from('stories')
        .select('id, media_url, media_type, created_at, user_id, users!stories_user_id_fkey(id, username, display_name, avatar, is_private)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(100);
      storiesFinal = sade as typeof storiesRaw;
    } else {
      logIfError('feed stories', storiesErr);
    }
    // Gizli hesapların içeriği küresel ana akışta gösterilmez (is_private truthy=gizli).
    const pub = (r: any) => !r.users?.is_private;
    return {
      rawFacts: (rawFacts ?? []).filter(pub).slice(0, 30),
      rawPosts: (rawPosts ?? []).filter(pub).slice(0, 30),
      // HİKAYELER burada is_private ile FİLTRELENMEZ: bu önbellek HERKESE ortak,
      // oysa "sahibi kendi gizli hikayesini görür + gizli hesap takipçisine görünür"
      // KİŞİYE ÖZEL bir karardır → filtre tüketicide, audiencePredicate ile.
      storiesRaw: (storiesFinal ?? []),
    };
  },
  ['home-content-v1'],
  { revalidate: 30, tags: ['feed'] },
);

// "Bunu biliyor muydun?" bilgi kartlari — paylasilan, kisiye ozel degil.
// Tablo henuz yoksa (SQL calismadiysa) sessizce bos doner -> sayfa kirilmaz.
export const getDidYouKnow = unstable_cache(
  async (): Promise<DidYouKnow[]> => {
    try {
      // Zengin seçim: yazar imzası (FK canlıda mevcut) + beğeni sayısı.
      // dyk_likes tablosu henüz yoksa embed hata verir → beğenisiz seçime geri düş.
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
        // Gizli/silinmiş hesabın kimliği küresel yüzeyde gösterilmez — kart kalır, imza anonimleşir.
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

// Önerilen kullanıcılar dakikalar içinde değişmez ama her istekte 2-4 SERİ sorgu
// koşuyordu → kullanıcı başına 5 dk önbellek (unstable_cache argümanı — meId —
// anahtara otomatik dahil olur, kullanıcılar birbirinin önerisini görmez).
export const getSuggestedUsers = unstable_cache(
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

/**
 * Akış öğelerini kur: quick_facts + posts tarihe göre birleşir, her 4 öğede bir
 * bilgi kartı serpiştirilir. TEK KAYNAK — ISR kabuğu ile /api/feed/personal
 * AYNI listeyi üretmek zorunda (kişisel beğeni id'leri bu listeye göre süzülüyor).
 */
export function buildFeedItems(rawFacts: any[], rawPosts: any[], dyks: DidYouKnow[]): { feedItems: FeedItem[]; facts: QuickFact[]; posts: Post[] } {
  const facts: QuickFact[] = flattenFacts(rawFacts ?? []);
  const posts: Post[] = flattenPosts(rawPosts ?? []);

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
  return { feedItems, facts, posts };
}

/**
 * Ham hikâyeleri kullanıcıya göre grupla. `canSee` KİŞİYE ÖZEL kitle yordamı
 * (lib/storyAudience.ts) — anonim kabuk için audiencePredicate(null) verilir,
 * girişli kat için kullanıcının kendi yordamı. Filtre BURADA uygulanır ki
 * hiçbir çağıran atlayamasın.
 */
export function buildStoryUsers(
  storiesRaw: any[],
  canSee: (ownerId: number, audience: string | null | undefined, isPrivate?: boolean) => boolean,
): Map<number, StoryUser> {
  const storyMap = new Map<number, StoryUser>();
  for (const s of (storiesRaw ?? []).filter((s: any) => canSee(s.user_id, s.audience, s.users?.is_private))) {
    const u = s.users;
    const uid: number = s.user_id;
    if (!storyMap.has(uid)) storyMap.set(uid, { userId: uid, username: u.username, displayName: u.display_name, avatar: u.avatar ?? null, stories: [] });
    storyMap.get(uid)!.stories.push({
      id: s.id, mediaUrl: s.media_url, mediaType: s.media_type, createdAt: s.created_at,
      music: s.music ? { title: s.music.title, artist: s.music.artist ?? null, src: s.music.src, startSec: s.music_start_sec ?? 0 } : null,
      linkUrl: s.link_url ?? null,
      linkLabel: s.link_label ?? null,
      // Anket: soru + seçenek metinleri. Oy sayıları istemcide /api/article-poll'dan.
      poll: (s.poll_question && Array.isArray(s.poll_options) && s.poll_options.length >= 2)
        ? { question: s.poll_question as string, options: (s.poll_options as string[]), correct: typeof s.poll_correct === 'number' ? s.poll_correct : null } : null,
      caption: s.caption ?? null,
    });
  }
  return storyMap;
}
