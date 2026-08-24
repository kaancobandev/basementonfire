import { db } from './supabase/server';
import { getBlockedUserIds } from './blocks';

// Hikaye kitle kontrolünün TEK KAYNAĞI. Hikayenin başkalarına gösterildiği HER
// yüzey (feed şeridi, /api/stories, highlights görüntüleyici) bunu kullanır —
// service-role RLS'i baypas ettiği için filtre elle konmalı, tek bir yeri
// atlamak sızıntıdır ([[is-private-service-role-filtering]] ile aynı disiplin).
//
// audience kolonu sql/features-story-audience.sql çalıştırılana kadar YOKtur →
// o hâlde hiçbir hikayenin audience'ı olmaz, predicate hepsini 'public' sayar
// (geri uyumlu, kırılmaz).

/**
 * İzleyiciye göre "bu hikayeyi görebilir mi" yordamı döndürür. ÜÇ kural tek
 * yordamda birleşir:
 *  · ENGEL (iki yönlü) → hiçbir şey görünmez.
 *  · Sahibi kendi hikayesini HER ZAMAN görür (gizli hesap olsa bile — Instagram'da
 *    kendi hikayeni hep görürsün; eski `pub` filtresi bunu da gizliyordu = hata).
 *  · Gizli hesabın içeriği yalnız TAKİPÇİLERİne + sahibine görünür.
 *  · Sonra hikaye kitlesi uygulanır: public / followers / close.
 * İzleyicinin takip ettikleri + onu yakın arkadaş ekleyenler + engel kümesi
 * ÖNDEN çekilir (yüzey başına tek tur, üçü paralel).
 * meId null (anonim) → yalnız açık-hesap + public; anonimde engel kavramı yok.
 *
 * 🚨 ENGEL BURAYA 23.08.2026 GÜVENLİK DENETİMİNDE EKLENDİ. Öncesinde engelleme
 * 11 yüzeyde uygulanıyordu (akış, arama, yorum, DM, takip, reels, mentions,
 * hikâye YANITI…) ama hikâyelerin GÖRÜNÜRLÜĞÜNDE hiç yoktu: engellediğin kişi
 * akış şeridinde hikâyeni görmeye, açmaya ve izlemeye devam ediyordu. Engelleme
 * özelliğinin verdiği sözün tam tersi.
 *
 * ⛔ Kuralı çağıran yüzeylere DAĞITMA. Bu dosyanın var oluş sebebi tek kaynak
 *    olması: hikâye 5 ayrı yüzeyde gösteriliyor (akış şeridi, /api/stories,
 *    highlights görüntüleyici, arşiv, anket) ve birini atlamak sızıntıdır.
 *    Engelin burada olması, o beş yüzeyin beşini birden kapatır.
 */
export async function audiencePredicate(
  meId: number | null,
): Promise<(ownerId: number, audience: string | null | undefined, isPrivate?: boolean) => boolean> {
  if (!meId) return (_ownerId, audience, isPrivate) => !isPrivate && (!audience || audience === 'public');

  const [folRes, closeRes, engelli] = await Promise.all([
    db.from('follows').select('following_id').eq('follower_id', meId),
    // Beni yakın arkadaş ekleyenler (friend_id = me → user_id kümesi). Tablo
    // yoksa (SQL çalışmadıysa) hata → boş küme → 'close' hiç eşleşmez (güvenli taraf).
    db.from('close_friends').select('user_id').eq('friend_id', meId),
    // İKİ YÖNLÜ: hem engellediklerim hem beni engelleyenler (lib/blocks.ts).
    // Tablo yoksa boş küme döner — özellik uykudaysa davranış eskisi gibi.
    getBlockedUserIds(meId),
  ]);
  const iFollow = new Set((folRes.data ?? []).map((f: any) => f.following_id as number));
  const closeOfMe = new Set((closeRes.data ?? []).map((c: any) => c.user_id as number));

  return (ownerId, audience, isPrivate) => {
    if (ownerId === meId) return true;                        // kendi hikayem her zaman
    if (engelli.has(ownerId)) return false;                   // engel → her şeyden önce
    if (isPrivate && !iFollow.has(ownerId)) return false;     // gizli hesap: yalnız takipçi
    if (!audience || audience === 'public') return true;
    if (audience === 'followers') return iFollow.has(ownerId);
    if (audience === 'close') return closeOfMe.has(ownerId);
    return false;                                             // bilinmeyen değer → gizle
  };
}
