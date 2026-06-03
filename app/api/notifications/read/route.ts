import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const { me } = await getMe();
  if (!me) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 });

  const { error } = await db.from('notifications').update({ is_read: true }).eq('user_id', me.id).eq('is_read', false);
  if (error) return NextResponse.json({ error: 'Güncellenemedi' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
