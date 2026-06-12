import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { getMe, db } from '@/lib/supabase/server';
import AppShell from './components/AppShell';
import SmoothScroll from './components/SmoothScroll';
import CelebrateOnParam from './components/CelebrateOnParam';

const SITE_URL = 'https://basementonfire.com';
const SITE_DESC = 'Bilim, tarih ve kültürü interaktif makaleler ve toplulukla keşfet: Antik Yunan, Roma İmparatorluğu, Kara Delikler, Kartaca, Türkler ve daha fazlası.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Basements — Bilim, Tarih ve Kültür',
    template: '%s · Basements',
  },
  description: SITE_DESC,
  applicationName: 'Basements',
  keywords: ['bilim', 'tarih', 'kültür', 'antik yunan', 'roma imparatorluğu', 'kara delikler', 'kartaca', 'türk tarihi', 'interaktif makale'],
  openGraph: {
    type: 'website',
    siteName: 'Basements',
    locale: 'tr_TR',
    url: SITE_URL,
    title: 'Basements — Bilim, Tarih ve Kültür',
    description: SITE_DESC,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Basements — Bilim, Tarih ve Kültür',
    description: SITE_DESC,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: { icon: '/icon.svg' },
  // Google Search Console site sahipliği doğrulaması (SEO)
  verification: { google: 'TxJYB9Iwy1fdeqw2kUCJXWg1DjDxa3eTRS11P3we60Y' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { me } = await getMe();

  let unreadCount = 0;
  let unreadMsgCount = 0;
  let convIds: number[] = [];

  if (me) {
    const [notifRes, convRes] = await Promise.all([
      db.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', me.id).eq('is_read', false),
      db.from('conversations').select('id').or(`user1_id.eq.${me.id},user2_id.eq.${me.id}`),
    ]);
    unreadCount = notifRes.count ?? 0;
    convIds = convRes.data?.map((c: any) => c.id) ?? [];
    if (convIds.length) {
      const { count } = await db
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .neq('sender_id', me.id)
        .eq('is_read', false);
      unreadMsgCount = count ?? 0;
    }
  }

  const user = me ? { id: me.id, username: me.username, display_name: me.display_name } : null;

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch{}`,
          }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <CelebrateOnParam />
        </Suspense>
        <SmoothScroll>
          <AppShell user={user} unreadCount={unreadCount} unreadMsgCount={unreadMsgCount} myId={me?.id ?? null} convIds={convIds}>
            {children}
          </AppShell>
        </SmoothScroll>
      </body>
    </html>
  );
}
