'use client';

import Img from '@/app/components/Img';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { QuickFact } from '@/lib/types';
import { factMediaList } from '@/lib/types';
import MediaCarousel, { MultiBadge, AudioThumb, MusicBadge } from '@/app/components/MediaCarousel';
import Link from 'next/link';
import Caption from '@/app/components/Caption';
import { motion, AnimatePresence } from 'framer-motion';
import { celebrate } from '@/lib/confetti';
import { uploadToStorage } from '@/lib/upload';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useIsMobile } from '@/lib/useIsMobile';
import dynamic from 'next/dynamic';

const ImageCropper = dynamic(() => import('@/app/components/ImageCropper'), { ssr: false });

interface CurrentUser { id: number; username: string; display_name: string; }
interface Comment { id: number; parent_id: number | null; user_id: number; content: string; created_at: string; display_name: string; username: string; }

interface Props {
  initialPosts: QuickFact[];
  initialNextCursor: number | null;
  initialHasMore: boolean;
  currentUser: CurrentUser | null;
}

function avatarBg(u: string) {
  const gs = ['linear-gradient(135deg,#6366f1,#8b5cf6)','linear-gradient(135deg,#ec4899,#8b5cf6)','linear-gradient(135deg,#f97316,#ef4444)','linear-gradient(135deg,#10b981,#3b82f6)','linear-gradient(135deg,#f59e0b,#f97316)','linear-gradient(135deg,#14b8a6,#06b6d4)','linear-gradient(135deg,#3b82f6,#6366f1)','linear-gradient(135deg,#ef4444,#f97316)'];
  let h = 0; for (const c of u) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return gs[Math.abs(h) % gs.length];
}
function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}sn`; if (s < 3600) return `${Math.floor(s/60)}dk`; if (s < 86400) return `${Math.floor(s/3600)}sa`; return `${Math.floor(s/86400)}g`;
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

  // Detail modal
  const [detail, setDetail] = useState<QuickFact | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [cmLoading, setCmLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [detailLikes, setDetailLikes] = useState(0);
  const [replyToId, setReplyToId] = useState<number | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [gridRef] = useAutoAnimate<HTMLDivElement>();
  const [commentsRef] = useAutoAnimate<HTMLDivElement>();

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
      const media: { path: string; mediaType: 'image' | 'video' | 'audio' }[] = [];
      for (let i = 0; i < all.length; i++) {
        const up = await uploadToStorage(all[i].file, 'media');
        media.push({ path: up.path, mediaType: up.mediaType });
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

  // Detail modal
  async function openDetail(post: QuickFact) {
    setDetail(post);
    setLiked(false);
    setBookmarked(false);
    setDetailLikes(post.likes);
    document.body.style.overflow = 'hidden';
    setCmLoading(true);
    setComments([]);
    // Check bookmark
    if (currentUser) {
      fetch(`/api/quick-facts/${post.id}/bookmark`).then(r => r.json()).then(d => setBookmarked(d.bookmarked ?? false)).catch(() => {});
    }
    try {
      const res = await fetch(`/api/quick-facts/${post.id}/comments`);
      const data = await res.json();
      setComments(data.comments ?? []);
    } finally {
      setCmLoading(false);
    }
  }

  function closeDetail() {
    setDetail(null);
    document.body.style.overflow = '';
    setCommentText('');
    setReplyToId(null);
  }

  async function toggleLike() {
    if (!detail) return;
    const res = await fetch(`/api/quick-facts/${detail.id}/like`, { method: 'POST' });
    if (res.status === 401) { window.location.href = '/login'; return; }
    const data = await res.json();
    setLiked(data.liked);
    setDetailLikes(data.likes);
    setPosts(prev => prev.map(p => p.id === detail.id ? { ...p, likes: data.likes } : p));
  }

  async function toggleBookmark() {
    if (!detail) return;
    if (!currentUser) { window.location.href = '/login'; return; }
    const prev = bookmarked;
    setBookmarked(!prev);
    const res = await fetch(`/api/quick-facts/${detail.id}/bookmark`, { method: 'POST' });
    const data = await res.json();
    setBookmarked(data.bookmarked ?? !prev);
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!detail || !commentText.trim()) return;
    if (!currentUser) { window.location.href = '/login'; return; }
    const body: any = { content: commentText.trim() };
    if (replyToId) body.parent_id = replyToId;
    setCommentText('');
    setReplyToId(null);
    const res = await fetch(`/api/quick-facts/${detail.id}/comment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.comment) setComments(prev => [...prev, data.comment]);
  }

  async function deleteComment(id: number) {
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    if (res.ok) setComments(prev => prev.filter(c => c.id !== id));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { if (detail) closeDetail(); if (uploadOpen) setUploadOpen(false); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detail, uploadOpen]);

  const topComments = comments.filter(c => !c.parent_id);
  const repMap = new Map<number, Comment[]>();
  for (const c of comments) { if (c.parent_id) { if (!repMap.has(c.parent_id)) repMap.set(c.parent_id, []); repMap.get(c.parent_id)!.push(c); } }

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
            }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#d4a564', color: '#0f0e0d', border: 'none', borderRadius: '9999px', padding: '8px 20px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(212,165,100,0.35)', animation: 'bar-in 0.3s ease' }}>
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
              <button
                key={post.id}
                onClick={() => openDetail(post)}
                style={{ aspectRatio: '1', position: 'relative', overflow: 'hidden', background: 'var(--color-border)', border: 'none', padding: 0, cursor: 'pointer', display: 'block' }}
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
              </button>
            ))}
          </div>
        )}

        {/* Sentinel */}
        <div ref={sentinelRef} style={{ padding: '24px 0 48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
              <div style={{ width: 28, height: 28, border: '3px solid rgba(212,165,100,0.2)', borderTopColor: '#d4a564', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
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
                  style={{ border: '2px dashed var(--color-border)', borderRadius: 16, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.15s', textAlign: 'center', overflow: 'hidden', position: 'relative' }}
                  onClick={() => document.getElementById('akis-media-input')?.click()}
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

      {/* Detail Modal */}
      <AnimatePresence>
      {detail && (
        <motion.div
          key="detail-bg"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) closeDetail(); }}
        >
          <motion.div
            key="detail-box"
            initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', duration: 0.35 }}
            style={{ background: 'var(--color-surface)', borderRadius: 16, display: 'flex', flexDirection: isMobile ? 'column' : 'row', width: '100%', maxWidth: 860, height: '90vh', overflow: 'hidden', position: 'relative' }}
          >
            {/* Media — kapat butonu medya alanının sol üstünde */}
            <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
              <motion.button
                onClick={closeDetail}
                whileTap={{ scale: 0.88 }}
                style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.55)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5, backdropFilter: 'blur(4px)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </motion.button>
              <MediaCarousel media={factMediaList(detail)} caption={detail.caption} sizes="(max-width:900px) 100vw, 860px" />
            </div>
            {/* Info panel */}
            <div style={{ width: isMobile ? '100%' : 300, maxHeight: isMobile ? '42%' : undefined, flexShrink: 0, display: 'flex', flexDirection: 'column', borderLeft: isMobile ? 'none' : '1px solid var(--color-border)', borderTop: isMobile ? '1px solid var(--color-border)' : 'none', minHeight: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
                <Link href={`/u/${detail.username}`} style={{ width: 34, height: 34, borderRadius: '50%', background: avatarBg(detail.username), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, textDecoration: 'none' }}>
                  {detail.display_name[0].toUpperCase()}
                </Link>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{detail.display_name}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>@{detail.username}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{timeAgo(detail.created_at)}</div>
              </div>
              {detail.caption && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', flexShrink: 0, maxHeight: '40%', overflowY: 'auto' }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    <Caption text={detail.caption} clamp />
                  </p>
                </div>
              )}
              {/* Comments */}
              <div ref={commentsRef} style={{ flex: 1, overflowY: 'auto', padding: '4px 0', display: 'flex', flexDirection: 'column' }}>
                {cmLoading ? (
                  <div style={{ textAlign: 'center', padding: '24px 16px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Yükleniyor…</div>
                ) : comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 16px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Henüz yorum yok</div>
                ) : (
                  <>
                    {topComments.map(c => (
                      <>
                        <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 16px' }}>
                          <Link href={`/u/${c.username}`} style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', background: avatarBg(c.username) }}>{c.display_name[0].toUpperCase()}</Link>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.8rem', marginRight: 4 }}>{c.display_name}</span>
                            <span style={{ fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: 1.4, wordBreak: 'break-word' }}>{c.content}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{timeAgo(c.created_at)}</span>
                              <button onClick={() => { setReplyToId(c.id); setCommentText(`@${c.username} `); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', padding: '1px 0', fontFamily: 'inherit' }}>Yanıtla</button>
                            </div>
                          </div>
                          {currentUser?.id === c.user_id && (
                            <button onClick={() => deleteComment(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', padding: '2px 4px', borderRadius: 4, lineHeight: 1 }}>×</button>
                          )}
                        </div>
                        {(repMap.get(c.id) ?? []).map(r => (
                          <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 16px', marginLeft: 30, borderLeft: '2px solid var(--color-border)', paddingLeft: 10 }}>
                            <Link href={`/u/${r.username}`} style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', background: avatarBg(r.username) }}>{r.display_name[0].toUpperCase()}</Link>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ fontWeight: 700, fontSize: '0.8rem', marginRight: 4 }}>{r.display_name}</span>
                              <span style={{ fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: 1.4, wordBreak: 'break-word' }}>{r.content}</span>
                              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{timeAgo(r.created_at)}</span>
                            </div>
                            {currentUser?.id === r.user_id && (
                              <button onClick={() => deleteComment(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', padding: '2px 4px', lineHeight: 1 }}>×</button>
                            )}
                          </div>
                        ))}
                      </>
                    ))}
                  </>
                )}
              </div>
              {/* Comment input */}
              {currentUser && (
                <form onSubmit={submitComment} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 700, background: avatarBg(currentUser.username) }}>{currentUser.display_name[0].toUpperCase()}</div>
                  <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder={replyToId ? '↩ yanıtlanıyor…' : 'Yorum ekle…'} maxLength={300} autoComplete="off" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', fontFamily: 'inherit', color: 'var(--color-text)', minWidth: 0 }} />
                  {replyToId && <button type="button" onClick={() => { setReplyToId(null); setCommentText(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.75rem', fontFamily: 'inherit' }}>×</button>}
                  <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: 4, display: 'flex', alignItems: 'center', opacity: commentText.trim() ? 1 : 0.4 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  </button>
                </form>
              )}
              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
                <motion.button
                  onClick={toggleLike}
                  whileTap={{ scale: 0.80 }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', fontFamily: 'inherit', color: liked ? '#ef4444' : 'var(--color-text-muted)', transition: 'color 0.15s' }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={liked ? 'lf' : 'le'} initial={{ scale: 0.5, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.5 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} style={{ display: 'flex' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    </motion.span>
                  </AnimatePresence>
                  <motion.span key={detailLikes} initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }}>{detailLikes}</motion.span>
                </motion.button>
                <motion.button
                  onClick={toggleBookmark}
                  whileTap={{ scale: 0.80 }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: bookmarked ? '#d4a564' : 'var(--color-text-muted)', transition: 'color 0.15s' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                </motion.button>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{comments.length} yorum</span>
              </div>
            </div>
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
