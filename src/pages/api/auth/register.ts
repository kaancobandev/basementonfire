import type { APIRoute } from 'astro';
import { createAuthClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const headers = new Headers();
  const supabase = createAuthClient(request, headers);

  const form = await request.formData();
  const email    = (form.get('email')    as string)?.trim();
  const password = (form.get('password') as string);
  const username = (form.get('username') as string)?.trim();

  if (!email || !password || !username) {
    headers.set('Location', '/register?error=Tüm alanları doldurun');
    return new Response(null, { status: 302, headers });
  }

  if (password.length < 6) {
    headers.set('Location', '/register?error=Şifre en az 6 karakter olmalı');
    return new Response(null, { status: 302, headers });
  }

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    headers.set('Location', `/register?error=${encodeURIComponent(error.message)}`);
    return new Response(null, { status: 302, headers });
  }

  headers.set('Location', '/');
  return new Response(null, { status: 302, headers });
};
