-- ============================================================================
-- Basements — Makale Ici Oylama (karar noktalari)
-- Supabase SQL Editor'da BIR KEZ calistir. Idempotent (tekrar guvenli).
--
-- Ilk kullanan: /articles/sezar — "Rubicon karar noktasi" (orduyu dagit / gec).
-- Okur bir secim yapar, ardindan "okurlarin %68'i dagitmayi sectin" gibi sosyal
-- kanit gorur. Genel amaclidir: poll_key ile her makale kendi oylamasini acar.
--
-- Mevcut guvenlik modeline uyar: RLS acik, policy yok -> erisim yalniz
-- service-role (uygulamanin API route'lari) uzerinden.
--
-- GIZLILIK: oy GIRIS GEREKTIRMEZ. Anonim okuru cerezsiz ayirt etmek icin
-- page_views ile AYNI yontem kullanilir: gunluk DONEN, tuzlanmis hash
-- sha256(ip | user-agent | istanbul-gunu | service-key). Ham IP saklanmaz,
-- ertesi gun eslesmez -> geri donusturulemez, kalici kimlik degil (Plausible
-- yontemi, KVKK/GDPR dostu). Uye ise ayrica user_id yazilir (silinirse null).
-- ============================================================================

create table if not exists public.article_poll_votes (
  poll_key   text   not null,                     -- ör. 'sezar-rubicon'
  voter_hash text   not null,                     -- gunluk donen anonim hash (yukariya bak)
  choice     text   not null,                     -- ör. 'gec' | 'dagit'
  user_id    bigint references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  -- Cift oyu KOD DEGIL DB engeller: ayni okur ayni oylamada bir kez oy verir.
  -- (Ikinci insert 23505 doner; route bunu yakalayip mevcut dagilimi dondurur.)
  primary key (poll_key, voter_hash)
);
alter table public.article_poll_votes enable row level security;

-- Dagilim sorgusu (poll_key + choice basina sayim) bu index'ten okur.
create index if not exists idx_article_poll_votes_key_choice
  on public.article_poll_votes (poll_key, choice);

-- ============================================================================
-- BITTI. Calisinca /articles/sezar icindeki Rubicon karar noktasi, secimden
-- sonra okur dagilimini ("okurlarin %68'i...") gostermeye baslar.
-- Bu tablo YOKKEN de karar noktasi calisir — sadece dagilim cubugu gizlenir.
-- ============================================================================
