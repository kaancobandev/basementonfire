// Makale içi oylamaların TEK kaynağı (registry).
// API route hem poll_key'i hem seçeneği buradan doğrular → istemciden gelen
// serbest metin asla DB'ye girmez, dağılım her zaman bilinen seçenekler üzerinden
// hesaplanır. Yeni bir karar noktası eklemek = buraya bir satır.
export const POLLS: Record<string, readonly string[]> = {
  'sezar-rubicon': ['dagit', 'gec'], // Orduyu dağıt / Rubicon'u geç
  'augustus-restore': ['kabul', 'yalvar'], // Cumhuriyet dönsün (kabul et) / Geri vermesi için yalvar
  'fatih-son-karar': ['bekle', 'harac', 'savun'], // XI. Konstantin: Batı'dan yardım bekle / Haraç öner / Sur başında savun
  'fatih-zehir': ['zehir', 'hastalik'], // Hünkâr Çayırı: zehirlendi / hastalıktan öldü
  'kanuni-cadir': ['gir', 'donme', 'adam'], // Şehzade Mustafa: otağa gir / girme, dön / adamlarınla gir
  'kanuni-kardes-katli': ['fatih', 'sonradan'], // Kardeş katli maddesi: Fatih yazdı / sonradan eklendi
  // Atilla — seçenek id'leri app/articles/atilla/data.ts ile BİREBİR aynı olmalı
  // (HONORIA.karar.secenekler, ITALYA_ANKET.secenekler, OLUM.secenekler).
  'atilla-honoria': ['ver', 'oldur', 'inkar', 'oyala'], // Valentinianus: çeyizi ver / Honoria'yı öldürt / nişanı inkâr et / elçiyle oyala
  'atilla-italya': ['papa', 'salgin', 'marcianus', 'hepsi'], // 452 dönüşü: Papa Leo / kıtlık-salgın / Marcianus'un saldırısı / üçü birden
  'atilla-otag': ['dogal', 'ildico', 'komplo', 'ic'], // 453: kendi öldü / Ildico / Doğu Roma tertibi / iç muhalefet
};

export const isPollKey = (key: string): boolean =>
  Object.prototype.hasOwnProperty.call(POLLS, key);

export const isPollChoice = (key: string, choice: string): boolean =>
  isPollKey(key) && POLLS[key].includes(choice);

// ── Kullanıcı anketleri (2026-07-19) ─────────────────────────────────────
// Feed'deki gönderi anketleri AYNI oy tablosunu (article_poll_votes) kullanır:
// poll_key = 'post-<id>'. Seçenek metinleri post_polls tablosunda; oy olarak
// metin DEĞİL, İNDEKS ('0'..'3') saklanır → seçenek metni değişse bile oylar
// tutarlı kalır ve serbest metin asla DB'ye girmez.
export const POST_POLL_PREFIX = 'post-';
export const MAX_POLL_OPTIONS = 4;
export const MIN_POLL_OPTIONS = 2;
export const POLL_OPTION_MAXLEN = 60;

/** 'post-123' → 123; değilse null. */
export function postIdFromPollKey(key: string): number | null {
  if (!key.startsWith(POST_POLL_PREFIX)) return null;
  const n = Number(key.slice(POST_POLL_PREFIX.length));
  return Number.isInteger(n) && n > 0 ? n : null;
}

// ── Hikaye anketleri (2026-07-21) ────────────────────────────────────────
// Gönderi anketleriyle AYNI mantık: poll_key = 'story-<id>', seçenek metinleri
// stories.poll_options'ta, oy olarak indeks saklanır. Route pollChoices bunu çözer.
export const STORY_POLL_PREFIX = 'story-';

/** 'story-123' → 123; değilse null. */
export function storyIdFromPollKey(key: string): number | null {
  if (!key.startsWith(STORY_POLL_PREFIX)) return null;
  const n = Number(key.slice(STORY_POLL_PREFIX.length));
  return Number.isInteger(n) && n > 0 ? n : null;
}

// ── Makale sonu quiz'i (2026-07-29) ──────────────────────────────────────
// AYNI oy tablosunu (article_poll_votes) kullanır: poll_key = 'quiz-<slug>-<n>',
// n = makaledeki sorunun sırası. Oy olarak şıkkın İNDEKSİ ('0'..'5') saklanır.
//
// NEDEN BURAYA BAĞLANDI, yeni tablo açılmadı:
// Sorular makalelerin KENDİ dosyalarında (quizQs) duruyor, veritabanında değil.
// Bu yüzden sunucu "bu sorunun kaç şıkkı var?" sorusunu cevaplayamaz. Serbest
// metnin DB'ye girmemesi için doğrulama sayı TAVANIYLA yapılır: soru sırası
// 0-19, şık 0-5. İstemci gerçek şık sayısını zaten bilir ve yalnız onları
// gönderir; tavanı aşan her şey rota tarafından reddedilir.
//
// Giriş GEREKTİRMEZ (article_poll_votes'un mevcut davranışı). Sebep ölçülmüştür:
// site trafiğinin ezici çoğunluğu anonim, giriş kapısı koymak veriyi ~0 bırakır.
export const ARTICLE_QUIZ_PREFIX = 'quiz-';
export const QUIZ_MAX_OPTIONS = 6;
export const QUIZ_MAX_QUESTIONS = 20;

/** Sayım için sabit şık kümesi ('0'..'5'). Soruda daha az şık varsa fazlası 0 döner. */
export const QUIZ_CHOICES: readonly string[] =
  Array.from({ length: QUIZ_MAX_OPTIONS }, (_, i) => String(i));

/**
 * 'quiz-cift-yarik-2' → { slug: 'cift-yarik', index: 2 }; değilse null.
 *
 * ⚠ lastIndexOf ŞART: slug'ların çoğunda tire var (cift-yarik, black-hole,
 * einstein-rosen, ayna-noronlari). İlk tireden bölersek slug kırpılır ve
 * her tireli makalenin quiz'i sessizce kaydedilmez.
 */
export function articleQuizFromPollKey(key: string): { slug: string; index: number } | null {
  if (!key.startsWith(ARTICLE_QUIZ_PREFIX)) return null;
  const rest = key.slice(ARTICLE_QUIZ_PREFIX.length);
  const dash = rest.lastIndexOf('-');
  if (dash <= 0) return null;
  const slug = rest.slice(0, dash);
  const index = Number(rest.slice(dash + 1));
  if (!slug || !Number.isInteger(index) || index < 0 || index >= QUIZ_MAX_QUESTIONS) return null;
  return { slug, index };
}

/** İstemcinin kullanacağı anahtar üreteci — iki taraf tek fonksiyondan okusun. */
export const articleQuizPollKey = (slug: string, index: number): string =>
  `${ARTICLE_QUIZ_PREFIX}${slug}-${index}`;

/** Seçenek dizisini normalize eder (kırp, boşları at, tavan uygula). */
export function normalizePollOptions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const opts = raw
    .map((o) => String(o ?? '').trim().slice(0, POLL_OPTION_MAXLEN))
    .filter((o) => o.length > 0)
    .slice(0, MAX_POLL_OPTIONS);
  return opts.length >= MIN_POLL_OPTIONS ? opts : [];
}
