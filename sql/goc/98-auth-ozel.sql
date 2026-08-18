-- ════════════════════════════════════════════════════════════════════
-- ESKİ projede çalıştır: auth ve storage şemalarında ÖZEL ne var?
--
-- NEDEN: resmî döküm bu iki şemanın YAPISINI taşımaz — yeni projede
-- zaten varlar. Dokümanın kendi uyarısı: "auth ve storage şemalarını
-- değiştirdiyseniz (trigger, RLS politikası eklediyseniz) bunları AYRI
-- geri yüklemeniz gerekir."
--
-- Supabase'in önerdiği yol `supabase link` + `db diff` — ama o giriş
-- (access token) istiyor. Aynı bilgi doğrudan katalogdan okunabiliyor;
-- bu sorgu onu yapıyor, giriş gerekmiyor.
--
-- BEKLENEN: en az `handle_new_user` trigger'ı çıkmalı. Repoda karşılığı
-- var: sql/fix-handle-new-user.sql — göçten sonra YENİ projede çalıştır.
-- Başka bir şey çıkarsa, onun da elle taşınması gerekir.
-- ════════════════════════════════════════════════════════════════════

-- ── 1) auth/storage üzerindeki ÖZEL trigger'lar ────────────────────
-- tgisinternal = false → sistemin kendi FK trigger'ları elenir.
select n.nspname as sema, c.relname as tablo, t.tgname as trigger_adi,
       pg_get_triggerdef(t.oid) as tanim
from pg_trigger t
join pg_class c     on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('auth','storage')
  and not t.tgisinternal
order by n.nspname, c.relname, t.tgname;

-- ── 2) auth/storage üzerindeki RLS politikaları ────────────────────
-- storage.objects politikaları burada çıkar — bucket erişim kurallarıdır
-- ve yeni projede YOKTUR. Çıkanları not al, yeni projede yeniden kur.
select schemaname as sema, tablename as tablo, policyname as politika,
       cmd as islem, roles as roller,
       coalesce(qual, '—')       as using_kosulu,
       coalesce(with_check, '—') as with_check_kosulu
from pg_policies
where schemaname in ('auth','storage')
order by schemaname, tablename, policyname;

-- ── 3) auth/storage'da ÖZEL fonksiyonlar ───────────────────────────
-- handle_new_user genelde public'te durur ama auth'ta da olabilir.
select n.nspname as sema, p.proname as fonksiyon
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('auth','storage')
  and p.prokind = 'f'
  and p.proname not like 'pg_%'
order by n.nspname, p.proname;
