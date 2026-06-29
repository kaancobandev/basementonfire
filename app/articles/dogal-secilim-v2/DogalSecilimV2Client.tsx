'use client';

import { useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  CamouflageSim, SelectionTypes, Quiz, Reveal, ArticleBibliography,
  BORDER, ICONBG, ingredients, misconceptions, examples, otherMechanisms, timeline, refs,
} from './widgets';

// WebGL hero yalnızca istemcide + lazy (bundle'a ve SSR'a dokunmaz).
const ShaderHero = dynamic(() => import('./ShaderHero'), { ssr: false, loading: () => null });

const TITLE = 'Doğal Seçilim';
const prefersReduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function DogalSecilimV2Client() {
  const heroRef = useRef<HTMLElement>(null);
  const tlRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // ── HERO: giriş + scroll'da pinlenip parçalanan başlık ──
  useGSAP(() => {
    const reduce = prefersReduced();
    gsap.registerPlugin(ScrollTrigger);
    const chars = Array.from(heroRef.current!.querySelectorAll<HTMLElement>('.hero-char'));

    // giriş (yükleme)
    if (!reduce) {
      gsap.from(chars, { yPercent: 120, opacity: 0, filter: 'blur(12px)', stagger: 0.045, duration: 0.9, ease: 'power3.out', delay: 0.15 });
      gsap.from('.hero-eyebrow', { opacity: 0, y: 18, duration: 0.8, delay: 0.1 });
      gsap.from('.hero-sub', { opacity: 0, y: 24, duration: 0.9, delay: 0.55 });
    }

    // scroll: hero'yu pinle, başlığı parçala
    if (!reduce) {
      const n = chars.length;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: heroRef.current!, start: 'top top', end: '+=92%', pin: true, scrub: 0.6, anticipatePin: 1 },
      });
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

  // ── ZAMAN ÇİZELGESİ: yatay kayan, pinlenmiş şerit ──
  useGSAP(() => {
    const reduce = prefersReduced();
    const track = trackRef.current!, scroller = scrollerRef.current!;
    if (reduce) { scroller.style.overflowX = 'auto'; return; } // erişilebilir geri dönüş: elle kaydır
    gsap.registerPlugin(ScrollTrigger);
    const amount = () => Math.max(0, track.scrollWidth - scroller.clientWidth);
    // useGSAP, scope içinde oluşan tween + ScrollTrigger'ı unmount'ta otomatik temizler.
    gsap.to(track, {
      x: () => -amount(),
      ease: 'none',
      scrollTrigger: { trigger: tlRef.current!, start: 'top top', end: () => '+=' + amount(), pin: true, scrub: 0.6, invalidateOnRefresh: true },
    });
  }, { scope: tlRef });

  return (
    <main className="main-content">
      <div className="relative min-h-screen overflow-clip bg-[#04120c] text-slate-300">
        <div className="v2-ambient" aria-hidden />

        {/* karşılaştırma çubuğu */}
        <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-[#04120c]/70 px-5 py-2.5 backdrop-blur">
          <Link href="/" aria-label="Ana sayfa" className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-emerald-400 transition hover:bg-emerald-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </Link>
          <span className="text-xs font-semibold tracking-wide text-slate-400">Doğal Seçilim · <span className="text-emerald-400">İMMERSİVE</span></span>
          <Link href="/articles/dogal-secilim" className="ml-auto rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:bg-white/10">↔ Klasik tasarımı gör</Link>
        </div>

        {/* ░░ HERO — WebGL + pinlenip parçalanan başlık ░░ */}
        <header ref={heroRef} className="relative flex h-[100svh] items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_30%,#0a3d2a,#04120c)]" aria-hidden />
          <div className="hero-shader absolute inset-0">
            <ShaderHero />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#04120c]" aria-hidden />

          <div className="relative z-10 px-6 text-center">
            <div className="hero-eyebrow mb-4 text-xs font-semibold tracking-[0.3em] text-emerald-300/90">EVRİMİN MOTORU · İNTERAKTİF DOSYA</div>
            <h1 className="flex flex-wrap justify-center text-6xl font-black leading-[0.95] tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.5)] sm:text-8xl" aria-label={TITLE}>
              {TITLE.split(' ').map((word, wi) => (
                <span key={wi} className="mr-3 inline-flex whitespace-nowrap sm:mr-5" aria-hidden>
                  {word.split('').map((ch, ci) => <span key={ci} className="hero-char inline-block">{ch}</span>)}
                </span>
              ))}
            </h1>
            <p className="hero-sub mx-auto mt-6 max-w-xl text-lg text-white/85 drop-shadow">
              Ne tasarımcı ne amaç var — yalnızca bir <strong className="font-semibold text-emerald-300">filtre.</strong> Aşağı kaydır; başlık dağılsın, seçilim <em className="not-italic text-lime-300">iş başında</em> başlasın.
            </p>
          </div>

          <div className="hero-cue absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-center text-white/70">
            <div className="mx-auto h-9 w-5 rounded-full border-2 border-white/40"><div className="mx-auto mt-1.5 h-2 w-1 animate-bounce rounded-full bg-white/70" /></div>
            <div className="mt-2 text-[0.6rem] tracking-[0.2em]">KAYDIR</div>
          </div>
        </header>

        <div className="relative z-10">
          {/* Açılış cümlesi */}
          <Reveal>
            <section className="mx-auto max-w-3xl px-6 py-20 text-center">
              <p className="text-2xl font-medium leading-relaxed text-slate-200 sm:text-3xl">
                Bir popülasyonda <span className="text-emerald-300">kalıtsal farklar</span> varsa ve bu farklar
                <span className="text-amber-300"> kimin daha çok yavru bıraktığını</span> etkiliyorsa,
                işe yarayan her nesilde biraz daha çoğalır. <span className="text-lime-300">Hepsi bu.</span>
              </p>
            </section>
          </Reveal>

          {/* Dört malzeme */}
          <Reveal>
            <section className="mx-auto max-w-4xl px-6 py-20">
              <h2 className="mb-12 text-center text-3xl font-bold text-white sm:text-4xl">Tarifin dört malzemesi</h2>
              <div className="space-y-5">
                {ingredients.map((c, i) => (
                  <div key={c.title} className={`flex flex-col gap-5 rounded-3xl border p-6 sm:p-8 ${BORDER[c.color]} ${i % 2 ? 'sm:flex-row-reverse' : 'sm:flex-row'} sm:items-center`}>
                    <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-4xl ${ICONBG[c.color]}`}>{c.icon}</div>
                    <div className={i % 2 ? 'sm:text-right' : ''}>
                      <h3 className="mb-1.5 text-2xl font-bold text-white">{c.title}</h3>
                      <p className="leading-relaxed text-slate-300">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          {/* İnteraktif: kamuflaj */}
          <Reveal>
            <section className="mx-auto max-w-3xl px-6 py-16">
              <div className="mb-3 text-xs font-semibold tracking-[0.2em] text-lime-400">İNTERAKTİF · DENE</div>
              <h2 className="mb-2 text-3xl font-bold text-white">Bir popülasyonu kendin evrimleştir</h2>
              <p className="mb-6 text-slate-400">Zemini seç, otomatiğe bas, dağılımın ortam çizgisine toplanışını izle.</p>
              <CamouflageSim />
            </section>
          </Reveal>

          {/* İnteraktif: seçilim türleri */}
          <Reveal>
            <section className="mx-auto max-w-3xl px-6 py-16">
              <div className="mb-3 text-xs font-semibold tracking-[0.2em] text-fuchsia-400">İNTERAKTİF · KARŞILAŞTIR</div>
              <h2 className="mb-2 text-3xl font-bold text-white">Seçilim her zaman aynı yöne itmez</h2>
              <p className="mb-6 text-slate-400">Türü seç, baskı kaydırıcısını oynat.</p>
              <SelectionTypes />
            </section>
          </Reveal>

          {/* Yanlışlar */}
          <Reveal>
            <section className="mx-auto max-w-3xl px-6 py-16">
              <h2 className="mb-8 text-3xl font-bold text-white">Çok duyulan beş yanlış</h2>
              <div className="space-y-3">
                {misconceptions.map((m, i) => (
                  <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
                    <div className="mb-2 flex items-start gap-2.5"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose-500/15 text-sm text-rose-400">✗</span><p className="font-semibold text-rose-200/90">{m.wrong}</p></div>
                    <div className="flex items-start gap-2.5"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-sm text-emerald-400">✓</span><p className="text-sm leading-relaxed text-slate-300">{m.right}</p></div>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          {/* Örnekler */}
          <Reveal>
            <section className="mx-auto max-w-4xl px-6 py-16">
              <h2 className="mb-8 text-3xl font-bold text-white">Laboratuvar değil, gerçek hayat</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {examples.map(e => (
                  <div key={e.title} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-6 transition hover:-translate-y-1 hover:border-emerald-400/30">
                    <div className="mb-2 text-3xl">{e.icon}</div>
                    <h3 className="mb-1.5 text-lg font-bold text-white">{e.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-300">{e.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          {/* Diğer mekanizmalar */}
          <Reveal>
            <section className="mx-auto max-w-3xl px-6 py-16">
              <h2 className="mb-2 text-3xl font-bold text-white">Tek motor değil</h2>
              <p className="mb-8 text-slate-400">Doğal seçilim, uyumu açıklayan ana mekanizmadır — ama tek değildir.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {otherMechanisms.map(o => (
                  <div key={o.title} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur"><span className="text-2xl">{o.icon}</span><div><h3 className="font-bold text-white">{o.title}</h3><p className="text-sm leading-relaxed text-slate-400">{o.text}</p></div></div>
                ))}
              </div>
            </section>
          </Reveal>
        </div>

        {/* ░░ ZAMAN ÇİZELGESİ — yatay kayan, pinlenmiş ░░ */}
        <section ref={tlRef} className="relative z-10 h-screen overflow-hidden">
          <div className="flex h-full flex-col justify-center">
            <div className="mx-auto mb-8 w-full max-w-5xl px-6">
              <div className="mb-2 text-xs font-semibold tracking-[0.2em] text-emerald-400">ZAMAN ÇİZELGESİ</div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Bir fikrin yolculuğu <span className="ml-2 align-middle text-sm font-normal text-slate-500">← kaydır →</span></h2>
            </div>
            <div ref={scrollerRef} className="overflow-hidden">
              <div ref={trackRef} className="flex w-max gap-5 px-6 will-change-transform">
                {timeline.map((t, i) => (
                  <article key={t.year} className="flex w-[80vw] max-w-sm shrink-0 flex-col rounded-3xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur">
                    <div className="mb-1 font-mono text-5xl font-black text-emerald-400/90">{String(i + 1).padStart(2, '0')}</div>
                    <div className="mb-3 inline-flex w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-mono text-sm font-bold text-emerald-300">{t.year}</div>
                    <h3 className="mb-2 text-xl font-bold text-white">{t.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-300">{t.text}</p>
                  </article>
                ))}
                <div className="w-[10vw] shrink-0" aria-hidden />
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-10">
          {/* Quiz */}
          <Reveal>
            <section className="mx-auto max-w-3xl px-6 py-16">
              <div className="mb-3 text-xs font-semibold tracking-[0.2em] text-amber-400">MİNİ TEST</div>
              <h2 className="mb-6 text-3xl font-bold text-white">Anladın mı? Hadi bakalım</h2>
              <Quiz />
            </section>
          </Reveal>

          <ArticleBibliography items={refs} accent="#34d399" />

          <footer className="mx-auto max-w-3xl border-t border-white/10 px-6 pb-20 pt-10 text-center">
            <div className="mb-3 text-xs font-bold tracking-[0.3em] text-emerald-400">BASEMENTS</div>
            <p className="mx-auto mb-5 max-w-md text-slate-400">Çeşitlilik + kalıtım + zaman. Dünyadaki tüm canlı çeşitliliğinin tarifi. 🌍</p>
            <Link href="/articles/dogal-secilim" className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/10">↔ Klasik tasarımla karşılaştır</Link>
          </footer>
        </div>
      </div>

      <style>{`
        .v2-ambient {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(55% 45% at 18% 12%, rgba(16,185,129,0.12), transparent 70%),
            radial-gradient(45% 40% at 85% 28%, rgba(245,158,11,0.09), transparent 70%),
            radial-gradient(60% 50% at 60% 90%, rgba(132,204,22,0.08), transparent 70%),
            #04120c;
        }
        @media (prefers-reduced-motion: reduce) { .animate-bounce { animation: none !important; } }
      `}</style>
    </main>
  );
}
