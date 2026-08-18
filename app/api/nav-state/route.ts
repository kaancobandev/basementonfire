import { NextResponse, after } from 'next/server';
import { db, getMe, logIfError } from '@/lib/supabase/server';
import { buildFeedPersonal, icerikDalgasiniBaslat } from '@/lib/feedPersonal';

// Nav (üst/yan menü) için kişiye özel durum: kullanıcı + okunmamış bildirim/mesaj
// sayaçları + realtime abonelik anahtarları. ESKİDEN bu iş root layout'ta SSR'da
// yapılıyordu (cookies() → tüm sayfalar dinamik). Artık istemci mount'ta buradan
// çeker → root layout auth'suz + statik olabiliyor (makale + hukuki metinler edge'e
// düşer). force-dynamic + no-store: kişiye özel, asla cache'lenmez.
export const dynamic = 'force-dynamic';

// Bu ucun toplam suresi 2026-08-14'te GERCEK girisli oturumda 2,6-3,4 sn olctuldu
// (once kullanicinin DevTools'unda, sonra Performance API ile dogrulandi). Ayni
// sayfanin BELGESI 75 ms TTFB ile geliyordu — yani darbogaz sayfa degil BURASI.
// Neyin yavas oldugunu tahmin etmemek icin her asama olculup Server-Timing ile
// yayinlaniyor; tarayicinin ag panelinden okunabilir:
//   auth → client.auth.getUser()  (Supabase Auth'a ag turu)
//   urow → users satiri            (auth'un id'sine BAGLI, ardisik olmak zorunda)
//   cnt  → 3 sayac sorgusu         (kendi aralarinda paralel)
//   feed → buildFeedPersonal       (2 dalga: onbellekli icerik + 8 paralel sorgu)
//   all  → toplam
// cnt ve feed BIRBIRIYLE de paralel kosuyor, yani toplam ≈ auth + urow + max(cnt, feed).
//
// bolge → Lambda'nin kostugu AWS bolgesi. NEDEN BURADA: Netlify'da fonksiyon
// bolgesi Next.js projelerinde YALNIZCA panelden ayarlanabiliyor — adaptor
// fonksiyon dosyalarini derleme aninda urettigi icin netlify.toml'dan
// hedeflenemiyor (dogrulandi 19.08.2026, Netlify docs). Yani ayar repoda DEGIL
// ve panelden dusrse kimse fark etmez: 18.08'de olculdu, Ohio→Frankfurt farki
// nav-state'te 1382→114 ms. Bolgeyi olcum basligina basmak, sessiz bir geri
// donusu GORUNUR kilar — her olcumde karsina cikar.
const BOLGE = process.env.AWS_REGION ?? 'bilinmiyor';

const zaman = (d: Record<string, number>) =>
  [...Object.entries(d).map(([k, v]) => `${k};dur=${v}`), `bolge;desc="${BOLGE}"`].join(', ');

export async function GET(req: Request) {
  const t0 = Date.now();

  // ⚠ KİMLİKTEN ÖNCE BAŞLIYOR, BİLEREK. İçerik dalgası (getHomeContent +
  // getDidYouKnow) paylaşımlı önbellekten gelir ve KULLANICIDAN BAĞIMSIZDIR —
  // `me`ye ihtiyacı yok. Eskiden `await getMe()` bittikten sonra, yani sırada
  // bekleyerek başlıyordu; ölçümde bu 145-148 ms'ye mal oluyordu (iki bağımsız
  // örnekte de aynı çıktı). Buraya alınınca kimlik turuyla paralel koşuyor.
  //
  // `feed=1` YOKSA HİÇ BAŞLATMA: nav-only isteklere (her makale sayfası,
  // /discover…) bedava iş eklemek olurdu.
  //
  // Sessiz `.catch` ŞART ama AYRI takılıyor: kullanıcı çıkışlıysa aşağıda erken
  // dönüyoruz ve bu promise sahipsiz kalıyor — bu, yakalanmamış reddi bastırır.
  // Zincire eklenmiyor, çünkü `.catch(() => null)` promise'in TİPİNİ bozar ve
  // buildFeedPersonal'a geçirilemez hâle gelir. Gerçek hata yolu aşağıdaki
  // buildFeedPersonal catch'inde zaten var.
  const feedIstendi = new URL(req.url).searchParams.get('feed') === '1';
  const icerikOn = feedIstendi ? icerikDalgasiniBaslat() : undefined;
  icerikOn?.catch(() => {});

  const { me, sure } = await getMe();
  if (!me) {
    return NextResponse.json({ user: null }, {
      headers: {
        'Cache-Control': 'private, no-store',
        'Server-Timing': zaman({ auth: sure?.auth ?? 0, urow: sure?.urow ?? 0, all: Date.now() - t0 }),
      },
    });
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
  const tFeed = Date.now();
  let feedMs = 0;
  let feedAlt: { icerik: number; sorgu: number } | undefined;
  const feedIsi = feedIstendi
    // Fail-safe: kişisel kat patlarsa nav ÇALIŞMAYA DEVAM ETSİN. Aksi hâlde
    // akıştaki bir sorgu hatası menüyü ve bildirimleri de düşürürdü.
    ? buildFeedPersonal(me, icerikOn)
        .catch((e) => { logIfError('nav-state feed', e); return null; })
        .then((r) => { feedMs = Date.now() - tFeed; feedAlt = r?.sure; return r; })
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
  const tCnt = Date.now();
  const [notifRes, convRes, msgRes] = await Promise.all([
    db.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', me.id).eq('is_read', false),
    db.from('conversations').select('id').or(`user1_id.eq.${me.id},user2_id.eq.${me.id}`),
    db.from('messages')
      .select('id, conversations!inner(id)', { count: 'exact', head: true })
      .or(`user1_id.eq.${me.id},user2_id.eq.${me.id}`, { foreignTable: 'conversations' })
      .neq('sender_id', me.id)
      .eq('is_read', false),
  ]);

  const cntMs = Date.now() - tCnt;
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
    {
      headers: {
        'Cache-Control': 'private, no-store',
        // ⚠ `feed` await'İ YUKARIDA olduğu için feedMs burada dolu — bu satır
        // nesne kurulduktan SONRA değerlendiriliyor. Sırayı bozma.
        'Server-Timing': zaman({
          auth: sure?.auth ?? 0,
          // urow artık auth ile ÇAKIŞIYOR: spek=1 ise bu süre yalnızca hazır
          // sonucun beklenmesi (≈0), spek=0 ise gerçek sorgunun tam turu.
          urow: sure?.urow ?? 0,
          spek: sure?.spek ?? 0,
          cnt: cntMs,
          feed: feedMs,
          // feed'in İÇİ: icerik = önbellekli içerik dalgası (isabet varsa ~0),
          // sorgu = 8 kişisel sorgunun paralel dalgası. İkisi ARDIŞIK.
          ficerik: feedAlt?.icerik ?? 0,
          fsorgu: feedAlt?.sorgu ?? 0,
          all: Date.now() - t0,
        }),
      },
    },
  );
}
