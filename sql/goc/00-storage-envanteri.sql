-- ════════════════════════════════════════════════════════════════════
-- GÖÇ ADIMI 1 — Storage envanteri.
--
-- Supabase panelinde nesne sayısı ve toplam boyut GÖSTERİLMİYOR; bu bilgi
-- storage.objects tablosunda duruyor. Kesim penceresinin uzunluğunu bu
-- sayılar belirliyor, çünkü kopyalama script'i dosyaları TEK TEK indirip
-- yüklüyor — süre dosya SAYISIYLA doğru orantılı.
--
-- KULLANIM: Supabase paneli → SQL Editor → yapıştır → Run.
-- ════════════════════════════════════════════════════════════════════

-- ── 1) Bucket başına nesne sayısı ve toplam boyut ──────────────────
select
  bucket_id                                            as bucket,
  count(*)                                             as nesne_sayisi,
  pg_size_pretty(sum((metadata->>'size')::bigint))     as toplam_boyut,
  pg_size_pretty(max((metadata->>'size')::bigint))     as en_buyuk_dosya
from storage.objects
group by bucket_id
order by bucket_id;

-- ── 2) SAYFALAMA RİSKİ ─────────────────────────────────────────────
-- Resmî kopyalama örneği klasör başına limit(1000) kullanıyor ve offset
-- döngüsü YOK. Aşağıdaki listede satır çıkarsa, o klasörlerde 1000'den
-- fazla dosya var demektir ve script'in sayfalaması ŞART.
select
  bucket_id                          as bucket,
  split_part(name, '/', 1)           as klasor,
  count(*)                           as dosya
from storage.objects
group by 1, 2
having count(*) > 900
order by dosya desc;

-- ── 3) Klasör derinliği (kopyalama script'i özyinelemeli gezecek) ──
select
  bucket_id                                    as bucket,
  count(distinct split_part(name, '/', 1))     as ust_klasor,
  max(array_length(string_to_array(name, '/'), 1)) as en_derin_seviye
from storage.objects
group by bucket_id;
