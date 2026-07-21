import { db, logIfError } from './supabase/server';

const PUBLIC_PREFIX = '/storage/v1/object/public/media/';

/** Public bir Supabase URL'inden `media` bucket'ındaki dosya yolunu çıkarır. */
function mediaPath(url: unknown): string | null {
  if (typeof url !== 'string' || !url.includes(PUBLIC_PREFIX)) return null;
  const p = url.split(PUBLIC_PREFIX)[1];
  return p ? p.split('?')[0] : null;
}

/**
 * Hesabı ANINDA ve KALICI olarak siler. Geri dönüşü YOKTUR.
 * (Geri alma süresi / zamanlayıcı bilinçli olarak yok — bkz. sql/features-account-delete.sql)
 *
 * NEDEN satırı silmiyoruz da ANONİMLEŞTİRİYORUZ:
 *   users'a bağlı 32 FK'nın hepsi CASCADE. users satırını DELETE etmek `conversations`'ı
 *   da uçurur → karşı tarafın KENDİ mesajları da silinirdi (onun kişisel verisi).
 *   Ürün kararı: yalnızca silinen kişinin mesajları gitsin. Bu yüzden satır kalır ama
 *   İÇİNDE HİÇBİR KİŞİSEL VERİ KALMAZ — "Silinmiş kullanıcı" künyesine dönüşür.
 *
 * Sıra önemli: önce storage yollarını OKU (satırlar dururken), sonra sil.
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
    if (Array.isArray(f.media)) for (const m of f.media) add(m?.url); // media jsonb: [{url,type,w,h}]
  }
  for (const p of postsRes.data ?? []) add(p.image_url);
  for (const s of storiesRes.data ?? []) add(s.media_url);
  for (const a of articlesRes.data ?? []) add(a.cover_url);

  // Arşiv AYRI (private) bucket.
  const archiveFiles = (archiveRes.data ?? [])
    .map(r => r.archive_path)
    .filter((p): p is string => typeof p === 'string' && p.length > 0);

  // — 1) Storage: dosyaları sil. DB cascade'i storage'a DOKUNMAZ → bunu yapmazsak
  //      fotoğraflar silinmeden public URL'de erişilebilir kalır (ciddi açık).
  if (mediaFiles.size > 0) {
    const { error } = await db.storage.from('media').remove([...mediaFiles]);
    logIfError('purge: media storage remove', error);
  }
  if (archiveFiles.length > 0) {
    const { error } = await db.storage.from('archive').remove(archiveFiles);
    logIfError('purge: archive storage remove', error);
  }

  // — 2) users'a FK'sı OLMAYAN tablo → cascade etmez, elle sil —
  logIfError('purge: deleted_media', (await db.from('deleted_media').delete().eq('user_id', userId)).error);

  // — 3) Kişisel veri / içerik satırları. users satırını SİLMEDİĞİMİZ için cascade
  //      çalışmaz → hepsini elle siliyoruz.
  //      (quick_facts silinince ONA bağlı fact_likes/comments/bookmarks CASCADE gider.)
  const tekKolon: Array<[string, string]> = [
    ['quick_facts', 'user_id'],
    ['posts', 'user_id'],
    ['stories', 'user_id'],
    // story_highlight_items, stories/highlights silinince CASCADE gider; koleksiyon
    // satırının kendisi user_id'li olduğu için elle. (Tablo yoksa hata loglanır, zararsız.)
    ['story_highlights', 'user_id'],
    // Yakın arkadaşlar: HEM benim listem (user_id) HEM beni ekleyenler (friend_id).
    ['close_friends', 'user_id'],
    ['close_friends', 'friend_id'],
    // Takip istekleri: HEM gönderdiklerim (requester_id) HEM bana gelenler (target_id).
    ['follow_requests', 'requester_id'],
    ['follow_requests', 'target_id'],
    ['user_articles', 'user_id'],
    ['comments', 'user_id'],
    ['article_comments', 'user_id'],
    ['messages', 'sender_id'],   // ← YALNIZ kendi mesajları (karşı tarafınki kalır)
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

  // İki kullanıcı kolonu olanlar (her iki yönü de)
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
  // did_you_know / youtube_items / spotify_playlists de bırakılıyor: bunlar SİTE içeriği,
  // artık kişisel veri içermeyen anonim künyeye işaret ediyorlar.

  // — 4) users satırını ANONİMLEŞTİR (SİLME! konuşmalar ayakta kalmalı) —
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
      // künye akış/keşif/eşleştirme havuzlarına düşmez. Emniyet kemeri.
      is_private: true,
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
