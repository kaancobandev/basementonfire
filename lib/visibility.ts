import { db } from './supabase/server';
import { isBlockedBetween } from './blocks';

// Gizli hesap görünürlüğü. Gizli bir hesabın gönderisini yalnızca SAHİBİ ve
// TAKİPÇİLERİ görebilir. Bu kuralın okuma (yorumları listele) ve yazma (yorum
// yaz) yollarında AYRI AYRI yazılması sızıntı üretiyordu → tek kaynak burası.
//
// `is_private` truthy = gizli; NULL/false = herkese açık (NULL-güvenli).

/** Sahibi bilinen bir içeriği `meId` görebilir mi? (YALNIZ gizlilik — engel bakmaz) */
export async function canViewOwnerContent(
  ownerId: number,
  ownerIsPrivate: unknown,
  meId: number | null,
): Promise<boolean> {
  if (!ownerIsPrivate) return true;      // açık hesap → herkes görür
  if (meId === null) return false;       // gizli hesap + çıkışlı ziyaretçi → hayır
  if (meId === ownerId) return true;     // kendi içeriğim
  const { data } = await db
    .from('follows')
    .select('id')
    .eq('follower_id', meId)
    .eq('following_id', ownerId)
    .maybeSingle();
  return !!data;
}

/**
 * Sahibi bilinen içerik: ENGEL + GİZLİLİK tek kapıda.
 *
 * Engel, gizlilikten AYRI bir eksen: açık bir hesabı engellediysen onun
 * içeriğiyle etkileşemezsin, gizli olmasına gerek yok. `/api/stories/highlights`
 * ve `storyPollVisible` bu ikiliyi zaten elle yan yana yazıyordu; buraya
 * alınınca "biri var biri yok" hatası tekrarlanamaz hâle geliyor.
 */
async function sahibiGorebilirMi(
  ownerId: number,
  ownerIsPrivate: unknown,
  meId: number | null,
): Promise<boolean> {
  if (meId !== null && meId !== ownerId && (await isBlockedBetween(meId, ownerId))) return false;
  return canViewOwnerContent(ownerId, ownerIsPrivate, meId);
}

/** quick_facts gönderisini `meId` görebilir mi? Gönderi yoksa false. */
export async function canViewFact(factId: number, meId: number | null): Promise<boolean> {
  const { data: fact } = await db
    .from('quick_facts')
    .select('user_id, users!quick_facts_user_id_fkey(is_private)')
    .eq('id', factId)
    .maybeSingle();
  if (!fact) return false;
  return sahibiGorebilirMi(fact.user_id, (fact.users as { is_private?: unknown } | null)?.is_private, meId);
}

/**
 * `posts` gönderisini `meId` görebilir mi? Gönderi yoksa false.
 *
 * 🚨 23.08.2026 denetimi: gönderi anketi ucu (`/api/article-poll/post-<id>`)
 *    hiçbir görünürlük kapısından geçmiyordu. HİKÂYE anketinin tam kapısı vardı
 *    (storyPollVisible), gönderi anketinin hiç yoktu — aynı dosyada, yan yana.
 *    Çıkışlı biri ardışık id deneyerek GİZLİ bir hesabın gönderisinde anket olup
 *    olmadığını ve oy dağılımını okuyabilir, üstelik göremediği ankete oy
 *    verebilirdi. `post_polls` o an 0 satırdı (ölçüldü) — yani sızan veri yok,
 *    özellik kullanılmaya başlansaydı sızacaktı. `/api/stories/highlights`
 *    ile birebir aynı desen: aynı veriye iki yol, biri korumasız.
 */
export async function canViewPost(postId: number, meId: number | null): Promise<boolean> {
  const { data: post } = await db
    .from('posts')
    .select('user_id, users!posts_user_id_fkey(is_private)')
    .eq('id', postId)
    .maybeSingle();
  if (!post) return false;
  return sahibiGorebilirMi(post.user_id, (post.users as { is_private?: unknown } | null)?.is_private, meId);
}
