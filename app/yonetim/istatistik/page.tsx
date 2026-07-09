import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db, getMe, isAdmin } from '@/lib/supabase/server';
import AutoRefresh from './AutoRefresh';
import RecentList, { type RecentRow } from './RecentList';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Giriş İstatistikleri',
  robots: { index: false, follow: false },
};

// ISO-3166 alpha-2 kodundan bayrak emoji (TR -> 🇹🇷)
function flag(code?: string | null): string {
  if (!code || code.length !== 2) return '🌍';
  const cc = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return '🌍';
  return String.fromCodePoint(0x1f1e6 + cc.charCodeAt(0) - 65, 0x1f1e6 + cc.charCodeAt(1) - 65);
}

// Ülke adını Türkçeye çevir (Intl); olmazsa Netlify'ın İngilizce adı, o da yoksa kod.
let regionNames: Intl.DisplayNames | null = null;
try { regionNames = new Intl.DisplayNames(['tr'], { type: 'region' }); } catch { /* eski runtime */ }
function countryLabel(code?: string | null, fallback?: string | null): string {
  if (code && /^[A-Za-z]{2}$/.test(code)) {
    try {
      const n = regionNames?.of(code.toUpperCase());
      if (n && n.toUpperCase() !== code.toUpperCase()) return n;
    } catch { /* yoksay */ }
  }
  return fallback || code || 'Bilinmiyor';
}

type Stats = {
  total: number; today: number; last7: number; last30: number;
  unique_users: number; online_now: number;
  countries: { code: string; name: string; count: number }[];
  daily: { day: string; count: number }[];
};

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 14, padding: '14px 16px', background: 'var(--color-surface)', minWidth: 0 }}>
      <div style={{ fontSize: '1.7rem', fontWeight: 900, lineHeight: 1.1, color: accent ? 'var(--color-success)' : 'var(--color-text)' }}>
        {value.toLocaleString('tr-TR')}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

export default async function GirisIstatistikPage() {
  const { me } = await getMe();
  if (!me) redirect('/login');
  if (!isAdmin(me as any)) redirect('/');

  // Tek turda tüm özet (SQL RPC). Fonksiyon/tablo henüz yoksa dormant modda göster.
  const { data: rpcData, error: rpcError } = await db.rpc('login_dashboard');
  const stats: Stats = (rpcData as Stats) ?? {
    total: 0, today: 0, last7: 0, last30: 0, unique_users: 0, online_now: 0, countries: [], daily: [],
  };

  // Son 50 giriş (kullanıcı bilgisiyle). FK ipucu ile users embed (tek FK ama net olsun).
  const { data: recentData } = await db
    .from('login_events')
    .select('id, created_at, method, country_code, country_name, city, users!login_events_user_id_fkey(username, display_name)')
    .order('created_at', { ascending: false })
    .limit(50);

  const recent: RecentRow[] = (recentData ?? []).map((r: any) => ({
    id: r.id,
    created_at: r.created_at,
    method: r.method,
    flag: flag(r.country_code),
    country: countryLabel(r.country_code, r.country_name),
    city: r.city ?? null,
    username: r.users?.username ?? '',
    display_name: r.users?.display_name ?? '',
    avatar: null,
  }));

  const dormant = !!rpcError; // RPC yoksa SQL henüz çalışmamış demektir

  // Ülke barları
  const maxCountry = Math.max(1, ...stats.countries.map((c) => c.count));

  // Son 14 günün seri ekseni (boş günleri sıfırla doldur, Istanbul tz)
  const dailyMap = new Map<string, number>((stats.daily ?? []).map((d) => [String(d.day), d.count]));
  const now = Date.now();
  const days = Array.from({ length: 14 }, (_, i) => {
    const dt = new Date(now - (13 - i) * 86_400_000);
    const day = dt.toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
    return {
      day,
      label: dt.toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul', day: '2-digit', month: '2-digit' }),
      count: dailyMap.get(day) ?? 0,
    };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  return (
    <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <AutoRefresh seconds={30} />
      <div className="feed-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span>Giriş İstatistikleri</span>
        <Link href="/yonetim/makaleler" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>Makale Yönetimi →</Link>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '18px 16px 64px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {dormant && (
          <div style={{ border: '1px solid var(--color-accent)', background: 'var(--color-accent-soft)', color: 'var(--color-accent-ink)', borderRadius: 12, padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600 }}>
            ⚙️ Giriş takibi henüz aktif değil. Supabase SQL Editor'da{' '}
            <code style={{ fontWeight: 800 }}>sql/features-login-tracking.sql</code> dosyasını bir kez çalıştır — sonra bu sayfa dolmaya başlar.
          </div>
        )}

        {/* Sayaçlar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
          <StatCard label="🟢 Şu an online" value={stats.online_now} accent />
          <StatCard label="Bugün giriş" value={stats.today} />
          <StatCard label="Son 7 gün" value={stats.last7} />
          <StatCard label="Toplam giriş" value={stats.total} />
          <StatCard label="Farklı kullanıcı" value={stats.unique_users} />
        </div>

        {/* Günlük seri (son 14 gün) */}
        <section style={{ border: '1px solid var(--color-border)', borderRadius: 14, padding: 16, background: 'var(--color-surface)' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)' }}>Günlük giriş (son 14 gün)</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 110 }}>
            {days.map((d) => (
              <div key={d.day} title={`${d.label}: ${d.count}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0 }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{d.count || ''}</div>
                <div style={{ width: '100%', height: `${Math.round((d.count / maxDay) * 78)}px`, minHeight: d.count ? 3 : 0, background: 'var(--color-primary)', borderRadius: '4px 4px 0 0' }} />
                <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{d.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Ülke dağılımı */}
        <section style={{ border: '1px solid var(--color-border)', borderRadius: 14, padding: 16, background: 'var(--color-surface)' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)' }}>Ülke dağılımı</h2>
          {stats.countries.length === 0 ? (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Henüz ülke verisi yok. (Yerelde giriş yaparken ülke boş gelir; canlıda Netlify ülkeyi otomatik ekler.)</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.countries.map((c) => (
                <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 140, flexShrink: 0, fontSize: '0.85rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '1rem' }}>{flag(c.code)}</span> {countryLabel(c.code, c.name)}
                  </div>
                  <div style={{ flex: 1, background: 'var(--color-hover)', borderRadius: 999, height: 18, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round((c.count / maxCountry) * 100)}%`, height: '100%', background: 'var(--gradient-brand)', borderRadius: 999 }} />
                  </div>
                  <div style={{ width: 44, flexShrink: 0, textAlign: 'right', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }}>{c.count.toLocaleString('tr-TR')}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Son girişler */}
        <section style={{ border: '1px solid var(--color-border)', borderRadius: 14, padding: 16, background: 'var(--color-surface)' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)' }}>Son girişler</h2>
          <RecentList rows={recent} />
        </section>

        <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
          Sunucu tarafı sayım — çerez onayından bağımsız, tüm girişleri kapsar. Sayfa 30 sn'de bir yenilenir.
        </p>
      </div>
    </main>
  );
}
