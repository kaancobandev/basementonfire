import LoginForm from './LoginForm';
import AuthErrorNotice from '@/app/components/AuthErrorNotice';

// ESKİDEN dinamikti: getMe()+redirect ÖLÜ koddu (middleware.ts girişli
// kullanıcıyı /login'e ulaşmadan /feed'e yönlendiriyor) ve ?error= sunucuda
// okunuyordu. Hata kutusu istemciye taşındı (AuthErrorNotice) → sayfa statik;
// ilk ziyaretçinin ilk temas noktası deploy sonrası soğuk fonksiyon beklemez.
export default function LoginPage() {
  return (
    <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div style={{ background: 'var(--color-surface)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '4px' }}>Basements</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Hesabına giriş yap</div>
        </div>

        <AuthErrorNotice />

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
