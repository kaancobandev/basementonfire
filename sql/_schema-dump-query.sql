-- ═══════════════════════════════════════════════════════════════════════════
-- ŞEMA DÖKÜM SORGUSU  (araç dosyası — şemayı DEĞİŞTİRMEZ, sadece OKUR)
--
-- Çıktısı `sql/schema.sql` dosyasının içeriğidir. Supabase SQL Editor'da
-- çalıştır, sonucu kopyala.
--
-- NEDEN pg_dump DEĞİL: `supabase db dump` sunucu sürümüyle eşleşen pg_dump'ı
-- konteynerde çalıştırmak için Docker ister; Docker da Windows'ta WSL2 ister
-- (yönetici hakkı + yeniden başlatma). Bu sorgu aynı bilgiyi katalogdan
-- doğrudan okur ve hiçbir kuruluma ihtiyaç duymaz.
--
-- SINIRLARI (dürüstçe): pg_dump'ın birebir yerine geçmez. Kapsamadıkları:
-- sequence sahiplikleri, GRANT/REVOKE izinleri, extension'lar, view/materialized
-- view, composite type'lar, ve `public` DIŞINDAKİ şemalar. Kapsadıkları
-- (tablolar, kolonlar, tipler, default'lar, kısıtlar, index'ler, RLS + politikalar,
-- fonksiyonlar, trigger'lar) bu proje için yeniden kurulum ve `git diff` ile
-- sapma takibi amacına yeter.
--
-- VERİ İÇERMEZ: yalnızca yapı döker, tek bir satır kullanıcı verisi çıkmaz.
-- (KVKK açısından önemli — users tablosunda e-posta ve doğum tarihi var.)
-- ═══════════════════════════════════════════════════════════════════════════

with cols as (
  select c.relname as tbl,
         string_agg(
           '  ' || quote_ident(a.attname) || ' ' ||
           format_type(a.atttypid, a.atttypmod) ||
           coalesce(' default ' || pg_get_expr(ad.adbin, ad.adrelid), '') ||
           case when a.attnotnull then ' not null' else '' end,
           E',\n' order by a.attnum
         ) as body
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
    left join pg_attrdef ad on ad.adrelid = c.oid and ad.adnum = a.attnum
   where n.nspname = 'public' and c.relkind = 'r'
   group by c.relname
)

-- 1 · TABLOLAR
select 1 as bolum, tbl as sira,
       'create table if not exists public.' || quote_ident(tbl) || E' (\n' || body || E'\n);' as ddl
  from cols

union all

-- 2 · KISITLAR (primary key, unique, foreign key, check)
select 2, c.relname,
       'alter table public.' || quote_ident(c.relname) ||
       ' add constraint ' || quote_ident(con.conname) || ' ' ||
       pg_get_constraintdef(con.oid) || ';'
  from pg_constraint con
  join pg_class c on c.oid = con.conrelid
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public'

union all

-- 3 · INDEX'LER (kısıtların arkasındaki index'ler hariç — onlar 2. bölümde geldi)
select 3, tablename, indexdef || ';'
  from pg_indexes
 where schemaname = 'public'
   and indexname not in (
     select con.conname
       from pg_constraint con
       join pg_class c on c.oid = con.conrelid
       join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
   )

union all

-- 4 · RLS AÇIK OLAN TABLOLAR
select 4, c.relname,
       'alter table public.' || quote_ident(c.relname) || ' enable row level security;'
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity

union all

-- 5 · RLS POLİTİKALARI
select 5, pol.tablename,
       'create policy ' || quote_ident(pol.policyname) ||
       ' on public.' || quote_ident(pol.tablename) ||
       ' as ' || pol.permissive ||
       ' for ' || pol.cmd ||
       ' to ' || array_to_string(pol.roles, ', ') ||
       coalesce(' using (' || pol.qual || ')', '') ||
       coalesce(' with check (' || pol.with_check || ')', '') || ';'
  from pg_policies pol
 where pol.schemaname = 'public'

union all

-- 6 · FONKSİYONLAR
select 6, p.proname, pg_get_functiondef(p.oid) || ';'
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.prokind = 'f'

union all

-- 7 · TRIGGER'LAR — public DIŞINDAKİ tablolar DA dahil.
-- ÖNEMLİ: kayıt akışında `public.users` satırı `auth.users` üzerindeki bir
-- trigger ile oluşuyor (bkz. app/api/auth/register/route.ts yorumu). Yalnız
-- `public` şemasını döken bir pg_dump o trigger'ı KAÇIRIRDI; bu bölüm onu da
-- yakalar. Şema adı ddl metninde zaten yazılı olur.
select 7, c.relname, pg_get_triggerdef(t.oid) || ';'
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
 where not t.tgisinternal
   and (n.nspname = 'public' or t.tgfoid in (
     select p.oid from pg_proc p join pg_namespace pn on pn.oid = p.pronamespace
      where pn.nspname = 'public'
   ))

 order by 1, 2;
