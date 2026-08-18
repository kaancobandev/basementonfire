-- ════════════════════════════════════════════════════════════════════
-- GÖÇ ADIMI 14 — Şema doğrulaması. YENİ projede çalıştır.
--
-- Bu dosya, kesim planındaki SESSİZ arızaların şema tarafını yokluyor.
-- Hepsi tek tek elle kontrol edilmek zorunda çünkü hiçbiri hata vermiyor:
-- site açılır, sayfalar gelir, loglar temizdir ve bir şey bozuktur.
--
-- KULLANIM: Supabase paneli → SQL Editor → yapıştır → Run.
-- Her blok BEKLENEN sonucu yazıyor; tutmayan varsa göç eksik.
-- ════════════════════════════════════════════════════════════════════

-- ── 1) EXTENSION — pg_trgm ─────────────────────────────────────────
-- BEKLENEN: 1 satır. Yoksa trigram index'leri yaratılamamış demektir.
select 'pg_trgm' as kontrol, count(*) as bulundu, '1 olmali' as beklenen
from pg_extension where extname = 'pg_trgm';

-- ── 2) handle_new_user TRIGGER'I ───────────────────────────────────
-- BEKLENEN: 1 satır. YOKSA: mevcut kullanıcılar sorunsuz girer ama
-- HER YENİ KAYIT auth.users'a yazılıp public.users'a YAZILMAZ.
-- Mevcut kullanıcılar çalıştığı için hiçbir alarm çalmaz.
-- Düzeltmesi: sql/fix-handle-new-user.sql
select 'handle_new_user trigger' as kontrol, count(*) as bulundu, '1 olmali' as beklenen
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'auth' and c.relname = 'users' and not t.tgisinternal;

-- ── 3) REALTIME PUBLICATION ────────────────────────────────────────
-- BEKLENEN: notifications ve messages, iki satır.
-- YOKSA: bildirim rozeti ve DM anlık akmaz, yenileyince gelir. Sıfır log.
select 'realtime: ' || tablename as kontrol, 1 as bulundu, 'notifications+messages' as beklenen
from pg_publication_tables
where pubname = 'supabase_realtime' and schemaname = 'public'
order by tablename;

-- ── 4) TABLO SAYISI ────────────────────────────────────────────────
-- BEKLENEN: 48 (uygulamanın kullandığı tablolar) civarı. Çok düşükse
-- şema restore'u yarım kalmış demektir.
select 'public tablo sayisi' as kontrol, count(*) as bulundu, '~48 olmali' as beklenen
from pg_tables where schemaname = 'public';

-- ── 5) RLS AÇIK OLAN TABLOLAR ──────────────────────────────────────
-- Bu listeyi ESKİ projede de çalıştırıp KARŞILAŞTIR. Yeni projede
-- fazladan RLS açık tablo varsa (automatic RLS trigger'ı yüzünden) ve
-- politikası yoksa, o tablo anon istemciye TAMAMEN KAPALI demektir.
-- Etkilenen yüzey: RealtimeProvider, MessagesClient, reset-password.
select tablename, rowsecurity as rls_acik,
       (select count(*) from pg_policies p where p.tablename = t.tablename and p.schemaname='public') as politika_sayisi
from pg_tables t
where schemaname = 'public' and rowsecurity = true
order by politika_sayisi asc, tablename;
-- ⚠ politika_sayisi = 0 OLAN SATIR VARSA: o tablo kilitli. İncele.

-- ── 6) RPC FONKSİYONLARI ───────────────────────────────────────────
-- BEKLENEN: 8 fonksiyon. Kod bunları çağırıyor; eksikse ilgili özellik
-- çalışma anında patlar (anket, hız freni, beğeni, panel sorguları).
select 'rpc: ' || p.proname as kontrol, 1 as bulundu, '8 fonksiyon olmali' as beklenen
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('cast_poll_vote','consume_token','login_dashboard','perf_dashboard',
                    'toggle_fact_like','toggle_post_like','toggle_post_repost','traffic_dashboard')
order by p.proname;

-- ── 7) KALAN ESKİ REF ──────────────────────────────────────────────
-- BEKLENEN: sıfır satır. url-yeniden-yaz.sql sonrası burada bir şey
-- çıkarsa, medya linkleri hâlâ eski projeyi gösteriyor demektir.
-- Eski ref'i buraya yaz:
\set eski_ref 'ESKI_REF_BURAYA'
select 'kalan eski ref' as kontrol, count(*) as bulundu, '0 olmali' as beklenen from (
  select 1 from users         where avatar             like '%'||:'eski_ref'||'%'
  union all select 1 from quick_facts   where media_url    like '%'||:'eski_ref'||'%'
  union all select 1 from quick_facts   where media::text  like '%'||:'eski_ref'||'%'
  union all select 1 from stories       where media_url    like '%'||:'eski_ref'||'%'
  union all select 1 from messages      where media_url    like '%'||:'eski_ref'||'%'
  union all select 1 from music_tracks  where src          like '%'||:'eski_ref'||'%'
  union all select 1 from posts         where image_url    like '%'||:'eski_ref'||'%'
  union all select 1 from did_you_know  where image_url    like '%'||:'eski_ref'||'%'
  union all select 1 from user_articles where cover_url    like '%'||:'eski_ref'||'%'
  union all select 1 from user_articles where doc::text    like '%'||:'eski_ref'||'%'
  union all select 1 from user_articles where pending_edit::text like '%'||:'eski_ref'||'%'
) x;
