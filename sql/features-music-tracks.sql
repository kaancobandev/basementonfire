-- ============================================================================
-- Basements — Site Calma Listesi (kullanici yukledigi ses dosyalari)
-- Supabase SQL Editor'da BIR KEZ calistir. Idempotent (tekrar guvenli).
--
-- /muzik sayfasi su ana kadar YALNIZCA Spotify + YouTube gomulu icerigi
-- listeliyordu; ikisi de iframe oldugu icin sitenin kendi calari onlari
-- calamaz. Bu tablo sayfaya UCUNCU bir kaynak ekler: uyelerin dogrudan
-- yukledigi ses dosyalari. Dosyanin kendisi Supabase Storage'in 'media'
-- kovasinda durur (mevcut /api/storage/sign akisi, ses zaten destekli);
-- burada yalnizca kaydin kunyesi tutulur.
--
-- Mevcut guvenlik modeline uyar: RLS acik, policy yok -> erisim yalniz
-- service-role (uygulamanin API route'lari) uzerinden. Silme yetkisi
-- route'ta kontrol edilir (yalniz kendi kaydini silebilir).
-- ============================================================================

create table if not exists public.music_tracks (
  id         bigserial primary key,
  user_id    bigint not null references public.users(id) on delete cascade,
  title      text   not null,
  artist     text,                                  -- bos birakilabilir (yukleyenin adi gosterilir)
  -- Storage'daki nesnenin TAM public URL'i (media jsonb'deki desenle ayni).
  src        text   not null,
  -- Storage yolu AYRICA saklanir: kayit silinince dosyayi da silebilmek icin
  -- URL'den yol ayiklamak kirilgan olurdu.
  storage_path text not null,
  duration   numeric,                               -- saniye; istemcide olculur, opsiyonel
  created_at timestamptz not null default now()
);
alter table public.music_tracks enable row level security;

-- Liste sorgusu (en yeniden eskiye) bu index'ten okur.
create index if not exists idx_music_tracks_created
  on public.music_tracks (created_at desc);

-- "Kendi parcalarim" ve silme yetkisi kontrolu.
create index if not exists idx_music_tracks_user
  on public.music_tracks (user_id, created_at desc);

-- ============================================================================
-- BITTI. Calisinca /muzik sayfasindaki "Site" sekmesi calisir hale gelir.
-- Tablo YOKKEN de sayfa acilir — sadece Site sekmesi bos gorunur ve yukleme
-- hata doner (route defansif yazildi).
-- ============================================================================
