-- ============================================================================
-- Basements — Kaydedilenler icin KOLEKSIYONLAR
-- Supabase SQL Editor'da BIR KEZ calistir. Idempotent (tekrar guvenli).
--
-- Model: bir kayitli gonderi EN FAZLA BIR koleksiyona girer (bookmarks satirina
-- collection_id eklenir). Ayri bir junction tablosu KURULMADI; boylece
-- "Tumu" gorunumu mevcut sorgularla aynen calismaya devam eder ve
-- bookmarks'in tekil (user_id, post_id) kisiti bozulmaz.
--
-- RLS acik / policy yok -> erisim yalniz service-role; yetki API katmaninda
-- getMe() ile zorlanir (comment_likes / dyk_likes deseninin aynisi).
-- ============================================================================

create table if not exists public.collections (
  id         bigserial primary key,
  user_id    bigint not null references public.users(id) on delete cascade,
  name       text   not null,
  created_at timestamptz not null default now(),
  -- Ayni kullanici ayni adi iki kez acamaz (API 23505'i "zaten var"a cevirir).
  unique (user_id, name)
);

create index if not exists idx_collections_user on public.collections (user_id, created_at);

alter table public.collections enable row level security;

-- on delete set null: koleksiyon silinince KAYITLAR DURUR, sadece
-- kategorisiz ("Tumu") duruma doner. cascade olsaydi koleksiyonu silen
-- kullanici farkinda olmadan kayitlarini da silerdi.
alter table public.bookmarks
  add column if not exists collection_id bigint references public.collections(id) on delete set null;

create index if not exists idx_bookmarks_collection on public.bookmarks (collection_id);

-- ⚠ EMBED NOTU (gecmis hata): bookmarks artik users + quick_facts + collections'a
-- giden UC FK tasiyor, yani collections ile users arasinda IKINCI bir yol
-- (many-to-many junction) acildi. Bu yuzden `collections` sorgusunda ASLA duz
-- `users(...)` YAZMA -> PostgREST PGRST201 ile sorguyu tumden reddeder.
-- Gerekirse `users!collections_user_id_fkey(...)` kullan. Ayni sebeple
-- /api/collections sayimlari embed ile DEGIL, JS'te hesaplaniyor.
