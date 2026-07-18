import { createAuthClientForResponse } from '@/lib/supabase/server';
import { PENDING_EMAIL_COOKIE } from '@/lib/pendingEmail';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Onay e-postasını yeniden gönderir.
 *
 * E-posta İSTEMCİDEN ALINMAZ — kayıt sırasında yazılan httpOnly çerezden
 * okunur. Aksi hâlde bu uç, herhangi birinin adresine tekrar tekrar mail
 * yollatmak için kullanılabilirdi (taciz + gönderim kotası yakma).
 * Çerez yoksa hiçbir şey yapmayız.
 */
export async function POST(req: NextRequest) {
  const email = req.cookies.get(PENDING_EMAIL_COOKIE)?.value;

  const response = NextResponse.redirect(
    new URL(`/eposta-onayi?${email ? 'gonderildi=1' : 'hata=1'}`, req.url),
    { status: 303 },
  );

  if (!email) return response;

  const client = createAuthClientForResponse(req, response);
  // Supabase'in kendi hız sınırı devrede (aynı adrese sık gönderimi engeller).
  // Hata olsa bile kullanıcıya aynı ekranı gösteriyoruz: bu uç, bir adresin
  // kayıtlı olup olmadığını ele vermemeli.
  await client.auth.resend({ type: 'signup', email });

  return response;
}
