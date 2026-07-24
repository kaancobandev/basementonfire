'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection, CardGrid, HorizontalTimeline, ArticleQuiz, ArticleBibliography, ArticleFooter,
} from '@/app/components/article/ArticleBlocks';
import ArticleImage from '@/app/components/article/ArticleImage';
import {
  BranchField, SuperpositionCoin, QuantumSuicideSim, MobiusStrip,
  timeline, objections, quizQs, refs,
} from './widgets';

const ACCENT = '#2dd4bf';
const HERO_COLORS: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]] = [
  [0.02, 0.03, 0.08], [0.08, 0.10, 0.28], [0.06, 0.55, 0.52], [0.32, 0.18, 0.58],
];

function FunFact({ icon = '🤯', title = 'Şaşırtıcı bilgi', children }: { icon?: string; title?: string; children: ReactNode }) {
  return (
    <div className="mt-5 rounded-xl border border-teal-400/30 bg-teal-400/[0.06] px-5 py-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-bold text-teal-200"><span>{icon}</span><span>{title}</span></div>
      <p className="m-0 text-sm leading-relaxed text-slate-300">{children}</p>
    </div>
  );
}
function Quote({ children, by }: { children: ReactNode; by?: string }) {
  return (
    <div className="mt-5 border-l-4 border-teal-400/60 bg-teal-400/[0.06] px-5 py-4">
      <p className="m-0 text-lg italic leading-relaxed text-teal-100">{children}</p>
      {by && <p className="m-0 mt-2 text-sm not-italic text-slate-400">— {by}</p>}
    </div>
  );
}

export default function KuantumClient() {
  return (
    <ArticleShell accent={ACCENT} title="Kuantum Ölümsüzlüğü">
      <style>{`
        /* ArticleImage'ın slate varsayılanlarını makalenin turkuaz aksanına bağla. */
        .kq-img {
          --ai-caption: #cbd5e1;
          --ai-credit: #6f9b95;
          --ai-border: rgba(45,212,191,0.22);
          --ai-fill: rgba(45,212,191,0.05);
          --ai-mark: rgba(45,212,191,0.28);
        }
        .kq-img-pair { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; align-items: start; }
        @media (max-width: 700px) { .kq-img-pair { grid-template-columns: 1fr; } }
      `}</style>

      <BranchField />

      <ArticleHero
        title="Kuantum Ölümsüzlüğü"
        fullTitle="Kuantum Ölümsüzlüğü: Kendi Ölümünü Neden Hiç Deneyimlemeyebilirsin"
        eyebrow="FİZİK & KİTAP · İNTERAKTİF DOSYA"
        subtitle={<>Kendi ölümünü neden hiç deneyimlemeyebilirsin — ve aynı fikrin bir <em className="not-italic text-violet-300">romana</em> kaçmış hâli. Bir kutu, bir kedi, sonsuza dallanan bir evren.</>}
        colors={HERO_COLORS}
        object3d="mobius"
        gradientText="Ölümsüzlüğü"
      />

      <ArticleLede points={[
        'Süperpozisyon → ölçüm/çöküş → Çok Dünyalı Yorum → kuantum intiharı: dört basamak',
        'Çok Dünyalı Yorum doğruysa öznel deneyimin hep hayatta kaldığın dalı takip eder',
        'Kanıtlanmış bilim DEĞİL — sınırlarını yoklayan, dışarıdan yanlışlanamayan bir düşünce deneyi',
      ]}>
        Kuantum ölümsüzlüğü, Çok Dünyalı Yorum doğruysa kendi ölümünü asla “içeriden” deneyimleyemeyeceğin fikridir: her ölümcül anda öldüğün dallarda bunu fark edecek bir “sen” kalmaz, bilincin yalnızca hayatta kaldığın dalda devam eder. Dışarıdan ölürsün, içeriden asla. Ama bu kanıtlanmış bir teori değil, tartışmalı bir düşünce deneyidir.
      </ArticleLede>

      <ArticleSection center max="max-w-3xl">
        <p className="text-xl leading-relaxed text-slate-200 sm:text-2xl">
          Önünüzde kapalı bir kutu. İçinde bir kedi, bir de yarı yarıya ihtimalle tetiklenen bir düzenek. <span className="text-teal-300">Schrödinger'in 1935'teki</span> bu deneyinde kedi, siz kapağı açana kadar <em className="not-italic text-violet-300">“hem ölü hem diri”</em> kabul edilir.
        </p>
        <FunFact icon="🐱" title="İroni: bu bir inanç değil, itirazdı">
          Schrödinger bunu bir inanç olarak değil, bir <strong className="text-white">itiraz</strong> olarak kurmuştu: “Teori bu kadar saçma bir sonuç veriyorsa, bir yerde tuhaflık var.” Ama tuhaflık gitmedi — fizikçiler yüz yıldır aynı soruyla boğuşuyor: ölçmediğimizde dünya gerçekten “bulanık” mı? Peki ya kutunun içindeki <em className="not-italic text-teal-300">siz</em> olsaydınız?
        </FunFact>
      </ArticleSection>

      <ArticleSection center max="max-w-3xl">
        <div className="kq-img-pair">
          <ArticleImage narrow
            className="kq-img"
            src="/articles/kuantum-olumsuzlugu/schrodinger-portre.webp"
            ratio="1348 / 2103"
            priority
            alt="Gözlüklü, papyonlu bir adamın siyah beyaz portresi; dağınık saçları ve düşünceli bir ifadesi var."
            caption="Erwin Schrödinger. Kutudaki kediyi kuramı savunmak için değil, ona itiraz etmek için tasarladı: “Teori bu kadar saçma bir sonuç veriyorsa, bir yerde tuhaflık var.”"
            credit="Kamu malı"
          />
          <ArticleImage narrow
            className="kq-img"
            src="/articles/kuantum-olumsuzlugu/solvay-1927.webp"
            ratio="1600 / 1097"
            alt="Siyah beyaz grup fotoğrafı: takım elbiseli yirmiden fazla bilim insanı üç sıra hâlinde poz veriyor."
            caption="1927 Solvay Konferansı. Bu karedeki insanlar ölçümün ne yaptığını tartışıyordu; makalenin dayandığı Kopenhag yorumu da, ona itiraz edenler de bu odadan çıktı."
            credit="Kamu malı"
          />
        </div>
      </ArticleSection>

      {/* 1. Süperpozisyon */}
      <ArticleSection kicker="1. BASAMAK" title="Süperpozisyon: ölçülene kadar her şey mümkün" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Kuantum dünyasında bir parçacık, ölçülene kadar tek bir yerde değildir. Bir foton kaynaktan çıkıp perdeye varana dek “şurada ya da burada” değil, tüm olası konumların bir karışımı — bir <strong className="text-teal-300">dalga fonksiyonu</strong> — olarak ilerler; tıpkı <Link href="/articles/cift-yarik" className="article-ilink">çift yarık deneyinde</Link> olduğu gibi.
        </p>
        <p className="mb-6 leading-relaxed text-slate-300">
          Havada dönen bir yazı-turayı düşünün: henüz ne yazı ne tura, ikisinin ihtimali aynı anda. Buna <strong className="text-teal-300">süperpozisyon</strong> denir. Kendin dene — parayı gözlemleyene kadar sonuç yoktur:
        </p>
        <SuperpositionCoin />

        <ArticleImage
          className="kq-img mx-auto max-w-[220px]"
          src="/articles/kuantum-olumsuzlugu/cift-yarik-tonomura.webp"
          ratio="1156 / 3352"
          alt="Üst üste dizilmiş kareler: en üstte birkaç dağınık nokta, aşağı indikçe noktalar çoğalıyor ve en altta belirgin dikey şeritler oluşuyor."
          caption="Tek tek gönderilen elektronlar. Üstteki karelerde yalnızca rastgele noktalar var; binlercesi birikince desen kendiliğinden çıkıyor. Süperpozisyonun gözle görülür kanıtı bu."
          credit="Dr. Tonomura · CC BY-SA 3.0"
        />
      </ArticleSection>

      {/* 2. Ölçüm ve çöküş */}
      <ArticleSection kicker="2. BASAMAK" title="Ölçüm ve çöküş: bakmak sonucu seçer" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Ölçüm yaptığınız an her şey değişir. Fiziğin standart okuması olan <strong className="text-teal-300">Kopenhag yorumu</strong>na göre gözlem, dalga fonksiyonunu “çökertir”: sayısız ihtimalden yalnızca biri gerçek olur, gerisi silinir. Hangisinin çıkacağını <strong className="text-teal-300">Born kuralı</strong> denen olasılık reçetesi belirler. Kutuyu açarsınız; kedi ya ölüdür ya diri.
        </p>
        <p className="leading-relaxed text-slate-300">
          Peki neden fincanı, kediyi, kendimizi hiç “bulanık” görmüyoruz? Çünkü büyük nesneler çevreleriyle o kadar çok etkileşir ki süperpozisyonları anında <strong className="text-violet-300">dekoherans</strong> denen süreçle dağılır — sanki hemen çökmüş gibi. Kuantum tuhaflığı yok olmaz; sadece gözden saklanacak bir yer bulur.
        </p>
      </ArticleSection>

      {/* 3. Çok Dünyalı Yorum */}
      <ArticleSection kicker="3. BASAMAK" title="Çok Dünyalı Yorum: evren her an ikiye ayrılır" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          1957'de genç fizikçi <strong className="text-teal-300">Hugh Everett</strong> bambaşka bir şey önerdi: belki de hiçbir şey çökmüyordur. Belki her ihtimal gerçekleşir — ama her biri ayrı bir “dalda”, ayrı bir evrende. Kedi bir dalda ölür, komşu dalda yaşar. Dahası, ölçümü yapan <em className="not-italic text-violet-300">siz de</em> çatallanırsınız: bir kopyanız ölü kediyi görür, diğeri diriyi. Evren her karar anında sessizce ikiye ayrılır.
        </p>
        <FunFact icon="📝" title="Everett 'ölümsüzlük' vaadi yazmadı">
          Everett'in derdi kuantum mekaniğinin paradokslarını çözmekti, ölümsüzlük değil. “Ölümsüzlük” yorumu sonradan, başkaları tarafından eklendi.
        </FunFact>
      </ArticleSection>

      {/* 4. Kuantum intiharı — CENTERPIECE */}
      <ArticleSection kicker="4. BASAMAK · İNTERAKTİF" title="Kuantum intiharı ve ölümsüzlük" max="max-w-4xl">
        <div className="mx-auto mb-6 max-w-[240px]">
          <ArticleImage
            className="kq-img"
            src="/articles/kuantum-olumsuzlugu/tegmark-portre.webp"
            ratio="1600 / 2027"
            alt="Gülümseyen, orta yaşlı bir adamın konuşma yaparken çekilmiş fotoğrafı."
            caption="Max Tegmark: düşünce deneyine 1998'de resmî biçimini verdi ve “kuantum silahı” kurgusunu tanımladı. Deneyin üç sıkı koşulu da ona ait — bu yüzden gerçek hayattaki kazalara uygulanamaz."
            credit="Wikimedia Commons · CC BY-SA"
          />
        </div>
        <p className="mb-4 leading-relaxed text-slate-300">
          Fikrin kökleri 1980'lere uzanır: <strong className="text-teal-300">Hans Moravec</strong> (1987) ve filozof <strong className="text-teal-300">Bruno Marchal</strong> (1988) birbirinden habersiz benzer bir deney önerdi; MIT'li fizikçi <strong className="text-teal-300">Max Tegmark</strong> 1998'de ona resmî biçimini verdi. Tegmark'ın kurgusunda düzenek bir “kuantum silahı”dır: her tetikte bir parçacığın spinini ölçer, “aşağı” çıkarsa ateşler, “yukarı” çıkarsa yalnızca bir “klik” sesi verir.
        </p>
        <p className="mb-4 leading-relaxed text-slate-300">
          Çok Dünyalı Yorum doğruysa, düzeneğin ateşlendiği dallarda ölürsünüz — ama o dallarda artık bunu deneyimleyecek bir “siz” kalmaz. Bilinciniz yalnızca hayatta kaldığınız dallarda devam eder. Yani öznel deneyiminiz açısından hiç ölmezsiniz. <strong className="text-teal-300">Dışarıdan ölürsünüz, içeriden asla.</strong> Kuantum ölümsüzlüğü budur.
        </p>
        <p className="mb-6 text-sm text-slate-400">Deneyi kendin çalıştır: her tetikte bir dalda ölür, komşu dalda yaşarsın. Öznel olarak hep hayattasın — ama var olduğun dalın olasılığı yarıya iner.</p>
        <QuantumSuicideSim />
        <p className="mt-6 leading-relaxed text-slate-300">
          Ne kadar çok tetiklerseniz tetikleyin, kendinizi hep hayatta bulursunuz. Ama tam da bu dalın olasılığı her turda yarıya iner: bir tetikte 1/2, onuncu turda 1/1.024, on altıncı turda <strong className="text-rose-300">1/65.536</strong>. Öznel olarak ölümsüzsünüzdür; istatistiksel olarak neredeyse yok olmuşsunuzdur. İşte kuantum ölümsüzlüğünün hem büyüsü hem tuzağı buradadır.
        </p>
      </ArticleSection>

      {/* Zaman çizelgesi */}
      <HorizontalTimeline kicker="FİKRİN TARİHİ · 1935 → 2024" heading="Bir itirazdan bir romana" items={timeline} />

      {/* Mobius kitabı */}
      <ArticleSection kicker="VE SONRA FİKİR ROMANA KAÇTI" title="Mobius" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          Adam Fawer'ın 2024 tarihli <em className="not-italic text-teal-300">Mobius</em>'u, adını sonsuzluğu simgeleyen Möbius şeridinden alır ve tam da bu çok-dünyalı mekanik üzerine kurulur. Romanın dâhi fizikçisi Rowan, evrenin her yol ayrımında bölündüğü anları — Everett'in dallarını — kendi diliyle “ayırıcı” olarak adlandırır.
        </p>
        <p className="mb-6 leading-relaxed text-slate-300">
          Fawer'ın (ve fiziğin) kurduğu ikili de aynıdır: geçmiş <Link href="/articles/newton" className="article-ilink">klasik fiziktir</Link> — gözlenmiş, çökmüş, sabit; gelecekse kuantumdur — hâlâ tüm ihtimallerin süperpozisyonu. Geçmiş tek, katı, değişmez bir çizgi; gelecek ise açık, çatallı, henüz seçilmemiş.
        </p>
        <div className="grid items-center gap-6 sm:grid-cols-2">
          <MobiusStrip />

        <ArticleImage
          className="kq-img mt-6"
          src="/articles/kuantum-olumsuzlugu/mobius-heykeli.webp"
          ratio="1600 / 1200"
          alt="Açık havada duran metal heykel: kendi üzerine bükülerek kapanan, tek yüzlü şerit biçiminde bir halka."
          caption="Möbius şeridinin gerçek dünyadaki hâli. Tek bir yüzü vardır: üstünde yürürseniz, hiç kenardan geçmeden başladığınız yere dönersiniz."
          credit="Wikimedia Commons · CC BY-SA"
        />
          <div>
            <Quote by="Rowan · Adam Fawer, Mobius">“Her yeni yol ayrımında evren çatallanıyor, ayrılıyor.”</Quote>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">Tek cümlede, Everett'in altmış yıllık yorumu. Ama <em className="not-italic text-teal-300">Mobius</em> bir fizik dersi değil: Fawer bu mekaniği bir <strong className="text-white">pişmanlık makinesine</strong> çevirir. Kitabın asıl sorusu kuantumun değil, insanın: elimizde her şeyi geri alma şansı olsa, gerçekten daha iyisini yapar mıydık?</p>
          </div>
        </div>
      </ArticleSection>

      {/* Teselli mi kâbus mu */}
      <ArticleSection title="Peki bu bir teselli mi, yoksa kâbus mu?" max="max-w-4xl">
        <p className="mb-4 leading-relaxed text-slate-300">
          İlk bakışta rahatlatıcı: ölmüyorsunuz. Ama kuantum ölümsüzlüğü size sonsuz gençlik ya da sağlık vaat etmez — yalnızca <strong className="text-teal-300">“devam”</strong> vaat eder. Her felaketten sağ çıkarsınız, ama belki giderek daha hasarlı, daha yaşlı, herkesin ve her şeyin çoktan gittiği bir dalda; hep hayatta kalan, hep <em className="not-italic text-violet-300">geride kalan</em> olarak.
        </p>
        <p className="leading-relaxed text-slate-300">
          Filozof <strong className="text-teal-300">David Lewis</strong>, 2001'deki “Schrödinger'in Kedisinin Kaç Canı Var?” dersinde tam da bu yüzden fikrin teselli edici okumasını reddetti — vardığı sonucu ürkütücü buldu. İyi bilim kurgu tam da bunu yapar: bir denklemi alır, içine bir insan koyar ve “peki bunu yaşamak neye benzerdi?” diye sorar. <strong className="text-white">Fizik cevabı verir; roman bedeli gösterir.</strong>
        </p>
      </ArticleSection>

      {/* Fizikçiler inanıyor mu */}
      <ArticleSection title="Ama fizikçiler buna inanıyor mu?" max="max-w-4xl">
        <p className="mb-6 leading-relaxed text-slate-300">
          Kısaca: <strong className="text-teal-300">çoğu inanmıyor.</strong> Kuantum ölümsüzlüğü kanıtlanmış bir bilim değil, sınırlarını yoklayan bir düşünce deneyidir; hatta Çok Dünyalı Yorum'u savunanlar arasında bile tartışmalıdır. Başlıca itirazlar:
        </p>
        <CardGrid items={objections} cols={2} />
        <p className="mt-6 leading-relaxed text-slate-300">
          Bir de şu var: internette, kazalardan “inanılmaz” biçimde sağ çıkmasını kuantum ölümsüzlüğüne kanıt sayan topluluklar var. Fizikçiler için bunlar kanıt değil, anlatı — seçilmiş hatıralar ve klasik “hayatta kalanın yanılgısı”. Kısacası kuantum ölümsüzlüğü, fiziğin kenarında duran, düşünmesi baş döndürücü ama eldeki kanıtı olmayan bir <em className="not-italic text-teal-300">“ya öyleyse?”</em> sorusudur.
        </p>
      </ArticleSection>

      {/* Quiz */}
      <ArticleSection kicker="MİNİ TEST" title="Ne kadar anladın?">
        <ArticleQuiz questions={quizQs} />
      </ArticleSection>

      {/* Finale */}
      <ArticleSection center title="∞" max="max-w-3xl">
        <div className="mx-auto mb-6 max-w-[240px]">
          <ArticleImage
            className="kq-img"
            src="/articles/kuantum-olumsuzlugu/schrodinger-mezari.webp"
            ratio="1600 / 2399"
            alt="Küçük bir mezar taşı: üstünde isim ve tarihler, altında bir denklem kazınmış."
            caption="Schrödinger'in mezar taşı. Kutudaki kediyi soran adam öldü; taşın üstünde kalan şey, ölümü hiç konu etmeyen denklemi."
            credit="Wikimedia Commons · CC BY-SA"
          />
        </div>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-300">
          Möbius şeridinin tek bir yüzü vardır; üzerinde yürürseniz, başladığınız yere geri dönersiniz. Kuantum ölümsüzlüğü de öyle: <span className="text-teal-300">fizikle başlar, felsefeye kıvrılır</span>, araya biraz teoloji ve biraz korku iliştirir, sonra yine fiziğe döner ve elinize tam bir “kanıt” tutuşturmaz. Belki asıl mesele cevap değildir — iyi bir düşünce deneyi de, iyi bir roman da aynı şeyi yapar: bir cevap vermez, aklınıza takılır ve bir daha çıkmaz.
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-xl font-medium text-teal-200">Siz olsanız — hangi dalda uyanmak isterdiniz?</p>
      </ArticleSection>

      <div className="relative z-10">
        <ArticleBibliography items={refs} accent={ACCENT} />
      </div>

      <ArticleFooter tagline="Dışarıdan ölürsün, içeriden asla. Fizikle başlar, felsefeye kıvrılır, romana kaçar. ♾️" />
    </ArticleShell>
  );
}
