'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection, CardGrid, HorizontalTimeline, ArticleQuiz, ArticleBibliography, ArticleFooter,
} from '@/app/components/article/ArticleBlocks';
import { OlcekMerdiveni, IddiaAyraci, timeline, kultur } from './widgets';
import { refs } from './refs';

const ACCENT = '#818cf8';
const HERO_COLORS: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]] = [
  [0.02, 0.02, 0.07], [0.10, 0.09, 0.30], [0.36, 0.34, 0.85], [0.55, 0.32, 0.78],
];

function FunFact({ icon = '🧩', title = 'Ayrım', children }: { icon?: string; title?: string; children: ReactNode }) {
  return (
    <div className="mt-5 rounded-xl border border-indigo-400/30 bg-indigo-400/[0.06] px-5 py-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-bold text-indigo-200"><span aria-hidden>{icon}</span><span>{title}</span></div>
      <div className="m-0 text-sm leading-relaxed text-slate-300">{children}</div>
    </div>
  );
}

function Quote({ children, by }: { children: ReactNode; by?: string }) {
  return (
    <div className="mt-5 border-l-4 border-indigo-400/60 bg-indigo-400/[0.06] px-5 py-4">
      <p className="m-0 text-lg italic leading-relaxed text-indigo-100">{children}</p>
      {by && <p className="m-0 mt-2 text-sm not-italic text-slate-400">— {by}</p>}
    </div>
  );
}

// Kaynağın TÜRÜNÜ metnin içinde göstermek için. Makalenin tezi kaynak
// kalitesiyse, hakemsiz bir kaynağa yaslandığı yeri saklayamaz.
function Etiket({ tur, children }: { tur: 'hakemli' | 'onbaski' | 'rapor' | 'haber'; children: ReactNode }) {
  const stil = {
    hakemli: { ad: 'hakemli', renk: '#34d399' },
    onbaski: { ad: 'hakemli DEĞİL · ön baskı', renk: '#fbbf24' },
    rapor: { ad: 'hakemli DEĞİL · teknik rapor', renk: '#fbbf24' },
    haber: { ad: 'haber', renk: '#94a3b8' },
  }[tur];
  return (
    <span className="whitespace-nowrap text-[0.7rem]" style={{ color: stil.renk }}>
      [{stil.ad}] <span className="text-slate-400">{children}</span>
    </span>
  );
}

export default function ZihinClient() {
  return (
    <ArticleShell accent={ACCENT} title="Zihnini Yükleyebilir misin?">
      <ArticleHero
        title="Zihnini Yükleyebilir misin?"
        fullTitle="Zihnini Yükleyebilir misin? — Tek Soru Sandığın Üç Ayrı Soru"
        eyebrow="SİNİRBİLİM & FELSEFE · İNTERAKTİF DOSYA"
        subtitle={<>Beyni <em className="not-italic text-indigo-300">haritalayabilir</em> miyiz, haritayı <em className="not-italic text-indigo-300">çalıştırabilir</em> miyiz, çalışan şey <em className="not-italic text-indigo-300">“ben”</em> olur mu? Üçü aynı soru değil — ve yalnız ikisi ölçülebilir.</>}
        colors={HERO_COLORS}
        object3d="chip"
        gradientText="Yükleyebilir"
      />

      <ArticleLede points={[
        'Tek soru gibi görünen şey aslında üç ayrı soru: haritalama, çalıştırma, kimlik',
        'İlk ikisi ölçülebilir ve ölçülüyor — üçüncüsü tanımı gereği ölçüye kapalı',
        'Alanın kendi tahmini: insan emülasyonu için medyan yıl 2125, olasılık ~%40',
      ]}>
        “İnsan beynini bilgisayara aktarmak” cümlesi tek bir iddia gibi duruyor ama içinde üç ayrı soru var. Beynin bağlantı haritasını çıkarabilir miyiz? Çıkardığımız haritayı çalıştırabilir miyiz? Ve çalışan şey <em>sen</em> olur mu? İlk ikisi mühendislik ve bilim sorusudur; ölçülür, ilerleme rakamla takip edilir. Üçüncüsü ise deneyle çözülemez — ve alanın kendi teknik yol haritası bunu açıkça kapsam dışı bırakır. Bu yazı, hangi iddianın hangi rafa ait olduğunu ayırt etmeye yarıyor.
      </ArticleLede>

      {/* ══════════ AÇILIŞ: en yaygın yanlış anlama ══════════ */}
      <ArticleSection center max="max-w-3xl">
        <p className="text-xl leading-relaxed text-slate-200 sm:text-2xl">
          Konu açıldığında akla gelen ilk film <span className="text-indigo-300">Matrix</span>’tir. Ve tam da oradan başlamak gerekiyor — çünkü Matrix’te <em className="not-italic text-violet-300">kimse yüklenmez.</em>
        </p>
        <FunFact icon="🎬" title="Matrix yükleme filmi değil">
          <p className="m-0">
            Filmde insanların <strong className="text-white">biyolojik beyinleri</strong> kapsüllerde, kendi kafataslarında durur. Makineler o beyinlere yalnızca duyusal girdi besler. Neo gerçek dünyada uyandığında kendini bir kapsülün içinde, kablolara bağlı bulur — beyni hiçbir yere gitmemiştir.
          </p>
          <p className="m-0 mt-3">
            Filozof David Chalmers bunu açıkça yazar: Neo aslında bir <strong className="text-white">fanustaki beyindir</strong>. Bu, yüklemenin tersidir.
          </p>
        </FunFact>
        <p className="mt-6 leading-relaxed text-slate-300">
          Ayrım önemsiz bir ayrıntı değil, bütün konunun omurgası. <strong className="text-indigo-300">Bağlanmak</strong> ile <strong className="text-indigo-300">aktarılmak</strong> iki apayrı iddia: birincisi (beyne sinyal göndermek, beyinden sinyal okumak) bugün kısmen yapılıyor, ikincisi (zihni bir taşıyıcıdan diğerine taşımak) hiçbir ölçekte yapılmadı. Aynı sandığımız iki şey, aslında biri laboratuvarda diğeri yalnız kâğıt üzerinde.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          Küçük bir dürüstlük notu: <em>Reloaded</em> ve <em>Revolutions</em>’ta Ajan Smith kendini Bane’e kopyalar. Yön ters (dijitalden biyolojiye) ama bir bilincin üzerine yazma olayıdır. Doğru cümle şu: <strong className="text-slate-300">hiçbir insan karakterin zihni bir bilgisayara aktarılmaz.</strong>
        </p>
      </ArticleSection>

      {/* ══════════ TEZ ══════════ */}
      <ArticleSection kicker="ÇERÇEVE" title="Bir soru sandığın üç soru" max="max-w-4xl">
        <p className="mb-5 leading-relaxed text-slate-300">
          “Ne zaman olacak?” sorusunun cevaplanamamasının sebebi bilimin yavaşlığı değil. Sorunun içinde birbirine benzemeyen üç soru var ve bunlar aynı anda cevaplanamaz, çünkü aynı türden sorular değiller.
        </p>
        <CardGrid
          cols={3}
          items={[
            {
              icon: '🗺️',
              title: '1 · Haritalayabilir miyiz?',
              text: 'Mühendislik sorusu. Ölçülebilir, ilerliyor ve hızlanıyor. Bugün insan beyninin yaklaşık milyonda biri kadarı nanometre çözünürlüğünde haritalandı.',
            },
            {
              icon: '⚙️',
              title: '2 · Çalıştırabilir miyiz?',
              text: 'Bilimsel soru. Ölçülebilir ve AÇIK. Engel veri değil: hangi biyolojik ayrıntının gerekli olduğunu bilmiyoruz. 302 nöronlu bir solucanda bile bilmiyoruz.',
            },
            {
              icon: '🪞',
              title: '3 · O “ben” olur mu?',
              text: 'Ölçüye kapalı. Deneyle çözülemez — daha iyi tarayıcı da çözmez. Alanın kendi yol haritası bu seviyeyi incelemeyi açıkça reddediyor.',
            },
          ]}
        />
        <FunFact icon="📋" title="Bu bir yorum değil, alanın kendi kararı">
          <p className="m-0">
            Zihin yüklemenin kanonik metni olan 2008 tarihli <em>Whole Brain Emulation: A Roadmap</em>, altı başarı seviyesi tanımlar. En üstteki üçünü — toplumsal rol, öznel deneyim ve <strong className="text-white">kişisel kimlik</strong> — incelemeyi açıkça reddeder ve gerekçesini yazar: bu seviyeler <em>“anlaşılması güç ve işlevsel hale getirilmesi zor”</em>dur. Tablosunda o satırların karşısında tek bir not vardır: <em>“(Felsefi ölçütler söz konusu)”</em>.
          </p>
          <p className="m-0 mt-3">
            Yani ampirik tavan <strong className="text-white">seviye 5</strong>’tir: emülasyonun orijinal beyne başka herhangi bir beyinden daha çok benzemesi ve limitte <em>“kişiselleştirilmiş bir Turing testini”</em> geçmesi. Bunun ötesi ölçüm değil, yargıdır.
          </p>
          <p className="m-0 mt-3 text-xs text-slate-400">
            <Etiket tur="rapor">Sandberg &amp; Bostrom, Future of Humanity Institute, Oxford, 2008. Enstitü Nisan 2024’te kapandı.</Etiket>
          </p>
        </FunFact>
      </ArticleSection>

      {/* ══════════ SORU 1 ══════════ */}
      <ArticleSection kicker="1. SORU" title="Haritalayabilir miyiz? — Evet, ve hızlanıyor" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Bu, üç sorunun en iyi durumda olanı. 2024’te bir milimetreküp insan beyin kabuğu nanometre çözünürlüğünde yeniden kuruldu. İçinde yaklaşık <strong className="text-indigo-300">57.000 hücre</strong>, <strong className="text-indigo-300">150 milyon sinaps</strong> ve 230 milimetre kan damarı vardı. Verinin boyutu: <strong className="text-indigo-300">1,4 petabayt</strong>.
        </p>
        <p className="mb-4 leading-relaxed text-slate-300">
          Ölçek duygusu için: bu, hacmi bir milimetreküpe denk gelen, saç telinden ince bir doku dilimidir. Ve bütün bir insan beyninin yaklaşık <strong className="text-white">milyonda biridir</strong>.
        </p>
        <p className="mb-6 text-sm leading-relaxed text-slate-400">
          Doku “tipik bir insan beyni” de değil: 45 yaşında bir kadının, altındaki epileptik odağa ulaşmak için ameliyatla çıkarılan sol ön orta temporal girusu. Bilim çoğu zaman ideal örnekle değil, eline geçenle çalışır.
        </p>

        <OlcekMerdiveni />

        <p className="mb-4 leading-relaxed text-slate-300">
          Buradaki asıl haber, mutlak sayılar değil <strong className="text-indigo-300">eğim</strong>. Yeniden oluşturulan nöron başına maliyet 16.500 dolardan yaklaşık 100 dolara indi — <strong className="text-white">165 kat</strong> ucuzlama. 2025 tarihli bir durum raporu, alandaki üç temel yeteneğin de 2008’den beri belirgin biçimde ilerlediğini ve bu gidişin <em>“önceki öngörüleri geride bırakıyor olabileceğini”</em> söylüyor.
        </p>
        <p className="mb-4 text-xs leading-relaxed text-slate-400">
          <Etiket tur="onbaski">
            Bu paragraftaki maliyet ve kapasite rakamlarının kaynağı olan 2025 durum raporu hakemli bir yayın değil, bir arXiv ön baskısıdır; Fieldcrest Foundation tarafından fonlanmıştır ve raporun kendi çıkar beyanına göre yazarlarından biri bir beyin emülasyonu şirketinde hissedardır. Bunu yazıyoruz çünkü bu yazının bütün iddiası, bir bilginin nereden geldiğinin bilginin kendisi kadar önemli olduğu.
          </Etiket>
        </p>
        <p className="leading-relaxed text-slate-300">
          Aynı raporun dürüst tarafı da var: insan beynini on yılda taramak için tahminen <strong className="text-indigo-300">30.000 elektron mikroskobu</strong> gerekiyor. Bütün bir <em>fare</em> beynini beş yılda görüntülemek içinse 40–50 tane yetiyor. Alan hızlanıyor; ama hedefe olan mesafe, hızlanmadan büyük.
        </p>
      </ArticleSection>

      {/* ══════════ SORU 2 ══════════ */}
      <ArticleSection kicker="2. SORU" title="Çalıştırabilir miyiz? — İşin gerçekten açık olduğu yer" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Haritayı aldın diyelim. Şimdi onu çalıştıracaksın. İşte tam burada, sezgiye en aykırı bulgu çıkıyor karşımıza: <strong className="text-indigo-300">bağlantı haritası tek başına, sinyalin nasıl yayılacağını söylemeye yetmiyor.</strong> Ve bu bir tahmin değil, ölçüm.
        </p>
        <p className="mb-4 leading-relaxed text-slate-300">
          2023’te bir ekip, 302 nöronlu solucanda <strong className="text-indigo-300">23.433 nöron çiftini</strong> tek tek ışıkla uyarıp bütün beyni eş zamanlı görüntüledi. Sonuç açıktı: sinyal yayılımı, anatomiden yapılan tahminlerden <em>saptı</em>. Sebep de bulundu — nöronlar birbirine yalnızca “kablolarla” değil, elektron mikroskobunda <strong className="text-white">görünmeyen</strong> kimyasallarla da konuşuyor.
        </p>
        <Quote by="Randi ve ark., Nature, 2023">
          Ölçtüğümüz sinyal yayılım atlası, kendiliğinden oluşan sinirsel dinamiği anatomiye dayanan modellerden daha iyi öngörüyor.
        </Quote>
        <p className="mt-5 mb-4 leading-relaxed text-slate-300">
          Bunu şöyle düşünün: konnektom bir <strong className="text-indigo-300">kablolama şemasıdır</strong>. Şemada hiçbir kablonun direnci, hiçbir çipin modeli, ortamdaki hiçbir kimyasal yazmaz. Şema doğrudur — ama devreyi çalıştırmaya yetmez. Aynı sorunun bir başka yüzü:{' '}
          <Link href="/articles/bilgisayar" className="article-ilink">bir bilgisayarın nasıl çalıştığını</Link> anlatan devre şeması ile o bilgisayarı çalıştırmak da aynı şey değildir.
        </p>

        <FunFact icon="🧮" title="Bir nöron, bir düğüm değildir">
          <p className="m-0">
            Yapay sinir ağlarındaki “nöron” benzetmesi buradan da çöküyor. Tek bir gerçek kortikal nöronun girdi-çıktı davranışını taklit etmek için <strong className="text-white">5–8 katmanlı</strong> derin bir yapay ağ gerekti. Karmaşıklığın büyük kısmını NMDA reseptörleri taşıyor: onlar hesaptan çıkarıldığında tek gizli katman yetiyor.
          </p>
          <p className="m-0 mt-3 text-xs text-slate-400">
            <Etiket tur="hakemli">Beniaguev, Segev &amp; London, Neuron, 2021</Etiket>
          </p>
        </FunFact>

        <p className="mt-6 mb-4 leading-relaxed text-slate-300">
          Peki solucan? Tam konnektomu 1986’dan beri elimizde. Aralık 2024’te kapalı döngü, gövdeli bir C. elegans modeli gerçekçi zigzag hareketi ve kimyasal iz sürmeyi yeniden üretti — yani <strong className="text-white">kısmi ve davranışa özel bir sanal solucan artık var.</strong> Tam bir emülasyon ise yok. Ve eksik olan şey hâlâ harita değil: o modelde 302 nöronun yalnızca <strong className="text-indigo-300">beşinin</strong> gerçek elektriksel parametresi ölçülmüş durumda. Gerisi türetildi.
        </p>
        <p className="mb-4 leading-relaxed text-slate-300">
          Konnektom kampının en güçlü sonucu bile aynı sınırı kendi ağzıyla söylüyor. 2024’te bir ekip sineğin görme sisteminin bağlantı haritasını aldı, 45.669 nöron ve 1,5 milyon sinapsla model kurdu, bilinmeyen <strong className="text-indigo-300">734 parametreyi</strong> derin öğrenmeyle uydurdu — ve ortaya çıkan öngörüler 26 ayrı çalışmanın ölçtüğü aktiviteyle uyuştu. Gerçek bir başarı.
        </p>
        <p className="mb-4 leading-relaxed text-slate-300">
          Aynı makalenin sonuç cümlesi ise şu: <em>ne bir devrenin bağlantısı tek başına, ne de hesapladığı görev tek başına, o devrenin işleyiş mekanizmasını tek biçimde belirleyebilir.</em>
        </p>

        <FunFact icon="⚠️" title="Adil olalım: bu görüşün ciddi bir savunucusu var">
          <p className="m-0">
            “Konnektom yeter mi?” sorusunu kuruntu rafına koymak yanlış olur — burası tam da <strong className="text-white">açık olan</strong> yer. Princeton’dan Sebastian Seung’un <em>“Ben konnektomumum”</em> formülasyonu ciddi bir bilimsel pozisyondur. Nitekim 312 sinirbilimciye sorulduğunda <strong className="text-white">%70,5’i</strong> hafızanın esasen bağlantı desenlerinde ve sinaptik güçlerde tutulduğunu düşünüyor.
          </p>
          <p className="m-0 mt-3">
            Kuruntu olan tek şey <strong className="text-white">mutlak biçim</strong>: “harita çıkarılınca kopya alınmış olur.” Bir görüşü yalnızca en kötü savunucusuyla temsil etmek, bu yazının okura öğretmeye çalıştığı hatanın ta kendisidir.
          </p>
        </FunFact>

        <p className="mt-6 leading-relaxed text-slate-300">
          Bir de şu var: “yeterince veri toplarsak beyin kendiliğinden anlaşılır” fikri doğrudan sınandı. Araştırmacılar, çalışma prensibini transistör düzeyinde tam bildiğimiz bir mikroişlemciye — yalnızca <strong className="text-indigo-300">3.510 transistörlük</strong> MOS 6502’ye — sinirbilimin standart analiz yöntemlerini uyguladı. Yöntemler işlemcinin bilgi işleme hiyerarşisini ortaya çıkaramadı. Makalenin kendi dili temkinli: bu yaklaşımlar, <em>veri miktarından bağımsız olarak</em>, sinirsel sistemleri anlamlı biçimde anlamakta <em>yetersiz kalıyor olabilir</em>.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          Bunu bir kapatıcı kanıt gibi sunmak haksızlık olur ve benzetmenin bilinen sınırları var: 6502 tasarlandı, beyin evrimleşti; tek tip transistöre karşılık yüzlerce nöron tipi var; transistör deterministik, nöron değil. Güçlü bir <strong className="text-slate-300">uyarı</strong> olarak okuyun — bir bulguyu olduğundan güçlü göstermek de bir tür kuruntudur.
        </p>
      </ArticleSection>

      {/* ══════════ SORU 3 ══════════ */}
      <ArticleSection kicker="3. SORU" title="Çalışan şey “ben” olur mu? — Ölçüye kapalı" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Diyelim ki ilk iki soru çözüldü: harita çıktı, model çalışıyor, ekrandaki şey senin gibi konuşuyor, senin anılarını anlatıyor, senin şakalarını yapıyor. <strong className="text-indigo-300">O sen misin?</strong>
        </p>
        <p className="mb-5 leading-relaxed text-slate-300">
          Bu soru daha iyi bir tarayıcıyla çözülmez. Chalmers’ın argümanı basit ve rahatsız edici: senin moleküler bir ikizin olsun. Niteliksel olarak seninle özdeş — aynı yapı, aynı örgütlenme, aynı davranış. Ama sayısal olarak sen değil. <strong className="text-white">İkizi öldürürlerse sen yaşarsın; seni öldürüp ikizi bırakırlarsa sen ölürsün.</strong> Demek ki kişisel kimlik bir “örgütlenme değişmezi” değildir — ve yüklemenin örgütlenmeyi koruması, kimliği koruduğunun garantisi olamaz.
        </p>

        <FunFact icon="🎭" title="“Ünlü filozof yüklemenin işe yarayacağını söylüyor” — hayır, demiyor">
          <p className="m-0">
            Chalmers bu konuda kararsızdır ve bunu açıkça yazar: kimlik sorularında yerleşmiş bir görüşünün olmadığını, onları çok kafa karıştırıcı bulduğunu, iyimserliğe daha yatkın olmakla birlikte <strong className="text-white">yıkıcı bir yüklemeye girmeden önce tereddüt edeceğini</strong> söyler.
          </p>
        </FunFact>

        <p className="mt-6 mb-4 leading-relaxed text-slate-300">
          Derek Parfit daha da ileri gider: bu vakalarda sorunun bir cevabı <em>olmayabilir</em>. Kimlik “ya hep ya hiç” bir ilişkidir, oysa hayatta kalmada bizim için önemli olan şeylerin çoğu <strong className="text-indigo-300">derece</strong> ilişkileridir. Parfit’in hedefi, “kimlik sorusunun bir cevabı olmak <em>zorunda</em>” inancıdır.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-slate-400">
          Bunu bir uzlaşı gibi okumayın — tartışmalı bir pozisyondur. Karşı kampta örneğin Eric Olson gibi <em>animalist</em> filozoflar kesin cevap verir: o yükleme sen değilsin, çünkü sen bir hayvansın ve o hayvan geride kaldı. Anlaşılan tek şey şu: <strong className="text-slate-300">her kamp, daha yüksek tarama çözünürlüğünün bu soruyu çözmeyeceğinde hemfikir.</strong>
        </p>

        <FunFact icon="🔬" title="Bilinci ölçebiliyor muyuz? Dikkat, iki ayrı soru">
          <p className="m-0">
            “Bilinci ölçemiyoruz” cümlesi yanlıştır. Bilincin <strong className="text-white">düzeyini</strong> klinikte tek tek hastalarda ayırt edebiliyoruz. Ölçemediğimiz şey başka: bir <strong className="text-white">simülasyonda</strong> öznel deneyim olup olmadığı. Sebebi de teknik değil — elimizdeki bütün ölçüler biyolojik beyinde kalibre edildi.
          </p>
        </FunFact>

        <p className="mt-6 mb-4 leading-relaxed text-slate-300">
          Dahası, ana akım bir bilinç kuramı yüklemenin <strong className="text-indigo-300">ilkesel olarak</strong> başarısız olacağını söylüyor. Bütünleşik Bilgi Kuramı (IIT) işlevselciliği açıkça reddeder: ona göre bilinç, işlevin değil fiziksel nedensel yapının bir özelliğidir — dolayısıyla beynin kusursuz bir dijital simülasyonu bile <em>bilinçsiz</em> olurdu. Bu görüşe katılmak zorunda değilsiniz, ama görmezden gelmek yüklemeyi sessizce bir mühendislik sorunu saymak olur.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-slate-400">
          Ve IIT’nin kendisi de tartışmalı: 2023’te yüzden fazla araştırmacı onu “sözde bilim” ilan eden bir açık mektup imzaladı; <em>Nature Neuroscience</em> 2025’te eleştiriyi ve Tononi ekibinin reddiyesini <strong className="text-slate-300">aynı sayıda, ardışık sayfalarda</strong> bastı. Bir derginin ikisini birden basması “mesele kapandı” değil, tam tersi demektir.
        </p>

        <FunFact icon="🤝" title="Bilimin nasıl çalıştığının en güzel örneği">
          <p className="m-0">
            2025’te rakip iki bilinç kuramı, önceden kayıtlı ve taraf tutmayan tek bir deneyde karşılaştırıldı: 256 katılımcı, üç ayrı ölçüm yöntemi. Sonuç, ikisini de zorladı. Asıl çarpıcı olan ise yazar listesi — <strong className="text-white">Chalmers, Dehaene, Koch ve Tononi bu makalenin eş yazarlarıdır.</strong> Yani birbirine karşıt kampların temsilcileri, sonucu önceden bilmedikleri tek bir deneye birlikte imza attı.
          </p>
        </FunFact>
      </ArticleSection>

      {/* ══════════ SAYI ══════════ */}
      <ArticleSection kicker="İHTİMAL" title="Peki bir sayı verilebilir mi?" max="max-w-3xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Verilebilir — ama bizim tahminimiz olarak değil. 2025’te <strong className="text-indigo-300">312 sinirbilimciye</strong> soruldu. Korunmuş, statik bir beyin yapısının fotoğrafından herhangi bir uzun süreli hafızanın çıkarılabilmesine verdikleri medyan olasılık:
        </p>
        <div className="my-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { s: '%40', a: 'Yapıdan hafıza çıkarma olasılığı (medyan)' },
            { s: '2045', a: 'Solucan emülasyonu (medyan yıl)' },
            { s: '2065', a: 'Fare emülasyonu (medyan yıl)' },
            { s: '2125', a: 'İnsan emülasyonu (medyan yıl)' },
          ].map((x) => (
            <div key={x.s} className="rounded-xl border border-indigo-400/25 bg-indigo-400/[0.05] px-3 py-4 text-center">
              <div className="text-2xl font-black text-indigo-200">{x.s}</div>
              <div className="mt-1 text-[0.7rem] leading-snug text-slate-400">{x.a}</div>
            </div>
          ))}
        </div>
        <p className="mb-4 leading-relaxed text-slate-300">
          <strong className="text-white">%40, ne “kesin” ne “saçmalık”tır</strong> — ve tam olarak bu yüzden değerlidir. Aradaki bütün alan bu.
        </p>

        <FunFact icon="💰" title="Bu sayıyı çıkar beyanı olmadan basmak olmazdı">
          <p className="m-0">
            Anketin yazarları beyin koruma sektörünün içinden: biri bir beyin koruma kuruluşunda çalışıyor, biri bir biyostaz şirketinin CEO’su ve hissedarı. Çalışma da bu alandan bir hibeyle fonlandı.
          </p>
          <p className="m-0 mt-3">
            Ama işte kilit nokta: <strong className="text-white">sonuçlar fonlayanı pohpohlamıyor.</strong> Beyin koruma sektöründen para alan bir anket, insan emülasyonu için medyan <strong className="text-white">2125</strong> ve olasılık için <strong className="text-white">%40</strong> çıkarmış. Çıkar beyanı bir sonucu geçersiz kılmaz; okuma biçimini değiştirir. Ve burada sonuç beyanın <em>aleyhine</em> çıktığı için güveni artırıyor.
          </p>
        </FunFact>

        <p className="mt-6 leading-relaxed text-slate-300">
          Bir de adı, kurumu ve rakamı olan gerçek bir anlaşmazlık: Columbia Üniversitesi’nden Kenneth D. Miller, beyin ölçeğinde bir konnektoma ulaşmak için ne kadar süre gerektiği sorulduğunda kendi ifadesiyle <em>“vahşi bir tahmin: yüzyıllar”</em> demişti. Beyin Koruma Vakfı’ndan Kenneth Hayworth ise yazılı yanıt verip itiraz etti. Tartışma sürüyor. <strong className="text-slate-300">“Bilim insanları şöyle diyor” diye bir şey yok; kim, nerede, hangi gerekçeyle diyor — bilgi budur.</strong>
        </p>
      </ArticleSection>

      {/* ══════════ İDDİA AYRACI ══════════ */}
      <ArticleSection kicker="ALIŞTIRMA" title="Şimdi sen ayır" max="max-w-3xl">
        <p className="mb-2 leading-relaxed text-slate-300">
          Buraya kadar dört raf gördün: ölçüldü, açık soru, ölçüye kapalı, kuruntu. Aşağıdaki on iddiayı kendin sınıflandır — asıl mesele kaçını bildiğin değil, <strong className="text-indigo-300">dört rafın var olduğunu</strong> fark etmek.
        </p>
        <IddiaAyraci />
      </ArticleSection>

      {/* ══════════ KURUNTU ══════════ */}
      <ArticleSection kicker="KURUNTU" title="Dayanağı olmayanlar" max="max-w-4xl">
        <p className="mb-5 leading-relaxed text-slate-300">
          Şimdi net konuşalım. Aşağıdakiler “henüz kanıtlanmadı” değil — <strong className="text-indigo-300">dayanağı yok.</strong>
        </p>

        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-rose-400/25 bg-rose-400/[0.05] px-5 py-4">
            <div className="mb-2 text-sm font-bold text-rose-200">🧠 “Beynimizin %10’unu kullanıyoruz”</div>
            <p className="m-0 text-sm leading-relaxed text-slate-300">
              Kökeni bilim değil, reklamcılık: 1929 tarihli bir almanak ilanı. En ucuz çürütme metabolizmadan geliyor — beyin vücut ağırlığının %2’si ama enerjinin %20’sini yakar; evrim bu kadar pahalı bir organın %90’ını atıl bırakmazdı. Yine de İngiltere’de öğretmenlerin %48’i, Hollanda’da %46’sı buna katılıyor. Mit bu konuya şu sezgiyle bulaşıyor: beynin büyük kısmı “boş depo” sanılıyor. Oysa sorun boşluk değil — <strong className="text-white">her milimetreküpün özgül ve dinamik bir işlevle dolu olması.</strong>
            </p>
          </div>

          <div className="rounded-xl border border-rose-400/25 bg-rose-400/[0.05] px-5 py-4">
            <div className="mb-2 text-sm font-bold text-rose-200">🔌 “Neuralink zihin yüklemenin ilk adımı”</div>
            <p className="m-0 text-sm leading-relaxed text-slate-300">
              Cihaz motor korteksten <strong className="text-white">hareket niyetini</strong> okuyup imleç komutuna çevirir. İlk hastanın yaptığı şey imleci hareket ettirmek, satranç oynamak, mesaj yazmaktı. Anılara, duygulara, soyut düşüncelere erişimi yok. Ölçek farkı da acımasız: “olağan yüzlerce yerine binden fazla” elektrot — 61 ila 99 milyar nörona karşı.
            </p>
            <p className="m-0 mt-3 text-sm leading-relaxed text-slate-300">
              Adalet notu: şirket resmî olarak zihin yükleme vaat etmiyor. Sorun ürün sayfası değil, kurucunun tanıtım dili. Musk 2020’de, henüz hiçbir insan deneği yokken, üç domuzla yaptığı yayında aynen şöyle demişti: <em>“Anılarınızı yedek olarak saklayabilirsiniz. Onları potansiyel olarak yeni bir bedene ya da robot bedene indirebilirsiniz.”</em> Allen Enstitüsü’nden Christof Koch’un cevabı ise şu: Tesla ya da SpaceX’in aksine burada teknolojik problemlerden değil, <strong className="text-white">temel bilim</strong> problemlerinden söz ediyoruz.
            </p>
          </div>

          <div className="rounded-xl border border-rose-400/25 bg-rose-400/[0.05] px-5 py-4">
            <div className="mb-2 text-sm font-bold text-rose-200">📅 “2045’te olacak”</div>
            <p className="m-0 text-sm leading-relaxed text-slate-300">
              Üç vaat, üçü de kendi ara hedefinden ölçülebilir. Henry Markram 2009’da on yılda insan beyninin gerçekçi dijital modelini vaat etti; Human Brain Project 2023’te böyle bir simülasyon üretmeden bitti, Blue Brain 2024’te kapandı ve en çok atıf alan amiral yayını bir <strong className="text-white">juvenil sıçan</strong> korteksinin 0,29 milimetreküpüydü. 2045 Initiative’in “2020’ye kadar uzaktan kumandalı robot beden, 2025’e kadar beynin nakledildiği beden” takvimi geçti, gerçekleşmedi.
            </p>
            <p className="m-0 mt-3 text-sm leading-relaxed text-slate-300">
              Ray Kurzweil’a gelince: eleştirilecek şey isabet oranı değil, <strong className="text-white">öz-kalibrasyon</strong>. Kendi tahminlerinin %86–90’ının tuttuğunu beyan ediyor; bağımsız puanlamalar bunu desteklemiyor. Değerlendirmeyi yapan araştırmacının kendi kaydı da dürüstlük gerektiriyor: bunlar ikili evet/hayır tahminleri değildi ve %30’luk gerçek bir isabet oranı bile rastlantıdan yüksektir. Sorun tahminci olmak değil, <em>ne kadar emin olduğunu bilmemek</em>.
            </p>
            <p className="m-0 mt-3 text-sm leading-relaxed text-slate-300">
              En temiz ölçüt şu: alanın kendi medyanı insan için <strong className="text-white">2125</strong>. Kurzweil’ın “2045”inde alan <strong className="text-white">solucanı</strong> bekliyor, insanı değil.
            </p>
          </div>

          <div className="rounded-xl border border-rose-400/25 bg-rose-400/[0.05] px-5 py-4">
            <div className="mb-2 text-sm font-bold text-rose-200">💻 “Yeterli hesap gücü olsa yapardık”</div>
            <p className="m-0 text-sm leading-relaxed text-slate-300">
              Bunun tersi (“hiçbir bilgisayar asla yetmez”) de aynı ölçüde dayanaksız — çünkü soru yanlış kurulmuş. Gereken güç tahminleri 10¹⁵ ile 10³⁰ FLOPS arasında değişiyor: <strong className="text-white">on beş büyüklük mertebesi</strong> belirsizlik. Alt uç bugün elimizde. Üst uç bugünkü en hızlı makinenin bir trilyon katı. Hangisinin doğru olduğu tamamen “hangi biyolojik ayrıntı gerekli?” sorusuna bağlı — ve o soru cevapsız. Üstelik memeli ölçeğindeki simülasyonlarda asıl darboğaz artık ham işlemci gücü bile değil, bellek ve bağlantı bant genişliği. <strong className="text-white">Ana engel hesap değil, veri ve model.</strong>
            </p>
          </div>

          <div className="rounded-xl border border-rose-400/25 bg-rose-400/[0.05] px-5 py-4">
            <div className="mb-2 text-sm font-bold text-rose-200">🧊 “Beynini yedeklet, gelecekte geri yüklerler”</div>
            <p className="m-0 text-sm leading-relaxed text-slate-300">
              Burada üç katman var ve karıştırılıyorlar.
            </p>
            <p className="m-0 mt-3 text-sm leading-relaxed text-slate-300">
              <strong className="text-emerald-300">1. Teknik başarı gerçek.</strong> Aldehit-stabilize kriyoprezervasyon, bir domuz beyninin sinaptik yapısını bütün beyin boyunca koruyarak Beyin Koruma Vakfı’nın Büyük Memeli Ödülü’nü <strong className="text-white">bağımsız değerlendirmeyle</strong> kazandı (2018, 80.000 dolar). Ultrayapı ders kitabı normaline yakın bulundu.
            </p>
            <p className="m-0 mt-3 text-sm leading-relaxed text-slate-300">
              <strong className="text-rose-300">2. Satılan vaat gerçek değil.</strong> Bunu hizmet olarak pazarlayan şirketin işlemi kurucusunun kendi ifadesiyle <strong className="text-white">“%100 ölümcül”</strong>dü: kişi <em>hâlâ hayattayken</em>, anestezi altında, kimyasal pompalanarak başlıyordu. MIT 2018’de bağını kesti ve gerekçesini yazdı: sinirbilim, herhangi bir koruma yönteminin hafıza ve zihinle ilgili bütün biyomolekülleri koruyacak kadar güçlü olup olmadığını bilecek noktaya gelmedi; bir kişinin bilincinin yeniden yaratılıp yaratılamayacağı da bilinmiyor.
            </p>
            <p className="m-0 mt-3 text-sm leading-relaxed text-slate-300">
              <strong className="text-sky-300">3. Aradaki ihtimalde ciddi bilim insanları anlaşamıyor.</strong> Aralarında Harvard’dan George Church’ün de bulunduğu bir grup, 2024’te çağdaş yapısal koruma yöntemlerinin gelecekte başarılı bir geri kazanıma izin verme ihtimalinin <em>“ihmal edilemez”</em> olduğunu yazdı. Vakfın kendi resmî konumu ise bugün hâlâ şu: yöntemin insan hastalara sunulmasını desteklemiyor.
            </p>
            <p className="m-0 mt-3 text-sm leading-relaxed text-slate-300">
              Ve öğretici bir ayrıntı: aynı kurumun dili zamanla yumuşadı — 2018’de “imkânsız” denen şeye bugün <em>“son derece pratik dışı”</em> deniyor. <strong className="text-white">Kaynağın tarihini de okuyun.</strong>
            </p>
          </div>

          <div className="rounded-xl border border-rose-400/25 bg-rose-400/[0.05] px-5 py-4">
            <div className="mb-2 text-sm font-bold text-rose-200">🧬 “Bilinç DNA’dan kopyalanabilir”</div>
            <p className="m-0 text-sm leading-relaxed text-slate-300">
              <em>Black Mirror</em>’ın “USS Callister” bölümünün mekanizması. DNA proteinlerin nasıl yapılacağını kodlar; bir kişinin çocukluğunu, kişiliğini, öğrendiklerini ya da sinaptik bağlantı desenini içermez. En ucuz kanıt: <strong className="text-white">tek yumurta ikizleri — aynı DNA, ayrı iki kişi.</strong> Bölüm kopya sorununu mükemmel anlatır, mekanizması ise tamamen kuruntudur; ikisinin aynı yapıtta bulunabilmesi tam da ayırt etmeyi öğrenmemiz gereken şeydir.
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-slate-400">
          Bir de yaygın bir hatayı işaretleyelim: “beyin bir bilgisayardır” <strong className="text-slate-300">kuruntu değil</strong>. Zihnin hesaplamalı kuramı bilişsel bilimde ana akım bir konumdur. Doğru cümle şu: zihnin taşıyıcısından bağımsız bir hesaplama olup olmadığı <strong className="text-slate-300">açık bir sorudur</strong> — ve yükleme vaadinin tamamı bu açık sorunun olumlu yanıtlanacağı varsayımına yaslanır.
        </p>
      </ArticleSection>

      <HorizontalTimeline heading="Alanın kırk yılı" kicker="ZAMAN ÇİZELGESİ" items={timeline} />

      {/* ══════════ KÜLTÜR ══════════ */}
      <ArticleSection kicker="GENEL KÜLTÜR" title="Hangi yapıt neyi doğru yapıyor?" max="max-w-4xl">
        <p className="mb-5 leading-relaxed text-slate-300">
          Bu konuda çoğumuzun sezgisi bilimden değil kurgudan geliyor. O yüzden sezgiyi kurgunun kendisiyle düzeltmek en kolayı. Dikkat edin: <strong className="text-indigo-300">aynı yapıt hem doğru hem yanlış olabilir</strong> — ve bunu görmek, bu yazının öğretmek istediği becerinin ta kendisi.
        </p>
        <div className="flex flex-col gap-3">
          {kultur.map((k) => (
            <div key={k.ad} className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4">
              <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-base font-bold text-white">{k.ad}</span>
                <span className="text-xs text-slate-500">{k.yil}</span>
                <span
                  className="rounded px-2 py-0.5 text-[0.65rem] font-bold"
                  style={{
                    background: k.yukleme === 'evet' ? 'rgba(129,140,248,0.18)' : k.yukleme === 'kismen' ? 'rgba(56,189,248,0.15)' : 'rgba(251,113,133,0.15)',
                    color: k.yukleme === 'evet' ? '#c7d2fe' : k.yukleme === 'kismen' ? '#7dd3fc' : '#fda4af',
                  }}
                >
                  {k.yukleme === 'evet' ? 'gerçekten yükleme' : k.yukleme === 'kismen' ? 'kısmen' : 'yükleme DEĞİL'}
                </span>
              </div>
              <p className="m-0 text-sm leading-relaxed text-slate-300"><strong className="text-emerald-300">Doğru:</strong> {k.dogru}</p>
              <p className="m-0 mt-2 text-sm leading-relaxed text-slate-300"><strong className="text-rose-300">Yanlış:</strong> {k.yanlis}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm leading-relaxed text-slate-400">
          Türk yapımı bilimkurguda bu temayı işleyen bir örneğe taramamızda rastlamadık; Türk okur konuya ağırlıkla çeviri eserlerle ulaşıyor. Richard K. Morgan’ın <em>Değiştirilmiş Karbon</em>’u İthaki Yayınları’ndan, Aslıhan Kuzucan çevirisiyle Türkçede mevcut.
        </p>
      </ArticleSection>

      {/* ══════════ KAPANIŞ ══════════ */}
      <ArticleSection center max="max-w-3xl">
        <p className="text-xl leading-relaxed text-slate-200 sm:text-2xl">
          Bu yazının tek bir kazanımı olacaksa şu olsun: bir iddiayla karşılaştığında önce <span className="text-indigo-300">hangi rafa</span> ait olduğunu sor.
        </p>
        <p className="mt-5 leading-relaxed text-slate-300">
          Haritalama ilerliyor ve rakamla takip edilebiliyor. Çalıştırma açık bir soru ve engel, sandığımız gibi veri değil. Kimlik ise ölçüye kapalı — daha iyi bir tarayıcı onu çözmeyecek, çünkü sorun çözünürlük değil. Bu üçünü aynı cümleye sıkıştıran her tahmin, hangisinden söz ettiğini söylemediği sürece bir şey söylemiyordur.
        </p>
        <p className="mt-4 leading-relaxed text-slate-300">
          Aynı ayrım başka yerlerde de işe yarıyor. <Link href="/articles/ayna-noronlari" className="article-ilink">Ayna nöronları</Link> gerçek bir keşifti; empati ve otizmle ilgili iddialara taşındığında bilim değil, hikâye oldu ve sonra geri çekildi. <Link href="/articles/kuantum-olumsuzlugu" className="article-ilink">Kuantum ölümsüzlüğü</Link> ise mantıken tutarlı ama dışarıdan yanlışlanamaz — yani bilimin değil felsefenin rafında durur. Farklı konular, aynı beceri.
        </p>
        <Quote by="Whole Brain Emulation: A Roadmap, 2008">
          Beyin emülasyonu şu anda yalnızca teorik bir teknolojidir.
        </Quote>
        <p className="mt-5 text-sm leading-relaxed text-slate-400">
          Bu cümle on sekiz yıl önce, alanın kanonik metninde yazıldı. Metnin kurumsal evi olan enstitü 2024’te kapandı. Cümle hâlâ doğru.
        </p>
      </ArticleSection>

      <ArticleSection center max="max-w-3xl">
        <ArticleQuiz />
      </ArticleSection>

      <ArticleSection max="max-w-4xl">
        <ArticleBibliography items={refs} accent={ACCENT} />
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          Kaynakların yanındaki tür etiketleri bilerek konuldu. Bu yazının iddiası, bir bilginin <strong className="text-slate-400">nereden geldiğinin</strong> bilginin kendisi kadar önemli olduğu; o yüzden hakemli bir makaleyle bir ön baskıyı ya da bir haberi aynı biçimde göstermek tutarsızlık olurdu. Kültür yapıtları (film, dizi, oyun, roman) bilimsel kaynak olmadıkları için bu listede yer almaz; metin içinde ad ve yılla anıldılar.
        </p>
      </ArticleSection>

      <ArticleFooter tagline="Bir iddiayla karşılaştığında önce hangi rafa ait olduğunu sor." />
    </ArticleShell>
  );
}
