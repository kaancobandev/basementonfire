import RegisterWizard from './RegisterWizard';

/**
 * /register — kullanıcının Claude Design tasarımı.
 *
 * ⛔ `AnimatedRays` (aurora/kuzey ışığı gradyanı) ve `.auth-card` (buzlu cam
 *    kart) BİLEREK KALDIRILDI (kullanıcı iki kez istedi, 22.08.2026). Tasarım
 *    tam ekran düz zemin üzerinde duruyor. Geri eklersen tasarım bozulur.
 *    /login hâlâ o kabuğu kullanıyor — bilinçli fark, kullanıcı yalnızca
 *    kayıt ekranını yeniden tasarladı.
 *
 * Sayfa statik prerender KALMALI: Google Ads dönüşümleri bu adresi hedefliyor.
 * getMe()+redirect middleware'de zaten var, `?error=` istemcide okunuyor
 * (AuthErrorNotice sihirbazın içinde) → burada sunucu verisi okunmuyor.
 */
export default function RegisterPage() {
  return (
    <main
      className="main-content"
      style={{
        // 100dvh: mobil tarayıcı çubuğu açılıp kapanırken 100vh zıplıyor.
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        padding: '32px 20px',
        boxSizing: 'border-box',
      }}
    >
      <RegisterWizard />
    </main>
  );
}
