'use client';

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import Link from 'next/link';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';

/* ════════════════════════ VERİ ════════════════════════ */

const conditions = [
  { id: 'heat', icon: '🔥', t: 'Aşırı Sıcak — 150°C', color: '#fb7185',
    d: 'Suyun kaynama noktasının (100°C) çok üstünde, 150°C\'ye kadar dayanabilirler. Çoğu canlının proteini 60°C\'de pıhtılaşıp bozulurken tardigrad tun halinde sapasağlam kalır.' },
  { id: 'cold', icon: '❄️', t: 'Aşırı Soğuk — −272°C', color: '#22d3ee',
    d: 'Mutlak sıfıra (−273.15°C) yalnızca bir derece kala, −272°C\'de bile hayatta kalırlar. Bu, uzayın derinliklerindeki çoğu yerden bile soğuktur.' },
  { id: 'vacuum', icon: '🌌', t: 'Uzay Boşluğu', color: '#a78bfa',
    d: '2007\'de Avrupa Uzay Ajansı (ESA) tardigradları doğrudan uzay boşluğuna çıkardı. Havasızlık ve basınçsızlıkta 10 gün dayandılar, Dünya\'ya dönünce canlandılar — bunu başaran ilk hayvan oldular.' },
  { id: 'radiation', icon: '☢️', t: 'Radyasyon — 1000× Ölümcül Doz', color: '#fbbf24',
    d: 'Bir insanı öldüren radyasyonun yaklaşık 1000 katına dayanırlar. Sırrı: DNA\'yı kalkan gibi saran Dsup proteini ve serbest radikalleri etkisizleştiren pigmentler.' },
  { id: 'pressure', icon: '🌊', t: 'Basınç — 6000 Atmosfer', color: '#34d399',
    d: 'Okyanusun en derin noktası Mariana Çukuru\'nun 6 katı basınca dayanırlar. Yani gezegenin hiçbir derinliği onları ezecek kadar güçlü değildir.' },
  { id: 'dry', icon: '🏜️', t: 'Susuzluk — Onlarca Yıl', color: '#f59e0b',
    d: 'Suyunun %95\'inden fazlasını kaybedip kuru bir toz topağına dönerler ve onlarca yıl (bazı kayıtlarda 30 yıldan fazla) öylece bekleyip tek bir su damlasıyla geri dönerler.' },
];

const crypto = [
  { t: 'Mutlu ve ıslak', d: 'Tardigrad normalde ince bir su filmi içinde yaşar; yosun ve likende sallana sallana yürür, yosunun suyunu emer. Bu, onun rahat hâlidir.' },
  { t: 'Su çekiliyor', d: 'Ortam kurumaya başlayınca tehlikeyi sezer ve vücudunu korumaya hazırlanır. Panik yok — milyonlarca yıllık bir plan devreye girer.' },
  { t: 'Tun haline geçiş', d: 'Bacaklarını ve başını içeri çeker, fıçı şeklinde minik bir topa — "tun"a — dönüşür. Vücut hacmi küçülür, yüzey alanı azalır.' },
  { t: 'Trehaloz kalkanı', d: 'Kaybolan suyun yerini "trehaloz" adlı özel bir şeker ve koruyucu proteinler alır. Bunlar hücre zarlarını ve molekülleri cam gibi sarıp dondurarak korur.' },
  { t: 'Donmuş zaman', d: 'Metabolizması normalin %0.01\'inin bile altına iner — neredeyse ölü gibidir ama değildir. Bu askıya alınmış hayatta yıllarca bekleyebilir.' },
  { t: 'Bir damla = hayat', d: 'Tek bir su damlası değdiğinde dakikalar içinde şişer, bacaklarını açar ve sanki hiçbir şey olmamış gibi yürümeye devam eder. 🐻' },
];

const facts = [
  { icon: '🐻', t: '"Su ayısı" der gibi', d: 'Tombul bedeni ve sallanan yürüyüşü minik bir ayıyı andırdığı için bu adı aldı. Almanca ilk adı "Kleiner Wasserbär" (küçük su ayısı).' },
  { icon: '🔬', t: '1773\'te keşfedildi', d: 'Alman papaz J. A. E. Goeze mikroskopla ilk kez gördü. Üç yıl sonra İtalyan Spallanzani "Tardigrada" (yavaş yürüyen) adını verdi.' },
  { icon: '🌙', t: 'Ay\'a düştüler', d: '2019\'da İsrail\'in Beresheet aracı binlerce kuru tardigradı Ay\'a taşırken çakıldı. 2021 araştırması, çarpmada büyük olasılıkla öldüklerini gösterdi.' },
  { icon: '💪', t: 'Ama ölümsüz değil', d: 'Süper güç yalnızca tun halinde geçerli. Aktifken (ıslak ve hareketliyken) aslında oldukça narindirler — kolayca zarar görebilirler.' },
  { icon: '🌍', t: 'Her yerdeler', d: '1300\'den fazla tür var; bahçendeki yosunda, çatı oluğunda, kutup buzunda, okyanus dibinde — kelimenin tam anlamıyla her yerde yaşarlar.' },
  { icon: '🧬', t: 'Kısmen "yabancı"', d: 'Bazı türlerin genomunun bir bölümü bakteri ve diğer canlılardan yatay gen transferiyle gelmiş olabilir — adeta yaşayan bir kolaj.' },
];

const quizQs = [
  { text: 'Tardigradların halk arasındaki adı nedir?', opts: ['Deniz yıldızı', 'Su ayısı', 'Toprak solucanı', 'Cam böceği'], a: 1 },
  { text: 'Kuruyunca girdikleri, metabolizmayı neredeyse durduran hale ne denir?', opts: ['Hibernasyon', 'Tun hali (kriptobiyoz)', 'Metamorfoz', 'Fotosentez'], a: 1 },
  { text: 'Tardigradlar yaklaşık hangi sıcaklık aralığında hayatta kalabilir?', opts: ['0°C – 40°C', '−272°C – 150°C', '−10°C – 60°C', 'sadece oda sıcaklığı'], a: 1 },
  { text: 'DNA\'larını radyasyondan koruyan özel proteinin adı nedir?', opts: ['Hemoglobin', 'Dsup', 'Keratin', 'Klorofil'], a: 1 },
  { text: '2007\'de tardigradlar ilk kez nerede hayatta kaldı?', opts: ['Volkan içinde', 'Doğrudan uzay boşluğunda', 'Güneş\'te', 'Reaktör çekirdeğinde'], a: 1 },
  { text: 'Tun halinde suyunun ne kadarını kaybederler?', opts: ['%10', '%50', '%95\'ten fazla', 'hiç'], a: 2 },
];

const refs: BibItem[] = [
  { title: 'Tardigrade', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Tardigrade' },
  { title: 'Tardigrades (Water Bears)', source: 'National Geographic', url: 'https://www.nationalgeographic.com/animals/invertebrates/facts/tardigrades-water-bears' },
  { title: 'What are tardigrades and why are they nearly indestructible?', source: 'Live Science', url: 'https://www.livescience.com/57985-tardigrade-facts.html' },
  { title: 'Environmental tolerance in tardigrades', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Environmental_tolerance_in_tardigrades' },
  { title: 'Tardigrades in space (ESA TARDIS, 2007)', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Tardigrades_in_space' },
  { title: 'Extremotolerant tardigrade genome and improved radiotolerance by Dsup', authors: 'T. Hashimoto, T. Kunieda et al.', year: '2016', source: 'Nature Communications 7, 12808' },
  { title: 'Tardigrade survival limits in high-speed impacts (Beresheet)', authors: 'A. Traspas & M. Burchell', year: '2021', source: 'Astrobiology 21(7)' },
  { title: 'Cryptobiosis', source: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Cryptobiosis' },
];

/* ════════════════════════ STEPPER ════════════════════════ */

function Stepper({ steps, accent, children }: { steps: { t: string; d: string }[]; accent: string; children: (i: number) => ReactNode }) {
  const [i, setI] = useState(0);
  return (
    <div className="trd-stepper">
      <div className="trd-stepper-viz">{children(i)}</div>
      <div className="trd-stepper-panel">
        <div className="trd-dots">
          {steps.map((_, k) => (
            <button key={k} className={`trd-dot ${k === i ? 'on' : ''}`} onClick={() => setI(k)} aria-label={`Adım ${k + 1}`}
              style={k <= i ? { background: accent, borderColor: accent } : undefined} />
          ))}
        </div>
        <div className="trd-step-meta" style={{ color: accent }}>ADIM {i + 1} / {steps.length}</div>
        <h4 className="trd-step-title">{steps[i].t}</h4>
        <p className="trd-step-desc">{steps[i].d}</p>
        <div className="trd-stepper-ctrl">
          <button className="trd-ctrl-btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>← Geri</button>
          <button className="trd-ctrl-btn trd-ctrl-primary" style={{ background: accent, borderColor: accent }} onClick={() => setI(Math.min(steps.length - 1, i + 1))} disabled={i === steps.length - 1}>İleri →</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════ 2B MİNİ OYUN ════════════════════════ */

function TardigradeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [screen, setScreen] = useState<'start' | 'playing' | 'over'>('start');
  const [finalScore, setFinalScore] = useState(0);
  const [best, setBest] = useState(0);

  const g = useRef({ px: 0, left: false, right: false, drag: -1, objects: [] as any[], tun: { on: false, t: 0, cd: 0 }, lives: 3, score: 0, spawn: 0, t: 0, flash: 0, bob: 0, best: 0 });
  const screenRef = useRef(screen); screenRef.current = screen;
  const visibleRef = useRef(true);

  useEffect(() => { try { const b = parseInt(localStorage.getItem('trd-best') || '0', 10); if (b) { setBest(b); g.current.best = b; } } catch {} }, []);

  function startGame() {
    const s = g.current;
    const W = wrapRef.current ? wrapRef.current.clientWidth : 320;
    s.px = W / 2; s.left = false; s.right = false; s.drag = -1; s.objects = []; s.tun = { on: false, t: 0, cd: 0 };
    s.lives = 3; s.score = 0; s.spawn = 600; s.t = 0; s.flash = 0; s.bob = 0;
    setScreen('playing');
  }
  function tryTun() { const s = g.current; if (screenRef.current === 'playing' && !s.tun.on && s.tun.cd <= 0) { s.tun.on = true; s.tun.t = 880; } }

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const HAZARDS = ['☢️', '🔥', '❄️', '🌪️'];
    let W = 0; const H = 380; let raf = 0; let last = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      W = wrapRef.current ? wrapRef.current.clientWidth : 320;
      canvas.width = W * DPR; canvas.height = H * DPR;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (g.current.px === 0) g.current.px = W / 2;
    }
    resize();

    function spawn() {
      const s = g.current; const isWater = Math.random() < 0.42;
      s.objects.push({ x: 28 + Math.random() * (W - 56), y: -22, type: isWater ? 'water' : 'hazard', emoji: isWater ? '💧' : HAZARDS[(Math.random() * HAZARDS.length) | 0], vy: 1.7 + Math.random() * 0.8 + (s.score / 240) });
    }

    function endGame() {
      const s = g.current; setFinalScore(s.score);
      const nb = Math.max(s.best, s.score); s.best = nb; setBest(nb);
      try { localStorage.setItem('trd-best', String(nb)); } catch {}
      setScreen('over');
    }

    function drawTardigrade(x: number, y: number) {
      const s = g.current;
      if (s.tun.on) {
        ctx.save(); ctx.translate(x, y);
        ctx.strokeStyle = 'rgba(251,191,36,0.7)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 21 + Math.sin(s.bob / 90) * 2, 0, Math.PI * 2); ctx.stroke();
        const grd = ctx.createLinearGradient(0, -14, 0, 14); grd.addColorStop(0, '#caa05a'); grd.addColorStop(1, '#9c7536');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.ellipse(0, 2, 16, 14, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(70,46,16,0.3)'; ctx.lineWidth = 1.3;
        for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 7, -11); ctx.quadraticCurveTo(i * 7 + 1.5, 2, i * 7, 13); ctx.stroke(); }
        ctx.fillStyle = '#fbbf24'; ctx.font = '700 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('zZ', 0, -18);
        ctx.restore(); return;
      }
      const bob = Math.sin(s.bob / 150) * 1.6;
      ctx.save(); ctx.translate(x, y + bob);
      const dir = s.right ? 1 : s.left ? -1 : 1;
      ctx.scale(dir, 1);
      ctx.fillStyle = '#9c7536';
      for (let i = 0; i < 4; i++) { const lx = -15 + i * 9.5; ctx.beginPath(); ctx.ellipse(lx, 12, 3.4, 6.5, 0, 0, Math.PI * 2); ctx.fill(); }
      const grd = ctx.createLinearGradient(0, -13, 0, 13); grd.addColorStop(0, '#cda158'); grd.addColorStop(1, '#a9803f');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.ellipse(0, 0, 23, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(80,52,18,0.32)'; ctx.lineWidth = 1.2;
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 7.5, -11.5); ctx.quadraticCurveTo(i * 7.5 + 1.5, 0, i * 7.5, 11.5); ctx.stroke(); }
      ctx.fillStyle = '#a9803f'; ctx.beginPath(); ctx.ellipse(22, -2, 6, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2c1e0e'; ctx.beginPath(); ctx.arc(24, -4, 1.7, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    function draw() {
      const s = g.current;
      const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0d1a16'); bg.addColorStop(1, '#0a1512');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(74,222,128,0.10)'; ctx.fillRect(0, H - 26, W, 26);
      ctx.fillStyle = 'rgba(74,222,128,0.16)';
      for (let i = 0; i < W + 26; i += 26) { ctx.beginPath(); ctx.arc(i, H - 26, 10, Math.PI, 0); ctx.fill(); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const o of s.objects) { ctx.font = (o.type === 'water' ? '21px' : '25px') + ' system-ui'; ctx.fillText(o.emoji, o.x, o.y); }
      drawTardigrade(s.px, H - 52);
      if (s.flash > 0) { ctx.fillStyle = `rgba(239,68,68,${0.3 * (s.flash / 360)})`; ctx.fillRect(0, 0, W, H); }
      // HUD
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.fillStyle = '#e6f0ea'; ctx.font = '800 17px system-ui'; ctx.fillText('Skor ' + s.score, 12, 24);
      ctx.font = '15px system-ui'; let hearts = ''; for (let i = 0; i < s.lives; i++) hearts += '❤️'; ctx.fillText(hearts, 12, 45);
      ctx.textAlign = 'right'; ctx.fillStyle = '#8fa89c'; ctx.font = '600 13px system-ui'; ctx.fillText('Rekor ' + Math.max(s.best, s.score), W - 12, 22);
      ctx.font = '700 12px system-ui';
      if (s.tun.on) { ctx.fillStyle = '#fbbf24'; ctx.fillText('🛡️ TUN AKTİF', W - 12, 42); }
      else if (s.tun.cd > 0) { ctx.fillStyle = '#8fa89c'; ctx.fillText('⏳ ' + (s.tun.cd / 1000).toFixed(1) + 's', W - 12, 42); }
      else { ctx.fillStyle = '#4ade80'; ctx.fillText('✓ TUN hazır', W - 12, 42); }
    }

    function loop(ts: number) {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(40, ts - (last || ts)); last = ts; const f = dt / 16.67;
      const s = g.current;
      if (screenRef.current === 'playing' && visibleRef.current) {
        s.t += dt; s.bob += dt;
        const spd = 5.4 * f;
        if (s.drag >= 0) s.px += (s.drag - s.px) * Math.min(1, 0.3 * f);
        else { if (s.left) s.px -= spd; if (s.right) s.px += spd; }
        s.px = Math.max(26, Math.min(W - 26, s.px));
        if (s.tun.on) { s.tun.t -= dt; if (s.tun.t <= 0) { s.tun.on = false; s.tun.cd = 1100; } }
        else if (s.tun.cd > 0) s.tun.cd -= dt;
        if (s.flash > 0) s.flash -= dt;
        s.spawn -= dt; if (s.spawn <= 0) { spawn(); s.spawn = Math.max(360, 820 - s.t / 26 - s.score * 1.5); }
        const py = H - 52;
        for (let i = s.objects.length - 1; i >= 0; i--) {
          const o = s.objects[i]; o.y += o.vy * f;
          if (o.y > py - 24 && o.y < py + 20 && Math.abs(o.x - s.px) < 28) {
            if (o.type === 'water') { s.score += 10; s.objects.splice(i, 1); continue; }
            if (s.tun.on) { s.objects.splice(i, 1); continue; }
            s.lives -= 1; s.flash = 360; s.objects.splice(i, 1);
            if (s.lives <= 0) { endGame(); break; }
            continue;
          }
          if (o.y > H + 26) s.objects.splice(i, 1);
        }
      }
      draw();
    }

    draw(); // ilk kareyi hemen çiz (sayfa görünür olmadan rAF beklemeden de görünsün)
    raf = requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    function kd(e: KeyboardEvent) {
      if (screenRef.current !== 'playing' || !visibleRef.current) return;
      const k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') { g.current.left = true; g.current.drag = -1; e.preventDefault(); }
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') { g.current.right = true; g.current.drag = -1; e.preventDefault(); }
      else if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') { tryTun(); e.preventDefault(); }
    }
    function ku(e: KeyboardEvent) {
      const k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') g.current.left = false;
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') g.current.right = false;
    }
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    const io = new IntersectionObserver((es) => { es.forEach((e) => { visibleRef.current = e.isIntersecting; }); }, { threshold: 0.25 });
    if (wrapRef.current) io.observe(wrapRef.current);

    // kanvas üstünde sürükle (mobil)
    function rectX(clientX: number) { const r = canvas.getBoundingClientRect(); return clientX - r.left; }
    function pdown(e: PointerEvent) { if (screenRef.current !== 'playing') return; g.current.drag = rectX(e.clientX); }
    function pmove(e: PointerEvent) { if (g.current.drag >= 0) g.current.drag = rectX(e.clientX); }
    function pup() { g.current.drag = -1; }
    canvas.addEventListener('pointerdown', pdown); canvas.addEventListener('pointermove', pmove);
    window.addEventListener('pointerup', pup);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
      window.removeEventListener('pointerup', pup);
      canvas.removeEventListener('pointerdown', pdown); canvas.removeEventListener('pointermove', pmove);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hold = (dir: 'left' | 'right', on: boolean) => () => { g.current[dir] = on; g.current.drag = -1; };

  return (
    <div className="trd-game">
      <div className="trd-game-stage" ref={wrapRef}>
        <canvas ref={canvasRef} className="trd-canvas" />
        {screen !== 'playing' && (
          <div className="trd-overlay">
            {screen === 'start' ? (
              <>
                <div className="trd-ov-emoji">🐻💧</div>
                <h3 className="trd-ov-title">Tardigrad: Hayatta Kal</h3>
                <p className="trd-ov-desc">Aşırı tehlikelerden (☢️🔥❄️🌪️) kaç, su damlalarını (💧) topla. Tehlike çarpacakken <strong>TUN</strong>&apos;a geç — yenilmez olursun ama kıpırdayamazsın!</p>
                <button className="trd-ov-btn" onClick={startGame}>▶ Başla</button>
              </>
            ) : (
              <>
                <div className="trd-ov-emoji">{finalScore >= 200 ? '🏆' : finalScore >= 80 ? '🎉' : '🐻'}</div>
                <h3 className="trd-ov-title">Skor: {finalScore}</h3>
                <p className="trd-ov-desc">Rekor: {best} · {finalScore >= 200 ? 'Tam bir su ayısısın!' : finalScore >= 80 ? 'İyi dayandın!' : 'Tun zamanlamasını çalış!'}</p>
                <button className="trd-ov-btn" onClick={startGame}>↺ Tekrar oyna</button>
              </>
            )}
          </div>
        )}
      </div>
      <div className="trd-controls">
        <button className="trd-cbtn" onPointerDown={hold('left', true)} onPointerUp={hold('left', false)} onPointerLeave={hold('left', false)} aria-label="Sola">◀</button>
        <button className="trd-cbtn trd-cbtn-tun" onPointerDown={(e) => { e.preventDefault(); tryTun(); }} aria-label="Tun haline geç">🛡️ TUN</button>
        <button className="trd-cbtn" onPointerDown={hold('right', true)} onPointerUp={hold('right', false)} onPointerLeave={hold('right', false)} aria-label="Sağa">▶</button>
      </div>
      <p className="trd-game-hint">⌨️ Bilgisayarda: ← → ile hareket, <strong>boşluk</strong> ile TUN · 📱 Telefonda: ekranı sürükle + butonlar</p>
    </div>
  );
}

/* ════════════════════════ ANA BİLEŞEN ════════════════════════ */

export default function TardigradClient() {
  const [openCond, setOpenCond] = useState<string | null>('vacuum');
  const [quizQ, setQuizQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) (e.target as HTMLElement).classList.add('visible'); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  function answerQ(sel: number) {
    if (answered[quizQ] !== undefined) return;
    if (sel === quizQs[quizQ].a) setScore((s) => s + 1);
    setAnswered((prev) => ({ ...prev, [quizQ]: sel }));
    setTimeout(() => { if (quizQ + 1 < quizQs.length) setQuizQ((q) => q + 1); else setDone(true); }, 900);
  }
  function restartQuiz() { setQuizQ(0); setScore(0); setAnswered({}); setDone(false); }

  return (
    <main className="main-content trd-page">

      <div className="trd-topbar">
        <Link href="/" className="trd-back" aria-label="Ana sayfa">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        </Link>
        <span className="trd-topbar-title">Tardigradlar</span>
      </div>

      {/* HERO */}
      <header className="trd-hero">
        <div className="trd-hero-blob" aria-hidden="true" />
        <div className="trd-bubbles" aria-hidden="true">
          {Array.from({ length: 11 }).map((_, i) => (
            <span key={i} className="trd-bubble" style={{ left: `${(i * 8.5 + 4) % 100}%`, width: `${6 + (i % 4) * 4}px`, height: `${6 + (i % 4) * 4}px`, animationDuration: `${5 + (i % 5)}s`, animationDelay: `${(i % 6) * 0.7}s` } as CSSProperties} />
          ))}
        </div>
        <div className="trd-hero-eyebrow">SU AYISI · MOSS PIGLET · YAVAŞ YÜRÜYEN</div>
        <h1 className="trd-hero-title"><span className="trd-grad">TARDİGRADLAR</span></h1>
        <p className="trd-hero-sub">
          Yarım milimetrelik, tombul, sekiz bacaklı ve neşeli görünüşlü bu minik canlı, gezegenin —belki evrenin—
          <strong> en dayanıklı hayvanı</strong>. Kaynar suda, mutlak sıfıra yakın soğukta, uzay boşluğunda ve
          ölümcül radyasyonda hayatta kalır. Sırrı: ölmeden “ölü taklidi” yapmak.
        </p>
        <div className="trd-hero-tags">
          {['Kriptobiyoz', 'Tun hali', 'Uzay', 'Radyasyon', 'Dsup', '−272°C', '+150°C', 'Mini Oyun'].map((t) => (
            <span key={t} className="trd-tag">{t}</span>
          ))}
        </div>
      </header>

      {/* 1. KİM */}
      <section className="trd-section reveal">
        <div className="trd-kicker">01 — Tanışma</div>
        <h2 className="trd-h2">Bu Minik Şampiyon Kim?</h2>
        <p className="trd-p">
          <strong>Tardigradlar</strong> (su ayıları), çıplak gözle göremeyeceğin kadar küçük — genelde
          <strong> 0.5 milimetre</strong> — su canlılarıdır. Dört çift, yani <strong>sekiz bacakları</strong> vardır
          ve her bacak minik pençelerle biter. Yosunda, likende, toprakta, buzda, okyanus dibinde; suyun ince bir
          film oluşturduğu hemen her yerde yaşarlar.
        </p>
        <p className="trd-p">
          Görünüşleri sevimli ve sakindir; sallana sallana yürürler. Ama bu masum görüntünün altında, doğanın
          tasarladığı <strong>en inanılmaz hayatta kalma makinesi</strong> saklı.
        </p>
        <div className="trd-anatomy">
          <svg viewBox="0 0 420 200" className="trd-svg">
            <ellipse cx="210" cy="105" rx="95" ry="48" fill="url(#trdBody)" stroke="#9c7536" strokeWidth="2" />
            <defs><linearGradient id="trdBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cda158" /><stop offset="1" stopColor="#a9803f" /></linearGradient></defs>
            {[-2, -1, 0, 1, 2].map((i) => (<path key={i} d={`M${210 + i * 28} 60 Q${210 + i * 28 + 6} 105 ${210 + i * 28} 150`} stroke="rgba(80,52,18,0.35)" strokeWidth="1.5" fill="none" />))}
            {[0, 1, 2, 3].map((i) => (<g key={i}><ellipse cx={150 + i * 40} cy="158" rx="8" ry="17" fill="#9c7536" /><circle cx={150 + i * 40} cy="174" r="3" fill="#6b4e22" /></g>))}
            <ellipse cx="305" cy="98" rx="22" ry="20" fill="#a9803f" /><circle cx="316" cy="92" r="3.5" fill="#2c1e0e" />
            <path d="M318 100 q10 0 12 5" stroke="#6b4e22" strokeWidth="2" fill="none" />
            <text x="305" y="150" textAnchor="middle" fontSize="10" fill="#8fa89c">ağız + stilet</text>
            <text x="210" y="172" textAnchor="middle" fontSize="10" fill="#8fa89c">8 bacak + pençeler</text>
            <text x="210" y="40" textAnchor="middle" fontSize="11" fill="#4ade80" fontWeight="700">~0.5 mm · gövde bölmeli</text>
          </svg>
        </div>
      </section>

      {/* 2. KRİPTOBİYOZ */}
      <section className="trd-section reveal">
        <div className="trd-kicker">02 — Süper Güç</div>
        <h2 className="trd-h2">Kriptobiyoz: Hayatı Duraklatmak</h2>
        <p className="trd-p">
          Tardigradın asıl sihri hızında ya da kabuğunda değil; <strong>hayatını “duraklatabilmesinde”</strong>.
          Tehlike geldiğinde vücudunu kurutup minik bir topa (<strong>tun</strong>) dönüşür ve metabolizmasını
          neredeyse sıfıra indirir. Bu hale <strong>kriptobiyoz</strong> denir — “gizli hayat”. Adımları izle:
        </p>
        <Stepper steps={crypto} accent="#4ade80">
          {(i) => (
            <svg viewBox="0 0 260 180" className="trd-svg">
              {i < 2 ? (
                <g><ellipse cx="130" cy="95" rx="55" ry="28" fill="#cda158" stroke="#9c7536" strokeWidth="2" />
                  {[0, 1, 2, 3].map((k) => <ellipse key={k} cx={95 + k * 24} cy="124" rx="5" ry="10" fill="#9c7536" />)}
                  <circle cx="178" cy="88" r="2.5" fill="#2c1e0e" />
                  {i === 1 && <text x="130" y="55" textAnchor="middle" fontSize="20">💧↘</text>}</g>
              ) : i < 5 ? (
                <g><circle cx="130" cy="95" r={36 - i * 2} fill="#b88a4a" stroke="#9c7536" strokeWidth="2" />
                  {i >= 3 && <circle cx="130" cy="95" r={42 - i * 2} fill="none" stroke="rgba(74,222,128,0.5)" strokeWidth="2" strokeDasharray="4 4" />}
                  <text x="130" y="100" textAnchor="middle" fontSize="16">{i === 4 ? '💤' : '🟤'}</text></g>
              ) : (
                <g><ellipse cx="130" cy="95" rx="55" ry="28" fill="#cda158" stroke="#9c7536" strokeWidth="2" />
                  {[0, 1, 2, 3].map((k) => <ellipse key={k} cx={95 + k * 24} cy="124" rx="5" ry="10" fill="#9c7536" />)}
                  <text x="130" y="50" textAnchor="middle" fontSize="20">💧✨</text><circle cx="178" cy="88" r="2.5" fill="#2c1e0e" /></g>
              )}
            </svg>
          )}
        </Stepper>
      </section>

      {/* 3. AŞIRI KOŞULLAR */}
      <section className="trd-section reveal">
        <div className="trd-kicker">03 — Dayanıklılık Rekorları</div>
        <h2 className="trd-h2">Neye Dayanırlar? (Akıl Almaz Sınırlar)</h2>
        <p className="trd-p">Tun halindeyken bir tardigradı öldürmek neredeyse imkânsızdır. Bir koşula dokun, ne kadar uç olduğunu gör:</p>
        <div className="trd-conds">
          {conditions.map((c) => (
            <div key={c.id} className={`trd-cond ${openCond === c.id ? 'open' : ''}`} style={{ ['--cc']: c.color } as CSSProperties}>
              <button className="trd-cond-head" onClick={() => setOpenCond(openCond === c.id ? null : c.id)} aria-expanded={openCond === c.id}>
                <span className="trd-cond-ico">{c.icon}</span>
                <span className="trd-cond-t">{c.t}</span>
                <span className="trd-cond-chev">{openCond === c.id ? '−' : '+'}</span>
              </button>
              {openCond === c.id && <div className="trd-cond-body"><p>{c.d}</p></div>}
            </div>
          ))}
        </div>
      </section>

      {/* 4. UZAY */}
      <section className="trd-section reveal">
        <div className="trd-kicker">04 — Uzay Kâşifleri</div>
        <h2 className="trd-h2">Uzay Boşluğunda Yaşayan İlk Hayvan</h2>
        <p className="trd-p">
          2007'de Avrupa Uzay Ajansı, bir grup tardigradı yörüngede roketin dışına, doğrudan <strong>uzay
          boşluğuna</strong> çıkardı. Ne hava vardı, ne basınç, ne de Güneş'in zararlı ışınlarına karşı koruma.
          <strong> 10 gün</strong> sonra Dünya'ya döndüklerinde birçoğu canlandı ve hatta yumurtladı.
        </p>
        <div className="trd-callout">
          <span className="trd-callout-icon">🛰️</span>
          <p><strong>Benzetme:</strong> Bir insanı uzay boşluğuna korumasız bıraksan saniyeler içinde ölür. Tardigrad
          ise valizini toplayıp “sonra görüşürüz” der gibi tun haline geçer, uzayda 10 gün tatil yapıp geri döner.</p>
        </div>
      </section>

      {/* 5. AY */}
      <section className="trd-section reveal">
        <div className="trd-kicker">05 — Ay Macerası</div>
        <h2 className="trd-h2">Ay'a Düşen Su Ayıları</h2>
        <p className="trd-p">
          2019'da İsrail'in <strong>Beresheet</strong> uzay aracı, bir “ay kütüphanesi” zaman kapsülünün içinde
          <strong> binlerce kurutulmuş tardigradla</strong> Ay'a iniş yapmaya çalıştı — ama son anda kontrolü
          kaybedip yüzeye çakıldı. Yıllarca “Ay'da yaşayan tardigradlar var mı?” sorusu konuşuldu.
        </p>
        <p className="trd-p">
          2021'de yapılan çarpışma testleri hayal kırıklığı yarattı: tardigradların dayanma sınırı saniyede ~900
          metre çıktı; Beresheet ise bundan daha hızlı çarpmıştı. Yani kapsüldekiler <strong>büyük olasılıkla
          o çarpmada öldü</strong>. Süper güçleri bile bir roket kazasına yetmedi.
        </p>
      </section>

      {/* 6. SIR */}
      <section className="trd-section reveal">
        <div className="trd-kicker">06 — Moleküler Sırlar</div>
        <h2 className="trd-h2">Süper Gücün Bilimi</h2>
        <p className="trd-p">Tardigradlar bu işi büyüyle değil, akıllı moleküllerle yapar:</p>
        <div className="trd-secrets">
          {[
            ['🍬', 'Trehaloz', 'Suyun yerine geçen özel bir şeker. Hücreleri ve molekülleri cam gibi sarıp dondurarak parçalanmalarını önler.'],
            ['🧬', 'Dsup proteini', '2016\'da keşfedildi. DNA\'nın etrafına sarılıp onu radyasyondan fiziksel bir kalkan gibi korur.'],
            ['🟢', 'IDP\'ler', 'Kuruyunca hücre içinde jel benzeri bir koruyucu cam oluşturan “düzensiz” proteinler.'],
            ['🛡️', 'Pigmentler', 'Radyasyonun ürettiği zararlı serbest radikalleri yakalayıp etkisiz hale getiren doğal antioksidanlar.'],
          ].map(([e, t, d], i) => (
            <div key={i} className="trd-secret"><div className="trd-secret-e">{e}</div><div><strong>{t}</strong><span>{d}</span></div></div>
          ))}
        </div>
      </section>

      {/* 7. MİNİ OYUN */}
      <section className="trd-section reveal">
        <div className="trd-kicker">07 — Sıra Sende</div>
        <h2 className="trd-h2">🎮 Mini Oyun: Hayatta Kal</h2>
        <p className="trd-p">
          Şimdi bir tardigrad ol! Aşırı koşullar üstüne yağacak. Su damlalarını topla, tehlikelerden kaç — ve tam
          çarpacakken <strong>tun haline geç</strong>. Tıpkı gerçek su ayıları gibi, hareketsiz kalıp her şeye dayan!
        </p>
        <TardigradeGame />
      </section>

      {/* 8. GERÇEKLER */}
      <section className="trd-section reveal">
        <div className="trd-kicker">08 — Bilinmeyenler</div>
        <h2 className="trd-h2">Eğlenceli Gerçekler</h2>
        <div className="trd-facts">
          {facts.map((f, i) => (
            <div key={i} className="trd-fact"><div className="trd-fact-ico">{f.icon}</div><h4 className="trd-fact-t">{f.t}</h4><p className="trd-fact-d">{f.d}</p></div>
          ))}
        </div>
      </section>

      {/* 9. QUIZ */}
      <section className="trd-section reveal">
        <div className="trd-kicker">09 — Sınav</div>
        <h2 className="trd-h2">Mini Quiz</h2>
        <div className="trd-quiz">
          {!done ? (
            <>
              <div className="trd-quiz-top"><span>Soru {quizQ + 1} / {quizQs.length}</span><span className="trd-quiz-score">Puan: {score}</span></div>
              <h3 className="trd-quiz-q">{quizQs[quizQ].text}</h3>
              <div className="trd-quiz-opts">
                {quizQs[quizQ].opts.map((o, oi) => {
                  const sel = answered[quizQ]; const isAns = sel !== undefined; const correct = quizQs[quizQ].a;
                  let cls = 'trd-opt'; if (isAns) { if (oi === correct) cls += ' correct'; else if (oi === sel) cls += ' wrong'; else cls += ' dim'; }
                  return (<button key={oi} className={cls} onClick={() => answerQ(oi)} disabled={isAns}><span className="trd-opt-letter">{String.fromCharCode(65 + oi)}</span>{o}</button>);
                })}
              </div>
            </>
          ) : (
            <div className="trd-quiz-result">
              <div className="trd-quiz-emoji">{score >= 5 ? '🏆' : score >= 3 ? '🐻' : '📖'}</div>
              <h3 className="trd-quiz-rtitle">{score} / {quizQs.length} doğru</h3>
              <p className="trd-quiz-rdesc">{score >= 5 ? 'Gerçek bir su ayısı uzmanısın!' : score >= 3 ? 'Güzel! Tun halinde sağlamsın.' : 'Yukarı kaydırıp bir kez daha kuru.'}</p>
              <button className="trd-ctrl-btn trd-ctrl-primary" style={{ background: '#4ade80', borderColor: '#4ade80' }} onClick={restartQuiz}>↺ Tekrar dene</button>
            </div>
          )}
        </div>
      </section>

      <ArticleBibliography items={refs} accent="#4ade80" />

      <footer className="trd-footer">
        <div className="trd-footer-mark">BASEMENTS</div>
        <p>Tardigradlar bize şunu fısıldıyor: bazen hayatta kalmanın yolu daha hızlı koşmak değil, doğru anda durup beklemeyi bilmektir. 🐻💧</p>
        <Link href="/discover" className="trd-footer-link">← Diğer içerikleri keşfet</Link>
      </footer>

      <style>{`
        .trd-page {
          --moss:#4ade80; --water:#22d3ee; --amber:#fbbf24; --rose:#fb7185;
          --bg:#0a1512; --panel:rgba(255,255,255,0.035); --line:rgba(74,222,128,0.16);
          --ink:#e6f0ea; --muted:#8fa89c;
          background: var(--bg); color: var(--ink); min-height: 100vh;
          font-family: system-ui, -apple-system, "Segoe UI", sans-serif; line-height: 1.65; overflow-x: clip;
        }
        .trd-topbar { position: sticky; top: 0; z-index: 40; background: rgba(10,21,18,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); padding: 10px 16px; display: flex; align-items: center; gap: 10px; }
        .trd-back { color: var(--ink); display: flex; padding: 6px; border-radius: 50%; transition: background .15s; }
        .trd-back:hover { background: rgba(74,222,128,0.14); }
        .trd-topbar-title { font-weight: 700; font-size: .94rem; color: var(--moss); }

        .trd-hero { position: relative; text-align: center; padding: 54px 20px 42px; overflow: hidden; background: radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.16), transparent 60%); }
        .trd-hero-blob { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at 30% 20%, rgba(34,211,238,0.10), transparent 40%), radial-gradient(circle at 75% 30%, rgba(74,222,128,0.10), transparent 40%); }
        .trd-bubbles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .trd-bubble { position: absolute; bottom: -24px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6), rgba(34,211,238,0.22)); box-shadow: 0 0 8px rgba(34,211,238,0.35); opacity: 0; animation-name: trd-rise; animation-timing-function: ease-in; animation-iteration-count: infinite; }
        @keyframes trd-rise { 0% { transform: translateY(0) scale(.5); opacity: 0; } 12% { opacity: .85; } 80% { opacity: .55; } 100% { transform: translateY(-340px) scale(1.15); opacity: 0; } }
        .trd-hero-eyebrow { position: relative; font-size: .64rem; font-weight: 800; letter-spacing: .26em; color: var(--water); margin-bottom: 12px; }
        .trd-hero-title { position: relative; font-size: clamp(2.1rem, 8vw, 4.4rem); font-weight: 900; margin: 0 0 16px; letter-spacing: .02em; line-height: 1; animation: trd-titleglow 3.6s ease-in-out infinite; }
        @keyframes trd-titleglow { 0%,100% { filter: drop-shadow(0 0 12px rgba(74,222,128,0.22)); } 50% { filter: drop-shadow(0 0 26px rgba(34,211,238,0.5)); } }
        .trd-grad { background: linear-gradient(100deg, var(--moss), var(--water), var(--amber)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .trd-hero-sub { position: relative; max-width: 600px; margin: 0 auto 22px; color: #c2d3ca; font-size: clamp(.92rem, 2vw, 1.04rem); }
        .trd-hero-sub strong { color: var(--ink); }
        .trd-hero-tags { position: relative; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
        .trd-tag { padding: 6px 13px; font-size: .76rem; font-weight: 600; color: var(--moss); background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.24); border-radius: 9999px; }

        .trd-section { max-width: 820px; margin: 0 auto; padding: 40px 16px; border-top: 1px solid rgba(74,222,128,0.08); }
        .trd-kicker { font-size: .7rem; font-weight: 800; letter-spacing: .2em; color: var(--water); margin-bottom: 8px; text-transform: uppercase; }
        .trd-h2 { font-size: clamp(1.4rem, 4.4vw, 2.05rem); font-weight: 800; margin: 0 0 14px; letter-spacing: -.01em; color: var(--ink); }
        .trd-p { color: #cad9d1; font-size: 1rem; margin: 0 0 18px; }
        .trd-p strong { color: var(--ink); font-weight: 700; }
        .trd-svg { width: 100%; height: auto; display: block; }
        .trd-anatomy, .trd-diagram { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 16px; margin: 16px 0; }

        .reveal { opacity: 0; transform: translateY(28px); transition: opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1); }
        .reveal.visible { opacity: 1; transform: none; }

        .trd-callout { display: flex; gap: 12px; background: linear-gradient(90deg, rgba(34,211,238,0.08), transparent); border: 1px solid rgba(34,211,238,0.2); border-left: 3px solid var(--water); border-radius: 12px; padding: 14px 16px; margin: 18px 0; }
        .trd-callout-icon { font-size: 1.5rem; flex-shrink: 0; }
        .trd-callout p { margin: 0; font-size: .92rem; color: #cad9d1; }
        .trd-callout strong { color: var(--ink); }

        /* conditions accordion */
        .trd-conds { display: flex; flex-direction: column; gap: 8px; margin: 18px 0; }
        .trd-cond { border: 1px solid var(--line); border-radius: 12px; overflow: hidden; background: var(--panel); border-left: 3px solid var(--cc); transition: background .2s; }
        .trd-cond.open { background: color-mix(in srgb, var(--cc) 9%, transparent); }
        .trd-cond-head { width: 100%; display: flex; align-items: center; gap: 12px; padding: 13px 15px; background: none; border: none; color: var(--ink); cursor: pointer; text-align: left; font-size: 1rem; font-weight: 700; }
        .trd-cond-ico { font-size: 1.3rem; }
        .trd-cond-t { flex: 1; }
        .trd-cond-chev { font-size: 1.3rem; color: var(--muted); width: 16px; text-align: center; }
        .trd-cond-body { padding: 0 16px 15px 50px; }
        .trd-cond-body p { margin: 0; font-size: .92rem; color: #cad9d1; }

        /* secrets */
        .trd-secrets { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
        .trd-secret { display: flex; gap: 12px; background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 14px; transition: border-color .2s, transform .2s; }
        .trd-secret:hover { border-color: rgba(74,222,128,0.4); transform: translateY(-3px); }
        .trd-secret-e { font-size: 1.7rem; }
        .trd-secret strong { display: block; font-size: .95rem; color: var(--moss); margin-bottom: 3px; }
        .trd-secret span { font-size: .84rem; color: #cad9d1; }

        /* facts */
        .trd-facts { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px; margin-top: 18px; }
        .trd-fact { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 18px; transition: border-color .2s, transform .2s; }
        .trd-fact:hover { border-color: rgba(74,222,128,0.4); transform: translateY(-3px); }
        .trd-fact-ico { font-size: 2rem; margin-bottom: 8px; }
        .trd-fact-t { margin: 0 0 6px; font-size: 1rem; color: var(--moss); }
        .trd-fact-d { margin: 0; font-size: .88rem; color: #cad9d1; }

        /* Stepper */
        .trd-stepper { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 16px; margin: 16px 0; }
        .trd-stepper-viz { display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.25); border-radius: 10px; padding: 10px; min-height: 180px; }
        .trd-stepper-panel { display: flex; flex-direction: column; }
        .trd-dots { display: flex; gap: 7px; margin-bottom: 12px; }
        .trd-dot { width: 11px; height: 11px; border-radius: 50%; border: 1.5px solid var(--muted); background: transparent; cursor: pointer; padding: 0; transition: all .2s; }
        .trd-dot.on { transform: scale(1.25); }
        .trd-step-meta { font-size: .72rem; font-weight: 800; letter-spacing: .1em; margin-bottom: 6px; }
        .trd-step-title { font-size: 1.08rem; font-weight: 800; margin: 0 0 8px; }
        .trd-step-desc { font-size: .9rem; color: #cad9d1; margin: 0 0 16px; flex: 1; }
        .trd-stepper-ctrl { display: flex; gap: 8px; }
        .trd-ctrl-btn { flex: 1; padding: 9px 14px; border-radius: 9px; border: 1px solid var(--line); background: rgba(255,255,255,0.04); color: var(--ink); font-weight: 700; font-size: .85rem; cursor: pointer; transition: opacity .2s, transform .1s; }
        .trd-ctrl-btn:disabled { opacity: .35; cursor: not-allowed; }
        .trd-ctrl-btn:not(:disabled):active { transform: scale(.96); }
        .trd-ctrl-primary { color: #07140f; }

        /* GAME */
        .trd-game { margin: 16px 0; }
        .trd-game-stage { position: relative; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; background: #0a1512; line-height: 0; }
        .trd-canvas { display: block; width: 100%; touch-action: none; }
        .trd-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 8px; padding: 24px; background: rgba(8,18,15,0.78); backdrop-filter: blur(2px); line-height: 1.5; }
        .trd-ov-emoji { font-size: 2.6rem; }
        .trd-ov-title { margin: 0; font-size: 1.4rem; font-weight: 800; color: var(--moss); }
        .trd-ov-desc { margin: 0; max-width: 420px; font-size: .88rem; color: #cad9d1; }
        .trd-ov-desc strong { color: var(--amber); }
        .trd-ov-btn { margin-top: 8px; padding: 12px 28px; border-radius: 9999px; border: none; background: var(--moss); color: #07140f; font-weight: 800; font-size: 1rem; cursor: pointer; transition: transform .1s, filter .2s; }
        .trd-ov-btn:hover { filter: brightness(1.08); }
        .trd-ov-btn:active { transform: scale(.95); }
        .trd-controls { display: flex; gap: 8px; margin-top: 10px; }
        .trd-cbtn { flex: 1; padding: 14px; border-radius: 12px; border: 1px solid var(--line); background: var(--panel); color: var(--ink); font-size: 1.1rem; font-weight: 800; cursor: pointer; user-select: none; touch-action: manipulation; transition: background .12s, transform .1s; }
        .trd-cbtn:active { background: rgba(74,222,128,0.15); transform: scale(.96); }
        .trd-cbtn-tun { flex: 1.4; color: var(--amber); border-color: rgba(251,191,36,0.4); font-size: .95rem; }
        .trd-game-hint { font-size: .8rem; color: var(--muted); margin: 10px 0 0; text-align: center; }
        .trd-game-hint strong { color: var(--ink); }

        /* quiz */
        .trd-quiz { background: var(--panel); border: 1px solid var(--line); border-radius: 16px; padding: 20px; }
        .trd-quiz-top { display: flex; justify-content: space-between; font-size: .8rem; font-weight: 700; color: var(--muted); margin-bottom: 12px; }
        .trd-quiz-score { color: var(--moss); }
        .trd-quiz-q { font-size: 1.1rem; font-weight: 700; margin: 0 0 16px; }
        .trd-quiz-opts { display: flex; flex-direction: column; gap: 8px; }
        .trd-opt { display: flex; align-items: center; gap: 12px; text-align: left; padding: 13px 15px; border-radius: 11px; border: 1px solid var(--line); background: rgba(255,255,255,0.03); color: var(--ink); font-size: .92rem; cursor: pointer; transition: all .18s; }
        .trd-opt:not(:disabled):hover { border-color: var(--moss); background: rgba(74,222,128,0.07); }
        .trd-opt-letter { width: 24px; height: 24px; border-radius: 6px; display: grid; place-items: center; font-weight: 800; font-size: .78rem; background: rgba(74,222,128,0.12); color: var(--muted); flex-shrink: 0; }
        .trd-opt.correct { border-color: var(--moss); background: rgba(74,222,128,0.14); }
        .trd-opt.correct .trd-opt-letter { background: var(--moss); color: #07140f; }
        .trd-opt.wrong { border-color: var(--rose); background: rgba(251,113,133,0.14); }
        .trd-opt.wrong .trd-opt-letter { background: var(--rose); color: #07140f; }
        .trd-opt.dim { opacity: .5; }
        .trd-opt:disabled { cursor: default; }
        .trd-quiz-result { text-align: center; padding: 12px; }
        .trd-quiz-emoji { font-size: 3rem; margin-bottom: 8px; }
        .trd-quiz-rtitle { font-size: 1.45rem; font-weight: 800; margin: 0 0 6px; color: var(--moss); }
        .trd-quiz-rdesc { color: var(--muted); font-size: .92rem; margin: 0 0 18px; }

        .trd-footer { max-width: 680px; margin: 0 auto; text-align: center; padding: 40px 20px 64px; border-top: 1px solid var(--line); }
        .trd-footer-mark { font-weight: 800; letter-spacing: .3em; color: var(--moss); font-size: .85rem; margin-bottom: 14px; }
        .trd-footer p { color: var(--muted); font-size: .95rem; max-width: 520px; margin: 0 auto 18px; }
        .trd-footer-link { color: var(--moss); text-decoration: none; font-weight: 700; font-size: .9rem; }
        .trd-footer-link:hover { text-decoration: underline; }

        @media (prefers-reduced-motion: reduce) {
          .trd-bubble, .trd-hero-title { animation: none !important; }
          .trd-hero-title { filter: none; }
        }
        @media (max-width: 680px) {
          .trd-section { padding: 32px 14px; }
          .trd-stepper { grid-template-columns: 1fr; }
          .trd-stepper-viz { min-height: 150px; }
          .trd-secrets { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
