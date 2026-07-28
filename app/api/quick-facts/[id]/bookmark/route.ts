import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return json({ bookmarked: false });

  const { me } = await getMe();
  if (!me) return json({ bookmarked: false });

  const { data } = await db.from('bookmarks').select('id').eq('user_id', me.id).eq('post_id', postId).maybeSingle();
  return json({ bookmarked: !!data });
}

/**
 * Kaydin KOLEKSIYONUNU belirle (null = kategorisiz, "Tümü"de kalır).
 * POST'tan ayrı bir metot: POST saf aç/kapa kalsın istedik — koleksiyon
 * seçmek kaydı SİLMEMELİ. Gönderi henüz kayıtlı değilse bu istek onu kaydeder,
 * yani "kaydederken koleksiyona ayır" tek adımda çalışır.
 * Tablo/kolon yoksa (SQL çalışmadı) { available:false } döner → istemci sessiz.
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let body: { collectionId?: number | null };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }
  const raw = body.collectionId;
  const collectionId = raw === null || raw === undefined ? null : Number(raw);
  if (collectionId !== null && !Number.isFinite(collectionId)) return json({ error: 'Geçersiz koleksiyon' }, 400);

  // SAHIPLIK: başkasının koleksiyonuna yazılamaz. (Kayıt satırı benim olsa da
  // collection_id başka kullanıcının koleksiyonunu gösterebilirdi.)
  if (collectionId !== null) {
    const { data: col, error } = await db
      .from('collections').select('id').eq('id', collectionId).eq('user_id', me.id).maybeSingle();
    if (error) return json({ available: false });
    if (!col) return json({ error: 'Koleksiyon bulunamadı' }, 404);
  }

  const { data: existing } = await db.from('bookmarks').select('id').eq('user_id', me.id).eq('post_id', postId).maybeSingle();
  const { error } = existing
    ? await db.from('bookmarks').update({ collection_id: collectionId }).eq('id', existing.id)
    : await db.from('bookmarks').insert({ user_id: me.id, post_id: postId, collection_id: collectionId });
  if (error) return json({ available: false });

  return json({ available: true, bookmarked: true, collectionId });
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { data: existing } = await db.from('bookmarks').select('id').eq('user_id', me.id).eq('post_id', postId).maybeSingle();

  if (existing) {
    await db.from('bookmarks').delete().eq('id', existing.id);
    return json({ bookmarked: false });
  }

  await db.from('bookmarks').insert({ user_id: me.id, post_id: postId });
  return json({ bookmarked: true });
}
