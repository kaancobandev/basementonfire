import { createAuthClientForResponse } from '@/lib/supabase/server';
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
  const ok = NextResponse.redirect(new URL('/feed?welcome=1', req.url), { status: 303 });

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

  // Onay tamam → bekleyen e-posta çerezine artık gerek yok.
  ok.cookies.set(PENDING_EMAIL_COOKIE, '', { path: '/', maxAge: 0 });
  return ok;
}
