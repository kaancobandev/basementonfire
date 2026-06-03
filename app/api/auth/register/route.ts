import { createAuthClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const client = await createAuthClient();
  const form = await req.formData();
  const email    = (form.get('email')    as string)?.trim();
  const password =  form.get('password') as string;
  const username = (form.get('username') as string)?.trim();

  if (!email || !password || !username)
    return NextResponse.redirect(new URL('/register?error=Tüm alanları doldurun', req.url), { status: 303 });
  if (password.length < 6)
    return NextResponse.redirect(new URL('/register?error=Şifre en az 6 karakter olmalı', req.url), { status: 303 });

  const { error } = await client.auth.signUp({ email, password, options: { data: { username } } });

  if (error)
    return NextResponse.redirect(new URL(`/register?error=${encodeURIComponent(error.message)}`, req.url), { status: 303 });

  return NextResponse.redirect(new URL('/?welcome=1', req.url), { status: 303 });
}
