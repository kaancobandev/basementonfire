import { db, getMe } from '@/lib/supabase/server';
import { canViewFact } from '@/lib/visibility';
import { createNotification } from '@/lib/notify';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const factId = Number(id);
  if (!factId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  /* 🚨 GÖRÜNÜRLÜK KAPISI — 23.08.2026 denetimi (yer imi/repost ile aynı kök).
     Buradaki zarar içerik sızıntısı değil, İSTENMEYEN TEMAS: görülemeyen bir
     gönderiyi beğenmek gizli hesaba `like` BİLDİRİMİ düşürüyordu, yani takip
     isteği reddedilmiş biri hedefine ardışık id'ler üzerinden bildirim
     yağdırabiliyordu. Beğeni sayısını da kirletiyordu.

     ⚠ Kapı YALNIZCA beğenme yönünde. RPC toggle olduğu için önce mevcut durumu
       okuyoruz: erişimini sonradan kaybeden kullanıcı eski beğenisini geri
       alabilmeli, yoksa kaldıramadığı bir beğeni ile kalır. */
  const { data: mevcut } = await db
    .from('fact_likes').select('user_id')
    .eq('user_id', me.id).eq('fact_id', factId).maybeSingle();

  if (!mevcut && !(await canViewFact(factId, me.id)))
    return json({ error: 'Gönderi bulunamadı' }, 404);

  const { data, error } = await db.rpc('toggle_fact_like', { p_user_id: me.id, p_fact_id: factId });
  if (error) return json({ error: error.message }, 500);

  if (data?.liked) {
    try {
      const { data: post } = await db.from('quick_facts').select('user_id').eq('id', factId).single();
      if (post) await createNotification({ userId: post.user_id, actorId: me.id, type: 'like', postId: factId });
    } catch {}
  }

  return json(data);
}
