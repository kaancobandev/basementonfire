import type { Metadata } from 'next';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { db, logIfError } from '@/lib/supabase/server';
import { avatarSrc } from '@/lib/avatar';
import Img from '@/app/components/Img';

// Haftalık XP Ligi — günün sorusunu tek kişilik alışkanlıktan rekabete çevirir.
// Kişiye özel veri YOK (herkese aynı sıralama) → ISR; SQL gerekmez
// (daily_answers + user_progress zaten canlı). Pazartesi 00:00 TR'de sıfırlanır.
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Haftalık Lig',
  description: 'Bu hafta günün sorusunda en çok doğru cevabı verenler — Basements haftalık bilgi ligi.',
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

type LeagueRow = {
  rank: number;
  username: string;
  display_name: string;
  avatar: string | null;
  correct: number;
  answered: number;
  xp: number;
};

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

const MEDALS = ['🥇', '🥈', '🥉'];

export default async function LigPage() {
  const weekStart = weekStartTR();
  const rows = await getWeeklyLeague(weekStart);

  return (
    <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div className="feed-header">🏆 Haftalık Lig</div>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '18px 16px 64px' }}>
        <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          Bu hafta <strong style={{ color: 'var(--color-text)' }}>günün sorusunda</strong> en çok doğru cevabı verenler.
          Lig her pazartesi sıfırlanır — <Link href="/feed" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>bugünün sorusunu çöz</Link> ve tabloya gir.
        </p>

        {rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: 14 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🧠</div>
            <p style={{ fontWeight: 700, margin: '0 0 4px', color: 'var(--color-text)' }}>Bu hafta henüz kimse soru çözmedi</p>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>İlk sen ol — günün sorusu akışta seni bekliyor.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.map((r) => (
              <Link
                key={r.username}
                href={`/u/${r.username}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 12, textDecoration: 'none', color: 'inherit',
                  ...(r.rank === 1 ? { borderColor: '#f59e0b', boxShadow: '0 0 0 1px rgba(245,158,11,0.35)' } : {}),
                }}
              >
                <span style={{ width: 30, textAlign: 'center', fontSize: r.rank <= 3 ? '1.15rem' : '0.85rem', fontWeight: 800, color: 'var(--color-text-muted)', flexShrink: 0 }}>
                  {MEDALS[r.rank - 1] ?? r.rank}
                </span>
                <span style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  <Img src={avatarSrc(r.username, r.avatar)} alt="" fixedWidth={72} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 700, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.display_name}</span>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>@{r.username} · {r.answered} soru</span>
                </span>
                <span style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ display: 'block', fontWeight: 800, color: 'var(--color-success)', fontSize: '1.05rem' }}>{r.correct}</span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>doğru</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
