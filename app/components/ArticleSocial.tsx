'use client';

import { usePathname } from 'next/navigation';
import { isArticleSlug } from '@/lib/articles';
import RelatedArticles from './RelatedArticles';
import ArticleQuiz from './ArticleQuiz';
import ArticleDiscussion from './ArticleDiscussion';

/**
 * Tüm makalelerin ortak SOSYAL AYAĞI — ArticleBibliography'nin hemen ardından
 * (tek noktadan) render edilir, böylece 18 makaleye tek düzenlemeyle eklenir.
 * Slug'ı usePathname'den türetir (makaleler dinamik route DEĞİL, slug prop yok).
 * Fikir 4: İlgili Konular + Rastgele keşfet. Fikir 5: Kaydet + Tartışma (defansif).
 */
export default function ArticleSocial() {
  const pathname = usePathname() || '';
  if (!pathname.startsWith('/articles/')) return null;
  const slug = pathname.replace(/^\/articles\//, '').replace(/\/+$/, '').split('/')[0];
  // Yalniz kayitli (gercek) makale slug'larinda render et -> bilinmeyen yolda gosterme.
  if (!slug || !isArticleSlug(slug)) return null;

  return (
    <div className="article-social">
      <RelatedArticles slug={slug} />
      {/* Fikir 3 (2026-07-19): makale sonu mini-quiz → XP. Sorusu olmayan
          makalede kendini gizler (makaleler statik kalır). */}
      <ArticleQuiz slug={slug} />
      <ArticleDiscussion slug={slug} />
    </div>
  );
}
