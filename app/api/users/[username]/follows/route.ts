import { db, getMe } from '@/lib/supabase/server';
import { canViewOwnerContent } from '@/lib/visibility';
import { getBlockedUserIds, isBlockedBetween } from '@/lib/blocks';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Bir kullanıcının TAKİPÇİ ya da TAKİP EDİLEN listesi (profildeki sayıya tıklayınca).
 * GİZLİLİK KAPISI (fail-closed): gizli hesabın listesi yalnızca SAHİBİ ya da
 * ONAYLI takipçisi tarafından görülebilir → aksi halde { visible:false } döner
 * (istemci "Bu hesap gizli" gösterir; hiçbir isim sızmaz). canViewOwnerContent
 * tek kaynak (public→herkes; değilse owner veya follows'ta kabul edilmiş satır).
 * follows YALNIZ kabul edilmiş takipleri tutar (bekleyenler follow_requests'te),
 * bu yüzden sayı ve liste üyeliği zaten doğru; engelli kullanıcılar süzülür.
 */
export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const type = new URL(req.url).searchParams.get('type') === 'following' ? 'following' : 'followers';

  const { data: target } = await db.from('users').select('id, is_private').eq('username', username).maybeSingle();
  if (!target) return json({ error: 'Kullanıcı bulunamadı' }, 404);

  const { me } = await getMe();

  // Engel ilişkisi VARSA liste yokmuş gibi davran (profilin tamamı zaten gizli).
  if (me && (await isBlockedBetween(me.id, target.id))) return json({ visible: false });
  // Gizlilik: gizli hesabın listesi yalnız sahibi/onaylı takipçisine.
  if (!(await canViewOwnerContent(target.id, target.is_private, me?.id ?? null))) {
    return json({ visible: false });
  }

  // followers → beni FOLLOWING yapanlar (following_id = target); id = follower_id.
  // following → target'ın FOLLOWER olduğu satırlar (follower_id = target); id = following_id.
  const idCol = type === 'followers' ? 'follower_id' : 'following_id';
  const matchCol = type === 'followers' ? 'following_id' : 'follower_id';
  const { data: rows } = await db
    .from('follows')
    .select(`${idCol}, created_at`)
    .eq(matchCol, target.id)
    .order('created_at', { ascending: false })
    .limit(500); // büyüme sigortası; şu an tüm hesaplar bunun çok altında
  const ids = (rows ?? []).map((r: any) => r[idCol] as number);
  if (!ids.length) return json({ visible: true, users: [] });

  const [{ data: users }, myFollowsRes] = await Promise.all([
    db.from('users').select('id, username, display_name, avatar, is_private, is_deleted').in('id', ids),
    me
      ? db.from('follows').select('following_id').eq('follower_id', me.id).in('following_id', ids)
      : Promise.resolve({ data: [] as any[] }),
  ]);
  const iFollow = new Set((myFollowsRes.data ?? []).map((f: any) => f.following_id as number));
  const blocked = me ? await getBlockedUserIds(me.id) : new Set<number>();

  // Sıra: follows'tan gelen (en yeni önce) sıralamayı KORU; silinmiş + engelli süz.
  const byId = new Map((users ?? []).map((u: any) => [u.id as number, u]));
  const out = ids
    .map((id) => byId.get(id))
    .filter((u): u is any => !!u && !u.is_deleted && !blocked.has(u.id))
    .map((u: any) => ({
      id: u.id,
      username: u.username,
      display_name: u.display_name,
      avatar: u.avatar ?? null,
      is_private: !!u.is_private,
      youFollow: iFollow.has(u.id),
      isMe: me?.id === u.id,
    }));

  return json({ visible: true, users: out });
}
