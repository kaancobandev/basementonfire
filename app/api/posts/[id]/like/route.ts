import { db, getMe } from '@/lib/supabase/server';
import { canViewPost } from '@/lib/visibility';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) =>
  NextResponse.json(data, { status });

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  /* 🚨 GÖRÜNÜRLÜK KAPISI — 23.08.2026 denetimi, İKİNCİ TUR.
     Bu uç quick_facts beğeni ucunun `posts` tablosundaki İKİZİ ve aynı hatayı
     taşıyordu: yalnız "giriş yapmış mı" bakıyor, `db` service-role olduğu için
     RLS de korumuyordu. Ölçüldü: `toggle_post_like` canlı ve gizli @osx3452
     hesabının 3 gönderisi ardışık id (4,5,6) üzerinde duruyor → herhangi bir
     üye göremediği gönderiyi beğenip sayacını kirletebiliyordu.

     ⚠ Kapı YALNIZ beğenme yönünde. RPC toggle olduğu için önce mevcut durum
       okunuyor: erişimini sonradan kaybeden (takipten çıkarıldı/engellendi)
       kullanıcı eski beğenisini geri alabilmeli. Yoksa kaldıramadığı bir
       beğeniyle kalırdı — quick-facts tarafında da aynı gerekçe. */
  const { data: mevcut } = await db
    .from('post_likes').select('user_id')
    .eq('user_id', me.id).eq('post_id', postId).maybeSingle();

  // 404 (403 değil): "var ama göremiyorsun" demek id aralığını doğrulardı.
  if (!mevcut && !(await canViewPost(postId, me.id)))
    return json({ error: 'Gönderi bulunamadı' }, 404);

  const { data, error } = await db.rpc('toggle_post_like', { p_user_id: me.id, p_post_id: postId });
  if (error) return json({ error: error.message }, 500);
  return json(data);
}
