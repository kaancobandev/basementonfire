'use client';

import Img from '@/app/components/Img';
import { avatarSrc } from '@/lib/avatar';
import MediaCarousel, { MultiBadge, AudioThumb, MusicBadge } from '@/app/components/MediaCarousel';
import { useIsMobile } from '@/lib/useIsMobile';
import { factMediaList } from '@/lib/types';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Caption from '@/app/components/Caption';
import AnimatedNumber from '@/app/components/AnimatedNumber';
import type { DbUser, UserProgress } from '@/lib/types';
import { BADGE_MAP, levelFromXp } from '@/lib/badges';
import { toast } from 'sonner';
import { uploadToStorage } from '@/lib/upload';

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const AVATAR_MAX = 10 * 1024 * 1024; // 10 MB (GIF dahil)

// GIF seçici ağır + nadiren açılır → tembel yükle (ana/profil bundle'ına girmez).
const GiphyPicker = dynamic(() => import('@/app/components/GiphyPicker'), { ssr: false });

interface MediaPost { id: number; media_url: string; media_type: string; caption: string; likes: number; created_at: string; media?: { url: string; type: 'image' | 'video' }[] | null; }
interface MyArticle { id: number; slug: string; title: string; status: string; cover_url: string | null; reject_reason: string | null; }

interface Props {
  user: DbUser;
  bg: string;
  age: number | null;
  followersCount: number;
  followingCount: number;
  mediaPosts: MediaPost[];
  savedPosts: MediaPost[];
  repostedPosts: MediaPost[];
  myArticles: MyArticle[];
  isAdmin?: boolean;
  progress: UserProgress | null;
  badgeKeys: string[];
  error: string | null;
}

const GENDER_LABEL: Record<string, string> = { erkek: 'Erkek', kadin: 'Kadın', diger: 'Diğer' };

export default function ProfileClient({ user, bg, age, followersCount, followingCount, mediaPosts, savedPosts, repostedPosts, myArticles, isAdmin, progress, badgeKeys, error }: Props) {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<'posts' | 'saved' | 'reposts' | 'articles'>('posts');
  const [articles, setArticles] = useState<MyArticle[]>(myArticles);
  const [editOpen, setEditOpen] = useState(false);
  const [lightbox, setLightbox] = useState<MediaPost | null>(null);
  const [interests, setInterests] = useState<string[]>(user.interests ?? []);
  const [tagInput, setTagInput] = useState('');
  const [bioLen, setBioLen] = useState((user.bio ?? '').length);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [posts, setPosts] = useState(mediaPosts);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function addTag(val: string) {
    const tag = val.trim().replace(/,/g, '');
    if (!tag || tag.length > 24 || interests.length >= 10 || interests.includes(tag)) return;
    setInterests(prev => [...prev, tag]);
  }
  function removeTag(tag: string) { setInterests(prev => prev.filter(t => t !== tag)); }

  async function handleDelete() {
    if (!lightbox) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/quick-facts/${lightbox.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Silinemedi');
      setPosts(prev => prev.filter(p => p.id !== lightbox.id));
      setLightbox(null);
      setConfirmingDelete(false);
      toast.success('İçerik profilinden kaldırıldı');
    } catch (e: any) {
      toast.error(e?.message ?? 'Bir hata oluştu');
    } finally {
      setDeleting(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // aynı dosyayı tekrar seçebilmek için input'u sıfırla
    if (!file) return;

    // İstemci doğrulaması — hatayı sessizce yutma, kullanıcıya söyle (eski davranışta
    // büyük/yanlış dosya sessizce başarısız oluyordu → "GIF desteklenmiyor" sanılıyordu).
    if (!AVATAR_TYPES.includes(file.type)) {
      toast.error('JPG, PNG, WEBP veya GIF seçebilirsin.');
      return;
    }
    if (file.size > AVATAR_MAX) {
      toast.error('Dosya en fazla 10 MB olabilir (daha küçük/optimize bir GIF dene).');
      return;
    }

    setAvatarUploading(true);
    try {
      // Tarayıcıdan doğrudan Supabase'e yükle (animasyonlu GIF korunur; Netlify
      // gövde limitine takılmaz), sonra yalnızca path'i commit et.
      const { path } = await uploadToStorage(file, 'avatar');
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.avatar_url) throw new Error(data.error ?? 'Avatar güncellenemedi.');
      setAvatarUrl(data.avatar_url);
      toast.success('Profil fotoğrafın güncellendi');
    } catch (err: any) {
      toast.error(err?.message ?? 'Yükleme başarısız oldu.');
    } finally {
      setAvatarUploading(false);
    }
  }

  // GIPHY'den seçilen GIF'i avatar yap (sunucu indirip kendi storage'a koyar).
  async function selectGiphyAvatar(url: string) {
    setGifPickerOpen(false);
    setAvatarUploading(true);
    try {
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giphyUrl: url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.avatar_url) throw new Error(data.error ?? 'Avatar güncellenemedi.');
      setAvatarUrl(data.avatar_url);
      toast.success('Profil fotoğrafın güncellendi');
    } catch (err: any) {
      toast.error(err?.message ?? 'GIF ayarlanamadı.');
    } finally {
      setAvatarUploading(false);
    }
  }

  const presets = ['Müzik','Film','Spor','Seyahat','Yemek','Teknoloji','Sanat','Bilim','Tarih','Oyun','Kitap','Doğa','Fotoğraf','Dans','Moda'];

  return (
    <main className="main-content">
      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 20px', fontSize: '0.85rem', borderBottom: '1px solid #fecaca' }}>{decodeURIComponent(error)}</div>}

      {/* Banner */}
      <div style={{ height: 160, width: '100%', background: bg }} />

      {/* Profile header */}
      <div style={{ padding: '0 20px 16px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -40, marginBottom: 12 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid white', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            <Img src={avatarSrc(user.username, avatarUrl)} alt="" fixedWidth={200} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {isAdmin && (
              <Link href="/yonetim/makaleler" title="Makale onay paneli" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 38, borderRadius: '9999px', border: '2px solid var(--color-primary)', background: 'var(--color-primary)', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Yönetim
              </Link>
            )}
            <Link href="/settings" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: '50%', border: '2px solid var(--color-border)', background: 'white', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </Link>
            <button onClick={() => setEditOpen(true)} style={{ padding: '9px 22px', borderRadius: '9999px', border: '2px solid var(--color-border)', background: 'white', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Profili Düzenle</button>
          </div>
        </div>

        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 2px', overflowWrap: 'anywhere' }}>{user.display_name}</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0 0 8px', overflowWrap: 'anywhere' }}>@{user.username}</p>
        {user.bio ? <p style={{ fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 12px', overflowWrap: 'anywhere' }}>{user.bio}</p> : <p style={{ fontSize: '0.9rem', margin: '0 0 12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Bio eklemek için profili düzenle</p>}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '0 0 10px' }}>
          {user.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>{user.location}</span>}
          {user.website && <a href={user.website} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--color-primary)', textDecoration: 'none', overflowWrap: 'anywhere', minWidth: 0 }}><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>{user.website.replace(/^https?:\/\//, '')}</a>}
          {age !== null && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{age} yaş</span>}
          {user.gender && <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{GENDER_LABEL[user.gender] ?? ''}</span>}
        </div>

        {interests.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '0 0 12px' }}>
            {interests.map(tag => <span key={tag} style={{ background: 'rgba(212,165,100,0.12)', color: '#c4954e', border: '1px solid rgba(212,165,100,0.35)', borderRadius: '9999px', padding: '3px 12px', fontSize: '0.78rem', fontWeight: 600 }}>{tag}</span>)}
          </div>
        )}

        <div style={{ display: 'flex', gap: 20, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          <span><strong style={{ color: 'var(--color-text)' }}><AnimatedNumber value={posts.length} /></strong> Gönderi</span>
          <span><strong style={{ color: 'var(--color-text)' }}><AnimatedNumber value={followersCount} /></strong> Takipçi</span>
          <span><strong style={{ color: 'var(--color-text)' }}><AnimatedNumber value={followingCount} /></strong> Takip</span>
        </div>

        {/* Bilgi & Seri — Günün Sorusu ilerlemesi (XP / seviye / rozet). progress
            yoksa (henüz çözmemiş ya da SQL çalışmamış) bölüm gizlenir. */}
        {progress && (() => {
          const { level, intoLevel, perLevel } = levelFromXp(progress.xp);
          const earned = badgeKeys.map(k => BADGE_MAP[k]).filter(Boolean);
          return (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 14, border: '1px solid var(--color-border)', background: 'linear-gradient(90deg, rgba(16,185,129,0.07), rgba(59,130,246,0.05))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-text)' }}>⭐ Lv {level}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.86rem', fontWeight: 700, color: progress.current_streak > 0 ? '#f97316' : 'var(--color-text-muted)' }}>🔥 {progress.current_streak} gün seri</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{progress.total_correct} doğru · {progress.xp} XP</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  <span>Seviye {level}</span><span>{intoLevel} / {perLevel} XP</span>
                </div>
                <div style={{ height: 7, borderRadius: 9999, background: 'var(--color-border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round((intoLevel / perLevel) * 100)}%`, background: 'linear-gradient(90deg,var(--color-success),var(--color-primary))', borderRadius: 9999 }} />
                </div>
              </div>
              {earned.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {earned.map(b => (
                    <span key={b.key} title={b.desc} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 9999, background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text)' }}>
                      <span>{b.emoji}</span>{b.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
        {[['posts','Gönderiler'],['articles','Makaleler'],['saved','Kaydedilenler'],['reposts','Reposts']].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t as any)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '13px 8px', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--color-text)' : '2px solid transparent', fontSize: '0.85rem', fontWeight: 600, color: tab === t ? 'var(--color-text)' : 'var(--color-text-muted)', cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1 }}>
            {label}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {tab === 'posts' && (
        posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📷</div>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>Henüz gönderi yok</p>
            <p style={{ fontSize: '0.85rem' }}><Link href="/akis" style={{ color: 'var(--color-primary)' }}>İlk gönderini paylaş</Link></p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, padding: 3 }}>
            {posts.map(post => (
              <button key={post.id} onClick={() => { setLightbox(post); setConfirmingDelete(false); }} style={{ aspectRatio: '3/4', overflow: 'hidden', background: 'var(--color-border)', border: 'none', padding: 0, cursor: 'pointer', position: 'relative' }} className="hb-cell">
                {post.media_type === 'audio' ? <AudioThumb /> : post.media_type === 'image' ? <Img src={post.media_url} alt={post.caption} loading="lazy" sizes="(max-width:700px) 33vw, 240px" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.2s' }} /> : <video src={post.media_url} muted preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
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
        )
      )}

      {tab === 'saved' && (
        savedPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔖</div>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>Kaydedilen gönderi yok</p>
            <p style={{ fontSize: '0.85rem' }}>Beğendiğin gönderileri kaydet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, padding: 3 }}>
            {savedPosts.map(post => (
              <button key={post.id} onClick={() => setLightbox(post)} style={{ aspectRatio: '3/4', overflow: 'hidden', background: 'var(--color-border)', border: 'none', padding: 0, cursor: 'pointer', position: 'relative' }} className="hb-cell">
                {post.media_type === 'audio' ? <AudioThumb /> : post.media_type === 'image' ? <Img src={post.media_url} alt={post.caption} loading="lazy" sizes="(max-width:700px) 33vw, 240px" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <video src={post.media_url} muted preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
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
        )
      )}

      {tab === 'reposts' && (
        repostedPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔁</div>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>Henüz repost yok</p>
            <p style={{ fontSize: '0.85rem' }}>Beğendiğin gönderileri repost'la</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, padding: 3 }}>
            {repostedPosts.map(post => (
              <button key={post.id} onClick={() => setLightbox(post)} style={{ aspectRatio: '3/4', overflow: 'hidden', background: 'var(--color-border)', border: 'none', padding: 0, cursor: 'pointer', position: 'relative' }} className="hb-cell">
                {post.media_type === 'audio' ? <AudioThumb /> : post.media_type === 'image' ? <Img src={post.media_url} alt={post.caption} loading="lazy" sizes="(max-width:700px) 33vw, 240px" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <video src={post.media_url} muted preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
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
        )
      )}

      {tab === 'articles' && (
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link href="/makale/yeni" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: 800, textDecoration: 'none', fontSize: '0.92rem' }}>✍️ Yeni makale yaz</Link>
          {articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📝</div>
              <p style={{ fontWeight: 700, marginBottom: 4 }}>Henüz makalen yok</p>
              <p style={{ fontSize: '0.85rem' }}>Kendi makaleni yaz, fontlar/renkler ve interaktif kod ekle.</p>
            </div>
          ) : articles.map(a => {
            const badge = a.status === 'approved' ? { t: 'Yayında', c: '#16a34a' } : a.status === 'pending' ? { t: 'İncelemede', c: '#ca8a04' } : { t: 'Reddedildi', c: '#ef4444' };
            return (
              <div key={a.id} style={{ display: 'flex', gap: 12, padding: 10, border: '1px solid var(--color-border)', borderRadius: 12, alignItems: 'center' }}>
                <div style={{ width: 64, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--color-border)', display: 'grid', placeItems: 'center', fontSize: '1.3rem' }}>
                  {a.cover_url ? <Img src={a.cover_url} alt="" fixedWidth={128} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '✍️'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: badge.c }}>● {badge.t}</span>
                  {a.status === 'rejected' && a.reject_reason && <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Neden: {a.reject_reason}</div>}
                </div>
                <Link href={`/makale/${a.slug}`} style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none', padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 8 }}>Gör</Link>
                <Link href={`/makale/yeni?id=${a.id}`} style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none', padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 8 }}>Düzenle</Link>
                <button type="button" onClick={async () => { if (!window.confirm('Makale silinsin mi?')) return; const r = await fetch(`/api/user-articles/${a.id}`, { method: 'DELETE' }); if (r.ok) { setArticles(p => p.filter(x => x.id !== a.id)); toast('Silindi'); } else toast('Silinemedi'); }} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ef4444', background: 'none', border: '1px solid var(--color-border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Sil</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Profile Modal */}
      {editOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setEditOpen(false); }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 20, width: '100%', maxWidth: 480, padding: 20, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem', fontWeight: 700, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
              <span>Profili Düzenle</span>
              <button onClick={() => setEditOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: 6, borderRadius: '50%' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <form method="POST" action="/api/profile/edit" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div role="button" tabIndex={0} aria-label="Profil fotoğrafını değiştir" aria-busy={avatarUploading} style={{ width: 72, height: 72, flexShrink: 0, borderRadius: '50%', position: 'relative', overflow: 'hidden', cursor: avatarUploading ? 'default' : 'pointer' }} onClick={() => { if (!avatarUploading) document.getElementById('pf-avatar-input')?.click(); }} onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !avatarUploading) { e.preventDefault(); document.getElementById('pf-avatar-input')?.click(); } }}>
                  <Img src={avatarSrc(user.username, avatarUrl)} alt="" fixedWidth={200} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {avatarUploading ? (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                      <div style={{ width: 22, height: 22, border: '3px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'pf-spin 0.7s linear infinite' }} />
                    </div>
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', opacity: 0, transition: 'opacity 0.15s' }} onMouseOver={e => ((e.currentTarget as HTMLElement).style.opacity = '1')} onMouseOut={e => ((e.currentTarget as HTMLElement).style.opacity = '0')}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                    </div>
                  )}
                  <input id="pf-avatar-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={handleAvatarChange} />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.88rem' }}>Profil fotoğrafı</div>
                  <div>{avatarUploading ? 'Yükleniyor…' : 'Yükle (JPG/PNG/GIF · 10 MB) ya da GIPHY\'den seç'}</div>
                  <button type="button" disabled={avatarUploading} onClick={() => setGifPickerOpen(true)} style={{ marginTop: 7, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '0.78rem', fontWeight: 700, cursor: avatarUploading ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 15V9h2.5M7 12h2M13 9v6M16 9h2.5M16 12h2"/></svg>
                    GIF seç
                  </button>
                </div>
                <style>{`@keyframes pf-spin { to { transform: rotate(360deg); } }`}</style>
              </div>

              {gifPickerOpen && (
                <GiphyPicker open onClose={() => setGifPickerOpen(false)} onSelect={selectGiphyAvatar} />
              )}

              {/* Ad — günde 1 kez */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Ad</label>
                <input type="text" name="display_name" defaultValue={user.display_name} maxLength={50} required style={{ width: '100%', border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '10px 14px', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }} />
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Günde bir kez değiştirilebilir.</div>
              </div>

              {/* Kullanıcı adı — 30 günde 1 kez */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Kullanıcı adı</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.95rem', pointerEvents: 'none' }}>@</span>
                  <input type="text" name="username" defaultValue={user.username} maxLength={30} required autoCapitalize="none" autoCorrect="off" spellCheck={false} style={{ width: '100%', border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '10px 14px 10px 26px', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>30 günde bir değiştirilebilir · sadece küçük harf, rakam ve _</div>
              </div>

              {/* Bio */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Bio</label>
                <textarea name="bio" defaultValue={user.bio ?? ''} maxLength={160} onChange={e => setBioLen(e.target.value.length)} style={{ width: '100%', border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '10px 14px', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', background: 'var(--color-bg)', color: 'var(--color-text)', minHeight: 80, resize: 'vertical', boxSizing: 'border-box' }} />
                <div style={{ fontSize: '0.75rem', color: bioLen > 145 ? 'var(--color-danger)' : 'var(--color-text-muted)', textAlign: 'right' }}>{bioLen} / 160</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Şehir / Konum</label>
                  <input type="text" name="location" defaultValue={user.location ?? ''} maxLength={60} placeholder="İstanbul" style={{ width: '100%', border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '10px 14px', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Cinsiyet</label>
                  <select name="gender" defaultValue={user.gender ?? ''} style={{ width: '100%', border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '10px 14px', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }}>
                    <option value="">Belirtmek istemiyorum</option>
                    <option value="erkek">Erkek</option>
                    <option value="kadin">Kadın</option>
                    <option value="diger">Diğer</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Website</label>
                  <input type="text" name="website" defaultValue={user.website ?? ''} maxLength={100} placeholder="basements.com" style={{ width: '100%', border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '10px 14px', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Doğum Tarihi</label>
                  <input type="date" name="birthdate" defaultValue={user.birthdate ?? ''} style={{ width: '100%', border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '10px 14px', fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none', background: 'var(--color-bg)', color: 'var(--color-text)', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Interests */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>İlgi Alanları <span style={{ fontWeight: 400 }}>(en fazla 10)</span></label>
                <input type="hidden" name="interests" value={interests.join(',')} />
                <div role="button" tabIndex={0} aria-label="İlgi alanı ekle" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', minHeight: 44, border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '6px 10px', cursor: 'text' }} onClick={() => document.getElementById('tag-input-field')?.focus()} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('tag-input-field')?.focus(); } }}>
                  {interests.map(tag => (
                    <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(212,165,100,0.15)', color: '#c4954e', borderRadius: '9999px', padding: '2px 10px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4954e', fontSize: '1rem', lineHeight: 1, padding: '0 0 0 2px' }}>×</button>
                    </span>
                  ))}
                  <input id="tag-input-field" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); setTagInput(''); } else if (e.key === 'Backspace' && !tagInput && interests.length) { removeTag(interests[interests.length - 1]); } }} onBlur={() => { if (tagInput.trim()) { addTag(tagInput); setTagInput(''); } }} placeholder="Ekle ve Enter'a bas…" maxLength={24} autoComplete="off" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.85rem', color: 'var(--color-text)', fontFamily: 'inherit', flex: 1, minWidth: 80 }} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {presets.map(p => (
                    <button key={p} type="button" onClick={() => interests.includes(p) ? removeTag(p) : addTag(p)} style={{ background: interests.includes(p) ? 'rgba(212,165,100,0.2)' : 'var(--color-border)', color: interests.includes(p) ? '#c4954e' : 'var(--color-text-muted)', border: 'none', borderRadius: '9999px', padding: '3px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{p}</button>
                  ))}
                </div>
              </div>

              <button type="submit" className="post-btn" style={{ marginTop: 8 }}>Kaydet</button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) { setLightbox(null); setConfirmingDelete(false); } }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 16, display: 'flex', flexDirection: isMobile ? 'column' : 'row', maxWidth: 860, width: '100%', height: '90vh', overflow: 'hidden', position: 'relative' }}>
            <button onClick={() => { setLightbox(null); setConfirmingDelete(false); }} style={{ position: 'absolute', top: 10, right: 10, zIndex: 1, background: 'rgba(0,0,0,0.4)', border: 'none', color: 'white', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
              <MediaCarousel media={factMediaList(lightbox)} caption={lightbox.caption} sizes="(max-width:900px) 100vw, 860px" />
            </div>
            <div style={{ width: isMobile ? '100%' : 280, maxHeight: isMobile ? '42%' : undefined, flexShrink: 0, borderLeft: isMobile ? 'none' : '1px solid var(--color-border)', borderTop: isMobile ? '1px solid var(--color-border)' : 'none', display: 'flex', flexDirection: 'column', padding: 16, gap: 12, minHeight: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, overflow: 'hidden' }}><Img src={avatarSrc(user.username, avatarUrl)} alt="" fixedWidth={72} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.display_name}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>@{user.username}</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--color-danger)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="var(--color-danger)"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  {lightbox.likes}
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, margin: 0, flex: 1, minHeight: 0, overflowY: 'auto' }}><Caption text={lightbox.caption} clamp /></p>
              {posts.some(p => p.id === lightbox.id) && (
                <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
                  {!confirmingDelete ? (
                    <button onClick={() => setConfirmingDelete(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--color-danger)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', padding: '6px 0' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      Sil
                    </button>
                  ) : (
                    <div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '0 0 8px' }}>Bu içerik profilinden kaldırılacak. Emin misin?</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setConfirmingDelete(false)} disabled={deleting} style={{ flex: 1, padding: 8, border: '1px solid var(--color-border)', borderRadius: 8, background: 'none', color: 'var(--color-text)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>Vazgeç</button>
                        <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: 8, border: 'none', borderRadius: 8, background: 'var(--color-danger)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1, fontFamily: 'inherit' }}>{deleting ? 'Siliniyor…' : 'Evet, sil'}</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hb-cell:hover img, .hb-cell:hover video { transform: scale(1.05); }
        .hb-cell:hover .hb-cell-overlay { opacity: 1 !important; }
      `}</style>
    </main>
  );
}
