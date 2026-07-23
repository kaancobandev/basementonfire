import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE_OPTIONS } from '@/lib/supabase/cookieOptions';

const PROTECTED = ['/profile', '/settings', '/messages', '/notifications', '/bookmarks', '/gonderi-olustur', '/bilgi-karti'];

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
// DİKKAT: Bu testin ikizi app/layout.tsx'teki satır içi auth-hint script'idir
// (data-auth). Burası kullanıcının NEREYE gideceğine, orası nav'ın NE
// göstereceğine karar verir; ikisi ayrışırsa nav ile gerçek davranış çelişir
// (ör. nav "girişlisin" deyip paylaş düğmesini gösterir, middleware yönlendirmez).
// Birini değiştirirsen ÖTEKİNİ DE değiştir.
function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name));
}

// ── GÜVENLİK BAŞLIKLARI — RUNTIME SAYFALAR İÇİN TEK GERÇEK KAYNAK BURASI.
//
// 2026-07-24 CANLI ÖLÇÜM: netlify.toml [[headers]] blokları Next runtime'ının
// (server handler / edge) döndürdüğü SAYFA yanıtlarına UYGULANMIYOR — yalnız
// statik varlıklara (public/*, /_next/static) uygulanıyor. Kanıt: /feed
// yanıtında toml'daki X-Frame-Options/CSP yoktu; görünen nosniff'i Next'in
// kendisi, kısa HSTS'i Netlify platformu basıyordu. /vendor/three dosyasında
// ise toml başlıklarının tamamı vardı.
//
// Sonuç: 2026-07-18'den beri "toml her yanıtı kapsar" varsayımı SAYFALAR için
// yanlıştı; sayfaları fiilen koruyan tek şey middleware'in bastığı CSP'ydi
// (clickjacking'i de X-Frame-Options değil buradaki frame-ancestors kesiyordu).
// Bu blok, sayfa yanıtlarına güvenlik başlıklarının TAMAMINI basar. Statik
// varlıklar için netlify.toml blokları geçerli olmayı sürdürür.
//
// ⚠ CSP'NİN İKİ KOPYASI VAR: burası (sayfalar) + netlify.toml (statik
// varlıklar). Birini değiştirirsen öbürünü de değiştir. Gerekçe notları
// (nonce neden yok, img-src neden geniş, cdnjs neden duruyor) toml'da.
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // 'unsafe-eval' YALNIZCA geliştirmede: webpack/HMR eval kullanıyor ve zorunlu
  // CSP onu engelleyince yerel geliştirme kırılır. Üretim derlemesinde eval yok.
  `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval' " : ''}https://www.googletagmanager.com https://www.googleadservices.com https://cdnjs.cloudflare.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.google.com https://*.doubleclick.net https://www.googleadservices.com https://*.giphy.com",
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

  // Sayfa yanıtlarının güvenlik başlıkları (gerekçe: yukarıdaki ölçüm notu).
  // Sorun çıkarsa CSP'yi geri almak tek kelime: başlığı
  // 'Content-Security-Policy-Report-Only' yap → engelleme durur, rapor sürer.
  response.headers.set('Content-Security-Policy', CSP);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');

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

  // SSR'ı auth OKUMAYAN yollar: prerender/ISR sayfalar (build çıktısında ○/●).
  // Bayat token'la dönen ziyaretçiyi buralarda refresh için BEKLETME — eskiden
  // tamamen statik bir makale sayfası bile CDN yanıtından önce 2 Supabase turu
  // (refresh + getUser, +150-600ms) bekliyordu (2026-07-23 denetimi). Refresh
  // görevi kaybolmaz: her sayfada istemcinin çağırdığı /api/nav-state route
  // handler'ı getMe() ile yeniler ve createAuthClient'ın setAll'u cookieStore.set
  // ile KALICILAŞTIRIR (route handler Set-Cookie yazabilir; RSC yazamaz).
  //
  // Liste BİLİNÇLİ olarak "statik yolları atla" yönünde, "dinamikleri say" değil:
  // listeye girmemiş YENİ bir rota eski davranışı (middleware refresh) alır —
  // güvenli taraf. Tersi tutulsaydı unutulan dinamik rota refresh'i RSC içinde
  // yapar, rotation kalıcılaşmaz ve oturum riske girerdi.
  const STATIC_NO_AUTH_SSR = /^\/(articles(\/|$)|discover$|akis$|muzik$|lig$|gizlilik$|kosullar$|aydinlatma$|acik-riza$)/;

  // Halka açık yol + oturum çerezi taze (veya hiç yok) → Supabase Auth'a ağ
  // çağrısı gereksiz: gerçek doğrulamayı zaten her sayfada getMe() yapıyor.
  // Böylece girişli kullanıcı, sayfa başına 1 fazladan auth turu ödemez;
  // token bitmek üzereyse getUser dinamik yollarda yine çalışır ve yenilenen
  // oturumu Set-Cookie ile kalıcılaştırır (aşağıdaki akış).
  if (!needsAuthDecision && (!tokenNeedsRefresh(request) || STATIC_NO_AUTH_SSR.test(path))) {
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
