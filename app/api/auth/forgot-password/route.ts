import { createAuthClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Üretimde NEXT_PUBLIC_SITE_URL kullan (örn. https://basementonfire.com).
  // Tanımlı değilse isteğin origin'ine düş (lokal geliştirme: http://localhost:3000).
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, '');
  const redir = (path: string) => NextResponse.redirect(new URL(path, siteUrl), { status: 302 });

  const form = await req.formData();
  const email = (form.get('email') as string)?.trim();
  if (!email) return redir('/forgot-password?error=E-posta+gerekli');

  const client = await createAuthClient();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });

  if (error) return redir(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  return redir('/forgot-password?sent=1');
}
