import { NextResponse } from 'next/server';
import { ARTICLES } from '@/lib/articles';

// "Rastgele keşfet" — her istekte rastgele bir makaleye 307 yönlendirir.
// force-dynamic: yönlendirme önbelleğe alınmasın (her tıkta yeni makale).
export const dynamic = 'force-dynamic';

export function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const a = ARTICLES[Math.floor(Math.random() * ARTICLES.length)];
  return NextResponse.redirect(new URL(`/articles/${a.slug}`, origin), 307);
}
