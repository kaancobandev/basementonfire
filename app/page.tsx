import type { Metadata } from 'next';
import { audiencePredicate } from '@/lib/storyAudience';
import { getHomeContent, getDidYouKnow, buildFeedItems, buildStoryUsers } from '@/lib/feedData';
import { jsonLdScript } from '@/lib/seo';
import { ARTICLE_COUNT } from '@/lib/landing';
import { SOSYAL_URLLER } from '@/lib/social';
import HomeFeed from './components/HomeFeed';

// ════════════════════════════════════════════════════════════════════════
// ANA SAYFA — TEK ana sayfa. Girişli/çıkışlı HERKES burayı görür.
//
// 2026-08-14: `/feed` KALDIRILDI ve gövdesi buraya taşındı. Öncesinde iki
// ana sayfa vardı: `/` statik landing (çıkışlı + Googlebot), `/feed` akış
// (girişli), arada middleware'de bir 307. Sebep: ziyaretçi pazarlama
// sayfası yerine doğrudan içeriğe düşsün + tek kanonik ana sayfa olsun.
//
// ⚠ MİDDLEWARE'DEKİ `/` → `/feed` YÖNLENDİRMESİ SİLİNDİ. Yerine `/feed` → `/`
// (301) kondu. İKİSİ AYNI ANDA DURURSA SONSUZ DÖNGÜ olur ve site hiç açılmaz.
//
// LANDING SİLİNMEDİ: app/components/landing/LandingPage.tsx'te duruyor.
// Geri dönmek için bu dosyanın gövdesini `return <LandingPage />;` yap.
//
// ⚠ BU SAYFAYA KİŞİSEL VERİ EKLEME. Çıktı ISR ile HERKESE aynı servis edilir;
// buraya sızan tek bir kişisel alan tüm ziyaretçilere gider. Kişisel her şeyin
// yeri /api/feed/personal (istemci) — HomeFeed'e boş prop'la giriyoruz.
// ════════════════════════════════════════════════════════════════════════
// ⚠ REVALIDATE = DURABLE CACHE TTL'i (yalnız "içerik ne sıklıkla tazelensin"
// değil). Girdi bayatlayınca Netlify yeniden üretimi BEKLETİR; /discover'da bu
// yüzden 7,6 sn ölçülmüştü. İçerik bayatlamaz: gönderi/hikâye/bilgi kartı üreten
// HER rota revalidateTag('feed') çağırıyor → cache anında düşer. Bu sayı yalnız
// TAG'SİZ değişenler için tavan (beğeni/yorum SAYILARI).
//
// ⚠⚠ lib/feedData.ts içindeki unstable_cache'ler DE 3600 olmalı: Next efektif
// revalidate'i "sayfanınki + render'da okunan tüm cache'lerin" MİNİMUMU alır.
// Kontrol: `next build` route tablosunda `/` yanında `1h` yazmalı.
export const revalidate = 3600;

const title = 'Basementonfire — bilim, tarih ve kültür';
const description = `Türkçe interaktif bilim, tarih ve kültür. ${ARTICLE_COUNT} uzun makale, günün sorusu, bilgi kartları ve topluluk akışı. Okumak için üye olmana gerek yok.`;

// robots BİLEREK YAZILMADI → varsayılan indexlenebilir. Eski `/feed`
// `robots:{index:false}` taşıyordu; o ayar BURAYA TAŞINMAZ, yoksa sitenin kök
// URL'i kendini indeksten siler (alan adı marka aramasında kaybolur).
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  // hreflang KARŞILIKLI olmak zorunda: /en de buraya geri işaret eder
  // (app/en/page.tsx). Tek taraflı bildirimi Google yok sayar.
  // x-default Türkçe → varsayılan kitle bu.
  alternates: {
    canonical: '/',
    languages: { 'tr-TR': '/', 'en-US': '/en', 'x-default': '/' },
  },
  openGraph: { title, description, url: '/' },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Basementonfire',
  url: 'https://basementonfire.com',
  inLanguage: 'tr-TR',
  description: 'Bilim, tarih ve kültürü interaktif makaleler ve toplulukla keşfet.',
  // Sitelinks arama kutusu: Google sonuçlarında doğrudan site içi arama sunabilir.
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://basementonfire.com/discover?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

// BAĞIMSIZ Organization işaretlemesi — MARKA LOGOSUNUN tek yetkili yüzeyi.
// Google'ın "logo" dokümanı yalnız bunu belgeler (bkz. lib/seo.ts satır 57):
// Article publisher.logo veya favicon DEĞİL, ana sayfadaki bu düğüm. Aramada
// eski logo görünüyorsa sebep buranın eksikliği + Google'ın favicon önbelleği.
// logo mutlak URL + 112x112 minimumu (512 fazlasıyla geçer); dosya /icons/'ta,
// robots.txt onu engellemiyor → taranabilir. Eski logo dönerse önce bu URL'in
// 200 döndüğünü ve yeni logoyu gösterdiğini doğrula (icon.svg bir kez sessizce
// 404 olmuştu). url alanı WebSite ile aynı → Google iki düğümü aynı markada eşler.
// sameAs: "bu profiller de aynı marka". Tek kaynak lib/social.ts.
//
// ⚠ BU İKİSİ SAYFA AKIŞA DÖNÜŞÜNCE DE BURADA KALDI: ikisi de görünmez
// (ekranda yer kaplamaz) ve Google marka işaretlemesini KÖK URL'de bekler.
// Makale listesi (ItemList) ise app/discover'a TAŞINDI — 36 linkin gerçekten
// bulunduğu yer orası; ana sayfaya link duvarı koymamak bilinçli bir karar.
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Basementonfire',
  url: 'https://basementonfire.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://basementonfire.com/icons/icon-512.png',
    width: 512,
    height: 512,
  },
  sameAs: SOSYAL_URLLER,
};

// Görsel olarak gizli ama DOM'da gerçek h1. Akış kabuğunun hiç başlığı yoktu
// (canlıda ölçüldü: 0 adet h1) — kök URL'in başlıksız kalmaması için.
// display:none DEĞİL: o, ekran okuyucudan da gizler ve Google'ın yok saydığı
// bir desendir. Aşağıdaki kırpma deseni ikisinde de görünür kalır.
const gizliBaslik: React.CSSProperties = {
  position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
  overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
};

export default async function HomePage() {
  const [{ rawFacts, rawPosts, storiesRaw }, dyks] = await Promise.all([
    getHomeContent(),
    getDidYouKnow(),
  ]);

  const { feedItems } = buildFeedItems(rawFacts ?? [], rawPosts ?? [], dyks);

  // HİKÂYE ŞERİDİ — kabukta yalnız ANONİM görünürlüğü.
  // audiencePredicate(null) saf/senkron bir yordam (DB turu yok): açık hesapların
  // yalnız 'public' hikâyelerini geçirir. Girişli kullanıcının şeridi (takipçi/
  // yakın-arkadaş hikâyeleri + "gördüm" halkaları + kendi hikâyen) istemcide
  // /api/feed/personal ile bunun YERİNE geçer.
  const canSeeAnon = await audiencePredicate(null);
  const publicStoryUsers = [...buildStoryUsers(storiesRaw ?? [], canSeeAnon).values()];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd) }} />

      {/* Feed'deki GIF'ler Giphy CDN'inden gelir — DNS+TLS'i önden aç.
          React bu link'i head'e taşır; yalnız bu sayfada emit edilir. */}
      <link rel="dns-prefetch" href="https://media3.giphy.com" />
      <link rel="preconnect" href="https://media3.giphy.com" crossOrigin="anonymous" />

      <h1 style={gizliBaslik}>Basementonfire — bilim, tarih ve kültür</h1>

      <HomeFeed
        feedItems={feedItems as any}
        // Kişiye özel alanların HEPSİ boş başlar; HomeFeed mount'ta doldurur.
        likedFactIds={[]}
        likedPostIds={[]}
        repostedFactIds={[]}
        likedDykIds={[]}
        suggestedUsers={[]}
        currentUser={null}
        canMatch={false}
        ownStoryUser={null}
        otherStoryUsers={publicStoryUsers}
      />
    </>
  );
}
