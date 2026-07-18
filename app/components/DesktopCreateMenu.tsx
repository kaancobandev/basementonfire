'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Masaüstü kenar çubuğundaki "Gönderi Paylaş" — artık tıklayınca seçenek
 * menüsü açar: Makale Yaz (yeni), Fotoğraflı/Videolu Gönderi, Hikaye, Bilgi Kartı.
 * Mobilde aynı seçenekler MobileCreateSheet (alt sayfa) ile sunulur.
 */
const OPTIONS = [
  {
    href: '/makale/yeni', label: 'Makale Yaz', badge: 'Yeni',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>,
  },
  {
    href: '/gonderi-olustur', label: 'Fotoğraflı / Videolu Gönderi',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>,
  },
  {
    // `/feed?story=1` — `/?story=1` DEĞİL: middleware girişli kullanıcıyı zaten
    // /feed'e atıyor ve bu menü yalnızca girişliye görünüyor. Doğrudan hedefe git.
    href: '/feed?story=1', label: 'Hikaye',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>,
  },
  {
    href: '/bilgi-karti', label: 'Bilgi Kartı',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>,
  },
];

export default function DesktopCreateMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="dcm" ref={ref}>
      {open && (
        <div className="dcm-menu" role="menu">
          {OPTIONS.map((o) => (
            <Link key={o.href} href={o.href} className={`dcm-item${o.badge ? ' dcm-item--new' : ''}`} role="menuitem" onClick={() => setOpen(false)}>
              {o.icon}
              <span className="dcm-label">{o.label}</span>
              {o.badge && <span className="dcm-badge">{o.badge}</span>}
            </Link>
          ))}
        </div>
      )}
      <button type="button" className="post-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
        <span>Gönderi Paylaş</span>
      </button>

      <style>{`
        .dcm { position: relative; }
        .dcm-menu {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 0; right: 0;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 14px;
          box-shadow: 0 12px 36px rgba(0,0,0,0.18);
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          z-index: 120;
          animation: dcm-pop 0.14s ease;
        }
        @keyframes dcm-pop { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .dcm-item {
          display: flex; align-items: center; gap: 11px;
          padding: 11px 12px; border-radius: 10px;
          color: var(--color-text); text-decoration: none;
          font-weight: 600; font-size: 0.9rem;
        }
        .dcm-item:hover { background: var(--color-hover); }
        .dcm-label { flex: 1; }
        .dcm-item--new { color: var(--color-primary); }
        .dcm-badge { font-size: 0.62rem; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; color: #fff; background: var(--color-primary); padding: 2px 7px; border-radius: 9999px; }
      `}</style>
    </div>
  );
}
