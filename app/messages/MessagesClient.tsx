'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getSupa } from '@/lib/supabase/client';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import Img from '@/app/components/Img';

interface OtherUser { id: number; username: string; display_name: string; avatar: string | null; }
interface Conversation { id: number; otherUser: OtherUser; lastMessage: any; unreadCount: number; avatarBg: string; lastTimeAgo: string; }
interface Message { id: number; content: string; sender_id: number; created_at: string; sender?: any; }
interface Me { id: number; username: string; display_name: string; avatar: string; }

interface Props {
  conversations: Conversation[];
  me: Me;
}

function avatarBg(u: string) {
  const cs = ['linear-gradient(135deg,#667eea,#764ba2)','linear-gradient(135deg,#f093fb,#f5576c)','linear-gradient(135deg,#4facfe,#00f2fe)','linear-gradient(135deg,#43e97b,#38f9d7)','linear-gradient(135deg,#fa709a,#fee140)','linear-gradient(135deg,#a18cd1,#fbc2eb)','linear-gradient(135deg,#fda085,#f6d365)','linear-gradient(135deg,#96fbc4,#f9f586)'];
  let h = 0; for (const c of u) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return cs[Math.abs(h) % cs.length];
}
function timeStr(iso: string) { const d = new Date(iso); return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }); }
function dayLabel(iso: string) {
  const d = new Date(iso), now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Bugün';
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Dün';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function MessagesClient({ conversations: initialConvs, me }: Props) {
  const [convs, setConvs] = useState(initialConvs);
  const [msgAnimateRef] = useAutoAnimate<HTMLDivElement>();
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [activeOtherUser, setActiveOtherUser] = useState<OtherUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [gifSearch, setGifSearch] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);
  const [gifLoading, setGifLoading] = useState(false);
  const msgBoxRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gifSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const realtimeChRef = useRef<ReturnType<typeof getSupa>['channel'] extends (...args: any[]) => infer R ? R : never | null>(null as any);
  const activeOtherUserRef = useRef<OtherUser | null>(null);

  // Mesaj kutusu ref'i — STABİL olmak ZORUNDA. msgAnimateRef (auto-animate) zaten
  // stabil; bu birleşik callback'i useCallback ile sabitliyoruz. Aksi halde inline
  // arrow her render'da yeni kimlik alır → React her commit'te ref'i söküp takar →
  // auto-animate her seferinde setController(yeni nesne) çağırır → sonsuz re-render
  // (React #185 "Maximum update depth exceeded", konuşma açılınca çöker). Stabil ref
  // ile callback yalnızca mount/unmount'ta çalışır.
  const setMsgBoxRef = useCallback((el: HTMLDivElement | null) => {
    msgBoxRef.current = el;
    msgAnimateRef(el);
  }, [msgAnimateRef]);

  // Aktif konuşma değişince realtime kanalı yenile
  useEffect(() => {
    if (!activeConvId) return;
    const supa = getSupa();

    // Önceki kanalı kapat
    if (realtimeChRef.current) {
      supa.removeChannel(realtimeChRef.current);
    }

    const ch = supa
      .channel(`dm-conv-${activeConvId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConvId}` },
        (payload: any) => {
          const msg = payload.new as Message;
          // Kendi gönderdiğimiz mesaj zaten optimistik olarak eklendi
          if (msg.sender_id === me.id) return;
          const other = activeOtherUserRef.current;
          const incoming: Message = {
            ...msg,
            sender: {
              id: msg.sender_id,
              username: other?.username ?? '',
              display_name: other?.display_name ?? '',
              avatar: other?.avatar ?? null,
            },
          };
          setMessages(prev => [...prev, incoming]);
          // Okundu işaretle (arka planda)
          fetch(`/api/dm/${activeConvId}/messages`).catch(() => {});
        }
      )
      .subscribe();

    realtimeChRef.current = ch;

    return () => {
      supa.removeChannel(ch);
    };
  }, [activeConvId, me.id]);

  async function openConv(convId: number, otherUser: OtherUser) {
    activeOtherUserRef.current = otherUser;
    setActiveConvId(convId);
    setActiveOtherUser(otherUser);
    setPanelOpen(true);
    setMsgLoading(true);
    setMessages([]);
    setGifPickerOpen(false);
    try {
      const res = await fetch(`/api/dm/${convId}/messages`);
      const data = await res.json();
      setMessages(data.messages ?? []);
      setConvs(prev => prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c));
    } finally {
      setMsgLoading(false);
    }
  }

  useEffect(() => {
    if (msgBoxRef.current) msgBoxRef.current.scrollTop = msgBoxRef.current.scrollHeight;
  }, [messages]);

  async function sendMsg(e: React.FormEvent, content?: string) {
    e?.preventDefault();
    if (!activeConvId) return;
    const text = (content ?? msgText).trim();
    if (!text) return;
    setMsgText('');
    const optimistic: Message = { id: Date.now(), content: text, sender_id: me.id, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    const res = await fetch(`/api/dm/${activeConvId}/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: text }) });
    if (!res.ok) { setMessages(prev => prev.filter(m => m.id !== optimistic.id)); setMsgText(text); }
    else {
      setConvs(prev => {
        const c = prev.find(x => x.id === activeConvId);
        if (!c) return prev;
        const updated = { ...c, lastMessage: { content: text, sender_id: me.id, created_at: new Date().toISOString() }, lastTimeAgo: 'şimdi' };
        return [updated, ...prev.filter(x => x.id !== activeConvId)];
      });
    }
  }

  async function loadGifs(q: string) {
    setGifLoading(true);
    const res = await fetch(`/api/giphy?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setGifs(data.data ?? []);
    setGifLoading(false);
  }

  function sendGif(url: string) {
    setGifPickerOpen(false);
    const content = `__GIF__${url}`;
    sendMsg(null as any, content);
  }

  // Search users
  useEffect(() => {
    if (!searchQ.trim()) { setSearchResults([]); return; }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQ)}&type=users`);
      const { users } = await res.json();
      setSearchResults(users ?? []);
    }, 300);
  }, [searchQ]);

  // GIF search
  useEffect(() => {
    if (!gifPickerOpen) return;
    if (gifSearchTimer.current) clearTimeout(gifSearchTimer.current);
    gifSearchTimer.current = setTimeout(() => loadGifs(gifSearch), 400);
  }, [gifSearch, gifPickerOpen]);

  useEffect(() => { if (gifPickerOpen && gifs.length === 0) loadGifs(''); }, [gifPickerOpen]);

  async function startConv(username: string, otherUser: any) {
    setNewModalOpen(false); setSearchQ(''); setSearchResults([]);
    const res = await fetch('/api/dm/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) });
    const { id } = await res.json();
    if (id) {
      if (!convs.find(c => c.id === id)) {
        setConvs(prev => [{ id, otherUser, lastMessage: null, unreadCount: 0, avatarBg: avatarBg(username), lastTimeAgo: '' }, ...prev]);
      }
      openConv(id, otherUser);
    }
  }

  function msgPreview(msg: any) {
    if (!msg) return 'Konuşma başlatıldı';
    if (msg.content.startsWith('__GIF__')) return (msg.sender_id === me.id ? 'Sen: ' : '') + 'GIF';
    const text = msg.content.length > 60 ? msg.content.slice(0, 60) + '…' : msg.content;
    return (msg.sender_id === me.id ? 'Sen: ' : '') + text;
  }

  let lastDay = '';
  const msgElements: React.ReactElement[] = [];
  for (const m of messages) {
    const day = dayLabel(m.created_at);
    if (day !== lastDay) {
      msgElements.push(<div key={`day-${m.created_at}`} style={{ textAlign: 'center', fontSize: '0.72rem', color: '#555', margin: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />{day}<div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} /></div>);
      lastDay = day;
    }
    const mine = m.sender_id === me.id;
    const isGif = m.content.startsWith('__GIF__');
    msgElements.push(
      <div key={m.id} style={{ display: 'flex', alignItems: 'flex-end', gap: 6, maxWidth: '72%', alignSelf: mine ? 'flex-end' : 'flex-start', flexDirection: mine ? 'row-reverse' : 'row' }}>
        {!mine && (
          <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff', background: activeOtherUser ? avatarBg(activeOtherUser.username) : '#555', overflow: 'hidden' }}>
            {activeOtherUser?.avatar ? <Img src={activeOtherUser.avatar} alt="" fixedWidth={128} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (activeOtherUser?.display_name[0].toUpperCase() ?? '?')}
          </div>
        )}
        {isGif ? (
          <div style={{ borderRadius: 12, overflow: 'hidden', maxWidth: 200, ...(mine ? { borderBottomRightRadius: 4 } : { borderBottomLeftRadius: 4 }) }}>
            <img src={m.content.slice(7)} alt="GIF" loading="lazy" style={{ width: '100%', display: 'block' }} />
          </div>
        ) : (
          <div style={{ padding: '9px 14px', borderRadius: 18, fontSize: '0.88rem', lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap', ...(mine ? { background: '#d4a564', color: '#0f0e0d', borderBottomRightRadius: 4 } : { background: 'rgba(255,255,255,0.08)', color: '#e8e0d8', borderBottomLeftRadius: 4 }) }}>
            {m.content}
          </div>
        )}
        <span style={{ fontSize: '0.65rem', color: '#666', whiteSpace: 'nowrap', padding: '0 4px 2px' }}>{timeStr(m.created_at)}</span>
      </div>
    );
  }

  return (
    <main className="dm-main" style={{ display: 'flex', height: 'calc(100dvh)', overflow: 'hidden', flex: 1, background: '#0f0e0d' }}>
      {/* Sidebar */}
      <div style={{ width: 320, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', overflow: 'hidden', ...(panelOpen ? { display: 'none' } : {}) }} className="dm-sidebar-col">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e8e0d8', margin: 0 }}>Mesajlar</h1>
          <button onClick={() => setNewModalOpen(true)} style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#d4a564', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}>
          {convs.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1.5rem', gap: 10, color: '#666', textAlign: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <p style={{ fontWeight: 600, color: '#888', margin: 0 }}>Henüz mesajın yok</p>
              <span style={{ fontSize: '0.82rem' }}>Bir kullanıcıya mesaj atmak için profiline git.</span>
            </div>
          ) : convs.map(c => (
            <button key={c.id} onClick={() => openConv(c.id, c.otherUser)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', width: '100%', background: activeConvId === c.id ? 'rgba(212,165,100,0.07)' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', color: '#fff', background: c.avatarBg, overflow: 'hidden' }}>
                  {c.otherUser.avatar ? <Img src={c.otherUser.avatar} alt="" fixedWidth={128} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : c.otherUser.display_name[0].toUpperCase()}
                </div>
                {c.unreadCount > 0 && <span style={{ position: 'absolute', top: 1, right: 1, width: 11, height: 11, borderRadius: '50%', background: '#d4a564', border: '2px solid #0f0e0d' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e8e0d8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.otherUser.display_name}</span>
                <span style={{ fontSize: '0.8rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msgPreview(c.lastMessage)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                {c.lastTimeAgo && <span style={{ fontSize: '0.72rem', color: '#666' }}>{c.lastTimeAgo}</span>}
                {c.unreadCount > 0 && <span style={{ background: '#d4a564', color: '#0f0e0d', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>{c.unreadCount}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {!activeConvId ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#555', textAlign: 'center', padding: '2rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <p style={{ fontWeight: 600, color: '#777', margin: 0, fontSize: '1rem' }}>Bir konuşma seç</p>
            <span style={{ fontSize: '0.85rem' }}>Mesajlaşmaya başlamak için soldan bir konuşma seç.</span>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
              <button onClick={() => { setPanelOpen(false); setActiveConvId(null); }} style={{ display: 'none', background: 'none', border: 'none', color: '#d4a564', cursor: 'pointer', padding: 4, borderRadius: '50%', alignItems: 'center' }} className="dm-back-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: activeOtherUser ? avatarBg(activeOtherUser.username) : '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '1rem', overflow: 'hidden' }}>
                {activeOtherUser?.avatar ? <Img src={activeOtherUser.avatar} alt="" fixedWidth={128} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (activeOtherUser?.display_name[0].toUpperCase() ?? '?')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Link href={`/u/${activeOtherUser?.username}`} style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e8e0d8', textDecoration: 'none' }}>{activeOtherUser?.display_name}</Link>
                <span style={{ fontSize: '0.78rem', color: '#888' }}>@{activeOtherUser?.username}</span>
              </div>
            </div>

            {/* Messages */}
            <div ref={setMsgBoxRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 6, scrollbarWidth: 'thin' }}>
              {msgLoading ? <div style={{ textAlign: 'center', color: '#666', fontSize: '0.85rem', padding: '2rem 0' }}>Mesajlar yükleniyor…</div> : messages.length === 0 ? <div style={{ textAlign: 'center', color: '#666', fontSize: '0.85rem', padding: '2rem 0' }}>Henüz mesaj yok — ilk mesajı sen gönder!</div> : msgElements}
            </div>

            {/* GIF picker */}
            {gifPickerOpen && (
              <div style={{ height: 300, borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0a0908', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '10px 12px 8px', flexShrink: 0, position: 'relative' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', color: '#666', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input value={gifSearch} onChange={e => setGifSearch(e.target.value)} placeholder="GIF ara…" autoComplete="off" style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9999px', padding: '8px 14px 8px 34px', fontSize: '0.85rem', color: '#e8e0d8', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, alignContent: 'start', scrollbarWidth: 'thin' }}>
                  {gifLoading ? <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#555', fontSize: '0.82rem' }}>Yükleniyor…</div> : gifs.length === 0 ? <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#555', fontSize: '0.82rem' }}>GIF bulunamadı</div> : gifs.map((gif: any) => {
                    const url = gif.images?.fixed_width?.url ?? gif.images?.original?.url;
                    if (!url) return null;
                    return <button key={gif.id} type="button" onClick={() => sendGif(url)} style={{ aspectRatio: '1', overflow: 'hidden', borderRadius: 6, cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: 'none', padding: 0, transition: 'opacity 0.15s' }}><img src={url} alt={gif.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /></button>;
                  })}
                </div>
              </div>
            )}

            {/* Input bar */}
            <form onSubmit={sendMsg} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
              <button type="button" onClick={() => setGifPickerOpen(p => !p)} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: gifPickerOpen ? 'rgba(212,165,100,0.18)' : 'rgba(255,255,255,0.05)', color: '#d4a564', fontWeight: 800, fontSize: '0.65rem', letterSpacing: '0.02em', cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}>GIF</button>
              <input value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Mesaj yaz…" maxLength={1000} autoComplete="off" style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9999px', padding: '10px 16px', fontSize: '0.9rem', color: '#e8e0d8', outline: 'none', fontFamily: 'inherit' }} />
              <button type="submit" style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: '#d4a564', color: '#0f0e0d', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* New message modal */}
      {newModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) { setNewModalOpen(false); setSearchQ(''); setSearchResults([]); } }}>
          <div style={{ background: '#1a1510', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 400, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, color: '#e8e0d8' }}>
              <span>Yeni Mesaj</span>
              <button onClick={() => { setNewModalOpen(false); setSearchQ(''); setSearchResults([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4, borderRadius: '50%', display: 'flex', alignItems: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Kullanıcı ara…" autoComplete="off" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9999px', padding: '10px 16px', fontSize: '0.9rem', color: '#e8e0d8', outline: 'none', width: '100%', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {searchResults.length === 0 && searchQ && <p style={{ padding: '12px', color: '#666', fontSize: '0.85rem' }}>Kullanıcı bulunamadı</p>}
              {searchResults.map((u: any) => (
                <div key={u.id} onClick={() => startConv(u.username, { id: u.id, username: u.username, display_name: u.display_name ?? u.username, avatar: u.avatar ?? null })} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 4px', cursor: 'pointer', borderRadius: 12, transition: 'background 0.15s' }} onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')} onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#fff', background: avatarBg(u.username), overflow: 'hidden' }}>
                    {u.avatar ? <Img src={u.avatar} alt="" fixedWidth={128} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (u.display_name ?? u.username)[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#e8e0d8' }}>{u.display_name ?? u.username}</div>
                    <div style={{ fontSize: '0.78rem', color: '#888' }}>@{u.username}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Mobil (uygulamanın alt-nav eşiği 699px) — tek panel: liste VEYA sohbet.
           Liste (.dm-sidebar-col) tam genişlik olur; bir konuşma açılınca inline
           display:none ile gizlenir (artık !important display:flex onu ezmiyor),
           sohbet paneli tüm ekranı kaplar. Geri butonu görünür olur. <main> alt
           navigasyon (56px) payını bırakır ki giriş çubuğu nav'ın arkasında kalmasın. */
        @media (max-width: 699px) {
          .dm-main { height: calc(100dvh - 56px) !important; }
          .dm-sidebar-col { width: 100% !important; border-right: none !important; }
          .dm-back-btn { display: inline-flex !important; }
        }
      `}</style>
    </main>
  );
}
