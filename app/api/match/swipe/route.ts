import { db, getMe } from '@/lib/supabase/server';
import { MATCH_MIN_AGE, isAtLeast } from '@/lib/age';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

// POST /api/match/swipe — bir adayi begen ('like') ya da gec ('pass').
// Karsi taraf beni daha once begenmisse -> eslesme: DM konusmasi bulunur/acilir
// ve matches satiri yazilir. Donus: { match, conversationId, user }.
export async function POST(req: Request) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  // 18+ KAPISI (kaydıran). Bu route doğrudan çağrılabilir → sayfayı gizlemek yetmez.
  if (!isAtLeast(me.birthdate, MATCH_MIN_AGE))
    return json({ error: `Eşleştirme ${MATCH_MIN_AGE} yaş ve üzeri içindir.` }, 403);

  let targetId: number;
  let direction: string;
  try {
    const body = await req.json();
    targetId = parseInt(body.targetId, 10);
    direction = body.direction;
  } catch {
    return json({ error: 'Geçersiz istek' }, 400);
  }

  if (!targetId || Number.isNaN(targetId)) return json({ error: 'Hedef gerekli' }, 400);
  if (targetId === me.id) return json({ error: 'Kendinizi kaydıramazsınız' }, 400);
  if (direction !== 'like' && direction !== 'pass') return json({ error: 'Geçersiz yön' }, 400);

  // HEDEF de 18+ olmalı. İstemci desteyi baypas edip rastgele bir targetId yollayabilir →
  // 17 yaşındaki birine "like" atılmasını burada engelliyoruz (asıl koruma).
  const { data: target } = await db
    .from('users')
    .select('birthdate, is_deleted')
    .eq('id', targetId)
    .maybeSingle();

  if (!target || target.is_deleted || !isAtLeast(target.birthdate, MATCH_MIN_AGE))
    return json({ error: 'Bu kullanıcı eşleştirmeye uygun değil.' }, 403);

  // Kaydirmayi yaz (tekrar kaydirma -> yonu gunceller).
  const { error: swErr } = await db
    .from('swipes')
    .upsert({ swiper_id: me.id, target_id: targetId, direction }, { onConflict: 'swiper_id,target_id' });
  // Defansif: tablo henuz yoksa (SQL calismadiysa) UI cokmesin — sessizce gec.
  if (swErr) return json({ ok: false, match: false });

  if (direction === 'pass') return json({ ok: true, match: false });

  // Karsi taraf beni begenmis mi?
  const { data: reciprocal } = await db
    .from('swipes')
    .select('id')
    .eq('swiper_id', targetId)
    .eq('target_id', me.id)
    .eq('direction', 'like')
    .maybeSingle();

  if (!reciprocal) return json({ ok: true, match: false });

  // ── Eslesme! DM konusmasini bul/olustur (dm/start ile ayni min/max deseni).
  const u1 = Math.min(me.id, targetId);
  const u2 = Math.max(me.id, targetId);

  let conversationId: number | null = null;
  const { data: existingConv } = await db
    .from('conversations').select('id').eq('user1_id', u1).eq('user2_id', u2).maybeSingle();
  if (existingConv) {
    conversationId = existingConv.id;
  } else {
    const { data: createdConv } = await db
      .from('conversations').insert({ user1_id: u1, user2_id: u2 }).select('id').single();
    conversationId = createdConv?.id ?? null;
  }

  // Eslesme satiri (idempotent — iki taraf ayni anda begenirse de tek satir).
  await db.from('matches').upsert(
    { user1_id: u1, user2_id: u2, conversation_id: conversationId },
    { onConflict: 'user1_id,user2_id' },
  );

  // Kutlama modali icin eslesilen kisinin temel bilgisi.
  const { data: other } = await db
    .from('users').select('id, username, display_name, avatar').eq('id', targetId).single();

  return json({ ok: true, match: true, conversationId, user: other });
}
