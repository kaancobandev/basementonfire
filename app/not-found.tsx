import Link from 'next/link';

// SUNUCU bileşeni olmak ZORUNDA. 'use client' iken, dinamik bir rotada çalışma
// anında notFound() çağrıldığında Next bu sınırı SSR'a basmıyordu: durum kodu
// 404 geliyordu ama gövde BOŞ kalıyordu (yerelde ve canlıda ölçüldü 2026-07-19).
// Eşleşmeyen yollar (/boyle-bir-yol-yok) etkilenmiyordu, çünkü onlar prerender
// edilmiş /_not-found sayfasını alır — bu yüzden hata uzun süre görünmedi.
// Hover efekti bu yüzden inline onMouseOver yerine CSS ile yazıldı.
export default function NotFound() {
  return (
    // data-notfound: PageviewBeacon bunu DOM'da arar ve 404'u sayfa
    // goruntulemesi olarak SAYMAZ. Efekt sirasina degil DOM varligina
    // dayanir — cocuk agac, layout'taki beacon'in efektinden once commit
    // edilir, dolayisiyla isaret her zaman yerindedir.
    // NEDEN: 404'ler sayiliyordu ve panele "en cok gezilen sayfa" olarak
    // giriyordu (2026-08-10: /kitap 30 gunde 32 goruntuleme, rota yok).
    <main className="main-content nf-wrap" data-notfound="1">
      {/* Astro app'tekinin aynısı */}
      <img
        src="https://media3.giphy.com/media/1EmBoG0IL50VIJLWTs/giphy.gif"
        alt="Kayboldum"
        className="nf-gif"
      />
      <h1 className="nf-title">Galiba yolumuzu kaybettik.</h1>
      <Link href="/" className="nf-link">Ana sayfaya dön</Link>

      <style>{`
        .nf-wrap {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 20px; min-height: 100vh; padding: 20px; text-align: center;
          background: var(--color-surface);
        }
        .nf-gif { height: 70vh; width: auto; max-width: 100%; border-radius: 16px; object-fit: contain; }
        .nf-title { font-size: 1.5rem; font-weight: 600; color: var(--color-text); margin: 0; }
        .nf-link {
          margin-top: 4px; padding: 10px 22px; background: #6366f1; color: #fff;
          border-radius: 20px; font-size: 0.9rem; font-weight: 500; text-decoration: none;
          transition: opacity 0.15s;
        }
        .nf-link:hover { opacity: 0.85; }
      `}</style>
    </main>
  );
}
