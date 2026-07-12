import { db, getMe, isAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

const ACTIONS = new Set(['reviewed', 'dismissed', 'open']);

// POST /api/reports/[id]/moderate — şikayet durumunu güncelle (yalnız admin).
// body: { action: 'reviewed' | 'dismissed' | 'open' }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);
  if (!isAdmin(me as any)) return json({ error: 'Yetkin yok' }, 403);

  const id = Number((await params).id);
  if (!Number.isFinite(id) || id <= 0) return json({ error: 'Geçersiz id' }, 400);

  let body: { action?: string };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }
  const action = String(body.action ?? '');
  if (!ACTIONS.has(action)) return json({ error: 'Geçersiz işlem' }, 400);

  const { error } = await db.from('reports').update({ status: action }).eq('id', id);
  if (error) {
    if (error.code === '42P01') return json({ error: 'Şikayet tablosu yok.' }, 503);
    return json({ error: 'Güncellenemedi.' }, 500);
  }

  return json({ ok: true, status: action });
}
