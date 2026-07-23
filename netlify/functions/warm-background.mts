// ════════════════════════════════════════════════════════════════════════
// DEPLOY SÜPÜRGESİ — deploy sonrası ilk-ziyaretçi bedelini robota ödetir.
//
// PROBLEM: Netlify'da ön-render edilmiş ("statik") sayfa bile HER DEPLOY'da
// cache'ten düşer. O URL'e deploy sonrası ilk giren kişi fonksiyonu uyandırır
// ve 3-4,5 sn bekler; sonrakiler 0,3 sn alır. Bu sitede ~6 deploy/gün ve
// ~3 ziyaretçi/gün olduğu için neredeyse HER ziyaretçi o "ilk kişi" oluyor.
// (Ölçüm: / → "Netlify Edge"; fwd=stale → 0,82 sn.)
//
// ÇÖZÜM: deploy biter bitmez (Netlify "Deploy succeeded" bildirimi) bu fonksiyon
// cache'lenebilir URL'leri bir kez gezer → CDN dolar → gerçek ziyaretçi Edge
// hit alır ve fonksiyon HİÇ çalışmaz.
//
// KATMAN AYRIMI: burada CACHE dolduruluyor; dolan sayfada fonksiyon hiç
// çalışmıyor → 0,3 sn. Cache'lenebilir sayfalar için doğru katman budur.
// Cache'e GİREMEYEN tek kritik rota /feed (no-store): onun FONKSİYON katmanını
// 5 dakikada bir keep-warm.mts ısıtır; deploy'un hemen ertesi için de bu
// fonksiyonun sonunda tek bir uyandırma isteği atılır (2026-07-23).
//
// Tetik:  Netlify → Site configuration → Notifications → Deploy notifications
//         → "Deploy succeeded" → HTTP POST →
//         https://basementonfire.com/.netlify/functions/warm-background?key=<WARM_SECRET>
// ════════════════════════════════════════════════════════════════════════

const SITE = 'https://basementonfire.com';
const CONCURRENCY = 4;
const HARD_CAP = 80; // emniyet kemeri: izin listesi bozulsa bile kredi patlamasın
const UA = 'BasementsCacheWarmer/1.0 (+https://basementonfire.com)';

// ⚠⚠ TAŞIYICI SATIR — SAKIN KALDIRMA (2026-07-16'da CANLI ÖLÇÜMLE bulundu) ⚠⚠
//
// Netlify cache'i `accept-encoding`'e göre AYRIŞIR (bkz. yanıttaki
// `Netlify-Vary: header=…|accept-encoding`). Yani her sıkıştırma tercihi AYRI
// bir cache girdisidir ve yanlış anahtarı ısıtan süpürge SESSİZCE işe yaramaz.
//
// Node'un fetch'i (undici) tarayıcıların aksine `accept-encoding`'i KENDİLİĞİNDEN
// GÖNDERMEZ. Bu başlık olmasaydı süpürge "sıkıştırmasız" kovayı ısıtırdı — ki
// oraya hiçbir gerçek ziyaretçi düşmez. Ölçüm (dokunulmamış makaleler):
//   Chrome  (gzip, deflate, br, zstd) → Durable; hit   0,79 sn  ✅
//   Safari  (gzip, deflate, br)       → Durable; hit   0,84 sn  ✅
//   başlıksız (curl varsayılanı)      → fwd=stale      ✗ (kimse kullanmaz)
//
// `zstd` BİLEREK YOK: 'gzip, br' hem Chrome'un hem Safari'nin düştüğü ORTAK
// kovayı ısıtır. zstd eklenirse Chrome ayrı bir kovaya kayar ve Safari ıskalar.
//
// Ölçüm tuzağı: düz `curl` ile test edersen HEP ıskalarsın (o da başlık
// göndermez). Doğrulamak istersen tarayıcı başlığıyla iste:
//   curl -H 'accept-encoding: gzip, deflate, br, zstd' https://basementonfire.com/articles/<slug>
const ACCEPT_ENCODING = 'gzip, br';

// ⚠ SİTEMAP'İ OLDUĞU GİBİ SÜPÜRME. Sitemap GOOGLE için yazılmış ve içinde
// cache'lenemeyen DİNAMİK rotalar var: /akis, /muzik, /u/[username] (5.000'e
// kadar), /hashtag/[tag] (2.000), /p/[id] (5.000), /makale/[slug].
// Onları süpürmek (a) bugün boşa istek, (b) yarın 1000 makale + 5000 kullanıcıda
// deploy başına ~12.000 istek = kredi felaketi olurdu.
//
// Bu yüzden İZİN LİSTESİ (allowlist) kullanılıyor — güvenli varsayılan:
// sitemap'e yeni bir dinamik rota eklenirse süpürgeye SESSİZCE sızamaz.
// Yeni MAKALE eklenince ise otomatik kapsanır (lib/articles.ts → sitemap → burası).
const ALLOW = [
  /^\/$/,                          // landing (statik)
  /^\/articles\/[a-z0-9-]+$/,      // 32 makale (statik) — asıl kazanç burada
  /^\/discover$/,                  // ISR 60 sn — kısmi fayda, bkz. not
  /^\/akis$/,                      // ISR 30 sn (2026-07-18 dönüşümü)
  /^\/muzik$/,                     // ISR 120 sn (2026-07-18 dönüşümü)
  // /hashtag/* BİLEREK YOK: sitemap 2.000 etiket taşıyor, süpürmek kredi tuzağı.
];
// /discover NOTU (ölçüm): süpürgenin isteğinde `"Netlify Durable"; fwd=bypass`
// görünüyor — yani ISR sayfasının durable girdisi doldurulamıyor, yalnız süpürgenin
// kendi bölgesindeki edge dolar. Buna rağmen listede: `"Next.js"; hit` sayesinde
// sayfa Next önbelleğinden geliyor (deploy sonrası ~1,1 sn, soğuk 3,5 sn değil).
// Yani makalelerdeki kadar (0,8 sn) değil ama yine de kazanç var.

const cacheable = (u: string): boolean => {
  try {
    const url = new URL(u);
    if (url.origin !== SITE) return false;
    return ALLOW.some((re) => re.test(url.pathname));
  } catch {
    return false;
  }
};

export default async (req: Request) => {
  // ── Yetki. Fail-closed: WARM_SECRET tanımlı değilse HİÇ çalışma.
  // Not: background function çağırana her hâlükârda 202 döner; bu 401 arayana
  // ulaşmaz. Koruma "iş yapılmaması"dır — yetkisiz çağrı 40 istek tetikleyemez.
  const secret = process.env.WARM_SECRET;
  const key = new URL(req.url).searchParams.get('key');
  if (!secret) {
    console.error('[warm] IPTAL: WARM_SECRET ortam degiskeni tanimli degil (scope: Functions olmali)');
    return new Response('no secret configured', { status: 401 });
  }
  if (key !== secret) {
    console.warn('[warm] REDDEDILDI: anahtar uyusmadi');
    return new Response('unauthorized', { status: 401 });
  }

  const t0 = Date.now();

  // ── Süpürülecek liste: sitemap (tek kaynak, yeni makaleyi kendi getirir) + filtre
  let urls: string[] = [];
  try {
    const r = await fetch(`${SITE}/sitemap.xml`, { headers: { 'user-agent': UA } });
    const xml = await r.text();
    const all = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    urls = all.filter(cacheable).slice(0, HARD_CAP);
    console.log(`[warm] sitemap: ${all.length} url -> cache'lenebilir: ${urls.length}`);
  } catch (e) {
    console.error('[warm] sitemap alinamadi:', e);
    return new Response('sitemap error', { status: 500 });
  }

  if (!urls.length) {
    console.error('[warm] IPTAL: izin listesinden gecen URL yok — sitemap bicimi degismis olabilir');
    return new Response('no urls', { status: 500 });
  }

  // ── Gez. Eşzamanlılık düşük: amaç yük bindirmek değil, cache doldurmak.
  let i = 0, ok = 0, fail = 0;
  const lines: string[] = [];

  async function worker() {
    while (i < urls.length) {
      const url = urls[i++];
      const t = Date.now();
      try {
        const res = await fetch(url, {
          headers: { 'user-agent': UA, accept: 'text/html', 'accept-encoding': ACCEPT_ENCODING },
        });
        // GÖVDEYİ TÜKET: yanıt tamamen okunmadan CDN girdiyi saklamayabilir.
        // Bu satır olmadan süpürge sessizce hiçbir şey doldurmaz.
        await res.arrayBuffer();
        ok++;
        // cache-status'u LOGLA: bu satır "fonksiyonun kendi fetch'i CDN'den
        // geçiyor mu?" sorusunun tek doğrudan kanıtı. 'stored' görüyorsak çalışıyor.
        lines.push(`${res.status} ${String(Date.now() - t).padStart(5)}ms ${res.headers.get('cache-status') ?? '-'} ${new URL(url).pathname}`);
      } catch (e) {
        fail++;
        lines.push(`ERR   ${new URL(url).pathname} — ${String(e)}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, worker));

  // ── /feed UYANDIRMA (cache değil): deploy tüm sıcak Lambda instance'larını
  // öldürür; girişli kullanıcının ilk uğrağı /feed no-store olduğundan süpürme
  // ona çare değil. Bu TEK anonim istek server-handler'ı ayağa kaldırır ki
  // keep-warm.mts'in ilk turundan (≤5 dk) önce gelen girişli ziyaretçi soğuk
  // başlatma (ölçüm: 3,9-8,2 sn) ödemesin. İzin listesine BİLEREK konmadı:
  // liste "cache'lenebilir" anlamı taşıyor, /feed değil.
  try {
    const t = Date.now();
    const res = await fetch(`${SITE}/feed`, {
      headers: { 'user-agent': UA, accept: 'text/html', 'accept-encoding': ACCEPT_ENCODING },
    });
    await res.arrayBuffer();
    lines.push(`${res.status} ${String(Date.now() - t).padStart(5)}ms (lambda-uyandirma) /feed`);
  } catch (e) {
    lines.push(`ERR   /feed uyandirma — ${String(e)}`);
  }

  console.log(`[warm] bitti: ${ok} ok / ${fail} hata / ${Date.now() - t0}ms`);
  for (const l of lines) console.log('[warm]  ' + l);

  return new Response(JSON.stringify({ ok, fail, ms: Date.now() - t0 }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};
