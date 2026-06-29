'use client';

// ════════════════════════════════════════════════════════════════════════
// YENİDEN KULLANILABILIR "IMMERSIVE MAKALE" ŞABLONU
// WebGL shader hero (pinlenip parçalanan başlık) + GSAP yatay zaman çizelgesi +
// blur scroll-reveal bölümler + cam (glass) kartlar + genel quiz. Tema rengi
// (accent) ve hero renkleri parametreli → her makale farklı görünür.
//
// Kullanım (bir makale client'ında):
//   <ArticleShell accent="#34d399" title="Doğal Seçilim">
//     <ArticleHero title="Doğal Seçilim" eyebrow="..." subtitle="..." colors={[...]} />
//     <ArticleSection kicker="..." title="...">...</ArticleSection>
//     <CardGrid items={[{icon,title,text}]} />
//     <HorizontalTimeline heading="..." items={[{year,title,text}]} />
//     <ArticleQuiz questions={[{text,opts,a,exp}]} />
//     <ArticleBibliography items={refs} accent="#34d399" />
//     <ArticleFooter tagline="..." />
//   </ArticleShell>
// ════════════════════════════════════════════════════════════════════════

import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import ArticleBibliography, { type BibItem } from '@/app/components/ArticleBibliography';
import type { Rgb } from './ShaderHero';

const ShaderHero = dynamic(() => import('./ShaderHero'), { ssr: false, loading: () => null });

const ThemeCtx = createContext<{ accent: string }>({ accent: '#34d399' });
const useAccent = () => useContext(ThemeCtx).accent;
const prefersReduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export { ArticleBibliography, type BibItem };

/* ─── Scroll-reveal (blur ile) ─── */
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); o.disconnect(); } }, { threshold: 0.1 });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  return <div ref={ref} className={`transition-all duration-[900ms] ease-out ${shown ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-10 opacity-0 blur-[6px]'} ${className}`}>{children}</div>;
}

/* ─── Dış kabuk: tema + ambient zemin + üst çubuk ─── */
export function ArticleShell({ accent = '#34d399', title, backHref = '/', children }: { accent?: string; title: string; backHref?: string; children: ReactNode }) {
  return (
    <ThemeCtx.Provider value={{ accent }}>
      <main className="main-content">
        <div className="relative min-h-screen overflow-clip bg-[#04120c] text-slate-300" style={{ ['--art-accent' as string]: accent } as CSSProperties}>
          <div className="art-ambient" aria-hidden />
          <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-[#04120c]/70 px-5 py-2.5 backdrop-blur">
            <Link href={backHref} aria-label="Geri" className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 transition hover:bg-white/10" style={{ color: accent }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
            </Link>
            <span className="text-xs font-semibold tracking-wide text-slate-400">{title}</span>
          </div>
          {children}
          <style>{`
            .art-ambient { position: fixed; inset: 0; z-index: 0; pointer-events: none; background:
              radial-gradient(55% 45% at 18% 12%, color-mix(in srgb, var(--art-accent) 15%, transparent), transparent 70%),
              radial-gradient(45% 40% at 85% 28%, color-mix(in srgb, var(--art-accent) 10%, transparent), transparent 70%),
              radial-gradient(60% 50% at 60% 90%, color-mix(in srgb, var(--art-accent) 8%, transparent), transparent 70%),
              #04120c; }
            @media (prefers-reduced-motion: reduce) { .art-anim-bounce { animation: none !important; } }
          `}</style>
        </div>
      </main>
    </ThemeCtx.Provider>
  );
}

/* ─── Hero: WebGL + pinlenip parçalanan başlık ─── */
export function ArticleHero({ title, eyebrow, subtitle, colors, gradientText }: {
  title: string; eyebrow?: string; subtitle?: ReactNode; colors?: [Rgb, Rgb, Rgb, Rgb]; gradientText?: string;
}) {
  const accent = useAccent();
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const reduce = prefersReduced();
    gsap.registerPlugin(ScrollTrigger);
    const chars = Array.from(heroRef.current!.querySelectorAll<HTMLElement>('.hero-char'));
    if (!reduce) {
      gsap.from(chars, { yPercent: 120, opacity: 0, filter: 'blur(12px)', stagger: 0.045, duration: 0.9, ease: 'power3.out', delay: 0.15 });
      gsap.from('.hero-eyebrow', { opacity: 0, y: 18, duration: 0.8, delay: 0.1 });
      gsap.from('.hero-sub', { opacity: 0, y: 24, duration: 0.9, delay: 0.55 });
      const n = chars.length;
      const tl = gsap.timeline({ scrollTrigger: { trigger: heroRef.current!, start: 'top top', end: '+=92%', pin: true, scrub: 0.6, anticipatePin: 1 } });
      chars.forEach((c, i) => {
        const dir = i - (n - 1) / 2;
        tl.to(c, { xPercent: dir * 55, yPercent: (i % 2 ? -190 : 190), rotation: dir * 22, opacity: 0, ease: 'power2.in' }, 0);
      });
      tl.to('.hero-shader', { scale: 1.25, opacity: 0.12, ease: 'none' }, 0)
        .to('.hero-sub', { opacity: 0, y: -50, ease: 'power1.in' }, 0)
        .to('.hero-eyebrow', { opacity: 0, ease: 'power1.in' }, 0)
        .to('.hero-cue', { opacity: 0, ease: 'power1.in' }, 0);
    }
  }, { scope: heroRef });

  return (
    <header ref={heroRef} className="relative flex h-[100svh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0" style={{ background: `radial-gradient(120% 120% at 50% 30%, color-mix(in srgb, ${accent} 22%, #04120c), #04120c)` }} aria-hidden />
      <div className="hero-shader absolute inset-0"><ShaderHero colors={colors} /></div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#04120c]" aria-hidden />

      <div className="relative z-10 px-6 text-center">
        {eyebrow && <div className="hero-eyebrow mb-4 text-xs font-semibold tracking-[0.3em]" style={{ color: `color-mix(in srgb, ${accent} 85%, white)` }}>{eyebrow}</div>}
        <h1 className="flex flex-wrap justify-center text-6xl font-black leading-[0.95] tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.5)] sm:text-8xl" aria-label={title}>
          {title.split(' ').map((word, wi) => (
            <span key={wi} className="mr-3 inline-flex whitespace-nowrap sm:mr-5" aria-hidden>
              {word.split('').map((ch, ci) => (
                <span key={ci} className="hero-char inline-block" style={gradientText && word === gradientText ? { color: accent } : undefined}>{ch}</span>
              ))}
            </span>
          ))}
        </h1>
        {subtitle && <p className="hero-sub mx-auto mt-6 max-w-xl text-lg text-white/85 drop-shadow">{subtitle}</p>}
      </div>

      <div className="hero-cue absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-center text-white/70">
        <div className="mx-auto h-9 w-5 rounded-full border-2 border-white/40"><div className="art-anim-bounce mx-auto mt-1.5 h-2 w-1 animate-bounce rounded-full bg-white/70" /></div>
        <div className="mt-2 text-[0.6rem] tracking-[0.2em]">KAYDIR</div>
      </div>
    </header>
  );
}

/* ─── Bölüm (reveal + tutarlı boşluk + isteğe bağlı kicker/başlık) ─── */
export function ArticleSection({ kicker, title, max = 'max-w-3xl', center, children }: {
  kicker?: string; title?: string; max?: string; center?: boolean; children: ReactNode;
}) {
  const accent = useAccent();
  return (
    <div className="relative z-10">
      <Reveal>
        <section className={`mx-auto ${max} px-6 py-16 ${center ? 'text-center' : ''}`}>
          {kicker && <div className="mb-3 text-xs font-semibold tracking-[0.2em]" style={{ color: accent }}>{kicker}</div>}
          {title && <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">{title}</h2>}
          {children}
        </section>
      </Reveal>
    </div>
  );
}

/* ─── Cam kart ızgarası ─── */
export function CardGrid({ items, cols = 2 }: { items: { icon?: string; title: string; text: string }[]; cols?: 2 | 3 }) {
  return (
    <div className={`grid gap-4 ${cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {items.map((c) => (
        <div key={c.title} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-6 backdrop-blur transition hover:-translate-y-1 hover:border-white/25">
          {c.icon && <div className="mb-2 text-3xl">{c.icon}</div>}
          <h3 className="mb-1.5 text-lg font-bold text-white">{c.title}</h3>
          <p className="text-sm leading-relaxed text-slate-300">{c.text}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Yatay kayan, pinlenmiş zaman çizelgesi (GSAP) ─── */
export function HorizontalTimeline({ heading, kicker = 'ZAMAN ÇİZELGESİ', items }: {
  heading: string; kicker?: string; items: { year: string; title: string; text: string }[];
}) {
  const accent = useAccent();
  const tlRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const reduce = prefersReduced();
    const track = trackRef.current!, scroller = scrollerRef.current!;
    if (reduce) { scroller.style.overflowX = 'auto'; return; }
    gsap.registerPlugin(ScrollTrigger);
    const amount = () => Math.max(0, track.scrollWidth - scroller.clientWidth);
    gsap.to(track, {
      x: () => -amount(), ease: 'none',
      scrollTrigger: { trigger: tlRef.current!, start: 'top top', end: () => '+=' + amount(), pin: true, scrub: 0.6, invalidateOnRefresh: true },
    });
  }, { scope: tlRef });

  return (
    <section ref={tlRef} className="relative z-10 h-screen overflow-hidden">
      <div className="flex h-full flex-col justify-center">
        <div className="mx-auto mb-8 w-full max-w-5xl px-6">
          <div className="mb-2 text-xs font-semibold tracking-[0.2em]" style={{ color: accent }}>{kicker}</div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{heading} <span className="ml-2 align-middle text-sm font-normal text-slate-500">← kaydır →</span></h2>
        </div>
        <div ref={scrollerRef} className="overflow-hidden">
          <div ref={trackRef} className="flex w-max gap-5 px-6 will-change-transform">
            {items.map((t, i) => (
              <article key={t.year + i} className="flex w-[80vw] max-w-sm shrink-0 flex-col rounded-3xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur">
                <div className="mb-1 font-mono text-5xl font-black" style={{ color: `color-mix(in srgb, ${accent} 90%, transparent)` }}>{String(i + 1).padStart(2, '0')}</div>
                <div className="mb-3 inline-flex w-fit rounded-full border px-3 py-1 font-mono text-sm font-bold" style={{ color: accent, borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`, background: `color-mix(in srgb, ${accent} 10%, transparent)` }}>{t.year}</div>
                <h3 className="mb-2 text-xl font-bold text-white">{t.title}</h3>
                <p className="text-sm leading-relaxed text-slate-300">{t.text}</p>
              </article>
            ))}
            <div className="w-[10vw] shrink-0" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Genel mini test ─── */
export type QuizQuestion = { text: string; opts: string[]; a: number; exp?: string };
export function ArticleQuiz({ questions }: { questions: QuizQuestion[] }) {
  const accent = useAccent();
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const q = questions[qi];
  const answered = pick !== null;
  function answer(sel: number) { if (answered) return; setPick(sel); if (sel === q.a) setScore(s => s + 1); }
  function next() { if (qi + 1 < questions.length) { setQi(n => n + 1); setPick(null); } else setDone(true); }
  function restart() { setQi(0); setScore(0); setPick(null); setDone(false); }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur sm:p-6">
      {!done ? (
        <>
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500"><span>Soru {qi + 1} / {questions.length}</span><span className="font-mono" style={{ color: accent }}>{score} doğru</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${((qi + (answered ? 1 : 0)) / questions.length) * 100}%`, background: accent }} /></div>
          </div>
          <p className="mb-5 text-lg font-semibold text-slate-100">{q.text}</p>
          <div className="space-y-2.5">
            {q.opts.map((opt, i) => {
              const correct = i === q.a;
              const base = 'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition';
              let cls = 'border-white/10 bg-white/5 hover:bg-white/10', st: CSSProperties | undefined;
              if (answered && correct) { cls = 'text-white'; st = { borderColor: accent, background: `color-mix(in srgb, ${accent} 18%, transparent)` }; }
              else if (answered && i === pick) cls = 'border-rose-400 bg-rose-400/15 text-rose-100';
              else if (answered) cls = 'border-white/10 bg-white/5 opacity-50';
              return (
                <button key={i} onClick={() => answer(i)} disabled={answered} className={`${base} ${cls}`} style={st}>
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-xs font-bold">{String.fromCharCode(65 + i)}</span><span>{opt}</span>
                  {answered && correct && <span className="ml-auto">✓</span>}{answered && i === pick && !correct && <span className="ml-auto">✗</span>}
                </button>
              );
            })}
          </div>
          {answered && (
            <div className="mt-4">
              {q.exp && <div className="rounded-xl border p-4 text-sm leading-relaxed text-slate-200" style={{ borderColor: pick === q.a ? `color-mix(in srgb, ${accent} 30%, transparent)` : 'rgba(251,191,36,0.3)', background: pick === q.a ? `color-mix(in srgb, ${accent} 6%, transparent)` : 'rgba(251,191,36,0.06)' }}><span className="font-bold">{pick === q.a ? 'Doğru! ' : 'Doğru cevap: ' + q.opts[q.a] + '. '}</span>{q.exp}</div>}
              <button onClick={next} className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-bold text-[#04120c]" style={{ background: accent }}>{qi + 1 < questions.length ? 'Sonraki soru →' : 'Sonucu gör 🎉'}</button>
            </div>
          )}
        </>
      ) : (
        <div className="py-6 text-center">
          <div className="mb-2 text-5xl">{score === questions.length ? '🏆' : score >= questions.length / 2 ? '🌿' : '🌱'}</div>
          <p className="mb-1 text-2xl font-bold text-slate-100">{score} / {questions.length}</p>
          <p className="mb-5 text-slate-400">{score === questions.length ? 'Kusursuz!' : score >= questions.length / 2 ? 'Güzel iş!' : 'Bir kez daha dene.'}</p>
          <button onClick={restart} className="rounded-full px-6 py-2.5 text-sm font-bold text-[#04120c]" style={{ background: accent }}>↻ Tekrar dene</button>
        </div>
      )}
    </div>
  );
}

/* ─── Alt bilgi ─── */
export function ArticleFooter({ tagline, backHref = '/discover', backLabel = 'Diğer içerikleri keşfet' }: { tagline: string; backHref?: string; backLabel?: string }) {
  const accent = useAccent();
  return (
    <div className="relative z-10">
      <footer className="mx-auto max-w-3xl border-t border-white/10 px-6 pb-20 pt-10 text-center">
        <div className="mb-3 text-xs font-bold tracking-[0.3em]" style={{ color: accent }}>BASEMENTS</div>
        <p className="mx-auto mb-5 max-w-md text-slate-400">{tagline}</p>
        <Link href={backHref} className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold" style={{ color: accent, borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`, background: `color-mix(in srgb, ${accent} 6%, transparent)` }}>
          {backLabel}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
        </Link>
      </footer>
    </div>
  );
}
