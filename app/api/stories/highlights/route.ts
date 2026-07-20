import { db, getMe } from '@/lib/supabase/server';
import { getHighlights } from '@/lib/storyHighlights';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/** Bir kullanıcının öne çıkanları. ?userId=… yoksa isteği yapanın kendisi. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('userId');
  let userId = q ? Number(q) : NaN;
  if (!Number.isInteger(userId)) {
    const { me } = await getMe();
    if (!me) return json({ highlights: [] });
    userId = me.id;
  }
  return json({ highlights: await getHighlights(userId) });
}

/** Öne çıkan oluştur: seçili (kendi) hikayelerden başlıklı bir vitrin. */
export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let body: { title?: string; storyIds?: number[] };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  const title = (body.title ?? '').trim();
  if (!title || title.length > 40) return json({ error: 'Başlık 1–40 karakter olmalı' }, 400);

  const ids = Array.isArray(body.storyIds) ? [...new Set(body.storyIds.filter((n) => Number.isInteger(n)))] : [];
  if (!ids.length) return json({ error: 'En az bir hikaye seç' }, 400);
  if (ids.length > 50) return json({ error: 'En fazla 50 hikaye' }, 400);

  // Seçilen hikayeler GERÇEKTEN bu kullanıcıya ait olmalı — istemciye güvenme.
  const { data: owned } = await db.from('stories').select('id, media_url, created_at').eq('user_id', me.id).in('id', ids);
  const ownedIds = (owned ?? []).map((s: any) => s.id);
  if (!ownedIds.length) return json({ error: 'Geçerli hikaye yok' }, 400);

  // Kapak = en eski seçilen hikayenin görseli (kronolojik ilk kare).
  const sorted = [...(owned ?? [])].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const cover = sorted[0]?.media_url ?? null;

  const { data: hl, error } = await db
    .from('story_highlights')
    .insert({ user_id: me.id, title, cover_url: cover })
    .select('id')
    .single();
  // Tablo yoksa (SQL çalışmadıysa) sessiz 503 — istemci "özellik hazır değil" der.
  if (error || !hl) return json({ error: 'Öne çıkanlar henüz etkin değil.' }, 503);

  const items = ownedIds.map((sid: number, i: number) => ({ highlight_id: hl.id, story_id: sid, position: i }));
  const { error: itErr } = await db.from('story_highlight_items').insert(items);
  if (itErr) {
    await db.from('story_highlights').delete().eq('id', hl.id); // yarım kayıt bırakma
    return json({ error: 'Öne çıkan oluşturulamadı.' }, 500);
  }
  return json({ id: hl.id }, 201);
}
