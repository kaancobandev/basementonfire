import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const DAY = 24 * 60 * 60 * 1000;
const USERNAME_DAYS = 30;

function fail(req: Request, msg: string) {
  return NextResponse.redirect(new URL(`/profile?error=${encodeURIComponent(msg)}`, req.url), { status: 303 });
}

export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return NextResponse.redirect(new URL('/login', req.url), { status: 303 });

  const form = await req.formData();
  const display_name = (form.get('display_name') as string)?.trim() ?? '';
  const username     = (form.get('username') as string)?.trim().toLowerCase() ?? '';
  const bio          = (form.get('bio') as string)?.trim() ?? '';
  const location     = (form.get('location') as string)?.trim() ?? '';
  const website      = (form.get('website') as string)?.trim() ?? '';
  const gender       = (form.get('gender') as string)?.trim() ?? '';
  const birthdateRaw = (form.get('birthdate') as string)?.trim() ?? '';
  const interestsRaw = (form.get('interests') as string)?.trim() ?? '';

  if (!display_name || display_name.length > 50) return fail(req, 'İsim 1-50 karakter olmalı');
  if (bio.length > 160) return fail(req, 'Bio en fazla 160 karakter');

  // Mevcut değerler + değişim zamanları. Sütunlar henüz eklenmemişse (SQL çalıştırılmadıysa)
  // limitsiz çalış ki mevcut profil düzenleme bozulmasın.
  let cur: { display_name: string; username: string; name_changed_at?: string | null; username_changed_at?: string | null } | null = null;
  let hasLimitCols = true;
  const full = await db.from('users').select('display_name, username, name_changed_at, username_changed_at').eq('id', me.id).single();
  if (full.error) {
    hasLimitCols = false;
    const basic = await db.from('users').select('display_name, username').eq('id', me.id).single();
    cur = basic.data;
  } else {
    cur = full.data;
  }
  if (!cur) return fail(req, 'Kullanıcı bulunamadı');

  const now = new Date().toISOString();
  const update: Record<string, unknown> = {};

  // --- Ad (display_name): günde 1 kez ---
  if (display_name !== cur.display_name) {
    if (hasLimitCols && cur.name_changed_at) {
      const elapsed = Date.now() - new Date(cur.name_changed_at).getTime();
      if (elapsed < DAY) {
        const hrs = Math.max(1, Math.ceil((DAY - elapsed) / (60 * 60 * 1000)));
        return fail(req, `Adını günde bir kez değiştirebilirsin. ${hrs} saat sonra tekrar deneyebilirsin.`);
      }
    }
    update.display_name = display_name;
    if (hasLimitCols) update.name_changed_at = now;
  }

  // --- Kullanıcı adı (username): 30 günde 1 + format + benzersizlik ---
  if (username !== cur.username) {
    if (!/^[a-z0-9_]{3,30}$/.test(username))
      return fail(req, 'Kullanıcı adı 3-30 karakter olmalı; sadece küçük harf, rakam ve alt çizgi (_) içerebilir.');
    if (hasLimitCols && cur.username_changed_at) {
      const elapsed = Date.now() - new Date(cur.username_changed_at).getTime();
      if (elapsed < USERNAME_DAYS * DAY) {
        const days = Math.max(1, Math.ceil((USERNAME_DAYS * DAY - elapsed) / DAY));
        return fail(req, `Kullanıcı adını ${USERNAME_DAYS} günde bir değiştirebilirsin. ${days} gün sonra tekrar deneyebilirsin.`);
      }
    }
    // Başkası bu kullanıcı adını almış mı?
    const { data: taken } = await db.from('users').select('id').eq('username', username).neq('id', me.id).maybeSingle();
    if (taken) return fail(req, 'Bu kullanıcı adı zaten alınmış. Başka birini dene.');
    update.username = username;
    if (hasLimitCols) update.username_changed_at = now;
  }

  // --- Serbestçe değiştirilebilen alanlar ---
  const interests = interestsRaw
    ? interestsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0 && s.length <= 24).slice(0, 10)
    : [];
  let websiteNorm = website;
  if (websiteNorm && !websiteNorm.startsWith('http://') && !websiteNorm.startsWith('https://'))
    websiteNorm = 'https://' + websiteNorm;

  update.bio = bio;
  update.location = location || null;
  update.website = websiteNorm || null;
  update.gender = gender;
  update.birthdate = birthdateRaw || null;
  update.interests = interests;

  const { error } = await db.from('users').update(update).eq('id', me.id);
  if (error) return fail(req, 'Kaydedilemedi');

  return NextResponse.redirect(new URL('/profile', req.url), { status: 303 });
}
