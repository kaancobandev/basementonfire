import { db, getMe, isMissingSchema } from '@/lib/supabase/server';
import { getBlockedUserIds } from '@/lib/blocks';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Tek istekte sorulabilecek kullanıcı sayısı tavanı. */
const TAVAN = 100;

/** Kişiye özel gövde ama HERKESTE AYNI URL (`?u=` aynı adlar) → paylaşımlı bir
 *  önbellek bir kullanıcının listesini başkasına servis edebilirdi.
 *  /api/feed/personal ve /api/nav-state ile aynı desen. */
const BASLIK = { 'Cache-Control': 'private, no-store' };
const bos = () => NextResponse.json({ following: [], requested: [], me: null }, { headers: BASLIK });

/**
 * "Şu kullanıcılardan hangilerini takip ediyorum, hangisi benim?"
 *
 * NEDEN VAR: /discover sayfası ISR (revalidate ile herkese aynı HTML servis
 * edilir), yani sunucu "bu listeyi kim görüyor" bilmiyor ve takip durumunu
 * basamıyor. Bu yüzden DiscoverClient takip durumunu HİÇ bilmiyordu ve zaten
 * takip ettiğin kişilere de "Takip Et" gösteriyordu — basınca takip ucu bir
 * TOGGLE olduğu için kullanıcıyı TAKİPTEN ÇIKARIYORDU (ya da açık hesapta
 * yeniden takip edip karşı tarafa gereksiz bildirim yolluyordu).
 *
 * /api/search aynı bilgiyi zaten döndürüyor ama bir sorgu metni istiyor;
 * ISR listesi için kullanılamaz. Mantık oradan birebir aynadır.
 *
 * GİZLİLİK: yalnızca ÇAĞIRANIN KENDİ takip ilişkisi döner. Başkasının kimi
 * takip ettiği hakkında bilgi vermez, var/yok bilgisi sızdırmaz — sorulmayan
 * kullanıcı yanıtta hiç görünmez. Girişsiz istek boş liste alır.
 *
 * ⚠ `.or()` KULLANMA — /api/search'teki güvenlik notunun aynısı geçerli.
 * `.in()` değerleri parametre olarak geçirir, PostgREST'e ham enjeksiyon olmaz.
 */
export async function GET(req: Request) {
  const ham = (new URL(req.url).searchParams.get('u') ?? '').trim();
  if (!ham) return bos();

  const istenen = [...new Set(
    ham.split(',').map((s) => s.trim()).filter(Boolean)
  )].slice(0, TAVAN);
  if (!istenen.length) return bos();

  const { me } = await getMe();
  if (!me) return bos();

  const { data: hedefler } = await db
    .from('users').select('id, username').in('username', istenen);
  const idler = (hedefler ?? []).map((u: any) => u.id as number);
  if (!idler.length) return NextResponse.json({ following: [], requested: [], me: me.username }, { headers: BASLIK });

  const [takipRes, istekRes, engelli] = await Promise.all([
    db.from('follows').select('following_id').eq('follower_id', me.id).in('following_id', idler),
    // BEKLEYEN İSTEKLER de gerekli: gizli hesapta takip `follows`a DEĞİL
    // `follow_requests`e yazılır. Bunu bilmezsek buton "Takip Et" der ve
    // kullanıcının bir sonraki dokunuşu bekleyen isteği SESSİZCE İPTAL EDER.
    db.from('follow_requests').select('target_id').eq('requester_id', me.id).in('target_id', idler),
    getBlockedUserIds(me.id),
  ]);
  const takipEdilen = new Set<number>((takipRes.data ?? []).map((f: any) => f.following_id as number));
  // Tablo uykudaysa sessizce boş geç — kart/buton kırılmasın.
  const istenmis = new Set<number>(
    istekRes.error && isMissingSchema(istekRes.error)
      ? []
      : (istekRes.data ?? []).map((r: any) => r.target_id as number)
  );

  // Engelli ilişkideki kullanıcıyı "takip ediyorum" diye işaretleme — profil
  // yüzeylerinin geri kalanı da o ilişkiyi yok sayıyor.
  const gorunur = (hedefler ?? []).filter((u: any) => !engelli.has(u.id));
  const following = gorunur.filter((u: any) => takipEdilen.has(u.id)).map((u: any) => u.username as string);
  const requested = gorunur
    .filter((u: any) => !takipEdilen.has(u.id) && istenmis.has(u.id))
    .map((u: any) => u.username as string);

  return NextResponse.json({ following, requested, me: me.username }, { headers: BASLIK });
}
