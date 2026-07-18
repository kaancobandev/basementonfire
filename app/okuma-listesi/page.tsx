import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db, getMe } from '@/lib/supabase/server';
import { ARTICLES, ARTICLE_MAP, type ArticleCategory } from '@/lib/articles';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Okuma Listem', robots: { index: false } };

const CATEGORY_EMOJI: Record<ArticleCategory, string> = {
  Fizik: '⚛️', Kimya: '🧪', Tarih: '🏛️', Biyoloji: '🧬', Teknoloji: '💻', Kültür: '🎭',
};

export default async function OkumaListesiPage() {
  const { me } = await getMe();
  if (!me) redirect('/login');

  // Kayitlar + okunanlar birbirinden bagimsiz -> paralel.
  // Tablolar yoksa (SQL henuz calismadiysa) sessizce bos.
  let slugs: string[] = [];
  let readSlugs = new Set<string>();
  try {
    const [savesRes, readsRes] = await Promise.all([
      db.from('article_saves').select('article_slug').eq('user_id', me.id).order('created_at', { ascending: false }),
      db.from('article_reads').select('article_slug').eq('user_id', me.id),
    ]);
    if (!savesRes.error) slugs = (savesRes.data ?? []).map((r: any) => r.article_slug as string);
    if (!readsRes.error) readSlugs = new Set((readsRes.data ?? []).map((r: any) => r.article_slug as string));
  } catch { /* tablo yok -> bos */ }

  const items = slugs.map(s => ARTICLE_MAP[s]).filter(Boolean);

  // Kategori raflari: "🏛️ Tarih 4/8" — okunan makale sayisi / kategori toplami.
  // Tamamlama durtusu (completionism) + 32 makalelik katalog icin gezinme iskeleti.
  const shelves = ([...new Set(ARTICLES.map(a => a.category))] as ArticleCategory[]).map(cat => {
    const catSlugs = ARTICLES.filter(a => a.category === cat).map(a => a.slug);
    const read = catSlugs.filter(s => readSlugs.has(s)).length;
    return { cat, total: catSlugs.length, read };
  });
  const totalRead = readSlugs.size;

  return (
    <main className="main-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <Link href="/discover" style={{ display: 'flex', color: 'var(--color-text)', textDecoration: 'none' }} aria-label="Geri">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>📚 Okuma Listem</h1>
      </div>

      {/* Koleksiyon raflari — okuma ilerlemesi (article_reads). Hic okuma yoksa
          gizlenir; raflar dolmaya baslayinca "rafi tamamla" hedefi gorunur olur. */}
      {totalRead > 0 && (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 16px 0' }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-text)', marginBottom: 10 }}>🗂️ Koleksiyonların</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {shelves.map(s => {
              const done = s.read >= s.total;
              return (
                <div key={s.cat} style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${done ? 'var(--color-success)' : 'var(--color-border)'}`, background: 'var(--color-surface)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>{CATEGORY_EMOJI[s.cat]} {s.cat}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: done ? 'var(--color-success)' : 'var(--color-text-muted)' }}>{done ? '✓ Tamam' : `${s.read}/${s.total}`}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 9999, background: 'var(--color-border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round((s.read / s.total) * 100)}%`, background: done ? 'var(--color-success)' : 'linear-gradient(90deg,var(--color-success),var(--color-primary))', borderRadius: 9999 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
