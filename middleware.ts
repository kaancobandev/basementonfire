import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE_OPTIONS } from '@/lib/supabase/cookieOptions';

const PROTECTED = ['/profile', '/settings', '/messages', '/notifications', '/bookmarks', '/gonderi-olustur'];

// Oturum çerezindeki access token'ın süresinin dolmak üzere olup olmadığını AĞ
// ÇAĞRISI YAPMADAN anlar. @supabase/ssr oturumu "base64-<base64url(JSON)>"
// biçiminde, gerekirse `sb-…-auth-token.0/.1` diye bölerek saklar. Herhangi bir
// adım çözülemezse "yenileme gerekli" varsayılır (güvenli taraf: getUser çalışır).
function tokenNeedsRefresh(request: NextRequest): boolean {
  try {
    const chunks = request.cookies
      .getAll()
      .filter((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name))
      .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
    if (!chunks.length) return false; // oturum yok → yenilenecek şey de yok
    let raw = chunks.map((c) => c.value).join('');
    if (raw.startsWith('base64-')) {
      const b64 = raw.slice(7).replace(/-/g, '+').replace(/_/g, '/');
      const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
      raw = new TextDecoder().decode(Uint8Array.from(atob(padded), (ch) => ch.charCodeAt(0)));
    } else {
      raw = decodeURIComponent(raw);
    }
    const session = JSON.parse(raw) as { expires_at?: number };
    if (!session?.expires_at) return true;
    // 2 dk pay: bitmek üzereyse middleware yeniler — Set-Cookie YAZABİLEN tek katman
    // burası (server component'ler cookie yazamaz), yenileme yedeği korunmalı.
    return session.expires_at * 1000 - Date.now() < 120_000;
  } catch {
    return true;
  }
}

/** Oturum çerezi VAR mı? Ağ çağrısı YOK — layout'taki inline auth-hint
 *  script'iyle (data-auth) birebir aynı sezgi, o yüzden ikisi tutarlı.
 *  Çerez bayat olabilir; o hâlde /feed getMe() ile çıkışlı render eder (kırılmaz). */
function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name));
}

/**
 * Content-Security-Policy — ŞİMDİLİK YALNIZCA RAPOR MODU (hiçbir şeyi engellemez).
 *
 * NEDEN NONCE YOK: Next.js'in standart CSP deseni her istekte yeni bir nonce
 * üretip script etiketlerine basmaya dayanır. Bu sitede işe YARAMAZ — landing
 * ve 32 makale `○ (Static)` olarak önceden üretiliyor (bkz. `next build`);
 * HTML build'de donuyor, nonce ise istek başına değişiyor, ikisi uyuşmuyor.
 * Dolayısıyla `script-src`'de 'unsafe-inline' kaçınılmaz.
 *
 * O HÂLDE NEYE YARIYOR: CSP'nin değeri script-src'den ibaret değil.
 *  · base-uri 'self'      → enjekte edilen <base> ile tüm göreli URL'leri
 *                            saldırgan sunucusuna çevirme saldırısını keser
 *  · form-action 'self'   → enjekte edilen formun veriyi dışarı POST etmesini keser
 *  · object-src 'none'    → <object>/<embed> tabanlı eski kaçış yollarını kapatır
 *  · connect-src / img-src → XSS başarılı olsa bile veriyi DIŞARI taşıma
 *                            kanallarını daraltır (exfiltration)
 *  · frame-src            → sayfaya rastgele iframe gömülmesini engeller
 *
 * SIRA: önce Report-Only + /api/csp-report ile gerçek ihlaller toplanacak
 * (özellikle kullanıcı makalelerinin srcdoc iframe'leri ana sayfanın CSP'sini
 * MİRAS ALIR — cdnjs'e o yüzden izin verildi, doğrulanmalı). Liste temizlenince
 * başlık `Content-Security-Policy` olarak zorunlu kılınacak.
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // 'unsafe-inline': statik render + nonce uyumsuzluğu (yukarıdaki not).
  // googletagmanager: onay verilmişse yüklenen GA. cdnjs: kullanıcı makalesi
  // sandbox iframe'lerinin kullandığı confetti kütüphanesi.
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdnjs.cloudflare.com",
  // 39 dosyada <style>, 1878 yerde style={{}} → nonce stil ÖZNİTELİĞİNE
  // uygulanamaz, 'unsafe-inline' burada da zorunlu. Riski script'in çok altında.
  // fonts.googleapis: KULLANICI MAKALELERİ (bkz. font-src notu).
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://*.supabase.co https://*.giphy.com https://i.ytimg.com",
  "media-src 'self' blob: https://*.supabase.co",
  // fonts.gstatic: kullanıcı makaleleri yazara 19 Google Font seçeneği sunuyor
  // (lib/userArticles.ts → ARTICLE_GOOGLE_FONTS_HREF) ve stylesheet hem editörde
  // hem /makale/[slug] görüntüleyicisinde yükleniyor. Rapor modu bunu yakaladı:
  // izin verilmeseydi zorunlu kılındığı an tüm kullanıcı makaleleri fontsuz kalırdı.
  //
  // NOT: konsolda yüzlerce font ihlali görünür ama bu İNDİRME DEĞİLDİR — ölçüldü,
  // görüntüleme sayfasında indirilen font dosyası sayısı SIFIR. Tarayıcı
  // @font-face kurallarını işlerken bildirilen her URL'i politikayla karşılaştırıp
  // raporluyor; woff2'ler unicode-range sayesinde yalnızca gerçekten kullanılınca
  // iniyor. Yani performans sorunu yok, yalnızca izin listesi eksikti.
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.giphy.com",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://open.spotify.com",
  "worker-src 'self' blob:",
  'report-uri /api/csp-report',
].join('; ');

export async function middleware(request: NextRequest) {
  // Kanonik alan adına zorla: tüm *.netlify.app host'ları (varsayılan subdomain +
  // HER deploy'un dondurulmuş permalink'i, ör. <hash>--basementonfire.netlify.app)
  // → basementonfire.com. Kullanıcı eski/dondurulmuş deploy'larda takılı kalmasın;
  // giriş sonrası da hep production'da olsun. (localhost ve basementonfire.com
  // ".netlify.app" ile bitmediğinden etkilenmez → redirect loop oluşmaz.)
  const host = request.headers.get('host') ?? '';
  if (host.endsWith('.netlify.app')) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.host = 'basementonfire.com';
    url.port = '';
    return NextResponse.redirect(url, 308);
  }

  const response = NextResponse.next({ request });

  // Rapor modu: tarayıcı hiçbir şeyi ENGELLEMEZ, yalnızca ihlalleri
  // /api/csp-report'a bildirir. Zorunlu kılmadan önce o raporlar okunacak.
  response.headers.set('Content-Security-Policy-Report-Only', CSP_REPORT_ONLY);

  const path = request.nextUrl.pathname;

  // Ana sayfa (/) çıkışlı ziyaretçinin STATİK landing'i — Googlebot ve soğuk
  // ziyaretçi için. Giriş yapmış birinin orada işi yok → akışına gönder.
  // MALİYET ~0: yalnız çerez okunur, ağ çağrısı yok, Netlify bunu Edge Function
  // olarak (Lambda değil) koşturur. Soğuk start /feed'in force-dynamic olmasından
  // gelir, bu satırdan değil — nav'dan tıklasa da aynı bedel ödenirdi.
  //
  // 307 (geçici) + no-store, iki ayrı sebeple ZORUNLU:
  //  · KALICI (301/308) olsaydı tarayıcı sonsuza dek cache'ler → çıkış yapınca
  //    kullanıcı /feed'e kilitlenir, landing'i bir daha göremezdi.
  //  · no-store olmasaydı CDN bu ÇEREZE BAĞLI yanıtı cache'leyip anonim
  //    ziyaretçiyi de /feed'e atabilirdi (landing ölür, SEO ölür).
  // Cache'lenen / her zaman landing kalır; kişisel içerik kendi URL'inde.
  if (path === '/' && hasSessionCookie(request)) {
    // `request.nextUrl.search` ŞART: `new URL('/feed', base)` sorgu dizesini
    // TAŞIMAZ. Paylaş menüsündeki "Hikaye" seçeneği `/?story=1`e gidiyordu →
    // sorgu burada düşüyordu → HomeFeed'in `story=1` efekti hiç tetiklenmiyor,
    // hikaye oluşturucu sessizce AÇILMIYORDU (iki giriş noktasında da ölüydü).
    const res = NextResponse.redirect(new URL('/feed' + request.nextUrl.search, request.url), 307);
    res.headers.set('cache-control', 'private, no-store');
    return res;
  }

  // auth.getUser() sonucu yalnızca şu kararlar için gerekiyor: korumalı yola
  // anonim erişimde /login'e, girişliyken /login|/register'da /'a yönlendirme.
  const needsAuthDecision =
    PROTECTED.some((p) => path.startsWith(p)) || path === '/login' || path === '/register';

  // Halka açık yol + oturum çerezi taze (veya hiç yok) → Supabase Auth'a ağ
  // çağrısı gereksiz: gerçek doğrulamayı zaten her sayfada getMe() yapıyor.
  // Böylece girişli kullanıcı, sayfa başına 1 fazladan auth turu ödemez;
  // token bitmek üzereyse getUser yine çalışır ve yenilenen oturumu Set-Cookie
  // ile kalıcılaştırır (aşağıdaki akış).
  if (!needsAuthDecision && !tokenNeedsRefresh(request)) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: AUTH_COOKIE_OPTIONS,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && PROTECTED.some(p => path.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Girişli kullanıcı /login|/register'a düşerse akışına gönder. ESKİDEN '/' idi
  // ve doğruydu (ana sayfa akıştı); ana sayfa landing olunca giriş yapmış
  // kullanıcıyı pazarlama sayfasına atmaya başlamıştı → /feed.
  if (user && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  return response;
}

export const config = {
  // `.*\\..*` → uzantılı dosyalar (public/ görselleri, icon.svg, robots.txt vb.)
  // middleware'e hiç girmez: bu isteklerde ne auth kararı ne kanonik yönlendirme
  // gerekiyor, edge fonksiyon maliyeti tamamen düşer. Sayfa yollarında nokta yok.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads|logo_basement3|.*\\..*).*)'],
};
