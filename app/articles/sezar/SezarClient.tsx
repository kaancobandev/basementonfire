'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection, CardGrid, HorizontalTimeline, ArticleQuiz, ArticleBibliography, ArticleFooter,
} from '@/app/components/article/ArticleBlocks';
import ArticleImage from '@/app/components/article/ArticleImage';
import { ACCENT, BG, GOLD, InView, WidgetSkeleton, SourceNote } from './ui';
import {
  RansomSlider, TriumvirateBalance, GaulTollMap, RubiconDecision, RhineBridge, PharsalusLine, NameTree,
} from './widgets';
import { AlesiaPoster, WoundsPoster } from './posters';
import {
  CLEMENTIA, REFORMS, PLANS, PLANS_SOURCE, LUPERCALIA, OMENS, IDES,
  POMPEIUS_END, PHARSALUS, AFTERMATH, SUETONIUS_THREE_YEARS, timeline, quizQs,
} from './data';
import { refs } from './refs';

// Ağır modüller: görünür alana girince indirilir (InView + dynamic ssr:false).
const AlesiaSiege = dynamic(() => import('./sim-alesia'), { ssr: false, loading: () => <WidgetSkeleton height={480} /> });
const WoundsDiagram = dynamic(() => import('./sim-wounds'), { ssr: false, loading: () => <WidgetSkeleton height={520} /> });

// Kan + Roma altını shader paleti (0..1 normalize).
const HERO_COLORS: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]] = [
  [0.05, 0.02, 0.03], [0.42, 0.04, 0.14], [0.88, 0.11, 0.28], [0.85, 0.64, 0.25],
];

export default function SezarClient() {
  return (
    <ArticleShell accent={ACCENT} bg={BG} title="Julius Caesar">
      <style>{`
        @keyframes sezar-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes sezar-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        /* ArticleImage'ın soğuk slate varsayılanları bu kan+altın paletinde
           yamalı duruyor → altına bağla (rome'un ro-body'de yaptığının aynısı,
           burada sınıfla: sarmalayıcı div yerleşimi bozmasın). */
        .sezar-img {
          --ai-caption: #cbd5e1;
          --ai-credit: #9a8558;
          --ai-border: rgba(217,164,65,0.22);
          --ai-fill: rgba(217,164,65,0.05);
          --ai-mark: rgba(217,164,65,0.28);
        }
      `}</style>

      <ArticleHero
        title="Julius Caesar"
        fullTitle="Julius Caesar — Kendisini Öldürenleri Affeden Adam"
        eyebrow="KENDİSİNİ ÖLDÜRENLERİ AFFEDEN ADAM · İNTERAKTİF DOSYA"
        gradientText="Caesar"
        colors={HERO_COLORS}
        object3d="coin"
        object3dSrc="/articles/sezar/sikke-caesar.webp"
        subtitle={<>Onu en çok seven adamlardan biri öldürdü. Ve onu öldürenler, kurtarmaya çalıştıkları şeyi kendi elleriyle gömdüler.</>}
      />

      <ArticleLede
        points={[
          'Caesar’ı öldüren şey, en büyük erdemiydi: herkesi affetmesi',
          'Bıçakları tutan ellerin çoğu, onun affettiği ya da terfi ettirdiği ellerdi',
          'Bu anlatının omurgası dört taraflı antik kaynaktır; sayılar tartışmalı, çatlaklar gizlenmedi',
        ]}
      >
        Gaius Julius Caesar (MÖ 100–44), Roma Cumhuriyeti’ni bitiren ve adı iki bin yıl boyunca “hükmeden” anlamına gelen komutan ve diktatördür. Bu, onun nasıl yükseldiğinin değil, onu <strong>neyin</strong> öldürdüğünün hikâyesi — ve cevabın, tahmin ettiğinizden çok daha rahatsız edici olduğunun.
      </ArticleLede>

      {/* ══════════ PERDE 1 ══════════ */}
      <ArticleSection kicker="PERDE 1 · ÖLMESİ GEREKEN ÇOCUK" title="Fidyesini az bulan tutsak">
        <p className="leading-relaxed text-slate-300">
          MÖ 75 civarı. Ege’de, Farmakusa açıklarında bir grup Kilikyalı korsan bir gemi bastı. İçinden 25 yaşında bir Romalı çıktı. Korsanlar fidyeyi konuştu: yirmi talent — bir adamın ömrü boyunca göremeyeceği kadar gümüş. Genç Romalı güldü. Yirmi mi? Kendisinin kim olduğunu biliyorlar mıydı? Elli isteyeceklerdi. Elliden aşağısı hakaretti.
        </p>
        <p className="mt-4 leading-relaxed text-slate-400">
          Sonraki 38 gün, esaret tarihinin en tuhaf günleridir. Genç adam korsanların arasında şiir yazdı, yazdıklarını onlara zorla okudu, beğenmeyenlere “cahil barbar” dedi, uyumak istediğinde susmalarını emretti — ve sustular. Ve neredeyse her gün gülümseyerek aynı şeyi söyledi: serbest kaldığımda geri gelip hepinizi çarmıha gereceğim. Korsanlar kahkahayı bastı. Ne tatlı çocuk.
        </p>

        <ArticleImage
          className="sezar-img mx-auto max-w-xs"
          src="/articles/sezar/caesar-tusculum.webp"
          ratio="1600 / 2466"
          priority
          alt="Yaşlı bir adamın gri mermer büstü, dörtte üç profilden: geniş ve çizgili alın, çökük yanaklar, ince dudaklar, geriye taranmış seyrek saç. Yüz idealize edilmemiş, yorgun."
          caption="Tusculum portresi. Caesar’ın sağlığında yapılmış bir orijinali kopyaladığı düşünülen tek büst — ama “kesin onun yüzü” diyemiyoruz: uzmanlar “olabilir” diyor, elimizdeki de bronz bir aslın mermer kopyası. İki bin yıl sonra, en çok konuşulan adamın suratından bile emin değiliz."
          credit="Following Hadrian · CC BY-SA 2.0"
        />

        <div className="mt-8">
          <RansomSlider />
        </div>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 1.2" title="Sulla’ya “hayır” diyen çocuk">
        <p className="leading-relaxed text-slate-300">
          Geriye saralım. Caesar, MÖ 100 civarında doğdu. Ailesi — gens Julia — asilzadeydi, hatta tanrıça Venüs’ün soyundan geldiğini iddia ediyordu. Kâğıt üstünde muhteşem; pratikte parasız, güçsüz, yakın kuşaklarında konsül çıkaramamış orta hâlli bir hanedan. On altısındayken babası bir sabah ayakkabısını giyerken düştü ve öldü. Caesar ailenin reisi oldu.
        </p>
        <p className="mt-4 leading-relaxed text-slate-300">
          Ve tam o sıralarda Roma, Sulla adında bir adamın eline geçti. Sulla’nın “proscriptio” denen bir icadı vardı: forumda asılan bir liste. Adınız listedeyse yasal olarak öldürülebilirdiniz, malınız da sizi öldürene kalırdı. Bürokratikleştirilmiş cinayet. Caesar’ın halası Marius’un karısıydı; kendi karısı Cornelia ise Sulla’nın bir başka baş düşmanı Cinna’nın kızıydı. Yani Caesar yanlış ailenin içinde, yanlış kadınla evli, yanlış zamanda duruyordu.
        </p>
        <p className="mt-4 leading-relaxed text-slate-300">
          Sulla ona basit bir emir gönderdi: karını boşa. Roma’nın en güçlü adamı, on sekiz yaşında bir çocuğa. Bunu yapmamak intihardı; kabul eden herkes hayatta kaldı. Caesar reddetti — rahipliğini, karısının drahomasını, mirasını kaybetti ve kaçtı. Sabin dağlarında, sıtma içinde, her gece saklandığı yeri değiştirerek dolaştı; Sulla’nın adamlarına yakalandı, rüşvetle kurtuldu. Sonunda Vesta rahibeleri ve akrabaları araya girdi. Sulla homurdanarak affetti ve — rivayete göre — şunu söyledi:
        </p>
        <blockquote className="mt-5 border-l-2 pl-4 text-lg italic leading-relaxed text-slate-200" style={{ borderColor: ACCENT }}>
          “İstediğinizi alın. Ama bilin ki bu kadar uğruna savaştığınız çocuğun içinde bir sürü Marius var.”
        </blockquote>
        <p className="mt-5 leading-relaxed text-slate-400">
          Sulla haklıydı. Ve tarih boyunca hiç kimse kendi ölüm fermanını bu kadar isabetli yazmamıştır.
        </p>
      </ArticleSection>

      {/* ══════════ PERDE 2 ══════════ */}
      <ArticleSection kicker="PERDE 2 · GEÇ KALMIŞ ADAM" title="Bir heykelin önünde ağlamak">
        <p className="leading-relaxed text-slate-300">
          İskender’in bir portresinin karşısında Caesar’ın gözyaşlarına boğulduğu meşhur sahneyi çoğumuz biliriz: İskender onun yaşındayken çoktan dünyanın yarısını fethetmişti, o ise hâlâ kayda değer hiçbir şey yapmamıştı. Bu sahne, Caesar’ın bir hırs tarafından değil, <strong>bir saat</strong> tarafından yönetildiğini anlatır. Geç kalmıştı ve bunu biliyordu; sonraki yirmi yılda yaptığı hiçbir şeyi, o aceleyi hesaba katmadan anlayamazsınız.
        </p>
        <SourceNote>
          Ama sahnenin ayrıntıları kaynaklara göre değişir. Suetonius bunu Gades’teki Herkül tapınağında, bir İskender <em>heykeli</em> önünde ve Caesar kvestörken (~31 yaşında) anlatır — üstelik ağlamaz, derin bir iç çeker. Plutarkhos ise İskender hakkında bir <em>kitap</em> okurken ve yıllar sonra (~39 yaşında) ağladığını yazar; onun anlatımında Gades de heykel de yoktur. “39 yaşında hiçbir şey değildi” ifadesi yalnızca Plutarkhos’un yerleştirmesinde doğrudur. İki bin yıldır tek bir sahne diye andığımız şey, aslında iki farklı hikâyedir.
        </SourceNote>
        <p className="mt-6 leading-relaxed text-slate-400">
          Kesin olan şu: bu adam borç içindeydi. Kamu görevine başlamadan önce 1.300 talent — bugünkü parayla milyonlarca dolar — borcu olduğu söylenir. Roma’nın en zengin adamı Crassus onun 830 talentine kefil olmuştu, çünkü Caesar’ın borcu o kadar büyüktü ki artık Crassus’un problemiydi.
        </p>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 2.2" title="Ya Pontifex ya hiç">
        <p className="leading-relaxed text-slate-300">
          MÖ 63. Roma’nın en yüksek dinî makamı — Pontifex Maximus, ömür boyu — boşaldı. Caesar aday oldu. Rakipleri Roma’nın en kıdemli, en saygın devlet adamlarıydı; Caesar 37 yaşındaydı ve zaten batmıştı. Yine de seçimi satın almaya çalıştı — elinde olmayan parayla. Kaybederse sadece iflas etmeyecek, Roma’yı terk etmek zorunda kalacaktı. Seçim sabahı annesi Aurelia onu kapıya kadar geçirdi. Caesar döndü:
        </p>
        <blockquote className="mt-5 border-l-2 pl-4 text-lg italic leading-relaxed text-slate-200" style={{ borderColor: GOLD }}>
          “Anne, bugün beni ya pontifex maximus olarak görürsün ya da sürgünde.”
        </blockquote>
        <p className="mt-5 leading-relaxed text-slate-400">Kazandı.</p>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 2.3" title="Üç adamın anlaşması">
        <p className="leading-relaxed text-slate-300">
          MÖ 60’ta Caesar, Roma tarihinin en pahalı el sıkışmasını yaptı. Bir masaya üç adam oturdu; üçünün de ihtiyacı olan şeye yalnızca biri sahipti. Anlaşma basitti: üçü birlikte Cumhuriyet’i yönetecekti. Senato’nun haberi bile olmadı.
        </p>
        <ArticleImage
          className="sezar-img"
          src="/articles/sezar/pompeius-bust.webp"
          ratio="1600 / 1066"
          alt="Orta yaşlı bir adamın beyaz mermer büstü: yuvarlak dolgun yüz, alnına düşen kısa dalgalı kâkül, küçük gözler, hafifçe yukarı bakıyor."
          caption="Pompeius Magnus: Caesar’ın ortağı, damadı ve sonunda düşmanı. Bu mermer onun ölümünden yaklaşık yüz yıl sonra, Claudius döneminde yontulmuş bir kopya — yani Tusculum büstünün aksine çağdaş bir portre değil. İkisini yan yana koyarken bunu akılda tutun."
          credit="Richard Mortel · CC BY 2.0"
        />

        <div className="mt-8">
          <TriumvirateBalance />
        </div>
      </ArticleSection>

      {/* ══════════ PERDE 3 ══════════ */}
      <ArticleSection kicker="PERDE 3 · GALYA" title="Dehanın ve vahşetin aynı adam olduğu yer">
        <p className="leading-relaxed text-slate-300">
          Konsüllüğünden sonra Caesar, valilik olarak Galya’yı aldı — bugünkü Fransa, Belçika, İsviçre’nin bir kısmı. Sekiz yıl kaldı. Geri döndüğünde Galya diye bir yer kalmamıştı; Roma vardı. Ve burada gerçekten modern olan şey şu: Caesar bu savaşın raporunu <strong>kendisi yazdı</strong>, üçüncü tekil şahısla — “Caesar şunu emretti”, “Caesar durumu değerlendirdi”. Bu numara bir katliamı bir rapora dönüştürür; tarafsız görünür, değildir. Adam kendi efsanesini, yaşarken, gerçek zamanlı olarak inşa etti. İki bin yıl sonra hâlâ onun versiyonunu okuyoruz.
        </p>
        <div className="mt-8">
          <GaulTollMap />
        </div>
        <p className="mt-8 leading-relaxed text-slate-400">
          Bu, Roma’nın yükselişindeki en karanlık bölümlerden biridir — ve Cumhuriyet’in kendi generalini denetleyemez hâle geldiğinin ilk açık kanıtı. <Link href="/articles/rome" className="article-ilink">Roma’nın bütün hikâyesini</Link> okursanız, bu sekiz yılın nasıl bir dönüm noktası olduğunu görürsünüz.
        </p>

        <ArticleImage
          className="sezar-img"
          src="/articles/sezar/vercingetorix-teslim.webp"
          ratio="1600 / 1066"
          alt="Yağlı boya tablo: uzun saçlı, bıyıklı bir savaşçı beyaz atın üstünde, oturan Romalı komutanın önünde silahlarını yere fırlatıyor; arkada Roma askerleri sıralanmış."
          caption="Vercingetorix silahlarını Caesar’ın ayaklarına bırakıyor — Lionel Royer, 1899. Bu sahne bir belge değil, 19. yüzyıl Fransız millî mitolojisi: attan (o çağda Galya’da bulunmayan bir Percheron) kalkanın biçimine kadar ayrıntılar yanlış, ve Caesar kendi anlatısında bu teatral jestten hiç söz etmez."
          credit="Lionel Royer · kamu malı"
        />
      </ArticleSection>

      <ArticleSection kicker="SAHNE 3.2" title="Ren Nehri: gereksiz olduğu için etkileyici">
        <p className="leading-relaxed text-slate-300">
          MÖ 55’te Germen kabileleri Ren’i geçip Galya’yı taciz ediyordu. Caesar bir mesaj göndermek istedi. Tekneyle geçebilirdi — bir günde olurdu. Bunun yerine akıntılı, derin bir nehrin üzerine bir köprü inşa etti; on günde bitti. Bu bir askerî hamle değil, bir gösteriydi. Ve işe yaradı.
        </p>
        <div className="mt-8">
          <RhineBridge />
        </div>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 3.3 · YILDIZ MODÜL" title="Alesia: imkânsız olan">
        <p className="leading-relaxed text-slate-300">
          MÖ 52. Galyalılar sonunda birleşti; başlarında Vercingetorix vardı — genç, zeki ve Caesar’ın gerçekten çekindiği tek Galyalı. Vercingetorix, Alesia adlı tepe kalesine 80.000 askerle çekildi. Caesar kaleyi kuşattı ve çevresine bir sur ördü. Sonra bir haber aldı: bütün Galya, onu kurtarmak için toplanıyordu. Normal bir general geri çekilirdi.
        </p>
        <div className="mt-8">
          <InView poster={<AlesiaPoster />} minHeight={480}>
            <AlesiaSiege />
          </InView>
        </div>
        <p className="mt-8 leading-relaxed text-slate-400">
          Ertesi gün Vercingetorix en iyi zırhını giyip kaleden çıktı, silahlarını Caesar’ın ayaklarına bıraktı ve sessizce oturdu. Caesar onu zincirledi ve altı yıl bir hücrede canlı tuttu — öldürmek için değil, Roma’daki zafer alayında sokaklarda sürüklemek için. Caesar merhametli bir adam olarak ünlenecekti. Bunu okurken hatırlayın.
        </p>
      </ArticleSection>

      {/* ══════════ PERDE 4 ══════════ */}
      <ArticleSection kicker="PERDE 4 · ZAR" title="İki ip kopuyor">
        <p className="leading-relaxed text-slate-300">
          Caesar Galya’da savaşırken, dünyayı bir arada tutan iki ip, on iki ay içinde koptu. İkinci sahne 2.3’teki diyagram geri döner — ve bu sefer parçalanır.
        </p>
        <div className="mt-8">
          <TriumvirateBalance collapse />
        </div>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 4.2 · KARAR NOKTASI" title="Rubicon">
        <p className="leading-relaxed text-slate-300">
          MÖ 49, Ocak. Senato Caesar’a bir ültimatom gönderdi: ordunu dağıt ve tek başına Roma’ya dön. Önündeki matematik acımasızdı. Rubicon, İtalya’nın kuzeyinde önemsiz bir dereydi; üzerinden atlayabilirdiniz. Ama yasal olarak bir çizgiydi: bir general ordusuyla o dereyi geçemezdi. Geçerse artık general değil, düşmandı.
        </p>
        <ArticleImage
          className="sezar-img"
          src="/articles/sezar/rubicon-deresi.webp"
          ratio="1600 / 1200"
          alt="Sığ, durgun bir dere; iki yakası yeşil otlar ve ağaçlarla kaplı, arkada alçak bir köprü ve yerleşim görünüyor."
          caption="Savignano sul Rubicone’de bugün “Rubicone” adını taşıyan dere. “Caesar’ın geçtiği dere” demiyoruz — hangisi olduğu hâlâ tartışmalı ve bu ad buraya 1932’de bir kararnameyle verildi. Makalenin tezine yakışan bir ayrıntı: sahnenin adı bile sonradan konmuş."
          credit="Sergio Bellavista · CC BY-SA 4.0"
        />

        <div className="mt-8">
          <RubiconDecision />
        </div>
        <p className="mt-8 leading-relaxed text-slate-400">
          Latincesini biliyorsunuz: <em>alea iacta est</em>. Ama Caesar muhtemelen Yunanca söyledi ve muhtemelen <Link href="/articles/greece" className="article-ilink">Antik Yunan</Link>’ın komedya şairi Menandros’tan alıntıydı: “zar atılsın.” Adam dünyayı ateşe verirken bile edebiyat referansı yapıyordu. Ve şunu net söyleyelim: karşı taraf da aynı adamdı. Pompeius da tam olarak aynı sebeple savaştı. Cumhuriyet, iki adamın da geri adım atamayacağı bir sistem üretmişti; sistem çoktan ölüydü, Caesar sadece cesedin nerede olduğunu gösterdi.
        </p>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 4.3" title="Pharsalus: yüzlerine">
        <p className="leading-relaxed text-slate-300">
          Caesar İtalya’yı 60 günde, neredeyse kan dökmeden aldı. Pompeius Yunanistan’a kaçtı. İspanya’ya, Pompeius’un ordusunun üzerine yürürken Caesar’ın cümlesi şuydu: “{PHARSALUS.quote}” MÖ 48, Pharsalus. Pompeius’un adamları Caesar’ınkinin iki katıydı ve süvarisi çok daha güçlüydü. Caesar o gün bir orduyu değil, bir kuşağın kibrini yendi.
        </p>
        <div className="mt-8">
          <PharsalusLine />
        </div>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 4.4" title="Bir sepetin içindeki baş">
        <p className="leading-relaxed text-slate-300">
          Pompeius Mısır’a kaçtı. Genç kral XIII. Ptolemaios’un danışmanları basit bir hesap yaptı: kazanan Caesar’dı, Pompeius’u ona hediye ederlerse memnun olurdu. Pompeius sahile çıkarken, karısı gemiden izlerken, kendi eski subaylarından biri onu bıçakladı. {POMPEIUS_END.scene}
        </p>
        <p className="mt-4 leading-relaxed text-slate-300">
          Günler sonra Caesar İskenderiye’ye vardı. Mısırlılar hediyelerini sundular: bir sepetin içinde Pompeius’un başı ve mühür yüzüğü. {POMPEIUS_END.caesarReaction} Numara mıydı, gerçek miydi — kimse bilmiyor, ve bu belirsizlik Caesar’ı anlamanın anahtarı. İkisi aynı anda doğru olabilirdi: adam yirmi yıl damadıydı, ortağıydı, arkadaşıydı; sonra düşmanıydı; ve Caesar onu <em>kendisi</em> yenmek istiyordu, bir grup saray danışmanı değil.
        </p>
      </ArticleSection>

      {/* ══════════ PERDE 5 ══════════ */}
      <ArticleSection kicker="PERDE 5 · HERKESİ AFFEDEN TANRI" title="Clementia: merhamet neden bir silahtır">
        <p className="leading-relaxed text-slate-300">
          İç savaşı kazandıktan sonra Caesar herkesi şaşırtan bir şey yaptı. Sulla kazandığında listeler asmıştı; Roma’da kazanan taraf kaybedenleri öldürürdü, bu bir kural gibiydi. {CLEMENTIA.policy}
        </p>
        <div className="mt-6">
          <CardGrid cols={3} items={CLEMENTIA.pardoned.map((p) => ({ title: p.name, text: p.how }))} />
        </div>
        <p className="mt-6 leading-relaxed text-slate-300">
          Bu, insanlık tarihinin en cömert davranışlarından biri gibi görünüyor. Ve bir tuzaktı. {CLEMENTIA.trap} Bir cumhuriyette bu felakettir: cumhuriyetin bütün mantığı, hiç kimsenin bir başkasının hayatına sahip olmamasıydı. Caesar herkesi affederek Roma’nın tüm seçkinlerini kendisine borçlu hâle getirdi — ve borçlu olmak, eşit olmamaktır.
        </p>
        <SourceNote>{CLEMENTIA.cicero.warning}</SourceNote>
        <p className="mt-6 leading-relaxed text-slate-200">
          Ve şimdi asıl mesele: {CLEMENTIA.dignitasDeath}
        </p>
        <p className="mt-4 leading-relaxed text-slate-400">
          Caesar, herkese kendi kâbusunu yaşattı ve buna nezaket dedi.
        </p>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 5.4" title="Aslında ne inşa ediyordu">
        <p className="leading-relaxed text-slate-300">
          Caesar’ın diktatörlüğü hakkında az konuşulan gerçek: iyi bir yöneticiydi. Sadece dört yılda —
        </p>
        <div className="mt-6">
          <CardGrid cols={2} items={REFORMS.map((r) => ({ icon: r.icon, title: r.title, text: r.text }))} />
        </div>
        <p className="mt-6 leading-relaxed text-slate-300">
          Gazileri yerleştirirken Roma’nın bir zamanlar yerle bir ettiği bir şehri de yeniden kurdu: <Link href="/articles/carthage" className="article-ilink">Kartaca</Link>. Ve planları hayatından çok daha uzundu:
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {PLANS.map((p) => (
            <li key={p} className="flex gap-2 text-sm leading-relaxed text-slate-400"><span style={{ color: GOLD }}>◆</span><span>{p}</span></li>
          ))}
        </ul>
        <SourceNote>{PLANS_SOURCE}</SourceNote>
        <p className="mt-6 leading-relaxed text-slate-300">
          Adam yüzyıl ölçeğinde düşünüyordu. Etrafındaki herkes seçim döngüsü ölçeğinde düşünüyordu. Sorun tam olarak buydu.
        </p>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 5.5" title="Taç">
        <p className="leading-relaxed text-slate-300">
          MÖ 44, Şubat. Senato Caesar’a yeni bir unvan verdi: <strong>{LUPERCALIA.title}</strong> — ömür boyu diktatör. {LUPERCALIA.titleNote}
        </p>

        <ArticleImage
          className="sezar-img"
          src="/articles/sezar/dictator-perpetuo-sikke.webp"
          ratio="1600 / 800"
          alt="Gümüş bir Roma sikkesinin iki yüzü yan yana: solda defne çelenkli yaşlı bir profil ve çevresinde harfler, sağda birbirine dolanmış asa, balta ve el figürleri."
          caption="Unvan sikkeye vuruldu: CAESAR DICT PERPETVO. Roma’da o güne dek yaşayan hiç kimsenin yüzü paraya basılmamıştı; tanrılar ve ölüler basılırdı. Senato için asıl mesele tacın kendisi değil, herkesin cebinde dolaşan bu yüzdü."
          credit="Andrew McCabe · CC BY 2.0"
        />
        <p className="mt-4 leading-relaxed text-slate-300">
          15 Şubat, Lupercalia bayramı. Forum tıklım tıklım. Marcus Antonius elinde bir diadem — kraliyet tacı — ile Caesar’a yaklaştı ve sundu. Caesar reddetti; kalabalık coştu. Kesin olan bu kadar. Ama gerisinde, kaynaklar birbirini hiç tutmuyor:
        </p>
        <div className="mt-6 space-y-2">
          {LUPERCALIA.sources.map((s) => (
            <div key={s.who} className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
              <div className="mb-1 flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm font-bold text-white">{s.who}</span>
                <span className="text-[0.68rem] text-slate-500">{s.when}</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">{s.says}</p>
            </div>
          ))}
        </div>
        <SourceNote>{LUPERCALIA.threeTimesMyth}</SourceNote>
        <p className="mt-6 leading-relaxed text-slate-300">
          {LUPERCALIA.fasti} O gün forumda duran her senatör aynı sonucu çıkardı: bu adam tacı <em>istiyor</em>. Ve bir dahaki sefere sormayacak. Bir ay kalmıştı.
        </p>
      </ArticleSection>

      {/* ══════════ PERDE 6 ══════════ */}
      <ArticleSection kicker="PERDE 6 · MART’IN ORTASI" title="Bütün uyarılar">
        <p className="leading-relaxed text-slate-300">
          Kâhin Spurinna, Caesar’a bir uyarı vermişti: Mart’ın İdus’undan (ayın 15’i) sakın. O sabah her şey onu durdurmaya çalıştı — ve her uyarı teker teker etkisiz kaldı.
        </p>
        <div className="mt-6">
          <CardGrid cols={2} items={OMENS.map((o) => ({ icon: o.icon, title: o.title, text: o.text }))} />
        </div>
        <p className="mt-6 leading-relaxed text-slate-400">
          Rulo, Caesar’ın elinde, açılmamış hâlde kaldı. Öldüğünde hâlâ elindeydi.
        </p>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 6.2" title="Yirmi üç">
        <p className="leading-relaxed text-slate-300">
          {IDES.place}
        </p>
        <p className="mt-4 leading-relaxed text-slate-300">
          {IDES.signal} {IDES.firstBlow} Sonra hepsi birden geldi. {IDES.herd}
        </p>
        <div className="mt-8">
          <InView poster={<WoundsPoster />} minHeight={520}>
            <WoundsDiagram />
          </InView>
        </div>
        <p className="mt-8 leading-relaxed text-slate-300">
          {IDES.autopsy} Bu detay çok şey anlatıyor: bu bir suikast değil, bir <strong>sürü davranışı</strong>ydı. Herkesin bıçağını sokması gerekiyordu, çünkü hepsi ortak olmalıydı, çünkü hiçbiri tek başına sorumlu olmak istemiyordu.
        </p>
        <p className="mt-4 leading-relaxed text-slate-400">
          {IDES.plutarch}
        </p>

        {/* İki görsel KASITLI olarak yan yana: aynı sahnenin miti ve bugünü. */}
        <ArticleImage
          className="sezar-img"
          src="/articles/sezar/sezarin-olumu.webp"
          ratio="1600 / 941"
          alt="Yağlı boya tablo: geniş mermer bir salonun zemininde, sütunun dibinde beyaz togasıyla yatan bir ceset; sağda toga giymiş bir grup adam ellerini kaldırarak salondan çıkıyor."
          caption="Caesar’ın Ölümü — Jean-Léon Gérôme, 1867. Sinemanın da bildiği versiyon bu: sakin kompozisyon, tek başına yatan kurban, zafer çığlığıyla uzaklaşan suikastçılar. Yukarıdaki yara diyagramı bunun ne kadarının doğru olduğunu gösteriyor."
          credit="Jean-Léon Gérôme · kamu malı"
        />

        <ArticleImage
          className="sezar-img"
          src="/articles/sezar/cinayet-yeri.webp"
          ratio="1600 / 901"
          alt="Modern bir şehrin ortasında, çevresi korkuluklarla ayrılmış arkeolojik alanda alçak taş temel kalıntıları ve otlar."
          caption="Aynı yer, bugün: Pompeius kuryasının kalıntıları — Caesar’ın öldürüldüğü salonun temeli. Gérôme’un mermer ihtişamının gerçekte geriye bıraktığı şey bu."
          credit="Luciano Tronati · CC BY-SA 4.0"
        />
      </ArticleSection>

      {/* ══════════ PERDE 7 ══════════ */}
      <ArticleSection kicker="PERDE 7 · SUİKASTIN BAŞARISIZLIĞI" title="Sonrası için planları yoktu">
        <p className="leading-relaxed text-slate-300">
          Komplocular kendilerine <em>Liberatores</em> — Kurtarıcılar — diyorlardı. Cinayetten sonra kanlı hançerlerle sokağa çıktılar, “Özgürlük!” diye bağırdılar ve halkın onları omuzlarda taşımasını beklediler. Roma halkı korkuyla kapılarını kilitledi. Suikastçıların bir sonraki adım için planı yoktu; Caesar’ın ölümünün kendiliğinden Cumhuriyet’i geri getireceğini sanıyorlardı. Ama Cumhuriyet zaten ölüydü. Caesar onu öldürmemişti — cesedin üstüne oturmuştu.
        </p>
        <div className="mt-6">
          <CardGrid cols={2} items={AFTERMATH.map((a) => ({ icon: a.icon, title: a.title, text: a.text }))} />
        </div>
        <ArticleImage
          className="sezar-img mx-auto max-w-md"
          src="/articles/sezar/eid-mar-sikkesi.webp"
          ratio="1026 / 963"
          alt="Gümüş sikkenin iki yüzü: solda sakalsız bir erkek profili, sağda iki hançer arasında konik bir başlık ve altında EID MAR yazısı."
          caption="Brutus cinayeti parasının üstüne bastırdı: iki hançer, arada azat edilen kölelerin taktığı özgürlük başlığı ve tarih — EID MAR, Mart’ın İdus’u. Cumhuriyeti kurtardıklarına o kadar emindiler ki olayı reklama çevirdiler."
          credit="Mark Landon · CC BY 4.0"
        />

        <SourceNote>{SUETONIUS_THREE_YEARS}</SourceNote>
        <p className="mt-6 leading-relaxed text-slate-300">
          İç savaş on üç yıl daha sürdü; Actium’da bitti. Kazanan Octavianus, <strong>Augustus</strong> adını aldı ve Roma’nın ilk imparatoru oldu. Cumhuriyet, geri gelmemek üzere gitti.
        </p>
      </ArticleSection>

      <HorizontalTimeline heading="Bir hayatın tamamı, tek şeritte" kicker="MÖ 100 → 1453" items={timeline} />

      <ArticleSection kicker="PERDE 7 · FİNAL" title="İsim">
        <p className="leading-relaxed text-slate-300">
          Şimdi durup şunu düşünün. Altmıştan fazla adam, bir cumhuriyeti bir adamın gölgesinden kurtarmak için onu bıçakladı. Sonuç: Cumhuriyet öldü, kalıcı olarak; suikastçılar öldü, hepsi; ve Caesar’ın evlatlık oğlu, Caesar’ın asla resmen alamadığı gücü aldı. Ama asıl mesele bu değil. Asıl mesele, o adamın <strong>adında</strong>.
        </p>
        <div className="mt-8">
          <NameTree />
        </div>
        <p className="mt-8 leading-relaxed text-slate-400">
          O adın son durağı, bu toprakların tam ortasındadır: Konstantiniyye’yi alan Fatih Sultan Mehmed’in seçtiği unvan, <Link href="/articles/turkler" className="article-ilink">Türklerin tarihinde</Link> Kayser-i Rûm olarak geçer — Roma’nın Sezar’ı. Onu 15 Mart’ta, bir salonun zemininde, togasının altında bıçaklayan adamlar bunu bilse muhtemelen anlamazlardı. O gülerdi.
        </p>
        <Link href="/articles/augustus" className="mt-6 flex items-center gap-3 rounded-xl border p-3.5 text-sm transition hover:bg-white/[0.04]" style={{ borderColor: 'color-mix(in srgb, #d9a441 30%, transparent)', background: 'color-mix(in srgb, #d9a441 6%, transparent)' }}>
          <span className="text-lg">🏛️</span>
          <span className="text-slate-300">Peki Caesar’ın adını alan o 18 yaşındaki hasta çocuk ne yaptı? <span className="font-semibold" style={{ color: 'color-mix(in srgb, #d9a441 88%, white)' }}>→ Augustus’u oku</span></span>
        </Link>
      </ArticleSection>

      <ArticleSection kicker="MİNİ TEST" title="Anladın mı? Bakalım.">
        <ArticleQuiz questions={quizQs} />
      </ArticleSection>

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-300">Kaynak notu: </span>
          Bu anlatının omurgası dört antik kaynağa dayanır ve dördü de taraflıdır: Caesar’ın kendi hatıratları (propaganda), Suetonius (dedikoduya bayılır), Plutarkhos (ahlak dersi çıkarır) ve Appianos (geç, ikinci el). Antik rakamlar — özellikle Galya’daki ölü sayısı ve Alesia’daki ordu büyüklükleri — kaynakların kendi abartılarını taşır; kesin sayı değil, büyüklük sırası olarak okunmalı. “Et tu, Brute” Shakespeare’indir, Caesar’ın değil; Antonius’un tacı “üç kez” sunması da öyle.
        </div>
      </div>

      <div className="relative z-10">
        <ArticleBibliography items={refs} accent={ACCENT} />
      </div>

      <ArticleFooter tagline="Zar atıldı. Ve hâlâ dönüyor. 🗡️" />
    </ArticleShell>
  );
}
