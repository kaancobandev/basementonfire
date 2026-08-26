import { createAuthClient } from '@/lib/supabase/server';
import { authCodeFromError } from '@/lib/authMessages';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Üretimde NEXT_PUBLIC_SITE_URL kullan (örn. https://basementonfire.com).
  // Tanımlı değilse isteğin origin'ine düş (lokal geliştirme: http://localhost:3000).
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, '');
  const redir = (path: string) => NextResponse.redirect(new URL(path, siteUrl), { status: 302 });

  const form = await req.formData();
  const email = (form.get('email') as string)?.trim();
  /* 🚨 URL'E ARTIK YALNIZ KOD YAZILIYOR — 23.08.2026 denetimi.
     Eskiden buradan `?error=E-posta+gerekli` ve daha kötüsü
     `?error=${error.message}` (Supabase'in ham İngilizce metni) gidiyordu.
     Sayfa da onu olduğu gibi basıyordu → saldırgan kendi cümlesini sitenin
     hata kutusunda gösterebiliyordu. lib/authMessages.ts bu kararı /login için
     zaten almıştı; burası atlanmıştı. */
  if (!email) return redir('/forgot-password?error=eposta_gerekli');

  const client = await createAuthClient();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });

  // Ham `error.message` kullanıcıya GİTMEZ: hem dil (İngilizce) hem enjeksiyon
  // sebebiyle. Eşleşmeyen hata 'bilinmeyen' genel mesajına düşer.
  if (error) return redir(`/forgot-password?error=${authCodeFromError(error.message)}`);
  return redir('/forgot-password?sent=1');
}
