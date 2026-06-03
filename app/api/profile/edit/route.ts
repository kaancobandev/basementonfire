import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return NextResponse.redirect(new URL('/login', req.url), { status: 303 });

  const form = await req.formData();
  const display_name  = (form.get('display_name')  as string)?.trim() ?? '';
  const bio           = (form.get('bio')           as string)?.trim() ?? '';
  const location      = (form.get('location')      as string)?.trim() ?? '';
  const website       = (form.get('website')       as string)?.trim() ?? '';
  const gender        = (form.get('gender')        as string)?.trim() ?? '';
  const birthdateRaw  = (form.get('birthdate')     as string)?.trim() ?? '';
  const interestsRaw  = (form.get('interests')     as string)?.trim() ?? '';

  if (!display_name || display_name.length > 50)
    return NextResponse.redirect(new URL('/profile?error=İsim+1-50+karakter+olmalı', req.url), { status: 303 });
  if (bio.length > 160)
    return NextResponse.redirect(new URL('/profile?error=Bio+en+fazla+160+karakter', req.url), { status: 303 });

  const interests = interestsRaw
    ? interestsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0 && s.length <= 24).slice(0, 10)
    : [];

  let websiteNorm = website;
  if (websiteNorm && !websiteNorm.startsWith('http://') && !websiteNorm.startsWith('https://'))
    websiteNorm = 'https://' + websiteNorm;

  await db.from('users').update({
    display_name, bio,
    location: location || null,
    website: websiteNorm || null,
    gender,
    birthdate: birthdateRaw || null,
    interests,
  }).eq('id', me.id);

  return NextResponse.redirect(new URL('/profile', req.url), { status: 303 });
}
