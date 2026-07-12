'use client';

import Img from '@/app/components/Img';
import MediaCarousel from '@/app/components/MediaCarousel';
import { factMediaList } from '@/lib/types';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Caption from './Caption';
import Logo from './Logo';
import DailyQuestion from './DailyQuestion';
import DidYouKnowCard from './DidYouKnowCard';
import ReportButton from './ReportButton';
import { uploadToStorage } from '@/lib/upload';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryItem { id: number; mediaUrl: string; mediaType: string; createdAt: string; }
interface StoryUser { userId: number; username: string; displayName: string; avatar: string | null; stories: StoryItem[]; }
interface SuggestedUser { id: number; username: string; display_name: string; bio: string | null; avatar: string | null; mutual_count: number; }

interface Props {
  feedItems: any[];
  likedFactIds: number[];
  likedPostIds: number[];
  repostedFactIds: number[];
  suggestedUsers: SuggestedUser[];
  currentUser: { id: number; username: string; display_name: string; avatar: string | null } | null;
  ownStoryUser: StoryUser | null;
  otherStoryUsers: StoryUser[];
}

function avatarBg(u: string): string {
  const gs = ['linear-gradient(135deg,#6366f1,#8b5cf6)','linear-gradient(135deg,#ec4899,#8b5cf6)','linear-gradient(135deg,#f97316,#ef4444)','linear-gradient(135deg,#10b981,#3b82f6)','linear-gradient(135deg,#f59e0b,#f97316)','linear-gradient(135deg,#14b8a6,#06b6d4)','linear-gradient(135deg,#3b82f6,#6366f1)','linear-gradient(135deg,#ef4444,#f97316)'];
  let h = 0; for (const c of u) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return gs[Math.abs(h) % gs.length];
}
function storyAvatarBg(u: string): string {
  const gs = ['linear-gradient(135deg,#667eea,#764ba2)','linear-gradient(135deg,#f093fb,#f5576c)','linear-gradient(135deg,#4facfe,#00f2fe)','linear-gradient(135deg,#43e97b,#38f9d7)','linear-gradient(135deg,#fa709a,#fee140)','linear-gradient(135deg,#a18cd1,#fbc2eb)','linear-gradient(135deg,#fda085,#f6d365)','linear-gradient(135deg,#96fbc4,#f9f586)'];
  let h = 0; for (const c of u) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return gs[Math.abs(h) % gs.length];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}d`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}sa`;
  return `${Math.floor(hrs / 24)}g`;
}

const HeartFilled = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);
const HeartEmpty = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

export default function HomeFeed({ feedItems: initialItems, likedFactIds, likedPostIds, repostedFactIds, suggestedUsers, currentUser, ownStoryUser, otherStoryUsers }: Props) {
  // Feed items + infinite scroll
  const [feedItems, setFeedItems] = useState<any[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialItems.length > 0 ? initialItems[initialItems.length - 1].created_at : null
  );
  const [hasMore, setHasMore] = useState(initialItems.length >= 10);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [likedFacts, setLikedFacts] = useState<Set<number>>(new Set(likedFactIds));
  const [factLikes, setFactLikes] = useState<Record<number, number>>({});
  const [repostedFacts, setRepostedFacts] = useState<Set<number>>(new Set(repostedFactIds));
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set(likedPostIds));
  const [postLikes, setPostLikes] = useState<Record<number, number>>({});
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  // Sonsuz kaydırma — birleşik feed
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/feed?type=mixed&cursor=${encodeURIComponent(nextCursor)}&limit=10`);
      const data = await res.json();
      if (data.posts?.length) {
        setFeedItems(prev => {
          // Tekrar eklemeyi önle
          const existingKeys = new Set(prev.map((i: any) => `${i.kind}-${i.id}`));
          const newItems = data.posts.filter((i: any) => !existingKeys.has(`${i.kind}-${i.id}`));
          return [...prev, ...newItems];
        });
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch {
      // sessiz hata — kullanıcı tekrar scroll edince yeniden dener
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, nextCursor]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '300px' }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  // Story viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [svUserIdx, setSvUserIdx] = useState(0);
  const [svStoryIdx, setSvStoryIdx] = useState(0);
  const svTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Story create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyPreviewUrl, setStoryPreviewUrl] = useState('');
  const [storyError, setStoryError] = useState('');
  const [storySubmitting, setStorySubmitting] = useState(false);

  // Paylaş menüsünden "Hikaye" ile gelince (/?story=1) hikaye oluşturucuyu aç.
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('story') === '1') {
        setCreateOpen(true);
        sp.delete('story');
        const qs = sp.toString();
        window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
      }
    } catch {}
  }, []);

  const allStoryUsers: StoryUser[] = [
    ...(ownStoryUser ? [ownStoryUser] : []),
    ...otherStoryUsers,
  ];

  // Story viewer helpers
  function clearSvTimer() { if (svTimerRef.current) { clearTimeout(svTimerRef.current); svTimerRef.current = null; } }

  function openViewer(userIdx: number) {
    setSvUserIdx(userIdx);
    setSvStoryIdx(0);
    setViewerOpen(true);
    document.body.style.overflow = 'hidden';
  }

  function closeViewer() {
    clearSvTimer();
    setViewerOpen(false);
    document.body.style.overflow = '';
  }

  function advanceStory(dir: 1 | -1) {
    const u = allStoryUsers[svUserIdx];
    const nextStory = svStoryIdx + dir;
    if (nextStory >= 0 && nextStory < u.stories.length) { setSvStoryIdx(nextStory); return; }
    const nextUser = svUserIdx + dir;
    if (nextUser >= 0 && nextUser < allStoryUsers.length) { setSvUserIdx(nextUser); setSvStoryIdx(dir === 1 ? 0 : allStoryUsers[nextUser].stories.length - 1); return; }
    closeViewer();
  }

  useEffect(() => {
    if (!viewerOpen) return;
    const u = allStoryUsers[svUserIdx];
    const s = u?.stories[svStoryIdx];
    if (!s) return;
    clearSvTimer();
    svTimerRef.current = setTimeout(() => advanceStory(1), s.mediaType === 'video' ? 15000 : 5000);
    return clearSvTimer;
  }, [viewerOpen, svUserIdx, svStoryIdx]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!viewerOpen) return;
      if (e.key === 'ArrowRight') advanceStory(1);
      if (e.key === 'ArrowLeft') advanceStory(-1);
      if (e.key === 'Escape') closeViewer();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewerOpen, svUserIdx, svStoryIdx]);

  // Like handlers
  async function likePost(id: number, kind: 'fact' | 'post') {
    const endpoint = kind === 'fact' ? `/api/quick-facts/${id}/like` : `/api/posts/${id}/like`;
    const res = await fetch(endpoint, { method: 'POST' });
    if (res.status === 401) { window.location.href = '/login'; return; }
    if (!res.ok) return;
    const data = await res.json();
    if (kind === 'fact') {
      setLikedFacts(prev => { const n = new Set(prev); data.liked ? n.add(id) : n.delete(id); return n; });
      setFactLikes(prev => ({ ...prev, [id]: data.likes }));
    } else {
      setLikedPosts(prev => { const n = new Set(prev); data.liked ? n.add(id) : n.delete(id); return n; });
      setPostLikes(prev => ({ ...prev, [id]: data.likes }));
    }
  }

  // Repost (yalnızca quick_facts) — optimistik, hata/401'de geri alır
  async function toggleRepost(id: number) {
    if (!currentUser) { window.location.href = '/login'; return; }
    const was = repostedFacts.has(id);
    setRepostedFacts(prev => { const n = new Set(prev); was ? n.delete(id) : n.add(id); return n; });
    const revert = () => setRepostedFacts(prev => { const n = new Set(prev); was ? n.add(id) : n.delete(id); return n; });
    try {
      const res = await fetch(`/api/quick-facts/${id}/repost`, { method: 'POST' });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const data = await res.json();
      if (!res.ok || typeof data.reposted === 'undefined') { revert(); return; }
      setRepostedFacts(prev => { const n = new Set(prev); data.reposted ? n.add(id) : n.delete(id); return n; });
    } catch { revert(); }
  }

  async function followUser(username: string) {
    const res = await fetch(`/api/users/${username}/follow`, { method: 'POST' });
    if (res.status === 401) { window.location.href = '/login'; return; }
    if (!res.ok) return;
    const data = await res.json();
    setFollowedUsers(prev => { const n = new Set(prev); data.following ? n.add(username) : n.delete(username); return n; });
  }

  // Story create
  function applyStoryFile(file: File) {
    setStoryFile(file);
    setStoryPreviewUrl(URL.createObjectURL(file));
  }

  async function submitStory() {
    if (!storyFile) return;
    setStorySubmitting(true);
    setStoryError('');
    try {
      const { path, mediaType } = await uploadToStorage(storyFile, 'story');
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, mediaType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Hata');
      setCreateOpen(false);
      setStoryFile(null);
      setStoryPreviewUrl('');
    } catch (e: any) {
      setStoryError(e.message);
    } finally {
      setStorySubmitting(false);
    }
  }

  const currentSvUser = allStoryUsers[svUserIdx];
  const currentSvStory = currentSvUser?.stories[svStoryIdx];

  function svTimeAgo(iso: string) {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return `${s}sn`; if (s < 3600) return `${Math.floor(s / 60)}dk`; return `${Math.floor(s / 3600)}sa`;
  }

  return (
    <>
      <main className="main-content">
        {/* Hero banner — yalnızca giriş yapmamış ziyaretçiye (onboarding/tanıtım).
            Giriş yapmış kullanıcı için gereksiz dikey alan işgali → gizli. */}
        {!currentUser && (
          <div style={{ position: 'relative', minHeight: 200, overflow: 'hidden', borderBottom: '1px solid var(--color-border)', background: 'var(--gradient-hero)' }}>
            <div style={{ position: 'absolute', inset: 0, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Logo size={54} />
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>Basements</div>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.78)', marginTop: 8, maxWidth: 340 }}>Bilim, tarih ve kültürü interaktif makaleler ve toplulukla keşfet.</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <Link href="/register" style={{ background: '#fff', color: '#1e1b4b', fontWeight: 700, fontSize: '0.85rem', padding: '9px 18px', borderRadius: 'var(--radius-pill)', textDecoration: 'none' }}>Hemen katıl</Link>
                <Link href="/login" style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', padding: '9px 18px', borderRadius: 'var(--radius-pill)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>Giriş yap</Link>
              </div>
            </div>
          </div>
        )}
        {/* Hero giriş-yapmamışta zaten markayı taşıyor → çift başlık olmasın.
            Giriş yapmışta hero yok, standart sayfa başlığı görünür. */}
        {currentUser && <div className="feed-header">Ana Sayfa</div>}

        {/* Story bar */}
        <div className="story-bar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', scrollbarWidth: 'none' }}>
          {currentUser && (
            <button
              className="story-item"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '2px' }}
              onClick={() => {
                if (ownStoryUser) openViewer(0);
                else setCreateOpen(true);
              }}
            >
              <div style={{ width: 60, height: 60, borderRadius: '50%', padding: '2.5px', background: ownStoryUser ? 'var(--gradient-story)' : 'rgba(0,0,0,0.08)', border: ownStoryUser ? 'none' : '2px dashed #ccc', position: 'relative', transition: 'transform 0.15s' }}>
                {currentUser.avatar
                  ? <Img src={currentUser.avatar} alt="" fixedWidth={128} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} />
                  : <div style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem', color: '#fff', background: storyAvatarBg(currentUser.username), border: '2px solid white' }}>
                  {currentUser.display_name[0].toUpperCase()}
                </div>}
                {!ownStoryUser && (
                  <span style={{ position: 'absolute', bottom: -1, right: -1, width: 20, height: 20, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', lineHeight: 1 }}>+</span>
                )}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', maxWidth: 64, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>
                {ownStoryUser ? 'Hikayem' : 'Ekle'}
              </span>
            </button>
          )}

          {otherStoryUsers.map((u, i) => (
            <button
              key={u.userId}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '2px' }}
              onClick={() => openViewer(ownStoryUser ? i + 1 : i)}
            >
              <div style={{ width: 60, height: 60, borderRadius: '50%', padding: '2.5px', background: 'var(--gradient-story)', transition: 'transform 0.15s' }}>
                {u.avatar
                  ? <Img src={u.avatar} alt="" fixedWidth={128} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} />
                  : <div style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem', color: '#fff', background: storyAvatarBg(u.username), border: '2px solid white' }}>{u.displayName[0].toUpperCase()}</div>
                }
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', maxWidth: 64, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>{u.username}</span>
            </button>
          ))}
        </div>

        {/* Eşleştir — mobil/tablet girişi (masaüstünde sağ panel kartı var; sağ panel <1200px gizli) */}
        <Link href="/eslesme" className="match-feed-card">
          <span className="match-feed-card-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.9-10-9.3C.3 8.4 1.7 5 5 5c2 0 3.2 1.1 4 2.3C9.8 6.1 11 5 13 5c3.3 0 4.7 3.4 3 6.7C19.5 16.1 12 21 12 21z"/></svg>
          </span>
          <span className="match-feed-card-text">
            <strong>Eşleştir</strong>
            <span>İlgi alanlarına göre yeni insanlarla tanış</span>
          </span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, opacity: 0.85 }}><path d="m9 18 6-6-6-6"/></svg>
        </Link>

        {/* Günün Sorusu — eğlence + bilgi füzyonunun etkileşim motoru (herkese görünür) */}
        <DailyQuestion />

        {/* Feed */}
        {feedItems.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '64px 0', color: 'var(--color-text-muted)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            <p>Henüz paylaşım yok.</p>
          </div>
        ) : (
          <div style={{ maxWidth: 470, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40, paddingTop: 16 }}>
            {feedItems.map((item: any, index: number) => {
              if (item.kind === 'dyk') {
                return (
                  <motion.div
                    key={`dyk-${item.id}`}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.07, 0.5), ease: 'easeOut' }}
                  >
                    <DidYouKnowCard item={item} />
                  </motion.div>
                );
              }
              if (item.kind === 'fact') {
                const liked = likedFacts.has(item.id);
                const likes = factLikes[item.id] ?? item.likes;
                const reposted = repostedFacts.has(item.id);
                return (
                  <motion.article
                    key={`fact-${item.id}`}
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.07, 0.5), ease: 'easeOut' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                      <Link href={`/u/${item.username}`} style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', background: avatarBg(item.username), overflow: 'hidden' }}>
                        {(item.avatar && item.avatar !== '/avatars/default.png') ? <Img src={item.avatar} alt="" fixedWidth={76} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (item.display_name[0] ?? '?').toUpperCase()}
                      </Link>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link href={`/u/${item.username}`} style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.display_name}</Link>
                        <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>@{item.username} · {timeAgo(item.created_at)}</span>
                      </div>
                      <ReportButton targetType="post" targetId={item.id} subtitle={`@${item.username} gönderisi`} size={32} canReport={!!currentUser && currentUser.id !== item.user_id} />
                    </div>
                    <div style={{ width: '100%', background: '#000', lineHeight: 0 }}>
                      <MediaCarousel media={factMediaList(item)} variant="feed" caption={item.caption ?? ''} sizes="(max-width:620px) 100vw, 600px" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px 4px' }}>
                      <motion.button
                        onClick={() => likePost(item.id, 'fact')}
                        whileTap={{ scale: 0.80 }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: '9999px', color: liked ? 'var(--color-danger)' : 'var(--color-text)', fontWeight: 600, fontFamily: 'inherit', transition: 'color 0.15s', fontSize: '0.9rem' }}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span key={liked ? 'f' : 'e'} initial={{ scale: 0.5, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.5 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} style={{ display: 'flex' }}>
                            {liked ? <HeartFilled /> : <HeartEmpty />}
                          </motion.span>
                        </AnimatePresence>
                        <motion.span key={likes} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }}>{likes}</motion.span>
                      </motion.button>
                      <Link href="/akis" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px 8px', borderRadius: '9999px', color: 'var(--color-text)', textDecoration: 'none', transition: 'background 0.12s' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </Link>
                      <motion.button
                        onClick={() => toggleRepost(item.id)}
                        whileTap={{ scale: 0.80 }}
                        aria-label="Repost"
                        title={reposted ? 'Repost geri al' : 'Repost'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px 8px', borderRadius: '9999px', color: reposted ? 'var(--color-success)' : 'var(--color-text)', transition: 'color 0.15s' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 1 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 23-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                      </motion.button>
                    </div>
                    <div style={{ padding: '2px 14px 4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>{likes} beğeni</span>
                    </div>
                    {item.caption && (
                      <div style={{ padding: '2px 14px 14px', fontSize: '0.87rem', lineHeight: 1.5, color: 'var(--color-text)' }}>
                        <Caption
                          text={item.caption}
                          clamp
                          prefix={<Link href={`/u/${item.username}`} style={{ fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none' }}>{item.display_name}</Link>}
                        />
                      </div>
                    )}
                  </motion.article>
                );
              }

              // Text post
              const liked = likedPosts.has(item.id);
              const likes = postLikes[item.id] ?? item.likes;
              const catLabel = item.category === 'science' ? 'Bilim' : item.category === 'history' ? 'Tarih' : 'Genel';
              return (
                <motion.article
                  key={`post-${item.id}`}
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.07, 0.5), ease: 'easeOut' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px 0' }}>
                    <Link href={`/u/${item.username}`} style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', background: avatarBg(item.username), overflow: 'hidden' }}>
                      {(item.avatar && item.avatar !== '/avatars/default.png') ? <Img src={item.avatar} alt="" fixedWidth={76} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (item.display_name[0] ?? '?').toUpperCase()}
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/u/${item.username}`} style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none' }}>{item.display_name}</Link>
                      <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>@{item.username} · {timeAgo(item.created_at)}</span>
                    </div>
                    <span style={{ flexShrink: 0, fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '9999px', marginLeft: 'auto', background: item.category === 'science' ? 'rgba(59,130,246,.15)' : item.category === 'history' ? 'rgba(245,158,11,.15)' : 'rgba(100,116,139,.15)', color: item.category === 'science' ? '#3b82f6' : item.category === 'history' ? '#b45309' : '#475569' }}>
                      {catLabel}
                    </span>
                    <ReportButton targetType="post" targetId={item.id} subtitle={`@${item.username} gönderisi`} size={32} canReport={!!currentUser && currentUser.id !== item.user_id} />
                  </div>
                  <div style={{ padding: '12px 16px 4px', fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    <Caption text={item.content} clamp />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px 12px' }}>
                    <motion.button
                      onClick={() => likePost(item.id, 'post')}
                      whileTap={{ scale: 0.80 }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: '9999px', color: liked ? 'var(--color-danger)' : 'var(--color-text)', fontWeight: 600, fontFamily: 'inherit', fontSize: '0.9rem', transition: 'color 0.15s' }}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span key={liked ? 'f' : 'e'} initial={{ scale: 0.5, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.5 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} style={{ display: 'flex' }}>
                          {liked ? <HeartFilled /> : <HeartEmpty />}
                        </motion.span>
                      </AnimatePresence>
                      <motion.span key={likes} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }}>{likes}</motion.span>
                    </motion.button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} style={{ height: 1 }} />

        {/* Yükleniyor spinner */}
        {loadingMore && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 40px' }}>
            <div style={{ width: 28, height: 28, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'hf-spin 0.7s linear infinite' }} />
          </div>
        )}

        {/* Bitti mesajı */}
        {!hasMore && feedItems.length > 0 && (
          <p style={{ textAlign: 'center', padding: '20px 0 60px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Tüm gönderiler görüntülendi
          </p>
        )}

        <style>{`@keyframes hf-spin { to { transform: rotate(360deg); } }`}</style>
      </main>

      {/* Right panel */}
      <aside className="right-panel">
        {/* Arama — /discover?q=... (masaüstü sağ panelde; sidebar arama ikonuna ek giriş) */}
        <form action="/discover" method="get" role="search" style={{ position: 'relative' }}>
          <svg aria-hidden="true" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input name="q" type="search" placeholder="İçeriklerde ara" aria-label="İçeriklerde ara" style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
        </form>
        {/* Eşleştir — ilgi alanı bazlı kart kaydırma girişi (navbar yerine burada) */}
        <div className="widget-card">
          <h3>Eşleştir</h3>
          <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
            İlgi alanlarına göre yeni insanlarla tanış. Kaydır, beğen, eşleş.
          </p>
          <Link href="/eslesme" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 14px', borderRadius: 12, textDecoration: 'none', color: '#fff', fontWeight: 800, fontSize: '0.9rem', background: 'var(--gradient-match)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.9-10-9.3C.3 8.4 1.7 5 5 5c2 0 3.2 1.1 4 2.3C9.8 6.1 11 5 13 5c3.3 0 4.7 3.4 3 6.7C19.5 16.1 12 21 12 21z"/></svg>
            Eşleşmeye başla
          </Link>
        </div>
        {currentUser && suggestedUsers.length > 0 && (
          <div className="widget-card">
            <h3>Tanıyor olabilirsin</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {suggestedUsers.map(u => (
                <div key={u.id} className="rp-link" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', borderRadius: 12 }}>
                  <Link href={`/u/${u.username}`} style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', background: avatarBg(u.username), overflow: 'hidden' }}>
                    {u.avatar ? <Img src={u.avatar} alt="" fixedWidth={80} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : u.display_name[0].toUpperCase()}
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/u/${u.username}`} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.display_name}</Link>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>@{u.username}</div>
                    {u.mutual_count > 0 && <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 1 }}>{u.mutual_count} ortak takipçi</div>}
                  </div>
                  <button
                    onClick={() => followUser(u.username)}
                    style={{ flexShrink: 0, padding: '5px 14px', borderRadius: '9999px', border: '1.5px solid var(--color-text)', background: followedUsers.has(u.username) ? 'var(--color-text)' : 'transparent', color: followedUsers.has(u.username) ? '#fff' : 'var(--color-text)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                  >
                    {followedUsers.has(u.username) ? 'Takip Ediliyor' : 'Takip Et'}
                  </button>
                </div>
              ))}
            </div>
            <Link href="/discover" style={{ display: 'block', marginTop: 8, fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none' }}>Daha fazla göster →</Link>
          </div>
        )}
        <div className="widget-card">
          <h3>Keşfet</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/articles/black-hole" className="rp-link" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, borderRadius: 12, textDecoration: 'none', color: 'inherit' }}>
              <span style={{ fontSize: '1.5rem' }}>🕳️</span><span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Kara Delikler</span>
            </Link>
            <Link href="/articles/carthage" className="rp-link" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, borderRadius: 12, textDecoration: 'none', color: 'inherit' }}>
              <span style={{ fontSize: '1.5rem' }}>🏛️</span><span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Kartaca</span>
            </Link>
          </div>
          {currentUser && (
            <Link href="/bilgi-karti" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, padding: '9px 10px', borderRadius: 12, textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.84rem', border: '1px dashed var(--color-border)' }}>
              💡 Bilgi kartı paylaş
            </Link>
          )}
        </div>
      </aside>

      {/* Story Viewer Modal */}
      {viewerOpen && currentSvUser && currentSvStory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) closeViewer(); }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: currentSvStory.mediaType === 'image' ? `url(${currentSvStory.mediaUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(30px) brightness(0.3)', transform: 'scale(1.1)', transition: 'background-image 0.3s' }} />
          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, height: '100dvh', maxHeight: 780, display: 'flex', flexDirection: 'column', borderRadius: 16, overflow: 'hidden', background: '#000' }}>
            {/* Top bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '10px 12px 8px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                {currentSvUser.stories.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: '2.5px', borderRadius: '9999px', background: i < svStoryIdx ? '#fff' : 'rgba(255,255,255,0.3)', overflow: 'hidden', position: 'relative' }}>
                    {i === svStoryIdx && (
                      <div style={{ position: 'absolute', inset: 0, background: '#fff', transformOrigin: 'left', animation: `sv-progress ${currentSvStory.mediaType === 'video' ? '15s' : '5s'} linear forwards` }} />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#fff', overflow: 'hidden' }}>
                  {currentSvUser.avatar ? <Img src={currentSvUser.avatar} alt="" fixedWidth={128} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : currentSvUser.displayName[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>{currentSvUser.displayName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>{svTimeAgo(currentSvStory.createdAt)}</div>
                </div>
                <button onClick={closeViewer} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', borderRadius: '50%', color: 'white' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
            {/* Media */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', overflow: 'hidden' }}>
              {currentSvStory.mediaType === 'video'
                ? <video key={currentSvStory.mediaUrl} src={currentSvStory.mediaUrl} autoPlay muted playsInline style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                : <Img key={currentSvStory.mediaUrl} src={currentSvStory.mediaUrl} alt="" sizes="(max-width:520px) 100vw, 460px" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              }
            </div>
            {/* Touch zones — klavye/ekran-okuyucu için <button> + aria-label */}
            <button type="button" aria-label="Önceki hikaye" onClick={() => advanceStory(-1)} style={{ position: 'absolute', top: 60, bottom: 0, left: 0, width: '40%', cursor: 'pointer', zIndex: 5, background: 'none', border: 'none', padding: 0 }} />
            <button type="button" aria-label="Sonraki hikaye" onClick={() => advanceStory(1)} style={{ position: 'absolute', top: 60, bottom: 0, right: 0, width: '40%', cursor: 'pointer', zIndex: 5, background: 'none', border: 'none', padding: 0 }} />
          </div>
          <style>{`@keyframes sv-progress { to { transform: scaleX(1); } }`}</style>
        </div>
      )}

      {/* Story Create Modal */}
      {createOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) { setCreateOpen(false); setStoryFile(null); setStoryPreviewUrl(''); } }}>
          <div style={{ background: '#1a1510', borderRadius: 20, width: '100%', maxWidth: 400, padding: 20, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontWeight: 700, fontSize: '1rem', color: '#e8e0d8' }}>
              <span>Yeni Hikaye</span>
              <button onClick={() => { setCreateOpen(false); setStoryFile(null); setStoryPreviewUrl(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#aaa' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div
              role="button"
              tabIndex={0}
              aria-label="Fotoğraf veya video seç"
              style={{ border: '2px dashed rgba(255,255,255,0.15)', borderRadius: 16, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textAlign: 'center', overflow: 'hidden', position: 'relative', color: '#ccc', transition: 'border-color 0.2s' }}
              onClick={() => document.getElementById('story-file-input')?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('story-file-input')?.click(); } }}
            >
              {storyPreviewUrl ? (
                storyFile?.type.startsWith('video/') ? <video src={storyPreviewUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} controls /> : <img src={storyPreviewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div>
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>Fotoğraf veya video seç</p>
                  <p style={{ fontSize: '0.8rem', color: '#888' }}>Tıkla · Max 50MB</p>
                </div>
              )}
            </div>
            <input id="story-file-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" hidden onChange={e => { const f = e.target.files?.[0]; if (f) applyStoryFile(f); }} />
            {storyError && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '8px 0 0' }}>{storyError}</p>}
            <button disabled={!storyFile || storySubmitting} onClick={submitStory} style={{ width: '100%', marginTop: 14, padding: 12, border: 'none', borderRadius: '9999px', background: 'var(--color-accent)', color: '#0f0e0d', fontWeight: 700, fontSize: '0.95rem', cursor: storyFile ? 'pointer' : 'not-allowed', opacity: storyFile ? 1 : 0.4 }}>
              {storySubmitting ? 'Yükleniyor…' : 'Hikayeyi Paylaş'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
