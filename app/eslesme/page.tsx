import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getMe } from '@/lib/supabase/server';
import EslesmeClient from './EslesmeClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Eşleştir',
  description: 'İlgi alanlarına göre yeni insanlarla eşleş. Aynı konulara meraklı kişileri keşfet, beğen ve sohbete başla.',
  alternates: { canonical: '/eslesme' },
  robots: { index: false, follow: false }, // kişiye özel keşif akışı — indekslenmesin
};

export default async function EslesmePage() {
  const { me } = await getMe();
  if (!me) redirect('/login');

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
