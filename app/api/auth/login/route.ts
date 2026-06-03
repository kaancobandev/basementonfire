import { createAuthClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const client = await createAuthClient();
  const form = await req.formData();
  const email    = (form.get('email')    as string)?.trim();
  const password =  form.get('password') as string;

  if (!email || !password)
    return NextResponse.redirect(new URL('/login?error=E-posta ve şifre gerekli', req.url), { status: 303 });

  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, req.url), { status: 303 });

  return NextResponse.redirect(new URL('/', req.url), { status: 303 });
}
