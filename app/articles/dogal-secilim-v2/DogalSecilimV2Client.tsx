'use client';

import { useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  CamouflageSim, SelectionTypes, Quiz, Reveal, ArticleBibliography,
  BORDER, ICONBG, ingredients, misconceptions, examples, otherMechanisms, timeline, refs,
} from './widgets';

// WebGL hero yalnızca istemcide + lazy (bundle'a ve SSR'a dokunmaz).
const ShaderHero = dynamic(() => import('./ShaderHero'), {
  ssr: false,
  loading: () => null,
});

export default function DogalSecilimV2Client() {
  // Hero parallax
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOp = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const bgOp = useTransform(scrollYProgress, [0, 1], [1, 0.25]);

  const titleWords = ['Doğal', 'Seçilim'];
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } } };
  const item = { hidden: { opacity: 0, y: 36, filter: 'blur(10px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

  return (
    <main className="main-content">
      <div className="relative min-h-screen overflow-clip bg-[#04120c] text-slate-300">
        {/* canlı CSS ambient zemin */}
        <div className="v2-ambient" aria-hidden />

        {/* karşılaştırma çubuğu */}
        <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-[#04120c]/70 px-5 py-2.5 backdrop-blur">
          <Link href="/" aria-label="Ana sayfa" className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-emerald-400 transition hover:bg-emerald-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </Link>
          <span className="text-xs font-semibold tracking-wide text-slate-400">Doğal Seçilim · <span className="text-emerald-400">İMMERSİVE</span></span>
          <Link href="/articles/dogal-secilim" className="ml-auto rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:bg-white/10">↔ Klasik tasarımı gör</Link>
        </div>

        {/* ░░ HERO — WebGL ░░ */}
        <header ref={heroRef} className="relative flex h-[100svh] items-center justify-center overflow-hidden">
          {/* fallback gradyan (WebGL yüklenene/başarısız olursa) */}
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_30%,#0a3d2a,#04120c)]" aria-hidden />
          <motion.div style={{ scale: bgScale, opacity: bgOp }} className="absolute inset-0">
            <ShaderHero />
          </motion.div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#04120c]" aria-hidden />

          <motion.div style={{ y: heroY, opacity: heroOp }} className="relative z-10 px-6 text-center">
            <motion.div variants={container} initial="hidden" animate="show">
              <motion.div variants={item} className="mb-4 text-xs font-semibold tracking-[0.3em] text-emerald-300/90">EVRİMİN MOTORU · İNTERAKTİF DOSYA</motion.div>
              <h1 className="text-6xl font-black leading-[0.95] tracking-tight text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.5)] sm:text-8xl">
                {titleWords.map((w, i) => (
                  <motion.span key={i} variants={item} className="mr-3 inline-block">{w}</motion.span>
                ))}
              </h1>
              <motion.p variants={item} className="mx-auto mt-6 max-w-xl text-lg text-white/85 drop-shadow">
                Ne tasarımcı ne amaç var — yalnızca bir <strong className="font-semibold text-emerald-300">filtre.</strong> Aşağı kaydır; seçilimi <em className="not-italic text-lime-300">iş başında</em> izle.
              </motion.p>
            </motion.div>
          </motion.div>

          <motion.div style={{ opacity: heroOp }} className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-center text-white/70">
            <div className="mx-auto h-9 w-5 rounded-full border-2 border-white/40"><div className="mx-auto mt-1.5 h-2 w-1 animate-bounce rounded-full bg-white/70" /></div>
            <div className="mt-2 text-[0.6rem] tracking-[0.2em]">KAYDIR</div>
          </motion.div>
        </header>

        {/* içerik */}
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

          {/* Dört malzeme — alternar düzen */}
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

          {/* Zaman çizelgesi */}
          <Reveal>
            <section className="mx-auto max-w-3xl px-6 py-16">
              <h2 className="mb-10 text-3xl font-bold text-white">Bir fikrin yolculuğu</h2>
              <div className="relative space-y-7 pl-8">
                <div className="absolute bottom-1 left-[7px] top-1 w-0.5 bg-gradient-to-b from-emerald-400 via-lime-400 to-amber-400 opacity-50" />
                {timeline.map(t => (
                  <div key={t.year} className="relative">
                    <span className="absolute -left-8 top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-emerald-400 bg-[#04120c] shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
                    <div className="font-mono text-sm font-bold text-emerald-400">{t.year}</div>
                    <h3 className="mb-0.5 mt-0.5 font-semibold text-white">{t.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-400">{t.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

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
