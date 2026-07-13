'use client';

import Img from '@/app/components/Img';
import { avatarSrc } from '@/lib/avatar';
import MediaCarousel, { MultiBadge, AudioThumb, MusicBadge } from '@/app/components/MediaCarousel';
import { useIsMobile } from '@/lib/useIsMobile';
import { factMediaList } from '@/lib/types';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Caption from '@/app/components/Caption';
import ReportButton from '@/app/components/ReportButton';

interface Post {
  id: number; user_id: number; media_url: string; media_type: string;
  caption: string; likes: number; created_at: string;
  display_name: string; username: string; avatar: string;
  media?: { url: string; type: 'image' | 'video' }[] | null;
}

interface Props { tag: string; posts: Post[]; related?: { tag: string; count: number }[]; meId?: number | null; }

export default function HashtagClient({ tag, posts, related = [], meId = null }: Props) {
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<Post | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && selected) closeLb();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  function openLb(post: Post) {
    setSelected(post);
    document.body.style.overflow = 'hidden';
  }

  function closeLb() {
    setSelected(null);
    document.body.style.overflow = '';
  }

  return (
    <main className="main-content">
      {/* Başlık */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 16px 14px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--color-accent-soft)', color: 'var(--color-accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/>
            <line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 2px', overflowWrap: 'anywhere' }}>#{tag}</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
            {posts.length} gönderi
          </p>
        </div>
      </div>

      {/* İlgili etiketler — konu kümesi iç bağlantıları */}
      {related.length > 0 && (
        <nav aria-label="İlgili etiketler" style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
            İlgili etiketler
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {related.map(r => (
              <Link
                key={r.tag}
                href={`/hashtag/${r.tag}`}
                className="ht-related-chip"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 9999, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                <span style={{ color: 'var(--color-accent-ink)' }}>#</span>{r.tag}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Boş durum */}
      {posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>#</div>
          <p style={{ fontWeight: 700, marginBottom: 6, margin: '0 0 6px' }}>Henüz gönderi yok</p>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>Bu hashtag hiçbir gönderide kullanılmamış.</p>
          <Link href="/" style={{ display: 'inline-block', marginTop: 16, fontSize: '0.88rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Ana sayfaya dön →
          </Link>
        </div>
      )}

      {/* Grid */}
      {posts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, padding: 3 }}>
          {posts.map(post => (
            <button
              key={post.id}
              onClick={() => openLb(post)}
              aria-label={post.caption}
              style={{ aspectRatio: '1', overflow: 'hidden', background: 'var(--color-border)', border: 'none', padding: 0, cursor: 'pointer', position: 'relative', display: 'block' }}
              className="ht-cell"
            >
              {post.media_type === 'audio' ? (
                <AudioThumb />
              ) : post.media_type === 'image' ? (
                <Img src={post.media_url} alt={post.caption} loading="lazy" decoding="async"
                  sizes="(max-width:700px) 33vw, 240px"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.2s' }} />
              ) : (
                <video src={post.media_url} muted preload="metadata"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.2s' }} />
              )}
              {/* Hover overlay */}
              {factMediaList(post).filter(m => m.type !== 'audio').length > 1 && <MultiBadge />}
              {post.media_type !== 'audio' && factMediaList(post).some(m => m.type === 'audio') && <MusicBadge />}
              <div className="ht-cell-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s' }}>
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
          onClick={e => { if (e.target === e.currentTarget) closeLb(); }}
        >
          <div style={{ background: 'var(--color-surface)', borderRadius: 16, display: 'flex', flexDirection: isMobile ? 'column' : 'row', maxWidth: 820, width: '100%', height: '90vh', overflow: 'hidden', position: 'relative' }}>
            {/* Kapat */}
            <button
              onClick={closeLb}
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 1, background: 'rgba(0,0,0,0.45)', border: 'none', color: 'white', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>

            {/* Medya */}
            <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
              <MediaCarousel media={factMediaList(selected)} caption={selected.caption} sizes="(max-width:900px) 100vw, 860px" />
            </div>

            {/* Bilgi paneli */}
            <div style={{ width: isMobile ? '100%' : 260, maxHeight: isMobile ? '42%' : undefined, flexShrink: 0, borderLeft: isMobile ? 'none' : '1px solid var(--color-border)', borderTop: isMobile ? '1px solid var(--color-border)' : 'none', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
              {/* Kullanıcı */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link
                  href={`/u/${selected.username}`}
                  onClick={closeLb}
                  style={{ width: 36, height: 36, borderRadius: '50%', textDecoration: 'none', overflow: 'hidden', flexShrink: 0 }}
                >
                  <Img src={avatarSrc(selected.username, selected.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    href={`/u/${selected.username}`}
                    onClick={closeLb}
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
                <ReportButton targetType="post" targetId={selected.id} subtitle={`@${selected.username} gönderisi`} size={30} canReport={!!meId && meId !== selected.user_id} />
              </div>

              {/* Caption — hashtag ve mention linkleri */}
              {selected.caption && (
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, margin: 0, wordBreak: 'break-word', color: 'var(--color-text)', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  <Caption text={selected.caption} clamp />
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ht-cell:hover img, .ht-cell:hover video { transform: scale(1.05); }
        .ht-cell:hover .ht-cell-overlay { opacity: 1 !important; }
        .ht-related-chip:hover { border-color: var(--color-primary); color: var(--color-primary); }
        @media (max-width: 640px) {
          div[style*="max-width: 820px"] {
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
