-- ============================================================
-- MAKALE OKUMA İLERLEMESİ (yüzde) — "devam et" kartı için
-- ============================================================
-- Amaç: akışta "%64 okundu · ~6 dk kaldı — Devam et" kartını basabilmek.
-- Bugün böyle bir veri YOK: article_reads İKİLİ bir tablo, satır ya vardır ya
-- yoktur, yüzde hiçbir yerde tutulmuyor.
--
-- ────────────────────────────────────────────────────────────
-- ⚠ NEDEN `article_reads`E `percent` KOLONU EKLENMEDİ
-- ────────────────────────────────────────────────────────────
-- İlk plan o kolonu article_reads'e eklemekti. Kodu taradım, VAZGEÇTİM:
-- o tabloyu BEŞ ayrı yer okuyor ve HEPSİ "satır var = makale BİTTİ" diye
-- yorumluyor.
--
--   1) app/api/articles/[slug]/read/route.ts  — koleksiyon rozeti sayımı
--   2) app/profile/page.tsx                   — rozet rafı sayaçları ("4/8")
--   3) app/okuma-listesi/page.tsx             — kategori rafları
--   4) app/api/match/deck/route.ts            — eşleşme benzerliği
--   5) app/api/match/swipe/route.ts           — eşleşme benzerliği
--
-- Kısmi okumaları AYNI tabloya yazsaydık beşi birden sessizce yanlışlanırdı:
-- makaleyi %10 açan kişi "okumuş" sayılır, yarım okunan kategoriye KOLEKSİYON
-- ROZETİ dağıtılır, raflar şişer, iki kişi bir makaleyi açtı diye eşleşir.
-- Beş çağrı yerine `.gte('percent',100)` eklemek de çözüm değil: birini
-- unutmak SESSİZ bir hata olurdu ve olmayan kolonu SELECT'e eklemek sorguyu
-- sessizce düşürdüğü için deploy sırası da ayrı bir mayın.
--
-- Bu yüzden ilerleme AYRI bir tabloda. Anlamlar da ayrı kalıyor:
--   article_reads    = makale BİTTİ   (dokunulmadı, beş okuyucu da aynen çalışır)
--   article_progress = nereye kadar gelindi (0-100)
-- Zaten deponun kendi alışkanlığı bu: article_saves ve article_reads de ayrı
-- anlamlar için ayrı tablolar.
--
-- ⚠ Sona ulaşınca İKİSİ DE yazılır (percent=100 + article_reads satırı).
--    Böylece "devam et" kartı tek koşulla süzülür: percent < 100.
--    Göçten ÖNCE bitirilmiş makalelerin progress satırı yoktur → kartta hiç
--    görünmezler. Doğru davranış: onlar zaten bitmiş.
-- ============================================================


-- ── 1) TABLO ─────────────────────────────────────────────────────────────
create table if not exists public.article_progress (
  user_id      bigint    not null references public.users(id) on delete cascade,
  article_slug text      not null,
  -- Gövdenin ne kadarı geçildi. smallint yeter (0-100).
  percent      smallint  not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (user_id, article_slug),
  constraint article_progress_percent_araligi check (percent between 0 and 100)
);

-- RLS açık + politika YOK = yalnız service-role erişir; article_reads ile aynı
-- desen. ⚠ Bu tabloyu realtime yayınına EKLEME: politikasız bir tablo realtime
-- üzerinden SÜZMEDEN dağıtılır (19.08.2026'da DM'lerde yaşandı).
alter table public.article_progress enable row level security;

-- "Devam ettiklerim, en son dokunduğum üstte" sorgusunun indeksi.
create index if not exists article_progress_user_updated_idx
  on public.article_progress (user_id, updated_at desc);


-- ── 2) YAZMA FONKSİYONU ──────────────────────────────────────────────────
-- ⚠ NEDEN DÜZ UPSERT DEĞİL: ilerleme GERİ GİTMEMELİ. Okur makaleyi %80'e
-- kadar okuyup kapatsa, ertesi gün açıp başında iki saniye kalsa düz upsert
-- %80'i %3 ile ezerdi ve "devam et" kartı kullanıcıyı başa gönderirdi.
-- greatest(...) bunu tek ifadede, ATOMİK olarak çözüyor — istemcide
-- oku-sonra-yaz yapılsaydı iki sekme arasında yarış olurdu.
--
-- Kırpma da burada: istemciden gelen sayıya güvenilmez (beacon elle de
-- atılabilir), 0-100 aralığına zorlanır. check kısıtı ikinci savunma hattı.
create or replace function public.article_progress_kaydet(
  p_user_id bigint,
  p_slug    text,
  p_percent int
)
returns smallint
language plpgsql
as $$
declare
  v_percent smallint;
begin
  insert into public.article_progress (user_id, article_slug, percent, updated_at)
  values (p_user_id, p_slug, greatest(0, least(100, coalesce(p_percent, 0)))::smallint, now())
  on conflict (user_id, article_slug) do update
    -- ⚠ Mevcut satır ON CONFLICT icinde TABLO ADIYLA gecilir (sema nitelemesi
    --   degil): `article_progress.percent`. `excluded` ise yazilmak istenen.
    set percent    = greatest(article_progress.percent, excluded.percent),
        updated_at = now()
  returning percent into v_percent;

  return v_percent;
end;
$$;


-- ── 3) KONTROL ───────────────────────────────────────────────────────────
-- Göç çalıştıktan sonra bu iki satır beklenen çıktıyı vermeli:
--   select count(*) from public.article_progress;                      -> 0
--   select public.article_progress_kaydet(<kendi_user_id>, 'test', 42); -> 42
--   select public.article_progress_kaydet(<kendi_user_id>, 'test', 10); -> 42  (geri gitmedi)
--   delete from public.article_progress where article_slug = 'test';
