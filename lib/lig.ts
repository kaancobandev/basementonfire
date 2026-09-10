import { db, logIfError } from '@/lib/supabase/server';

// ════════════════════════════════════════════════════════════════════════
// HAFTALIK LİG — SIRALAMANIN TEK KAYNAĞI.
//
// İki yerden okunuyor:
//   · app/lig/page.tsx  → ISR sayfası, `unstable_cache` ile 5 dk
//   · app/api/lig       → akıştaki widget, ÖNBELLEKSİZ (cevaptan hemen sonra
//                         taze sıra lazım, yoksa satır kaymaz)
//
// ⚠ Hesap NEDEN burada: aynı sıralama iki dosyada ayrı ayrı yazılsaydı biri
// güncellenip öteki unutulurdu ve iki yüzey AYNI kullanıcıya FARKLI sıra
// gösterirdi. Bu depoda tam bu tipte bir hata yaşandı: anket embed'i
// lib/feedData.ts'te seçiliyor, /api/feed'de seçilmiyordu.
// ════════════════════════════════════════════════════════════════════════

export type LeagueRow = {
  rank: number;
  username: string;
  display_name: string;
  avatar: string | null;
  correct: number;
  answered: number;
  xp: number;
};

/** TR (sabit UTC+3) haftası: Pazartesi 00:00'dan bu yana.
 *  Rotasyonla aynı mantık (app/api/daily-question/route.ts istanbulDayParts). */
export function weekStartTR(): string {
  const ms = Date.now() + 3 * 3600 * 1000;
  const d = new Date(ms);
  const mondayOffset = (d.getUTCDay() + 6) % 7; // Pzt=0 … Paz=6
  d.setUTCDate(d.getUTCDate() - mondayOffset);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD (answer_date ile aynı biçim)
}

/**
 * Haftanın sıralaması. ÖNBELLEKSİZ — önbellekleme çağıranın işi.
 *
 * ⚠ SIRALAMA KURALI: haftalık doğru → (eşitlikte) toplam XP → katılım.
 * Metrik `total_correct` DEĞİL: o alan bu hesaba hiç girmiyor.
 */
export async function haftalikLig(weekStart: string): Promise<LeagueRow[]> {
  try {
    /* Tablo küçük (kullanıcı × 7 gün) → satırları çekip JS'te topla.
       ÖLÇÜLDÜ 10.09.2026: daily_answers'ta TOPLAM 29 satır, haftalıkta 3.
       Bu yüzden `answer_date` üstünde indeks YOK ve gerekmiyor — Postgres bu
       boyutta zaten seq scan seçer, indeks her yazmaya bedel bindirirdi.
       Satır sayısı binlere çıkarsa `create index on daily_answers (answer_date)`
       o zaman anlamlı olur. */
    const { data: answers, error } = await db
      .from('daily_answers')
      .select('user_id, is_correct')
      .gte('answer_date', weekStart);
    logIfError('lig daily_answers', error);
    if (error || !answers?.length) return [];

    const agg = new Map<number, { correct: number; answered: number }>();
    for (const a of answers as { user_id: number; is_correct: boolean }[]) {
      const cur = agg.get(a.user_id) ?? { correct: 0, answered: 0 };
      cur.answered += 1;
      if (a.is_correct) cur.correct += 1;
      agg.set(a.user_id, cur);
    }

    const userIds = [...agg.keys()];
    const [{ data: users }, { data: prog }] = await Promise.all([
      // Gizli ve silinmiş hesaplar KÜRESEL listede görünmez (her yeni küresel
      // listeleme yüzeyi elle filtrelenir — db service-role RLS'i baypas eder).
      db.from('users').select('id, username, display_name, avatar, is_private, is_deleted').in('id', userIds),
      db.from('user_progress').select('user_id, xp').in('user_id', userIds),
    ]);
    const xpMap = new Map<number, number>(
      ((prog ?? []) as { user_id: number; xp: number | null }[]).map((p) => [p.user_id, p.xp ?? 0]),
    );

    return ((users ?? []) as {
      id: number; username: string; display_name: string;
      avatar: string | null; is_private: boolean | null; is_deleted: boolean | null;
    }[])
      .filter((u) => !u.is_private && !u.is_deleted)
      .map((u) => {
        const a = agg.get(u.id)!;
        return {
          username: u.username,
          display_name: u.display_name,
          avatar: u.avatar ?? null,
          correct: a.correct,
          answered: a.answered,
          xp: xpMap.get(u.id) ?? 0,
        };
      })
      // Sıralama: haftalık doğru → (eşitlikte) toplam XP → katılım.
      .sort((a, b) => b.correct - a.correct || b.xp - a.xp || b.answered - a.answered)
      .slice(0, 20)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  } catch {
    return []; // tablolar yoksa boş lig — çağıran kırılmaz
  }
}
