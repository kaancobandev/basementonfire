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
        /* --bib-accent: ArticleBibliography'nin sarmalayıcısından miras gelir =
           makalenin KENDİ vurgu rengi. Yedeği site indigosu, yani bu bileşeni
           accent'siz kullanan yerler bugünkü görünümünü aynen korur.
           Sebep ölçüldü: koyu makalelerde --color-primary (#5b2eef) zemine karşı
           2,95:1 kalıyordu — AA altı, ve makalenin renk anlatısını kırıyordu. */
        .as-rel { max-width: 820px; margin: 24px auto 0; padding: 22px 16px 6px; border-top: 1px solid color-mix(in srgb, currentColor 14%, transparent); }
        .as-rel-h { font-size: 1.1rem; font-weight: 800; margin: 0 0 14px; color: var(--bib-accent, inherit); }
        .as-rel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        /* Kenar %16 → %45: eskisi zemine karşı 1,37:1 idi, yani ortada "kart"
           diye bir nesne görünmüyordu. %45 → 3,37:1, WCAG metin-dışı eşiği geçti.
           (%42 denendi: 3,08:1 ile sınırda kalıyor.) currentColor korundu, böylece
           açık zeminli makalelerde de ters yönde doğru çalışıyor. */
        .as-rel-card { display: flex; gap: 11px; align-items: flex-start; padding: 12px 13px; border-radius: 13px; text-decoration: none; color: inherit; border: 1px solid color-mix(in srgb, currentColor 45%, transparent); background: color-mix(in srgb, currentColor 8%, transparent); transition: border-color .15s, transform .15s, background .15s; }
        .as-rel-card:hover { border-color: var(--bib-accent, var(--color-primary)); background: color-mix(in srgb, var(--bib-accent, var(--color-primary)) 10%, transparent); transform: translateY(-2px); }
        /* Emoji artık çıplak glif değil, Kaynakça'nın numara rozetiyle aynı dilde
           bir karo. Sabit 40px olduğu için dört kartın başlığı da aynı x'ten başlar
           (emoji genişlikleri 32-33px arasında değişiyordu, ızgara dağınıktı). */
        .as-rel-emoji { width: 40px; height: 40px; flex-shrink: 0; display: grid; place-items: center; border-radius: 11px; font-size: 1.35rem; line-height: 1; background: color-mix(in srgb, var(--bib-accent, currentColor) 14%, transparent); border: 1px solid color-mix(in srgb, var(--bib-accent, currentColor) 30%, transparent); }
        .as-rel-body { display: flex; flex-direction: column; min-width: 0; }
        .as-rel-title { font-weight: 700; font-size: .92rem; }
        .as-rel-desc { font-size: .78rem; opacity: .62; margin-top: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        /* Kesikli kenar %50 → %75: %50'de 1,51:1 ile görünmüyordu. */
        .as-rel-random { display: inline-flex; align-items: center; gap: 6px; margin: 16px 0 4px; padding: 9px 16px; border-radius: 9999px; font-size: .85rem; font-weight: 700; text-decoration: none; color: var(--bib-accent, var(--color-primary)); border: 1px dashed color-mix(in srgb, var(--bib-accent, var(--color-primary)) 75%, transparent); transition: background .15s; }
        .as-rel-random:hover { background: color-mix(in srgb, var(--bib-accent, var(--color-primary)) 10%, transparent); }
        @media (max-width: 560px) { .as-rel-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
