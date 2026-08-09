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
  son as (
    select *,
           -- Bu iki fark kodun etki ettigi TEK pencere. Negatif cikarsa
           -- (saat kaymasi/olcum hatasi) satiri o metrikte sayma.
           case when fcp_ms is not null and ttfb_ms is not null and fcp_ms >= ttfb_ms
                then fcp_ms - ttfb_ms end as fcp_ttfb,
           case when lcp_ms is not null and ttfb_ms is not null and lcp_ms >= ttfb_ms
                then lcp_ms - ttfb_ms end as lcp_ttfb
    from ham
    where coalesce(gizli, false) = false
      and coalesce(ekip,  false) = false
      -- GECMISI KURTARAN FILTRE. 2026-08-09 oncesi satirlarda gizli/ekip
      -- sutunlari NULL; o donemi bu fiziksel imkansizlik testiyle eliyoruz:
      -- ilk boya, load olayindan SONRA olamaz. Boylece eski taban cizgisi de
      -- yeniyle KIYASLANABILIR olur (yoksa duzelme, filtre degisiminden mi
      -- gercek iyilesmeden mi geldi ayirt edilemezdi).
      and not (fcp_ms is not null and load_ms is not null and fcp_ms > load_ms + 200)
  )
  select jsonb_build_object(
    'orneklem_toplam', (select count(*)::int from public.perf_samples),
    'orneklem_30',     (select count(*)::int from son),
    'orneklem_7',      (select count(*)::int from son where created_at >= now() - interval '7 days'),

    -- KIRLILIK RAPORU. Panelde gorunur olmali: aletin ne kadarini attigini
    -- bilmeden temizlenmis sayilara guvenilmez.
    'kirlilik', (
      select jsonb_build_object(
        'ham_30',        count(*)::int,
        'gizli',         count(*) filter (where coalesce(gizli, false))::int,
        'ekip',          count(*) filter (where coalesce(ekip, false))::int,
        'imkansiz_boya', count(*) filter (
                           where fcp_ms is not null and load_ms is not null
                             and fcp_ms > load_ms + 200)::int,
        'temiz',         (select count(*)::int from son)
      ) from ham
    ),

    'metrikler', coalesce((
      select jsonb_agg(to_jsonb(m) order by m.sira)
      from (
        select 1 as sira, 'TTFB' as ad, 'Sunucu ilk baytı' as aciklama, 800 as iyi, 1800 as kotu,
               (percentile_cont(0.50) within group (order by ttfb_ms))::int as p50,
               (percentile_cont(0.75) within group (order by ttfb_ms))::int as p75,
               (percentile_cont(0.95) within group (order by ttfb_ms))::int as p95,
               count(ttfb_ms)::int as n
        from son
        union all
        select 2, 'FCP', 'İlk yazı/görsel göründü', 1800, 3000,
               (percentile_cont(0.50) within group (order by fcp_ms))::int,
               (percentile_cont(0.75) within group (order by fcp_ms))::int,
               (percentile_cont(0.95) within group (order by fcp_ms))::int,
               count(fcp_ms)::int
        from son
        union all
        select 3, 'LCP', 'En büyük içerik göründü', 2500, 4000,
               (percentile_cont(0.50) within group (order by lcp_ms))::int,
               (percentile_cont(0.75) within group (order by lcp_ms))::int,
               (percentile_cont(0.95) within group (order by lcp_ms))::int,
               count(lcp_ms)::int
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
               (percentile_cont(0.50) within group (order by inp_ms))::int,
               (percentile_cont(0.75) within group (order by inp_ms))::int,
               (percentile_cont(0.95) within group (order by inp_ms))::int,
               count(inp_ms)::int
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
        'iyi',   count(*) filter (where lcp_ms <= 2500)::int,
        'orta',  count(*) filter (where lcp_ms > 2500 and lcp_ms <= 4000)::int,
        'kotu',  count(*) filter (where lcp_ms > 4000)::int
      ) from son where lcp_ms is not null
    ),

    'cls_p75', (select (percentile_cont(0.75) within group (order by cls_x1000))::int from son),

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
               (percentile_cont(0.75) within group (order by lcp_ms))::int as lcp_p75,
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
               (percentile_cont(0.75) within group (order by lcp_ms))::int as lcp_p75
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
               (percentile_cont(0.75) within group (order by lcp_ms))::int as lcp_p75,
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
        select (created_at at time zone 'Europe/Istanbul')::date as day,
               count(*)::int as n,
               (percentile_cont(0.75) within group (order by lcp_ms))::int as lcp_p75,
               (percentile_cont(0.75) within group (
                 order by case when lcp_ms is not null and ttfb_ms is not null
                                 and lcp_ms >= ttfb_ms then lcp_ms - ttfb_ms end))::int as lcp_ttfb_p75
        from public.perf_samples
        where created_at >= now() - interval '13 days'
          and coalesce(gizli, false) = false
          and coalesce(ekip,  false) = false
          and not (fcp_ms is not null and load_ms is not null and fcp_ms > load_ms + 200)
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

-- Kalan eski satirlari "temiz" olarak damgala (NULL kalirsa coalesce zaten
-- false sayar; acikca yazmak sonraki sorgulari basitlestirir).
update public.perf_samples set gizli = false where gizli is null;
update public.perf_samples set ekip  = false where ekip  is null;

-- ============================================================================
-- KONTROL — calistirdiktan sonra bunu da kos, kirliligin ne kadar oldugunu gor:
--
--   select (public.perf_dashboard() -> 'kirlilik');
--
-- Beklenen (2026-08-09 olcumu): ham_30 ~186, imkansiz_boya ~14, temiz ~172.
-- LCP p75'in 4256'dan ~3750 bandina inmesi beklenir. Bu bir HIZLANMA DEGIL,
-- yalnizca aletin duzelmesidir — gercek kullanicilar ayni sureyi goruyor.
-- Yeni taban cizgisi budur; bundan sonraki karsilastirmalar buna gore yapilir.
-- ============================================================================
