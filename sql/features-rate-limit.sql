-- ============================================================================
-- Basements — API Hiz Limiti (token bucket)
-- Supabase SQL Editor'da BIR KEZ calistir. Idempotent (tekrar guvenli).
--
-- NEDEN: bugunku frenler "son 60 sn'de kac satir var" diye SAYIYOR (posts,
-- article comments, game-scores, did-you-know, user-articles). Dogru calisiyor
-- ama her yazma istegine bir sayim sorgusu biniyor ve ayni mantik 5 ayri
-- dosyada tekrar ediyor. Burasi tek kapiyi kurar: PK uzerinden tek satir.
--
-- ALGORITMA: token bucket. Iki BAGIMSIZ dugmesi var —
--   p_capacity = kova buyuklugu   -> izin verilen ANI patlama (burst)
--   p_refill   = token / saniye   -> uzun vadeli SURDURULEBILIR hiz
-- Sabit pencere sayacinin bilinen acigi ("dakikanin son saniyesinde 100 +
-- yeni dakikanin ilk saniyesinde 100 = 2 saniyede 200") burada YOK, cunku
-- pencere diye bir sey yok: kova surekli doluyor.
--
-- DOLDURMA ZAMANLAYICIYLA YAPILMAZ. Milyon kullanici icin milyon cron olmaz.
-- Kova, istek geldiginde "gecen sure x hiz" ile hesaplanir (tembel doldurma).
-- Bostaki kullanicinin maliyeti sifir: satirina kimse dokunmaz.
--
-- Mevcut guvenlik modeline uyar: RLS acik, policy yok -> erisim yalniz
-- service-role (uygulamanin API route'lari) uzerinden.
-- ============================================================================

create table if not exists public.rate_buckets (
  -- Anahtar bicimi: '<kural>:<kimlik>' — ornekler:
  --   'post:user:42'          girisli kullanicinin gonderi kovasi
  --   'comment:ip:9f3a…'      anonim yorum kovasi (gunluk donen tuzlu hash)
  -- Kimligi TS tarafi uretir (lib/rateLimit.ts), DB anahtari yorumlamaz.
  key        text        primary key,
  tokens     numeric     not null,
  updated_at timestamptz not null default now()
);
alter table public.rate_buckets enable row level security;

-- Temizlik sorgusu (asagida) bu index'ten okur.
create index if not exists idx_rate_buckets_updated
  on public.rate_buckets (updated_at);

-- ============================================================================
-- consume_token — kovadan token harcamayi dener.
--
-- ATOMIKLIK BURADA. Kovayi tek bir yere tasimak TEK BASINA yetmez: 10 sunucu
-- ayni anda "5 token var" okuyup besi birden harcayabilir. Onu kesen sey
-- asagidaki 2. adimin satir kilididir — kilit transaction sonuna kadar durur,
-- ayni anahtara gelen ikinci cagri orada BEKLER. Oku-hesapla-yaz ucusu
-- boylece siralanir.
--
-- Doner: allowed (gecti mi), remaining (kalan token), retry_after (saniye).
-- ============================================================================
create or replace function public.consume_token(
  p_key      text,
  p_capacity numeric,
  p_refill   numeric,            -- saniyede eklenen token
  p_cost     numeric default 1   -- bu istegin fiyati (pahali uc = daha cok)
)
returns table (allowed boolean, remaining numeric, retry_after numeric)
language plpgsql
as $$
declare
  v_tokens numeric;
begin
  -- 1) Kova yoksa DOLU yarat. Iki istek ayni anda gelirse ikincisi 'do nothing'
  --    ile sessizce gecer; sayimi 2. adim zaten dogru yapacak.
  insert into public.rate_buckets (key, tokens, updated_at)
  values (p_key, p_capacity, clock_timestamp())
  on conflict (key) do nothing;

  -- 2) DOLDUR (+ satiri kilitle). Atomikligin tamami bu ifadede.
  --
  --    clock_timestamp() BILEREK secildi, now() DEGIL: now() transaction'in
  --    BASLADIGI ani verir. Kilitte bekleyen bir cagri icin bu an, kilidi
  --    birakan cagrinin yazdigi updated_at'ten ONCE olabilir -> gecen sure
  --    NEGATIF cikar ve kova ters yonde "dolar" (token kaybi). clock_timestamp()
  --    ifade calisirken, yani kilit alindiktan sonra okunur.
  --    greatest(0, ...) ikinci emniyet: saat geri oynasa bile negatif olmaz.
  update public.rate_buckets b
     set tokens = least(
           p_capacity,
           b.tokens + greatest(0, extract(epoch from (clock_timestamp() - b.updated_at))::numeric) * p_refill
         ),
         updated_at = clock_timestamp()
   where b.key = p_key
   returning b.tokens into v_tokens;

  -- Satir arada silindiyse (temizlik) dolu kova varsay — fren kullaniciyi
  -- yanlislikla kilitlemesin.
  v_tokens := coalesce(v_tokens, p_capacity);

  -- 3) HARCA. Ayni transaction, kilit hala bizde.
  if v_tokens >= p_cost then
    update public.rate_buckets b
       set tokens = b.tokens - p_cost
     where b.key = p_key;
    return query select true, v_tokens - p_cost, 0::numeric;
  else
    -- p_cost kadar token birikmesi kac saniye surer? (Retry-After basligi.)
    return query select
      false,
      v_tokens,
      case when p_refill > 0
           then ceil((p_cost - v_tokens) / p_refill)::numeric
           else 3600::numeric   -- hiz 0 = kova hic dolmuyor; makul bir tavan don
      end;
  end if;
end;
$$;

-- GUVENLIK: fonksiyon SECURITY DEFINER DEGIL ve herkese acik DEGIL.
-- Anon/authenticated cagirabilseydi, saldirgan baskasinin anahtariyla
-- (ornegin 'post:user:42') fonksiyonu cagirip O KULLANICININ token'larini
-- bitirebilirdi -> kurbanin hesabi kendi kendine kilitlenirdi. Cagri hakki
-- yalniz service-role'de (API route'lari) kalir.
revoke all on function public.consume_token(text, numeric, numeric, numeric) from public, anon, authenticated;

-- ============================================================================
-- TEMIZLIK (istege bagli). Uzun suredir dokunulmamis kova kesin DOLMUSTUR,
-- yani silmek limiti gevsetmez: bir sonraki istekte dolu olarak yeniden
-- yaratilir. Ara sira elle calistir ya da mevcut bir cron'a ekle.
-- ============================================================================
create or replace function public.prune_rate_buckets()
returns integer
language sql
as $$
  with silinen as (
    delete from public.rate_buckets
     where updated_at < now() - interval '1 day'
    returning 1
  )
  select count(*)::integer from silinen;
$$;
revoke all on function public.prune_rate_buckets() from public, anon, authenticated;

-- ============================================================================
-- BITTI.
--
-- DOGRULAMA (SQL Editor'da calistir): kapasite 5, hiz 0.0833/sn (dakikada 5).
-- Ilk 5 cagri allowed=true, 6.'si allowed=false + retry_after ~12 sn dondurur.
--
--   select * from public.consume_token('test:dogrulama', 5, 0.0833, 1);
--   -- ... 6 kez calistir ...
--   delete from public.rate_buckets where key = 'test:dogrulama';
--
-- Bu dosya calisinca HICBIR SEY DEGISMEZ: tabloyu ve fonksiyonu kurar, o kadar.
-- Frenler ancak lib/rateLimit.ts yazilip route'lar ona baglaninca devreye girer.
-- ============================================================================
