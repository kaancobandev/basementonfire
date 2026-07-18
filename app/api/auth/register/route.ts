import { createAuthClientForResponse, db, logIfError } from '@/lib/supabase/server';
import { recordLogin } from '@/lib/login-tracking';
import { MIN_AGE, ageFromBirthdate } from '@/lib/age';
import { NextResponse, type NextRequest } from 'next/server';

const fail = (req: NextRequest, msg: string) =>
  NextResponse.redirect(new URL(`/register?error=${encodeURIComponent(msg)}`, req.url), { status: 303 });

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email     = (form.get('email')     as string)?.trim();
  const password  =  form.get('password')  as string;
  const username  = (form.get('username')  as string)?.trim();
  const birthdate = (form.get('birthdate') as string)?.trim();
  const terms     =  form.get('terms');

  if (!email || !password || !username || !birthdate)
    return fail(req, 'Tüm alanları doldurun');
  if (password.length < 6)
    return fail(req, 'Şifre en az 6 karakter olmalı');

  // KULLANICI ADI — kayıtta hiç doğrulanmıyordu; kural yalnızca profil
  // düzenlemede (api/profile/edit) vardı. İki sonucu vardı:
  //  · Postgres'te metin benzersizliği BÜYÜK/KÜÇÜK HARFE DUYARLI, ama isAdmin()
  //    karşılaştırmayı küçük harfe indiriyor → admin 'kaan' iken 'Kaan' adıyla
  //    kayıt olan biri benzersizlik kısıtını geçip isAdmin() true alabiliyordu.
  //  · Boşluk/'/'/'%' içeren adlar /u/[username] ve dm/start eşleşmesini bozuyordu.
  const uname = username.toLowerCase();
  if (!/^[a-z0-9_]{3,30}$/.test(uname))
    return fail(req, 'Kullanıcı adı 3-30 karakter olmalı; sadece küçük harf, rakam ve alt çizgi (_) içerebilir.');

  const { data: taken } = await db.from('users').select('id').eq('username', uname).maybeSingle();
  if (taken)
    return fail(req, 'Bu kullanıcı adı zaten alınmış. Başka birini dene.');

  // Koşul/gizlilik onayı — istemcideki `required` atlanabilir, ASIL kontrol burada.
  if (!terms)
    return fail(req, 'Devam etmek için Kullanım Koşulları ve Gizlilik Politikasını kabul etmelisin');

  // YAŞ KAPISI — istemciye güvenilmez, sunucuda yeniden hesaplanır.
  const age = ageFromBirthdate(birthdate);
  if (age === null)
    return fail(req, 'Geçerli bir doğum tarihi gir');
  if (age < MIN_AGE)
    return fail(req, `Kayıt için en az ${MIN_AGE} yaşında olmalısın`);

  // Kayıt sonrası oturum cookie'leri (e-posta onayı kapalıysa) doğrudan bu yanıta yazılır.
  const response = NextResponse.redirect(new URL('/?welcome=1', req.url), { status: 303 });
  const client = createAuthClientForResponse(req, response);

  // birthdate'i auth metadata'ya DA yaz: public.users satırı trigger ile oluşuyor;
  // aşağıdaki update'i (yarış nedeniyle) yakalayamazsak bile yaş beyanı auth tarafında kalır.
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { username: uname, birthdate } },
  });

  if (error)
    return fail(req, error.message);

  if (data.user) {
    // Yaş + onay kaydını users satırına yaz (kanıt/ispat). Hata olursa kaydı BOZMA, sadece logla.
    const { error: upErr } = await db
      .from('users')
      .update({ birthdate, terms_accepted_at: new Date().toISOString() })
      .eq('auth_id', data.user.id);

    if (upErr) {
      // sql/features-age-gate.sql henüz çalıştırılmadıysa terms_accepted_at kolonu yoktur ve
      // update KOMPLE düşer → birthdate de yazılmaz. O yüzden en azından birthdate'i tek başına yaz.
      logIfError('register: birthdate+terms update', upErr);
      const { error: bdErr } = await db
        .from('users')
        .update({ birthdate })
        .eq('auth_id', data.user.id);
      logIfError('register: birthdate-only fallback', bdErr);
    }

    // Ilk kayit girisini de kaydet (method='register').
    await recordLogin(req, { authId: data.user.id, method: 'register' });
  }

  return response;
}
