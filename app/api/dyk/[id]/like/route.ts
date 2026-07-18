import { db, getMe } from '@/lib/supabase/server';
import { NextResponse, after } from 'next/server';
import { createNotification } from '@/lib/notify';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

// Bilgi kartı beğeni toggle'ı. dyk_likes tablosu yokken (SQL çalışmadan) 503
// döner ve istemci kalbi optimistik durumdan geri alır — kart kırılmaz.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return json({ error: 'Geçersiz id' }, 400);

  const { data: existing, error: exErr } = await db
    .from('dyk_likes').select('dyk_id')
    .eq('user_id', me.id).eq('dyk_id', id).maybeSingle();
  if (exErr) return json({ available: false, error: 'Beğeni henüz hazır değil.' }, 503);

  let liked: boolean;
  if (existing) {
    await db.from('dyk_likes').delete().eq('user_id', me.id).eq('dyk_id', id);
    liked = false;
  } else {
    const { error: insErr } = await db.from('dyk_likes').insert({ user_id: me.id, dyk_id: id });
    if (insErr && insErr.code !== '23505') return json({ error: 'Beğenilemedi' }, 500);
    liked = true;
    // Kart sahibine bildirim — yanıt sonrası, best-effort.
    after(async () => {
      const { data: dyk } = await db.from('did_you_know').select('user_id').eq('id', id).maybeSingle();
      if (dyk?.user_id && dyk.user_id !== me.id) {
        await createNotification({ userId: dyk.user_id, actorId: me.id, type: 'like', dykId: id });
      }
    });
  }

  const { count } = await db
    .from('dyk_likes').select('dyk_id', { count: 'exact', head: true })
    .eq('dyk_id', id);

  return json({ liked, likes: count ?? 0 });
}
