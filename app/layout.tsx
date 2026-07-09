import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import { getMe, db, logIfError } from '@/lib/supabase/server';
import AppShell from './components/AppShell';
import CelebrateOnParam from './components/CelebrateOnParam';
import CookieConsent from './components/CookieConsent';

// Google Analytics (GA4) ID — CookieConsent'e geçilir. GA YALNIZCA hem
// NEXT_PUBLIC_GA_ID tanımlıysa hem de ziyaretçi çerez onayı verdiyse yüklenir
// (KVKK/GDPR). Netlify'da ortam değişkeni olarak ekle.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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

export default async function RootLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  const { me } = await getMe();

  let unreadCount = 0;
  let unreadMsgCount = 0;
  let convIds: number[] = [];

  if (me) {
    // "Şu an online" için son görülme zamanını en fazla ~2 dk'da bir güncelle.
    // Ateşle-unut (await yok → TTFB'ye eklenmez); throttle sayesinde çoğu istek
    // yazmaz. last_seen_at kolonu yoksa (SQL henüz çalışmadıysa) tamamen atlanır.
    if ('last_seen_at' in me) {
      const last = (me as any).last_seen_at ? new Date((me as any).last_seen_at).getTime() : 0;
      if (Date.now() - last > 120_000) {
        db.from('users').update({ last_seen_at: new Date().toISOString() }).eq('id', me.id)
          .then(({ error }) => logIfError('touch last_seen', error));
      }
    }

    // Tek turda üç sayaç: okunmamış mesaj sorgusu artık konuşma listesini
    // BEKLEMEZ (conversations!inner birleşimi kullanıcının konuşmalarına
    // filtreler) → her sayfa gezinmesinde bir veritabanı turu eksilir (TTFB).
    const [notifRes, convRes, msgRes] = await Promise.all([
      db.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', me.id).eq('is_read', false),
      db.from('conversations').select('id').or(`user1_id.eq.${me.id},user2_id.eq.${me.id}`),
      db.from('messages')
        .select('id, conversations!inner(id)', { count: 'exact', head: true })
        .or(`user1_id.eq.${me.id},user2_id.eq.${me.id}`, { foreignTable: 'conversations' })
        .neq('sender_id', me.id)
        .eq('is_read', false),
    ]);
    unreadCount = notifRes.count ?? 0;
    convIds = convRes.data?.map((c: any) => c.id) ?? [];
    if (!msgRes.error) {
      unreadMsgCount = msgRes.count ?? 0;
    } else if (convIds.length) {
      // Birleşim sorgusu başarısız olursa eski iki aşamalı yola düş
      logIfError('layout unread messages join', msgRes.error);
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
        {/* Supabase'e erken bağlantı: video/avatar/hikâye medyası + realtime
            ilk istekte DNS+TLS beklemez (crossorigin'li olan fetch/XHR için) */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
          </>
        )}
        {/* Feed'deki GIF'ler Giphy CDN'inden gelir — DNS+TLS'i önden aç */}
        <link rel="dns-prefetch" href="https://media3.giphy.com" />
        <link rel="preconnect" href="https://media3.giphy.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            // 'js'/'reduced' sınıfları ilk boyamadan ÖNCE eklenir → makale .reveal
            // bölümleri gizli başlar (FOUC/titreme önlenir); tema da erken uygulanır.
            __html: `document.documentElement.classList.add('js');try{if(localStorage.getItem('theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch{}try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('reduced')}catch{}`,
          }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <CelebrateOnParam />
        </Suspense>
        {/* Native scroll. Lenis smooth-scroll KALDIRILDI: tekerlek/touchpad olayını
            yakalayıp (rAF/lenis-stopped durumunda) kaydırmayı engelleyebiliyordu;
            native scroll her cihaz ve tarayıcıda güvenilir çalışır. */}
        <AppShell user={user} unreadCount={unreadCount} unreadMsgCount={unreadMsgCount} myId={me?.id ?? null} convIds={convIds}>
          {children}
        </AppShell>
        {/* Intercepting-route modal slotu (gönderi /p/[id] modalı) */}
        {modal}
        <CookieConsent gaId={GA_ID} />
      </body>
    </html>
  );
}
