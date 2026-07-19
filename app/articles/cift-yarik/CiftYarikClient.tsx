'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection, CardGrid, HorizontalTimeline, ArticleQuiz, ArticleBibliography, ArticleFooter,
} from '@/app/components/article/ArticleBlocks';
import ArticleImage from '@/app/components/article/ArticleImage';
import {
  ElectronField, DoubleSlitLab, RippleTank, DeBroglie,
  timeline, interpretations, quizQs, refs,
} from './widgets';

const ACCENT = '#a855f7';
const HERO_COLORS: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]] = [
  [0.03, 0.02, 0.09], [0.16, 0.07, 0.34], [0.42, 0.18, 0.78], [0.12, 0.52, 0.74],
];

function FunFact({ icon = '🤯', title = 'Şaşırtıcı bilgi', children }: { icon?: string; title?: string; children: ReactNode }) {
  return (
    <div className="mt-5 rounded-xl border border-fuchsia-400/30 bg-fuchsia-400/[0.06] px-5 py-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-bold text-fuchsia-200"><span>{icon}</span><span>{title}</span></div>
      <p className="m-0 text-sm leading-relaxed text-slate-300">{children}</p>
    </div>
  );
}
function Quote({ children }: { children: ReactNode }) {
  return <div className="mt-5 border-l-4 border-violet-400/60 bg-violet-400/[0.06] px-5 py-4 text-lg italic leading-relaxed text-violet-100">{children}</div>;
}

export default function CiftYarikClient() {
  return (
    <ArticleShell accent={ACCENT} title="Çift Yarık Deneyi">
      <style>{`
        /* ArticleImage'ın slate varsayılanlarını makalenin mor aksanına bağla. */
        .cy-img {
          --ai-caption: #cbd5e1;
          --ai-credit: #8b76a8;
          --ai-border: rgba(168,85,247,0.22);
          --ai-fill: rgba(168,85,247,0.05);
          --ai-mark: rgba(168,85,247,0.28);
        }
        .cy-img-pair { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; align-items: start; }
        @media (max-width: 700px) { .cy-img-pair { grid-template-columns: 1fr; } }
      `}</style>
      <ElectronField />

      <ArticleHero
        title="Çift Yarık"
        fullTitle="Çift Yarık Deneyi: Gerçekliğin Kalbindeki Çatlak"
        eyebrow="KUANTUMUN TEK GERÇEK GİZEMİ · İNTERAKTİF DOSYA"
        subtitle={<>Duvara iki ince yarık, arkasına bir ekran. Hepsi bu. Ama bu sade düzenek, evrenin en temelde <em className="not-italic text-fuchsia-300">sezgilerimize hiç benzemeyen</em> kurallarla işlediğini gösterdi.</>}
        colors={HERO_COLORS}
      />

      <ArticleLede points={[
        'Işık ve madde hem dalga hem parçacık gibi davranır (dalga–parçacık ikiliği)',
        'Tek tek gönderilen elektronlar bile birikince girişim deseni oluşturur',
        'Hangi yarıktan geçtiği ölçülünce girişim kaybolur — “gözlem” bilinç değil, bilginin kaydıdır',
      ]}>
        Çift yarık deneyi, tek tek gönderilen parçacıkların (foton, elektron, hatta koca moleküller) bir ekranda girişim deseni oluşturduğunu; ama hangi yarıktan geçtikleri ölçüldüğünde bu desenin kaybolduğunu gösteren deneydir. Richard Feynman'a göre kuantum fiziğinin “tek gerçek gizemi” burada saklıdır.
      </ArticleLede>

      <ArticleSection center>
        <div className="mx-auto mb-6 max-w-[200px]">
          <ArticleImage
            className="cy-img"
            src="/articles/cift-yarik/feynman-portre.webp"
            ratio="1364 / 1366"
            alt="Orta yaşlı bir adamın siyah beyaz portresi: gülümsüyor, saçları dağınık, koyu renk ceket giymiş."
            caption="Richard Feynman"
            credit="Kamu malı"
          />
        </div>
        <Quote>“Bu deney kuantum fiziğinin tek gerçek gizemini içinde barındırıyor; gerisi sadece detay.”<br /><span className="text-sm not-italic text-slate-400">— Richard Feynman</span></Quote>
      </ArticleSection>

      {/* 1. Işık kavgası */}
      <ArticleSection title="Bir ışık kavgasıyla başladı" max="max-w-4xl">
        <div className="cy-img-pair mb-6">
          <ArticleImage narrow
            className="cy-img"
            src="/articles/cift-yarik/thomas-young-portre.webp"
            ratio="1600 / 2046"
            priority
            alt="19. yüzyıl portresi: kısa dalgalı saçlı, yüksek yakalı ceket giymiş genç bir adam, hafifçe yana dönük duruyor."
            caption="Thomas Young. Işığın dalga olduğunu gösteren deneyi yaptı — ve boş vakitlerinde Rosetta Taşı'nın çözülmesine katkıda bulundu. İlk düzeneğinde aslında iki yarık değil, ışını bölen ince bir kart vardı."
            credit="Wikimedia Commons · kamu malı"
          />
          <ArticleImage narrow
            className="cy-img"
            src="/articles/cift-yarik/girisim-seritleri.webp"
            ratio="1600 / 538"
            alt="Koyu zemin üzerinde düzenli aralıklarla sıralanmış, ortadan kenarlara doğru soluklaşan parlak dikey şeritler."
            caption="Girişim deseni: aydınlık ve karanlık şeritler. Dalgaların tepe tepeye geldiği yerler parlak, tepe çukura geldiği yerler karanlık. Bu desen dalgaların imzasıdır."
            credit="Wikimedia Commons · kamu malı"
          />
        </div>

        <p className="mb-4 leading-relaxed text-slate-300">
          Hikâye kuantumdan çok önce, 1800'lerin başında başlıyor. O dönemde ışığın ne olduğu tartışmalıydı: <Link href="/articles/newton" className="article-ilink">Newton'ın parçacık (corpuscle) teorisi</Link> o kadar güçlüydü ki karşı çıkmak neredeyse kariyer intiharıydı.
        </p>
        <p className="mb-4 leading-relaxed text-slate-300">
          <strong className="text-violet-300">Thomas Young</strong>, 1801–1803 arasında bu tabuyu yıktı. Tek bir güneş ışınını ikiye böldü ve arka duvarda tek bir parlak leke değil, birbirini takip eden <strong className="text-fuchsia-300">aydınlık ve karanlık şeritler</strong> gördü. Parçacıklar böyle davranmaz — bu ancak dalgalarla açıklanabilirdi. Işık bir dalgaydı.
        </p>
        <FunFact icon="🧠" title="Young sıradan biri değildi">
          Thomas Young bir çok yönlü dâhiydi: hekimlik yaptı, ışıktan esnekliğe kadar pek çok alanda çalıştı ve <strong className="text-white">Mısır hiyerogliflerinin</strong> çözülmesine bile katkıda bulundu. İlk düzeneğinde aslında iki yarık değil, ışını bölmek için ince bir kart kullanmıştı.
        </FunFact>
      </ArticleSection>

      {/* 2. Girişim + RippleTank */}
      <ArticleSection title="Girişim nedir? Bu şeritler nereden geliyor?" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Bir havuz hayal et: iki taş aynı anda düşünce halkalar yayılır. İki halka dizisi buluştuğunda bazı noktalarda tepeler çakışıp <strong className="text-fuchsia-300">güçlenir</strong> (yapıcı girişim → parlak), bazı noktalarda birinin tepesi diğerinin çukuruna denk gelip <strong className="text-cyan-300">birbirini yok eder</strong> (yıkıcı girişim → karanlık). İşte ekrandaki şeritler tam olarak bu. Bu, dalgaların imza hareketidir — sesin, suyun, ışığın.
        </p>
        <ArticleImage
          className="cy-img"
          src="/articles/cift-yarik/dalga-havuzu.webp"
          ratio="1600 / 1022"
          alt="Su yüzeyinde iki noktadan yayılan dairesel dalgalar; halkalar kesiştiği yerlerde düzenli bir örgü deseni oluşuyor."
          caption="Aynı şey suda: iki kaynaktan yayılan halkalar kesiştiğinde bazı yerlerde birbirini büyütür, bazı yerlerde siler. Ekrandaki şeritlerin sudaki karşılığı bu."
          credit="Wikimedia Commons · CC0"
        />

        <p className="mb-6 text-sm text-slate-400">Aşağıda kendin dene: iki kaynağın dalgalarını karıştır, yarık aralığını ve dalga boyunu değiştir.</p>
        <RippleTank />
      </ArticleSection>

      {/* 3. Madde dalgası + DeBroglie */}
      <ArticleSection title="Madde de dalga olabilir mi?" max="max-w-4xl">
        <div className="mx-auto mb-6 max-w-xs">
          <ArticleImage
            className="cy-img"
            src="/articles/cift-yarik/de-broglie-portre.webp"
            ratio="1600 / 2133"
            alt="Takım elbiseli, geriye taranmış saçlı bir adamın siyah beyaz stüdyo fotoğrafı."
            caption="Louis de Broglie: 1924'te doktora tezinde maddenin de dalga gibi davranabileceğini öne sürdü. Beş yıl sonra bu fikirle Nobel aldı."
            credit="Agence Rol · kamu malı"
          />
        </div>

        <p className="mb-4 leading-relaxed text-slate-300">
          20. yüzyılın başında fizik altüst oldu. Einstein ışığın bazen parçacık (<strong className="text-violet-300">foton</strong>) gibi davrandığını gösterdi — ışık hem dalga hem parçacıktı. Peki tersi mümkün müydü? 1924'te <strong className="text-fuchsia-300">Louis de Broglie</strong> her parçacığın bir dalga boyu olduğunu öne sürdü: <strong className="text-cyan-300">λ = h/p</strong> (dalga boyu = Planck sabiti ÷ momentum).
        </p>
        <p className="mb-4 leading-relaxed text-slate-300">
          Bu formül aynı zamanda neden bir futbol topunun dalga gibi davranmadığını da açıklar: büyük ve hızlı nesnelerin momentumu çok yüksek olduğundan dalga boyları akıl almayacak kadar küçük kalır. 1927'de <strong className="text-violet-300">Davisson ve Germer</strong> elektronların bir nikel kristalinde tıpkı dalgalar gibi kırınıma uğradığını gördü. Madde de dalgaydı.
        </p>
        <p className="mb-6 text-sm text-slate-400">Nesneyi seç, hızını değiştir; dalga boyunun neden sadece minik parçacıklarda ölçülebildiğini gör:</p>
        <DeBroglie />
      </ArticleSection>

      {/* 4. Tek tek elektronlar — CENTERPIECE */}
      <ArticleSection kicker="🔬 EN RAHATSIZ EDİCİ KISIM" title="Tek tek gönderilen elektronlar" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Elektronları öyle yavaş gönderelim ki sistemde asla aynı anda birden fazla elektron olmasın. Sezgi der ki: ortada tek parçacık var, girişecek “arkadaşı” yok — arkada iki basit yığın oluşmalı. <strong className="text-fuchsia-300">Ama olan bu değil.</strong>
        </p>
        <ArticleImage
          className="cy-img"
          src="/articles/cift-yarik/tonomura-elektron-birikimi.webp"
          ratio="1600 / 935"
          alt="Beş kareli dizi: ilk karelerde dağınık tek tek noktalar, sonraki karelerde noktalar çoğaldıkça belirgin dikey şeritler ortaya çıkıyor."
          caption="Tonomura'nın 1989 deneyi: elektronlar teker teker gönderiliyor. İlk karelerde sadece rastgele noktalar var; binlercesi birikince desen kendiliğinden ortaya çıkıyor. Her elektron tek bir noktaya çarpıyor, ama nereye çarpacağını bir dalga belirliyor."
          credit="Dr. Tonomura ve Belsazar · CC BY-SA 3.0"
        />

        <p className="mb-4 leading-relaxed text-slate-300">
          Her elektron ekranda tek bir noktaya çarpar (katıksız parçacık). Ama binlercesi birikince o “rastgele” noktalardan tanıdık bir desen doğar: <strong className="text-cyan-300">girişim şeritleri</strong>. Yani her elektron, tek başına giderken bile sanki iki yarıktan da aynı anda geçip <em className="not-italic text-fuchsia-300">kendisiyle</em> girişim yapıyor.
        </p>
        <p className="mb-6 text-sm text-slate-400">Aşağıdaki laboratuvarı çalıştır: “Otomatik ateşle”ye bas, noktaların birikip deseni oluşturmasını izle. Sonra <strong className="text-cyan-300">Dedektör</strong> ve <strong className="text-violet-300">Kuantum silgi</strong> modlarını dene.</p>
        <DoubleSlitLab />
        <FunFact icon="🏆" title="Fizik tarihinin en güzel deneyi">
          2002'de Physics World okurları bu deneyi “fizik tarihinin en güzel deneyi” seçti. Tek elektronlu versiyonu 1961'de Claus Jönsson yaptı; en ikonik görüntüler ise 1989'da <strong className="text-white">Akira Tonomura</strong> ve Hitachi ekibinden geldi — noktaların önce dağınık, sonra düzenli bir desene dönüşerek biriktiği o meşhur kareler.
        </FunFact>
        <p className="mt-5 leading-relaxed text-slate-300">
          Ne oluyor? Elektron yarıklardan geçerken bir <strong className="text-cyan-300">olasılık dalgası</strong> (dalga fonksiyonu) olarak yayılır — fiziksel bir su dalgası değil, parçacığın nerede bulunma ihtimalini tanımlayan matematiksel bir dalga. Bu dalga iki yarıktan da geçer, kendisiyle girişir; ekrana çarptığı an ise tek bir noktaya “yerleşir”.
        </p>
        <p className="mt-4 leading-relaxed text-slate-400">
          Aynı olasılık dalgası, bir parçacığın aşamayacağı bir enerji duvarının içinden bir ihtimalle sızmasına da izin
          verir. Buna kuantum tünellemesi denir ve doğadaki en inatçı olaylardan birini açıklar: bir çekirdeğin ne zaman{' '}
          <Link href="/articles/radyoaktivite" className="article-ilink">radyoaktif olarak bozunacağı</Link>. Kimse
          bilmiyor — çünkü bu bir mekanizma değil, bir kumar.
        </p>
      </ArticleSection>

      {/* 5. Hangi yarıktan? */}
      <ArticleSection title="Peki hangi yarıktan geçti? Asıl gizem burada" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Yarıkların yanına dedektör koyalım, hangisinden geçtiğini kaydedelim. Denendi. Sonuç fiziğin en kafa karıştırıcı gerçeklerinden biri: ölçmeye başladığın an <strong className="text-fuchsia-300">girişim deseni kaybolur</strong>, ekranda iki basit bant belirir. Ölçümü kaldırınca desen geri gelir. (Yukarıdaki laboratuvarda “Dedektör açık” modunu dene.)
        </p>
        <p className="leading-relaxed text-slate-300">
          Niels Bohr buna <strong className="text-violet-300">tamamlayıcılık ilkesi</strong> dedi: bir parçacığın dalga yönü ile parçacık yönü, aynı anda ölçülemeyen iki yüzdür. Hangi deneyi kurarsan onu görürsün. Bu, Heisenberg'in <strong className="text-cyan-300">belirsizlik ilkesiyle</strong> derinden bağlıdır: bir şeyi net görmek için başka bir şeyden vazgeçmen gerekir.
        </p>
      </ArticleSection>

      {/* 6. Gözlemci / dekoherans */}
      <ArticleSection title="“Gözlemci” ne demek? Bilinç meselesini düzeltelim" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Çift yarık belki de en çok çarpıtılan deneydir. Sık duyulan iddia: “Elektron, insan izlediği için değişir; bilinç gerçekliği yaratır.” <strong className="text-fuchsia-300">Bu, deneyin söylediği şey değil.</strong>
        </p>
        <p className="mb-4 leading-relaxed text-slate-300">
          Buradaki “ölçüm”, bir insanın gözüyle bakması değildir. Kastedilen, sistemin çevresiyle etkileşip <strong className="text-cyan-300">yol bilgisinin fiziksel olarak kaydedilmesidir</strong>. Bunu bir dedektör, bir foton, bilinçsiz bir aygıt da yapabilir. Kimse veriyi hiç okumasa bile, bilgi ortamda iz bırakır bırakmaz desen bozulur.
        </p>
        <FunFact icon="🔑" title="Sihirli olan bilinç değil, bilgi">
          Fizikçilerin bunu açıkladığı kavram <strong className="text-white">dekoherans</strong>: kuantum sistemi çevresiyle etkileşince kırılgan dalga durumu çevreye “sızar” ve girişim yeteneğini kaybeder. Elektron, yol bilgisini taşıyan aygıtla <strong className="text-white">dolanır</strong> (kuantum dolanıklık); bu bir kez olunca girişim geri gelmez. Deneyi mistik bir “zihin madde üzerinde hâkim” hikâyesine çevirmek, gerçekte olan çok daha derin fiziği gizler.
        </FunFact>
      </ArticleSection>

      {/* 7. Geciktirilmiş seçim & kuantum silgi */}
      <ArticleSection title="İşleri daha da garipleştirmek: geciktirilmiş seçim & kuantum silgi" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          John Wheeler 1970'lerde sordu: ya elektron yarıklardan <em className="not-italic text-violet-300">geçtikten sonra</em>, ekrana çarpmadan önce dedektörü açıp kapatırsak? <strong className="text-fuchsia-300">Geciktirilmiş seçim</strong> deneyinde sonuç yine sezgiye aykırıydı: ölçümü ne zaman yaparsan yap, parçacık son andaki seçimine uyum sağlıyor.
        </p>
        <p className="leading-relaxed text-slate-300">
          Daha da uç olan <strong className="text-cyan-300">kuantum silgi</strong>: önce yol bilgisi kaydedilir (girişim kaybolur), sonra o bilgi ölçülemez hale getirilip <em className="not-italic text-fuchsia-300">silinir</em> — ve girişim geri döner! (Laboratuvarda “Kuantum silgi” modu bunu canlandırır.) Belirleyici olan, bilginin bir yerlerde ilkece elde edilebilir olup olmamasıdır.
        </p>
      </ArticleSection>

      {/* 8. Ne kadar büyük? */}
      <ArticleSection title="Bu deney ne kadar büyük nesnelerle yapılabilir?" max="max-w-4xl">
        <div className="mx-auto mb-6 max-w-xs">
          <ArticleImage
            className="cy-img"
            src="/articles/cift-yarik/c60-buckyball.webp"
            ratio="1600 / 1571"
            alt="Altıgen ve beşgenlerden oluşan, futbol topuna benzeyen küresel bir molekül modeli."
            caption="C60: altmış karbon atomundan oluşan futbol topu molekülü. 1999'da Zeilinger ekibi deneyi bununla yaptı — ve desen yine ortaya çıktı."
            credit="Jynto · CC0"
          />
        </div>

        <p className="mb-4 leading-relaxed text-slate-300">
          1999'da Viyana'da <strong className="text-violet-300">Anton Zeilinger</strong> ve ekibi, deneyi 60 karbon atomlu futbol topu şeklindeki dev <strong className="text-fuchsia-300">C60 “buckyball”</strong> molekülleriyle yaptı — bir molekülde ya da bir avuç maddede kaç atom olduğunu ise <Link href="/articles/mol" className="article-ilink">mol kavramı</Link> sayar. Bu koca moleküller bile yarıklardan bir dalga gibi geçti. 2019'a gelindiğinde iki binden fazla atomlu moleküllerle bile girişim gözlenebiliyordu.
        </p>
        <p className="leading-relaxed text-slate-300">
          Peki neden bir kahve fincanı iki yarıktan aynı anda geçmez? Çünkü büyük nesnelerin dalga boyu inanılmaz küçüktür ve çevreleriyle sürekli etkileşirler — bu etkileşim (dekoherans) kuantum tuhaflığını anında yok eder. Sınır keskin bir duvar değil; nesne büyüdükçe kuantum tuhaflığı yavaşça <strong className="text-cyan-300">söner</strong>.
        </p>
      </ArticleSection>

      {/* Zaman çizelgesi */}
      <HorizontalTimeline kicker="ZAMAN ÇİZELGESİ · 1801 → 2019" heading="Deneyin iki yüzyıllık yolculuğu" items={timeline} />

      {/* 9. Yorumlar */}
      <ArticleSection title="Peki bütün bunlar ne anlama geliyor? Yorumlar savaşı" max="max-w-4xl">
        <p className="mb-6 leading-relaxed text-slate-300">
          Fiziğin en dürüst itiraflarından biri: deneyin <em className="not-italic text-violet-300">ne olduğu</em> konusunda tam uzlaşma var, ama <em className="not-italic text-fuchsia-300">ne anlama geldiği</em> konusunda yok. Matematik kusursuz çalışıyor; “gerçekte olan nedir?” sorusuna farklı fizikçiler farklı cevap veriyor.
        </p>
        <CardGrid items={interpretations} cols={3} />
        <p className="mt-6 leading-relaxed text-slate-300">Bu yorumların hepsi aynı deneysel sonuçları verir; şu an aralarında bir deneyle karar veremiyoruz. Hangisini seçtiğin bir fizik sorusundan çok felsefe ve estetik tercihi hâline geliyor. Çok Dünyalı Yorum'un baş döndürücü bir sonucu için: <Link href="/articles/kuantum-olumsuzlugu" className="article-ilink">kuantum ölümsüzlüğü</Link>.</p>
      </ArticleSection>

      {/* 10. Neden önemli */}
      <ArticleSection title="Neden önemli?" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Bu sadece felsefi bir merak değil. Ondan çıkan kavramlar bugün gerçek teknolojilerin temeli: <strong className="text-violet-300">kuantum bilgisayarlar</strong> süperpozisyonla çalışır; <strong className="text-cyan-300">kuantum şifreleme</strong> ölçümün sistemi kaçınılmaz değiştirmesine dayanır (dinleyici anında fark edilir); elektron mikroskopları elektronun dalga doğasından yararlanır.
        </p>
        <p className="leading-relaxed text-slate-300">
          Ama belki de en kalıcı armağanı şu: doğa, en temel düzeyde bizim sezgilerimize borçlu değil. “Bir mermi ya bu delikten ya şu delikten geçer” gibi kurallara uymak zorunda değil. İki basit yarık, gerçekliğin dokusunun tahmin ettiğimizden çok daha ince, tuhaf ve zengin olduğunu gösterdi.
        </p>
      </ArticleSection>

      {/* Quiz */}
      <ArticleSection kicker="MİNİ TEST" title="Ne kadar anladın?">
        <ArticleQuiz questions={quizQs} />
      </ArticleSection>

      {/* Özet */}
      <ArticleSection center title="Kısa özet">
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-300">
          Işık ve madde hem <span className="text-violet-300">dalga</span> hem <span className="text-fuchsia-300">parçacık</span> gibi davranır. Tek tek elektronlar bile birikince <span className="text-cyan-300">girişim deseni</span> oluşturur; ama yol bilgisi kaydedilince desen kaybolur. “Gözlem” bilinç değil, bilginin çevreye yazılmasıdır (dekoherans). Feynman haklıydı: bütün gizem bu sade düzenekte saklı — ve yüz yıldır baktığımız hâlde dibine hâlâ tam inebilmiş değiliz.
        </p>
      </ArticleSection>

      <div className="relative z-10">
        <ArticleBibliography items={refs} accent={ACCENT} />
      </div>

      <ArticleFooter tagline="İki yarık, bir ekran — ve gerçekliğin kalbindeki çatlak. ⚛️" />
    </ArticleShell>
  );
}
