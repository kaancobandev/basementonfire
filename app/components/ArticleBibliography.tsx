import type { CSSProperties } from 'react';
import ArticleSocial from './ArticleSocial';

export type BibItem = {
  title: string;
  authors?: string;
  year?: string;
  source?: string;
  url?: string;
};

/**
 * Tüm /articles sayfalarında kullanılan ortak Kaynakça bölümü.
 * Tema-nötr: metin rengini `currentColor`'dan, vurgu/çerçeveyi `accent` prop'undan
 * alır; böylece hem koyu (greece/pirus/takyon) hem açık (tibbi) makalelerde okunur.
 * `.reveal` KULLANMAZ — content.ts makalelerinde IntersectionObserver olmadığından
 * gizli kalmaması için her zaman görünürdür.
 */
export default function ArticleBibliography({ items, accent = 'var(--color-text-muted)' }: { items: BibItem[]; accent?: string }) {
  return (
    <>
    <section className="art-bib" style={{ ['--bib-accent']: accent } as CSSProperties} aria-label="Kaynakça">
      <h2 className="art-bib-h">📚 Kaynakça</h2>
      <ol className="art-bib-list">
        {items.map((it, i) => (
          <li key={i} className="art-bib-item">
            <span className="art-bib-num">{i + 1}</span>
            <span className="art-bib-body">
              {it.url ? (
                <a className="art-bib-title art-bib-link" href={it.url} target="_blank" rel="noopener noreferrer">{it.title}</a>
              ) : (
                <span className="art-bib-title">{it.title}</span>
              )}
              {(it.authors || it.year || it.source) && (
                <span className="art-bib-meta">{[it.authors, it.year, it.source].filter(Boolean).join(' · ')}</span>
              )}
            </span>
          </li>
        ))}
      </ol>
      <style>{`
        .art-bib { max-width: 820px; margin: 0 auto; padding: 30px 16px 10px; }
        .art-bib-h { font-size: 1.15rem; font-weight: 800; margin: 0 0 16px; color: var(--bib-accent); letter-spacing: .01em; }
        .art-bib-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 11px; }
        .art-bib-item { display: flex; gap: 12px; align-items: flex-start; font-size: .92rem; line-height: 1.5; }
        .art-bib-num { flex-shrink: 0; width: 24px; height: 24px; border-radius: 6px; display: grid; place-items: center; font-size: .74rem; font-weight: 800; color: var(--bib-accent); background: color-mix(in srgb, var(--bib-accent) 15%, transparent); border: 1px solid color-mix(in srgb, var(--bib-accent) 38%, transparent); font-family: system-ui, sans-serif; margin-top: 1px; }
        .art-bib-body { display: flex; flex-direction: column; min-width: 0; }
        .art-bib-title { font-weight: 600; color: inherit; }
        a.art-bib-link { color: var(--bib-accent); text-decoration: none; border-bottom: 1px solid color-mix(in srgb, var(--bib-accent) 40%, transparent); padding-bottom: 1px; width: fit-content; transition: border-color .2s; word-break: break-word; }
        a.art-bib-link:hover { border-bottom-color: var(--bib-accent); }
        .art-bib-meta { font-size: .82rem; opacity: .6; margin-top: 2px; }
      `}</style>
    </section>
    {/* Ortak makale sosyal ayağı: İlgili Konular + Rastgele + Kaydet + Tartışma.
        Her makale Kaynakça kullandığından, buradan tek seferde tüm makalelere eklenir. */}
    <ArticleSocial />
    </>
  );
}
