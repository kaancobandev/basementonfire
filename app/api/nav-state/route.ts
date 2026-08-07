import { NextResponse, after } from 'next/server';
import { db, getMe, logIfError } from '@/lib/supabase/server';
import { buildFeedPersonal } from '@/lib/feedPersonal';

// Nav (üst/yan menü) için kişiye özel durum: kullanıcı + okunmamış bildirim/mesaj
// sayaçları + realtime abonelik anahtarları. ESKİDEN bu iş root layout'ta SSR'da
// yapılıyordu (cookies() → tüm sayfalar dinamik). Artık istemci mount'ta buradan
// çeker → root layout auth'suz + statik olabiliyor (makale + hukuki metinler edge'e
// düşer). force-dynamic + no-store: kişiye özel, asla cache'lenmez.
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { me } = await getMe();
  if (!me) {
    return NextResponse.json({ user: null }, { headers: { 'Cache-Control': 'private, no-store' } });
  }

  // ── ?feed=1 — akışın kişisel katını AYNI turda ver ──
  // Ölçüm (07.08.2026, canlı, girişli hesap): istemci bu iki ucu ZİNCİRLEME
  // atıyordu. nav-state 968→3160 ms bitiyor, /api/feed/personal ancak 3181 ms'de
  // başlıyordu — çünkü kapısı `useNavUser()` idi ve o context nav-state cevabıyla
  // doluyordu. Kişisel veri 4,6 saniyede yerleşiyordu.
  //
  // ⚠ `await` BURADA YOK, bilerek: promise'i başlatıp aşağıdaki nav sorgularıyla
  // PARALEL koşturuyoruz, yanıtı kurarken bekliyoruz. Burada await edilirse
  // zincir uca taşınmış olurdu, hiçbir şey kazanılmazdı.
  const feedIstendi = new URL(req.url).searchParams.get('feed') === '1';
  const feedIsi = feedIstendi
    // Fail-safe: kişisel kat patlarsa nav ÇALIŞMAYA DEVAM ETSİN. Aksi hâlde
    // akıştaki bir sorgu hatası menüyü ve bildirimleri de düşürürdü.
    ? buildFeedPersonal(me).catch((e) => { logIfError('nav-state feed', e); return null; })
    : null;

  // "Şu an online" için son görülme (≤2dk'da bir, ateşle-unut — yanıtı bekletmez).
  if ('last_seen_at' in me) {
    const last = (me as any).last_seen_at ? new Date((me as any).last_seen_at).getTime() : 0;
    if (Date.now() - last > 120_000) {
      after(async () => {
        const { error } = await db.from('users').update({ last_seen_at: new Date().toISOString() }).eq('id', me.id);
        logIfError('touch last_seen', error);
      });
    }
  }

  // Üç sayaç tek turda paralel (layout'taki eski mantığın birebir taşınması).
  const [notifRes, convRes, msgRes] = await Promise.all([
    db.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', me.id).eq('is_read', false),
    db.from('conversations').select('id').or(`user1_id.eq.${me.id},user2_id.eq.${me.id}`),
    db.from('messages')
      .select('id, conversations!inner(id)', { count: 'exact', head: true })
      .or(`user1_id.eq.${me.id},user2_id.eq.${me.id}`, { foreignTable: 'conversations' })
      .neq('sender_id', me.id)
      .eq('is_read', false),
  ]);

  const convIds = convRes.data?.map((c: any) => c.id) ?? [];
  let unreadMsgCount = 0;
  if (!msgRes.error) {
    unreadMsgCount = msgRes.count ?? 0;
  } else if (convIds.length) {
    // Birleşim sorgusu başarısız olursa eski iki aşamalı yola düş
    logIfError('nav-state unread messages join', msgRes.error);
    const { count } = await db
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', convIds)
      .neq('sender_id', me.id)
      .eq('is_read', false);
    unreadMsgCount = count ?? 0;
  }

  return NextResponse.json(
    {
      user: { id: me.id, username: me.username, display_name: me.display_name },
      unreadCount: notifRes.count ?? 0,
      unreadMsgCount,
      myId: me.id,
      convIds,
      // Yalnız ?feed=1 istendiğinde dolu. İstemci bunu görürse ikinci isteği
      // HİÇ atmaz (bkz. AppShell + HomeFeed).
      ...(feedIsi ? { feed: await feedIsi } : {}),
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
