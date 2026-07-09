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

type LoginStats = {
  total: number; today: number; last7: number; last30: number;
  unique_users: number; online_now: number;
  countries: { code: string; name: string; count: number }[];
  daily: { day: string; count: number }[];
};
type Traffic = {
  online_now: number;
  views_today: number; views_7: number; views_total: number;
  uniques_today: number; uniques_7: number;
  countries: { code: string; name: string; count: number }[];
  top_pages: { path: string; views: number; uniques: number }[];
  daily: { day: string; views: number; uniques: number }[];
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ border: '1px solid var(--color-border)', borderRadius: 14, padding: 16, background: 'var(--color-surface)' }}>
      <h2 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text)' }}>{title}</h2>
      {children}
    </section>
  );
}

function Dormant({ file }: { file: string }) {
  return (
    <div style={{ border: '1px solid var(--color-accent)', background: 'var(--color-accent-soft)', color: 'var(--color-accent-ink)', borderRadius: 12, padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600 }}>
      ⚙️ Bu bölüm henüz aktif değil. Supabase SQL Editor'da <code style={{ fontWeight: 800 }}>{file}</code> dosyasını bir kez çalıştır — sonra dolmaya başlar.
    </div>
  );
}

// Ülke barları (bayrak + Türkçe ad + oran). count = tekil ziyaretçi / giriş.
function CountryBars({ rows, unit }: { rows: { code: string; name: string; count: number }[]; unit: string }) {
  if (rows.length === 0) {
    return <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Henüz ülke verisi yok. (Yerelde ülke boş gelir; canlıda Netlify otomatik ekler.)</div>;
  }
  const max = Math.max(1, ...rows.map((c) => c.count));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((c) => (
        <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 150, flexShrink: 0, fontSize: '0.85rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '1rem' }}>{flag(c.code)}</span> {countryLabel(c.code, c.name)}
          </div>
          <div style={{ flex: 1, background: 'var(--color-hover)', borderRadius: 999, height: 18, overflow: 'hidden' }}>
            <div style={{ width: `${Math.round((c.count / max) * 100)}%`, height: '100%', background: 'var(--gradient-brand)', borderRadius: 999 }} />
          </div>
          <div style={{ width: 54, flexShrink: 0, textAlign: 'right', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }} title={unit}>{c.count.toLocaleString('tr-TR')}</div>
        </div>
      ))}
    </div>
  );
}

// 14 günlük bar grafiği. Boş günleri sıfırla doldurur (Istanbul tz).
function DailyBars({ series }: { series: { day: string; label: string; value: number; title: string }[] }) {
  const max = Math.max(1, ...series.map((d) => d.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 110 }}>
      {series.map((d) => (
        <div key={d.day} title={d.title} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0 }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{d.value || ''}</div>
          <div style={{ width: '100%', height: `${Math.round((d.value / max) * 78)}px`, minHeight: d.value ? 3 : 0, background: 'var(--color-primary)', borderRadius: '4px 4px 0 0' }} />
          <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// Son 14 günün ekseni (YYYY-MM-DD, Istanbul) + gün etiketi.
function buildAxis(): { day: string; label: string }[] {
  const now = Date.now();
  return Array.from({ length: 14 }, (_, i) => {
    const dt = new Date(now - (13 - i) * 86_400_000);
    return {
      day: dt.toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' }),
      label: dt.toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul', day: '2-digit', month: '2-digit' }),
    };
  });
}

export default async function GirisIstatistikPage() {
  const { me } = await getMe();
  if (!me) redirect('/login');
  if (!isAdmin(me as any)) redirect('/');

  // İki özet + son girişler tek turda paralel.
  const [trafficRes, loginRes, recentRes] = await Promise.all([
    db.rpc('traffic_dashboard'),
    db.rpc('login_dashboard'),
    db.from('login_events')
      .select('id, created_at, method, country_code, country_name, city, users!login_events_user_id_fkey(username, display_name)')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const trafficDormant = !!trafficRes.error;
  const loginDormant = !!loginRes.error;

  const t: Traffic = (trafficRes.data as Traffic) ?? {
    online_now: 0, views_today: 0, views_7: 0, views_total: 0,
    uniques_today: 0, uniques_7: 0, countries: [], top_pages: [], daily: [],
  };
  const l: LoginStats = (loginRes.data as LoginStats) ?? {
    total: 0, today: 0, last7: 0, last30: 0, unique_users: 0, online_now: 0, countries: [], daily: [],
  };

  const recent: RecentRow[] = (recentRes.data ?? []).map((r: any) => ({
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

  // Grafik serileri
  const axis = buildAxis();
  const trafficDaily = new Map((t.daily ?? []).map((d) => [String(d.day), d]));
  const trafficSeries = axis.map((a) => {
    const d = trafficDaily.get(a.day);
    const uniques = d?.uniques ?? 0;
    const views = d?.views ?? 0;
    return { day: a.day, label: a.label, value: uniques, title: `${a.label}: ${uniques} ziyaretçi · ${views} görüntüleme` };
  });
  const loginDaily = new Map((l.daily ?? []).map((d) => [String(d.day), d.count]));
  const loginSeries = axis.map((a) => {
    const c = loginDaily.get(a.day) ?? 0;
    return { day: a.day, label: a.label, value: c, title: `${a.label}: ${c} giriş` };
  });

  return (
    <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <AutoRefresh seconds={30} />
      <div className="feed-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span>İstatistikler</span>
        <Link href="/yonetim/makaleler" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>Makale Yönetimi →</Link>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '18px 16px 64px', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* ================= TRAFİK (tüm ziyaretçiler, çerezsiz) ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-text)' }}>🌐 Trafik — tüm ziyaretçiler</h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Üye olsun olmasın herkes. Çerez onayından bağımsız, sunucu tarafı sayım (botlar hariç).</p>
          </div>

          {trafficDormant && <Dormant file="sql/features-visitor-tracking.sql" />}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
            <StatCard label="🟢 Şu an online" value={t.online_now} accent />
            <StatCard label="Bugün tekil ziyaretçi" value={t.uniques_today} />
            <StatCard label="Bugün görüntüleme" value={t.views_today} />
            <StatCard label="7 gün tekil ziyaretçi" value={t.uniques_7} />
            <StatCard label="Toplam görüntüleme" value={t.views_total} />
          </div>

          <Section title="Günlük tekil ziyaretçi (son 14 gün)">
            <DailyBars series={trafficSeries} />
          </Section>

          <Section title="Ülke dağılımı — ziyaretçiler (son 30 gün)">
            <CountryBars rows={t.countries} unit="tekil ziyaretçi" />
          </Section>

          <Section title="En çok gezilen sayfalar (son 30 gün)">
            {t.top_pages.length === 0 ? (
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Henüz veri yok.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {t.top_pages.map((p) => (
                  <div key={p.path} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: '1px solid var(--color-border)' }}>
                    <Link href={p.path} target="_blank" style={{ flex: 1, minWidth: 0, fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.path}</Link>
                    <div style={{ flexShrink: 0, fontSize: '0.82rem', color: 'var(--color-text)', fontWeight: 700 }}>{p.views.toLocaleString('tr-TR')} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>görüntüleme · {p.uniques.toLocaleString('tr-TR')} kişi</span></div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* ================= ÜYE GİRİŞLERİ ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-text)' }}>🔑 Üye girişleri</h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Yalnızca giriş yapan / kayıt olan üyeler.</p>
          </div>

          {loginDormant && <Dormant file="sql/features-login-tracking.sql" />}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
            <StatCard label="🟢 Online üye" value={l.online_now} accent />
            <StatCard label="Bugün giriş" value={l.today} />
            <StatCard label="Son 7 gün" value={l.last7} />
            <StatCard label="Toplam giriş" value={l.total} />
            <StatCard label="Farklı üye" value={l.unique_users} />
          </div>

          <Section title="Günlük giriş (son 14 gün)">
            <DailyBars series={loginSeries} />
          </Section>

          <Section title="Son girişler">
            <RecentList rows={recent} />
          </Section>
        </div>

        <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
          Sunucu tarafı sayım — çerez onayından bağımsız, tüm ziyaretçileri kapsar. Ham IP saklanmaz. Sayfa 30 sn'de bir yenilenir.
        </p>
      </div>
    </main>
  );
}
