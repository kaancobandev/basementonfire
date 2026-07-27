import LoginForm from './LoginForm';
import AuthErrorNotice from '@/app/components/AuthErrorNotice';
import AnimatedRays from '@/app/components/AnimatedRays';
import Logo from '@/app/components/Logo';

// ESKİDEN dinamikti: getMe()+redirect ÖLÜ koddu (middleware.ts girişli
// kullanıcıyı /login'e ulaşmadan /feed'e yönlendiriyor) ve ?error= sunucuda
// okunuyordu. Hata kutusu istemciye taşındı (AuthErrorNotice) → sayfa statik;
// ilk ziyaretçinin ilk temas noktası deploy sonrası soğuk fonksiyon beklemez.
export default function LoginPage() {
  return (
    <main className="main-content" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg)', overflow: 'hidden' }}>
      {/* themeAware={false}: arka plan ışınları tema seçiminden BAĞIMSIZ (invert
          yok → renkler doğru, açık/koyu temada aynı). Kart yine tema duyarlı. */}
      <AnimatedRays themeAware={false} className="!absolute inset-0" />
      {/* Buzlu cam kart (.auth-card) — renkler orada token ezilerek çevriliyor,
          floating-label animasyonuna dokunulmuyor. */}
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="auth-brand">
            <Logo size={48} className="auth-logo" />
            <span className="auth-brand-name">Basementonfire</span>
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>Hesabına giriş yap</div>
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
