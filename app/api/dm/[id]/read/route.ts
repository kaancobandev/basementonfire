import { getMe } from '@/lib/supabase/server';
import { getOwnConversation, markConversationRead } from '@/lib/dm';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Yalnızca okundu işaretler — mesaj GÖVDESİ taşımaz.
 *
 * Neden var: MessagesClient realtime handler'ı her gelen mesajda
 * `/api/dm/<id>/messages` çağırıp yanıtı ÇÖPE atıyordu; tek amacı o route'un
 * içindeki is_read yan etkisiydi. Yani aktif bir sohbette her mesaj, tüm
 * geçmişi (gönderen embed'leriyle) bir kez daha indiriyordu → trafik oturum
 * başına karesel büyüyordu. Artık istemci bu ucu çağırıyor.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const convId = Number(id);
  if (!convId) return json({ error: 'Geçersiz id' }, 400);

  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);

  if (!(await getOwnConversation(convId, me.id))) return json({ error: 'Erişim reddedildi' }, 403);

  await markConversationRead(convId, me.id);
  return json({ ok: true });
}
