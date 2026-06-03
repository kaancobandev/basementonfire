import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });
const ALLOWED = ['everyone', 'followers', 'none'];

export async function GET() {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);
  return json({ is_private: me.is_private, dm_privacy: me.dm_privacy, comment_privacy: me.comment_privacy });
}

export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  const updates: Record<string, unknown> = {};
  if (typeof body.is_private === 'boolean')    updates.is_private = body.is_private;
  if (ALLOWED.includes(body.dm_privacy))        updates.dm_privacy = body.dm_privacy;
  if (ALLOWED.includes(body.comment_privacy))   updates.comment_privacy = body.comment_privacy;

  if (!Object.keys(updates).length) return json({ error: 'Güncellenecek alan yok' }, 400);

  const { error } = await db.from('users').update(updates).eq('id', me.id);
  if (error) return json({ error: 'Ayarlar kaydedilemedi' }, 500);
  return json({ ok: true });
}
