-- ============================================================
--  Faz 1 — Yaş kapısı (16+) + Kullanım Koşulları / Gizlilik onayı
--  Supabase SQL editöründe BİR KEZ çalıştır. Idempotent (tekrar çalıştırmak zararsız).
-- ============================================================

-- 1) Doğum tarihi.
--    NOT: Bu kolon profil düzenlemede (api/profile/edit) ZATEN kullanılıyor, yani
--    büyük ihtimalle mevcut. "if not exists" sayesinde varsa dokunulmaz.
alter table public.users
  add column if not exists birthdate date;

-- 2) Koşul + gizlilik kabulünün zamanı. Kayıt anında yazılır; rızanın/sözleşmenin
--    ne zaman kurulduğunun İSPATI için gerekli (KVKK/GDPR hesap verebilirlik).
alter table public.users
  add column if not exists terms_accepted_at timestamptz;

comment on column public.users.birthdate is
  'Doğum tarihi — YALNIZCA yaş sınırının (16+) doğrulanması için. Profilde ham hâliyle gösterilmez.';

comment on column public.users.terms_accepted_at is
  'Kullanım Koşulları + Gizlilik Politikası kabul zamanı (kayıt anında yazılır). Hesap verebilirlik/ispat.';

-- ------------------------------------------------------------
-- Kontrol: kayıt sonrası dolu geliyor mu?
--   select username, birthdate, terms_accepted_at
--   from public.users
--   order by created_at desc
--   limit 5;
--
-- Mevcut (eski) kullanıcılarda bu alanlar NULL kalır — bu normaldir.
-- Onları geriye dönük zorunlu kılmak istersen ayrı bir "profilini tamamla"
-- akışı gerekir (Faz 3'te konuşuruz).
-- ------------------------------------------------------------
