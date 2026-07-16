import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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
    const res = NextResponse.redirect(new URL('/feed', request.url), 307);
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
