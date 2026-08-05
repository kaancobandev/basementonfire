'use client';

import Link from 'next/link';
import { useNavUser } from '@/app/components/NavUserContext';

/**
 * Yayindaki makalede yalnizca YAZARINA gorunen duzenleme cubugu.
 *
 * ⚠ Neden istemci bileseni: /makale/[slug] bilerek ISR (revalidate=300) ve
 * getMe() CAGIRMIYOR — makale sayfalarinin CDN'den donmesini saglayan
 * performans kazanimi bu. Sahiplik kontrolunu sunucuda yapmak sayfayi
 * yeniden dinamiklestirir ve o kazanimi geri alirdi. Bu yuzden kapi
 * istemcide, useNavUser() ile.
 *
 * Onbellege giren HTML herkes icin ayni: cubuk yalnizca hidrasyondan sonra,
 * kullanicinin kendi tarayicisinda beliriyor.
 */
export default function OwnerEditBar({ articleId, authorId }: { articleId: number; authorId: number }) {
  const me = useNavUser();
  if (!me || me.id !== authorId) return null;

  return (
    <div className="ua-ownerbar">
      <span>Bu makale senin. Düzenlediğinde yayında kalır; değişikliklerin onaya düşer.</span>
      <Link href={`/makale/yeni?id=${articleId}`} className="ua-ownerbar-edit">Düzenle</Link>
      <style>{`
        .ua-ownerbar {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
          max-width: 720px; margin: 0 auto 4px; padding: 10px 16px;
          border: 1px solid rgba(91,46,239,0.30); background: rgba(91,46,239,0.08);
          border-radius: 12px; font-size: 0.84rem; color: var(--color-text-muted);
        }
        .ua-ownerbar-edit {
          margin-left: auto; padding: 6px 14px; border-radius: 9px;
          border: 1px solid var(--color-border); background: var(--color-surface);
          color: var(--color-text); text-decoration: none; font-weight: 700;
          font-size: 0.82rem; white-space: nowrap;
        }
        .ua-ownerbar-edit:hover { border-color: var(--color-primary); color: var(--color-primary); }
      `}</style>
    </div>
  );
}
