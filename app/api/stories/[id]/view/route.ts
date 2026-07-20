import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isBlockedBetween } from '@/lib/blocks';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Hikaye görüntülenmesi + görüntüleyen listesi.
 * Hikaye atan kullanıcı şu ana kadar SIFIR geri bildirim alıyordu (kaç kişi
 * gördü belli değildi) — üretimi öldüren klasik eksik.
 *
 * POST: görüntüleyici işaretler (fire-and-forget beacon; sahibi kendini saymaz).
 * GET : YALNIZ hikaye sahibi görüntüleyen listesini alır.
 * story_views tablosu yoksa (SQL çalışmadıysa) iki uç da sessizce boş döner.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me } = await getMe();
  if (!me) return json({ ok: false }); // anonim izleyici sayılmaz (hata da değil)

  const storyId = Number((await params).id);
  if (!Number.isInteger(storyId) || storyId < 1) return json({ error: 'Geçersiz id' }, 400);

  const { data: story } = await db.from('stories').select('user_id').eq('id', storyId).maybeSingle();
  if (!story) return json({ ok: false });
  if (story.user_id === me.id) return json({ ok: true, own: true }); // sahibi kendini saymaz

  const { error } = await db.from('story_views').insert({ story_id: storyId, viewer_id: me.id });
  if (error && error.code !== '23505') return json({ available: false }, 503);
  return json({ ok: true });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me } = await getMe();
  if (!me) return json({ available: false });

  const storyId = Number((await params).id);
  if (!Number.isInteger(storyId) || storyId < 1) return json({ error: 'Geçersiz id' }, 400);

  const { data: story } = await db.from('stories').select('user_id').eq('id', storyId).maybeSingle();
  if (!story) return json({ available: false });
  // Görüntüleyen listesi YALNIZ sahibine (kimin izlediği kişisel bilgi).
  if (story.user_id !== me.id) return json({ available: false });

  const { data: views, error } = await db
    .from('story_views')
    .select('viewer_id, created_at, users!story_views_viewer_id_fkey(username, display_name, avatar)')
    .eq('story_id', storyId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return json({ available: false });

  return json({
    available: true,
    count: views?.length ?? 0,
    viewers: ((views ?? []) as any[]).map((v) => ({
      username: v.users?.username ?? '',
      display_name: v.users?.display_name ?? '',
      avatar: v.users?.avatar ?? null,
    })),
  });
}

/**
 * Hikayeye yanıt → sahibine DM. İki biçim: hızlı emoji tepkisi VEYA serbest metin.
 * dm_privacy + engel kontrolü ikisinde de ŞART (yanıt yolu tepkiyle aynı kapıdan
 * geçer). Mesaj `story_id` taşır ki sohbette "hikayene yanıt" bağlamı gösterilebilsin.
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const storyId = Number((await params).id);
  if (!Number.isInteger(storyId) || storyId < 1) return json({ error: 'Geçersiz id' }, 400);

  let body: { emoji?: string; text?: string };
  try { body = await req.json(); } catch { return json({ error: 'Geçersiz istek' }, 400); }

  // İki mod: emoji tepkisi ya da serbest metin yanıtı. İçerik buradan belirlenir.
  // isReply: yalnız metin yanıtında sohbette "hikayene yanıt" rozeti + önizleme
  // gösterilir. Emoji tepkisinin içeriği zaten "tepki verdi: ❤️" diye kendini
  // anlattığı için ona rozet koymak gereksiz olurdu.
  let content: string;
  let isReply = false;
  if (typeof body.text === 'string' && body.text.trim()) {
    const text = body.text.trim();
    if (text.length > 1000) return json({ error: 'Yanıt en fazla 1000 karakter' }, 400); // messages_content_check ile aynı
    content = text;
    isReply = true;
  } else {
    const emoji = String(body.emoji ?? '');
    const ALLOWED = ['❤️', '🔥', '😮', '👏', '😂'];
    if (!ALLOWED.includes(emoji)) return json({ error: 'Geçersiz tepki' }, 400);
    content = `Hikayene tepki verdi: ${emoji}`;
  }

  const { data: story } = await db.from('stories').select('user_id').eq('id', storyId).maybeSingle();
  if (!story) return json({ error: 'Hikaye bulunamadı' }, 404);
  if (story.user_id === me.id) return json({ error: 'Kendi hikayene yanıt veremezsin' }, 400);

  const targetId = story.user_id as number;
  if (await isBlockedBetween(me.id, targetId)) return json({ error: 'Gönderilemedi' }, 403);

  // DM gizlilik politikası — /api/dm/start ile AYNI kurallar.
  const { data: target } = await db.from('users').select('dm_privacy').eq('id', targetId).single();
  const policy = target?.dm_privacy ?? 'everyone';
  if (policy === 'none') return json({ error: 'Bu kullanıcı mesajlara kapalı' }, 403);
  if (policy === 'followers') {
    const { data: follows } = await db.from('follows').select('id').eq('follower_id', me.id).eq('following_id', targetId).maybeSingle();
    if (!follows) return json({ error: 'Yanıt için bu kişiyi takip etmelisin' }, 403);
  }

  const u1 = Math.min(me.id, targetId);
  const u2 = Math.max(me.id, targetId);
  let convId: number | null = null;
  const { data: existing } = await db.from('conversations').select('id').eq('user1_id', u1).eq('user2_id', u2).maybeSingle();
  if (existing) convId = existing.id;
  else {
    const { data: created } = await db.from('conversations').insert({ user1_id: u1, user2_id: u2 }).select('id').single();
    convId = created?.id ?? null;
  }
  if (!convId) return json({ error: 'Gönderilemedi' }, 500);

  // story_id yalnız METİN yanıtında yazılır (rozet bağlamı). Kolon
  // sql/features-story-highlights-reply.sql çalıştırılana kadar YOKTUR → kolon
  // yoksa story_id'siz tekrar yaz. Yanıt yine gider (yalnız rozet düşer), kırılmaz.
  const base = { conversation_id: convId, sender_id: me.id, content };
  let msgErr;
  if (isReply) {
    ({ error: msgErr } = await db.from('messages').insert({ ...base, story_id: storyId }));
    if (msgErr && /story_id/i.test(msgErr.message)) ({ error: msgErr } = await db.from('messages').insert(base));
  } else {
    ({ error: msgErr } = await db.from('messages').insert(base));
  }
  if (msgErr) return json({ error: 'Gönderilemedi' }, 500);
  await db.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', convId);

  return json({ ok: true });
}
