import type { Metadata } from 'next';
import { audiencePredicate } from '@/lib/storyAudience';
import { getHomeContent, getDidYouKnow, buildFeedItems, buildStoryUsers } from '@/lib/feedData';
import HomeFeed from '../components/HomeFeed';

// 2026-07-16: Bu sayfa ESKİDEN app/page.tsx idi (ana sayfa). Ana sayfa statik
// landing'e dönüştüğü için zengin akış BUNA TAŞINDI.
//
// ════════════════════════════════════════════════════════════════════════
// 2026-07-28 — force-dynamic ➜ ISR. Soğuk başlatma sorununun KÖK ÇÖZÜMÜ.
//
// ÖNCEKİ DURUM: force-dynamic + no-store → sayfa hiçbir cache katmanına
// giremiyordu. Girişli kullanıcı `/` → 307 → /feed yolundan geldiği için
// açılışta HER SEFERİNDE Next.js Server Handler Lambda'sını uyandırıyordu.
// Ölçüm (2026-07-28): 5 dk sessizlik sonrası TTFB 3,24 sn; peş peşe 0,6-1,0 sn.
// Palyatif çözüm (keep-warm cron'u) İKİ SEBEPLE çuvalladı: (a) Netlify
// schedule'ı bu kurulumda hiç tetiklenmedi, (b) tetiklense bile ping YALNIZ
// TEK instance'ı ısıtır — elle çağırdıktan hemen sonraki istek yine 2,94 sn geldi.
//
// ŞİMDİ: sayfa PAYLAŞILAN bir kabuk. HTML herkes için aynı → CDN'de durur,
// deploy süpürgesi ısıtabilir, Lambda çoğu istekte HİÇ çalışmaz.
// Kimlik ve kişiye özel her şey istemciden gelir:
//   · currentUser  → NavUserContext (/api/nav-state) — /muzik ve /hashtag'in
//                    zaten kullandığı, kanıtlanmış desen
//   · beğeni/repost/öneri/hikâye kitlesi → /api/feed/personal (no-store)
//
// ⚠ BU SAYFAYA KİŞİSEL VERİ EKLEME. Çıktı 30 saniye boyunca HERKESE aynı
// servis edilir; buraya sızan tek bir kişisel alan tüm ziyaretçilere gider.
// Kişisel her şeyin yeri /api/feed/personal.
// ════════════════════════════════════════════════════════════════════════
export const revalidate = 30;

// Kişiye özel akış → arama motoruna kapalı (ana sayfa landing'i indekslenir).
export const metadata: Metadata = {
  title: 'Akışın',
  description: 'Basementonfire akışın: en yeni gönderiler, hikâyeler, günün sorusu ve bilgi kartları.',
  alternates: { canonical: '/feed' },
  robots: { index: false, follow: true },
};

export default async function FeedPage() {
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
  //
  // Neden hiç hikâye koymamak yerine bu: anonim ziyaretçi bugün de public
  // hikâyeleri görüyor; kabuğu boş bırakmak onlar için bir gerileme olurdu.
  const canSeeAnon = await audiencePredicate(null);
  const publicStoryUsers = [...buildStoryUsers(storiesRaw ?? [], canSeeAnon).values()];

  return (
    <>
      {/* Feed'deki GIF'ler Giphy CDN'inden gelir — DNS+TLS'i önden aç.
          React bu link'i head'e taşır; yalnız bu sayfada emit edilir. */}
      <link rel="dns-prefetch" href="https://media3.giphy.com" />
      <link rel="preconnect" href="https://media3.giphy.com" crossOrigin="anonymous" />
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
