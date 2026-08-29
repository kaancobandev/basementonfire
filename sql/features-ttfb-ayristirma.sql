-- ═══════════════════════════════════════════════════════════════════════════
-- TTFB'Yİ İKİYE BÖL — `perf_samples.req_ms`
--
-- BULGU (26.08.2026, 30 günlük gerçek kullanıcı verisiyle ölçüldü):
--   ttfb_ms  p50=603   p75=1945  p95=4826   → p75 "kötü" eşiğinin üstünde
--   fcp_ms   p50=1476  p75=3612
--   lcp_ms   p50=1856  p75=3873
--   FCP−TTFB p75=843 · LCP−TTFB p75=1329    → İSTEMCİ İŞİ HIZLI
-- Yani darboğaz tarayıcıda değil, yanıtın gelmesinde.
--
-- 🚨 AMA HANGİ KISMINDA OLDUĞU ÖLÇÜLEMİYOR. Beacon `nav.responseStart`
--    gönderiyor ve o GEZİNME BAŞLANGICINDAN sayılır:
--        yönlendirme + DNS + TCP + TLS + isteğin gidişi + SUNUCU İŞİ + ilk bayt
--    Hepsi TEK sayıda toplanıyor. Bu yüzden 21-22.08'deki teşhis "atfedilemedi"
--    diye kapanmıştı: alet, ayırt edemediği iki şeyi topluyor.
--
-- ⚠ DAĞILIM SUNUCUYU İŞARET ETMİYOR (ölçüldü):
--   · Dağılım çift tepeli DEĞİL, tüm aralığa yayılmış (%38 <400 ms, %29 ≥1500 ms)
--     — soğuk başlatma hikâyesi bunu üretmez, o bimodal olurdu.
--   · `/articles/atilla` TAMAMEN STATİK ve CDN'den geliyor: p50=182 ms ama
--     p75=2454 ms. Dinamik `/discover` (p75=990) ondan DAHA İYİ. Sunucu hesabı
--     baskın olsaydı sıralama tam tersi olurdu.
--   · 531 örneğin 516'sı TR. Aynı anda buradan curl ile ölçtüğümde TTFB 61-229 ms.
--   Yani şüphe bağlantı kurulumunda (mobil RTT, TLS el sıkışması) — ama bu da
--   ŞÜPHE; ayrıştırmadan kanıt olmaz.
--
-- ÇÖZÜM: `requestStart` de kaydedilsin. O an isteğin tarayıcıdan ÇIKTIĞI andır:
--     req_ms                = yönlendirme + DNS + TCP + TLS  (BAĞLANTI)
--     ttfb_ms - req_ms      = istek/yanıt turu + SUNUCU İŞİ   (SUNUCU)
-- Tek sayı ekleyerek iki yıl sürebilecek bir tartışma bitiyor.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.perf_samples
  add column if not exists req_ms integer;

comment on column public.perf_samples.req_ms is
  'Navigation Timing requestStart (ms). Gezinme başlangıcından isteğin çıkışına: yönlendirme+DNS+TCP+TLS. `ttfb_ms - req_ms` = sunucu işi + bir ağ turu. Bkz. sql/features-ttfb-ayristirma.sql';

-- ═══════════════════════════════════════════════════════════════════════════
-- DOĞRULAMA (birkaç gün veri biriktikten sonra)
--   select
--     count(*)                                                  as n,
--     percentile_disc(0.75) within group (order by req_ms)       as baglanti_p75,
--     percentile_disc(0.75) within group (order by ttfb_ms - req_ms) as sunucu_p75,
--     percentile_disc(0.75) within group (order by ttfb_ms)      as toplam_p75
--   from public.perf_samples
--   where req_ms is not null and ttfb_ms is not null and ttfb_ms >= req_ms
--     and created_at > now() - interval '7 days';
--
--   baglanti_p75 baskınsa → sorun ağ/el sıkışma (CDN kenarı, h3, TLS oturum
--     yeniden kullanımı, preconnect). Sunucuyu optimize etmek İŞE YARAMAZ.
--   sunucu_p75 baskınsa → asıl darboğaz gerçekten fonksiyon/ISR tarafı.
-- ═══════════════════════════════════════════════════════════════════════════
