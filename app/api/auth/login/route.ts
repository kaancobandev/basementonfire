import { createAuthClientForResponse } from '@/lib/supabase/server';
import { recordLogin } from '@/lib/login-tracking';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email    = (form.get('email')    as string)?.trim();
  const password =  form.get('password') as string;

  if (!email || !password)
    return NextResponse.redirect(new URL('/login?error=E-posta ve şifre gerekli', req.url), { status: 303 });

  // Auth cookie'leri doğrudan bu redirect yanıtına yazılır (createAuthClientForResponse).
  const response = NextResponse.redirect(new URL('/', req.url), { status: 303 });
  const client = createAuthClientForResponse(req, response);

  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, req.url), { status: 303 });

  // Basarili girisi sunucu tarafinda kaydet (cerez onayindan bagimsiz sayim + ulke).
  // signIn sonucundan kullaniciyi aldik -> ekstra auth turu yok. En iyi caba, girisi bozmaz.
  if (data.user) await recordLogin(req, { authId: data.user.id, method: 'password' });

  return response;
}
