import { db, getMe } from '@/lib/supabase/server';
import { canViewPost } from '@/lib/visibility';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  /* 🚨 GÖRÜNÜRLÜK KAPISI — 23.08.2026 denetimi, İKİNCİ TUR.
     `fact_reposts` ucunda kapatılan sızıntının `reposts` tablosundaki AYNISI:
     kapı yoktu, `db` service-role RLS'i baypas ediyor, `posts.id` ardışık.
     Herhangi bir üye gizli bir hesabın gönderisini repostlayıp kendi
     profilindeki repost listesinde METNİNİ OKUYABİLİYORDU — takip isteği hiç
     onaylanmadan. Ölçüldü: `toggle_post_repost` ve `reposts` tablosu CANLI,
     gizli @osx3452 hesabının 3 gönderisi hedeflenebilir durumdaydı.

     ⚠ Geri alma kapısız: erişimini sonradan kaybeden kullanıcı eski repostunu
       kaldırabilmeli (silme yolları hiçbir zaman kapıya bağlanmaz). */
  const { data: mevcut } = await db
    .from('reposts').select('user_id')
    .eq('user_id', me.id).eq('post_id', postId).maybeSingle();

  if (!mevcut && !(await canViewPost(postId, me.id)))
    return json({ error: 'Gönderi bulunamadı' }, 404);

  const { data, error } = await db.rpc('toggle_post_repost', { p_user_id: me.id, p_post_id: postId });
  if (error) return json({ error: error.message }, 500);
  return json(data);
}
