import { db, logIfError } from './supabase/server';

/** Geri alma süresi. Bu süre dolunca hesap KALICI olarak anonimleştirilir. */
export const GRACE_DAYS = 30;

const PUBLIC_PREFIX = '/storage/v1/object/public/media/';

/** Public bir Supabase URL'inden `media` bucket'ındaki dosya yolunu çıkarır. */
function mediaPath(url: unknown): string | null {
  if (typeof url !== 'string' || !url.includes(PUBLIC_PREFIX)) return null;
  const p = url.split(PUBLIC_PREFIX)[1];
  return p ? p.split('?')[0] : null;
}

/* ─────────────────── 1) Askıya alma (soft delete) ─────────────────── */

/**
 * Silme talebi. Hesabı HEMEN gizler ama veriyi SİLMEZ (30 gün geri alınabilir).
 *
 * Gizleme hilesi: is_private = true. Bu bayrak zaten TÜM küresel yüzeylerde
 * (feed, keşif, arama, hashtag, hikaye, eşleştirme, sitemap...) filtreleniyor →
 * 12 yüzeyi tek tek değiştirmeden, savaşta test edilmiş yolu yeniden kullanıyoruz.
 * Orijinal değeri saklıyoruz ki geri alınca doğru duruma dönsün.
 */
export async function requestDeletion(userId: number): Promise<{ ok: boolean; error?: string }> {
  const { data: u, error: readErr } = await db
    .from('users')
    .select('is_private, is_deleted, deletion_requested_at')
    .eq('id', userId)
    .maybeSingle();

  if (readErr || !u) return { ok: false, error: 'Hesap bulunamadı.' };
  if (u.is_deleted) return { ok: false, error: 'Bu hesap zaten kalıcı olarak silinmiş.' };
  if (u.deletion_requested_at) return { ok: true }; // zaten askıda — idempotent

  const { error } = await db
    .from('users')
    .update({
      deletion_requested_at: new Date().toISOString(),
      is_private_before_delete: u.is_private ?? false,
      is_private: true, // → her küresel yüzeyden anında düşer
    })
    .eq('id', userId);

  if (error) return { ok: false, error: 'Silme talebi kaydedilemedi.' };
  return { ok: true };
}

/** Geri alma — 30 gün dolmadan giriş yapınca. Hesabı eski hâline döndürür. */
export async function restoreAccount(userId: number): Promise<{ ok: boolean; error?: string }> {
  const { data: u, error: readErr } = await db
    .from('users')
    .select('is_private_before_delete, is_deleted, deletion_requested_at')
    .eq('id', userId)
    .maybeSingle();

  if (readErr || !u) return { ok: false, error: 'Hesap bulunamadı.' };
  if (u.is_deleted) return { ok: false, error: 'Bu hesap kalıcı olarak silinmiş, geri alınamaz.' };
  if (!u.deletion_requested_at) return { ok: true }; // zaten aktif

  const { error } = await db
    .from('users')
    .update({
      deletion_requested_at: null,
      is_private: u.is_private_before_delete ?? false, // ESKİ gizlilik ayarına dön
      is_private_before_delete: null,
    })
    .eq('id', userId);

  if (error) return { ok: false, error: 'Hesap geri alınamadı.' };
  return { ok: true };
}

/* ─────────────────── 2) Kalıcı silme (purge) ─────────────────── */

/**
 * KALICI silme — geri dönüşü YOK. 30 gün dolunca cron çağırır.
 *
 * NEDEN "sil" değil "anonimleştir":
 *   users satırını DELETE etmek conversations'ı da CASCADE ile uçurur → karşı tarafın
 *   KENDİ mesajları da silinirdi (onun kişisel verisi!). Ürün kararı: sadece silinen
 *   kişinin mesajları gitsin. Bu yüzden satır kalır ama İÇİNDE HİÇBİR KİŞİSEL VERİ
 *   KALMAZ — "Silinmiş kullanıcı" künyesine dönüşür.
 *
 * Sıra önemli: önce storage (DB'den yolları okuyabilmek için), sonra satırlar.
 */
export async function purgeAccount(userId: number): Promise<{ ok: boolean; error?: string }> {
  // — 0) Silinecek storage dosyalarının yollarını topla (satırları silmeden ÖNCE) —
  const [uRes, factsRes, postsRes, storiesRes, articlesRes, archiveRes] = await Promise.all([
    db.from('users').select('auth_id, avatar').eq('id', userId).maybeSingle(),
    db.from('quick_facts').select('media_url, media').eq('user_id', userId),
    db.from('posts').select('image_url').eq('user_id', userId),
    db.from('stories').select('media_url').eq('user_id', userId),
    db.from('user_articles').select('cover_url').eq('user_id', userId),
    db.from('deleted_media').select('archive_path').eq('user_id', userId),
  ]);

  const mediaFiles = new Set<string>();
  const add = (u: unknown) => { const p = mediaPath(u); if (p) mediaFiles.add(p); };

  add(uRes.data?.avatar);
  for (const f of factsRes.data ?? []) {
    add(f.media_url);
    // `media` jsonb: [{url, type, w, h}, ...]
    if (Array.isArray(f.media)) for (const m of f.media) add(m?.url);
  }
  for (const p of postsRes.data ?? []) add(p.image_url);
  for (const s of storiesRes.data ?? []) add(s.media_url);
  for (const a of articlesRes.data ?? []) add(a.cover_url);

  // Arşiv bucket'ı AYRI (private) — yolları oradan silinecek.
  const archiveFiles = (archiveRes.data ?? [])
    .map(r => r.archive_path)
    .filter((p): p is string => typeof p === 'string' && p.length > 0);

  // — 1) Storage: dosyaları sil (DB cascade'i storage'a DOKUNMAZ; yoksa fotoğraflar
  //      public URL'de erişilebilir kalırdı = ciddi açık) —
  if (mediaFiles.size > 0) {
    const { error } = await db.storage.from('media').remove([...mediaFiles]);
    logIfError('purge: media storage remove', error);
  }
  if (archiveFiles.length > 0) {
    const { error } = await db.storage.from('archive').remove(archiveFiles);
    logIfError('purge: archive storage remove', error);
  }

  // — 2) users'a FK'sı OLMAYAN tablo: cascade etmez, elle sil —
  logIfError('purge: deleted_media', (await db.from('deleted_media').delete().eq('user_id', userId)).error);

  // — 3) Kişisel veri / içerik satırları. users satırını SİLMEDİĞİMİZ için
  //      cascade çalışmaz → hepsini elle siliyoruz.
  //      (quick_facts silinince ONA bağlı fact_likes/comments/bookmarks CASCADE gider.)
  const tekKolon: Array<[string, string]> = [
    ['quick_facts', 'user_id'],      // gönderileri (bağlı beğeni/yorum/kaydetme cascade)
    ['posts', 'user_id'],
    ['stories', 'user_id'],
    ['user_articles', 'user_id'],
    ['comments', 'user_id'],         // başkasının gönderisine yaptığı yorumlar
    ['article_comments', 'user_id'],
    ['messages', 'sender_id'],       // ← YALNIZ kendi mesajları (karşı tarafınki kalır)
    ['fact_likes', 'user_id'],
    ['post_likes', 'user_id'],
    ['fact_reposts', 'user_id'],
    ['reposts', 'user_id'],
    ['bookmarks', 'user_id'],
    ['article_saves', 'user_id'],
    ['daily_answers', 'user_id'],
    ['user_progress', 'user_id'],
    ['user_badges', 'user_id'],
    ['login_events', 'user_id'],
    ['reports', 'reporter_id'],
  ];
  for (const [t, col] of tekKolon) {
    logIfError(`purge: ${t}`, (await db.from(t).delete().eq(col, userId)).error);
  }

  // İki kullanıcı kolonu olanlar (her iki yönü de sil)
  const ciftKolon: Array<[string, string, string]> = [
    ['follows', 'follower_id', 'following_id'],
    ['blocks', 'blocker_id', 'blocked_id'],
    ['notifications', 'user_id', 'actor_id'],
    ['swipes', 'swiper_id', 'target_id'],
    ['matches', 'user1_id', 'user2_id'],
  ];
  for (const [t, a, b] of ciftKolon) {
    logIfError(`purge: ${t}`, (await db.from(t).delete().or(`${a}.eq.${userId},${b}.eq.${userId}`)).error);
  }

  // NOT: conversations KASITLI olarak silinmiyor (karşı taraf mesajlarını korusun).
  // did_you_know / youtube_items / spotify_playlists de bırakılıyor: bunlar SİTE içeriği;
  // artık kişisel veri içermeyen anonim künyeye işaret ediyorlar.

  // — 4) users satırını ANONİMLEŞTİR (silme! konuşmalar ayakta kalmalı) —
  //      auth_id'yi ÖNCE koparıyoruz ki auth kullanıcısını silmek bu satırı düşürmesin.
  const { error: anonErr } = await db
    .from('users')
    .update({
      username: `silinmis_${userId}`,
      display_name: 'Silinmiş kullanıcı',
      email: `silinmis_${userId}@deleted.invalid`,
      avatar: null,
      bio: null,
      birthdate: null,
      gender: null,
      location: null,
      website: null,
      interests: null,
      last_seen_at: null,
      terms_accepted_at: null,
      auth_id: null,
      is_admin: false,
      // is_private = true BIRAKILIYOR: her küresel yüzeyde zaten filtrelenen bayrak →
      // künye (tombstone) akış/keşif/eşleştirme havuzlarına DÜŞMEZ. Emniyet kemeri.
      is_private: true,
      is_private_before_delete: null,
      deletion_requested_at: null,
      is_deleted: true,
    })
    .eq('id', userId);

  if (anonErr) return { ok: false, error: `Anonimleştirilemedi: ${anonErr.message}` };

  // — 5) Supabase Auth kullanıcısını sil (e-posta + şifre orada tutuluyor) —
  const authId = uRes.data?.auth_id;
  if (authId) {
    const { error } = await db.auth.admin.deleteUser(authId);
    logIfError('purge: auth.admin.deleteUser', error);
  }

  return { ok: true };
}

/** 30 günü dolmuş, henüz kalıcı silinmemiş hesapları bulur (cron için). */
export async function findExpiredDeletions(): Promise<number[]> {
  const esik = new Date(Date.now() - GRACE_DAYS * 86400_000).toISOString();
  const { data, error } = await db
    .from('users')
    .select('id')
    .lt('deletion_requested_at', esik)
    .eq('is_deleted', false);

  logIfError('findExpiredDeletions', error);
  return (data ?? []).map(r => r.id as number);
}
