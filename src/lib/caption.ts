// Browser-safe caption utilities — no Node.js dependencies

const HASHTAG_RE = /#([\wğüşöçıİĞÜŞÖÇ]+)/gu;
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
    .replace(/#([\wğüşöçıİĞÜŞÖÇ]+)/gu,
      '<a href="/hashtag/$1" class="cap-tag">#$1</a>')
    .replace(/@([a-zA-Z0-9_.]+)/g,
      '<a href="/u/$1" class="cap-mention">@$1</a>');
}
