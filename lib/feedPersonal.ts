import { db } from '@/lib/supabase/server';
import { audiencePredicate } from '@/lib/storyAudience';
import { getHomeContent, getDidYouKnow, getSuggestedUsers, buildFeedItems, buildStoryUsers } from '@/lib/feedData';
import { MATCH_MIN_AGE, isAtLeast } from '@/lib/age';
import { MATCHING_ENABLED } from '@/lib/features';

// ════════════════════════════════════════════════════════════════════════
// /feed'in KİŞİYE ÖZEL katı — TEK KAYNAK.
//
// Neden ayrı modül: bu yük artık İKİ yerden veriliyor.
//   · /api/nav-state?feed=1  → girişli açılışta, nav verisiyle AYNI turda
//   · /api/feed/personal     → istemci tarafı gezinmede (AppShell yeniden
//                              fetch etmez) ve geri düşüş yolu olarak
//
// Sebep ölçüldü (07.08.2026, canlı, girişli hesap): ikisi ayrı uçken istemci
// onları ZİNCİRLEME atıyordu — nav-state 968→3160 ms, personal 3181→4644 ms.
// İkincisi birincinin bitişini bekliyordu çünkü kapısı `useNavUser()` idi ve
// o context ancak nav-state cevabıyla doluyordu. Kişisel veri 4,6 saniyede
// yerleşiyordu; paralel gitseler ~2,2 saniyede biterdi.
// ════════════════════════════════════════════════════════════════════════

export type FeedPersonal = {
  user: { id: number; username: string; display_name: string; avatar: string | null };
  canMatch: boolean;
  likedFactIds: number[];
  likedPostIds: number[];
  repostedFactIds: number[];
  likedDykIds: number[];
  bookmarkedFactIds: number[];
  suggestedUsers: unknown[];
  ownStoryUser: unknown;
  otherStoryUsers: unknown[];
  /** İki dalganın ayrı süreleri (ms) — çağıran Server-Timing'e basar. */
  sure?: { icerik: number; sorgu: number };
};

/** İçerik dalgasının tipi — `buildFeedPersonal`a DIŞARIDAN verilebilsin diye. */
type IcerikYuku = [Awaited<ReturnType<typeof getHomeContent>>, Awaited<ReturnType<typeof getDidYouKnow>>];

/** İçerik dalgasını başlatır. Çağıran bunu KİMLİK DOĞRULAMASINDAN ÖNCE çağırıp
 *  sonucu `buildFeedPersonal`a geçirebilir — iki iş paralel koşar.
 *  KULLANICIDAN TAMAMEN BAĞIMSIZ: ikisi de paylaşımlı `unstable_cache`
 *  (lib/feedData.ts), herkese aynı veriyi döndürür, `me` ile hiçbir ilgisi yok. */
export function icerikDalgasiniBaslat(): Promise<IcerikYuku> {
  return Promise.all([getHomeContent(), getDidYouKnow()]);
}

/** Girişli kullanıcının akış katmanı. `me` = getMe().me (null OLMAMALI).
 *
 *  `onIcerik`: varsa içerik dalgası ZATEN başlatılmış demektir (çağıran onu
 *  kimlik turuyla paralel başlattı) — burada yalnızca beklenir. Yoksa burada
 *  başlatılır, yani eski davranış korunur ve /api/feed/personal etkilenmez. */
export async function buildFeedPersonal(me: any, onIcerik?: Promise<IcerikYuku>): Promise<FeedPersonal> {
  // ⚠ İKİ DALGA VE İKİSİ ARDIŞIK: aşağıdaki kişisel sorgular, akışta GÖRÜNEN
  // öğelerin id'lerine ihtiyaç duyduğu için önce içeriğin gelmesi gerekiyor.
  // Toplam 750 ms ölçüldü (2026-08-14, gerçek oturum); hangi dalganın baskın
  // olduğunu bilmek için ikisi ayrı ayrı raporlanıyor — `sure` alanı çağıranın
  // Server-Timing'ine girer. İçerik dalgası unstable_cache'li, yani ÖNBELLEK
  // ISABETİNDE ~0 olmalı; büyük çıkarsa sorun önbelleğin ıskalamasıdır.
  const tIcerik = Date.now();
  const [{ rawFacts, rawPosts, storiesRaw }, dyks] = await (onIcerik ?? icerikDalgasiniBaslat());
  // `onIcerik` verildiyse bu süre "hazır sonucu bekleme"dir (≈0 olmalı), yoksa
  // dalganın tam maliyeti. Server-Timing'deki ficerik bu ayrımı gösterir.
  const icerikMs = Date.now() - tIcerik;
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
  const tSorgu = Date.now();
  const [canSeeStory, fr, pr, rr, dl, bm, suggestedUsers, seenRes] = await Promise.all([
    audiencePredicate(me.id),
    facts.length ? db.from('fact_likes').select('fact_id').eq('user_id', me.id).in('fact_id', facts.map((f) => f.id)) : Promise.resolve({ data: [] as any[] }),
    posts.length ? db.from('post_likes').select('post_id').eq('user_id', me.id).in('post_id', posts.map((p) => p.id)) : Promise.resolve({ data: [] as any[] }),
    facts.length ? db.from('fact_reposts').select('fact_id').eq('user_id', me.id).in('fact_id', facts.map((f) => f.id)) : Promise.resolve({ data: [] as any[] }),
    // dyk_likes tablosu yoksa error döner, data null kalır → boş liste (defansif).
    dykIds.length ? db.from('dyk_likes').select('dyk_id').eq('user_id', me.id).in('dyk_id', dykIds) : Promise.resolve({ data: [] as any[] }),
    // Kaydedilenler — akıştaki kartın yer imi ikonu dolu mu boş mu çizilecek.
    // Bu olmadan zaten kayıtlı bir gönderi akışta kaydedilmemiş görünür ve
    // kullanıcı ikona basınca kaydı KALDIRIR.
    facts.length ? db.from('bookmarks').select('post_id').eq('user_id', me.id).in('post_id', facts.map((f) => f.id)) : Promise.resolve({ data: [] as any[] }),
    getSuggestedUsers(me.id),
    allStoryIds.length ? db.from('story_views').select('story_id').eq('viewer_id', me.id).in('story_id', allStoryIds) : Promise.resolve({ data: [] as any[] }),
  ]);
  const sorguMs = Date.now() - tSorgu;

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

  return {
      user: { id: me.id, username: me.username, display_name: me.display_name, avatar: me.avatar ?? null },
      canMatch: MATCHING_ENABLED && isAtLeast(me.birthdate, MATCH_MIN_AGE),
      likedFactIds: ((fr as any).data ?? []).map((r: any) => r.fact_id),
      likedPostIds: ((pr as any).data ?? []).map((r: any) => r.post_id),
      repostedFactIds: ((rr as any).data ?? []).map((r: any) => r.fact_id),
      likedDykIds: ((dl as any).data ?? []).map((r: any) => r.dyk_id),
      bookmarkedFactIds: ((bm as any).data ?? []).map((r: any) => r.post_id),
      suggestedUsers,
      ownStoryUser,
      otherStoryUsers,
      sure: { icerik: icerikMs, sorgu: sorguMs },
  };
}
