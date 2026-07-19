'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Img from '@/app/components/Img';
import { avatarSrc } from '@/lib/avatar';
import { useNavUser } from '@/app/components/NavUserContext';

interface SpotifyItem {
  id: number; playlist_id: string; title: string; created_at: string;
  user_id: number; username: string; display_name: string; avatar: string | null;
}
interface YouTubeItem {
  id: number; item_type: 'video' | 'playlist'; item_id: string; title: string; created_at: string;
  user_id: number; username: string; display_name: string; avatar: string | null;
}

interface Props {
  spotifyItems: SpotifyItem[];
  youtubeItems: YouTubeItem[];
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `${m}d`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa`;
  return `${Math.floor(h / 24)}g`;
}

// Spotify logosu SVG
const SpotifyIcon = ({ size = 17 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 0 1-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 0 1 .207.857zm1.223-2.722a.78.78 0 0 1-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 0 1-.973-.517.781.781 0 0 1 .518-.973c3.632-1.102 8.147-.568 11.234 1.328a.78.78 0 0 1 .258 1.071zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 1 1-.543-1.793c3.532-1.072 9.404-.865 13.115 1.338a.937.937 0 0 1-.955 1.612z"/>
  </svg>
);

const YouTubeIcon = ({ size = 17 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>
);
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const cardStyle: React.CSSProperties = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 14,
  overflow: 'hidden',
};

export default function MuzikClient({ spotifyItems: initialSp, youtubeItems: initialYt }: Props) {
  // Sayfa ISR (paylaşılan HTML) — kimlik NavUserContext'ten. Yalnız ekle/sil
  // butonlarının görünürlüğü için; asıl yetki kontrolü API'larda (sunucuda).
  const currentUserId = useNavUser()?.id ?? null;
  const [tab, setTab] = useState<'spotify' | 'youtube'>('spotify');
  const [spItems, setSpItems] = useState(initialSp);
  const [ytItems, setYtItems] = useState(initialYt);

  // Spotify ekle
  const [spUrl, setSpUrl] = useState('');
  const [spLoading, setSpLoading] = useState(false);
  const [spError, setSpError] = useState('');

  // YouTube kaydet
  const [ytUrl, setYtUrl] = useState('');
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState('');

  // YouTube ana oynatıcı
  const [ytSearch, setYtSearch] = useState('');
  const ytIframeRef = useRef<HTMLIFrameElement>(null);

  // Açık embed'ler
  const [openEmbeds, setOpenEmbeds] = useState<Set<string>>(new Set());

  function toggleEmbed(key: string) {
    setOpenEmbeds(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  // Spotify ekle
  async function addSpotify() {
    if (!spUrl.trim()) return;
    setSpLoading(true); setSpError('');
    const res = await fetch('/api/spotify/playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: spUrl }),
    });
    setSpLoading(false);
    if (res.status === 401) { window.location.href = '/login'; return; }
    if (!res.ok) { const d = await res.json().catch(() => ({})); setSpError(d.error ?? 'Hata oluştu.'); return; }
    const newItem = await res.json();
    setSpItems(prev => [{ ...newItem, username: '', display_name: 'Sen', avatar: null, user_id: currentUserId ?? 0 }, ...prev]);
    setSpUrl('');
  }

  // Spotify sil
  async function deleteSpotify(id: number) {
    if (!confirm('Bu playlist\'i kaldırmak istiyor musun?')) return;
    const res = await fetch('/api/spotify/playlist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    if (res.ok) setSpItems(prev => prev.filter(x => x.id !== id));
  }

  // YouTube kaydet
  async function addYouTube() {
    if (!ytUrl.trim()) return;
    setYtLoading(true); setYtError('');
    const res = await fetch('/api/youtube/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: ytUrl }),
    });
    setYtLoading(false);
    if (res.status === 401) { window.location.href = '/login'; return; }
    if (!res.ok) { const d = await res.json().catch(() => ({})); setYtError(d.error ?? 'Hata oluştu.'); return; }
    const newItem = await res.json();
    setYtItems(prev => [{ ...newItem, username: '', display_name: 'Sen', avatar: null, user_id: currentUserId ?? 0 }, ...prev]);
    setYtUrl('');
  }

  // YouTube sil
  async function deleteYouTube(id: number) {
    if (!confirm('Bu içeriği kaldırmak istiyor musun?')) return;
    const res = await fetch('/api/youtube/item', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    if (res.ok) setYtItems(prev => prev.filter(x => x.id !== id));
  }

  // YouTube ana oynatıcı arama
  function parseVideoId(s: string): string | null {
    for (const p of [/[?&]v=([a-zA-Z0-9_-]{11})/, /youtu\.be\/([a-zA-Z0-9_-]{11})/, /embed\/([a-zA-Z0-9_-]{11})/, /shorts\/([a-zA-Z0-9_-]{11})/]) {
      const m = s.match(p); if (m) return m[1];
    }
    if (/^[a-zA-Z0-9_-]{11}$/.test(s.trim())) return s.trim();
    return null;
  }
  function parsePlaylistId(s: string): string | null {
    const m = s.match(/[?&]list=([a-zA-Z0-9_-]+)/); return m ? m[1] : null;
  }
  function ytSearchGo() {
    const val = ytSearch.trim();
    if (!val || !ytIframeRef.current) return;
    const vid = parseVideoId(val);
    const pl  = parsePlaylistId(val);
    if (vid) ytIframeRef.current.src = `https://www.youtube.com/embed/${vid}?autoplay=1&rel=0&modestbranding=1`;
    else if (pl) ytIframeRef.current.src = `https://www.youtube.com/embed/videoseries?list=${pl}&autoplay=1&rel=0&modestbranding=1`;
    else ytIframeRef.current.src = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(val)}&rel=0&modestbranding=1`;
  }

  const inputStyle: React.CSSProperties = {
    flex: 1, border: 'none', background: 'transparent', outline: 'none',
    fontSize: '0.88rem', color: 'var(--color-text)', fontFamily: 'inherit',
  };

  function AddBar({ value, onChange, onSubmit, loading, error, placeholder, btnColor, btnText }: {
    value: string; onChange: (v: string) => void; onSubmit: () => void;
    loading: boolean; error: string; placeholder: string; btnColor: string; btnText: string;
  }) {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-surface)', border: '1.5px solid var(--color-border)', borderRadius: 12, padding: '10px 14px' }}>
          <input value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSubmit()} placeholder={placeholder} autoComplete="off" style={inputStyle} />
          <button onClick={onSubmit} disabled={loading} style={{ border: 'none', borderRadius: 8, padding: '7px 18px', fontSize: '0.82rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', color: '#fff', background: btnColor, opacity: loading ? 0.6 : 1, whiteSpace: 'nowrap', transition: 'opacity 0.15s' }}>
            {loading ? '…' : btnText}
          </button>
        </div>
        {error && <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: 8, paddingLeft: 4 }}>{error}</div>}
      </div>
    );
  }

  function MusicCard({ user, title, time, onPlay, onDelete, isOpen, isOwn, playLabel }: {
    user: { username: string; display_name: string; avatar: string | null };
    title: string; time: string; onPlay: () => void; onDelete?: () => void;
    isOpen: boolean; isOwn: boolean; playLabel: string;
  }) {
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
          <Link href={user.username ? `/u/${user.username}` : '#'} style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, textDecoration: 'none', overflow: 'hidden' }}>
            <Img src={avatarSrc(user.username, user.avatar)} alt="" fixedWidth={76} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Link>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {user.username && (
              <Link href={`/u/${user.username}`} style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none' }}>{user.display_name}</Link>
            )}
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <button onClick={onPlay} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: '9999px', padding: '7px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: '#fff', background: playLabel === 'Dinle' ? '#1db954' : '#ff0000', opacity: isOpen ? 0.8 : 1, transition: 'opacity 0.15s, transform 0.12s' }}>
              {isOpen ? <PauseIcon /> : <PlayIcon />}
              {isOpen ? 'Kapat' : playLabel}
            </button>
            {isOwn && onDelete && (
              <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: '50%', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}
              >
                <TrashIcon />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const tabBtnStyle = (active: boolean, color: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '8px 20px', borderRadius: '9999px',
    border: `1.5px solid ${active ? color : 'var(--color-border)'}`,
    background: active ? color : 'transparent',
    color: active ? '#fff' : 'var(--color-text-muted)',
    fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.15s',
  });

  return (
    <>
      {/* paddingBottom satır içi verilmiyordu: mobilde globals.css'in dock payını
          eziyor ve içeriğin sonu dock'un altında kalıyordu. */}
      <main className="main-content">
        <div className="feed-header">Müzik</div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, padding: '4px 16px 16px', borderBottom: '1px solid var(--color-border)', marginBottom: 16 }}>
          <button style={tabBtnStyle(tab === 'spotify', '#1db954')} onClick={() => setTab('spotify')}>
            <SpotifyIcon /> Spotify
          </button>
          <button style={tabBtnStyle(tab === 'youtube', '#ff0000')} onClick={() => setTab('youtube')}>
            <YouTubeIcon /> YouTube
          </button>
        </div>

        <div style={{ padding: '0 16px' }}>

          {/* ── SPOTIFY TAB */}
          {tab === 'spotify' && (
            <div>
              {currentUserId && (
                <AddBar
                  value={spUrl} onChange={setSpUrl} onSubmit={addSpotify}
                  loading={spLoading} error={spError}
                  placeholder="Spotify playlist URL yapıştır…"
                  btnColor="#1db954" btnText="Ekle"
                />
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {spItems.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    <SpotifyIcon size={36} />
                    <p style={{ margin: 0 }}>Henüz Spotify playlist eklenmedi.</p>
                  </div>
                ) : spItems.map(item => {
                  const key = `sp-${item.id}`;
                  const isOpen = openEmbeds.has(key);
                  return (
                    <div key={item.id} style={cardStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                        <Link href={item.username ? `/u/${item.username}` : '#'} style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, textDecoration: 'none', overflow: 'hidden' }}>
                          <Img src={avatarSrc(item.username, item.avatar)} alt="" fixedWidth={76} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Link>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {item.username && <Link href={`/u/${item.username}`} style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none' }}>{item.display_name}</Link>}
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{timeAgo(item.created_at)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => toggleEmbed(key)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: '9999px', padding: '7px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: '#fff', background: '#1db954', opacity: isOpen ? 0.8 : 1, transition: 'opacity 0.15s' }}
                          >
                            {isOpen ? <PauseIcon /> : <PlayIcon />}
                            {isOpen ? 'Kapat' : 'Dinle'}
                          </button>
                          {currentUserId === item.user_id && (
                            <button onClick={() => deleteSpotify(item.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: '50%', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}
                            >
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      </div>
                      {isOpen && (
                        <div style={{ borderTop: '1px solid var(--color-border)' }}>
                          <iframe
                            src={`https://open.spotify.com/embed/playlist/${item.playlist_id}?utm_source=generator&theme=0`}
                            width="100%" height="352"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            style={{ display: 'block', border: 'none' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── YOUTUBE TAB */}
          {tab === 'youtube' && (
            <div>
              {/* Ana oynatıcı */}
              <div style={{ marginBottom: 20, border: '1.5px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                  <YouTubeIcon size={18} />
                  <input
                    value={ytSearch} onChange={e => setYtSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && ytSearchGo()}
                    placeholder="Ara veya YouTube URL / ID yapıştır…"
                    autoComplete="off"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button onClick={ytSearchGo} style={{ border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: '#fff', background: '#ff0000', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    Ara
                  </button>
                </div>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#0f0f0f' }}>
                  <iframe
                    ref={ytIframeRef}
                    src="https://www.youtube.com/embed?listType=search&list=m%C3%BCzik&rel=0&modestbranding=1"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', display: 'block' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Kaydet bölümü */}
              {currentUserId && (
                <details style={{ marginBottom: 16, border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                  <summary style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', cursor: 'pointer', listStyle: 'none', background: 'var(--color-surface)', transition: 'background 0.12s' }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                    Bu içeriği kaydet
                  </summary>
                  <div style={{ padding: '0 12px 12px', background: 'var(--color-surface)' }}>
                    <div style={{ marginTop: 10 }}>
                      <AddBar
                        value={ytUrl} onChange={setYtUrl} onSubmit={addYouTube}
                        loading={ytLoading} error={ytError}
                        placeholder="YouTube video veya playlist URL yapıştır…"
                        btnColor="#ff0000" btnText="Kaydet"
                      />
                    </div>
                  </div>
                </details>
              )}

              {/* Kaydedilen içerikler */}
              {ytItems.length > 0 && (
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 2px 10px', borderTop: '1px solid var(--color-border)', marginTop: 4 }}>
                  Kaydedilen İçerikler
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ytItems.map(item => {
                  const key = `yt-${item.id}`;
                  const isOpen = openEmbeds.has(key);
                  const embedSrc = item.item_type === 'playlist'
                    ? `https://www.youtube.com/embed/videoseries?list=${item.item_id}&rel=0&modestbranding=1`
                    : `https://www.youtube.com/embed/${item.item_id}?rel=0&modestbranding=1`;
                  return (
                    <div key={item.id} style={cardStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                        <Link href={item.username ? `/u/${item.username}` : '#'} style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, textDecoration: 'none', overflow: 'hidden' }}>
                          <Img src={avatarSrc(item.username, item.avatar)} alt="" fixedWidth={76} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Link>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {item.username && <Link href={`/u/${item.username}`} style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none' }}>{item.display_name}</Link>}
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{item.item_type === 'playlist' ? '▶ Playlist' : '▶ Video'} · {timeAgo(item.created_at)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => toggleEmbed(key)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: '9999px', padding: '7px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: '#fff', background: '#ff0000', opacity: isOpen ? 0.8 : 1, transition: 'opacity 0.15s' }}
                          >
                            {isOpen ? <PauseIcon /> : <PlayIcon />}
                            {isOpen ? 'Kapat' : 'İzle'}
                          </button>
                          {currentUserId === item.user_id && (
                            <button onClick={() => deleteYouTube(item.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: '50%', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; }}
                            >
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      </div>
                      {isOpen && (
                        <div style={{ borderTop: '1px solid var(--color-border)' }}>
                          <iframe
                            src={embedSrc}
                            width="100%" height="315"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen loading="lazy"
                            style={{ display: 'block', border: 'none' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sağ panel — nasıl eklenir */}
      <aside className="right-panel">
        <div className="widget-card">
          <h3>Nasıl eklenir?</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              <SpotifyIcon size={16} />
              <span><strong style={{ color: 'var(--color-text)' }}>Spotify:</strong> Playlist → Paylaş → Bağlantıyı kopyala</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              <YouTubeIcon size={16} />
              <span><strong style={{ color: 'var(--color-text)' }}>YouTube:</strong> Video/Playlist URL'sini kopyala</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
