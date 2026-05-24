import type { APIRoute } from 'astro';
import { supabase, createAuthClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const redirect = (loc: string) =>
    new Response(null, { status: 303, headers: { Location: loc } });

  const authHeaders = new Headers();
  const authClient = createAuthClient(request, authHeaders);
  const { data: { user: authUser } } = await authClient.auth.getUser();
  if (!authUser) return redirect('/login');

  const { data: me } = await supabase
    .from('users').select('id').eq('auth_id', authUser.id).single();
  if (!me) return redirect('/login');

  const form = await request.formData();
  const display_name = (form.get('display_name') as string | null)?.trim() ?? '';
  const bio          = (form.get('bio')          as string | null)?.trim() ?? '';

  if (!display_name || display_name.length > 50)
    return redirect('/profile?error=İsim+1-50+karakter+olmalı');
  if (bio.length > 160)
    return redirect('/profile?error=Bio+en+fazla+160+karakter');

  await supabase
    .from('users')
    .update({ display_name, bio })
    .eq('id', me.id);

  return redirect('/profile');
};
