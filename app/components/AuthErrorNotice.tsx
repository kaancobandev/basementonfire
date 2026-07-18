'use client';

import { useEffect, useState } from 'react';
import { authMessage } from '@/lib/authMessages';

// `?error=<kod>` kutusu — İSTEMCİDE okunur ki login/register sayfaları statik
// kalabilsin (sunucuda searchParams okumak sayfayı dinamik yapar). Güvenlik
// modeli değişmez: URL'de yalnız KOD taşınır, metin lib/authMessages.ts'ten
// gelir; bilinmeyen kod genel mesaja düşer (içerik enjeksiyonu kapalı kalır).
export default function AuthErrorNotice() {
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => {
    try {
      setCode(new URLSearchParams(window.location.search).get('error'));
    } catch {}
  }, []);

  const message = authMessage(code ?? undefined);
  if (!message) return null;

  return (
    <div role="alert" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px' }}>
      {message}
      {/* Onaysız hesap giriş yapamaz. Kullanıcının burada SIKIŞMASININ
          sebebi buydu: hatayı görüyor ama ne yapacağını bilmiyordu. */}
      {code === 'onaysiz' && (
        <>
          {' '}
          <a href="/eposta-onayi" style={{ color: 'var(--color-danger)', fontWeight: 700, textDecoration: 'underline' }}>
            Onay e-postasını yeniden gönder
          </a>
        </>
      )}
    </div>
  );
}
