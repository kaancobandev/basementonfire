'use client';

import FloatingInput from '@/app/components/FloatingInput';

export default function LoginForm() {
  return (
    <form method="POST" action="/api/auth/login" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ⚠ type="text", `email` DEĞİL. Alan artık hem e-posta hem kullanıcı adı
          kabul ediyor; `type="email"` bırakılsaydı tarayıcının kendi doğrulaması
          "kaancoban" gibi geçerli bir kullanıcı adını REDDEDER ve form sunucuya
          hiç ulaşmazdı.

          ⚠ name="kimlik" — sunucu ESKİ `email` adını da kabul ediyor
          (api/auth/login), çünkü /login statik bir sayfa: deploy anında bir
          ziyaretçinin tarayıcısında eski HTML duruyor olabilir.

          autoComplete="username": şifre yöneticilerinin birleşik
          e-posta/kullanıcı adı alanı için beklediği değer budur. */}
      <FloatingInput
        id="login-kimlik" type="text" name="kimlik" label="E-posta veya kullanıcı adı"
        required autoComplete="username" autoCapitalize="none" spellCheck={false}
      />
      <FloatingInput id="login-password" type="password" name="password" label="Şifre" required autoComplete="current-password" />

      {/* .auth-submit: kart içinde --color-primary açık lavantaya ezildiği için
          buton kendi (koyu, beyaz metinle AA geçen) gradyanını taşır. */}
      <button type="submit" className="auth-submit">Giriş Yap</button>
    </form>
  );
}
