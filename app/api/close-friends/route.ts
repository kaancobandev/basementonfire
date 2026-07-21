import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Yakın arkadaş yönetimi. Liste, kullanıcının TAKİP ETTİKLERİdir (aday havuzu),
 * her birinde `close` bayrağı. close_friends tablosu sql/features-story-audience.sql
 * çalıştırılana kadar YOKtur → GET boş `close` seti, POST { available:false } döner.
 */
export async function GET() {
  const { me } = await getMe();
  if (!me) return json({ following: [] });

  const { data: fol } = await db.from('follows').select('following_id').eq('follower_id', me.id).limit(500);
  const ids = (fol ?? []).map((f: any) => f.following_id as number);
  if (!ids.length) return json({ following: [] });

  const [{ data: users }, closeRes] = await Promise.all([
    db.from('users').select('id, username, display_name, avatar').in('id', ids),
    db.from('close_friends').select('friend_id').eq('user_id', me.id),
  ]);
  const closeSet = new Set((closeRes.data ?? []).map((c: any) => c.friend_id as number));
  const following = (users ?? []).map((u: any) => ({
    id: u.id, username: u.username, display_name: u.display_name, avatar: u.avatar ?? null, close: closeSet.has(u.id),
  }));
  // En yakın (işaretli) üste
  following.sort((a: any, b: any) => Number(b.close) - Number(a.close));
  return json({ following });
}

/** Yakın arkadaş ekle/çıkar. body: { friendId, close }. */
export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let body: { friendId?: number; close?: boolean };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }
  const friendId = Number(body.friendId);
  if (!Number.isInteger(friendId) || friendId < 1 || friendId === me.id) return json({ error: 'Geçersiz kullanıcı' }, 400);

  if (body.close) {
    const { error } = await db.from('close_friends').upsert({ user_id: me.id, friend_id: friendId }, { onConflict: 'user_id,friend_id' });
    if (error) return json({ error: 'Yakın arkadaşlar henüz etkin değil.' }, 503);
  } else {
    const { error } = await db.from('close_friends').delete().eq('user_id', me.id).eq('friend_id', friendId);
    if (error) return json({ error: 'Yakın arkadaşlar henüz etkin değil.' }, 503);
  }
  return json({ ok: true, close: !!body.close });
}
