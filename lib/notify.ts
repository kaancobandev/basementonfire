import { db } from './supabase/server';

type NotifType = 'follow' | 'comment' | 'like' | 'mention';

interface NotifPayload {
  userId: number;
  actorId: number;
  type: NotifType;
  postId?: number;
  commentId?: number;
  /** Bilgi kartı beğenisi — notifications.dyk_id (migration 2026-07-19). */
  dykId?: number;
}

export async function createNotification(p: NotifPayload) {
  if (p.userId === p.actorId) return;

  // BEĞENİ BİLDİRİMİ — aynı kişi aynı gönderiyi tekrar beğenirse yeni satır
  // değil, mevcut satır tazelenir ("okunmadı"ya döner ve başa gelir).
  //
  // ESKİDEN `upsert({ onConflict: 'user_id,actor_id,post_id' })` idi. PostgREST
  // ON CONFLICT için o kolonlarda gerçek bir UNIQUE kısıt ister; böyle bir kısıt
  // hiç yaratılmamıştı → her çağrı 42P10 ile düşüyordu. supabase-js hata
  // FIRLATMADIĞI ve dönen `error` okunmadığı için hiçbir yerde iz kalmıyordu:
  // beğeni bildirimleri sessizce HİÇ gitmedi. (Ölçüldü 2026-07-18: DB'de
  // başkasının içeriğine 2 beğeni var, 'like' tipinde 0 bildirim.)
  //
  // Kısıtı eklemek DÜZELTME DEĞİL, YENİ HATA olurdu: 'comment' bildirimleri de
  // post_id taşıyor ve düz insert kullanıyor → aynı gönderiye ikinci yorumun
  // bildirimi unique ihlaliyle düşerdi. O yüzden çözüm kodda, şemada değil.
  if (p.type === 'like' && p.postId) {
    const { data: existing } = await db
      .from('notifications')
      .select('id')
      .eq('user_id', p.userId)
      .eq('actor_id', p.actorId)
      .eq('post_id', p.postId)
      .eq('type', 'like')
      .maybeSingle();

    if (existing) {
      await db
        .from('notifications')
        .update({ is_read: false, created_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await db.from('notifications').insert({
        user_id: p.userId,
        actor_id: p.actorId,
        type: 'like',
        post_id: p.postId,
        is_read: false,
      });
    }
    return;
  }

  // Bilgi kartı beğenisi — post_id'li beğeniyle aynı tazeleme deseni
  // (tekrar beğeni yeni satır değil, mevcut satırı okunmadıya döndürür).
  // dyk_id kolonu henüz yoksa insert sessizce düşer (özellik SQL'e kadar uykuda).
  if (p.type === 'like' && p.dykId) {
    const { data: existing } = await db
      .from('notifications')
      .select('id')
      .eq('user_id', p.userId)
      .eq('actor_id', p.actorId)
      .eq('dyk_id', p.dykId)
      .eq('type', 'like')
      .maybeSingle();

    if (existing) {
      await db
        .from('notifications')
        .update({ is_read: false, created_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await db.from('notifications').insert({
        user_id: p.userId,
        actor_id: p.actorId,
        type: 'like',
        dyk_id: p.dykId,
        is_read: false,
      });
    }
    return;
  }

  await db.from('notifications').insert({
    user_id: p.userId,
    actor_id: p.actorId,
    type: p.type,
    post_id: p.postId ?? null,
    comment_id: p.commentId ?? null,
  });
}
