'use client';

import FloatingInput from '@/app/components/FloatingInput';

export default function LoginForm() {
  return (
    <form method="POST" action="/api/auth/login" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <FloatingInput id="login-email" type="email" name="email" label="E-posta" required autoComplete="email" />
      <FloatingInput id="login-password" type="password" name="password" label="Şifre" required autoComplete="current-password" />

      {/* .auth-submit: kart içinde --color-primary açık lavantaya ezildiği için
          buton kendi (koyu, beyaz metinle AA geçen) gradyanını taşır. */}
      <button type="submit" className="auth-submit">Giriş Yap</button>
    </form>
  );
}
