// ════════════════════════════════════════════════════════════════════════
// SÜPÜRGENİN PAYLAŞILAN ÇEKİRDEĞİ (2026-07-24'te warm-background.mts'ten
// çıkarıldı). İKİ tetikten çağrılır:
//   1. netlify/functions/deploy-succeeded-background.mts — Netlify OLAY tetiği,
//      koddan gelir, silinemez/unutulamaz (asıl tetik).
//   2. netlify/functions/warm-background.mts — panelden kurulan webhook + elle
//      tetikleme için WARM_SECRET kapılı HTTP ucu (yedek).
// Bu dosya netlify/functions ALTINDA DEĞİL: oradaki her dosya kendi başına bir
// fonksiyon olarak deploy edilir; paylaşılan modülün yeri netlify/lib.
// ════════════════════════════════════════════════════════════════════════

const SITE = 'https://basementonfire.com';
const CONCURRENCY = 4;
const HARD_CAP = 80; // emniyet kemeri: izin listesi bozulsa bile kredi patlamasın
// Kullanıcı makaleleri (/makale/*) büyüyebilir — sitemap 5.000'e kadar taşır.
// HARD_CAP'e güvenmek yetmez (80'i makaleler doldurup asıl sayfaları dışarıda
// bırakırdı) → makalelere AYRI, küçük tavan: en yeni ~20'si ısınır, gerisi ilk
// ziyaretçisini bekler.
const MAKALE_CAP = 20;
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
// cache'e HİÇ giremeyen dinamik rotalar da var: /u/[username] (5.000'e kadar),
// /hashtag/[tag] (2.000), /p/[id] (5.000). Onları süpürmek (a) bugün boşa
// istek, (b) yarın binlerce kullanıcıda deploy başına ~12.000 istek = kredi
// felaketi olurdu.
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
  /^\/lig$/,                       // ISR 300 sn (2026-07-24 eklendi — denetim)
  // Hukuki sayfalar: tamamen statik, sitemap'te var, kayıt akışından linkleniyor.
  /^\/(gizlilik|kosullar|aydinlatma|acik-riza)$/,
  // Kullanıcı makaleleri: ISR 300 sn (2026-07-24 — buradaki eski "cache'lenemez
  // dinamik" notu BAYATTI; rota çoktan force-dynamic'ten ISR'a çevrilmiş).
  // MAKALE_CAP ile ayrıca sınırlanır (yukarıdaki not).
  /^\/makale\/[a-z0-9_-]+$/,
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

const isMakale = (u: string): boolean => {
  try {
    return /^\/makale\/[a-z0-9_-]+$/.test(new URL(u).pathname);
  } catch {
    return false;
  }
};

// Süpürgeyi koştur. `trigger` yalnız log etiketi (webhook / deploy-succeeded).
export async function runWarm(trigger: string): Promise<{ status: number; body: Record<string, unknown> }> {
  const tag = `[warm:${trigger}]`;
  const t0 = Date.now();

  // ── Süpürülecek liste: sitemap (tek kaynak, yeni makaleyi kendi getirir) + filtre
  let urls: string[] = [];
  try {
    const r = await fetch(`${SITE}/sitemap.xml`, { headers: { 'user-agent': UA } });
    const xml = await r.text();
    const all = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    const allowed = all.filter(cacheable);
    // Kullanıcı makalelerine ayrı tavan; kalanlar HARD_CAP'e kadar.
    const makale = allowed.filter(isMakale).slice(0, MAKALE_CAP);
    urls = [...allowed.filter((u) => !isMakale(u)), ...makale].slice(0, HARD_CAP);
    console.log(`${tag} sitemap: ${all.length} url -> cache'lenebilir: ${urls.length} (makale: ${makale.length})`);
  } catch (e) {
    console.error(`${tag} sitemap alinamadi:`, e);
    return { status: 500, body: { error: 'sitemap error' } };
  }

  if (!urls.length) {
    console.error(`${tag} IPTAL: izin listesinden gecen URL yok — sitemap bicimi degismis olabilir`);
    return { status: 500, body: { error: 'no urls' } };
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

  console.log(`${tag} bitti: ${ok} ok / ${fail} hata / ${Date.now() - t0}ms`);
  for (const l of lines) console.log(`${tag}  ` + l);

  return { status: 200, body: { ok, fail, ms: Date.now() - t0 } };
}
