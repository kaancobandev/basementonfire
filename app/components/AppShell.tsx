'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Toaster, toast } from 'sonner';
import Logo from './Logo';
import DesktopCreateMenu from './DesktopCreateMenu';

const RealtimeProvider = dynamic(() => import('./RealtimeProvider'), { ssr: false });
// Mobil paylaş-sheet'i (framer-motion) ayrı parça olarak yüklenir → framer-motion ANA bundle'dan çıkar.
const MobileCreateSheet = dynamic(() => import('./MobileCreateSheet'), { ssr: false });

interface AppShellProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/', id: 'home', label: 'Ana Sayfa', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: '/discover', id: 'discover', label: 'İçerikler', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
  { href: '/akis', id: 'akis', label: 'Akış', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg> },
  { href: '/muzik', id: 'muzik', label: 'Müzik', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> },
  { href: '/messages', id: 'messages', label: 'Mesajlar', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: '/profile', id: 'profile', label: 'Profil', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg> },
];

function getActiveId(pathname: string) {
  // Ana sayfa artık STATİK LANDING (çıkışlı ziyaretçi için); girişli kullanıcının
  // zengin akışı /feed'de. İkisi de nav'da "Ana Sayfa" olarak işaretlenir.
  if (pathname === '/' || pathname.startsWith('/feed')) return 'home';
  if (pathname.startsWith('/discover')) return 'discover';
  if (pathname.startsWith('/akis')) return 'akis';
  if (pathname.startsWith('/muzik')) return 'muzik';
  if (pathname.startsWith('/messages')) return 'messages';
  if (pathname.startsWith('/profile')) return 'profile';
  if (pathname.startsWith('/settings')) return 'settings';
  return '';
}

const NOTIF_ICONS: Record<string, string> = { follow: '👤', comment: '💬', like: '❤️', mention: '@' };
const NOTIF_TEXT: Record<string, string> = {
  follow: 'Biri seni takip etmeye başladı',
  comment: 'Gönderine yeni bir yorum yapıldı',
  like: 'Gönderini biri beğendi',
  mention: 'Biri seni bir gönderide etiketledi',
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const activeId = getActiveId(pathname);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // ── Kişiye özel nav durumu — root layout artık auth OKUMADIĞI için (statik
  // sayfa hedefi) istemci mount'ta /api/nav-state'ten çekilir. Auth-hint (inline
  // script, data-auth) ilk boyamada nav'ı doğru gösterir; bu fetch ismi/sayaçları
  // doldurur ve hint'i kesinleştirir. user=undefined → henüz bilinmiyor.
  const [user, setUser] = useState<{ id: number; username: string; display_name: string } | null | undefined>(undefined);
  const [myId, setMyId] = useState<number | null>(null);
  const [convIds, setConvIds] = useState<number[]>([]);

  // ── Badge sayaçları (başlangıç 0, nav-state doldurur, realtime ile artar)
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch('/api/nav-state', { credentials: 'same-origin' })
      .then(r => r.json())
      .then((d: { user?: { id: number; username: string; display_name: string } | null; unreadCount?: number; unreadMsgCount?: number; myId?: number | null; convIds?: number[] }) => {
        if (!alive) return;
        setUser(d.user ?? null);
        setNotifCount(d.unreadCount ?? 0);
        setMsgCount(d.unreadMsgCount ?? 0);
        setMyId(d.myId ?? null);
        setConvIds(d.convIds ?? []);
        // Auth-hint'i kesin sonuçla düzelt (ör. çerez vardı ama oturum düşmüş):
        // nav'ın CSS-toggle'ı bu attribute'a bağlı.
        try { document.documentElement.setAttribute('data-auth', d.user ? 'in' : 'out'); } catch {}
      })
      .catch(() => { if (alive) setUser(null); });
    return () => { alive = false; };
  }, []);

  // ── Tema durumu (sonner Toaster'ını uygulama temasıyla eşleştirmek için)
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // ── Realtime callbacks
  const handleNotif = useCallback((type: string) => {
    const icon = NOTIF_ICONS[type] ?? '🔔';
    const text = NOTIF_TEXT[type] ?? 'Yeni bildirim';
    toast(text, { icon });
    setNotifCount(n => n + 1);
  }, []);

  const handleMsg = useCallback((convId: number) => {
    // Mesajlar sayfasındaki aktif konuşmaysa toast gösterme
    const onMessages = pathname === '/messages';
    if (onMessages) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('c') === String(convId)) return;
    }
    toast('Yeni mesaj aldın', { icon: '💬' });
    setMsgCount(n => n + 1);
  }, [pathname]);

  // Bildirimler sayfasına gidince sayacı sıfırla
  useEffect(() => {
    if (pathname === '/notifications') setNotifCount(0);
    if (pathname === '/messages') setMsgCount(0);
  }, [pathname]);

  // Theme init + data-theme değişimini izle (sonner Toaster teması için)
  useEffect(() => {
    try {
      const t = localStorage.getItem('theme');
      if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    } catch {}
    const read = () => setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  function openSheet() { setSheetOpen(true); }
  function closeSheet() { setSheetOpen(false); }

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password';
  if (isAuthPage) return <>{children}</>;

  return (
    <>
      <div className="app-shell">
        {/* Desktop Sidebar */}
        <aside className="sidebar">
          <Link href="/" className="sidebar-logo">
            <Logo size={36} className="sidebar-logo-img" />
            <span>Basements</span>
          </Link>

          <nav className="sidebar-nav">
            {navItems.map(item => (
              // Girişliyse "Ana Sayfa" akışa (/feed) gider; çıkışlıysa landing'e (/).
              // user=undefined (henüz bilinmiyor) → landing: soğuk ziyaretçi için doğru taraf.
              <Link key={item.id} href={item.id === 'home' ? (user ? '/feed' : '/') : item.href} aria-label={item.label} className={`nav-link${activeId === item.id ? ' active' : ''}`}>
                <span className="nav-icon-wrap">
                  {item.icon}
                  {item.id === 'messages' && msgCount > 0 && (
                    <span className="notif-badge">{msgCount > 99 ? '99+' : msgCount}</span>
                  )}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Giriş yapmış menüsü: oluştur + ayarlar + çıkış. `.auth-in` (globals.css)
              yalnız data-auth="in"'de görünür → inline auth-hint sayesinde ilk
              boyamada doğru, flash yok; kesin durumu /api/nav-state doldurur. */}
          <div className="auth-in">
            <DesktopCreateMenu />
            <Link href="/settings" className={`nav-link${activeId === 'settings' ? ' active' : ''}`}>
              <span className="nav-icon-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              </span>
              <span>Ayarlar</span>
            </Link>
            <form action="/api/auth/logout" method="POST" style={{ margin: 0 }}>
              <button type="submit" className="nav-link" style={{ color: 'var(--color-danger)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                <span>Çıkış Yap</span>
              </button>
            </form>
          </div>
          {/* Giriş yapmamış: giriş butonu. `.auth-out` yalnız data-auth="in" DEĞİLken görünür. */}
          <Link href="/login" className="post-btn auth-out">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
            <span>Giriş Yap</span>
          </Link>

          <div className="sidebar-legal">
            <Link href="/gizlilik">Gizlilik</Link><span aria-hidden>·</span>
            <Link href="/aydinlatma">KVKK</Link><span aria-hidden>·</span>
            <Link href="/acik-riza">Açık Rıza</Link><span aria-hidden>·</span>
            <Link href="/kosullar">Koşullar</Link>
          </div>
        </aside>

        {children}
      </div>

      {/* Floating notification bell (only on home) */}
      {activeId === 'home' && (
        <Link href="/notifications" className="notif-float" aria-label="Bildirimler">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          {notifCount > 0 && (
            <span className="notif-float-badge">{notifCount > 99 ? '99+' : notifCount}</span>
          )}
        </Link>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {[
            { href: '/', id: 'home', label: 'Ana Sayfa', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
            { href: '/discover', id: 'discover', label: 'İçerikler', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
            { href: '/akis', id: 'akis', label: 'Akış', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg> },
            { href: '/muzik', id: 'muzik', label: 'Müzik', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> },
          ].map(item => (
            <Link key={item.id} href={item.id === 'home' ? (user ? '/feed' : '/') : item.href} aria-label={item.label} className={`mobile-nav-btn${activeId === item.id ? ' active' : ''}`}>
              {item.icon}
              <span className="mobile-nav-label">{item.label}</span>
            </Link>
          ))}

          {user && (
            <button className="mobile-create-btn" type="button" aria-label="Paylaş" onClick={openSheet}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          )}

          <Link href="/messages" aria-label={`Mesajlar${msgCount > 0 ? ` (${msgCount} okunmamış)` : ''}`} className={`mobile-nav-btn${activeId === 'messages' ? ' active' : ''}`}>
            <span className="nav-icon-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {msgCount > 0 && <span className="notif-badge">{msgCount > 99 ? '99+' : msgCount}</span>}
            </span>
            <span className="mobile-nav-label">Mesajlar</span>
          </Link>

          <Link href="/profile" aria-label="Profil" className={`mobile-nav-btn${activeId === 'profile' ? ' active' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
            <span className="mobile-nav-label">Profil</span>
          </Link>
        </div>
      </nav>

      {/* Mobil paylaş-sheet'i — lazy yüklenen ayrı parça (framer-motion ana bundle'da değil) */}
      {user && <MobileCreateSheet open={sheetOpen} onClose={closeSheet} />}

      {/* Toasts — sonner */}
      <Toaster theme={theme} position="bottom-center" />

      {/* Supabase Realtime — sadece giriş yapılmışsa */}
      {myId && (
        <RealtimeProvider
          myId={myId}
          convIds={convIds}
          onNotif={handleNotif}
          onMsg={handleMsg}
        />
      )}
    </>
  );
}
