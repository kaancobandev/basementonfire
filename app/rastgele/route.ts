import { ARTICLES } from '@/lib/articles';

// "Rastgele keşfet" — her istekte rastgele bir makaleye 307 yönlendirir.
// force-dynamic: yönlendirme önbelleğe alınmasın (her tıkta yeni makale).
export const dynamic = 'force-dynamic';

export function GET() {
  const a = ARTICLES[Math.floor(Math.random() * ARTICLES.length)];
  // GÖRELI Location: tarayıcı mevcut alan adına (basementonfire.com) göre çözer.
  // (req.url origin'i Netlify'da iç deploy URL'sini verir -> kullanıcıyı özel alan
  //  adından cikarir; bu yüzden mutlak URL KULLANMA.)
  return new Response(null, { status: 307, headers: { Location: `/articles/${a.slug}` } });
}
