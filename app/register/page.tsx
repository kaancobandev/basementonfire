import { redirect } from 'next/navigation';
import { getMe } from '@/lib/supabase/server';
import RegisterForm from './RegisterForm';
import { authMessage } from '@/lib/authMessages';

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { me } = await getMe();
  if (me) redirect('/');

  const { error } = await searchParams;
  // Kod → Türkçe metin (bkz. lib/authMessages.ts: dil + içerik enjeksiyonu).
  const message = authMessage(error);

  return (
    <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div style={{ background: 'var(--color-surface)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '4px' }}>Basements</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Hesap oluştur</div>
        </div>

        {message && (
          <div role="alert" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px' }}>
            {message}
          </div>
        )}

        <RegisterForm />

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
          Zaten hesabın var mı?{' '}
          <a href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Giriş yap</a>
        </p>
      </div>
    </main>
  );
}
