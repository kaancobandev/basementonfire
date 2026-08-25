-- ═══════════════════════════════════════════════════════════════════════════
-- HİKÂYE MEDYASI PRIVATE KOVAYA — `stories.media_path`
--
-- BULGU (23.08.2026 güvenlik denetimi, kullanıcı onayıyla düzeltiliyor):
-- Hikâye dosyaları `media` (PUBLIC) kovasına yazılıyordu ve `stories.media_url`
-- kalıcı bir public adres tutuyordu. Ölçüldü: süresi dolmuş 6 hikâyenin
-- 6'sı da anonim isteğe HTTP 206 dönüyor, üçü GİZLİ hesaba ait.
--
-- Asıl sorun dosyanın var olması DEĞİL (arşiv ve öne çıkanlar ona bağlı,
-- silmek ikisini de kırar) — korumanın yalnızca URL gizliliği olması ve o
-- korumanın HİÇ BİTMEMESİ. Hikâyeyi meşru olarak gören biri adrese sonsuza
-- dek sahip oluyor: yakın arkadaş listesinden çıkarılsa da, engellense de,
-- süresi dolsa da. "Yakın arkadaşlar" vaadi URL paylaşıldığı an çöküyordu.
--
-- ÇÖZÜM: yeni hikâyeler private `stories` kovasına yazılır; okuma yüzeyleri
-- kısa ömürlü İMZALI URL üretir. Adres artık süresiz bir anahtar değil.
--
-- ⚠ `media_url` SİLİNMEDİ, NULL'lanmadı, kolon DURUYOR. Eski satırlar (public
--   kovadaki dosyalar) onunla okunmaya devam eder; okuma tarafı
--   `media_path ?? media_url` sırasıyla bakar. Böylece göç kısmi kalsa bile
--   hiçbir hikâye kırılmaz. Eski 6 dosya ayrı bir betikle taşınacak.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.stories
  add column if not exists media_path text;

comment on column public.stories.media_path is
  'Private `stories` kovasındaki dosya yolu. Doluysa okuma tarafı İMZALI URL üretir; boşsa eski `media_url` (public kova) kullanılır. Yeni yüklemeler her zaman bunu doldurur.';

-- Aynı düzeltme öne çıkan kapakları için de gerekli: cover_url bir hikâye
-- karesinin public adresiydi ve `/api/stories/highlights` anonime açıktı
-- (o uç ayrıca 23.08'de kimlik+gizlilik kapısına bağlandı).
alter table public.story_highlights
  add column if not exists cover_path text;

comment on column public.story_highlights.cover_path is
  'Private `stories` kovasındaki kapak dosyası yolu. Doluysa imzalı URL üretilir; boşsa eski `cover_url`.';

-- ═══════════════════════════════════════════════════════════════════════════
-- DOĞRULAMA
--   1. Kolonlar geldi mi:
--        select column_name from information_schema.columns
--        where table_name in ('stories','story_highlights')
--          and column_name in ('media_path','cover_path');
--   2. Göç sonrası eski satır kalmamalı:
--        select count(*) from public.stories where media_path is null;
--      (0 beklenir — betik çalıştıktan sonra)
--   3. Yeni bir hikâye at, satırda `media_path` DOLU, `media_url` BOŞ olmalı.
-- ═══════════════════════════════════════════════════════════════════════════
