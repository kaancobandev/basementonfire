-- ═══════════════════════════════════════════════════════════════════════════
-- DÜZELTME: handle_new_user — kayıtta seçilen kullanıcı adı çöpe gidiyordu
--
-- SORUN (2026-07-18'de canlı şema dökümünde bulundu):
--   Mevcut trigger fonksiyonu şunu yapıyor:
--       username := split_part(NEW.email, '@', 1)
--   Yani `auth.signUp(options.data.username)` ile gönderilen, kayıt formunda
--   kullanıcının SEÇTİĞİ ad hiç okunmuyor. app/api/auth/register/route.ts o
--   adı doğruluyor (format + benzersizlik) ama trigger onu yok sayıyor.
--
--   Üç somut sonucu var:
--   1. Kullanıcı adı alanı fiilen SÜS. Kullanıcı ne yazarsa yazsın e-posta
--      öneki atanıyor, sonra profilden düzeltmesi gerekiyor — üstelik kullanıcı
--      adı değişimi 30 günde bir ile sınırlı.
--   2. users.username UNIQUE (+ lower(username) UNIQUE) olduğu için, e-posta
--      öneki çakışan ikinci kişi KAYIT OLAMIYOR: trigger'ın INSERT'i kısıtı
--      ihlal ediyor, auth.users insert'i geri sarılıyor ve kayıt anlaşılmaz bir
--      hatayla düşüyor. (ör. kaan@gmail.com varken kaan@outlook.com kayıt olamaz)
--   3. E-posta öneki temizlenmiyor: 'ali.veli+test@x.com' → 'ali.veli+test'.
--      Bu, uygulamanın her yerde dayattığı ^[a-z0-9_]{3,30}$ kuralını ihlal
--      ediyor ve /u/[username] yönlendirmesini bozuyor.
--
-- KANIT: canlıda 5 kullanıcıdan 2'sinin username'i hâlâ e-posta önekiyle
-- birebir aynı (osx3452, alpkocacenk); diğer 3'ü sonradan elle değiştirilmiş.
--
-- BU DÜZELTME MEVCUT KULLANICILARA DOKUNMAZ. Yalnızca yeni kayıtları etkiler.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $function$
declare
  istenen text;
  temel   text;
  aday    text;
  ek      int := 0;
begin
  -- 1) Kayıt formunda seçilen adı KULLAN. Yoksa e-posta önegine düş.
  istenen := nullif(trim(NEW.raw_user_meta_data ->> 'username'), '');

  -- 2) Uygulamanın kuralına indirge: küçük harf, yalnız [a-z0-9_], 3-30 karakter.
  --    (register/route.ts ile aynı kural — tek fark, burada REDDETMEK yerine
  --     TEMİZLİYORUZ: trigger'ın hata fırlatması kaydı komple düşürürdü.)
  temel := lower(coalesce(istenen, split_part(NEW.email, '@', 1)));
  temel := regexp_replace(temel, '[^a-z0-9_]', '', 'g');
  temel := left(temel, 30);
  if length(temel) < 3 then
    temel := 'uye' || left(replace(NEW.id::text, '-', ''), 8);
  end if;

  -- 3) Çakışma olursa kaydı DÜŞÜRME, sonuna sayı ekle.
  --    Eskiden çakışma doğrudan unique ihlaline gidiyor ve kayıt başarısız
  --    oluyordu; kullanıcı sebebini anlamıyordu.
  aday := temel;
  while exists (select 1 from public.users where lower(username) = aday) loop
    ek := ek + 1;
    aday := left(temel, 30 - length(ek::text)) || ek::text;
  end loop;

  insert into public.users (auth_id, email, username, display_name, bio)
  values (
    NEW.id,
    NEW.email,
    aday,
    -- display_name: seçilen ad varsa onu göster, yoksa üretilen kullanıcı adını.
    coalesce(istenen, aday),
    ''
  );

  return NEW;
end;
$function$;

-- Trigger'ın kendisi değişmiyor (zaten auth.users üzerinde AFTER INSERT olarak
-- bağlı); yalnızca fonksiyon gövdesi güncellendi. Yine de idempotent olsun:
-- create trigger on_auth_user_created after insert on auth.users
--   for each row execute function public.handle_new_user();


-- ─────────────────────────────────────────────────────────────────────────
-- DOĞRULAMA — düzeltmeden sonra bir test hesabı açıp bak:
--   · Kayıt formuna yazdığın kullanıcı adı public.users'a AYNEN geçmeli.
--   · Aynı e-posta önekine sahip ikinci bir hesap artık kayıt olabilmeli
--     (adının sonuna 1 eklenir), hata almamalı.
-- ─────────────────────────────────────────────────────────────────────────
select id, username, display_name, split_part(email, '@', 1) as eposta_oneki
  from public.users
 order by id desc
 limit 5;
