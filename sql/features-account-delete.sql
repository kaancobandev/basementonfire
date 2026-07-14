-- ============================================================
--  Faz 3b — Hesap silme (30 gün geri alma süreli)
--  Supabase SQL editöründe BİR KEZ çalıştır. Idempotent.
-- ============================================================
--
--  TASARIM (FK denetiminden sonra):
--   • users'a bağlı 32 FK'nın hepsi CASCADE (did_you_know: SET NULL).
--   • AMA users satırını SİLMEK conversations'ı da uçurur (CASCADE) → karşı tarafın
--     KENDİ mesajları da giderdi. Ürün kararı: "sadece BENİM mesajlarım silinsin".
--   • Bu yüzden kalıcı silmede satırı SİLMİYORUZ, ANONİMLEŞTİRİYORUZ:
--     users satırı, içinde hiçbir kişisel veri kalmayan bir "künye"ye dönüşür.
--     → konuşma ayakta kalır, karşı taraf kendi mesajlarını korur,
--       silinen kişinin mesajları (messages.sender_id) elle silinir.
--   • deleted_media'nın users'a FK'sı YOK → cascade ETMEZ, elle silinmeli.
--   • Storage dosyaları hiç cascade etmez → uygulamada elle silinir.
-- ============================================================

-- 1) Silme talebi zamanı. NULL = aktif hesap. Dolu = 30 günlük geri alma süresinde.
alter table public.users
  add column if not exists deletion_requested_at timestamptz;

-- 2) Askıya alırken hesabı gizlemek için is_private = true yapıyoruz (her küresel
--    yüzeyde ZATEN filtrelenen, savaşta test edilmiş mekanizma). Geri alınca eski
--    değerine dönebilmek için orijinali saklıyoruz.
alter table public.users
  add column if not exists is_private_before_delete boolean;

-- 3) Kalıcı silme sonrası "künye" işareti. true = anonimleştirilmiş, geri dönüşü yok.
--    Bu satır artık kişisel veri İÇERMEZ; yalnızca konuşmaların ayakta kalması için var.
alter table public.users
  add column if not exists is_deleted boolean not null default false;

comment on column public.users.deletion_requested_at is
  'Hesap silme talebi zamanı. NULL = aktif. Dolu = 30 gunluk geri alma suresinde (hesap askida, gizli).';
comment on column public.users.is_private_before_delete is
  'Askiya alma sirasinda is_private true yapilir; geri alinca bu deger geri yuklenir.';
comment on column public.users.is_deleted is
  'true = KALICI silinmis (anonimlestirilmis kunye). Kisisel veri icermez; yalnizca DM konusmalari ayakta kalsin diye tutulur.';

-- 4) Cron'un "suresi dolanlari" hizli bulmasi icin kismi index.
create index if not exists users_deletion_requested_idx
  on public.users (deletion_requested_at)
  where deletion_requested_at is not null;

-- ------------------------------------------------------------
-- Kontrol:
--   select id, username, deletion_requested_at, is_deleted, is_private
--   from public.users
--   where deletion_requested_at is not null or is_deleted;
--
-- Suresi dolanlari gormek icin (cron bunlari kalici silecek):
--   select id, username, deletion_requested_at
--   from public.users
--   where deletion_requested_at < now() - interval '30 days' and not is_deleted;
-- ------------------------------------------------------------
