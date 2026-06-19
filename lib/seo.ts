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
