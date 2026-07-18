-- ════════════════════════════════════════════════════════════════════════
--  PERFORMANS MIGRATION — 2026-07-18 denetimi (Paket E)
--  Supabase SQL Editor'de bir kez çalıştır. Tümü idempotent (if not exists).
--
--  DÜRÜST NOT: tablolar bugün küçük (4-835 satır) — bunlar BÜYÜME SİGORTASI,
--  bugünkü TTFB'ye etkisi ~0. "Index en büyük kazanç" tezi daha önce ölçümle
--  çürütüldü; asıl kazançlar rota/cache katmanında yapıldı (kod tarafı).
-- ════════════════════════════════════════════════════════════════════════

-- ── 1) Metin araması (ILIKE '%kelime%') — trigram index'leri ──────────────
-- /api/search üç tabloda ILIKE koşuyor (users.username, users.display_name,
-- quick_facts.caption, hashtags.tag) ve ILIKE '%...%' normal btree index
-- KULLANAMAZ → içerik büyüdükçe her arama tam tablo taraması olurdu.
-- (perf-indexes.sql'de yorum satırıydı; artık etkin + hashtags.tag eklendi.)
create extension if not exists pg_trgm;

create index if not exists idx_users_username_trgm      on public.users        using gin (username     gin_trgm_ops);
create index if not exists idx_users_dispname_trgm      on public.users        using gin (display_name gin_trgm_ops);
create index if not exists idx_quick_facts_caption_trgm on public.quick_facts  using gin (caption      gin_trgm_ops);

do $$ begin
  if to_regclass('public.hashtags') is not null then
    execute 'create index if not exists idx_hashtags_tag_trgm on public.hashtags using gin (tag gin_trgm_ops)';
  end if;
end $$;

-- ── 2) Eşleştirme: users.interests dizi çakışması ─────────────────────────
-- /api/match/deck `.overlaps('interests', ...)` kullanıyor; text[] çakışması
-- ancak GIN index ile hızlanır (yoksa aday havuzu büyüdükçe seq scan).
create index if not exists idx_users_interests_gin on public.users using gin (interests);

-- ── 3) İsim çakışması düzeltmesi: idx_comments_post ───────────────────────
-- Canlı DB'de idx_comments_post = (post_id) [schema.sql'den]. perf-indexes.sql
-- AYNI İSİMLE (post_id, created_at) tanımlıyordu → `if not exists` yüzünden
-- bileşik sürüm HİÇ OLUŞMADI. /p/[id] yorum sorgusu (post_id eşit + created_at
-- sıralı, limit 500) bileşik index ile sort düğümü olmadan çalışır.
-- Önce yeni ad ile bileşik index kurulur, SONRA eski dar index silinir
-- (arada indexsiz an kalmaz).
create index if not exists idx_comments_post_created on public.comments (post_id, created_at);
drop index if exists public.idx_comments_post;

-- ── DOĞRULAMA (opsiyonel) ─────────────────────────────────────────────────
-- Index'lerin oluştuğunu gör:
--   select indexname from pg_indexes where schemaname='public' and indexname in
--     ('idx_users_username_trgm','idx_users_dispname_trgm','idx_quick_facts_caption_trgm',
--      'idx_hashtags_tag_trgm','idx_users_interests_gin','idx_comments_post_created');
-- Trigram'ın devrede olduğunu gör ("Bitmap Index Scan" beklenir; tablo çok
-- küçükse planner yine seq scan seçebilir — bu normaldir):
--   explain analyze select id from public.users where username ilike '%ka%';
