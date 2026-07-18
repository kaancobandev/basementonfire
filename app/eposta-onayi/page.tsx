import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getMe } from '@/lib/supabase/server';
import { PENDING_EMAIL_COOKIE, maskEmail } from '@/lib/pendingEmail';

export const metadata: Metadata = {
  title: 'E-postanı onayla',
  robots: { index: false, follow: false }, // kişisel akış — dizine girmemeli
};

/**
 * Kayıt sonrası "e-postanı onayla" ekranı.
 *
 * NEDEN VAR: kayıt route'u eskiden oturum oluşup oluşmadığına BAKMADAN
 * `/?welcome=1`e yönlendiriyordu. E-posta onayı açıkken signUp oturum
 * DÖNDÜRMEZ → kullanıcı ana sayfada çıkış yapmış hâlde kalıyor, e-postadan
 * hiç söz edilmiyordu. Sonra "Giriş yap"a gidip deniyor, başarısız oluyor ve
 * onay gerektiğini ancak orada (üstelik İngilizce hata metninden) öğreniyordu.
 * Bu ekran o boşluğu kapatır.
 */
export default async function EpostaOnayiPage({
  searchParams,
}: {
  searchParams: Promise<{ gonderildi?: string; hata?: string }>;
}) {
  // Onaylayıp giriş yaptıysa burada işi yok.
  const { me } = await getMe();
  if (me) redirect('/feed');

  const jar = await cookies();
  const email = jar.get(PENDING_EMAIL_COOKIE)?.value ?? '';
  const { gonderildi, hata } = await searchParams;

  return (
    <main
      className="main-content"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}
    >
      <div style={{ background: 'var(--color-surface)', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '460px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '2.4rem', lineHeight: 1, marginBottom: '12px' }}>📬</div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--color-text)' }}>
            Son bir adım kaldı
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {email ? (
              <>
                <strong style={{ color: 'var(--color-text)' }}>{maskEmail(email)}</strong> adresine bir onay
                bağlantısı gönderdik. Bağlantıya tıkladıktan sonra giriş yapabilirsin.
              </>
            ) : (
              <>Kayıt olurken verdiğin adrese bir onay bağlantısı gönderdik. Bağlantıya tıkladıktan sonra giriş yapabilirsin.</>
            )}
          </p>
        </div>

        {gonderildi && (
          <div role="status" style={{ background: 'var(--color-success-soft, rgba(34,197,94,0.12))', color: 'var(--color-success, #16a34a)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>
            Onay e-postası yeniden gönderildi.
          </div>
        )}
        {hata && (
          <div role="alert" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>
            Adresini bulamadık. Lütfen giriş yapmayı dene.
          </div>
        )}

        <div style={{ background: 'var(--color-bg)', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--color-text)' }}>E-posta gelmediyse:</strong>
            <br />• Spam / Gereksiz klasörüne bak
            <br />• Adresi doğru yazdığından emin ol
            <br />• Birkaç dakika bekle, sonra yeniden gönder
          </p>
        </div>

        {email && (
          <form action="/api/auth/resend" method="post" style={{ margin: '0 0 12px' }}>
            <button
              type="submit"
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              Onay e-postasını yeniden gönder
            </button>
          </form>
        )}

        <a
          href="/login"
          style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--color-primary)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}
        >
          Onayladım, giriş yap
        </a>
      </div>
    </main>
  );
}
