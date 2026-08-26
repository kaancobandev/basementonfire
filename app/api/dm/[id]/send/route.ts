import { db, getMe } from '@/lib/supabase/server';
import { isBlockedBetween } from '@/lib/blocks';
import { imzaHaritasi, adresSec, IMZA } from '@/lib/storyMedia';
import { limit, tooMany } from '@/lib/rateLimit';
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

  // Fren: engel + dm_privacy kapıları vardı ama hız yoktu (bkz. RATE_LIMITS.dm).
  const fren = await limit('dm', req.headers, me.id);
  if (!fren.ok) return tooMany('Çok hızlı mesaj gönderiyorsun, biraz bekle.', fren, 'dm');

  const body = await req.json();
  const content = (body.content ?? '').trim();

  /* MEDYA: istemci dosyayı Storage'a yükleyip yolunu (`${me.id}/...`) yollar.
     Yol bu kullanıcıya ait olmalı (imza route'u 'dm' türünü me.id klasörüne koyar).

     🚨 ARTIK PUBLIC URL ÜRETİLMİYOR — 23.08.2026 güvenlik denetimi.
        Eskiden burada `getPublicUrl(path)` çağrılıyor ve sonuç `media_url`e
        KALICI olarak yazılıyordu. Sitenin en özel yüzeyindeki dosya, adresi
        bilen herkese sonsuza dek açıktı: engel de, dm_privacy de, konuşmanın
        tarafı olmak da hiç sorulmuyordu; mesajı silmek bile dosyayı bırakıyordu.
        Artık YOL saklanır, okuma yüzeyleri kısa ömürlü imzalı URL üretir. */
  let mediaPath: string | null = null;
  let mediaType: string | null = null;
  const path = typeof body.path === 'string' ? body.path : '';
  if (path) {
    if (!path.startsWith(`${me.id}/`)) return json({ error: 'Geçersiz dosya yolu.' }, 400);
    mediaType = body.mediaType === 'video' ? 'video' : 'image';
    mediaPath = path;
  }

  if (content.length > 1000) return json({ error: 'Mesaj 1–1000 karakter olmalı' }, 400);
  if (!content && !mediaPath) return json({ error: 'Mesaj boş olamaz' }, 400);

  const SELECT = 'id, content, sender_id, is_read, created_at, media_path, media_url, media_type';
  const row: Record<string, unknown> = { conversation_id: convId, sender_id: me.id, content };
  if (mediaPath) { row.media_path = mediaPath; row.media_type = mediaType; }

  let { data: msg, error } = await db.from('messages').insert(row).select(SELECT).single();
  /* Medya kolonları sql/features-dm-media.sql + sql/features-dm-private-media.sql
     çalıştırılana kadar YOK olabilir. Metin mesajı yine gitsin diye sade insert'e
     düş; medya mesajı ise net hata döndür (istemci baloncuğu geri alır).
     ⛔ ESKİ PUBLIC YOLA GERİ DÜŞÜLMÜYOR, bilerek: "kolon yoksa public URL yaz"
        demek, kapatılan açığı SESSİZCE geri açmak olurdu. Özellik SQL'e kadar
        uykuda kalır — o an medyalı DM sayısı 0 olduğu için kimse kaybetmiyor. */
  if (error && /media_path|media_url|media_type/i.test(error.message)) {
    if (mediaPath) return json({ error: 'Medya gönderimi henüz etkin değil.' }, 400);
    ({ data: msg, error } = await db.from('messages').insert({ conversation_id: convId, sender_id: me.id, content }).select('id, content, sender_id, is_read, created_at').single());
  }
  if (error || !msg) return json({ error: 'Mesaj gönderilemedi' }, 500);

  await db.from('conversations').update({ last_message_at: msg.created_at }).eq('id', convId);

  // Gönderene dönen satır: yolu İMZALA, `media_path`i istemciye GÖNDERME.
  const { media_path, ...kalan } = msg as Record<string, unknown> & { media_path?: string | null };
  const gorunen = typeof media_path === 'string' && media_path
    ? { ...kalan, media_url: adresSec(media_path, (kalan as any).media_url, await imzaHaritasi([media_path], IMZA.ISTEK, 'dm')) }
    : kalan;

  return json({ message: { ...gorunen, sender: { id: me.id, username: me.username, display_name: me.display_name, avatar: me.avatar } } });
}
