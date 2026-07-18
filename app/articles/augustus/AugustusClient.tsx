'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection, HorizontalTimeline, ArticleQuiz, ArticleBibliography, ArticleFooter,
} from '@/app/components/article/ArticleBlocks';
import ArticleImage from '@/app/components/article/ArticleImage';
import { ACCENT, BG, CRIMSON, MARBLE, InView, WidgetSkeleton, SourceNote } from './ui';
import {
  SaidVsReal, NameSwitch, Tollendum, ProscriptioList, PropagandaToggle, RestoreDecision, JanusCounter, LegionGrid, ApplauseFinale,
} from './widgets';
import { AnatomyPoster, HeirsPoster } from './posters';
import {
  DEATH_LIST, NAME_SWITCH, ALEXANDER, CAESARION, JULIA, TEUTOBURG, DEATHBED, TWO_LINES, timeline, quizQs,
} from './data';
import { refs } from './refs';

const PowerAnatomy = dynamic(() => import('./sim-power'), { ssr: false, loading: () => <WidgetSkeleton height={480} /> });
const HeirsTree = dynamic(() => import('./sim-heirs'), { ssr: false, loading: () => <WidgetSkeleton height={440} /> });

// Altın + porfir shader paleti (0..1). Caesar'ın kanının aksine: soğuk, teatral.
const HERO_COLORS: [[number, number, number], [number, number, number], [number, number, number], [number, number, number]] = [
  [0.05, 0.04, 0.07], [0.28, 0.20, 0.12], [0.79, 0.64, 0.30], [0.55, 0.44, 0.79],
];

export default function AugustusClient() {
  return (
    <ArticleShell accent={ACCENT} bg={BG} title="Augustus">
      <style>{`
        @keyframes aug-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes aug-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        /* ArticleImage'ın slate varsayılanları porfir-indigo zeminde yamalı
           duruyor → imparatorluk altınına bağla (sezar'daki desenin aynısı). */
        .aug-img {
          --ai-caption: #d6d3cd;
          --ai-credit: #9a8a5f;
          --ai-border: rgba(201,164,78,0.22);
          --ai-fill: rgba(201,164,78,0.05);
          --ai-mark: rgba(201,164,78,0.28);
        }
      `}</style>

      <ArticleHero
        title="Augustus"
        fullTitle="Augustus — Tacı Reddederek Kral Olan Adam"
        eyebrow="TACI REDDEDEREK KRAL OLAN ADAM · CAESAR SERİSİ · PARÇA 2"
        gradientText="Augustus"
        colors={HERO_COLORS}
        subtitle={<>Caesar tacı istediği için öldürüldü. Augustus, istemediğini söyleyerek her şeyi aldı — ve elli yıl bir rol oynadı.</>}
      />

      <ArticleLede
        points={[
          'Caesar tacı istedi ve 23 bıçak yedi; Augustus tacı iterek her şeyi aldı ve tanrı ilan edildi',
          'Elli yıl "sıradan bir vatandaşım" dedi — ölüm döşeğinde "oyun bitti, alkışlayın" dedi',
          'En tehlikeli güç, adı olmayan güçtür; bu yazının her etkileşimi bir dedektiflik anı',
        ]}
      >
        Augustus (MÖ 63 – MS 14), Roma’nın ilk imparatoru — ama kendine asla “imparator” ya da “kral” demedi. Bir cumhuriyeti yıkmadan içini boşalttı ve iki yüzyıl sürecek bir barış kurdu. Bu, tacı reddederek nasıl kral olunacağının hikâyesi. Ve bu sayfada okuyucu kahraman değil: <strong>kandırılan</strong>.
      </ArticleLede>

      <div className="relative z-10 mx-auto -mt-4 max-w-3xl px-6">
        <Link href="/articles/sezar" className="flex items-center gap-3 rounded-xl border p-3.5 text-sm transition hover:bg-white/[0.04]" style={{ borderColor: `color-mix(in srgb, ${CRIMSON} 25%, transparent)`, background: `color-mix(in srgb, ${CRIMSON} 5%, transparent)` }}>
          <span className="text-lg">🗡️</span>
          <span className="text-slate-300">Hikâye bir salonun zemininde başlıyor. <span className="font-semibold" style={{ color: `color-mix(in srgb, ${CRIMSON} 85%, white)` }}>→ Önce Caesar’ı oku</span></span>
        </Link>
      </div>

      {/* ══════════ PERDE 1 ══════════ */}
      <ArticleSection kicker="PERDE 1 · ANKARA’DAKİ DUVAR" title="Dünyanın en zarif yalanı Ulus’ta duruyor">
        <p className="leading-relaxed text-slate-300">
          Ankara’da, Ulus’ta, Hacı Bayram Camii’nin hemen yanında bir duvar var. Üstünde, iki bin yıldır, bir adamın kendi hayatını kendi ağzından anlattığı metin yazılı — Latince ve Yunanca. Bugün dünyada bu metnin en eksiksiz kopyası orada, Roma’da bile değil. Adı <em>Res Gestae Divi Augusti</em>: “Tanrısal Augustus’un Yaptıkları”. Ölmeden önce yazdı ve imparatorluğun her yerinde kopyalanmasını emretti.
        </p>

        <ArticleImage
          className="aug-img"
          src="/articles/augustus/ankara-augustus-tapinagi.webp"
          ratio="1600 / 1067"
          priority
          alt="Ankara Ulus’ta, camiye bitişik antik tapınak kalıntısı: yüksek sarımsı taş duvarlar, üstü açık, önünde yeşil alan ve ziyaretçiler."
          caption="Ankara, Ulus: Augustus Tapınağı’nın kalıntıları, Hacı Bayram Camii’nin hemen yanında. Metnin dünyadaki en eksiksiz kopyası bu duvarlarda — Roma’da bile bu kadarı yok."
          credit="Diego Delso · CC BY-SA 4.0"
        />

        <ArticleImage
          className="aug-img"
          src="/articles/augustus/res-gestae-yaziti.webp"
          ratio="1600 / 1222"
          alt="Latince büyük harflerle sütunlar hâlinde dizilmiş yazıtın çizimi; satırlarda kırıklar ve eksik harfler noktalarla gösterilmiş."
          caption="Res Gestae’nin Latince metni. Bu, duvarın fotoğrafı değil: 1872 tarihli arkeolojik yayından bir levha — aşınmış taş fotoğrafta okunmuyor, çizim okunuyor. Kendi anlatısını doğrulamayı öneren bir yazıda, gördüğünüz şeyin ne olduğunu söylememek olmazdı."
          credit="Perrot, Guillaume & Delbet, 1872 · CC0"
        />

        <div className="mt-8">
          <SaidVsReal />
        </div>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 1.2" title="Ölmesi beklenen çocuk">
        <p className="leading-relaxed text-slate-300">
          MÖ 63’te, Velitrae adlı taşra kasabasında Gaius Octavius doğdu. Ailesi asilzade değildi; babası ailede Senato’ya giren ilk kişiydi. Ve çocuk hastaydı — ömrü boyunca. Suetonius’un tarifi neredeyse acıklıdır: solunum problemleri, deri hastalıkları, mesane taşları. Soğuğa dayanamazdı, sıcağa dayanamazdı, cereyandan korkardı. Hayatı boyunca defalarca ölümün eşiğine geldi. Şimdi listeye bakın.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-left text-xs text-slate-400">
                <th className="px-3 py-2.5 font-semibold">Kim</th>
                <th className="px-3 py-2.5 font-semibold">Nasıl gitti</th>
                <th className="px-3 py-2.5 text-right font-semibold">Yaş</th>
              </tr>
            </thead>
            <tbody>
              {DEATH_LIST.map((d) => (
                <tr key={d.name} className="border-b border-white/[0.05] last:border-0" style={d.violent ? undefined : { background: `color-mix(in srgb, ${ACCENT} 8%, transparent)` }}>
                  <td className="px-3 py-2.5 font-semibold" style={{ color: d.violent ? MARBLE : ACCENT }}>{d.name}</td>
                  <td className="px-3 py-2.5 text-slate-300" style={{ color: d.violent ? CRIMSON : ACCENT }}>{d.how}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold" style={{ color: d.violent ? 'inherit' : ACCENT }}>{d.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 leading-relaxed text-slate-300">
          Roma’nın en güçlü, en sağlam, en ölümcül adamlarının hepsi öldürüldü. Hasta çocuk yatağında öldü.
        </p>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 1.3" title="Apollonia: iki haber">
        <p className="leading-relaxed text-slate-300">
          18 yaşındaydı ve Apollonia’da — bugünkü Arnavutluk kıyısında — okuyordu. İlk haber geldi: Caesar öldürüldü. Sonra ikincisi, çok daha tehlikelisi: Caesar vasiyetinde onu evlat edinmiş ve mirasının dörtte üçünü ona bırakmıştı. Ailesi dehşete düştü ve hepsi aynı şeyi söyledi: kabul etme. Mantıkları kusursuzdu — Caesar’ın adını almak, Caesar’ın <em>düşmanlarını</em> almaktı. Roma’da altmış adam vardı, elleri hâlâ kanlıydı.
        </p>
        <p className="mt-4 leading-relaxed text-slate-300">
          Karşısında Marcus Antonius: konsül, Caesar’ın sağ kolu, orduların sevgilisi, 20 yaş büyük. Octavius’un elinde ne vardı? On sekiz yaş, kronik astım ve bir kasaba soyadı. Kabul etti. Ve tarihteki en zeki ilk hamlesini yaptı: o günden itibaren kendine <strong>Gaius Julius Caesar</strong> demeye başladı.
        </p>
        <SourceNote>{NAME_SWITCH.note}</SourceNote>
      </ArticleSection>

      {/* ══════════ PERDE 2 ══════════ */}
      <ArticleSection kicker="PERDE 2 · CANAVARIN DOĞUŞU" title="Başkasının parasıyla değil, kendi parasıyla">
        <p className="leading-relaxed text-slate-300">
          Roma’ya geldi. Antonius onu kapıda karşıladı ve güldü — Caesar’ın parasını elinde tutuyor, bir çocuğa hesap vermeye niyeti yoktu. Caesar vasiyetinde her Roma vatandaşına 300 sesterce bırakmıştı; Antonius ödemiyordu. Octavianus kendi malını sattı ve parayı kendi cebinden ödedi. Bir gecede, Antonius’un hazinesi Octavianus’un itibarına dönüştü. Adam siyasete başlamamıştı bile ve zaten hepsinden iyiydi.
        </p>
        <div className="mt-8">
          <NameSwitch />
        </div>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 2.2" title="Cicero’nun kelime oyunu">
        <p className="leading-relaxed text-slate-300">
          Cicero — Roma’nın en büyük hatibi, Cumhuriyet’in son gerçek savunucusu — bir plan yaptı: çocuğu Antonius’a karşı kullan, sonra at. Antonius’a karşı hayatının konuşmalarını yaptı (Philippica’lar). Aynı anda Octavianus’u Senato’da destekledi. Ve bir mektupta bir espri yaptı.
        </p>
        <ArticleImage
          className="aug-img mx-auto max-w-sm"
          src="/articles/augustus/cicero-portre.webp"
          ratio="1600 / 1559"
          alt="Yaşlı bir adamın mermer büstü: geniş kel alın, derin göz çukurları, sarkmış yanaklar, sıkılmış ince dudaklar."
          caption="Cicero’nun büstü — yüzü değil: bu mermer onun ölümünden yaklaşık bir yüzyıl sonra yapılmış bir Roma kopyası. Kelime oyununu yapan adam, esprinin öznesini yanlış seçtiğini birkaç ay içinde öğrenecekti."
          credit="Wilfredor · CC0"
        />

        <div className="mt-8">
          <Tollendum />
        </div>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 2.3" title="Liste">
        <p className="leading-relaxed text-slate-300">
          Şimdiye kadar bu hikâyeyi okurken muhtemelen Octavianus’u sevdiniz: zeki, cesur, ezilen taraf. Durun. MÖ 43 Aralık’ta Octavianus, Antonius ve Lepidus İkinci Triumvirlik’i kurdu ve Sulla’nın icadını dirilttiler: proscriptio.
        </p>
        <div className="mt-8">
          <ProscriptioList />
        </div>
      </ArticleSection>

      {/* ══════════ PERDE 3 — Agrippa (WIDGET YOK) ══════════ */}
      <ArticleSection kicker="PERDE 3 · NE OLMADIĞINI BİLEN ADAM" title="Philippi: çadırda hasta">
        <p className="leading-relaxed text-slate-300">
          MÖ 42, Philippi — Caesar’ın katilleriyle hesaplaşma. Antonius muhteşem savaştı. Octavianus çadırında hastaydı; düşmanları yıllarca “savaş boyunca bir bataklıkta saklandı” dedi. Muhtemelen abartıydı, ama şu değil: Octavianus kötü bir generaldi. Cesur değildi, saha içgüdüsü yoktu, kılıçla arası yoktu. Ve çoğu insanın aksine ne kendini kandırdı ne telafi etmeye çalıştı. <strong>Ne olmadığını kabul etti — ve o boşluğu dolduracak adamı buldu.</strong>
        </p>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 3.2" title="Agrippa: hiç ihanet etmeyen adam">
        <p className="leading-relaxed text-slate-300">
          <strong>Marcus Vipsanius Agrippa.</strong> Octavianus’un okul arkadaşı, yaşıtı ve muhtemelen Roma tarihinin en yetenekli askerî mühendisi. Donanmayı sıfırdan kurdu, yeni bir savaş aleti icat etti (<em>harpax</em> — mancınıkla fırlatılan kancalı halat), Naulochus’u kazandı, Actium’u kazandı, Roma’nın su kemerlerini yaptı, kanalizasyonunu yeniledi, Pantheon’un ilk hâlini dikti. Yani Augustus’un bütün zaferleri Agrippa’nındı.
        </p>
        <p className="mt-4 leading-relaxed text-slate-300">
          Ve asıl mesele: Agrippa hiçbir zaman ihanet etmedi. Bir kez bile. Ordu onu seviyordu; istese herhangi bir an gücü alabilirdi, kimse durduramazdı. Almadı. Çünkü Octavianus onu asla tehdit görmedi, kıskanmadı, küçültmedi. Tam tersi: kızını ona verdi, vârisi ilan etti, ağır hastalandığında yüzüğünü ona uzattı — yani “ben ölürsem devlet senin.” Roma tarihi üstünü kıskanan generallerle dolu, ve bir tane bile Agrippa yok.
        </p>
        <ArticleImage
          className="aug-img mx-auto max-w-sm"
          src="/articles/augustus/agrippa-portre.webp"
          ratio="1600 / 1708"
          alt="Genç bir erkeğin mermer büstü: düz kesilmiş kâkül, güçlü çene, sert ve dümdüz bakan gözler; yüz hatları köşeli."
          caption="Agrippa. Bu portre de ölümünden sonra, torunu Claudius döneminde yontuldu — hayattan çalışılmış bir yüz değil. Roma tarihi üstünü kıskanan generallerle dolu; bu adam bir kez bile denemedi."
          credit="Marie-Lan Nguyen (User:Jastrow) · CC BY 2.5"
        />

        <p className="mt-4 leading-relaxed text-slate-200">
          Augustus’un dehası savaş kazanmak değildi. Agrippa’yı bulmak ve elli yıl boyunca onu kaybetmemekti. Bunu yapabilmek için bir şeye ihtiyacınız var ve o zekâ değil: <strong>kendi hakkındaki gerçeği kaldırabilmek.</strong> Caesar bunu yapamazdı; her şeyin merkezi olmak zorundaydı. Augustus, merkezde olmayı değil, merkezi kurmayı istiyordu.
        </p>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 3.3" title="Maecenas ve bir şiirin sipariş edilmesi">
        <p className="leading-relaxed text-slate-300">
          İkinci sütun: <strong>Maecenas.</strong> Savaşmazdı, yönetmezdi, resmî hiçbir görevi yoktu. Kültür bakanıydı — o unvan icat edilmeden 1900 yıl önce. Octavianus’un problemi meşruiyetti: kasabalı, sarraf torunu, hasta bir çocuk, katliamla iktidara gelmiş. Bunu nasıl güzelleştirirsiniz? Bir kanunla değil — bir destanla.
        </p>
        <div className="my-6 rounded-2xl border border-white/10 bg-black/25 p-5 text-center">
          <div className="font-mono text-lg leading-relaxed text-slate-200 sm:text-xl">Arma virumque cano, Troiae qui primus ab oris…</div>
          <div className="mt-2 text-xs italic text-slate-500">“Silahları ve o adamı söylüyorum, Truva kıyılarından ilk gelen…” — Aeneis, ilk satır</div>
        </div>
        <p className="leading-relaxed text-slate-300">
          Maecenas, Vergilius’a <em>Aeneis</em>’i sipariş etti. Ve Vergilius’un Aeneas’ı kimdir? Görevine sadık, dindar, kendi mutluluğunu devlet için feda eden, kaderi Roma’yı kurmak olan adam — yani Augustus’un idealize edilmiş portresi, mitolojik geçmişe yerleştirilmiş. Vergilius öldüğünde eseri bitirememişti ve yakılmasını istedi; Augustus emri iptal etti ve yayınlattı. Latin edebiyatının en büyük eseri, bir siyasi kampanyanın parçasıydı — ve o kadar iyi yazılmıştı ki iki bin yıl sonra hâlâ okuyoruz. <strong>Caesar kendi propagandasını kendi yazdı; Augustus ona Vergilius’u yazdırdı.</strong>
        </p>
      </ArticleSection>

      {/* ══════════ PERDE 4 ══════════ */}
      <ArticleSection kicker="PERDE 4 · BİR KADINA AÇILAN SAVAŞ" title="Lepidus’un buharlaşması">
        <p className="leading-relaxed text-slate-300">
          Üçlü’nün üçüncüsünü hatırlıyor musunuz? Lepidus? Kimse hatırlamıyor, ve sebebi bu sahne. MÖ 36’da Sicilya’yı kapmaya kalktı; Octavianus tek başına, silahsız, onun kampına yürüdü ve askerlerine konuştu. Askerler saf değiştirdi. Octavianus onu öldürmedi — bütün unvanlarını aldı, sadece Pontifex Maximus’u bıraktı (ömür boyu, iptal edilemez) ve ev hapsine gönderdi. Lepidus orada 24 yıl yaşadı ve unutuldu. Çok Augustusçu bir çözüm: merhametli değil, zalim de değil — <strong>silme.</strong> Adamı öldürseydi şehit olurdu; yaşattı ve hiçliğe çevirdi.
        </p>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 4.2" title="Savaşı bir kadına açmak">
        <p className="leading-relaxed text-slate-300">
          Sonunda iki adam kaldı: Batı’da Octavianus, Doğu’da Antonius. Ve korkunç bir problem vardı: Roma iç savaştan bıkmıştı. Antonius’a savaş ilan etmek “hadi bir tur daha” demekti; kimse gelmezdi. Çözüm, modern siyasetin doğum belgesidir.
        </p>
        <div className="mt-8">
          <PropagandaToggle />
        </div>

        <ArticleImage
          className="aug-img"
          src="/articles/augustus/actium-savasi.webp"
          ratio="1600 / 1125"
          alt="Barok deniz savaşı tablosu: dumanlar arasında yan yatmış yelkenli gemiler, yanan bir tekne, denizde parçalar ve figürler."
          caption="Actium Deniz Savaşı — Laureys a Castro, 1672. Temsilî: olaydan yaklaşık 1700 yıl sonra hayal edilmiş. Gemiler bile yanlış; Actium kürekli savaş gemileriyle yapıldı, tablodakiler 17. yüzyıl yelkenlileri. Savaşı kazanan da Octavianus değil, Agrippa’ydı."
          credit="Laureys a Castro · kamu malı"
        />
      </ArticleSection>

      <ArticleSection kicker="SAHNE 4.3" title="İskenderiye: aynı mezar, iki adam">
        <p className="leading-relaxed text-slate-300">
          Önceki yazıyı okuyanlar için, tüylerinizi diken diken edecek bir sahne. İskenderiye’yi aldıktan sonra Octavianus Büyük İskender’in mezarını görmek istedi.
        </p>
        <div className="my-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border p-4" style={{ borderColor: `color-mix(in srgb, ${CRIMSON} 28%, transparent)`, background: `color-mix(in srgb, ${CRIMSON} 6%, transparent)` }}>
            <div className="mb-1 text-xs font-bold tracking-wide" style={{ color: CRIMSON }}>{ALEXANDER.caesar.who}</div>
            <div className="mb-2 text-2xl font-black" style={{ color: CRIMSON }}>{ALEXANDER.caesar.verb}</div>
            <p className="text-sm leading-relaxed text-slate-300">{ALEXANDER.caesar.what}</p>
          </div>
          <div className="rounded-2xl border p-4" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 32%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 7%, transparent)` }}>
            <div className="mb-1 text-xs font-bold tracking-wide" style={{ color: ACCENT }}>{ALEXANDER.augustus.who}</div>
            <div className="mb-2 text-2xl font-black" style={{ color: ACCENT }}>{ALEXANDER.augustus.verb}</div>
            <p className="text-sm leading-relaxed text-slate-300">{ALEXANDER.augustus.what}</p>
          </div>
        </div>
        <p className="text-lg font-semibold leading-relaxed text-slate-100">{ALEXANDER.punch}</p>
        <SourceNote>{ALEXANDER.dioNote}</SourceNote>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 4.4" title="Caesarion">
        <p className="leading-relaxed text-slate-300">
          Caesarion {CAESARION.age} yaşındaydı. {CAESARION.who} Kleopatra çocuğu Hindistan’a kaçırmaya çalıştı; yakalandı, kandırılıp geri getirildi. Octavianus danışmanı Areios Didymos’a sordu ne yapmalı diye. Areios, Homeros’a nazire yaparak bir kelime oyunu yaptı: <em>{CAESARION.pun}</em>
        </p>
        <p className="mt-4 leading-relaxed text-slate-300">
          Caesarion öldürüldü. Octavianus, hayatını borçlu olduğu adamın tek gerçek oğlunu, o adamın adını kullanabilmek için öldürdü. {CAESARION.cold}
        </p>
      </ArticleSection>

      {/* ══════════ PERDE 5 ══════════ */}
      <ArticleSection kicker="PERDE 5 · TARİHİN EN BÜYÜK PERFORMANSI" title="MÖ 27: her şeyi geri vermek">
        <p className="leading-relaxed text-slate-300">
          MÖ 27, 13 Ocak. Octavianus Senato’ya girdi. Otuz altı yaşındaydı; bütün rakipleri ölmüştü, bütün lejyonlar onundu, Mısır’ın hazinesi cebindeydi. Ona hayır diyebilecek tek bir insan yoktu. Ve ayağa kalkıp her şeyi geri verdi. Salon dondu. Ve sonra senatörler — çoğu onun tarafından atanmış — dehşete kapıldı: o giderse ne olacaktı? Yeni bir iç savaş, yeni bir Philippi. Barış sadece dört yıldır vardı ve bu adam yüzünden vardı. Yalvardılar.
        </p>
        <div className="mt-8">
          <RestoreDecision />
        </div>
        <ArticleImage
          className="aug-img mx-auto max-w-sm"
          src="/articles/augustus/augustus-pontifex.webp"
          ratio="1600 / 1067"
          alt="Togasının bir ucunu başına örtmüş, ayakta duran genç bir erkeğin beyaz mermer heykeli; yüzü sakin, bakışları ileride."
          caption="Augustus, başrahip (Pontifex Maximus) kıyafetiyle: başı togasıyla örtülü, kurban sunmaya hazır. Kostümün kendisi tezdir — kral tacı değil, dindar bir vatandaşın örtüsü. Aynı adam, aynı yıllarda, dünyanın en büyük ordusunu yönetiyordu."
          credit="Fabrizio Garrisi · CC0"
        />

        <p className="mt-8 leading-relaxed text-slate-300">
          Ona yeni bir isim verdiler: <strong>Augustus</strong> — “yüce, kutsanmış”, o güne kadar yalnız tapınaklar için kullanılan bir kelime. Ama dikkat: yaptığı şey numara değildi. Yetkileri gerçekten bıraktı, yasalar gerçekti, Senato toplanıyordu, konsüller seçiliyordu. Adam Cumhuriyet’i yıkmadı — <strong>içine yerleşti.</strong> Kendine kral demedi (<em>rex</em> Caesar’ı öldüren kelimeydi), diktatör demedi (MÖ 22’de teklif edilince dizlerinin üstüne çöküp togasını yırtarak reddetti). Kendine <em>princeps</em> — “birinci vatandaş” — dedi.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${CRIMSON} 28%, transparent)` }}>
            <p className="text-sm font-semibold leading-relaxed" style={{ color: `color-mix(in srgb, ${CRIMSON} 85%, white)` }}>Caesar tacı istedi ve 23 bıçak yedi.</p>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 32%, transparent)` }}>
            <p className="text-sm font-semibold leading-relaxed" style={{ color: `color-mix(in srgb, ${ACCENT} 88%, white)` }}>Augustus tacı iterek her şeyi aldı ve tanrı ilan edildi.</p>
          </div>
        </div>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 5.2 · YILDIZ MODÜL" title="Peki gerçekte ne oldu?">
        <p className="leading-relaxed text-slate-300">
          Numara neredeydi? Augustus eyaletleri ikiye ayırdı: sakin, barışçıl olanlar Senato’nun; sınırdaki, tehlikeli olanlar — “oralarda düzeni sağlamak gerekiyordu, ne yazık ki” — kendisinin. Bilin bakalım lejyonlar hangi eyaletlerdeydi?
        </p>
        <div className="mt-8">
          <InView poster={<AnatomyPoster />} minHeight={480}>
            <PowerAnatomy />
          </InView>
        </div>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 5.3" title="Mermer ve barış">
        <p className="leading-relaxed text-slate-300">
          Şimdi dürüst olalım: işe yaradı. <em>Pax Romana</em> onunla başladı ve iki yüzyıl sürdü. Akdeniz havzası tarihinde ilk kez tek bir hukuk ve tek bir para altında yaşadı; insanlar İspanya’dan Suriye’ye korsan korkusu olmadan seyahat etti.
        </p>
        <ArticleImage
          className="aug-img"
          src="/articles/augustus/ara-pacis.webp"
          ratio="1600 / 901"
          alt="Mermer kabartma: togalı ve başı örtülü figürlerden oluşan bir alay, yan yana yürüyor; bazı yüzler ve gövde parçaları kırık."
          caption="Ara Pacis — Augustus Barışı Sunağı’nın güney frizi: sunuya giden alayda Augustus ve Agrippa. Gerçek antik mermer, ama sunak 1938’de parçalardan yeniden kuruldu; gördüğünüz bütünlük kısmen modern tamamlamadır. “Tuğla bir şehir bulup mermer bıraktım” cümlesinin somut hâli — ve o mermerin bugüne nasıl geldiği."
          credit="Luciano Tronati · CC BY-SA 4.0"
        />

        <div className="mt-8">
          <JanusCounter />
        </div>
      </ArticleSection>

      {/* ══════════ PERDE 6 — Julia (WIDGET YOK) ══════════ */}
      <ArticleSection kicker="PERDE 6 · BEDEL" title="Kendi kanununun kurbanı: Julia">
        <p className="leading-relaxed text-slate-300">
          Augustus ahlakı yasalaştırdı. {JULIA.law} Ve tek bir biyolojik çocuğu vardı: <strong>Julia.</strong> Zeki, esprili ve babasının anlattığına göre inatçı. Onu üç kez evlendirdi ve hiçbirinde ona sorulmadı:
        </p>
        <ol className="mt-4 space-y-2">
          {JULIA.marriages.map((m, i) => (
            <li key={m.to} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <span className="font-mono text-sm text-slate-500">{i + 1}</span>
              <span className="text-sm leading-relaxed text-slate-300"><strong className="text-white">{m.to}</strong> — {m.note}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 leading-relaxed text-slate-300">{JULIA.fall}</p>
        <blockquote className="mt-5 border-l-2 pl-4 text-lg italic leading-relaxed text-slate-200" style={{ borderColor: CRIMSON }}>
          {JULIA.wound}
        </blockquote>
        <p className="mt-5 leading-relaxed text-slate-400">{JULIA.question}</p>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 6.2" title="Vârisler ölmeye devam etti">
        <p className="leading-relaxed text-slate-300">
          Ve şimdi hayatının gerçek trajedisi. Augustus bir hanedan kurmak istedi — ve ölüm, seçtiği her adamı sırayla yedi. Beş vâris. Hepsi genç. Hepsi o hayattayken.
        </p>
        <div className="mt-8">
          <InView poster={<HeirsPoster />} minHeight={440}>
            <HeirsTree />
          </InView>
        </div>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 6.3" title="“Varus, lejyonlarımı geri ver”">
        <p className="leading-relaxed text-slate-300">
          MS 9. Augustus 71 yaşında. Germania’da valisi Varus’un güvendiği bir danışman vardı: <strong>Arminius.</strong> {TEUTOBURG.betrayer} {TEUTOBURG.scene}
        </p>
        <div className="my-6 rounded-2xl border border-white/10 bg-black/25 p-5 text-center">
          <div className="font-mono text-lg font-black text-white sm:text-xl">{TEUTOBURG.cry}</div>
          <div className="mt-1 text-sm italic text-slate-400">“{TEUTOBURG.cryTr}”</div>
        </div>
        <p className="leading-relaxed text-slate-300">{TEUTOBURG.grief}</p>

        <ArticleImage
          className="aug-img mx-auto max-w-sm"
          src="/articles/augustus/kalkriese-maskesi.webp"
          ratio="1600 / 1226"
          alt="Paslanmış demirden bir yüz maskesi: göz ve ağız boşlukları oyuk, yüzey yer yer delinmiş ve aşınmış; müze vitrininde sergileniyor."
          caption="Kalkriese’de, Teutoburg savaş alanında bulunan bir Roma süvari miğferinin yüz maskesi. Üç lejyonun geriye bıraktığı şeylerden biri: üç boşluk."
          credit="Carole Raddato · CC BY-SA 2.0"
        />

        <div className="mt-8">
          <LegionGrid />
        </div>
      </ArticleSection>

      <HorizontalTimeline heading="Bir hayatın tamamı, tek şeritte" kicker="MÖ 63 → 1453" items={timeline} />

      {/* ══════════ PERDE 7 ══════════ */}
      <ArticleSection kicker="PERDE 7 · PERDE" title="“Rolümü iyi oynadım mı?”">
        <p className="leading-relaxed text-slate-300">
          {DEATHBED.where} Augustus 75 yaşındaydı ve ölüyordu — odayı seçmişti: babasının öldüğü oda. Elli yedi yıl önce Apollonia’da bir haber almış hasta bir çocuktu; şimdi Akdeniz’in tamamı onun kurduğu sistemle yönetiliyordu ve kimse başka bir dünya hatırlamıyordu. {DEATHBED.mirror}
        </p>
        <blockquote className="mt-5 border-l-2 pl-4 text-lg italic leading-relaxed text-slate-100" style={{ borderColor: ACCENT }}>
          “{DEATHBED.question}”
        </blockquote>
        <p className="mt-4 leading-relaxed text-slate-300">
          Onayladılar. Ve Augustus, Roma komedilerinde oyun bittiğinde aktörlerin seyirciye söylediği kapanış repliğini söyledi:
        </p>
        <div className="my-6 rounded-2xl border p-5 text-center" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 6%, transparent)` }}>
          <div className="font-mono text-2xl font-black" style={{ color: ACCENT }}>{DEATHBED.closing}</div>
          <div className="mt-1 text-base italic text-slate-300">“{DEATHBED.closingTr}”</div>
        </div>
        <p className="leading-relaxed text-slate-300">{DEATHBED.closingNote}</p>
        <p className="mt-4 leading-relaxed text-slate-400">{DEATHBED.livia} {DEATHBED.divus}</p>
      </ArticleSection>

      <ArticleSection kicker="SAHNE 7.2 · FİNAL" title="İki cümle">
        <p className="leading-relaxed text-slate-300">
          İki adam. Aynı aile. Aynı isim. Aynı imkânsız hedef: Roma’yı tek bir insanın etrafında yeniden kurmak. Ama ölürken söyledikleri her şeyi anlatır.
        </p>
        <div className="my-6 grid gap-3 sm:grid-cols-2">
          {[TWO_LINES.caesar, TWO_LINES.augustus].map((c, i) => (
            <div key={c.name} className="rounded-2xl border p-4" style={{ borderColor: i === 0 ? `color-mix(in srgb, ${CRIMSON} 28%, transparent)` : `color-mix(in srgb, ${ACCENT} 32%, transparent)`, background: i === 0 ? `color-mix(in srgb, ${CRIMSON} 6%, transparent)` : `color-mix(in srgb, ${ACCENT} 6%, transparent)` }}>
              <div className="text-xs font-bold" style={{ color: i === 0 ? CRIMSON : ACCENT }}>{c.name}</div>
              <div className="mt-2 font-mono text-lg font-black text-white">{c.latin}</div>
              <div className="text-sm italic text-slate-400">“{c.tr}” — {c.who}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{c.end}</p>
            </div>
          ))}
        </div>
        <p className="leading-relaxed text-slate-300">{TWO_LINES.legacy}</p>
        <p className="mt-4 leading-relaxed text-slate-300">{TWO_LINES.system}</p>
        <div className="relative z-10 mt-6">
          <Link href="/articles/fatih" className="flex items-center gap-3 rounded-xl border p-3.5 text-sm transition hover:bg-white/[0.04]" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 28%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 5%, transparent)` }}>
            <span className="text-lg">🏰</span>
            <span className="text-slate-300">O boşalan koltuğa oturup Roma unvanını alan adam. <span className="font-semibold" style={{ color: ACCENT }}>→ Fatih Sultan Mehmed</span></span>
          </Link>
        </div>
        <div className="mt-8">
          <ApplauseFinale />
        </div>
      </ArticleSection>

      <ArticleSection kicker="MİNİ TEST" title="Kandırıldın mı? Bakalım.">
        <ArticleQuiz questions={quizQs} />
      </ArticleSection>

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-300">Kaynak notu: </span>
          Ana kaynaklar: Augustus’un kendi <em>Res Gestae</em>’si (propaganda — ama Ankara’daki kopya sayesinde neredeyse eksiksiz), Suetonius (<em>Divus Augustus</em> — sağlık ve son sözler), Cassius Dio, Tacitus (<em>Annales</em> — Principatus’un en zeki eleştirisi; Livia şüphesi ondan) ve Appianos. Livia’nın vârisleri zehirlediği iddiası <strong>kanıtlanmamış</strong> bir söylentidir; Tacitus ima eder, Robert Graves romanlaştırır, tarihçilerin çoğu inanmaz — yazıda da “söylenti” olarak verildi. Julia’nın sürgünündeki gerçek gerekçe hâlâ tartışmalıdır.
        </div>
      </div>

      <div className="relative z-10">
        <ArticleBibliography items={refs} accent={ACCENT} />
      </div>

      <ArticleFooter tagline="Acta est fabula, plaudite. Oyun bitti — alkışlayın. 🏛️" />
    </ArticleShell>
  );
}
