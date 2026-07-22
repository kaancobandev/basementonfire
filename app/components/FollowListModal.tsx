'use client';

// Takipçi / Takip listesi — profildeki sayıya tıklayınca açılır. Liste
// /api/users/[username]/follows'tan gelir; GİZLİLİK sunucuda uygulanır:
// gizli hesabın listesini yalnız sahibi/onaylı takipçisi görür, aksi halde
// { visible:false } → burada "Bu hesap gizli" gösterilir (hiç isim gelmez).

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Img from './Img';
import { avatarSrc } from '@/lib/avatar';

type U = {
  id: number; username: string; display_name: string; avatar: string | null;
  is_private: boolean; youFollow: boolean; isMe: boolean;
};

export default function FollowListModal({ username, type, loggedIn, onClose }: {
  username: string;
  type: 'followers' | 'following';
  loggedIn: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<'loading' | 'private' | 'ok'>('loading');
  const [users, setUsers] = useState<U[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const title = type === 'followers' ? 'Takipçiler' : 'Takip Edilenler';

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    fetch(`/api/users/${encodeURIComponent(username)}/follows?type=${type}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d.visible === false) { setStatus('private'); return; }
        setUsers(Array.isArray(d.users) ? d.users : []);
        setStatus('ok');
      })
      .catch(() => { if (alive) { setUsers([]); setStatus('ok'); } });
    return () => { alive = false; };
  }, [username, type]);

  // Esc ile kapat.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function toggleFollow(u: U) {
    if (busy) return;
    if (!loggedIn) { window.location.href = '/login'; return; }
    setBusy(u.id);
    // İyimser: takip/istek durumunu hemen çevir, hata olursa geri al.
    const prev = u.youFollow;
    setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, youFollow: !prev } : x)));
    try {
      const r = await fetch(`/api/users/${u.username}/follow`, { method: 'POST' });
      if (r.status === 401) { window.location.href = '/login'; return; }
      const d = await r.json();
      // Gizli hesapta 'following' false döner ama 'requested' true olabilir; ikisini de
      // "artık takip/istek var" say → buton "İstek gönderildi/Takip ediliyor" görünür.
      const now = !!d.following || !!d.requested;
      if (!r.ok || (typeof d.following === 'undefined' && typeof d.requested === 'undefined')) {
        setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, youFollow: prev } : x)));
      } else {
        setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, youFollow: now } : x)));
      }
    } catch {
      setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, youFollow: prev } : x)));
    } finally { setBusy(null); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--color-surface)', borderRadius: 18, width: '100%', maxWidth: 420, maxHeight: '82vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{title}</span>
          <button type="button" onClick={onClose} aria-label="Kapat" style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
          {status === 'loading' ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Yükleniyor…</p>
          ) : status === 'private' ? (
            // GİZLİ — hiç isim gelmedi; kilit + açıklama.
            <div style={{ textAlign: 'center', padding: '2.4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 52, height: 52, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>Bu hesap gizli</div>
              <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.5, color: 'var(--color-text-muted)', maxWidth: 260 }}>
                {type === 'followers' ? 'Takipçilerini' : 'Takip ettiklerini'} yalnızca onayladığı takipçiler görebilir.
              </p>
            </div>
          ) : users.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
              {type === 'followers' ? 'Henüz takipçi yok.' : 'Henüz kimseyi takip etmiyor.'}
            </p>
          ) : (
            users.map((u) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px' }}>
                <Link href={`/u/${u.username}`} onClick={onClose} style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, textDecoration: 'none' }}>
                  <Img src={avatarSrc(u.username, u.avatar)} alt="" fixedWidth={80} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Link>
                <Link href={`/u/${u.username}`} onClick={onClose} style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.display_name}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>@{u.username}</div>
                </Link>
                {loggedIn && !u.isMe && (
                  <button type="button" onClick={() => toggleFollow(u)} disabled={busy === u.id}
                    style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 9999, fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                      border: u.youFollow ? '1px solid var(--color-border)' : 'none',
                      background: u.youFollow ? 'transparent' : 'var(--color-primary)',
                      color: u.youFollow ? 'var(--color-text)' : '#fff' }}>
                    {busy === u.id ? '…' : u.youFollow ? 'Takip ediliyor' : 'Takip et'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
