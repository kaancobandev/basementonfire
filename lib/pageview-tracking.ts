import crypto from 'node:crypto';
import { db, logIfError } from '@/lib/supabase/server';
import { readGeoFromHeaders, clientIp, type HeaderGetter } from '@/lib/geo';

// Botlari say(ma)mak icin: gercek tarayici UA'lari bunlarin hicbirini icermez.
// (lib/perf-tracking.ts de ayni listeyi kullanir -> tek kaynak.)
//
// "Zaten botlar JS calistirmaz" varsayimi ARTIK GECERLI DEGIL, iki sebeple:
//
// 1. YAPAY ZEKA ARACLARI GERCEK TARAYICI SURUYOR. 2026-08-09'da bu sitede bir
//    performans denetimi kosuldu; ajanlar canli sayfalari gercek bir Chromium'da
//    acti ve beacon'lar normal calisti. Olculen sonuc: o gun 94 goruntuleme /
//    21 tekil -- 10 gunun EN YUKSEGI, ve saat kirilimi denetimin kostugu
//    10:00-13:00 UTC bandinda yigiliyordu (normal gunler 26-85 / 8-20).
//    Yani analiz aracimiz olctugu sayiyi bozuyordu.
//    `navigator.webdriver` bu ise YARAMAZ -- olculdu, `false` donuyor.
//    Tek guvenilir imza UA: "Claude/1.26832.0 ... Electron/42.7.0 ... MSIX".
//    UA sunucuda okunur, istemcinin isbirligine gerek yok.
// 2. Yeni nesil AI tarayicilari/crawler'lari da "bot" kelimesini tasimiyor
//    (chatgpt-user, perplexity-user, claude-user, GoogleOther ...).
//
// ⚠ `?notrack` (localStorage) bu isi COZMEZ: her yeni otomasyon sekmesi/profili
// isareti tasimaz. Cihaz isareti insan gelistirici icin, UA kapisi araclar icin.
export const BOT_RE = /bot|crawl|spider|slurp|mediapartners|bingpreview|facebookexternalhit|whatsapp|telegram|slackbot|discordbot|embedly|redditbot|applebot|petalbot|yandex|baidu|semrush|ahrefs|mj12|dotbot|headless|lighthouse|python-requests|curl\/|wget|axios|go-http-client|node-fetch|claude\/|claude-user|electron\/|chatgpt-user|oai-searchbot|perplexity-user|googleother|google-inspectiontool|externalagent|cohere|cachewarmer/i;

// Cerezsiz sayfa goruntuleme kaydi. /api/hit route'undan cagrilir (istemci
// beacon'i tetikler) -> sayfa goruntuleme basina TAM BIR KEZ, render yolundan
// bagimsiz. Tekil ziyaretci gunluk DONEN hash ile yaklasik sayilir (ham IP
// saklanmaz, ertesi gun eslesmez) -> KVKK/GDPR dostu (Plausible yontemi).
export async function recordHit(h: HeaderGetter, rawPath: string): Promise<void> {
  try {
    // GELISTIRME TRAFIGI SAYILMAZ. `next dev` CANLI veritabanina yazar; bu kapi
    // olmadan localhost'ta gezdigin her sayfa gercek ziyaretci istatistigine
    // karisir. Istatistikler disariya sunuluyor -> kendi testin sayiyi sisirmesin.
    // Iki katman: ortam degiskeni (kesin) + Host basligi (dev'i uzaktan acsan da).
    if (process.env.NODE_ENV !== 'production') return;
    const host = (h.get('host') || '').toLowerCase();
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('[::1]')) return;

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
