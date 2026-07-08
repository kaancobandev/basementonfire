'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import ArticleBibliography from '@/app/components/ArticleBibliography';
import {
  BouncingHero, MassWeightScale, ForceLab, MotionSim, MomentumCollision, EnergyRamp,
  glossary, units, quizQs, refs, C,
} from './widgets';

/* ---- açık tema yapı taşları ---- */
function Section({ color = C.blue, kicker, title, children }: { color?: string; kicker?: string; title: string; children: ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-12">
      {kicker && <div className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color }}>{kicker}</div>}
      <h2 className="mb-5 text-2xl font-black text-slate-900 sm:text-3xl">{title}</h2>
      <div className="space-y-4 text-[1.02rem] leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}
function Tip({ color = C.blue, children }: { color?: string; children: ReactNode }) {
  return <div className="rounded-xl border-l-4 p-4" style={{ borderColor: color, background: color + '10' }}><p className="m-0 text-sm leading-relaxed text-slate-700">{children}</p></div>;
}

/* ---- açık tema quiz ---- */
function Quiz({ questions }: { questions: { text: string; opts: string[]; a: number; exp: string }[] }) {
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = questions[qi];
  const choose = (i: number) => { if (pick !== null) return; setPick(i); if (i === q.a) setScore((s) => s + 1); };
  const next = () => { if (qi + 1 >= questions.length) { setDone(true); return; } setQi(qi + 1); setPick(null); };
  const restart = () => { setQi(0); setPick(null); setScore(0); setDone(false); };
  if (done) return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <div className="text-4xl">{score >= questions.length - 1 ? '🎉' : score >= questions.length / 2 ? '👏' : '💪'}</div>
      <p className="mt-2 text-lg font-black text-slate-900">{score} / {questions.length} doğru</p>
      <button onClick={restart} className="mt-4 rounded-full px-5 py-2 text-sm font-bold text-white" style={{ background: C.blue }}>↺ Tekrar dene</button>
    </div>
  );
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-1 text-xs font-semibold text-slate-400">Soru {qi + 1} / {questions.length}</div>
      <p className="mb-4 font-bold text-slate-900">{q.text}</p>
      <div className="space-y-2">
        {q.opts.map((o, i) => {
          const correct = pick !== null && i === q.a; const wrong = pick === i && i !== q.a;
          return (
            <button key={i} onClick={() => choose(i)} disabled={pick !== null} className="block w-full rounded-xl border-2 px-4 py-3 text-left text-sm transition"
              style={{ borderColor: correct ? C.green : wrong ? C.red : '#e2e8f0', background: correct ? '#f0fdf4' : wrong ? '#fef2f2' : '#fff', color: '#0f172a' }}>
              {o} {correct && '✓'} {wrong && '✗'}
            </button>
          );
        })}
      </div>
      {pick !== null && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{q.exp}</div>}
      {pick !== null && <div className="mt-4 text-right"><button onClick={next} className="rounded-full px-5 py-2 text-sm font-bold text-white" style={{ background: C.blue }}>{qi + 1 >= questions.length ? 'Bitir' : 'Sonraki →'}</button></div>}
    </div>
  );
}

/* ---- interaktif sözlük (aramalı) ---- */
function Glossary() {
  const [q, setQ] = useState('');
  const list = glossary.filter((t) => (t.term + ' ' + t.def).toLocaleLowerCase('tr').includes(q.toLocaleLowerCase('tr')));
  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Terim ara… (örn. kuvvet, momentum)" className="mb-4 w-full rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-400" aria-label="Terim ara" />
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((t) => (
          <details key={t.term} className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm" style={{ borderLeft: '4px solid ' + C[t.cat] }}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
              <span className="font-bold text-slate-900">{t.term}</span>
              <span className="flex items-center gap-2"><span className="rounded-md px-2 py-0.5 font-mono text-[0.65rem] font-bold" style={{ background: C[t.cat] + '18', color: C[t.cat] }}>{t.unit}</span><span className="text-slate-400 transition group-open:rotate-45">+</span></span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{t.def}</p>
            <p className="mt-1 text-xs text-slate-500">🔸 {t.ex}</p>
          </details>
        ))}
        {list.length === 0 && <p className="text-sm text-slate-400">Eşleşen terim yok.</p>}
      </div>
    </div>
  );
}

export default function FizikClient() {
  return (
    <main className="main-content">
      <div className="min-h-screen" style={{ background: '#f4f7fb', color: '#0f172a' }}>
        {/* üst çubuk */}
        <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-5 py-2.5 backdrop-blur">
          <Link href="/" aria-label="Geri" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white transition hover:bg-slate-50" style={{ color: C.blue }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </Link>
          <span className="text-xs font-semibold tracking-wide text-slate-500">Sıfırdan Fizik</span>
        </div>

        {/* hero */}
        <header className="relative flex min-h-[62vh] items-center justify-center overflow-hidden px-6 py-16 text-center">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,#dbeafe 0%,#f4f7fb 55%,#fef3c7 100%)' }} aria-hidden />
          <BouncingHero />
          <div className="relative z-10">
            <div className="mb-4 inline-block rounded-full bg-white/70 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-blue-700 backdrop-blur">FİZİK · SIFIRDAN BAŞLAYANLAR İÇİN</div>
            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-7xl">Sıfırdan Fizik</h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-700">Kütle, kuvvet, Newton, momentum, enerji… Fizik dersi hiç bilmediğini varsayıyoruz. Her kavramı gündelik örnekler ve <strong className="text-blue-700">bolca interaktif deneyle</strong> öğreteceğiz.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-semibold">
              {['kütle', 'kuvvet', 'Newton', 'ivme', 'hız', 'momentum', 'enerji', 'sürtünme'].map((t) => <span key={t} className="rounded-full bg-white/70 px-3 py-1 text-slate-700 backdrop-blur">{t}</span>)}
            </div>
          </div>
        </header>

        {/* lede */}
        <section className="mx-auto max-w-3xl px-5 pt-10">
          <div className="rounded-2xl border-2 border-blue-100 bg-blue-50/60 p-5 sm:p-6">
            <p className="text-lg font-semibold leading-relaxed text-slate-800">Fizik, evrenin “nasıl hareket ettiğini” anlatan kuralların dilidir. Korkutucu görünen terimlerin çoğu aslında gündelik sezgilerinin bir adım ötesidir: <strong className="text-blue-700">kütle</strong> içindeki madde, <strong className="text-orange-600">kuvvet</strong> bir itme-çekme, <strong className="text-violet-600">momentum</strong> hareketin “durdurulma zorluğu”. Aşağıda hepsini kaydırıp deneyerek göreceksin.</p>
          </div>
        </section>

        {/* 1. Kütle & Ağırlık */}
        <Section color={C.green} kicker="1 · Temel" title="Kütle ve Ağırlık: aynı değiller!">
          <p><strong style={{ color: C.green }}>Kütle</strong>, bir cismin içinde ne kadar “madde” olduğudur — birimi kilogram (kg) ve nerede olursan ol değişmez. <strong style={{ color: C.orange }}>Ağırlık</strong> ise yerçekiminin o kütleyi çekme kuvvetidir; birimi newton (N) ve gezegene göre değişir. Ay'da kütlen aynı, ama daha az çekildiğin için ağırlığın azalır.</p>
          <p>Kendin dene — kütleyi kaydır, gezegen değiştir:</p>
          <MassWeightScale />
          <Tip color={C.green}>Uzayda “ağırlıksız” olursun (g = 0) ama kütlen aynıdır — bu yüzden uzayda bile bir cismi itmek zorludur.</Tip>
        </Section>

        {/* 2. Kuvvet & F=ma */}
        <Section color={C.orange} kicker="2 · İnteraktif" title="Kuvvet ve F = m · a">
          <p><strong style={{ color: C.orange }}>Kuvvet</strong>, bir cismi itmek, çekmek, hızlandırmak, yavaşlatmak ya da yönünü değiştirmektir. Fiziğin en ünlü denklemi bunların hepsini birbirine bağlar: <strong className="font-mono" style={{ color: C.blue }}>F = m · a</strong> (Kuvvet = kütle × ivme). Aynı kuvveti ağır bir kutuya uygularsan daha yavaş hızlanır.</p>
          <ForceLab />
          <Tip color={C.blue}><strong>1 Newton</strong>, 1 kilogramlık kütleyi saniyede 1 m/s hızlandıran (yani 1 m/s² ivme veren) kuvvettir. Bir orta boy elmanın ağırlığı kabaca 1 N'dur.</Tip>
        </Section>

        {/* Newton 3 yasa */}
        <Section color={C.blue} kicker="3 · Kurallar" title="Newton'ın 3 Hareket Yasası">
          <p>Modern mekaniğin temeli, üç basit yasadır. Bunların matematiksel derinliği ve kâşifinin hikâyesi için <Link href="/articles/newton" className="article-ilink" style={{ color: C.blue }}>Isaac Newton</Link> yazısına da göz atabilirsin.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['1 · Atalet', C.blue, "Bir cisme kuvvet etki etmiyorsa, duruyorsa durur, gidiyorsa aynı hızla gitmeye devam eder. (Ani frende öne savrulmanın sebebi.)"],
              ['2 · F = m·a', C.orange, "Bir cisme uygulanan kuvvet, ona kütlesiyle ters orantılı bir ivme verir. Yukarıdaki deney tam bunu gösterir."],
              ['3 · Etki-Tepki', C.green, "Her kuvvete eşit büyüklükte, zıt yönde bir tepki vardır. Roket gazı geriye iter, roket ileri gider."],
            ].map(([t, col, d]) => (
              <div key={t as string} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" style={{ borderTop: '3px solid ' + (col as string) }}>
                <h3 className="mb-1 font-black" style={{ color: col as string }}>{t}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 4. Hareket */}
        <Section color={C.cyan} kicker="4 · İnteraktif" title="Hareket: hız, sürat ve ivme">
          <p><strong style={{ color: C.cyan }}>Sürat</strong> ne kadar hızlı gittiğindir (yalnızca büyüklük). <strong style={{ color: C.cyan }}>Hız</strong> ise sürat + yön demektir (bir vektör). <strong style={{ color: C.violet }}>İvme</strong>, hızının ne kadar hızlı değiştiğidir — gaza basmak da frene basmak da birer ivmedir. Arabayı sür, farkı gör:</p>
          <MotionSim />
          <Tip color={C.cyan}>“80 km/s” bir <em>sürattir</em>. “Kuzeye 80 km/s” bir <em>hızdır</em>. Yön değişirse sürat sabit kalsa bile hız değişmiş olur — yani ivme vardır (viraj almak gibi).</Tip>
        </Section>

        {/* 5. Momentum */}
        <Section color={C.violet} kicker="5 · İnteraktif" title="Momentum: hareketin ağırlığı">
          <p><strong style={{ color: C.violet }}>Momentum = kütle × hız.</strong> Bir cismin hareketini durdurmanın ne kadar zor olduğudur. Yavaş giden bir kamyon bile büyük momentumludur — çünkü çok ağırdır. Fiziğin en güçlü kurallarından biri: <strong>çarpışmalarda toplam momentum korunur.</strong> İki arabayı çarpıştır:</p>
          <MomentumCollision />
          <Tip color={C.violet}>Bu yüzden buz pateninde birini itersen sen de geri kayarsın: senin kazandığın momentum, karşındakinin kazandığına eşit ve zıttır (etki-tepki + momentum korunumu).</Tip>
        </Section>

        {/* 6. Enerji */}
        <Section color={C.amber} kicker="6 · İnteraktif" title="Enerji, İş ve Güç">
          <p><strong style={{ color: C.amber }}>Enerji</strong>, iş yapabilme kapasitesidir (birimi joule, J). İki temel biçimi: <strong style={{ color: C.green }}>potansiyel enerji</strong> (konumda gizli — örneğin yüksekteki su) ve <strong style={{ color: C.orange }}>kinetik enerji</strong> (harekette — hızlı bir top). <strong>İş</strong>, bir kuvvetin cismi hareket ettirmesidir (kuvvet × yol). <strong>Güç</strong> ise birim zamanda yapılan iştir (watt, W). Topu bırak, enerjinin biçim değiştirişini izle:</p>
          <EnergyRamp />
          <Tip color={C.amber}>Enerjinin korunumu: enerji yoktan var olmaz, yok da olmaz — yalnızca biçim değiştirir. Potansiyel → kinetik → sürtünmeyle ısı…</Tip>
        </Section>

        {/* 7. Sürtünme */}
        <Section color={C.red} kicker="7 · Görünmez fren" title="Sürtünme ve Yerçekimi">
          <p><strong style={{ color: C.red }}>Sürtünme</strong>, yüzeyler arasında harekete karşı koyan kuvvettir; hareketi yavaşlatır ve ısı üretir (ellerini ovuşturunca ısınması). Buzda kolayca kayarsın çünkü sürtünme azdır. <strong style={{ color: C.blue }}>Yerçekimi</strong> ise kütleli her şeyin birbirini çekmesidir; Dünya yüzeyinde bir cismi saniyede 9,8 m/s hızlandırır (g ≈ 9,8 m/s²). Bu ikisi olmasa ne yürüyebilir ne de yerde durabilirdik.</p>
        </Section>

        {/* Sözlük */}
        <Section color={C.violet} kicker="Hepsi bir arada" title="Fizik Sözlüğü">
          <p>Öğrendiğin her terim, tek tıkla açılan tanımıyla burada. Ara, tıkla, hatırla:</p>
          <Glossary />
        </Section>

        {/* Birimler */}
        <Section color={C.blue} kicker="Referans" title="Birimler tablosu">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead><tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500"><th className="px-4 py-2.5 font-semibold">Büyüklük</th><th className="px-4 py-2.5 font-semibold">Birim</th><th className="px-4 py-2.5 font-semibold">Ne ölçer</th></tr></thead>
              <tbody className="text-slate-700">
                {units.map((r) => (<tr key={r[0]} className="border-b border-slate-100"><td className="px-4 py-2.5 font-bold text-slate-900">{r[0]}</td><td className="px-4 py-2.5 font-mono">{r[1]}</td><td className="px-4 py-2.5">{r[2]}</td></tr>))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Quiz */}
        <Section color={C.green} kicker="Mini test" title="Ne kadar anladın?">
          <Quiz questions={quizQs} />
        </Section>

        {/* Kapanış */}
        <Section color={C.blue} title="Özetle">
          <p>Fiziğin temeli aslında birkaç fikirdir: <strong style={{ color: C.green }}>kütle</strong> maddedir, <strong style={{ color: C.orange }}>kuvvet</strong> onu değiştirir (F = m·a), <strong style={{ color: C.cyan }}>hız/ivme</strong> hareketi tarif eder, <strong style={{ color: C.violet }}>momentum</strong> ve <strong style={{ color: C.amber }}>enerji</strong> korunur. Bu birkaç kuralla; topların zıplamasını, arabaların çarpışmasını, roketlerin uçmasını aynı dille açıklayabilirsin. Fizik korkutucu değil — sadece evrenin kullanma kılavuzudur.</p>
        </Section>

        <div style={{ color: '#334155' }}>
          <ArticleBibliography items={refs} accent={C.blue} />
        </div>

        <footer className="px-5 pb-16 pt-6 text-center">
          <p className="text-sm text-slate-500">Kütle → kuvvet → hareket → enerji. Evrenin kullanma kılavuzu. 🚀</p>
          <Link href="/discover" className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Diğer içerikleri keşfet</Link>
        </footer>
      </div>
    </main>
  );
}
