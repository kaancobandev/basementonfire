import { createAuthClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const redirect = (location: string) =>
  NextResponse.redirect(new URL(location, process.env.NEXT_PUBLIC_SUPABASE_URL ? 'http://localhost:3000' : 'http://localhost:3000'), { status: 302 });

export async function POST(req: Request) {
  const redir = (path: string) =>
    NextResponse.redirect(new URL(path, new URL(req.url).origin), { status: 302 });

  const form = await req.formData();
  const email = (form.get('email') as string)?.trim();

  if (!email) return redir('/forgot-password?error=E-posta+gerekli');

  const client = await createAuthClient();
  const origin = new URL(req.url).origin;

  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) return redir(`/forgot-password?error=${encodeURIComponent(error.message)}`);

  return redir('/forgot-password?sent=1');
}
