import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMe } from '@/lib/supabase/server';
import { MATCH_MIN_AGE, isAtLeast } from '@/lib/age';
import EslesmeClient from './EslesmeClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Eşleştir',
  description: 'İlgi alanlarına göre yeni insanlarla eşleş. Aynı konulara meraklı kişileri keşfet, beğen ve sohbete başla.',
  alternates: { canonical: '/eslesme' },
  robots: { index: false, follow: false }, // kişiye özel keşif akışı — indekslenmesin
};

/** 18 altı / doğum tarihi olmayan kullanıcıya gösterilen açıklama ekranı. */
function KapiEkrani({ dogumTarihiYok }: { dogumTarihiYok: boolean }) {
  return (
    <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '56px 20px', textAlign: 'center', color: 'var(--color-text)' }}>
        <div style={{ fontSize: '2.6rem', marginBottom: 12 }}>🔞</div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 12px' }}>
          Eşleştirme {MATCH_MIN_AGE} yaş ve üzeri içindir
        </h1>

        {dogumTarihiYok ? (
          <>
            <p style={{ margin: '0 0 8px', lineHeight: 1.65, color: 'var(--color-text-muted)' }}>
              Yaşını doğrulayamıyoruz çünkü profilinde <strong>doğum tarihi kayıtlı değil</strong> (hesabın yaş
              doğrulaması gelmeden önce açılmış olabilir).
            </p>
            <p style={{ margin: '0 0 22px', lineHeight: 1.65, color: 'var(--color-text-muted)' }}>
              Doğum tarihini profiline eklersen ve {MATCH_MIN_AGE} yaşından büyüksen bu özellik açılır.
            </p>
            <Link
              href="/profile"
              style={{ display: 'inline-block', padding: '12px 22px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, background: 'var(--color-primary)', color: '#fff' }}
            >
              Profilime doğum tarihi ekle
            </Link>
          </>
        ) : (
          <>
            <p style={{ margin: '0 0 22px', lineHeight: 1.65, color: 'var(--color-text-muted)' }}>
              Tanımadığın kişilerle kart kaydırıp özel mesajlaşma açan bu özellik, güvenlik gerekçesiyle yalnızca{' '}
              <strong>{MATCH_MIN_AGE} yaşından büyük</strong> kullanıcılara açıktır. Basementonfire&apos;ın geri kalanını
              (makaleler, akış, topluluk) kullanmaya devam edebilirsin.
            </p>
            <Link
              href="/"
              style={{ display: 'inline-block', padding: '12px 22px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, background: 'var(--color-primary)', color: '#fff' }}
            >
              Ana sayfaya dön
            </Link>
          </>
        )}

        <p style={{ margin: '22px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Ayrıntılar: <Link href="/kosullar" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Kullanım Koşulları</Link>
        </p>
      </div>
    </main>
  );
}

export default async function EslesmePage() {
  const { me } = await getMe();
  if (!me) redirect('/login');

  // 18+ KAPISI. (API route'ları da ayrıca korunuyor — sayfayı gizlemek tek başına yetmez.)
  if (!isAtLeast(me.birthdate, MATCH_MIN_AGE))
    return <KapiEkrani dogumTarihiYok={!me.birthdate} />;

  return (
    <EslesmeClient
      me={{
        id: me.id,
        username: me.username,
        display_name: me.display_name,
        avatar: me.avatar ?? '',
        interests: Array.isArray(me.interests) ? me.interests : [],
      }}
    />
  );
}
