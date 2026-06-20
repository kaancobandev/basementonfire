import { db, getMe } from '@/lib/supabase/server';
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

  if (existing) {
    await db.from('fact_reposts').delete().eq('user_id', me.id).eq('fact_id', factId);
    return json({ reposted: false });
  }

  const { error } = await db.from('fact_reposts').insert({ user_id: me.id, fact_id: factId });
  if (error) return json({ error: 'Repost başarısız (fact_reposts tablosu kurulu mu?)' }, 500);
  return json({ reposted: true });
}
