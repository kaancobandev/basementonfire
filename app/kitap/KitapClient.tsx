'use client';

import ArticleIndex from '@/app/components/ArticleIndex';
import type { ArticleMeta } from '@/lib/articles';

/* /kitap — makale dizininin TAM ekran önizlemesi. Liste artık paylaşılan
   ArticleIndex bileşeninden geliyor; /discover'daki "Makaleler" bölümü de aynı
   bileşeni kullanıyor, böylece iki yüzey ayrışamaz. Burada kırpma YOK
   (baslangicAdet verilmedi) → 32 makale birden açık. */
export default function KitapClient({ articles }: { articles: ArticleMeta[] }) {
  return (
    <div className="kitap-sayfa">
      <header className="kitap-basi">
        <p className="kitap-ustbaslik">Arşiv</p>
        <h1 className="kitap-h1">Cevabı olan sorular</h1>
        <p className="kitap-giris">
          {articles.length} uzun makale, 6 konu. Her biri bir soruyu cevaplıyor;
          hepsinin sonunda kaynakça var.
        </p>
      </header>

      <div className="kitap-govde">
        <ArticleIndex articles={articles} />
      </div>

      <style>{`
        /* Site kabuğunu YALNIZ bu rotada gizle — globals.css ve AppShell'e
           dokunulmadı; bileşen ayrılınca React bu <style>'ı da kaldırır. */
        .sidebar, .mobile-nav { display: none !important; }
        .main-content { border-right: none !important; }
        .app-shell { display: block !important; }

        .kitap-sayfa { background: var(--color-surface); min-height: 100dvh; }
        .kitap-basi { max-width: 46rem; margin: 0 auto; padding: 40px 20px 20px; }
        .kitap-ustbaslik {
          margin: 0; font-size: .78rem; font-weight: 700; letter-spacing: .18em;
          text-transform: uppercase; color: var(--color-text-muted);
        }
        .kitap-h1 { margin: 12px 0 0; font-size: clamp(2rem, 5vw, 2.6rem); line-height: 1.1; }
        .kitap-giris {
          margin: 14px 0 0; max-width: 34rem; font-size: .95rem;
          line-height: 1.65; color: var(--color-text-muted);
        }
        .kitap-govde { max-width: 46rem; margin: 0 auto; padding: 8px 20px 96px; }
      `}</style>
    </div>
  );
}
