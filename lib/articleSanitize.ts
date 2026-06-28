// SUNUCU TARAFI — kullanici makale icerigini guvenli hale getirir.
// Bu dosya yalnizca API route'larinda / server component'lerde import edilir
// (sanitize-html Node'a baglidir). Iki katman:
//  1) sanitizeArticleHtml: prose (metin bloklari) -> siki izin listesiyle temiz HTML.
//  2) normalizeDoc/normalizeSources: blok dizisini + kaynakcayi dogrular/sinirlar.
import sanitizeHtml from 'sanitize-html';
import { type ArticleBlock, type ArticleSource, LIMITS, EMBED_LIBS, clampHeight } from './userArticles';

// Renk degerleri: hex / rgb / rgba / hsl / isimli renk. url()/expression() imkansiz.
const COLOR = [
  /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,
  /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/,
  /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(?:0|1|0?\.\d+)\s*\)$/,
  /^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/,
  /^[a-z]{3,20}$/i,
];

// Inline stilde izin verilen ozellikler + guvenli deger desenleri.
const STYLES: Record<string, RegExp[]> = {
  color: COLOR,
  'background-color': COLOR,
  // font-family: yalnizca harf/rakam/bosluk/virgul/tirnak/tire -> parantez (url) yok.
  'font-family': [/^[a-z0-9 ,"'\-]+$/i],
  'font-weight': [/^(bold|bolder|lighter|normal|[1-9]00)$/],
  'font-style': [/^(italic|oblique|normal)$/],
  'text-decoration': [/^(underline|overline|line-through|none)(\s+(underline|overline|line-through))*$/],
  'text-decoration-line': [/^(underline|overline|line-through|none)$/],
  'text-align': [/^(left|right|center|justify)$/],
};

/**
 * Prose HTML'ini siki bir izin listesine indirger. Script/style/iframe/event
 * handler/javascript: vb. TAMAMEN dusurulur. Linkler http(s)/mailto'ya kisitlanir
 * ve zorla rel="nofollow noopener noreferrer ugc" + target=_blank alir.
 * Yaz aninda VE render aninda cagrilir (cifte savunma).
 */
export function sanitizeArticleHtml(dirty: string): string {
  return sanitizeHtml(String(dirty ?? ''), {
    allowedTags: ['p', 'br', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 's', 'mark', 'span', 'blockquote', 'ul', 'ol', 'li', 'a', 'hr', 'code', 'pre', 'sub', 'sup'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      span: ['style'], mark: ['style'], p: ['style'], h2: ['style'], h3: ['style'], h4: ['style'], li: ['style'], blockquote: ['style'],
    },
    allowedStyles: { '*': STYLES },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { a: ['http', 'https', 'mailto'] },
    allowProtocolRelative: false,
    enforceHtmlBoundary: true,
    transformTags: {
      b: 'strong',
      i: 'em',
      strike: 's',
      div: 'p',
      // execCommand('fontName'/'foreColor') Chromium/WebKit'te <font face/color> uretir.
      // face/color -> inline style'a cevir; allowedStyles degerleri TEKRAR dogrular,
      // yoksa kullanicinin font/renk secimi sessizce kaybolurdu.
      font: (_tag, attribs) => {
        const decl: string[] = [];
        const face = (attribs.face || '').trim();
        if (face) decl.push(`font-family:${face}`);
        const color = (attribs.color || '').trim();
        if (color) decl.push(`color:${color}`);
        const style = (attribs.style || '').trim();
        if (style) decl.push(style);
        const empty: Record<string, string> = {};
        return { tagName: 'span', attribs: decl.length ? { style: decl.join(';') } : empty };
      },
      a: (_tag, attribs) => {
        const href = (attribs.href || '').trim();
        const ok = /^(https?:|mailto:)/i.test(href);
        const empty: Record<string, string> = {};
        return ok
          ? { tagName: 'a', attribs: { href, target: '_blank', rel: 'nofollow noopener noreferrer ugc' } }
          : { tagName: 'span', attribs: empty };
      },
    },
  });
}

export function clampText(v: unknown, max: number): string {
  return String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function hasVisibleContent(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').trim().length > 0 || /<(hr|img)\b/i.test(html);
}

const MEDIA_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/storage/v1/object/public/media/`;
export function isAllowedMediaUrl(u: unknown): u is string {
  return typeof u === 'string' && MEDIA_PREFIX.length > 40 && u.startsWith(MEDIA_PREFIX) && u.length < 600;
}

/**
 * Blok dizisini dogrular ve guvenli/sinirli hale getirir.
 * @param mediaUrl Yuklenen storage path'ini (kullaniciya ait) public URL'e cevirir;
 *                 sahibi degilse null doner (gorsel atilir).
 */
export function normalizeDoc(raw: unknown, mediaUrl: (path: string) => string | null): ArticleBlock[] {
  if (!Array.isArray(raw)) return [];
  const out: ArticleBlock[] = [];
  let embeds = 0;

  for (const b of raw as any[]) {
    if (out.length >= LIMITS.blocks) break;
    if (!b || typeof b !== 'object') continue;

    if (b.type === 'text') {
      const html = sanitizeArticleHtml(String(b.html ?? '')).slice(0, LIMITS.textHtml);
      if (hasVisibleContent(html)) out.push({ type: 'text', html });
    } else if (b.type === 'image') {
      let url = '';
      if (typeof b.path === 'string' && b.path) url = mediaUrl(b.path) ?? '';
      else if (isAllowedMediaUrl(b.url)) url = b.url;
      if (url) out.push({ type: 'image', url, alt: clampText(b.alt, 200), caption: clampText(b.caption, 300) });
    } else if (b.type === 'embed') {
      if (embeds >= LIMITS.embeds) continue;
      const html = String(b.html ?? '').slice(0, LIMITS.embedHtml);
      const css = String(b.css ?? '').slice(0, LIMITS.embedCss);
      const js = String(b.js ?? '').slice(0, LIMITS.embedJs);
      if (!html.trim() && !js.trim()) continue;
      embeds++;
      out.push({
        type: 'embed',
        html, css, js,
        libs: Array.isArray(b.libs)
          ? b.libs.filter((x: unknown) => typeof x === 'string' && Object.prototype.hasOwnProperty.call(EMBED_LIBS, x)).slice(0, 6)
          : [],
        height: clampHeight(b.height),
        caption: clampText(b.caption, 300),
      });
    }
  }
  return out;
}

export function normalizeSources(raw: unknown): ArticleSource[] {
  if (!Array.isArray(raw)) return [];
  const out: ArticleSource[] = [];
  for (const s of raw as any[]) {
    if (out.length >= LIMITS.sources) break;
    if (!s || typeof s !== 'object') continue;
    const title = clampText(s.title, 300);
    const url = typeof s.url === 'string' && /^https?:\/\//i.test(s.url) ? s.url.slice(0, 500) : undefined;
    if (!title && !url) continue;
    out.push({
      title: title || (url as string),
      authors: clampText(s.authors, 200) || undefined,
      year: clampText(s.year, 20) || undefined,
      source: clampText(s.source, 200) || undefined,
      url,
    });
  }
  return out;
}
