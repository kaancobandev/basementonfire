import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getMe } from '@/lib/supabase/server';
import { GRACE_DAYS } from '@/lib/accountDeletion';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Hesabını geri al',
  robots: { index: false, follow: false },
};

export default async function HesapGeriAlPage({
  searchParams,
}: { searchParams: Promise<{ error?: string }> }) {
  const { me } = await getMe();
  if (!me) redirect('/login');

  // Silme talebi yoksa burada işi yok.
  if (!me.deletion_requested_at) redirect('/');

  const { error } = await searchParams;

  const istenen = new Date(me.deletion_requested_at as string);
  const silinecek = new Date(istenen.getTime() + GRACE_DAYS * 86400_000);
  const kalanGun = Math.max(0, Math.ceil((silinecek.getTime() - Date.now()) / 86400_000));
  const tarih = silinecek.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '48px 20px', color: 'var(--color-text)' }}>
        <div style={{ fontSize: '2.4rem', marginBottom: 10 }}>⏳</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 10px' }}>
          Hesabın silinmek üzere
        </h1>

        <p style={{ margin: '0 0 8px', lineHeight: 1.65, color: 'var(--color-text)' }}>
          <strong>@{me.username}</strong> hesabı için silme talebi aldık. Hesabın şu an <strong>gizli</strong> —
          gönderilerin, profilin ve içeriğin kimseye görünmüyor.
        </p>

        <p style={{ margin: '0 0 20px', lineHeight: 1.65, color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
          <strong style={{ color: 'var(--color-danger)' }}>{tarih}</strong> tarihinde (yaklaşık{' '}
          <strong style={{ color: 'var(--color-danger)' }}>{kalanGun} gün</strong> sonra) hesabın ve tüm içeriğin
          <strong> kalıcı olarak</strong> silinecek. Bu işlemin geri dönüşü olmayacak.
        </p>

        {error && (
          <p style={{ margin: '0 0 16px', padding: '10px 12px', borderRadius: 10, fontSize: '0.88rem', background: 'color-mix(in srgb, var(--color-danger) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-danger) 35%, transparent)', color: 'var(--color-danger)' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Geri al */}
          <form method="POST" action="/api/account/restore">
            <button
              type="submit"
              style={{ width: '100%', padding: '13px', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem', fontWeight: 700, background: 'var(--color-primary)', color: '#fff' }}
            >
              Vazgeçtim, hesabımı geri al
            </button>
          </form>

          {/* Çıkış — silmeye devam */}
          <form method="POST" action="/api/auth/logout">
            <button
              type="submit"
              style={{ width: '100%', padding: '13px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 600, background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              Hayır, silinsin — çıkış yap
            </button>
          </form>
        </div>

        <p style={{ margin: '20px 0 0', fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
          Verilerinin bir kopyasını istiyorsan, geri aldıktan sonra{' '}
          <strong>Ayarlar → Verilerimi indir</strong> ile JSON olarak indirebilirsin.
        </p>
      </div>
    </main>
  );
}
