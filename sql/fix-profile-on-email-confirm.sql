-- ═══════════════════════════════════════════════════════════════════════════
-- DÜZELTME: profil satırı E-POSTA ONAYINDAN ÖNCE oluşuyordu
--
-- BULGU (22.08.2026, kullanıcı bildirdi): kayıt formunun son adımına basar
-- basmaz hesap sitede görünüyordu — ana sayfada, keşifte, aramada. Ölçüldü:
-- 18 auth kullanıcısının 3'ü onaysızdı ve ÜÇÜNÜN DE public.users satırı vardı.
--
-- SEBEP: `on_auth_user_created` tetikleyicisi `AFTER INSERT ON auth.users`
-- idi. `auth.signUp()` çağrılır çağrılmaz auth satırı (onaysız olarak)
-- yazılıyor, tetikleyici de o anda ateşlenip profili oluşturuyordu. public.users
-- tablosunda onay durumunu tutan HİÇBİR kolon olmadığı için (email_confirmed /
-- confirmed_at / is_verified → şema genelinde sıfır eşleşme) hiçbir listeleme
-- yüzeyi bunları eleyemiyordu.
--
-- ÇÖZÜM: tetikleyici artık YALNIZCA e-posta onaylıyken profil oluşturur.
--   · INSERT'te: `email_confirmed_at` doluysa (onay KAPALIYSA ya da yönetici
--     eliyle oluşturulmuş kullanıcıysa böyledir) → profil hemen oluşur.
--   · UPDATE'te: Supabase onay anında `email_confirmed_at`i doldurur → profil
--     o anda oluşur.
--
-- KVKK VERİSİ KAYBOLMASIN: eskiden yaş/cinsiyet/koşul-onayı kayıt rotası
-- tarafından signUp'tan HEMEN SONRA public.users'a yazılıyordu. Artık o anda
-- satır olmayacağı için o yazma boşa düşerdi. Bu yüzden üç alan da
-- `raw_user_meta_data`dan okunuyor — rota bunları signUp metadata'sına yazıyor
-- (app/api/auth/register/route.ts). Beyanın kendisi auth tarafında duruyor,
-- profil doğduğunda oraya taşınıyor.
--
-- MEVCUT KULLANICILARA DOKUNMAZ. Yalnızca bundan sonraki auth olaylarını etkiler.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $function$
declare
  istenen  text;
  temel    text;
  aday     text;
  ek       int := 0;
  ham_dog  text;
  ham_ons  text;
  dogum    date;
  onay_ts  timestamptz;
  cinsiyet text;
begin
  -- ── 1) KAPI: e-posta onaylanmadıysa profil OLUŞTURMA ──────────────────────
  if NEW.email_confirmed_at is null then
    return NEW;
  end if;

  -- ── 2) Bir kez oluştur: UPDATE tetikleyicisi birden çok kez ateşlenebilir
  --      (ör. kullanıcı onay bağlantısına iki kez tıklarsa).
  if exists (select 1 from public.users where auth_id = NEW.id) then
    return NEW;
  end if;

  -- ── 3) Kullanıcı adı — kayıt formunda seçilen ad KULLANILIR ───────────────
  istenen := nullif(trim(NEW.raw_user_meta_data ->> 'username'), '');

  -- Uygulamanın kuralına indirge: küçük harf, yalnız [a-z0-9_], 3-30 karakter.
  -- (register/route.ts ile aynı kural — tek fark, burada REDDETMEK yerine
  --  TEMİZLİYORUZ: tetikleyicinin hata fırlatması onayı komple düşürürdü.)
  temel := lower(coalesce(istenen, split_part(NEW.email, '@', 1)));
  temel := regexp_replace(temel, '[^a-z0-9_]', '', 'g');
  temel := left(temel, 30);
  if length(temel) < 3 then
    temel := 'uye' || left(replace(NEW.id::text, '-', ''), 8);
  end if;

  -- Çakışma olursa kaydı DÜŞÜRME, sonuna sayı ekle.
  aday := temel;
  while exists (select 1 from public.users where lower(username) = aday) loop
    ek := ek + 1;
    aday := left(temel, 30 - length(ek::text)) || ek::text;
  end loop;

  -- ── 4) KVKK beyanları — auth metadata'sından, GÜVENLİ dönüşümle ───────────
  -- ⚠ Çıplak `::date` KULLANMA: bozuk bir değer (ör. '2000-02-31') exception
  --    fırlatır ve tetikleyici AFTER olduğu için ONAYI KOMPLE DÜŞÜRÜR —
  --    kullanıcı e-postasını onaylayamaz hâle gelir. Bu yüzden her dönüşüm
  --    kendi exception bloğunda; bozuksa alan NULL kalır, kayıt yaşar.
  ham_dog := nullif(NEW.raw_user_meta_data ->> 'birthdate', '');
  begin
    dogum := ham_dog::date;
  exception when others then
    dogum := null;
  end;

  ham_ons := nullif(NEW.raw_user_meta_data ->> 'terms_accepted_at', '');
  begin
    onay_ts := ham_ons::timestamptz;
  exception when others then
    onay_ts := null;
  end;

  -- Cinsiyet sözlüğü lib/types.ts GENDERS ile aynı; dışındaki değer NULL'lanır.
  cinsiyet := nullif(NEW.raw_user_meta_data ->> 'gender', '');
  if cinsiyet is not null and cinsiyet not in ('kadin', 'erkek', 'diger') then
    cinsiyet := null;
  end if;

  -- ── 5) Profili oluştur ────────────────────────────────────────────────────
  insert into public.users (
    auth_id, email, username, display_name, bio,
    birthdate, gender, terms_accepted_at
  )
  values (
    NEW.id,
    NEW.email,
    aday,
    -- display_name: seçilen ad varsa onu göster, yoksa üretilen kullanıcı adını.
    coalesce(istenen, aday),
    '',
    dogum,
    cinsiyet,
    -- Beyan zamanı metadata'da yoksa onay anını kullan: koşul kutusu kayıtta
    -- ZORUNLU olduğu için beyan kesinlikle verilmiştir, yalnızca damgası eksiktir.
    coalesce(onay_ts, now())
  );

  return NEW;
end;
$function$;

-- ── Tetikleyiciyi yeniden bağla ────────────────────────────────────────────
-- INSERT: onay kapalıysa / yönetici oluşturduysa email_confirmed_at zaten dolu gelir.
-- UPDATE OF email_confirmed_at: normal akış — kullanıcı onay bağlantısına tıklar.
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert or update of email_confirmed_at on auth.users
  for each row execute function public.handle_new_user();


-- ═══════════════════════════════════════════════════════════════════════════
-- DOĞRULAMA — çalıştırdıktan sonra:
--
--   1. Yeni bir test hesabı aç. E-postayı ONAYLAMADAN önce:
--        select count(*) from public.users where email = '<test@adres>';
--      → 0 dönmeli. Sitede de görünmemeli (arama, keşif, ana sayfa).
--
--   2. Onay bağlantısına tıkla, sonra:
--        select username, birthdate, gender, terms_accepted_at
--        from public.users where email = '<test@adres>';
--      → satır OLUŞMALI ve üç KVKK alanı da DOLU gelmeli.
--
--   3. Onaysız kalıntı var mı (auth tarafında onaysız ama profili olan):
--        -- Supabase SQL editöründe auth şemasına erişimin varsa:
--        select u.email, u.email_confirmed_at, p.username
--        from auth.users u
--        left join public.users p on p.auth_id = u.id
--        where u.email_confirmed_at is null and p.id is not null;
--      → 0 satır dönmeli.
-- ═══════════════════════════════════════════════════════════════════════════
