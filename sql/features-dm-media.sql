-- ============================================================================
-- Basements — Direkt mesajlarda medya (fotograf/video)
-- Supabase SQL Editor'da BIR KEZ calistir. Idempotent (tekrar guvenli).
--
-- messages tablosuna media_url/media_type eklenir. content ARTIK bos olabilir
-- (yalniz-medya mesaj) ama mesaj ya metin ya da medya TASIMALI. Eski
-- messages_content_check (1..1000) yerine gevsetilmis kisit gelir.
-- ============================================================================

alter table public.messages add column if not exists media_url  text;
alter table public.messages add column if not exists media_type text;

-- Eski "content 1..1000" kisitini kaldir; yerine "content bos OLABILIR ama ya
-- metin ya medya olmali" kisitini koy. Mevcut satirlarin hepsi content>=1
-- oldugundan yeni kisidi zaten saglar (gecis guvenli).
do $$
begin
  if exists (select 1 from pg_constraint where conname = 'messages_content_check') then
    alter table public.messages drop constraint messages_content_check;
  end if;
end $$;

alter table public.messages
  add constraint messages_content_check check (
    char_length(content) <= 1000
    and (char_length(content) >= 1 or media_url is not null)
  );

-- media_type yalniz bilinen degerler.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'messages_media_type_check') then
    alter table public.messages add constraint messages_media_type_check check (
      media_type is null or media_type in ('image', 'video')
    );
  end if;
end $$;
