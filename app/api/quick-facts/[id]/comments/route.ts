import { db, getMe } from '@/lib/supabase/server';
import { getBlockedUserIds } from '@/lib/blocks';
import { canViewFact } from '@/lib/visibility';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!postId) return NextResponse.json({ error: 'Geçersiz id' }, { status: 400 });

  // GÖRÜNÜRLÜK — eskiden bu uç kimlik doğrulaması BİLE yapmıyordu: gizli bir
  // hesabın gönderisinin yorumları (yazan kullanıcı adları dahil) çıkışlı
  // ziyaretçiye açıktı. Gönderiyi görme hakkı yoksa yorumları da görülmez.
  const { me } = await getMe();
  if (!(await canViewFact(postId, me?.id ?? null))) {
    return NextResponse.json({ error: 'Bu gönderiye erişemezsiniz' }, { status: 403 });
  }

  const { data, error } = await db
    .from('comments')
    .select('id, content, created_at, parent_id, user_id, users(username, display_name, avatar)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .limit(300); // limitsizdi: tek gönderiye binlerce yorum gelirse yanıt patlıyordu

  if (error) return NextResponse.json({ error: 'Yorumlar alınamadı' }, { status: 500 });

  // Engellediğim + beni engelleyen kullanıcıların yorumları görünmez (feed/arama deseni).
  const blocked = me ? await getBlockedUserIds(me.id) : new Set<number>();

  const comments = (data ?? [])
    .filter((c: any) => !blocked.has(c.user_id))
    .map((c: any) => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      parent_id: c.parent_id,
      user_id: c.user_id,
      username: c.users?.username ?? '',
      display_name: c.users?.display_name ?? '',
      avatar: c.users?.avatar ?? null,
    }));

  return NextResponse.json({ comments });
}
