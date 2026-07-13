import { redirect } from 'next/navigation';
import { db, getMe } from '@/lib/supabase/server';
import Link from 'next/link';
import Img from '@/app/components/Img';
import { avatarSrc } from '@/lib/avatar';

export const dynamic = 'force-dynamic';

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}sn`; if (s < 3600) return `${Math.floor(s/60)}dk`; if (s < 86400) return `${Math.floor(s/3600)}sa`; return `${Math.floor(s/86400)}g`;
}

const TYPE_ICON: Record<string, string> = { follow: '👤', comment: '💬', like: '❤️', mention: '@' };
const TYPE_TEXT: Record<string, string> = { follow: 'seni takip etmeye başladı', comment: 'gönderine yorum yaptı', like: 'gönderini beğendi', mention: 'seni bir gönderide etiketledi' };

export default async function NotificationsPage() {
  const { me } = await getMe();
  if (!me) redirect('/login');

  const { data: notifs } = await db
    .from('notifications')
    .select('id, type, is_read, created_at, actor:actor_id(id, username, display_name, avatar)')
    .eq('user_id', me.id)
    .order('created_at', { ascending: false })
    .limit(50);

  // Mark all as read
  await db.from('notifications').update({ is_read: true }).eq('user_id', me.id).eq('is_read', false);

  return (
    <main className="main-content">
      <div className="feed-header">Bildirimler</div>

      {(!notifs || notifs.length === 0) ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '64px 20px', color: 'var(--color-text-muted)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <p style={{ fontWeight: 600, margin: 0 }}>Henüz bildirim yok</p>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>Etkileşimler burada görünecek</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {(notifs ?? []).map((n: any) => {
            const actor = n.actor;
            if (!actor) return null;
            return (
              <Link key={n.id} href={`/u/${actor.username}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--color-border)', textDecoration: 'none', color: 'inherit', background: n.is_read ? 'transparent' : 'rgba(59,130,246,0.04)', transition: 'background 0.1s' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, overflow: 'hidden' }}>
                  <Img src={avatarSrc(actor.username, actor.avatar)} alt="" fixedWidth={128} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 700 }}>{actor.display_name}</span>{' '}
                  <span style={{ color: 'var(--color-text-muted)' }}>{TYPE_TEXT[n.type] ?? 'bir şey yaptı'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: '1.2rem' }}>{TYPE_ICON[n.type] ?? '🔔'}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{timeAgo(n.created_at)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
