-- ============================================================================
-- Basements — Hikaye QUIZ sticker'i (dogru cevapli anket)
-- Supabase SQL Editor'da BIR KEZ calistir. Idempotent (tekrar guvenli).
--
-- Quiz = mevcut hikaye anketi + BIR dogru cevap. poll_question/poll_options
-- zaten var (features-story-poll.sql); burada yalnizca dogru secenegin INDEKSINI
-- tutan kolon eklenir. null = normal anket (quiz degil). Oylar yine
-- article_poll_votes'ta (poll_key='story-<id>'), indeks olarak saklanir.
-- ============================================================================

alter table public.stories
  add column if not exists poll_correct smallint;

-- poll_options en cok 4 secenek → gecerli indeks 0..3. null serbest.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'stories_poll_correct_range') then
    alter table public.stories add constraint stories_poll_correct_range check (
      poll_correct is null or (poll_correct >= 0 and poll_correct <= 3)
    );
  end if;
end $$;
