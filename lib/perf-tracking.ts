import { db, logIfError } from '@/lib/supabase/server';
import { readGeoFromHeaders, type HeaderGetter } from '@/lib/geo';
import { BOT_RE } from '@/lib/pageview-tracking';

// Gercek kullanici hizi kaydi (RUM). Istemci: app/components/WebVitalsBeacon.tsx
//
// page_views'DEN FARKI: burada visitor_hash YOK. Olculen sey sayfa acilisinin
// SURESI; kim actigi bilgisine ihtiyac yok, o yuzden hic uretilmiyor. Ham IP
// yalniz Netlify'in geo basligi icin okunur, o da saklanmaz.

export type PerfBody = {
  p?: unknown; ttfb?: unknown; fcp?: unknown; lcp?: unknown; load?: unknown;
  inp?: unknown; cls?: unknown; nav?: unknown; dev?: unknown; conn?: unknown;
};

// Tarayicidan gelen sayilara GUVENME: govde istemciden, yani disaridan geliyor.
// Sinir disi degerler tabloyu ve yuzdelikleri sessizce bozardi.
const SURE_TAVAN_MS = 120_000;
const sure = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : NaN;
  if (!Number.isFinite(n) || n <= 0 || n > SURE_TAVAN_MS) return null;
  return Math.round(n);
};
const secenek = (v: unknown, izin: readonly string[]): string | null =>
  typeof v === 'string' && izin.includes(v) ? v : null;

const NAV_TURLERI = ['navigate', 'reload', 'back_forward', 'prerender'] as const;
const CIHAZLAR = ['mobil', 'masaustu'] as const;
const BAGLANTILAR = ['slow-2g', '2g', '3g', '4g'] as const;

export async function recordPerf(h: HeaderGetter, body: PerfBody): Promise<void> {
  try {
    // Gelistirme trafigi sayilmaz — recordHit ile ayni iki katmanli kapi.
    // Olcum disariya sunulacak; kendi localhost testin p75'i bozmasin.
    if (process.env.NODE_ENV !== 'production') return;
    const host = (h.get('host') || '').toLowerCase();
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('[::1]')) return;

    const ua = h.get('user-agent') || '';
    if (!ua || BOT_RE.test(ua)) return;

    let path = (typeof body.p === 'string' ? body.p : '').split('?')[0].split('#')[0];
    if (!path.startsWith('/') || path.startsWith('/api') || path.startsWith('/_next') || path.startsWith('/yonetim')) return;
    path = path.slice(0, 512);

    const ttfb_ms = sure(body.ttfb);
    const lcp_ms = sure(body.lcp);
    // Tek bir olculebilir sey yoksa satir yazma — bos satir yuzdelikleri seyreltir.
    if (ttfb_ms === null && lcp_ms === null && sure(body.fcp) === null) return;

    const clsHam = typeof body.cls === 'number' ? body.cls : NaN;
    const geo = readGeoFromHeaders(h);

    const { error } = await db.from('perf_samples').insert({
      path,
      ttfb_ms,
      fcp_ms: sure(body.fcp),
      lcp_ms,
      load_ms: sure(body.load),
      inp_ms: sure(body.inp),
      cls_x1000: Number.isFinite(clsHam) && clsHam >= 0 && clsHam <= 10_000 ? Math.round(clsHam) : null,
      nav_type: secenek(body.nav, NAV_TURLERI),
      device: secenek(body.dev, CIHAZLAR),
      conn: secenek(body.conn, BAGLANTILAR),
      country_code: geo.country_code,
    });
    // Tablo (SQL) henuz yoksa sessizce loglanir, hicbir seyi bozmaz.
    logIfError('recordPerf insert', error);
  } catch (e) {
    console.error('[recordPerf] hata:', e);
  }
}
