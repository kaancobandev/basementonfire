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
import { MediaDockProvider } from './components/MediaDock';
import CelebrateOnParam from './components/CelebrateOnParam';
import CookieConsent from './components/CookieConsent';
import SignupEvent from './components/SignupEvent';
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
    default: 'Basementonfire — Bilim, Tarih ve Kültür',
    template: '%s · Basementonfire',
  },
  description: SITE_DESC,
  applicationName: 'Basementonfire',
  keywords: ['bilim', 'tarih', 'kültür', 'antik yunan', 'roma imparatorluğu', 'kara delikler', 'kartaca', 'türk tarihi', 'interaktif makale'],
  openGraph: {
    type: 'website',
    siteName: 'Basementonfire',
    locale: 'tr_TR',
    url: SITE_URL,
    title: 'Basementonfire — Bilim, Tarih ve Kültür',
    description: SITE_DESC,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Basementonfire — Bilim, Tarih ve Kültür',
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
        {/* Supabase'e erken bağlantı: realtime + istemci fetch'leri (nav-state
            sonrası) ilk istekte DNS+TLS beklemez. TEK preconnect ve crossorigin'li:
            bu origin'e giden her şey CORS'lu fetch/XHR/WebSocket — crossorigin'siz
            ikizi (2026-07-23 denetimi) hiçbir isteğin kullanmadığı İKİNCİ bir TLS
            el sıkışması açıyordu, kaldırıldı. Giphy preconnect'i de buradan feed'e
            taşındı: landing + 32 makale Giphy'ye tek istek atmıyor. */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
        )}
        <script
          dangerouslySetInnerHTML={{
            // 'js'/'reduced' sınıfları ilk boyamadan ÖNCE eklenir → makale .reveal
            // bölümleri gizli başlar (FOUC/titreme önlenir); tema da erken uygulanır.
            // AUTH-HINT: Supabase oturum çerezi (httpOnly değil) VARSA ilk boyamadan
            // ÖNCE data-auth="in" ekle → nav girişli/çıkışlı doğru çizilir, "flash"
            // olmaz (kesin veri /api/nav-state'ten sonradan gelir, hint'i düzeltir).
            //
            // ÇEREZ TESTİ middleware.ts'teki hasSessionCookie ile AYNI ANLAMDA
            // olmak ZORUNDA: burası nav'ın NE göstereceğine, orası kullanıcının
            // NEREYE gideceğine karar veriyor; ikisi ayrışırsa nav "girişlisin"
            // deyip middleware yönlendirmez (ya da tersi). Önceden burada serbest
            // `indexOf('-auth-token')` vardı: adında '-auth-token' geçen HERHANGİ
            // bir üçüncü-parti çerez (analitik/CMP) çıkışlı ziyaretçiye paylaş (+)
            // düğmesini gösterirdi, middleware ise aldanmazdı.
            //
            // Regex, middleware'deki /^sb-.+-auth-token(\.\d+)?$/ ile eşleştirilmiş
            // hâli — çerez ADLARINA uygulanır: ad ya dizenin başında ya "; "den
            // sonra başlar ve '='e kadar sürer, böylece bir çerez DEĞERİ içindeki
            // aynı metin artık eşleşmez. BACKSLASH KULLANMA: bu bir template
            // literal, `\.` ve `\d` kaçışları emit edilen JS'e ULAŞMADAN düşer ve
            // regex sessizce başka bir şeye dönüşür — bu yüzden [.] ve [0-9] var.
            __html: `document.documentElement.classList.add('js');try{if(/(?:^|; *)sb-[^=;]+-auth-token(?:[.][0-9]+)?=/.test(document.cookie))document.documentElement.setAttribute('data-auth','in')}catch{}try{if(localStorage.getItem('theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch{}try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('reduced')}catch{}`,
          }}
        />
        {/* ── Google Consent Mode v2 ──
            gtag.js'den (CookieConsent → GoogleAnalytics, async) ÖNCE çalışan
            SENKRON head script'i: tüm izin türleri 'denied' başlar. Böylece GA/Ads
            onaydan ÖNCE de yüklenir ama ÇEREZSİZ, kimliksiz "ping" yollar (KVKK
            uyumlu tasarım — çerez yok, kişisel veri yok). Kullanıcı "Kabul Et"e
            basınca CookieConsent `consent update: granted` çeker → tam ölçüm.
            Reddederse denied kalır → Google onaysız trafiği MODELLER.
            · url_passthrough: çerez reddedilse bile gclid URL'de taşınır (reklam ölçümü)
            · ads_data_redaction: denied durumda reklam tıklama kimliği maskelenir
            · ga-disabled: cihaz hariç tutma (?notrack) korunur — o cihazda hiç ping yok
            · gtag.js İLK BOYAMADAN SONRA yüklenir (2026-07-24, CookieConsent'te
              gaReady idle-kapısı): 183 KB'lık script head'e preload girmez, LCP ile
              yarışmaz; bu stub sayesinde aradaki çağrılar dataLayer'da kuyruklanır.
            Not: bu "Advanced" mod (onay öncesi çerezsiz ping). Ultra-temkinli "Basic"
            istenirse gtag'i yalnız onaydan sonra yükle (CookieConsent koşulu). */}
        {GA_ID && (
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;try{if(localStorage.getItem('ga-disabled')==='true')window['ga-disable-${GA_ID}']=true}catch(e){}gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});gtag('set','url_passthrough',true);gtag('set','ads_data_redaction',true);try{if(localStorage.getItem('cookie-consent')==='accepted')gtag('consent','update',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'})}catch(e){}`,
            }}
          />
        )}
      </head>
      <body>
        <Suspense fallback={null}>
          <CelebrateOnParam />
        </Suspense>
        {/* Native scroll. Lenis smooth-scroll KALDIRILDI: tekerlek/touchpad olayını
            yakalayıp (rAF/lenis-stopped durumunda) kaydırmayı engelleyebiliyordu;
            native scroll her cihaz ve tarayıcıda güvenilir çalışır. */}
        {/* Medya dock'u AppShell'in DIŞINDA: AppShell giriş/kayıt sayfalarında
            erken return yapıyor, sağlayıcı orada da ayakta kalsın. Ses ve gömülü
            çerçeve burada yaşar → sayfa gezinmesinde çalma kesilmez. */}
        <MediaDockProvider>
          <AppShell>
            {children}
          </AppShell>
        </MediaDockProvider>
        {/* Intercepting-route modal slotu (gönderi /p/[id] modalı) */}
        {modal}
        {/* Çerezsiz sayfa görüntüleme beacon'ı — onaydan bağımsız, herkesi sayar */}
        <PageviewBeacon />
        <CookieConsent gaId={GA_ID} />
        {/* Kayıt başarısında (?signup=1) `sign_up` GA4/Ads dönüşümünü gönderir. */}
        <SignupEvent />
      </body>
    </html>
  );
}
