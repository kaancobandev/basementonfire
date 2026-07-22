'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection, HorizontalTimeline, ArticleQuiz, ArticleBibliography, ArticleFooter,
} from '@/app/components/article/ArticleBlocks';
import ArticleImage from '@/app/components/article/ArticleImage';
import { ACCENT, InView, WidgetFrame, WidgetSkeleton } from './ui';
import { BodyActivity, DoseSlider, DecayChain, refs } from './widgets';
import { HalfLifePoster, PenetrationPoster, GeigerPoster } from './posters';
import { quizQs, timeline } from './data';

// Canvas/ses modülleri: yalnızca görünür alana girince indirilir (InView + dynamic).
const HalfLifeSim = dynamic(() => import('./sim-halflife'), { ssr: false, loading: () => <WidgetSkeleton height={560} /> });
const PenetrationBox = dynamic(() => import('./sim-penetration'), { ssr: false, loading: () => <WidgetSkeleton height={440} /> });
const GeigerCounter = dynamic(() => import('./sim-geiger'), { ssr: false, loading: () => <WidgetSkeleton height={380} /> });

export default function RadyoaktiviteClient() {
  return (
    <ArticleShell accent={ACCENT} title="Radyoaktivite">
      <style>{`
        /* ArticleImage'ın slate varsayılanlarını makalenin radyum yeşiline bağla. */
        .rd-img {
          --ai-caption: #cbd5e1;
          --ai-credit: #7f9159;
          --ai-border: rgba(163,230,53,0.2);
          --ai-fill: rgba(163,230,53,0.05);
          --ai-mark: rgba(163,230,53,0.26);
        }
        .rd-img-pair { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; align-items: start; }
        @media (max-width: 700px) { .rd-img-pair { grid-template-columns: 1fr; } }
      `}</style>
      <ArticleHero
        title="Radyoaktivite"
        fullTitle="Radyoaktivite — Bulutlu Bir Paris Günü ve İçinizdeki Saniyede 8.000 Bozunma"
        eyebrow="ATOMLAR SABIRSIZ · İNTERAKTİF DOSYA"
        object3d="nucleus"
        subtitle={<>Bir kadının el yazısı, öldüğünden bir asır sonra hâlâ <strong className="font-semibold text-lime-300">ışıma yapıyor.</strong> Aşağı kaydır: çekirdek <em className="not-italic text-amber-300">bozunmaya</em> başlasın.</>}
      />

      <ArticleLede points={[
        'Bozunma bir mekanizma değil, bir kumar: çekirdeğin hafızası yok',
        'Yarılanma süresi ısıyla, basınçla, kimyayla değiştirilemez — onu ikna edemezsiniz',
        'Şu an vücudunuzda saniyede yaklaşık 7.000–8.000 çekirdek parçalanıyor. Bu tamamen normal',
      ]}>
        Radyoaktivite, kararsız bir atom çekirdeğinin — dışarıdan hiçbir enerji almadan, kendiliğinden ve rastgele bir
        anda — parçacık ya da ışıma yayarak daha kararlı bir çekirdeğe dönüşmesidir. 1896&apos;da Henri Becquerel kazara
        buldu, Marie Curie adını koydu, kuantum mekaniği 1928&apos;de nedenini açıkladı.
      </ArticleLede>

      {/* ── Açılış: Curie'nin defterleri ── */}
      <ArticleSection>
        <p className="text-lg leading-relaxed text-slate-300">
          Paris&apos;te, Fransa Ulusal Kütüphanesi&apos;nin bir odasında kurşun kaplı kutular duruyor. İçlerinde Marie
          Curie&apos;nin defterleri var. Bir bilim tarihçisi bu defterlere bakmak isterse önce bir sorumluluk
          feragatnamesi imzalıyor. Çünkü kâğıtlar hâlâ radyoaktif ve öyle kalmaya da niyetliler. Curie&apos;nin
          defterlerine bulaşan radyum-226&apos;nın yarılanma süresi 1.600 yıl. Yani o defterler, bugün yaşayan hiç
          kimsenin göremeyeceği kadar uzun bir süre boyunca tehlikeli olmaya devam edecek.
        </p>
        <ArticleImage
          className="rd-img mx-auto max-w-sm"
          src="/articles/radyoaktivite/curie-defterleri.webp"
          ratio="1600 / 2380"
          priority
          alt="Açılmış eski bir defterin sayfaları: mürekkeple yazılmış el yazısı satırlar, sayılar ve tablolar."
          caption="Marie Curie'nin laboratuvar defterlerinden biri (1899–1902). Asıl defterler Paris'te kurşun kaplı kutularda saklanıyor; bu tarama o kutuların içeriğini gösteriyor, kutuları değil."
          credit="Wellcome Collection · CC BY 4.0"
        />

        <p className="mt-5 text-lg leading-relaxed text-slate-300">
          Bir kadının el yazısı, öldüğünden bir asır sonra hâlâ ışıma yapıyor. Radyoaktivite hakkında bilmeniz gereken
          ilk şey bu: <strong className="text-lime-300">atomlar, sizin takviminizle çalışmıyor.</strong>
        </p>
      </ArticleSection>

      {/* ── Becquerel ── */}
      <ArticleSection kicker="1896" title="Bulutlu bir gün, kapalı bir çekmece">
        <div className="space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            Hikâye 1896&apos;da Henri Becquerel&apos;in tembelliğiyle başlıyor. Becquerel, uranyum tuzlarının güneş ışığı
            aldıktan sonra ışıdığını düşünüyordu. Planı basitti: tuzu güneşe koy, sonra fotoğraf plakasına bastır,
            plakada iz kalıp kalmadığına bak.
          </p>
          <p>
            Ama Paris o hafta bulutluydu. Becquerel deney malzemelerini bir çekmeceye tıktı ve güneşin çıkmasını
            bekledi. Birkaç gün sonra plakayı yine de banyo etti, muhtemelen &quot;boş çıkacak ama bir bakayım&quot;
            hissiyle.
          </p>
          <p className="border-l-2 pl-5 text-xl font-medium text-slate-100" style={{ borderColor: ACCENT }}>
            Plakada uranyum tuzunun net, koyu izi vardı. Karanlıkta, hiçbir dış enerji kaynağı olmadan, kendini
            fotoğrafın üzerine kazımıştı.
          </p>
          <p>
            O ana kadar fizikte enerji her zaman bir yerden geliyordu. Güneşten, ateşten, bir kolun ittirmesinden.
            Becquerel&apos;in çekmecesindeki taş ise kendi kendine enerji salıyordu ve durmuyordu. Marie Curie bu
            davranışa iki yıl sonra bir isim verdi: <strong className="text-white">radyoaktivite</strong>. Sonra da bu
            isimle yaşayıp bu isimle öldü.
          </p>
        </div>

        <ArticleImage
          className="rd-img mt-8"
          src="/articles/radyoaktivite/curie-laboratuvar.webp"
          ratio="1600 / 1116"
          alt="Siyah beyaz laboratuvar fotoğrafı: bir kadın ve bir erkek, ahşap masalarda duran cam düzenekler ve ölçüm aletleri arasında çalışıyor."
          caption="Marie ve Pierre Curie laboratuvarlarında (yaklaşık 1900). Radyoaktivite adını buradaki ölçümler koydurttu: Pierre'in elektrometresi, ışımanın havayı iletken hâle getirmesini sayıya çeviriyordu."
          credit="Wikimedia Commons · kamu malı"
        />

        <div className="rd-img-pair mt-8">
          <ArticleImage narrow
            className="rd-img"
            src="/articles/radyoaktivite/becquerel-portre.webp"
            ratio="1600 / 2152"
            alt="Uzun sakallı, koyu ceketli bir adamın 19. yüzyıl sonu stüdyo portresi."
            caption="Henri Becquerel. Ailede üç kuşak fizikçi vardı; keşfi yapan bu Henri (1852–1908)."
            credit="Kamu malı"
          />
          <ArticleImage narrow
            className="rd-img"
            src="/articles/radyoaktivite/becquerel-plaka.webp"
            ratio="492 / 397"
            alt="Eski bir fotoğraf plakasının taraması: koyu zemin üzerinde soluk lekeler ve ortada haç biçiminde belirgin açık bir iz."
            caption="Becquerel'in plakası. Ortadaki keskin haç, uranyum tuzunun izi değil: araya konan Malta haçı biçimli metalin gölgesi. Tuzun kendi izi çevredeki bulanık kararmadır — ışınları metalin durdurduğu yerde iz oluşmamış."
            credit="Kamu malı"
          />
        </div>
      </ArticleSection>

      {/* ── Çekirdeğin içi ── */}
      <ArticleSection title="Atomun içinde ne oluyor?">
        <div className="space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            Bir atom çekirdeğini, birbirinden nefret eden ama tokalaşmak zorunda kalan insanlarla dolu bir asansör gibi
            düşünün. Protonların hepsi pozitif yüklü, yani birbirlerini şiddetle itiyorlar. Onları bir arada tutan şey,
            çok kısa mesafede çalışan ama inanılmaz güçlü olan <strong className="text-white">güçlü nükleer kuvvet</strong>.
            Doğadaki dört temel <Link href="/articles/fizik-101" className="article-ilink">kuvvetten</Link> biri — ve
            gündelik hayatta hiç karşılaşmadığınız tek şey.
          </p>
          <p>
            Küçük çekirdeklerde bu iş kolay. Asansör tenha, herkes rahat. Ama çekirdek büyüdükçe, itme kuvveti tüm
            çekirdek boyunca etki ederken, yapıştırıcı görevi gören güçlü kuvvet sadece komşularına ulaşabiliyor.
            Uranyuma geldiğinizde asansörde 92 proton var ve durum artık sürdürülemez.
          </p>
          <p>
            Çekirdek bunu çözmenin bir yolunu buluyor: bir parçasını fırlatıp atıyor. Buna{' '}
            <strong className="text-white">bozunma</strong> diyoruz. Ve işin tuhaf tarafı şu: çekirdek bunu ne zaman
            yapacağına karar vermiyor. Kimse karar vermiyor. Alfa bozunması,{' '}
            <Link href="/articles/cift-yarik" className="article-ilink">kuantum</Link> tünellemesi denen bir hileyle
            gerçekleşiyor — parçacık, aslında aşamayacağı bir enerji duvarının içinden bir olasılıkla sızıyor. 1928&apos;de
            George Gamow (ve bağımsız olarak Gurney ile Condon) bunu hesapladığında, radyoaktivitenin neden bu kadar dik
            başlı olduğu anlaşıldı: <strong className="text-amber-300">bu bir mekanizma değil, bir kumar.</strong>
          </p>
        </div>
      </ArticleSection>

      {/* ── YILDIZ ETKİLEŞİM: kafanın karıştığı yerde ── */}
      <ArticleSection title="Hafızası olmayan zar" max="max-w-4xl">
        <div className="mx-auto max-w-3xl space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            Yarılanma süresi kavramı, çoğu insanın kafasında yanlış oturuyor. &quot;Yarılanma süresi 1.600 yıl&quot;
            cümlesi, atomun 1.600 yıl yaşadığı anlamına gelmiyor.
          </p>
          <p>
            Şöyle düşünün. Bir stadyum dolusu insana birer madeni para verdiniz ve her dakika bir kez atmalarını
            söylediniz. Yazı gelen oturuyor. Bir dakika sonra stadyumun yaklaşık yarısı ayakta. İki dakika sonra çeyreği.
            Ama ayakta kalan o inatçı adamın parası, hiç oynamamış birinin parasından farklı değil. Yorulmuyor,
            yaşlanmıyor, &quot;sıra bende&quot; diye düşünmüyor. Her atışta şansı tam olarak yüzde elli.
          </p>
        </div>

        {/* Etkileşim tam burada: okur "yarılanma süresi"ni yeni okudu. */}
        <div className="mt-8">
          <InView poster={<WidgetFrame hero kicker="İNTERAKTİF · YILDIZ MODÜL" title="1.000 atom. Hangisinin söneceğini kimse bilmiyor." hint="Kaydırınca etkileşimli sürüm yüklenir."><HalfLifePoster /></WidgetFrame>} minHeight={560}>
            <HalfLifeSim />
          </InView>
        </div>

        <div className="mx-auto mt-8 max-w-3xl space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            Radyoaktif çekirdekler de böyle. Dünya&apos;nın kabuğunda şu an duran bir uranyum-238 atomu, 4,5 milyar
            yıldır orada. Ve önümüzdeki bir saniyede bozunma olasılığı, dün yapay olarak üretilmiş bir uranyum-238
            atomuyla birebir aynı. <strong className="text-white">Atomların hafızası yok.</strong>
          </p>
          <p>
            Bu yüzden yarılanma süresi asla değişmez, asla hızlandırılamaz, sıcaklık ya da basınçla oynanamaz. Bozunma
            çekirdeğin içinde olup biter; sıcaklık, basınç ve kimya ise elektronları ilgilendirir. Radyoaktif atık
            probleminin neden bu kadar can sıkıcı olduğunu buradan anlayabilirsiniz.{' '}
            <strong className="text-amber-300">Onu ikna edemezsiniz.</strong>
          </p>
        </div>
      </ArticleSection>

      {/* ── Üç ışıma + nüfuz kutusu ── */}
      <ArticleSection title="Kâğıt, folyo, kurşun" max="max-w-4xl">
        <div className="mx-auto max-w-3xl space-y-5 text-lg leading-relaxed text-slate-300">
          <p>Çekirdek parçasını attığında genelde üç şeyden birini fırlatıyor.</p>
          <p>
            <strong className="text-amber-300">Alfa</strong>, iki proton ve iki nötrondan oluşan şişko bir top. Ağır
            olduğu için havada birkaç santim gidip duruyor. Bir kâğıt parçası onu durdurur. Deriniz onu durdurur.
            &quot;Demek ki zararsız&quot; diye düşünmeyin: Alexander Litvinenko, 2006&apos;da Londra&apos;da bir bardak
            çayla polonyum-210 içtiğinde alfa yayıcısı vücudunun içine girmişti. Kâğıt orada bir işe yaramıyor.{' '}
            <strong className="text-white">Alfa yayıcıları dışarıda zararsız, içeride acımasızdır.</strong>
          </p>
          <p>
            <strong className="text-cyan-300">Beta</strong>, çekirdekten fırlayan bir elektron (ya da pozitron). Daha
            hafif, daha hızlı, birkaç metre gidiyor. Bir alüminyum folyo, kalın bir kitap onu keser.
          </p>
          <p>
            <strong className="text-violet-300">Gama</strong>, hiçbir şey fırlatmaz. Sadece ışıktır. Aşırı yüksek
            enerjili bir foton. Kütlesi olmadığı için maddenin arasından süzülür. Onu durdurmak için kurşun, kalın beton,
            birkaç metre su gerekir. Çernobil&apos;de reaktörün üstüne helikopterlerden kurşun neden döküldü diye merak
            ettiyseniz, cevabın bir parçası bu.
          </p>
        </div>

        <div className="mt-8">
          <InView poster={<WidgetFrame kicker="İNTERAKTİF · SÜRÜKLE" title="Kâğıt, folyo, kurşun" hint="Kaydırınca etkileşimli sürüm yüklenir."><PenetrationPoster /></WidgetFrame>} minHeight={440}>
            <PenetrationBox />
          </InView>
        </div>
      </ArticleSection>

      {/* ── Geiger: radyasyonu duymak ── */}
      <ArticleSection kicker="SESLİ · KULAKLIK ÖNERİLİR" title="Radyasyon neye benziyor?" max="max-w-4xl">
        <div className="mx-auto max-w-3xl">
          <p className="text-lg leading-relaxed text-slate-300">
            Radyasyonun kokusu, rengi, tadı yok. Onu ancak dolaylı olarak fark edebiliyoruz — mesela bir gazın içinden
            geçen parçacık bir iyon izi bırakınca, devre bunu bir tık sesine çeviriyor. Aşağıdaki sayacı açın (sessiz
            başlar) ve doğal fonu dinleyin: şu an, bu odada, saniyede birkaç kez.
          </p>

          <ArticleImage
            className="rd-img mt-6"
            src="/articles/radyoaktivite/bulut-odasi-alfa.webp"
            ratio="1600 / 900"
            alt="Karanlık bir hazne içinde, bir noktadan dışa doğru fışkıran kısa ve kalın beyaz sis izleri."
            caption="Bulut odasında alfa parçacıklarının izleri. Parçacıkların kendisini görmüyoruz; geçtikleri yerde yoğuşan buharı görüyoruz — sayacın tık sesinin gözle görülen hâli."
            credit="Nuledo · CC BY-SA"
          />
        </div>
        <div className="mt-8">
          <InView poster={<WidgetFrame kicker="İNTERAKTİF · SES" title="Sanal Geiger sayacı" hint="Kaydırınca yüklenir. Sessiz başlar — sesi siz açarsınız."><GeigerPoster /></WidgetFrame>} minHeight={380}>
            <GeigerCounter />
          </InView>
        </div>
      </ArticleSection>

      {/* ── Sen ne kadar radyoaktifsin ── */}
      <ArticleSection title="Kötü haber: siz de radyoaktifsiniz" max="max-w-4xl">
        <div className="mx-auto max-w-3xl space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            Şu an bu yazıyı okurken vücudunuzun içinde saniyede yaklaşık 7.000 ile 8.000 arasında atom çekirdeği
            parçalanıyor.
          </p>
          <p>
            Büyük kısmı potasyum-40 yüzünden. Potasyum hayati bir element, kaslarınız ve sinirleriniz onsuz çalışmaz.
            Ama doğadaki her 10.000 potasyum atomundan yaklaşık biri, 1,25 milyar yıl yarılanma süreli, radyoaktif bir
            versiyon. Onu vücudunuzdan ayıklamanın imkânı yok, çünkü kimyasal olarak normal potasyumla tıpatıp aynı.
            Geri kalanı büyük ölçüde karbon-14, yani nefes aldığınız ve yediğiniz her şeyden aldığınız radyoaktif
            karbon. Toplamı{' '}
            <Link href="/articles/mol" className="article-ilink">bir mol maddedeki</Link> atom sayısının yanında hiç
            kalır — ama saniyede binlerce çekirdek, hiç durmadan.
          </p>
        </div>

        <div className="mt-8">
          <BodyActivity />
        </div>

        <div className="mx-auto mt-8 max-w-3xl space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            Yani evet, muz radyoaktiftir. Ama internetteki o meşhur &quot;muz eşdeğer dozu&quot; tablosu biraz
            sahtekârdır. Vücudunuz potasyum seviyesini sıkı biçimde sabit tutar. Fazladan bir muz yediğinizde fazla
            potasyum idrarla gider ve toplam radyoaktivite yükünüz birkaç saat içinde eski hâline döner. Muz dozu,
            gerçek bir birikimden çok, insanlara &quot;radyasyon&quot; kelimesinin kendi başına bir felaket ilanı
            olmadığını anlatan bir pedagoji numarasıdır. Yanınızda uyuyan bir insan da size doz verir. Kimse bu yüzden
            ayrı yataklarda yatmıyor.
          </p>
        </div>

        <div className="mt-8">
          <DoseSlider />
        </div>
      </ArticleSection>

      {/* ── Saat ── */}
      <ArticleSection title="Atomlar saat gibi çalışıyor">
        <div className="space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            Radyoaktivitenin en kullanışlı özelliği, tam da onu bu kadar inatçı yapan şey: hiçbir şey oranını
            değiştiremez. Bu, elinizde <strong className="text-white">ayarı bozulamayan bir saat</strong> olduğu anlamına
            gelir.
          </p>
          <p>
            Atmosferin üst katmanlarında kozmik ışınlar sürekli olarak karbon-14 üretir. Bitkiler onu soluyor, hayvanlar
            bitkileri yiyor, sizin dişinizde de var. Ama canlı öldüğü anda karbon alımı durur ve içindeki karbon-14
            sessizce azalmaya başlar. Willard Libby 1949&apos;da bunu bir tarihleme yöntemine çevirdi. Buzul içinde
            bulunan Ötzi&apos;nin yaklaşık 5.300 yıllık olduğunu, ölmüş bir adamın hücrelerindeki karbonun ne kadar
            tükendiğine bakarak biliyoruz.
          </p>
          <p>
            Sonrasında insanlar işi daha da tuhaflaştırdı. 1950&apos;ler ve 60&apos;lardaki atmosferik nükleer bomba
            denemeleri, atmosferdeki karbon-14 seviyesini neredeyse iki katına çıkardı ve testler yasaklandıktan sonra bu
            seviye yavaşça düşmeye başladı. Bu keskin tepe, biyoloji için bir hediye oldu. Bir hücrenin
            DNA&apos;sındaki karbon-14 oranına bakarak, o hücrenin hangi yıl civarında oluştuğunu söyleyebiliyorsunuz.
            İsveçli araştırmacılar bu yöntemle beyin hücrelerinin yaşını ölçtüler.{' '}
            <strong className="text-white">Nükleer silah denemeleri, insan beyninin kendini yenileyip yenilemediğini
            anlamamıza yardım etti.</strong> Bilim bazen böyle çalışıyor.
          </p>
        </div>
      </ArticleSection>

      {/* ── Oklo ── */}
      <ArticleSection kicker="1,7 MİLYAR YIL ÖNCE" title="Gabon'da kendiliğinden çalışan bir reaktör">
        <div className="space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            1972&apos;de bir Fransız nükleer tesisinde bir ölçüm tutmadı. Gabon&apos;un Oklo bölgesinden gelen uranyum
            cevherinde, olması gerekenden daha az uranyum-235 vardı. Kayıp miktar küçüktü ama uranyumun izotop oranı
            evrenin her yerinde aynıdır. Kaçırılmış olabilirdi. Çalınmış olabilirdi.
          </p>
          <p>
            Gerçek daha iyiydi. Yaklaşık 1,7 milyar yıl önce, o kaya damarlarında doğal bir nükleer fisyon reaktörü
            kendiliğinden çalışmaya başlamıştı. Yeraltı suyu nötronları yavaşlatarak moderatör görevi görüyordu. Reaktör
            ısındıkça su buharlaşıyor, tepkime yavaşlıyor, kaya soğuyunca su geri geliyor ve tepkime yeniden başlıyordu.
            Kendi kendini düzenleyen bir sistem, birkaç yüz bin yıl boyunca, ortalama 100 kilovat civarında güç üreterek
            çalıştı.
          </p>
          <p className="rounded-2xl border p-5 text-xl font-medium text-slate-100" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 7%, transparent)` }}>
            İnsanlık ilk reaktörünü 1942&apos;de kurduğunu sanıyordu. Dünya bizi yaklaşık 1,7 milyar yıl geçmişti.
          </p>
        </div>
      </ArticleSection>

      {/* ── Radyum kızları ── */}
      <ArticleSection title="Parlayan kızlar">
        <div className="space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            Radyum keşfedildiğinde insanlar ona bayıldı, çünkü karanlıkta parlıyordu ve o dönemde parlayan her şey modern
            demekti. Radyumlu diş macunu, radyumlu krem, radyumlu içme suyu satıldı. Amerikalı sanayici Eben Byers,
            &quot;Radithor&quot; adlı radyumlu şişelerden yüzlercesini içti. 1932&apos;de öldüğünde çene kemiğinin büyük
            bölümü alınmıştı.
          </p>
          <p>
            Ama asıl hikâye New Jersey ve Illinois&apos;teki fabrikalarda çalışan genç kadınlarındı. Saat kadranlarına
            radyumlu boyayla rakam yazıyorlardı ve fırçanın ucunu inceltmek için dudaklarıyla şekillendiriyorlardı. Günde
            yüzlerce kez. Şirket onlara bunun zararsız olduğunu söylemişti. Kadınlar eğlence olsun diye tırnaklarını ve
            dişlerini boyayıp geceleri parlıyorlardı.
          </p>
          <p>
            Radyum, kimyasal olarak kalsiyuma benzediği için kemiklere yerleşir. Yıllar sonra çeneleri kırılmaya,
            kemikleri erimeye başladı. Grace Fryer ve arkadaşları şirkete dava açtı ve 1928&apos;de bir uzlaşma kopardı.
            O dava, işçinin işverenini meslek hastalığından sorumlu tutabilmesinin hukuki zeminini kurdu.{' '}
            <strong className="text-white">Bugün bir fabrikada güvenlik ekipmanı görüyorsanız, kısmen dişleriyle fırça
            inceltmiş kadınlar sayesinde.</strong>
          </p>
        </div>

        <div className="rd-img-pair mt-8">
          <ArticleImage narrow
            className="rd-img"
            src="/articles/radyoaktivite/radyum-kizlari.webp"
            ratio="821 / 650"
            alt="Siyah beyaz fabrika fotoğrafı: uzun masalarda yan yana oturmuş, önlerindeki küçük parçalar üzerinde çalışan genç kadınlar."
            caption="US Radium fabrikasında saat kadranı boyayan kadınlar (yaklaşık 1922–23). Fotoğrafta ne maske var ne eldiven: şirket boyanın zararsız olduğunu söylemişti."
            credit="Wikimedia Commons · kamu malı"
          />
          <ArticleImage narrow
            className="rd-img"
            src="/articles/radyoaktivite/radithor-sise.webp"
            ratio="1600 / 2406"
            alt="Küçük, koyu renkli cam şişe; üzerinde eski tarz etiketle ürün adı yazılı."
            caption="Radithor: radyumlu içme suyu. Eben Byers'ın yüzlercesini içtiği markadan bir şişe — Byers'ın kendi şişesi değil. Reçetesiz satılıyordu."
            credit="Wikimedia Commons · CC BY-SA"
          />
        </div>
      </ArticleSection>

      {/* ── Bozunma zinciri ── */}
      <ArticleSection kicker="HARİTA" title="Bir atomun on dört adımlık ölümü" max="max-w-4xl">
        <div className="mx-auto mb-8 max-w-3xl">
          <p className="text-lg leading-relaxed text-slate-300">
            Radyum ne demişti size? Aslında o da yolun ortasındaki bir durak. Uranyum-238 kararlı olana kadar durmuyor:
            sekiz alfa, altı beta, on dört adım. Yolda geçtiği duraklardan biri bir soy gaz — ve o gaz, tam da bu sitenin
            adını taşıyan yere sızıyor.
          </p>
        </div>
        <DecayChain />
      </ArticleSection>

      {/* ── Katil ve doktor ── */}
      <ArticleSection title="Aynı atom, hem katil hem doktor">
        <div className="space-y-5 text-lg leading-relaxed text-slate-300">
          <p>Bu yazıyı radyoaktiviteyi kötüleyerek bitirmek kolay olurdu ama dürüst olmaz.</p>
          <p>
            Her yıl dünya çapında on milyonlarca <Link href="/articles/tibbi" className="article-ilink">tıbbi</Link>{' '}
            görüntüleme, teknesyum-99m adlı bir izotopla yapılıyor. Altı saatlik yarılanma süresiyle, görevini yapıp
            neredeyse hemen kayboluyor. Radyoterapi, kanser tedavisinin belkemiği. Duman dedektörünüzün içinde minicik bir
            amerikyum-241 parçası var ve muhtemelen sizi ya da tanıdığınız birini bir gün uyandıracak.
          </p>
          <p>
            Voyager 1, 1977&apos;de fırlatıldı ve şu an güneş sisteminin dışında. Güneş oradan sadece parlak bir yıldız.
            Sonda hâlâ bizimle konuşuyor, çünkü içinde bir plütonyum-238 parçası var ve sabırla, hiçbir şeye aldırmadan
            bozunuyor. <strong className="text-white">İnsanlığın en uzaktaki elçisi, bir radyoaktif kalp taşıyor.</strong>
          </p>
        </div>

        <ArticleImage
          className="rd-img mx-auto mt-8 max-w-sm"
          src="/articles/radyoaktivite/plutonyum-238-pelet.webp"
          ratio="1600 / 1280"
          alt="Karanlıkta kendi ısısıyla turuncu-kırmızı parlayan, köşeleri yuvarlatılmış küçük bir blok."
          caption="Bir plütonyum-238 peleti: kendi bozunma ısısıyla akkor hâlde parlıyor. Voyager'ın onlarca yıldır konuşmasını sağlayan güç bu — dışarıdan hiçbir enerji almadan."
          credit="Kamu malı"
        />
      </ArticleSection>

      {/* ── Motor ── */}
      <ArticleSection title="Ayağınızın altındaki motor">
        <div className="space-y-5 text-lg leading-relaxed text-slate-300">
          <p>Son ve en büyük şey şu.</p>
          <p>
            <Link href="/articles/dunya" className="article-ilink">Dünya&apos;nın</Link> içi sıcak. Bunun bir kısmı
            gezegen oluşurken hapsolmuş ilkel ısı. Ama yüzeyden kaçan ısının kabaca yarısı, mantoda ve kabukta yavaşça
            bozunan uranyum, toryum ve potasyum-40 atomlarından geliyor — jeo-nötrino ölçümleri bunu doğruluyor. Bu ısı,
            mantonun akmasını, levhaların hareket etmesini sağlıyor.
          </p>
          <p>
            Levha tektoniği, karbonu atmosferden alıp kayaya gömen ve volkanlarla geri veren döngüyü sürdürüyor, yani
            Dünya&apos;nın termostatını. Manyetik alanı üreten dinamo aslında çoğunlukla iç çekirdeğin katılaşmasından ve
            ilkel ısıdan besleniyor — uranyum ile toryum demir çekirdeğe girmez, mantoda ve kabukta kalır. Ama o
            mantoyu sıcak tutarak çekirdeğin soğumasını yönlendiren ısı akışının bir ucu yine radyoaktivitede. Manyetik
            alan da güneş rüzgârını saptırıp atmosferimizin kaçmasını yavaşlatıyor.
          </p>
          <p>
            Bunların hiçbiri olmasaydı Dünya, Mars gibi soğuk, ölü ve rüzgârda savrulmuş olurdu — Mars&apos;ın esas
            talihsizliği küçük doğmasıydı, o yüzden çabuk soğudu ve dinamosunu kaybetti.
          </p>
          <p className="rounded-2xl border p-5 text-xl font-medium text-slate-100" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 7%, transparent)` }}>
            Yani radyoaktivite, Becquerel&apos;in çekmecesine kazara sızmış bir laboratuvar tuhaflığı değil. Gezegenin
            altında dönen motor, kemiklerinizdeki potasyum, buzuldaki adamın yaşını söyleyen saat ve Voyager&apos;ın
            kalbi. <span style={{ color: ACCENT }}>Atomlar sabırsız. İyi ki öyleler.</span>
          </p>
        </div>
      </ArticleSection>

      <HorizontalTimeline heading="Bir kazadan bir gezegen motoruna" items={timeline} />

      <ArticleSection kicker="MİNİ TEST" title="Anladın mı? Zar atalım">
        <ArticleQuiz questions={quizQs} />
      </ArticleSection>

      <div className="relative z-10">
        <ArticleBibliography items={refs} accent={ACCENT} />
      </div>

      <ArticleFooter tagline="Bir mekanizma değil, bir kumar. Ama bir milyon zar attığınızda kusursuz bir saat. ☢️" />
    </ArticleShell>
  );
}
