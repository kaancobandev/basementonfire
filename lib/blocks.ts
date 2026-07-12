import { db } from './supabase/server';

// Engelleme yardımcıları. Tümü DEFANSİF: `blocks` tablosu yoksa (SQL çalışmadıysa)
// hata yerine "engel yok" döner → özellik uykuda, sayfa/feed kırılmaz.

/** a ile b arasında (İKİ YÖNLÜ) engel var mı? (a→b VEYA b→a) */
export async function isBlockedBetween(a: number, b: number): Promise<boolean> {
  if (a === b) return false;
  try {
    const { data, error } = await db
      .from('blocks')
      .select('id')
      .or(`and(blocker_id.eq.${a},blocked_id.eq.${b}),and(blocker_id.eq.${b},blocked_id.eq.${a})`)
      .limit(1);
    if (error) return false; // tablo yok / erişilemedi → engel yok say
    return !!(data && data.length);
  } catch {
    return false;
  }
}

/** meId'in engellediği VE meId'i engelleyen tüm kullanıcı id'leri (feed/arama filtresi). */
export async function getBlockedUserIds(meId: number): Promise<Set<number>> {
  const set = new Set<number>();
  try {
    const { data, error } = await db
      .from('blocks')
      .select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${meId},blocked_id.eq.${meId}`);
    if (error || !data) return set;
    for (const r of data as { blocker_id: number; blocked_id: number }[]) {
      set.add(r.blocker_id === meId ? r.blocked_id : r.blocker_id);
    }
  } catch { /* tablo yok → boş set */ }
  return set;
}
