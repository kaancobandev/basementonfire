import { db, getMe } from '@/lib/supabase/server';
import { createNotification } from '@/lib/notify';
import { isBlockedBetween } from '@/lib/blocks';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function POST(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { data: target } = await db.from('users').select('id, is_private').eq('username', username).single();
  if (!target) return json({ error: 'Hedef kullanıcı bulunamadı' }, 404);
  if (me.id === target.id) return json({ error: 'Kendinizi takip edemezsiniz' }, 400);
  if (await isBlockedBetween(me.id, target.id)) return json({ error: 'Bu kullanıcıyla etkileşemezsiniz' }, 403);

  const { data: existing } = await db.from('follows').select('id').eq('follower_id', me.id).eq('following_id', target.id).single();

  if (existing) {
    // Zaten takipçi → takipten çık (gizli hesapta da HER ZAMAN serbest).
    await db.from('follows').delete().eq('follower_id', me.id).eq('following_id', target.id);
    const { count } = await db.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', target.id);
    return json({ following: false, requested: false, followers_count: count ?? 0 });
  }

  if (target.is_private) {
    // GİZLİ HESAP → doğrudan takip YOK, İSTEK gönderilir (sahibi kabul edene dek
    // takipçi olmaz → hiçbir görünürlük kontrolünü geçmez). İkinci tık = iptal.
    // follow_requests tablosu sql/features-follow-requests.sql çalıştırılana kadar
    // YOK olabilir → o hâlde eski davranışa (istek desteklenmiyor) düş.
    const { data: pending } = await db.from('follow_requests').select('requester_id').eq('requester_id', me.id).eq('target_id', target.id).maybeSingle();
    if (pending) {
      await db.from('follow_requests').delete().eq('requester_id', me.id).eq('target_id', target.id);
      return json({ following: false, requested: false });
    }
    const { error } = await db.from('follow_requests').insert({ requester_id: me.id, target_id: target.id });
    if (error) {
      if (/follow_requests/i.test(error.message)) return json({ error: 'Bu hesap gizli. Takip istekleri henüz desteklenmiyor.' }, 403);
      return json({ error: 'İstek gönderilemedi.' }, 500);
    }
    await createNotification({ userId: target.id, actorId: me.id, type: 'follow_request' });
    return json({ following: false, requested: true });
  }

  // AÇIK HESAP → anında takip.
  await db.from('follows').insert({ follower_id: me.id, following_id: target.id });
  await createNotification({ userId: target.id, actorId: me.id, type: 'follow' });
  const { count } = await db.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', target.id);
  return json({ following: true, requested: false, followers_count: count ?? 0 });
}
