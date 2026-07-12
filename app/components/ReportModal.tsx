'use client';

import { useEffect, useState } from 'react';

// Yeniden kullanılabilir şikayet modalı. Kullanıcı/gönderi/yorum/makale için.
// /api/report'a gönderir; sebep seçimi + isteğe bağlı not.

const REASONS: { value: string; label: string }[] = [
  { value: 'spam', label: 'Spam / yanıltıcı' },
  { value: 'taciz', label: 'Taciz veya zorbalık' },
  { value: 'nefret', label: 'Nefret söylemi' },
  { value: 'uygunsuz', label: 'Uygunsuz / cinsel içerik' },
  { value: 'siddet', label: 'Şiddet veya tehdit' },
  { value: 'yanlis_bilgi', label: 'Yanlış bilgi' },
  { value: 'diger', label: 'Diğer' },
];

const TITLE: Record<string, string> = { post: 'Gönderiyi şikayet et', comment: 'Yorumu şikayet et', user: 'Kullanıcıyı şikayet et', article: 'Makaleyi şikayet et' };

export default function ReportModal({ targetType, targetId, subtitle, onClose }: {
  targetType: 'post' | 'comment' | 'user' | 'article';
  targetId: number;
  subtitle?: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [err, setErr] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit() {
    if (!reason || state === 'sending') return;
    setState('sending');
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, reason, note: note.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data.error || 'Şikayet gönderilemedi.'); setState('error'); return; }
      setState('done');
    } catch { setErr('Ağ hatası. Tekrar dene.'); setState('error'); }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', display: 'grid', placeItems: 'center', padding: 16 }}
      role="dialog" aria-modal="true" aria-label={TITLE[targetType]}
    >
      <div style={{ background: 'var(--color-surface)', color: 'var(--color-text)', borderRadius: 18, width: '100%', maxWidth: 420, padding: 22, boxShadow: 'var(--shadow-xl)' }}>
        {state === 'done' ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }} aria-hidden>✅</div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px' }}>Şikayetin alındı</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0 0 18px' }}>Ekibimiz en kısa sürede inceleyecek. Teşekkürler.</p>
            <button onClick={onClose} style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', borderRadius: 12, padding: '11px 24px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Kapat</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{TITLE[targetType]}</h2>
              <button onClick={onClose} aria-label="Kapat" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1.4rem', lineHeight: 1, padding: 0 }}>×</button>
            </div>
            {subtitle && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', margin: '0 0 14px', overflowWrap: 'anywhere' }}>{subtitle}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, margin: '4px 0 12px' }}>
              {REASONS.map((r) => (
                <label key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 8px', borderRadius: 10, cursor: 'pointer', background: reason === r.value ? 'var(--color-primary-soft)' : 'transparent' }}>
                  <input type="radio" name="report-reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} style={{ accentColor: 'var(--color-primary)', width: 16, height: 16 }} />
                  <span style={{ fontSize: '0.92rem' }}>{r.label}</span>
                </label>
              ))}
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="İstersen ek bilgi ekle (opsiyonel)…"
              maxLength={500}
              rows={2}
              style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', padding: '9px 11px', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none' }}
            />

            {state === 'error' && <p style={{ color: 'var(--color-danger)', fontSize: '0.82rem', margin: '10px 0 0' }} role="alert">{err}</p>}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={onClose} style={{ background: 'transparent', border: '1.5px solid var(--color-border)', color: 'var(--color-text)', borderRadius: 12, padding: '10px 18px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Vazgeç</button>
              <button
                onClick={submit}
                disabled={!reason || state === 'sending'}
                style={{ background: reason ? 'var(--color-danger)' : 'var(--color-border)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontWeight: 700, cursor: reason ? 'pointer' : 'not-allowed', opacity: state === 'sending' ? 0.7 : 1, fontFamily: 'inherit' }}
              >
                {state === 'sending' ? 'Gönderiliyor…' : 'Şikayet et'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
