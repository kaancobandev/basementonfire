import { db, getMe } from '@/lib/supabase/server';
import { isBlockedBetween } from '@/lib/blocks';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const convId = Number(id);
  if (!convId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { data: conv } = await db.from('conversations').select('id, user1_id, user2_id').eq('id', convId).single();
  if (!conv || (conv.user1_id !== me.id && conv.user2_id !== me.id)) return json({ error: 'Erişim reddedildi' }, 403);

  // Var olan sohbette bile: taraflardan biri diğerini engellediyse mesaj gönderilemez.
  const otherId = conv.user1_id === me.id ? conv.user2_id : conv.user1_id;
  if (await isBlockedBetween(me.id, otherId)) return json({ error: 'Bu kullanıcıya mesaj gönderemezsiniz' }, 403);

  const body = await req.json();
  const content = (body.content ?? '').trim();

  // MEDYA: istemci dosyayı Storage'a yükleyip yolunu (`${me.id}/...`) yollar.
  // Yol bu kullanıcıya ait olmalı (imza route'u 'media' türünü me.id klasörüne
  // koyar). Medya varsa metin isteğe bağlı (yalnız-medya mesaj); yoksa metin şart.
  let mediaUrl: string | null = null;
  let mediaType: string | null = null;
  const path = typeof body.path === 'string' ? body.path : '';
  if (path) {
    if (!path.startsWith(`${me.id}/`)) return json({ error: 'Geçersiz dosya yolu.' }, 400);
    mediaType = body.mediaType === 'video' ? 'video' : 'image';
    mediaUrl = db.storage.from('media').getPublicUrl(path).data.publicUrl;
  }

  if (content.length > 1000) return json({ error: 'Mesaj 1–1000 karakter olmalı' }, 400);
  if (!content && !mediaUrl) return json({ error: 'Mesaj boş olamaz' }, 400);

  const SELECT = 'id, content, sender_id, is_read, created_at, media_url, media_type';
  const row: Record<string, unknown> = { conversation_id: convId, sender_id: me.id, content };
  if (mediaUrl) { row.media_url = mediaUrl; row.media_type = mediaType; }

  let { data: msg, error } = await db.from('messages').insert(row).select(SELECT).single();
  // Medya kolonları sql/features-dm-media.sql çalıştırılana kadar YOK olabilir.
  // Metin mesajı yine gitsin diye sade insert'e düş; medya mesajı ise (kolon yok)
  // gönderilemez → net hata döndür (istemci baloncuğu geri alır).
  if (error && /media_url|media_type/i.test(error.message)) {
    if (mediaUrl) return json({ error: 'Medya gönderimi henüz etkin değil.' }, 400);
    ({ data: msg, error } = await db.from('messages').insert({ conversation_id: convId, sender_id: me.id, content }).select('id, content, sender_id, is_read, created_at').single());
  }
  if (error || !msg) return json({ error: 'Mesaj gönderilemedi' }, 500);

  await db.from('conversations').update({ last_message_at: msg.created_at }).eq('id', convId);

  return json({ message: { ...msg, sender: { id: me.id, username: me.username, display_name: me.display_name, avatar: me.avatar } } });
}
