'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Img from '@/app/components/Img';
import { toast } from 'sonner';
import ReportButton from '@/app/components/ReportButton';
import { avatarSrc } from '@/lib/avatar';

type Comment = {
  id: number;
  content: string;
  created_at: string;
  username: string;
  display_name: string;
  avatar: string | null;
  is_mine: boolean;
};
type State =
  | { phase: 'loading' }
  | { phase: 'hidden' }
  | { phase: 'ready'; loggedIn: boolean; saved: boolean; comments: Comment[] };

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}sn`;
  if (s < 3600) return `${Math.floor(s / 60)}dk`;
  if (s < 86400) return `${Math.floor(s / 3600)}sa`;
  return `${Math.floor(s / 86400)}g`;
}

export default function ArticleDiscussion({ slug }: { slug: string }) {
  const [st, setSt] = useState<State>({ phase: 'loading' });
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [savingBusy, setSavingBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/articles/${slug}/social`);
        const d = await r.json();
        if (!alive) return;
        if (!d.available) { setSt({ phase: 'hidden' }); return; }
        setSt({ phase: 'ready', loggedIn: !!d.loggedIn, saved: !!d.saved, comments: d.comments ?? [] });
      } catch {
        if (alive) setSt({ phase: 'hidden' });
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  async function toggleSave() {
    if (st.phase !== 'ready' || savingBusy) return;
    if (!st.loggedIn) { window.location.href = '/login'; return; }
    setSavingBusy(true);
    const prev = st.saved;
    setSt({ ...st, saved: !prev }); // optimistik
    try {
      const r = await fetch(`/api/articles/${slug}/save`, { method: 'POST' });
      if (r.status === 401) { window.location.href = '/login'; return; }
      const d = await r.json();
      if (!r.ok || typeof d.saved === 'undefined') { setSt(s => s.phase === 'ready' ? { ...s, saved: prev } : s); return; }
      setSt(s => s.phase === 'ready' ? { ...s, saved: d.saved } : s);
      toast.success(d.saved ? 'Okuma listene eklendi 📚' : 'Okuma listenden çıkarıldı');
    } catch {
      setSt(s => s.phase === 'ready' ? { ...s, saved: prev } : s);
    } finally {
      setSavingBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (st.phase !== 'ready' || sending) return;
    const content = text.trim();
    if (!content) return;
    if (!st.loggedIn) { window.location.href = '/login'; return; }
    setSending(true);
    try {
      const r = await fetch(`/api/articles/${slug}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (r.status === 401) { window.location.href = '/login'; return; }
      const d = await r.json();
      if (!r.ok || !d.comment) { toast.error(d.error ?? 'Yorum eklenemedi'); setSending(false); return; }
      setSt(s => s.phase === 'ready' ? { ...s, comments: [...s.comments, d.comment] } : s);
      setText('');
    } catch {
      toast.error('Bağlantı hatası');
    } finally {
      setSending(false);
    }
  }

  async function remove(id: number) {
    if (st.phase !== 'ready') return;
    const removed = st.comments.find(c => c.id === id);
    setSt({ ...st, comments: st.comments.filter(c => c.id !== id) }); // optimistik
    // Hata olursa silineni GERI ekle (snapshot'a dönmek yerine) -> bu arada eklenen
    // yeni yorum kaybolmaz; created_at'e göre yeniden sırala.
    const revert = () => { if (removed) setSt(s => s.phase === 'ready' ? { ...s, comments: [...s.comments, removed].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) } : s); };
    try {
      const r = await fetch(`/api/article-comments/${id}`, { method: 'DELETE' });
      if (!r.ok) { revert(); toast.error('Silinemedi'); }
    } catch {
      revert();
    }
  }

  if (st.phase === 'loading' || st.phase === 'hidden') return null;

  return (
    <section className="as-disc" aria-label="Tartışma">
      <div className="as-disc-head">
        <h2 className="as-disc-h">💬 Tartışma {st.comments.length > 0 && <span className="as-disc-count">{st.comments.length}</span>}</h2>
        <div className="as-disc-actions">
          {st.loggedIn && <Link href="/okuma-listesi" className="as-listlink" prefetch={false}>📚 Listem</Link>}
          <button type="button" onClick={toggleSave} className={`as-save ${st.saved ? 'on' : ''}`} disabled={savingBusy}>
            {st.saved ? '✓ Kaydedildi' : '🔖 Kaydet'}
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="as-form">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder={st.loggedIn ? 'Bir yorum yaz…' : 'Yorum yazmak için giriş yap'}
          className="as-input"
        />
        <button type="submit" disabled={!text.trim() || sending} className="as-send">{sending ? '…' : 'Gönder'}</button>
      </form>

      <div className="as-list">
        {st.comments.length === 0 ? (
          <p className="as-empty">İlk yorumu sen yaz ✍️</p>
        ) : st.comments.map(c => (
          <div key={c.id} className="as-c">
            <Link href={`/u/${c.username}`} className="as-c-av">
              <Img src={avatarSrc(c.username, c.avatar)} alt="" fixedWidth={64} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Link>
            <div className="as-c-body">
              <div className="as-c-meta">
                <Link href={`/u/${c.username}`} className="as-c-name">{c.display_name}</Link>
                <span className="as-c-sub">@{c.username} · {timeAgo(c.created_at)}</span>
                <ReportButton targetType="article_comment" targetId={c.id} subtitle={`@${c.username} yorumu`} variant="inline" canReport={st.loggedIn && !c.is_mine} />
                {c.is_mine && <button type="button" onClick={() => remove(c.id)} className="as-c-del" aria-label="Sil">Sil</button>}
              </div>
              <p className="as-c-text">{c.content}</p>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .as-disc { max-width: 820px; margin: 8px auto 0; padding: 18px 16px 8px; }
        .as-disc-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .as-disc-h { font-size: 1.1rem; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 8px; }
        .as-disc-count { font-size: .8rem; font-weight: 700; opacity: .6; }
        .as-disc-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .as-listlink { font-size: .8rem; font-weight: 700; color: inherit; opacity: .7; text-decoration: none; white-space: nowrap; }
        .as-listlink:hover { opacity: 1; color: var(--color-primary); }
        .as-save { flex-shrink: 0; padding: 7px 14px; border-radius: 9999px; font-size: .82rem; font-weight: 700; font-family: inherit; cursor: pointer; color: inherit; border: 1px solid color-mix(in srgb, currentColor 28%, transparent); background: color-mix(in srgb, currentColor 5%, transparent); transition: all .15s; }
        .as-save:hover { border-color: var(--color-primary); color: var(--color-primary); }
        .as-save.on { color: var(--color-primary); border-color: var(--color-primary); background: color-mix(in srgb, var(--color-primary) 12%, transparent); }
        .as-form { display: flex; gap: 8px; align-items: flex-end; margin-bottom: 18px; }
        .as-input { flex: 1; resize: vertical; min-height: 44px; padding: 10px 12px; border-radius: 12px; font-family: inherit; font-size: .9rem; line-height: 1.4; color: inherit; border: 1px solid color-mix(in srgb, currentColor 22%, transparent); background: color-mix(in srgb, currentColor 5%, transparent); box-sizing: border-box; }
        .as-input::placeholder { color: inherit; opacity: .5; }
        .as-input:focus { outline: none; border-color: var(--color-primary); }
        .as-send { flex-shrink: 0; padding: 10px 18px; border-radius: 9999px; border: none; background: var(--color-primary); color: #fff; font-weight: 700; font-size: .88rem; font-family: inherit; cursor: pointer; }
        .as-send:disabled { opacity: .45; cursor: not-allowed; }
        .as-list { display: flex; flex-direction: column; gap: 16px; padding-bottom: 8px; }
        .as-empty { opacity: .55; font-size: .9rem; margin: 4px 0 8px; }
        .as-c { display: flex; gap: 11px; align-items: flex-start; }
        .as-c-av { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: .9rem; text-decoration: none; overflow: hidden; }
        .as-c-body { flex: 1; min-width: 0; }
        .as-c-meta { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
        .as-c-name { font-weight: 700; font-size: .86rem; color: inherit; text-decoration: none; }
        .as-c-sub { font-size: .76rem; opacity: .55; }
        .as-c-del { margin-left: auto; background: none; border: none; color: inherit; opacity: .5; font-size: .74rem; cursor: pointer; font-family: inherit; padding: 2px 4px; }
        .as-c-del:hover { opacity: 1; color: #ef4444; }
        .as-c-text { margin: 3px 0 0; font-size: .9rem; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
      `}</style>
    </section>
  );
}
