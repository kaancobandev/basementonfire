-- ═══════════════════════════════════════════════════════════════════════════
-- ŞEMA DÖKÜM SORGULARI  (araç dosyası — şemayı DEĞİŞTİRMEZ, sadece OKUR)
--
-- YEDİ AYRI SORGU. Her birini TEK BAŞINA çalıştır (aralarındaki çizgiye kadar
-- olan kısmı seçip Run). Hepsini birden çalıştırma — biri hata verirse
-- diğerlerinin çıktısını da kaybedersin.
--
-- Not: önceki sürüm yedisini tek `union all` içinde birleştiriyordu ve
-- "relation public does not exist" hatası veriyordu; birleşik yapı hatanın
-- hangi bölümden geldiğini de gizliyordu. Bölünmüş hâli hem çalışır hem
-- teşhis edilebilir.
--
-- VERİ İÇERMEZ: yalnızca yapı. (users tablosunda e-posta ve doğum tarihi var —
-- veri içeren bir dosya git'e girmemeli.)
--
-- SINIRLARI: pg_dump'ın birebir yerine geçmez. Kapsamaz: sequence sahiplikleri,
-- GRANT/REVOKE, extension'lar, view'ler, composite type'lar.
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- SORGU 1 · TABLOLAR + KOLONLAR
-- ───────────────────────────────────────────────────────────────────────────
select c.relname as tablo,
       string_agg(
         quote_ident(a.attname) || ' ' ||
         format_type(a.atttypid, a.atttypmod) ||
         coalesce(' default ' || pg_get_expr(ad.adbin, ad.adrelid), '') ||
         case when a.attnotnull then ' not null' else '' end,
         ', ' order by a.attnum
       ) as kolonlar
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
  left join pg_attrdef ad on ad.adrelid = c.oid and ad.adnum = a.attnum
 where n.nspname = 'public'
   and c.relkind = 'r'
 group by c.relname
 order by c.relname;


-- ───────────────────────────────────────────────────────────────────────────
-- SORGU 2 · KISITLAR (primary key, unique, foreign key, check)
-- ───────────────────────────────────────────────────────────────────────────
select c.relname as tablo,
       con.conname as kisit,
       pg_get_constraintdef(con.oid) as tanim
  from pg_constraint con
  join pg_class c on c.oid = con.conrelid
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public'
 order by c.relname, con.conname;


-- ───────────────────────────────────────────────────────────────────────────
-- SORGU 3 · INDEX'LER
-- ───────────────────────────────────────────────────────────────────────────
select tablename as tablo,
       indexname  as index_adi,
       indexdef   as tanim
  from pg_indexes
 where schemaname = 'public'
 order by tablename, indexname;


-- ───────────────────────────────────────────────────────────────────────────
-- SORGU 4 · RLS DURUMU
-- ───────────────────────────────────────────────────────────────────────────
select c.relname          as tablo,
       c.relrowsecurity   as rls_acik,
       c.relforcerowsecurity as rls_zorunlu
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public'
   and c.relkind = 'r'
 order by c.relname;


-- ───────────────────────────────────────────────────────────────────────────
-- SORGU 5 · RLS POLİTİKALARI
-- (Boş dönebilir — bu projede desen "RLS açık + policy yok, erişim yalnız
--  service-role" şeklinde. Boş çıkması beklenen bir sonuç, hata değil.)
-- ───────────────────────────────────────────────────────────────────────────
select tablename  as tablo,
       policyname as politika,
       permissive,
       roles,
       cmd,
       qual,
       with_check
  from pg_policies
 where schemaname = 'public'
 order by tablename, policyname;


-- ───────────────────────────────────────────────────────────────────────────
-- SORGU 6 · FONKSİYONLAR
-- (toggle_* fonksiyonları zaten sql/functions-toggles.sql içinde;
--  bu sorgu geri kalanları da yakalar — trigger fonksiyonları dahil.)
-- ───────────────────────────────────────────────────────────────────────────
select p.proname as fonksiyon,
       pg_get_functiondef(p.oid) as tanim
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public'
   and p.prokind = 'f'
 order by p.proname;


-- ───────────────────────────────────────────────────────────────────────────
-- SORGU 7 · TRIGGER'LAR
-- ÖNEMLİ: `public` DIŞINDAKİ tabloları da tarar. Kayıt akışında public.users
-- satırı `auth.users` üzerindeki bir trigger ile oluşuyor (bkz.
-- app/api/auth/register/route.ts). Yalnız public şemasını döken bir pg_dump
-- o trigger'ı KAÇIRIRDI.
-- ───────────────────────────────────────────────────────────────────────────
select n.nspname  as sema,
       c.relname  as tablo,
       t.tgname   as trigger_adi,
       pg_get_triggerdef(t.oid) as tanim
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
 where not t.tgisinternal
 order by n.nspname, c.relname, t.tgname;
