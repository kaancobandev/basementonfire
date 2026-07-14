'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Props {
  user: { username: string; dm_privacy: string; comment_privacy: string; is_private: boolean; };
}

export default function SettingsClient({ user }: Props) {
  // Hesap silme onayı — kullanıcı adını birebir yazmadan buton açılmaz.
  const [silOnay, setSilOnay] = useState('');
  const [silAcik, setSilAcik] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isPrivate, setIsPrivate] = useState(user.is_private);
  const [dmPrivacy, setDmPrivacy] = useState(user.dm_privacy);
  const [commentPrivacy, setCommentPrivacy] = useState(user.comment_privacy);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem('theme');
      setTheme((t === 'dark' ? 'dark' : 'light'));
    } catch {}
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '');
    try { localStorage.setItem('theme', next); } catch {}
  }

  async function savePrivacy() {
    setSaving(true);
    setSaveError(false);
    try {
      const res = await fetch('/api/settings/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_private: isPrivate, dm_privacy: dmPrivacy, comment_privacy: commentPrivacy }),
      });
      if (!res.ok) { setSaveError(true); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: checked ? 'var(--color-primary)' : 'var(--color-border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <span aria-hidden="true" style={{ position: 'absolute', top: 2, left: checked ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
    </button>
  );

  const SelectInput = ({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: [string, string][]; label: string }) => (
    <select value={value} onChange={e => onChange(e.target.value)} aria-label={label} style={{ padding: '8px 12px', border: '1.5px solid var(--color-border)', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', background: 'var(--color-bg)', color: 'var(--color-text)', cursor: 'pointer' }}>
      {options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
    </select>
  );

  return (
    <main className="main-content">
      <div className="feed-header">Ayarlar</div>

      <div style={{ maxWidth: 600, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Appearance */}
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--color-text)' }}>Görünüm</h2>
          <div style={{ background: 'var(--color-bg)', borderRadius: 16, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Karanlık Mod</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Koyu tema kullan</div>
              </div>
              <Toggle checked={theme === 'dark'} onChange={toggleTheme} label="Karanlık mod" />
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--color-text)' }}>Gizlilik</h2>
          <div style={{ background: 'var(--color-bg)', borderRadius: 16, border: '1px solid var(--color-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Gizli Hesap</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Sadece takipçiler gönderi görebilir</div>
              </div>
              <Toggle checked={isPrivate} onChange={() => setIsPrivate(p => !p)} label="Gizli hesap" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Mesaj Gizliliği</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Kimler mesaj gönderebilir</div>
              </div>
              <SelectInput value={dmPrivacy} onChange={setDmPrivacy} label="Mesaj gizliliği" options={[['everyone','Herkes'],['followers','Takipçilerim'],['none','Kimse']]} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Yorum Gizliliği</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Kimler yorum yapabilir</div>
              </div>
              <SelectInput value={commentPrivacy} onChange={setCommentPrivacy} label="Yorum gizliliği" options={[['everyone','Herkes'],['followers','Takipçilerim'],['none','Kimse']]} />
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button onClick={savePrivacy} disabled={saving} style={{ padding: '12px 24px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '9999px', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'inherit', transition: 'background 0.15s' }}>
              {saving ? 'Kaydediliyor…' : 'Ayarları Kaydet'}
            </button>
            <span role="status" aria-live="polite" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {saved && <span style={{ color: 'var(--color-success)' }}>✓ Kaydedildi</span>}
              {saveError && <span style={{ color: 'var(--color-danger)' }}>Kaydedilemedi. Tekrar dene.</span>}
            </span>
          </div>
        </section>

        {/* Account */}
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--color-text)' }}>Hesap</h2>
          <div style={{ background: 'var(--color-bg)', borderRadius: 16, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            {/* Verilerimi indir — KVKK m. 11 / GDPR m. 15 + m. 20 (veri taşınabilirliği) */}
            <a
              href="/api/account/export"
              download
              style={{ width: '100%', padding: '16px 20px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 12, boxSizing: 'border-box' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              <span style={{ flex: 1 }}>
                Verilerimi indir
                <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 400, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  Profilin, gönderilerin, yorumların ve mesajların — JSON olarak
                </span>
              </span>
            </a>

            <form method="POST" action="/api/auth/logout" style={{ borderTop: '1px solid var(--color-border)' }}>
              <button type="submit" style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                Çıkış Yap
              </button>
            </form>
          </div>
        </section>

        {/* Hakkında / Yasal — mobilde hukuki metinlere tek erişim noktası (sidebar 1200px altında gizli) */}
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--color-text)' }}>Yasal</h2>
          <div style={{ background: 'var(--color-bg)', borderRadius: 16, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            {[
              { href: '/gizlilik', label: 'Gizlilik ve Çerez Politikası' },
              { href: '/aydinlatma', label: 'KVKK Aydınlatma Metni' },
              { href: '/acik-riza', label: 'Açık Rıza Metni' },
              { href: '/kosullar', label: 'Kullanım Koşulları' },
            ].map((d, i) => (
              <Link
                key={d.href}
                href={d.href}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', textDecoration: 'none', color: 'var(--color-text)',
                  fontWeight: 600, fontSize: '0.95rem',
                  borderTop: i === 0 ? 'none' : '1px solid var(--color-border)',
                }}
              >
                {d.label}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </Link>
            ))}
          </div>
        </section>

        {/* Tehlikeli bölge — hesap silme (30 gün geri alma süreli) */}
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px', color: 'var(--color-danger)' }}>Tehlikeli bölge</h2>
          <div style={{ background: 'var(--color-bg)', borderRadius: 16, border: '1px solid color-mix(in srgb, var(--color-danger) 35%, var(--color-border))', overflow: 'hidden' }}>
            {!silAcik ? (
              <button
                onClick={() => setSilAcik(true)}
                style={{ width: '100%', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Hesabımı sil
              </button>
            ) : (
              <div style={{ padding: '18px 20px' }}>
                <p style={{ margin: '0 0 10px', fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--color-text)' }}>
                  Hesabın <strong>hemen gizlenecek</strong> ve <strong>30 gün</strong> içinde giriş yaparsan geri
                  alabileceksin. 30 gün sonra hesabın, gönderilerin, yorumların, hikâyelerin ve gönderdiğin mesajlar
                  <strong> kalıcı olarak silinir</strong> — geri dönüşü olmaz.
                </p>
                <p style={{ margin: '0 0 14px', fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
                  Verilerini önce indirmek istersen yukarıdaki <strong>Verilerimi indir</strong> seçeneğini kullan.
                </p>

                <form method="POST" action="/api/account/delete">
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text)' }}>
                    Onaylamak için kullanıcı adını yaz: <code style={{ color: 'var(--color-danger)' }}>{user.username}</code>
                  </label>
                  <input
                    name="confirm"
                    value={silOnay}
                    onChange={e => setSilOnay(e.target.value)}
                    autoComplete="off"
                    placeholder={user.username}
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--color-border)', borderRadius: 10, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', color: 'var(--color-text)', backgroundColor: 'var(--color-bg)', marginBottom: 12 }}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="submit"
                      disabled={silOnay !== user.username}
                      style={{
                        flex: 1, padding: '12px', border: 'none', borderRadius: 10, fontFamily: 'inherit',
                        fontSize: '0.95rem', fontWeight: 700, color: '#fff',
                        background: 'var(--color-danger)',
                        cursor: silOnay === user.username ? 'pointer' : 'not-allowed',
                        opacity: silOnay === user.username ? 1 : 0.45,
                      }}
                    >
                      Hesabımı sil
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSilAcik(false); setSilOnay(''); }}
                      style={{ flex: 1, padding: '12px', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 600, background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text)', cursor: 'pointer' }}
                    >
                      Vazgeç
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
