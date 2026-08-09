-- ============================================================================
-- Basements — RUM OLCUM ALETININ ONARIMI (2026-08-09)
-- Supabase SQL Editor'da BIR KEZ calistir. Idempotent (tekrar guvenli).
--
-- ⚠ SIRA: BU DOSYAYI KODDAN ONCE CALISTIR. lib/perf-tracking.ts artik
--   gizli/ekip/proto sutunlarina yaziyor; sutunlar yoksa insert PGRST204 ile
--   duser. (Kodda yedek yol var — sutunsuz tekrar dener — ama o yedek
--   ISARETLERI KAYBEDER, yani panel eski kirli hesabina geri doner.)
--
-- NEDEN: 2026-08-09 denetimi olcum aletinde UC ayri hata buldu. Panelin
-- gosterdigi p75 degerleri bu yuzden ~500 ms sisik ve rota bazli kirilim
-- guvenilmezdi. Somut sonuc: 2026-08-07'de yapilan gercek bir iyilestirme
-- "p75'i oynatmadi" gorundu, cunku gurultu iyilestirmeden buyuktu.
--
--   1. GIZLI SEKME KIRLILIGI. Sayfa arka planda acilirsa boya zamanlamasi
--      spec geregi ya hic raporlanmaz ya da gorunur olundugu ana kayar.
--      Olculdu: 186 ornegin 14'unde fcp_ms > load_ms + 200 (fiziksel olarak
--      IMKANSIZ) ve o 14 satirin LCP p75'i 10.784 ms.
--   2. YOL ATFI HATASI. Beacon location.pathname'i GONDERIM aninda okuyordu;
--      sureler baska sayfaya aitti. 531 page_view / 207 perf satiri = satir
--      basina 2,57 sayfa goruntuleme. (Istemci tarafinda duzeltildi.)
--   3. GELISTIRICI TRAFIGI. perf-tracking.ts yalniz localhost'u eliyordu;
--      PROD'daki kendi gezinmemiz p75'e giriyordu.
--
-- SATIRLAR SILINMIYOR, ISARETLENIYOR. Kirliligin buyuklugunu olcmek de
-- degerli; ayrica esik degisirse gecmis yeniden yorumlanabilir.
-- ============================================================================

-- ── 1. Yeni sutunlar ────────────────────────────────────────────────────────
alter table public.perf_samples add column if not exists gizli boolean;
alter table public.perf_samples add column if not exists ekip  boolean;
alter table public.perf_samples add column if not exists proto text;

comment on column public.perf_samples.gizli is
  'Sayfa, raporlanan boyamadan ONCE gizlendi -> boya metrikleri guvenilmez.';
comment on column public.perf_samples.ekip is
  'Cihaz ?notrack=1 ile isaretli (localStorage ga-disabled) -> gelistirici trafigi.';
comment on column public.perf_samples.proto is
  'ALPN protokolu: h3 / h2 / http-1.1. TTFB kazisi icin eklendi.';

-- Panel her zaman temiz alt kumeyi tariyor; kismi index tam o kumeyi kapsar.
create index if not exists idx_perf_temiz
  on public.perf_samples (created_at desc)
  where coalesce(gizli, false) = false and coalesce(ekip, false) = false;

-- ============================================================================
-- 2. Panel ozeti — TEMIZ alt kume uzerinden.
--
-- IKI YENI METRIK (denetimin ana tavsiyesi): FCP-TTFB ve LCP-TTFB.
-- Gerekce: TTFB p75 = 2929 ms ama sunucu payi olculdu, yalniz 127-180 ms.
-- Aradaki fark baglanti kurulumu ve erisim agi — kodla dokunulamiyor ve
-- devasa varyansiyla LCP p75'i bogyor. LCP p75'te 400 ms'lik gercek bir
-- iyilesmeyi %80 gucle gormek icin kol basina ~1840 ornek (bu trafikte
-- ~90 gun) gerekiyor; FCP-TTFB'de ayni is ~200 ornek (~10 gun).
-- Yani BIZIM ISIMIZIN olculdugu yer bu iki sutun. LCP p75 uzun donem trend.
-- ============================================================================
create or replace function public.perf_dashboard()
returns jsonb
language sql
stable
as $$
  with ham as (
    select * from public.perf_samples where created_at >= now() - interval '30 days'
  ),
  -- ⚠ GIZLI SATIR **SILINMEZ**, YALNIZ BOYA SUTUNLARI GECERSIZ SAYILIR.
  -- Ilk yazdigim surum gizli satirlari TUM metriklerden eliyordu; bu YANLISTI.
  -- Kontrollu deney (2026-08-09, gercek Chrome, sekme hic one alinmadan):
  --   { vis: "hidden", sunucu: 122,2, responseStart: 131,5, fcp: null, proto: h2 }
  -- Yani gizli sekme responseStart'i BOZMUYOR (131,5 ms, sifir sisme) —
  -- yalnizca boyama hic raporlanmiyor. Gizli satiri TTFB'den elemek, hizli
  -- ornekleri atmak demek: olculdu, TTFB p75 2503 -> 2970'e CIKIYORDU.
  -- Dogrusu: TTFB ve load HER satirdan, boya metrikleri yalniz gecerli olandan.
  isaretli as (
    select *,
           (coalesce(gizli, false) = false
            -- GECMISI KURTARAN TEST. 2026-08-09 oncesi satirlarda gizli sutunu
            -- NULL; o donemi fiziksel imkansizlikla eliyoruz: ilk boya, load
            -- olayindan SONRA olamaz. Boylece eski taban cizgisi yeniyle
            -- KIYASLANABILIR kalir. (Hem fcp hem lcp NULL olan satirlar zaten
            -- yuzdeliklere girmiyor -- percentile_cont NULL'lari atlar.)
            and not (fcp_ms is not null and load_ms is not null
                     and fcp_ms > load_ms + 200)) as boya_ok
    from ham
    -- Gelistirici trafigi TEK ELENEN: o satirlarin hicbir sutunu gercek
    -- kullaniciyi temsil etmiyor (sicak baglanti, tekrarli test).
    where coalesce(ekip, false) = false
  ),
  son as (
    select *,
           case when boya_ok then fcp_ms    end as fcp_t,
           case when boya_ok then lcp_ms    end as lcp_t,
           case when boya_ok then cls_x1000 end as cls_t,
           case when boya_ok then inp_ms    end as inp_t,
           -- Bu iki fark kodun etki ettigi TEK pencere. Negatif cikarsa
           -- (saat kaymasi/olcum hatasi) satiri o metrikte sayma.
           case when boya_ok and fcp_ms is not null and ttfb_ms is not null and fcp_ms >= ttfb_ms
                then fcp_ms - ttfb_ms end as fcp_ttfb,
           case when boya_ok and lcp_ms is not null and ttfb_ms is not null and lcp_ms >= ttfb_ms
                then lcp_ms - ttfb_ms end as lcp_ttfb
    from isaretli
  )
  select jsonb_build_object(
    'orneklem_toplam', (select count(*)::int from public.perf_samples),
    'orneklem_30',     (select count(*)::int from son),
    'orneklem_7',      (select count(*)::int from son where created_at >= now() - interval '7 days'),

    -- KIRLILIK RAPORU. Panelde gorunur olmali: aletin neyi neden saymadigini
    -- bilmeden temizlenmis sayilara guvenilmez.
    -- DIKKAT: 'gizli' ve 'imkansiz_boya' satirlari ATILMIYOR — yalnizca BOYA
    -- sutunlari gecersiz sayiliyor; TTFB'leri hala hesaba giriyor.
    'kirlilik', (
      select jsonb_build_object(
        'ham_30',        count(*)::int,
        'ekip_elendi',   count(*) filter (where coalesce(ekip, false))::int,
        'boya_gecersiz', (select count(*) filter (where not boya_ok)::int from isaretli),
        'boya_hic_yok',  (select count(*) filter (where fcp_ms is null and lcp_ms is null)::int from isaretli),
        'ttfb_sayilan',  (select count(ttfb_ms)::int from son),
        'boya_sayilan',  (select count(lcp_t)::int from son)
      ) from ham
    ),

    'metrikler', coalesce((
      select jsonb_agg(to_jsonb(m) order by m.sira)
      from (
        -- ⚠ ETIKET DUZELTILDI. Eskiden "Sunucu ilk baytı" yaziyordu ve bu YANLIS
        -- teshise yol acti: beacon nav.responseStart yaziyor, yani YONLENDIRME +
        -- DNS + TCP + TLS + istek + sunucu TOPLAMI. Origin isleme payi olculdu,
        -- yalniz 105-180 ms. Ikisi ayni sey sanildigi icin aylarca "sunucu yavas"
        -- diye arandi. (Hedef ag: Turkcell/Istanbul, 30 taze baglanti, p75 = 300 ms.)
        select 1 as sira, 'TTFB' as ad, 'İlk bayta kadar TÜM süre (ağ + sunucu)' as aciklama, 800 as iyi, 1800 as kotu,
               (percentile_cont(0.50) within group (order by ttfb_ms))::int as p50,
               (percentile_cont(0.75) within group (order by ttfb_ms))::int as p75,
               (percentile_cont(0.95) within group (order by ttfb_ms))::int as p95,
               count(ttfb_ms)::int as n
        from son
        union all
        select 2, 'FCP', 'İlk yazı/görsel göründü', 1800, 3000,
               (percentile_cont(0.50) within group (order by fcp_t))::int,
               (percentile_cont(0.75) within group (order by fcp_t))::int,
               (percentile_cont(0.95) within group (order by fcp_t))::int,
               count(fcp_t)::int
        from son
        union all
        select 3, 'LCP', 'En büyük içerik göründü', 2500, 4000,
               (percentile_cont(0.50) within group (order by lcp_t))::int,
               (percentile_cont(0.75) within group (order by lcp_t))::int,
               (percentile_cont(0.95) within group (order by lcp_t))::int,
               count(lcp_t)::int
        from son
        union all
        -- ── Kodun etkiledigi pencere. Iyilestirme yapinca ILK BURASI oynar.
        select 4, 'FCP − TTFB', 'İlk bayttan ilk boyamaya (bizim payımız)', 600, 1200,
               (percentile_cont(0.50) within group (order by fcp_ttfb))::int,
               (percentile_cont(0.75) within group (order by fcp_ttfb))::int,
               (percentile_cont(0.95) within group (order by fcp_ttfb))::int,
               count(fcp_ttfb)::int
        from son
        union all
        select 5, 'LCP − TTFB', 'İlk bayttan en büyük içeriğe (bizim payımız)', 1000, 2000,
               (percentile_cont(0.50) within group (order by lcp_ttfb))::int,
               (percentile_cont(0.75) within group (order by lcp_ttfb))::int,
               (percentile_cont(0.95) within group (order by lcp_ttfb))::int,
               count(lcp_ttfb)::int
        from son
        union all
        select 6, 'INP', 'Dokunmaya yanıt süresi', 200, 500,
               (percentile_cont(0.50) within group (order by inp_t))::int,
               (percentile_cont(0.75) within group (order by inp_t))::int,
               (percentile_cont(0.95) within group (order by inp_t))::int,
               count(inp_t)::int
        from son
        union all
        select 7, 'Yükleme', 'Sayfa tamamen yüklendi', 3000, 6000,
               (percentile_cont(0.50) within group (order by load_ms))::int,
               (percentile_cont(0.75) within group (order by load_ms))::int,
               (percentile_cont(0.95) within group (order by load_ms))::int,
               count(load_ms)::int
        from son
      ) m
    ), '[]'::jsonb),

    'lcp_dagilim', (
      select jsonb_build_object(
        'iyi',   count(*) filter (where lcp_t <= 2500)::int,
        'orta',  count(*) filter (where lcp_t > 2500 and lcp_t <= 4000)::int,
        'kotu',  count(*) filter (where lcp_t > 4000)::int
      ) from son where lcp_t is not null
    ),

    'cls_p75', (select (percentile_cont(0.75) within group (order by cls_t))::int from son),

    -- PROTOKOL DAGILIMI (yeni). h3 yayginsa QUIC deneyi gereksiz; h2'de
    -- takiliysak soguk baglanti maliyeti icin somut bir kaldirac var demektir.
    'protokoller', coalesce((
      select jsonb_agg(to_jsonb(pr) order by pr.n desc)
      from (
        select coalesce(proto, 'bilinmiyor') as ad,
               count(*)::int as n,
               (percentile_cont(0.75) within group (order by ttfb_ms))::int as ttfb_p75
        from son group by 1
      ) pr
    ), '[]'::jsonb),

    'cihazlar', coalesce((
      select jsonb_agg(to_jsonb(d) order by d.n desc)
      from (
        select coalesce(device, 'bilinmiyor') as cihaz,
               count(*)::int as n,
               (percentile_cont(0.75) within group (order by lcp_t))::int as lcp_p75,
               (percentile_cont(0.75) within group (order by ttfb_ms))::int as ttfb_p75,
               (percentile_cont(0.75) within group (order by lcp_ttfb))::int as lcp_ttfb_p75
        from son group by 1
      ) d
    ), '[]'::jsonb),

    'baglantilar', coalesce((
      select jsonb_agg(to_jsonb(c) order by c.n desc)
      from (
        select coalesce(conn, 'bilinmiyor') as tur,
               count(*)::int as n,
               (percentile_cont(0.75) within group (order by lcp_t))::int as lcp_p75
        from son group by 1
      ) c
    ), '[]'::jsonb),

    -- Sayfa kirilimi. ⚠ Yol atfi 2026-08-09'a KADAR hatalıydı (beacon yolu
    -- gonderim aninda okuyordu) -> o tarihten onceki satirlarin 'path'ine
    -- guvenme. n < 10 olan satirlari zaten yorumlamaya calisma.
    'sayfalar', coalesce((
      select jsonb_agg(to_jsonb(p) order by p.n desc)
      from (
        select path,
               count(*)::int as n,
               (percentile_cont(0.75) within group (order by lcp_t))::int as lcp_p75,
               (percentile_cont(0.75) within group (order by ttfb_ms))::int as ttfb_p75,
               (percentile_cont(0.75) within group (order by lcp_ttfb))::int as lcp_ttfb_p75,
               max(ttfb_ms)::int as ttfb_max
        from son group by path
        order by count(*) desc
        limit 20
      ) p
    ), '[]'::jsonb),

    -- Gunluk trend. Artik LCP'nin YANINDA LCP-TTFB de var: birincisi ag
    -- gurultusuyle zipliyor, ikincisi bizim isimizi gosteriyor.
    'gunluk', coalesce((
      select jsonb_agg(to_jsonb(g) order by g.day)
      from (
        -- 13 gunluk pencere 30 gunluk `son`dan genis; ayni boya-gecerlilik
        -- kurali burada elle tekrarlaniyor (satir ELENMIYOR, boya NULL'laniyor).
        select (created_at at time zone 'Europe/Istanbul')::date as day,
               count(*)::int as n,
               (percentile_cont(0.75) within group (order by lcp_g))::int as lcp_p75,
               (percentile_cont(0.75) within group (
                 order by case when lcp_g is not null and ttfb_ms is not null
                                 and lcp_g >= ttfb_ms then lcp_g - ttfb_ms end))::int as lcp_ttfb_p75
        from (
          select created_at, ttfb_ms,
                 case when coalesce(gizli, false) = false
                       and not (fcp_ms is not null and load_ms is not null
                                and fcp_ms > load_ms + 200)
                      then lcp_ms end as lcp_g
          from public.perf_samples
          where created_at >= now() - interval '13 days'
            and coalesce(ekip, false) = false
        ) gh
        group by 1
      ) g
    ), '[]'::jsonb),

    'soguk', (
      select jsonb_build_object(
        'adet',  count(*) filter (where ttfb_ms > 1000)::int,
        'toplam', count(ttfb_ms)::int,
        'ornekler', coalesce((
          select jsonb_agg(to_jsonb(s))
          from (
            select path, ttfb_ms, lcp_ms, created_at
            from son where ttfb_ms > 1000
            order by created_at desc limit 10
          ) s
        ), '[]'::jsonb)
      ) from son
    )
  );
$$;

-- ============================================================================
-- 3. GECMISI GERIYE DONUK ISARETLE. Yeni sutunlar eski satirlarda NULL;
-- fiziksel imkansizlik testini bir kez uygulayip kalici olarak damgaliyoruz
-- ki panel disindaki ham sorgular da (ve gelecekteki denetimler) ayni temiz
-- alt kumeyi gorsun.
-- ============================================================================
update public.perf_samples
   set gizli = true
 where gizli is null
   and fcp_ms is not null and load_ms is not null
   and fcp_ms > load_ms + 200;

-- ⚠ KALAN ESKI SATIRLAR BILEREK **NULL** BIRAKILIYOR.
-- Onlari `gizli = false` diye damgalamak, destekleyemeyecegimiz bir iddia olur:
-- 2026-08-09 oncesinde gorunurluk hic kaydedilmedi, yani "gizli degildi" DEGIL
-- "bilmiyoruz" durumundalar. Panel zaten coalesce(gizli,false) ile onlari
-- sayiyor; NULL kalmasi "olculmedi" ile "olculdu ve temizdi" ayrimini koruyor.
-- (Hem fcp hem lcp NULL olan eski satirlar da muhtemelen gizli sekmedir ama
-- ayni imza "boya API'si olmayan eski tarayici" anlamina da gelir — ayirt
-- edemedigimiz icin damgalamiyoruz. Sayaci 'boya_hic_yok' ile takip et.)

-- ============================================================================
-- KONTROL — calistirdiktan sonra:
--
--   select (public.perf_dashboard() -> 'kirlilik');
--
-- Beklenen (2026-08-09 olcumu): ham_30 ~186, boya_gecersiz ~14, ekip_elendi 0.
--
-- ⚠ TTFB p75'in DUSMESINI BEKLEME. Gizli sekme ornekleri TTFB'den ELENMIYOR
-- (kontrollu deney: gizli sekmede responseStart 131,5 ms — sifir sisme, yalniz
-- boyama raporlanmiyor). Elenseydi TTFB p75 2503 -> 2970'e CIKARDI, cunku
-- gizli ornekler HIZLI olanlar. Duzelmesi beklenen sey LCP/FCP tarafi.
--
-- Bu bir HIZLANMA DEGIL, yalnizca aletin duzelmesidir — gercek kullanicilar
-- ayni sureyi goruyor. Yeni taban cizgisi budur; sonraki karsilastirmalar
-- buna gore yapilir. Birincil dogrulama metrigi LCP p75 DEGIL, LCP − TTFB.
-- ============================================================================
