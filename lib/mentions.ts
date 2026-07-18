import { db } from './supabase/server';
import { isBlockedBetween } from './blocks';
import { createNotification } from './notify';

// @mention boru hattı — 'mention' bildirim tipi şemada ve UI'da baştan beri
// tanımlıydı (notifications type check + bildirim sayfası ikonu/metni) ama onu
// ÜRETEN kod yoktu. Caption render'ı @adi'yi zaten /u/adi linkine çeviriyor;
// burası eksik kalan yarı: içerik oluşturulurken bahsedilenlere bildirim atmak.

// Kullanıcı adı kuralıyla birebir (kayıt: 3-30, küçük harf + rakam + alt çizgi).
const MENTION_RE = /@([a-z0-9_]{3,30})\b/g;

/** Metindeki benzersiz @kullaniciadi'ları (küçük harfe indirilmiş) döndürür. */
export function parseMentions(text: string): string[] {
  const found = new Set<string>();
  for (const m of (text ?? '').toLowerCase().matchAll(MENTION_RE)) found.add(m[1]);
  return [...found];
}

/**
 * Metinde bahsedilen kullanıcılara 'mention' bildirimi atar.
 * - Kendine mention bildirim üretmez (createNotification zaten eler).
 * - Engel varsa (iki yönlü) bildirim GİTMEZ.
 * - postId yalnız quick_facts bağlamında verilmeli (notifications.post_id
 *   quick_facts FK'lı — text post/makale yorumu için verme; bildirim sayfası
 *   linki zaten aktör profiline gider, post_id'siz de tam çalışır).
 * - Hata fırlatmaz: bildirim yan etkidir, içerik oluşturmayı asla düşürmez.
 */
export async function notifyMentions(opts: { actorId: number; text: string; postId?: number; commentId?: number }): Promise<void> {
  try {
    // Tavan: tek içerikte en fazla 10 farklı kişi — spam/flood freni.
    const usernames = parseMentions(opts.text).slice(0, 10);
    if (!usernames.length) return;

    const { data: users } = await db
      .from('users')
      .select('id, username')
      .in('username', usernames)
      .eq('is_deleted', false);
    if (!users?.length) return;

    await Promise.all(
      (users as { id: number; username: string }[]).map(async (u) => {
        if (u.id === opts.actorId) return;
        if (await isBlockedBetween(opts.actorId, u.id)) return;
        await createNotification({ userId: u.id, actorId: opts.actorId, type: 'mention', postId: opts.postId, commentId: opts.commentId });
      }),
    );
  } catch {
    // sessiz: mention bildirimi best-effort
  }
}
