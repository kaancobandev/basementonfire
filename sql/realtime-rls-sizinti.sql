-- ════════════════════════════════════════════════════════════════════════
-- REALTIME SIZINTISI — messages/notifications için RLS politikaları
--
-- SORUN (ölçüldü 19.08.2026, canlı):
--   · public şemadaki 49 tablonun HEPSİNDE RLS açık ama politika sayısı SIFIR
--   · buna rağmen realtime `postgres_changes` satırları tarayıcıya TESLİM ediyor
--     (kullanıcı kendi iki hesabıyla doğruladı: mesaj YENİLEMEDEN belirdi)
--   · app/components/RealtimeProvider.tsx:39 `messages` INSERT'e FİLTRESİZ abone
--   · süzme istemcide: `if (!convIdsRef.current.includes(...)) return;`
--     → satır o kontrole gelene kadar tarayıcıya İNMİŞ oluyor
--   → giriş yapmış her kullanıcının tarayıcısı, platformdaki TÜM DM'leri alıyor
--     (content + media_url dâhil). DevTools açan biri hepsini okuyabilir.
--
-- Göç kaynaklı DEĞİL: eski projede de 0 politikaydı, kod da aynı.
--
-- ⚠ SUNUCUYU ETKİLEMEZ: uygulama `service_role` ile okuyor, o RLS'i baypas eder.
-- Bu dosya yalnızca EKLEME yapar; hâlihazırda 0 politika olduğu için hiçbir
-- mevcut erişim daralmıyor — sadece daha önce tamamen kapalı olan meşru erişim
-- açılıyor ve realtime'a süzecek bir kural veriliyor.
-- ════════════════════════════════════════════════════════════════════════

-- ── Yardımcı 1: oturumdaki kullanıcının public.users.id'si ──
-- SECURITY DEFINER ŞART: users tablosunda da RLS açık ve politikası yok.
-- Normal (INVOKER) bir fonksiyon oradan hiçbir satır okuyamaz, dolayısıyla
-- politika HER ZAMAN false döner ve her şeyi reddeder. Sahibi olarak koşarak
-- bu kilidi aşıyoruz. search_path sabitleniyor (arama yolu ele geçirmeye karşı).
create or replace function public.aktif_kullanici_id()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select id from public.users where auth_id = auth.uid()
$$;

revoke all on function public.aktif_kullanici_id() from public;
grant execute on function public.aktif_kullanici_id() to authenticated;

-- ── Yardımcı 2: bu konuşmanın katılımcısı mıyım ──
-- conversations tablosunda da RLS açık/politikasız olduğu için aynı gerekçeyle
-- SECURITY DEFINER.
create or replace function public.konusma_katilimcisi(p_konusma bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversations c
    where c.id = p_konusma
      and public.aktif_kullanici_id() in (c.user1_id, c.user2_id)
  )
$$;

revoke all on function public.konusma_katilimcisi(bigint) from public;
grant execute on function public.konusma_katilimcisi(bigint) to authenticated;

-- ── Politikalar ──
-- `to authenticated`: anon rolüne HİÇBİR politika verilmiyor → çıkışlı ziyaretçi
-- hiçbir satır göremez (politika yokluğu = ret).
drop policy if exists "mesaji yalniz katilimci gorur" on public.messages;
create policy "mesaji yalniz katilimci gorur"
  on public.messages
  for select
  to authenticated
  using (public.konusma_katilimcisi(conversation_id));

drop policy if exists "bildirimi yalniz sahibi gorur" on public.notifications;
create policy "bildirimi yalniz sahibi gorur"
  on public.notifications
  for select
  to authenticated
  using (user_id = public.aktif_kullanici_id());

-- ── Kontrol ──
select tablename, policyname, roles::text, cmd
from pg_policies
where schemaname = 'public' and tablename in ('messages', 'notifications')
order by tablename;
