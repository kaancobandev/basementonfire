'use client';

import { useState } from 'react';
import Link from 'next/link';
import Caption from '@/app/components/Caption';
import MediaCarousel from '@/app/components/MediaCarousel';
import Img from '@/app/components/Img';
import { factMediaList } from '@/lib/types';
import ReportButton from '@/app/components/ReportButton';
import CommentLikeButton from '@/app/components/CommentLikeButton';
import { avatarSrc } from '@/lib/avatar';

interface PostProp {
  id: number; user_id: number; caption: string; media_url: string; media_type: string; media: unknown;
  likes: number; created_at: string; username: string; display_name: string; avatar: string | null;
}
interface CommentT {
  id: number; parent_id: number | null; user_id: number; content: string; created_at: string;
  username: string; display_name: string; avatar: string | null;
  likes?: number; liked?: boolean;
}
interface CurrentUser { id: number; username: string; display_name: string; }

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}sn`; if (s < 3600) return `${Math.floor(s / 60)}dk`; if (s < 86400) return `${Math.floor(s / 3600)}sa`; return `${Math.floor(s / 86400)}g`;
}

const Avatar = ({ username, avatar, size }: { username: string; display_name: string; avatar: string | null; size: number }) => (
  <span style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden' }}>
    <Img src={avatarSrc(username, avatar)} alt="" fixedWidth={128} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  </span>
);

export default function PostDetailClient({ post, initialComments, commentLikesEnabled, initialLiked, initialBookmarked, initialReposted, currentUser }: {
  post: PostProp; initialComments: CommentT[]; commentLikesEnabled: boolean; initialLiked: boolean; initialBookmarked: boolean; initialReposted: boolean; currentUser: CurrentUser | null;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(post.likes);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [reposted, setReposted] = useState(initialReposted);
  const [comments, setComments] = useState<CommentT[]>(initialComments);
  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  async function toggleLike() {
    if (!currentUser) { window.location.href = '/login'; return; }
    const res = await fetch(`/api/quick-facts/${post.id}/like`, { method: 'POST' });
    if (res.status === 401) { window.location.href = '/login'; return; }
    const d = await res.json();
    if (!res.ok || typeof d.liked === 'undefined') return;
    setLiked(d.liked); setLikes(d.likes);
  }
  async function toggleBookmark() {
    if (!currentUser) { window.location.href = '/login'; return; }
    const prev = bookmarked; setBookmarked(!prev);
    try {
      const res = await fetch(`/api/quick-facts/${post.id}/bookmark`, { method: 'POST' });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const d = await res.json();
      if (!res.ok || typeof d.bookmarked === 'undefined') { setBookmarked(prev); return; }
      setBookmarked(d.bookmarked);
    } catch { setBookmarked(prev); }
  }
  async function toggleRepost() {
    if (!currentUser) { window.location.href = '/login'; return; }
    const prev = reposted; setReposted(!prev);
    try {
      const res = await fetch(`/api/quick-facts/${post.id}/repost`, { method: 'POST' });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const d = await res.json();
      if (!res.ok || typeof d.reposted === 'undefined') { setReposted(prev); return; }
      setReposted(d.reposted);
    } catch { setReposted(prev); }
  }
  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!currentUser) { window.location.href = '/login'; return; }
    const body: { content: string; parent_id?: number } = { content: commentText.trim() };
    if (replyToId) body.parent_id = replyToId;
    setCommentText(''); setReplyToId(null);
    const res = await fetch(`/api/quick-facts/${post.id}/comment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await res.json();
    if (d.comment) setComments(prev => [...prev, d.comment]);
  }
  async function deleteComment(id: number) {
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    if (res.ok) setComments(prev => prev.filter(c => c.id !== id));
  }
  async function share() {
    const url = `https://basementonfire.com/p/${post.id}`;
    try { if (navigator.share) { await navigator.share({ url, title: 'Basements gönderisi' }); return; } } catch { return; }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  }

  const topComments = comments.filter(c => !c.parent_id);
  const repMap = new Map<number, CommentT[]>();
  for (const c of comments) { if (c.parent_id) { if (!repMap.has(c.parent_id)) repMap.set(c.parent_id, []); repMap.get(c.parent_id)!.push(c); } }

  return (
    <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <div className="feed-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/akis" className="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </Link>
        <span>Gönderi</span>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', width: '100%' }}>
        {/* Medya */}
        <div style={{ width: '100%', background: '#000', lineHeight: 0 }}>
          <MediaCarousel media={factMediaList(post)} variant="feed" caption={post.caption} sizes="(max-width:620px) 100vw, 600px" priority />
        </div>

        {/* Yazar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
          <Link href={`/u/${post.username}`} style={{ textDecoration: 'none' }}><Avatar username={post.username} display_name={post.display_name} avatar={post.avatar} size={40} /></Link>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link href={`/u/${post.username}`} style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)', textDecoration: 'none', display: 'block' }}>{post.display_name}</Link>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>@{post.username} · {timeAgo(post.created_at)}</span>
          </div>
          <button onClick={share} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--color-border)', borderRadius: 9999, padding: '6px 12px', cursor: 'pointer', color: 'var(--color-text)', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" /></svg>
            {copied ? 'Kopyalandı' : 'Paylaş'}
          </button>
          <ReportButton targetType="post" targetId={post.id} subtitle={`@${post.username} gönderisi`} canReport={!!currentUser && currentUser.id !== post.user_id} />
        </div>

        {/* Aksiyonlar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '2px 16px 8px' }}>
          <button onClick={toggleLike} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.95rem', color: liked ? 'var(--color-danger)' : 'var(--color-text)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
            {likes}
          </button>
          <button onClick={toggleRepost} aria-label="Repost" title={reposted ? 'Repost geri al' : 'Repost'} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: reposted ? '#22c55e' : 'var(--color-text)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 1 4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="m7 23-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
          </button>
          <button onClick={toggleBookmark} aria-label="Kaydet" style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: bookmarked ? 'var(--color-accent-ink)' : 'var(--color-text)', marginLeft: 'auto' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
          </button>
        </div>

        {/* Açıklama */}
        {post.caption && (
          <div style={{ padding: '4px 16px 14px', fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--color-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            <Caption text={post.caption} prefix={<Link href={`/u/${post.username}`} style={{ fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none' }}>{post.display_name}</Link>} />
          </div>
        )}

        {/* Yorumlar */}
        <div style={{ borderTop: '1px solid var(--color-border)', padding: '6px 0 12px' }}>
          {topComments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>İlk yorumu sen yaz ✍️</div>
          ) : topComments.map(c => (
            <div key={c.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 16px' }}>
                <Link href={`/u/${c.username}`} style={{ textDecoration: 'none' }}><Avatar username={c.username} display_name={c.display_name} avatar={c.avatar} size={28} /></Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/u/${c.username}`} style={{ fontWeight: 700, fontSize: '0.82rem', marginRight: 5, color: 'var(--color-text)', textDecoration: 'none' }}>{c.display_name}</Link>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: 1.45, wordBreak: 'break-word' }}>{c.content}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{timeAgo(c.created_at)}</span>
                    {commentLikesEnabled && <CommentLikeButton commentId={c.id} initialLikes={c.likes} initialLiked={c.liked} />}
                    {currentUser && <button onClick={() => { setReplyToId(c.id); setCommentText(`@${c.username} `); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', padding: 0, fontFamily: 'inherit' }}>Yanıtla</button>}
                    <ReportButton targetType="comment" targetId={c.id} subtitle={`@${c.username} yorumu`} variant="inline" canReport={!!currentUser && currentUser.id !== c.user_id} />
                  </div>
                </div>
                {currentUser?.id === c.user_id && <button onClick={() => deleteComment(c.id)} aria-label="Yorumu sil" className="hit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1, padding: '0 4px' }}>×</button>}
              </div>
              {(repMap.get(c.id) ?? []).map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 16px 7px 40px' }}>
                  <Link href={`/u/${r.username}`} style={{ textDecoration: 'none' }}><Avatar username={r.username} display_name={r.display_name} avatar={r.avatar} size={24} /></Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/u/${r.username}`} style={{ fontWeight: 700, fontSize: '0.8rem', marginRight: 5, color: 'var(--color-text)', textDecoration: 'none' }}>{r.display_name}</Link>
                    <span style={{ fontSize: '0.83rem', color: 'var(--color-text)', lineHeight: 1.45, wordBreak: 'break-word' }}>{r.content}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{timeAgo(r.created_at)}</span>
                      {commentLikesEnabled && <CommentLikeButton commentId={r.id} initialLikes={r.likes} initialLiked={r.liked} />}
                      <ReportButton targetType="comment" targetId={r.id} subtitle={`@${r.username} yorumu`} variant="inline" canReport={!!currentUser && currentUser.id !== r.user_id} />
                    </div>
                  </div>
                  {currentUser?.id === r.user_id && <button onClick={() => deleteComment(r.id)} aria-label="Yorumu sil" className="hit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: 1, padding: '0 4px' }}>×</button>}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Yorum yaz */}
        {currentUser ? (
          <form onSubmit={submitComment} style={{ position: 'sticky', bottom: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
            <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder={replyToId ? '↩ yanıtlanıyor…' : 'Yorum ekle…'} maxLength={300} autoComplete="off" style={{ flex: 1, border: '1px solid var(--color-border)', borderRadius: 9999, padding: '9px 14px', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none', background: 'var(--color-bg)', color: 'var(--color-text)', minWidth: 0 }} />
            {replyToId && <button type="button" onClick={() => { setReplyToId(null); setCommentText(''); }} aria-label="İptal" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontFamily: 'inherit' }}>×</button>}
            <button type="submit" aria-label="Gönder" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', opacity: commentText.trim() ? 1 : 0.4, padding: 4 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
            </button>
          </form>
        ) : (
          <div style={{ padding: '14px 16px', borderTop: '1px solid var(--color-border)', textAlign: 'center', fontSize: '0.85rem' }}>
            <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>Yorum yapmak için giriş yap</Link>
          </div>
        )}
      </div>
    </main>
  );
}
