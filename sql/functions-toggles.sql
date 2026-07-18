-- ═══════════════════════════════════════════════════════════════════════════
-- BEĞENİ / REPOST RPC FONKSİYONLARI
--
-- Bu üç fonksiyonun kaynağı depoda HİÇ YOKTU. Beğeni ve repost uçlarının
-- tamamı bunlara dayanıyor (app/api/quick-facts/[id]/like, app/api/posts/[id]/like,
-- app/api/posts/[id]/repost). Supabase projesi yeniden kurulsa, staging ortamı
-- açılsa ya da bir migration bunları düşürse beğeni TÜM sitede ölürdü ve gövdeleri
-- hiçbir yerde yazılı olmadığı için geri getirilemezdi.
--
-- Aşağıdakiler CANLI VERİTABANINDAN dökülmüştür (pg_get_functiondef,
-- 2026-07-18) — uydurma değil, birebir kopya. `create or replace` zaten
-- idempotenttir, güvenle tekrar çalıştırılabilir.
--
-- NOT: `login_dashboard` ve `traffic_dashboard` bilinçli olarak BURAYA
-- ALINMADI — onların kaynağı zaten sql/features-login-tracking.sql ve
-- sql/features-visitor-tracking.sql içinde var ve canlı sürümle birebir
-- aynı (karşılaştırıldı). İkinci bir doğruluk kaynağı yaratmayalım.
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────
-- quick_facts (akış gönderisi) beğenisi
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.toggle_fact_like(p_user_id bigint, p_fact_id bigint)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
  already BOOLEAN;
  new_likes INT;
BEGIN
  SELECT EXISTS(SELECT 1 FROM fact_likes WHERE user_id = p_user_id AND fact_id = p_fact_id) INTO already;

  IF already THEN
    DELETE FROM fact_likes WHERE user_id = p_user_id AND fact_id = p_fact_id;
    UPDATE quick_facts SET likes = GREATEST(likes - 1, 0) WHERE id = p_fact_id RETURNING likes INTO new_likes;
  ELSE
    INSERT INTO fact_likes (user_id, fact_id) VALUES (p_user_id, p_fact_id);
    UPDATE quick_facts SET likes = likes + 1 WHERE id = p_fact_id RETURNING likes INTO new_likes;
  END IF;

  RETURN json_build_object('likes', new_likes, 'liked', NOT already);
END;
$function$;


-- ─────────────────────────────────────────────────────────────────────────
-- posts (metin gönderisi) beğenisi
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.toggle_post_like(p_user_id bigint, p_post_id bigint)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
  already BOOLEAN;
  new_likes INT;
BEGIN
  SELECT EXISTS(SELECT 1 FROM post_likes WHERE user_id = p_user_id AND post_id = p_post_id) INTO already;

  IF already THEN
    DELETE FROM post_likes WHERE user_id = p_user_id AND post_id = p_post_id;
    UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = p_post_id RETURNING likes INTO new_likes;
  ELSE
    INSERT INTO post_likes (user_id, post_id) VALUES (p_user_id, p_post_id);
    UPDATE posts SET likes = likes + 1 WHERE id = p_post_id RETURNING likes INTO new_likes;
  END IF;

  RETURN json_build_object('likes', new_likes, 'liked', NOT already);
END;
$function$;


-- ─────────────────────────────────────────────────────────────────────────
-- posts repost
-- (DİKKAT: bu `reposts` tablosunu kullanır. Akıştaki repost AYRI bir tablo —
--  `fact_reposts`, migrations/fact_reposts.sql — ve RPC değil, doğrudan
--  sorguyla yönetilir. İkisini karıştırma.)
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.toggle_post_repost(p_user_id bigint, p_post_id bigint)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE already BOOLEAN; new_count INT;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM reposts WHERE user_id = p_user_id AND post_id = p_post_id
  ) INTO already;

  IF already THEN
    DELETE FROM reposts WHERE user_id = p_user_id AND post_id = p_post_id;
    UPDATE posts SET reposts = GREATEST(reposts - 1, 0) WHERE id = p_post_id RETURNING reposts INTO new_count;
  ELSE
    INSERT INTO reposts (user_id, post_id) VALUES (p_user_id, p_post_id);
    UPDATE posts SET reposts = reposts + 1 WHERE id = p_post_id RETURNING reposts INTO new_count;
  END IF;

  RETURN json_build_object('reposted', NOT already, 'reposts', new_count);
END;
$function$;


-- ═══════════════════════════════════════════════════════════════════════════
-- AÇIK KALAN İKİ KONU (bilerek bırakıldı, körlemesine düzeltme yapılmadı)
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) YARIŞ KORUMASI
-- Üç fonksiyon da "önce SELECT EXISTS, sonra INSERT" deseniyle çalışıyor.
-- Aradaki boşlukta ikinci bir istek gelirse (hızlı çift tıklama) iki satır
-- yazılır ve `likes` sayacı iki kez artar — sayaç kalıcı olarak şişer.
-- Composite PRIMARY KEY zaten varsa sorun yok (fact_reposts bu deseni
-- kullanıyor). ÖNCE KONTROL ET:
--
--   select c.relname as tablo, i.relname as index_adi, x.indisunique as benzersiz
--     from pg_index x
--     join pg_class c on c.oid = x.indrelid
--     join pg_class i on i.oid = x.indexrelid
--     join pg_namespace n on n.oid = c.relnamespace
--    where n.nspname = 'public' and c.relname in ('fact_likes','post_likes','reposts')
--    order by 1, 2;
--
-- Çıktıda benzersiz=true bir index YOKSA aşağıdakileri aç:
-- create unique index if not exists uq_fact_likes_user_fact on public.fact_likes (user_id, fact_id);
-- create unique index if not exists uq_post_likes_user_post on public.post_likes (user_id, post_id);
-- create unique index if not exists uq_reposts_user_post    on public.reposts    (user_id, post_id);

-- 2) TABLOLARIN KENDİSİ DE DEPODA YOK
-- `fact_likes`, `post_likes`, `reposts`, `quick_facts`, `posts`, `users`,
-- `comments`, `follows`, `bookmarks`, `stories`, `notifications`,
-- `conversations`, `messages` — bunların hiçbirinin `create table` tanımı
-- depoda yok; hepsi Supabase arayüzünden elle oluşturulmuş. Fonksiyonlar artık
-- güvende ama ŞEMA hâlâ tek kopya. Kalıcı çözüm: `supabase db dump --schema public`
-- ile tam şemayı çekip `sql/schema.sql` olarak depoya almak. Ayrı iş.

-- 3) `cast_poll_vote` KASITLI OLARAK YOK
-- app/api/posts/[id]/vote/route.ts bu fonksiyonu çağırıyor ama canlıda ne
-- fonksiyon ne de dayandığı `polls` / `poll_options` / `poll_votes` tabloları
-- var (2026-07-18'de ölçüldü: üçü de 404). Gönderi-anketi özelliği hiç
-- bitirilmemiş: UI'da anket oluşturma girişi yok, `app/api/posts/route.ts`
-- içindeki insert `if (poll)` ile korumalı, oy verme ucu da RPC'ye ulaşmadan
-- "Anket bulunamadı" (404) dönüyor. Yani KIRIK DEĞİL, uykuda.
-- Özellik canlandırılacaksa önce tablolar + fonksiyon tasarlanmalı.
-- (Makale içi oylama BAŞKA bir sistemdir ve ÇALIŞIYOR: lib/polls.ts +
--  article_poll_votes tablosu — onu bununla karıştırma.)
