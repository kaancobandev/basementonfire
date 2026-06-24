// Sayfalar arası gezinmede ANINDA görünen iskelet. Hedef sayfanın sunucu render'ı
// gelene kadar boş ekran yerine bu shimmer gösterilir → algılanan hız ciddi artar.
// (.main-content kabuğun sağ kolonunu doldurur; tema değişkenleriyle açık/koyu uyumlu.)
export default function Loading() {
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
        .sk-wrap { padding: 0; }
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
