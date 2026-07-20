import { db, getMe } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const json = (data: object, status = 200) => NextResponse.json(data, { status });

/**
 * Bir öne çıkanın içindeki hikayeler — görüntüleyici (viewer) bunu çeker.
 * GİZLİLİK: hesap gizliyse yalnız sahibi veya takipçisi görebilir (küresel
 * is_private kuralı). Öne çıkan hikayeleri 24 saat sınırını AŞAR (vitrin
 * kalıcıdır) ama gizlilik yine geçerlidir.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const hlId = Number((await params).id);
  if (!Number.isInteger(hlId) || hlId < 1) return json({ error: 'Geçersiz id' }, 400);

  const { data: hl } = await db
    .from('story_highlights')
    .select('id, title, user_id, users!story_highlights_user_id_fkey(is_private)')
    .eq('id', hlId)
    .maybeSingle();
  if (!hl) return json({ error: 'Bulunamadı' }, 404);

  const ownerId = (hl as any).user_id as number;
  const isPrivate = !!(hl as any).users?.is_private;
  if (isPrivate) {
    const { me } = await getMe();
    const isOwner = me?.id === ownerId;
    let allowed = isOwner;
    if (!allowed && me) {
      const { data: f } = await db.from('follows').select('id').eq('follower_id', me.id).eq('following_id', ownerId).maybeSingle();
      allowed = !!f;
    }
    if (!allowed) return json({ error: 'Bu içerik gizli' }, 403);
  }

  const { data: items } = await db
    .from('story_highlight_items')
    .select('position, stories(id, media_url, media_type)')
    .eq('highlight_id', hlId)
    .order('position', { ascending: true });

  const stories = (items ?? [])
    .map((it: any) => it.stories)
    .filter(Boolean)
    .map((s: any) => ({ id: s.id, mediaUrl: s.media_url, mediaType: s.media_type }));

  return json({ title: (hl as any).title, stories });
}

/** Öne çıkanı sil — yalnız sahibi. Öğeler cascade ile gider. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me } = await getMe();
  if (!me) return json({ error: 'Giriş gerekli' }, 401);
  const hlId = Number((await params).id);
  if (!Number.isInteger(hlId) || hlId < 1) return json({ error: 'Geçersiz id' }, 400);

  const { data: hl } = await db.from('story_highlights').select('user_id').eq('id', hlId).maybeSingle();
  if (!hl) return json({ error: 'Bulunamadı' }, 404);
  if ((hl as any).user_id !== me.id) return json({ error: 'Yetki yok' }, 403);

  await db.from('story_highlights').delete().eq('id', hlId);
  return json({ ok: true });
}
