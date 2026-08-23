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
  giz?: unknown; ekip?: unknown; prt?: unknown; lcpel?: unknown;
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
// nextHopProtocol ALPN kimligi dondurur. Beyaz liste: govde istemciden geliyor,
// serbest metin sutunu kardinaliteyi patlatabilir.
const PROTOKOLLER = ['h3', 'h3-29', 'h2', 'http/1.1', 'http/1.0', ''] as const;
// LCP ogesinin ETIKETI. ⛔ Yalniz tagName saklanir — id/src/selector ASLA:
// bir kullanicinin avatar URL'i ya da gonderi gorseli kisisel veridir, bu hat
// ise cerezsiz/kimliksiz olmak uzere kuruldu. Istemci beyaz liste disini zaten
// 'DIGER'e indiriyor; burada IKINCI kez suzuyoruz cunku govde disaridan geliyor.
const LCP_ETIKETLERI = [
  'IMG', 'VIDEO', 'H1', 'H2', 'H3', 'P', 'DIV', 'SPAN', 'CANVAS', 'svg', 'A', 'SECTION', 'BUTTON', 'DIGER',
] as const;

const bayrak = (v: unknown): boolean => v === true;

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

    const temel = {
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
    };

    const { error } = await db.from('perf_samples').insert({
      ...temel,
      // Kirlilik isaretleri. Satir SILINMIYOR, yalniz isaretleniyor: panel
      // bunlari yuzdeliklerden disliyor ama kirliligin BUYUKLUGUNU olcebilmek
      // (ve esik degisirse gecmisi yeniden yorumlayabilmek) icin veri duruyor.
      gizli: bayrak(body.giz),
      ekip: bayrak(body.ekip),
      proto: secenek(body.prt, PROTOKOLLER),
      // ⚠ `temel` nesnesine DEGIL buraya: sutun henuz yoksa asagidaki yedek
      // yol `temel`i sutunsuz yazabilsin, olcum hatti sessizce olmesin.
      lcp_el: secenek(body.lcpel, LCP_ETIKETLERI),
    });

    // YEDEK YOL — sql/fix-web-vitals-olcum.sql henuz kosulmadiysa.
    // O dosya gizli/ekip/proto sutunlarini ekliyor; yoksa PostgREST insert'i
    // TAMAMEN reddeder ve olcum hatti sessizce olur. Deploy, SQL'den once
    // inerse veri kaybetmeyelim diye sutunsuz bir kez daha deniyoruz.
    // Kod (uykuda sema) tespiti 42P01 DEGIL: PostgREST bilinmeyen sutuna
    // PGRST204, Postgres ise 42703 doner — ikisini de yakala.
    if (error && (error.code === 'PGRST204' || error.code === '42703')) {
      const { error: yedekHata } = await db.from('perf_samples').insert(temel);
      logIfError('recordPerf insert (yedek, isaretsiz)', yedekHata);
      if (!yedekHata) console.warn('[recordPerf] gizli/ekip/proto/lcp_el sutunlarindan biri YOK — sql/fix-web-vitals-olcum.sql ve sql/features-lcp-ogesi.sql calistirilmali');
      return;
    }
    // Tablo (SQL) henuz yoksa sessizce loglanir, hicbir seyi bozmaz.
    logIfError('recordPerf insert', error);
  } catch (e) {
    console.error('[recordPerf] hata:', e);
  }
}
