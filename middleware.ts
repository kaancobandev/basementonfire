import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED = ['/profile', '/settings', '/messages', '/notifications', '/bookmarks', '/gonderi-olustur'];

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
  const path = request.nextUrl.pathname;

  if (!user && PROTECTED.some(p => path.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads|logo_basement3).*)'],
};
