-- ============================================================
--  Faz 3b — Hesap silme (ANINDA kalıcı silme, zamanlayıcı YOK)
--  Supabase SQL editöründe BİR KEZ çalıştır. Idempotent.
-- ============================================================
--
--  NEDEN "sil" değil "anonimleştir":
--   FK denetimi gösterdi ki users'a bağlı 32 FK'nın hepsi CASCADE.
--   Yani users satırını DELETE etmek `conversations`'ı da uçurur → karşı tarafın
--   KENDİ mesajları da silinirdi (onun kişisel verisi!). Ürün kararı: sadece silinen
--   kişinin mesajları gitsin.
--
--   Bu yüzden satır SİLİNMEZ, ANONİMLEŞTİRİLİR: users satırı içinde hiçbir kişisel
--   veri kalmayan bir "künye"ye (tombstone) dönüşür → konuşma ayakta kalır, karşı
--   taraf kendi mesajlarını korur, silinen kişinin mesajları elle silinir.
--
--   Not: deleted_media'nın users'a FK'sı YOK (cascade etmez) ve storage dosyaları
--   hiç cascade etmez → ikisi de uygulamada (purgeAccount) elle siliniyor.
-- ============================================================

-- Künye işareti. true = hesap KALICI silinmiş (anonimleştirilmiş).
-- Bu satır artık kişisel veri İÇERMEZ; yalnızca DM konuşmaları ayakta kalsın diye durur.
-- Arama / öneriler / keşif / profil bu bayrakla filtreleniyor.
alter table public.users
  add column if not exists is_deleted boolean not null default false;

comment on column public.users.is_deleted is
  'true = KALICI silinmis (anonimlestirilmis kunye). Kisisel veri icermez; yalnizca DM konusmalari ayakta kalsin diye tutulur.';

-- ------------------------------------------------------------
-- Kontrol:
--   select id, username, display_name, is_deleted from public.users where is_deleted;
--   -> username 'silinmis_<id>', display_name 'Silinmiş kullanıcı' olmalı,
--      avatar/bio/email/birthdate/gender vb. NULL olmalı.
-- ------------------------------------------------------------
