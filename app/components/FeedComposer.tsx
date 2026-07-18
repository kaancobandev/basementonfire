'use client';

import { useState } from 'react';
import Img from '@/app/components/Img';
import { avatarSrc } from '@/lib/avatar';
import { MAX_POLL_OPTIONS, MIN_POLL_OPTIONS, POLL_OPTION_MAXLEN } from '@/lib/polls';

/**
 * Akış üstündeki hızlı besteci: metin gönderisi + isteğe bağlı anket.
 * Anket, sosyal akışın en düşük sürtünmeli etkileşimi (tek dokunuş, yazı
 * gerektirmez) — bu yüzden anket varken metin ZORUNLU DEĞİL.
 *
 * Medyalı gönderi ayrı akışta kalır (/gonderi-olustur): orası kırpma/yükleme
 * içeren ağır bir form, burası tek satırlık kutu.
 */
export default function FeedComposer({
  currentUser,
  onPosted,
}: {
  currentUser: { id: number; username: string; display_name: string; avatar: string | null };
  onPosted: (post: any) => void;
}) {
  const [content, setContent] = useState('');
  const [pollOpen, setPollOpen] = useState(false);
  const [options, setOptions] = useState<string[]>(['', '']);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const filledOptions = options.map(o => o.trim()).filter(Boolean);
  const pollReady = !pollOpen || filledOptions.length >= MIN_POLL_OPTIONS;
  const canSubmit = !busy && pollReady && (content.trim().length > 0 || (pollOpen && filledOptions.length >= MIN_POLL_OPTIONS));

  async function submit() {
    if (!canSubmit) return;
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), poll: pollOpen ? filledOptions : undefined }),
      });
      const d = await res.json();
      if (!res.ok || !d.post) { setError(d.error ?? 'Paylaşılamadı'); return; }
      onPosted(d.post);
      setContent(''); setOptions(['', '']); setPollOpen(false);
    } catch {
      setError('Bağlantı hatası');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 470, margin: '16px auto 0', padding: '0 8px' }}>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 12 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
            <Img src={avatarSrc(currentUser.username, currentUser.avatar)} alt="" fixedWidth={72} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </span>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value.slice(0, 500))}
            placeholder={pollOpen ? 'Anketine bir soru ekle (isteğe bağlı)' : 'Ne düşünüyorsun?'}
            rows={content.length > 60 || pollOpen ? 3 : 1}
            style={{ flex: 1, resize: 'vertical', border: 'none', outline: 'none', background: 'transparent', color: 'var(--color-text)', fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: 1.5, padding: '7px 0' }}
          />
        </div>

        {pollOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10, paddingLeft: 46 }}>
            {options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  value={opt}
                  onChange={e => setOptions(prev => prev.map((o, j) => j === i ? e.target.value.slice(0, POLL_OPTION_MAXLEN) : o))}
                  placeholder={`Seçenek ${i + 1}`}
                  style={{ flex: 1, padding: '8px 11px', borderRadius: 9, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'inherit', fontSize: '0.86rem', outline: 'none' }}
                />
                {options.length > MIN_POLL_OPTIONS && (
                  <button type="button" onClick={() => setOptions(prev => prev.filter((_, j) => j !== i))} aria-label="Seçeneği kaldır" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.05rem', padding: 4 }}>×</button>
                )}
              </div>
            ))}
            {options.length < MAX_POLL_OPTIONS && (
              <button type="button" onClick={() => setOptions(prev => [...prev, ''])} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'inherit', padding: '2px 0' }}>
                + Seçenek ekle
              </button>
            )}
          </div>
        )}

        {error && <p style={{ margin: '8px 0 0 46px', fontSize: '0.8rem', color: 'var(--color-danger)' }}>{error}</p>}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, paddingLeft: 46 }}>
          <button
            type="button"
            onClick={() => { setPollOpen(v => !v); setError(''); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid var(--color-border)', borderRadius: 9999, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700, color: pollOpen ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
          >
            📊 {pollOpen ? 'Anketi kaldır' : 'Anket ekle'}
          </button>
          {content.length > 400 && (
            <span style={{ fontSize: '0.75rem', color: content.length >= 500 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>{500 - content.length}</span>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            style={{ marginLeft: 'auto', padding: '7px 18px', borderRadius: 9999, border: 'none', background: canSubmit ? 'var(--color-primary)' : 'var(--color-border)', color: canSubmit ? '#fff' : 'var(--color-text-muted)', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'inherit', cursor: canSubmit ? 'pointer' : 'default' }}
          >
            {busy ? '…' : 'Paylaş'}
          </button>
        </div>
      </div>
    </div>
  );
}
