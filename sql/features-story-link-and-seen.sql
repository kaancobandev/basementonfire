-- ============================================================================
-- Basements — Hikayede baglanti sticker'i + "gorulmemis" halkasi
-- Supabase SQL Editor'da BIR KEZ calistir. Idempotent (tekrar guvenli).
-- ============================================================================

-- 1) BAGLANTI STICKER'I
--    Hikaye su ana kadar KAPALI DEVREYDI: izlenir, biter, siteye hicbir yere
--    goturmezdi. Bu iki kolon hikayeyi olculebilir bir trafik kaynagina cevirir.
--
--    GUVENLIK: link_url YALNIZCA SITE ICI yol olabilir ('/articles/rome' gibi).
--    Disari acik yonlendirme (open redirect) riski boylece SIFIR olur; kural
--    hem API route'unda hem burada, veritabani seviyesinde zorlanir ki ileride
--    baska bir yazma yolu acilirsa da gecerli kalsin.
alter table public.stories
  add column if not exists link_url   text,
  add column if not exists link_label text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'stories_link_url_internal_check') then
    alter table public.stories add constraint stories_link_url_internal_check check (
      link_url is null
      -- tek '/' ile baslamali: '//evil.com' protokol-goreli olur ve DISARI cikar,
      -- '/\evil.com' bazi tarayicilarda ayni sekilde yorumlanir -> ikisi de yasak.
      or (link_url ~ '^/[^/\\]' and length(link_url) <= 300)
    );
  end if;
  if not exists (select 1 from pg_constraint where conname = 'stories_link_label_len_check') then
    alter table public.stories add constraint stories_link_label_len_check check (
      link_label is null or (length(btrim(link_label)) between 1 and 40)
    );
  end if;
end $$;

-- 2) "GORULMEMIS" HALKASI
--    Mevcut indeks (idx_story_views_story) story_id uzerinde: "bu hikayeyi kim
--    izledi" sorusuna hizli cevap verir. Halka icin TERS soru gerekiyor:
--    "ben hangilerini gordum" -> viewer_id uzerinde tarama. Indekssiz bu sorgu
--    her feed render'inda tum tabloyu tarardi.
create index if not exists idx_story_views_viewer
  on public.story_views (viewer_id, story_id);
