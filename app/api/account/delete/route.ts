import { createAuthClientForResponse, getMe } from '@/lib/supabase/server';
import { requestDeletion, GRACE_DAYS } from '@/lib/accountDeletion';
import { NextResponse, type NextRequest } from 'next/server';

const fail = (req: NextRequest, msg: string) =>
  NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(msg)}`, req.url), { status: 303 });

/**
 * Hesap silme TALEBİ (soft). Veriyi silmez — hesabı gizler ve GRACE_DAYS gün
 * geri alma süresi başlatır. Kalıcı silme cron'da (purgeAccount) yapılır.
 */
export async function POST(req: NextRequest) {
  const { me } = await getMe();
  if (!me) return NextResponse.redirect(new URL('/login', req.url), { status: 303 });

  const form = await req.formData();
  const confirm = (form.get('confirm') as string)?.trim();

  // Yanlışlıkla silmeyi önle: kullanıcı adını birebir yazmalı.
  if (confirm !== me.username)
    return fail(req, 'Onay için kullanıcı adını birebir yazmalısın.');

  const res = await requestDeletion(me.id);
  if (!res.ok) return fail(req, res.error ?? 'Silme talebi başarısız.');

  // Oturumu kapat — cookie temizliği DÖNEN yanıta yazılmalı.
  const response = NextResponse.redirect(
    new URL(`/login?silindi=${GRACE_DAYS}`, req.url),
    { status: 303 },
  );
  const client = createAuthClientForResponse(req, response);
  await client.auth.signOut();
  return response;
}
