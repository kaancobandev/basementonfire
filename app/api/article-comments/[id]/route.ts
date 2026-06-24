import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

// Kendi makale yorumunu sil. user_id = me.id sarti -> baskasinin yorumu silinemez (IDOR yok).
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cid = Number(id);
  if (!cid) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { error } = await db.from('article_comments').delete().eq('id', cid).eq('user_id', me.id);
  if (error) return json({ error: 'Silinemedi' }, 500);
  return json({ ok: true });
}
