-- ════════════════════════════════════════════════════════════════════════
--  Basements — Performans Index'leri (T3)
-- ════════════════════════════════════════════════════════════════════════
--  NASIL: Supabase Dashboard > SQL Editor'e yapıştır, Run.
--  GÜVENLİ: Hepsi "IF NOT EXISTS" → zaten varsa atlanır, hata vermez,
--           istediğin kadar tekrar çalıştırabilirsin. Veriyi DEĞİŞTİRMEZ.
--  HIZLI:   Tablolar küçükken oluşturma anında biter.
--  HATA OLURSA: Bir satır "relation ... does not exist" derse, o özelliğin
--           tablosu henüz kurulmamış demektir — o satırı sil, gerisini çalıştır.
--
--  Bu index'ler koddaki gerçek sorgu desenlerinden çıkarıldı (.eq/.in/.or/
--  .order/.gt). En kritik olan EN ÜSTTE: getMe() her sayfa yüklemesinde
--  users.auth_id ile sorgu atar; bu index yoksa her istek tablo taraması yapar.
-- ════════════════════════════════════════════════════════════════════════

-- (Opsiyonel) Şu an hangi index'ler var, görmek için:
--   select tablename, indexname, indexdef from pg_indexes
--   where schemaname = 'public' order by tablename, indexname;


-- ── 1) EN KRİTİK — her istekte çalışan auth/kullanıcı sorgusu ──────────────
create index if not exists idx_users_auth_id     on public.users (auth_id);
create index if not exists idx_users_username     on public.users (username);
create index if not exists idx_users_created_at   on public.users (created_at desc);

-- ── 2) FEED'LER (home / akış / discover / profil) ─────────────────────────
create index if not exists idx_quick_facts_created   on public.quick_facts (created_at desc, id desc);
create index if not exists idx_quick_facts_user      on public.quick_facts (user_id, created_at desc);
create index if not exists idx_posts_created         on public.posts (created_at desc);

-- ── 3) STORIES (home — süresi geçmemiş, en yeni) ──────────────────────────
create index if not exists idx_stories_expires   on public.stories (expires_at);
create index if not exists idx_stories_created    on public.stories (created_at desc);

-- ── 4) BİLDİRİM ROZETİ + LİSTE (layout her girişte + bildirimler sayfası) ──
create index if not exists idx_notif_user_unread  on public.notifications (user_id, is_read);
create index if not exists idx_notif_user_created on public.notifications (user_id, created_at desc);

-- ── 5) MESAJLAR (layout sayaç + mesajlar sayfası + DM) ────────────────────
create index if not exists idx_conv_user1     on public.conversations (user1_id);
create index if not exists idx_conv_user2     on public.conversations (user2_id);
create index if not exists idx_conv_last_msg  on public.conversations (last_message_at desc);
create index if not exists idx_msg_conv_created on public.messages (conversation_id, created_at desc);
create index if not exists idx_msg_conv_unread  on public.messages (conversation_id, is_read);

-- ── 6) BEĞENİ / REPOST / KAYDETME (home + gönderi detayı) ─────────────────
create index if not exists idx_fact_likes_user    on public.fact_likes (user_id, fact_id);
create index if not exists idx_post_likes_user     on public.post_likes (user_id, post_id);
create index if not exists idx_fact_reposts_user   on public.fact_reposts (user_id, fact_id);
create index if not exists idx_bookmarks_user_post on public.bookmarks (user_id, post_id);
create index if not exists idx_bookmarks_user_created on public.bookmarks (user_id, created_at desc);

-- ── 7) TAKİP (öneriler, takip-durumu, sayaçlar) ──────────────────────────
create index if not exists idx_follows_follower_following on public.follows (follower_id, following_id);
create index if not exists idx_follows_following          on public.follows (following_id);

-- ── 8) YORUMLAR ───────────────────────────────────────────────────────────
-- DİKKAT (2026-07-18): eskiden bu satır `idx_comments_post` adını kullanıyordu
-- ama canlı DB'de aynı İSİMLE dar bir (post_id) index'i zaten vardı →
-- `if not exists` yüzünden bileşik sürüm hiç oluşmamıştı. Yeni ad + eski dar
-- index'in kaldırılması sql/perf-2026-07-18.sql'de.
create index if not exists idx_comments_post_created on public.comments (post_id, created_at);


-- ── 9) HASHTAG / MÜZİK (özellik tabloları — yoksa to_regclass ile atlanır) ─
do $$ begin
  if to_regclass('public.post_hashtags') is not null then
    execute 'create index if not exists idx_post_hashtags_hashtag on public.post_hashtags (hashtag_id, post_id)';
    execute 'create index if not exists idx_post_hashtags_post    on public.post_hashtags (post_id)';
  end if;
  if to_regclass('public.spotify_playlists') is not null then
    execute 'create index if not exists idx_spotify_created on public.spotify_playlists (created_at desc)';
  end if;
  if to_regclass('public.youtube_items') is not null then
    execute 'create index if not exists idx_youtube_created on public.youtube_items (created_at desc)';
  end if;
end $$;


-- ── (OPSİYONEL) Metin araması (discover arama kutusu, ILIKE %...%) ─────────
-- ILIKE '%kelime%' aramaları normal index kullanamaz; hızlandırmak için trigram:
-- create extension if not exists pg_trgm;
-- create index if not exists idx_users_username_trgm    on public.users        using gin (username     gin_trgm_ops);
-- create index if not exists idx_users_dispname_trgm    on public.users        using gin (display_name gin_trgm_ops);
-- create index if not exists idx_quick_facts_caption_trgm on public.quick_facts using gin (caption     gin_trgm_ops);


-- ════════════════════════════════════════════════════════════════════════
--  DOĞRULAMA (opsiyonel): bir sorgunun index kullanıp kullanmadığını gör.
--  "Seq Scan" yerine "Index Scan" görmelisin:
--    explain analyze select * from public.users where auth_id = 'BURAYA-BIR-AUTH-ID';
--    explain analyze select * from public.quick_facts order by created_at desc limit 30;
-- ════════════════════════════════════════════════════════════════════════
