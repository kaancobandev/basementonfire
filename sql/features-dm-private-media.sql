-- ═══════════════════════════════════════════════════════════════════════════
-- DM MEDYASI PRIVATE KOVAYA — `messages.media_path`
--
-- BULGU (23.08.2026 güvenlik denetimi, hikâye düzeltmesinin ikizi):
-- Özel mesajlara eklenen fotoğraf/video `media` (PUBLIC) kovasına yazılıyordu
-- ve `messages.media_url` KALICI bir public adres tutuyordu.
--
-- Yani sitenin EN ÖZEL yüzeyindeki dosya, adresi bilen herkese sonsuza dek
-- açıktı: engelleme uygulanmıyordu, dm_privacy uygulanmıyordu, konuşmanın
-- tarafı olup olmamak hiç sorulmuyordu. Mesajı silmek de yetmiyordu — satır
-- gidiyor, dosya kalıyordu.
--
-- ⚠ ÖLÇÜLDÜ: bulunduğu anda medyalı DM sayısı 0'dı. Yani bugüne kadar sızan
--   dosya YOK ve göç edilecek satır da yok — biri DM'de ilk fotoğrafı
--   paylaştığı anda sızacaktı.
--
-- ÇÖZÜM: dosya private `dm` kovasına yazılır; okuma yüzeyleri kısa ömürlü
-- İMZALI URL üretir (lib/storyMedia.ts'teki `imzaHaritasi` yeniden kullanılır).
--
-- ⚠ `media_url` DURUYOR, silinmedi: okuma tarafı `media_path ?? media_url`
--   sırasıyla bakar. Bu kolon bugün boş ama şema geriye dönük uyumlu kalsın.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.messages
  add column if not exists media_path text;

comment on column public.messages.media_path is
  'Private `dm` kovasındaki dosya yolu. Doluysa okuma tarafı İMZALI URL üretir; boşsa eski `media_url` (public kova). Yeni yüklemeler her zaman bunu doldurur.';

-- ═══════════════════════════════════════════════════════════════════════════
-- DOĞRULAMA
--   1. select column_name from information_schema.columns
--      where table_name = 'messages' and column_name = 'media_path';
--   2. DM'den bir fotoğraf gönder → satırda `media_path` DOLU, `media_url` BOŞ.
--   3. Aynı dosyanın public adresi olmamalı:
--      `stories` kovasındaki gibi imzasız istek 400 dönmeli.
-- ═══════════════════════════════════════════════════════════════════════════
