'use client';

import Img from '@/app/components/Img';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { QuickFact } from '@/lib/types';
import { factMediaList } from '@/lib/types';
import { MultiBadge, AudioThumb, MusicBadge } from '@/app/components/MediaCarousel';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { celebrate } from '@/lib/confetti';
import { uploadToStorage, measureMediaDims } from '@/lib/upload';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useIsMobile } from '@/lib/useIsMobile';
import dynamic from 'next/dynamic';

const ImageCropper = dynamic(() => import('@/app/components/ImageCropper'), { ssr: false });

interface CurrentUser { id: number; username: string; display_name: string; }

interface Props {
  initialPosts: QuickFact[];
  initialNextCursor: number | null;
  initialHasMore: boolean;
  currentUser: CurrentUser | null;
}

export default function AkisClient({ initialPosts, initialNextCursor, initialHasMore, currentUser }: Props) {
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [posts, setPosts] = useState<QuickFact[]>(initialPosts);
  const [nextCursor, setNextCursor] = useState<number | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [pendingNew, setPendingNew] = useState(0);

  // Upload modal
  const [uploadOpen, setUploadOpen] = useState(false);
  const [items, setItems] = useState<{ id: number; file: File; url: string; type: 'image' | 'video' | 'audio' }[]>([]);
  const [audioItems, setAudioItems] = useState<{ id: number; file: File; url: string; type: 'image' | 'video' | 'audio' }[]>([]);
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [uploadError, setUploadError] = useState('');
  const nextMediaId = useRef(1);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [gridRef] = useAutoAnimate<HTMLDivElement>();

  // Open upload modal from ?create=1
  useEffect(() => {
    if (searchParams.get('create') === '1') setUploadOpen(true);
  }, [searchParams]);

  // Infinite scroll
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !nextCursor) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/feed?cursor=${encodeURIComponent(nextCursor)}&limit=12`);
      const data = await res.json();
      setPosts(prev => [...prev, ...data.posts]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, nextCursor]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: '200px' });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  // File handling (çoklu — en fazla 20)
  function addFiles(files: File[]) {
    if (!files.length) return;
    const room = 20 - (items.length + audioItems.length + cropQueue.length);
    if (room <= 0) { setUploadError('En fazla 20 dosya ekleyebilirsin.'); return; }
    const accepted = files.slice(0, room);
    const toCrop: File[] = [];
    const readyMedia: { id: number; file: File; url: string; type: 'image' | 'video' | 'audio' }[] = [];
    const readyAudio: { id: number; file: File; url: string; type: 'image' | 'video' | 'audio' }[] = [];
    for (const f of accepted) {
      // Ses → ayrı alan; statik görsel → kırpma; GIF + video → medya
      if (f.type.startsWith('audio/')) readyAudio.push({ id: nextMediaId.current++, file: f, url: URL.createObjectURL(f), type: 'audio' });
      else if (f.type.startsWith('image/') && f.type !== 'image/gif') toCrop.push(f);
      else readyMedia.push({ id: nextMediaId.current++, file: f, url: URL.createObjectURL(f), type: f.type.startsWith('video/') ? 'video' : 'image' });
    }
    if (readyMedia.length) setItems(prev => [...prev, ...readyMedia]);
    if (readyAudio.length) {
      const keep = readyAudio[readyAudio.length - 1];                  // tek müzik: en yenisi kalır
      readyAudio.slice(0, -1).forEach(p => URL.revokeObjectURL(p.url));
      setAudioItems(prev => { prev.forEach(p => URL.revokeObjectURL(p.url)); return [keep]; });
    }
    if (toCrop.length) setCropQueue(prev => [...prev, ...toCrop]);
    setUploadError(files.length > room ? 'En fazla 20 dosya — fazlası atlandı.' : '');
  }
  function onCropped(f: File) {
    setItems(prev => [...prev, { id: nextMediaId.current++, file: f, url: URL.createObjectURL(f), type: 'image' }]);
    setCropQueue(prev => prev.slice(1));
  }
  function removeItem(id: number) {
    setItems(prev => { const it = prev.find(p => p.id === id); if (it) URL.revokeObjectURL(it.url); return prev.filter(p => p.id !== id); });
  }
  function removeAudio(id: number) {
    setAudioItems(prev => { const it = prev.find(p => p.id === id); if (it) URL.revokeObjectURL(it.url); return prev.filter(p => p.id !== id); });
  }
  function clearFile() {
    setItems(prev => { prev.forEach(p => URL.revokeObjectURL(p.url)); return []; });
    setAudioItems(prev => { prev.forEach(p => URL.revokeObjectURL(p.url)); return []; });
    setCropQueue([]);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if ((!items.length && !audioItems.length) || !caption.trim()) { setUploadError('Lütfen en az bir dosya ve açıklama ekle.'); return; }
    const all = [...items, ...audioItems];
    setUploading(true);
    setUploadProgress({ done: 0, total: all.length });
    try {
      const media: { path: string; mediaType: 'image' | 'video' | 'audio'; w?: number; h?: number }[] = [];
      for (let i = 0; i < all.length; i++) {
        // Boyutu yüklemeden önce ölç (CLS: w/h kayda yazılır, feed oranı SSR'da basılır)
        const dims = await measureMediaDims(all[i].file);
        const up = await uploadToStorage(all[i].file, 'media');
        media.push({ path: up.path, mediaType: up.mediaType, ...(dims ?? {}) });
        setUploadProgress({ done: i + 1, total: all.length });
      }
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media, caption }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Yükleme başarısız');
      celebrate();
      setUploadOpen(false);
      clearFile();
      setCaption('');
      // Reload feed
      const feedRes = await fetch('/api/feed?limit=12');
      const feedData = await feedRes.json();
      setPosts(feedData.posts);
      setNextCursor(feedData.nextCursor);
      setHasMore(feedData.hasMore);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }

  // Escape ile yükleme modalını kapat (gönderi modalı artık /p/[id] route'unda)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && uploadOpen) setUploadOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [uploadOpen]);

  return (
    <>
      <main className="main-content" style={{ position: 'relative' }}>
        <div className="feed-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Akış</span>
          <button onClick={() => setUploadOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '9999px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            Yeni Paylaş
          </button>
        </div>

        {/* New posts banner */}
        {pendingNew > 0 && (
          <div style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'center', padding: 8, background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
            <button onClick={async () => {
              setPendingNew(0);
              const res = await fetch('/api/feed?limit=12');
              const data = await res.json();
              setPosts(data.posts); setNextCursor(data.nextCursor); setHasMore(data.hasMore);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-accent)', color: '#0f0e0d', border: 'none', borderRadius: '9999px', padding: '8px 20px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(212,165,100,0.35)', animation: 'bar-in 0.3s ease' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
              {pendingNew === 1 ? 'Yeni gönderi var' : `${pendingNew} yeni gönderi var`}
            </button>
          </div>
        )}

        {/* Grid */}
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📸</div>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Henüz içerik yok</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>İlk gönderini paylaşmak için "Yeni Paylaş" butonuna bas.</p>
          </div>
        ) : (
          <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 3 : 4}, 1fr)`, gap: 2, padding: 2 }}>
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/p/${post.id}`}
                style={{ aspectRatio: '1', position: 'relative', overflow: 'hidden', background: 'var(--color-border)', cursor: 'pointer', display: 'block' }}
                className="hb-cell"
              >
                {post.media_type === 'audio'
                  ? <AudioThumb />
                  : post.media_type === 'image'
                  ? <Img src={post.media_url} alt={post.caption} loading="lazy" sizes="(max-width:700px) 33vw, 240px" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.25s' }} />
                  : <video src={post.media_url} muted preload="none" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                }
                {factMediaList(post).filter(m => m.type !== 'audio').length > 1 && <MultiBadge />}
                {post.media_type !== 'audio' && factMediaList(post).some(m => m.type === 'audio') && <MusicBadge />}
                <div className="hb-cell-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, opacity: 0, transition: 'opacity 0.2s' }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    {post.likes}
                  </span>
                  {post.media_type === 'video' && (
                    <span style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: '2px 4px', display: 'flex' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Sentinel */}
        <div ref={sentinelRef} style={{ padding: '24px 0 48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
              <div style={{ width: 28, height: 28, border: '3px solid rgba(212,165,100,0.2)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
          )}
          {!hasMore && posts.length > 0 && <p style={{ fontSize: '0.82rem', color: '#666', margin: 0, textAlign: 'center' }}>Tüm gönderiler yüklendi</p>}
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes bar-in { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
          .hb-cell:hover img, .hb-cell:hover video { transform: scale(1.04); }
          .hb-cell:hover .hb-cell-overlay { opacity: 1 !important; }
        `}</style>
      </main>

      {/* Upload Modal */}
      <AnimatePresence>
      {uploadOpen && (
        <motion.div
          key="upload-bg"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) { setUploadOpen(false); clearFile(); } }}
        >
          <motion.div
            key="upload-box"
            initial={{ opacity: 0, scale: 0.94, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            style={{ background: 'var(--color-surface)', borderRadius: 20, width: '100%', maxWidth: 480, padding: 20, maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Yeni Paylaşım</span>
              <button onClick={() => { setUploadOpen(false); clearFile(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: 6, borderRadius: '50%' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleUpload}>
              <input id="akis-media-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" hidden multiple onChange={e => { addFiles(Array.from(e.target.files ?? [])); (e.currentTarget as HTMLInputElement).value = ''; }} />
              {items.length === 0 ? (
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Medya seç"
                  style={{ border: '2px dashed var(--color-border)', borderRadius: 16, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.15s', textAlign: 'center', overflow: 'hidden', position: 'relative' }}
                  onClick={() => document.getElementById('akis-media-input')?.click()}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('akis-media-input')?.click(); } }}
                  onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; }}
                  onDragLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
                  onDrop={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; addFiles(Array.from(e.dataTransfer.files)); }}
                >
                  <div><div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🖼️</div><p style={{ fontWeight: 600, marginBottom: 4 }}>Resim veya video seç</p><p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Tıkla veya sürükle · en fazla 20 · JPG PNG WEBP GIF MP4 · Max 100 MB</p></div>
                </div>
              ) : (
                <div
                  style={{ border: '1px solid var(--color-border)', borderRadius: 16, padding: 10 }}
                  onDragOver={e => { e.preventDefault(); }}
                  onDrop={e => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files)); }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{items.length} fotoğraf/video</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>İlk öğe kapak</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                    {items.map((it, i) => (
                      <div key={it.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: '#000', border: i === 0 ? '2px solid var(--color-primary)' : '1px solid var(--color-border)' }}>
                        {it.type === 'audio'
                          ? <AudioThumb />
                          : it.type === 'video'
                          ? <video src={it.url} muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          : <img src={it.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                        <button type="button" onClick={() => removeItem(it.id)} aria-label="Kaldır" style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                    ))}
                    {(items.length + audioItems.length + cropQueue.length) < 20 && (
                      <button type="button" onClick={() => document.getElementById('akis-media-input')?.click()} aria-label="Ekle" style={{ aspectRatio: '1', borderRadius: 10, border: '2px dashed var(--color-border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Ses dosyası — kendi alanı */}
              <input id="akis-audio-input" type="file" accept="audio/*" hidden multiple onChange={e => { addFiles(Array.from(e.target.files ?? [])); (e.currentTarget as HTMLInputElement).value = ''; }} />
              <button type="button" onClick={() => document.getElementById('akis-audio-input')?.click()} disabled={(items.length + audioItems.length + cropQueue.length) >= 20} style={{ marginTop: 12, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1.5px dashed var(--color-border)', borderRadius: 12, padding: '11px 14px', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                {audioItems.length ? 'Müziği değiştir' : 'Ses / müzik ekle'}
              </button>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '6px 2px 0' }}>Arka planda çalar; sağ alttaki düğmeyle ses aç/kapat.</p>
              {audioItems.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                  {audioItems.map(a => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
                      <span style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#312e81,#4c1d95)', color: '#fff' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.file.name}</div>
                        <audio src={a.url} controls style={{ width: '100%', height: 30, marginTop: 4 }} />
                      </div>
                      <button type="button" onClick={() => removeAudio(a.id)} aria-label="Kaldır" style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.1)', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadError && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '8px 0 0' }}>{uploadError}</p>}

              <div style={{ marginTop: 16 }}>
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Hızlı bir bilgi yaz... (max 10000 karakter)"
                  maxLength={10000}
                  required
                  style={{ width: '100%', border: '1px solid var(--color-border)', borderRadius: 12, padding: '12px 14px', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', minHeight: 88, outline: 'none', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}
                />
                <div style={{ textAlign: 'right', fontSize: '0.78rem', color: caption.length > 9900 ? '#ef4444' : 'var(--color-text-muted)', marginTop: 4 }}>{caption.length} / 10000</div>
              </div>

              <button type="submit" disabled={uploading || (items.length === 0 && audioItems.length === 0)} className="post-btn" style={{ marginTop: 16, width: '100%', opacity: (items.length || audioItems.length) ? 1 : 0.6 }}>
                {uploading ? (uploadProgress ? `Yükleniyor ${uploadProgress.done}/${uploadProgress.total}` : 'Yükleniyor...') : 'Paylaş'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>


      {cropQueue.length > 0 && (
        <ImageCropper
          key={`${cropQueue.length}-${items.length}`}
          file={cropQueue[0]}
          onCancel={() => setCropQueue(prev => prev.slice(1))}
          onCropped={onCropped}
        />
      )}
    </>
  );
}
