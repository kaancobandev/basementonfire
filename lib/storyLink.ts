/**
 * Hikaye bağlantı sticker'ının TEK doğrulama kaynağı — hem istemci (anında geri
 * bildirim) hem sunucu (gerçek kapı) burayı kullanır.
 *
 * KURAL: yalnızca SİTE İÇİ yol. Dışarıya çıkan hiçbir adres kabul edilmez, çünkü
 * hikayeye serbest URL koyabilmek siteyi açık yönlendirme (open redirect) aracına
 * çevirir: saldırgan bir hikaye açar, oltalama sayfasına yollar ve bağlantı
 * basementonfire.com'dan çıkmış gibi görünür.
 *
 * Reddedilenler ve NEDENİ:
 *   'https://x.com'  → mutlak adres, doğrudan dışarı
 *   '//x.com'        → protokol-göreli; tarayıcı bunu https://x.com yapar
 *   '/\x.com'        → bazı tarayıcılar ters bölüyü '/' gibi okur → yine dışarı
 *   'articles/rome'  → göreli; hangi sayfadan açıldığına göre farklı yere gider
 */
export const STORY_LINK_MAX = 300;
export const STORY_LABEL_MAX = 40;

export function normalizeStoryLink(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s || s.length > STORY_LINK_MAX) return null;
  if (!s.startsWith('/')) return null;             // mutlak/göreli adresler elenir
  if (s[1] === '/' || s[1] === '\\') return null;  // //host ve /\host elenir
  // Kontrol karakteri veya boşluk içeren yol kabul edilmez (satır sonu ile
  // yapılan başlık/adres kaçırma denemelerini de kapatır).
  if (s.split("").some(ch => ch.charCodeAt(0) <= 32 || ch.charCodeAt(0) === 127)) return null;
  return s;
}

export function normalizeStoryLabel(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim().replace(/\s+/g, ' ');
  if (!s) return null;
  return s.slice(0, STORY_LABEL_MAX);
}
