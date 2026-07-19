// Sayfalar arası gezinmede ANINDA görünen iskelet. Segment bazlı loading.tsx
// dosyalarından çağrılır — KÖKTE loading.tsx YOK ve olmamalı: kökteki bir
// loading.tsx her dinamik rotayı streaming'e sokuyor, streaming ise notFound()
// çalışmadan önce HTTP 200'ü flush ediyordu → olmayan profil/gönderi/etiket
// "bulunamadı" gösterip 200 dönüyordu (soft-404, Google çöp URL'leri indeksler).
// Bu yüzden iskelet yalnızca 404 üretmeyen segmentlere tek tek eklenir.
export default function RouteSkeleton() {
  return (
    <main className="main-content sk-wrap" aria-busy="true" aria-label="Yükleniyor">
      <div className="sk-inner">
        <div className="sk-head">
          <div className="sk-circle" />
          <div className="sk-head-lines">
            <div className="sk-line" style={{ width: '42%' }} />
            <div className="sk-line sk-sm" style={{ width: '26%' }} />
          </div>
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="sk-card">
            <div className="sk-line" style={{ width: '55%' }} />
            <div className="sk-line sk-sm" style={{ width: '92%' }} />
            <div className="sk-line sk-sm" style={{ width: '78%' }} />
            <div className="sk-block" />
          </div>
        ))}
      </div>
      <style>{`
        /* Alt pay KORUNUR: mobilde yüzen cam dock'un altında iskelet kartları
           kalmasın (padding:0 yazınca son kart dock'un arkasına giriyordu). */
        .sk-wrap { padding: 0 0 var(--sk-pad-bottom, 0px); }
        @media (max-width: 699px) { .sk-wrap { --sk-pad-bottom: calc(82px + env(safe-area-inset-bottom, 0px)); } }
        .sk-inner { max-width: 680px; padding: 18px 16px; display: flex; flex-direction: column; gap: 16px; }
        .sk-head { display: flex; align-items: center; gap: 12px; }
        .sk-head-lines { flex: 1; display: flex; flex-direction: column; gap: 7px; }
        .sk-circle { width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0; }
        .sk-line { height: 14px; border-radius: 7px; }
        .sk-line.sk-sm { height: 10px; }
        .sk-card { border: 1px solid var(--color-border); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 9px; }
        .sk-block { height: 170px; border-radius: 12px; margin-top: 4px; }
        .sk-circle, .sk-line, .sk-block { background: var(--color-border, #e5e7eb); animation: sk-pulse 1.4s ease-in-out infinite; }
        @keyframes sk-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .sk-circle, .sk-line, .sk-block { animation: none; opacity: 0.7; } }
      `}</style>
    </main>
  );
}
