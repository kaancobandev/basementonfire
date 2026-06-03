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
        background: '#f0f2f5',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', marginBottom: '4px' }}>
            Basements
          </div>
          <div style={{ color: '#536471', fontSize: '0.9rem' }}>
            Şifre sıfırlama bağlantısı gönder
          </div>
        </div>

        {sent && (
          <div
            style={{
              background: '#dcfce7',
              color: '#166534',
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
            style={{
              background: '#fee2e2',
              color: '#dc2626',
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

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: '#536471' }}>
          <a href="/login" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
            ← Giriş sayfasına dön
          </a>
        </p>
      </div>
    </main>
  );
}
