// Paylaşılan SEO yapılandırılmış-veri (JSON-LD) yardımcıları.
const SITE = 'https://basementonfire.com';

/**
 * JSON-LD'yi bir <script> bloğuna GÜVENLE gömmek için serialize eder.
 *
 * JSON.stringify `"` kaçırır ama `<` ve `/` kaçırmaz; bu yüzden kullanıcı
 * verisindeki (display_name, bio, caption…) `</script>` dizisi inline script
 * bloğunu erken kapatıp ardından gelen kodu çalıştırabilir (saklı XSS).
 * `<`, `>` ve `&` karakterlerini unicode kaçışına çevirmek `</script>` ve
 * `<!--` kaçışlarını imkânsız kılar; çıktı her JSON ayrıştırıcısı (Google
 * dâhil) için geçerli kalır.
 */
export function jsonLdScript(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

/**
 * Makale (Article) JSON-LD'yi tek yerden, tutarlı ve zengin üretir:
 *  - publisher.logo (ImageObject) → Article zengin sonuç uygunluğu
 *  - about.sameAs (Wikidata/Vikipedi) → AI motorları için varlık (entity) sabitleme
 *  - citation[] → Kaynakça'yı yapılandırılmış veriye yansıtır (kaynak yoğunluğu sinyali)
 *  - image → makaleye özel OG görseli (/articles/<slug>/opengraph-image)
 */
export function articleJsonLd(o: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  about?: { type?: string; name: string; sameAs?: string[] };
  citation?: { title: string; url?: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: o.title,
    description: o.description,
    inLanguage: 'tr-TR',
    datePublished: o.datePublished,
    dateModified: o.dateModified ?? o.datePublished,
    url: `${SITE}${o.path}`,
    image: `${SITE}${o.path}/opengraph-image`,
    author: { '@type': 'Organization', name: 'Basements', url: SITE },
    publisher: { '@type': 'Organization', name: 'Basements', logo: { '@type': 'ImageObject', url: `${SITE}/icon.svg` } },
    ...(o.about ? { about: { '@type': o.about.type ?? 'Thing', name: o.about.name, ...(o.about.sameAs ? { sameAs: o.about.sameAs } : {}) } } : {}),
    ...(o.citation && o.citation.length ? { citation: o.citation.map((c) => ({ '@type': 'CreativeWork', name: c.title, ...(c.url ? { url: c.url } : {}) })) } : {}),
  };
}

export type Crumb = { name: string; path?: string };

/**
 * BreadcrumbList JSON-LD üretir (Google'da arama sonucunda kırıntı navigasyonu gösterir).
 * Her öğe sırayla position alır. Son öğe (mevcut sayfa) için `path` verilmezse
 * `item` alanı atlanır — Google'ın önerdiği desen.
 */
export function breadcrumbJsonLd(items: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.path ? { item: `${SITE}${it.path}` } : {}),
    })),
  };
}
