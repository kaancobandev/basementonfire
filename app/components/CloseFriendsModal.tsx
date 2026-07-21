'use client';

// Yakın arkadaşlar yönetimi — takip ettiklerin arasından işaretle. Bir hikayeyi
// "yakın arkadaşlar" kitlesiyle paylaşınca yalnız buradakiler görür (filtre
// sunucuda, lib/storyAudience.ts). close_friends tablosu yoksa (SQL çalışmadıysa)
// liste yine gelir ama işaretleme 503 döner → uyarı gösterilir.

import { useEffect, useState } from 'react';
import Img from './Img';
import { avatarSrc } from '@/lib/avatar';

type F = { id: number; username: string; display_name: string; avatar: string | null; close: boolean };

export default function CloseFriendsModal({ onClose }: { onClose: () => void }) {
  const [list, setList] = useState<F[] | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch('/api/close-friends').then(r => r.json()).then(d => setList(d.following ?? [])).catch(() => setList([]));
  }, []);

  async function toggle(f: F) {
    if (saving) return;
    setSaving(f.id); setErr('');
    try {
      const r = await fetch('/api/close-friends', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: f.id, close: !f.close }),
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.error ?? 'Kaydedilemedi'); return; }
      setList(prev => (prev ?? []).map(x => x.id === f.id ? { ...x, close: !!d.close } : x));
    } catch { setErr('Kaydedilemedi'); }
    finally { setSaving(null); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--color-surface)', borderRadius: 18, width: '100%', maxWidth: 420, maxHeight: '82vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>Yakın Arkadaşlar</span>
          <button type="button" onClick={onClose} aria-label="Kapat" style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1 }}>×</button>
        </div>
        {err && <p style={{ color: 'var(--color-danger)', fontSize: '0.82rem', margin: 0, padding: '8px 16px 0' }}>{err}</p>}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
          {list === null ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Yükleniyor…</p>
          ) : list.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>Henüz kimseyi takip etmiyorsun.</p>
          ) : (
            list.map(f => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px' }}>
                <span style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  <Img src={avatarSrc(f.username, f.avatar)} alt="" fixedWidth={72} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.display_name}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>@{f.username}</div>
                </div>
                <button type="button" onClick={() => toggle(f)} disabled={saving === f.id}
                  style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 9999, fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                    border: f.close ? 'none' : '1px solid var(--color-border)',
                    background: f.close ? 'var(--color-primary)' : 'transparent', color: f.close ? '#fff' : 'var(--color-text)' }}>
                  {saving === f.id ? '…' : f.close ? 'Ekli' : 'Ekle'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
