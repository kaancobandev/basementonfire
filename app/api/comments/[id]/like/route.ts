import { db, getMe } from '@/lib/supabase/server';
import { canViewFact } from '@/lib/visibility';
import { limit, tooMany } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Yorum beğenisi toggle — saf junction (comment_likes), RPC yok. Tablo
 * sql/features-comment-likes.sql çalıştırılana kadar YOK olabilir → o hâlde
 * { available:false } döner, istemci sessizce yok sayar (özellik uykuda kalır,
 * yorum kartı kırılmaz).
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const commentId = Number(id);
  if (!commentId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  /* 🚨 GÖRÜNÜRLÜK KAPISI + FREN — 26.08.2026 denetimi.
     Bu uç `getMe()` dışında hiçbir kapı taşımıyordu ve yanıtta o yorumun TAM
     beğeni sayısını veriyordu. Okuma yolu (quick-facts/[id]/comments) ise
     `canViewFact` ile korunuyor → aynı veriye iki yol, biri açık.
     ⚠ Kapı yorumun BAĞLI OLDUĞU gönderiye bakıyor: yorumun kendi görünürlüğü
       yok, sahibi olduğu gönderininki geçerli. */
  const { data: yorum } = await db
    .from('comments').select('post_id').eq('id', commentId).maybeSingle();
  if (!yorum) return json({ error: 'Yorum bulunamadı' }, 404);
  if (!(await canViewFact(yorum.post_id as number, me.id)))
    return json({ error: 'Yorum bulunamadı' }, 404);

  const fren = await limit('comment', req.headers, me.id);
  if (!fren.ok) return tooMany('Çok hızlısın, biraz bekle.', fren, 'comment');

  // Zaten beğenmiş mi? Tablo yoksa bu select hata verir → available:false.
  const { data: existing, error: selErr } = await db
    .from('comment_likes').select('comment_id').eq('user_id', me.id).eq('comment_id', commentId).maybeSingle();
  if (selErr) return json({ available: false });

  let liked: boolean;
  if (existing) {
    const { error } = await db.from('comment_likes').delete().eq('user_id', me.id).eq('comment_id', commentId);
    if (error) return json({ available: false });
    liked = false;
  } else {
    const { error } = await db.from('comment_likes').insert({ user_id: me.id, comment_id: commentId });
    // 23505 = kompozit PK ihlali (yarış: iki istek aynı anda) → beğenilmiş say.
    if (error && error.code !== '23505') return json({ available: false });
    liked = true;
  }

  const { count } = await db
    .from('comment_likes').select('*', { count: 'exact', head: true }).eq('comment_id', commentId);
  return json({ available: true, liked, likes: count ?? 0 });
}
