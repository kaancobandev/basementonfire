'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export type RecentRow = {
  id: number;
  created_at: string;
  method: string;
  flag: string;
  country: string;
  city: string | null;
  username: string;
  display_name: string;
  avatar: string | null;
};

// Tarih yereli/saat dilimi server↔client farkı hydration uyuşmazlığı yaratır
// (React #418). Server'da ISO'nun tarih kısmını bas, mount sonrası yerelleştir.
export default function RecentList({ rows }: { rows: RecentRow[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const fmt = (iso: string) => (mounted ? new Date(iso).toLocaleString('tr-TR') : iso.slice(0, 16).replace('T', ' '));

  if (rows.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 32, fontSize: '0.9rem' }}>
        Henüz kayıtlı giriş yok.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {rows.map((r) => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', borderTop: '1px solid var(--color-border)' }}>
          {r.avatar
            ? <img src={r.avatar} alt="" width={34} height={34} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            : <div aria-hidden style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{(r.display_name || r.username || '?').charAt(0).toUpperCase()}</div>}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.username
                ? <Link href={`/u/${r.username}`} style={{ color: 'inherit', textDecoration: 'none' }}>{r.display_name || r.username}</Link>
                : (r.display_name || 'Kullanıcı')}
              {r.method === 'register' && <span style={{ marginLeft: 8, fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-accent-ink)', background: 'var(--color-accent-soft)', padding: '1px 7px', borderRadius: 999 }}>yeni kayıt</span>}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{fmt(r.created_at)}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
            <span style={{ fontSize: '1rem' }}>{r.flag}</span>{' '}
            <span>{r.country}</span>
            {r.city && <div style={{ fontSize: '0.72rem' }}>{r.city}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
