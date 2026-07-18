'use client';

import Img from '@/app/components/Img';
import { avatarSrc } from '@/lib/avatar';
import MediaCarousel, { MultiBadge, AudioThumb, MusicBadge } from '@/app/components/MediaCarousel';
import { useIsMobile } from '@/lib/useIsMobile';
import { factMediaList } from '@/lib/types';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Caption from '@/app/components/Caption';
import AnimatedNumber from '@/app/components/AnimatedNumber';
import { BADGE_MAP, levelFromXp } from '@/lib/badges';
import ReportModal from '@/app/components/ReportModal';
import ReportButton from '@/app/components/ReportButton';

interface ProfileUser {
  id: number; username: string; display_name: string; bio: string | null; avatar: string | null;
  is_private: boolean; location: string | null; website: string | null; gender: string;
  birthdate: string | null; interests: string[];
}
interface MediaPost { id: number; media_url: string; media_type: string; caption: string; likes: number; created_at: string; media?: { url: string; type: 'image' | 'video' }[] | null; }
interface Comment { id: number; parent_id: number | null; user_id: number; content: string; created_at: string; display_name: string; username: string; avatar: string | null; }

interface Props {
  profileUser: ProfileUser;
  bg: string;
  age: number | null;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isHidden: boolean;
  iBlocked: boolean;
  blockedMe: boolean;
  mediaPosts: MediaPost[];
  articles?: { slug: string; title: string; summary: string; cover_url: string | null; category: string | null }[];
  progress?: { xp: number; current_streak: number; longest_streak: number; total_correct: number } | null;
  badgeKeys?: string[];
  me: { id: number; username: string; display_name: string; avatar: string | null } | null;
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  return s < 60 ? `${s}sn` : s < 3600 ? `${Math.floor(s/60)}dk` : s < 86400 ? `${Math.floor(s/3600)}sa` : `${Math.floor(s/86400)}g`;
}

const GENDER_LABEL: Record<string, string> = { erkek: 'Erkek', kadin: 'Kadın', diger: 'Diğer' };

export default function UserProfileClient({ profileUser, bg, age, followersCount, followingCount, isFollowing: initialFollowing, isHidden, iBlocked, blockedMe, mediaPosts, articles = [], progress = null, badgeKeys = [], me }: Props) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [following, setFollowing] = useState(initialFollowing);
  const [followers, setFollowers] = useState(followersCount);
  const [followLoading, setFollowLoading] = useState(false);
  const [dmLoading, setDmLoading] = useState(false);

  // Engelleme + şikayet
  const [blocked, setBlocked] = useState(iBlocked);
  const [blockLoading, setBlockLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  async function toggleBlock() {
    if (!me) { router.push('/login'); return; }
    setMenuOpen(false);
    if (!blocked && !confirm(`@${profileUser.username} engellensin mi? Birbirinizin içeriğini ve mesajlarını göremezsiniz.`)) return;
    setBlockLoading(true);
    try {
      const res = await fetch(`/api/users/${profileUser.username}/block`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data.error || 'İşlem başarısız.'); return; }
      setBlocked(data.blocked);
      router.refresh(); // içeriğin gizli/görünür durumunu yenile
    } finally {
      setBlockLoading(false);
    }
  }

  // Lightbox
  const [lightbox, setLightbox] = useState<MediaPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [cmLoading, setCmLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<number | null>(null);

  async function toggleFollow() {
    if (!me) { router.push('/login'); return; }
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/users/${profileUser.username}/follow`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFollowing(data.following);
      setFollowers(data.followers_count ?? (data.following ? followers + 1 : followers - 1));
    } finally {
      setFollowLoading(false);
    }
  }

  async function startDm() {
    if (!me) { router.push('/login'); return; }
    setDmLoading(true);
    try {
      const res = await fetch('/api/dm/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: profileUser.username }),
      });
      const data = await res.json();
      if (data.id) router.push(`/messages?c=${data.id}`);
    } finally {
      setDmLoading(false);
    }
  }

  async function openLightbox(post: MediaPost) {
    setLightbox(post);
    document.body.style.overflow = 'hidden';
    setCmLoading(true);
    setComments([]);
    try {
      const res = await fetch(`/api/quick-facts/${post.id}/comments`);
      const data = await res.json();
      setComments(data.comments ?? []);
    } finally {
      setCmLoading(false);
    }
  }

  function closeLightbox() {
    setLightbox(null);
    document.body.style.overflow = '';
    setCommentText('');
    setReplyToId(null);
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!lightbox || !commentText.trim()) return;
    if (!me) { router.push('/login'); return; }
    const body: any = { content: commentText.trim() };
    if (replyToId) body.parent_id = replyToId;
    setCommentText('');
    setReplyToId(null);
    const res = await fetch(`/api/quick-facts/${lightbox.id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.comment) setComments(prev => [...prev, data.comment]);
  }

  async function deleteComment(id: number) {
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    if (res.ok) setComments(prev => prev.filter(c => c.id !== id));
  }

  const topComments = comments.filter(c => !c.parent_id);
  const repMap = new Map<number, Comment[]>();
  for (const c of comments) {
    if (c.parent_id) {
      if (!repMap.has(c.parent_id)) repMap.set(c.parent_id, []);
      repMap.get(c.parent_id)!.push(c);
    }
  }

  return (
    <main className="main-content">
      {/* Banner */}
      <div style={{ height: 160, width: '100%', background: bg }} />

      {blocked && (
        <div style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)', padding: '10px 16px', fontSize: '0.86rem', fontWeight: 600, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          Bu kullanıcıyı engelledin.
          <button onClick={toggleBlock} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>Engeli kaldır</button>
        </div>
      )}

      {/* Profile header */}
      <div style={{ padding: '0 20px 16px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -40, marginBottom: 12 }}>
          {/* Avatar */}
          <div style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid white', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', overflow: 'hidden', flexShrink: 0 }}>
            <Img src={avatarSrc(profileUser.username, profileUser.avatar)} alt="" fixedWidth={200} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Action buttons — dar ekranda alta sarsın (avatar 80px + iki buton 360px'e sığmaz) */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {me ? (
              <>
                {!blocked && !blockedMe && (<>
                <button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  style={{
                    padding: '9px 22px', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', whiteSpace: 'nowrap',
                    background: following ? 'white' : 'var(--color-text)',
                    color: following ? 'var(--color-text)' : 'white',
                    border: following ? '2px solid var(--color-border)' : '2px solid var(--color-text)',
                  }}
                  onMouseOver={e => { if (following) { (e.currentTarget as HTMLButtonElement).style.background = '#fee2e2'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; } }}
                  onMouseOut={e => { if (following) { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; } }}
                >
                  {followLoading ? '…' : following ? 'Takip Ediliyor' : 'Takip Et'}
                </button>
                <button
                  onClick={startDm}
                  disabled={dmLoading}
                  style={{ padding: '9px 16px', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', background: 'transparent', color: 'var(--color-text)', border: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {dmLoading ? '…' : 'Mesaj'}
                </button>
                </>)}
                <div ref={menuRef} style={{ position: 'relative' }}>
                  <button onClick={() => setMenuOpen(o => !o)} aria-label="Daha fazla" aria-haspopup="menu" aria-expanded={menuOpen} style={{ width: 38, height: 38, borderRadius: '9999px', border: '2px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                  </button>
                  {menuOpen && (
                    <div role="menu" style={{ position: 'absolute', right: 0, top: 44, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', minWidth: 172, zIndex: 30, overflow: 'hidden' }}>
                      <button role="menuitem" onClick={toggleBlock} disabled={blockLoading} style={{ width: '100%', textAlign: 'left', padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-danger)', fontFamily: 'inherit' }}>
                        {blockLoading ? '…' : blocked ? 'Engeli kaldır' : 'Engelle'}
                      </button>
                      <button role="menuitem" onClick={() => { setMenuOpen(false); setReportOpen(true); }} style={{ width: '100%', textAlign: 'left', padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', borderTop: '1px solid var(--color-border)', fontFamily: 'inherit' }}>
                        Şikayet et
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link href="/login" style={{ padding: '9px 22px', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 700, background: 'var(--color-text)', color: 'white', border: '2px solid var(--color-text)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                Takip Et
              </Link>
            )}
          </div>
        </div>

        {/* Name + handle */}
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 6, overflowWrap: 'anywhere', minWidth: 0 }}>
          {profileUser.display_name}
          {profileUser.is_private && (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.55 }}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          )}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0 0 8px', overflowWrap: 'anywhere' }}>@{profileUser.username}</p>
        {profileUser.bio && <p style={{ fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 10px', color: 'var(--color-text)', overflowWrap: 'anywhere' }}>{profileUser.bio}</p>}

        {/* Meta */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '0 0 10px' }}>
          {profileUser.location && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {profileUser.location}
            </span>
          )}
          {profileUser.website && (
            <a href={profileUser.website} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--color-primary)', textDecoration: 'none' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              {profileUser.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          {age !== null && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {age} yaş
            </span>
          )}
          {profileUser.gender && <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{GENDER_LABEL[profileUser.gender] ?? ''}</span>}
        </div>

        {/* Interests */}
        {profileUser.interests.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '0 0 12px' }}>
            {profileUser.interests.map(tag => (
              <span key={tag} style={{ background: 'rgba(212,165,100,0.12)', color: '#c4954e', border: '1px solid rgba(212,165,100,0.35)', borderRadius: '9999px', padding: '3px 12px', fontSize: '0.78rem', fontWeight: 600 }}>{tag}</span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: 20, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          <span><strong style={{ color: 'var(--color-text)' }}><AnimatedNumber value={mediaPosts.length} /></strong> Gönderi</span>
          <span><strong style={{ color: 'var(--color-text)' }}><AnimatedNumber value={followers} /></strong> Takipçi</span>
          <span><strong style={{ color: 'var(--color-text)' }}><AnimatedNumber value={followingCount} /></strong> Takip</span>
        </div>

        {/* Bilgi & Seri vitrini — /profile'daki bloğun herkese açık, kompakt hali.
            progress yoksa (hiç soru çözmemiş / SQL çalışmamış / gizli profil) gizli.
            İlerleme çubuğu BİLEREK yok: başkasının profilinde hedef değil statü gösterilir. */}
        {progress && (progress.xp > 0 || badgeKeys.length > 0) && (() => {
          const { level } = levelFromXp(progress.xp);
          const earned = badgeKeys.map(k => BADGE_MAP[k]).filter(Boolean);
          return (
            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 14, border: '1px solid var(--color-border)', background: 'linear-gradient(90deg, rgba(16,185,129,0.07), rgba(59,130,246,0.05))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-text)' }}>⭐ Lv {level}</span>
                {progress.current_streak > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.84rem', fontWeight: 700, color: '#f97316' }}>🔥 {progress.current_streak} gün seri</span>
                )}
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{progress.total_correct} doğru · {progress.xp} XP</span>
              </div>
              {earned.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 9 }}>
                  {earned.map(b => (
                    <span key={b.key} title={b.desc} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 9999, background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: '0.76rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      <span>{b.emoji}</span>{b.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Makaleler — yayındaki kullanıcı makaleleri */}
      {!isHidden && articles.length > 0 && (
        <div style={{ padding: '14px 12px 4px' }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', margin: '0 4px 10px' }}>📝 Makaleler</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {articles.map(a => (
              <Link key={a.slug} href={`/makale/${a.slug}`} style={{ display: 'flex', gap: 12, padding: 10, border: '1px solid var(--color-border)', borderRadius: 14, textDecoration: 'none', color: 'inherit', background: 'var(--color-bg)' }}>
                <div style={{ width: 88, height: 64, flexShrink: 0, borderRadius: 10, overflow: 'hidden', background: 'var(--color-border)', display: 'grid', placeItems: 'center', fontSize: '1.5rem' }}>
                  {a.cover_url ? <Img src={a.cover_url} alt="" loading="lazy" sizes="120px" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '✍️'}
                </div>
                <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
                  {a.category && <span style={{ fontSize: '0.64rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)' }}>{a.category}</span>}
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.title}</div>
                  {a.summary && <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.summary}</div>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {isHidden ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-text-muted)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 14, color: '#888', display: 'block', margin: '0 auto 14px' }}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <p style={{ fontWeight: 700, marginBottom: 6 }}>{blocked ? 'Engellediğin kullanıcı' : blockedMe ? 'İçerik gösterilemiyor' : 'Bu hesap gizli'}</p>
          <p style={{ fontSize: '0.85rem' }}>{blocked ? 'Engeli kaldırırsan içeriğini tekrar görebilirsin.' : blockedMe ? 'Bu kullanıcının gönderilerini göremezsin.' : 'Gönderileri görmek için takip et.'}</p>
        </div>
      ) : mediaPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📷</div>
          <p>Henüz gönderi yok</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, padding: 3 }}>
          {mediaPosts.map(post => (
            <button
              key={post.id}
              onClick={() => openLightbox(post)}
              style={{ aspectRatio: '3/4', overflow: 'hidden', background: 'var(--color-border)', border: 'none', padding: 0, cursor: 'pointer', position: 'relative' }}
              className="hb-cell"
            >
              {post.media_type === 'audio'
                ? <AudioThumb />
                : post.media_type === 'image'
                ? <Img src={post.media_url} alt={post.caption} loading="lazy" sizes="(max-width:700px) 33vw, 240px" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.2s' }} />
                : <video src={post.media_url} muted preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              }
              {factMediaList(post).filter(m => m.type !== 'audio').length > 1 && <MultiBadge />}
              {post.media_type !== 'audio' && factMediaList(post).some(m => m.type === 'audio') && <MusicBadge />}
              <div className="hb-cell-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s' }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  {post.likes}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) closeLightbox(); }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 16, display: 'flex', flexDirection: isMobile ? 'column' : 'row', maxWidth: 860, width: '100%', height: '90vh', overflow: 'hidden', position: 'relative' }}>
            {/* Close */}
            <button onClick={closeLightbox} style={{ position: 'absolute', top: 10, right: 10, zIndex: 1, background: 'rgba(0,0,0,0.4)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>

            {/* Media */}
            <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
              <MediaCarousel media={factMediaList(lightbox)} caption={lightbox.caption} sizes="(max-width:900px) 100vw, 860px" />
            </div>

            {/* Info panel */}
            <div style={{ width: isMobile ? '100%' : 280, maxHeight: isMobile ? '42%' : undefined, flexShrink: 0, display: 'flex', flexDirection: 'column', borderLeft: isMobile ? 'none' : '1px solid var(--color-border)', borderTop: isMobile ? '1px solid var(--color-border)' : 'none', minHeight: 0 }}>
              {/* User row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, overflow: 'hidden' }}>
                  <Img src={avatarSrc(profileUser.username, profileUser.avatar)} alt="" fixedWidth={128} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{profileUser.display_name}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>@{profileUser.username}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#ef4444' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ef4444"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  {lightbox.likes}
                </div>
                <ReportButton targetType="post" targetId={lightbox.id} subtitle={`@${profileUser.username} gönderisi`} size={30} canReport={!!me && me.id !== profileUser.id} />
              </div>

              {/* Caption */}
              {lightbox.caption && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', flexShrink: 0, maxHeight: '40%', overflowY: 'auto' }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}><Caption text={lightbox.caption} clamp /></p>
                </div>
              )}

              {/* Comments */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0', display: 'flex', flexDirection: 'column' }}>
                {cmLoading ? (
                  <div style={{ textAlign: 'center', padding: '28px' }}><span className="dots" aria-label="Yükleniyor" role="status"><span></span><span></span><span></span></span></div>
                ) : comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>İlk yorumu sen yaz ✍️</div>
                ) : (
                  topComments.map(c => (
                    <div key={c.id}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 16px' }}>
                        <Link href={`/u/${c.username}`} style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, textDecoration: 'none', overflow: 'hidden' }}>
                          <Img src={avatarSrc(c.username, c.avatar)} alt="" fixedWidth={52} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Link>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.8rem', marginRight: 4 }}>{c.display_name}</span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: 1.4, wordBreak: 'break-word' }}>{c.content}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{timeAgo(c.created_at)}</span>
                            {me && <button onClick={() => { setReplyToId(c.id); setCommentText(`@${c.username} `); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', padding: '1px 0', fontFamily: 'inherit' }}>Yanıtla</button>}
                            <ReportButton targetType="comment" targetId={c.id} subtitle={`@${c.username} yorumu`} variant="inline" canReport={!!me && me.id !== c.user_id} />
                          </div>
                        </div>
                        {me?.id === c.user_id && <button onClick={() => deleteComment(c.id)} aria-label="Yorumu sil" className="hit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', padding: '2px 4px', lineHeight: 1 }}>×</button>}
                      </div>
                      {(repMap.get(c.id) ?? []).map(r => (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 16px', marginLeft: 30, borderLeft: '2px solid var(--color-border)', paddingLeft: 10 }}>
                          <Link href={`/u/${r.username}`} style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, textDecoration: 'none', overflow: 'hidden' }}>
                            <Img src={avatarSrc(r.username, r.avatar)} alt="" fixedWidth={52} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </Link>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.8rem', marginRight: 4 }}>{r.display_name}</span>
                            <span style={{ fontSize: '0.82rem', color: 'var(--color-text)', lineHeight: 1.4, wordBreak: 'break-word' }}>{r.content}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{timeAgo(r.created_at)}</span>
                              <ReportButton targetType="comment" targetId={r.id} subtitle={`@${r.username} yorumu`} variant="inline" canReport={!!me && me.id !== r.user_id} />
                            </div>
                          </div>
                          {me?.id === r.user_id && <button onClick={() => deleteComment(r.id)} aria-label="Yorumu sil" className="hit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', padding: '2px 4px', lineHeight: 1 }}>×</button>}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>

              {/* Comment form / login prompt */}
              {me ? (
                <form onSubmit={submitComment} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, overflow: 'hidden' }}>
                    <Img src={avatarSrc(me.username, me.avatar)} alt="" fixedWidth={52} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <input
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder={replyToId ? '↩ yanıtlanıyor…' : 'Yorum ekle…'}
                    maxLength={300}
                    autoComplete="off"
                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.82rem', fontFamily: 'inherit', color: 'var(--color-text)', minWidth: 0 }}
                  />
                  {replyToId && <button type="button" onClick={() => { setReplyToId(null); setCommentText(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.75rem', fontFamily: 'inherit' }}>×</button>}
                  <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: 4, display: 'flex', alignItems: 'center', opacity: commentText.trim() ? 1 : 0.4, transition: 'opacity 0.15s' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  </button>
                </form>
              ) : (
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', textAlign: 'center', flexShrink: 0 }}>
                  <Link href="/login" style={{ fontSize: '0.82rem', color: 'var(--color-primary)' }}>Yorum yapmak için giriş yap</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hb-cell:hover img, .hb-cell:hover video { transform: scale(1.05); }
        .hb-cell:hover .hb-cell-overlay { opacity: 1 !important; }
        @media (max-width: 640px) {
          .pf-lightbox-box { flex-direction: column !important; border-radius: 20px 20px 0 0 !important; align-self: flex-end !important; max-width: 100% !important; }
        }
      `}</style>

      {reportOpen && (
        <ReportModal targetType="user" targetId={profileUser.id} subtitle={`@${profileUser.username}`} onClose={() => setReportOpen(false)} />
      )}
    </main>
  );
}
