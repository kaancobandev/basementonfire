import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { getMe, db } from '@/lib/supabase/server';
import AppShell from './components/AppShell';
import SmoothScroll from './components/SmoothScroll';
import CelebrateOnParam from './components/CelebrateOnParam';

export const metadata: Metadata = {
  title: 'Basements',
  description: 'Basements sosyal platform',
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
