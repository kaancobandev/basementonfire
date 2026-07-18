import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db, getMe, isAdmin } from '@/lib/supabase/server';
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo';
import { sanitizeArticleHtml } from '@/lib/articleSanitize';
import { type ArticleBlock, articleGoogleFontsHref } from '@/lib/userArticles';
import Img from '@/app/components/Img';
import ArticleEmbed from '@/app/components/ArticleEmbed';

export const dynamic = 'force-dynamic';

type ArticleRow = {
  id: number; slug: string; title: string; summary: string; cover_url: string | null;
  category: string | null; doc: ArticleBlock[]; sources: any[]; status: string;
  created_at: string; updated_at: string | null; published_at: string | null; user_id: number;
  users: { username: string; display_name: string; avatar: string | null } | null;
};

async function load(slug: string): Promise<ArticleRow | null> {
  const { data } = await db
    .from('user_articles')
    .select('id, slug, title, summary, cover_url, category, doc, sources, status, created_at, updated_at, published_at, user_id, users!user_articles_user_id_fkey(username, display_name, avatar)')
    .eq('slug', slug)
    .maybeSingle();
  return (data as any) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await load(slug);
  if (!a) return { title: 'Makale bulunamadı', robots: { index: false, follow: false } };
  const path = `/makale/${a.slug}`;
  const description = (a.summary || a.title).slice(0, 160);
  // Yalnizca onayli makaleler indekslenir.
  if (a.status !== 'approved') {
    return { title: a.title, description, alternates: { canonical: path }, robots: { index: false, follow: false } };
  }
  return {
    title: a.title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'article', title: `${a.title} · Basements`, description, url: path, images: a.cover_url ? [a.cover_url] : ['/opengraph-image'] },
    twitter: { card: 'summary_large_image', title: `${a.title} · Basements`, description },
  };
}

function fmtDate(s: string | null): string {
  if (!s) return '';
  try { return new Date(s).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return ''; }
}

export default async function UserArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await load(slug);
  if (!a) notFound();

  const { me } = await getMe();
  const isOwner = !!me && me.id === a.user_id;
  const admin = isAdmin(me as any);
  // Onaysiz makaleyi yalnizca sahibi veya admin onizleyebilir.
  if (a.status !== 'approved' && !isOwner && !admin) notFound();

  const author = a.users;
  const authorName = author?.display_name || author?.username || 'Kullanıcı';
  const blocks = Array.isArray(a.doc) ? a.doc : [];
  // Yalnızca bu makalede geçen font aileleri (yoksa null → hiç istek atılmaz).
  const fontsHref = articleGoogleFontsHref(a.doc);
  const sources = Array.isArray(a.sources) ? a.sources : [];

  const jsonLd = a.status === 'approved' ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: (a.summary || a.title).slice(0, 200),
    inLanguage: 'tr-TR',
    datePublished: a.published_at ?? a.created_at,
    dateModified: a.updated_at ?? a.published_at ?? a.created_at,
    url: `https://basementonfire.com/makale/${a.slug}`,
    ...(a.cover_url ? { image: a.cover_url } : {}),
    author: { '@type': 'Person', name: authorName, ...(author?.username ? { url: `https://basementonfire.com/u/${author.username}` } : {}) },
    publisher: { '@type': 'Organization', name: 'Basements' },
  } : null;

  const breadcrumbLd = a.status === 'approved' ? breadcrumbJsonLd([
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Keşfet', path: '/discover' },
    { name: a.title },
  ]) : null;

  return (
    <main className="main-content ua-view">
      {/* Yalnızca BU makalenin kullandığı font aileleri. Eskiden 18 ailenin
          tamamını isteyen stylesheet yükleniyordu; hiç web fontu kullanmayan
          makalelerde artık hiç istek atılmıyor (fontsHref null döner). */}
      {fontsHref && <link rel="stylesheet" href={fontsHref} />}
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />}
      {breadcrumbLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />}

      {a.status !== 'approved' && (
        <div className="ua-banner">
          {a.status === 'pending'
            ? '⏳ Bu makale incelemede — yalnızca sen ve yöneticiler görebilir. Onaylanınca yayına girer.'
            : '🚫 Bu makale reddedildi. Düzenleyip tekrar gönderebilirsin.'}
          {isOwner && <Link href={`/makale/yeni?id=${a.id}`} className="ua-banner-edit">Düzenle</Link>}
        </div>
      )}

      <article className="ua-article">
        <header className="ua-head">
          {a.category && <span className="ua-cat">{a.category}</span>}
          <h1 className="ua-title">{a.title}</h1>
          {a.summary && <p className="ua-summary">{a.summary}</p>}
          {author && (
            <Link href={`/u/${author.username}`} className="ua-author">
              <span className="ua-author-av">
                {author.avatar && author.avatar !== '/avatars/default.png'
                  ? <Img src={author.avatar} alt="" fixedWidth={64} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : authorName[0]?.toUpperCase()}
              </span>
              <span>
                <span className="ua-author-name">{authorName}</span>
                {a.published_at && <span className="ua-date"> · {fmtDate(a.published_at)}</span>}
              </span>
            </Link>
          )}
        </header>

        {a.cover_url && (
          <div className="ua-cover">
            <Img src={a.cover_url} alt={a.title} loading="eager" sizes="(max-width:820px) 100vw, 820px" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        )}

        <div className="ua-body">
          {blocks.map((b, i) => {
            if (b.type === 'text') {
              // Render aninda TEKRAR sanitize (cifte savunma).
              return <div key={i} className="ua-prose" dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(b.html) }} />;
            }
            if (b.type === 'image') {
              return (
                <figure key={i} className="ua-fig">
                  <Img src={b.url} alt={b.alt || ''} loading="lazy" sizes="(max-width:820px) 100vw, 820px" style={{ width: '100%', maxWidth: '100%', height: 'auto', display: 'block', borderRadius: 12 }} />
                  {b.caption && <figcaption>{b.caption}</figcaption>}
                </figure>
              );
            }
            if (b.type === 'embed') {
              return <ArticleEmbed key={i} block={b} />;
            }
            return null;
          })}
        </div>

        {sources.length > 0 && (
          <section className="ua-bib" aria-label="Kaynakça">
            <h2>📚 Kaynakça</h2>
            <ol>
              {sources.map((s: any, i: number) => (
                <li key={i}>
                  {s.url
                    ? <a href={s.url} target="_blank" rel="nofollow noopener noreferrer">{s.title}</a>
                    : <span>{s.title}</span>}
                  {(s.authors || s.year || s.source) && (
                    <span className="ua-bib-meta"> — {[s.authors, s.year, s.source].filter(Boolean).join(' · ')}</span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
      </article>

      <style>{`
        .ua-view { padding-bottom: 64px; }
        .ua-banner { display:flex; align-items:center; gap:12px; flex-wrap:wrap; background: var(--color-surface); border-bottom: 1px solid var(--color-border); color: var(--color-text); padding: 12px 16px; font-size: 0.88rem; }
        .ua-banner-edit { margin-left:auto; background: var(--color-primary); color:#fff; padding: 5px 14px; border-radius: 9999px; font-weight:700; font-size:0.8rem; text-decoration:none; }
        .ua-article { max-width: 820px; margin: 0 auto; padding: 28px 16px 0; }
        .ua-cat { display:inline-block; font-size:0.72rem; font-weight:800; letter-spacing:0.05em; text-transform:uppercase; color: var(--color-primary); background: color-mix(in srgb, var(--color-primary) 12%, transparent); padding: 4px 10px; border-radius:9999px; margin-bottom: 14px; }
        .ua-title { font-size: clamp(1.7rem, 4.5vw, 2.6rem); font-weight: 800; line-height: 1.12; letter-spacing: -0.02em; margin: 0 0 12px; color: var(--color-text); }
        .ua-summary { font-size: 1.08rem; line-height: 1.55; color: var(--color-text-muted); margin: 0 0 18px; }
        .ua-author { display:inline-flex; align-items:center; gap:10px; text-decoration:none; color:inherit; margin-bottom: 22px; }
        .ua-author-av { width: 38px; height: 38px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; background: linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; font-weight:700; overflow:hidden; }
        .ua-author-name { font-weight:700; color: var(--color-text); }
        .ua-author:hover .ua-author-name { text-decoration: underline; }
        .ua-date { color: var(--color-text-muted); font-size:0.88rem; }
        .ua-cover { width:100%; aspect-ratio: 16/9; overflow:hidden; border-radius: 16px; background: var(--color-border); margin-bottom: 8px; }

        /* Prose */
        .ua-body { font-size: 1.06rem; line-height: 1.72; color: var(--color-text); }
        .ua-prose { margin: 0; }
        .ua-prose p { margin: 0 0 1.05rem; }
        .ua-prose h2 { font-size: 1.5rem; font-weight: 800; line-height: 1.2; margin: 1.8rem 0 0.8rem; color: var(--color-text); }
        .ua-prose h3 { font-size: 1.2rem; font-weight: 700; margin: 1.5rem 0 0.6rem; color: var(--color-text); }
        .ua-prose h4 { font-size: 1.05rem; font-weight: 700; margin: 1.2rem 0 0.5rem; }
        .ua-prose ul, .ua-prose ol { margin: 0 0 1.05rem; padding-left: 1.5rem; }
        .ua-prose li { margin: 0.25rem 0; }
        .ua-prose a { color: var(--color-primary); text-decoration: underline; word-break: break-word; }
        .ua-prose blockquote { margin: 1.2rem 0; padding: 0.4rem 0 0.4rem 1rem; border-left: 3px solid var(--color-primary); color: var(--color-text-muted); }
        .ua-prose mark { padding: 0 2px; border-radius: 3px; }
        .ua-prose code { font-family: ui-monospace, "Space Mono", monospace; background: var(--color-surface); padding: 1px 5px; border-radius: 5px; font-size: 0.92em; }
        .ua-prose pre { background: var(--color-surface); padding: 12px 14px; border-radius: 10px; overflow-x: auto; }
        .ua-prose img { max-width: 100%; height: auto; }

        .ua-fig { margin: 22px 0; }
        .ua-fig img { width: 100%; max-width: 100%; height: auto; display: block; }
        .ua-fig figcaption { font-size: 0.8rem; color: var(--color-text-muted); text-align: center; margin-top: 7px; }

        .ua-bib { margin-top: 36px; padding-top: 22px; border-top: 1px solid var(--color-border); }
        .ua-bib h2 { font-size: 1.15rem; font-weight: 800; margin: 0 0 14px; color: var(--color-text); }
        .ua-bib ol { margin: 0; padding-left: 1.3rem; display:flex; flex-direction:column; gap: 9px; }
        .ua-bib li { font-size: 0.92rem; line-height: 1.5; color: var(--color-text); }
        .ua-bib a { color: var(--color-primary); }
        .ua-bib-meta { color: var(--color-text-muted); font-size: 0.85rem; }

        @media (max-width: 480px) {
          .ua-article { padding: 20px 14px 0; }
          .ua-body { font-size: 1.02rem; }
        }
      `}</style>
    </main>
  );
}
