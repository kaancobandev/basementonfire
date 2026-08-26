import { NextResponse, type NextRequest } from 'next/server';
import { recordPerf } from '@/lib/perf-tracking';
import { limitKey, identify, KIMLIKSIZ } from '@/lib/rateLimit';

// Gercek kullanici hizi beacon'i. Istemci (WebVitalsBeacon) sayfa gizlenirken
// navigator.sendBeacon ile BIR KEZ POST eder -> istek gercek ziyaretcinin
// tarayicisindan gelir, geo basligi dogru kisiye aittir. Onay/cerez gerekmez.
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    /* 🚨 HIZ FRENI — 23.08.2026 denetimi. /api/hit ile ayni gerekce: kimliksiz,
       frensiz bir yazma ucuydu ve RUM panelini besliyor. Uydurma olcumlerle
       FCP/LCP dagilimi istenildigi gibi kaydirilabilirdi — ve bu alet zaten bir
       kez bozulmus, olculerine guvenilmez hale gelmisti. */
    const kimlik = identify(req.headers);
    // IP okunamiyorsa fren ATLANIR (bkz. KIMLIKSIZ).
    if (kimlik !== KIMLIKSIZ && !(await limitKey('beacon', kimlik)).ok)
      return new NextResponse(null, { status: 204 });

    // sendBeacon govdesi sayfa kapanirken kesilebilir -> req.json() atardi,
    // req.text() atmaz. (/api/hit ile ayni desen.)
    const text = await req.text();
    if (text) await recordPerf(req.headers, JSON.parse(text));
  } catch {
    /* govde yoksa/bozuksa olcumu sessizce dus — beacon asla hata gostermemeli */
  }
  // 204: govde yok, sendBeacon icin ideal.
  return new NextResponse(null, { status: 204 });
}
