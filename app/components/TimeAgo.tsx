'use client';

// GÖRELİ ZAMAN — hidrasyon güvenli.
//
// SORUN: `{timeAgo(created_at)}` doğrudan render'a yazılınca metin sunucuda ve
// istemcide FARKLI çıkar, çünkü ikisi `Date.now()`u başka anlarda okur. Önbellekli
// sayfalarda fark dakikalara/saatlere ulaşır (/muzik ISR 120sn ile üretilmiş
// HTML'i dakikalarca servis eder) ve React bunu hidrasyon hatası sayar
// (minified React error #418: sunucunun bastığı METİN istemciyle uyuşmuyor).
// React 19 bunu uyarı değil HATA sayıp o ağacı istemcide baştan çizer.
//
// ÇÖZÜM: değer `<time>` içinde `suppressHydrationWarning` ile basılır — React'in
// zaman damgaları için önerdiği kaçış yolu — ve mount'ta gerçek istemci saatiyle
// bir kez tazelenir. Böylece: hata yok, makine-okunur `dateTime` korunur,
// JavaScript kapalıyken bile bir değer görünür.

import { useEffect, useState } from 'react';

/** '5d' · '3sa' · '2g' — sitenin akış/müzik kartlarında kullandığı kısa biçim. */
export function relTime(iso: string, now: number): string {
  const m = Math.floor((now - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(m) || m < 0) return '';
  if (m < 60) return `${m}d`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa`;
  return `${Math.floor(h / 24)}g`;
}

export default function TimeAgo({
  iso, className, style,
}: {
  iso: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  // Mount'tan sonra istemcinin kendi saatiyle bir kez tazele. İlk render
  // sunucununkiyle aynı kod yolunu kullanır; farkı suppressHydrationWarning yutar.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); }, []);

  return (
    <time dateTime={iso} className={className} style={style} suppressHydrationWarning>
      {relTime(iso, now ?? Date.now())}
    </time>
  );
}
