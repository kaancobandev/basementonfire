// IndexNow — Bing, Yandex, Seznam, Naver gibi arama motorlarına bir URL'in
// oluştuğunu/değiştiğini/silindiğini ANINDA bildirir (sitemap taramasını beklemeden).
//
// Anahtar GİZLİ DEĞİLDİR: sahipliği kanıtlamak için sitede /{KEY}.txt olarak
// herkese açık barındırılır. Yani repoda bulunması güvenlik sorunu değildir.
const KEY = '322123c0f833a54f338791466311fd78';
const HOST = 'basementonfire.com';
const SITE = `https://${HOST}`;
// Tek uçtan gönderim yeterli — IndexNow ağı katılımcı motorlara otomatik yayar.
const ENDPOINT = 'https://api.indexnow.org/indexnow';

export const INDEXNOW_KEY = KEY;
export const postUrl = (id: number | string) => `${SITE}/p/${id}`;
export const profileUrl = (username: string) => `${SITE}/u/${encodeURIComponent(username)}`;

// Otomatik ping'i YALNIZCA gerçek üretim isteklerinde at. Netlify'da production,
// deploy-preview ve branch-deploy derlemelerinin HEPSİ `next build` (NODE_ENV=production)
// olduğundan NODE_ENV ayırt edici değildir; istemcinin gördüğü host ise güvenilirdir:
// localhost (yerel dev/build) ve *.netlify.app (önizleme/dal) doğal olarak elenir.
const PROD_HOSTS = new Set(['basementonfire.com', 'www.basementonfire.com']);
export function isLiveRequest(req: Request): boolean {
  const raw = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '';
  const host = raw.split(',')[0].trim().toLowerCase();
  return PROD_HOSTS.has(host);
}

export type IndexNowResult =
  | { ok: true; sent: number; status: number }
  | { ok: true; sent: 0; skipped: 'empty' }
  | { ok: true; dryRun: true; payload: { host: string; key: string; keyLocation: string; urlList: string[] } }
  | { ok: false; error: string };

/**
 * Verilen URL'leri IndexNow'a gönderir.
 *  - ASLA hata fırlatmaz → gönderi oluşturma/silme akışını bozmaz.
 *  - Sadece kendi host'umuzdaki (https://basementonfire.com/...) mutlak URL'leri kabul eder
 *    (IndexNow zaten yabancı host'u reddeder; baştan eler).
 *  - Yinelenenleri ayıklar, en fazla 10.000 URL.
 *  - `dryRun` ağ isteği yapmadan gönderilecek yükü döndürür.
 *
 * NE ZAMAN gönderileceği (üretim mi, önizleme mi) çağıranın sorumluluğudur:
 * otomatik kancalar `isLiveRequest(req)` ile koşar; yetkili admin ucu her zaman
 * gönderir (sahibin bilinçli eylemi).
 */
export async function submitToIndexNow(
  urls: string | string[],
  opts: { dryRun?: boolean } = {},
): Promise<IndexNowResult> {
  const urlList = [...new Set((Array.isArray(urls) ? urls : [urls]).filter(Boolean))]
    .filter((u) => u.startsWith(`${SITE}/`))
    .slice(0, 10000);
  if (!urlList.length) return { ok: true, sent: 0, skipped: 'empty' };

  const payload = { host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList };
  if (opts.dryRun) return { ok: true, dryRun: true, payload };

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = (await res.text().catch(() => '')).slice(0, 200);
      console.warn('[indexnow]', res.status, body);
      return { ok: false, error: `HTTP ${res.status} ${body}`.trim() };
    }
    return { ok: true, sent: urlList.length, status: res.status };
  } catch (e) {
    const msg = (e as Error)?.message ?? String(e);
    console.warn('[indexnow] gönderim başarısız:', msg);
    return { ok: false, error: msg };
  }
}
