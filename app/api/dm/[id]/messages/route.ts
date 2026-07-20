import { db, getMe } from '@/lib/supabase/server';
import { markConversationRead } from '@/lib/dm';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const convId = Number(id);
  if (!convId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  const { data: conv } = await db.from('conversations').select('id, user1_id, user2_id').eq('id', convId).single();
  if (!conv || (conv.user1_id !== me.id && conv.user2_id !== me.id)) return json({ error: 'Erişim reddedildi' }, 403);

  // Limitsizdi → uzun bir sohbeti açmak TÜM geçmişi (her satırda gönderen
  // embed'iyle) taşıyordu. En YENİ 500 mesajı çekip ters çeviriyoruz; artan
  // sıralamayla limit koymak en ESKİ 500'ü verirdi (yanlış uç).
  // TODO: 500'ü aşan sohbetler için cursor'lı sayfalama (yukarı kaydırınca yükle).
  // story embed'i yalnız sql/features-story-highlights-reply.sql çalıştırıldıysa
  // vardır (messages.story_id). Önce zenginini dene; kolon/ilişki yoksa sade
  // select'e düş → mevcut DM yüklemesi ASLA kırılmaz, yalnız "hikayeye yanıt"
  // rozeti düşer.
  const BASE = 'id, content, sender_id, is_read, created_at, users:sender_id(id, username, display_name, avatar)';
  // İki select farklı şekil taşıdığı için ortak gevşek tip (aşağıda düz JSON'a gider).
  let { data: messages, error }: { data: any[] | null; error: { message: string } | null } = await db
    .from('messages')
    .select(`${BASE}, story_id, story:stories!messages_story_id_fkey(media_url, media_type)`)
    .eq('conversation_id', convId)
    .order('created_at', { ascending: false })
    .limit(500);
  if (error && /story_id|messages_story_id_fkey|stories/i.test(error.message)) {
    ({ data: messages } = await db
      .from('messages')
      .select(BASE)
      .eq('conversation_id', convId)
      .order('created_at', { ascending: false })
      .limit(500));
  }

  await markConversationRead(convId, me.id);

  // ERKEN UYARI — sayfalama henüz yok. 500'e dayanan bir sohbette eski mesajlar
  // arayüzde GÖRÜNMEZ olur (yukarı kaydırınca yükleme yok). Şu an en uzun sohbet
  // bu sınırın çok altında, o yüzden sayfalama yazmak erken optimizasyon olurdu;
  // ama sessizce veri kaybı gibi görünmesin diye eşiğe yaklaşınca log düşüyoruz.
  // Bu satır fonksiyon loglarında görülürse: cursor'lı sayfalama zamanı gelmiştir.
  if ((messages?.length ?? 0) >= 400) {
    console.warn(`[dm] sohbet ${convId}: ${messages?.length} mesaj — 500 sınırına yaklaşıldı, sayfalama gerekiyor`);
  }

  return json({ messages: (messages ?? []).reverse() });
}
