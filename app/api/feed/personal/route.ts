import { NextResponse } from 'next/server';
import { getMe } from '@/lib/supabase/server';
import { buildFeedPersonal } from '@/lib/feedPersonal';

// ════════════════════════════════════════════════════════════════════════
// /feed'in KİŞİYE ÖZEL katı. Sayfanın kendisi 2026-07-28'de ISR'a çevrildi
// (paylaşılan HTML, CDN'de durur); kullanıcıya ait ne varsa buraya taşındı.
//
// Bu uç ASLA cache'lenmez. Paylaşılan kabuk + no-store kişisel kat ayrımı,
// /muzik ve /hashtag/[tag]'in zaten kullandığı desenin akışa uygulanmışı.
//
// Maliyet: getHomeContent/getDidYouKnow BURADA YENİDEN SORGULAMAZ —
// lib/feedData'daki aynı unstable_cache girdilerini paylaşır (sayfa zaten
// ısıtmıştır) → bu uç pratikte yalnız kullanıcıya ait sorguları koşar.
// ════════════════════════════════════════════════════════════════════════
export const dynamic = 'force-dynamic';

export async function GET() {
  const { me } = await getMe();
  // Anonim: kabukta zaten public hikâyeler var, değiştirilecek bir şey yok.
  // `user: null` istemciye "ısrar etme" der (istemci de zaten çerez görmeden çağırmaz).
  if (!me) {
    return NextResponse.json({ user: null }, { headers: { 'Cache-Control': 'private, no-store' } });
  }

  // Gövde lib/feedPersonal.ts'e taşındı — /api/nav-state?feed=1 aynı yükü
  // nav verisiyle TEK turda döndürebilsin diye. Bu uç, istemci tarafı
  // gezinmede (AppShell yeniden fetch etmez) hâlâ gerekli.
  return NextResponse.json(await buildFeedPersonal(me), {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
