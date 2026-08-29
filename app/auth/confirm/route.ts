import { createAuthClientForResponse, db } from '@/lib/supabase/server';
import { PENDING_EMAIL_COOKIE } from '@/lib/pendingEmail';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * E-POSTA ONAY BAĞLANTISININ İNDİĞİ YER (sunucu tarafı doğrulama).
 *
 * NEDEN VAR: Supabase'in varsayılan onay bağlantısı "implicit flow" kullanıyor
 * ve token'ları URL FRAGMENT'ında getiriyordu:
 *     https://basementonfire.com/#access_token=...&refresh_token=...&type=signup
 *
 * İki sorun birden:
 *  1. Fragment SUNUCUYA HİÇ GİTMEZ. Bizim oturumumuz çerez tabanlı
 *     (@supabase/ssr), o hash'i okuyan kod da yok → kullanıcı e-postasını
 *     onaylıyor ama YİNE giriş yapmamış oluyor. Kayıt akışındaki asıl şikâyet
 *     bu adımda tekrarlanıyordu.
 *  2. Erişim + yenileme token'ı URL'de duruyor: tarayıcı geçmişine yazılıyor,
 *     paylaşılan/kopyalanan bağlantıyla sızıyor. (Nitekim sızdı.)
 *
 * ÇÖZÜM: token_hash'i sunucuda `verifyOtp` ile doğrulamak. Oturum doğrudan
 * httpOnly çereze yazılır, URL'de hiçbir sır taşınmaz.
 *
 * GEREKLİ AYAR — Supabase → Authentication → Email Templates → "Confirm signup"
 * içindeki bağlantı ŞU olmalı (varsayılan {{ .ConfirmationURL }} DEĞİL):
 *     {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') ?? 'signup';

  // Başarıda: doğrudan akışa, GİRİŞ YAPMIŞ olarak.
  // `welcome=1` → CelebrateOnParam konfetiyi burada patlatır. O kutlama kayıt
  // anı için yazılmıştı ama e-posta onayı açıkken kullanıcı o an giriş yapmamış
  // oluyordu; hesabın gerçekten aktifleştiği an burası.
  // `/feed?welcome=1` → `/?welcome=1` (2026-08-14, tek ana sayfa). Eski hâli
  // çalışmaya devam ederdi (middleware 301'liyor) ama onay akışına gereksiz bir
  // tur eklerdi ve 301 sorgu dizesini taşısa da zincirin ucunda konfeti
  // parametresini kaybetme riski vardı.
  const ok = NextResponse.redirect(new URL('/?welcome=1', req.url), { status: 303 });

  if (!tokenHash) {
    return NextResponse.redirect(new URL('/login?error=onay_gecersiz', req.url), { status: 303 });
  }

  const client = createAuthClientForResponse(req, ok);
  const { error } = await client.auth.verifyOtp({
    type: type as 'signup' | 'email' | 'recovery' | 'email_change',
    token_hash: tokenHash,
  });

  if (error) {
    // Süresi dolmuş / kullanılmış bağlantı en sık senaryo. Kullanıcıyı boş bir
    // hata ekranında bırakma: onay ekranına gönder, oradan yeniden gönderebilir.
    return NextResponse.redirect(new URL('/eposta-onayi?suresi_doldu=1', req.url), { status: 303 });
  }

  /* Kayıtta yazılan ad ile GERÇEKTEN açılan ad farklıysa kullanıcıya söyle.
     Ad onaya kadar rezerve edilmiyor (profil satırı ancak burada doğuyor), o
     yüzden arada başkası aynı adı almış olabilir; tetikleyici kaydı düşürmüyor
     ama sessizce `ad2` yapıyordu. Bayrağı istemci okuyup bildirim gösteriyor.

     ⛔ URL'E AD YAZILMIYOR, yalnız bayrak. Serbest metni sorgu dizesine koymak
        bu oturumda kapatılan kimlik avı yüzeyinin ta kendisiydi; gerçek adı
        istemci kendi oturumundan (nav-state) okuyor.
     🚨 YENİ RESPONSE ÜRETİLMİYOR, sadece `location` başlığı değiştiriliyor:
        oturum çerezleri `ok`a yazıldı, yeni bir yanıt kurmak onları düşürür ve
        kullanıcı onaylamış ama giriş yapmamış olurdu (bu tuzağa daha önce
        düşüldü — bkz. auth-redirect-cookie-gotcha).
     Tümü try/catch: bu bir KONFOR bildirimi, onay akışını asla düşürmemeli. */
  try {
    const { data: { user } } = await client.auth.getUser();
    const istenen = String((user?.user_metadata as Record<string, unknown> | undefined)?.username ?? '')
      .trim().toLowerCase();
    if (user && istenen) {
      const { data: profil } = await db
        .from('users').select('username').eq('auth_id', user.id).maybeSingle();
      const gercek = String(profil?.username ?? '').toLowerCase();
      // `gercek` boşsa tetikleyici henüz koşmamış olabilir → sessiz kal.
      if (gercek && gercek !== istenen) {
        ok.headers.set('location', new URL('/?welcome=1&ad_degisti=1', req.url).toString());
      }
    }
  } catch { /* bildirim kaybolur, onay çalışmaya devam eder */ }

  // Onay tamam → bekleyen e-posta çerezine artık gerek yok.
  ok.cookies.set(PENDING_EMAIL_COOKIE, '', { path: '/', maxAge: 0 });
  return ok;
}
