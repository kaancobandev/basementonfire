import { getMe } from '@/lib/supabase/server';
import { restoreAccount } from '@/lib/accountDeletion';
import { NextResponse, type NextRequest } from 'next/server';

/** Silme talebini geri al (30 gün dolmadan). Hesabı eski hâline döndürür. */
export async function POST(req: NextRequest) {
  const { me } = await getMe();
  if (!me) return NextResponse.redirect(new URL('/login', req.url), { status: 303 });

  const res = await restoreAccount(me.id);
  if (!res.ok)
    return NextResponse.redirect(
      new URL(`/hesap-geri-al?error=${encodeURIComponent(res.error ?? 'Geri alınamadı.')}`, req.url),
      { status: 303 },
    );

  return NextResponse.redirect(new URL('/?geri-alindi=1', req.url), { status: 303 });
}
