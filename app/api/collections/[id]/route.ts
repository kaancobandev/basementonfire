import { db, getMe, isMissingSchema } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });
const MAX_NAME = 40;

/** Koleksiyonu yeniden adlandir. Yalnizca SAHIBI (user_id filtresi zorunlu). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cid = Number(id);
  if (!cid) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let body: { name?: string };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }
  const name = String(body.name ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);
  if (!name) return json({ error: 'Koleksiyon adı boş olamaz.' }, 400);

  const { data, error } = await db
    .from('collections').update({ name })
    .eq('id', cid).eq('user_id', me.id)   // sahiplik: baskasinin koleksiyonu güncellenemez
    .select('id, name').maybeSingle();
  if (error) {
    if (error.code === '23505') return json({ error: 'Bu adda bir koleksiyonun zaten var.' }, 409);
    if (isMissingSchema(error)) return json({ available: false });
    return json({ error: 'Değiştirilemedi.' }, 500);
  }
  if (!data) return json({ error: 'Koleksiyon bulunamadı.' }, 404);
  return json({ available: true, collection: { id: data.id, name: data.name } });
}

/**
 * Koleksiyonu sil. Icindeki KAYITLAR SILINMEZ — SQL'deki
 * `on delete set null` sayesinde kategorisiz ("Tümü") duruma dönerler.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cid = Number(id);
  if (!cid) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { error } = await db.from('collections').delete().eq('id', cid).eq('user_id', me.id);
  if (error) {
    if (isMissingSchema(error)) return json({ available: false });
    return json({ error: 'Silinemedi.' }, 500);
  }
  return json({ available: true, ok: true });
}
