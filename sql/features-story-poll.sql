-- ============================================================================
-- Basements — Hikayede anket/soru sticker'ı
-- Supabase SQL Editor'da BIR KEZ calistir. Idempotent (tekrar guvenli).
--
-- YENİ OY TABLOSU YOK: hikaye anketi mevcut article_poll_votes tablosunu
-- poll_key = 'story-<id>' ile kullanir (feed gonderi anketleri 'post-<id>' ile
-- ayni tabloyu kullaniyor — lib/polls.ts). Oy olarak secenek METNI degil INDEKS
-- ('0'..'3') saklanir, boylece secenek metni degisse bile oylar tutarli kalir ve
-- istemciden gelen serbest metin asla DB'ye girmez.
--
-- Bu dosya yalnizca hikayeye anketin SORUSUNU + SECENEKLERINI ekler.
-- ============================================================================

alter table public.stories
  add column if not exists poll_question text,
  -- Secenek metinleri (2-4). jsonb dizi. Oylar article_poll_votes'ta indeks olarak.
  add column if not exists poll_options  jsonb;

-- Soru varsa 1-100 karakter olmali (bos soru anketsiz demektir).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'stories_poll_question_check') then
    alter table public.stories add constraint stories_poll_question_check check (
      poll_question is null or char_length(btrim(poll_question)) between 1 and 100
    );
  end if;
end $$;
