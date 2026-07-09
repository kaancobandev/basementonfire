import crypto from 'node:crypto';
import { db, logIfError } from '@/lib/supabase/server';
import { readGeoFromHeaders, clientIp, type HeaderGetter } from '@/lib/geo';

// Botlari say(ma)mak icin: gercek tarayici UA'lari bunlarin hicbirini icermez.
// (Zaten botlar JS calistirmaz -> beacon gondermez; bu ekstra guvence.)
const BOT_RE = /bot|crawl|spider|slurp|mediapartners|bingpreview|facebookexternalhit|whatsapp|telegram|slackbot|discordbot|embedly|redditbot|applebot|petalbot|yandex|baidu|semrush|ahrefs|mj12|dotbot|headless|lighthouse|python-requests|curl\/|wget|axios|go-http-client|node-fetch/i;

// Cerezsiz sayfa goruntuleme kaydi. /api/hit route'undan cagrilir (istemci
// beacon'i tetikler) -> sayfa goruntuleme basina TAM BIR KEZ, render yolundan
// bagimsiz. Tekil ziyaretci gunluk DONEN hash ile yaklasik sayilir (ham IP
// saklanmaz, ertesi gun eslesmez) -> KVKK/GDPR dostu (Plausible yontemi).
export async function recordHit(h: HeaderGetter, rawPath: string): Promise<void> {
  try {
    const ua = h.get('user-agent') || '';
    if (!ua || BOT_RE.test(ua)) return;

    // Yol istemciden gelir; sadece gercek site sayfalari (API/dahili/admin haric).
    let path = (rawPath || '').split('?')[0].split('#')[0];
    if (!path.startsWith('/') || path.startsWith('/api') || path.startsWith('/_next') || path.startsWith('/yonetim')) return;
    path = path.slice(0, 512);

    const geo = readGeoFromHeaders(h);
    const ip = clientIp(h);
    const salt = process.env.SUPABASE_SERVICE_KEY || 'basements-salt';
    // Istanbul gunune gore hash -> "gunluk tekil" dogru sinirlarla hesaplanir.
    const day = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
    const visitor_hash = crypto.createHash('sha256').update(`${ip}|${ua}|${day}|${salt}`).digest('hex').slice(0, 32);

    const { error } = await db.from('page_views').insert({
      path,
      country_code: geo.country_code,
      country_name: geo.country_name,
      visitor_hash,
    });
    // Tablo (SQL) henuz yoksa sessizce loglanir, hicbir seyi bozmaz.
    logIfError('recordHit insert', error);
  } catch (e) {
    console.error('[recordHit] hata:', e);
  }
}
