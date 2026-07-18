-- ═══════════════════════════════════════════════════════════════════════════
-- MÜKERRER INDEX TEMİZLİĞİ — 2026-07-18
--
-- DÜRÜST ÇERÇEVE: bu bir PERFORMANS işi DEĞİL, DÜZEN işi.
-- Ölçülen tablo boyutları 4-835 satır. Bu ölçekte fazladan index'in yazma
-- maliyeti ölçülemez. Değeri şurada: şema okunabilir kalsın, "hangi index
-- neden var?" sorusu cevaplanabilsin, ve tablolar büyüdüğünde bu yük
-- devralınmasın. Acil değil; istemezsen çalıştırma.
--
-- HER SATIRIN GEREKÇESİ YAZILI. Körlemesine `drop index` yok.
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────
-- BÖLÜM 1 — BENİM YARATTIĞIM ÜÇ MÜKERRER INDEX
--
-- sql/audit-2026-07-18.sql bunları ekledi. Gerekçem yanlıştı: yalnızca
-- PRIMARY KEY'lere bakıp "PK `id` üzerinde → çift kayıt korunmasız" diye
-- hüküm verdim, UNIQUE kısıtlarını hiç kontrol etmedim. Canlı şema dökümü
-- (2026-07-18) korumaların ZATEN VAR olduğunu gösterdi. Üçü de birebir kopya.
-- ─────────────────────────────────────────────────────────────────────────

-- follows_follower_id_following_id_key UNIQUE (follower_id, following_id) zaten vardı
drop index if exists public.uq_follows_pair;

-- bookmarks_user_id_post_id_key UNIQUE (user_id, post_id) zaten vardı
drop index if exists public.uq_bookmarks_user_post;

-- idx_notif_like_dedup, aynı kolonlar + aynı WHERE type='like' ile zaten vardı
drop index if exists public.uq_notifications_like;


-- ─────────────────────────────────────────────────────────────────────────
-- BÖLÜM 2 — PK/UNIQUE KISITIN BİREBİR KOPYASI OLAN ESKİ INDEX'LER
-- (Benden önce vardı. Kısıt zaten bir index yaratır; bunlar ikinci kopya.)
-- ─────────────────────────────────────────────────────────────────────────

-- fact_likes_pkey PRIMARY KEY (user_id, fact_id) ile aynı kolonlar
drop index if exists public.idx_fact_likes_user;

-- post_likes_pkey PRIMARY KEY (user_id, post_id) ile aynı kolonlar
drop index if exists public.idx_post_likes_user;

-- fact_reposts_pkey PRIMARY KEY (user_id, fact_id) ile aynı kolonlar
drop index if exists public.idx_fact_reposts_user;

-- follows_follower_id_following_id_key ile aynı kolonlar
drop index if exists public.idx_follows_follower_following;

-- bookmarks_user_id_post_id_key ile aynı kolonlar
drop index if exists public.idx_bookmarks_user_post;

-- users_username_key UNIQUE (username) ile aynı kolon
drop index if exists public.idx_users_username;


-- ─────────────────────────────────────────────────────────────────────────
-- BÖLÜM 3 — AYNI TABLODA BİREBİR AYNI İKİ INDEX
-- (Muhtemelen aynı SQL dosyası iki kez, farklı isimle çalıştırılmış.)
-- ─────────────────────────────────────────────────────────────────────────

-- idx_spotify_playlists_time ile birebir aynı: (created_at desc)
drop index if exists public.idx_spotify_created;

-- idx_youtube_items_time ile birebir aynı: (created_at desc)
drop index if exists public.idx_youtube_created;


-- ─────────────────────────────────────────────────────────────────────────
-- BÖLÜM 4 — ÖNEK (PREFIX) FAZLALIĞI  ⚠️ İSTEĞE BAĞLI
--
-- Postgres (a, b) index'ini yalnız `a` ile yapılan sorgularda da kullanabilir.
-- Dolayısıyla (a) index'i, (a, b) varken gereksizdir. Aşağıdakiler bu sınıfa
-- giriyor. Bölüm 1-3'ten daha az kesin: eğer ileride `a`-only sorguları çok
-- sıcak bir yola girerse dar index marjinal olarak daha hızlı olabilir.
-- Bu ölçekte fark yok; yine de ayrı bölümde tuttum ki istemezsen atlayasın.
-- ─────────────────────────────────────────────────────────────────────────

-- (user_id) ⊂ idx_bookmarks_user_created (user_id, created_at desc)
drop index if exists public.idx_bookmarks_user;

-- (user_id) ⊂ idx_comments_user_created (user_id, created_at desc)
drop index if exists public.idx_comments_user;

-- (user1_id) ⊂ idx_conv_u1 (user1_id, last_message_at desc)
drop index if exists public.idx_conv_user1;

-- (user2_id) ⊂ idx_conv_u2 (user2_id, last_message_at desc)
drop index if exists public.idx_conv_user2;

-- (blocker_id) ⊂ blocks_blocker_id_blocked_id_key (blocker_id, blocked_id)
drop index if exists public.idx_blocks_blocker;

-- (expires_at) ⊂ idx_stories_expires_created (expires_at, created_at desc)
drop index if exists public.idx_stories_expires;

-- (expires_at desc): idx_stories_expires_created'ın baş kolonu aynı; Postgres
-- index'i geriye doğru tarayabildiği için yön farkı fazlalığı ortadan kaldırmaz
drop index if exists public.idx_stories_active;

-- (created_at desc) ⊂ idx_page_views_created_hash (created_at desc, visitor_hash)
drop index if exists public.idx_page_views_created;

-- (conversation_id, created_at) ≈ idx_msg_conv_created (conversation_id, created_at desc)
-- Eşitlik grubunun içinde geriye tarama mümkün → ikisi aynı işi görüyor
drop index if exists public.idx_msg_conv;


-- ─────────────────────────────────────────────────────────────────────────
-- KASITLI OLARAK BIRAKILANLAR (silme!)
--
-- · idx_msg_conv_unread (conversation_id, is_read) — idx_msg_unread kısmi
--   index'i yalnız `not is_read` satırlarını kapsıyor. Okunmuş mesaj sorgusu
--   ileride gerekirse bu index lazım olur. Belirsiz → dokunulmadı.
-- · idx_notif_like_dedup — beğeni bildirimi yarış koruması. Bölüm 1'de
--   silinen benim ikizimdi, ASIL olan bu.
-- · users_username_lower_idx UNIQUE (lower(username)) — büyük/küçük harf
--   varyantıyla kullanıcı adı kapmayı engelliyor. users_username_key'in
--   kopyası DEĞİL, farklı bir garanti.
-- · idx_page_views_hash (visitor_hash, created_at desc) — baş kolonu farklı,
--   idx_page_views_created_hash'in kopyası değil.
-- ─────────────────────────────────────────────────────────────────────────


-- ═══════════════════════════════════════════════════════════════════════════
-- DOĞRULAMA — çalıştırdıktan sonra
-- ═══════════════════════════════════════════════════════════════════════════

-- Silinenlerden hiçbiri kalmamalı (0 satır dönmeli):
select indexname from pg_indexes
 where schemaname = 'public'
   and indexname in (
     'uq_follows_pair','uq_bookmarks_user_post','uq_notifications_like',
     'idx_fact_likes_user','idx_post_likes_user','idx_fact_reposts_user',
     'idx_follows_follower_following','idx_bookmarks_user_post','idx_users_username',
     'idx_spotify_created','idx_youtube_created',
     'idx_bookmarks_user','idx_comments_user','idx_conv_user1','idx_conv_user2',
     'idx_blocks_blocker','idx_stories_expires','idx_stories_active',
     'idx_page_views_created','idx_msg_conv'
   );

-- Korumaların HÂLÂ yerinde olduğunu teyit et (5 satır dönmeli):
select conname, pg_get_constraintdef(oid) from pg_constraint
 where conname in ('follows_follower_id_following_id_key','bookmarks_user_id_post_id_key',
                   'fact_likes_pkey','post_likes_pkey','users_username_key');
