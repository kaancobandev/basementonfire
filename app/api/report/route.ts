import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

const TARGET_TYPES = new Set(['post', 'comment', 'user', 'article']);
const REASONS = new Set(['spam', 'taciz', 'nefret', 'uygunsuz', 'siddet', 'yanlis_bilgi', 'diger']);

// POST /api/report — içerik/kullanıcı şikayeti. body: { targetType, targetId, reason, note? }
export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  let body: { targetType?: string; targetId?: number | string; reason?: string; note?: string };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  const targetType = String(body.targetType ?? '');
  const targetId = Number(body.targetId);
  const reason = String(body.reason ?? '');
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : null;

  if (!TARGET_TYPES.has(targetType)) return json({ error: 'Geçersiz hedef türü' }, 400);
  if (!Number.isFinite(targetId) || targetId <= 0) return json({ error: 'Geçersiz hedef' }, 400);
  if (!REASONS.has(reason)) return json({ error: 'Geçersiz sebep' }, 400);
  if (targetType === 'user' && targetId === me.id) return json({ error: 'Kendinizi şikayet edemezsiniz' }, 400);

  const { error } = await db.from('reports').insert({
    reporter_id: me.id, target_type: targetType, target_id: targetId, reason, note,
  });

  if (error) {
    if (error.code === '42P01') return json({ error: 'Şikayet henüz aktif değil.' }, 503);
    // uq_reports_once: aynı hedefi ikinci kez şikayet → zaten alındı say (kullanıcıya olumlu dön).
    if (error.code === '23505') return json({ ok: true, already: true });
    return json({ error: 'Şikayet gönderilemedi.' }, 500);
  }

  return json({ ok: true });
}
