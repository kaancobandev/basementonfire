import { db } from './supabase/server';

/**
 * HİKÂYE MEDYASI İMZALAMA — TEK KAYNAK.
 *
 * NEDEN VAR (23.08.2026 güvenlik denetimi): hikâye dosyaları `media` (PUBLIC)
 * kovasındaydı ve `stories.media_url` KALICI bir public adres tutuyordu.
 * Ölçüldü: süresi dolmuş 6 hikâyenin 6'sı da anonim isteğe HTTP 206 dönüyordu,
 * üçü gizli hesaba ait. Korumanın tamamı URL gizliliğiydi ve hiç bitmiyordu —
 * hikâyeyi bir kez gören adrese sonsuza dek sahip oluyordu.
 *
 * Artık yeni dosyalar private `stories` kovasında; okuma yüzeyleri buradan
 * kısa ömürlü imzalı URL alır.
 *
 * ⛔ HİKÂYE MEDYASINI BAŞKA HİÇBİR YERDE İMZALAMA. Bu dosyayı atlayan bir
 *    yüzey ya kırık görsel gösterir ya da (eski satırlarda) public adresi
 *    sızdırmaya devam eder. `lib/storyAudience.ts` ile aynı disiplin.
 */

/** İmza ömürleri — yüzeye göre. */
export const IMZA = {
  /** İstek başına üretilen, `no-store` yüzeyler (viewer, kişisel kat, arşiv).
   *  Bir hikâyeyi izlemeye fazlasıyla yeter; paylaşılan adres bu sürede ölür. */
  ISTEK: 60 * 15,
  /**
   * ISR ile önbelleklenen ana sayfa kabuğu.
   * ⚠ SAYFA 1 SAAT ÖNBELLEKTE DURUYOR → imza ondan UZUN olmak ZORUNDA, yoksa
   *   önbellek daha yaşarken adresler ölür ve şerit kırık görsel gösterir.
   *   Buradaki içerik zaten `audiencePredicate(null)`dan geçmiş, yani AÇIK
   *   hesabın AÇIK hikâyesi — uzun imza burada anlamlı bir sızıntı değil.
   *   ⛔ Sayfanın `revalidate` değerini düşürürsen bunu da gözden geçir.
   */
  ISR: 60 * 60 * 3,
} as const;

const KOVA = 'stories';

/** Public URL biçimindeki eski değer mi? (göç öncesi satırlar) */
function eskiPublicUrl(v: unknown): v is string {
  return typeof v === 'string' && /^https?:\/\//i.test(v);
}

/**
 * Verilen yolları TEK ÇAĞRIDA imzalar. Supabase `createSignedUrls` (çoğul)
 * kullanılıyor — hikâye başına ayrı tur atmak şeridi yavaşlatırdı.
 * Dönen harita: yol → imzalı URL. İmzalanamayan yol haritaya girmez.
 */
export async function imzaHaritasi(yollar: string[], omur: number): Promise<Map<string, string>> {
  const harita = new Map<string, string>();
  const benzersiz = [...new Set(yollar.filter((y) => typeof y === 'string' && y.length > 0))];
  if (!benzersiz.length) return harita;

  const { data, error } = await db.storage.from(KOVA).createSignedUrls(benzersiz, omur);
  // Kova henüz yoksa / SQL çalışmadıysa: sessizce boş dön. Çağıran eski
  // `media_url`e düşer, yani özellik uykudayken de hikâye görünmeye devam eder.
  if (error || !data) return harita;

  for (const s of data) {
    if (s.signedUrl && s.path) harita.set(s.path, s.signedUrl);
  }
  return harita;
}

/**
 * Bir hikâye/kapak satırı için gösterilecek adresi seçer.
 *  · `media_path` varsa → imzalı URL (haritadan)
 *  · yoksa → eski public `media_url` (göç edilmemiş satır)
 *  · ikisi de yoksa → null
 */
export function adresSec(
  yol: unknown,
  eskiUrl: unknown,
  harita: Map<string, string>,
): string | null {
  if (typeof yol === 'string' && yol) {
    const imzali = harita.get(yol);
    if (imzali) return imzali;
    // Yol var ama imzalanamadı (kova yok / dosya silinmiş) → eskiye düş.
  }
  return eskiPublicUrl(eskiUrl) ? eskiUrl : null;
}

/**
 * Hikâye dizisini yerinde imzalar: `media_path` olanları toplar, tek çağrıda
 * imzalar ve her satırın `media_url`ünü gösterilecek adresle DEĞİŞTİRİR.
 * Çağıranlar bundan sonra eskisi gibi `media_url` okumaya devam eder — yani
 * tüketici tarafında (istemci bileşenleri) hiçbir değişiklik gerekmez.
 */
/**
 * Şerit yapısını (StoryUser[] → stories[]) imzalar.
 *
 * `buildStoryUsers` iç içe bir yapı üretiyor ve İKİ farklı bağlamda çağrılıyor:
 *  · `lib/feedPersonal.ts` — istek başına, `no-store` → kısa imza
 *  · `app/page.tsx`        — ISR, 1 saat önbellekte → uzun imza (IMZA.ISR)
 * Bu yüzden imzalama `buildStoryUsers`ın İÇİNDE değil, çağıranda ve kendi
 * ömrüyle yapılıyor.
 *
 * ⛔ `mediaPath` İSTEMCİYE GÖNDERİLMEZ — burada düşürülüyor. Yol sızarsa,
 *    imza kısa ömürlü olsa bile, dosyanın kovadaki adı dışarı çıkmış olur.
 */
export async function storyUserlariImzala<
  U extends { stories: Array<Record<string, any>> },
>(kullanicilar: U[], omur: number = IMZA.ISTEK): Promise<U[]> {
  if (!kullanicilar?.length) return kullanicilar ?? [];

  const yollar: string[] = [];
  for (const u of kullanicilar) {
    for (const s of u.stories ?? []) {
      if (typeof s?.mediaPath === 'string' && s.mediaPath) yollar.push(s.mediaPath);
    }
  }
  // Yol yoksa (hepsi eski public satır) imzalama turu ATLA — boşuna istek atma.
  const harita = yollar.length ? await imzaHaritasi(yollar, omur) : new Map<string, string>();

  return kullanicilar.map((u) => ({
    ...u,
    stories: (u.stories ?? []).map((s) => {
      const { mediaPath, ...kalan } = s;
      return { ...kalan, mediaUrl: adresSec(mediaPath, s.mediaUrl, harita) };
    }),
  }));
}

export async function hikayeleriImzala<T extends Record<string, any>>(
  satirlar: T[],
  omur: number = IMZA.ISTEK,
  yolAlan: string = 'media_path',
  urlAlan: string = 'media_url',
): Promise<T[]> {
  if (!satirlar?.length) return satirlar ?? [];
  const yollar = satirlar.map((s) => s?.[yolAlan]).filter((y): y is string => typeof y === 'string' && !!y);
  if (!yollar.length) return satirlar;

  const harita = await imzaHaritasi(yollar, omur);
  return satirlar.map((s) => ({ ...s, [urlAlan]: adresSec(s?.[yolAlan], s?.[urlAlan], harita) }));
}
