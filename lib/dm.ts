import { db } from './supabase/server';

/** Sohbetteki karşı tarafın mesajlarını okundu işaretler.
 *  İki uç paylaşıyor: mesajları getiren GET ve yalnız-okundu işaretleyen POST /read. */
export async function markConversationRead(convId: number, meId: number) {
  await db
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', convId)
    .neq('sender_id', meId)
    .eq('is_read', false);
}

/** Sohbet `meId`'e ait mi? Değilse null döner (403 için). */
export async function getOwnConversation(convId: number, meId: number) {
  const { data: conv } = await db
    .from('conversations')
    .select('id, user1_id, user2_id')
    .eq('id', convId)
    .single();
  if (!conv || (conv.user1_id !== meId && conv.user2_id !== meId)) return null;
  return conv;
}
