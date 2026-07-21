import { db, getMe } from '@/lib/supabase/server';
import { createNotification } from '@/lib/notify';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Gelen takip istekleri (target_id = me). follow_requests tablosu yoksa (SQL
 * uykuda) boş liste → inbox hiç görünmez.
 */
export async function GET() {
  const { me } = await getMe();
  if (!me) return json({ requests: [] });

  const { data, error } = await db
    .from('follow_requests')
    .select('requester_id, created_at, users:requester_id(id, username, display_name, avatar)')
    .eq('target_id', me.id)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error || !data) return json({ requests: [] });

  const requests = (data as any[]).map((r) => ({
    id: r.requester_id,
    username: r.users?.username ?? '',
    display_name: r.users?.display_name ?? '',
    avatar: r.users?.avatar ?? null,
    created_at: r.created_at,
  })).filter((r) => r.username);
  return json({ requests });
}

/** İsteği kabul et / reddet. body: { requesterId, action: 'accept'|'reject' }. */
export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let body: { requesterId?: number; action?: string };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }
  const requesterId = Number(body.requesterId);
  if (!Number.isInteger(requesterId) || requesterId < 1) return json({ error: 'Geçersiz kullanıcı' }, 400);
  const action = body.action === 'accept' ? 'accept' : 'reject';

  // İstek GERÇEKTEN bana mı? (requester → me). Yoksa bir şey yapma.
  const { data: reqRow } = await db.from('follow_requests').select('requester_id').eq('requester_id', requesterId).eq('target_id', me.id).maybeSingle();
  if (!reqRow) return json({ error: 'İstek bulunamadı' }, 404);

  if (action === 'accept') {
    // Takibi oluştur → SONRA isteği sil. (Sıra önemli: önce follows yazılır ki
    // kabul kesinleşsin; sonra istek temizlenir.)
    await db.from('follows').insert({ follower_id: requesterId, following_id: me.id });
    await db.from('follow_requests').delete().eq('requester_id', requesterId).eq('target_id', me.id);
    await createNotification({ userId: requesterId, actorId: me.id, type: 'follow_accepted' });
  } else {
    await db.from('follow_requests').delete().eq('requester_id', requesterId).eq('target_id', me.id);
  }
  return json({ ok: true, action });
}
