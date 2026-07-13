import { redirect } from 'next/navigation';
import { getMe } from '@/lib/supabase/server';
import LoginForm from './LoginForm';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { me } = await getMe();
  if (me) redirect('/');

  const { error } = await searchParams;

  return (
    <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div style={{ background: 'var(--color-surface)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '4px' }}>Basements</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Hesabına giriş yap</div>
        </div>

        {error && (
          <div role="alert" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <LoginForm />

        <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.85rem' }}>
          <a href="/forgot-password" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Şifreni mi unuttun?</a>
        </p>
        <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
          Hesabın yok mu?{' '}
          <a href="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Kayıt ol</a>
        </p>
      </div>
    </main>
  );
}
