import { redirect } from 'next/navigation';
import { getMe } from '@/lib/supabase/server';
import RegisterForm from './RegisterForm';

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { me } = await getMe();
  if (me) redirect('/');

  const { error } = await searchParams;

  return (
    <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '4px' }}>Basements</div>
          <div style={{ color: '#536471', fontSize: '0.9rem' }}>Hesap oluştur</div>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <RegisterForm />

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: '#536471' }}>
          Zaten hesabın var mı?{' '}
          <a href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Giriş yap</a>
        </p>
      </div>
    </main>
  );
}
