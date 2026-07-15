'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection, HorizontalTimeline, ArticleQuiz, ArticleBibliography, ArticleFooter,
} from '@/app/components/article/ArticleBlocks';
import SourceCompare, { type CompareSource } from '@/app/components/article/SourceCompare';
import { ACCENT, BG, GOLD, CRIMSON, MARBLE, WATER, InView, WidgetSkeleton, SourceNote, MythNote, Stat, tr } from './ui';
import { ReadingProgress, PerdeNav } from './chrome';
import { DividedCourt, BosphorusLock, Library, EmperorDecision, PoisonJury } from './widgets';
import { SiegePoster, NightRoutePoster } from './posters';
import {
  TROY, COURT, MANISA, BOSPHORUS, WALLS, URBAN, CANNON, RACE,
  NIGHT, OMENS, ASSAULT, KAYSER, SECOND_LIFE, NUMBERS, FALL_COMPARE,
  OTRANTO, LAST_CAMPAIGN, CLOSE, timeline, quizQs,
} from './data';
import { refs } from './refs';

const SiegeRace = dynamic(() => import('./sim-siege'), { ssr: false, loading: () => <WidgetSkeleton height={480} /> });
const NightRoute = dynamic(() => import('./sim-night-route'), { ssr: false, loading: () => <WidgetSkeleton height={360} /> });

// Soğuk, gece-mavisi shader + tek altın kıvılcım (takıntının parladığı yer).
const HERO_COLORS: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]] = [
  [0.04, 0.05, 0.09], [0.09, 0.14, 0.32], [0.28, 0.40, 0.85], [0.83, 0.66, 0.30],
];

const PERDES = [
  { id: 'perde-0', label: 'Truva' },
  { id: 'perde-1', label: 'Reddedilen çocuk' },
  { id: 'perde-2', label: 'Boğazkesen' },
  { id: 'perde-3', label: 'Matematik problemi' },
  { id: 'perde-4', label: 'Gemiler karadan' },
  { id: 'perde-5', label: 'Elli dördüncü gün' },
  { id: 'perde-6', label: 'İkinci hayat' },
  { id: 'perde-7', label: 'Hünkâr Çayırı' },
];

const tokenHex: Record<string, string> = { gold: GOLD, crimson: CRIMSON, water: WATER, marble: MARBLE, accent: ACCENT };
const fallSources: CompareSource[] = FALL_COMPARE.sources.map((s) => ({ name: s.name, role: s.role, text: s.text, color: tokenHex[s.color] }));

export default function FatihClient() {
  return (
    <ArticleShell accent={ACCENT} bg={BG} title="Fatih Sultan Mehmed">
      <style>{`
        @keyframes fatih-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes fatih-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
      `}</style>

      <ReadingProgress />
      <PerdeNav items={PERDES} />

      <ArticleHero
        title="Fatih"
        fullTitle="Fatih Sultan Mehmed — Bir Fikrin Ele Geçirdiği Adam"
        eyebrow="1462 · TRUVA · BİR MEZARIN BAŞINDA"
        gradientText="Fatih"
        colors={HERO_COLORS}
        subtitle={<>Otuz yaşında bir padişah, ölmüş bir Yunan kahramanının mezarı başında duruyor ve İlyada'nın devam filmini çektiğini söylüyor. Kahraman da değil, canavar da — takıntılı.</>}
      />

      <ArticleLede
        points={[
          'Merkez soru: bir fikir bir insanı ne kadar ele geçirebilir?',
          '12\'sinde tahta çıkarılıp indirilen, 21\'inde şehri alan, 49\'unda Roma\'ya yürürken çayırda ölen bir adam',
        ]}
      >
        Bu sayfada Fatih'i bir bayrak olarak değil, bir <strong>vaka</strong> olarak okuyacaksın. Ne destan ne yergi — bir teşhis. Çünkü asıl hikâye zafer değil: bir fikrin bir insanı nasıl ve ne kadar ele geçirdiği.
      </ArticleLede>

      {/* ══════════ PERDE 0 — Cold open: Truva ══════════ */}
      <div id="perde-0" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 0 · COLD OPEN · 1462" title="Bir mezarın başında">
          <p className="leading-relaxed text-slate-300">
            {TROY.place}, {TROY.year}. Sultan otuz yaşında. Ordusuyla birlikte, harabelerin arasında, Akhilleus'un mezarı olduğuna inanılan yerde duruyor. Tarihçisi Kritovulos anlatıyor: sultan taşları inceliyor, kahramanların isimlerini soruyor, sonra konuşuyor. Diyor ki — bu şehri, bu insanları, bu toprağı Yunanlılar bir zamanlar almıştı. Ben onların torunlarından hesabını sordum.
          </p>
          <p className="mt-4 leading-relaxed text-slate-300">
            Bir düşünün. Ölmüş bir Yunan kahramanının mezarı başında, Homeros'un dizelerini ezberden bilen bir Osmanlı padişahı, İlyada'nın devam filmini çektiğini söylüyor. Kendini tarihin dışından bakan biri olarak değil, içindeki bir karakter olarak görüyor.
          </p>
          <p className="mt-4 text-lg font-semibold leading-relaxed text-slate-100">
            Bu adamı anlamak istiyorsanız önce şunu kabul edin: o kendini bizim gördüğümüz gibi görmüyordu.
          </p>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 1 — Reddedilen çocuk ══════════ */}
      <div id="perde-1" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 1 · 1444–1451" title="Reddedilen çocuk">
          <p className="leading-relaxed text-slate-300">
            Ağustos 1444. Murad II tahtı bırakıyor ve yerine on iki yaşındaki oğlunu oturtuyor. Sebebi hâlâ tartışılıyor — yorgunluk mu, oğlunu sınama mı, bilmiyoruz. Sonuç biliniyor: Avrupa haçlı ordusu topluyor, saray ikiye bölünüyor.
          </p>
          <p className="mt-4 leading-relaxed text-slate-300">
            Bir tarafta Çandarlı Halil Paşa — Osmanlı'nın en güçlü ailesinden, temkinli, "Bizans'a dokunmayalım" diyen adam. Diğer tarafta Zağanos ve Şihabeddin — genç sultanı Konstantinopolis'e kışkırtanlar. Terazi kimden yana?
          </p>
          <div className="mt-8">
            <DividedCourt />
          </div>
          <p className="mt-8 leading-relaxed text-slate-300">
            Mayıs 1446: çocuk sultan tahttan indiriliyor, Manisa'ya gönderiliyor. On dört yaşında. Kendi sarayında, kendi devletinde, kendi vezirine yenilmiş.
          </p>
          <p className="mt-4 leading-relaxed text-slate-300">{MANISA.ciriaco}</p>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 2 — Boğazkesen ══════════ */}
      <div id="perde-2" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 2 · 1451–1452" title={'Geri dönüş ve "Boğazkesen"'}>
          <p className="leading-relaxed text-slate-300">
            18 Şubat 1451. Murad ölüyor, on dokuz yaşındaki Mehmed ikinci kez tahtta. Avrupa'nın tepkisi: rahatlama. Aynı çocuk, zararsız. Venedik'e, Macaristan'a, Bizans'a barış mektupları gidiyor, hepsi imzalanıyor. Bizans imparatoru bir de küstahlık ediyor: elinde tuttuğu Osmanlı şehzadesi için ödeneği ikiye katlamasını istiyor.
          </p>
          <p className="mt-4 leading-relaxed text-slate-300">
            Nisan 1452. Sultan Boğaz'ın en dar noktasına, Bizans toprağına kale kurmaya başlıyor. Karşı kıyıda dedesinin kalesi zaten var. Yeni kalenin adı: <strong>Boğazkesen</strong>. Dört buçuk ay. Bir kale. Boğaz kapandı.
          </p>
          <div className="mt-8">
            <BosphorusLock />
          </div>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 3 — Bir matematik problemi (KALP) ══════════ */}
      <div id="perde-3" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 3 · SURLAR vs. BARUT" title="Bir matematik problemi">
          <p className="leading-relaxed text-slate-300">
            Konstantinopolis {tr(WALLS.standingYears)} yıldır ayaktaydı. {WALLS.siegesSeen} kuşatma görmüş, birini kaybetmişti — o da {WALLS.lostYear}'te Haçlılara, içeriden. Sebebi mimariydi: {WALLS.name}. Yaklaşık {tr(WALLS.lengthKm, 1)} km, üç katman. {WALLS.detail}
          </p>
          <div className="my-6 grid grid-cols-3 gap-2.5">
            <Stat value={tr(WALLS.standingYears)} label="yıldır ayakta" color={MARBLE} />
            <Stat value={`${tr(WALLS.lengthKm, 1)} km`} label="sur uzunluğu" color={MARBLE} />
            <Stat value={`${WALLS.layers} katman`} label="hendek + dış + iç" color={MARBLE} />
          </div>
          <p className="leading-relaxed text-slate-300">
            Sultanın çözümü bir mühendisti. <strong>{URBAN.name}</strong> — {URBAN.origin}. {URBAN.firstWent} {URBAN.sultanPaid}
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <tbody>
                {CANNON.map((row) => (
                  <tr key={row.label} className="border-b border-white/[0.06] last:border-0" style={row.key ? { background: `color-mix(in srgb, ${CRIMSON} 9%, transparent)` } : undefined}>
                    <td className="px-3 py-2.5 text-slate-300" style={row.key ? { color: `color-mix(in srgb, ${CRIMSON} 88%, white)`, fontWeight: 700 } : undefined}>{row.label}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold" style={{ color: row.key ? CRIMSON : MARBLE }}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5 leading-relaxed text-slate-300">
            Son satıra tekrar bakın. Günde üç ila yedi atış. {RACE.point}
          </p>
          <p className="mt-4 text-lg font-semibold leading-relaxed text-slate-100">{RACE.thesis}</p>

          <div className="mt-8">
            <InView poster={<SiegePoster />} minHeight={480}>
              <SiegeRace />
            </InView>
          </div>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 4 — Gemiler karadan ══════════ */}
      <div id="perde-4" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 4 · 22 NİSAN 1453" title="Gemiler karadan">
          <p className="leading-relaxed text-slate-300">
            Haliç, şehrin yumuşak karnıydı. Oradaki surlar ince. Ama Haliç'in ağzına zincir gerilmişti — {NIGHT.chain} {NIGHT.aprilTwenty} Sultan atını denize sürdüğü kadar sürüp bağırdı diye anlatılır.
          </p>
          <p className="mt-4 leading-relaxed text-slate-300">
            İki gün sonra sabah, savunmacılar Haliç'e baktı. İçeride yaklaşık otuz Osmanlı gemisi vardı. Gece, {NIGHT.ridge} Gemiler karadan yürütülmüştü — yaklaşık 1,5 km, tepeler üzerinden, tek gecede.
          </p>
          <div className="mt-8">
            <InView poster={<NightRoutePoster />} minHeight={360}>
              <NightRoute />
            </InView>
          </div>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 5 — Elli dördüncü gün ══════════ */}
      <div id="perde-5" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 5 · 29 MAYIS 1453" title="Elli dördüncü gün">
          <p className="leading-relaxed text-slate-300">{OMENS.eclipse} {OMENS.storm}</p>
          <p className="mt-4 leading-relaxed text-slate-300">{ASSAULT.waves}</p>
          <p className="mt-4 leading-relaxed text-slate-300"><strong>Bir:</strong> {ASSAULT.giustiniani}</p>
          <p className="mt-4 leading-relaxed text-slate-300"><strong>İki:</strong> {ASSAULT.kerkoporta}</p>
          <MythNote title="Kerkoporta gerçekten açık mı unutuldu?">{ASSAULT.kerkoportaMyth}</MythNote>
          <p className="mt-5 leading-relaxed text-slate-300">{ASSAULT.constantine}</p>
          <p className="mt-4 leading-relaxed text-slate-300">{ASSAULT.entry}</p>

          <div className="mt-8">
            <EmperorDecision />
          </div>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 6 — İkinci hayat ══════════ */}
      <div id="perde-6" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 6 · 1453–1480 · YIKICIDAN KURUCUYA" title="İkinci hayat">
          <p className="leading-relaxed text-slate-300">
            Hikâye burada bitmiş gibi hissettiriyor. Bitmiyor. Fetihten sonra sultan yeni bir unvan alıyor: <strong style={{ color: GOLD }}>{KAYSER.title}</strong> — {KAYSER.meaning}. {KAYSER.logic} {KAYSER.west} {KAYSER.patriarch}
          </p>

          {/* Caesar serisine köprü — iç link */}
          <div className="my-6 rounded-2xl border p-4" style={{ borderColor: `color-mix(in srgb, ${GOLD} 30%, transparent)`, background: `color-mix(in srgb, ${GOLD} 6%, transparent)` }}>
            <p className="text-sm leading-relaxed text-slate-300">{KAYSER.bridge}</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Link href="/articles/augustus" className="flex flex-1 items-center gap-2 rounded-xl border p-3 text-sm transition hover:bg-white/[0.04]" style={{ borderColor: `color-mix(in srgb, ${GOLD} 28%, transparent)` }}>
                <span className="text-lg">🏛️</span>
                <span className="text-slate-300">O makamı kuran adam: <span className="font-semibold" style={{ color: GOLD }}>→ Augustus</span></span>
              </Link>
              <Link href="/articles/sezar" className="flex flex-1 items-center gap-2 rounded-xl border p-3 text-sm transition hover:bg-white/[0.04]" style={{ borderColor: `color-mix(in srgb, ${CRIMSON} 25%, transparent)` }}>
                <span className="text-lg">🗡️</span>
                <span className="text-slate-300">İsmin izi — Caesar → Kaiser → Çar: <span className="font-semibold" style={{ color: `color-mix(in srgb, ${CRIMSON} 85%, white)` }}>→ Caesar</span></span>
              </Link>
            </div>
          </div>

          <p className="leading-relaxed text-slate-300">Devamı bir liste gibi görünüyor ama bir stratejinin parçası:</p>
          <div className="mt-4 space-y-2.5">
            {SECOND_LIFE.map((s) => (
              <div key={s.key} className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                <div className="text-sm font-bold text-white">{s.title}</div>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-300">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="my-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <Stat value={`${tr(NUMBERS.land0)} km²`} label="devraldığı topraklar" color={MARBLE} />
            <Stat value={`${tr(NUMBERS.land1)} km²`} label="bıraktığı topraklar" color={GOLD} />
            <Stat value={tr(NUMBERS.campaigns)} label="bizzat komuta ettiği sefer" color={ACCENT} />
          </div>
          <p className="leading-relaxed text-slate-300">{NUMBERS.giovanni}</p>

          <div className="mt-8">
            <Library />
          </div>

          <p className="mt-8 leading-relaxed text-slate-300">
            Ve karanlık tarafı: {NUMBERS.cem}
          </p>
          <p className="mt-4 text-lg font-semibold leading-relaxed text-slate-100">{NUMBERS.line}</p>

          {/* İmza öğe — Kaynak Karşılaştırıcı */}
          <div className="mt-8">
            <p className="mb-4 leading-relaxed text-slate-300">
              Peki fetih günü tam olarak <em>nasıl</em> oldu? İşte platformumuzun doğrulama tezinin göründüğü yer. Aynı an, dört tanık:
            </p>
            <SourceCompare
              event={FALL_COMPARE.event}
              question={FALL_COMPARE.question}
              bottom={FALL_COMPARE.bottom}
              sources={fallSources}
              accent={ACCENT}
            />
          </div>
        </ArticleSection>
      </div>

      <HorizontalTimeline heading="Bir hayatın tamamı, tek şeritte" kicker="1432 → 1481" items={timeline} />

      {/* ══════════ PERDE 7 — Hünkâr Çayırı ══════════ */}
      <div id="perde-7" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 7 · 3 MAYIS 1481" title="Hünkâr Çayırı">
          <p className="leading-relaxed text-slate-300">{OTRANTO.landing} {OTRANTO.fell}</p>
          <p className="mt-4 leading-relaxed text-slate-300">{OTRANTO.target}</p>
          <SourceNote>{OTRANTO.dateConflict}</SourceNote>
          <p className="mt-6 leading-relaxed text-slate-300">{LAST_CAMPAIGN.april}</p>
          <p className="mt-4 leading-relaxed text-slate-300">{LAST_CAMPAIGN.place} Birkaç gün sonra, 3 Mayıs 1481'de ölüyor. {LAST_CAMPAIGN.death}</p>
          <p className="mt-4 leading-relaxed text-slate-300">{LAST_CAMPAIGN.aquila}</p>

          <div className="mt-8">
            <PoisonJury />
          </div>

          <p className="mt-8 leading-relaxed text-slate-400">{LAST_CAMPAIGN.aftermath}</p>
        </ArticleSection>
      </div>

      {/* ══════════ KAPANIŞ — Halka kapanıyor ══════════ */}
      <ArticleSection kicker="KAPANIŞ" title="Halka kapanıyor">
        <p className="leading-relaxed text-slate-300">Truva'ya dönelim. {CLOSE.ring}</p>
        <p className="mt-4 leading-relaxed text-slate-300">{CLOSE.tomb}</p>
        <p className="mt-6 text-lg font-semibold leading-relaxed text-slate-100">{TROY.close}</p>
        <p className="mt-6 text-center text-sm italic text-slate-500">Ne kahraman ne canavar. Bir fikir, bir insan, ve arada geçen kırk dokuz yıl.</p>
      </ArticleSection>

      <ArticleSection kicker="MİNİ TEST" title="Sıfat mı, sayı mı? Bakalım.">
        <ArticleQuiz questions={quizQs} />
      </ArticleSection>

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-300">Kaynak notu: </span>
          Ana tanıklar taraflıdır ve bilerek yan yana kondu: Kritovulos sultanın tarihçisidir ama Rum'dur; Dukas düşman kalemdir; Barbaro Venedikli, Tursun Bey Osmanlı. Zehir tezi (Heywood) <strong>kanıtlanmamış</strong> dolaylı bir delildir; Kerkoporta anlatısı büyük ölçüde tek kaynağa (Dukas) dayanır ve tartışmalıdır. Otranto'nun düşüş tarihi bile kaynaklarda 26 Temmuz ile 11 Ağustos 1480 arasında değişir. Bu yazı bir hüküm vermek için değil, sayıları ve boşlukları göstermek için yazıldı — yorumu okur yapar.
        </div>
      </div>

      <div className="relative z-10">
        <ArticleBibliography items={refs} accent={ACCENT} />
      </div>

      <ArticleFooter tagline="Sıfat değil, sayı. Gerisi sana kalmış. 🏰" />
    </ArticleShell>
  );
}
