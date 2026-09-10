-- ============================================================
-- AKIŞTA QUIZ SONUCU GÖNDERİSİ
-- ============================================================
-- Amaç: makale quizini bitiren okur skorunu akışta paylaşabilsin —
-- "✅ 3/3 · Kuantum Dolanıklık quizi" çipi + makalenin kendi emojisi +
-- gören kişiye "Ben de deneyeyim" bağlantısı. Okumayı teşvik eden döngü:
-- gönderi → makale → quiz → yeni gönderi.
--
-- Bugün mümkün değil: `posts` tablosunda gönderiyi bir MAKALEYE bağlayacak
-- hiçbir alan yok (id, user_id, content, image_url, category, likes,
-- created_at, reposts). İçerikte URL de yok, yani metinden de çıkarılamıyor.
--
-- ────────────────────────────────────────────────────────────
-- ⚠ NEDEN GÖMÜLÜ TABLO DEĞİL, `posts` ÜSTÜNDE KOLON
-- ────────────────────────────────────────────────────────────
-- Anketler (post_polls) ayrı tabloda ve gönderiye embed ile bağlanıyor.
-- Bunun CANLIDA ŞU AN SÜREN bir hatası var, kodu okuyup doğruladım:
--
--   lib/feedData.ts:55       -> select('*, ..., post_polls(options)')   ✅ embed VAR
--   app/api/feed/route.ts:59 -> select('*, ...')                        ❌ embed YOK
--
-- Yani anketler ISR kabuğundaki ilk kartlarda görünüyor, sonsuz kaydırma ya da
-- sekme değişimiyle `/api/feed`ten gelen kartlarda KAYBOLUYOR. İki select'in
-- ayrışması sessiz bir hata; kimse patlamıyor, alan yok oluyor.
--
-- Quiz sonucunu aynı desenle kursaydık aynı hataya düşmeye açık olurduk.
-- DÜZ KOLON bunu yapısal olarak imkânsız kılıyor: iki sorgu da `select('*')`
-- kullanıyor, yani yeni kolonlar HER İKİSİNE de kendiliğinden geliyor.
-- (Anket hatası da ayrıca düzeltiliyor — kod tarafında.)
--
-- ────────────────────────────────────────────────────────────
-- ⚠ SKOR NEDEN SATIRDA SAKLANIYOR (join ile hesaplanmıyor)
-- ────────────────────────────────────────────────────────────
-- İki sebep:
--  1) Okuma anında JOIN yok. Akış sorgusu zaten sıcak yolda ve bu projede
--     gecikme = ardışık tur sayısı. Her quiz gönderisi için ayrı bir
--     article_quiz_answers taraması akışı ağırlaştırırdı.
--  2) Skor bir ANIN beyanı. Okur quizi yarım bırakıp 2/3 paylaşsa, sonra
--     kalanını çözse, türetilmiş skor gönderiyi geriye dönük değiştirirdi —
--     paylaşılan cümle "o gün 2/3 yaptım"dı.
--
-- 🚨 AMA DEĞER İSTEMCİDEN ALINMAZ. Rota, gönderiyi yazmadan ÖNCE skoru
--    article_quiz_answers + quiz_questions üzerinden KENDİ hesaplar; istemci
--    yalnız hangi makale olduğunu söyler. Aksi halde herkes 10/10 iddia ederdi.
--    Kolonlar o hesabın anlık görüntüsü, kullanıcının beyanı DEĞİL.
-- ============================================================


-- ── 1) GÖNDERİYİ MAKALEYE BAĞLAYAN ALAN ──────────────────────────────────
-- Makaleler KODDA tanımlı (lib/articles.ts), tabloda değil → FK yok.
-- Doğrulama rota tarafında `isArticleSlug(slug)` ile yapılıyor.
alter table public.posts add column if not exists article_slug text;


-- ── 2) SKORUN ANLIK GÖRÜNTÜSÜ ────────────────────────────────────────────
-- İkisi de NULL olabilir: `article_slug` dolu ama skor boş bir gönderi
-- "makaleyi paylaştım" demektir (ileride kullanılabilir), quiz sonucu değil.
alter table public.posts add column if not exists quiz_correct smallint;
alter table public.posts add column if not exists quiz_total   smallint;

-- Tutarlılık: ya ikisi de dolu ve doğru sayısı toplamı aşmıyor, ya ikisi de boş.
-- Ayrıca skor varsa makale de belli olmalı — "3/3" tek başına anlamsız.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'posts_quiz_skoru_tutarli'
  ) then
    alter table public.posts add constraint posts_quiz_skoru_tutarli check (
      (quiz_correct is null and quiz_total is null)
      or (
        quiz_correct is not null and quiz_total is not null
        and quiz_total > 0
        and quiz_correct >= 0
        and quiz_correct <= quiz_total
        and article_slug is not null
      )
    );
  end if;
end $$;


-- ── 3) İNDEKS: BİLEREK EKLENMEDİ ─────────────────────────────────────────
-- Akış `created_at desc` ile sıralanıyor ve `article_slug`e göre HİÇ
-- filtrelenmiyor — alan yalnızca okunuyor. İleride "bu makaleyi kimler
-- paylaşmış" gibi bir sorgu gelirse şu eklenebilir:
--   create index posts_article_slug_idx on public.posts (article_slug)
--     where article_slug is not null;
-- Kullanılmayan indeks her INSERT'e bedel bindirir, o yüzden şimdi yok.


-- ── 4) KONTROL ───────────────────────────────────────────────────────────
-- Göç çalıştıktan sonra:
--   select column_name, data_type from information_schema.columns
--    where table_name = 'posts' and column_name in ('article_slug','quiz_correct','quiz_total');
--   -> üç satır
--
-- Kısıt gerçekten tutuyor mu (ikisi de HATA vermeli):
--   insert into public.posts (user_id, content, quiz_correct, quiz_total)
--     values (<id>, 'test', 5, 3);            -- doğru > toplam
--   insert into public.posts (user_id, content, quiz_correct, quiz_total)
--     values (<id>, 'test', 2, 3);            -- article_slug yok
