import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArticleIndex from '@/app/components/ArticleIndex';
import { jsonLdScript } from '@/lib/seo';
import {
  articlesByCategory, kategoriFromSlug, kategoriSayfalari,
  CATEGORY_SLUG, KATEGORI_MIN_MAKALE, type ArticleCategory,
} from '@/lib/articles';

// ════════════════════════════════════════════════════════════════════════
// KATEGORİ SAYFALARI — /discover/tarih, /discover/fizik ...
//
// NİYE VAR: /discover'daki kategori çipleri istemci state'iydi; "fizik
// makaleleri" gibi konu-üstü aramaların ineceği HİÇBİR URL yoktu. Makale
// sayfaları kendi konularında sıralanıyor ama kategori düzeyi boştaydı.
// İkinci fayda reklam tarafında: Google Ads'in Fizik ve Biyoloji-Kimya
// grupları genel /discover'a iniyordu — açılış sayfası alaka düzeyi kalite
// puanına giriyor, yani genel sayfaya indirmek tıklama başına daha pahalı.
//
// TAMAMEN STATİK: yalnız lib/articles.ts okur, DB'ye gitmez → build'de üretilir.
// `dynamicParams = false`: listede olmayan slug GERÇEK 404 döner (soft-404 değil).
//
// ⚠ EŞİK: 3 makalenin altındaki kategorinin sayfası YOKTUR (KATEGORI_MIN_MAKALE).
// Bugün Kimya(1), Ekonomi(1) ve Sanat(2) dışarıda; eşiği geçince sayfaları
// kendiliğinden açılır ve sitemap'e girer. Gerekçe: tek makalelik liste sayfası
// tam olarak etiket sayfalarında ölçtüğümüz ince-içerik sorunudur.
// ════════════════════════════════════════════════════════════════════════
export const dynamic = 'force-static';
export const dynamicParams = false;

type Props = { params: Promise<{ kategori: string }> };

/** Sayfa metinleri. Makale SAYISI buraya YAZILMAZ — aşağıda türetilir. */
const METIN: Partial<Record<ArticleCategory, { lede: string; giris: string }>> = {
  Tarih: {
    lede: 'Antik Roma’dan Osmanlı’ya: kuşatmayı sen yönet, kaynaklar çeliştiğinde iki sürümü yan yana gör.',
    giris: 'Sıfat değil sayı yazıyoruz: kaç kişi, kaç gün, kaç top. Kaynaklar birbirini tutmadığında hangisinin doğru olduğunu size söylemek yerine ikisini yan yana koyup kararı size bırakıyoruz. Sezar, Augustus, Fatih ve Kanuni birbirine bağlı bir seri oluşturuyor.',
  },
  Fizik: {
    lede: 'Kuvvetten kuantuma: her yasanın altında tarayıcıda çalıştırabileceğin bir deney var.',
    giris: 'Formülü ezberlemek yerine değişkeni kendiniz değiştiriyorsunuz: kuvvet laboratuvarı, çift yarık simülatörü, yarılanma süresi sayacı. Fiziğe sıfırdan başlamak isteyen için ayrı bir giriş makalesi var.',
  },
  Astronomi: {
    lede: 'Kara delikler, solucan delikleri ve Dünya’nın doğum hikâyesi.',
    giris: 'Göreliliğin sonuçlarını benzetmeye boğmadan anlatıyoruz. Gezegenimizin güneş bulutsusundan demir çekirdeğe uzanan oluşumu, interaktif bir iç yapı modeliyle.',
  },
  Biyoloji: {
    lede: 'Evrim, hücre ve sinir sistemi — kamuflaj simülasyonundan ayna nöronlarına.',
    giris: 'Doğal seçilimi okumak yerine deniyorsunuz. Karmaşık yaşamın iki hücrenin birleşmesiyle başladığı an ve bilimin hâlâ tartıştığı konular, tartışmanın kendisi gizlenmeden.',
  },
  Tıp: {
    lede: 'Beden, mikroplar ve tıp tarihi: doğrulanmış olgular, abartısız.',
    giris: 'Bağırsak-beyin ekseninden antibiyotik direncine karşı faj terapisine. Her iddianın kaynağı yazının sonunda; “şaşırtıcı” denilen her olgu doğrulanabilir bir kayda dayanıyor.',
  },
  Teknoloji: {
    lede: 'İnternet, bilgisayar ve oyun salonları — paketten transistöre.',
    giris: 'Kullandığınız cihazın içinde ne olduğunu parça parça açıyoruz: CPU’dan SSD’ye, DNS’ten TCP/IP’ye. İkili sayı çevirici ve komut döngüsü gibi araçlarla.',
  },
};

export function generateStaticParams() {
  return kategoriSayfalari().map((x) => ({ kategori: x.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kategori: slug } = await params;
  const cat = kategoriFromSlug(slug);
  // ⚠ generateMetadata içinde notFound() ÇALIŞMAZ (daha önce soft-404'e yol
  // açtı). Burada yalnız güvenli bir metadata dönüyoruz; 404'ü rota veriyor.
  if (!cat) return { title: 'Bulunamadı', robots: { index: false } };

  const adet = articlesByCategory(cat).length;
  const m = METIN[cat];
  const title = `${cat} Makaleleri`;
  const description = `${adet} interaktif Türkçe ${cat.toLocaleLowerCase('tr-TR')} makalesi. ${m?.lede ?? ''} Ücretsiz, üyeliksiz, her yazıda kaynakça.`.trim();

  return {
    title,
    description,
    alternates: { canonical: `/discover/${slug}` },
    openGraph: { title, description, url: `/discover/${slug}`, type: 'website' },
  };
}

export default async function KategoriPage({ params }: Props) {
  const { kategori: slug } = await params;
  const cat = kategoriFromSlug(slug);
  if (!cat) notFound();

  const list = articlesByCategory(cat);
  const m = METIN[cat];
  const digerleri = kategoriSayfalari().filter((x) => x.cat !== cat);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `https://basementonfire.com/discover/${slug}`,
        url: `https://basementonfire.com/discover/${slug}`,
        name: `${cat} Makaleleri`,
        description: m?.lede,
        inLanguage: 'tr-TR',
        isPartOf: { '@type': 'WebSite', name: 'Basementonfire', url: 'https://basementonfire.com' },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: list.length,
          itemListElement: list.map((a, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `https://basementonfire.com/articles/${a.slug}`,
            name: a.title,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Keşfet', item: 'https://basementonfire.com/discover' },
          { '@type': 'ListItem', position: 2, name: `${cat} Makaleleri`, item: `https://basementonfire.com/discover/${slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />

      <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '22px 18px 72px', color: 'var(--color-text)' }}>
          <nav aria-label="Konum" style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
            <Link href="/discover" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Keşfet</Link>
            {' · '}{cat}
          </nav>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            {cat} Makaleleri
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', margin: '0 0 14px', lineHeight: 1.6 }}>
            {m?.lede}
          </p>
          {m?.giris && (
            <p style={{ fontSize: '0.95rem', lineHeight: 1.75, margin: '0 0 26px', color: 'var(--color-text)' }}>
              {m.giris}
            </p>
          )}

          <ArticleIndex articles={list} tekKategori />

          {/* Diğer kategoriler — sayfalar birbirine bağlansın (tarama + gezinme).
              Eşiğin altındakiler burada YOK; onların URL'i de yok. */}
          <section style={{ marginTop: 34, paddingTop: 20, borderTop: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: '0 0 12px' }}>
              Diğer konular
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {digerleri.map((x) => (
                <Link
                  key={x.slug}
                  href={`/discover/${x.slug}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px',
                    borderRadius: 9999, border: '1px solid var(--color-border)', fontSize: '0.86rem',
                    fontWeight: 700, textDecoration: 'none', color: 'var(--color-text)',
                    background: 'var(--color-surface)',
                  }}
                >
                  {x.cat}
                  <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{x.adet}</span>
                </Link>
              ))}
              <Link
                href="/discover"
                style={{
                  display: 'inline-flex', alignItems: 'center', padding: '7px 13px', borderRadius: 9999,
                  border: '1px dashed var(--color-primary)', fontSize: '0.86rem', fontWeight: 700,
                  textDecoration: 'none', color: 'var(--color-primary)',
                }}
              >
                Tüm makaleler →
              </Link>
            </div>
            {/* Eşik notu okura değil, ileride koda bakacak olana: eksik kategori
                arayanlar için CATEGORY_SLUG ve KATEGORI_MIN_MAKALE'ye bak. */}
            <span hidden data-esik={KATEGORI_MIN_MAKALE} data-slug={CATEGORY_SLUG[cat]} />
          </section>
        </div>
      </main>
    </>
  );
}
