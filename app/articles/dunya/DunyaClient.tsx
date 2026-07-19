'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection, CardGrid, HorizontalTimeline, ArticleQuiz, ArticleBibliography, ArticleFooter,
} from '@/app/components/article/ArticleBlocks';
import ArticleImage from '@/app/components/article/ArticleImage';
import {
  EarthLayers, PlanetCompare,
  accretion, heatSources, moonEvidence, moonEffects, uniqueFeatures, nicheFacts, timeline, quizQs, refs,
} from './widgets';

// 3B Dünya küresi (cobe) — istemcide + lazy.
const Globe3D = dynamic(() => import('./Globe3D'), {
  ssr: false,
  loading: () => <div className="mx-auto aspect-square w-full max-w-[440px]" />,
});

const ACCENT = '#38bdf8';
// Hero shader paleti: derin uzay → okyanus mavisi → camgöbeği → erimiş çekirdek turuncusu
const HERO_COLORS: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]] = [
  [0.02, 0.04, 0.10], [0.04, 0.20, 0.45], [0.22, 0.66, 0.88], [0.96, 0.55, 0.20],
];

export default function DunyaClient() {
  return (
    <ArticleShell accent={ACCENT} title="Dünya">
      <style>{`
        /* ArticleImage'ın slate varsayılanlarını makalenin gökyüzü mavisine bağla. */
        .dn-img {
          --ai-caption: #cbd5e1;
          --ai-credit: #6f8ba3;
          --ai-border: rgba(56,189,248,0.22);
          --ai-fill: rgba(56,189,248,0.05);
          --ai-mark: rgba(56,189,248,0.28);
        }
        .dn-img-pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; align-items: start; margin: 20px 0; }
      `}</style>
      <ArticleHero
        title="Dünya"
        fullTitle="Dünya'nın Oluşumu, İç Yapısı ve Onu Eşsiz Kılan Özellikler"
        eyebrow="GEZEGENİMİZİN HİKÂYESİ · İNTERAKTİF DOSYA"
        subtitle={<>Sıvı demir çekirdeği, görünmez manyetik kalkanı, hareket eden kabuğu ve tek yoldaşı Ay — hepsi bir dizi <strong className="font-semibold text-sky-300">olağanüstü tesadüfün</strong> ve <em className="not-italic text-amber-300">şiddetli kozmik olayın</em> ürünü. Aşağı kaydır.</>}
        colors={HERO_COLORS}
      />

      <ArticleLede points={[
        'Güneş bulutsusu → yığışma → demir felaketi (katmanlı çekirdek/manto/kabuk)',
        'Manyetik kalkan (jeodinamo) + levha tektoniği + oksijenli atmosfer',
        'Ay, Theia adlı bir gezegenin dev çarpışmasıyla oluştu; eksen eğikliğini dengeler',
      ]}>
        Dünya, Güneş Sistemi'nde üzerinde yaşam bilinen tek gezegendir ve yaklaşık 4,54 milyar yıl önce bir gaz-toz bulutundan oluştu. Sıvı demir çekirdeği manyetik kalkanı üretir, levha tektoniği iklimi düzenler, büyük uydusu Ay ise eksen eğikliğini dengeler.
      </ArticleLede>

      {/* Giriş */}
      <ArticleSection center>
        <p className="text-2xl font-medium leading-relaxed text-slate-200 sm:text-3xl">
          Evrendeki milyarlarca gök cismi arasında, üzerinde yaşam barındırdığını bildiğimiz <span className="text-sky-300">tek gezegen</span> Dünya'dır.
          Ama onu özel kılan yalnızca üzerindeki canlılar değil — <span className="text-amber-300">gezegenin bizzat kendi yapısı</span>.
        </p>
      </ArticleSection>

      {/* 1. Güneş Bulutsusu */}
      <ArticleSection title="Her şeyin başlangıcı: Güneş Bulutsusu">
        <Globe3D />

        <div className="dn-img-pair">
          <ArticleImage
            className="dn-img"
            src="/articles/dunya/mavi-bilye.webp"
            ratio="1600 / 1600"
            priority
            alt="Uzaydan çekilmiş tam Dünya fotoğrafı: bulut sarmalları, mavi okyanuslar, Afrika kıtası ve güney kutbundaki buz."
            caption="“Mavi Bilye”: Apollo 17 mürettebatının 1972'de çektiği fotoğraf. Bu yazı, bu kürenin nasıl var olduğunun hikâyesi."
            credit="Harrison Schmitt / Apollo 17 · kamu malı"
          />
          <ArticleImage
            className="dn-img"
            src="/articles/dunya/gezegenimsi-disk.webp"
            ratio="1600 / 1600"
            alt="Teleskop görüntüsü: parlak bir merkezin çevresinde iç içe geçmiş turuncu halkalar ve aralarındaki boşluklar."
            caption="Başka bir yıldızın çevresindeki gezegen oluşum diski (ALMA). Aradaki boşlukları oluşmakta olan gezegenler süpürüyor — 4,6 milyar yıl önce buradaki sürecin bugün başka bir yerde çekilmiş hâli."
            credit="ALMA (ESO/NAOJ/NRAO) · CC BY 4.0"
          />
          <ArticleImage
            className="dn-img"
            src="/articles/dunya/hadeyan-erimis-dunya.webp"
            ratio="1600 / 860"
            alt="Çizim: yüzeyi kızgın lav denizleriyle kaplı, üzerine göktaşları düşen erimiş bir gezegen."
            caption="Hadeyan dönemi: erimiş bir Dünya. Fotoğraf değil, bilimsel canlandırma — o çağdan geriye kalan kaya bile neredeyse yok."
            credit="Tim Bertelink · CC BY-SA 4.0"
          />
        </div>
        <p className="mb-4 mt-6 leading-relaxed text-slate-300">
          Dünya'nın hikâyesi ~4,6 milyar yıl önce, devasa bir gaz ve toz bulutunun çökmesiyle başlar: <strong className="text-sky-300">güneş bulutsusu</strong>.
          Çoğunlukla hidrojen ve helyumdan oluşan bu buluta, ölmüş yıldızların <Link href="/articles/black-hole" className="article-ilink">süpernova patlamalarından</Link> saçılan ağır elementler de karışmıştı.
          Çekirdeğimizdeki demir de kanımızdaki demir de bu ölü yıldızların külünden gelir.
        </p>
        <p className="mb-5 leading-relaxed text-slate-300">
          Bulut çökerken dönmeye başladı; bir patenci kollarını içine çekince nasıl hızlanırsa, bulut da hızlanıp yassılaşarak dönen bir <strong className="text-sky-300">gezegenimsi diske</strong> dönüştü.
          Merkezde basınç ve sıcaklık füzyonu ateşledi — Güneş doğdu. Geriye kalan, toplam kütlenin %0,1'inden azı; gezegenler işte bu artıktan oluştu.
        </p>
        <blockquote className="rounded-xl border-l-4 px-5 py-4 text-lg italic text-slate-200" style={{ borderColor: ACCENT, background: 'color-mix(in srgb, #38bdf8 6%, transparent)' }}>
          “Hepimiz yıldız tozuyuz.”
          <span className="mt-1 block text-sm not-italic text-slate-400">— Carl Sagan</span>
        </blockquote>
      </ArticleSection>

      {/* 2. Yığışma */}
      <ArticleSection title="Toz tanelerinden gezegene: Yığışma" max="max-w-4xl">
        <p className="mb-6 leading-relaxed text-slate-300">
          Dünya bir anda var olmadı; milyonlarca yıl süren bir biriktirme ve çarpışma sürecinin — <strong className="text-sky-300">yığışmanın</strong> — ürünüdür.
          Güneş'e yakın sıcak bölgede uçucular buharlaştığı için iç gezegenler kayalık ve yoğun; uzaktaki soğuk bölgede gaz/buz bollaştığı için dev gaz gezegenleri oluştu.
        </p>
        <CardGrid items={accretion} cols={2} />
      </ArticleSection>

      {/* 3. Demir felaketi + ısı kaynakları */}
      <ArticleSection title="Demir Felaketi: ağır metaller neden merkeze çöktü?">
        <p className="mb-4 leading-relaxed text-slate-300">
          Erken Dünya kabaca homojen bir kaya yığınıydı. Üç güçlü ısı kaynağı gezegeni erittiğinde fizik devreye girdi: erimiş kaya okyanusunda yoğun <strong className="text-amber-300">demir ve nikel damlaları merkeze battı</strong>,
          hafif silikatlar yukarı süzüldü. Bu olaya <strong className="text-sky-300">demir felaketi</strong> (gezegensel farklılaşma) denir — ve bugünkü katmanlı yapımızın kaynağıdır.
        </p>
        <CardGrid items={heatSources} cols={3} />
        <p className="mt-6 leading-relaxed text-slate-400">
          Bu ısı kaynaklarından biri bugün de sürüyor: mantoda ve kabukta yavaşça bozunan uranyum, toryum ve
          potasyum-40, yüzeyden kaçan ısının kabaca yarısını üretiyor. Yani levhaları hareket ettiren motorun bir ucu{' '}
          <Link href="/articles/radyoaktivite" className="article-ilink">radyoaktivitede</Link>.
        </p>
      </ArticleSection>

      {/* İnteraktif: iç yapı */}
      <ArticleSection kicker="İNTERAKTİF · KEŞFET" title="Dünya'nın iç yapısı">
        <p className="mb-6 text-slate-400">Bir katmana tıkla; bileşimini, kalınlığını ve o cehennemi sıcaklıkları gör.</p>
        <EarthLayers />
        <p className="mt-6 leading-relaxed text-slate-300">
          İlginç bir paradoks: <strong className="text-amber-300">iç çekirdek, dış çekirdekten daha sıcak olmasına rağmen katıdır</strong> (~5.200–5.700 °C, neredeyse Güneş yüzeyi).
          Normalde bu sıcaklıkta demir sıvı olurdu; ama üzerindeki muazzam basınç (atmosferin ~3,5 milyon katı) atomları öyle kenetler ki sıvı hâle geçemezler. Sıcaklık eritmek ister, <strong className="text-sky-300">basınç kazanır</strong>.
        </p>
      </ArticleSection>

      {/* Geç cila */}
      <ArticleSection title="Altının ve platinin gizemi: Geç Cila">
        <p className="leading-relaxed text-slate-300">
          Altın, platin, iridyum — hepsi güçlü “demir-sever” elementler; teoride hepsinin çekirdeğe gömülmesi gerekirdi. Oysa kabukta olması gerekenden çok daha fazlası var.
          Açıklama <strong className="text-sky-300">geç cila</strong>: çekirdek kapandıktan sonra Dünya'ya değerli metaller açısından zengin bir asteroit yağmuru çarptı; bu metaller artık inemeyeceği için mantoda ve kabukta sıkışıp kaldı.
          Yani parmağındaki <strong className="text-amber-300">altın yüzük, büyük olasılıkla uzaydan gelen bir hediyedir</strong>.
        </p>
      </ArticleSection>

      {/* 4. Manyetik kalkan */}
      <ArticleSection title="Manyetik Kalkan: Dünya'nın görünmez zırhı">
        <div className="mb-6 flex justify-center">
          <svg viewBox="0 0 300 160" className="w-full max-w-md">
            <defs>
              <radialGradient id="earthg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#0c4a6e" /></radialGradient>
            </defs>
            {[28, 44, 62].map((rx, i) => (
              <ellipse key={i} cx="205" cy="80" rx={rx} ry={rx * 1.4} fill="none" stroke="#38bdf8" strokeOpacity={0.5 - i * 0.12} strokeWidth="1.5" />
            ))}
            {[40, 80, 120].map((y, i) => (
              <g key={i}>
                <line x1="10" y1={y} x2="120" y2={y} stroke="#fbbf24" strokeWidth="2" strokeOpacity="0.8" />
                <path d={`M120 ${y} q30 ${(80 - y) * 0.6} 60 ${(80 - y)}`} fill="none" stroke="#fbbf24" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d={`M118 ${y - 4} l6 4 -6 4`} fill="none" stroke="#fbbf24" strokeWidth="2" />
              </g>
            ))}
            <circle cx="205" cy="80" r="22" fill="url(#earthg)" />
            <text x="120" y="150" fontSize="9" fill="#fbbf24">Güneş rüzgârı →</text>
            <text x="183" y="135" fontSize="9" fill="#7dd3fc">manyetik kalkan</text>
          </svg>
        </div>
        <p className="mb-4 leading-relaxed text-slate-300">
          Manyetik alanımız bir çubuk mıknatıstan değil, kendi kendini besleyen bir dinamodan — <strong className="text-sky-300">jeodinamodan</strong> — doğar.
          Sıvı dış çekirdekteki erimiş demir, ısı farkları ve Dünya'nın dönüşü (Coriolis) yüzünden burgu biçiminde akar; elektriği ileten bu metalin hareketi akımlar, akımlar da manyetik alan üretir. Döngü kendini sürdürür.
        </p>
        <p className="mb-4 leading-relaxed text-slate-300">
          <strong className="text-amber-300">Manyetik kutuplar coğrafi kutuplarla aynı değildir</strong> ve sabit durmaz — gezinirler. Manyetik kuzey son on yıllarda Kanada'dan Sibirya'ya doğru yer yer yılda 50–60 km hızla kaydı; navigasyon modellerinin erken güncellenmesi gerekti. Dahası, jeolojik zamanda manyetik kuzey ile güney <strong className="text-sky-300">yer değiştirir</strong> (son tam dönüş ~780.000 yıl önce).
        </p>
        <p className="leading-relaxed text-slate-300">
          Bu kalkan, Güneş rüzgârının yüklü parçacıklarını saptırarak atmosferi korur; kutuplara yönlenen parçacıkların gazlarla çarpışması ise <strong className="text-sky-300">kutup ışıklarını (aurora)</strong> yaratır.
          Mars çarpıcı bir karşıt örnektir: çekirdeği soğuyup jeodinamosu durunca kalkanı kayboldu, Güneş rüzgârı atmosferini söküp aldı. Dünya ile Mars arasındaki en derin fark, <strong className="text-amber-300">çekirdeklerinin kaderidir</strong>.
        </p>
        <ArticleImage
          className="dn-img"
          src="/articles/dunya/kutup-isiklari.webp"
          ratio="1600 / 1067"
          alt="Uzaydan çekilmiş gece görüntüsü: Dünya'nın kavisli ufku boyunca uzanan yeşil, dalgalı bir ışık perdesi; üstte yıldızlar, altta şehir ışıkları."
          caption="Kutup ışıkları, Uluslararası Uzay İstasyonu'ndan. Manyetik kalkanın görülebilen tek kısmı bu: alanın kutuplara yönlendirdiği Güneş rüzgârı parçacıkları atmosferdeki oksijen ve azota çarpınca ortaya çıkan ışık. Yani bu yeşil perde, kalkanın kendisi değil — kalkanın çalıştığının kanıtı."
          credit="NASA Johnson Space Center · kamu malı"
        />
      </ArticleSection>

      {/* İnteraktif: gezegen karşılaştırma */}
      <ArticleSection kicker="İNTERAKTİF · KARŞILAŞTIR" title="Dünya mı, komşuları mı?">
        <div className="dn-img-pair">
          <ArticleImage
            className="dn-img"
            src="/articles/dunya/venus-kuresi.webp"
            ratio="1600 / 1600"
            alt="Turuncu-sarı tonlarda, yüzeyi girintili çıkıntılı görünen küresel gezegen görüntüsü."
            caption="Venüs'ün yüzeyi. Bu bir fotoğraf DEĞİL: gezegen kalıcı bulut örtüsü yüzünden görünür ışıkta fotoğraflanamıyor. Gördüğünüz şey Magellan sondasının radar ölçümlerinin bilgisayarda bir küreye giydirilmesi; renkler de yapıları belirginleştirmek için eklendi."
            credit="NASA/JPL · kamu malı"
          />
          <ArticleImage
            className="dn-img"
            src="/articles/dunya/mars-kuresi.webp"
            ratio="1600 / 1600"
            alt="Kızıl-kahve renkli gezegen küresi; ortasında uzun ve derin bir kanyon sistemi görünüyor."
            caption="Mars — bu gerçek bir optik görüntü. Ortadaki yara izi Valles Marineris. Manyetik kalkanını kaybettikten sonra atmosferi de suyunu da yitirdi."
            credit="NASA · kamu malı"
          />
        </div>

        <PlanetCompare />
      </ArticleSection>

      {/* 5. Ay'ın doğuşu */}
      <ArticleSection title="Ay'ın doğuşu: bir gezegenin Dünya'ya çarpması" max="max-w-4xl">
        <p className="mb-6 leading-relaxed text-slate-300">
          En geniş kabul gören açıklama <strong className="text-sky-300">Dev Çarpışma Hipotezi</strong>'dir. ~4,5 milyar yıl önce, Mars büyüklüğünde bir embriyo — <strong className="text-amber-300">Theia</strong> — genç Dünya'ya teğet çarptı.
          Her iki cismin dış katmanları eriyip buharlaştı; saçılan kızgın enkaz bir halka oluşturdu ve bu halka kendi <Link href="/articles/newton" className="article-ilink">kütleçekimiyle</Link> birleşerek Ay'ı yaptı. Theia'nın metalik çekirdeği ise büyük olasılıkla Dünya'nınkiyle birleşti.
        </p>
        <ArticleImage
          className="dn-img mx-auto max-w-md"
          src="/articles/dunya/ay-yakin-yuz.webp"
          ratio="1600 / 1600"
          alt="Ay'ın tam yüzü: gri, kraterlerle kaplı yüzey ve koyu renkli geniş düzlükler."
          caption="Ay'ın Dünya'ya bakan yüzü (LRO mozaiği). Yoğunluğu düşük, çekirdeği minik — çünkü çarpışmada ağır metal Dünya'da kaldı, uzaya saçılan hafif dış katmanlardı."
          credit="NASA/GSFC/Arizona State University · kamu malı"
        />

        <CardGrid items={moonEvidence} cols={2} />
        <p className="my-6 leading-relaxed text-slate-300">
          Yeni bir iddia daha da çarpıcı: çekirdek–manto sınırında, Afrika ve Pasifik'in altında kıta büyüklüğünde iki yoğun kütle (<strong className="text-sky-300">LLSVP</strong>) var. Bazı araştırmacılar bunların <strong className="text-amber-300">Theia'nın çarpışmadan arta kalan parçaları</strong> olabileceğini öne sürdü. Doğruysa, bizi var eden çarpışmanın kanıtını yalnızca gökyüzünde değil, gezegenin kalbinde de taşıyoruz.
        </p>
        <h3 className="mb-4 mt-8 text-xl font-bold text-white">Ay'ın Dünya üzerindeki devasa etkileri</h3>
        <CardGrid items={moonEffects} cols={3} />
      </ArticleSection>

      {/* 6. Eşsiz özellikler */}
      <ArticleSection title="Dünya'yı diğer gezegenlerden ayıranlar" max="max-w-4xl">
        <CardGrid items={uniqueFeatures} cols={2} />
      </ArticleSection>

      {/* 7. Niş bilgiler */}
      <ArticleSection title="Az bilinen detaylar" max="max-w-4xl">
        <CardGrid items={nicheFacts} cols={2} />

        {/* Big Bertha BİLEREK izotop kanıtı kartlarının yanına konmadı: o kartın
            tezi "Ay kayaları Dünya'ya benziyor, demek ki Ay Dünya malzemesinden".
            Bu kayanın Dünya'ya benzemesinin sebebi ise muhtemelen GERÇEKTEN
            Dünya'dan gelmiş olması — kanıtı onunla resmetmek döngüsel olurdu.
            Kendi başına ise yazının en güzel merak kutusu. */}
        <div className="mx-auto mt-8 max-w-lg">
          <ArticleImage
            className="dn-img"
            src="/articles/dunya/apollo-ay-kayasi.webp"
            ratio="1600 / 1247"
            alt="Laboratuvar zemininde duran iri, açık gri kaya; yüzeyinde koyu renkli parçalar ve yanında ölçek çubuğu var."
            caption="“Big Bertha”: Apollo 14'ün getirdiği 9 kilogramlık kaya. 2019'daki bir çalışmaya göre içindeki bir parça büyük olasılıkla Ay'a ait değil — bir çarpmayla Dünya'dan fırlamış, bilinen en yaşlı Dünya kayası olabilir. Yani astronotlar Ay'a gidip bizim kayamızı geri getirmiş olabilirler."
            credit="NASA · kamu malı"
          />
        </div>
      </ArticleSection>

      {/* Yatay zaman çizelgesi */}
      <HorizontalTimeline heading="Dünya'nın oluşum çizelgesi" items={timeline} />

      {/* Mini test */}
      <ArticleSection kicker="MİNİ TEST" title="Ne kadar anladın?">
        <ArticleQuiz questions={quizQs} />
      </ArticleSection>

      {/* Sonuç */}
      <ArticleSection center title="Sonuç">
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-300">
          Doğru uzaklık, sıvı su, levha tektoniği, oksijenli atmosfer ve dengeleyici bir uydu — bir gaz bulutunun çökmesiyle başlayan ve şiddetli çarpışmalarla şekillenen bu hikâye, bildiğimiz tek yaşam dolu dünyayı ortaya çıkardı.
          Dünya'yı eşsiz kılan tek bir özellik değil; <span className="text-sky-300">milyarlarca yıl boyunca birbirini tamamlayan koşulların inanılmaz uyumudur</span>.
        </p>
      </ArticleSection>

      <div className="relative z-10">
        <ArticleBibliography items={refs} accent={ACCENT} />
      </div>

      <ArticleFooter tagline="Ayağımızın altındaki kayadan başımızın üstündeki gökyüzüne — evrenin bize sunduğu en olağanüstü tesadüflerden biri. 🌍" />
    </ArticleShell>
  );
}
