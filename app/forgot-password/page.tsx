import { redirect } from 'next/navigation';
import { getMe } from '@/lib/supabase/server';
import ForgotPasswordForm from './ForgotPasswordForm';

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { me } = await getMe();
  if (me) redirect('/');

  const { sent, error } = await searchParams;

  return (
    <main
      className="main-content"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-bg)',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: '20px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '4px' }}>
            Basements
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Şifre sıfırlama bağlantısı gönder
          </div>
        </div>

        {sent && (
          <div
            role="status"
            style={{
              background: 'var(--color-success-soft)',
              color: 'var(--color-success)',
              padding: '12px 14px',
              borderRadius: '10px',
              fontSize: '0.88rem',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            ✓ E-posta gönderildi! Gelen kutunu kontrol et.
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              background: 'var(--color-danger-soft)',
              color: 'var(--color-danger)',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            {decodeURIComponent(error)}
          </div>
        )}

        {!sent && <ForgotPasswordForm />}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
          <a href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            ← Giriş sayfasına dön
          </a>
        </p>
      </div>
    </main>
  );
}
