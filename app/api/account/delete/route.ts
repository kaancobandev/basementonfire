import { createAuthClientForResponse, getMe } from '@/lib/supabase/server';
import { purgeAccount } from '@/lib/accountDeletion';
import { NextResponse, type NextRequest } from 'next/server';

const fail = (req: NextRequest, msg: string) =>
  NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(msg)}`, req.url), { status: 303 });

/**
 * Hesabı ANINDA ve KALICI siler. Geri alma süresi YOKTUR.
 * Yanlışlıkla silmeye karşı tek koruma: kullanıcı adını birebir yazma onayı.
 */
export async function POST(req: NextRequest) {
  const { me } = await getMe();
  if (!me) return NextResponse.redirect(new URL('/login', req.url), { status: 303 });

  const form = await req.formData();
  const confirm = (form.get('confirm') as string)?.trim();

  if (confirm !== me.username)
    return fail(req, 'Onay için kullanıcı adını birebir yazmalısın.');

  const res = await purgeAccount(me.id);
  if (!res.ok) return fail(req, res.error ?? 'Hesap silinemedi.');

  // Oturumu kapat — cookie temizliği DÖNEN yanıta yazılmalı.
  // (auth kullanıcısı zaten silindi; bu cookie'leri de temizler.)
  const response = NextResponse.redirect(new URL('/login?silindi=1', req.url), { status: 303 });
  const client = createAuthClientForResponse(req, response);
  await client.auth.signOut().catch(() => {}); // auth user gitti → hata verebilir, önemsiz
  return response;
}
