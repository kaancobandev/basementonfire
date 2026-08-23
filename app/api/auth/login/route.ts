import { createAuthClientForResponse, db } from '@/lib/supabase/server';
import { recordLogin } from '@/lib/login-tracking';
import { authCodeFromError } from '@/lib/authMessages';
import { limit } from '@/lib/rateLimit';
import { NextResponse, type NextRequest } from 'next/server';

const hata = (req: NextRequest, kod: string) =>
  NextResponse.redirect(new URL(`/login?error=${kod}`, req.url), { status: 303 });

/**
 * Giriş — E-POSTA **veya** KULLANICI ADI ile.
 *
 * Supabase Auth yalnızca e-posta+şifre ile giriş yapar. Kullanıcı adı
 * desteklemek için adı burada, SUNUCUDA e-postaya çeviriyoruz.
 *
 * ⛔ ÇÖZÜLEN E-POSTA İSTEMCİYE ASLA DÖNMEZ. `users.email` herkese açık bir alan
 *    değil; sorgu service-role ile koşuyor (RLS baypas). Adres yalnızca
 *    signInWithPassword'e girer, yanıtta/URL'de/hata metninde yer almaz —
 *    yoksa "kullanıcı adı → e-posta" ücretsiz bir toplama aracına dönerdi.
 *
 * ⛔ KULLANICI ADI BULUNAMADI ile ŞİFRE YANLIŞ AYNI HATAYI döner (`hatali`).
 *    Ayrıştırsaydık saldırgan bir adın hesabı olup olmadığını tek istekte
 *    doğrulardı. (Kullanıcı adları zaten herkese açık, ama bu ayrım yine de
 *    "bu ada şifre denemeye değer mi" sinyalini bedava vermek olurdu.)
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();

  // ⚠ İKİ ALAN ADI DA KABUL EDİLİYOR. Yeni form `kimlik` gönderiyor, ama
  //   /login STATİK bir sayfa: deploy anında bir ziyaretçinin tarayıcısında
  //   ESKİ HTML (name="email") duruyor olabilir. Sadece `kimlik` okusaydık o
  //   ziyaretçi "eksik alan" hatası alırdı. `email` geri düşüşü o pencereyi
  //   kapatıyor; ileride kaldırılabilir ama acelesi yok.
  const kimlik   = ((form.get('kimlik') ?? form.get('email')) as string)?.trim();
  const password =   form.get('password') as string;

  if (!kimlik || !password) return hata(req, 'eksik');

  // Kaba kuvvet freni — bkz. lib/rateLimit.ts `login` kuralının gerekçesi.
  // IP başına sayar, FAIL-OPEN'dır (DB tökezlerse giriş çalışmaya devam eder).
  const fren = await limit('login', req.headers);
  if (!fren.ok) return hata(req, 'cok_deneme');

  // '@' içeriyorsa e-posta kabul et; içermiyorsa kullanıcı adı say.
  // Kullanıcı adları `^[a-z0-9_]{3,30}$` (api/auth/register) → '@' ASLA içermez,
  // yani bu ayrım belirsiz değil.
  let email = kimlik;

  if (!kimlik.includes('@')) {
    // ⚠ `toLowerCase()` — locale DUYARLI `toLocaleLowerCase('tr')` DEĞİL.
    //   Türkçe yerelde 'I' → 'ı' olur ve hiçbir kullanıcı adıyla eşleşmezdi;
    //   kullanıcı adları ASCII (`[a-z0-9_]`) olduğu için değişmez küçültme
    //   DOĞRU olan. (Genel kural için lib/turkce.ts, ama burada kasten o değil.)
    const uname = kimlik.toLowerCase();

    const { data, error: adHatasi } = await db
      .from('users')
      .select('email')
      // Silinmiş hesaplar `silinmis_<id>` adına ve @deleted.invalid adresine
      // anonimleştiriliyor (lib/accountDeletion.ts) — onları hiç aramayalım.
      .eq('username', uname)
      .eq('is_deleted', false)
      .maybeSingle();

    // Sorgu hatası ile "bulunamadı"yı ayırmıyoruz: ikisi de `hatali`. Kullanıcıya
    // "böyle bir kullanıcı yok" demek numaralandırma sinyali olurdu.
    if (adHatasi || !data?.email) return hata(req, 'hatali');
    email = data.email;
  }

  // Auth cookie'leri doğrudan bu redirect yanıtına yazılır (createAuthClientForResponse).
  const response = NextResponse.redirect(new URL('/', req.url), { status: 303 });
  const client = createAuthClientForResponse(req, response);

  const { data, error } = await client.auth.signInWithPassword({ email, password });

  // Supabase hatası HAM geçirilmez. İki sebep:
  //  · İngilizce ("Email not confirmed") — Türkçe sitede anlamsız
  //  · /login?error= içeriği sayfaya basıldığı için saldırgan istediği metni
  //    sitenin kendi hata kutusunda gösterebiliyordu (kimlik avı zemini)
  // Artık URL'de yalnızca KOD var; metin lib/authMessages.ts'ten geliyor.
  if (error) return hata(req, authCodeFromError(error.message));

  // Basarili girisi sunucu tarafinda kaydet (cerez onayindan bagimsiz sayim + ulke).
  // signIn sonucundan kullaniciyi aldik -> ekstra auth turu yok. En iyi caba, girisi bozmaz.
  if (data.user) await recordLogin(req, { authId: data.user.id, method: 'password' });

  return response;
}
