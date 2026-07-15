import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google';
import './globals.css';

// Marka tipografisi (self-hosted → CDN/CSP sorunu yok, latin-ext ile tam Türkçe).
// Display: Bricolage Grotesque (başlıklar) · Gövde: DM Sans.
const fontDisplay = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});
const fontBody = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
});
import AppShell from './components/AppShell';
import CelebrateOnParam from './components/CelebrateOnParam';
import CookieConsent from './components/CookieConsent';
import PageviewBeacon from './components/PageviewBeacon';

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

// DİKKAT: Root layout AUTH OKUMAZ (getMe/cookies YOK) → dinamik API içermediğinden
// makale + hukuki metinler gibi kendi dosyası da temiz olan sayfalar statik/ISR'a
// düşebilir (Netlify edge'den servis, soğuk function yok). Kişiye özel nav durumu
// (kullanıcı + sayaçlar) artık istemcide /api/nav-state'ten gelir (AppShell).
export default function RootLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <html lang="tr" className={`${fontDisplay.variable} ${fontBody.variable}`} suppressHydrationWarning>
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
            // AUTH-HINT: Supabase oturum çerezi (httpOnly değil) VARSA ilk boyamadan
            // ÖNCE data-auth="in" ekle → nav girişli/çıkışlı doğru çizilir, "flash"
            // olmaz (kesin veri /api/nav-state'ten sonradan gelir, hint'i düzeltir).
            __html: `document.documentElement.classList.add('js');try{if(document.cookie.indexOf('-auth-token')>=0)document.documentElement.setAttribute('data-auth','in')}catch{}try{if(localStorage.getItem('theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch{}try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('reduced')}catch{}`,
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
        <AppShell>
          {children}
        </AppShell>
        {/* Intercepting-route modal slotu (gönderi /p/[id] modalı) */}
        {modal}
        {/* Çerezsiz sayfa görüntüleme beacon'ı — onaydan bağımsız, herkesi sayar */}
        <PageviewBeacon />
        <CookieConsent gaId={GA_ID} />
      </body>
    </html>
  );
}
