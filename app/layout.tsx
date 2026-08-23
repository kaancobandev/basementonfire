import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import localFont from 'next/font/local';
import './globals.css';

// ════════════════════════════════════════════════════════════════════════
// Marka tipografisi. Display: Bricolage Grotesque (başlıklar) · Gövde: DM Sans.
//
// 2026-08-14: `next/font/google` → `next/font/local`. SEBEP OLAY: next/font/google
// woff2 dosyalarını DERLEME ANINDA indiriyor; fonts.gstatic.com ~1 dakika hata
// döndürdü ve Netlify build'i "Failed to fetch `Bricolage Grotesque`" ile düştü,
// deploy kaybedildi. Dosyalar artık app/fonts/ altında → derlemenin Google'a
// bağımlılığı YOK. ÇALIŞMA ANINDA hiçbir şey değişmedi: next/font zaten ikisini
// de kendi kaynağımızdan servis ediyordu, Google'a giden tek adım derlemeydi.
//
// ⚠ AİLE BAŞINA İKİ ÇAĞRI, ÇÜNKÜ TÜRKÇE İKİ ALT KÜMEYE YAYILI:
//   latin     → ç ö ü ve `ı` (U+0131 aralıkta AÇIKÇA listeli)
//   latin-ext → ğ İ ş (U+0100-02BA içinde)
// Tek dosyayla yetinilirse Türkçe metin sessizce yedek fonta düşer. Google da
// tam olarak böyle bölüyor; unicode-range değerleri onun CSS'inden birebir
// alındı. Tarayıcı karakter karakter seçer → yazı tipi yığınında İKİSİ DE olmalı
// (globals.css: `var(--font-display), var(--font-display-ext), ...`).
//
// Ağırlık ARALIK olarak veriliyor ('600 800'): dosyalar değişken font, sabit
// ağırlık listesi yerine aralık hem daha küçük hem ara ağırlıklara açık.
// Yenilemek için: scripts/fontlari-indir.mjs
//
// ⚠ unicode-range DİZELERİ NEDEN DÖRT KEZ TEKRARLIYOR: `next/font` yükleyicisi
// derleme zamanında statik olarak çözümlenir ve "Font loader values must be
// explicitly written literals" der — sabite çıkarmak build'i KIRAR (denendi).
// İki latin dizesi birbirinin aynısı, iki latin-ext dizesi de öyle; birini
// değiştirirsen eşini de değiştir.
// ════════════════════════════════════════════════════════════════════════
const fontDisplay = localFont({
  src: './fonts/bricolage-latin.woff2',
  weight: '600 800',
  display: 'swap',
  variable: '--font-display',
  // ⚠ KAPALI OLMAK ZORUNDA: Next varsayılan olarak bu fontun ardına
  // `unicode-range: U+0-10FFFF` taşıyan bir "Fallback" ailesi enjekte eder.
  // O aralık HER ŞEYİ kapsadığı için ğ/ş/İ sırası ext dosyasına HİÇ gelmez,
  // Arial metriğiyle çizilirdi (ölçüldü: ext fontlar 'unloaded' kalıyordu).
  // Metrik yedeği zinciri ext fontu sağlıyor — o yığında en sonda duruyor.
  adjustFontFallback: false,
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }],
});
const fontDisplayExt = localFont({
  src: './fonts/bricolage-latin-ext.woff2',
  weight: '600 800',
  display: 'swap',
  variable: '--font-display-ext',
  declarations: [{ prop: 'unicode-range', value: 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF' }],
});
const fontBody = localFont({
  src: './fonts/dmsans-latin.woff2',
  weight: '400 700',
  display: 'swap',
  variable: '--font-body',
  // ⚠ KAPALI OLMAK ZORUNDA: Next varsayılan olarak bu fontun ardına
  // `unicode-range: U+0-10FFFF` taşıyan bir "Fallback" ailesi enjekte eder.
  // O aralık HER ŞEYİ kapsadığı için ğ/ş/İ sırası ext dosyasına HİÇ gelmez,
  // Arial metriğiyle çizilirdi (ölçüldü: ext fontlar 'unloaded' kalıyordu).
  // Metrik yedeği zinciri ext fontu sağlıyor — o yığında en sonda duruyor.
  adjustFontFallback: false,
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }],
});
const fontBodyExt = localFont({
  src: './fonts/dmsans-latin-ext.woff2',
  weight: '400 700',
  display: 'swap',
  variable: '--font-body-ext',
  declarations: [{ prop: 'unicode-range', value: 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF' }],
});
import AppShell from './components/AppShell';
import { MediaDockProvider } from './components/MediaDock';
import CelebrateOnParam from './components/CelebrateOnParam';
import CookieConsent from './components/CookieConsent';
import SignupEvent from './components/SignupEvent';
import PageviewBeacon from './components/PageviewBeacon';
import WebVitalsBeacon from './components/WebVitalsBeacon';
import SitePet from './components/SitePet';

// Google Analytics (GA4) ID — CookieConsent'e geçilir. GA YALNIZCA hem
// NEXT_PUBLIC_GA_ID tanımlıysa hem de ziyaretçi çerez onayı verdiyse yüklenir
// (KVKK/GDPR). Netlify'da ortam değişkeni olarak ekle.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const SITE_URL = 'https://basementonfire.com';
const SITE_DESC = 'Bilim, tarih ve kültürü interaktif makaleler ve toplulukla keşfet: Antik Yunan, Roma İmparatorluğu, Kara Delikler, Kartaca, Türkler ve daha fazlası.';

// Bunu eklemek KÜRESEL bir karardır: yatay modda çentik tarafındaki kenara da
// içerik girebilir, bu yüzden kenara sabitlenmiş öğeler (.notif-float)
// güvenli alana göre ayrıca korundu.
//
// interactiveWidget: 'resizes-visual' — KLAVYE ACILINCA DUZEN YENIDEN AKMASIN.
//
// Sorun (kullanici bildirdi, 19.08.2026): klavye acikken ekrana ilk dokunus
// HICBIR YERE ULASMIYOR, yalnizca klavyeyi kapatiyor; her seye iki kez basmak
// gerekiyordu. Yalnizca giris butonu degil, uygulama genelinde.
//
// Sebep: cihazin varsayilani `resizes-content` gibi davraniyor — klavye acilinca
// DUZEN alani da kuculuyor, sayfa yeniden akiyor. Olculdu (canli /login, mobil
// gorunum): gorunur yukseklik 812→420 olunca giris butonu 147px YUKARI kaydi.
// Klavye kapanirken buton geri asagi ziplayinca dokunus parmagin altindan kaciyor
// ve tiklama hic dogmuyor.
//
// 'resizes-visual' SPEC VARSAYILANIDIR: yalnizca GORSEL alan kuculur, duzen
// alani sabit kalir → viewport birimleri (vh/dvh) degismez → yeniden akis YOK.
// Tarayici odaklanan alani gorunur tutmak icin gorsel alani kaydirir.
//
// ⚠ 'overlays-content' SECILMEDI: o da akisi durdururdu ama klavye icerigin
// USTUNU orterdi ve DM yazma cubugu klavyenin ARKASINDA kalirdi.
//
// viewportFit: 'cover' OLMADAN env(safe-area-inset-*) HER ZAMAN 0 döner ve iOS
// düzen alanını güvenli alanların üstünde bitirir → dibe oturttuğumuz mobil
// dock'un ALTINDA bir şerit zemin görünür (kullanıcının istemediği boşluk).
// 'cover' ile düzen ekranın gerçek kenarına uzanır: dock'un camı ana ekran
// çizgisinin arkasını da doldurur, ikonlar ise .mobile-nav'ın
// padding-bottom: env(safe-area-inset-bottom) değeri sayesinde üstte kalır.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-visual',
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
    <html lang="tr" className={`${fontDisplay.variable} ${fontDisplayExt.variable} ${fontBody.variable} ${fontBodyExt.variable}`} suppressHydrationWarning>
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
            // ERKEN NAV ISTEGI (2026-08-23): `data-auth` zaten 'in' ise
            // /api/nav-state'i BURADAN baslat ve promise'i window'a koy.
            // AppShell ayni istegi mount efektinde atiyordu; efekt ise TUM JS
            // inip calismadan kosamaz. Olculdu (canli, 3 tur): ilk istemci
            // istegi son JS parcasinin bitisinden 2-6 ms sonra basliyor ve
            // HTML bittikten sonra 595 / 1663 / 1561 ms bekleniyor. Uc nokta
            // zaten ~285-350 ms; yani gecikme ISTEGIN KENDISINDE DEGIL, NE
            // ZAMAN BASLADIGINDA. Bu satir onu HTML ayristirilirken baslatiyor.
            // Kullanicinin gordugu: ust nav ve sag paneldeki oneri avatarlari.
            // ⛔ AppShell bu promise'i TUKETIYOR (window.__bofNav) — burayi
            //    silersen orada da yedek fetch var, kirilmaz ama kazanc gider.
            // ⚠ .catch ANINDA bagli: yoksa AppShell tuketene kadar gecen
            //    surede 'unhandled rejection' uretir.
            // ⚠ keepalive:true ŞART. Bu istek girisli kullanicida Supabase
            //    refresh token'ini DONDURUYOR. Kullanici sayfa hidre olmadan
            //    (olculdu: 595-1663 ms) ayrilirsa istek iptal edilir, donen
            //    yeni token'in Set-Cookie'si tarayiciya HIC ULASMAZ ve eski
            //    token tuketilmis kalir → sonraki ziyarette SESSIZ CIKIS.
            //    keepalive belge bosalsa da istegi tamamlar; cerez deposu
            //    belgeye degil TARAYICIYA ait, yani Set-Cookie yine islenir.
            //    (PageviewBeacon.tsx ayni sebeple keepalive kullaniyor.)
            // ⚠ Hata durumunda null DEGIL {__hata:1} donuyor: AppShell'in
            //    "cikisli mi, yoksa istek mi dustu" ayrimini yapabilmesi icin.
            //    null donseydi dusen bir istek kullaniciyi cikisli ilan eder,
            //    kisisel kat hic gelmez ve bos kalbe basan kullanicinin
            //    MEVCUT BEGENISI SILINIRDI.
            // ⚠ if(!window.__bofNav) — idempotent: script dugumu herhangi bir
            //    sebeple yeniden calisirsa ikinci bir Lambda uyandirmasin.
            __html: `document.documentElement.classList.add('js');try{if(/(?:^|; *)sb-[^=;]+-auth-token(?:[.][0-9]+)?=/.test(document.cookie)){document.documentElement.setAttribute('data-auth','in');try{if(!window.__bofNav)window.__bofNav=fetch('/api/nav-state'+(location.pathname==='/'?'?feed=1':''),{credentials:'same-origin',keepalive:true}).then(function(r){return r.json()}).catch(function(){return {__hata:1}})}catch{}}}catch{}try{if(localStorage.getItem('theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch{}try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('reduced')}catch{}`,
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
            · ⚠ `js` + `config` BURADA, SENKRON OLMAK ZORUNDA. Eskiden bunları
              @next/third-parties'in GoogleAnalytics bileşeni basıyordu; gtag.js
              ertelenince config de ertelendi ve HİDRASYONDA çalışan SignupEvent'in
              `sign_up` etkinliği config'DEN ÖNCE kuyruğa girdi. Bir mülke bağlı
              olmayan etkinliği GA4 düşürür → dönüşüm sessizce kayboldu (2026-07-24,
              dataLayer sırası canlıda ölçülerek bulundu). Google'ın resmî deseni de
              tam budur: config senkron head'de, kütüphane async. Config burada
              olduğu için CookieConsent artık YALNIZ kütüphaneyi yükler — oraya
              GoogleAnalytics bileşenini geri koyma, config'i İKİ KEZ basar
              (çift page_view).
            Not: bu "Advanced" mod (onay öncesi çerezsiz ping). Ultra-temkinli "Basic"
            istenirse gtag'i yalnız onaydan sonra yükle (CookieConsent koşulu). */}
        {GA_ID && (
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;try{if(localStorage.getItem('ga-disabled')==='true')window['ga-disable-${GA_ID}']=true}catch(e){}gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});gtag('set','url_passthrough',true);gtag('set','ads_data_redaction',true);try{if(localStorage.getItem('cookie-consent')==='accepted')gtag('consent','update',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'})}catch(e){}gtag('js',new Date());gtag('config','${GA_ID}');`,
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
        {/* Gerçek kullanıcı hızı (TTFB/LCP/INP) — kendi ölçümümüz masaüstü+sıcak
            önbellek; ziyaretçinin telefonda gördüğü süreyi ancak burası ölçer. */}
        <WebVitalsBeacon />
        <CookieConsent gaId={GA_ID} />
        {/* Kayıt başarısında (?signup=1) `sign_up` GA4/Ads dönüşümünü gönderir. */}
        <SignupEvent />
        {/* Site maskotu (kızıl panda). Varsayılan AÇIK, ayarlardan kapatılabilir.
            AppShell'in DIŞINDA ve ondan BAĞIMSIZ: kabuğun render yolunda çıkan
            bir sorun maskotu düşürmesin. Kendisi null döner, sunucu HTML'ine
            hiçbir şey basmaz; motoru sayfa yüklendikten SONRA boşta zamanda
            indirir (bkz. SitePet.tsx — üç bağımsız tetikleyici). */}
        <SitePet />
      </body>
    </html>
  );
}
