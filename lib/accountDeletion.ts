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
  /* 🚨 23.08.2026 güvenlik denetimi: bu liste EKSİKTİ. DM'de gönderilen medya
     ve makale GÖVDESİNDEKİ görseller hiç toplanmıyordu. Sonuç: kullanıcı
     "hesabımı sil" dedikten sonra `messages` satırı silindiği için dosyaya
     işaret eden hiçbir kayıt kalmıyor, ama dosya `media` bucket'ında (PUBLIC)
     durmaya devam ediyor — yani artık hiçbir moderasyon/erişim kontrolü
     TARAFINDAN GÖRÜLEMEYEN, kalıcı ve herkese açık bir dosya. Arayüz
     "kalıcı olarak silindi" derken bu yanlış beyandı.
     ⚠ Bulunduğunda medyalı DM sayısı 0'dı, yani bugüne kadar sızan dosya yok.
     ⛔ YENİ BİR ÖZELLİK STORAGE'A YAZIYORSA BURAYA DA EKLE. Bu liste elle
        tutuluyor ve her yeni yükleme yüzeyi onu sessizce eskitiyor. */
/**
 * DM medyası — `media_path` kolonu YOKSA `media_url`e düş.
 *
 * 🚨 26.08.2026'da ÖLÇÜLDÜ: `select('media_path, media_url')` kolon yokken 42703
 *    döndürüyor ve supabase-js `data`yı NULL yapıyor → aşağıdaki döngü hiç
 *    çalışmıyor, yani DM medyası HİÇ toplanmıyordu. `media_path`i eklerken bu
 *    dosyanın çözmek için var olduğu artık-dosya sorununu geri getirmişim.
 *    (Kanıt: eski `select('media_url')` aynı anda 13 satır dönüyordu.)
 * ⛔ DERS: bu dosyada "yeni kolonu da seç" yapan her değişiklik, kolon canlıda
 *    YOKKEN sorgunun TAMAMINI düşürür — sessizce ve tam da silme anında.
 */
type DmMedya = { media_path?: string | null; media_url?: string | null };
// Dönüş tipi ELLE: iki dalın satır şekli farklı, TS birleşimi yedek dala daraltıp
// `media_path` erişimini hata yapıyor.
async function dmMedyasiniSec(userId: number): Promise<{ data: DmMedya[] | null }> {
  const r = await db.from('messages').select('media_path, media_url').eq('sender_id', userId);
  if (!r.error) return r;
  return db.from('messages').select('media_url').eq('sender_id', userId);
}

  const [uRes, factsRes, postsRes, storiesRes, articlesRes, archiveRes, dmRes, docRes, muzikRes] = await Promise.all([
    db.from('users').select('auth_id, avatar').eq('id', userId).maybeSingle(),
    db.from('quick_facts').select('media_url, media').eq('user_id', userId),
    db.from('posts').select('image_url').eq('user_id', userId),
    // ⚠ `media_path` ŞART: hikâye dosyaları 23.08.2026'da private `stories`
    //   kovasına taşındı ve `media_url` yeni satırlarda BOŞ. Yalnız media_url
    //   okunursa "hesabımı sil" hikâye dosyalarının HİÇBİRİNİ silmez.
    db.from('stories').select('media_path, media_url').eq('user_id', userId),
    db.from('user_articles').select('cover_url').eq('user_id', userId),
    db.from('deleted_media').select('archive_path').eq('user_id', userId),
    // DM medyası — mesaj satırı aşağıda siliniyor, dosya yetim kalıyordu.
    dmMedyasiniSec(userId),
    // Makale GÖVDESİ: doc bloklarının içindeki görseller (cover_url ayrı).
    db.from('user_articles').select('doc').eq('user_id', userId),
    // Müzik parçaları. Tablo/kolon yoksa hata sessizce yutulur (uykuda özellik).
    db.from('music_tracks').select('storage_path').eq('user_id', userId),
  ]);

  const mediaFiles = new Set<string>();
  const add = (u: unknown) => { const p = mediaPath(u); if (p) mediaFiles.add(p); };

  add(uRes.data?.avatar);
  for (const f of factsRes.data ?? []) {
    add(f.media_url);
    if (Array.isArray(f.media)) for (const m of f.media) add(m?.url); // media jsonb: [{url,type,w,h}]
  }
  for (const p of postsRes.data ?? []) add(p.image_url);
  // Eski (göç edilmemiş) satırlar public `media` kovasında, yenileri private
  // `stories` kovasında → ikisi AYRI listede toplanır, ayrı kovadan silinir.
  const storyFiles = new Set<string>();
  for (const s of storiesRes.data ?? []) {
    add(s.media_url);
    if (typeof s.media_path === 'string' && s.media_path) storyFiles.add(s.media_path);
  }
  for (const a of articlesRes.data ?? []) add(a.cover_url);
  // Eskiler public `media` kovasında, yeniler private `dm` kovasında → ayrı liste.
  const dmFiles = new Set<string>();
  for (const m of dmRes.data ?? []) {
    add(m.media_url);
    if (typeof m.media_path === 'string' && m.media_path) dmFiles.add(m.media_path);
  }

  // Makale gövdesi: doc bir blok dizisi; görsel bloklarının `url`'i toplanır.
  // Şema değişse bile patlamasın diye tip kontrolü gevşek tutuldu.
  for (const a of docRes.data ?? []) {
    const bloklar = (a as { doc?: unknown }).doc;
    if (!Array.isArray(bloklar)) continue;
    for (const b of bloklar) add((b as { url?: unknown } | null)?.url);
  }

  // music_tracks.storage_path public URL DEĞİL, doğrudan bucket yolu →
  // mediaPath()'ten geçmez, listeye olduğu gibi girer.
  for (const t of muzikRes.data ?? []) {
    const p = (t as { storage_path?: unknown }).storage_path;
    if (typeof p === 'string' && p.length > 0) mediaFiles.add(p);
  }

  // Arşiv AYRI (private) bucket.
  const archiveFiles = (archiveRes.data ?? [])
    .map(r => r.archive_path)
    .filter((p): p is string => typeof p === 'string' && p.length > 0);

  // — 1) Storage: dosyaları sil. DB cascade'i storage'a DOKUNMAZ → bunu yapmazsak
  //      fotoğraflar silinmeden public URL'de erişilebilir kalır (ciddi açık).
  /* 🚨 SAHİPLİK SÜZGECİ — 26.08.2026 denetimi (KRİTİK, ÇAPRAZ KULLANICI YIKIM).
     Yukarıdaki listenin bir kısmı KULLANICININ YAZDIĞI URL'lerden geliyor:
     `user_articles.cover_url` ve makale gövdesindeki görsel blokları. O URL'ler
     yalnızca `isAllowedMediaUrl` ile (yani "bizim depomuz mu" diye) süzülüyor,
     SAHİPLİK sorulmuyor. Sonuç: bir üye kendi makalesinin kapağına BAŞKASININ
     dosya adresini yazar, sonra kendi hesabını siler, ve `remove()` kurbanın
     dosyasını kalıcı olarak siler. `media` kovası public ve `/u/<ad>` anonim
     200 döndüğü için hedef adresleri toplamak tahmin bile gerektirmiyor.

     Kapı YAZMA tarafına değil SİLME tarafına konuldu, bilerek: mevcut satırları
     da kapsar ve ileride doc'a yabancı URL yazan BAŞKA bir yüzey açılsa da korur.

     ⚠ ÖLÇÜLDÜ (canlı veri, 26.08.2026): meşru yolların TAMAMI bu iki şekle uyuyor
       — 4 avatar, 12 gönderi medyası, 38 jsonb medya girdisi, 19 müzik dosyası,
       sıfır istisna. Yani süzgeç hiçbir meşru silmeyi kaybetmiyor.
     ⚠ `avatars/` ORTAK klasör (2-, 3-, 7-, 8- yan yana) → orada önek eşleşmesi
       ŞART, klasör adı yetmez. */
  const banaAit = (yol: string) =>
    yol.startsWith(`${userId}/`) || yol.startsWith(`avatars/${userId}-`);

  const yabanci = [...mediaFiles].filter((y) => !banaAit(y));
  if (yabanci.length) {
    // SESSİZ KALMA: yabancı yol demek, birinin başkasının dosyasını kendi
    // içeriğine iliştirdiği demektir. Silinmiyor ama iz bırakıyor.
    console.warn(`[purge] kullanıcı ${userId}: ${yabanci.length} YABANCI yol atlandı → ${yabanci.slice(0, 5).join(', ')}`);
  }

  const silinecek = [...mediaFiles].filter(banaAit);
  if (silinecek.length > 0) {
    const { error } = await db.storage.from('media').remove(silinecek);
    logIfError('purge: media storage remove', error);
  }
  if (archiveFiles.length > 0) {
    const { error } = await db.storage.from('archive').remove(archiveFiles);
    logIfError('purge: archive storage remove', error);
  }
  // Hikâye medyası AYRI (private) `stories` kovasında.
  if (storyFiles.size > 0) {
    const { error } = await db.storage.from('stories').remove([...storyFiles]);
    logIfError('purge: stories storage remove', error);
  }
  // DM ekleri AYRI (private) `dm` kovasında.
  if (dmFiles.size > 0) {
    const { error } = await db.storage.from('dm').remove([...dmFiles]);
    logIfError('purge: dm storage remove', error);
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
    /* Müzik parçaları — 26.08.2026 denetimi. DOSYALARI zaten yukarıda siliniyordu
       (`music_tracks.storage_path` → media kovası) ama SATIR kalıyordu: sonuç,
       /muzik listesinde kaynağı olmayan ölü kayıtlar. Üstelik sahibi silindiği
       için kimse kaldıramıyordu (DELETE ucu `eq('user_id', me.id)` istiyor).
       ⚠ `youtube_items` / `spotify_playlists` BİLEREK BURADA DEĞİL: onlar dosya
         taşımıyor, dış bağlantı; site geneli listede kalmaları veri kaybı değil
         ve silmek başkasının eklediği içerikle karışabilir. */
    ['music_tracks', 'user_id'],
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
