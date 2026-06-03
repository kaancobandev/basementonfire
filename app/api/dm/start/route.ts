import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let targetId: number;
  try {
    const body = await req.json();
    if (body.userId) {
      targetId = parseInt(body.userId);
    } else if (body.username) {
      const { data: t } = await db.from('users').select('id').eq('username', body.username).single();
      if (!t) return json({ error: 'Kullanıcı bulunamadı' }, 404);
      targetId = t.id;
    } else {
      return json({ error: 'userId veya username gerekli' }, 400);
    }
  } catch { return json({ error: 'Geçersiz istek' }, 400); }

  if (targetId === me.id) return json({ error: 'Kendinize mesaj gönderemezsiniz' }, 400);

  const { data: target } = await db.from('users').select('dm_privacy').eq('id', targetId).single();
  if (target) {
    const policy = target.dm_privacy ?? 'everyone';
    if (policy === 'none') return json({ error: 'Bu kullanıcı mesajlara kapalı' }, 403);
    if (policy === 'followers') {
      const { data: follows } = await db.from('follows').select('id').eq('follower_id', me.id).eq('following_id', targetId).maybeSingle();
      if (!follows) return json({ error: 'Mesaj göndermek için bu kişiyi takip etmelisiniz' }, 403);
    }
  }

  const u1 = Math.min(me.id, targetId);
  const u2 = Math.max(me.id, targetId);

  const { data: existing } = await db.from('conversations').select('id').eq('user1_id', u1).eq('user2_id', u2).single();
  if (existing) return json({ id: existing.id });

  const { data: created, error } = await db.from('conversations').insert({ user1_id: u1, user2_id: u2 }).select('id').single();
  if (error) return json({ error: 'Konuşma başlatılamadı' }, 500);
  return json({ id: created.id });
}
