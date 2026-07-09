import { NextResponse, type NextRequest } from 'next/server';
import { recordHit } from '@/lib/pageview-tracking';

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
  await recordHit(req.headers, path);
  // 204: govde yok, beacon icin ideal.
  return new NextResponse(null, { status: 204 });
}
