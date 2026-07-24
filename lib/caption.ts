// \p{L} (her dildeki harf) + \p{N} (rakam) + _ → Türkçe inceltme harfleri (â,î,û)
// dâhil tüm harfleri kapsar; eski açık liste bunları düşürüp etiketi bozuyordu.
const HASHTAG_RE = /#([\p{L}\p{N}_]+)/gu;
const MENTION_RE = /@([a-zA-Z0-9_.]+)/g;

/**
 * Etiketin KANONİK biçimi. Etiketi YAZAN (parseHashtags → hashtags tablosu),
 * LİNKLEYEN (renderCaption) ve OKUYAN (/hashtag/[tag]) tek bu fonksiyonu
 * kullanır; üçü ayrışırsa etiket sayfası sessizce 404 verir.
 *
 * toLowerCase() (invariant) BİLEREK, toLocaleLowerCase('tr') DEĞİL: Türkçe kuralı
 * 'I'→'ı' ve 'İ'→'i' yapar, invariant ise 'I'→'i' ve 'İ'→'i̇' (birleşik nokta).
 * Hangisinin "doğru" olduğundan bağımsız olarak yazan ile okuyanın AYNI olması
 * şart — mevcut tüm kayıtlar invariant ile yazıldığından o korunuyor.
 *
 * NFC: aynı harfin iki farklı kodlanışı olabilir (ü = U+00FC ya da u + U+0308);
 * bazı klavyeler/işletim sistemleri ikincisini üretir ve eşitlik testi patlar.
 */
export function canonicalTag(raw: string): string {
  return raw.normalize('NFC').toLowerCase();
}

/**
 * URL parametresinden gelen etiketi kanonik biçime çevirir.
 *
 * ⚠ Next bu rotada parametreyi ÇÖZMEDEN veriyor — 2026-07-24'te ölçüldü:
 * /hashtag/k%C3%BClt%C3%BCr isteğinde `params.tag === "k%C3%BClt%C3%BCr"`.
 *
 * İKİ ADIMIN SIRASI KRİTİK: önce decode, SONRA küçült. Ters sırada toLowerCase()
 * onaltılık kodu da küçültür (%C3%BC → %c3%bc), sorgu hiçbir kayda uymaz ve
 * TÜRKÇE KARAKTERLİ HER ETİKET 404 döner (ASCII etiketlerde percent dizisi
 * olmadığı için sorun görünmezdi — hata bu yüzden aylarca fark edilmedi).
 */
export function tagFromParam(raw: string): string {
  let t = raw;
  if (t.includes('%')) {
    try { t = decodeURIComponent(t); } catch { /* bozuk dizi → ham hâliyle dene */ }
  }
  return canonicalTag(t);
}

export function parseHashtags(text: string): string[] {
  const tags = new Set<string>();
  for (const m of text.matchAll(HASHTAG_RE)) tags.add(canonicalTag(m[1]));
  return [...tags];
}

export function parseMentions(text: string): string[] {
  const handles = new Set<string>();
  for (const m of text.matchAll(MENTION_RE)) handles.add(m[1].toLowerCase());
  return [...handles];
}

export function renderCaption(text: string): string {
  const esc = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return esc
    // href kanonik biçimde (saklanan tag ile AYNI); görünen metin orijinal kalır.
    // encodeURIComponent GEREKMEZ: tarayıcı gezinirken kendisi kodlar ve rota
    // tagFromParam ile çözer — ama iki taraf da canonicalTag'ten geçmeli.
    .replace(/#([\p{L}\p{N}_]+)/gu, (_m, t) => `<a href="/hashtag/${canonicalTag(t)}" class="cap-tag">#${t}</a>`)
    .replace(/@([a-zA-Z0-9_.]+)/g, '<a href="/u/$1" class="cap-mention">@$1</a>');
}
