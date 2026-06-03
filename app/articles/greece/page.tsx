'use client';

import { useState } from 'react';
import Link from 'next/link';

const gods = [
  { name: 'Zeus',     domain: 'Gökyüzü & Şimşek', emoji: '⚡', color: '#f5c518', desc: 'Olimpos\'un baş tanrısı. Şimşek ve fırtınanın efendisi, tanrıların ve insanların babası.', symbol: 'Yıldırım, Kartal, Meşe' },
  { name: 'Athena',   domain: 'Bilgelik & Savaş',  emoji: '🦉', color: '#7ec8e3', desc: 'Atina\'nın koruyucu tanrıçası. Bilgelik, zanaat ve savaş stratejisinin simgesi.', symbol: 'Baykuş, Zeytin Dalı, Miğfer' },
  { name: 'Poseidon', domain: 'Deniz & Deprem',    emoji: '🔱', color: '#1a6fa8', desc: 'Denizlerin ve depremlerin efendisi. Öfkelenince denizleri kasırgaya döndürürdü.', symbol: 'Trident, At, Boğa' },
  { name: 'Apollo',   domain: 'Güneş & Kehanet',   emoji: '☀️', color: '#f9a620', desc: 'Güneş, müzik ve kehanet tanrısı. Delphi kehanet merkezi ona adanmıştı.', symbol: 'Lir, Ok-Yay, Defne Dalı' },
  { name: 'Ares',     domain: 'Savaş',             emoji: '⚔️', color: '#c1121f', desc: 'Savaşın ve şiddetin tanrısı. Sparta\'nın özellikle sevdiği tanrıydı.', symbol: 'Mızrak, Kalkan, Köpek' },
  { name: 'Hermes',   domain: 'Ticaret & Elçilik', emoji: '🪽', color: '#a8dadc', desc: 'Tanrıların habercisi ve gezginlerin koruyucusu. Ölüleri yeraltına taşırdı.', symbol: 'Kanatlı Sandalet, Caduceus' },
  { name: 'Artemis',  domain: 'Av & Ay',           emoji: '🌙', color: '#b9a0c4', desc: 'Av ve ay tanrıçası, Apollo\'nun ikiz kız kardeşi. Vahşi doğanın koruyucusuydu.', symbol: 'Ok-Yay, Geyik, Ay Hilali' },
  { name: 'Dionysos', domain: 'Şarap & Sevinç',   emoji: '🍇', color: '#7b2d8b', desc: 'Bağ, şarap ve tiyatronun tanrısı. Tragedya ve komedi oyunları ona onuruna yapılırdı.', symbol: 'Üzüm Salkımı, Sarmaşık, Thyrsos' },
];

const sports = [
  { sport: 'Stadion',       icon: '🏃', desc: 'Yaklaşık 192 metre uzunluğundaki pistte koşu. İlk ve en prestijli Olimpiyat dalıydı.' },
  { sport: 'Güreş',         icon: '🤼', desc: 'Rakibin omzunu yere değdirme esasına dayanırdı. En popüler dövüş sporuydu.' },
  { sport: 'Pentathlon',    icon: '🥇', desc: 'Koşu, atlama, disk, cirit ve güreşten oluşan beşli müsabaka.' },
  { sport: 'Boks',          icon: '🥊', desc: 'Deri bantlarla sarılı yumruklarla yapılır; hakem "dur!" deyene kadar sürerdi.' },
  { sport: 'Arabalı Yarış', icon: '🐎', desc: 'Hippodromda dört atın çektiği araba ile yapılırdı. En tehlikeli etkinlikti.' },
  { sport: 'Pankration',    icon: '💪', desc: 'Güreş + boks karışımı tam temaslı dövüş. Isırma ve göz çıkarma dışında her şey serbestti.' },
];

const alexTimeline = [
  { year: 'MÖ 356', event: 'Doğum',     desc: 'Büyük İskender Makedonya\'da doğdu. Aristoteles\'in öğrencisi olarak büyüdü.' },
  { year: 'MÖ 336', event: 'Tahta',     desc: 'Babası suikasta kurban gidince 20 yaşında kral oldu.' },
  { year: 'MÖ 334', event: 'Granikos',  desc: 'Anadolu\'ya geçen İskender, Granikos Nehri\'nde Pers kuvvetlerini bozguna uğrattı.' },
  { year: 'MÖ 333', event: 'İssus',     desc: 'Kral III. Darius liderliğindeki Pers ordusunu İssus\'ta yendi.' },
  { year: 'MÖ 331', event: 'Gaugamela', desc: 'Son büyük meydan savaşında Pers İmparatorluğu\'nu çökertti.' },
  { year: 'MÖ 323', event: 'Vefat',     desc: '32 yaşında Babil\'de hayatını kaybetti.' },
];

const compareBars = [
  { label: 'Askeri Güç',     athens: 50, sparta: 95 },
  { label: 'Demokrasi',      athens: 95, sparta: 20 },
  { label: 'Sanat & Mimari', athens: 90, sparta: 35 },
  { label: 'Felsefe',        athens: 95, sparta: 25 },
  { label: 'Deniz Gücü',     athens: 80, sparta: 45 },
  { label: 'Ticaret',        athens: 85, sparta: 30 },
];

const TABS = [
  { id: 'kurulus',  label: 'Kuruluş' },
  { id: 'tanrilar', label: 'Tanrılar' },
  { id: 'iskender', label: 'İskender' },
  { id: 'olimpiyat',label: 'Olimpiyat' },
];

export default function GreecePage() {
  const [activeSection, setActiveSection] = useState('kurulus');
  const [selectedGod, setSelectedGod] = useState<typeof gods[0] | null>(null);

  return (
    <main className="main-content gr-page">

      {/* ── Yapışkan üst bar ── */}
      <div className="gr-topbar">
        <Link href="/" className="gr-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <span className="gr-topbar-title">Antik Yunan</span>
        <nav className="gr-tab-nav">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`gr-tab-btn${activeSection === t.id ? ' active' : ''}`}
              onClick={() => setActiveSection(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Hero ── */}
      <header className="gr-hero">
        <div className="gr-hero-eyebrow">ΑΡΧΑΙΑ ΕΛΛΑΔΑ</div>
        <h1 className="gr-hero-title">ANTİK <span className="gr-accent">YUNAN</span></h1>
        <p className="gr-hero-sub">Demokrasinin beşiği · Felsefenin anavatanı · Olimpiyat oyunlarının doğduğu topraklar</p>
        <div className="gr-hero-badges">
          {[['🏛️','Demokrasi'],['🧠','Felsefe'],['⚡','Mitoloji'],['🏅','Olimpiyat']].map(([icon, label]) => (
            <span key={label} className="gr-badge">{icon} {label}</span>
          ))}
        </div>
      </header>

      {/* ── Kuruluş: Atina vs Sparta ── */}
      {activeSection === 'kurulus' && (
        <section className="gr-section">
          <h2 className="gr-section-title">Atina vs Sparta — İki Şehir, İki Dünya</h2>
          <div className="gr-card">
            <div className="gr-city-row">
              <div className="gr-city gr-city--athens">
                <div className="gr-city-icon">🏛️</div>
                <div className="gr-city-name gr-accent">Atina</div>
                <div className="gr-city-sub">Demokrasi & Kültür</div>
              </div>
              <div className="gr-city gr-city--sparta">
                <div className="gr-city-icon">⚔️</div>
                <div className="gr-city-name gr-red">Sparta</div>
                <div className="gr-city-sub">Askeri Güç & Disiplin</div>
              </div>
            </div>

            <div className="gr-bars">
              {compareBars.map(b => (
                <div key={b.label} className="gr-bar-row">
                  <div className="gr-bar-labels">
                    <span className="gr-accent">{b.athens}%</span>
                    <span className="gr-bar-label">{b.label}</span>
                    <span className="gr-red">{b.sparta}%</span>
                  </div>
                  <div className="gr-bar-track">
                    <div className="gr-bar-fill gr-bar-athens" style={{ width: `${b.athens}%` }} />
                  </div>
                  <div className="gr-bar-track">
                    <div className="gr-bar-fill gr-bar-sparta" style={{ width: `${b.sparta}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Tanrılar ── */}
      {activeSection === 'tanrilar' && (
        <section className="gr-section">
          <h2 className="gr-section-title">Olimpos Tanrıları</h2>
          <p className="gr-section-sub">Karta tıklayarak daha fazla bilgi edinin</p>
          <div className="gr-gods-grid">
            {gods.map(g => (
              <div
                key={g.name}
                className={`gr-god-card${selectedGod?.name === g.name ? ' selected' : ''}`}
                style={{ borderColor: `${g.color}40`, boxShadow: selectedGod?.name === g.name ? `0 0 20px ${g.color}40` : 'none' }}
                onClick={() => setSelectedGod(selectedGod?.name === g.name ? null : g)}
              >
                <div className="gr-god-emoji">{g.emoji}</div>
                <h3 className="gr-god-name" style={{ color: g.color }}>{g.name}</h3>
                <div className="gr-god-domain">{g.domain}</div>
                {selectedGod?.name === g.name && (
                  <div className="gr-god-detail" style={{ borderTopColor: `${g.color}40` }}>
                    <p className="gr-god-desc">{g.desc}</p>
                    <div className="gr-god-symbol" style={{ color: g.color }}>🔱 {g.symbol}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── İskender ── */}
      {activeSection === 'iskender' && (
        <section className="gr-section gr-section--narrow">
          <h2 className="gr-section-title">Büyük İskender'in Yolculuğu</h2>
          <div className="gr-timeline">
            {alexTimeline.map((t, i) => (
              <div key={i} className="gr-tl-item">
                <div className="gr-tl-dot" />
                <div className="gr-tl-card">
                  <div className="gr-tl-meta">{t.year} · {t.event}</div>
                  <p className="gr-tl-desc">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Olimpiyat ── */}
      {activeSection === 'olimpiyat' && (
        <section className="gr-section">
          <h2 className="gr-section-title">Antik Olimpiyat Oyunları</h2>
          <p className="gr-section-sub">MÖ 776'dan MS 393'e kadar Zeus onuruna düzenlenmiştir</p>
          <div className="gr-sports-grid">
            {sports.map(s => (
              <div key={s.sport} className="gr-sport-card">
                <div className="gr-sport-icon">{s.icon}</div>
                <h3 className="gr-sport-name">{s.sport}</h3>
                <p className="gr-sport-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <style>{`
        /* ── Temel ── */
        .gr-page {
          background: #0a1628;
          color: #e8e0d8;
          min-height: 100vh;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* ── Topbar ── */
        .gr-topbar {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(10,22,40,0.96);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .gr-back {
          color: #e8e0d8;
          text-decoration: none;
          display: flex;
          align-items: center;
          padding: 6px;
          border-radius: 50%;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .gr-back:hover { background: rgba(255,255,255,0.08); }
        .gr-topbar-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: #7ec8e3;
          flex-shrink: 0;
        }
        .gr-tab-nav {
          display: flex;
          gap: 6px;
          margin-left: auto;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 2px;
        }
        .gr-tab-nav::-webkit-scrollbar { display: none; }
        .gr-tab-btn {
          background: rgba(126,200,227,0.08);
          color: #7ec8e3;
          border: 1px solid rgba(126,200,227,0.25);
          border-radius: 8px;
          padding: 5px 12px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .gr-tab-btn:hover { border-color: rgba(126,200,227,0.5); }
        .gr-tab-btn.active {
          background: #7ec8e3;
          color: #0a1628;
          border-color: #7ec8e3;
        }

        /* ── Hero ── */
        .gr-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 52px 20px 40px;
          background: radial-gradient(ellipse at 50% 0%, rgba(126,200,227,0.10) 0%, transparent 60%);
        }
        .gr-hero-eyebrow {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.3em;
          color: #7ec8e3;
          margin-bottom: 14px;
        }
        .gr-hero-title {
          font-size: clamp(2rem, 8vw, 5rem);
          font-weight: 900;
          margin: 0 0 12px;
          color: #e8e0d8;
          text-shadow: 0 0 50px rgba(126,200,227,0.35);
          letter-spacing: 0.05em;
          line-height: 1.1;
        }
        .gr-accent { color: #7ec8e3; }
        .gr-red    { color: #ef4444; }
        .gr-hero-sub {
          font-size: clamp(0.8rem, 2vw, 1rem);
          color: #8090a8;
          line-height: 1.6;
          max-width: 520px;
          margin: 0 0 24px;
        }
        .gr-hero-badges {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .gr-badge {
          padding: 8px 16px;
          background: rgba(126,200,227,0.08);
          border: 1px solid rgba(126,200,227,0.18);
          border-radius: 9999px;
          font-size: 0.82rem;
          color: #7ec8e3;
          font-weight: 600;
        }

        /* ── Bölüm ── */
        .gr-section {
          max-width: 900px;
          margin: 0 auto;
          padding: 36px 16px 60px;
        }
        .gr-section--narrow { max-width: 680px; }
        .gr-section-title {
          font-size: clamp(1.1rem, 3vw, 1.5rem);
          font-weight: 800;
          color: #7ec8e3;
          margin: 0 0 8px;
        }
        .gr-section-sub {
          color: #8090a8;
          font-size: 0.88rem;
          margin: 0 0 24px;
        }

        /* ── Kart ── */
        .gr-card {
          background: rgba(126,200,227,0.04);
          border: 1px solid rgba(126,200,227,0.14);
          border-radius: 18px;
          padding: 24px;
        }

        /* ── Atina vs Sparta ── */
        .gr-city-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 28px;
          text-align: center;
        }
        .gr-city {
          padding: 16px 12px;
          border-radius: 12px;
        }
        .gr-city--athens { background: rgba(126,200,227,0.08); }
        .gr-city--sparta { background: rgba(193,18,31,0.08); }
        .gr-city-icon { font-size: 1.5rem; margin-bottom: 6px; }
        .gr-city-name { font-size: 1rem; font-weight: 800; margin-bottom: 4px; }
        .gr-city-sub  { font-size: 0.75rem; color: #8090a8; }

        .gr-bars { display: flex; flex-direction: column; gap: 14px; }
        .gr-bar-row { display: flex; flex-direction: column; gap: 3px; }
        .gr-bar-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          color: #8090a8;
        }
        .gr-bar-label { font-weight: 700; color: #e8e0d8; }
        .gr-bar-track {
          height: 7px;
          background: rgba(255,255,255,0.06);
          border-radius: 4px;
          overflow: hidden;
        }
        .gr-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.8s ease;
        }
        .gr-bar-athens { background: linear-gradient(to right, #7ec8e3, #1a6fa8); }
        .gr-bar-sparta { background: linear-gradient(to left, #ef4444, #c1121f); margin-left: auto; }

        /* ── Tanrılar grid ── */
        .gr-gods-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
          margin-top: 24px;
        }
        .gr-god-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 16px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .gr-god-card:hover { transform: translateY(-2px); }
        .gr-god-card.selected { transform: scale(1.02); }
        .gr-god-emoji  { font-size: 2.2rem; margin-bottom: 8px; }
        .gr-god-name   { font-size: 0.95rem; font-weight: 800; margin: 0 0 4px; }
        .gr-god-domain { font-size: 0.74rem; color: #8090a8; margin-bottom: 8px; }
        .gr-god-detail {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 10px;
          margin-top: 6px;
        }
        .gr-god-desc   { font-size: 0.8rem; color: #c0d0e0; line-height: 1.55; margin: 0 0 6px; }
        .gr-god-symbol { font-size: 0.7rem; }

        /* ── İskender timeline ── */
        .gr-timeline {
          position: relative;
          padding-left: 28px;
          margin-top: 24px;
        }
        .gr-timeline::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: linear-gradient(to bottom, #7ec8e3, rgba(126,200,227,0.1));
          border-radius: 1px;
        }
        .gr-tl-item {
          position: relative;
          margin-bottom: 20px;
        }
        .gr-tl-dot {
          position: absolute;
          left: -34px;
          top: 8px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #7ec8e3;
          box-shadow: 0 0 10px #7ec8e3;
        }
        .gr-tl-card {
          background: rgba(126,200,227,0.04);
          border: 1px solid rgba(126,200,227,0.14);
          border-radius: 10px;
          padding: 14px 16px;
        }
        .gr-tl-meta {
          font-size: 0.72rem;
          font-weight: 800;
          color: #7ec8e3;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }
        .gr-tl-desc {
          font-size: 0.85rem;
          color: #a0b0c8;
          line-height: 1.55;
          margin: 0;
        }

        /* ── Olimpiyat sporlar ── */
        .gr-sports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
          margin-top: 24px;
        }
        .gr-sport-card {
          background: rgba(126,200,227,0.04);
          border: 1px solid rgba(126,200,227,0.14);
          border-radius: 12px;
          padding: 18px;
          transition: border-color 0.2s;
        }
        .gr-sport-card:hover { border-color: rgba(126,200,227,0.35); }
        .gr-sport-icon { font-size: 2rem; margin-bottom: 8px; }
        .gr-sport-name { font-size: 0.9rem; font-weight: 800; color: #e8e0d8; margin: 0 0 6px; }
        .gr-sport-desc { font-size: 0.8rem; color: #8090a8; line-height: 1.55; margin: 0; }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .gr-topbar-title { display: none; }
          .gr-section { padding: 24px 12px 60px; }
          .gr-card { padding: 16px; }
          .gr-city-row { grid-template-columns: 1fr 1fr; gap: 8px; }
          .gr-gods-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .gr-sports-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
          .gr-sport-card { padding: 14px; }
          .gr-god-card { padding: 12px; }
        }

        @media (max-width: 380px) {
          .gr-gods-grid  { grid-template-columns: 1fr; }
          .gr-sports-grid{ grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
