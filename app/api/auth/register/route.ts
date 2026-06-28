import { createAuthClientForResponse } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email    = (form.get('email')    as string)?.trim();
  const password =  form.get('password') as string;
  const username = (form.get('username') as string)?.trim();

  if (!email || !password || !username)
    return NextResponse.redirect(new URL('/register?error=Tüm alanları doldurun', req.url), { status: 303 });
  if (password.length < 6)
    return NextResponse.redirect(new URL('/register?error=Şifre en az 6 karakter olmalı', req.url), { status: 303 });

  // Kayıt sonrası oturum cookie'leri (e-posta onayı kapalıysa) doğrudan bu yanıta yazılır.
  const response = NextResponse.redirect(new URL('/?welcome=1', req.url), { status: 303 });
  const client = createAuthClientForResponse(req, response);

  const { error } = await client.auth.signUp({ email, password, options: { data: { username } } });

  if (error)
    return NextResponse.redirect(new URL(`/register?error=${encodeURIComponent(error.message)}`, req.url), { status: 303 });

  return response;
}
