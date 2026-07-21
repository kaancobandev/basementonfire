-- ============================================================================
-- Basements — Hikayeye başlık/yazı (caption)
-- Supabase SQL Editor'da BIR KEZ calistir. Idempotent (tekrar guvenli).
--
-- caption = fotograf/video hikayenin UZERINE binen yazi. (SADECE-METIN hikaye
-- ayri bir sey: o, yazinin GORSELE gomuldugu bir resim hikayedir, kolon istemez.)
-- ============================================================================

alter table public.stories
  add column if not exists caption text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'stories_caption_len_check') then
    alter table public.stories add constraint stories_caption_len_check check (
      caption is null or char_length(caption) <= 200
    );
  end if;
end $$;
