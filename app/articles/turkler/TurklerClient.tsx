'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';

const refs: BibItem[] = [
  { title: 'Orhun Yazıtları', year: '8. yüzyıl', source: 'Göktürk anıtları' },
  { title: 'Türklerin Tarihi', authors: 'Jean-Paul Roux', source: 'Kabalcı Yayınevi' },
  { title: 'Seyahatname (Risâle)', authors: 'İbn Fadlan', year: '921–922', source: 'Tarihî kaynak' },
  { title: 'Turkic peoples', source: 'Encyclopædia Britannica', url: 'https://www.britannica.com/topic/Turkic-peoples' },
];

const eras = [
  { id: 'hun',      year: 'MÖ 209', title: 'Hun İmparatorluğu',      period: 'MÖ 209 – MS 216', color: '#c0392b', leader: 'Mete Han',           km2: '9.000.000', summary: 'Bilinen ilk büyük Türk devleti. Mete Han ondalık ordu sistemi icat etti; Çin\'i yıllık vergi ödemeye zorladı.',      facts: ['Dünyada ilk ondalık ordu sistemi (10–100–1000–10.000)', 'Çin İmparatoru\'nun kız kardeşini vergi olarak aldı', 'Çin Seddi büyük ölçüde Hunlara karşı inşa edildi', '400.000 atlı süvariden oluşan ordu'],       quote: 'Yayını geren her erkeğin atı olsun, okçu süvari olarak hizmet etsin.',                                                   quoteBy: 'Mete Han' },
  { id: 'attila',   year: 'MS 434',  title: 'Attila & Avrupa Hunları', period: 'MS 370 – 469',    color: '#8e44ad', leader: 'Attila',              km2: '4.000.000', summary: 'Tanrı\'nın Kırbacı. Hem Doğu hem Batı Roma\'yı vergi ödemeye mecbur etti.',                                            facts: ['Aynı anda iki Roma imparatorluğundan vergi aldı', 'Konstantinopolis\'i iki kez kuşattı', 'Papa I. Leo ile görüşerek İtalya\'dan çekildi'],                                                                      quote: 'Ben Tanrı\'nın kırbacıyım; toprak büyükse kırbaç da büyük olur.',                                                       quoteBy: 'Attila' },
  { id: 'gokturk',  year: '552',     title: 'Göktürk Kağanlığı',       period: '552 – 745',       color: '#2980b9', leader: 'Bumın Kağan',         km2: '6.000.000', summary: '"Türk" adını taşıyan ilk devlet. Orhun Yazıtları bu dönemde taşa kazındı.',                                               facts: ['"Türk" kelimesi ilk kez resmi devlet adı oldu', 'Orhun Yazıtları (720) Türkçenin en eski yazılı anıtıdır', 'İpek Yolu\'nun tamamını kontrol etti'],                                                                quote: 'Türk milletinin adı sanı yok olmasın diye, babam Bumın Kağan hükümdarlık tahtına oturdu.',                               quoteBy: 'Bilge Kağan — Orhun Yazıtları' },
  { id: 'seljuk',   year: '1037',    title: 'Büyük Selçuklu',          period: '1037 – 1194',     color: '#27ae60', leader: 'Tuğrul Bey',          km2: '3.900.000', summary: 'İslam dünyasının hamisi. Malazgirt Savaşı\'nda (1071) Bizans İmparatoru esir alındı.',                                    facts: ['Malazgirt 1071: Bizans İmparatoru bizzat esir alındı', 'Nizamiye medreseleri dönemin Oxford\'uydu', 'Kervansaray ağıyla İpek Yolu güvence altına alındı'],                                                      quote: 'Ben sultanların sultanıyım; doğuda ve batıda hiçbir kral benimle savaşamaz.',                                           quoteBy: 'Alp Arslan' },
  { id: 'ottoman',  year: '1299',    title: 'Osmanlı İmparatorluğu',   period: '1299 – 1922',     color: '#d35400', leader: 'Osman Gazi → Vahdettin', km2: '5.200.000', summary: '623 yıl, 3 kıta, 36 sultan. Fatih 21 yaşında İstanbul\'u fethetti.',                                               facts: ['Fatih İstanbul\'u 1453\'te 21 yaşında fethetti', 'Kanuni döneminde Viyana kapılarına dayanıldı', 'Millet sistemi farklı kültürlerin bir arada yaşamasını sağladı'],                                              quote: 'Ben Konstantinopolis\'i aldım; bundan böyle fetihlerimde hiçbir engel kalmadı.',                                         quoteBy: 'Fatih Sultan Mehmed' },
  { id: 'republic', year: '1923',    title: 'Türkiye Cumhuriyeti',     period: '1923 – Günümüz',  color: '#e74c3c', leader: 'Mustafa Kemal Atatürk', km2: '783.356',   summary: 'Osmanlı\'nın küllerinden doğan modern cumhuriyet. Kadınlara oy hakkı Fransa\'dan 10 yıl önce verildi.',              facts: ['29 Ekim 1923\'te Cumhuriyet ilan edildi', '1934\'te kadınlara seçme/seçilme hakkı', 'Latin alfabesine geçiş yalnızca 3 ayda tamamlandı', 'NATO\'nun kurucu üyelerinden (1952)'],                               quote: 'Türk milletinin tabiat ve âdetlerine en uygun olan idare, cumhuriyet idaresidir.',                                       quoteBy: 'Mustafa Kemal Atatürk' },
];

const bzCards = [
  { icon: '🏔️', title: 'Ergenekon Destanı',       text: 'Türkler ağır bir yenilginin ardından dağlarla çevrili Ergenekon vadisinde mahsur kaldı. Demirciler dağı eriterek çıkış yolu açtı. Bu kurtuluşa öncülük eden bir Bozkurt\'tu.' },
  { icon: '🐺', title: 'Asena: Kutsal Dişi Kurt', text: 'Göktürk yaratılış efsanesinde tüm Türkler düşmanlarca katledilir, yalnızca bir çocuk kalır. Dişi kurt Asena bu çocuğu büyütür. Ondan doğan on oğlun soyu Göktürkleri oluşturur.' },
  { icon: '🚩', title: 'Sancaktaki Kurt Başı',     text: 'Göktürk kağanlarının otağı önünde altın kurt başlı sancak dikilirdi. Kurt kafası tüğ üzerine takılır; savaşa gidildiğinde öncü birlikler bu sancak arkasında ilerledi.' },
  { icon: '⚡', title: 'Günümüzdeki Miras',        text: 'Bozkurt sembolü bugün hâlâ Türk kültüründe derin anlam taşır. Spor takımlarından askeri birliklere uzanan bu gelenek, 1.500 yıllık kesintisiz bir kültürel belleği yansıtır.' },
];

const warCards = [
  { icon: '🏹', name: 'Atlı Okçu',       desc: 'At sırtında geriye dönük ok atma "Parti atışı" — dünyanın ilk mobil topçusu' },
  { icon: '🔟', name: 'Mangala Sistemi', desc: 'Ondalık askeri örgütlenme: 10 / 100 / 1.000 / 10.000 — modern ordunun atası' },
  { icon: '🌀', name: 'Turan Taktiği',   desc: 'Sahte çekilme, çevirme harekâtı, imha — Mete Han\'ın icat ettiği strateji' },
  { icon: '🐎', name: 'Hafif Süvari',    desc: 'Kısa yay, hafif zırh, yüksek hız — kovalayan düşmanı tuzağa düşür' },
  { icon: '🔱', name: 'Akıncılar',       desc: 'Osmanlı öncü kuvvetleri — keşif, baskın ve psikolojik savaş uzmanları' },
  { icon: '🏰', name: 'Yeniçeriler',     desc: 'Devşirme sistemiyle oluşturulan seçkin Osmanlı piyadeleri — ilk profesyonel ordu' },
];

const runes = [
  { r: '𐰀', l: 'A', m: 'Açık A sesi' }, { r: '𐰉', l: 'B', m: 'Dudak B' },   { r: '𐰚', l: 'K', m: 'Ön damak K' },
  { r: '𐱃', l: 'T', m: 'Diş T' },       { r: '𐰖', l: 'Y', m: 'Yarı sesli Y' },{ r: '𐰭', l: 'NG', m: 'Nazal NG' },
  { r: '𐰞', l: 'L', m: 'Yan L' },       { r: '𐰢', l: 'M', m: 'Dudak M' },    { r: '𐰣', l: 'N', m: 'Diş N' },
  { r: '𐰺', l: 'R', m: 'Titrek R' },    { r: '𐰽', l: 'S', m: 'Diş S' },     { r: '𐱄', l: 'D', m: 'Arka damak D' },
];

const tengri = [
  { sym: '☀️', name: 'Tengri',    desc: 'Gök Tanrı — sonsuz mavi göğün efendisi, evrenin yaratıcısı' },
  { sym: '🌍', name: 'Yer-Sub',   desc: 'Toprak ve su ruhları — bereket ve ürünün kaynağı' },
  { sym: '🦅', name: 'Umay Ana',  desc: 'Ana tanrıça — doğurganlık, çocuklar ve ocağın koruyucusu' },
  { sym: '🐺', name: 'Kök Böri',  desc: 'Bozkurt — kutsal ata, kılavuz ve savaş simgesi' },
  { sym: '🔥', name: 'Od Ana',    desc: 'Ateş Ana — ocağın, ailenin ve toplumun koruyucusu' },
  { sym: '🌙', name: 'Ay Tengri', desc: 'Ay Tanrı — gece göğünün hâkimi, takvimin temeli' },
];

const TABS = [
  { id: 'language', label: '𐰚 Dil & Yazı' },
  { id: 'tengri',   label: '☀️ Tengricilik' },
  { id: 'war',      label: '⚔️ Savaş Sanatı' },
];

export default function TurklerPage() {
  const [openEra, setOpenEra] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('language');
  const [counts, setCounts] = useState({ y: 0, d: 0, k: 0, n: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = statsRef.current; if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting || started.current) return;
      started.current = true;
      const targets = { y: 4000, d: 40, k: 3, n: 200 };
      const dur = 1800; const start = performance.now();
      function step(now: number) {
        const t = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1 - t, 3);
        setCounts({ y: Math.floor(e*targets.y), d: Math.floor(e*targets.d), k: Math.floor(e*targets.k), n: Math.floor(e*targets.n) });
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  // Timeline: fareyle basılı tutup sürükleyerek yatay kaydırma.
  // (Mobilde native dokunmatik kaydırma `overflow-x` ile zaten çalışır; fare
  //  olayları dokunmayı etkilemez. Sürüklerken snap kapanır, bırakınca en
  //  yakın karta snap eder.)
  useEffect(() => {
    const el = trackRef.current; if (!el) return;
    let down = false, startX = 0, startScroll = 0, moved = false;
    const onDown = (e: MouseEvent) => {
      down = true; moved = false;
      startX = e.pageX; startScroll = el.scrollLeft;
      el.classList.add('dragging');
    };
    const onMove = (e: MouseEvent) => {
      if (!down) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 3) moved = true;
      el.scrollLeft = startScroll - dx;
      e.preventDefault();
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.classList.remove('dragging');
    };
    // Sürükleme yapıldıysa, bırakışta tetiklenen tıklamayı yut (buton vb.).
    const onClick = (e: MouseEvent) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    };
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    el.addEventListener('click', onClick, true);
    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      el.removeEventListener('click', onClick, true);
    };
  }, []);

  return (
    <main className="main-content tp-page">

      {/* ── Topbar ── */}
      <div className="tp-topbar">
        <Link href="/" className="tp-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <span className="tp-topbar-title">Türklerin Tarihi</span>
      </div>

      {/* ── Hero ── */}
      <header className="tp-hero">
        <div className="tp-hero-eyebrow">BOZKURTTAN BUGÜNE</div>
        <h1 className="tp-hero-title">TÜRKLER</h1>
        <p className="tp-hero-sub">4.000 yıllık destan · 40'tan fazla devlet · 3 kıtayı değiştiren bir millet</p>
        <div className="tp-runes">𐱅𐰇𐰼𐰚</div>
      </header>

      {/* ── Stats ── */}
      <section className="tp-stats-sect">
        <div className="tp-stats" ref={statsRef}>
          {[
            { label: 'Kanıtlanmış Tarih', val: `${counts.y}+`, sub: 'yıl' },
            { label: 'Kurulan İmparatorluk', val: `${counts.d}+`, sub: 'devlet' },
            { label: 'Hükmedilen Kıta', val: `${counts.k}`, sub: 'kıta' },
            { label: 'Bugünkü Türk Nüfusu', val: `${counts.n}M+`, sub: 'kişi' },
          ].map(s => (
            <div key={s.label} className="tp-stat">
              <span className="tp-stat-num">{s.val}</span>
              <span className="tp-stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Timeline: Büyük Türk Devletleri ── */}
      <section className="tp-tl-sect">
        <div className="tp-divider">
          <div className="tp-divider-line" />
          <h2 className="tp-divider-title">Büyük Türk Devletleri</h2>
          <div className="tp-divider-line" />
        </div>
        <div className="tp-tl-track" ref={trackRef}>
          {eras.map(era => (
            <div
              key={era.id}
              className={`tp-era-card${openEra === era.id ? ' open' : ''}`}
              style={{ borderColor: openEra === era.id ? era.color : 'rgba(192,57,43,0.2)' }}
            >
              <div className="tp-era-dot" style={{ background: era.color, boxShadow: `0 0 12px ${era.color}` }} />
              <div className="tp-era-year" style={{ color: era.color }}>{era.year}</div>
              <div className="tp-era-title">{era.title}</div>
              <div className="tp-era-period">{era.period}</div>
              <div className="tp-era-meta">👤 {era.leader}</div>
              <div className="tp-era-meta">🗺 {era.km2} km²</div>
              <p className="tp-era-summary">{era.summary}</p>
              <button
                onClick={() => setOpenEra(openEra === era.id ? null : era.id)}
                className="tp-era-btn"
                style={{ border: `1px solid ${era.color}`, color: era.color }}
              >
                {openEra === era.id ? 'Kapat ↑' : 'Detaylar ↓'}
              </button>
              {openEra === era.id && (
                <div className="tp-era-detail">
                  <ul className="tp-era-facts">
                    {era.facts.map(f => <li key={f}>{f}</li>)}
                  </ul>
                  <blockquote className="tp-era-quote" style={{ borderLeftColor: era.color }}>
                    <p>"{era.quote}"</p>
                    <cite style={{ color: era.color }}>— {era.quoteBy}</cite>
                  </blockquote>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Bozkurt ── */}
      <section className="tp-bz-sect">
        <div className="tp-divider">
          <div className="tp-divider-line" />
          <h2 className="tp-divider-title">🐺 Bozkurt: Kutsal Ata</h2>
          <div className="tp-divider-line" />
        </div>
        <div className="tp-bz-grid">
          {bzCards.map(c => (
            <div key={c.title} className="tp-bz-card">
              <div className="tp-bz-icon">{c.icon}</div>
              <h3 className="tp-bz-title">{c.title}</h3>
              <p className="tp-bz-text">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Kültür Tabları ── */}
      <section className="tp-culture-sect">
        <div className="tp-divider">
          <div className="tp-divider-line" />
          <h2 className="tp-divider-title">Türk Kültürü</h2>
          <div className="tp-divider-line" />
        </div>

        <div className="tp-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`tp-tab${activeTab === t.id ? ' active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="tp-tab-content">

          {activeTab === 'language' && (
            <div className="tp-two-col">
              <div>
                <h3 className="tp-tab-h3">Orhun Alfabesi: Taşa Kazınan Tarih</h3>
                <p className="tp-tab-p">Göktürkler, Proto-Türk yazısından geliştirdikleri özgün runik bir alfabe kullandı. 38 harfli bu sistem soldan sağa veya sağdan sola yazılabilirdi. Moğolistan'daki Orhun Vadisi'nde taşlara kazınan metinler, 8. yüzyıldan bu yana sağlam durmaktadır.</p>
                <p className="tp-tab-note">💡 Harflerin üzerine gelin — Türkçe karşılıklarını görün</p>
              </div>
              <div className="tp-rune-grid">
                {runes.map(r => (
                  <div key={r.l} title={r.m} className="tp-rune-item">
                    <div className="tp-rune-sym">{r.r}</div>
                    <div className="tp-rune-lat">{r.l}</div>
                    <div className="tp-rune-tip">{r.m}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tengri' && (
            <div className="tp-two-col">
              <div>
                <h3 className="tp-tab-h3">Tengri: Göğün Tanrısı</h3>
                <p className="tp-tab-p">İslam'dan önce Türkler Tengricilik (Gök Tanrı dini) inancını yaşattı. Tengri, sonsuz mavi göğü kişileştiren evrenin efendisiydi. Şamanlar (kam) bu dünya ile ruhlar âlemi arasındaki aracılardı.</p>
              </div>
              <div className="tp-tengri-grid">
                {tengri.map(t => (
                  <div key={t.name} className="tp-tengri-card">
                    <div className="tp-tengri-sym">{t.sym}</div>
                    <div className="tp-tengri-name">{t.name}</div>
                    <div className="tp-tengri-desc">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'war' && (
            <div className="tp-war-grid">
              {warCards.map(w => (
                <div key={w.name} className="tp-war-card">
                  <div className="tp-war-icon">{w.icon}</div>
                  <h4 className="tp-war-name">{w.name}</h4>
                  <p className="tp-war-desc">{w.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Kapanış ── */}
      <section className="tp-closing">
        <blockquote className="tp-final-quote">
          <p>"Ne mutlu Türküm diyene!"</p>
          <cite>— Mustafa Kemal Atatürk</cite>
        </blockquote>
      </section>

      <ArticleBibliography items={refs} accent="#c0392b" />

      <style>{`
        /* ── Temel ── */
        .tp-page {
          background: #0e0a08;
          color: #e8ddd0;
          min-height: 100vh;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* ── Topbar ── */
        .tp-topbar {
          position: sticky; top: 0; z-index: 40;
          background: rgba(14,10,8,0.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(192,57,43,0.3);
          padding: 10px 16px;
          display: flex; align-items: center; gap: 12px;
        }
        .tp-back {
          color: #e8ddd0; text-decoration: none;
          display: flex; padding: 6px; border-radius: 50%;
          transition: background 0.15s; flex-shrink: 0;
        }
        .tp-back:hover { background: rgba(255,255,255,0.06); }
        .tp-topbar-title { font-weight: 700; font-size: 0.95rem; color: #c0392b; }

        /* ── Hero ── */
        .tp-hero {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; text-align: center;
          padding: 64px 20px 52px;
          background: radial-gradient(ellipse at 30% 50%, #2a0c0c 0%, #0e0a08 70%);
        }
        .tp-hero-eyebrow {
          font-size: 0.68rem; font-weight: 800; letter-spacing: 0.25em;
          color: #c0392b; margin-bottom: 14px;
        }
        .tp-hero-title {
          font-size: clamp(2.8rem, 10vw, 7rem);
          font-weight: 900; letter-spacing: 0.12em;
          color: #e8ddd0; margin: 0 0 12px;
          text-shadow: 0 0 60px rgba(192,57,43,0.5); line-height: 1;
        }
        .tp-hero-sub {
          font-size: clamp(0.82rem, 2vw, 1rem);
          color: #a08870; line-height: 1.6; margin-bottom: 24px;
        }
        .tp-runes {
          font-size: 1.8rem; letter-spacing: 0.3em;
          color: rgba(192,57,43,0.7); font-family: serif;
          animation: tp-rune-glow 2s ease-in-out infinite;
        }
        @keyframes tp-rune-glow { 0%,100%{opacity:0.5} 50%{opacity:1; text-shadow:0 0 20px rgba(192,57,43,0.8)} }

        /* ── Stats ── */
        .tp-stats-sect { padding: 48px 16px; }
        .tp-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 2px; max-width: 860px; margin: 0 auto;
          border: 1px solid rgba(192,57,43,0.2); border-radius: 18px; overflow: hidden;
        }
        .tp-stat {
          padding: 28px 16px; text-align: center;
          background: rgba(192,57,43,0.04);
          border-right: 1px solid rgba(192,57,43,0.15);
          display: flex; flex-direction: column; gap: 6px;
        }
        .tp-stat:last-child { border-right: none; }
        .tp-stat-num { font-size: clamp(1.6rem,4vw,2.6rem); font-weight: 900; color: #c0392b; line-height: 1; }
        .tp-stat-lbl { font-size: 0.68rem; color: #7a6050; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }

        /* ── Divider ── */
        .tp-divider { display: flex; align-items: center; gap: 16px; padding: 0 16px; margin-bottom: 32px; }
        .tp-divider-line { flex: 1; height: 1px; background: rgba(192,57,43,0.3); }
        .tp-divider-title { font-size: clamp(1.1rem,3vw,1.6rem); font-weight: 800; color: #e8ddd0; white-space: nowrap; }

        /* ── Timeline devletler ── */
        .tp-tl-sect { padding: 48px 0; background: #120c0a; overflow: hidden; }
        .tp-tl-track {
          display: flex; gap: 20px;
          overflow-x: auto;
          scrollbar-width: none; -ms-overflow-style: none;
          padding: 24px 24px 36px;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: x mandatory;
          cursor: grab;
        }
        .tp-tl-track::-webkit-scrollbar { display: none; }
        .tp-tl-track.dragging { cursor: grabbing; scroll-snap-type: none; user-select: none; }

        .tp-era-card {
          flex: 0 0 260px; scroll-snap-align: start;
          background: rgba(30,16,12,0.92);
          border: 1px solid rgba(192,57,43,0.2); border-radius: 14px;
          padding: 22px; position: relative; transition: border-color 0.2s, transform 0.2s;
        }
        .tp-era-card.open { transform: translateY(-4px); }
        .tp-era-dot {
          position: absolute; top: -8px; left: 50%; transform: translateX(-50%);
          width: 14px; height: 14px; border-radius: 50%;
        }
        .tp-era-year   { font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; margin-bottom: 5px; }
        .tp-era-title  { font-size: 0.95rem; font-weight: 800; color: #e8ddd0; margin-bottom: 4px; }
        .tp-era-period { font-size: 0.7rem; color: #7a6050; margin-bottom: 10px; }
        .tp-era-meta   { font-size: 0.76rem; color: #a08870; margin-bottom: 4px; }
        .tp-era-summary{ font-size: 0.8rem; color: #c0a090; line-height: 1.5; margin: 10px 0; }
        .tp-era-btn {
          background: none; border-radius: 8px; padding: 6px 14px;
          font-size: 0.74rem; font-weight: 700; cursor: pointer; font-family: inherit;
          transition: background 0.15s, color 0.15s;
        }
        .tp-era-detail { margin-top: 14px; border-top: 1px solid rgba(192,57,43,0.15); padding-top: 14px; }
        .tp-era-facts { margin: 0 0 12px; padding-left: 16px; display: flex; flex-direction: column; gap: 4px; }
        .tp-era-facts li { font-size: 0.76rem; color: #c0a090; line-height: 1.55; }
        .tp-era-quote { margin: 0; padding: 10px 14px; border-left: 3px solid; border-radius: 0 8px 8px 0; background: rgba(192,57,43,0.06); }
        .tp-era-quote p { font-size: 0.78rem; color: #e0c8b0; font-style: italic; margin: 0 0 4px; }
        .tp-era-quote cite { font-size: 0.68rem; }

        /* ── Bozkurt ── */
        .tp-bz-sect { padding: 48px 16px; background: #0a0604; }
        .tp-bz-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 16px; max-width: 860px; margin: 0 auto;
        }
        .tp-bz-card {
          background: rgba(192,57,43,0.06); border: 1px solid rgba(192,57,43,0.2);
          border-radius: 14px; padding: 24px; transition: all 0.2s;
        }
        .tp-bz-card:hover { border-color: rgba(192,57,43,0.45); background: rgba(192,57,43,0.1); }
        .tp-bz-icon  { font-size: 2rem; margin-bottom: 10px; }
        .tp-bz-title { font-size: 0.95rem; font-weight: 800; color: #e8ddd0; margin: 0 0 8px; }
        .tp-bz-text  { font-size: 0.82rem; color: #a08870; line-height: 1.6; margin: 0; }

        /* ── Kültür ── */
        .tp-culture-sect { padding: 48px 16px; background: #0e0a08; }
        .tp-tabs {
          display: flex; gap: 8px; flex-wrap: wrap;
          max-width: 860px; margin: 0 auto 28px;
        }
        .tp-tab {
          background: rgba(192,57,43,0.06); border: 1px solid rgba(192,57,43,0.2);
          color: #a08870; font-size: 0.82rem; font-weight: 700;
          padding: 9px 18px; border-radius: 10px; cursor: pointer;
          font-family: inherit; transition: all 0.15s;
        }
        .tp-tab:hover { border-color: rgba(192,57,43,0.4); color: #e8ddd0; }
        .tp-tab.active { background: #c0392b; border-color: #c0392b; color: #fff; }

        .tp-tab-content { max-width: 860px; margin: 0 auto; }

        /* İki kolon */
        .tp-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: start; }
        .tp-tab-h3 { font-size: 1rem; font-weight: 800; color: #e8ddd0; margin: 0 0 10px; }
        .tp-tab-p  { font-size: 0.84rem; color: #a08870; line-height: 1.7; margin: 0; }
        .tp-tab-note { font-size: 0.74rem; color: #7a6050; font-style: italic; margin-top: 10px; }

        /* Rune grid */
        .tp-rune-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
        .tp-rune-item {
          background: rgba(192,57,43,0.06); border: 1px solid rgba(192,57,43,0.15);
          border-radius: 10px; padding: 10px 6px; text-align: center;
          cursor: default; position: relative; transition: all 0.2s;
        }
        .tp-rune-item:hover { background: rgba(192,57,43,0.15); border-color: rgba(192,57,43,0.5); }
        .tp-rune-sym { font-size: 1.5rem; color: #e8ddd0; line-height: 1; margin-bottom: 3px; }
        .tp-rune-lat { font-size: 0.68rem; font-weight: 800; color: #c0392b; letter-spacing: 0.1em; }
        .tp-rune-tip {
          display: none; position: absolute; bottom: calc(100% + 5px); left: 50%;
          transform: translateX(-50%); background: #1a0e06;
          border: 1px solid rgba(192,57,43,0.4); color: #e8ddd0;
          font-size: 0.68rem; white-space: nowrap; padding: 3px 7px;
          border-radius: 5px; z-index: 10;
        }
        .tp-rune-item:hover .tp-rune-tip { display: block; }

        /* Tengri grid */
        .tp-tengri-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .tp-tengri-card {
          background: rgba(192,57,43,0.05); border: 1px solid rgba(192,57,43,0.15);
          border-radius: 10px; padding: 12px; transition: all 0.2s;
        }
        .tp-tengri-card:hover { background: rgba(192,57,43,0.12); border-color: rgba(192,57,43,0.4); }
        .tp-tengri-sym  { font-size: 1.3rem; margin-bottom: 4px; }
        .tp-tengri-name { font-size: 0.82rem; font-weight: 800; color: #e8ddd0; margin-bottom: 3px; }
        .tp-tengri-desc { font-size: 0.7rem; color: #7a6050; line-height: 1.4; }

        /* War grid */
        .tp-war-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .tp-war-card {
          background: rgba(192,57,43,0.05); border: 1px solid rgba(192,57,43,0.15);
          border-radius: 12px; padding: 18px; transition: all 0.2s;
        }
        .tp-war-card:hover { border-color: rgba(192,57,43,0.4); background: rgba(192,57,43,0.1); }
        .tp-war-icon { font-size: 1.7rem; margin-bottom: 7px; }
        .tp-war-name { font-size: 0.88rem; font-weight: 800; color: #e8ddd0; margin: 0 0 5px; }
        .tp-war-desc { font-size: 0.76rem; color: #a08870; line-height: 1.5; margin: 0; }

        /* ── Kapanış ── */
        .tp-closing {
          padding: 80px 20px 64px; text-align: center;
          background: radial-gradient(ellipse at center, #1a0808 0%, #0a0604 60%);
        }
        .tp-final-quote { max-width: 560px; margin: 0 auto; }
        .tp-final-quote p {
          font-size: clamp(1.2rem, 4vw, 2rem); font-weight: 800;
          color: #e8ddd0; font-style: italic; margin: 0 0 14px;
          text-shadow: 0 0 40px rgba(192,57,43,0.5);
        }
        .tp-final-quote cite { font-size: 0.88rem; color: #c0392b; letter-spacing: 0.1em; }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .tp-hero { padding: 48px 16px 40px; }
          .tp-stats { grid-template-columns: repeat(2, 1fr); }
          .tp-stat { border-bottom: 1px solid rgba(192,57,43,0.15); }
          .tp-bz-grid { grid-template-columns: 1fr; }
          .tp-two-col { grid-template-columns: 1fr; gap: 20px; }
          .tp-rune-grid { grid-template-columns: repeat(3, 1fr); }
          .tp-tengri-grid { grid-template-columns: 1fr 1fr; }
          .tp-war-grid { grid-template-columns: 1fr 1fr; }
          .tp-divider-title { font-size: 0.95rem; }
          /* Timeline: mobilde yatay scroll daha dar kartlarla */
          .tp-era-card { flex: 0 0 min(240px, 80vw); }
          .tp-tl-track { padding: 20px 16px 28px; gap: 14px; }
        }

        @media (max-width: 400px) {
          .tp-stats { grid-template-columns: 1fr 1fr; }
          .tp-rune-grid { grid-template-columns: repeat(3, 1fr); }
          .tp-war-grid { grid-template-columns: 1fr; }
          .tp-tengri-grid { grid-template-columns: 1fr; }
          .tp-era-card { flex: 0 0 min(220px, 85vw); }
        }
      `}</style>
    </main>
  );
}
