-- ═══════════════════════════════════════════════════════════════════════════
-- BİLGİ KARTLARI ŞİKAYET EDİLEBİLSİN — `reports.target_type` = 'dyk'
--
-- BULGU (26.08.2026 denetimi, MODERASYON BOŞLUĞU):
-- `/api/did-you-know` POST'u herhangi bir GİRİŞLİ üyeye açık; kart onaysız
-- yayına giriyor ve `revalidateTag('feed')` ile ANONİM ana sayfaya çıkıyor
-- (ölçüldü: çıkışlı `curl https://basementonfire.com/` gövdesinde kart metni).
-- Kart 140 karakter başlık + 1000 karakter gövde + kullanıcının yüklediği
-- görsel taşıyor.
--
-- Kaldırma yolu 26.08'de eklendi (`DELETE /api/dyk/[id]`, sahip veya admin),
-- ama kart ŞİKAYET EDİLEMİYORDU: bunun için önce bu kısıt genişlemeli.
--
-- ⚠ NEDEN SQL ŞART: `lib/reports.ts`e 'dyk' eklemek TEK BAŞINA YETMEZ.
--   Canlıda `reports_target_type_check` beş türü sabitliyor
--   (goc-dokum/schema.sql:1357) → insert 23514 ile patlardı. Ölçülmeden
--   kod tarafı değiştirilseydi özellik sessizce kırık gelirdi.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.reports
  drop constraint if exists reports_target_type_check;

alter table public.reports
  add constraint reports_target_type_check
  check (target_type = any (array[
    'post'::text,
    'comment'::text,
    'user'::text,
    'article'::text,
    'article_comment'::text,
    'dyk'::text
  ]));

-- ═══════════════════════════════════════════════════════════════════════════
-- DOĞRULAMA
--   select pg_get_constraintdef(oid) from pg_constraint
--   where conname = 'reports_target_type_check';
--   → listede 'dyk' görünmeli.
--
--   Sonra: bir bilgi kartını arayüzden şikayet et → /yonetim/sikayetler'de
--   "Bilgi kartı" olarak görünmeli ve "İçeriği kaldır" onu yayından düşürmeli.
-- ═══════════════════════════════════════════════════════════════════════════
