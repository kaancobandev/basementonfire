import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { db, isMissingSchema, logIfError } from '@/lib/supabase/server';
import { clientIp, type HeaderGetter } from '@/lib/geo';

/**
 * API hız freni — TEK KAYNAK. Algoritma: token bucket (sql/features-rate-limit.sql).
 *
 * NEDEN SAYIM DEĞİL: eski frenler "son 60 sn'de kaç satır var" diye sayıyordu.
 * Doğru çalışıyordu ama (a) sayılacak bir satır gerektiriyordu — okuma uçlarını
 * ve anonim trafiği koruyamıyordu, (b) aynı mantık 5 dosyada farklı sayılarla
 * tekrar ediyordu.
 *
 * NEDEN SABİT PENCERE DEĞİL: "dakikada 100" diye sayan bir pencere, dakikanın
 * son saniyesinde 100 + yeni dakikanın ilk saniyesinde 100 isteğe izin verir —
 * kuralı bozmadan 2 saniyede 200. Kovada pencere yoktur, sürekli dolar.
 *
 * ⚠ HIZ ÖLÇÜLDÜ, KAZANÇ DEĞİL: 2026-08-10'da canlı DB'ye karşı kıyaslandı,
 * RPC sayım sorgusundan ~33 ms YAVAŞ (posts'ta 4 satır varken sayım zaten
 * bedava; süreyi ağ turu belirliyor). Bu dosyanın gerekçesi performans değil:
 * tek kaynak + anonim/okuma uçlarını koruyabilmek + patlama ile sürdürülebilir
 * hızı ayrı ayarlayabilmek.
 */

export type Rule = {
  /** Kova büyüklüğü — izin verilen ANİ patlama. */
  capacity: number;
  /** Saniyede eklenen token — uzun vadeli SÜRDÜRÜLEBİLİR hız. */
  refillPerSec: number;
  /** Bu ucun fiyatı. Pahalı iş daha çok token yer. Varsayılan 1. */
  cost?: number;
};

/**
 * Kural kayıt defteri. Yeni bir uç eklemek = buraya bir satır + route'ta bir
 * `limit()` çağrısı. Sayılar, yerini aldıkları eski sayım frenleriyle AYNI
 * sürdürülebilir hızı verir — bu geçiş davranış değiştirmedi.
 *
 * ADI `RATE_LIMITS`, `LIMITS` DEĞİL: `lib/userArticles.ts` zaten `LIMITS` diye
 * bir sabit dışa veriyor (başlık/özet karakter tavanları) ve iki dosyayı aynı
 * route'a import eden biri sessiz bir çakışmaya düşerdi.
 *
 * BURAYA TAŞINMAYAN İKİ FREN — ikisi de aynı 429'u döndüğü için karıştırılmaya
 * müsait, ikisi de hız limiti DEĞİL:
 *  · user-articles/route.ts `pendingPerUser` — iş kuralı ("aynı anda en fazla
 *    N makalen incelemede olabilir"), zamanla ilgisi yok.
 *  · user-articles/[id]/route.ts 5 saniyelik debounce — ölçütü satırın KENDİ
 *    updated_at/pending_at'i ve o satır zaten okunmuş durumda, yani fren
 *    BEDAVA. Kovaya çevirmek her düzenlemeye bir ağ turu (~450 ms) eklerdi.
 */
export const RATE_LIMITS = {
  // Medyalı paylaşım (/akis + /gonderi-olustur → /api/upload). ASIL PAYLAŞIM
  // UCU BURASI; `post` aşağıda, akıştaki satır içi metin bestecisidir.
  // Devraldığı bir sayım YOK — bu uçta hiç fren yoktu, sayılar bu yüzden yeni.
  //
  // 10'luk patlama (bir oturumda albüm paylaşmak meşru) + saatte 10
  // sürdürülebilir = teorik günde 240. Kıyas için: Instagram günde 100,
  // Facebook 25, TikTok ~15. Bu sitenin TÜM ZAMANLAR toplamı 12 medyalı
  // gönderi, en yoğun günü 4 (2026-08-10'da ölçüldü) — yani tavan, gerçek
  // kullanımın ~60 katı. İlk sürüm saatte 30'du; ölçüm karşısında gereksiz
  // gevşek kaldığı için indirildi.
  upload: { capacity: 10, refillPerSec: 10 / 3600 },
  post: { capacity: 5, refillPerSec: 5 / 60 },        // dakikada 5 gönderi
  comment: { capacity: 8, refillPerSec: 8 / 60 },     // dakikada 8 yorum
  dyk: { capacity: 10, refillPerSec: 10 / 3600 },     // saatte 10 bilgi kartı
  gameScore: { capacity: 10, refillPerSec: 10 / 3600 }, // saatte 10 skor

  // Giriş denemesi. 23.08.2026'da eklendi, sebebi doğrudan "kullanıcı adıyla
  // giriş" özelliği: KULLANICI ADLARI HERKESE AÇIK (/u/<ad> anonim 200 döner),
  // yani saldırganın artık e-posta tahmin etmesine gerek yok — geçerli kimlik
  // listesi zaten elinde. Bu, kaba kuvvetin girdi tarafını ölçülebilir biçimde
  // kolaylaştırıyor.
  //
  // Kova IP başına (identify → IP+gün+salt hash'i). 10 patlama + 5 dakikada 10
  // sürdürülebilir: bu sitede giriş günde tek haneli, yani meşru kullanıcı bunu
  // ASLA görmez; kaba kuvvet ise dakikada ~2 denemeye iner.
  //
  // ⚠ Cömert tutuldu çünkü mobil operatörlerde (Turkcell/Vodafone CGNAT) çok
  //   sayıda gerçek kullanıcı TEK IP paylaşabilir — dar bir kova onları kilitler.
  // ⚠ Fren FAIL-OPEN (dosya başındaki nota bak): DB tökezlerse giriş çalışmaya
  //   devam eder. Yani bu, tek başına bir güvenlik duvarı DEĞİL, Supabase'in
  //   kendi auth limitinin önüne konmuş ucuz bir yavaşlatıcı.
  login: { capacity: 10, refillPerSec: 10 / 300 },

  // İmzalı yükleme URL'i üretimi (/api/storage/sign). 23.08.2026 güvenlik
  // denetiminde eklendi: bu uç BEDAVA yazma yetkisi dağıtıyor ve `/api/upload`
  // frenini tamamen ATLIYOR — dosya bytes'ı o route'tan geçmediği için asıl
  // yükleme doğrudan Supabase'e gidiyor. Frensizken tek hesapla sınırsız imza
  // alıp depolama şişirmek (ve yetim dosya biriktirmek) serbestti.
  //
  // ⚠ BU FREN BOYUT SORUNUNU ÇÖZMEZ. `size` istemcinin BEYANI; saldırgan
  //   `size:1` deyip 250 MB PUT edebilir. Gerçek tavan bucket'ın
  //   `file_size_limit`'idir ve `media` bucket'ında NULL (yani proje geneli
  //   250 MB) → ilan edilen avatar 10 MB / hikâye 50 MB limitleri ETKİSİZ.
  //   Kalıcı çözüm Supabase tarafında: kind başına ayrı bucket + bucket
  //   limiti. Fren yalnızca hacmi sınırlar, tek dosyanın boyutunu değil.
  sign: { capacity: 20, refillPerSec: 20 / 600 },

  // Ölçüm beacon'ları (/api/hit + /api/perf). 23.08.2026 denetiminde eklendi.
  //
  // İkisi de KİMLİKSİZ yazma ucu ve hiç freni yoktu. Zarar veri sızıntısı değil,
  // ALETİN KENDİSİ: bu iki uç trafik panelini ve RUM'u besliyor, yani kararların
  // dayandığı sayıları.
  //
  // 🚨 ASIL MESELE `uniques`. Ölçüldü: `traffic_dashboard`
  //    `count(distinct visitor_hash)` sayıyor ve `visitor_hash` =
  //    sha256(ip|USER-AGENT|gün|salt). Yani sadece UA başlığını değiştirerek
  //    atılan istekler HER SEFERİNDE YENİ BİR "tekil ziyaretçi" üretiyordu.
  //    "Günlük 13,4 tekil, düşüşte" gibi bir sayıya bakarak karar veriliyor;
  //    o sayı dışarıdan serbestçe oynatılabiliyordu.
  //
  // Fren IP başına (identify → UA'ya BAKMAZ), yani UA çevirerek kaçmak
  // işe yaramaz: bir IP tek kova.
  //
  // Kova bilerek ÇOK cömert: sitenin tüm günlük trafiği ~13 tekil (2026-08-07).
  // Saatte 600, tek IP için o trafiğin ~46 katı → gerçek ziyaretçi (paylaşılan
  // ofis/CGNAT IP'si dahil) bunu görmez, sel ise saatte 600 satırla sınırlanır.
  //
  // ⚠ AŞILDIĞINDA 429 DEĞİL 204 DÖNER ve ölçüm sessizce düşer. Beacon'ın
  //   yanıtı zaten okunmuyor (sendBeacon/keepalive); 429 dönmek hem işe
  //   yaramaz hem de frenin varlığını ilan ederdi.
  beacon: { capacity: 600, refillPerSec: 600 / 3600 },
} satisfies Record<string, Rule>;

export type RuleName = keyof typeof RATE_LIMITS;

export type Verdict = {
  ok: boolean;
  /** Kovada kalan token (yaklaşık). */
  remaining: number;
  /** Kaç saniye sonra tekrar denenebilir. Geçtiyse 0. */
  retryAfter: number;
};

/**
 * İsteği kime yazacağız? Girişliyse kullanıcı, değilse IP.
 *
 * GİZLİLİK: ham IP HİÇBİR YERE yazılmaz — page_views'daki desenin aynısı,
 * günlük dönen tuzlu hash (lib/pageview-tracking.ts). Ertesi gün eşleşmez.
 *
 * page_views'DAN BİLEREK AYRILAN NOKTA: oradaki hash'e user-agent de girer,
 * burada GİRMEZ. Sebebi amaç farkı: orada aynı tarayıcıyı saymak istiyoruz,
 * burada kötüye kullanımı durdurmak. UA hash'e girseydi, saldırgan her istekte
 * user-agent'ı değiştirerek kendine sınırsız yeni kova açardı.
 */
/**
 * `identify()` IP başlığı hiç yoksa bunu döner — ve o hâlde HERKES TEK KOVAYA
 * düşer. Yazma uçlarında bu doğru davranış (kimliksiz sel yine sınırlanmalı),
 * ama ÖLÇÜM uçlarında tam tersi: tek kova, tüm sitenin analitiğini sessizce
 * kısar ve panel "trafik düştü" der. Beacon rotaları bu değeri görürse freni
 * ATLAR — aleti bozmaktansa sınırsız bırakmak yeğdir.
 */
export const KIMLIKSIZ = 'ip:bilinmiyor';

export function identify(h: HeaderGetter, userId?: number | string | null): string {
  if (userId != null && userId !== '') return `user:${userId}`;
  const ip = clientIp(h);
  // IP okunamazsa (yerel geliştirme, eksik başlık) tüm anonimler tek kovayı
  // paylaşır. Üretimde Netlify x-nf-client-connection-ip'yi her zaman basar.
  if (!ip) return KIMLIKSIZ;
  const salt = process.env.SUPABASE_SERVICE_KEY || 'basements-salt';
  const day = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
  const hash = crypto.createHash('sha256').update(`${ip}|${day}|${salt}`).digest('hex').slice(0, 32);
  return `ip:${hash}`;
}

/**
 * Token harcamayı dener. Kapı budur.
 *
 * FAIL-OPEN: DB hata verirse (ya da göç henüz çalıştırılmadıysa) istek GEÇER.
 * Bilinçli: burası içerik sitesi, banka değil. Supabase tökezlediğinde herkesi
 * paylaşım yapamaz hale getirmek, korumaya çalıştığımız şeyden daha büyük
 * hasar olurdu. Tersini isteyen uç olursa `ok`'i çağıran tarafta değerlendirir.
 */
export async function limit(
  name: RuleName,
  h: HeaderGetter,
  userId?: number | string | null,
): Promise<Verdict> {
  return limitKey(name, identify(h, userId));
}

/**
 * Kimliği kendin verdiğin sürüm. Kullanıcı/IP dışında bir şeye göre saymak
 * gerektiğinde (ör. game-scores rumuza göre sayar) bunu çağır.
 * `identity` serbest metin: anahtar `<kural>:<identity>` olur.
 */
export async function limitKey(name: RuleName, identity: string): Promise<Verdict> {
  const rule: Rule = RATE_LIMITS[name];
  const key = `${name}:${identity}`;
  try {
    const { data, error } = await db.rpc('consume_token', {
      p_key: key,
      p_capacity: rule.capacity,
      p_refill: rule.refillPerSec,
      p_cost: rule.cost ?? 1,
    });
    if (error) {
      // Göç çalıştırılmadıysa sessizce geç (uykuda-güvenli); başka hatayı logla.
      if (!isMissingSchema(error)) logIfError(`rateLimit ${name}`, error);
      return { ok: true, remaining: rule.capacity, retryAfter: 0 };
    }
    // consume_token `returns table (...)` → PostgREST tek satırlık dizi döner.
    const row = (Array.isArray(data) ? data[0] : data) as
      | { allowed: boolean; remaining: number | string; retry_after: number | string }
      | undefined;
    if (!row) return { ok: true, remaining: rule.capacity, retryAfter: 0 };
    return {
      ok: row.allowed === true,
      remaining: Math.max(0, Number(row.remaining)),
      retryAfter: Math.max(0, Math.ceil(Number(row.retry_after))),
    };
  } catch (e) {
    console.error(`[rateLimit] ${name} hata:`, e);
    return { ok: true, remaining: rule.capacity, retryAfter: 0 };
  }
}

/**
 * 429 yanıtı. `Retry-After` ŞART: istemci ne kadar bekleyeceğini bilmezse
 * geri çekilemez, körlemesine daha sert vurur.
 */
export function tooMany(message: string, v: Verdict, name: RuleName): NextResponse {
  const rule: Rule = RATE_LIMITS[name];
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.max(1, v.retryAfter)),
        'RateLimit-Limit': String(rule.capacity),
        'RateLimit-Remaining': String(Math.floor(v.remaining)),
        'RateLimit-Reset': String(Math.max(1, v.retryAfter)),
      },
    },
  );
}
