'use client';

import Img from '@/app/components/Img';
import MediaCarousel, { MultiBadge, AudioThumb, MusicBadge } from '@/app/components/MediaCarousel';
import { factMediaList } from '@/lib/types';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Caption from '@/app/components/Caption';
import { useAutoAnimate } from '@formkit/auto-animate/react';

interface Post {
  id: number;
  media_url: string;
  media_type: string;
  caption: string;
  likes: number;
  created_at: string;
  display_name: string;
  username: string;
  avatarBg: string;
  media?: { url: string; type: 'image' | 'video' }[] | null;
}

interface Props {
  initialPosts: Post[];
}

export default function BookmarksClient({ initialPosts }: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selected, setSelected] = useState<Post | null>(null);
  const [removing, setRemoving] = useState(false);
  const [gridRef] = useAutoAnimate<HTMLDivElement>();

  // Escape tuşu ile lightbox'ı kapat
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && selected) closeLightbox();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  function openLightbox(post: Post) {
    setSelected(post);
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    setSelected(null);
    document.body.style.overflow = '';
  }

  async function removeBookmark() {
    if (!selected || removing) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/quick-facts/${selected.id}/bookmark`, { method: 'POST' });
      const data = await res.json();
      if (!data.bookmarked) {
        setPosts(prev => prev.filter(p => p.id !== selected.id));
        closeLightbox();
      }
    } finally {
      setRemoving(false);
    }
  }

  return (
    <main className="main-content">
      {/* Başlık */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 16px 12px', borderBottom: '1px solid var(--color-border)' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
          Kaydedilenler
        </h1>
        <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{posts.length} gönderi</span>
      </div>

      {/* Boş durum */}
      {posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8, color: '#888' }}>
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
          <p style={{ fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>Henüz kaydedilen gönderi yok</p>
          <p style={{ fontSize: '0.88rem', margin: 0 }}>Bir gönderinin altındaki yer imi simgesine dokunarak kaydet.</p>
          <Link href="/akis" style={{ marginTop: 8, fontSize: '0.88rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Akışa git →
          </Link>
        </div>
      )}

      {/* Grid */}
      {posts.length > 0 && (
        <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, padding: 3 }}>
          {posts.map(post => (
            <button
              key={post.id}
              onClick={() => openLightbox(post)}
              aria-label={post.caption}
              style={{
                aspectRatio: '1',
                overflow: 'hidden',
                background: 'var(--color-border)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                position: 'relative',
                display: 'block',
              }}
              className="bk-cell"
            >
              {post.media_type === 'audio' ? (
                <AudioThumb />
              ) : post.media_type === 'image' ? (
                <Img
                  src={post.media_url}
                  alt={post.caption}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width:700px) 33vw, 240px"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.2s' }}
                />
              ) : (
                <video
                  src={post.media_url}
                  muted
                  preload="metadata"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.2s' }}
                />
              )}

              {/* Hover overlay */}
              {factMediaList(post).filter(m => m.type !== 'audio').length > 1 && <MultiBadge />}
              {post.media_type !== 'audio' && factMediaList(post).some(m => m.type === 'audio') && <MusicBadge />}
              <div className="bk-cell-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s' }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                  {post.likes}
                </span>
                {post.media_type === 'video' && (
                  <span style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: '2px 4px', display: 'flex' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) closeLightbox(); }}
        >
          <div style={{ background: 'var(--color-surface)', borderRadius: 16, display: 'flex', maxWidth: 820, width: '100%', maxHeight: '90vh', overflow: 'hidden', position: 'relative' }}>
            {/* Kapat butonu */}
            <button
              onClick={closeLightbox}
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 1, background: 'rgba(0,0,0,0.45)', border: 'none', color: 'white', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>

            {/* Medya */}
            <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320, maxHeight: '90vh' }}>
              <MediaCarousel media={factMediaList(selected)} sizes="(max-width:900px) 100vw, 860px" />
            </div>

            {/* Bilgi paneli */}
            <div style={{ width: 260, flexShrink: 0, borderLeft: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', padding: 16, gap: 14 }}>
              {/* Kullanıcı satırı */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link
                  href={`/u/${selected.username}`}
                  onClick={closeLightbox}
                  style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', background: selected.avatarBg }}
                >
                  {selected.display_name[0].toUpperCase()}
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    href={`/u/${selected.username}`}
                    onClick={closeLightbox}
                    style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {selected.display_name}
                  </Link>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>@{selected.username}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', fontWeight: 700, color: '#ef4444', fontSize: '0.88rem', flexShrink: 0 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#ef4444">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                  {selected.likes}
                </div>
              </div>

              {/* Açıklama */}
              {selected.caption && (
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, margin: 0, flex: 1, color: 'var(--color-text)' }}>
                  <Caption text={selected.caption} clamp />
                </p>
              )}

              {/* Kayıt kaldır butonu */}
              <button
                onClick={removeBookmark}
                disabled={removing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: removing ? 'not-allowed' : 'pointer',
                  background: 'transparent',
                  border: '1.5px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                  transition: 'all 0.15s',
                  alignSelf: 'flex-start',
                  fontFamily: 'inherit',
                  opacity: removing ? 0.6 : 1,
                }}
                onMouseOver={e => {
                  if (!removing) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444';
                    (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
                  }
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                </svg>
                {removing ? 'Kaldırılıyor…' : 'Kaydı kaldır'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .bk-cell:hover img,
        .bk-cell:hover video { transform: scale(1.05); }
        .bk-cell:hover .bk-cell-overlay { opacity: 1 !important; }

        @media (max-width: 640px) {
          .bk-lb-box {
            flex-direction: column !important;
            border-radius: 20px 20px 0 0 !important;
            align-self: flex-end !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </main>
  );
}
