-- ═══════════════════════════════════════════════════════════════════════════
-- RUM: LCP'nin NE OLDUĞUNU kaydet (yalnızca etiket adı)
--
-- NEDEN: `perf_samples` bugüne kadar LCP'yi yalnız SÜRE olarak tutuyordu
-- (`lcp_ms`). "LCP muhtemelen video/görsel" cümlesi bu yüzden hep ÇIKARIM'dı,
-- ölçüm değil. 21.08.2026 denetimi: telefonda LCP−TTFB p75 = 1,41 sn,
-- masaüstünün iki katı — ve bu ağ değil BİZİM payımız. Sıcak yolun 61-139 ms
-- olduğu bir projede kalan en büyük açıklanamayan kalem bu.
--
-- NEDEN BU ÖRNEKLEMLE ÖLÇÜLEBİLİR: diğer perf maddelerinin aksine bu bir
-- YÜZDELİK karşılaştırması değil, KATEGORİK bir soru. "Açılışların %X'inde LCP
-- bir IMG" cümlesi ~100 örnekle ±%8 hassasiyetle cevaplanır; p75 kolu başına
-- gereken ~1840 örneğe ihtiyaç yok. ⚠ Ama yalnızca TOPLAMDA — 20 yola bölünce
-- hücreler ölür, sayfa bazlı kırılıma güvenme.
--
-- ⛔ YALNIZ tagName SAKLANIR. `element.id`, `src`, selector, outerHTML ASLA:
--    bir kullanıcının avatar URL'i ya da gönderi görseli KİŞİSEL VERİDİR ve bu
--    ölçüm hattı bilerek çerezsiz/kimliksiz kuruldu (perf_samples'ta
--    visitor_hash bile yok). Etiket adı kimseyi işaret etmez.
--
-- ⛔ `perf_dashboard()` FONKSİYONUNA DOKUNULMADI. O fonksiyonun ZATEN İKİ
--    kopyası var (features-web-vitals.sql ve fix-web-vitals-olcum.sql, ~230
--    satır). Üçüncü bir kopya üretmek, projede "CSP'nin iki kopyası" tuzağının
--    doğduğu desenin aynısı olurdu — yanlış kopyayı düzenlersen sessizce
--    hiçbir şey olmaz. Bu yüzden kırılım AYRI ve küçük bir RPC.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.perf_samples
  add column if not exists lcp_el text;

comment on column public.perf_samples.lcp_el is
  'LCP ögesinin etiket adı (IMG/VIDEO/H1/DIV/... ya da DIGER). NULL = öge okunamadı (DOM''dan koptu / çapraz-köken iframe). Yalnız tagName — id/src/selector KAYDEDİLMEZ (kişisel veri).';

-- Kardinalite koruması: istemci ve lib zaten beyaz liste süzüyor, bu üçüncü
-- kapı. Serbest metin girerse sütun çöplüğe döner ve kırılım okunamaz olur.
alter table public.perf_samples
  drop constraint if exists perf_samples_lcp_el_gecerli;

alter table public.perf_samples
  add constraint perf_samples_lcp_el_gecerli check (
    lcp_el is null or lcp_el in (
      'IMG','VIDEO','H1','H2','H3','P','SPAN','DIV','CANVAS','svg','A','SECTION','BUTTON','DIGER'
    )
  );

-- ── Kırılım RPC'si ─────────────────────────────────────────────────────────
-- perf_dashboard()'dan AYRI. Yalnız bu soruyu cevaplar: hangi öge türü kaç
-- açılışta LCP oldu ve o türde LCP ne kadar sürdü.
--
-- ⚠ 'bilinmiyor' KOVASI GÖSTERİLİR. `lcp_el IS NULL` olan satırlar gizlenirse,
--    gerçekte %40'ı null olan bir dağılıma bakıp "LCP'lerin %80'i IMG" diye
--    okursun. Bu, bu projenin defalarca düştüğü hata sınıfının (gizli sekme
--    kirliliği, yol atfı, reload/navigate kontrastı) tam olarak aynısı.
create or replace function public.perf_lcp_ogeleri(gun_sayisi int default 30)
returns table (
  oge          text,
  ornek        bigint,
  pay_yuzde    numeric,
  lcp_p50      int,
  lcp_p75      int,
  lcp_pay_p75  int   -- LCP − TTFB: ağ değil BİZİM payımız
)
language sql
stable
security definer
set search_path = public
as $$
  with temiz as (
    select *
    from public.perf_samples
    where created_at >= now() - (gun_sayisi || ' days')::interval
      -- Panelin geri kalanıyla AYNI kirlilik filtresi.
      and coalesce(gizli, false) = false
      and coalesce(ekip,  false) = false
      and lcp_ms is not null
  ),
  toplam as (select count(*)::numeric as n from temiz)
  select
    coalesce(t.lcp_el, 'bilinmiyor')                                        as oge,
    count(*)                                                                as ornek,
    round(100.0 * count(*) / nullif((select n from toplam), 0), 1)          as pay_yuzde,
    percentile_disc(0.50) within group (order by t.lcp_ms)::int             as lcp_p50,
    percentile_disc(0.75) within group (order by t.lcp_ms)::int             as lcp_p75,
    percentile_disc(0.75) within group (
      order by (t.lcp_ms - coalesce(t.ttfb_ms, 0))
    )::int                                                                  as lcp_pay_p75
  from temiz t
  group by coalesce(t.lcp_el, 'bilinmiyor')
  order by count(*) desc;
$$;

revoke all on function public.perf_lcp_ogeleri(int) from public, anon, authenticated;
grant execute on function public.perf_lcp_ogeleri(int) to service_role;


-- ═══════════════════════════════════════════════════════════════════════════
-- DOĞRULAMA
--
--  1. Sütun geldi mi:
--       select column_name from information_schema.columns
--       where table_name = 'perf_samples' and column_name = 'lcp_el';
--
--  2. Deploy sonrası siteyi ANONİM bir tarayıcıda aç, sekmeyi gizle
--     (beacon pagehide/visibilitychange'de gönderiyor), sonra:
--       select lcp_el, count(*) from public.perf_samples
--       where created_at > now() - interval '10 minutes' group by 1;
--     ⚠ Kendi tarayıcında `?notrack` işaretliyse satır `ekip=true` yazılır ve
--       RPC onu ELER — test ederken bunu unutma.
--
--  3. Kırılım:
--       select * from public.perf_lcp_ogeleri(30);
--     'bilinmiyor' payı yüksek çıkarsa (>%30) bu bir HATA DEĞİL, ölçümün
--     sınırı: öge gönderim anından önce DOM'dan kopmuş demektir. Yorumlarken
--     paydayı ona göre oku.
--
--  4. ⚠ SIRA: bu SQL deploy'dan SONRA koşarsa, arada gelen satırlar
--     lib/perf-tracking.ts'teki yedek yola düşer ve gizli/ekip/proto/lcp_el
--     ALANLARININ HEPSİ boş yazılır. Önce SQL, sonra deploy tercih edilir;
--     tersi olduysa o pencereye ait satırları yorumlarken dikkat et.
-- ═══════════════════════════════════════════════════════════════════════════
