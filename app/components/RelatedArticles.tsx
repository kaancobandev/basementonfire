import Link from 'next/link';
import { relatedArticles } from '@/lib/articles';

/**
 * "İlgili Konular" + "Rastgele keşfet" — tavşan deliği (Fikir 4).
 * Tema-nötr: currentColor + color-mix kullanır (koyu doppler ve açık makalelerde
 * de okunur, ArticleBibliography ile aynı yaklaşım). Hook yok.
 */
export default function RelatedArticles({ slug }: { slug: string }) {
  const related = relatedArticles(slug, 4);
  if (!related.length) return null;

  return (
    <section className="as-rel" aria-label="İlgili konular">
      <h2 className="as-rel-h">🔎 İlgili Konular</h2>
      <div className="as-rel-grid">
        {related.map(a => (
          <Link key={a.slug} href={`/articles/${a.slug}`} className="as-rel-card">
            <span className="as-rel-emoji">{a.emoji}</span>
            <span className="as-rel-body">
              <span className="as-rel-title">{a.title}</span>
              <span className="as-rel-desc">{a.desc}</span>
            </span>
          </Link>
        ))}
      </div>
      <Link href="/rastgele" className="as-rel-random" prefetch={false}>
        🎲 Rastgele bir konu keşfet
      </Link>

      <style>{`
        .as-rel { max-width: 820px; margin: 24px auto 0; padding: 22px 16px 6px; border-top: 1px solid color-mix(in srgb, currentColor 14%, transparent); }
        .as-rel-h { font-size: 1.1rem; font-weight: 800; margin: 0 0 14px; }
        .as-rel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .as-rel-card { display: flex; gap: 11px; align-items: flex-start; padding: 12px 13px; border-radius: 13px; text-decoration: none; color: inherit; border: 1px solid color-mix(in srgb, currentColor 16%, transparent); background: color-mix(in srgb, currentColor 4%, transparent); transition: border-color .15s, transform .15s, background .15s; }
        .as-rel-card:hover { border-color: var(--color-primary); background: color-mix(in srgb, var(--color-primary) 8%, transparent); transform: translateY(-2px); }
        .as-rel-emoji { font-size: 1.5rem; line-height: 1; flex-shrink: 0; }
        .as-rel-body { display: flex; flex-direction: column; min-width: 0; }
        .as-rel-title { font-weight: 700; font-size: .92rem; }
        .as-rel-desc { font-size: .78rem; opacity: .62; margin-top: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .as-rel-random { display: inline-flex; align-items: center; gap: 6px; margin: 16px 0 4px; padding: 9px 16px; border-radius: 9999px; font-size: .85rem; font-weight: 700; text-decoration: none; color: var(--color-primary); border: 1px dashed color-mix(in srgb, var(--color-primary) 50%, transparent); transition: background .15s; }
        .as-rel-random:hover { background: color-mix(in srgb, var(--color-primary) 10%, transparent); }
        @media (max-width: 560px) { .as-rel-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
