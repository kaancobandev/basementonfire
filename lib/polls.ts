// Makale içi oylamaların TEK kaynağı (registry).
// API route hem poll_key'i hem seçeneği buradan doğrular → istemciden gelen
// serbest metin asla DB'ye girmez, dağılım her zaman bilinen seçenekler üzerinden
// hesaplanır. Yeni bir karar noktası eklemek = buraya bir satır.
export const POLLS: Record<string, readonly string[]> = {
  'sezar-rubicon': ['dagit', 'gec'], // Orduyu dağıt / Rubicon'u geç
};

export const isPollKey = (key: string): boolean =>
  Object.prototype.hasOwnProperty.call(POLLS, key);

export const isPollChoice = (key: string, choice: string): boolean =>
  isPollKey(key) && POLLS[key].includes(choice);
