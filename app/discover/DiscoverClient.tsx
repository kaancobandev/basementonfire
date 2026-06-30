'use client';

import Img from '@/app/components/Img';
import { AudioThumb } from '@/app/components/MediaCarousel';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';

interface User { id: number; username: string; display_name: string; bio: string | null; avatar: string | null; avatarBg: string; }
interface MediaPost { id: number; media_url: string; media_type: string; caption: string; likes: number; username: string; display_name: string; }
interface Article { slug: string; title: string; emoji: string; desc: string; href?: string; }
interface CommunityArticle { slug: string; title: string; summary: string; cover_url: string | null; category: string | null; author: string; username: string; }

interface Props {
  users: User[];
  media: MediaPost[];
  articles: Article[];
  communityArticles?: CommunityArticle[];
  isLoggedIn: boolean;
  initialQuery?: string;
}

function avatarBg(u: string) {
  const gs = ['linear-gradient(135deg,#6366f1,#8b5cf6)', 'linear-gradient(135deg,#ec4899,#8b5cf6)', 'linear-gradient(135deg,#f97316,#ef4444)', 'linear-gradient(135deg,#10b981,#3b82f6)', 'linear-gradient(135deg,#f59e0b,#f97316)', 'linear-gradient(135deg,#14b8a6,#06b6d4)', 'linear-gradient(135deg,#3b82f6,#6366f1)', 'linear-gradient(135deg,#ef4444,#f97316)'];
  let h = 0; for (const c of u) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return gs[Math.abs(h) % gs.length];
}

// Her makaleye içeriğiyle ilişkili bir hover gradyanı: kart üstüne gelince beliren temalı arka plan.
const ARTICLE_GRADIENTS: Record<string, string> = {
  'black-hole': 'linear-gradient(135deg,#1e1b4b,#4c1d95)',
  'turkler': 'linear-gradient(135deg,#7f1d1d,#b45309)',
  'rome': 'linear-gradient(135deg,#7f1d1d,#9a3412)',
  'greece': 'linear-gradient(135deg,#1e3a8a,#0369a1)',
  'carthage': 'linear-gradient(135deg,#0f766e,#6d28d9)',
  'ekonomi': 'linear-gradient(135deg,#065f46,#15803d)',
  'einstein-rosen': 'linear-gradient(135deg,#4c1d95,#0e7490)',
  'arcade': 'linear-gradient(135deg,#be185d,#7c3aed)',
  'tibbi': 'linear-gradient(135deg,#0e7490,#1d4ed8)',
  'internet': 'linear-gradient(135deg,#1e40af,#0e7490)',
  'pirus': 'linear-gradient(135deg,#78350f,#991b1b)',
  'takyon': 'linear-gradient(135deg,#6d28d9,#2563eb)',
  'tardigrad': 'linear-gradient(135deg,#0e7490,#15803d)',
  'bagirsak': 'linear-gradient(135deg,#be123c,#0f766e)',
  'bakteriyofaj': 'linear-gradient(135deg,#15803d,#0d9488)',
  'endosimbiyoz': 'linear-gradient(135deg,#b45309,#6d28d9)',
  'kaligrafi': 'linear-gradient(135deg,#92400e,#57534e)',
  'doppler': 'linear-gradient(135deg,#2563eb,#b91c1c)',
  'dogal-secilim': 'linear-gradient(135deg,#059669,#65a30d)',
  'dunya': 'linear-gradient(135deg,#0c4a6e,#0891b2)',
};
const FALLBACK_GRADIENT = 'linear-gradient(135deg,#6366f1,#8b5cf6)';

export default function DiscoverClient({ users, media, articles, communityArticles = [], isLoggedIn, initialQuery = '' }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<{ users: User[]; posts: MediaPost[] } | null>(null);
  const [searching, setSearching] = useState(false);
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  // URL'de ?q=... ile gelindiğinde (örn. Google sitelinks arama kutusu) otomatik ara.
  useEffect(() => {
    if (initialQuery.trim()) doSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  async function doSearch(q: string) {
    if (!q.trim()) { setSearchResults(null); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults({ users: (data.users ?? []).map((u: any) => ({ ...u, avatarBg: avatarBg(u.username) })), posts: data.posts ?? [] });
    } finally {
      setSearching(false);
    }
  }

  async function followUser(username: string) {
    const res = await fetch(`/api/users/${username}/follow`, { method: 'POST' });
    if (res.status === 401) { window.location.href = '/login'; return; }
    const data = await res.json();
    setFollowed(prev => { const n = new Set(prev); data.following ? n.add(username) : n.delete(username); return n; });
  }

  function UserRow({ u, showFollow }: { u: User; showFollow: boolean }) {
    const isFollowed = followed.has(u.username);
    return (
      <div className="dc-user-row">
        <Link href={`/u/${u.username}`} className="dc-avatar" style={{ background: u.avatarBg }}>
          {u.avatar
            ? <Img src={u.avatar} alt="" fixedWidth={128} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : u.display_name[0].toUpperCase()
          }
        </Link>
        <div className="dc-user-info">
          <Link href={`/u/${u.username}`} className="dc-user-name">{u.display_name}</Link>
          <div className="dc-user-handle">@{u.username}</div>
          {u.bio && <div className="dc-user-bio">{u.bio}</div>}
        </div>
        {showFollow && (
          <button
            onClick={() => followUser(u.username)}
            className={`dc-follow-btn${isFollowed ? ' following' : ''}`}
          >
            {isFollowed ? 'Takip Ediliyor' : 'Takip Et'}
          </button>
        )}
      </div>
    );
  }

  const showDefault = !searchResults && !searching;

  return (
    <main className="main-content">
      <div className="feed-header">İçerikler</div>

      {/* Arama çubuğu */}
      <div className="dc-search-wrap">
        <div className="dc-search-inner">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="dc-search-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); if (!e.target.value.trim()) setSearchResults(null); }}
            onKeyDown={e => { if (e.key === 'Enter') doSearch(query); }}
            placeholder="Kullanıcı veya gönderi ara…"
            className="dc-search-input"
          />
          {query && (
            <button onClick={() => doSearch(query)} className="dc-search-btn">Ara</button>
          )}
        </div>
      </div>

      {/* Aranıyor */}
      {searching && (
        <div className="dc-state-msg">Aranıyor…</div>
      )}

      {/* Arama sonuçları */}
      {searchResults && !searching && (
        <div>
          {searchResults.users.length > 0 && (
            <div className="dc-section">
              <h3 className="dc-section-label">Kullanıcılar</h3>
              {searchResults.users.map(u => <UserRow key={u.id} u={u} showFollow={true} />)}
            </div>
          )}

          {searchResults.posts.length > 0 && (
            <div className="dc-section">
              <h3 className="dc-section-label">Gönderiler</h3>
              <div className="dc-grid">
                {searchResults.posts.map((p: any) => (
                  <Link key={p.id} href={`/p/${p.id}`} className="dc-cell">
                    {p.media_type === 'audio'
                      ? <AudioThumb />
                      : p.media_type === 'image'
                      ? <Img src={p.media_url} alt="" loading="lazy" sizes="(max-width:700px) 33vw, 200px" />
                      : <video src={p.media_url} muted preload="none" />
                    }
                  </Link>
                ))}
              </div>
            </div>
          )}

          {searchResults.users.length === 0 && searchResults.posts.length === 0 && (
            <div className="dc-empty">
              <p style={{ fontWeight: 600, margin: '0 0 6px' }}>Sonuç bulunamadı</p>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>Farklı bir kelime dene</p>
            </div>
          )}
        </div>
      )}

      {/* Varsayılan içerik */}
      {showDefault && (
        <>
          {/* Makaleler */}
          <div className="dc-section">
            <h2 className="dc-section-title">Makaleler</h2>
            <div className="dc-articles">
              {articles.map(a => {
                const gradStyle = { ['--art-grad']: ARTICLE_GRADIENTS[a.slug] ?? FALLBACK_GRADIENT } as CSSProperties;
                const inner = (
                  <>
                    <div className="dc-article-top">
                      <span className="dc-article-emoji">{a.emoji}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="dc-article-arrow"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                    <div className="dc-article-title">{a.title}</div>
                    <div className="dc-article-desc">{a.desc}</div>
                  </>
                );
                // href verilenler statik /icerik/*.html sayfalarıdır → normal <a> ile tam sayfa açılır
                return a.href
                  ? <a key={a.slug} href={a.href} className="dc-article-link" style={gradStyle}>{inner}</a>
                  : <Link key={a.slug} href={`/articles/${a.slug}`} className="dc-article-link" style={gradStyle}>{inner}</Link>;
              })}
            </div>
          </div>

          {/* Topluluk makaleleri — kullanıcıların yazıp yayınladığı makaleler */}
          {communityArticles.length > 0 && (
            <div className="dc-section">
              <h2 className="dc-section-title">Topluluk Makaleleri</h2>
              <div className="dc-comm">
                {communityArticles.map(a => (
                  <Link key={a.slug} href={`/makale/${a.slug}`} className="dc-comm-card">
                    {a.cover_url
                      ? <div className="dc-comm-cover"><Img src={a.cover_url} alt="" loading="lazy" sizes="(max-width:700px) 90px, 120px" /></div>
                      : <div className="dc-comm-cover dc-comm-cover--ph">✍️</div>}
                    <div className="dc-comm-body">
                      {a.category && <span className="dc-comm-cat">{a.category}</span>}
                      <div className="dc-comm-title">{a.title}</div>
                      {a.summary && <div className="dc-comm-desc">{a.summary}</div>}
                      <div className="dc-comm-author">@{a.username}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Son paylaşımlar */}
          {media.length > 0 && (
            <div className="dc-section">
              <h2 className="dc-section-title">Son Paylaşımlar</h2>
              <div className="dc-grid">
                {media.map(m => (
                  <Link key={m.id} href={`/p/${m.id}`} className="dc-cell">
                    {m.media_type === 'audio'
                      ? <AudioThumb />
                      : m.media_type === 'image'
                      ? <Img src={m.media_url} alt={m.caption} loading="lazy" sizes="(max-width:700px) 33vw, 200px" />
                      : <video src={m.media_url} muted preload="none" />
                    }
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Kullanıcılar */}
          {users.length > 0 && (
            <div className="dc-section dc-section--last">
              <h2 className="dc-section-title">Kullanıcılar</h2>
              <div className="dc-users-list">
                {users.map(u => <UserRow key={u.id} u={u} showFollow={isLoggedIn} />)}
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        /* Arama */
        .dc-search-wrap {
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border);
        }
        .dc-search-inner {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--color-bg);
          border: 1.5px solid var(--color-border);
          border-radius: 9999px;
          padding: 0 12px;
          gap: 8px;
          transition: border-color 0.15s;
        }
        .dc-search-inner:focus-within {
          border-color: var(--color-primary);
        }
        .dc-search-icon {
          color: var(--color-text-muted);
          flex-shrink: 0;
        }
        .dc-search-input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          padding: 10px 0;
          font-size: 0.95rem;
          font-family: inherit;
          color: var(--color-text);
          min-width: 0;
        }
        .dc-search-input::placeholder { color: var(--color-text-muted); }
        .dc-search-btn {
          flex-shrink: 0;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 9999px;
          padding: 5px 14px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
        }
        .dc-search-btn:hover { background: var(--color-primary-hover); }

        /* Durum mesajı */
        .dc-state-msg {
          padding: 24px;
          text-align: center;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }
        .dc-empty {
          padding: 48px 24px;
          text-align: center;
          color: var(--color-text-muted);
        }

        /* Bölüm */
        .dc-section {
          padding: 16px 16px 0;
          border-bottom: 1px solid var(--color-border);
        }
        .dc-section--last {
          border-bottom: none;
          padding-bottom: 64px;
        }
        .dc-section-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin: 0 0 10px;
        }
        .dc-section-title {
          font-size: 1rem;
          font-weight: 800;
          margin: 0 0 12px;
          color: var(--color-text);
        }

        /* Makaleler — 2 kolonlu eğlenceli kartlar */
        .dc-articles {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding-bottom: 16px;
        }
        .dc-article-link {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding: 15px 16px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 18px;
          text-decoration: none;
          color: inherit;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        /* İçeriğe özel hover gradyanı (--art-grad ile her karta ayrı) */
        .dc-article-link::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--art-grad);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 0;
        }
        .dc-article-top, .dc-article-title, .dc-article-desc { position: relative; z-index: 1; }
        .dc-article-link:hover {
          transform: translateY(-4px);
          border-color: transparent;
          box-shadow: 0 14px 30px rgba(0,0,0,0.22);
        }
        .dc-article-link:hover::before { opacity: 1; }
        .dc-article-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .dc-article-emoji {
          font-size: 2.1rem;
          line-height: 1;
          transition: transform 0.25s ease;
        }
        .dc-article-link:hover .dc-article-emoji { transform: scale(1.18) rotate(-7deg); }
        .dc-article-title {
          font-weight: 800;
          font-size: 0.95rem;
          color: var(--color-text);
          line-height: 1.25;
          transition: color 0.25s ease;
        }
        .dc-article-desc {
          font-size: 0.77rem;
          color: var(--color-text-muted);
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.25s ease;
        }
        .dc-article-arrow {
          color: var(--color-text-muted);
          flex-shrink: 0;
          transition: transform 0.25s ease, color 0.25s ease;
        }
        .dc-article-link:hover .dc-article-title,
        .dc-article-link:hover .dc-article-desc,
        .dc-article-link:hover .dc-article-arrow { color: #fff; }
        .dc-article-link:hover .dc-article-arrow { transform: translateX(3px); }

        /* Topluluk makaleleri */
        .dc-comm { display: flex; flex-direction: column; gap: 10px; padding-bottom: 16px; }
        .dc-comm-card {
          display: flex; gap: 12px; padding: 10px;
          border: 1px solid var(--color-border); border-radius: 14px;
          text-decoration: none; color: inherit; background: var(--color-bg);
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .dc-comm-card:hover { transform: translateY(-2px); border-color: var(--color-primary); box-shadow: 0 8px 22px rgba(0,0,0,0.12); }
        .dc-comm-cover { width: 96px; height: 72px; flex-shrink: 0; border-radius: 10px; overflow: hidden; background: var(--color-border); }
        .dc-comm-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .dc-comm-cover--ph { display: grid; place-items: center; font-size: 1.6rem; background: linear-gradient(135deg,#6366f1,#8b5cf6); }
        .dc-comm-body { min-width: 0; display: flex; flex-direction: column; gap: 3px; justify-content: center; }
        .dc-comm-cat { font-size: 0.64rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary); }
        .dc-comm-title { font-weight: 800; font-size: 0.95rem; color: var(--color-text); line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .dc-comm-desc { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .dc-comm-author { font-size: 0.74rem; color: var(--color-text-muted); margin-top: 1px; }

        /* Media grid */
        .dc-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
          margin-bottom: 16px;
        }
        .dc-cell {
          aspect-ratio: 1;
          overflow: hidden;
          background: var(--color-border);
          display: block;
          position: relative;
        }
        .dc-cell img,
        .dc-cell video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.2s;
        }
        .dc-cell:hover img,
        .dc-cell:hover video { transform: scale(1.04); }

        /* Kullanıcı listesi */
        .dc-users-list {
          display: flex;
          flex-direction: column;
        }
        .dc-user-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--color-border);
        }
        .dc-user-row:last-child { border-bottom: none; }
        .dc-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1rem;
          text-decoration: none;
          overflow: hidden;
        }
        .dc-user-info { flex: 1; min-width: 0; }
        .dc-user-name {
          font-weight: 700;
          font-size: 0.92rem;
          color: var(--color-text);
          text-decoration: none;
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dc-user-name:hover { text-decoration: underline; }
        .dc-user-handle {
          font-size: 0.78rem;
          color: var(--color-text-muted);
        }
        .dc-user-bio {
          font-size: 0.76rem;
          color: var(--color-text-muted);
          margin-top: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dc-follow-btn {
          flex-shrink: 0;
          padding: 6px 14px;
          border-radius: 9999px;
          border: 1.5px solid var(--color-text);
          background: transparent;
          color: var(--color-text);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
          transition: all 0.15s;
        }
        .dc-follow-btn:hover {
          background: var(--color-text);
          color: var(--color-surface);
        }
        .dc-follow-btn.following {
          border-color: var(--color-border);
          color: var(--color-text-muted);
        }
        .dc-follow-btn.following:hover {
          border-color: #ef4444;
          color: #ef4444;
          background: transparent;
        }

        /* Mobil */
        @media (max-width: 480px) {
          .dc-search-wrap { padding: 10px 12px; }
          .dc-section { padding: 14px 12px 0; }
          .dc-grid { grid-template-columns: repeat(2, 1fr); }
          .dc-articles { gap: 10px; }
          .dc-article-link { padding: 13px 14px; border-radius: 16px; }
          .dc-article-emoji { font-size: 1.85rem; }
          .dc-follow-btn { padding: 5px 10px; font-size: 0.75rem; }
          .dc-avatar { width: 38px; height: 38px; }
        }
      `}</style>
    </main>
  );
}
