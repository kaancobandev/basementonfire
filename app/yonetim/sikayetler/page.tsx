import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db, getMe, isAdmin } from '@/lib/supabase/server';
import type { ReportTargetType } from '@/lib/reports';
import ReportsClient, { type QueueItem, type ResolvedTarget } from './ReportsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Şikayet Yönetimi',
  robots: { index: false, follow: false },
};

// Dinamik segment kırpma yardımcıları
const snip = (s: string | null | undefined, n = 120) =>
  (s ?? '').replace(/\s+/g, ' ').trim().slice(0, n) || '';

export default async function SikayetYonetimPage() {
  const { me } = await getMe();
  if (!me) redirect('/login');
  if (!isAdmin(me as any)) redirect('/');

  // Açık şikayetler + şikayetçi bilgisi. reports tablosu yoksa (SQL çalışmadı) uykuda.
  const { data: rows, error } = await db
    .from('reports')
    .select('id, reporter_id, target_type, target_id, reason, note, status, created_at, reporter:users(username, display_name)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(200);

  const dormant = error?.code === '42P01';
  const reports = (rows ?? []) as any[];

  // Hedefleri türe göre topla → tek sorguda çöz (polimorfik target_id).
  const byType: Record<ReportTargetType, Set<number>> = { post: new Set(), comment: new Set(), user: new Set(), article: new Set() };
  for (const r of reports) {
    const t = r.target_type as ReportTargetType;
    if (byType[t]) byType[t].add(Number(r.target_id));
  }
  const ids = (t: ReportTargetType) => Array.from(byType[t]);

  const [postsRes, commentsRes, usersRes, articlesRes] = await Promise.all([
    ids('post').length
      ? db.from('quick_facts').select('id, caption, media_url, media_type, users!quick_facts_user_id_fkey(username, display_name)').in('id', ids('post'))
      : Promise.resolve({ data: [] as any[] }),
    ids('comment').length
      ? db.from('comments').select('id, content, post_id, users(username, display_name)').in('id', ids('comment'))
      : Promise.resolve({ data: [] as any[] }),
    ids('user').length
      ? db.from('users').select('id, username, display_name').in('id', ids('user'))
      : Promise.resolve({ data: [] as any[] }),
    ids('article').length
      ? db.from('user_articles').select('id, slug, title, users!user_articles_user_id_fkey(username, display_name)').in('id', ids('article'))
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const postMap = new Map<number, any>((postsRes.data ?? []).map((p: any) => [p.id, p]));
  const commentMap = new Map<number, any>((commentsRes.data ?? []).map((c: any) => [c.id, c]));
  const userMap = new Map<number, any>((usersRes.data ?? []).map((u: any) => [u.id, u]));
  const articleMap = new Map<number, any>((articlesRes.data ?? []).map((a: any) => [a.id, a]));

  function resolve(type: ReportTargetType, id: number): ResolvedTarget {
    if (type === 'post') {
      const p = postMap.get(id);
      if (!p) return { kind: 'post', missing: true, preview: '', href: `/p/${id}` };
      const preview = snip(p.caption) || (p.media_type === 'video' ? '(video gönderi)' : '(görsel gönderi)');
      return { kind: 'post', preview, href: `/p/${id}`, author: p.users?.username ?? null, authorName: p.users?.display_name ?? null };
    }
    if (type === 'comment') {
      const c = commentMap.get(id);
      if (!c) return { kind: 'comment', missing: true, preview: '', href: null };
      return { kind: 'comment', preview: snip(c.content), href: c.post_id ? `/p/${c.post_id}` : null, author: c.users?.username ?? null, authorName: c.users?.display_name ?? null };
    }
    if (type === 'user') {
      const u = userMap.get(id);
      if (!u) return { kind: 'user', missing: true, preview: '', href: null };
      return { kind: 'user', preview: `${u.display_name || u.username} (@${u.username})`, href: `/u/${u.username}`, author: u.username, authorName: u.display_name };
    }
    // article
    const a = articleMap.get(id);
    if (!a) return { kind: 'article', missing: true, preview: '', href: null };
    return { kind: 'article', preview: snip(a.title), href: a.slug ? `/makale/${a.slug}` : null, author: a.users?.username ?? null, authorName: a.users?.display_name ?? null };
  }

  const items: QueueItem[] = reports.map((r) => ({
    id: r.id,
    targetType: r.target_type,
    targetId: Number(r.target_id),
    reason: r.reason,
    note: r.note ?? null,
    created_at: r.created_at,
    reporter: r.reporter?.username ? { username: r.reporter.username, display_name: r.reporter.display_name || r.reporter.username } : null,
    target: resolve(r.target_type, Number(r.target_id)),
  }));

  return (
    <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div className="feed-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span>Şikayet Yönetimi · Moderasyon Kuyruğu</span>
        <span style={{ display: 'flex', gap: 14 }}>
          <Link href="/yonetim/makaleler" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>Makaleler →</Link>
          <Link href="/yonetim/istatistik" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>İstatistik →</Link>
        </span>
      </div>

      {dormant ? (
        <div style={{ maxWidth: 640, margin: '40px auto', padding: '24px 20px', border: '1px solid var(--color-border)', borderRadius: 14, background: 'var(--color-surface)', textAlign: 'center' }}>
          <p style={{ fontWeight: 800, margin: '0 0 8px' }}>Şikayet sistemi henüz aktif değil</p>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Supabase SQL Editor&apos;da <code>sql/features-block-report.sql</code> dosyasını çalıştırınca kuyruk burada görünür.
          </p>
        </div>
      ) : (
        <ReportsClient items={items} />
      )}
    </main>
  );
}
