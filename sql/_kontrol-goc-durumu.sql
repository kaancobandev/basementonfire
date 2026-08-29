-- ════════════════════════════════════════════════════════════════════════
-- GÖÇ DURUMU KONTROLÜ — hangi sql dosyası çalıştırıldı, hangisi bekliyor?
--
-- SALT OKUR. Hiçbir şey yaratmaz, değiştirmez, silmez. İstediğin kadar çalıştır.
--
-- ⚠ NASIL ÇALIŞTIRILIR — ÖNEMLİ:
--   Supabase SQL Editor birden fazla sorguyu birlikte çalıştırdığında
--   YALNIZCA SONUNCUSUNUN tablosunu gösterir. Tamamını yapıştırıp Run'a
--   basarsan sadece 4. bölümü görürsün, ilk üçü kaybolur.
--
--   DOĞRUSU: dosyanın tamamını yapıştır, sonra çalıştırmak istediğin bölümü
--   FARE İLE SEÇ ve Run'a bas — Supabase seçili metni çalıştırır.
--   Dört bölümü sırayla seç, dört sonucu ayrı ayrı al.
--
--   Bölümler: 1) göç dosyaları  2) veri durumu  3) indeksler  4) temizlik+korumalar
--             5) KOLON TARAMASI  6) REALTIME + RLS
--
-- NEDEN: sql/ altındaki dosyalar elle çalıştırılıyor ve hangisinin
--        çalıştırıldığını tutan bir kayıt yok. Bu dosya kaydın yerine geçer:
--        her göçün YARATTIĞI nesneye bakar, dosyanın kendisine değil.
--
-- OKUMA: durum sütunu
--          ✅ ÇALIŞTI  → nesne var, o dosyayı tekrar çalıştırmana gerek yok
--          ❌ EKSİK    → dosya hiç çalıştırılmamış, ilgili özellik uykuda
--          ⚠ KISMİ    → dosyanın bir kısmı var bir kısmı yok (yarıda kalmış)
-- ════════════════════════════════════════════════════════════════════════


-- ═══════════════ 1 · GÖÇ DOSYALARI ═══════════════
-- Her satır bir sql dosyası. "beklenen" = o dosya çalışınca oluşması gereken
-- nesneler. Hepsi varsa ÇALIŞTI, hiçbiri yoksa EKSİK, bazısı varsa KISMİ.

with beklenen(sira, dosya, ozellik, tur, nesne) as (
  values
  -- tur: 't' tablo · 'k' kolon (tablo.kolon) · 'f' fonksiyon · 'c' constraint
    (1,  'schema.sql',                        'Temel şema',                  't', 'public.users'),
    (1,  'schema.sql',                        'Temel şema',                  't', 'public.quick_facts'),
    (1,  'schema.sql',                        'Temel şema',                  't', 'public.stories'),

    (2,  'functions-toggles.sql',             'Beğeni/repost RPC',           'f', 'toggle_post_like'),
    (2,  'functions-toggles.sql',             'Beğeni/repost RPC',           'f', 'toggle_fact_like'),
    (2,  'functions-toggles.sql',             'Beğeni/repost RPC',           'f', 'toggle_post_repost'),

    (3,  'fix-handle-new-user.sql',           'Kayıt tetikleyicisi',         'f', 'handle_new_user'),

    (4,  'features-dyk-quiz.sql',             'Bilgi Kartı + Günün Sorusu',  't', 'public.did_you_know'),
    (4,  'features-dyk-quiz.sql',             'Bilgi Kartı + Günün Sorusu',  't', 'public.quiz_questions'),
    (4,  'features-dyk-quiz.sql',             'Bilgi Kartı + Günün Sorusu',  't', 'public.user_progress'),
    (4,  'features-dyk-quiz.sql',             'Bilgi Kartı + Günün Sorusu',  't', 'public.daily_answers'),
    (4,  'features-dyk-quiz.sql',             'Bilgi Kartı + Günün Sorusu',  't', 'public.user_badges'),

    (5,  'features-articles-social.sql',      'Makale yorum + okuma listesi','t', 'public.article_comments'),
    (5,  'features-articles-social.sql',      'Makale yorum + okuma listesi','t', 'public.article_saves'),

    (6,  'features-user-articles.sql',        'Kullanıcı makaleleri',        't', 'public.user_articles'),
    (6,  'features-user-articles.sql',        'Kullanıcı makaleleri',        'k', 'users.is_admin'),

    (7,  'features-login-tracking.sql',       'Giriş istatistiği',           't', 'public.login_events'),
    (7,  'features-login-tracking.sql',       'Giriş istatistiği',           'f', 'login_dashboard'),
    (7,  'features-login-tracking.sql',       'Giriş istatistiği',           'k', 'users.last_seen_at'),

    (8,  'features-visitor-tracking.sql',     'Ziyaretçi/trafik istatistiği','t', 'public.page_views'),
    (8,  'features-visitor-tracking.sql',     'Ziyaretçi/trafik istatistiği','f', 'traffic_dashboard'),

    (9,  'features-block-report.sql',         'Engelleme + şikayet',         't', 'public.blocks'),
    (9,  'features-block-report.sql',         'Engelleme + şikayet',         't', 'public.reports'),

    (10, 'reports-add-article-comment.sql',   'Makale yorumu şikayeti',      'c', 'reports_target_type_check|article_comment'),

    (11, 'features-age-gate.sql',             '16 yaş kapısı',               'k', 'users.birthdate'),
    (11, 'features-age-gate.sql',             '16 yaş kapısı',               'k', 'users.terms_accepted_at'),

    (12, 'features-account-delete.sql',       'Hesap silme',                 'k', 'users.is_deleted'),

    (13, 'features-article-poll.sql',         'Makale içi oylama',           't', 'public.article_poll_votes'),

    (14, 'features-match.sql',                'Eşleştirme (gizli)',          't', 'public.swipes'),
    (14, 'features-match.sql',                'Eşleştirme (gizli)',          't', 'public.matches'),

    (15, 'features-2026-07-19.sql',           'Özellik paketi 19/07',        't', 'public.article_reads'),
    (15, 'features-2026-07-19.sql',           'Özellik paketi 19/07',        't', 'public.article_quiz_answers'),
    (15, 'features-2026-07-19.sql',           'Özellik paketi 19/07',        't', 'public.post_polls'),
    (15, 'features-2026-07-19.sql',           'Özellik paketi 19/07',        't', 'public.story_views'),
    (15, 'features-2026-07-19.sql',           'Özellik paketi 19/07',        't', 'public.dyk_likes'),
    (15, 'features-2026-07-19.sql',           'Özellik paketi 19/07',        'k', 'game_scores.game_key'),
    (15, 'features-2026-07-19.sql',           'Özellik paketi 19/07',        'k', 'notifications.dyk_id'),

    (16, 'features-music-tracks.sql',         'Müzik',                       't', 'public.music_tracks'),

    (17, 'features-story-music.sql',          'Hikaye müziği',               'k', 'stories.music_track_id'),
    (17, 'features-story-music.sql',          'Hikaye müziği',               'k', 'music_tracks.story_approved'),

    (18, 'features-story-link-and-seen.sql',  'Hikaye linki',                'k', 'stories.link_url'),

    (19, 'features-story-highlights-reply.sql','Hikaye highlight + yanıt',   't', 'public.story_highlights'),
    (19, 'features-story-highlights-reply.sql','Hikaye highlight + yanıt',   't', 'public.story_highlight_items'),

    (20, 'features-story-poll.sql',           'Hikaye anketi',               'k', 'stories.poll_question'),
    (21, 'features-story-quiz.sql',           'Hikaye quiz sticker',         'k', 'stories.poll_correct'),
    (22, 'features-story-caption.sql',        'Hikaye açıklaması',           'k', 'stories.caption'),

    (23, 'features-story-audience.sql',       'Hikaye kitle kontrolü',       'k', 'stories.audience'),
    (23, 'features-story-audience.sql',       'Hikaye kitle kontrolü',       't', 'public.close_friends'),

    (24, 'features-follow-requests.sql',      'Takip isteği (gizli hesap)',  't', 'public.follow_requests'),
    (25, 'features-comment-likes.sql',        'Yorum beğenisi',              't', 'public.comment_likes'),
    (26, 'features-dm-media.sql',             'DM medya',                    'k', 'messages.media_url'),

    (27, 'features-bookmark-collections.sql', 'Kayıt koleksiyonları',        't', 'public.collections'),
    (27, 'features-bookmark-collections.sql', 'Kayıt koleksiyonları',        'k', 'bookmarks.collection_id')
),

olcum as (
  select
    sira, dosya, ozellik, tur, nesne,
    case tur
      when 't' then to_regclass(nesne) is not null
      when 'f' then exists (
        select 1 from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and p.proname = nesne
      )
      when 'k' then exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name  = split_part(nesne, '.', 1)
          and column_name = split_part(nesne, '.', 2)
      )
      when 'c' then exists (
        select 1 from pg_constraint
        where conname = split_part(nesne, '|', 1)
          and pg_get_constraintdef(oid) like '%' || split_part(nesne, '|', 2) || '%'
      )
    end as var
  from beklenen
)

select
  sira                                              as "#",
  dosya                                             as "sql dosyası",
  ozellik                                           as "özellik",
  case
    when bool_and(var)  then '✅ ÇALIŞTI'
    when bool_or(var)   then '⚠ KISMİ'
    else                     '❌ EKSİK'
  end                                               as "durum",
  count(*) filter (where var)::text || '/' || count(*)::text  as "nesne",
  coalesce(string_agg(nesne, ', ') filter (where not var), '—') as "eksik olan"
from olcum
group by sira, dosya, ozellik
order by
  -- Eksikler en üste gelsin
  case when bool_and(var) then 2 when bool_or(var) then 1 else 0 end,
  sira;


-- ═══════════════ 2 · VERİ DURUMU ═══════════════
-- Tablo var ama BOŞ olabilir. Ölçüm/istatistik tabloları için asıl soru bu:
-- "tablo duruyor mu" değil, "veri BİRİKİYOR mu".
-- Tablo hiç yoksa satır '— (tablo yok)' der, sorgu patlamaz.

select * from (
  select 1 as s, 'quiz_questions'  as "tablo", 'Günün sorusu havuzu'        as "ne için",
         case when to_regclass('public.quiz_questions') is null then null
              else (select count(*) from public.quiz_questions) end as "satır"
  union all select 2, 'did_you_know',   'Bilgi kartları',
         case when to_regclass('public.did_you_know') is null then null
              else (select count(*) from public.did_you_know) end
  union all select 3, 'page_views',     'Ziyaretçi sayacı (trafik kanıtı)',
         case when to_regclass('public.page_views') is null then null
              else (select count(*) from public.page_views) end
  union all select 4, 'login_events',   'Üye girişleri',
         case when to_regclass('public.login_events') is null then null
              else (select count(*) from public.login_events) end
  union all select 5, 'users',          'Kayıtlı üye',
         case when to_regclass('public.users') is null then null
              else (select count(*) from public.users) end
  union all select 6, 'quick_facts',    'Gönderi',
         case when to_regclass('public.quick_facts') is null then null
              else (select count(*) from public.quick_facts) end
  union all select 7, 'article_reads',  'Makale okuma kaydı',
         case when to_regclass('public.article_reads') is null then null
              else (select count(*) from public.article_reads) end
  union all select 8, 'article_quiz_answers', 'Makale quiz cevabı',
         case when to_regclass('public.article_quiz_answers') is null then null
              else (select count(*) from public.article_quiz_answers) end
) t
order by s;


-- ═══════════════ 3 · PERFORMANS İNDEKSLERİ ═══════════════
-- perf-indexes.sql / perf-2026-07-18.sql / audit-2026-07-18.sql çalıştı mı?
-- Bunlar özellik açmaz, sayfa hızını belirler — eksikse site yavaşlar, bozulmaz.
--
-- ⚠ TUZAK (2026-07-29'da bu dosyanın ilk sürümü buna düştü):
-- Bir göçün yarattığı indeksi SONRAKİ bir göç kasıtlı olarak silebilir.
-- cleanup-redundant-indexes.sql tam olarak bunu yapıyor — audit dosyasının
-- eklediği uq_follows_pair / uq_bookmarks_user_post ve perf-indexes'in eklediği
-- idx_follows_follower_following, zaten var olan UNIQUE kısıtların kopyası
-- oldukları için düşürülüyor. Onları burada aramak, DOĞRU bir veritabanını
-- "eksik" diye raporlar. Bu yüzden aşağıda YALNIZCA sonraki göçlerin
-- dokunmadığı indeksler sorgulanır. Yeni bir dosya eklerken aynı kontrolü yap:
-- "bu indeksi sonradan silen bir göç var mı?"

with idx(dosya, ad) as (
  values
    ('perf-indexes.sql',       'idx_quick_facts_created'),
    ('perf-indexes.sql',       'idx_follows_following'),
    ('perf-indexes.sql',       'idx_msg_conv_created'),
    ('perf-2026-07-18.sql',    'idx_users_username_trgm'),
    ('perf-2026-07-18.sql',    'idx_users_interests_gin'),
    ('perf-2026-07-18.sql',    'idx_hashtags_tag_trgm'),
    ('audit-2026-07-18.sql',   'idx_page_views_created_hash'),
    ('audit-2026-07-18.sql',   'idx_comments_parent'),
    ('audit-2026-07-18.sql',   'idx_stories_expires_created')
)
select
  dosya                                                    as "sql dosyası",
  case when count(*) filter (where p.indexname is not null) = count(*)
       then '✅ ÇALIŞTI'
       when count(*) filter (where p.indexname is not null) > 0
       then '⚠ KISMİ'
       else '❌ EKSİK' end                                 as "durum",
  count(*) filter (where p.indexname is not null)::text
    || '/' || count(*)::text                               as "indeks",
  coalesce(string_agg(idx.ad, ', ') filter (where p.indexname is null), '—') as "eksik olan"
from idx
left join pg_indexes p
  on p.schemaname = 'public' and p.indexname = idx.ad
group by dosya
order by dosya;


-- ═══════════════ 4 · TEMİZLİK + KORUMALAR ═══════════════
-- İki soruyu birlikte sorar:
--   a) cleanup-redundant-indexes.sql çalıştı mı? (mükerrer indeksler gitti mi)
--   b) ASIL KORUMALAR hâlâ yerinde mi?
--
-- (b) kritik. Temizlik, mükerrer indeksleri sildi çünkü aynı garantiyi veren
-- UNIQUE KISITLAR zaten vardı. O kısıtlardan biri bir şekilde düşmüşse, kopya
-- da silinmiş olduğu için tablo KORUMASIZ kalır — çift takip, çift kayıt
-- mümkün hâle gelir. "Kopyayı sildim" ancak "aslı duruyor" ise doğrudur.

select 'Mükerrer indeks temizliği' as "kontrol",
       case when count(*) = 0 then '✅ ÇALIŞTI'
            else '⏳ ÇALIŞMAMIŞ (' || count(*)::text || ' mükerrer indeks duruyor)' end as "durum",
       coalesce(string_agg(indexname, ', '), '—') as "ayrıntı"
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'uq_follows_pair','uq_bookmarks_user_post','uq_notifications_like',
    'idx_fact_likes_user','idx_post_likes_user','idx_fact_reposts_user',
    'idx_follows_follower_following','idx_bookmarks_user_post','idx_users_username',
    'idx_spotify_created','idx_youtube_created','idx_bookmarks_user','idx_comments_user',
    'idx_conv_user1','idx_conv_user2','idx_blocks_blocker','idx_stories_expires',
    'idx_stories_active','idx_page_views_created','idx_msg_conv'
  )

union all

-- ⚠ BU SATIR '✅' DEMİYORSA HER ŞEYİ BIRAK. Beş korumanın hepsi olmalı.
select 'Asıl UNIQUE korumaları',
       case when count(*) = 5 then '✅ SAĞLAM (5/5)'
            else '❌ EKSİK (' || count(*)::text || '/5) — ÇİFT KAYIT RİSKİ' end,
       coalesce(string_agg(conname, ', '), 'HİÇBİRİ YOK')
from pg_constraint
where conname in (
  'follows_follower_id_following_id_key',
  'bookmarks_user_id_post_id_key',
  'fact_likes_pkey',
  'post_likes_pkey',
  'users_username_key'
);


-- ═══════════════ 5 · KOLON TARAMASI ═══════════════
--
-- 🚨 NEDEN EKLENDİ (26.08.2026 denetimi — denetimin EN DEĞERLİ çıktısı):
-- `messages.media_path` eksikliği üç denetim turu boyunca gözden kaçtı ve
-- sonunda TESADÜFEN, bir select hatasından bulundu. Tarama yapılınca 47/47
-- tablo canlıda çıktı ama `add column` ile eklenen 31 kolonun 30'u vardı,
-- biri yoktu. Yani boşluk tam olarak birdi — ve onu bilmenin yolu, kimsenin
-- çalıştırmadığı 30 saniyelik bu sorguydu.
--
-- ⛔ NEDEN ÖNEMLİ: bir kolonu SELECT'e eklemek, kolon YOKKEN supabase-js'te
--    sorgunun TAMAMINI düşürür ve `data` NULL olur — hata fırlatmaz. Yani
--    "kolonu ekledim, kod da okuyor" demek, kolon canlıda yoksa özelliğin
--    SESSİZCE ölü olması demektir. Bu şekilde iki regresyon üretildi:
--    hesap silmede DM medyası hiç toplanmadı, DM'de hikâye önizlemesi kırıldı.
--
-- ⚠ HER GÜVENLİK GÖÇÜNDEN SONRA BUNU ÇALIŞTIR. "Kapatıldı" beyanı kod
--   okumasına dayanıyorsa güvenilir değildir.
select
  b.tablo,
  b.kolon,
  case when c.column_name is null then '❌ YOK — göç bekliyor' else '✅ var' end as durum,
  b.hangi_dosya
from (values
  ('stories',          'media_path',   'sql/features-story-private-media.sql'),
  ('story_highlights', 'cover_path',   'sql/features-story-private-media.sql'),
  ('messages',         'media_path',   'sql/features-dm-private-media.sql'),
  ('messages',         'media_url',    'sql/features-dm-media.sql'),
  ('messages',         'story_id',     'sql/features-story-highlights-reply.sql'),
  ('stories',          'audience',     'sql/features-story-audience.sql'),
  ('stories',          'poll_options', 'sql/features-story-poll.sql'),
  ('users',            'gender',       'sql/features-gender.sql'),
  ('users',            'birthdate',    'sql/features-age-gate.sql'),
  ('users',            'dm_privacy',   'sql/features-dm-privacy.sql'),
  ('did_you_know',     'active',       'sql/features-dyk-quiz.sql'),
  ('quiz_questions',   'correct_index','sql/features-dyk-quiz.sql')
) as b(tablo, kolon, hangi_dosya)
left join information_schema.columns c
  on c.table_schema = 'public' and c.table_name = b.tablo and c.column_name = b.kolon
order by durum desc, b.tablo;


-- ═══════════════ 6 · REALTIME + RLS ═══════════════
--
-- 🚨 NEDEN: 19.08.2026'da gerçek bir sızıntı yaşandı — RLS AÇIK ama POLİTİKA
-- YOKSA realtime satırları SÜZMEDEN yayınlıyor; her tarayıcı tüm DM'leri
-- alıyordu. O olay kapatıldı, ama yayına SONRADAN eklenen bir tablo hiçbir
-- denetimde görünmez. Bu sorgu tam olarak o kör noktayı kapatır.
--
-- OKUMA: `politika_sayisi = 0` olan HER satır o günkü sızıntının aynısıdır.
select
  t.tablename                                    as tablo,
  case when c.relrowsecurity then 'açık' else '❌ KAPALI' end as rls,
  (select count(*) from pg_policies p
    where p.schemaname = 'public' and p.tablename = t.tablename) as politika_sayisi,
  case
    when not c.relrowsecurity                    then '🔴 RLS KAPALI — yayında herkese açık'
    when (select count(*) from pg_policies p
          where p.schemaname = 'public' and p.tablename = t.tablename) = 0
                                                 then '🔴 RLS açık ama 0 POLİTİKA — SÜZMEDEN yayınlar'
    else '✅ politikalı'
  end as durum
from pg_publication_tables t
join pg_class c on c.relname = t.tablename
join pg_namespace n on n.oid = c.relnamespace and n.nspname = t.schemaname
where t.pubname = 'supabase_realtime' and t.schemaname = 'public'
order by durum desc, tablo;


-- ═══════════════ 6b · POLİTİKALARIN İÇERİĞİ ═══════════════
--
-- 🚨 6. BÖLÜM TEK BAŞINA YETMEZ — 26.08.2026'da fark edildi.
-- O sorgu politika SAYISINI veriyor, İÇERİĞİNİ değil. `using (true)` diye bir
-- politika da "1 politika" olarak sayılır ve Temmuz'daki sızıntının AYNISINI
-- üretir: realtime satırları süzmeden yayınlar.
--
-- OKUMA: `ifade` sütununda `true` yazan HER satır, politikası yokmuş gibidir.
-- Beklenen: her politika `auth.uid()` (veya eşdeğeri) ile satırı ÇAĞIRANA
-- bağlamalı. `messages` için "konuşmanın tarafı mıyım", `notifications` için
-- "bildirim bana mı ait" anlamına gelen bir ifade görmelisin.
select
  p.tablename                                  as tablo,
  p.policyname                                 as politika,
  p.cmd                                        as islem,
  coalesce(p.qual, '(yok)')                    as ifade,
  case
    when p.qual is null                        then '⚠ USING yok (INSERT politikası olabilir)'
    when btrim(lower(p.qual)) in ('true', '(true)') then '🔴 using(true) — SÜZMÜYOR, politikasız gibi'
    when p.qual ilike '%auth.uid()%'           then '✅ çağırana bağlı'
    else '⚠ elle oku — auth.uid() geçmiyor'
  end                                          as durum
from pg_policies p
where p.schemaname = 'public'
  and p.tablename in (
    select t.tablename from pg_publication_tables t
    where t.pubname = 'supabase_realtime' and t.schemaname = 'public'
  )
order by p.tablename, p.policyname;
