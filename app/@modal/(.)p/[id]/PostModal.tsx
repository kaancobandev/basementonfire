'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MediaCarousel from '@/app/components/MediaCarousel';
import Caption from '@/app/components/Caption';
import Img from '@/app/components/Img';
import { factMediaList } from '@/lib/types';
import { useIsMobile } from '@/lib/useIsMobile';
import ReportButton from '@/app/components/ReportButton';
import type { PostProp, DetailComment } from '@/app/p/[id]/postData';

interface CurrentUser { id: number; username: string; display_name: string; avatar: string | null; }
interface Props {
  post: PostProp;
  initialComments: DetailComment[];
  initialLiked: boolean;
  initialBookmarked: boolean;
  initialReposted: boolean;
  currentUser: CurrentUser | null;
}

function avatarBg(u: string) {
  const gs = ['linear-gradient(135deg,#6366f1,#8b5cf6)', 'linear-gradient(135deg,#ec4899,#8b5cf6)', 'linear-gradient(135deg,#f97316,#ef4444)', 'linear-gradient(135deg,#10b981,#3b82f6)', 'linear-gradient(135deg,#f59e0b,#f97316)', 'linear-gradient(135deg,#14b8a6,#06b6d4)', 'linear-gradient(135deg,#3b82f6,#6366f1)', 'linear-gradient(135deg,#ef4444,#f97316)'];
  let h = 0; for (const c of u) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return gs[Math.abs(h) % gs.length];
}
function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}sn`; if (s < 3600) return `${Math.floor(s / 60)}dk`; if (s < 86400) return `${Math.floor(s / 3600)}sa`; return `${Math.floor(s / 86400)}g`;
}

/**
 * Akış/profil/hashtag'ten bir gönderiye tıklayınca açılan iki-panelli modal.
 * URL /p/[id] olur (paylaşılabilir); kapatma router.back() ile geri gider.
 * Yenileme/derin-bağlantıda intercepting devre dışı kalır → tam /p/[id] sayfası.
 */
export default function PostModal({ post, initialComments, initialLiked, initialBookmarked, initialReposted, currentUser }: Props) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [liked, setLiked] = useState(initialLiked);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [reposted, setReposted] = useState(initialReposted);
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState<DetailComment[]>(initialComments);
  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<number | null>(null);

  const close = () => router.back();

  // Modal açıkken arka plan kaymasın; Escape kapatır.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') router.back(); }
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [router]);

  async function toggleLike() {
    const res = await fetch(`/api/quick-facts/${post.id}/like`, { method: 'POST' });
    if (res.status === 401) { window.location.href = '/login'; return; }
    const data = await res.json();
    if (!res.ok || typeof data.liked === 'undefined') return;
    setLiked(data.liked);
    setLikes(data.likes);
  }

  async function toggleBookmark() {
    if (!currentUser) { window.location.href = '/login'; return; }
    const prev = bookmarked;
    setBookmarked(!prev);
    try {
      const res = await fetch(`/api/quick-facts/${post.id}/bookmark`, { method: 'POST' });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const data = await res.json();
      if (!res.ok || typeof data.bookmarked === 'undefined') { setBookmarked(prev); return; }
      setBookmarked(data.bookmarked);
    } catch { setBookmarked(prev); }
  }

  async function toggleRepost() {
    if (!currentUser) { window.location.href = '/login'; return; }
    const prev = reposted;
    setReposted(!prev);
    try {
      const res = await fetch(`/api/quick-facts/${post.id}/repost`, { method: 'POST' });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const data = await res.json();
      if (!res.ok || typeof data.reposted === 'undefined') { setReposted(prev); return; }
      setReposted(data.reposted);
    } catch { setReposted(prev); }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!currentUser) { window.location.href = '/login'; return; }
    const body: any = { content: commentText.trim() };
    if (replyToId) body.parent_id = replyToId;
    setCommentText('');
    setReplyToId(null);
    const res = await fetch(`/api/quick-facts/${post.id}/comment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.comment) setComments(prev => [...prev, data.comment]);
  }

  async function deleteComment(id: number) {
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    if (res.ok) setComments(prev => prev.filter(c => c.id !== id));
  }

  const topComments = comments.filter(c => !c.parent_id);
  const repMap = new Map<number, DetailComment[]>();
  for (const c of comments) { if (c.parent_id) { if (!repMap.has(c.parent_id)) repMap.set(c.parent_id, []); repMap.get(c.parent_id)!.push(c); } }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) close(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.35 }}
        style={{ background: 'var(--color-surface)', borderRadius: 16, display: 'flex', flexDirection: isMobile ? 'column' : 'row', width: '100%', maxWidth: 860, height: '90vh', overflow: 'hidden', position: 'relative' }}
      >
        {/* Medya — kapat butonu sol üstte */}
        <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
          <motion.button
            onClick={close}
            whileTap={{ scale: 0.88 }}
            aria-label="Kapat"
            style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.55)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5, backdropFilter: 'blur(4px)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </motion.button>
          <MediaCarousel media={factMediaList(post)} caption={post.caption} sizes="(max-width:900px) 100vw, 860px" />
        </div>

        {/* Bilgi paneli */}
        <div style={{ width: isMobile ? '100%' : 300, maxHeight: isMobile ? '42%' : undefined, flexShrink: 0, display: 'flex', flexDirection: 'column', borderLeft: isMobile ? 'none' : '1px solid var(--color-border)', borderTop: isMobile ? '1px solid var(--color-border)' : 'none', minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
            <Link href={`/u/${post.username}`} style={{ width: 34, height: 34, borderRadius: '50%', background: avatarBg(post.username), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0, textDecoration: 'none', overflow: 'hidden' }}>
              {post.avatar ? <Img src={post.avatar} alt="" fixedWidth={68} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (post.display_name || post.username || '?')[0].toUpperCase()}
            </Link>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{post.display_name}</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>@{post.username}</div>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{timeAgo(post.created_at)}</span>
            <ReportButton targetType="post" targetId={post.id} subtitle={`@${post.username} gönderisi`} size={30} canReport={!!currentUser && currentUser.id !== post.user_id} />
          </div>
          {post.caption && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', flexShrink: 0, maxHeight: '40%', overflowY: 'auto' }}>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                <Caption text={post.caption} clamp />
              </p>
            </div>
          )}
          {/* Yorumlar */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0', display: 'flex', flexDirection: 'column' }}>
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 16px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Henüz yorum yok</div>
            ) : (
              topComments.map(c => (
                <div key={c.id}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 16px' }}>
                    <Link href={`/u/${c.username}`} style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', background: avatarBg(c.username), overflow: 'hidden' }}>{c.avatar ? <Img src={c.avatar} alt="" fixedWidth={52} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (c.display_name || '?')[0].toUpperCase()}</Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', marginRight: 4 }}>{c.display_name}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: 1.4, wordBreak: 'break-word' }}>{c.content}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{timeAgo(c.created_at)}</span>
                        <button onClick={() => { setReplyToId(c.id); setCommentText(`@${c.username} `); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', padding: '1px 0', fontFamily: 'inherit' }}>Yanıtla</button>
                        <ReportButton targetType="comment" targetId={c.id} subtitle={`@${c.username} yorumu`} variant="inline" canReport={!!currentUser && currentUser.id !== c.user_id} />
                      </div>
                    </div>
                    {currentUser?.id === c.user_id && (
                      <button onClick={() => deleteComment(c.id)} aria-label="Yorumu sil" className="hit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', padding: '2px 4px', borderRadius: 4, lineHeight: 1 }}>×</button>
                    )}
                  </div>
                  {(repMap.get(c.id) ?? []).map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 16px', marginLeft: 30, borderLeft: '2px solid var(--color-border)', paddingLeft: 10 }}>
                      <Link href={`/u/${r.username}`} style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none', background: avatarBg(r.username), overflow: 'hidden' }}>{r.avatar ? <Img src={r.avatar} alt="" fixedWidth={52} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (r.display_name || '?')[0].toUpperCase()}</Link>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', marginRight: 4 }}>{r.display_name}</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: 1.4, wordBreak: 'break-word' }}>{r.content}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{timeAgo(r.created_at)}</span>
                          <ReportButton targetType="comment" targetId={r.id} subtitle={`@${r.username} yorumu`} variant="inline" canReport={!!currentUser && currentUser.id !== r.user_id} />
                        </div>
                      </div>
                      {currentUser?.id === r.user_id && (
                        <button onClick={() => deleteComment(r.id)} aria-label="Yorumu sil" className="hit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', padding: '2px 4px', lineHeight: 1 }}>×</button>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
          {/* Yorum girişi */}
          {currentUser && (
            <form onSubmit={submitComment} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 700, background: avatarBg(currentUser.username), overflow: 'hidden' }}>{currentUser.avatar ? <Img src={currentUser.avatar} alt="" fixedWidth={52} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : currentUser.display_name[0].toUpperCase()}</div>
              <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder={replyToId ? '↩ yanıtlanıyor…' : 'Yorum ekle…'} maxLength={300} autoComplete="off" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', fontFamily: 'inherit', color: 'var(--color-text)', minWidth: 0 }} />
              {replyToId && <button type="button" onClick={() => { setReplyToId(null); setCommentText(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.75rem', fontFamily: 'inherit' }}>×</button>}
              <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: 4, display: 'flex', alignItems: 'center', opacity: commentText.trim() ? 1 : 0.4 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
              </button>
            </form>
          )}
          {/* Alt bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
            <motion.button onClick={toggleLike} whileTap={{ scale: 0.80 }} aria-label="Beğen"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', fontFamily: 'inherit', color: liked ? 'var(--color-danger)' : 'var(--color-text-muted)', transition: 'color 0.15s' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
              <span className="tnum">{likes}</span>
            </motion.button>
            <motion.button onClick={toggleRepost} whileTap={{ scale: 0.80 }} aria-label="Repost" title={reposted ? 'Repost geri al' : 'Repost'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: reposted ? '#22c55e' : 'var(--color-text-muted)', transition: 'color 0.15s' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 1 4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="m7 23-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
            </motion.button>
            <motion.button onClick={toggleBookmark} whileTap={{ scale: 0.80 }} aria-label="Kaydet"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: bookmarked ? 'var(--color-accent-ink)' : 'var(--color-text-muted)', transition: 'color 0.15s' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
            </motion.button>
            <Link href={`/p/${post.id}`} prefetch={false} style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--color-text-muted)', textDecoration: 'none' }}>{comments.length} yorum</Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
