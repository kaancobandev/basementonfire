'use client';

import Img from '@/app/components/Img';
import { avatarSrc } from '@/lib/avatar';
import MediaCarousel, { MultiBadge, AudioThumb, MusicBadge } from '@/app/components/MediaCarousel';
import { VideoThumb, PlayBadge } from '@/app/components/FeedVideo';
import { useIsMobile } from '@/lib/useIsMobile';
import { factMediaList } from '@/lib/types';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Caption from '@/app/components/Caption';
import ReportButton from '@/app/components/ReportButton';
import CollectionPicker from '@/app/components/CollectionPicker';
import { useAutoAnimate } from '@formkit/auto-animate/react';

interface Post {
  id: number;
  user_id: number;
  media_url: string;
  media_type: string;
  caption: string;
  likes: number;
  created_at: string;
  display_name: string;
  username: string;
  avatar: string | null;
  collectionId?: number | null;
  media?: { url: string; type: 'image' | 'video' }[] | null;
}

interface Props {
  initialPosts: Post[];
  meId?: number | null;
  collections?: { id: number; name: string }[];
  /** false = koleksiyon SQL'i henüz çalıştırılmadı → filtre şeridi hiç çizilmez. */
  collectionsEnabled?: boolean;
}

export default function BookmarksClient({ initialPosts, meId = null, collections = [], collectionsEnabled = false }: Props) {
  const isMobile = useIsMobile();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selected, setSelected] = useState<Post | null>(null);
  const [removing, setRemoving] = useState(false);
  const [gridRef] = useAutoAnimate<HTMLDivElement>();
  const [cols, setCols] = useState(collections);
  // 'all' = hepsi · 'none' = koleksiyonsuz · sayı = o koleksiyon
  const [filter, setFilter] = useState<'all' | 'none' | number>('all');
  const [pickerOpen, setPickerOpen] = useState(false);

  const visible = filter === 'all'
    ? posts
    : posts.filter(p => (filter === 'none' ? (p.collectionId ?? null) === null : p.collectionId === filter));
  const countOf = (f: 'all' | 'none' | number) =>
    f === 'all' ? posts.length
      : f === 'none' ? posts.filter(p => (p.collectionId ?? null) === null).length
        : posts.filter(p => p.collectionId === f).length;

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

      {/* Koleksiyon filtresi. Tüm kayıtlar zaten yüklü → filtreleme İSTEMCİDE,
          ek istek yok. Koleksiyonu olmayan kullanıcıda şerit hiç çıkmaz. */}
      {collectionsEnabled && cols.length > 0 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 14px', borderBottom: '1px solid var(--color-border)', scrollbarWidth: 'none' }} className="bk-chips">
          {([['all', 'Tümü'], ['none', 'Koleksiyonsuz']] as const).map(([val, label]) => (
            <Chip key={val} active={filter === val} onClick={() => setFilter(val)} label={label} count={countOf(val)} />
          ))}
          {cols.map(c => (
            <Chip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)} label={c.name} count={countOf(c.id)} />
          ))}
        </div>
      )}

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

      {/* Filtre boş — kayıt var ama bu koleksiyonda yok */}
      {posts.length > 0 && visible.length === 0 && (
        <p style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Bu koleksiyonda henüz kayıt yok.
        </p>
      )}

      {/* Grid — HÜCRE KARE (2026-08-01, önceden 3:4). Kayıtlar Instagram'da da
          karedir; profil ızgarasından (4:5) BİLEREK ayrı: burası kendi
          içeriğinin vitrini değil, karışık kaynaklı bir arşiv — kare ızgarada
          farklı oranlardan gelen gönderiler eşit ağırlıkta görünüyor. */}
      {visible.length > 0 && (
        <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, padding: 3 }}>
          {visible.map(post => (
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
                <>
                  <VideoThumb
                    src={post.media_url}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.2s' }}
                  />
                  <PlayBadge />
                </>
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
          <div style={{ background: 'var(--color-surface)', borderRadius: 16, display: 'flex', flexDirection: isMobile ? 'column' : 'row', maxWidth: 820, width: '100%', height: '90vh', overflow: 'hidden', position: 'relative' }}>
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
            <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
              <MediaCarousel media={factMediaList(selected)} caption={selected.caption} sizes="(max-width:900px) 100vw, 860px" />
            </div>

            {/* Bilgi paneli */}
            <div style={{ width: isMobile ? '100%' : 260, maxHeight: isMobile ? '42%' : undefined, flexShrink: 0, borderLeft: isMobile ? 'none' : '1px solid var(--color-border)', borderTop: isMobile ? '1px solid var(--color-border)' : 'none', display: 'flex', flexDirection: 'column', padding: 16, gap: 14, minHeight: 0 }}>
              {/* Kullanıcı satırı */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link
                  href={`/u/${selected.username}`}
                  onClick={closeLightbox}
                  style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, textDecoration: 'none', overflow: 'hidden' }}
                >
                  <Img src={avatarSrc(selected.username, selected.avatar)} alt="" fixedWidth={72} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                <ReportButton targetType="post" targetId={selected.id} subtitle={`@${selected.username} gönderisi`} size={30} canReport={!!meId && meId !== selected.user_id} />
              </div>

              {/* Açıklama */}
              {selected.caption && (
                <p style={{ fontSize: '0.88rem', lineHeight: 1.6, margin: 0, flex: 1, minHeight: 0, overflowY: 'auto', color: 'var(--color-text)' }}>
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

              {/* Koleksiyona taşı — mevcut koleksiyon işaretli açılır. */}
              {collectionsEnabled && (
                <button
                  onClick={() => setPickerOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: '9999px', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', background: 'transparent', border: '1.5px solid var(--color-border)', color: 'var(--color-text-muted)', alignSelf: 'flex-start', fontFamily: 'inherit' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
                  {cols.find(c => c.id === selected.collectionId)?.name ?? 'Koleksiyona ekle'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Kaydın koleksiyonunu değiştir. Lightbox açıkken monte edilir ki
          `selected` kesin dolu olsun ve mevcut koleksiyon işaretli gelsin. */}
      {selected && (
        <CollectionPicker
          postId={selected.id}
          open={pickerOpen}
          currentCollectionId={selected.collectionId ?? null}
          onClose={() => setPickerOpen(false)}
          onSaved={(collectionId, name) => {
            setPosts(prev => prev.map(p => (p.id === selected.id ? { ...p, collectionId } : p)));
            setSelected(prev => (prev ? { ...prev, collectionId } : prev));
            // Picker'da yeni açılan koleksiyon şeritte de görünsün.
            if (collectionId != null && name && !cols.some(c => c.id === collectionId)) {
              setCols(prev => [...prev, { id: collectionId, name }]);
            }
          }}
        />
      )}

      <style>{`
        .bk-chips::-webkit-scrollbar { display: none; }
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

/** Koleksiyon filtre çipi — ad + kayıt sayısı. */
function Chip({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick} aria-pressed={active}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, cursor: 'pointer', fontFamily: 'inherit',
        padding: '7px 13px', borderRadius: 9999, fontSize: '0.82rem', fontWeight: 700,
        border: active ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
        background: active ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : 'transparent',
        color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <span className="tnum" style={{ opacity: 0.7 }}>{count}</span>
    </button>
  );
}
