-- Akış (quick_facts) gönderileri için "repost" (yeniden paylaşma).
-- fact_likes ile AYNI desen: composite PK (user_id, fact_id), ayrı id yok.
-- Repost = kullanıcının o gönderiyi kendi profilinde "Reposts" sekmesinde göstermesi.
-- Supabase SQL Editor'da bir kez çalıştır.

create table if not exists public.fact_reposts (
  user_id    bigint not null references public.users(id)       on delete cascade,
  fact_id    bigint not null references public.quick_facts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, fact_id)
);

create index if not exists fact_reposts_user_idx on public.fact_reposts (user_id, created_at desc);

-- Uygulama bu tabloya yalnızca sunucu tarafında service-role ile erişir.
-- RLS açık + politika yok → anon/authenticated erişemez, service-role bypass eder.
alter table public.fact_reposts enable row level security;
