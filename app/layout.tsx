import type { Metadata, Viewport } from 'next';
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

// viewportFit: 'cover' OLMADAN env(safe-area-inset-*) HER ZAMAN 0 döner ve iOS
// düzen alanını güvenli alanların üstünde bitirir → dibe oturttuğumuz mobil
// dock'un ALTINDA bir şerit zemin görünür (kullanıcının istemediği boşluk).
// 'cover' ile düzen ekranın gerçek kenarına uzanır: dock'un camı ana ekran
// çizgisinin arkasını da doldurur, ikonlar ise .mobile-nav'ın
// padding-bottom: env(safe-area-inset-bottom) değeri sayesinde üstte kalır.
// Bunu eklemek KÜRESEL bir karardır: yatay modda çentik tarafındaki kenara da
// içerik girebilir, bu yüzden kenara sabitlenmiş öğeler (.notif-float)
// güvenli alana göre ayrıca korundu.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

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
  // ⚠⚠ BURAYA `icons:` YAZMA — GERİ EKLEME. (2026-07-16'da SİLİNDİ, sebebi:)
  //
  // Açık `icons` metadata'sı, dosya tabanlı app/icon.png + app/apple-icon.png
  // konvansiyonunu TAMAMEN yutar. Bekçi alan-bazlı DEĞİL, TÜM `icons` nesnesi
  // üzerinde — yani `icons: { icon: ... }` yazmak apple-touch-icon'u DA öldürür:
  //   node_modules/next/dist/lib/metadata/resolve-metadata.js:703-716
  //   if (leafSegmentStaticIcons.icon.length > 0 || ...apple.length > 0) {
  //     if (!resolvedMetadata.icons) {          // <-- BEKÇİ
  //       ...icons.icon.unshift(...)            // <-- ikisi de İÇERİDE
  //       ...icons.apple.unshift(...)
  //     }
  //   }
  //
  // Burada `icons: { icon: '/icon.svg' }` vardı ve zarar SESSİZDİ, çünkü iki yol da
  // aynı '/icon.svg' adını söylüyordu → hata maskeliydi. Ölçülen bedeli:
  //   · HTML'de `<link rel="icon" href="/icon.svg"/>` — ÇIPLAK: type/sizes/?hash YOK
  //   · apple-touch-icon SIFIR (iOS ana ekranda ikon yoktu; SVG'yi Apple zaten desteklemez)
  //   · .next/server/app/icon.svg.body ÜRETİLİYOR ama yok sayılıyor
  //
  // Silince konvansiyon devreye girer ve `/icon.png?<contenthash>` + type + sizes basar.
  // ?hash ÖNEMLİ: favicon tarayıcıda en agresif cache'lenen kaynaktır ve rota 1 yıl
  // `immutable` servis edilir — açık metadata hash'i siler, o zaman aynı dosya adının
  // içeriğini değiştirmek geri dönen ziyaretçide 1 YILA KADAR eski ikonu bırakır.
  // (Deploy cache süpürgesi bunu ÇÖZMEZ: o CDN'i ısıtır, tarayıcı cache'ini değil.)
  //
  // TEK İSTİSNA: koyu-tema favicon varyantı (`media: '(prefers-color-scheme: dark)'`)
  // yalnız AÇIK IconDescriptor ile mümkün — konvansiyon `media` basamaz. Bir gün o
  // gerekirse, hash cache-bust'ını ELLE yönetmen ve apple-icon'u da elle yazman gerekir.
  //
  // Aynı sınıf hata: 19 makalenin openGraph.images'ı (bkz. lib/og.tsx, 9647856).

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
