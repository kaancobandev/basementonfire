import { db } from './supabase/server';

// Hikaye kitle kontrolünün TEK KAYNAĞI. Hikayenin başkalarına gösterildiği HER
// yüzey (feed şeridi, /api/stories, highlights görüntüleyici) bunu kullanır —
// service-role RLS'i baypas ettiği için filtre elle konmalı, tek bir yeri
// atlamak sızıntıdır ([[is-private-service-role-filtering]] ile aynı disiplin).
//
// audience kolonu sql/features-story-audience.sql çalıştırılana kadar YOKtur →
// o hâlde hiçbir hikayenin audience'ı olmaz, predicate hepsini 'public' sayar
// (geri uyumlu, kırılmaz).

/**
 * İzleyiciye göre "bu hikayeyi görebilir mi" yordamı döndürür. Hem HESAP gizliliği
 * (is_private) hem HİKAYE kitlesi (audience) tek yordamda birleşir:
 *  · Sahibi kendi hikayesini HER ZAMAN görür (gizli hesap olsa bile — Instagram'da
 *    kendi hikayeni hep görürsün; eski `pub` filtresi bunu da gizliyordu = hata).
 *  · Gizli hesabın içeriği yalnız TAKİPÇİLERİne + sahibine görünür.
 *  · Sonra hikaye kitlesi uygulanır: public / followers / close.
 * İzleyicinin takip ettikleri + onu yakın arkadaş ekleyenler ÖNDEN çekilir
 * (yüzey başına tek sorgu). meId null (anonim) → yalnız açık-hesap + public.
 */
export async function audiencePredicate(
  meId: number | null,
): Promise<(ownerId: number, audience: string | null | undefined, isPrivate?: boolean) => boolean> {
  if (!meId) return (_ownerId, audience, isPrivate) => !isPrivate && (!audience || audience === 'public');

  const [folRes, closeRes] = await Promise.all([
    db.from('follows').select('following_id').eq('follower_id', meId),
    // Beni yakın arkadaş ekleyenler (friend_id = me → user_id kümesi). Tablo
    // yoksa (SQL çalışmadıysa) hata → boş küme → 'close' hiç eşleşmez (güvenli taraf).
    db.from('close_friends').select('user_id').eq('friend_id', meId),
  ]);
  const iFollow = new Set((folRes.data ?? []).map((f: any) => f.following_id as number));
  const closeOfMe = new Set((closeRes.data ?? []).map((c: any) => c.user_id as number));

  return (ownerId, audience, isPrivate) => {
    if (ownerId === meId) return true;                        // kendi hikayem her zaman
    if (isPrivate && !iFollow.has(ownerId)) return false;     // gizli hesap: yalnız takipçi
    if (!audience || audience === 'public') return true;
    if (audience === 'followers') return iFollow.has(ownerId);
    if (audience === 'close') return closeOfMe.has(ownerId);
    return false;                                             // bilinmeyen değer → gizle
  };
}
