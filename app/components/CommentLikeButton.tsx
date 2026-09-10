'use client';

import { useState } from 'react';
import LikeHeart from '@/app/components/LikeHeart';

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
    // Boşta rengi burada diğer yüzeylerden farklı (soluk); `color` inline
    // yazılamaz (CSS'i ezer) → token custom property ile geçilir.
    <LikeHeart
      size={13}
      liked={liked}
      onToggle={toggle}
      count={likes > 0 ? likes : undefined}
      style={{ ['--bof-like-idle' as string]: 'var(--color-text-muted)', gap: 4, padding: 0, fontSize: '0.72rem', fontWeight: 700 }}
    />
  );
}
