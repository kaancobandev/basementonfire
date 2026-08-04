'use client';

import dynamic from 'next/dynamic';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection,
  HorizontalTimeline, ArticleQuiz, ArticleBibliography, ArticleFooter,
} from '@/app/components/article/ArticleBlocks';
import SourceCompare, { type CompareSource } from '@/app/components/article/SourceCompare';
import ArticleImage from '@/app/components/article/ArticleImage';
import { ACCENT, BG, BONE, GARNET, GOLD, IRON, InView, MythNote, SourceNote, Stat, WidgetSkeleton, buyuk, tokenHex, tr } from './ui';
import { ReadingProgress, PerdeNav } from './chrome';
import {
  SofraSahnesi,
  BozkirSeridi, KavimlerGocu, KaganlikSemasi, BarbarPanosu, IsimAgaci, KilicIfsa,
  HaracSayaci, SurKesiti, SayiDedektoru, UcTabut, EfsaneKarsilastirici,
} from './widgets';
import { HonoriaKarar, ItalyaAnketi, OtagKarari } from './decisions';
import { CatalaunumPoster } from './posters';
import { refs } from './refs';
import {
  OTAG, GOC, KAGAN, BARBAR, ISIM, BLEDA, BLEDA_SOURCES, NUMBERS,
  SURLAR, HONORIA, AETIUS, CATALAUNUM, ITALYA, ITALYA_SOURCES,
  OLUM, EFSANE, SONRASI, timeline, quizQs,
} from './data';

// Tek ağır modül: CSS transition'lı SVG savaş animasyonu. InView + poster ile
// ekrana girene kadar indirilmiyor (bkz. [[article-interactive-heavy-pattern]]).
const CatalaunumSim = dynamic(() => import('./sim-catalaunum'), { ssr: false, loading: () => <WidgetSkeleton height={560} /> });

// Bozkır gecesi: yanık toprak siyahı → garnet → kor. Kanuni'nin kobalt gecesinden
// ve Fatih'in takıntı mavisinden BİLEREK uzak: bu bir saray makalesi değil.
const HERO_COLORS: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]] = [
  [0.039, 0.027, 0.024], [0.176, 0.067, 0.078], [0.886, 0.384, 0.169], [0.851, 0.643, 0.255],
];

const PERDES = [
  { id: 'perde-0', label: 'Tahta kadeh' },
  { id: 'perde-1', label: 'Bozkırdan gelenler' },
  { id: 'perde-2', label: 'Kağan' },
  { id: 'perde-3', label: 'İsim' },
  { id: 'perde-4', label: 'İki kağan, bir taht' },
  { id: 'perde-5', label: 'Haraç ve surlar' },
  { id: 'perde-6', label: 'Yüzük' },
  { id: 'perde-7', label: 'Catalaunum' },
  { id: 'perde-8', label: 'İtalya ve Papa' },
  { id: 'perde-9', label: 'Otağ' },
  { id: 'perde-10', label: 'Efsane' },
  { id: 'perde-11', label: 'Yıkmadığı Roma' },
];

const bledaSources: CompareSource[] = BLEDA_SOURCES.map((s) => ({
  name: s.name, role: s.role, text: s.text, color: tokenHex[s.color],
}));

const italyaSources: CompareSource[] = ITALYA_SOURCES.map((s) => ({
  name: s.name, role: s.role, text: s.text, color: tokenHex[s.color],
}));

export default function AtillaClient() {
  return (
    <ArticleShell accent={ACCENT} bg={BG} title="Atilla">
      <style>{`
        @keyframes atilla-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          [style*="atilla-fade"] { animation: none !important; }
        }
      `}</style>

      <ReadingProgress />
      <PerdeNav items={PERDES} />

      <ArticleHero
        title="Atilla"
        fullTitle="Atilla — Bozkırdan Gelen Kağan"
        eyebrow="449 · OTAĞ · TAHTA BİR KADEH"
        gradientText="Atilla"
        colors={HERO_COLORS}
        object3d="sword"
        subtitle={<>Bozkırdan geldi, öldü, geriye efsanesi kaldı. Ve Batı Roma&rsquo;yı &mdash; herkesin sandığının aksine &mdash; o yıkmadı.</>}
      />

      <ArticleLede
        points={[
          'Merkez soru: geriye hiçbir şey bırakmayan adam neden unutulmadı?',
          `${tr(NUMBERS.olum)}’te öldü, imparatorluk ${tr(NUMBERS.imparatorlukSonu)}’da bitti — ama adı bin yıl boyunca hanedanlar arasında paylaşılamadı`,
        ]}
      >
        Bu sayfada Atilla’yı bir korku hikâyesi olarak değil, bir <strong>devlet</strong> olarak okuyacaksın: nasıl kurulduğu,
        neyle işlediği ve neden sahibiyle birlikte durduğu. Kaynaklar çelişince hangisinin doğru olduğunu sana söylemeyeceğiz —
        ikisini yan yana koyup kararı sana bırakacağız. Kural: <strong>sıfat değil, sayı.</strong>
      </ArticleLede>

      {/* ══════════ PERDE 0 — Cold open: tahta kadeh ══════════ */}
      <div id="perde-0" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 0 · COLD OPEN · ${OTAG.year} · ${buyuk(OTAG.place)}`} title="Tahta kadeh">
          <p className="leading-relaxed text-slate-300">
            Doğu Roma’dan bir elçilik heyeti Tuna’nın kuzeyine geliyor. Heyetin kâtibi {OTAG.witness} — ve bugün
            Atilla hakkında elimizdeki <strong>tek görgü tanığı</strong> o. Akşam ziyafete çağrılıyorlar. Priskos gördüğü
            her şeyi yazıyor, çünkü işi bu.
          </p>

          {/* Sahne artık düz liste değil, kurulan bir sofra. Okurun dokunduğu ilk
              şey de Perde 1'den buraya, hero'nun hemen ardına çekildi. */}
          <div className="my-7">
            <SofraSahnesi />
          </div>

          {/* ÜÇLÜ STAT KALDIRILDI. Üç sebep:
              (1) "2.100 libre altın" Perde 5'in doruk rakamı; burada bağlamsız
                  duruyor ve HaracSayaci'nın varış noktasını beş perde önceden
                  yakıyordu.
              (2) ui.tsx'teki kendi kuralımızı çiğniyordu: GOLD yalnız haraç ve
                  miras bağlamında kullanılır ki Perde 5'te altın sayfaya
                  sızdığında okur bunu HİSSETSİN — altın Perde 0'da giriyordu.
              (3) "1 tahta kadeh" bir ölçüm değil süstü; "sıfat değil sayı"
                  kuralının tam tersi. */}

          <SourceNote>
            Priskos’un eseri <em>kayıp</em>. Elimizdeki bu sahne, başkalarının onun metninden yaptığı alıntılardan geliyor —
            yani Atilla’yı üç kat cam ardından görüyoruz. Bu makale boyunca hangi camdan baktığımızı sana söyleyeceğiz.
          </SourceNote>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 1 — Bozkırdan gelenler ══════════ */}
      <div id="perde-1" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 1 · ONDAN ÖNCEKİLER" title="Bozkırdan gelenler">
          <p className="leading-relaxed text-slate-300">
            Atilla’yı anlatan çoğu metin 434’te başlar: tahta çıkıyor, Avrupa titriyor. Bu, hikâyenin ortasından
            başlamaktır. Çünkü 434’te devraldığı şey bir çadır ve bir kılıç değildi — <strong>işleyen bir devletti.</strong>
          </p>

          <div className="my-7">
            <BozkirSeridi />
          </div>

          <p className="leading-relaxed text-slate-300">
            Ve bu zincirin arkasında çok daha eski bir şey var: MÖ 209’da Mete Han’ın kurduğu teşkilat. Orduyu onluk
            birimlere bölen, tebaa boyları tek bir siyasî çatı altında toplayan o kalıp, altı yüzyıl sonra Tuna
            boyunda hâlâ çalışıyordu.
          </p>

          <ArticleImage
            src="/articles/atilla/hun-kazani.webp"
            ratio="1600 / 1067"
            alt="Yeşil pas tutmuş, ağzı kırık bronz bir kazan; gövdesinde kabartma bantlar, altında açık işli yüksek bir ayak. Yanında iki kazan daha duruyor."
            caption="Asya Hunlarından bir bronz kazan (Moğolistan Milli Müzesi). Bu tipteki kazanlar Moğolistan’dan Karpat Havzası’na kadar bulunuyor — Hun hareketinin en somut fizikî izi. Atilla’ya ait değil; bir halkın güzergâhının işareti."
            credit="Gary Todd · CC0"
          />

          <MythNote title="Peki Avrupa Hunları ile Asya Hunları aynı mı?">
            Bu soru uzun süre yalnız filolojiyle tartışıldı: ~313 tarihli Sogd Mektupları Luoyang’ı basanlara Sogdca
            &laquo;xwn&raquo; diyor ve bu, iki ad arasındaki en güçlü köprü. 2025’te {tr(NUMBERS.genom)} antik genomluk bir çalışma
            tartışmaya kemik ekledi: Karpat Havzası’ndaki bazı <strong>elit</strong> gömülerle Asya Hun elitleri arasında
            doğrudan soy bağı bulundu. Aynı çalışma ikinci bir şey daha söylüyor ve o da önemli: nüfusun tamamı için
            kitlesel bir göç <em>yok</em> — çeşitlilik yüksek. İkisi birlikte okununca çıkan tablo şu:
            soyu bozkırdan gelen bir hanedan, çok halklı bir federasyonun başında.
          </MythNote>

          <div className="my-7">
            <KavimlerGocu />
          </div>

          {/* GOC.punch buradan KALDIRILDI: zinciri tamamlayan okur o cümleyi
              widget'ın kendi kapanışında zaten alıyor; hemen altında tekrar
              basılınca kazanılmış cümle bedava tekrara dönüşüyordu. */}
          <p className="leading-relaxed text-slate-300">
            Atilla 434’te bu dünyanın içine doğdu ve onu devraldı. Sonraki yirmi yıl,
            bir adamın kurduğu düzenin değil, hazır bulduğu basıncı nasıl kullandığının
            hikâyesidir.
          </p>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 2 — Kağan ══════════ */}
      <div id="perde-2" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 2 · DEVLET" title="Kağan">
          <p className="leading-relaxed text-slate-300">
            Roma kaynakları Atilla için &laquo;kral&raquo; anlamına gelen kelimeleri kullanır, çünkü ellerinde başka kelime yok.
            Ama oturduğu koltuk bir Roma tahtı değil. Kendi mantığı, kendi meşruiyet kaynağı ve kendi
            arıza noktaları olan bir yapı — ve o yapıyı bilmeden Atilla’nın yaptıklarının çoğu keyfî görünür.
          </p>

          <div className="my-7">
            <KaganlikSemasi />
          </div>

          <ArticleImage
            src="/articles/atilla/deforme-kafatasi.webp"
            ratio="1600 / 2133"
            alt="Müze vitrininde, önden görünen bir insan kafatası. Kafatası tepeye doğru belirgin biçimde uzatılmış ve arkaya doğru eğimli; yüz kısmı normal oranlarda."
            caption="Mozs (Macaristan), ~5. yüzyıl: bebeklikte sarılarak biçimlendirilmiş bir kafatası. Karpat Havzası’nda Hun döneminin en görünür arkeolojik işaretlerinden. ⚠ Uygulama yalnız Hunlara özgü değil — aynı bölgede başka topluluklarda ve Avrasya’nın başka yerlerinde de görülür."
            credit="Ceoil · CC0"
          />

          <p className="leading-relaxed text-slate-300">
            Şemadaki en önemli kutu <strong>{KAGAN.ikili.ad}</strong>. Onu şimdi aklında tut: Perde 4’te Atilla’nın
            kardeşiyle olan meselesi, bu kutunun içinden çıkacak.
          </p>

          <h3 className="mt-10 text-xl font-bold text-white">Şimdi de bir kelimeyi kaldıralım</h3>
          <p className="mt-3 leading-relaxed text-slate-300">
            Bu halk hakkında yazılmış metinlerin çoğunda tek bir kelime bütün açıklamanın yerine geçer.
            O kelimeyi kullanmayacağız — ama nereden geldiğini ve neyi gizlediğini göstereceğiz.
            Çünkü onu çürüten kanıtların hepsi, tuhaf biçimde, kelimeyi kullanan tarafın kendi arşivinde duruyor.
          </p>

          <div className="my-7">
            <BarbarPanosu />
          </div>

          <p className="mt-6 text-lg font-semibold leading-relaxed text-slate-100">{BARBAR.punch}</p>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 3 — İsim ══════════ */}
      <div id="perde-3" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 3 · KELİMENİN KÖKÜ" title="Atilla ne demek?">
          <p className="leading-relaxed text-slate-300">
            Dünyanın en çok bilinen adlarından biri ve kökeni tartışmalı. Sebebi basit ve rahatsız edici:
            <strong> Hun dilinden elimizde üç kelime var.</strong> Üçü de yabancı kaynakların içine düşmüş
            tek tük kelimeler ve etimolojileri bile çekişmeli. Yani adın hangi dilden geldiğini,
            o dili tanımadan tartışıyoruz.
          </p>

          <div className="my-7">
            <IsimAgaci />
          </div>

          <p className="leading-relaxed text-slate-300">
            Dikkat çeken şey şu: {ISIM.okumalar[0].hat.toLowerCase()} ile {ISIM.okumalar[1].hat.toLowerCase()} farklı
            köklerden yola çıkıyor ama benzer bir anlam alanında buluşuyor. Adın hangi dilden geldiği belirsiz;
            ne söylediği konusunda kaynaklar şaşırtıcı biçimde yakın.
          </p>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 4 — İki kağan, bir taht ══════════ */}
      <div id="perde-4" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 4 · ${BLEDA.baslangic}-${BLEDA.bitis}`} title="İki kağan, bir taht">
          <p className="leading-relaxed text-slate-300">{BLEDA.devir}</p>
          <p className="mt-4 leading-relaxed text-slate-300">{BLEDA.son}</p>

          <div className="my-7 rounded-xl border p-5" style={{ borderColor: `${ACCENT}40`, background: `color-mix(in srgb, ${ACCENT} 7%, transparent)` }}>
            <div className="mb-2 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: ACCENT }}>ASIL MESELE</div>
            <p className="leading-relaxed text-slate-200">{BLEDA.kirilma}</p>
          </div>

          <p className="leading-relaxed text-slate-300">{BLEDA.punch}</p>

          <div className="my-8">
            <SourceCompare
              accent={ACCENT}
              event="445 · Bleda’nın ölümü"
              question="Atilla kardeşini öldürttü mü?"
              bottom="Üç sütun da aynı boşluğu gösteriyor: olayı gören kimse yazmadı. Elimizdeki en kesin cümle, olaydan yüz yıl sonra ve karşı taraftan geliyor."
              sources={bledaSources}
            />
          </div>

          <h3 className="mt-10 text-xl font-bold text-white">Ve aynı yıllarda bir çoban bir kılıç buluyor</h3>

          <div className="my-7">
            <KilicIfsa />
          </div>

          <ArticleImage
            src="/articles/atilla/viyana-kilici.webp"
            ratio="1440 / 833"
            alt="Altın kabzalı, hafif kavisli bir sabre ve üstünde kını. Kabza ve balçak kabartma altın işlemeli, kabza bileziğinde kırmızı ve mavi taşlar kakılı."
            caption="Viyana’daki Kunsthistorisches Museum hazine dairesinde yüzyıllardır “Atilla’nın Kılıcı” adıyla duran sabre. 1063 sonbaharında Kraliçe Ana Anastasia bunu Bavyera Dükü Otto von Nordheim’a hediye etmişti ve Macar sarayında Atilla’nın kılıcı sayılıyordu. Nesne gerçek; ad sonradan takıldı — biçim ve teknik onu Atilla’dan yaklaşık beş yüz yıl sonrasına koyuyor. Ve dikkat: bu bir sabre, yani kavisli. 5. yüzyıl bozkır kılıcı düz ve çift ağızlıydı."
            credit="Kunsthistorisches Museum, Viyana · kamu malı"
          />
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 5 — Haraç ve surlar ══════════ */}
      <div id="perde-5" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 5 · MAKİNE" title="Haraç ve surlar">
          <p className="leading-relaxed text-slate-300">
            Şimdi devletin nasıl <em>beslendiğine</em> geliyoruz. Atilla’nın Roma’yla ilişkisi bir yağma ilişkisi değil,
            bir <strong>ödeme planıdır</strong>: tutarı pazarlıkla belirlenen, gecikince birikmiş borç olarak hesaplanan,
            metne bağlanan bir akış.
          </p>

          <ArticleImage
            src="/articles/atilla/solidus-theodosius.webp"
            ratio="1600 / 1600"
            alt="Aşınmış bir altın sikke, ön yüzünde cepheden bakan miğferli ve zırhlı bir imparator büstü; çevresinde daire hâlinde Latince kabartma yazı."
            caption="II. Theodosius solidusu — haracın ödendiği paranın kendisi. Doğu Roma’nın Atilla’ya bağladığı yıllık ödeme 443’ten sonra, yaygın rakamla 2.100 Roma librası altına çıktı; bir libra 72 solidus ettiğine göre bu, her yıl bu sikkeden 151.200 tane demek. Ödemenin oraya nasıl geldiğini aşağıdaki sayaç basamak basamak gösteriyor."
            credit="CC0"
          />

          <div className="my-7">
            <HaracSayaci />
          </div>

          <p className="leading-relaxed text-slate-300">
            Ve bu, Atilla’nın en çok yanlış anlaşılan tarafını açıklıyor: neden Konstantinopolis’i almadı?
            Cevabı 447’de, surların önünde duruyor.
          </p>

          {/* Deprem ÖNCE anlatılır, sonra kaynak tartışması gelir. Tersi olduğunda
              okur bir olayın varlığını, o olayın tarihinin tartışmalı olduğunu
              söyleyen uyarı kutusundan öğreniyordu. */}
          <p className="mt-4 leading-relaxed text-slate-300">
            {SURLAR.deprem.yil}’de şehri bir deprem vuruyor. Surun uzun bölümleri ve{' '}
            {tr(SURLAR.deprem.kuleler)} kule çöküyor — Konstantinopolis, tarihinin en savunmasız
            anına, Hun ordusunun Trakya’da olduğu yılda giriyor. Sonra duvar{' '}
            {tr(SURLAR.onarim.gun)} günde yeniden örülüyor; onarımda hipodromun birbirine düşman
            iki fraksiyonu birlikte omuz veriyor. Atilla surların önüne geldiğinde karşısında
            yıkıntı değil, yeni bir duvar buluyor.
          </p>

          <MythNote title="Peki deprem tam olarak ne zaman oldu?">
            {SURLAR.deprem.tarihTartismasi}
          </MythNote>

          <ArticleImage
            src="/articles/atilla/theodosius-surlari.webp"
            ratio="1600 / 1060"
            alt="Aşağıdan çekilmiş, gökyüzüne karşı yükselen kalın bir sur duvarı; taş sıralarının arasında yatay kırmızı tuğla bantları, solda bir kule kütlesi, üstünde ot bitmiş yıkık taç."
            caption="Theodosius surları, bugünkü hâliyle. Taş sıraları arasındaki kırmızı tuğla bantları yapının imzası. ⚠ Ayakta duran her taş 5. yüzyıldan değil: duvar sonraki yüzyıllarda defalarca onarıldı ve 20. yüzyılda restore edildi."
            credit="Carole Raddato · CC BY-SA 2.0"
          />

          <div className="my-7">
            <SurKesiti />
          </div>

          <div className="my-7 rounded-xl border p-5" style={{ borderColor: `${GOLD}44`, background: `color-mix(in srgb, ${GOLD} 7%, transparent)` }}>
            <div className="mb-2 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: GOLD }}>BİN YIL SONRA</div>
            <p className="leading-relaxed text-slate-200">{SURLAR.köprü}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              O ikinci sınavı ayrıntısıyla anlatan ayrı bir makale var:{' '}
              <a href="/articles/fatih" className="article-ilink">Fatih Sultan Mehmed</a> — aynı duvar, bu kez düşüyor.
            </p>
          </div>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 6 — Yüzük ══════════ */}
      <div id="perde-6" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 6 · ${HONORIA.yil}`} title="Yüzük">
          <p className="leading-relaxed text-slate-300">
            {HONORIA.kisi} — {HONORIA.kim}. Hikâyenin bundan sonrası, bir kadının kendi hayatı üzerindeki
            kontrolünü geri alma girişiminin bir kıta ölçeğinde nasıl okunduğuyla ilgili.
          </p>

          <ArticleImage
            src="/articles/atilla/honoria-sikkesi.webp"
            ratio="1500 / 692"
            alt="Bir altın sikkenin iki yüzü yan yana. Solda incilerle bezeli saç ve gerdanlıkla sağa dönük bir kadın büstü; sağda uzun bir haç tutan kanatlı Zafer figürü."
            caption="Iusta Grata Honoria solidusu, Ravenna darbı. Perde 6’nın merkezindeki kadının elimizdeki tek çağdaş “portresi” bu — bir madalyon değil, tedavüldeki para."
            credit="Classical Numismatic Group · CC BY-SA 2.5"
          />

          <div className="my-7">
            <HonoriaKarar />
          </div>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 7 — Catalaunum ══════════ */}
      <div id="perde-7" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 7 · ${CATALAUNUM.yil}`} title="Catalaunum">
          <p className="leading-relaxed text-slate-300">
            451’de Galya’da karşılaşan iki ordunun komutanları birbirine yabancı değildi.
            Roma tarafında <strong>{AETIUS.ad}</strong> vardı — {AETIUS.unvan} ve Roma’nın Hunları içeriden tanıyan tek adamı.
          </p>

          <div className="my-7">
            <InView poster={<CatalaunumPoster />} minHeight={560}>
              <CatalaunumSim />
            </InView>
          </div>

          <p className="leading-relaxed text-slate-300">
            Muharebeyi anlatan kaynak, ölü sayısını da veriyor. Ve tam burada makalenin kuralı devreye giriyor:
            bir sayıyı beğenmemek yetmez, <strong>sınamak</strong> gerekir.
          </p>

          <div className="my-7">
            <SayiDedektoru />
          </div>

          <SourceNote>
            Rakamın kaynağı {CATALAUNUM.sayi.kaynak}. Abartılı ölü sayıları antik ve ortaçağ kroniklerinde
            kural sayılacak kadar yaygındır: sayı bir ölçüm değil, olayın büyüklüğüne dair bir <em>iddiadır</em>.
          </SourceNote>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 8 — İtalya ve Papa ══════════ */}
      <div id="perde-8" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 8 · ${ITALYA.yil}`} title="İtalya ve Papa">
          <p className="leading-relaxed text-slate-300">{ITALYA.aquileia}</p>

          <ArticleImage
            src="/articles/atilla/aquileia-kusatmasi.webp"
            ratio="1600 / 1199"
            alt="Ortaçağ elyazması tezhibi: solda mavi miğferli zırhlı atlılar mızraklarla saldırıyor, sağda burçlu ve kuleli bir şehir; üstte kırmızı mürekkeple Latince başlık, çevresinde çiçekli bordür."
            caption="Chronicon Pictum (1358): kırmızı satır “Rex atyla expugnat ciuitatem Aquilegiam” — Kral Atilla Aquileia şehrini zapt ediyor. ⚠ Olaydan ~900 yıl sonra Macaristan’da yapıldı; askerler 14. yüzyıl Avrupa zırhı içinde. Dönem tasviri değil — ama tam da bu yüzden Perde 10’un konusu."
            credit="Márk Kálti · kamu malı"
          />

          <div className="my-7 rounded-xl border p-5" style={{ borderColor: `${GARNET}44`, background: `color-mix(in srgb, ${GARNET} 7%, transparent)` }}>
            <div className="mb-2 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: GARNET }}>{buyuk(ITALYA.milano.baslik)}</div>
            <p className="leading-relaxed text-slate-200">{ITALYA.milano.metin}</p>
            <p className="mt-3 leading-relaxed" style={{ color: BONE }}>{ITALYA.milano.yorum}</p>
          </div>

          <p className="leading-relaxed text-slate-300">{ITALYA.mincio.olay}</p>
          <p className="mt-4 text-lg font-semibold leading-relaxed text-slate-100">{ITALYA.mincio.soru}</p>

          <div className="my-7">
            <ItalyaAnketi />
          </div>

          <div className="my-8">
            <SourceCompare
              accent={GARNET}
              event={`${ITALYA.yil} · Mincio ırmağı`}
              question="Atilla İtalya’dan neden döndü?"
              bottom="Dördü de aynı olayı anlatıyor ama dördü de aynı türden değil: üçü kayıt ya da hesap, dördüncüsü bin yıl sonra bir tarafın kendi duvarına yazdığı cevap. Birini seçip ötekileri silmek, elimizdeki kaynaklardan fazlasını bildiğimizi iddia etmek olurdu."
              sources={italyaSources}
            />
          </div>

          <ArticleImage
            src="/articles/atilla/raphael-mincio.webp"
            ratio="1600 / 1201"
            alt="Kemerli bir duvar freski: solda beyaz at üstünde papa ve kardinaller, sağda ürken atlı savaşçılar ve mızraklar, gökyüzünde kılıç taşıyan iki havari uçuyor, arkada yanan bir şehir."
            caption="Raffaello, Vatikan, 1514. Gökte Petrus ve Pavlus kılıçla beliriyor, Atilla’nın atlıları geri kaçıyor. Fresk olaydan ~1060 yıl sonra, papalığın kendi sarayının duvarına yapıldı: bir kayıt değil, Batı’nın kendi zaferini resmetmesi. ⚠ Bu, Atilla’nın BATIDAKİ portresidir. Türk hafızasında bu sahnenin karşılığı yoktur — orada aynı adam gökten inen bir cezanın önünde ürken figür değil, bozkırdan gelen bir kağandır."
            credit="Raffaello · kamu malı"
          />

          {/* Raffaello'nun KARŞI AĞIRLIĞI. Tek başına duran fresk okura yalnız bir
              yorumu gösteriyordu; aynı olayın mucizesiz anlatımı yanına gelince
              kararı okur veriyor. Makalenin "dört gelenek" tezinin görsel karşılığı. */}
          <ArticleImage
            src="/articles/atilla/leo-atilla-muzakere.webp"
            ratio="1300 / 745"
            alt="Yağlıboya tablo: solda zırhlı ve başında taçla duran Atilla elini uzatmış, arkasında çadırı ve askerleri; sağda papalık kıyafetiyle Leo ayakta konuşuyor, çevresinde kardinaller ve diz çökmüş figürler. Gökyüzü boş."
            caption="Aynı karşılaşma, mucizesiz anlatımı. Gökte kimse yok, Atilla ürkmüyor: solda zırhlı bir hükümdar, sağda ondan bir şey isteyen bir papa. İki tasvir yan yana durunca soru şu hâle geliyor — 451’de Mincio kıyısında bir ordu ilahi bir müdahaleyle mi durdu, yoksa iki taraf mı pazarlık etti? ⚠ Bu da bir kayıt değil: 18. yüzyıl, olaydan ~1300 yıl sonra ve yine bir Avrupalı ressamın elinden. Kanıt olarak değil, aynı olayın başka türlü de anlatılabildiğinin göstergesi olarak duruyor."
            credit="Francesco Solimena, 18. yy · kamu malı"
          />
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 9 — Otağ ══════════ */}
      <div id="perde-9" className="scroll-mt-16">
        <ArticleSection kicker={`PERDE 9 · ${SONRASI.dagilma[0].yil}`} title="Otağ">
          <p className="leading-relaxed text-slate-300">
            İtalya’dan döndükten sonraki yıl. Yeni bir evlilik, {OLUM.gelin} adında genç bir gelin, bir düğün gecesi.
            Ertesi sabah muhafızlar kapıyı kırmak zorunda kalıyor.
          </p>

          <div className="my-7">
            <OtagKarari />
          </div>

          <p className="leading-relaxed text-slate-300">
            Ölümden sonra yapılanlar da en az ölümün kendisi kadar dikkat çekici — çünkü hepsi
            <strong> geriye iz bırakmamak</strong> üzerine kurulu.
          </p>

          <div className="my-7">
            <UcTabut />
          </div>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 10 — Efsane ══════════ */}
      <div id="perde-10" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 10 · HAFIZA" title="Efsane">
          <p className="leading-relaxed text-slate-300">{EFSANE.giris}</p>

          <ArticleImage
            src="/articles/atilla/codex-regius-atlamal.webp"
            ratio="1600 / 300"
            alt="Yıpranmış parşömen üzerinde birkaç satır ortaçağ İzlanda el yazısı; sağ altta parşömende doğal bir delik var."
            caption="Codex Regius (GKS 2365 4to), folio 41r: Atlamál’ın başladığı yer — Atli’nin, yani Atilla’nın hain çizildiği şiir. Kaynağın tam sayfası daha büyük; bu görsel bir şerit hâlinde kırpılmış."
            credit="Árni Magnússon Enstitüsü · kamu malı"
          />

          <div className="my-7">
            <EfsaneKarsilastirici />
          </div>

          <div className="my-8 grid gap-5 sm:grid-cols-2">
            <ArticleImage
              src="/articles/atilla/bulgar-nominalia.webp"
              ratio="900 / 854"
              narrow
              alt="Açık bir elyazmasının iki sayfası; Kiril harfleriyle sık satırlar, aralarda kırmızı mürekkeple yazılmış baş harfler."
              caption="Bulgar Hanları Nominaliası, Moskova nüshası: Dulo hanedanını Avitohol ve İrnik’le başlatan liste. ⚠ Nüsha geç tarihli; İrnik = Ernak özdeşliği yaygın kabul görür, Avitohol = Atilla ise tartışmalıdır."
              credit="Kamu malı"
            />
            <ArticleImage
              src="/articles/atilla/chronicon-attila-taht.webp"
              ratio="1600 / 2080"
              narrow
              alt="Altın yaldızlı bir elyazması baş harfinin içinde tahtta oturan taçlı, sakallı bir kral; elinde asa, üzerinde sarı kaftan. Altta gotik yazıyla Latince metin."
              caption="Chronicon Pictum, 1358: Atilla taçlı ve tahtta, ilk Macar kralı olarak resmedilmiş. Alttaki satırlarda “Hungari sive Huni” — Macarlar yahut Hunlar — geçiyor. Tarih kaydı değil, hak iddiası belgesi."
              credit="Márk Kálti · kamu malı"
            />
          </div>

          <p className="leading-relaxed text-slate-300">
            Dikkat: bu dört metin <em>tarih kaydı</em> değil, <strong>hafıza belgesi</strong>. Ne olduğunu değil,
            kimin sahiplendiğini anlatıyorlar. Ve bir hükümdar için bu ikincisi bazen daha uzun ömürlü çıkıyor.
          </p>
        </ArticleSection>
      </div>

      {/* ══════════ PERDE 11 — Yıkmadığı Roma ══════════ */}
      <div id="perde-11" className="scroll-mt-16">
        <ArticleSection kicker="PERDE 11 · KAPANIŞ" title="Yıkmadığı Roma">
          <p className="leading-relaxed text-slate-300">
            Atilla öldükten sonra imparatorluğun dağılması uzun sürmedi. Bir devlet kurumlarıyla ayakta duruyorsa
            hükümdarını gömer ve yoluna devam eder; kişisiyle ayakta duruyorsa onunla birlikte durur.
          </p>

          <ol className="my-7 space-y-3">
            {SONRASI.dagilma.map((d) => (
              <li key={d.yil} className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <span className="shrink-0 font-mono text-sm font-bold" style={{ color: GARNET }}>{d.yil}</span>
                <span className="leading-relaxed text-slate-300">{d.olay}</span>
              </li>
            ))}
          </ol>

          <div className="my-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Stat value={tr(NUMBERS.olum)} label="Atilla öldü" color={ACCENT} />
            <Stat value={tr(NUMBERS.imparatorlukSonu)} label="imparatorluk bitti" color={GARNET} />
            <Stat value={tr(SONRASI.omur)} label="yıl sürdü" color={IRON} />
            <Stat value={tr(NUMBERS.romaSonu)} label="Batı Roma düştü" color={GOLD} />
          </div>

          <h3 className="mt-10 text-xl font-bold text-white">Peki Roma’yı kim yıktı?</h3>
          <p className="mt-3 leading-relaxed text-slate-300">{SONRASI.roma.olay}</p>

          <ArticleImage
            src="/articles/atilla/romulus-augustulus.webp"
            ratio="1600 / 1554"
            alt="Cepheden bakan miğferli bir imparator büstü taşıyan altın sikke; kenarında daire hâlinde Latince yazı, yüzey hafif aşınmış."
            caption="Romulus Augustulus solidusu — Batı Roma’nın son imparatoru. Onu tahta çıkaran babası Orestes, yirmi yedi yıl önce Atilla’nın otağında Latince yazan kâtipti."
            credit="American Numismatic Society · CC0"
          />
          <p className="mt-4 leading-relaxed text-slate-300">{SONRASI.roma.tebaa}</p>

          <div className="my-7 rounded-xl border p-5" style={{ borderColor: `${GOLD}55`, background: `color-mix(in srgb, ${GOLD} 8%, transparent)` }}>
            <div className="mb-2 text-[0.62rem] font-bold tracking-[0.2em]" style={{ color: GOLD }}>
              {buyuk(SONRASI.roma.orestes.baslik)}
            </div>
            <p className="leading-relaxed text-slate-200">{SONRASI.roma.orestes.metin}</p>
            <p className="mt-3 text-lg font-bold leading-relaxed" style={{ color: BONE }}>{SONRASI.roma.orestes.punch}</p>
          </div>

          {/* Kapanış tezi */}
          <div className="my-8 space-y-4 border-l-2 pl-5" style={{ borderColor: ACCENT }}>
            {SONRASI.kapanis.map((k, i) => (
              <p
                key={i}
                className={i === SONRASI.kapanis.length - 1 ? 'text-xl font-bold leading-relaxed' : 'leading-relaxed text-slate-300'}
                style={i === SONRASI.kapanis.length - 1 ? { color: ACCENT } : undefined}
              >
                {k}
              </p>
            ))}
          </div>

          <p className="leading-relaxed text-slate-400">
            Bu seri, kendisinden sonra işlemeye devam eden makineler kuran adamları anlatıyor:{' '}
            <a href="/articles/sezar" className="article-ilink">Sezar</a>,{' '}
            <a href="/articles/augustus" className="article-ilink">Augustus</a>,{' '}
            <a href="/articles/fatih" className="article-ilink">Fatih</a> ve{' '}
            <a href="/articles/kanuni" className="article-ilink">Kanuni</a>. Atilla serinin negatifi:
            makine kurmadı, makinenin kendisiydi. Hunların Avrupa’ya gelene kadarki yolu için{' '}
            <a href="/articles/turkler" className="article-ilink">Türklerin Tarihi</a>, karşısındaki devletin
            hikâyesi için <a href="/articles/rome" className="article-ilink">Roma İmparatorluğu</a>.
          </p>
        </ArticleSection>
      </div>

      <HorizontalTimeline heading="MÖ 209’dan 476’ya" items={timeline} />

      {/* ⚠ `relative z-10` ŞART: ArticleShell'in .art-ambient katmanı
          position:fixed + z-index:0 ve TAMAMEN OPAK. Sarmalayıcı olmadan
          Kaynakça ve altındaki sosyal ayak (İlgili Konular kartları) o katmanın
          ALTINDA boyanıyor — DOM'da var, rengi doğru, sadece görünmüyor.
          Fatih/kanuni/sezar hep sarmalıyor; burada unutulmuştu. */}
      <div className="relative z-10">
        <ArticleQuiz questions={quizQs} />
        <ArticleBibliography items={refs} accent={ACCENT} />
      </div>

      <ArticleFooter tagline="Bozkırdan geldi, öldü, geriye efsanesi kaldı." />
    </ArticleShell>
  );
}
