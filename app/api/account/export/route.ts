import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * KVKK m. 11 / GDPR m. 15 + m. 20 — "verilerimi indir".
 * Kullanıcının KENDİ verisini yapılandırılmış, makine-okunur (JSON) hâlde döndürür.
 *
 * GİZLİLİK KURALI: yalnızca TALEP EDENİN verisi. Karşı tarafın DM mesajları,
 * başkasının gönderisi vb. DIŞARIDA bırakılır — aksi hâlde bir başkasının kişisel
 * verisini ifşa etmiş oluruz.
 */
export async function GET() {
  const { me } = await getMe();
  if (!me) return NextResponse.json({ error: 'Giriş yapmalısın.' }, { status: 401 });

  const uid = me.id;

  // Tablo yoksa / hata olursa dışa aktarımı KOMPLE düşürme — o bölümü işaretle, devam et.
  const grab = async (table: string, filter: (q: any) => any) => {
    try {
      const { data, error } = await filter(db.from(table).select('*'));
      if (error) return { _alinamadi: error.message };
      return data ?? [];
    } catch (e: any) {
      return { _alinamadi: String(e?.message ?? e) };
    }
  };

  const byUser = (col: string) => (q: any) => q.eq(col, uid);
  const byEither = (a: string, b: string) => (q: any) => q.or(`${a}.eq.${uid},${b}.eq.${uid}`);

  const [
    profil, gonderiler, eskiPostlar, hikayeler, makaleler,
    yorumlar, makaleYorumlari,
    begeniler, eskiBegeniler, repostlar, eskiRepostlar,
    kaydedilenler, makaleKaydedilenler,
    takipler, engeller, bildirimler,
    konusmalar, mesajlar,
    kaydirmalar, eslesmeler,
    gunlukCevaplar, ilerleme, rozetler,
    girisKayitlari, sikayetler,
  ] = await Promise.all([
    // Profil — hassas/iç alanlar hariç, açıkça seçiliyor
    db.from('users')
      .select('id, username, display_name, bio, avatar, gender, birthdate, is_private, is_admin, created_at, terms_accepted_at')
      .eq('id', uid).maybeSingle().then(r => r.data ?? { _alinamadi: r.error?.message }),

    grab('quick_facts', byUser('user_id')),
    grab('posts', byUser('user_id')),
    grab('stories', byUser('user_id')),
    grab('user_articles', byUser('user_id')),

    grab('comments', byUser('user_id')),
    grab('article_comments', byUser('user_id')),

    grab('fact_likes', byUser('user_id')),
    grab('post_likes', byUser('user_id')),
    grab('fact_reposts', byUser('user_id')),
    grab('reposts', byUser('user_id')),

    grab('bookmarks', byUser('user_id')),
    grab('article_saves', byUser('user_id')),

    grab('follows', byEither('follower_id', 'following_id')),
    grab('blocks', byEither('blocker_id', 'blocked_id')),
    grab('notifications', byEither('user_id', 'actor_id')),

    grab('conversations', byEither('user1_id', 'user2_id')),
    // SADECE senin gönderdiğin mesajlar — karşı tarafınkiler onun kişisel verisi.
    grab('messages', byUser('sender_id')),

    grab('swipes', byUser('swiper_id')),
    grab('matches', byEither('user1_id', 'user2_id')),

    grab('daily_answers', byUser('user_id')),
    grab('user_progress', byUser('user_id')),
    grab('user_badges', byUser('user_id')),

    grab('login_events', byUser('user_id')),
    grab('reports', byUser('reporter_id')),
  ]);

  const disaAktarim = {
    _hakkinda: {
      aciklama: 'Basements hesabındaki kişisel verilerinin dışa aktarımı (KVKK m. 11 / GDPR m. 15 ve m. 20).',
      olusturulma: new Date().toISOString(),
      kullanici: me.username,
      not: 'Yalnızca SANA ait veriler yer alır. Özel mesajlarda sadece SENİN gönderdiğin mesajlar bulunur; karşı tarafın mesajları onun kişisel verisi olduğu için dahil edilmemiştir.',
    },
    profil,
    icerik: { gonderiler, eskiPostlar, hikayeler, makaleler },
    etkilesim: {
      yorumlar, makaleYorumlari,
      begeniler, eskiBegeniler, repostlar, eskiRepostlar,
      kaydedilenler, makaleKaydedilenler,
    },
    sosyal: { takipler, engeller, bildirimler },
    mesajlasma: { konusmalar, gonderdigimMesajlar: mesajlar },
    eslestirme: { kaydirmalar, eslesmeler },
    ogrenme: { gunlukCevaplar, ilerleme, rozetler },
    guvenlik: { girisKayitlari, actigimSikayetler: sikayetler },
  };

  const tarih = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(disaAktarim, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="basements-verilerim-${me.username}-${tarih}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
