-- ============================================================================
-- Basements — Yorum begenisi (comment likes)
-- Supabase SQL Editor'da BIR KEZ calistir. Idempotent (tekrar guvenli).
--
-- Saf birlesim (junction) tablosu: sayac kolonu YOK, begeni sayisi anlik sayilir
-- (dyk_likes deseni). RLS acik / policy yok -> erisim yalniz service-role; auth
-- API katmaninda getMe() ile zorlanir. comment_id -> comments(id) cascade:
-- yorum silinince begenileri de gider.
-- ============================================================================

create table if not exists public.comment_likes (
  user_id    bigint not null references public.users(id) on delete cascade,
  comment_id bigint not null references public.comments(id) on delete cascade,
  created_at timestamptz default now() not null,
  primary key (user_id, comment_id)
);

create index if not exists idx_comment_likes_comment on public.comment_likes (comment_id);

alter table public.comment_likes enable row level security;
