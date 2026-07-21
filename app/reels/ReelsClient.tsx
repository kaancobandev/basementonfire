'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Img from '@/app/components/Img';
import { avatarSrc } from '@/lib/avatar';

export type Reel = {
  id: number;
  videoUrl: string;
  caption: string;
  likes: number;
  comments: number;
  liked: boolean;
  username: string;
  displayName: string;
  avatar: string | null;
};

export default function ReelsClient({ reels, loggedIn }: { reels: Reel[]; loggedIn: boolean }) {
  const [muted, setMuted] = useState(true);
  const [userPaused, setUserPaused] = useState<Record<number, boolean>>({});
  const [likeState, setLikeState] = useState<Record<number, { liked: boolean; likes: number }>>(
    () => Object.fromEntries(reels.map((r) => [r.id, { liked: r.liked, likes: r.likes }])),
  );
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const mutedRef = useRef(true);

  // `muted`'i imperatif uygula (React'in muted prop'u güvenilir değil, bkz.
  // MediaCarousel) + tüm videolara yay.
  useEffect(() => {
    mutedRef.current = muted;
    videoRefs.current.forEach((v) => { if (v) v.muted = muted; });
  }, [muted]);

  // Görünürdeki reel oynar, diğerleri durur + başa sarılır (tarayıcı otomatik
  // oynatma yalnız muted'da izin verir → videolar sessiz başlar, kullanıcı açar).
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          const idx = Number(v.dataset.index);
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            v.muted = mutedRef.current;
            setUserPaused((p) => (p[idx] ? { ...p, [idx]: false } : p));
            v.play().catch(() => {});
          } else {
            v.pause();
            if (!e.isIntersecting) { try { v.currentTime = 0; } catch {} }
          }
        });
      },
      { threshold: [0, 0.6, 1] },
    );
    videoRefs.current.forEach((v) => { if (v) obs.observe(v); });
    return () => obs.disconnect();
  }, [reels.length]);

  function togglePlay(idx: number) {
    const v = videoRefs.current[idx];
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setUserPaused((p) => ({ ...p, [idx]: false })); }
    else { v.pause(); setUserPaused((p) => ({ ...p, [idx]: true })); }
  }

  async function toggleLike(id: number) {
    if (!loggedIn) { window.location.href = '/login'; return; }
    const cur = likeState[id] ?? { liked: false, likes: 0 };
    const prev = { ...cur };
    setLikeState((s) => ({ ...s, [id]: { liked: !cur.liked, likes: cur.likes + (cur.liked ? -1 : 1) } }));
    try {
      const res = await fetch(`/api/quick-facts/${id}/like`, { method: 'POST' });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const d = await res.json();
      if (!res.ok || typeof d.liked === 'undefined') { setLikeState((s) => ({ ...s, [id]: prev })); return; }
      setLikeState((s) => ({ ...s, [id]: { liked: d.liked, likes: d.likes } }));
    } catch { setLikeState((s) => ({ ...s, [id]: prev })); }
  }

  if (!reels.length) {
    return (
      <main style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: '2.4rem' }}>🎬</div>
        <h1 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text)' }}>Henüz reel yok</h1>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: 320 }}>Video içeren gönderiler burada tam ekran görünür. İlk videoyu sen paylaş!</p>
        <Link href="/feed" style={{ marginTop: 6, padding: '10px 18px', borderRadius: 9999, background: 'var(--color-accent)', color: '#0f0e0d', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>Akışa dön</Link>
      </main>
    );
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: '#000', zIndex: 1,
        overflowY: 'scroll', scrollSnapType: 'y mandatory',
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
      }}
      className="reels-scroll"
    >
      <style>{`.reels-scroll::-webkit-scrollbar{display:none}`}</style>
      {reels.map((r, i) => {
        const ls = likeState[r.id] ?? { liked: r.liked, likes: r.likes };
        return (
          <section key={r.id} style={{ height: '100dvh', scrollSnapAlign: 'start', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <video
              ref={(el) => { videoRefs.current[i] = el; }}
              data-index={i}
              src={r.videoUrl}
              loop
              playsInline
              muted
              preload="metadata"
              onClick={() => togglePlay(i)}
              style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }}
            />

            {/* Duraklatınca ortada oynat ikonu */}
            {userPaused[i] && (
              <button type="button" onClick={() => togglePlay(i)} aria-label="Oynat"
                style={{ position: 'absolute', inset: 0, margin: 'auto', width: 74, height: 74, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </button>
            )}

            {/* Alt sol: yazar + açıklama. Alt dock'u (--nav-space) hesaba katar. */}
            <div style={{ position: 'absolute', left: 0, right: 64, bottom: 0, padding: '0 16px calc(20px + var(--nav-space, 0px))', zIndex: 3, background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)', pointerEvents: 'none' }}>
              <Link href={`/u/${r.username}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', pointerEvents: 'auto', marginBottom: 8 }}>
                <span style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.7)' }}>
                  <Img src={avatarSrc(r.username, r.avatar)} alt="" fixedWidth={68} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </span>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>@{r.username}</span>
              </Link>
              {r.caption && (
                <p style={{ margin: 0, color: '#fff', fontSize: '0.86rem', lineHeight: 1.4, textShadow: '0 1px 4px rgba(0,0,0,0.5)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.caption}</p>
              )}
            </div>

            {/* Sağ eylem rayı */}
            <div style={{ position: 'absolute', right: 10, bottom: 'calc(28px + var(--nav-space, 0px))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, zIndex: 3 }}>
              <button type="button" onClick={() => toggleLike(r.id)} aria-label={ls.liked ? 'Beğeniyi geri al' : 'Beğen'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: ls.liked ? '#ef4444' : '#fff', fontFamily: 'inherit' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill={ls.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }} className="tnum">{ls.likes}</span>
              </button>
              <Link href={`/p/${r.id}`} aria-label="Yorumlar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: '#fff', textDecoration: 'none' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }} className="tnum">{r.comments}</span>
              </Link>
              <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}
                style={{ background: 'rgba(0,0,0,0.35)', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {muted
                  ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5 6 9H2v6h4l5 4z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>}
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
