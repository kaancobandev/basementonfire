import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db, getMe } from '@/lib/supabase/server';
import { ARTICLE_MAP } from '@/lib/articles';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Okuma Listem', robots: { index: false } };

export default async function OkumaListesiPage() {
  const { me } = await getMe();
  if (!me) redirect('/login');

  // article_saves tablosu yoksa (SQL henuz calismadiysa) sessizce bos liste.
  let slugs: string[] = [];
  try {
    const { data, error } = await db
      .from('article_saves').select('article_slug')
      .eq('user_id', me.id).order('created_at', { ascending: false });
    if (!error) slugs = (data ?? []).map((r: any) => r.article_slug as string);
  } catch { /* tablo yok -> bos */ }

  const items = slugs.map(s => ARTICLE_MAP[s]).filter(Boolean);

  return (
    <main className="main-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <Link href="/discover" style={{ display: 'flex', color: 'var(--color-text)', textDecoration: 'none' }} aria-label="Geri">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>📚 Okuma Listem</h1>
      </div>

      {items.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '64px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <span style={{ fontSize: '2.5rem' }}>🔖</span>
          <p style={{ margin: 0, maxWidth: 320, lineHeight: 1.5 }}>Henüz kaydettiğin bir konu yok. Bir makalenin altındaki <strong>Kaydet</strong> ile listene ekle.</p>
          <Link href="/discover" style={{ marginTop: 4, color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>Konuları keşfet →</Link>
        </div>
      ) : (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {items.map(a => (
            <Link key={a.slug} href={`/articles/${a.slug}`} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 14, borderRadius: 14, textDecoration: 'none', color: 'inherit', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
              <span style={{ fontSize: '1.7rem', lineHeight: 1, flexShrink: 0 }}>{a.emoji}</span>
              <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>{a.title}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
