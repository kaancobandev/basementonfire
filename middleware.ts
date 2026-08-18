import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE_OPTIONS, oturumParcalari } from '@/lib/supabase/cookieOptions';

const PROTECTED = ['/profile', '/settings', '/messages', '/notifications', '/bookmarks', '/gonderi-olustur', '/bilgi-karti'];

// Oturum çerezindeki access token'ın süresinin dolmak üzere olup olmadığını AĞ
// ÇAĞRISI YAPMADAN anlar. @supabase/ssr oturumu "base64-<base64url(JSON)>"
// biçiminde, gerekirse `sb-…-auth-token.0/.1` diye bölerek saklar. Herhangi bir
// adım çözülemezse "yenileme gerekli" varsayılır (güvenli taraf: getUser çalışır).
// 🚨 YÖNLENDİRİRKEN ÇEREZLERİ TAŞI — yoksa OTURUM ÖLÜR.
//
// `NextResponse.redirect()` SIFIRDAN bir yanıt üretir; elimizdeki `response`a
// yazılmış Set-Cookie başlıkları o yanıta GEÇMEZ. Sorun şu ki `getUser()`
// oturumu tazelediğinde @supabase/ssr yeni access+refresh token'ı tam olarak
// oraya yazıyor. Yönlendirme bunu atınca:
//   · sunucu refresh token'ı DÖNDÜRDÜ (eskisi artık tüketilmiş sayılıyor)
//   · tarayıcıda hâlâ ESKİ token duruyor
//   · bir sonraki yenileme reddediliyor → kullanıcı kalıcı olarak çıkış yapıyor
// Yani kullanıcı, korumalı bir sayfaya token yenilenmesi gereken anda girdiği
// için oturumunu kaybediyordu. Sessiz ve tekrarı zor bir hata.
//
// Aynı tuzağa auth API route'larında da düşülmüştü (createAuthClientForResponse
// oradaki çözüm). Kural: Set-Cookie yazabilecek bir akıştan yönlendiriyorsan
// çerezleri ELİNLE taşı.
function yonlendir(hedef: URL, kaynak: NextResponse): NextResponse {
  const r = NextResponse.redirect(hedef);
  for (const c of kaynak.cookies.getAll()) r.cookies.set(c);
  return r;
}

function tokenNeedsRefresh(request: NextRequest): boolean {
  try {
    const chunks = oturumParcalari(request.cookies.getAll());
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

// NOT: Burada eskiden `hasSessionCookie()` vardı ve `/` → `/feed` yönlendirmesini
// besliyordu. Tek ana sayfaya geçilince (2026-08-14) o yönlendirme kalktı, bu
// yardımcı da öksüz kaldı → silindi. İkizi app/layout.tsx'teki satır içi
// auth-hint script'i (data-auth) YAŞIYOR ve hâlâ gerekli: nav'ın girişli/çıkışlı
// hangi hâlde çizileceğine o karar veriyor. Artık middleware kimsenin NEREYE
// gideceğine çereze bakarak karar vermiyor, o yüzden "ikisi tutarlı olmalı"
// kısıtı da ortadan kalktı.

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

  // ════════════════════════════════════════════════════════════════════
  // /feed → / (301). 2026-08-14: TEK ANA SAYFA.
  //
  // BURADA ESKİDEN TERSİ VARDI: `/` çıkışlının statik landing'iydi ve oturum
  // çerezi olan `/feed`e 307'leniyordu. Landing app/components/landing/
  // LandingPage.tsx'e taşındı, akış `/`nin kendisi oldu, `/feed` kaldırıldı.
  //
  // ⚠⚠ ESKİ BLOĞU GERİ EKLEME. `/` → `/feed` ile buradaki `/feed` → `/` aynı
  // anda durursa tarayıcı iki adres arasında SONSUZ DÖNGÜye girer ve site hiç
  // açılmaz. İkisinden yalnız biri var olabilir.
  //
  // 301 (kalıcı) bilinçli — eski 307'nin geçici olma gerekçesi ("çıkış yapınca
  // landing'e dönebilmeli") artık YOK: `/feed` bir daha içerik servis etmeyecek,
  // hedef herkes için aynı ve çereze BAĞLI DEĞİL. Çereze bakmadığı için yanıt
  // CDN'de cache'lenebilir; eski bloğun no-store'a ihtiyacı bu yüzden kalktı.
  //
  // `request.nextUrl.search` ŞART: `new URL('/', base)` sorgu dizesini TAŞIMAZ.
  // Paylaş menüsündeki "Hikâye" seçeneği `?story=1` taşıyor — düşerse hikâye
  // oluşturucu sessizce açılmaz (bu hata bir kez yaşandı).
  if (path === '/feed') {
    return NextResponse.redirect(new URL('/' + request.nextUrl.search, request.url), 301);
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
  // `feed$` 2026-07-28'de eklendi: /feed force-dynamic'ten ISR'a çevrildi ve
  // SSR'da artık auth OKUMUYOR (kimlik istemcide /api/feed/personal'dan gelir).
  // Bayat token'lı ziyaretçiyi burada refresh için bekletmek, sayfanın CDN'den
  // gelmesinin tüm kazancını yerdi.
  //
  // ⚠ `^\/$` (ÇIPLAK KÖK) 2026-08-14'te EKLENDİ — ATLAMA. Aşağıdaki alternatif
  // grubun HER dalı eğik çizgiden sonra en az bir karakter istiyor, yani `/`
  // hiçbirine uymaz. Bu, akış `/feed`teyken zararsızdı: girişli ziyaretçi zaten
  // yukarıdaki 307'ye takılıp buraya hiç gelmiyordu. Akış `/`ye taşınıp o
  // yönlendirme kalkınca, kök burada eşleşmeseydi girişli HER ziyaretçi ana
  // sayfada istek başına bir Supabase getUser() turu ödemeye başlardı — yani
  // 307'yi kaldırıp sayfayı YAVAŞLATMIŞ olurduk. `/` artık SSR'da auth okumuyor
  // (app/page.tsx), listeye ait.
  const STATIC_NO_AUTH_SSR = /^\/$|^\/(articles(\/|$)|discover$|akis$|muzik$|lig$|gizlilik$|kosullar$|aydinlatma$|acik-riza$)/;

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
    return yonlendir(new URL('/login', request.url), response);
  }

  // Girişli kullanıcı /login|/register'a düşerse ana sayfaya gönder.
  // Bu satır iki kez taşındı: '/' (ana sayfa akıştı) → '/feed' (ana sayfa
  // landing oldu, kullanıcıyı pazarlama sayfasına atmasın diye) → yine '/'
  // (2026-08-14, tek ana sayfa). `/feed` yazsaydı yukarıdaki 301'e çarpıp
  // gereksiz ikinci bir tur ekleyecekti.
  if (user && (path === '/login' || path === '/register')) {
    return yonlendir(new URL('/', request.url), response);
  }

  return response;
}

export const config = {
  // `.*\\..*` → uzantılı dosyalar (public/ görselleri, icon.svg, robots.txt vb.)
  // middleware'e hiç girmez: bu isteklerde ne auth kararı ne kanonik yönlendirme
  // gerekiyor, edge fonksiyon maliyeti tamamen düşer. Sayfa yollarında nokta yok.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads|logo_basement3|.*\\..*).*)'],
};
