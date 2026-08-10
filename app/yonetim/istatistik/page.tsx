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
type PerfMetric = {
  sira: number; ad: string; aciklama: string; iyi: number; kotu: number;
  p50: number | null; p75: number | null; p95: number | null; n: number;
};
type Perf = {
  orneklem_toplam: number; orneklem_30: number; orneklem_7: number;
  metrikler: PerfMetric[];
  lcp_dagilim: { iyi: number; orta: number; kotu: number } | null;
  cls_p75: number | null;
  cihazlar: { cihaz: string; n: number; lcp_p75: number | null; ttfb_p75: number | null; lcp_ttfb_p75?: number | null }[];
  baglantilar: { tur: string; n: number; lcp_p75: number | null }[];
  sayfalar: { path: string; n: number; lcp_p75: number | null; ttfb_p75: number | null; ttfb_max: number | null; lcp_ttfb_p75?: number | null }[];
  gunluk: { day: string; n: number; lcp_p75: number | null; lcp_ttfb_p75?: number | null }[];
  soguk: { adet: number; toplam: number; ornekler: { path: string; ttfb_ms: number; lcp_ms: number | null; created_at: string }[] } | null;
  // sql/fix-web-vitals-olcum.sql ile geldi. Eski RPC hala kosuyorsa undefined
  // kalir ve ilgili bloklar cizilmez — panel kirilmaz.
  kirlilik?: { ham_30: number; ekip_elendi: number; boya_gecersiz: number; boya_hic_yok: number; ttfb_sayilan: number; boya_sayilan: number } | null;
  protokoller?: { ad: string; n: number; ttfb_p75: number | null }[];
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
// `fmt` verilmezse ham sayı yazılır (ziyaretçi/giriş). Süre serilerinde 4
// haneli ms değerleri 14 çubuğa sığmadığı için kısaltılmış biçim geçilir.
function DailyBars({ series, fmt, renk }: {
  series: { day: string; label: string; value: number; title: string }[];
  fmt?: (v: number) => string;
  renk?: (v: number) => string;
}) {
  const max = Math.max(1, ...series.map((d) => d.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 110 }}>
      {series.map((d) => (
        <div key={d.day} title={d.title} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0 }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{d.value ? (fmt ? fmt(d.value) : d.value) : ''}</div>
          <div style={{ width: '100%', height: `${Math.round((d.value / max) * 78)}px`, minHeight: d.value ? 3 : 0, background: renk ? renk(d.value) : 'var(--color-primary)', borderRadius: '4px 4px 0 0' }} />
          <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Gerçek kullanıcı hızı yardımcıları ──────────────────────────────────────
// Süre okunabilir biçimde: 342 ms / 1,24 sn. Bir sayıyı hem ms hem sn yazmak
// karşılaştırmayı zorlaştırdığı için eşik 1000 ms'de sabit.
function ms(v?: number | null): string {
  if (v == null) return '—';
  return v >= 1000
    ? `${(v / 1000).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sn`
    : `${v} ms`;
}
// Google'ın Core Web Vitals eşiklerine göre renk. Eşikler RPC'den gelir (iyi/kotu).
function perfRenk(v: number | null | undefined, iyi: number, kotu: number): string {
  if (v == null) return 'var(--color-text-muted)';
  if (v <= iyi) return 'var(--color-success)';
  if (v <= kotu) return 'var(--color-accent-ink)';
  return 'var(--color-danger)';
}

// LCP dağılımı — tek bakışta "kaç ziyaretçi hızlı gördü". Yüzdelikten daha
// anlaşılır, çünkü paydası kişi sayısı.
function LcpDagilim({ d }: { d: { iyi: number; orta: number; kotu: number } }) {
  const toplam = d.iyi + d.orta + d.kotu;
  if (toplam === 0) return null;
  const yuzde = (n: number) => (n / toplam) * 100;
  const parcalar = [
    { n: d.iyi, renk: 'var(--color-success)', ad: '≤2,5 sn (iyi)' },
    { n: d.orta, renk: 'var(--color-accent)', ad: '2,5–4 sn (orta)' },
    { n: d.kotu, renk: 'var(--color-danger)', ad: '>4 sn (kötü)' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', height: 22, borderRadius: 999, overflow: 'hidden', background: 'var(--color-hover)' }}>
        {parcalar.map((p) => p.n > 0 && (
          <div key={p.ad} title={`${p.ad}: ${p.n} açılış`} style={{ width: `${yuzde(p.n)}%`, background: p.renk }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
        {parcalar.map((p) => (
          <span key={p.ad} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: p.renk, flexShrink: 0 }} />
            {p.ad} · <b style={{ color: 'var(--color-text)' }}>%{Math.round(yuzde(p.n))}</b>
          </span>
        ))}
      </div>
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
  const [trafficRes, loginRes, perfRes, recentRes] = await Promise.all([
    db.rpc('traffic_dashboard'),
    db.rpc('login_dashboard'),
    db.rpc('perf_dashboard'),
    db.from('login_events')
      .select('id, created_at, method, country_code, country_name, city, users!login_events_user_id_fkey(username, display_name)')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const trafficDormant = !!trafficRes.error;
  const loginDormant = !!loginRes.error;
  const perfDormant = !!perfRes.error;

  const t: Traffic = (trafficRes.data as Traffic) ?? {
    online_now: 0, views_today: 0, views_7: 0, views_total: 0,
    uniques_today: 0, uniques_7: 0, countries: [], top_pages: [], daily: [],
  };
  const l: LoginStats = (loginRes.data as LoginStats) ?? {
    total: 0, today: 0, last7: 0, last30: 0, unique_users: 0, online_now: 0, countries: [], daily: [],
  };
  const perf: Perf = (perfRes.data as Perf) ?? {
    orneklem_toplam: 0, orneklem_30: 0, orneklem_7: 0, metrikler: [], lcp_dagilim: null,
    cls_p75: null, cihazlar: [], baglantilar: [], sayfalar: [], gunluk: [], soguk: null,
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
  // Günlük p75 LCP — çubuk yüksekliği SÜREYE orantılı, yani UZUN ÇUBUK KÖTÜ.
  // (Diğer iki grafikte uzun çubuk iyi; başlıkta bunu ayrıca yazıyoruz.)
  const perfDaily = new Map((perf.gunluk ?? []).map((d) => [String(d.day), d]));
  const perfSeries = axis.map((a) => {
    const d = perfDaily.get(a.day);
    const v = d?.lcp_p75 ?? 0;
    return { day: a.day, label: a.label, value: v, title: `${a.label}: p75 LCP ${ms(d?.lcp_p75)} · ${d?.n ?? 0} açılış` };
  });
  const loginDaily = new Map((l.daily ?? []).map((d) => [String(d.day), d.count]));
  const loginSeries = axis.map((a) => {
    const c = loginDaily.get(a.day) ?? 0;
    return { day: a.day, label: a.label, value: c, title: `${a.label}: ${c} giriş` };
  });

  return (
    <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <AutoRefresh seconds={30} />
      <div className="feed-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span>İstatistikler</span>
        <span style={{ display: 'flex', gap: 14 }}>
          <Link href="/yonetim/makaleler" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>Makaleler →</Link>
          <Link href="/yonetim/sikayetler" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>Şikayetler →</Link>
        </span>
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
                    {/* prefetch KAPALI. Yollar VERIDEN geliyor, koddan degil —
                        aralarinda artik var olmayan bir yol bulunabiliyor ve Next
                        onu her acilista <Link> gorup on-yukluyor, konsola 404
                        dokuyordu (2026-08-10, /kitap). Ustelik target="_blank"
                        oldugu icin prefetch YOL VAR OLSA DA bosa: yeni sekme tam
                        sayfa yukler, on-yuklenen RSC yuku hic kullanilmaz.
                        Panel 30 sn'de bir yenilendigi icin bu israf tekrarliyordu. */}
                    <Link href={p.path} target="_blank" prefetch={false} style={{ flex: 1, minWidth: 0, fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.path}</Link>
                    <div style={{ flexShrink: 0, fontSize: '0.82rem', color: 'var(--color-text)', fontWeight: 700 }}>{p.views.toLocaleString('tr-TR')} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>görüntüleme · {p.uniques.toLocaleString('tr-TR')} kişi</span></div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* ============ GERÇEK KULLANICI HIZI (RUM, çerezsiz) ============ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-text)' }}>⚡ Gerçek kullanıcı hızı</h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Süreyi ziyaretçinin <b>kendi tarayıcısı</b> raporluyor — kendi masaüstümüzden ölçtüğümüz değil, telefonda gerçekten görülen süre.
              Son 30 gün, {perf.orneklem_30.toLocaleString('tr-TR')} açılış.
            </p>
          </div>

          {perfDormant && <Dormant file="sql/features-web-vitals.sql" />}

          {!perfDormant && perf.orneklem_30 === 0 ? (
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 14, padding: 16, background: 'var(--color-surface)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Henüz ölçüm yok. İlk veri için canlı siteyi (basementonfire.com) bir tarayıcıda aç, gez ve <b>sekmeyi gizle veya kapat</b> —
              ölçüm o anda gönderilir. Localhost sayılmaz.
            </div>
          ) : !perfDormant && (
            <>
              {/* Aletin kendi sağlığı. Ne kadarının neden sayılmadığını GÖRMEDEN
                  temizlenmiş sayılara güvenilmez.
                  ⚠ Gizli sekme satırı ATILMIYOR, yalnız BOYA sütunları geçersiz
                  sayılıyor: kontrollü deneyde gizli sekme responseStart'ı 131,5 ms
                  verdi (sıfır şişme), yalnız fcp/lcp raporlanmadı. Onları TTFB'den
                  elemek hızlı örnekleri atmak olurdu — ölçüldü, p75 2503→2970. */}
              {perf.kirlilik && (
                <Section title="Ölçüm sağlığı — hangi satır hangi metriğe girdi">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, fontSize: '0.82rem' }}>
                    <span>Ham: <b>{perf.kirlilik.ham_30.toLocaleString('tr-TR')}</b></span>
                    <span style={{ color: 'var(--color-text-muted)' }} title="?notrack ile işaretli cihaz — tüm metriklerden elenir">
                      Ekip (elendi): <b>{perf.kirlilik.ekip_elendi.toLocaleString('tr-TR')}</b>
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }} title="Gizli sekme ya da fcp > load + 200 — yalnız boya sütunları geçersiz, TTFB'si sayılır">
                      Boyaması geçersiz: <b>{perf.kirlilik.boya_gecersiz.toLocaleString('tr-TR')}</b>
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }} title="fcp ve lcp ikisi de boş — muhtemelen gizli sekme, ama eski tarayıcı da olabilir">
                      Boyaması hiç yok: <b>{perf.kirlilik.boya_hic_yok.toLocaleString('tr-TR')}</b>
                    </span>
                    <span>TTFB'ye giren: <b style={{ color: 'var(--color-success)' }}>{perf.kirlilik.ttfb_sayilan.toLocaleString('tr-TR')}</b></span>
                    <span>LCP'ye giren: <b style={{ color: 'var(--color-success)' }}>{perf.kirlilik.boya_sayilan.toLocaleString('tr-TR')}</b></span>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                    ⚠ Yol (sayfa) ataması <b>2026-08-09'a kadar hatalıydı</b> — o tarihten önceki
                    sayfa bazlı kırılıma güvenme. TTFB, sunucu payı değil: yönlendirme + DNS + TCP +
                    TLS + sunucu <b>toplamı</b>. Origin payı ayrıca ölçüldü, 105-180 ms.
                  </p>
                </Section>
              )}

              {perf.lcp_dagilim && (
                <Section title="Sayfayı ne kadar hızlı gördüler? (LCP dağılımı)">
                  <LcpDagilim d={perf.lcp_dagilim} />
                </Section>
              )}

              <Section title="Metrikler — p75 asıl rakam (ziyaretçilerin %75'i bundan hızlı gördü)">
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', minWidth: 460 }}>
                    <thead>
                      <tr style={{ color: 'var(--color-text-muted)', fontSize: '0.74rem', textAlign: 'right' }}>
                        <th style={{ textAlign: 'left', fontWeight: 700, paddingBottom: 6 }}>Metrik</th>
                        <th style={{ fontWeight: 700, paddingBottom: 6 }}>Orta (p50)</th>
                        <th style={{ fontWeight: 800, paddingBottom: 6, color: 'var(--color-text)' }}>p75</th>
                        <th style={{ fontWeight: 700, paddingBottom: 6 }}>En kötü %5</th>
                        <th style={{ fontWeight: 700, paddingBottom: 6 }}>Ölçüm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perf.metrikler.map((m) => (
                        // "− TTFB" satırları = ilk bayttan sonrası, yani KODUN etkilediği
                        // tek pencere. LCP p75 ağ varyansıyla zıpladığı için bu trafikte
                        // 400 ms'lik bir iyileşmeyi görmesi ~90 gün sürer; bu iki satır
                        // aynı işi ~10 günde gösterir. Doğrulama metriği bunlar.
                        <tr key={m.ad} style={{ borderTop: '1px solid var(--color-border)', background: m.ad.includes('− TTFB') ? 'var(--color-surface-2, rgba(127,127,127,0.06))' : undefined }}>
                          <td style={{ padding: '7px 0' }}>
                            <div style={{ fontWeight: 800, color: 'var(--color-text)' }}>{m.ad}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{m.aciklama}</div>
                          </td>
                          <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>{ms(m.p50)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 900, fontSize: '0.95rem', color: perfRenk(m.p75, m.iyi, m.kotu) }} title={`iyi ≤ ${ms(m.iyi)} · kötü > ${ms(m.kotu)}`}>{ms(m.p75)}</td>
                          <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>{ms(m.p95)}</td>
                          <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>{m.n.toLocaleString('tr-TR')}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '7px 0' }}>
                          <div style={{ fontWeight: 800, color: 'var(--color-text)' }}>CLS</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Sayfa okurken zıpladı mı</div>
                        </td>
                        <td />
                        <td style={{ textAlign: 'right', fontWeight: 900, fontSize: '0.95rem', color: perfRenk(perf.cls_p75, 100, 250) }} title="iyi ≤ 0,10 · kötü > 0,25">
                          {perf.cls_p75 == null ? '—' : (perf.cls_p75 / 1000).toLocaleString('tr-TR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                        </td>
                        <td /><td />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section title="Cihaza göre — masaüstü ile telefon farkı">
                {perf.cihazlar.length === 0 ? (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Henüz veri yok.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                    {perf.cihazlar.map((c) => (
                      <div key={c.cihaz} style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: '12px 14px' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                          {c.cihaz === 'mobil' ? '📱 Telefon' : c.cihaz === 'masaustu' ? '🖥️ Masaüstü' : '❔ Bilinmiyor'} · {c.n.toLocaleString('tr-TR')} açılış
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, marginTop: 4, color: perfRenk(c.lcp_p75, 2500, 4000) }}>{ms(c.lcp_p75)}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          p75 LCP · sunucu {ms(c.ttfb_p75)}
                          {c.lcp_ttfb_p75 != null && <> · <b title="ilk bayttan sonrası — kodun etkilediği pencere">bizim payımız {ms(c.lcp_ttfb_p75)}</b></>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {perf.baglantilar.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    <span style={{ fontWeight: 700 }}>Bağlantı:</span>
                    {perf.baglantilar.map((b) => (
                      <span key={b.tur}>{b.tur} → <b style={{ color: perfRenk(b.lcp_p75, 2500, 4000) }}>{ms(b.lcp_p75)}</b> ({b.n})</span>
                    ))}
                  </div>
                )}
                {/* Protokol dağılımı. h3 (QUIC) yaygınsa soğuk bağlantı maliyeti
                    için yapacak bir şey yok demektir; h2'de takılıysak el sıkışma
                    turlarını kısacak somut bir kaldıraç var. Yerel curl derlemesi
                    h2/h3 desteklemediği için bunu ölçebilecek tek yer tarayıcı. */}
                {perf.protokoller && perf.protokoller.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    <span style={{ fontWeight: 700 }}>Protokol:</span>
                    {perf.protokoller.map((p) => (
                      <span key={p.ad}>{p.ad} → <b style={{ color: perfRenk(p.ttfb_p75, 800, 1800) }}>{ms(p.ttfb_p75)}</b> ({p.n})</span>
                    ))}
                  </div>
                )}
              </Section>

              {perf.soguk && perf.soguk.toplam > 0 && (
                <Section title="Soğuk vuruşlar — önbellek bayatken gelen ziyaretçiler">
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>
                    {perf.soguk.toplam.toLocaleString('tr-TR')} açılışın <b style={{ color: perfRenk(perf.soguk.adet, 0, Math.max(1, perf.soguk.toplam * 0.05)) }}>{perf.soguk.adet.toLocaleString('tr-TR')} tanesinde</b> sunucu
                    1 sn'den geç yanıt verdi (%{perf.soguk.toplam ? Math.round((perf.soguk.adet / perf.soguk.toplam) * 100) : 0}).
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                      Bu ziyaretçiler ISR süresi dolmuş bir sayfaya denk gelip yeniden üretimi <b>bekledi</b>. Sık tekrarlıyorsa çare
                      düzenli ısıtma ya da <code>revalidate</code> penceresini genişletmek.
                    </div>
                  </div>
                  {perf.soguk.ornekler.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column' }}>
                      {perf.soguk.ornekler.map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '5px 0', borderTop: '1px solid var(--color-border)', fontSize: '0.8rem' }}>
                          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text)' }}>{s.path}</span>
                          <span style={{ flexShrink: 0, fontWeight: 800, color: 'var(--color-danger)' }}>{ms(s.ttfb_ms)}</span>
                          <span style={{ flexShrink: 0, color: 'var(--color-text-muted)', width: 92, textAlign: 'right' }}>
                            {new Date(s.created_at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              <Section title="Sayfa bazında p75 (uzun = yavaş)">
                {perf.sayfalar.length === 0 ? (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Henüz veri yok.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {perf.sayfalar.map((p) => (
                      <div key={p.path} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: '1px solid var(--color-border)' }}>
                        {/* prefetch KAPALI — yukaridaki "en cok gezilen sayfalar"
                            listesiyle ayni gerekce: yol veriden geliyor, hedef yeni sekme. */}
                        <Link href={p.path} target="_blank" prefetch={false} style={{ flex: 1, minWidth: 0, fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.path}</Link>
                        <span style={{ flexShrink: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.n.toLocaleString('tr-TR')} açılış</span>
                        <span style={{ flexShrink: 0, width: 76, textAlign: 'right', fontSize: '0.85rem', fontWeight: 800, color: perfRenk(p.lcp_p75, 2500, 4000) }} title="p75 LCP">{ms(p.lcp_p75)}</span>
                        <span style={{ flexShrink: 0, width: 68, textAlign: 'right', fontSize: '0.78rem', color: perfRenk(p.ttfb_p75, 800, 1800) }} title={`p75 sunucu · en kötü ${ms(p.ttfb_max)}`}>{ms(p.ttfb_p75)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Günlük p75 LCP (son 14 gün) — bu grafikte UZUN ÇUBUK KÖTÜ">
                <DailyBars
                  series={perfSeries}
                  fmt={(v) => (v / 1000).toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  renk={(v) => perfRenk(v, 2500, 4000)}
                />
              </Section>
            </>
          )}
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
          <br />Hız ölçümü ziyaretçinin tarayıcısından gelir; kimlik veya çerez taşımaz, yalnızca süre ve sayfa yolu kaydedilir.
        </p>
      </div>
    </main>
  );
}
