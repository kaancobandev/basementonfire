import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

// POST /api/users/[username]/block — engelle/engeli kaldır (toggle).
// Engellerken: iki yönlü takip ilişkisi de silinir (Instagram deseni).
export async function POST(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { data: target } = await db.from('users').select('id').eq('username', username).single();
  if (!target) return json({ error: 'Kullanıcı bulunamadı' }, 404);
  if (me.id === target.id) return json({ error: 'Kendinizi engelleyemezsiniz' }, 400);

  const { data: existing, error: exErr } = await db
    .from('blocks')
    .select('id')
    .eq('blocker_id', me.id)
    .eq('blocked_id', target.id)
    .maybeSingle();

  // Tablo yoksa (SQL çalışmadı) — özelliği uykuda bırak, net hata döndür.
  if (exErr && exErr.code === '42P01') return json({ error: 'Engelleme henüz aktif değil.' }, 503);

  if (existing) {
    await db.from('blocks').delete().eq('blocker_id', me.id).eq('blocked_id', target.id);
    return json({ blocked: false });
  }

  const { error } = await db.from('blocks').insert({ blocker_id: me.id, blocked_id: target.id });
  if (error) return json({ error: 'Engellenemedi.' }, 500);

  // Engellenince iki yöndeki takip de kaldırılır.
  await db.from('follows').delete()
    .or(`and(follower_id.eq.${me.id},following_id.eq.${target.id}),and(follower_id.eq.${target.id},following_id.eq.${me.id})`);

  return json({ blocked: true });
}
