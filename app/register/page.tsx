import RegisterWizard from './RegisterWizard';
import AuthErrorNotice from '@/app/components/AuthErrorNotice';
import AnimatedRays from '@/app/components/AnimatedRays';
import Logo from '@/app/components/Logo';

// ESKİDEN dinamikti — /login ile aynı dönüşüm: getMe()+redirect middleware'de
// zaten var (ölü kod), ?error= istemcide okunur → sayfa statik.
export default function RegisterPage() {
  return (
    // Dikey ortalama YOK — gerekcesi app/login/page.tsx'te (klavye acilinca
    // kart oynuyor, dokunus dusuyor). Kart .auth-sayfa ile margin:auto ortalanir.
    <main className="main-content auth-sayfa" style={{ position: 'relative', display: 'flex', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* themeAware={false}: login ile AYNI — koyu zemin, invert yok (renkler
          bozulmaz), difference yok, SSR'da render. Kart yine tema duyarlı. */}
      <AnimatedRays themeAware={false} className="!absolute inset-0" />
      {/* Buzlu cam kart — /login ile AYNI (.auth-card). */}
      <div className="auth-card">
        {/* Sihirbaz kendi başlığını taşıyor (her adımın kendi başlığı var), o
            yüzden buradaki "Hesap oluştur" alt yazısı kaldırıldı — iki başlık
            üst üste gelmesin. Marka bloğu kalıyor. */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="auth-brand">
            <Logo size={48} className="auth-logo" />
            <span className="auth-brand-name">Basementonfire</span>
          </div>
        </div>

        <AuthErrorNotice />

        <RegisterWizard />

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
          Zaten hesabın var mı?{' '}
          <a href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Giriş yap</a>
        </p>
      </div>
    </main>
  );
}
