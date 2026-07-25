'use client';

import FloatingInput from '@/app/components/FloatingInput';

export default function LoginForm() {
  return (
    <form method="POST" action="/api/auth/login" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <FloatingInput id="login-email" type="email" name="email" label="E-posta" required autoComplete="email" />
      <FloatingInput id="login-password" type="password" name="password" label="Şifre" required autoComplete="current-password" />

      <button
        type="submit"
        style={{ background: 'var(--color-primary)', color: 'white', fontWeight: 700, fontSize: '1rem', padding: '12px', border: 'none', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.15s', marginTop: '4px' }}
        onMouseOver={e => ((e.target as HTMLButtonElement).style.background = 'var(--color-primary-hover)')}
        onMouseOut={e => ((e.target as HTMLButtonElement).style.background = 'var(--color-primary)')}
      >
        Giriş Yap
      </button>
    </form>
  );
}
