import type { Metadata } from 'next';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { db, logIfError } from '@/lib/supabase/server';
import LigListesi from './LigListesi';
import type { LeagueRow } from './LigListesi';

// Haftalık XP Ligi — günün sorusunu tek kişilik alışkanlıktan rekabete çevirir.
// Kişiye özel veri YOK (herkese aynı sıralama) → ISR; SQL gerekmez
// (daily_answers + user_progress zaten canlı). Pazartesi 00:00 TR'de sıfırlanır.
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Haftalık Lig',
  description: 'Bu hafta günün sorusunda en çok doğru cevabı verenler — Basementonfire haftalık bilgi ligi.',
  alternates: { canonical: '/lig' },
};

// TR (sabit UTC+3) haftası: Pazartesi 00:00'dan bu yana. Rotasyonla aynı mantık
// (app/api/daily-question/route.ts istanbulDayParts deseni).
function weekStartTR(): string {
  const ms = Date.now() + 3 * 3600 * 1000;
  const d = new Date(ms);
  const mondayOffset = (d.getUTCDay() + 6) % 7; // Pzt=0 … Paz=6
  d.setUTCDate(d.getUTCDate() - mondayOffset);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD (answer_date ile aynı biçim)
}

const getWeeklyLeague = unstable_cache(
  async (weekStart: string): Promise<LeagueRow[]> => {
    try {
      // Tablo küçük (kullanıcı × 7 gün) → satırları çekip JS'te topla.
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
        // Gizli ve silinmiş hesaplar KÜRESEL listede görünmez (memory kuralı:
        // her yeni küresel listeleme yüzeyi elle filtrelenir).
        db.from('users').select('id, username, display_name, avatar, is_private, is_deleted').in('id', userIds),
        db.from('user_progress').select('user_id, xp').in('user_id', userIds),
      ]);
      const xpMap = new Map<number, number>((prog ?? []).map((p: any) => [p.user_id, p.xp ?? 0]));

      const rows = ((users ?? []) as any[])
        .filter((u) => !u.is_private && !u.is_deleted)
        .map((u) => {
          const a = agg.get(u.id)!;
          return {
            username: u.username as string,
            display_name: u.display_name as string,
            avatar: (u.avatar ?? null) as string | null,
            correct: a.correct,
            answered: a.answered,
            xp: xpMap.get(u.id) ?? 0,
          };
        })
        // Sıralama: haftalık doğru → (eşitlikte) toplam XP → katılım.
        .sort((a, b) => b.correct - a.correct || b.xp - a.xp || b.answered - a.answered)
        .slice(0, 20)
        .map((r, i) => ({ ...r, rank: i + 1 }));

      return rows;
    } catch {
      return []; // tablolar yoksa boş lig — sayfa kırılmaz
    }
  },
  ['weekly-league-v1'],
  { revalidate: 300 },
);

export default async function LigPage() {
  const weekStart = weekStartTR();
  const rows = await getWeeklyLeague(weekStart);

  return (
    <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div className="feed-header">🏆 Haftalık Lig</div>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '18px 16px 64px' }}>
        <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          Bu hafta <strong style={{ color: 'var(--color-text)' }}>günün sorusunda</strong> en çok doğru cevabı verenler.
          Lig her pazartesi sıfırlanır — <Link href="/" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>bugünün sorusunu çöz</Link> ve tabloya gir.
        </p>

        {rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: 14 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🧠</div>
            <p style={{ fontWeight: 700, margin: '0 0 4px', color: 'var(--color-text)' }}>Bu hafta henüz kimse soru çözmedi</p>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>İlk sen ol — günün sorusu akışta seni bekliyor.</p>
          </div>
        ) : (
          /* Satırlar istemci bileşeninde: TEK sebebi kullanıcının kendi satırını
             vurgulamak. Sayfa SUNUCU bileşeni kalıyor — revalidate=300 ve
             unstable_cache aynen duruyor, kimlik sunucuda OKUNMUYOR. */
          <LigListesi rows={rows} />
        )}
      </div>
    </main>
  );
}
