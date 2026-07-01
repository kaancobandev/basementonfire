'use client';

import Link from 'next/link';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection, CardGrid, HorizontalTimeline, ArticleQuiz, ArticleBibliography, ArticleFooter,
} from '@/app/components/article/ArticleBlocks';
import {
  CamouflageSim, SelectionTypes, BORDER, ICONBG,
  ingredients, misconceptions, examples, otherMechanisms, timeline, quizQs, refs,
} from './widgets';

const ACCENT = '#34d399';

export default function DogalSecilimClient() {
  return (
    <ArticleShell accent={ACCENT} title="Doğal Seçilim">
      <ArticleHero
        title="Doğal Seçilim"
        fullTitle="Doğal Seçilim — Evrimin Motoru"
        eyebrow="EVRİMİN MOTORU · İNTERAKTİF DOSYA"
        subtitle={<>Ne tasarımcı ne amaç var — yalnızca bir <strong className="font-semibold text-emerald-300">filtre.</strong> Aşağı kaydır; başlık dağılsın, seçilim <em className="not-italic text-lime-300">iş başında</em> başlasın.</>}
      />

      <ArticleLede points={[
        'Çeşitlilik + kalıtım + farklı üreme başarısı + zaman',
        'Antibiyotik direnci, biber güvesi, Darwin ispinozları — gözlemlenen gerçek örnekler',
        'Mutasyon rastgeledir; ama seçilim rastgele değildir — yönü ortam belirler',
      ]}>
        Doğal seçilim, Charles Darwin ve Alfred Russel Wallace'ın 1858'de ortaya koyduğu, evrimin uyumu açıklayan ana mekanizmasıdır: kalıtsal çeşitliliğe sahip bir popülasyonda ortama daha uyumlu bireyler daha çok yavru bırakır ve bu özellikler nesiller boyunca yaygınlaşır.
      </ArticleLede>

      {/* Açılış cümlesi */}
      <ArticleSection center>
        <p className="text-2xl font-medium leading-relaxed text-slate-200 sm:text-3xl">
          Bir popülasyonda <span className="text-emerald-300">kalıtsal farklar</span> varsa ve bu farklar
          <span className="text-amber-300"> kimin daha çok yavru bıraktığını</span> etkiliyorsa,
          işe yarayan her nesilde biraz daha çoğalır. <span className="text-lime-300">Hepsi bu.</span>
        </p>
      </ArticleSection>

      {/* Dört malzeme — özel alternating düzen */}
      <ArticleSection title="Tarifin dört malzemesi" max="max-w-4xl">
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
      </ArticleSection>

      {/* İnteraktif: kamuflaj */}
      <ArticleSection kicker="İNTERAKTİF · DENE" title="Bir popülasyonu kendin evrimleştir">
        <p className="mb-6 text-slate-400">Zemini seç, otomatiğe bas, dağılımın ortam çizgisine toplanışını izle.</p>
        <CamouflageSim />
      </ArticleSection>

      {/* İnteraktif: seçilim türleri */}
      <ArticleSection kicker="İNTERAKTİF · KARŞILAŞTIR" title="Seçilim her zaman aynı yöne itmez">
        <p className="mb-6 text-slate-400">Türü seç, baskı kaydırıcısını oynat.</p>
        <SelectionTypes />
      </ArticleSection>

      {/* Yanlışlar */}
      <ArticleSection title="Çok duyulan beş yanlış">
        <div className="space-y-3">
          {misconceptions.map((m, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
              <div className="mb-2 flex items-start gap-2.5"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose-500/15 text-sm text-rose-400">✗</span><p className="font-semibold text-rose-200/90">{m.wrong}</p></div>
              <div className="flex items-start gap-2.5"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-sm text-emerald-400">✓</span><p className="text-sm leading-relaxed text-slate-300">{m.right}</p></div>
            </div>
          ))}
        </div>
      </ArticleSection>

      {/* Gerçek örnekler */}
      <ArticleSection title="Laboratuvar değil, gerçek hayat" max="max-w-4xl">
        <CardGrid items={examples} cols={2} />
        <p className="mt-6 leading-relaxed text-slate-400">
          Aynı sürecin uç koşullara dayanıklılığı ne kadar ileri götürebildiğinin en çarpıcı örneği ise, kaynar sudan mutlak sıfıra ve uzay boşluğuna kadar akıl almaz ortamlara katlanabilen <Link href="/articles/tardigrad" className="article-ilink">su ayıları</Link>dır.
        </p>
      </ArticleSection>

      {/* Diğer mekanizmalar */}
      <ArticleSection title="Tek motor değil">
        <p className="mb-6 text-slate-400">Doğal seçilim, uyumu açıklayan ana mekanizmadır — ama tek değildir.</p>
        <CardGrid items={otherMechanisms} cols={2} />
        <p className="mt-6 leading-relaxed text-slate-400">
          Bazen evrimin en büyük sıçramaları yeni bir mutasyondan değil, iki ayrı canlının tek bir hücrede birleşmesinden doğar; karmaşık hücrenin kökenindeki bu ortaklık hikayesi <Link href="/articles/endosimbiyoz" className="article-ilink">endosimbiyoz</Link> olarak bilinir.
        </p>
      </ArticleSection>

      {/* Yatay zaman çizelgesi */}
      <HorizontalTimeline heading="Bir fikrin yolculuğu" items={timeline} />

      {/* Mini test */}
      <ArticleSection kicker="MİNİ TEST" title="Anladın mı? Hadi bakalım">
        <ArticleQuiz questions={quizQs} />
      </ArticleSection>

      <div className="relative z-10">
        <ArticleBibliography items={refs} accent={ACCENT} />
      </div>

      <ArticleFooter tagline="Çeşitlilik + kalıtım + zaman. Dünyadaki tüm canlı çeşitliliğinin tarifi. 🌍" />
    </ArticleShell>
  );
}
