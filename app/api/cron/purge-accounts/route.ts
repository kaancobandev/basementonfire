import { NextResponse, type NextRequest } from 'next/server';
import { findExpiredDeletions, purgeAccount, GRACE_DAYS } from '@/lib/accountDeletion';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Tek çalıştırmada en fazla bu kadar hesap silinir (zaman aşımını önler). */
const BATCH = 20;

/**
 * 30 günü dolan silme taleplerini KALICI olarak uygular.
 *
 * Bir cron servisinden çağır (Netlify Scheduled Function, cron-job.org, GitHub Actions…):
 *   GET /api/cron/purge-accounts   +   Authorization: Bearer <CRON_SECRET>
 *   (veya ?key=<CRON_SECRET>)
 *
 * Günde bir kez yeterli.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;

  // Sır tanımlı değilse route KAPALI — yanlışlıkla herkese açık silme uç noktası olmasın.
  if (!secret)
    return NextResponse.json({ error: 'CRON_SECRET tanımlı değil — route devre dışı.' }, { status: 503 });

  const verilen =
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    new URL(req.url).searchParams.get('key');

  if (verilen !== secret)
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const suresiDolan = await findExpiredDeletions();
  const parti = suresiDolan.slice(0, BATCH);

  const sonuclar: Array<{ userId: number; ok: boolean; error?: string }> = [];
  for (const userId of parti) {
    const r = await purgeAccount(userId);
    sonuclar.push({ userId, ...r });
  }

  return NextResponse.json({
    graceDays: GRACE_DAYS,
    suresiDolanToplam: suresiDolan.length,
    buCalistirmadaIslenen: parti.length,
    kalan: Math.max(0, suresiDolan.length - parti.length), // bir sonraki çalıştırmada
    sonuclar,
  });
}
