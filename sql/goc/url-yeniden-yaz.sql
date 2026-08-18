-- ════════════════════════════════════════════════════════════════════
-- GÖÇ ADIMI 9 — Mutlak Supabase URL'lerini yeni proje ref'ine çevir.
--
-- NEDEN GEREKLİ: bu kod tabanı storage YOLUNU değil, getPublicUrl()'in
-- döndürdüğü TAM ADRESİ veritabanına yazıyor:
--     https://<ref>.supabase.co/storage/v1/object/public/media/...
-- Proje ref'i değiştiği için bu satırlar göçten sonra ESKİ projeyi
-- göstermeye devam eder. Eski proje kapanınca sitedeki tüm kullanıcı
-- medyası (avatar, gönderi, hikâye, DM, makale görseli) bir anda ölür.
--
-- ⚠ SESSİZ ARIZA: sayfalar 200 dönmeye devam eder, yalnız görseller 404
-- olur. Üstelik CDN eski URL'leri bir süre servis ettiği için göç günü
-- HER ŞEY YOLUNDA GÖRÜNEBİLİR. Bu yüzden aşağıdaki doğrulama bloğu şart.
--
-- KULLANIM: :eski ve :yeni değerlerini doldurup YENİ projede çalıştır.
--   psql "$YENI_DB_URL" -v eski='abcdefgh' -v yeni='ijklmnop' \
--        -f sql/goc/url-yeniden-yaz.sql
-- ════════════════════════════════════════════════════════════════════

\set eski_host :eski '.supabase.co'
\set yeni_host :yeni '.supabase.co'

BEGIN;

-- ── ÖNCE: kaç satır etkilenecek? (değişiklikten önce oku, karşılaştırma için)
\echo '── Değişecek satır sayıları (ÖNCE):'
SELECT 'users.avatar'              AS kolon, count(*) FROM users              WHERE avatar        LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'quick_facts.media_url',    count(*) FROM quick_facts        WHERE media_url     LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'quick_facts.media·jsonb',  count(*) FROM quick_facts        WHERE media::text   LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'stories.media_url',        count(*) FROM stories            WHERE media_url     LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'messages.media_url',       count(*) FROM messages           WHERE media_url     LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'music_tracks.src',         count(*) FROM music_tracks       WHERE src           LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'posts.image_url',          count(*) FROM posts              WHERE image_url     LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'did_you_know.image_url',   count(*) FROM did_you_know       WHERE image_url     LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'user_articles.cover_url',  count(*) FROM user_articles      WHERE cover_url     LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'user_articles.doc·jsonb',  count(*) FROM user_articles      WHERE doc::text     LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'user_articles.pending·jsonb', count(*) FROM user_articles   WHERE pending_edit::text LIKE '%'||:'eski_host'||'%';

-- ── DÜZ METİN KOLONLAR (8) ────────────────────────────────────────
UPDATE users         SET avatar    = replace(avatar,    :'eski_host', :'yeni_host') WHERE avatar    LIKE '%'||:'eski_host'||'%';
UPDATE quick_facts   SET media_url = replace(media_url, :'eski_host', :'yeni_host') WHERE media_url LIKE '%'||:'eski_host'||'%';
UPDATE stories       SET media_url = replace(media_url, :'eski_host', :'yeni_host') WHERE media_url LIKE '%'||:'eski_host'||'%';
UPDATE messages      SET media_url = replace(media_url, :'eski_host', :'yeni_host') WHERE media_url LIKE '%'||:'eski_host'||'%';
UPDATE music_tracks  SET src       = replace(src,       :'eski_host', :'yeni_host') WHERE src       LIKE '%'||:'eski_host'||'%';
UPDATE posts         SET image_url = replace(image_url, :'eski_host', :'yeni_host') WHERE image_url LIKE '%'||:'eski_host'||'%';
UPDATE did_you_know  SET image_url = replace(image_url, :'eski_host', :'yeni_host') WHERE image_url LIKE '%'||:'eski_host'||'%';
UPDATE user_articles SET cover_url = replace(cover_url, :'eski_host', :'yeni_host') WHERE cover_url LIKE '%'||:'eski_host'||'%';

-- ── JSONB KOLONLAR (3) ────────────────────────────────────────────
-- ⚠ jsonb_set ile tek tek alan güncellemek YETMEZ: URL'ler İÇ İÇE duruyor.
--   · quick_facts.media          → [{url, w, h, type}, ...]           (dizi)
--   · user_articles.doc          → [{type:'image', url, ...}, ...]    (dizi)
--   · user_articles.pending_edit → {cover_url, doc:[...], ...}        (İÇİNDE doc VAR)
-- pending_edit'te hem cover_url hem gömülü doc bloklarındaki url'ler bulunuyor;
-- bu yüzden tüm belge metne çevrilip değiştiriliyor. Anahtar sırası normalize
-- olabilir, anlam değişmez.
UPDATE quick_facts
   SET media = replace(media::text, :'eski_host', :'yeni_host')::jsonb
 WHERE media::text LIKE '%'||:'eski_host'||'%';

UPDATE user_articles
   SET doc = replace(doc::text, :'eski_host', :'yeni_host')::jsonb
 WHERE doc::text LIKE '%'||:'eski_host'||'%';

UPDATE user_articles
   SET pending_edit = replace(pending_edit::text, :'eski_host', :'yeni_host')::jsonb
 WHERE pending_edit::text LIKE '%'||:'eski_host'||'%';

-- ── SONRA: sıfır olmalı. DEĞİLSE COMMIT ETME.
\echo '── Kalan eski referans (HEPSİ 0 OLMALI):'
SELECT 'users.avatar'              AS kolon, count(*) FROM users              WHERE avatar        LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'quick_facts.media_url',    count(*) FROM quick_facts        WHERE media_url     LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'quick_facts.media·jsonb',  count(*) FROM quick_facts        WHERE media::text   LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'stories.media_url',        count(*) FROM stories            WHERE media_url     LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'messages.media_url',       count(*) FROM messages           WHERE media_url     LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'music_tracks.src',         count(*) FROM music_tracks       WHERE src           LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'posts.image_url',          count(*) FROM posts              WHERE image_url     LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'did_you_know.image_url',   count(*) FROM did_you_know       WHERE image_url     LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'user_articles.cover_url',  count(*) FROM user_articles      WHERE cover_url     LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'user_articles.doc·jsonb',  count(*) FROM user_articles      WHERE doc::text     LIKE '%'||:'eski_host'||'%'
UNION ALL SELECT 'user_articles.pending·jsonb', count(*) FROM user_articles   WHERE pending_edit::text LIKE '%'||:'eski_host'||'%';

-- Yukarıdaki listede 0 OLMAYAN satır varsa: ROLLBACK; yaz ve sebebini bul.
COMMIT;
