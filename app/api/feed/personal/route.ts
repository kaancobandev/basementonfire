import { NextResponse } from 'next/server';
import { db, getMe } from '@/lib/supabase/server';
import { audiencePredicate } from '@/lib/storyAudience';
import { getHomeContent, getDidYouKnow, getSuggestedUsers, buildFeedItems, buildStoryUsers } from '@/lib/feedData';
import { MATCH_MIN_AGE, isAtLeast } from '@/lib/age';
import { MATCHING_ENABLED } from '@/lib/features';

// ════════════════════════════════════════════════════════════════════════
// /feed'in KİŞİYE ÖZEL katı. Sayfanın kendisi 2026-07-28'de ISR'a çevrildi
// (paylaşılan HTML, CDN'de durur); kullanıcıya ait ne varsa buraya taşındı.
//
// Bu uç ASLA cache'lenmez. Paylaşılan kabuk + no-store kişisel kat ayrımı,
// /muzik ve /hashtag/[tag]'in zaten kullandığı desenin akışa uygulanmışı.
//
// Maliyet: getHomeContent/getDidYouKnow BURADA YENİDEN SORGULAMAZ —
// lib/feedData'daki aynı unstable_cache girdilerini paylaşır (sayfa zaten
// ısıtmıştır) → bu uç pratikte yalnız kullanıcıya ait sorguları koşar.
// ════════════════════════════════════════════════════════════════════════
export const dynamic = 'force-dynamic';

export async function GET() {
  const { me } = await getMe();
  // Anonim: kabukta zaten public hikâyeler var, değiştirilecek bir şey yok.
  // `user: null` istemciye "ısrar etme" der (istemci de zaten çerez görmeden çağırmaz).
  if (!me) {
    return NextResponse.json({ user: null }, { headers: { 'Cache-Control': 'private, no-store' } });
  }

  // Paylaşılan içerik (önbellekten) — kişisel sorguları KAPSAMAK için gerekli:
  // beğeni id'leri yalnız akışta GÖRÜNEN öğeler için sorgulanır.
  const [{ rawFacts, rawPosts, storiesRaw }, dyks] = await Promise.all([
    getHomeContent(),
    getDidYouKnow(),
  ]);
  const { facts, posts } = buildFeedItems(rawFacts ?? [], rawPosts ?? [], dyks);

  const dykIds = dyks.map((d) => d.id);
  const allStoryIds: number[] = ((storiesRaw ?? []) as any[]).map((s) => s.id);

  // Girdilerinin hepsi hazır ve birbirlerine bağımlı değiller → TEK Promise.all.
  // (Eskiden sayfa içinde ardışıktı; 2026-07-23 denetiminde paralelleştirilmişti,
  // o kazanım burada korunuyor.)
  //
  // GÖRÜLMEMİŞ (story_views) id'leri kitle filtresinden ÖNCEKİ ham listeden alınır.
  // Fazlası ZARARSIZ: viewer_id=me.id koşulu yalnız kullanıcının KENDİ "gördüm"
  // kayıtlarını döndürür; görünmeyen hikâye filtrelenmiş storyMap'e zaten girmez.
  const [canSeeStory, fr, pr, rr, dl, suggestedUsers, seenRes] = await Promise.all([
    audiencePredicate(me.id),
    facts.length ? db.from('fact_likes').select('fact_id').eq('user_id', me.id).in('fact_id', facts.map((f) => f.id)) : Promise.resolve({ data: [] as any[] }),
    posts.length ? db.from('post_likes').select('post_id').eq('user_id', me.id).in('post_id', posts.map((p) => p.id)) : Promise.resolve({ data: [] as any[] }),
    facts.length ? db.from('fact_reposts').select('fact_id').eq('user_id', me.id).in('fact_id', facts.map((f) => f.id)) : Promise.resolve({ data: [] as any[] }),
    // dyk_likes tablosu yoksa error döner, data null kalır → boş liste (defansif).
    dykIds.length ? db.from('dyk_likes').select('dyk_id').eq('user_id', me.id).in('dyk_id', dykIds) : Promise.resolve({ data: [] as any[] }),
    getSuggestedUsers(me.id),
    allStoryIds.length ? db.from('story_views').select('story_id').eq('viewer_id', me.id).in('story_id', allStoryIds) : Promise.resolve({ data: [] as any[] }),
  ]);

  // Hikâye şeridi — KİŞİYE ÖZEL kitle filtresiyle yeniden kurulur.
  const storyMap = buildStoryUsers(storiesRaw ?? [], canSeeStory);
  const ownStoryUser = storyMap.get(me.id) ?? null;
  storyMap.delete(me.id);

  // Görülmemiş halkası. Kendi hikâyen (yukarıda map'ten çıktı) işaretlenmez.
  const seenStoryIds = new Set<number>((((seenRes as any).data ?? []) as any[]).map((r: any) => r.story_id));
  for (const u of storyMap.values()) for (const st of u.stories) st.seen = seenStoryIds.has(st.id);

  // İzlenmemiş hikâyesi olan kullanıcılar ÖNE; kendi aralarında mevcut sıra korunur.
  const otherStoryUsers = [...storyMap.values()].sort((a, b) =>
    (a.stories.some((st) => !st.seen) ? 0 : 1) - (b.stories.some((st) => !st.seen) ? 0 : 1));

  return NextResponse.json(
    {
      user: { id: me.id, username: me.username, display_name: me.display_name, avatar: me.avatar ?? null },
      canMatch: MATCHING_ENABLED && isAtLeast(me.birthdate, MATCH_MIN_AGE),
      likedFactIds: ((fr as any).data ?? []).map((r: any) => r.fact_id),
      likedPostIds: ((pr as any).data ?? []).map((r: any) => r.post_id),
      repostedFactIds: ((rr as any).data ?? []).map((r: any) => r.fact_id),
      likedDykIds: ((dl as any).data ?? []).map((r: any) => r.dyk_id),
      suggestedUsers,
      ownStoryUser,
      otherStoryUsers,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
