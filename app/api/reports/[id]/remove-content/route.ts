import { db, getMe, isAdmin } from '@/lib/supabase/server';
import { archiveAndDeleteFact } from '@/lib/deleteFact';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

// POST /api/reports/[id]/remove-content — şikayet edilen içeriği admin olarak sil.
// Sadece silinebilir türler: post (quick_facts), comment, article_comment.
// Silince şikayet 'reviewed' olur. Yalnız admin.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);
  if (!isAdmin(me as any)) return json({ error: 'Yetkin yok' }, 403);

  const id = Number((await params).id);
  if (!Number.isFinite(id) || id <= 0) return json({ error: 'Geçersiz id' }, 400);

  const { data: rep, error: repErr } = await db
    .from('reports')
    .select('target_type, target_id')
    .eq('id', id)
    .single();
  if (repErr && repErr.code === '42P01') return json({ error: 'Şikayet tablosu yok.' }, 503);
  if (!rep) return json({ error: 'Şikayet bulunamadı' }, 404);

  const t = rep.target_type as string;
  const tid = Number(rep.target_id);
  if (!Number.isFinite(tid) || tid <= 0) return json({ error: 'Geçersiz hedef' }, 400);

  if (t === 'post') {
    const { data: fact } = await db.from('quick_facts').select('*').eq('id', tid).single();
    if (fact) {
      const res = await archiveAndDeleteFact(fact);
      if (!res.ok) return json({ error: res.error ?? 'Silinemedi' }, 500);
    }
    // fact yoksa: zaten silinmiş → sorun değil, şikayeti kapat.
  } else if (t === 'comment') {
    await db.from('comments').delete().eq('parent_id', tid); // yanıtları da sil
    const { error } = await db.from('comments').delete().eq('id', tid);
    if (error) return json({ error: 'Yorum silinemedi' }, 500);
  } else if (t === 'article_comment') {
    const { error } = await db.from('article_comments').delete().eq('id', tid);
    if (error) return json({ error: 'Yorum silinemedi' }, 500);
  } else {
    return json({ error: 'Bu tür için silme desteklenmiyor' }, 400);
  }

  // Aynı hedefi işaret eden AÇIK şikayetlerin tümünü kapat (içerik artık yok).
  await db.from('reports').update({ status: 'reviewed' })
    .eq('target_type', t).eq('target_id', tid).eq('status', 'open');

  return json({ ok: true });
}
