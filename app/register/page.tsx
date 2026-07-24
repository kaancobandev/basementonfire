import RegisterForm from './RegisterForm';
import AuthErrorNotice from '@/app/components/AuthErrorNotice';
import AnimatedRays from '@/app/components/AnimatedRays';

// ESKİDEN dinamikti — /login ile aynı dönüşüm: getMe()+redirect middleware'de
// zaten var (ölü kod), ?error= istemcide okunur → sayfa statik.
export default function RegisterPage() {
  return (
    <main className="main-content" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg)', overflow: 'hidden' }}>
      <AnimatedRays className="!absolute inset-0" />
      <div style={{ position: 'relative', zIndex: 1, background: 'var(--color-surface)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '4px' }}>Basementonfire</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Hesap oluştur</div>
        </div>

        <AuthErrorNotice />

        <RegisterForm />

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
          Zaten hesabın var mı?{' '}
          <a href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Giriş yap</a>
        </p>
      </div>
    </main>
  );
}
