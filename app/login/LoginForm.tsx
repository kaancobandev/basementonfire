'use client';

export default function LoginForm() {
  return (
    <form method="POST" action="/api/auth/login" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>E-posta</label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="ornek@mail.com"
          style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
          onFocus={e => (e.target.style.borderColor = '#3b82f6')}
          onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Şifre</label>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="Şifreniz"
          style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
          onFocus={e => (e.target.style.borderColor = '#3b82f6')}
          onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
        />
      </div>

      <button
        type="submit"
        style={{ background: '#3b82f6', color: 'white', fontWeight: 700, fontSize: '1rem', padding: '12px', border: 'none', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.15s', marginTop: '4px' }}
        onMouseOver={e => ((e.target as HTMLButtonElement).style.background = '#2563eb')}
        onMouseOut={e => ((e.target as HTMLButtonElement).style.background = '#3b82f6')}
      >
        Giriş Yap
      </button>
    </form>
  );
}
