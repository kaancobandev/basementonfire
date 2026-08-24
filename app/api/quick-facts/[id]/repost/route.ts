import { db, getMe } from '@/lib/supabase/server';
import { canViewFact } from '@/lib/visibility';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

// Akış gönderisini (quick_facts) yeniden paylaş (repost) — profil "Reposts"
// sekmesinde görünür. fact_likes gibi composite PK (user_id, fact_id) tablosu.

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const factId = Number(id);
  if (!factId) return json({ reposted: false });

  const { me } = await getMe();
  if (!me) return json({ reposted: false });

  const { data } = await db.from('fact_reposts').select('fact_id').eq('user_id', me.id).eq('fact_id', factId).maybeSingle();
  return json({ reposted: !!data });
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const factId = Number(id);
  if (!factId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { data: existing } = await db.from('fact_reposts').select('fact_id').eq('user_id', me.id).eq('fact_id', factId).maybeSingle();

  // Geri alma kapısız (erişimini kaybeden eski repostunu kaldırabilmeli).
  if (existing) {
    await db.from('fact_reposts').delete().eq('user_id', me.id).eq('fact_id', factId);
    return json({ reposted: false });
  }

  /* 🚨 GÖRÜNÜRLÜK KAPISI — 23.08.2026 denetimi. Bu uç yer imi ucunun ikiziydi:
     yalnız "giriş yapmış mı" bakıyordu, `db` service-role olduğu için RLS de
     korumuyordu. Herhangi bir üye ardışık id'leri deneyerek GİZLİ bir hesabın
     gönderisini repostlayabiliyor, sonra kendi profilindeki "Repostlar"
     sekmesinde medyasını ve caption'ını okuyabiliyordu — üstelik o gönderi
     saldırganın profilinde repost olarak da duruyordu.
     404 (403 değil): "var ama göremiyorsun" demek id aralığını doğrulardı. */
  if (!(await canViewFact(factId, me.id)))
    return json({ error: 'Gönderi bulunamadı' }, 404);

  const { error } = await db.from('fact_reposts').insert({ user_id: me.id, fact_id: factId });
  if (error) return json({ error: 'Repost başarısız (fact_reposts tablosu kurulu mu?)' }, 500);
  return json({ reposted: true });
}
