'use client';

/** Çerez onayını siler ve sayfayı yeniler → banner yeniden çıkar (onayı geri çekme). */
export default function ConsentReset() {
  function reset() {
    try { localStorage.removeItem('cookie-consent'); } catch {}
    location.reload();
  }
  return (
    <button
      type="button"
      onClick={reset}
      style={{ marginTop: 10, padding: '9px 16px', borderRadius: 9999, border: '1.5px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}
    >
      Çerez tercihimi sıfırla
    </button>
  );
}
