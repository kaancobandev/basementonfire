-- ============================================================
-- YAYINDAKI MAKALEYE DUZENLEME ONAYI
-- ============================================================
-- Sorun: PATCH /api/user-articles/[id] her duzenlemede status'u 'pending'
-- yapiyordu. Yani yazar yayindaki makalesindeki bir yazim hatasini duzeltmek
-- istedigi anda makale YAYINDAN DUSUYOR ve admin onaylayana kadar 404 veriyordu.
-- Bu, duzenlemeyi cezalandirir; kimse kucuk duzeltme yapmak istemez.
--
-- Cozum: yayindaki (approved) bir makale duzenlenince CANLI ALANLARA
-- DOKUNULMAZ. Onerilen yeni surum pending_edit'e yazilir, makale yayinda
-- kalir, admin onaylayinca pending_edit canli alanlarin uzerine gecer.
--
-- Henuz yayinlanmamis (pending) ya da reddedilmis (rejected) makalelerde
-- boyle bir ikilem yok — ortada dusecek canli surum olmadigi icin duzenleme
-- eskisi gibi dogrudan satirin uzerine yazilir.
--
-- pending_edit sekli (PATCH route'unun yazdigi ile birebir ayni):
--   { "title": "...", "summary": "...", "cover_url": "..."|null,
--     "category": "..."|null, "doc": [...], "sources": [...] }
-- ============================================================

alter table public.user_articles
  add column if not exists pending_edit          jsonb,
  add column if not exists pending_at            timestamptz,
  add column if not exists pending_reject_reason text;

comment on column public.user_articles.pending_edit is
  'Yayindaki makaleye onerilen yeni surum. Dolu oldugu surece canli alanlar degismez; admin onaylayinca uzerlerine gecer.';
comment on column public.user_articles.pending_at is
  'Duzenlemenin gonderildigi an. Admin kuyrugunun siralamasi + yazarin hiz sinirlamasi (debounce) icin.';
comment on column public.user_articles.pending_reject_reason is
  'Duzenleme reddedildiyse nedeni. Canli makale bundan etkilenmez; yalnizca yazara gosterilir.';

-- Admin kuyrugu "bekleyen duzenlemesi olan makaleler"i eskiden yeniye ceker.
-- Kismi indeks: satirlarin ezici cogunlugunda pending_edit null oldugu icin
-- indeks kuyruktakiler kadar kucuk kalir.
create index if not exists idx_user_articles_pending_edit
  on public.user_articles (pending_at)
  where pending_edit is not null;

-- ------------------------------------------------------------
-- NOT (RLS): user_articles'a erisim service-role uzerinden (lib/supabase/server
-- db) yapiliyor, yani RLS baypas ediliyor ve yetki kontrolu route'larda.
-- Bu ucu icin kurallar:
--   - pending_edit YAZMA  -> yalnizca makalenin sahibi (PATCH route, user_id esitligi)
--   - pending_edit ONAY/RED -> yalnizca admin (moderate route, isAdmin)
--   - pending_edit hicbir KURESEL listelemede okunmaz; yalnizca sahip,
--     admin kuyrugu ve editor okur. Yani onaylanmamis metin yayina sizmaz.
-- ------------------------------------------------------------
