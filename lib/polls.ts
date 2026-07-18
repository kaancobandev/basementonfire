// Makale içi oylamaların TEK kaynağı (registry).
// API route hem poll_key'i hem seçeneği buradan doğrular → istemciden gelen
// serbest metin asla DB'ye girmez, dağılım her zaman bilinen seçenekler üzerinden
// hesaplanır. Yeni bir karar noktası eklemek = buraya bir satır.
export const POLLS: Record<string, readonly string[]> = {
  'sezar-rubicon': ['dagit', 'gec'], // Orduyu dağıt / Rubicon'u geç
  'augustus-restore': ['kabul', 'yalvar'], // Cumhuriyet dönsün (kabul et) / Geri vermesi için yalvar
  'fatih-son-karar': ['bekle', 'harac', 'savun'], // XI. Konstantin: Batı'dan yardım bekle / Haraç öner / Sur başında savun
  'fatih-zehir': ['zehir', 'hastalik'], // Hünkâr Çayırı: zehirlendi / hastalıktan öldü
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

/** Seçenek dizisini normalize eder (kırp, boşları at, tavan uygula). */
export function normalizePollOptions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const opts = raw
    .map((o) => String(o ?? '').trim().slice(0, POLL_OPTION_MAXLEN))
    .filter((o) => o.length > 0)
    .slice(0, MAX_POLL_OPTIONS);
  return opts.length >= MIN_POLL_OPTIONS ? opts : [];
}
