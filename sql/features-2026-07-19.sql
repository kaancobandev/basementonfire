-- ════════════════════════════════════════════════════════════════════════
--  ÖZELLİK MIGRATION — 2026-07-19 (12 özelliklik paket)
--  Supabase SQL Editor'de BİR KEZ çalıştır. Tümü idempotent.
--  Kod defansif: bu dosya çalışmadan da site kırılmaz; ilgili özellik uykuda kalır.
-- ════════════════════════════════════════════════════════════════════════

-- ── 1) ARCADE LİDERLİK TABLOSU (game_scores'u koda bağlama) ───────────────
-- Tablo şemada zaten var (player_name, score) ama hangi OYUNA ait olduğu yoktu.
alter table public.game_scores add column if not exists game_key text not null default 'ast';
create index if not exists idx_game_scores_game_score on public.game_scores (game_key, score desc);
-- RLS: tablo anonim-dostu (FK yok) ama yazma/okuma servis rolünden (API) geçer.
alter table public.game_scores enable row level security;


-- ── 2) BİLGİ KARTI BEĞENİSİ (dyk_likes) + bildirim kolonu ─────────────────
-- fact_likes deseninin birebir kopyası; kart üreticisine geri bildirim döngüsü.
create table if not exists public.dyk_likes (
  user_id    bigint not null references public.users(id) on delete cascade,
  dyk_id     bigint not null references public.did_you_know(id) on delete cascade,
  created_at timestamptz default now() not null,
  primary key (user_id, dyk_id)
);
create index if not exists idx_dyk_likes_dyk on public.dyk_likes (dyk_id);
alter table public.dyk_likes enable row level security;

-- Bildirimde bilgi kartı hedefi: post_id quick_facts FK'lı olduğundan ayrı kolon.
alter table public.notifications add column if not exists dyk_id bigint references public.did_you_know(id) on delete cascade;
