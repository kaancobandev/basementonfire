'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Img from '@/app/components/Img';
import { avatarSrc } from '@/lib/avatar';
import { useNavUser } from '@/app/components/NavUserContext';
import TimeAgo from '@/app/components/TimeAgo';
import { useMediaDock } from '@/app/components/MediaDock';
import MusicPlayer, { type MusicTrack } from '@/app/components/MusicPlayer';
import { uploadToStorage } from '@/lib/upload';

interface SpotifyItem {
  id: number; playlist_id: string; title: string; created_at: string;
  user_id: number; username: string; display_name: string; avatar: string | null;
}
interface YouTubeItem {
  id: number; item_type: 'video' | 'playlist'; item_id: string; title: string; created_at: string;
  user_id: number; username: string; display_name: string; avatar: string | null;
}

interface TrackItem {
  id: number; title: string; artist: string | null; src: string;
  duration: number | null; created_at: string;
  user_id: number; username: string; display_name: string; avatar: string | null;
}

interface Props {
  spotifyItems: SpotifyItem[];
  youtubeItems: YouTubeItem[];
  trackItems: TrackItem[];
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

const NoteIcon = ({ size = 17 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
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

// CAM DİL — üç bölüm de (Site / Spotify / YouTube) bu tek kaynağı kullanır,
// böylece görünüm bir yerde değişince üçü birden değişir. Sınıflar globals.css
// yerine burada: bu stil yalnızca /muzik'e ait, global ada ihtiyaç yok.
const cardStyle: React.CSSProperties = {
  background: 'color-mix(in srgb, var(--color-surface) 62%, transparent)',
  border: '1px solid color-mix(in srgb, var(--color-border) 70%, transparent)',
  borderRadius: 16,
  overflow: 'hidden',
  backdropFilter: 'blur(16px) saturate(160%)',
  WebkitBackdropFilter: 'blur(16px) saturate(160%)',
  boxShadow: '0 4px 18px rgba(15,20,25,0.06), inset 0 1px 0 rgba(255,255,255,0.35)',
};

export default function MuzikClient({ spotifyItems: initialSp, youtubeItems: initialYt, trackItems: initialTr }: Props) {
  // Sayfa ISR (paylaşılan HTML) — kimlik NavUserContext'ten. Yalnız ekle/sil
  // butonlarının görünürlüğü için; asıl yetki kontrolü API'larda (sunucuda).
  const currentUserId = useNavUser()?.id ?? null;
  // Gömülü içerik artık sayfada değil DOCK'ta açılır → başka sayfaya
  // geçince çalmaya devam eder (sayfa içi iframe sökülürdü).
  const dock = useMediaDock();
  // Site sekmesi ÖNCE gelir: sitenin kendi içeriği, gömülü içerikten önde.
  const [tab, setTab] = useState<'site' | 'spotify' | 'youtube'>('site');
  const [spItems, setSpItems] = useState(initialSp);
  const [ytItems, setYtItems] = useState(initialYt);
  const [trItems, setTrItems] = useState(initialTr);

  // Çalar ve liste kartları AYNI diziyi paylaşır → karttaki indis ile çalardaki
  // indis birebir eşleşir. Ayrı ayrı üretilirse yanlış parça başlar.
  const siteTracks: MusicTrack[] = trItems.map(t => ({
    title: t.title,
    artist: t.artist || t.display_name || 'Basements',
    src: t.src,
  }));
  // Dock şu an BU listeyi çalıyorsa hangi parçada? Değilse -1.
  const calanIndis = dock?.isCurrent(siteTracks) ? dock.index : -1;

  // Site çalma listesi — yükleme
  const [trTitle, setTrTitle] = useState('');
  const [trArtist, setTrArtist] = useState('');
  const [trFile, setTrFile] = useState<File | null>(null);
  const [trLoading, setTrLoading] = useState(false);
  const [trError, setTrError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

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

  // Açık embed'ler
  // ── Site çalma listesi: yükle ──
  // Dosya tarayıcıdan DOĞRUDAN Storage'a gider (Netlify fonksiyon gövde
  // limitini aşmamak için), sonra yalnızca künyesi API'ye "commit" edilir.
  // Gönderi akışıyla birebir aynı desen (lib/upload.ts).
  async function addTrack() {
    const file = trFile;
    if (!file) { setTrError('Bir ses dosyası seç.'); return; }
    if (!trTitle.trim()) { setTrError('Parça adı gir.'); return; }
    setTrLoading(true); setTrError('');
    try {
      const { path, mediaType } = await uploadToStorage(file, 'media');
      if (mediaType !== 'audio') { setTrError('Bu bir ses dosyası değil.'); return; }

      // Süreyi istemcide ölç: liste ve çalar için ücretsiz bilgi.
      const duration = await new Promise<number | null>(res => {
        const a = document.createElement('audio');
        a.preload = 'metadata';
        a.onloadedmetadata = () => res(Number.isFinite(a.duration) ? a.duration : null);
        a.onerror = () => res(null);
        a.src = URL.createObjectURL(file);
      });

      const r = await fetch('/api/music/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, title: trTitle, artist: trArtist, duration }),
      });
      if (r.status === 401) { window.location.href = '/login'; return; }
      if (!r.ok) { const d = await r.json().catch(() => ({})); setTrError(d.error ?? 'Yüklenemedi.'); return; }
      const row = await r.json();
      setTrItems(prev => [{ ...row, username: '', display_name: 'Sen', avatar: null, user_id: currentUserId ?? 0 }, ...prev]);
      setTrTitle(''); setTrArtist(''); setTrFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (e) {
      setTrError(e instanceof Error ? e.message : 'Yüklenemedi.');
    } finally {
      setTrLoading(false);
    }
  }

  async function deleteTrack(id: number) {
    if (!confirm('Bu parçayı kaldırmak istiyor musun?')) return;
    const r = await fetch('/api/music/track', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    if (r.ok) setTrItems(prev => prev.filter(x => x.id !== id));
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
  // Arama sonucu SAYFA İÇİNDE değil DOCK'ta açılır → başka sayfaya geçince
  // izlemeye devam edilir. enablejsapi=1: dock'un çal/duraklat düğmesi için şart.
  function ytSearchGo() {
    const val = ytSearch.trim();
    if (!val || !dock) return;
    const vid = parseVideoId(val);
    const pl  = parsePlaylistId(val);
    const src = vid
      ? `https://www.youtube.com/embed/${vid}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`
      : pl
        ? `https://www.youtube.com/embed/videoseries?list=${pl}&autoplay=1&rel=0&modestbranding=1&enablejsapi=1`
        : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(val)}&rel=0&modestbranding=1&enablejsapi=1`;
    dock.playEmbed({ provider: 'youtube', src, title: val });
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'color-mix(in srgb, var(--color-surface) 62%, transparent)', border: '1px solid color-mix(in srgb, var(--color-border) 70%, transparent)', borderRadius: 14, padding: '10px 14px', backdropFilter: 'blur(16px) saturate(160%)', WebkitBackdropFilter: 'blur(16px) saturate(160%)' }}>
          <input value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSubmit()} placeholder={placeholder} autoComplete="off" style={inputStyle} />
          <button onClick={onSubmit} disabled={loading} style={{ border: 'none', borderRadius: 8, padding: '7px 18px', fontSize: '0.82rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', color: '#fff', background: btnColor, opacity: loading ? 0.6 : 1, whiteSpace: 'nowrap', transition: 'opacity 0.15s' }}>
            {loading ? '…' : btnText}
          </button>
        </div>
        {error && <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: 8, paddingLeft: 4 }}>{error}</div>}
      </div>
    );
  }

  const tabBtnStyle = (active: boolean, color: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '8px 20px', borderRadius: '9999px',
    border: `1px solid ${active ? color : 'color-mix(in srgb, var(--color-border) 70%, transparent)'}`,
    background: active ? color : 'color-mix(in srgb, var(--color-surface) 55%, transparent)',
    backdropFilter: 'blur(14px) saturate(150%)',
    WebkitBackdropFilter: 'blur(14px) saturate(150%)',
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
        <div style={{ display: 'flex', gap: 6, padding: '4px 16px 16px', borderBottom: '1px solid color-mix(in srgb, var(--color-border) 70%, transparent)', marginBottom: 16, overflowX: 'auto', scrollbarWidth: 'none' }}>
          <button style={tabBtnStyle(tab === 'site', 'var(--color-primary)')} onClick={() => setTab('site')}>
            <NoteIcon /> Site
          </button>
          <button style={tabBtnStyle(tab === 'spotify', '#1db954')} onClick={() => setTab('spotify')}>
            <SpotifyIcon /> Spotify
          </button>
          <button style={tabBtnStyle(tab === 'youtube', '#ff0000')} onClick={() => setTab('youtube')}>
            <YouTubeIcon /> YouTube
          </button>
        </div>

        <div style={{ padding: '0 16px' }}>

          {/* ── SİTE TAB — sitenin KENDİ ses dosyaları (tek çalınabilir kaynak) */}
          {/* Tek kaynak: çalar da kartlar da AYNI diziyi kullanır, yoksa karttaki
              indis ile çalardaki indis kayar ve yanlış parça başlar. */}
          {tab === 'site' && (
            <div>
              {trItems.length > 0 && (
                <div style={{ ...cardStyle, padding: 16, marginBottom: 16, background: 'linear-gradient(135deg, #312e81, #4c1d95)', border: 'none' }}>
                  {/* Çalan parçanın adı çaların ÜSTÜNDE: çalar dar olduğu için
                      başlık orada kırpılabiliyor; burada tam görünür. */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                      {calanIndis >= 0 ? 'Şimdi çalıyor' : 'Site çalma listesi'}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginTop: 2, lineHeight: 1.25 }}>
                      {calanIndis >= 0 ? siteTracks[calanIndis].title : `${trItems.length} parça`}
                    </div>
                    {calanIndis >= 0 && (
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>
                        {siteTracks[calanIndis].artist}
                      </div>
                    )}
                  </div>
                  <MusicPlayer tracks={siteTracks} />
                  <p style={{ margin: '12px 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
                    {trItems.length} parça · listeden bir parçaya dokun ya da ileri/geri ile gez
                  </p>
                </div>
              )}

              {currentUserId && (
                <div style={{ ...cardStyle, padding: 14, marginBottom: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      value={trTitle} onChange={e => setTrTitle(e.target.value)}
                      placeholder="Parça adı" maxLength={120} autoComplete="off"
                      style={{ ...inputStyle, background: 'color-mix(in srgb, var(--color-bg) 60%, transparent)', border: '1px solid color-mix(in srgb, var(--color-border) 70%, transparent)', borderRadius: 10, padding: '9px 12px' }}
                    />
                    <input
                      value={trArtist} onChange={e => setTrArtist(e.target.value)}
                      placeholder="Sanatçı (isteğe bağlı)" maxLength={80} autoComplete="off"
                      style={{ ...inputStyle, background: 'color-mix(in srgb, var(--color-bg) 60%, transparent)', border: '1px solid color-mix(in srgb, var(--color-border) 70%, transparent)', borderRadius: 10, padding: '9px 12px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <input
                        ref={fileRef} type="file" accept="audio/*"
                        onChange={e => { setTrFile(e.target.files?.[0] ?? null); setTrError(''); }}
                        style={{ flex: 1, minWidth: 180, fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'inherit' }}
                      />
                      <button
                        onClick={addTrack} disabled={trLoading}
                        style={{ border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: '0.82rem', fontWeight: 700, cursor: trLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', color: '#fff', background: 'var(--color-primary)', opacity: trLoading ? 0.6 : 1, whiteSpace: 'nowrap' }}
                      >
                        {trLoading ? 'Yükleniyor…' : 'Yükle'}
                      </button>
                    </div>
                  </div>
                  {trError && <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: 8 }}>{trError}</div>}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {trItems.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    <NoteIcon size={36} />
                    <p style={{ margin: 0 }}>Henüz parça yüklenmedi.</p>
                    {!currentUserId && <p style={{ margin: 0, fontSize: '0.82rem' }}>Yüklemek için giriş yap.</p>}
                  </div>
                ) : trItems.map((t, i) => {
                  const caliyor = calanIndis === i;
                  return (
                  <div key={t.id} style={{ ...cardStyle, ...(caliyor ? { borderColor: 'color-mix(in srgb, var(--color-primary) 55%, transparent)', background: 'color-mix(in srgb, var(--color-primary) 7%, var(--color-surface))' } : {}) }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                      {/* Avatar profile gider (küçük, kasıtlı hedef); satırın GERİ KALANI
                          çalar. Eskiden bütün satır profile gidiyordu ve parçayı
                          başlatmanın hiçbir yolu yoktu. */}
                      <Link href={t.username ? `/u/${t.username}` : '#'} aria-label={t.display_name ? `${t.display_name} profili` : 'Profil'} style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, textDecoration: 'none', overflow: 'hidden' }}>
                        <Img src={avatarSrc(t.username, t.avatar)} alt="" fixedWidth={76} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => dock?.playTracks(siteTracks, i)}
                        aria-label={`${t.title} — çal`}
                        style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{t.display_name}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: caliyor ? 700 : 400, color: caliyor ? 'var(--color-primary)' : 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                          {caliyor ? '▸ ' : ''}{t.title}{t.artist ? ` — ${t.artist}` : ''}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                          <TimeAgo iso={t.created_at} />{t.duration ? ` · ${Math.floor(t.duration / 60)}:${String(Math.floor(t.duration % 60)).padStart(2, '0')}` : ''}
                        </span>
                      </button>
                      {currentUserId === t.user_id && (
                        <button onClick={() => deleteTrack(t.id)}
                          aria-label="Parçayı sil"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: '50%', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

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
                  return (
                    <div key={item.id} style={cardStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                        <Link href={item.username ? `/u/${item.username}` : '#'} style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, textDecoration: 'none', overflow: 'hidden' }}>
                          <Img src={avatarSrc(item.username, item.avatar)} alt="" fixedWidth={76} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Link>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {item.username && <Link href={`/u/${item.username}`} style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none' }}>{item.display_name}</Link>}
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                          <TimeAgo iso={item.created_at} style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => dock?.playEmbed({
                              provider: 'spotify',
                              src: `https://open.spotify.com/embed/playlist/${item.playlist_id}?utm_source=generator&theme=0`,
                              title: item.title,
                            })}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: '9999px', padding: '7px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: '#fff', background: '#1db954', transition: 'opacity 0.15s' }}
                          >
                            <PlayIcon />
                            Dinle
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
                <p style={{ margin: '2px 4px 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Aradığın video sağ alt köşedeki oynatıcıda açılır; sitede gezinirken çalmaya devam eder.
                </p>
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
                          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{item.item_type === 'playlist' ? '▶ Playlist' : '▶ Video'} · <TimeAgo iso={item.created_at} /></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => dock?.playEmbed({ provider: 'youtube', src: `${embedSrc}&enablejsapi=1&autoplay=1`, title: item.title })}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: '9999px', padding: '7px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: '#fff', background: '#ff0000', transition: 'opacity 0.15s' }}
                          >
                            <PlayIcon />
                            İzle
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
