// \p{L} (her dildeki harf) + \p{N} (rakam) + _ → Türkçe inceltme harfleri (â,î,û)
// dâhil tüm harfleri kapsar; eski açık liste bunları düşürüp etiketi bozuyordu.
const HASHTAG_RE = /#([\p{L}\p{N}_]+)/gu;
const MENTION_RE = /@([a-zA-Z0-9_.]+)/g;

export function parseHashtags(text: string): string[] {
  const tags = new Set<string>();
  for (const m of text.matchAll(HASHTAG_RE)) tags.add(m[1].toLowerCase());
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
    // href küçük harf (saklanan tag ile aynı → kanonik); görünen metin orijinal kalır
    .replace(/#([\p{L}\p{N}_]+)/gu, (_m, t) => `<a href="/hashtag/${t.toLowerCase()}" class="cap-tag">#${t}</a>`)
    .replace(/@([a-zA-Z0-9_.]+)/g, '<a href="/u/$1" class="cap-mention">@$1</a>');
}
