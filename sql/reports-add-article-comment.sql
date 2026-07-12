-- ============================================================================
-- Basements — reports.target_type'a 'article_comment' ekle
-- Supabase SQL Editor'da BIR KEZ calistir. Idempotent (tekrar guvenli).
-- Neden: makale yorumlari (article_comments) ayri bir tablo; id'leri normal
-- gonderi yorumlari (comments) ile ayni sayi-uzayini paylasir. 'comment' turu
-- ikisini ayirt edemez, bu yuzden makale yorumu sikayeti icin ayri tur gerekir.
-- (Yeni kurulumda features-block-report.sql zaten bu turu icerir; bu dosya
--  daha once o SQL'i calistirmis mevcut kurulumlar icindir.)
-- ============================================================================

alter table public.reports drop constraint if exists reports_target_type_check;
alter table public.reports add constraint reports_target_type_check
  check (target_type in ('post','comment','user','article','article_comment'));

-- ============================================================================
-- BITTI. Calisinca makale altindaki Tartisma yorumlarinda "Sikayet" aktif olur
-- ve /yonetim/sikayetler kuyrugunda "Makale yorumu" olarak gorunur.
-- ============================================================================
