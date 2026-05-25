import type { APIRoute } from 'astro';
import { createAuthClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const redirect = (location: string) =>
    new Response(null, { status: 302, headers: { Location: location } });

  const form = await request.formData();
  const email = (form.get('email') as string)?.trim();

  if (!email) return redirect('/forgot-password?error=E-posta+gerekli');

  const headers = new Headers();
  const supabase = createAuthClient(request, headers);

  // redirectTo: kullanıcı e-postadaki linke tıklayınca buraya yönlendirilir
  const origin = new URL(request.url).origin;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    return redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  return redirect('/forgot-password?sent=1');
};
