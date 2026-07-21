-- ============================================================================
-- Basements — Gizli hesaplar için takip İSTEĞİ (onay) akışı
-- Supabase SQL Editor'da BIR KEZ calistir. Idempotent (tekrar guvenli).
--
-- NEDEN AYRI TABLO (follows'a status kolonu DEGIL): `follows` yalnizca KABUL
-- EDILMIS takipleri tutmaya devam eder. Boylece 23 mevcut follows sorgusunun
-- (sayaclar, isFollowing, kitle filtresi lib/storyAudience.ts, yakin arkadaslar,
-- oneriler...) HICBIRI degismek zorunda kalmaz. Bekleyen bir istek follows'ta
-- OLSAYDI ve bir sorgu status'u filtrelemeseydi, bekleyen istek gercek takipci
-- sayilir ve gizli icerik sizardi. Ayri tablo bu riski komple ortadan kaldirir.
-- ============================================================================

create table if not exists public.follow_requests (
  requester_id bigint not null references public.users(id) on delete cascade,
  target_id    bigint not null references public.users(id) on delete cascade,
  created_at   timestamptz default now() not null,
  primary key (requester_id, target_id),
  check (requester_id <> target_id)
);
-- Sahibin gelen istekleri (target_id = me) en yeniden eskiye.
create index if not exists idx_follow_requests_target on public.follow_requests (target_id, created_at desc);
alter table public.follow_requests enable row level security;

-- Bildirim turlerine 'follow_request' + 'follow_accepted' ekle.
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type = any (array['follow','comment','like','mention','follow_request','follow_accepted']));
