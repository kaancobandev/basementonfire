'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MIN_AGE } from '@/lib/age';
import FloatingInput from '@/app/components/FloatingInput';

export default function RegisterForm() {
  // Doğum tarihi (type=date) floating-label deseniyle uyumsuz — hep "dolu"
  // görünür — bu yüzden kendi düz label'ıyla kalıyor.
  // Zemin var(--color-bg) DEĞİL: buzlu cam kartın üstünde açık gri blok gibi
  // duruyordu. Camla uyumlu saydam beyaz; metin/kenar tokenları kartta ezili.
  const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid var(--color-border)', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' as const, color: 'var(--color-text)', backgroundColor: 'rgba(255,255,255,0.07)' };
  const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' } as const;
  const linkStyle = { color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' } as const;

  // Gelecek tarih seçilmesin. Sunucuda ZATEN doğrulanıyor; bu sadece kolaylık.
  // SSR'da boş → hidrasyon uyuşmazlığı olmasın diye mount'tan sonra atanır.
  const [maxDate, setMaxDate] = useState('');
  useEffect(() => { setMaxDate(new Date().toISOString().slice(0, 10)); }, []);

  return (
    <form method="POST" action="/api/auth/register" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <FloatingInput id="reg-username" type="text" name="username" label="Kullanıcı adı" required autoComplete="username" />
      <FloatingInput id="reg-email" type="email" name="email" label="E-posta" required autoComplete="email" />
      <FloatingInput id="reg-password" type="password" name="password" label="Şifre (en az 6 karakter)" required autoComplete="new-password" minLength={6} />

      {/* Yaş kapısı — Basementonfire 16+ */}
      <div>
        <label style={labelStyle} htmlFor="reg-birthdate">Doğum tarihi</label>
        <input id="reg-birthdate" type="date" name="birthdate" required autoComplete="bday"
          max={maxDate || undefined}
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
          onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
        />
        <p style={{ margin: '5px 0 0', fontSize: '0.76rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
          Basementonfire <strong>{MIN_AGE} yaş ve üzeri</strong> içindir. Doğum tarihin yaşını doğrulamak için kullanılır,
          profilinde gösterilmez.
        </p>
      </div>

      {/* Koşul + gizlilik onayı */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--color-text)', cursor: 'pointer' }}>
        <input type="checkbox" name="terms" value="1" required
          style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
        />
        <span>
          <Link href="/kosullar" target="_blank" style={linkStyle}>Kullanım Koşulları</Link>&apos;nı ve{' '}
          <Link href="/gizlilik" target="_blank" style={linkStyle}>Gizlilik Politikası</Link>&apos;nı okudum, kabul ediyorum.
          {' '}({MIN_AGE} yaşından büyük olduğumu beyan ederim.)
        </span>
      </label>

      {/* .auth-submit: bkz. LoginForm — kart tokenından bağımsız koyu gradyan. */}
      <button type="submit" className="auth-submit">Kayıt Ol</button>
    </form>
  );
}
