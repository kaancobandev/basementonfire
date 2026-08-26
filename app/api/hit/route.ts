import { NextResponse, type NextRequest } from 'next/server';
import { recordHit } from '@/lib/pageview-tracking';
import { limitKey, identify, KIMLIKSIZ } from '@/lib/rateLimit';

// Cerezsiz sayfa goruntuleme beacon'i. Istemci (PageviewBeacon) her sayfa
// gorunumunde bir kez POST eder. Bu istek kullanicinin tarayicisindan geldigi
// icin geo/IP/UA basliklari DOGRU kullaniciya aittir. Onay gerektirmez.
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let path = '/';
  try {
    // req.text() bos govdede atmaz (req.json() atar) — keepalive beacon'i
    // navigasyonda kesilirse govde bos gelebilir.
    const text = await req.text();
    if (text) {
      const body = JSON.parse(text);
      if (typeof body?.p === 'string') path = body.p;
    }
  } catch {
    /* govde yoksa/bozuksa '/' varsay */
  }

  /* 🚨 HIZ FRENI — 23.08.2026 denetimi. Bu uc kimliksiz ve frensizdi.
     `uniques` sayaci visitor_hash'i UA'dan turetiyor, yani UA cevirerek atilan
     her istek YENI bir "tekil ziyaretci" uretiyordu → panelin en cok bakilan
     sayisi disaridan oynatilabilir durumdaydi. Fren IP basina (UA'ya bakmaz).
     Asilirsa 204 doner ve olcum sessizce duser; bkz. RATE_LIMITS.beacon. */
  const kimlik = identify(req.headers);
  // IP okunamiyorsa fren ATLANIR: tek kovada tum siteyi kismak, olcumu
  // bozmak demektir (bkz. KIMLIKSIZ).
  const gecer = kimlik === KIMLIKSIZ || (await limitKey('beacon', kimlik)).ok;
  if (gecer) await recordHit(req.headers, path);

  // 204: govde yok, beacon icin ideal.
  return new NextResponse(null, { status: 204 });
}
