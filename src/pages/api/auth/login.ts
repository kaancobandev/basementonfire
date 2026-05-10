import type { APIRoute } from 'astro';
import { createAuthClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const headers = new Headers();
  const supabase = createAuthClient(request, headers);

  const form = await request.formData();
  const email    = (form.get('email')    as string)?.trim();
  const password = (form.get('password') as string);

  if (!email || !password) {
    headers.set('Location', '/login?error=E-posta ve şifre gerekli');
    return new Response(null, { status: 302, headers });
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    headers.set('Location', `/login?error=${encodeURIComponent(error.message)}`);
    return new Response(null, { status: 302, headers });
  }

  headers.set('Location', '/');
  return new Response(null, { status: 302, headers });
};
