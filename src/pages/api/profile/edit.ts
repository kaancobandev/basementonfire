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
  const location     = (form.get('location')     as string | null)?.trim() ?? '';
  const website      = (form.get('website')      as string | null)?.trim() ?? '';
  const gender       = (form.get('gender')       as string | null)?.trim() ?? '';
  const birthdateRaw = (form.get('birthdate')    as string | null)?.trim() ?? '';
  const interestsRaw = (form.get('interests')    as string | null)?.trim() ?? '';

  if (!display_name || display_name.length > 50)
    return redirect('/profile?error=İsim+1-50+karakter+olmalı');
  if (bio.length > 160)
    return redirect('/profile?error=Bio+en+fazla+160+karakter');
  if (location.length > 60)
    return redirect('/profile?error=Konum+en+fazla+60+karakter');
  if (website.length > 100)
    return redirect('/profile?error=Website+en+fazla+100+karakter');
  if (!['', 'erkek', 'kadin', 'diger'].includes(gender))
    return redirect('/profile?error=Geçersiz+cinsiyet');

  const interests = interestsRaw
    ? interestsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0 && s.length <= 24).slice(0, 10)
    : [];

  const birthdate = birthdateRaw || null;

  let websiteNorm = website;
  if (websiteNorm && !websiteNorm.startsWith('http://') && !websiteNorm.startsWith('https://')) {
    websiteNorm = 'https://' + websiteNorm;
  }

  await supabase.from('users').update({
    display_name,
    bio,
    location: location || null,
    website: websiteNorm || null,
    gender,
    birthdate,
    interests,
  }).eq('id', me.id);

  return redirect('/profile');
};
