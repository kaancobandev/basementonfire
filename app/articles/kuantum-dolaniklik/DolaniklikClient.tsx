'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection, CardGrid, HorizontalTimeline, ArticleQuiz, ArticleBibliography, ArticleFooter,
} from '@/app/components/article/ArticleBlocks';
import ArticleImage from '@/app/components/article/ArticleImage';
import { TerimMerdiveni, MerminKutulari, timeline, kultur, dusunurler } from './widgets';
import { refs } from './refs';

const ACCENT = '#f472b6'; // Bertlmann'ın pembe çorabı
const HERO_COLORS: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]] = [
  [0.03, 0.02, 0.06], [0.16, 0.06, 0.20], [0.85, 0.35, 0.60], [0.45, 0.25, 0.70],
];

/** Terim ilk geçtiği yerde okurun önüne açıklamasıyla birlikte çıksın. */
function T({ ad, children }: { ad: string; children: ReactNode }) {
  return (
    <span>
      <strong className="text-pink-300">{ad}</strong>{' '}
      <span className="text-slate-400">({children})</span>
    </span>
  );
}

function Kutu({ icon = '🧦', title, children }: { icon?: string; title: string; children: ReactNode }) {
  return (
    <div className="mt-5 rounded-xl border border-pink-400/30 bg-pink-400/[0.06] px-5 py-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-bold text-pink-200"><span aria-hidden>{icon}</span><span>{title}</span></div>
      <div className="m-0 text-sm leading-relaxed text-slate-300">{children}</div>
    </div>
  );
}

function Quote({ children, by }: { children: ReactNode; by?: string }) {
  return (
    <div className="mt-5 border-l-4 border-pink-400/60 bg-pink-400/[0.06] px-5 py-4">
      <p className="m-0 text-lg italic leading-relaxed text-pink-100">{children}</p>
      {by && <p className="m-0 mt-2 text-sm not-italic text-slate-400">— {by}</p>}
    </div>
  );
}

export default function DolaniklikClient() {
  return (
    <ArticleShell accent={ACCENT} title="Kuantum Dolanıklık">
      <style>{`
        .kd-img {
          --ai-caption: #cbd5e1;
          --ai-credit: #b98aa4;
          --ai-border: rgba(244,114,182,0.22);
          --ai-fill: rgba(244,114,182,0.05);
          --ai-mark: rgba(244,114,182,0.28);
        }
        /* align-items: center — iki kare farklı oranda (Einstein-Bohr 1467x2123,
           Aspect 1600x2400); start ile hizalanınca kısa olanın altı boş kalıyor. */
        .kd-img-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: center; }
        @media (max-width: 700px) { .kd-img-pair { grid-template-columns: 1fr; } }
      `}</style>

      <ArticleHero
        title="Kuantum Dolanıklık"
        fullTitle="Kuantum Dolanıklık: Mesaj Göndermeyen Bağ"
        eyebrow="FİZİK & FELSEFE · OYNANABİLİR DENEY"
        subtitle={<>İki parçacık birbirinden ne kadar uzakta olursa olsun uyumlu çıkıyor — ama aralarında <em className="not-italic text-pink-300">hiçbir şey gidip gelmiyor.</em> Ve asıl mesele şu: bu uyum, cevapların baştan yazılmış olmasıyla da açıklanamıyor.</>}
        colors={HERO_COLORS}
        object3d="particles"
        gradientText="Dolanıklık"
      />

      <ArticleLede points={[
        'Dolanıklıkla mesaj gönderilemez — ve değeri tam olarak gönderilememesinden geliyor',
        'Uyum, parçacıkların cebinde taşıdığı bir “cevap listesi” ile de açıklanamıyor: Bell bunu ölçülebilir hâle getirdi',
        'Bu iki cümle birlikte söylenmezse ya ışıktan hızlı iletişim kuruntusuna ya da “zaten baştan belliydi” yanılgısına düşülür',
      ]}>
        Kuantum dolanıklık, popüler anlatımda genellikle iki şeyden biri sanılıyor: ya uzaktan anında haberleşme, ya da “aslında cevap baştan belliydi, biz sonradan öğrendik” türünden sıradan bir sürpriz. İkisi de yanlış — ve ilginç olan, ikisinin <em>aynı anda</em> yanlış olması. Bu yazı önce sizin sezginizi kuracak, sonra 1964’te John Bell’in bulduğu ve 2022’de Nobel’le taçlanan deneylerin o sezgiyi nasıl yıktığını gösterecek. Terimleri kullanmadan önce açıklıyorum; hiçbir yerde “anlayın işte” demeyeceğim.
      </ArticleLede>

      {/* ══════════ AÇILIŞ: Bertlmann'ın çorapları ══════════ */}
      <ArticleSection center max="max-w-3xl">
        <p className="text-xl leading-relaxed text-slate-200 sm:text-2xl">
          Fizikçi <span className="text-pink-300">John Bell</span>’in bir meslektaşı vardı: Dr. Reinhold Bertlmann. Bertlmann her gün <em className="not-italic text-pink-300">farklı renkte iki çorap</em> giyerdi.
        </p>
        <Kutu icon="🧦" title="Bell’in kendi mecazı, 1981">
          <p className="m-0">
            Bell şöyle yazar: hangi ayağında hangi rengin olacağı tamamen öngörülemezdir. Ama ilk çorabın pembe olduğunu
            gördüğünüz anda, ikincisinin pembe <em>olmayacağından</em> emin olabilirsiniz.
          </p>
          <p className="m-0 mt-3">
            Ve ekler: zevkler tartışılmaz, ama bunun dışında burada bir gizem yok. Peki EPR meselesi de aynen bu değil mi?
          </p>
        </Kutu>
        <ArticleImage
          className="kd-img mt-6"
          src="/articles/kuantum-dolaniklik/bell-karatahta.webp"
          ratio="1600 / 1622"
          alt="Siyah beyaz fotoğraf: gözlüklü, sakallı bir adam karatahtanın önünde duruyor, bir eli tahtaya doğru kalkık, öbür elinde sigara. Tahtada tebeşirle çizilmiş bir şema var."
          caption="John Bell, CERN, Haziran 1982. Arkasındaki tahtada iki kollu bir deney şeması duruyor: ortada kaynak, iki yana giden dalgalı çizgiler, her kolda eğik çizgili birer kare — yani ayarı değiştirilebilen analizörler — ve uçlarda dedektörler. Tartışmayı felsefeden laboratuvara taşıyan adam, taşıdığı düzeneğin önünde."
          credit="CERN · CC BY 4.0"
        />
        <p className="mt-6 leading-relaxed text-slate-300">
          Burada rahatladıysanız iyi. <strong className="text-white">Rahatlamanız gerekiyordu</strong> — bu yazının bütün işi o rahatlığın nasıl yıkıldığını göstermek. Çünkü Bell mecazı savunmak için değil, <em>yıkmak</em> için kurmuştu.
        </p>
      </ArticleSection>

      {/* ══════════ TERİM MERDİVENİ ══════════ */}
      <ArticleSection kicker="ÖNCE SÖZLÜK" title="Kullanacağım kelimeler" max="max-w-3xl">
        <p className="mb-2 leading-relaxed text-slate-300">
          Bu konuda kafa karışıklığının yarısı kelimelerden çıkıyor. Aşağıdakileri yazının içinde geçtikleri yerde ayrıca açacağım, ama takılırsan buraya dönebilirsin.
        </p>
        <TerimMerdiveni />
      </ArticleSection>

      {/* ══════════ ZEMİN: uyum ≠ etki ══════════ */}
      <ArticleSection kicker="ZEMİN" title="Uyum, etki demek değildir" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Bell’in kendi örneği: Lyon’daki kalp krizi sayısıyla Lille’deki kalp krizi sayısı birbirini tutar. Biri artınca öteki de artar. Aralarında uzaktan bir etki mi vardır? Hayır — <strong className="text-pink-300">ortak bir sebep</strong> vardır: hava aynı, mevsim aynı, günler aynı.
        </p>
        <Quote by="John Bell, “Bertlmann’ın Çorapları”, 1981">
          Bilimsel tutum şudur: korelasyonlar açıklanmak için haykırır.
        </Quote>
        <p className="mt-5 mb-4 leading-relaxed text-slate-300">
          Buradan bedavaya çok önemli bir ayrım çıkıyor. <T ad="Korelasyon">iki ölçümün sonuçlarının birbirine uyması</T> ile <em>etki</em> aynı şey değildir. Lyon’daki bir hasta Lille’dekine bir şey göndermiyor.
        </p>
        <p className="mb-4 leading-relaxed text-slate-300">
          Ve burada durursak yanlış sonuca varırız. Çünkü akla hemen şu gelir: “Demek dolanıklığın da böyle ortak bir sebebi vardır — parçacıklar yola çıkarken anlaşmışlardır.” Bu, tam olarak Bell’in test edilebilir hâle getirdiği ve deneyin elediği fikir.
        </p>
        <Kutu icon="🎒" title="O fikrin adı var">
          <p className="m-0">
            “Parçacıklar cevabı ceplerinde taşıyorlardı, biz bilmiyorduk” fikrinin fizikteki adı{' '}
            <T ad="yerel gizli değişken">her parçacığın, yalnızca kendi bulunduğu yerdeki bilgiye dayanan gizli bir talimat listesi taşıması</T>.
            İki kelimeye de dikkat: <strong className="text-white">gizli</strong>, çünkü biz göremiyoruz;{' '}
            <strong className="text-white">yerel</strong>, çünkü her parçacık yalnız kendi yanındakine bakıyor.
          </p>
        </Kutu>
      </ArticleSection>

      {/* ══════════ YIKIM ══════════ */}
      <ArticleSection kicker="YIKIM" title="Peki ya çorapları yıkarsak?" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Bell mecazı burada genişletir ve iş değişir. Bir çorap hakkında sorulabilecek başka bir soru daha vardır: <em>yıkanır mı?</em> 0 derecede? 45’te? 90’da?
        </p>
        <p className="mb-4 leading-relaxed text-slate-300">
          Bell’in kendi itirafı önemli, çünkü atlanırsa yıkım havada kalır: <strong className="text-white">tek</strong> bir çorap için bu soru boştur. İlk testte yırtılırsa ikinci teste kalmaz; “45’te yıkansaydı ne olurdu” sorusunun deneysel bir karşılığı yoktur.
        </p>
        <p className="mb-4 leading-relaxed text-slate-300">
          Soru ancak <strong className="text-pink-300">çoraplar çift hâlinde geliyorsa</strong> anlam kazanır. Çünkü o zaman bir çiftin bir tekini 45’te, öteki tekini 90’da test edebilirsiniz. Ve üç ayarı ikişerli karşılaştırınca, “her çift baştan yazılmış bir talimat taşıyor” varsayımı sayısal bir sınır doğurur — <T ad="Bell eşitsizliği">cevaplar önceden ve yerel olarak yazılmış olsaydı, uyum oranının dışına çıkamayacağı aralık</T>.
        </p>
        <p className="mb-4 leading-relaxed text-slate-300">
          Kuantum mekaniği bu sınırı ihlal eder. Ve deneyler kuantum mekaniğinin tarafını tuttu.
        </p>
        <p className="text-sm leading-relaxed text-slate-400">
          Küçük bir dürüstlük notu: Bell bu adımı Bernard d’Espagnat’ya borçlandırır ve eşitsizliğe “Wigner–d’Espagnat” der. Mecaz Bell’in, eşitsizlik onların.
        </p>
      </ArticleSection>

      {/* ══════════ MERMİN — oynanabilir ══════════ */}
      <ArticleSection kicker="ŞİMDİ SEN DENE" title="İki kutu, üç düğme, iki lamba" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Fizikçi David Mermin 1981’de aynı çarpışmayı hiç formül kullanmadan anlatan bir düzenek tarif etti. Aşağıdaki onun düzeneği. İki kip var: <strong className="text-white">gerçek deneyde ölçülen</strong> davranış, ve <strong className="text-white">cevapların baştan yazılı olduğu</strong> dünya. İkisini de çalıştır, farkı kendin gör.
        </p>
        <MerminKutulari />
        <p className="mt-2 leading-relaxed text-slate-300">
          Gördüğün şey şu: talimat listesiyle oynadığında farklı ayarlardaki uyum <strong className="text-white">%33,3’ün altına inemiyor</strong>. Sebebi neredeyse çocukça: üç düğme konumuna iki renk dağıtırsan, en az ikisi aynı renk olmak zorunda. Gerçek deneyde ise oran <strong style={{ color: ACCENT }}>%25</strong>. Talimat listesinin ulaşamayacağı yerde.
        </p>
        <Kutu icon="⚠️" title="Yön tuzağı — çok yapılan hata">
          <p className="m-0">
            Buradaki uyum “çok fazla” değil <strong className="text-white">çok az</strong>. Dolanıklığı “korelasyon çok yüksek” diye anlatmak yarı yanlış: kimi düzenekte tavanı aşar, kimi düzenekte tabanın altına düşer. Doğru ifade her zaman aynı: <strong className="text-white">hiçbir önceden anlaşmanın üretebileceği aralığın dışında</strong>.
          </p>
        </Kutu>
      </ArticleSection>

      <ArticleSection max="max-w-4xl">
        <div className="kd-img-pair">
          <ArticleImage narrow
            className="kd-img"
            src="/articles/kuantum-dolaniklik/einstein-bohr.webp"
            ratio="1467 / 2123"
            alt="Siyah beyaz fotoğraf: koltukta yan yana oturan iki adam. Soldaki öne eğilmiş, ağzı açık, konuşuyor. Sağdaki arkaya yaslanmış, elini havaya kaldırmış, dinliyor."
            caption="Solda Bohr, sağda Einstein — Ehrenfest’in Leiden’daki evinde, 11 Aralık 1925. Dikkat: bu kare EPR makalesinden on yıl önce çekildi. Tartışma, “dolanıklık” kelimesi daha doğmadan başlamıştı."
            credit="Paul Ehrenfest · kamu malı"
          />
          <ArticleImage narrow
            className="kd-img"
            src="/articles/kuantum-dolaniklik/aspect.webp"
            ratio="1600 / 2400"
            alt="Renkli stüdyo portresi: takım elbiseli, bıyıklı, gözlüklü bir adam gülümsüyor. Kravatı sarı ve üzerinde küçük kedi desenleri var."
            caption="Alain Aspect. 1981–82’deki deneyleri analizörleri fotonlar yoldayken değiştirdi ve tartışmayı sayıya bağladı; 2022 Nobel’ini Clauser ve Zeilinger’le paylaştı. Kravatındaki desen kedi — bir kuantum fizikçisi için fazla uygun bir tesadüf."
            credit="Royal Society · CC BY-SA 4.0"
          />
        </div>
      </ArticleSection>

      <HorizontalTimeline heading="Bir itirazdan Nobel’e" kicker="ZAMAN ÇİZELGESİ" items={timeline} />

      {/* ══════════ MESAJ YOK ══════════ */}
      <ArticleSection kicker="EN ÖNEMLİ KISIM" title="Peki neden mesaj gönderilemiyor?" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Buraya kadar “uyum çok güçlü” dedik. Şimdi öbür yarısı: bu uyumdan <strong className="text-pink-300">tek bir bit bile</strong> bilgi çıkarılamaz. Bunun matematiksel bir kanıtı var ve adı <T ad="mesajlaşamama teoremi">uzaktaki kişinin kendi verisinde göreceği hiçbir şeyin, sizin ne yaptığınıza göre değişmemesi</T>.
        </p>
        <p className="mb-4 leading-relaxed text-slate-300">
          Sezgisel hâli şu: sen ölçüm yaptığında kendi tarafında <strong className="text-white">rastgele</strong> bir sonuç görürsün. Karşı taraf da kendi tarafında rastgele bir sonuç görür. İkisi ancak sonradan, telefonla konuşup listelerini yan yana koyduklarında uyumu fark eder. O telefon da <T ad="klasik kanal">telefon, internet, radyo — “klasik” burada “eski moda” değil “kuantum olmayan” demek</T> ve ışık hızını aşamaz.
        </p>
        <Quote by="Thomas Vidick, Caltech Science Exchange">
          İletişim olmadan korelasyon olabilir.
        </Quote>
        <Kutu icon="🚫" title="Bu cümleyi kurmayın: “Birini ölçünce diğeri anında değişir”">
          <p className="m-0">
            Bu, konunun en yaygın yanlış cümlesi — ve kötü sitelere özgü değil, saygın yayınlarda da geçiyor.
            Doğrusu iki yarım hâlinde söylenmeli:
          </p>
          <p className="m-0 mt-3">
            <strong className="text-white">(a)</strong> Uzaktaki tarafta yerel olarak ölçülebilen hiçbir şey değişmez. Değişen şey uzaktaki parçacık değil, sizin onun hakkındaki tahmininiz — ve bu da <em>yalnızca aynı yönde ölçerseniz</em> geçerli.
          </p>
          <p className="m-0 mt-3">
            <strong className="text-white">(b)</strong> Ve yine de, ortaya çıkan uyum parçacıkların taşıdığı yerel bir cevap listesiyle açıklanamıyor.
          </p>
          <p className="m-0 mt-3">
            Yalnız (a) söylenirse okur “demek baştan belliydi” diye kapatır — ki deney tam olarak bunu eledi. Yalnız (b) söylenirse ışıktan hızlı iletişim kuruntusu doğar. İkisi tek nefeste söylenmeli.
          </p>
        </Kutu>
        <p className="mt-6 mb-4 leading-relaxed text-slate-300">
          Aynı sebeple <T ad="kuantum ışınlama">bir parçacığın durumunu başka bir parçacığa aktarma yöntemi</T> de ışık hızını aşmaz. 1993’teki kurucu makalenin başlığı şartı zaten söylüyor: işlem <em>hem</em> klasik <em>hem</em> kuantum kanalı gerektirir. Madde taşınmaz, <strong className="text-white">durum</strong> taşınır; orijinal durum kaynakta yok olur; ve klasik kanaldan iki bit gönderilmeden işlem tamamlanamaz.
        </p>
      </ArticleSection>

      {/* ══════════ ESKİ DÜŞÜNÜRLER ══════════ */}
      <ArticleSection kicker="ESKİ DÜŞÜNÜRLER" title="Bu soruyu ilk soranlar fizikçi değildi" max="max-w-4xl">
        <p className="mb-5 leading-relaxed text-slate-300">
          Şunu baştan söyleyelim, çünkü bu yazının çürüttüğü kuruntu ailesinin en sevdiği cümle budur: <strong className="text-white">hiçbir filozof kuantum fiziğini önceden bilmedi.</strong> Katkıları öngörü değil — doğru <em>soruyu</em> sormak. Ve o soruyu bazıları şaşırtıcı derecede keskin sormuş.
        </p>
        <div className="flex flex-col gap-4">
          {dusunurler.map((d) => (
            <div key={d.ad} className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4">
              <div className="mb-1 flex flex-wrap items-baseline gap-x-3">
                <span className="text-base font-bold text-white">{d.ad}</span>
                <span className="text-xs text-pink-300">{d.ne}</span>
              </div>
              <p className="m-0 text-sm leading-relaxed text-slate-300">{d.nasil}</p>
              <p className="m-0 mt-2 text-sm leading-relaxed text-slate-400"><strong className="text-slate-300">Nerede kırılıyor:</strong> {d.kirilma}</p>
            </div>
          ))}
        </div>
        {/* ⚠ `narrow` YOK ve `max-w-*` YOK — ikisi de burada yanlış olurdu.
            ArticleImage.tsx:72 SATIR İÇİ stille `maxWidth: calc(78vh * oran)`
            veriyor; satır içi stil Tailwind sınıfını her zaman yener, yani
            max-w-[320px] hiç çalışmıyordu (ölçüldü: sınıf duruyor ama
            hesaplanan değer 529,88px). Görsel 530px basılacaksa `narrow`
            koymak 360px'lik dosya indirtip onu büyütür — bulanıklık. */}
        <ArticleImage
          className="kd-img mx-auto mt-6"
          src="/articles/kuantum-dolaniklik/leibniz.webp"
          ratio="1600 / 1737"
          alt="Yağlıboya portre: uzun, kıvırcık siyah peruk takan orta yaşlı bir adam hafifçe gülümseyerek izleyiciye bakıyor."
          caption="Leibniz, Christoph Bernhard Francke’nin yaklaşık 1695 tarihli portresi. “Önceden kurulmuş uyum” fikrini iki parçacık için değil, ruh ile beden arasındaki ilişki için kurmuştu; biz yalnızca kurgusunu ödünç alıyoruz."
          credit="Christoph Bernhard Francke · kamu malı"
        />
        <Kutu icon="⚖️" title="Leibniz’in ironisi — bu yazının en güzel fikri">
          <p className="m-0">
            Leibniz’in “önceden kurulmuş uyum”u, fiziğin diline çevrilince <strong className="text-white">tam olarak bir yerel gizli değişken modelidir</strong>: kaynakta yazılmış talimat, yalnız yerel okuma.
          </p>
          <p className="m-0 mt-3">
            Einstein’ın kuantum kuramından istediği şey buydu. Leibniz o cevabı 250 yıl önce vermişti. Ve deney <strong className="text-white">ikisini birden eledi.</strong> Bell’in kendi cümlesi, bu ölüm ilanının en net hâli: bir taraftaki müdahaleyi öteki üzerinde nedensel bir etki saymazsak, iki taraftaki sonuçların zaten önceden belirlenmiş olduğunu kabul etmek zorunda kalırız — ama bunun, paralel olmayan ayarlar için kuantum mekaniğiyle çelişen sonuçları vardır.
          </p>
        </Kutu>
      </ArticleSection>

      {/* ══════════ KURUNTU ══════════ */}
      <ArticleSection kicker="KURUNTU" title="Şimdi de yanlış olanlar" max="max-w-4xl">
        <p className="mb-5 leading-relaxed text-slate-300">
          Dolanıklık, muhtemelen fizikte en çok istismar edilen kavram. Aşağıdakiler “henüz kanıtlanmadı” değil — <strong className="text-pink-300">dayanağı yok.</strong> Ve bir not: kişilere değil <em>iddialara</em> bakıyoruz. Saygın bir isimden gelmesi bir iddiayı doğru yapmaz; kötü bir kaynaktan gelmesi de yanlış yapmaz. Belirleyici olan tek şey kanıt.
        </p>

        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-rose-400/25 bg-rose-400/[0.05] px-5 py-4">
            <div className="mb-2 text-sm font-bold text-rose-200">📡 “Işıktan hızlı haberleşme mümkün”</div>
            <p className="m-0 text-sm leading-relaxed text-slate-300">
              Türkçe internette bunun daha da abartılı bir sürümü dolaşıyor: “ışık hızından en az on bin kat hızlı bir iletişim”. Bu rakamın arkasında <em>gerçek</em> bir Nature makalesi var ama tamamen yanlış okunmuş. O çalışma iletişim hızı ölçmedi; <strong className="text-white">varsayımsal</strong> bir gizli etkiye, üstelik belirli bir koşula bağlı olarak bir <strong className="text-white">alt sınır</strong> koydu. Yani “şu türden bir şey varsa, en az şu kadar hızlı olmalı” dedi — “vardır” demedi.
            </p>
            <p className="m-0 mt-3 text-sm leading-relaxed text-slate-300">
              Üstelik hikâyenin devamı bilimin nasıl işlediğinin güzel bir örneği: başka bir ekip aynı deneyin ışıktan yavaş ya da hiç iletişim içermeyen açıklamalara da açık olduğunu gösterdi, orijinal ekip de yayımlanmış bir cevap verip deneyin kapsamını savundu. Tartışma açıkta yürüdü.
            </p>
          </div>

          <div className="rounded-xl border border-rose-400/25 bg-rose-400/[0.05] px-5 py-4">
            <div className="mb-2 text-sm font-bold text-rose-200">🧠 “Dalga fonksiyonunu bilinç çökertir”</div>
            <p className="m-0 text-sm leading-relaxed text-slate-300">
              Bu fikir ciddi fizikçilerce savunuldu; “aptalca” değildi. Ama bugünkü durumu şu: <T ad="ölçüm">kuantum sistemini bir aletle ve dolayısıyla çevresiyle etkileşime sokup tek bir kesin sonuç almak</T> için bir insanın bakması gerekmez — bir dedektör, bir fotoğraf plakası, hatta bir hava molekülü de aynı işi görür.
            </p>
            <p className="m-0 mt-3 text-sm leading-relaxed text-slate-300">
              En çarpıcı olgu ise şu: fikri en radikal hâline taşıyan fizikçi <strong className="text-white">sonradan görüşünü değiştirdi</strong>, dekoherans üzerine çıkan çalışmalar onu ikna etti. Ve bu fikri sinemaya taşıyan meşhur belgeselde görüşleri kullanılan Columbia’lı bir fizikçi, sonradan görüşlerinin tersine çevrildiğini söyledi.
            </p>
            <p className="m-0 mt-3 text-sm leading-relaxed text-slate-400">
              Dürüstlük kaydı: <T ad="dekoherans">sistemin çevresiyle etkileşip kuantumluğunu çevreye dağıtması</T> ölçüm problemini <strong className="text-slate-300">çözmedi</strong>. Neden ölçüm sonuçlarının süperpozisyonunu görmediğimizi açıklar; neden <em>tek bir</em> sonuç gördüğümüzü açıklamaz. “Bilinç çökertir”i gereksiz kılar, tartışmayı kapatmaz. Farklı yorumların ne dediğine{' '}
              <Link href="/articles/kuantum-olumsuzlugu" className="article-ilink">kuantum ölümsüzlüğü yazısında</Link> daha yakından bakmıştık.
            </p>
          </div>

          <div className="rounded-xl border border-rose-400/25 bg-rose-400/[0.05] px-5 py-4">
            <div className="mb-2 text-sm font-bold text-rose-200">🔮 “Kuantum şifacılığı” ve “niyetle evreni etkilemek”</div>
            <p className="m-0 text-sm leading-relaxed text-slate-300">
              Bu iddia iki ayrı katmanda birden çöküyor. Birincisi: sonucunu <strong className="text-white">seçemediğiniz</strong> bir süreç, tanımı gereği “niyetle yönlendirme” aracı olamaz. Mesajlaşamama teoremi tam da bunu söylüyor.
            </p>
            <p className="m-0 mt-3 text-sm leading-relaxed text-slate-300">
              İkincisi ölçek: sıcak ve ıslak bir ortamda kuantum tutarlılığının bozulma süresi ile sinir hücrelerinin çalışma süresi arasında <strong className="text-white">on ilâ on yedi büyüklük mertebesi</strong> fark var. Yani milyarlarca kat. Beyin bir kuantum alıcısı değil.
            </p>
            <p className="m-0 mt-3 text-sm leading-relaxed text-slate-300">
              Türkiye’de bunun özel bir sürümü dolaşıyor: dolanıklığın “zamandan ve mekândan bağımsız bir boyutu kanıtladığı”, beynin “evrenle bağlantılı bir kuantum alıcısı” olduğu. İddia bir üniversitenin haber sayfasından yayılıp başka sitelerce çoğaltıldı, hatta “foton telepatisi” ve “sonsuz hızda bilgi paylaşımı” diye tırmandırıldı. 2022 Nobel’i bir ruh boyutu için değil, <strong className="text-white">Bell eşitsizliklerinin ihlalinin deneyle ortaya konması</strong> için verildi.
            </p>
          </div>

          <div className="rounded-xl border border-rose-400/25 bg-rose-400/[0.05] px-5 py-4">
            <div className="mb-2 text-sm font-bold text-rose-200">🪬 “Kuantum” etiketli ürünler — ve bu yazının en güzel ironisi</div>
            <p className="m-0 text-sm leading-relaxed text-slate-300">
              Hollanda’nın nükleer güvenlik kurumu 2021’de, aralarında <strong className="text-white">“Quantum Pendant”</strong> adlı bir kolyenin de bulunduğu on ürünü inceledi ve hepsinde iyonlaştırıcı radyasyon ölçtü. Satışları yasaklandı, satıcılara bildirildi ve kullanıcılara ürünleri takmayı bırakıp güvenli biçimde saklamaları duyuruldu.
            </p>
            <p className="m-0 mt-3 text-sm leading-relaxed text-slate-300">
              Yani radyasyondan koruduğu iddia edilen ürün, radyasyon yayıyordu.
            </p>
          </div>

          <div className="rounded-xl border border-rose-400/25 bg-rose-400/[0.05] px-5 py-4">
            <div className="mb-2 text-sm font-bold text-rose-200">🕸️ “Her şey birbirine bağlı, dolanıklık bunu kanıtlıyor”</div>
            <p className="m-0 text-sm leading-relaxed text-slate-300">
              Üç ayrı sebeple hayır. <strong className="text-white">Bir:</strong> bağın gücü bölüşülür — bir parçacık bir başkasıyla azami ölçüde dolanıksa üçüncüyle hiç dolanık olamaz. (Zayıf çoklu bağ mümkün, hatta tipiktir; yasak olan güçlü çoklu bağ.) <strong className="text-white">İki:</strong> dekoherans ağı sürekli parçalar. <strong className="text-white">Üç:</strong> bağ üzerinden veri geçmez.
            </p>
            <p className="m-0 mt-3 text-sm leading-relaxed text-slate-300">
              Ve şu ters çevirmeyi kaçırmayın: <strong className="text-white">evet, her şey çevresiyle dolanık.</strong> Dekoheransın kendisi kendiliğinden oluşan dolanıklıktır. Ama işte tam bu yüzden hiçbir şeyde kullanılabilir kuantumluk kalmıyor. Laboratuvarda hazırlanması gereken şey dolanıklık değil — <em>işe yarar</em> dolanıklık.
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-slate-400">
          Bir de mecazlarla ilgili bir uyarı. Yukarıdaki hataların kaynağı çoğu zaman kötü niyet değil, <strong className="text-slate-300">tembel mecaz</strong>. “Dolanık parçacıklar bir kuş sürüsü gibi birlikte hareket eder” benzetmesi kulağa hoş gelir ama kuş sürüsü birbirini <em>görür</em>; dolanık parçacıklar arasında hiçbir şey gidip gelmez. Bu mecaz kötü bir siteden değil, saygın bir üniversitenin kendi sayfasından geliyor — ve orada hiçbir şerh yok.
        </p>
      </ArticleSection>

      {/* ══════════ KÜLTÜR ══════════ */}
      <ArticleSection kicker="POPÜLER KÜLTÜR" title="Hangi yapıt neyi doğru yapıyor?" max="max-w-4xl">
        <p className="mb-5 leading-relaxed text-slate-300">
          Çoğumuzun bu konudaki sezgisi fizikten değil kurgudan geliyor. O yüzden sezgiyi kurgunun kendisiyle düzeltmek en kolayı.
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
                    background: k.tur === 'ihlal' ? 'rgba(251,113,133,0.15)' : k.tur === 'joker' ? 'rgba(251,191,36,0.15)' : 'rgba(74,222,128,0.15)',
                    color: k.tur === 'ihlal' ? '#fda4af' : k.tur === 'joker' ? '#fcd34d' : '#86efac',
                  }}
                >
                  {k.tur === 'ihlal' ? 'mesajlaşamamayı ihlal ediyor' : k.tur === 'joker' ? '“kuantum” burada boş joker' : 'fiziği ciddiye alıyor'}
                </span>
              </div>
              <p className="m-0 text-sm leading-relaxed text-slate-300"><strong className="text-emerald-300">Doğru:</strong> {k.dogru}</p>
              <p className="m-0 mt-2 text-sm leading-relaxed text-slate-300"><strong className="text-rose-300">Yanlış:</strong> {k.yanlis}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm leading-relaxed text-slate-400">
          Türkçede bu konuyu sağlam biçimde işleyen bir kitap arıyorsanız: Carlo Rovelli, <em>Helgoland</em> (çev. Tolga Esmer, Tellekt, 2022). Dolanıklığı “şeylerin kendi başına değil, ilişkiler içinde var olması” üzerinden okuyor.
        </p>
      </ArticleSection>

      {/* ══════════ FİNAL ══════════ */}
      <ArticleSection center max="max-w-3xl">
        <p className="text-xl leading-relaxed text-slate-200 sm:text-2xl">
          Şimdi baştaki cümleyi tersine çevirelim: dolanıklıkla mesaj gönderilememesi bir <em className="not-italic text-pink-300">eksiklik değil</em>. Bütün değerin kaynağı orası.
        </p>
        <p className="mt-5 leading-relaxed text-slate-300">
          Ölçüm sonuçları rastgeledir ve <strong className="text-white">kimse seçemez</strong>. Tam da bu yüzden iki taraf, kimsenin öngöremeyeceği ortak bir sır üretebilir. 2018’de NIST ekibi bir Bell testinden üretilen rastgele sayıların, <em>ışıktan hızlı sinyali yasaklayan herhangi bir fizik kuramı çerçevesinde</em> öngörülemez olduğunu gösterdi. Fikrin kökeni 1991’e, Ekert’in kuantum şifrelemesine uzanıyor; 2020’de Micius uydusuyla 1.120 kilometre arayla, güvenilir bir aracı olmadan anahtar dağıtımı yapıldı.
        </p>
        <p className="mt-4 leading-relaxed text-slate-300">
          Yani “işe yaramaz” görünen özellik — mesaj taşıyamaması — kriptografideki bütün değerin kaynağı. Kuruntu satanların dolanıklıktan çıkarmak istediği şey (uzaktan etki) yok; onun yerine olan şey (kimsenin tahmin edemeyeceği paylaşılmış rastgelelik) ise çok daha kullanışlı çıktı.
        </p>
        <Quote by="John Bell, 1981">
          Bilimsel tutum şudur: korelasyonlar açıklanmak için haykırır.
        </Quote>
        <p className="mt-5 leading-relaxed text-slate-300">
          Bell haykırışı duydu ve soruyu deneye çevirdi. Cevap, kimsenin beklemediği bir yerden geldi: uyum gerçek, etki yok, ve cevaplar baştan yazılmamıştı. Üçü aynı anda doğru — ve rahatsız edici olan da bu.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          Süperpozisyonun tek bir parçacıkta nasıl göründüğünü merak ediyorsanız,{' '}
          <Link href="/articles/cift-yarik" className="article-ilink">çift yarık deneyi</Link> bu yazının doğal ön adımı.
          Ve son bir dürüstlük kaydı: Bell testleri hangi <em>yorumun</em> doğru olduğunu seçmez. Kopenhag, Çok Dünyalı, Bohm — hepsi farklı varsayımı bırakarak testlerden geçer. Elenen şey belirli bir açıklama türüdür: yerel olanı.
        </p>
      </ArticleSection>

      <ArticleSection center max="max-w-3xl">
        <ArticleQuiz />
      </ArticleSection>

      <ArticleSection max="max-w-4xl">
        <ArticleBibliography items={refs} accent={ACCENT} />
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          Kaynakların yanındaki tür etiketleri bilerek konuldu. Bu yazı kuruntuyla bilimi ayırmayı konu ediniyor; hakemli bir makaleyle bir haberi aynı biçimde göstermek tutarsızlık olurdu. Gövdede yalanlanan iddiaların çıktığı siteler <strong className="text-slate-400">bu listede yer almıyor</strong> — onlar kaynak değil, incelenen nesneydi. Kültür yapıtları da bilimsel kaynak olmadıkları için listeye girmedi; metin içinde ad ve yılla anıldılar.
        </p>
      </ArticleSection>

      <ArticleFooter tagline="Uyum gerçek, etki yok, cevaplar baştan yazılmamıştı — üçü aynı anda doğru." />
    </ArticleShell>
  );
}
