-- ============================================================================
-- Basements — Hikaye kitle kontrolü (herkes / takipçiler / yakın arkadaşlar)
-- Supabase SQL Editor'da BIR KEZ calistir. Idempotent (tekrar guvenli).
--
-- GIZLILIK NOTU: Bu bir gizlilik ozelligidir. Filtre, hikayenin GORUNDUGU HER
-- yuzeyde elle uygulanir (feed seridi, /api/stories, highlights goruntuleyici) —
-- cunku service-role RLS'i baypas eder (bkz. is-private kurali). Tek bir yuzeyi
-- atlamak sizinti olur; ortak yardimci lib/storyAudience.ts bunu tek yerde tutar.
-- ============================================================================

-- 1) Hikayenin kitlesi. Varsayilan 'public' → mevcut tum hikayeler herkese acik
--    kalir (geri uyumlu). 'followers' = takipciler, 'close' = yakin arkadaslar.
alter table public.stories
  add column if not exists audience text not null default 'public';
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'stories_audience_check') then
    alter table public.stories add constraint stories_audience_check
      check (audience in ('public', 'followers', 'close'));
  end if;
end $$;

-- 2) Yakin arkadaslar. user_id = listeyi TUTAN, friend_id = listedeki kisi.
--    'close' kitlesi: friend_id benim oldugum satirlarin user_id'leri = beni
--    yakin arkadas EKLEYENLER; onlarin 'close' hikayelerini gorurum.
create table if not exists public.close_friends (
  user_id   bigint not null references public.users(id) on delete cascade,
  friend_id bigint not null references public.users(id) on delete cascade,
  created_at timestamptz default now() not null,
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);
-- 'close' filtresi bu yonden okur: friend_id = me → user_id kumesi.
create index if not exists idx_close_friends_friend on public.close_friends (friend_id);
alter table public.close_friends enable row level security;
