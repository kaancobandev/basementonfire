'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection, CardGrid, HorizontalTimeline, ArticleQuiz, ArticleBibliography, ArticleFooter,
} from '@/app/components/article/ArticleBlocks';
import {
  ForceCalc, GravityCalc, LawStatus,
  miracleYears, contemporaries, inventions, funFacts, timeline, quizQs, refs,
} from './widgets';

const ACCENT = '#f59e0b';
const HERO_COLORS: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]] = [
  [0.04, 0.03, 0.12], [0.16, 0.12, 0.42], [0.5, 0.32, 0.78], [0.98, 0.7, 0.2],
];

function Formula({ children }: { children: ReactNode }) {
  return <div className="my-4 overflow-x-auto rounded-xl border border-amber-400/20 bg-amber-400/5 px-5 py-4 text-center font-mono text-lg text-amber-200">{children}</div>;
}

function Law({ n, title, statement, children }: { n: number; title: string; statement: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur sm:p-6">
      <div className="mb-2 flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400/15 font-mono text-lg font-black text-amber-300">{n}</span>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <p className="mb-3 border-l-2 border-amber-400/50 pl-4 italic text-slate-200">{statement}</p>
      <div className="text-sm leading-relaxed text-slate-300">{children}</div>
    </div>
  );
}

export default function NewtonClient() {
  return (
    <ArticleShell accent={ACCENT} title="Isaac Newton">
      <ArticleHero
        title="Newton"
        fullTitle="Isaac Newton: Bilimi Yeniden Kuran Adam"
        eyebrow="ISAAC NEWTON · BİLİMİ YENİDEN KURAN ADAM"
        subtitle={<>Hareketi, kütleçekimi, ışığı ve matematiğin kendisini öyle yeniden tanımladı ki ondan sonra iki yüzyıl boyunca fizik, esasen <strong className="font-semibold text-amber-300">“Newton'ın dünyasında”</strong> yapıldı. Aşağı kaydır.</>}
        colors={HERO_COLORS}
      />

      <ArticleLede points={[
        'Üç hareket yasası + evrensel kütleçekim → başyapıtı Principia (1687)',
        'Kalkülüs, yansıtmalı teleskop ve optik (ışığın renklere ayrışması)',
        'Yasaları bugün hâlâ günlük mühendisliğin temeli; yalnızca aşırı uçlarda yerini Einstein ve kuantuma bırakır',
      ]}>
        Isaac Newton (1642–1727), modern fiziğin ve matematiğin kurucusu sayılan İngiliz bilim insanıdır. Üç hareket yasasını (F = m·a dâhil), evrensel kütleçekim yasasını ve kalkülüsü geliştirdi; prizmayla ışığın renklere ayrıştığını gösterdi.
      </ArticleLede>

      <ArticleSection center>
        <p className="text-2xl font-medium leading-relaxed text-slate-200 sm:text-3xl">
          Modern bilimin temellerini <span className="text-amber-300">tek başına</span> denecek kadar büyük ölçüde attı —
          ama aynı zamanda simyaya saplanmış, borsada servetini kaybetmiş, <span className="text-violet-300">kusurlu ve son derece insani</span> bir karakterdi.
        </p>
      </ArticleSection>

      {/* 1. Kimdi */}
      <ArticleSection title="Newton kimdi?" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          25 Aralık 1642'de Lincolnshire'daki Woolsthorpe köyünde doğdu. Babası o doğmadan ölmüştü; son derece küçük, erken doğmuş bir bebekti — kimse yaşayacağını sanmıyordu. Cambridge'deki Trinity College'a 1661'de parasız bir <em className="not-italic text-amber-300">“subsizar”</em> olarak girdi.
        </p>
        <p className="mb-6 leading-relaxed text-slate-300">
          Onu efsaneye çeviren şey bir salgındı: 1665–66'da veba Cambridge'i kapatınca köyüne döndü ve tek başına, 18 ayda — henüz 23 yaşında — insanlık tarihinin en verimli düşünce patlamalarından birini yaşadı. Bu <strong className="text-amber-300">“Mucize Yıllar”da</strong> (Annus Mirabilis):
        </p>
        <CardGrid items={miracleYears} cols={3} />
        <p className="mt-6 leading-relaxed text-slate-300">
          1669'da Lucas Matematik Kürsüsü profesörü oldu (yüzyıllar sonra Hawking de bu kürsüyü tutacaktı). 1687'de Halley'in desteğiyle <strong className="text-amber-300">Principia</strong>'yı yayımladı; bilim tarihinin en önemli eseri sayılır. 1703'te Royal Society başkanı, 1705'te şövalye oldu; 1727'de öldü ve Westminster Abbey'e gömülen ilk bilim insanı oldu.
        </p>
      </ArticleSection>

      {/* 2. Çağı */}
      <ArticleSection title="Çağı: hangi dünyada yaşadı?" max="max-w-4xl">
        <p className="mb-6 leading-relaxed text-slate-300">
          Newton, 17. yüzyılın “Bilim Devrimi”nin tam kalbindeydi; kendi deyimiyle <strong className="text-amber-300">“devlerin omuzlarında”</strong> duruyordu. Aristoteles'in 2000 yıllık dünya görüşü yıkılıyor, yerine ölçülebilir, hesaplanabilir bir evren kuruluyordu. İşte onunla aynı yüzyılı paylaşan devler:
        </p>
        <CardGrid items={contemporaries} cols={3} />
      </ArticleSection>

      {/* 3. Üç yasa */}
      <ArticleSection title="Üç hareket yasası" max="max-w-4xl">
        <p className="mb-6 leading-relaxed text-slate-300">Bu üç cümle, bir asansörün hareketinden roketlerin fırlatılmasına kadar neredeyse her mekanik olayı açıklar.</p>
        <div className="space-y-4">
          <Law n={1} title="Eylemsizlik (Atalet)" statement="Bir cisim, üzerine net bir dış kuvvet etki etmedikçe durgunsa durgun kalır; hareketliyse sabit hızla düz çizgide gider.">
            Cisimler “tembeldir”, hâllerini değiştirmeye direnir. Otobüs frene basınca öne savrulmanız, masa örtüsü hızla çekilince bardağın yerinde kalması bu yüzdendir. Günlük hayatta her şeyin durması sürtünme yüzündendir.
          </Law>
          <Law n={2} title="F = m · a" statement="Bir cisme uygulanan net kuvvet, kütlesi ile ivmesinin çarpımına eşittir.">
            Ne kadar sert itersen o kadar hızlanır; ama ne kadar ağırsa o kadar zor. Boş market arabası hızla giderken dolu olan zor hareket eder.
            <Formula>F = m · a&nbsp;&nbsp;→&nbsp;&nbsp;1000 kg × 2 m/s² = 2000 N</Formula>
            <span className="text-slate-400">Newton bunu aslında daha genel yazmıştı: kuvvet, momentumun (kütle × hız) zamanla değişim hızıdır — roket gibi kütlesi değişen sistemler için bu hâli gerekir.</span>
          </Law>
          <Law n={3} title="Etki – Tepki" statement="Her etkiye karşılık, ona eşit büyüklükte ve zıt yönde bir tepki vardır.">
            Kuvvetler hep çift gelir. Roket gazları aşağı iter, gazlar roketi yukarı iter (uzayda itecek hava olmadan çalışmasının sebebi). Yürürken ayağın yeri geriye, yer seni ileri iter; tüfek mermiyi ileri atar, omzuna geri teper.
          </Law>
        </div>
      </ArticleSection>

      {/* İnteraktif: F = ma */}
      <ArticleSection kicker="İNTERAKTİF · DENE" title="F = m · a'yı kendin oynat">
        <p className="mb-6 text-slate-400">Kütleyi ve ivmeyi değiştir; gereken kuvvetin nasıl değiştiğini gör.</p>
        <ForceCalc />
      </ArticleSection>

      {/* 4. Kütleçekim */}
      <ArticleSection title="Evrensel kütleçekim" max="max-w-4xl">
        <p className="mb-2 leading-relaxed text-slate-300">
          Newton'ın belki de en büyük sıçraması: elmayı yere düşüren kuvvetle Ay'ı yörüngede tutan kuvvet <strong className="text-amber-300">birebir aynıdır</strong>. Yer ile gök, ilk kez tek bir yasaya boyun eğdi.
        </p>
        <Formula>F = G · (m₁ · m₂) / r²&nbsp;&nbsp;&nbsp;(G ≈ 6,674 × 10⁻¹¹)</Formula>
        <p className="mb-6 leading-relaxed text-slate-300">
          Her kütle, diğer her kütleyi çeker. Çekim, kütleler büyüdükçe artar; mesafe arttıkça <strong className="text-amber-300">karesiyle</strong> hızla azalır — mesafeyi 2 katına çıkarırsan çekim dörtte bire iner.
        </p>
        <GravityCalc />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[['🍎', 'Düşen elma', "Dünya elmayı çeker, elma da Dünya'yı; ama Dünya çok ağır olduğu için pratikte sadece elma hareket eder."], ['🌙', 'Ay neden düşmüyor?', 'Aslında sürekli düşüyor — ama yana o kadar hızlı gidiyor ki Dünya\'yı hep ıskalıyor. Bu sonsuz ıskalama = yörünge.'], ['🌊', 'Gelgitler', "Ay'ın okyanuslar üzerindeki çekimi denizleri yükseltip alçaltır."]].map(([i, t, d]) => (
            <div key={t} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur"><div className="mb-1 text-2xl">{i}</div><h4 className="font-bold text-white">{t}</h4><p className="text-sm leading-relaxed text-slate-400">{d}</p></div>
          ))}
        </div>
        <p className="mt-6 leading-relaxed text-slate-300">Yüzeydeki ağırlığını veren <span className="font-mono text-amber-300">g = 9,8 m/s²</span> de bu formülün özel hâlidir: 70 kg'lık biri <Link href="/articles/dunya" className="article-ilink">Dünya</Link>'da ~686 N çekilir; Ay'da g küçük olduğu için altıda biri kadar.</p>
      </ArticleSection>

      {/* 5. Diğer buluşlar */}
      <ArticleSection title="Diğer formülleri ve buluşları" max="max-w-4xl">
        <CardGrid items={inventions} cols={2} />
      </ArticleSection>

      {/* 6. Güney Denizi Balonu */}
      <ArticleSection title="Newton nasıl dolandırıldı? Güney Denizi Balonu" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Evrenin hareketini hesaplayabilen dâhi, sıra paraya gelince tarihin en ünlü borsa çöküşlerinden birinde kaybetti. 1720'de Güney Denizi Şirketi'nin hisseleri akıl almaz bir spekülasyon balonuna döndü.
        </p>
        <div className="my-5 overflow-hidden rounded-xl bg-black/30 ring-1 ring-white/5">
          <svg viewBox="0 0 360 150" className="w-full">
            <polyline points="10,130 70,120 120,95 150,70 175,40 195,35 230,70 270,115 320,128 350,130" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            <circle cx="150" cy="70" r="5" fill="#34d399" /><text x="150" y="60" textAnchor="middle" fontSize="9" fill="#34d399">sattı (kâr)</text>
            <circle cx="195" cy="35" r="5" fill="#fb7185" /><text x="205" y="30" fontSize="9" fill="#fb7185">tepede geri girdi</text>
            <text x="300" y="118" fontSize="9" fill="#94a3b8">çöküş</text>
            <text x="10" y="145" fontSize="8" fill="#64748b">hisse fiyatı / zaman →</text>
          </svg>
        </div>
        <p className="mb-4 leading-relaxed text-slate-300">
          Önce akıllıca davranıp tepe yakınında satıp ~7.000 sterlin kâr etti. Ama fiyatlar yükselmeye devam edince, herkesin zengin olduğunu görmenin verdiği o dürtüyle (bugün buna <strong className="text-amber-300">FOMO</strong> diyoruz) tam tepede geri girdi. Balon patladı; tahminen <strong className="text-rose-300">20.000 sterlin</strong> kaybetti.
        </p>
        <blockquote className="rounded-xl border-l-4 px-5 py-4 text-lg italic text-slate-200" style={{ borderColor: ACCENT, background: 'color-mix(in srgb, #f59e0b 6%, transparent)' }}>
          “Gök cisimlerinin hareketini hesaplayabilirim, ama insanların çılgınlığını değil.”
          <span className="mt-1 block text-sm not-italic text-slate-400">— Newton'a atfedilir (muhtemelen sonradan uydurulmuş, ama dersi mükemmel)</span>
        </blockquote>
        <p className="mt-4 leading-relaxed text-slate-300">
          İroni şu: Newton, Kraliyet Darphanesi'nin başındayken kalpazanların bizzat peşine düşen, en ünlü kalpazan William Chaloner'ı darağacına gönderen biriydi. Sahteciliği avlayan adam, kitle psikolojisini yenememişti.
        </p>
      </ArticleSection>

      {/* 7. İlginç gerçekler */}
      <ArticleSection title="Newton hakkında ilginç gerçekler" max="max-w-4xl">
        <CardGrid items={funFacts} cols={2} />
      </ArticleSection>

      {/* 8. Hangi yasalar geçerli */}
      <ArticleSection kicker="İNTERAKTİF · KEŞFET" title="Bugün hangi yasalarını hâlâ kullanıyoruz?">
        <p className="mb-6 text-slate-400">Filtreyi değiştir: hangileri hâlâ iş başında, hangilerinin yerini Einstein ve kuantum aldı?</p>
        <LawStatus />
        <p className="mt-6 leading-relaxed text-slate-300">
          En zarif gerçek şu: görelilik ve kuantum, Newton'ı <strong className="text-amber-300">çürütmez — kapsar</strong>. Hız düşük ve kütleçekim zayıf olduğunda Einstein'ın denklemleri tam tamına Newton'a dönüşür. Newton fiziği, daha büyük bir gerçeğin günlük hayata bakan, basit ama hâlâ son derece kullanışlı yüzüdür.
        </p>
      </ArticleSection>

      <HorizontalTimeline heading="Bir dâhinin yaşamı" items={timeline} />

      <ArticleSection kicker="MİNİ TEST" title="Newton'ı ne kadar tanıyorsun?">
        <ArticleQuiz questions={quizQs} />
      </ArticleSection>

      <ArticleSection center title="Sonuç">
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-300">
          Hareketi üç yasaya, evreni tek bir formüle sığdırdı; matematiğin dilini yarattı, ışığın sırrını çözdü. Bugün yasalarının büyük kısmını hâlâ her gün kullanıyoruz — çünkü gündelik dünyamızda kusursuz çalışıyorlar.
          En güçlü ders belki şu: <span className="text-amber-300">dünyanın en parlak zihni bile her alanda usta değildir</span>. Newton evreni hesapladı ama insan çılgınlığını hesaplayamadı.
        </p>
      </ArticleSection>

      <div className="relative z-10">
        <ArticleBibliography items={refs} accent={ACCENT} />
      </div>

      <ArticleFooter tagline="Dehâ ile bilgelik her zaman aynı şey değildir. ⚖️" />
    </ArticleShell>
  );
}
