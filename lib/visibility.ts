import { db } from './supabase/server';

// Gizli hesap görünürlüğü. Gizli bir hesabın gönderisini yalnızca SAHİBİ ve
// TAKİPÇİLERİ görebilir. Bu kuralın okuma (yorumları listele) ve yazma (yorum
// yaz) yollarında AYRI AYRI yazılması sızıntı üretiyordu → tek kaynak burası.
//
// `is_private` truthy = gizli; NULL/false = herkese açık (NULL-güvenli).

/** Sahibi bilinen bir içeriği `meId` görebilir mi? */
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

/** quick_facts gönderisini `meId` görebilir mi? Gönderi yoksa false. */
export async function canViewFact(factId: number, meId: number | null): Promise<boolean> {
  const { data: fact } = await db
    .from('quick_facts')
    .select('user_id, users!quick_facts_user_id_fkey(is_private)')
    .eq('id', factId)
    .single();
  if (!fact) return false;
  return canViewOwnerContent(fact.user_id, (fact.users as { is_private?: unknown } | null)?.is_private, meId);
}
