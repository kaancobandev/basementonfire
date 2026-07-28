import { db, getMe, isMissingSchema } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/** Tek kullanicinin acabilecegi koleksiyon sayisi — kotu niyetli dongulere karsi. */
const MAX_COLLECTIONS = 50;
const MAX_NAME = 40;

/**
 * Kayit koleksiyonlari. Tablo sql/features-bookmark-collections.sql
 * calistirilana kadar YOKtur → { available:false } doner, istemci ozelligi
 * hic gostermez (comment_likes deseni: SQL yoksa 500 degil, sessiz uykuda).
 */
export async function GET() {
  const { me } = await getMe();
  if (!me) return json({ available: false, collections: [], uncategorized: 0 });

  const { data, error } = await db
    .from('collections').select('id, name, created_at')
    .eq('user_id', me.id).order('created_at', { ascending: true });
  if (error) return json({ available: false, collections: [], uncategorized: 0 });

  // SAYIMLAR JS'te. `collections` uzerinden `bookmarks(count)` embed'i de
  // calisirdi ama embed'e FK adiyla bagimlilik eklemek istemiyoruz — bookmarks
  // artik users/quick_facts/collections'a giden UC FK tasiyor ve bu tur
  // belirsizlikler daha once yorum listesini komple dusurmustu (PGRST201).
  const { data: bm, error: bmErr } = await db
    .from('bookmarks').select('collection_id').eq('user_id', me.id);
  if (bmErr) return json({ available: false, collections: [], uncategorized: 0 });

  const counts = new Map<number, number>();
  let uncategorized = 0;
  for (const b of (bm ?? []) as { collection_id: number | null }[]) {
    if (b.collection_id == null) uncategorized++;
    else counts.set(b.collection_id, (counts.get(b.collection_id) ?? 0) + 1);
  }

  return json({
    available: true,
    uncategorized,
    collections: (data ?? []).map((c: any) => ({ id: c.id, name: c.name, count: counts.get(c.id) ?? 0 })),
  });
}

export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let body: { name?: string };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }
  const name = String(body.name ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);
  if (!name) return json({ error: 'Koleksiyon adı boş olamaz.' }, 400);

  const { count, error: cErr } = await db
    .from('collections').select('*', { count: 'exact', head: true }).eq('user_id', me.id);
  if (cErr) return json({ available: false });
  if ((count ?? 0) >= MAX_COLLECTIONS) return json({ error: `En fazla ${MAX_COLLECTIONS} koleksiyon oluşturabilirsin.` }, 400);

  const { data, error } = await db
    .from('collections').insert({ user_id: me.id, name }).select('id, name').single();
  if (error) {
    if (error.code === '23505') return json({ error: 'Bu adda bir koleksiyonun zaten var.' }, 409);
    if (isMissingSchema(error)) return json({ available: false });
    return json({ error: 'Koleksiyon oluşturulamadı.' }, 500);
  }
  return json({ available: true, collection: { id: data.id, name: data.name, count: 0 } });
}
