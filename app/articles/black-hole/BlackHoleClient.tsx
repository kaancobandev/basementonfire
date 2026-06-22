'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';

const refs: BibItem[] = [
  { title: 'Zamanın Kısa Tarihi', authors: 'Stephen Hawking', year: '1988', source: 'Bantam Books' },
  { title: 'Black Holes and Time Warps', authors: 'Kip S. Thorne', year: '1994', source: 'W. W. Norton' },
  { title: 'Black Holes', source: 'NASA Science', url: 'https://science.nasa.gov/universe/black-holes/' },
  { title: 'First Image of a Black Hole (M87*)', authors: 'Event Horizon Telescope', year: '2019', source: 'EHT Collaboration', url: 'https://eventhorizontelescope.org/' },
];

const CORRECT = [1, 2, 2];

export default function BlackHolePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [densityShown, setDensityShown] = useState(false);
  const [quizQ, setQuizQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Record<number, { selected: number; correct: number }>>({});
  const [done, setDone] = useState(false);
  const [dots, setDots] = useState<('idle' | 'active' | 'correct' | 'wrong')[]>(['active', 'idle', 'idle']);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    let W = 0, H = 0;
    const mouse = { x: -1000, y: -1000 };

    class Star {
      x = Math.random() * W; y = Math.random() * H;
      size = Math.random() * 2; baseSize = this.size;
      speedX = (Math.random() - 0.5) * 0.2; speedY = (Math.random() - 0.5) * 0.2;
      brightness = Math.random();

      update() {
        this.x += this.speedX; this.y += this.speedY;
        if (this.x < 0) this.x = W; if (this.x > W) this.x = 0;
        if (this.y < 0) this.y = H; if (this.y > H) this.y = 0;
        const dx = mouse.x - this.x, dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy), maxDist = 300;
        if (dist < maxDist && dist > 0) {
          const force = (maxDist - dist) / maxDist;
          this.x += (dx / dist) * force * 5; this.y += (dy / dist) * force * 5;
          this.size = this.baseSize + force * 2;
        } else { this.size = this.baseSize; }
      }
      draw() {
        ctx.fillStyle = `rgba(255,255,255,${this.brightness})`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
      }
    }

    let stars: Star[] = [];
    let animId = 0;

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
      stars = [];
      for (let i = 0; i < Math.floor((W * H) / 3000); i++) stars.push(new Star());
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) { s.update(); s.draw(); }
      animId = requestAnimationFrame(animate);
    }

    const onResize = () => resize();
    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onTouch = (e: TouchEvent) => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onTouch, { passive: true });
    resize(); animate();

    // Scroll reveal
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) (e.target as HTMLElement).classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
      cancelAnimationFrame(animId);
      obs.disconnect();
    };
  }, []);

  function answerQ(qi: number, selected: number) {
    if (answered[qi] !== undefined) return;
    const correct = CORRECT[qi];
    const isRight = selected === correct;
    const newScore = score + (isRight ? 1 : 0);
    setScore(newScore);
    setAnswered(prev => ({ ...prev, [qi]: { selected, correct } }));
    const newDots = [...dots];
    newDots[qi] = isRight ? 'correct' : 'wrong';
    setDots(newDots as any);
    setTimeout(() => {
      if (qi + 1 < 3) {
        setQuizQ(qi + 1);
        const d = [...newDots]; d[qi + 1] = 'active'; setDots(d as any);
      } else {
        setDone(true);
      }
    }, 850);
  }

  function restartQuiz() {
    setQuizQ(0); setScore(0); setAnswered({}); setDone(false);
    setDots(['active', 'idle', 'idle']);
  }

  const questions = [
    { text: 'Bir kara delik, Dünya\'yı içine çeker mi?', opts: ['Evet, hemen yutar!', 'Hayır, sadece yörüngede döneriz.', 'Sadece gece olduğunda.', 'Dünya\'dan küçük olduğu için çekemez.'] },
    { text: 'Kara deliğin merkezindeki sonsuz yoğunluk noktasına ne denir?', opts: ['Olay Ufku', 'Süpernova', 'Tekillik (Singularity)', 'Wormhole'] },
    { text: 'Kara deliklerin fotoğrafını çeken projenin adı nedir?', opts: ['Hubble Teleskobu', 'James Webb', 'Olay Ufku Teleskobu (EHT)', 'NASA Black Hole Cam'] },
  ];

  const resultData = [
    { icon: '🍝', title: 'Spagetti Oldun!', desc: 'Olay ufkuna yakalandın. Biraz daha okuyup tekrar dene!' },
    { icon: '👩‍🚀', title: 'Uzay Kaşifi', desc: `3 sorudan ${score} tanesini bildin. İyi iş!` },
    { icon: '👩‍🚀', title: 'Uzay Kaşifi', desc: `3 sorudan ${score} tanesini bildin. İyi iş!` },
    { icon: '🌌', title: 'Evrenin Hakimi!', desc: 'Tebrikler, bir kara delikten bile kaçabilecek bilgiye sahipsin!' },
  ][score];

  return (
    <main style={{ flex: 1, minWidth: 0, maxWidth: '100%', overflowX: 'hidden', background: '#050505', color: '#e0e0e0', minHeight: '100vh' }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, background: 'radial-gradient(circle at center,#1a0b2e 0%,#000 100%)', pointerEvents: 'none' }} />

      <div style={{ position: 'sticky', top: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,69,0,0.3)', color: '#e0e0e0', zIndex: 50, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/" style={{ color: '#e0e0e0', textDecoration: 'none', display: 'flex', padding: 8, borderRadius: '50%' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <span style={{ fontFamily: 'monospace', color: '#ff4500', fontWeight: 700, fontSize: '1.1rem' }}>KARA DELİKLER</span>
        <span style={{ fontSize: '0.75rem', color: '#536471', marginLeft: 8 }}>İnteraktif Makale</span>
      </div>

      <div style={{ position: 'relative', zIndex: 1, fontFamily: 'system-ui, sans-serif', paddingBottom: 40 }}>

        {/* Hero */}
        <header className="reveal" style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '80px 24px 40px' }}>
          <div style={{ position: 'relative', width: 280, height: 280, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'conic-gradient(from 0deg, transparent 0%,#ff8c00 40%,#ff4500 60%,transparent 100%)', animation: 'spin 2s linear infinite', filter: 'blur(10px)', opacity: 0.85, boxShadow: '0 0 60px #ff4500' }} />
            <div style={{ position: 'absolute', width: '58%', height: '58%', background: '#000', borderRadius: '50%', boxShadow: '0 0 20px #000,inset 0 0 20px rgba(255,69,0,0.6)', zIndex: 2 }} />
          </div>
          <h1 style={{ fontFamily: 'monospace', fontSize: 'clamp(2rem,8vw,5rem)', fontWeight: 900, margin: '24px 0 16px', textShadow: '0 0 30px rgba(255,69,0,0.7),0 0 60px rgba(255,69,0,0.3)' }}>KARA DELİKLER</h1>
          <p style={{ fontSize: 'clamp(0.9rem,2vw,1.1rem)', color: '#b0b0b0', maxWidth: 580, lineHeight: 1.8 }}>
            Evrenin en gizemli yapılarına doğru interaktif bir yolculuğa çıkın.<br/>Işığın bile kaçamadığı noktaya hoş geldiniz.
          </p>
          <a href="#nedir" style={{ marginTop: 40, fontSize: '1.5rem', color: '#ff4500', textDecoration: 'none', animation: 'bounce 2s infinite' }}>↓</a>
        </header>

        {/* Section 1 */}
        <section id="nedir" className="reveal" style={{ maxWidth: 920, margin: '0 auto', padding: '60px 24px 20px' }}>
          <h2 style={{ fontFamily: 'monospace', fontSize: 'clamp(1.2rem,3vw,1.8rem)', color: '#ff4500', borderLeft: '4px solid #ff4500', paddingLeft: 16, marginBottom: 28 }}>Kara Delik Nedir?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            <div>
              <p style={{ color: '#b0b0b0', lineHeight: 1.85, marginBottom: 14, fontSize: '0.95rem' }}>Kara delikler, evrendeki en yoğun nesnelerdir. Bir bowling topunu düşünün, ancak ağırlığı Everest Dağı kadar olsun. Bu yoğunluk, uzay-zaman dokusunu öylesine büker ki, <strong style={{ color: '#ff8c00' }}>ışık bile kaçamaz</strong>.</p>
              <p style={{ color: '#b0b0b0', lineHeight: 1.85, marginBottom: 14, fontSize: '0.95rem' }}>Dev yıldızlar yakıtlarını tükettiklerinde kendi içlerine çökerler. Bu çöküş durdurulamaz bir noktaya geldiğinde, bir kara delik doğar.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 28, textAlign: 'center' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Yoğunluk Deneyi</h3>
              <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: 20 }}>Dünya'yı bir kara delik yapmak için ne kadar sıkıştırmalıyız?</p>
              {!densityShown ? (
                <div><span style={{ fontSize: '3rem' }}>🌍</span><p style={{ color: '#888', fontSize: '0.85rem', marginTop: 8 }}>Dünya (12,742 km çapı)</p></div>
              ) : (
                <div>
                  <div style={{ width: 12, height: 12, background: '#3b82f6', borderRadius: '50%', boxShadow: '0 0 24px #3b82f6', margin: '0 auto 12px' }} />
                  <p style={{ color: '#ff4500', fontWeight: 700 }}>3 cm Çapında!</p>
                  <p style={{ fontSize: '0.75rem', color: '#888', marginTop: 4 }}>Tüm Dünya bir bilye boyutuna inerse kara delik olur.</p>
                </div>
              )}
              <button onClick={() => setDensityShown(p => !p)} style={{ marginTop: 16, background: '#ff4500', border: 'none', borderRadius: 24, color: '#fff', fontWeight: 700, fontSize: '0.9rem', padding: '10px 24px', cursor: 'pointer' }}>
                {densityShown ? 'Geri Al' : 'Sıkıştır!'}
              </button>
            </div>
          </div>
        </section>

        {/* Section 2 — Anatomy */}
        <section className="reveal" style={{ maxWidth: 920, margin: '0 auto', padding: '60px 24px 20px' }}>
          <h2 style={{ fontFamily: 'monospace', fontSize: 'clamp(1.2rem,3vw,1.8rem)', color: '#ff4500', textAlign: 'center', marginBottom: 28 }}>Bir Canavarın Anatomisi</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[['🌀','Olay Ufku','Geri dönüşü olmayan nokta. Burayı geçen hiçbir şey, ışık dahil, evrenin geri kalanına dönemez.'],['⚫','Tekillik (Singularity)','Merkezdeki sonsuz yoğunluk noktası. Bildiğimiz fizik yasaları burada işlemez hale gelir.'],['💿','Toplanma Diski','Kara deliğin etrafında ışık hızına yakın dönen gaz ve toz bulutu. Milyonlarca dereceye ısınır.']].map(([icon, title, desc]) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 28, textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 14 }}>{icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: '0.82rem', color: '#888', lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 — Types */}
        <section className="reveal" style={{ maxWidth: 920, margin: '0 auto', padding: '60px 24px 20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 40, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: '#4b0082', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.3, pointerEvents: 'none' }} />
            <h2 style={{ fontFamily: 'monospace', fontSize: 'clamp(1.2rem,3vw,1.8rem)', color: '#ff4500', borderLeft: '4px solid #ff4500', paddingLeft: 16, marginBottom: 32 }}>Kara Delikler Ne Yer?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: '#b0b0b0', lineHeight: 1.85, marginBottom: 14, fontSize: '0.95rem' }}>Filmlerin aksine, kara delikler bir "elektrikli süpürge" değildir.</p>
                <p style={{ color: '#b0b0b0', lineHeight: 1.85, marginBottom: 14, fontSize: '0.95rem' }}>Eğer Güneşimiz aniden bir kara deliğe dönüşseydi, Dünya içine çekilmezdi. Sadece karanlıkta kalırdık.</p>
                <div style={{ padding: 16, border: '1px solid rgba(255,69,0,0.35)', borderRadius: 12, background: 'rgba(255,69,0,0.06)' }}>
                  <h4 style={{ color: '#ff8c00', fontWeight: 700, marginBottom: 8 }}>⚠ Spagettileşme Nedir?</h4>
                  <p style={{ fontSize: '0.85rem', color: '#aaa', lineHeight: 1.7 }}>Bir kara deliğe ayaklarınız önde düşerseniz, ayaklarınızdaki çekim kuvveti başınızdakinden çok fazla olur ki, bir makarna gibi uzarsınız.</p>
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <span title="Üzerime gel!" style={{ fontSize: '3.5rem', display: 'inline-block', transition: 'transform 1s ease, filter 1s ease', cursor: 'help' }}
                      onMouseOver={e => { (e.target as HTMLElement).style.transform = 'scaleY(3.5) scaleX(0.4)'; (e.target as HTMLElement).style.filter = 'blur(1px)'; }}
                      onMouseOut={e => { (e.target as HTMLElement).style.transform = ''; (e.target as HTMLElement).style.filter = ''; }}
                    >👩‍🚀</span>
                    <p style={{ fontSize: '0.7rem', color: '#666', marginTop: 6 }}>(Astronotun üzerine gelin)</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[{n:'1',bg:'#374151',c:'',title:'Yıldızsal Kara Delikler',desc:'Güneşin 10–20 katı kütleye sahip, evrende en yaygın tür.'},{n:'2',bg:'#7c2d12',c:'#fb923c',title:'Süper Kütleli Kara Delikler',desc:'Milyonlarca Güneş kütlesi! Galaksimizin kalbindeki Sagittarius A* bu türdendir.'},{n:'3',bg:'#1e3a5f',c:'#60a5fa',title:'Orta Kütleli Kara Delikler',desc:'Binin üzerinde Güneş kütlesi, hâlâ araştırılıyor.'}].map(t => (
                  <div key={t.n} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${t.c ? 'rgba(255,69,0,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', color: t.c || '#fff', flexShrink: 0 }}>{t.n}</div>
                    <div><h4 style={{ fontWeight: 700, marginBottom: 4, color: t.c || '#fff' }}>{t.title}</h4><p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>{t.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quiz */}
        <section className="reveal" style={{ maxWidth: 920, margin: '0 auto', padding: '60px 24px 20px' }}>
          <h2 style={{ fontFamily: 'monospace', fontSize: 'clamp(1.2rem,3vw,1.8rem)', color: '#ff4500', textAlign: 'center', marginBottom: 28 }}>Olay Ufku Testi</h2>
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, maxWidth: 680, margin: '0 auto' }}>
            {!done ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <span style={{ fontSize: '0.8rem', color: '#ff4500', fontFamily: 'monospace', letterSpacing: 1 }}>SORU {quizQ + 1} / 3</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {dots.map((d, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: d === 'idle' ? 'rgba(255,255,255,0.15)' : d === 'active' ? '#ff4500' : d === 'correct' ? '#22c55e' : '#ef4444', transition: 'background 0.3s' }} />)}
                  </div>
                </div>
                {questions.map((q, qi) => qi === quizQ && (
                  <div key={qi}>
                    <p style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.65, marginBottom: 20, color: '#e0e0e0' }}>{q.text}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {q.opts.map((opt, oi) => {
                        const ans = answered[qi];
                        let bg = 'rgba(255,255,255,0.04)', borderColor = 'rgba(255,255,255,0.12)', color = '#e0e0e0';
                        if (ans) {
                          if (oi === ans.correct) { bg = 'rgba(34,197,94,0.15)'; borderColor = '#22c55e'; color = '#86efac'; }
                          else if (oi === ans.selected) { bg = 'rgba(239,68,68,0.15)'; borderColor = '#ef4444'; color = '#fca5a5'; }
                        }
                        return (
                          <button key={oi} disabled={!!ans} onClick={() => answerQ(qi, oi)}
                            style={{ width: '100%', textAlign: 'left', padding: '14px 18px', border: `1px solid ${borderColor}`, borderRadius: 10, background: bg, color, cursor: ans ? 'default' : 'pointer', fontSize: '0.9rem', fontFamily: 'inherit', lineHeight: 1.4, transition: 'all 0.15s' }}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>{resultData.icon}</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>{resultData.title}</h3>
                <p style={{ color: '#aaa', marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.6 }}>{resultData.desc}</p>
                <button onClick={restartQuiz} style={{ background: '#ff4500', border: 'none', borderRadius: 24, color: '#fff', fontWeight: 700, fontSize: '0.9rem', padding: '10px 24px', cursor: 'pointer' }}>Tekrar Dene</button>
              </div>
            )}
          </div>
        </section>

        {/* Closing */}
        <section className="reveal" style={{ maxWidth: 920, margin: '0 auto', padding: '60px 24px 80px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'monospace', fontSize: 'clamp(1.2rem,3vw,1.8rem)', color: '#ff4500', textAlign: 'center', marginBottom: 20 }}>Hawking Radyasyonu ve Evrenin Sonu</h2>
          <p style={{ maxWidth: 640, margin: '0 auto 24px', color: '#aaa', lineHeight: 1.8, fontSize: '0.95rem' }}>Trilyonlarca yıl sonra yıldızlar söndüğünde, evrende sadece kara delikler kalacak. Stephen Hawking'in teorisine göre, onlar da çok yavaş bir şekilde radyasyon yayarak buharlaşacaklar. Ve sonunda, evren sessizliğe gömülecek.</p>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 24px', fontSize: '0.85rem' }}>
            <span style={{ color: '#888' }}>Hazırlayan:</span>
            <span style={{ color: '#ff4500', fontWeight: 700, marginLeft: 6 }}>Kaan Çoban</span>
          </div>
        </section>

        <ArticleBibliography items={refs} accent="#ff4500" />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
        .reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        /* React inline-style'ı iki nokta sonrası BOŞLUKSUZ üretir
           (grid-template-columns:1fr 1fr) ve grid bazıları iç içe (section>div>div);
           bu yüzden boşluksuz alt-dizge + descendant ( ) birleştirici kullanılır. */
        @media (max-width: 767px) {
          section div[style*="grid-template-columns:1fr 1fr"],
          section div[style*="grid-template-columns:repeat(3"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
