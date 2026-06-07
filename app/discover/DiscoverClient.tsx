'use client';

import Img from '@/app/components/Img';

import { useState } from 'react';
import Link from 'next/link';

interface User { id: number; username: string; display_name: string; bio: string | null; avatar: string | null; avatarBg: string; }
interface MediaPost { id: number; media_url: string; media_type: string; caption: string; likes: number; username: string; display_name: string; }
interface Article { slug: string; title: string; emoji: string; desc: string; }

interface Props {
  users: User[];
  media: MediaPost[];
  articles: Article[];
  isLoggedIn: boolean;
}

function avatarBg(u: string) {
  const gs = ['linear-gradient(135deg,#6366f1,#8b5cf6)', 'linear-gradient(135deg,#ec4899,#8b5cf6)', 'linear-gradient(135deg,#f97316,#ef4444)', 'linear-gradient(135deg,#10b981,#3b82f6)', 'linear-gradient(135deg,#f59e0b,#f97316)', 'linear-gradient(135deg,#14b8a6,#06b6d4)', 'linear-gradient(135deg,#3b82f6,#6366f1)', 'linear-gradient(135deg,#ef4444,#f97316)'];
  let h = 0; for (const c of u) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return gs[Math.abs(h) % gs.length];
}

export default function DiscoverClient({ users, media, articles, isLoggedIn }: Props) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ users: User[]; posts: MediaPost[] } | null>(null);
  const [searching, setSearching] = useState(false);
  const [followed, setFollowed] = useState<Set<string>>(new Set());

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
            ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
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
                  <Link key={p.id} href="/akis" className="dc-cell">
                    {p.media_type === 'image'
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
              {articles.map(a => (
                <Link key={a.slug} href={`/articles/${a.slug}`} className="dc-article-link">
                  <span className="dc-article-emoji">{a.emoji}</span>
                  <div className="dc-article-text">
                    <div className="dc-article-title">{a.title}</div>
                    <div className="dc-article-desc">{a.desc}</div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="dc-article-arrow"><path d="m9 18 6-6-6-6"/></svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Son paylaşımlar */}
          {media.length > 0 && (
            <div className="dc-section">
              <h2 className="dc-section-title">Son Paylaşımlar</h2>
              <div className="dc-grid">
                {media.map(m => (
                  <Link key={m.id} href="/akis" className="dc-cell">
                    {m.media_type === 'image'
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

        /* Makaleler */
        .dc-articles {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-bottom: 16px;
        }
        .dc-article-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 14px;
          text-decoration: none;
          color: inherit;
          transition: background 0.15s, border-color 0.15s;
        }
        .dc-article-link:hover {
          background: var(--color-surface);
          border-color: var(--color-primary);
        }
        .dc-article-emoji {
          font-size: 1.8rem;
          flex-shrink: 0;
          width: 40px;
          text-align: center;
        }
        .dc-article-text { flex: 1; min-width: 0; }
        .dc-article-title {
          font-weight: 700;
          font-size: 0.92rem;
          color: var(--color-text);
          margin-bottom: 2px;
        }
        .dc-article-desc {
          font-size: 0.78rem;
          color: var(--color-text-muted);
          line-height: 1.4;
        }
        .dc-article-arrow {
          color: var(--color-text-muted);
          flex-shrink: 0;
        }

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
          .dc-article-link { padding: 10px 12px; gap: 10px; }
          .dc-article-emoji { font-size: 1.5rem; width: 32px; }
          .dc-follow-btn { padding: 5px 10px; font-size: 0.75rem; }
          .dc-avatar { width: 38px; height: 38px; }
        }

        [data-theme="dark"] .dc-article-link:hover {
          background: rgba(255,255,255,0.04);
        }
      `}</style>
    </main>
  );
}
