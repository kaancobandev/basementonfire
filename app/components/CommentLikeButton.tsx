'use client';

import { useState } from 'react';

/**
 * Yorum beğeni düğmesi — kendi iyimser durumunu tutan bağımsız bileşen; üç yorum
 * yüzeyi (PostDetailClient, PostModal, UserProfileClient) de tek satırla düşürür.
 * Üst bileşen yalnız özellik CANLI'yken (comment_likes tablosu var) render eder;
 * bu yüzden burada ayrı bir "enabled" kapısı yok. Çıkış yapmış izleyici de görür,
 * dokununca /login'e gider (gönderi beğenisiyle aynı davranış).
 */
export default function CommentLikeButton({ commentId, initialLikes = 0, initialLiked = false }: {
  commentId: number; initialLikes?: number; initialLiked?: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    const prevLiked = liked, prevLikes = likes;
    // İyimser: hemen güncelle, hata olursa geri al (toggleBookmark deseni).
    setLiked(!prevLiked); setLikes(prevLikes + (prevLiked ? -1 : 1)); setBusy(true);
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: 'POST' });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const d = await res.json();
      if (!res.ok || typeof d.liked === 'undefined') { setLiked(prevLiked); setLikes(prevLikes); return; }
      setLiked(d.liked); setLikes(d.likes);
    } catch { setLiked(prevLiked); setLikes(prevLikes); }
    finally { setBusy(false); }
  }

  return (
    <button type="button" onClick={toggle} aria-pressed={liked} aria-label={liked ? 'Beğeniyi geri al' : 'Beğen'}
      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0, fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: 700, color: liked ? 'var(--color-danger)' : 'var(--color-text-muted)', transition: 'color 0.15s' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
      {likes > 0 && <span className="tnum">{likes}</span>}
    </button>
  );
}
