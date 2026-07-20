-- ============================================================================
-- Basements — Hikayeye muzik ekleme
-- Supabase SQL Editor'da BIR KEZ calistir. Idempotent (tekrar guvenli).
--
-- TELIF NOTU (bu dosyanin var olma sebebi):
-- /muzik calma listesi TAMAMEN kullanici yuklemesidir ve yuklerken hicbir
-- telif kontrolu yoktur. O havuzun TAMAMINI hikaye muzik secicisine acmak
-- siteyi "barindiran" konumdan "muzik kutuphanesi SUNAN" konuma tasir; tek
-- bir korsan mp3 butun hikaye akisina yayilir. Bu yuzden secici YALNIZCA
-- asagidaki `story_approved` bayragi acilmis parcalari gosterir. Varsayilan
-- FALSE: yeni yuklenen hicbir parca kendiliginden hikayelere gecmez.
-- ============================================================================

-- 1) Onay bayragi — yalnizca isaretli parcalar hikaye seciciye girer
alter table public.music_tracks
  add column if not exists story_approved boolean not null default false;

-- Secici sorgusu bunu kullanir: WHERE story_approved
create index if not exists idx_music_tracks_story_approved
  on public.music_tracks (story_approved, created_at desc)
  where story_approved;

-- 2) Hikayeye muzik alanlari
--    music_track_id: FK -> music_tracks. Parca SILINIRSE hikaye kalir,
--    yalnizca muzigi duser (set null) — hikaye kaybolmamali.
--    music_start_sec: parcanin kacinci saniyesinden baslayacagi (Instagram'da
--    da klip secilir). Hikaye 5 sn gosterildigi icin klip de kisa calar.
alter table public.stories
  add column if not exists music_track_id  bigint references public.music_tracks(id) on delete set null,
  add column if not exists music_start_sec integer not null default 0;

-- Negatif baslangic olmasin
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'stories_music_start_sec_check'
  ) then
    alter table public.stories
      add constraint stories_music_start_sec_check check (music_start_sec >= 0);
  end if;
end $$;

-- ============================================================================
-- KULLANIM: bir parcayi hikayelere acmak icin (kimlikleri /muzik sayfasindan
-- ya da asagidaki listeden alabilirsin):
--
--   select id, title, artist from public.music_tracks order by created_at desc;
--   update public.music_tracks set story_approved = true where id in (1, 2, 3);
--
-- Geri almak icin: update public.music_tracks set story_approved = false where id = 1;
-- ============================================================================
