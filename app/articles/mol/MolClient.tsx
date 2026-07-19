'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection, CardGrid, HorizontalTimeline, ArticleQuiz, ArticleBibliography, ArticleFooter,
} from '@/app/components/article/ArticleBlocks';
import ArticleImage from '@/app/components/article/ArticleImage';
import {
  MoleculeField, MolCalculator, ConversionMap, AvogadroScale, PeriodicPicker,
  timeline, everyday, terms, faqs, quizQs, refs,
} from './widgets';

const ACCENT = '#f59e0b';
const HERO_COLORS: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]] = [
  [0.05, 0.03, 0.02], [0.20, 0.10, 0.03], [0.62, 0.38, 0.07], [0.86, 0.56, 0.16],
];

function FunFact({ icon = '🤯', title = 'Şaşırtıcı bilgi', children }: { icon?: string; title?: string; children: ReactNode }) {
  return (
    <div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] px-5 py-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-bold text-amber-200"><span>{icon}</span><span>{title}</span></div>
      <div className="text-sm leading-relaxed text-slate-300">{children}</div>
    </div>
  );
}
function Caution({ title = 'Dikkat', children }: { title?: string; children: ReactNode }) {
  return (
    <div className="mt-5 rounded-xl border-l-4 border-rose-400/60 bg-rose-400/[0.06] px-5 py-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-rose-200"><span>⚠️</span><span>{title}</span></div>
      <div className="text-sm leading-relaxed text-slate-300">{children}</div>
    </div>
  );
}
function Formula({ children }: { children: ReactNode }) {
  return <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-sm leading-relaxed text-amber-100">{children}</pre>;
}

export default function MolClient() {
  return (
    <ArticleShell accent={ACCENT} title="Kimyada Mol Kavramı">
      <style>{`
        /* ArticleImage'ın slate varsayılanlarını makalenin kehribar aksanına bağla. */
        .ml-img {
          --ai-caption: #cbd5e1;
          --ai-credit: #9a7f4f;
          --ai-border: rgba(245,158,11,0.22);
          --ai-fill: rgba(245,158,11,0.05);
          --ai-mark: rgba(245,158,11,0.28);
        }
        .ml-img-pair { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; align-items: start; }
        @media (max-width: 700px) { .ml-img-pair { grid-template-columns: 1fr; } }
      `}</style>
      <MoleculeField />

      <ArticleHero
        title="Mol"
        fullTitle="Kimyada Mol Kavramı — Kapsamlı Rehber"
        eyebrow="KİMYA · İNTERAKTİF REHBER"
        subtitle={<>Kimyanın belki de en temel ama en çok <em className="not-italic text-amber-300">gözü korkutan</em> kavramı. Aslında düşündüğünden çok daha basit — gündelik örneklerle, baştan sona.</>}
        colors={HERO_COLORS}
      />

      <ArticleLede points={[
        'Mol bir SAYMA birimidir: 1 mol = 6,022 × 10²³ tane (Avogadro sayısı)',
        'Tartılabilen gram ile sayılabilen tanecik arasındaki köprüdür',
        'Molar kütle, dönüşüm haritası ve stokiyometri — hepsi bu köprünün üzerinde yürür',
      ]}>
        Mol, atomların ve moleküllerin dünyası ile tartıp ölçebildiğimiz gündelik dünya arasındaki çevirmendir: 1 mol = 6,022 × 10²³ tane. “Bir düzine” nasıl 12 tane demekse, “bir mol” de bu devasa sayıda tane demektir — böylece kimyager atomları sayamasa da tartabilir.
      </ArticleLede>

      {/* Bütün diller sayar */}
      <ArticleSection title="Mol aslında bir “sayma birimi”dir" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Markette yumurtayı tek tek saymazsın — <strong className="text-amber-300">“bir düzine”</strong> (12) dersin. Kağıda “bir top” (500), kaleme “bir düzine” dersin. Bunlar birer <em className="not-italic text-amber-300">sayma birimidir</em>: arkasında sabit bir sayı vardır. Her dil, büyük sayılarla baş etmek için kendi “paketini” üretir:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead><tr className="border-b border-white/15 text-left text-slate-400"><th className="py-2 pr-4 font-semibold">Birim</th><th className="py-2 pr-4 font-semibold">Kaç tane?</th><th className="py-2 font-semibold">Nerede?</th></tr></thead>
            <tbody className="text-slate-300">
              {[['Çift', '2', 'Bir çift ayakkabı'], ['Deste', '10', 'Bir deste kağıt'], ['Düzine', '12', 'Bir düzine yumurta'], ['Top', '500', 'Bir top kağıt']].map((r) => (
                <tr key={r[0]} className="border-b border-white/5"><td className="py-2 pr-4 font-semibold text-white">{r[0]}</td><td className="py-2 pr-4 font-mono">{r[1]}</td><td className="py-2">{r[2]}</td></tr>
              ))}
              <tr className="border-b border-white/5 bg-amber-400/[0.06]"><td className="py-2 pr-4 font-black text-amber-300">Mol</td><td className="py-2 pr-4 font-mono font-bold text-amber-300">6,022 × 10²³</td><td className="py-2 text-amber-100">Bir mol su molekülü</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-5 leading-relaxed text-slate-300">Bu devasa sayıya <strong className="text-amber-300">Avogadro sayısı</strong> (N<sub>A</sub>) denir. Kimyacılar atomları saymak için kendi “düzinelerini” icat etmek zorunda kaldılar — çünkü uğraştıkları şeyler öyle küçük ki milyarlarca milyarla bile iş bitmiyordu.</p>
        <div className="ml-img-pair my-6">
          <ArticleImage
            className="ml-img"
            src="/articles/mol/avogadro-portre.webp"
            ratio="1600 / 2204"
            priority
            alt="19. yüzyıl portresi: koyu ceketli, favorili bir adam masa başında oturmuş, elinde kâğıt tutuyor."
            caption="Amedeo Avogadro. Hipotezini 1811'de yayımladı, ama kimse ciddiye almadı; adını taşıyan sayıyı hiç görmeden, 1856'da öldü."
            credit="Kamu malı"
          />
          <ArticleImage
            className="ml-img"
            src="/articles/mol/cannizzaro-portre.webp"
            ratio="1600 / 2273"
            alt="Sakallı, koyu takım elbiseli yaşlı bir adamın siyah beyaz portre fotoğrafı."
            caption="Stanislao Cannizzaro: 1860'ta Karlsruhe Kongresi'nde, elli yıldır göz ardı edilen fikri yeniden ortaya koydu ve kimyayı ikna etti."
            credit="Kamu malı"
          />
        </div>

        <FunFact icon="📏" title="2019: mol artık bir tanım">
          Uluslararası birim sistemi (SI) 2019'da güncellendi: mol artık <strong className="text-white">tam olarak 6,02214076 × 10²³</strong> tanecik olarak <em className="not-italic text-amber-300">tanımlanıyor</em>. Yani Avogadro sayısı artık deneyle ölçülen değil, üzerinde anlaşılmış sabit bir sayı.
        </FunFact>
      </ArticleSection>

      {/* Neden devasa sayı */}
      <ArticleSection title="Neden böyle tuhaf, devasa bir sayıya ihtiyacımız var?" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Çünkü atomlar inanılmaz küçüktür. Bir kimyager laboratuvarda atomları tek tek sayamaz — ama <strong className="text-amber-300">tartabilir</strong>. İşte mol, bu ikisi arasındaki köprüdür. Bir çuval pirinci tek tek saymak delilik olurdu; ama akıllı bir yol var:
        </p>
        <ol className="mb-4 space-y-2">
          {['100 pirinç tanesini sayıp tart (diyelim 2 gram).', 'Bütün çuvalı tart (diyelim 5 kg).', 'Basit bir bölmeyle çuvaldaki tane sayısını bul.'].map((s, i) => (
            <li key={i} className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-400/15 font-mono text-xs font-bold text-amber-300">{i + 1}</span><span>{s}</span></li>
          ))}
        </ol>
        <p className="leading-relaxed text-slate-300"><strong className="text-amber-300">Kimyager de atomlarla aynen bunu yapar.</strong> “Tartılabilen gram” ile “sayılabilen tanecik” arasında geçişi mol sağlar. Bu yüzden mol, kimyanın kalbindeki kavramdır.</p>
      </ArticleSection>

      {/* Ne kadar büyük */}
      <ArticleSection kicker="İNTERAKTİF · HİSSET" title="6,022 × 10²³ ne kadar büyük?" max="max-w-4xl">
        <p className="mb-6 leading-relaxed text-slate-300">Bu sayının günlük deneyimde karşılığı yok. Logaritmik ölçekte kıyasla — Avogadro sayısı hepsini nasıl gölgede bırakıyor gör:</p>
        <AvogadroScale />
        <FunFact icon="💧" title="Ama bir yudum suya sığıyor">
          Avucundaki bir yudum su (~18 mL) içinde tam olarak <strong className="text-white">6 × 10²³ su molekülü</strong> vardır. Yani bu akıl almaz sayı, bir yudum suya sığıyor — bu da bize moleküllerin ne kadar küçücük olduğunu gösteriyor.
        </FunFact>
      </ArticleSection>

      {/* Molar kütle */}
      <ArticleSection title="Asıl sihir: gramları taneciklere çeviren köprü — molar kütle" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          “Bir düzine yumurta” ile “bir düzine fil” — ikisi de 12 tanedir, ama ağırlıkları yerle gök kadar farklı. Mol için de aynısı: 1 mol <strong className="text-amber-300">hidrojen</strong> atomu ~1 gram; 1 mol <strong className="text-amber-300">altın</strong> atomu yine 6 × 10²³ tanedir ama ~197 gram. Sayı aynı, kütle farklı — çünkü altın atomu daha ağır.
        </p>
        <div className="mx-auto my-6 max-w-[240px]">
          <ArticleImage
            className="ml-img"
            src="/articles/mol/altin-kulcesi.webp"
            ratio="1600 / 2000"
            alt="Düzensiz yüzeyli, mat sarı renkli doğal altın külçesi; koyu zemin üzerinde duruyor."
            caption="229 gramlık bir altın külçesi (Kaliforniya, 1851). Yaklaşık bir mol altın atomu — yani 6 × 10²³ tane — kabaca bu kadar yer tutuyor."
            credit="Marie-Lan Taÿ Pamart · CC BY 4.0"
          />
        </div>

        <p className="mb-6 leading-relaxed text-slate-300">
          Bir maddenin 1 molünün gram cinsinden kütlesine <strong className="text-amber-300">molar kütle</strong> denir (g/mol). Kimyanın en zarif hilesi: periyodik tabloda bir elementin altında yazan sayı (bağıl atom kütlesi), aynı zamanda o elementin gram cinsinden molar kütlesidir. Bir element seç, gör:
        </p>
        <ArticleImage
          className="ml-img my-6"
          src="/articles/mol/periyodik-tablo.webp"
          ratio="1600 / 1236"
          alt="Renkli periyodik tablo: her kutuda element simgesi, atom numarası ve atom kütlesi yazılı."
          caption="Kutulardaki o ondalıklı sayı — atom kütlesi — aynı zamanda o elementin bir molünün gram cinsinden ağırlığıdır. Köprü tam olarak burada duruyor."
          credit="Wikimedia Commons · kamu malı"
        />

        <PeriodicPicker />
      </ArticleSection>

      {/* Dönüşüm haritası */}
      <ArticleSection kicker="İNTERAKTİF · HARİTA" title="Her şeyi birbirine bağlayan harita" max="max-w-4xl">
        <p className="mb-6 leading-relaxed text-slate-300">
          Mol her zaman <strong className="text-amber-300">merkezdedir</strong>. Kütleden, tanecik sayısından, gaz hacminden ya da derişimden herhangi birine ulaşmak için önce mole çevirir, sonra istediğin yere geçersin. Bir kutuya tıkla, o dönüşümün formülünü gör:
        </p>
        <ConversionMap />
      </ArticleSection>

      {/* Mol hesaplayıcı — CENTERPIECE */}
      <ArticleSection kicker="İNTERAKTİF · HESAPLA" title="Mol hesaplayıcı" max="max-w-4xl">
        <p className="mb-6 leading-relaxed text-slate-300">Konuyu “okumaktan” “denemeye” taşıyalım. Bir madde seç, kütlesini kaydır; mol sayısı, tanecik sayısı ve (gazsa) hacmi anında çıksın:</p>
        <MolCalculator />
        <p className="mt-6 leading-relaxed text-slate-300">
          Kullandığımız üç temel formül şunlar; elimizdeki <strong className="text-amber-300">36 gram su</strong> (M = 18 g/mol) örneğinde: mol = 36 ÷ 18 = <strong className="text-amber-300">2 mol</strong>, molekül = 2 × 6,022×10²³ = <strong className="text-amber-300">1,2044 × 10²⁴</strong>. Yani iki yemek kaşığı suda 1 trilyon kere trilyondan fazla molekül var.
        </p>
        <Formula>{`mol sayısı  (n) = kütle (m) ÷ molar kütle (M)
tanecik    (N) = mol (n) × Avogadro sayısı (Nₐ)
gaz hacmi (V)  = mol (n) × 22,4 L        (Normal Koşullar)`}</Formula>
      </ArticleSection>

      {/* Diğer terimler */}
      <ArticleSection title="Bilmen gereken diğer terimler" max="max-w-4xl">
        <CardGrid items={terms} cols={2} />
      </ArticleSection>

      {/* Stokiyometri */}
      <ArticleSection title="Peki bütün bunlar neden önemli? — Stokiyometri" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Bir kek tarifini düşün: <em className="not-italic text-amber-300">2 su bardağı un + 1 yumurta → 12 kurabiye</em>. Oranlar sabittir; iki katı istersen her şeyi iki katına çıkarırsın. Kimyasal tepkimeler de birer tariftir — ve o tarifin ölçüsü moldür:
        </p>
        <Formula>{`2 H₂  +  O₂  →  2 H₂O
2 mol    1 mol    2 mol   (oran: 2 : 1 : 2)`}</Formula>
        <p className="mt-4 leading-relaxed text-slate-300">
          Bu 2:1:2 oranı doğrudan denklemden okunur. Mol sayesinde bir kimyager “şu kadar yakıt için ne kadar oksijen gerekir, sonunda ne kadar ürün çıkar” sorularını gramla, litreyle kesin hesaplayabilir. Reçetelerdeki ölçü “bardak” ise, tepkimelerdekiler “mol”dür. Bu tarif matematiğine <strong className="text-amber-300">stokiyometri</strong> denir ve kimyanın hemen bütün nicel hesapları bunun üzerine kuruludur.
        </p>
      </ArticleSection>

      {/* Tarih */}
      <HorizontalTimeline kicker="AVOGADRO'NUN HAZİN HİKÂYESİ · 1811 → 2019" heading="Bir hipotezden bir sabite" items={timeline} />

      {/* Atomları nasıl saydık */}
      <ArticleSection title="Peki bu atomları gerçekten nasıl “saydık”?" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Kimse atomları tek tek saymadığına göre, 6,022 × 10²³ sayısını nereden biliyoruz? Cevap, bir asırlık dâhice deneylerde. <strong className="text-amber-300">Jean Perrin</strong> (~1908), suda asılı minik parçacıkların rastgele titreşimini (<strong className="text-amber-300">Brown hareketi</strong>) izleyip Einstein'ın kuramını kullanarak Avogadro sayısını tahmin etti. Birbirinden bağımsız yöntemlerin hepsinin aynı sayıya çıkması, o güne dek şüpheyle bakılan <Link href="/articles/cift-yarik" className="article-ilink">atomların gerçekten var olduğu</Link> fikrini kanıtladı; Perrin 1926'da Nobel aldı.
        </p>
        <div className="ml-img-pair my-6">
          <ArticleImage
            className="ml-img"
            src="/articles/mol/perrin-portre.webp"
            ratio="816 / 1074"
            alt="Bıyıklı, takım elbiseli orta yaşlı bir adamın siyah beyaz stüdyo portresi."
            caption="Jean Perrin: atomların gerçekten var olduğunu deneyle gösterdi ve 1926'da Nobel aldı. Sayıya “Avogadro sayısı” adını veren de odur."
            credit="Kamu malı"
          />
          <ArticleImage
            className="ml-img"
            src="/articles/mol/perrin-gamboge-deneyi.webp"
            ratio="926 / 760"
            alt="Bilimsel yayından bir levha: mikroskop altında görülen küçük taneciklerin dağılımını gösteren şemalar ve noktalı çizimler."
            caption="Perrin'in ölçümü: suda asılı gamboge taneciklerinin yükseklikle nasıl seyreldiğini mikroskopla saydı. Avogadro sayısını veren asıl deney bu — atomlar tek tek sayılmadı, istatistikleri okundu."
            credit="Kamu malı"
          />
        </div>

        <FunFact icon="🔮" title="Dünyanın en yuvarlak cismi">
          Günümüzde bu sayıyı akıl almaz hassasiyetle ölçmek için saf silikon-28 atomlarından <strong className="text-white">kusursuza yakın bir küre</strong> üretiliyor; bilim insanları kristaldeki atom dizilişini ve hacmi ölçüp içindeki atomları adeta tek tek sayıyor. Bu küreler o kadar yuvarlaktır ki, Dünya büyüklüğüne getirilseydi en yüksek tepesiyle en derin çukuru arasındaki fark yalnızca birkaç metre olurdu.
        </FunFact>

        <div className="ml-img-pair mt-6">
          <ArticleImage
            className="ml-img"
            src="/articles/mol/silikon-28-kuresi.webp"
            ratio="1600 / 1245"
            alt="Eldivenli eller, aynadan yapılmış gibi parlayan kusursuz bir metal küreyi tutuyor; kürede odanın yansıması görünüyor."
            caption="Silikon-28 küresi: yüzde 99,9995 saflıkta, tam 1 kilogram. İçindeki atomlar kristal dizilişi ve hacim ölçülerek adeta tek tek sayılıyor — Perrin'in yaptığı işin bugünkü hâli."
            credit="Wikimedia Commons · CC BY 3.0"
          />
          <ArticleImage
            className="ml-img"
            src="/articles/mol/kilogram-prototipi.webp"
            ratio="1217 / 1512"
            alt="Cam fanus altında duran küçük, parlak metal silindir."
            caption="Uluslararası kilogram prototipi: 130 yıl boyunca bir kilogram, Paris'teki bu metal silindirin ta kendisiydi. 2019'da hem kilogram hem mol, cisimlerden koparılıp sabit sayılara bağlandı."
            credit="Wikimedia Commons · CC BY-SA 3.0 IGO"
          />
        </div>
      </ArticleSection>

      {/* Günlük hayat */}
      <ArticleSection title="Mol gündelik hayatta nerede karşımıza çıkıyor?" max="max-w-4xl">
        <p className="mb-6 leading-relaxed text-slate-300">Mol bir laboratuvar süsü değil; her gün hayatını kurtaran ve şekillendiren hesapların dilidir:</p>
        <CardGrid items={everyday} cols={3} />
      </ArticleSection>

      {/* Kafa karıştıran noktalar */}
      <ArticleSection title="Kafa karıştıran noktalar" max="max-w-3xl">
        <Caution title="Sık yapılan hatalar">
          <ul className="m-0 space-y-2 pl-1">
            <li>• <strong className="text-white">Mol bir ağırlık ya da hacim değildir; bir sayıdır.</strong> “2 mol” = “2 tane”nin dev ölçekli hâli.</li>
            <li>• <strong className="text-white">1 mol her maddede aynı gramı vermez.</strong> 1 mol hidrojen ~1 g, 1 mol altın ~197 g. Sayı aynı, kütle farklı.</li>
            <li>• <strong className="text-white">“22,4 litre” her yerde geçmez.</strong> Yalnızca Normal Koşullar'da (0°C, 1 atm) ve yalnızca gazlar için.</li>
            <li>• <strong className="text-white">Mol ile molekül aynı şey değildir.</strong> Molekül tek parçacık; mol 6,022 × 10²³ parçacıklık yığın. Üstelik mol atom, iyon, hatta elektron da sayabilir.</li>
          </ul>
        </Caution>
      </ArticleSection>

      {/* Şaşırtıcı gerçekler + Mol Günü */}
      <ArticleSection title="Şaşırtıcı gerçekler" max="max-w-3xl">
        <FunFact icon="🌊" title="Bir bardak su, bütün okyanuslar">
          Bir bardak suyu okyanusa döküp dünyanın tüm denizlerine karıştırdığını düşün. Sonra rastgele bir bardak su alsan, <strong className="text-white">o bardakta ilk döktüğün sudan birkaç molekül bulunma ihtimali çok yüksektir</strong> — çünkü tek bir bardak suda, tüm okyanuslara sığacak bardak sayısından çok daha fazla molekül var.
        </FunFact>
        <FunFact icon="🎂" title="Mol Günü: 23 Ekim, 6:02–6:02">
          Kimya meraklıları her yıl <strong className="text-white">23 Ekim'de, sabah 6:02 ile akşam 6:02 arasında</strong> “Mol Günü”nü kutlar. Tarih tesadüf değil: 6:02 · 10/23 → <span className="font-mono text-amber-300">6,02 × 10²³</span>. Karbon-12'nin tam 12 gramında da tam 1 mol atom bulunur (2019 öncesi molün tanımı buydu).
        </FunFact>
      </ArticleSection>

      {/* SSS */}
      <ArticleSection kicker="SSS" title="Sıkça sorulan sorular" max="max-w-3xl">
        <div className="space-y-2">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-slate-100 [&::-webkit-details-marker]:hidden">
                <span>{f.q}</span><span className="text-amber-300 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{f.a}</p>
            </details>
          ))}
        </div>
      </ArticleSection>

      {/* Quiz */}
      <ArticleSection kicker="MİNİ TEST" title="Ne kadar anladın?">
        <ArticleQuiz questions={quizQs} />
      </ArticleSection>

      {/* Özet */}
      <ArticleSection title="Özet" max="max-w-4xl">
        <p className="mb-6 leading-relaxed text-slate-300">
          Mol, göremediğimiz ve tek tek sayamadığımız atom dünyası ile tartıp ölçebildiğimiz gündelik dünya arasındaki <strong className="text-amber-300">çevirmendir</strong>. “12 gram karbon” dediğinde aslında 6 × 10²³ atomdan bahsediyorsundur — ama bunu bir terazide tartabilirsin. Kavraman gereken tek büyük fikir bu; geri kalan her şey bu köprünün üzerinde yürür.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead><tr className="border-b border-white/15 text-left text-slate-400"><th className="py-2 pr-4 font-semibold">Kavram</th><th className="py-2 font-semibold">Bir cümlede</th></tr></thead>
            <tbody className="text-slate-300">
              {[['Mol', '6,022 × 10²³ tanelik bir sayma birimi'], ['Avogadro sayısı', 'Bir moldeki tanecik sayısı'], ['Bağıl atom kütlesi', "Periyodik tablodaki sayı; karbon-12'ye kıyasla"], ['Molar kütle', '1 molün gram cinsinden kütlesi (g/mol)'], ['Molekül/formül kütlesi', 'Bir moleküldeki atom kütlelerinin toplamı'], ['Molar hacim', "Bir mol ideal gazın hacmi (N.K.'da 22,4 L)"], ['Derişim/Molarite', '1 litre çözeltideki mol miktarı (mol/L)'], ['Stokiyometri', 'Tepkimelerdeki mol oranı matematiği']].map((r) => (
                <tr key={r[0]} className="border-b border-white/5"><td className="py-2 pr-4 font-bold text-white">{r[0]}</td><td className="py-2">{r[1]}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </ArticleSection>

      <div className="relative z-10">
        <ArticleBibliography items={refs} accent={ACCENT} />
      </div>

      <ArticleFooter tagline="Mol: göremediğin atom dünyasıyla tarttığın dünya arasındaki çevirmen. ⚗️" />
    </ArticleShell>
  );
}
