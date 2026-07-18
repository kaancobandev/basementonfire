import { createAuthClientForResponse, db, logIfError } from '@/lib/supabase/server';
import { recordLogin } from '@/lib/login-tracking';
import { MIN_AGE, ageFromBirthdate } from '@/lib/age';
import { authCodeFromError } from '@/lib/authMessages';
import { PENDING_EMAIL_COOKIE, PENDING_EMAIL_COOKIE_OPTIONS } from '@/lib/pendingEmail';
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
    return fail(req, 'eksik_alan');
  if (password.length < 6)
    return fail(req, 'zayif_sifre');

  // KULLANICI ADI — kayıtta hiç doğrulanmıyordu; kural yalnızca profil
  // düzenlemede (api/profile/edit) vardı. Boşluk/'/'/'%' içeren adlar
  // /u/[username] ve dm/start eşleşmesini bozuyordu.
  //
  // DÜZELTME (2026-07-18): buraya önce "büyük harfli varyantla admin taklidi"
  // gerekçesini yazmıştım — YANLIŞTI. Canlı şema dökümünde `users` tablosunda
  // `users_username_lower_idx UNIQUE (lower(username))` olduğu görüldü, yani
  // 'kaan' varken 'Kaan' zaten alınamıyor. Doğrulama yerinde kalıyor ama
  // gerekçesi bu değil.
  //
  // ASIL SORUN BAŞKA YERDE: `auth.users` üzerindeki `handle_new_user` trigger'ı
  // buradan gönderilen username'i HİÇ OKUMUYOR, e-posta önekini yazıyor →
  // aşağıdaki doğrulama geçerli ama seçilen ad kullanılmıyor.
  // Düzeltmesi: sql/fix-handle-new-user.sql (çalıştırılması gerekiyor).
  const uname = username.toLowerCase();
  if (!/^[a-z0-9_]{3,30}$/.test(uname))
    return fail(req, 'ad_format');

  const { data: taken } = await db.from('users').select('id').eq('username', uname).maybeSingle();
  if (taken)
    return fail(req, 'ad_alinmis');

  // Koşul/gizlilik onayı — istemcideki `required` atlanabilir, ASIL kontrol burada.
  if (!terms)
    return fail(req, 'kosullar');

  // YAŞ KAPISI — istemciye güvenilmez, sunucuda yeniden hesaplanır.
  const age = ageFromBirthdate(birthdate);
  if (age === null)
    return fail(req, 'gecersiz_dogum');
  if (age < MIN_AGE)
    return fail(req, 'yas_kucuk');

  // Kayıt sonrası oturum cookie'leri (e-posta onayı kapalıysa) doğrudan bu yanıta yazılır.
  // Hedef aşağıda DÜZELTİLİR: oturum oluşmadıysa onay ekranına gideceğiz.
  const response = NextResponse.redirect(new URL('/?welcome=1', req.url), { status: 303 });
  const client = createAuthClientForResponse(req, response);

  // birthdate'i auth metadata'ya DA yaz: public.users satırı trigger ile oluşuyor;
  // aşağıdaki update'i (yarış nedeniyle) yakalayamazsak bile yaş beyanı auth tarafında kalır.
  // emailRedirectTo → onay bağlantısı /auth/confirm'e insin (sunucu tarafı
  // doğrulama). Varsayılanda token'lar URL fragment'ında geliyor, fragment
  // sunucuya ulaşmadığı için oturum HİÇ kurulmuyordu. Bkz. app/auth/confirm.
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, '');

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: { username: uname, birthdate },
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  });

  // Supabase hatası HAM geçirilmez: İngilizce olurdu ve /register?error= içeriği
  // sayfaya basıldığı için saldırgana serbest metin yazdırma zemini verirdi.
  if (error)
    return fail(req, authCodeFromError(error.message));

  // DİKKAT — bu blok oturum kontrolünden ÖNCE gelmeli. public.users satırı
  // signUp anında trigger ile oluşuyor (oturum olsun olmasın). Yaş beyanı ve
  // koşul onayı KVKK ispat kaydıdır; e-posta onayı açıkken de yazılmalı.
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

  // E-POSTA ONAYI AÇIKSA `signUp` OTURUM DÖNDÜRMEZ.
  // Eskiden bu ayrım hiç yapılmıyordu: kullanıcı her hâlükârda `/?welcome=1`e
  // atılıyor, orada çıkış yapmış hâlde kalıyor ve e-postasını onaylaması
  // gerektiğini HİÇBİR YERDE görmüyordu. Sonra "Giriş yap"a gidip deniyor,
  // başarısız oluyor ve durumu ancak oradaki (İngilizce) hatadan anlıyordu.
  if (!data.session) {
    const onay = NextResponse.redirect(new URL('/eposta-onayi', req.url), { status: 303 });
    // Adresi onay ekranında göstermek ve "yeniden gönder" için sakla.
    // URL'e KOYMUYORUZ: kişisel veri; geçmişe, sunucu loglarına ve Referer
    // başlığına sızardı. httpOnly → istemci JS'i de okuyamaz.
    onay.cookies.set(PENDING_EMAIL_COOKIE, email, PENDING_EMAIL_COOKIE_OPTIONS);
    return onay;
  }

  return response;
}
