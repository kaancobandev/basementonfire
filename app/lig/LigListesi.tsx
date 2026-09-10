'use client';

import Link from 'next/link';
import Img from '@/app/components/Img';
import { avatarSrc } from '@/lib/avatar';
import { useNavUser } from '@/app/components/NavUserContext';

export type LeagueRow = {
  rank: number;
  username: string;
  display_name: string;
  avatar: string | null;
  correct: number;
  answered: number;
  xp: number;
};

const MADALYA = ['🥇', '🥈', '🥉'];

/**
 * Lig tablosunun satırları — TEK sebeple istemci bileşeni: kendi satırını
 * vurgulamak.
 *
 * ⚠ Sayfanın kendisi SUNUCU bileşeni ve öyle kalmalı: `revalidate = 300` +
 * `unstable_cache` ile CDN'den dönüyor ve tabloda kişiye özel HİÇBİR veri yok.
 * Kimlik sunucuda okunsaydı sayfa dinamikleşir, ISR ölürdü. Bu yüzden kimlik
 * istemcide `NavUserContext`ten geliyor (AppShell'in zaten attığı
 * /api/nav-state turundan) — yeni bir istek YOK.
 *
 * `useNavUser()` nav-state cevabı gelene kadar `undefined` döner, yani vurgu
 * bir an geç gelir. Kasıtlı ve zararsız: vurgu YALNIZCA renk değiştiriyor,
 * ölçü değiştirmiyor → geç gelmesi yerleşimi oynatmıyor.
 */
export default function LigListesi({ rows }: { rows: LeagueRow[] }) {
  const ben = useNavUser();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((r) => {
        // `ben` undefined (henüz bilinmiyor) ya da null (çıkışlı) iken false.
        const benMi = !!ben && ben.username === r.username;
        return (
          <Link
            key={r.username}
            href={`/u/${r.username}`}
            aria-current={benMi ? 'true' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 12, textDecoration: 'none', color: 'inherit',
              ...(r.rank === 1 ? { borderColor: '#f59e0b', boxShadow: '0 0 0 1px rgba(245,158,11,0.35)' } : {}),
              // Kendi satırın en sona yazılır: birinciysen altın halka KALIR
              // (kazanımın işareti), zemin ve kenar "bu sensin" der.
              ...(benMi ? { borderColor: 'var(--color-primary)', background: 'var(--color-primary-soft)' } : {}),
            }}
          >
            <span style={{ width: 30, textAlign: 'center', fontSize: r.rank <= 3 ? '1.15rem' : '0.85rem', fontWeight: 800, color: 'var(--color-text-muted)', flexShrink: 0 }}>
              {MADALYA[r.rank - 1] ?? r.rank}
            </span>
            <span style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
              <Img src={avatarSrc(r.username, r.avatar)} alt="" fixedWidth={72} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontWeight: 700, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.display_name}
                {benMi && (
                  <span style={{ marginLeft: 6, fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', borderRadius: 9999, padding: '1px 6px', verticalAlign: 'middle' }}>
                    sen
                  </span>
                )}
              </span>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>@{r.username} · {r.answered} soru</span>
            </span>
            <span style={{ textAlign: 'right', flexShrink: 0 }}>
              {/* ⚠ Kendi satırında zemin --color-primary-soft (#efeafe) oluyor ve
                  --color-success-ink orada 4,27:1'e düşüyor — AA'nın altı. Palete
                  olmayan bir yeşil uydurmak yerine metin rengine dönülüyor. */}
              <span style={{ display: 'block', fontWeight: 800, color: benMi ? 'var(--color-text)' : 'var(--color-success-ink)', fontSize: '1.05rem' }}>{r.correct}</span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>doğru</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
