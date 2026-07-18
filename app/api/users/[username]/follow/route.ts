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
    // Takipten çıkma HER ZAMAN serbest (gizli hesapta da).
    await db.from('follows').delete().eq('follower_id', me.id).eq('following_id', target.id);
  } else {
    // GİZLİ HESAP — GEÇİCİ KORUMA.
    // Bu route hedefin is_private'ını hiç okumuyordu: "Takip Et"e basan herkes
    // anında takipçi oluyordu. Erişim kapısı ise tamamen buna dayanıyor
    // (app/u/[username]/page.tsx: isHidden = is_private && !isFollowing), yani
    // "gizli hesap" pratikte "bir fazladan tık gerektiren açık hesap"tı —
    // kullanıcıya verilen gizlilik sözü karşılıksızdı.
    //
    // Doğru çözüm ONAY AKIŞI: follows'a status (pending/accepted), hedefe
    // bildirim + kabul/red ucu, ve TÜM görünürlük kontrollerine
    // .eq('status','accepted'). Şema + yeni UI istiyor, ayrı iş.
    //
    // O gelene kadar isteği REDDEDİYORUZ. Sessizce otomatik kabul etmekten
    // dürüst: kullanıcı neden erişemediğini görüyor ve gizlilik sözü tutuluyor.
    if (target.is_private) {
      return json({ error: 'Bu hesap gizli. Takip istekleri henüz desteklenmiyor.' }, 403);
    }
    await db.from('follows').insert({ follower_id: me.id, following_id: target.id });
    await createNotification({ userId: target.id, actorId: me.id, type: 'follow' });
  }

  const { count } = await db.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', target.id);
  return json({ following: !existing, followers_count: count ?? 0 });
}
