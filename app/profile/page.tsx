import { redirect } from 'next/navigation';
import { db, getMe, isAdmin, logIfError } from '@/lib/supabase/server';
import { bannerGradient } from '@/lib/avatar';
import { getHighlights } from '@/lib/storyHighlights';
import type { DbUser } from '@/lib/types';
import ProfileClient from './ProfileClient';

export const dynamic = 'force-dynamic';

// Profildeki "makalelerim" sutunlari. ESKI surum, duzenleme-onayi gocu henuz
// calismadiginda kullanilan yedek yol (asagidaki aciklamaya bak).
const ARTICLE_COLS_ESKI = 'id, slug, title, status, cover_url, reject_reason';
const ARTICLE_COLS = `${ARTICLE_COLS_ESKI}, pending_at, pending_reject_reason`;

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ error?: string; s?: string }> }) {
  const { me } = await getMe();
  if (!me) redirect('/login');

  // me, getMe()'de zaten users tablosundan select('*') ile geldi → aynı satırı
  // tekrar çekmeye gerek yok (bir DB turu eksilir).
  const user = me as DbUser;

  const { error, s: hataSayisi } = await searchParams;

  // Alan seçimi (select('*') yerine yalnızca kullanılan kolonlar) → daha küçük
  // satırlar, daha hızlı transfer. Limit yok: ızgara sayısı (.length) doğru kalsın
  // (mevcut ölçekte gönderi sayısı küçük; ileride sayfalama gerekirse ayrı count+limit).
  const [followersRes, followingRes, mediaRes, bookmarksRes, repostsRes, progressRes, badgesRes, articlesRes, okumaRes] = await Promise.all([
    db.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
    db.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
    db.from('quick_facts').select('id, media_url, media_type, caption, likes, created_at, media').eq('user_id', user.id).order('created_at', { ascending: false }),
    db.from('bookmarks').select('id, post:post_id(id, media_url, media_type, caption, likes, created_at, media)').eq('user_id', user.id).order('created_at', { ascending: false }),
    db.from('fact_reposts').select('created_at, fact:fact_id(id, media_url, media_type, caption, likes, created_at, media)').eq('user_id', user.id).order('created_at', { ascending: false }),
    // Bilgi/seri ilerlemesi + rozetler. Tablolar yoksa (SQL henuz calismadiysa)
    // hata doner ama yutulur -> profil yine acilir (logIfError YOK, gurultu olmasin).
    db.from('user_progress').select('xp, current_streak, longest_streak, total_correct, total_answered, last_answer_date').eq('user_id', user.id).maybeSingle(),
    db.from('user_badges').select('badge_key, earned_at').eq('user_id', user.id).order('earned_at', { ascending: true }),
    // Kendi makaleleri (her durum). Tablo yoksa hata yutulur -> profil yine acilir.
    // pending_at/pending_reject_reason: yayindaki makaleye onerilip onay bekleyen
    // duzenleme. Yalnizca VAR MI diye bakiliyor (govdesi cekilmiyor) -> sorgu
    // agirlasmasin. Sutunlar yoksa asagida sutunsuz surumle tekrar denenir.
    db.from('user_articles').select(ARTICLE_COLS).eq('user_id', user.id).order('created_at', { ascending: false }),
    // Okuma listesi SAYISI. Makale kaydetmek gonderi kaydetmekten AYRI bir
    // koleksiyon (article_saves vs bookmarks) ve "Kaydedilenler" sekmesi
    // yalnizca gonderileri gosteriyordu — kullanici makalesini orada arayip
    // bulamiyordu. Sekmeye kopru koyabilmek icin sayiyi buradan aliyoruz.
    // head:true -> yalniz sayi doner, satir tasinmaz.
    db.from('article_saves').select('article_slug', { count: 'exact', head: true }).eq('user_id', user.id),
  ]);
  // Öne çıkanlar — tablo yoksa boş (getHighlights defansif); şerit gizli kalır.
  const highlights = await getHighlights(user.id);
  logIfError('profile media', mediaRes.error);
  logIfError('profile bookmarks', bookmarksRes.error);
  logIfError('profile reposts', repostsRes.error);

  const progress = progressRes && !progressRes.error ? (progressRes.data ?? null) : null;
  const badgeKeys: string[] = (badgesRes && !badgesRes.error ? (badgesRes.data ?? []) : []).map((b: any) => b.badge_key);
  // ⚠ DEPLOY SIRASI TUZAGI: bu sayfa sorgu hatasini YUTAR. Duzenleme-onayi gocu
  // (sql/features-article-edit-approval.sql) henuz calismadan kod yayina cikarsa
  // pending_* sutunlari yok -> sorgu 42703 ile duser -> hicbir yerde hata
  // gorunmeden HER YAZARIN makale listesi profilinden kaybolurdu. Sutunsuz
  // surumle bir kez daha deneyip bu sessiz gerilemeyi kapatiyoruz. Goc
  // calistiktan sonra bu yedek yol hic tetiklenmez.
  // Tip ACIK verilmeli: yedek yol pending_* sutunlari OLMADAN doner, `let`in
  // cikarimi ise ilk atamadan (genis surum) gelir -> atama tip hatasi verirdi.
  type ArticleRow = {
    id: number; slug: string; title: string; status: string;
    cover_url: string | null; reject_reason: string | null;
    pending_at?: string | null; pending_reject_reason?: string | null;
  };
  let articlesRows: ArticleRow[] = articlesRes && !articlesRes.error ? ((articlesRes.data ?? []) as ArticleRow[]) : [];
  if (articlesRes?.error) {
    const { data: eski } = await db.from('user_articles')
      .select(ARTICLE_COLS_ESKI).eq('user_id', user.id).order('created_at', { ascending: false });
    articlesRows = (eski ?? []) as ArticleRow[];
  }
  const myArticles = articlesRows;

  type MediaPostRow = { id: number; media_url: string; media_type: string; caption: string; likes: number; created_at: string; media?: { url: string; type: 'image' | 'video' }[] | null };
  const mediaPosts = (mediaRes.data ?? []) as MediaPostRow[];
  const savedPosts = ((bookmarksRes.data ?? []) as any[]).map((b: any) => b.post).filter(Boolean) as MediaPostRow[];
  // Repost edilen akış (quick_facts) gönderileri — medya ızgarasında gösterilir
  const repostedPosts = ((repostsRes.data ?? []) as any[]).map((r: any) => r.fact).filter(Boolean) as MediaPostRow[];

  const bg = bannerGradient(user.username);

  function calcAge(bd: string | null): number | null {
    if (!bd) return null;
    const d = new Date(bd), t = new Date();
    let a = t.getFullYear() - d.getFullYear();
    const m = t.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
    return a;
  }

  return (
    <ProfileClient
      user={user}
      bg={bg}
      age={calcAge(user.birthdate ?? null)}
      followersCount={followersRes.count ?? 0}
      followingCount={followingRes.count ?? 0}
      mediaPosts={mediaPosts}
      savedPosts={savedPosts}
      savedArticleCount={okumaRes?.error ? 0 : (okumaRes?.count ?? 0)}
      repostedPosts={repostedPosts}
      myArticles={myArticles}
      isAdmin={isAdmin(user as any)}
      progress={progress}
      badgeKeys={badgeKeys}
      highlights={highlights}
      error={error ?? null}
      hataSayisi={hataSayisi ?? null}
    />
  );
}
