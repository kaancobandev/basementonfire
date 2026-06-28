import { db, getMe, isAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { clampText } from '@/lib/articleSanitize';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/** Onay kuyrugu — yalnizca admin. action: 'approve' | 'reject'. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);
  if (!isAdmin(me as any)) return json({ error: 'Yetkin yok' }, 403);

  const id = Number((await params).id);
  if (!Number.isFinite(id)) return json({ error: 'Geçersiz id' }, 400);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  const { data: existing } = await db.from('user_articles').select('id, status, published_at').eq('id', id).maybeSingle();
  if (!existing) return json({ error: 'Makale bulunamadı' }, 404);

  if (body.action === 'approve') {
    const patch: Record<string, unknown> = { status: 'approved', reject_reason: null };
    if (!existing.published_at) patch.published_at = new Date().toISOString();
    const { error } = await db.from('user_articles').update(patch).eq('id', id);
    if (error) return json({ error: 'Onaylanamadı.' }, 500);
    revalidateTag('feed'); // Keşfet/feed onbellegini tazele -> makale gorunur olsun
    return json({ ok: true, status: 'approved' });
  }

  if (body.action === 'reject') {
    const reason = clampText(body.reason, 300);
    const { error } = await db.from('user_articles').update({ status: 'rejected', reject_reason: reason || null }).eq('id', id);
    if (error) return json({ error: 'Reddedilemedi.' }, 500);
    if (existing.status === 'approved') revalidateTag('feed');
    return json({ ok: true, status: 'rejected' });
  }

  return json({ error: 'Geçersiz işlem' }, 400);
}
