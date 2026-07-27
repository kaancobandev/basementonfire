'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection, HorizontalTimeline, ArticleQuiz, ArticleBibliography, ArticleFooter,
} from '@/app/components/article/ArticleBlocks';
import SourceCompare, { type CompareSource } from '@/app/components/article/SourceCompare';
import ArticleImage from '@/app/components/article/ArticleImage';
import { ACCENT, BG, GOLD, CORAL, COBALT, MARBLE, tokenHex, InView, WidgetSkeleton, SourceNote, MythNote, Stat, tr } from './ui';
import { ReadingProgress, PerdeNav } from './chrome';
import { VenetianCrown, DivandaBirDava, SeferTakvimi, MuhruBas, Cadir, KardesKatliJuri, TugrayiCoz, TugrayiBas } from './widgets';
import { MohacPoster } from './posters';
import {
  ZIGETVAR, NAMES, CROWN, NAME_SOURCES, KANUN, KANUN_PUNCH, MOHAC, VIYANA,
  IBRAHIM, MUSTAFA, BAYEZID, KARDES, KARDES_SOURCES, SULEYMANIYE, NUMBERS,
  timeline, quizQs,
} from './data';
import { refs } from './refs';

const MohacSim = dynamic(() => import('./sim-mohac'), { ssr: false, loading: () => <WidgetSkeleton height={520} /> });

// Kobalt gece + tek turkuaz damar + altın kıvılcım. Fatih'in obsesyon mavisinden
// bilerek ayrı: orada tek bir sabit fikir vardı, burada İŞLEYEN BİR DÜZEN var.
const HERO_COLORS: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]] = [
  [0.027, 0.047, 0.118], [0.078, 0.13, 0.31], [0.18, 0.72, 0.68], [0.85, 0.64, 0.25],
];

const PERDES = [
  { id: 'perde-0', label: 'Kırk iki gün' },
  { id: 'perde-1', label: 'İki isim' },
  { id: 'perde-2', label: 'Kanun makinesi' },
  { id: 'perde-3', label: 'Mohaç' },
  { id: 'perde-4', label: 'Viyana' },
  { id: 'perde-5', label: 'Makbul → Maktul' },
  { id: 'perde-6', label: 'Otağ' },
  { id: 'perde-7', label: 'Kanunun kendisi' },
  { id: 'perde-8', label: 'Kırk iki gün, kapanış' },
];

const nameSources: CompareSource[] = NAME_SOURCES.map((s) => ({ name: s.name, role: s.role, text: s.text, color: tokenHex[s.color] }));
const kardesSources: CompareSource[] = KARDES_SOURCES.map((s) => ({ name: s.name, role: s.role, text: s.text, color: tokenHex[s.color] }));

export default function KanuniClient() {
  return (
    <ArticleShell accent={ACCENT} bg={BG} title="Kanuni Sultan Süleyman">
      <style>{`
        @keyframes kanuni-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes kanuni-stamp { from { opacity: 0; transform: scale(1.35) rotate(-4deg); } to { opacity: 1; transform: none; } }
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          [style*="kanuni-fade"], [style*="kanuni-stamp"] { animation: none !important; }
        }
      `}</style>

      <ReadingProgress />
      <PerdeNav items={PERDES} />

      <ArticleHero
        title="Kanuni"
        fullTitle="Kanuni Sultan Süleyman — Kanunu Yazan Adamın Kendi Kanununa Yenilmesi"
        eyebrow="1532 · VENEDİK · DÖRT TAÇLI BİR MİĞFER"
        gradientText="Kanuni"
        colors={HERO_COLORS}
        object3d="crown"
        subtitle={<>Batı ona &laquo;Muhteşem&raquo; dedi, Doğu &laquo;Kanunî&raquo;. İkisi de aynı adamı anlatıyor — biri süsünü, öteki mekanizmasını.</>}
      />

      <ArticleLede
        points={[
          'Merkez soru: kanunu yazan adam, kendi kanununa yenilir mi?',
          `${NUMBERS.reignYears} yıl saltanat, ${NUMBERS.campaigns} sefer — ve ölümünden sonra ${NUMBERS.hiddenDays} gün daha işleyen bir imza`,
        ]}
      >
        Bu sayfada Kanuni’yi bir bayrak olarak değil, bir <strong>vaka</strong> olarak okuyacaksın. Ne övgü ne yergi — bir teşhis.
        Çünkü asıl hikâye fetihler değil: bir adamın kurduğu düzenin, sırayla en yakın dostunu ve iki oğlunu yutması. Hepsi usulüne uygun.
      </ArticleLede>

      {/* ══════════ PERDE 0 — Cold open: kırk iki gün ══════════ */}
      <div id="perde-0" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 0 · COLD OPEN · ${ZIGETVAR.date.toUpperCase()}`} title="Kırk iki gün">
          <p className="leading-relaxed text-slate-300">
            {ZIGETVAR.opening} {ZIGETVAR.place} önlerinde bir kuşatma sürüyor ve otağdaki adam {ZIGETVAR.age} yaşında.
            Vezir-i âzam Sokollu Mehmed Paşa, ölümü ordudan saklamaya karar veriyor. Sebebi basit: yeni padişah orduya ulaşmadan haber yayılırsa sefer dağılır.
          </p>
          <p className="mt-4 leading-relaxed text-slate-300">Yapılanlar sırayla şunlar:</p>
          <ul className="mt-3 space-y-2">
            {ZIGETVAR.mechanics.map((m, i) => (
              <li key={i} className="flex gap-3 leading-relaxed text-slate-300">
                <span className="mt-1 font-mono text-xs" style={{ color: ACCENT }}>{String(i + 1).padStart(2, '0')}</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>

          <ArticleImage
            src="/articles/kanuni/divan.jpg"
            ratio="1200 / 1921"
            priority
            alt="Osmanlı minyatürü: üstte kuşatılmış Zigetvar kalesi, ortada sıra hâlinde dizilmiş toplar, altta otağlar ve sarıklı devlet adamlarının toplandığı divan meclisi."
            caption="Hünernâme'den: Zigetvar'ın fethinden sonra toplanan divan. Kale eylülde düştü — padişah birkaç gün önce ölmüştü ve bu ölüm ordudan saklanıyordu."
            credit="16. yy Osmanlı minyatürü · kamu malı"
          />

          <div className="my-7 grid grid-cols-3 gap-2.5">
            <Stat value={tr(NUMBERS.hiddenDays)} label="gün ölüm gizlendi" color={CORAL} />
            <Stat value={tr(NUMBERS.reignYears)} label="yıl saltanat" color={GOLD} />
            <Stat value={tr(NUMBERS.campaigns)} label="şahsen çıktığı sefer" color={ACCENT} />
          </div>

          <MythNote title="Peki tam olarak kaç gün?">{ZIGETVAR.hiddenNote}</MythNote>

          <p className="mt-6 text-lg font-semibold leading-relaxed text-slate-100">{ZIGETVAR.punch}</p>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 1 — İki isim ══════════ */}
      <div id="perde-1" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 1 · ${NAMES.accession} · CÜLUS`} title="İki isim">
          <p className="leading-relaxed text-slate-300">
            {NAMES.born}’te {NAMES.bornPlace}’da doğdu, {NAMES.accession}’de tahta çıktı. Saltanatı {NAMES.reign} sürecekti — Osmanlı hanedanının en uzunu.
            Ama bu makalenin ilgilendiği şey sürenin uzunluğu değil, o sürenin sonunda ortaya çıkan <strong>iki ayrı isim</strong>.
          </p>
          <div className="my-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border p-4" style={{ borderColor: `color-mix(in srgb, ${GOLD} 32%, transparent)`, background: `color-mix(in srgb, ${GOLD} 7%, transparent)` }}>
              <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: GOLD }}>BATI</div>
              <div className="mb-1.5 text-2xl font-black text-white">{NAMES.west}</div>
              <p className="text-sm leading-relaxed text-slate-300">{NAMES.westLine}</p>
            </div>
            <div className="rounded-2xl border p-4" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 32%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 7%, transparent)` }}>
              <div className="mb-1 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: ACCENT }}>DOĞU</div>
              <div className="mb-1.5 text-2xl font-black text-white">{NAMES.east}</div>
              <p className="text-sm leading-relaxed text-slate-300">{NAMES.eastLine}</p>
            </div>
          </div>
          <p className="leading-relaxed text-slate-300">{NAMES.punch}</p>

          <p className="mt-6 leading-relaxed text-slate-300">
            Ve o iki isimden biri — Batı’nınki — kısmen <strong>satın alındı</strong>. Sayfanın başında dönen objeye bir daha bak.
          </p>

          <ArticleImage
            src="/articles/kanuni/venedik-migferi.jpg"
            ratio="1200 / 2079"
            alt="Ahşap baskı: Süleyman profilden, başında dört katlı, mücevherli ve sorguçlu miğfer-taç; üstte SVLYMAN OTOMAN REX TVRCX yazılı kurdele."
            caption="Dört taçlı miğferi gösteren dönem baskısı. Üstteki Almanca not, tacın kaç dukaya mal olduğunu yazıyor — çünkü asıl mesaj fiyattı."
            credit="16. yy Alman ahşap baskısı · kamu malı"
          />

          <div className="mt-8">
            <VenetianCrown />
          </div>

          <SourceNote>
            Miğferin Süleyman tarafından hiç takılmadığı kesin değil; kaynaklar &laquo;muhtemelen takılmadı, sergilenmek üzere kullanıldı&raquo; der.
            Kesin olan, {CROWN.year}’de {CROWN.city}’te bir kuyumcuya sipariş edildiği ve Avrupa’da imajı üretmek için tasarlandığıdır.
          </SourceNote>

          <div className="mt-8">
            <SourceCompare
              event="Aynı hükümdar, üç ayrı kalem"
              question="Sekmelere dokun: aynı adam değişsin."
              bottom="Üçü de aynı adamı anlatıyor ve üçü de kendi işini yapıyor. Sen hangisini okuduğunu bilerek oku."
              accent={ACCENT}
              sources={nameSources}
            />
          </div>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 2 — Kanun makinesi ══════════ */}
      <div id="perde-2" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 2 · KANUN NEDİR" title="Kanun makinesi">
          <p className="leading-relaxed text-slate-300">{KANUN.intro}</p>
          <p className="mt-4 leading-relaxed text-slate-300">{KANUN.ebussuud}</p>
          <ArticleImage
            src="/articles/kanuni/tugra.jpg"
            ratio="1200 / 968"
            alt="Süleyman'ın tuğrası: mavi konturlu, altın ve çiçek tezhipli; üç dikey elif ve sola uzanan iki büyük kavis."
            caption="Süleyman'ın tuğrası (yaklaşık 1555–60). Bir kâğıdı hükme çeviren şey metnin kendisi değil, altındaki bu imzaydı."
            credit="The Metropolitan Museum of Art · CC0"
          />

          <div className="my-6 rounded-2xl border p-5" style={{ borderColor: `color-mix(in srgb, ${COBALT} 35%, transparent)`, background: `color-mix(in srgb, ${COBALT} 8%, transparent)` }}>
            <p className="text-lg font-semibold leading-relaxed text-slate-100">{KANUN.principle}</p>
          </div>
          <p className="leading-relaxed text-slate-300">
            Bu cümleyi okumak kolay. Şimdi onu <strong>uygulamayı</strong> dene: aşağıda üç dava var, hükmü sen vereceksin.
          </p>

          <div className="mt-8">
            <DivandaBirDava />
          </div>

          <p className="mt-8 leading-relaxed text-slate-300">{KANUN.twist}</p>
          <p className="mt-4 text-lg font-semibold leading-relaxed text-slate-100">{KANUN_PUNCH}</p>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 3 — Mohaç ══════════ */}
      <div id="perde-3" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 3 · ${MOHAC.date.toUpperCase()}`} title="İki saatte biten krallık">
          <p className="leading-relaxed text-slate-300">{MOHAC.intro}</p>
          <p className="mt-4 leading-relaxed text-slate-300">
            Ordu {MOHAC.departure}’da İstanbul’dan çıktı. Muharebe {MOHAC.date}’da oldu. Arada {tr(MOHAC.marchDays)} gün var —
            ve o {tr(MOHAC.marchDays)} günün tamamı yürüyüş.
          </p>

          <div className="my-6 grid grid-cols-3 gap-2.5">
            <Stat value={tr(MOHAC.marchDays)} label="gün yürüyüş" color={COBALT} />
            <Stat value={`~${MOHAC.battleHours} saat`} label="muharebe" color={CORAL} />
            <Stat value="1" label="krallık" color={MARBLE} />
          </div>

          <ArticleImage
            src="/articles/kanuni/mohac.jpg"
            ratio="1200 / 1855"
            alt="Osmanlı minyatürü: solda zırhlı Avrupa süvarisi ve haçlı sancak, sağda Osmanlı atlıları; arada düşmüş atlar ve savaşçılar."
            caption="Mohaç: solda plaka zırhlı Macar ağır süvarisi, sağda Osmanlı atlıları. Avrupa'nın en iyi vuruş gücü, iki saatte tükendi."
            credit="16. yy Osmanlı minyatürü · kamu malı"
          />

          <p className="leading-relaxed text-slate-300">Osmanlı düzeni şu dört adım üzerine kuruluydu:</p>
          <ul className="mt-3 space-y-2">
            {MOHAC.tactics.map((t, i) => (
              <li key={i} className="flex gap-3 leading-relaxed text-slate-300">
                <span className="mt-1 font-mono text-xs" style={{ color: GOLD }}>{String(i + 1).padStart(2, '0')}</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 leading-relaxed text-slate-300">
            Bunu okumak bir şey, karşısında durmak başka. Aşağıda karşı tarafa geçiyorsun.
          </p>

          <div className="mt-8">
            <InView poster={<MohacPoster />} minHeight={560}>
              <MohacSim />
            </InView>
          </div>

          <p className="mt-8 text-lg font-semibold leading-relaxed text-slate-100">{MOHAC.punch}</p>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 4 — Viyana ══════════ */}
      <div id="perde-4" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 4 · 1529 · SINIR" title="İmparatorluğun sınırını takvim çizdi">
          <p className="leading-relaxed text-slate-300">{VIYANA.intro}</p>
          <p className="mt-4 leading-relaxed text-slate-300">
            {VIYANA.departure}’da İstanbul’dan çıkıldı. {VIYANA.arrival}’de Viyana önlerine varıldı. {VIYANA.lifted}’da kuşatma kaldırıldı.
            Yani {tr(VIYANA.marchDays)} gün yürüyüş, {tr(VIYANA.siegeDays)} gün kuşatma.
          </p>

          <div className="mt-8">
            <SeferTakvimi />
          </div>

          <p className="mt-8 leading-relaxed text-slate-300">{VIYANA.echo}</p>
          <SourceNote>
            Bu bölümdeki tarihler kayıtlıdır; mesafeler yürüyüş güzergâhı üzerinden yaklaşıktır. Hesabın kendisi zaten tarihlerden çıkıyor:
            1529’da yolda geçen süre, kuşatmada geçen sürenin yedi katından fazla.
          </SourceNote>
        </ArticleSection>
      </div>

      <HorizontalTimeline heading="Bir hayatın tamamı, tek şeritte" kicker="1494 → 1566" items={[...timeline]} />

      {/* ══════════ PERDE 5 — Makbul → Maktul ══════════ */}
      <div id="perde-5" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 5 · ${IBRAHIM.date.toUpperCase()}`} title="Makbul’den Maktul’e">
          <p className="leading-relaxed text-slate-300">{IBRAHIM.intro}</p>
          <p className="mt-4 leading-relaxed text-slate-300">{IBRAHIM.night}</p>
          <p className="mt-4 text-lg font-semibold leading-relaxed text-slate-100">{IBRAHIM.name}</p>

          <ArticleImage
            src="/articles/kanuni/ibrahim-pasa.jpg"
            ratio="1200 / 1800"
            alt="Elle boyanmış ahşap baskı: sarıklı İbrahim Paşa beyaz at üstünde asa taşıyor; üstte Almanca basılı mektup metni, sağda mührünün çizimi."
            caption="İbrahim Paşa, Ekim 1529: Viyana önünden şehirdeki komiserlere yolladığı mektubun Almanya'da basılmış hâli — sağda kendi mührünün çizimi var. Altı buçuk yıl sonra sarayda boğduruldu."
            credit="Alman ahşap baskısı, ~1529–30 · kamu malı"
          />

          <div className="mt-8">
            <MuhruBas />
          </div>

          <MythNote title="Peki neden öldürüldü?">{IBRAHIM.unknown}</MythNote>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 6 — Otağ ══════════ */}
      <div id="perde-6" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 6 · ${MUSTAFA.date.toUpperCase()} · ${MUSTAFA.place.toUpperCase()}`} title="Otağ">
          <p className="leading-relaxed text-slate-300">{MUSTAFA.intro}</p>

          <div className="mt-8">
            <Cadir />
          </div>

          <p className="mt-8 text-lg font-semibold leading-relaxed text-slate-100">{MUSTAFA.punch}</p>
          <MythNote title="Kim yaptırdı? Kaynaklar tek ses değil.">{MUSTAFA.after}</MythNote>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 7 — Kanunun kendisi (seri kilidi) ══════════ */}
      <div id="perde-7" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 7 · ${BAYEZID.date.toUpperCase()} · ${BAYEZID.place.toUpperCase()}`} title="Kanunun kendisi">
          <p className="leading-relaxed text-slate-300">{BAYEZID.text}</p>
          <p className="mt-4 leading-relaxed text-slate-300">{KARDES.intro}</p>
          <p className="mt-4 leading-relaxed text-slate-300">
            {KARDES.link} O adamı bu sitede zaten tanıyorsun:{' '}
            <Link href="/articles/fatih" className="article-ilink" style={{ color: GOLD }}>Fatih Sultan Mehmed</Link>.
            Orada bir fikrin bir insanı nasıl ele geçirdiğini okumuştun. Burada o insanın yazdığı kuralın, torunlarının çocuklarını nasıl aldığını okuyorsun.
          </p>
          <p className="mt-6 text-lg font-semibold leading-relaxed text-slate-100">{KARDES.question}</p>

          <div className="mt-8">
            <SourceCompare
              event="Kardeş katli maddesi — kim yazdı?"
              question="Dört bakış, tek metin. Sekmelere dokun."
              bottom={KARDES.bottom}
              accent={GOLD}
              sources={kardesSources}
            />
          </div>

          <div className="mt-6">
            <KardesKatliJuri />
          </div>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 8 — Süleymaniye + kapanış ══════════ */}
      <div id="perde-8" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 8 · ${SULEYMANIYE.years} · SÜLEYMANİYE`} title="Kanun taşa yazılıyor">
          <p className="leading-relaxed text-slate-300">{SULEYMANIYE.text}</p>

          <ArticleImage
            src="/articles/kanuni/suleymaniye.jpg"
            ratio="1200 / 800"
            alt="Alacakaranlıkta Haliç'ten Süleymaniye: aydınlatılmış kubbe ve dört minare, altta sahil, ışıklı vapurlar ve su."
            caption="Süleymaniye, Haliç'ten. Mimar Sinan bir cami değil külliye kurdu: medreseler, darüşşifa, imaret, hamam ve çarşı."
            credit={<>Fotoğraf: Diego Delso · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="underline">CC BY-SA 4.0</a></>}
          />
          <p className="mt-4 leading-relaxed text-slate-300">
            Aynı yıllar aynı zamanda hattın, çininin ve tuğranın altın çağıdır — padişahın imzası da bir sanat nesnesidir.
            (Yazının kendisi ayrı bir konu:{' '}
            <Link href="/articles/kaligrafi" className="article-ilink" style={{ color: ACCENT }}>kaligrafi</Link>.)
          </p>

          <div className="mt-8">
            <TugrayiCoz />
          </div>

          <p className="mt-8 text-lg font-semibold leading-relaxed text-slate-100">{SULEYMANIYE.punch}</p>

          <p className="mt-8 leading-relaxed text-slate-300">
            Şimdi başladığımız yere dönelim. {ZIGETVAR.place}, {ZIGETVAR.date}. Otağda ölü bir adam var, dışarıda yürüyen bir ordu.
          </p>

          <div className="mt-8">
            <TugrayiBas />
          </div>

          <p className="mt-8 leading-relaxed text-slate-400">
            {ZIGETVAR.burial}’da {ZIGETVAR.burialPlace}’ye gömüldü — kendi yaptırdığı külliyeye, kendi yazdırdığı düzenin ortasına.
          </p>
          <p className="mt-6 text-center text-sm italic text-slate-500">
            Ne muhteşem ne kanunî. Bir makine, onu kuran adam, ve arada geçen kırk altı yıl.
          </p>
        </ArticleSection>
      </div>

      <ArticleSection kicker="MİNİ TEST" title="Sıfat mı, sayı mı? Bakalım.">
        <ArticleQuiz questions={[...quizQs]} />
      </ArticleSection>

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-300">Kaynak notu: </span>
          Bu yazının tanıkları taraflıdır ve bilerek yan yana kondu: Osmanlı kâtibi maaşını saraydan alır, Venedik balyosu bir rakibin envanterini tutar,
          Habsburg broşürü korku satar. İki büyük belirsizlik açıkça işaretlendi: ölümün <strong>kaç gün</strong> gizlendiği kaynaklarda değişir ve
          kardeş katli maddesinin Fatih’e aidiyeti <strong>hâlâ tartışmalıdır</strong> — elimizdeki kanunnâme nüshaları geç tarihlidir.
          Mohaç’ın ordu ve top sayıları da tek bir rakamla verilmedi; kaynaklar çelişiyor, çelişki gösterildi.
          Bu sayfa hüküm vermek için değil, sayıları ve boşlukları göstermek için yazıldı.
        </div>
      </div>

      <div className="relative z-10">
        <ArticleBibliography items={refs} accent={ACCENT} />
      </div>

      <ArticleFooter tagline="Sıfat değil, sayı. Gerisi sana kalmış. ⚖️" />
    </ArticleShell>
  );
}
