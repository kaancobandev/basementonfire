-- ═══════════════════════════════════════════════════════════════════════════
-- DENETİM DÜZELTMELERİ — 2026-07-18
--
-- Supabase SQL Editor'da çalıştır. Dosya idempotent: istediğin kadar tekrar
-- çalıştırabilirsin.
--
-- CONCURRENTLY BİLİNÇLİ OLARAK KULLANILMADI. Ölçülen tablo boyutları
-- (2026-07-18): users 5, quick_facts 7, posts 4, messages 10, conversations 3,
-- follows 4, notifications 5, stories 2, article_poll_votes 6, page_views 835.
-- Bu ölçekte düz `create index` kilidi mikrosaniye sürer; CONCURRENTLY ise
-- Supabase SQL Editor'ın sardığı transaction içinde ÇALIŞMAZ ve her ifadeyi
-- tek tek çalıştırmanı gerektirirdi. Gereksiz zorluk, sıfır fayda.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- DURUM: BU DOSYA 2026-07-18'DE ÇALIŞTIRILDI VE DOĞRULANDI.
-- Tekrar çalıştırmak zararsız (idempotent) ama gerekmiyor.
--
-- Doğrulanan sonuçlar:
--  · 7 index'in 7'si oluştu (aşağıdaki doğrulama sorgusuyla teyit edildi).
--  · RLS tüm çekirdek tablolarda AÇIK (ayrıca anon vs service-role satır
--    sayısı karşılaştırmasıyla bağımsız olarak doğrulandı: messages 10 satır
--    taşıyor, anon 0 görüyor).
--  · Bölüm 4'ün DDL dökümü alındı → sql/functions-toggles.sql olarak depoda.
--    Beklenen 6 fonksiyondan 5'i geldi; eksik `cast_poll_vote` ve dayandığı
--    polls/poll_options/poll_votes tabloları canlıda hiç yok → gönderi-anketi
--    özelliği hiç bitirilmemiş (kırık değil, uykuda; UI girişi de yok).
--  · Beğeni bildirimi hatasının asıl düzeltmesi KODDA yapıldı (lib/notify.ts);
--    buradaki kısmi unique index yalnızca yarış korumasıdır.
-- ═══════════════════════════════════════════════════════════════════════════
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────
-- BÖLÜM 0 — TEŞHİS (önce bunu çalıştır, hiçbir şeyi değiştirmez)
-- ─────────────────────────────────────────────────────────────────────────

-- 0.1 RLS durumu.
-- NOT: 2026-07-18'de anon anahtarla ÖLÇÜLDÜ ve çekirdek tabloların hepsinde
-- RLS'in AÇIK olduğu doğrulandı (messages'ta 10 satır var, anon 0 görüyor).
-- Bu sorgu yeni bir ortam kurduğunda aynı kontrolü tekrarlaman için burada.
select c.relname as tablo,
       c.relrowsecurity as rls_acik,
       c.relforcerowsecurity as rls_zorunlu,
       (select count(*) from pg_policies p
         where p.schemaname = 'public' and p.tablename = c.relname) as policy_sayisi
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public' and c.relkind = 'r'
 order by c.relrowsecurity, c.relname;

-- 0.2 notifications üzerindeki kısıtlar/index'ler.
-- Beklenen: (user_id, actor_id, post_id) üzerinde UNIQUE YOK. Eski kod
-- `upsert(onConflict: 'user_id,actor_id,post_id')` kullandığı için her beğeni
-- bildirimi 42P10 ile sessizce düşüyordu. Kod tarafı düzeltildi (lib/notify.ts).
select indexname, indexdef
  from pg_indexes
 where schemaname = 'public' and tablename = 'notifications';

-- 0.3 Hangi RPC fonksiyonları canlıda var? (Depoda kaynağı YOK — bkz. Bölüm 4)
select p.proname as fonksiyon
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname in ('toggle_fact_like','toggle_post_like','toggle_post_repost',
                     'cast_poll_vote','login_dashboard','traffic_dashboard')
 order by 1;

-- 0.4 Mevcut index'ler (aşağıda ekleyeceklerimden hangisi zaten var?)
select tablename, indexname
  from pg_indexes
 where schemaname = 'public'
   and tablename in ('comments','stories','page_views','follows','bookmarks',
                     'article_comments','messages','notifications')
 order by tablename, indexname;


-- ─────────────────────────────────────────────────────────────────────────
-- BÖLÜM 1 — Beğeni bildirimleri (yarış koruması)
--
-- Asıl hata KODDA düzeltildi: lib/notify.ts artık upsert yerine açık
-- "var mı? yoksa ekle" yapıyor. Bu index yalnızca eşzamanlı iki beğeninin
-- çift satır yaratmasını engeller.
--
-- KISMİ (partial) olması ŞART: 'comment' bildirimleri de post_id taşıyor ve
-- aynı gönderiye ikinci yorum aynı (user_id, actor_id, post_id) üçlüsünü
-- üretir. Tam index koysaydık ikinci yorumun bildirimi unique ihlaliyle
-- DÜŞERDİ — bir hatayı kapatırken yenisini açardık.
-- ─────────────────────────────────────────────────────────────────────────

-- Önce olası çift 'like' satırlarını temizle (şu an 0 tane, ama idempotent olsun)
delete from public.notifications a
 using public.notifications b
 where a.type = 'like' and b.type = 'like'
   and a.post_id is not null and a.post_id = b.post_id
   and a.user_id = b.user_id and a.actor_id = b.actor_id
   and a.id > b.id;

create unique index if not exists uq_notifications_like
  on public.notifications (user_id, actor_id, post_id)
  where type = 'like';


-- ─────────────────────────────────────────────────────────────────────────
-- BÖLÜM 2 — Veri bütünlüğü: çift kayıt üreten yarışlar
--
-- Üç uç da "önce SELECT, yoksa INSERT" deseniyle çalışıyor. Aradaki boşlukta
-- ikinci bir istek gelirse çift satır oluşur ve takipçi/kaydetme sayaçları
-- kalıcı olarak yanlışlanır. DB düzeyinde kısıt tek kesin çözüm.
-- ─────────────────────────────────────────────────────────────────────────

delete from public.follows a
 using public.follows b
 where a.follower_id = b.follower_id and a.following_id = b.following_id
   and a.id > b.id;

create unique index if not exists uq_follows_pair
  on public.follows (follower_id, following_id);

-- Kendini takip etmeyi DB düzeyinde de kapat (route zaten engelliyor, bu ikinci savunma)
alter table public.follows drop constraint if exists follows_no_self;
alter table public.follows add constraint follows_no_self
  check (follower_id <> following_id) not valid;

delete from public.bookmarks a
 using public.bookmarks b
 where a.user_id = b.user_id and a.post_id = b.post_id and a.id > b.id;

create unique index if not exists uq_bookmarks_user_post
  on public.bookmarks (user_id, post_id);


-- ─────────────────────────────────────────────────────────────────────────
-- BÖLÜM 3 — Eksik index'ler
-- ─────────────────────────────────────────────────────────────────────────

-- comments.parent_id: yanıt silme (reports/remove-content) bu kolonla filtreliyor,
-- tek index (post_id, created_at) idi.
create index if not exists idx_comments_parent
  on public.comments (parent_id) where parent_id is not null;

create index if not exists idx_comments_user_created
  on public.comments (user_id, created_at desc);

-- stories: sorgu `expires_at > now() ORDER BY created_at DESC` — iki AYRI index
-- vardı, ikisi tek sorguda birleşemiyordu.
create index if not exists idx_stories_expires_created
  on public.stories (expires_at, created_at desc);

-- page_views: traffic_dashboard `count(distinct visitor_hash)` yapıyor.
-- 835 satırda sorun değil ama tek büyüyen tablo bu.
create index if not exists idx_page_views_created_hash
  on public.page_views (created_at desc, visitor_hash);


-- ─────────────────────────────────────────────────────────────────────────
-- BÖLÜM 4 — RPC fonksiyonlarını DEPOYA AL (çıktıyı dosyaya yapıştır)
--
-- toggle_fact_like / toggle_post_like / toggle_post_repost / cast_poll_vote
-- fonksiyonlarının kaynağı depoda HİÇ YOK. Beğeni ve oylama uçları tamamen
-- bunlara dayanıyor. Supabase projesi yeniden kurulur ya da bir migration
-- fonksiyonu düşürürse beğeni TÜM sitede ölür ve gövdesi hiçbir yerde yazılı
-- olmadığı için geri getirilemez — sıfırdan tahmin edilerek yazılması gerekir.
--
-- Aşağıdaki sorgunun çıktısını `sql/functions-toggles.sql` olarak depoya ekle.
-- (`create or replace function` zaten idempotenttir.)
-- ─────────────────────────────────────────────────────────────────────────

select pg_get_functiondef(p.oid) as ddl
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.proname in ('toggle_fact_like','toggle_post_like','toggle_post_repost',
                     'cast_poll_vote','login_dashboard','traffic_dashboard')
 order by p.proname;


-- ─────────────────────────────────────────────────────────────────────────
-- BÖLÜM 5 — Bakım: yetim şikayetler
--
-- reports.target_id polimorfik olduğu için FK YOK (olamaz da). İçerik sahibi
-- kendi gönderisini silince şikayet 'open' olarak kuyrukta asılı kalıyor ve
-- /yonetim/sikayetler'de tıklanınca hiçbir şey açmıyor.
-- ─────────────────────────────────────────────────────────────────────────

update public.reports r
   set status = 'dismissed'
 where r.status = 'open'
   and (
     (r.target_type = 'post'    and not exists (select 1 from public.quick_facts   x where x.id = r.target_id))
  or (r.target_type = 'comment' and not exists (select 1 from public.comments      x where x.id = r.target_id))
  or (r.target_type = 'user'    and not exists (select 1 from public.users         x where x.id = r.target_id))
  or (r.target_type = 'article' and not exists (select 1 from public.user_articles x where x.id = r.target_id))
   );


-- ═══════════════════════════════════════════════════════════════════════════
-- DOĞRULAMA — hepsi çalıştıktan sonra
-- ═══════════════════════════════════════════════════════════════════════════

-- Eklenen kısıtlar yerinde mi?
select indexname from pg_indexes
 where schemaname = 'public'
   and indexname in ('uq_notifications_like','uq_follows_pair','uq_bookmarks_user_post',
                     'idx_comments_parent','idx_comments_user_created',
                     'idx_stories_expires_created','idx_page_views_created_hash')
 order by 1;
-- 7 satır dönmeli.

-- Beğeni bildirimi artık üretiliyor mu? (kod düzeltmesinden SONRA bir beğeni yap)
select type, count(*) from public.notifications group by type order by 1;
-- 'like' satırı görünmeye başlamalı. 2026-07-18 öncesi: hiç yoktu.
