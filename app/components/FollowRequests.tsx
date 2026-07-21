'use client';

// Gelen takip istekleri kutusu — /notifications'ın en üstünde (Instagram modeli).
// Yalnız GİZLİ hesap sahibinde dolu olur; boşsa ve yüklenene kadar hiç yer kaplamaz.
// follow_requests tablosu yoksa (SQL uykuda) sunucu boş liste döner → görünmez.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Img from './Img';
import { avatarSrc } from '@/lib/avatar';

type Req = { id: number; username: string; display_name: string; avatar: string | null };

export default function FollowRequests() {
  const [reqs, setReqs] = useState<Req[] | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/follow-requests').then((r) => r.json()).then((d) => setReqs(d.requests ?? [])).catch(() => setReqs([]));
  }, []);

  async function act(id: number, action: 'accept' | 'reject') {
    if (busy) return;
    setBusy(id);
    try {
      const r = await fetch('/api/follow-requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterId: id, action }),
      });
      if (r.ok) setReqs((prev) => (prev ?? []).filter((x) => x.id !== id));
    } finally { setBusy(null); }
  }

  if (!reqs || reqs.length === 0) return null;

  return (
    <div style={{ borderBottom: '8px solid var(--color-border)' }}>
      <div style={{ padding: '12px 20px 6px', fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-text)' }}>
        Takip İstekleri <span style={{ color: 'var(--color-primary)' }}>({reqs.length})</span>
      </div>
      {reqs.map((u) => (
        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px' }}>
          <Link href={`/u/${u.username}`} style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, overflow: 'hidden' }}>
            <Img src={avatarSrc(u.username, u.avatar)} alt="" fixedWidth={128} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Link>
          <Link href={`/u/${u.username}`} style={{ flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.display_name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>@{u.username}</div>
          </Link>
          <button type="button" onClick={() => act(u.id, 'accept')} disabled={busy === u.id}
            style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 8, border: 'none', background: 'var(--color-primary)', color: '#fff', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
            {busy === u.id ? '…' : 'Onayla'}
          </button>
          <button type="button" onClick={() => act(u.id, 'reject')} disabled={busy === u.id}
            style={{ flexShrink: 0, padding: '7px 12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
            Sil
          </button>
        </div>
      ))}
    </div>
  );
}
