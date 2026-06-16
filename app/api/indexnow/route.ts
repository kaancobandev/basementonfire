import { timingSafeEqual } from 'crypto';
import { db } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { submitToIndexNow, postUrl, INDEXNOW_KEY } from '@/lib/indexnow';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

// Sabit-zamanlı karşılaştırma — token doğrulamasında zamanlama yan-kanalını kapatır.
function tokenMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Manuel / toplu IndexNow gönderimi — YALNIZCA sahip çağırabilir.
 *
 * Güvenlik: anahtarımız herkese açık olduğundan, korumasız bir uç herkesin
 * bizim anahtarımızla motorlara spam yapmasına ve anahtarın kısıtlanmasına yol
 * açardı. Bu yüzden `INDEXNOW_ADMIN_TOKEN` ortam değişkeni gerekir; ayarlı
 * değilse uç tamamen devre dışıdır (503).
 *
 * Kullanım (ör. ilk yayından sonra tüm gönderileri tek seferde göndermek için):
 *   POST /api/indexnow
 *   Authorization: Bearer <INDEXNOW_ADMIN_TOKEN>
 *   { "recent": 5000 }            → son 5000 herkese açık gönderiyi gönderir
 *   { "urls": ["https://..."] }   → belirli URL'leri gönderir
 *   { "recent": 100, "dryRun": true } → ağ isteği yapmadan yükü önizler
 */
export async function POST(req: Request) {
  const token = process.env.INDEXNOW_ADMIN_TOKEN;
  if (!token) return json({ error: 'IndexNow yönetim ucu devre dışı (INDEXNOW_ADMIN_TOKEN ayarlı değil).' }, 503);

  const auth = req.headers.get('authorization') ?? '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const provided = bearer || (new URL(req.url).searchParams.get('token') ?? '');
  if (!provided || !tokenMatches(provided, token)) return json({ error: 'Yetkisiz' }, 401);

  let body: { urls?: string[]; recent?: number; dryRun?: boolean } = {};
  try { body = await req.json(); } catch { /* gövde opsiyonel */ }

  const urls: string[] = Array.isArray(body.urls) ? body.urls.filter((u) => typeof u === 'string') : [];

  // recent: en yeni N herkese açık gönderiyi (/p/id) topla
  if (typeof body.recent === 'number' && body.recent > 0) {
    const { data } = await db
      .from('quick_facts')
      .select('id, users!quick_facts_user_id_fkey!inner(is_private)')
      .eq('users.is_private', false)
      .order('created_at', { ascending: false })
      .limit(Math.min(body.recent, 10000));
    for (const p of (data ?? []) as Array<{ id: number }>) urls.push(postUrl(p.id));
  }

  // Yetkili + bilinçli sahip eylemi: host gate'ine bakılmaksızın gönderir.
  const result = await submitToIndexNow(urls, { dryRun: !!body.dryRun });
  return json({ result });
}

// Yapılandırma kontrolü (anahtar zaten herkese açık) — sızıntı yok.
export async function GET() {
  return json({
    key: INDEXNOW_KEY,
    keyLocation: `https://basementonfire.com/${INDEXNOW_KEY}.txt`,
    adminEnabled: !!process.env.INDEXNOW_ADMIN_TOKEN,
  });
}
