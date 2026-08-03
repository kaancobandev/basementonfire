'use client';

// MONTAJ dosyası — iş mantığı YOK. İskelet ArticleBlocks'tan (GSAP orada kurulur),
// modüller widgets/decisions/sim-tablo'dan gelir.
//
// Hero: object3d="orbital" — union'da tanımlı ve hiçbir makalede kullanılmamıştı.
// Süs değil, TEZİN KENDİSİ: tablonun şekli orbital doldurmasından çıkıyor.

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection, ArticleFooter,
  HorizontalTimeline, ArticleQuiz,
} from '@/app/components/article/ArticleBlocks';
import ArticleBibliography from '@/app/components/ArticleBibliography';
import ArticleImage from '@/app/components/article/ArticleImage';
import { ACCENT, BG, AdlandirmaNotu, InView, TahminNotu, WidgetSkeleton } from './ui';
import { ReadingProgress, PerdeNav } from './chrome';
import { TabloPoster } from './posters';
import { TahminMasasi, YontemKutusu, HayaletListesi, OrbitalAnatomisi, TrendGrafigi } from './widgets';
import { BoslukKarari, AdlandirmaKarari } from './decisions';
import {
  KARLSRUHE, LECOQ, NEWTONYUM, TELLUR, NOBEL, SEKIL, MADELUNG, GRUP3,
  OGANESSON, YARIS, SON, RELATIVITE, TURKIYE, timeline, quizQs,
} from './data';
import { refs } from './refs';

const SimTablo = dynamic(() => import('./sim-tablo'), {
  ssr: false,
  loading: () => <WidgetSkeleton height={520} />,
});

// ArticleHero DÖRT renk ister (tuple, dizi değil) ve değerler LİNEER uzayda 0-1.
type Rgb3 = [number, number, number];
const HERO_COLORS: [Rgb3, Rgb3, Rgb3, Rgb3] = [
  [0.91, 0.47, 0.98], [0.65, 0.55, 0.98], [0.38, 0.65, 0.98], [0.18, 0.06, 0.40],
];

// ArticleImage'ın slate varsayılanlarını makalenin fuşya paletine bağlar.
// Katman B'deki scoped <style> bloğunun Tailwind karşılığı (keyfî özellik sözdizimi).
const IMG = '[--ai-caption:#c5bcc9] [--ai-credit:#7d7386] [--ai-border:rgba(232,121,249,0.2)] [--ai-fill:rgba(232,121,249,0.05)] [--ai-mark:rgba(232,121,249,0.26)]';

const PERDES = [
  { id: 'perde-1', label: 'Bahis' },
  { id: 'perde-2', label: 'Fatura' },
  { id: 'perde-3', label: 'Şekil' },
  { id: 'perde-4', label: 'Sınır' },
  { id: 'perde-5', label: 'Burada' },
];

export default function PeriyodikTabloClient() {
  return (
    <>
      <ReadingProgress />
      <PerdeNav items={PERDES} />

      <ArticleShell accent={ACCENT} bg={BG} title="Periyodik Tablo">
        <ArticleHero
          title="Periyodik Tablo"
          eyebrow="KİMYA · TAHMİN · SINIR"
          subtitle="Bir sıralama şeması, henüz keşfedilmemiş şeyler hakkında nasıl doğru konuşabilir?"
          colors={HERO_COLORS}
          object3d="orbital"
        />

        <ArticleLede
          points={[
            'Mendeleyev boş kareler bıraktı ve onları önceden tarif etti',
            'Aynı yöntem hiç bulunamayan on dört element de üretti',
            'Tablonun şekli hâlâ ilk ilkelerden türetilmiş değil',
          ]}
        >
          Periyodik tablo bir dolap değil. Elementleri düzenli kutulara koyduğu için
          değil, <strong>henüz elimizde olmayan şeyler hakkında doğru cümleler
          kurabildiği</strong> için önemli. Bu yazı o makinenin nasıl çalıştığını, nerede
          tuttuğunu ve nerede tökezlediğini anlatıyor — ve neden hâlâ bitmediğini.
        </ArticleLede>

        {/* Tabloyu en başta ver: insanlar bunun için geldi. */}
        <ArticleSection kicker="ÖNCE TABLO" title="118 element, dört blok">
          <InView poster={<TabloPoster />} minHeight={520}>
            <SimTablo />
          </InView>
        </ArticleSection>

        {/* ══════════ PERDE 1 ══════════ */}
        <div id="perde-1">
          <ArticleSection kicker="PERDE 1 · BAHİS" title="Kartlar masaya diziliyor">
            <p>
              {KARLSRUHE.yil}, {KARLSRUHE.yer}. {KARLSRUHE.olay} {KARLSRUHE.yorum}
            </p>
            <p>
              Dokuz yıl sonra, elindeki kartları atom ağırlığına göre sıraladığında bir şey
              fark etti: özellikler belli aralıklarla <em>tekrar ediyordu</em>. Ama sıralama
              ancak bazı kutuları <strong>boş bırakırsa</strong> düzgün çalışıyordu. Boşluğu
              doldurmak yerine, orada henüz bulunmamış bir element olduğunu iddia etti — ve
              o elementin nasıl bir şey olacağını yazdı.
            </p>
            <ArticleImage
              className={IMG}
              src="/articles/periyodik-tablo/duvar-tablosu-1885.webp"
              ratio="1600 / 1067"
              priority
              alt="Kenarları yıpranmış, kahverengileşmiş büyük bir litografi duvar tablosu; Almanca başlığı Periodische Gesetzmässigkeit der Elemente nach Mendelejeff, sütunları Gruppe I'den VIII'e, hücrelerinde element sembolleri ve atom ağırlıkları, bazı hücrelerde yalnızca tire var."
              caption={
                <>
                  Makinenin çalışırken çekilmiş fotoğrafı. <strong>Sc=44</strong> ve{' '}
                  <strong>Ga=68</strong> artık dolu — 1879 ve 1875 keşifleri. Ama Grup IV'te{' '}
                  <strong>−=72</strong> hâlâ boş: germanyum bir yıl sonra gelecek. Grup VI'daki{' '}
                  <strong>−=100</strong> ise 1937'ye kadar bekleyecek. Yanındaki{' '}
                  <strong>Di=145?</strong> hiç element değildi, sonradan ikiye ayrıldı. Ve soy gaz
                  sütunu tablonun hiçbir yerinde yok. Dolu, boş, yanlış ve eksik — dördü aynı yüzeyde.
                </>
              }
              credit="“Mendeleyev'e göre” — Lenoir & Forster / Lith. Ant. Hartinger & Sohn, Viyana, 1879-1886 arası. Mendeleyev'in kendi eseri değil, bir öğretim duvar tablosu. Kamu malı, University of St Andrews koleksiyonu"
            />
            <ArticleImage
              className={IMG}
              src="/articles/periyodik-tablo/el-yazisi-calisma-sayfasi.webp"
              ratio="1600 / 1200"
              alt="Mendeleyev'in el yazısıyla mürekkeple doldurulmuş çalışma sayfası; element sembolleri ve atom ağırlıkları arasında tire işaretiyle yazılmış boş kayıtlar."
              caption="Boşluklar onun kendi elinden: sayfada “−=44”, “−=68” ve “−=72” yazıyor. Henüz adları yok, sadece birer sayı — sırasıyla skandiyum, galyum ve germanyum olacaklar."
              credit="Saint Petersburg Üniversitesi'ndeki dairesinde sergilenen el yazısı tablolarından biri · Foto: Scotted400, CC0"
            />
            <YontemKutusu />
            <TahminMasasi />
            <ArticleImage
              className={IMG}
              src="/articles/periyodik-tablo/winkler-germanyum-1886.webp"
              ratio="1024 / 755"
              alt="Cam kaplarda germanyum preparatlarını gösteren eski bir siyah-beyaz fotoğraf; üstte ve altta iki sıra numune."
              caption="Tahminin ete kemiğe bürünmüş hâli: Clemens Winkler'in kendi germanyum preparatları. Alt sıra 6 Şubat 1886 tarihli ve saf metal değil, germanyum sülfür bileşiği; üst sıra ise 1904 Dünya Sergisi için hazırlanmış sergileme numuneleri."
              credit="Kamu malı"
            />
            <p>
              <strong>{LECOQ.yil}.</strong> {LECOQ.olay} {LECOQ.sonuc}
            </p>
            <ArticleImage
              className={IMG}
              src="/articles/periyodik-tablo/eriyik-galyum.webp"
              ratio="1600 / 1063"
              alt="Ayna gibi parlayan gümüş renkli eriyik galyum yığını; yüzeyi çevresindeki ışığı yansıtıyor."
              caption="Tartışmanın konusu: eriyik galyum, yalnızca kendi yüzey gerilimiyle tutunuyor. Yoğunluğunu Lecoq önce 4,7 ölçtü; Mendeleyev'in itirazından sonra yeniden ölçtüğünde 5,9 çıktı."
              credit="Foto: Pixelmaniac pictures, CC0"
            />
            <TahminNotu tuttu>{LECOQ.yorum}</TahminNotu>
            <BoslukKarari />
          </ArticleSection>
        </div>

        {/* ══════════ PERDE 2 ══════════ */}
        <div id="perde-2">
          <ArticleSection kicker="PERDE 2 · FATURA" title="Ama aynı makine hayalet de üretti">
            <p>
              Buraya kadar anlatılan hikâye her yerde var. Anlatılmayan kısım şu: Mendeleyev
              yalnız üç tahmin yapmadı. Onlarca yaptı, ve çoğu tutmadı.
            </p>
            <HayaletListesi />
            <p><strong>{NEWTONYUM.baslik}</strong> {NEWTONYUM.metin}</p>
            <p>{NEWTONYUM.hesap}</p>
            <TahminNotu tuttu={false}>
              {NEWTONYUM.ders} {NEWTONYUM.koronyumSon}
            </TahminNotu>
            <p><strong>{TELLUR.baslik}.</strong> {TELLUR.metin} {TELLUR.gercek}</p>
            <ArticleImage
              className={IMG}
              src="/articles/periyodik-tablo/moseley-spektrum-merdiveni.webp"
              ratio="1363 / 1750"
              alt="Siyah zemin üzerinde beyaz dikdörtgen spektrum çizgileri; her satır bir element ve satırlar sağdan sola inen düzenli bir merdiven oluşturuyor. Soldan etiketler: Ca, Ti, V, Cr, Mn, Fe, Co, Ni, Cu, Brass."
              caption="Moseley'in plakası: her element bir basamak, basamaklar düzenli. Düzeni veren şey atom ağırlığı değil, çekirdekteki proton sayısı. Kalsiyum ile titanyum arasındaki atlama da dikkat çekici — orada olması gereken element skandiyum, yani Mendeleyev'in en temiz isabeti. En alttaki “Brass” bir element değil, pirinç: karşılaştırma için konmuş."
              credit="Henry Moseley · Kamu malı"
            />
            <p>{TELLUR.cozum}</p>
            <ArticleImage
              className={IMG}
              src="/articles/periyodik-tablo/henry-moseley-portre.webp"
              ratio="1600 / 2002"
              alt="Genç bir adamın siyah-beyaz baş-omuz portresi; bıyıklı, tüvit ceket ve koyu kravat. Arkada bulanık laboratuvar rafları ve sıralar hâlinde reaktif şişeleri."
              caption="Sıralamayı düzelten adam. Moseley bu işi 1913'te yaptı; iki yıl sonra, 1915'te Gelibolu'da öldürüldü. Yirmi yedi yaşındaydı."
              credit="Nature dergisi, 1915 öncesi · Fotoğrafçı bilinmiyor · Kamu malı"
            />
            <p className="text-slate-400">{TELLUR.denge}</p>
            <AdlandirmaNotu>{NOBEL.metin}</AdlandirmaNotu>
          </ArticleSection>
        </div>

        {/* ══════════ PERDE 3 ══════════ */}
        <div id="perde-3">
          <ArticleSection kicker="PERDE 3 · ŞEKİL" title="Peki tablo neden işe yarıyor?">
            <p>
              Mendeleyev <em>niye</em> işe yaradığını bilmiyordu. Elektronun keşfine daha
              otuz yıl vardı. Cevap ancak kuantum mekaniğiyle geldi — ve cevabın kendisi
              tablonun tuhaf şeklinde yazılı.
            </p>
            <p><strong>{SEKIL.kok}</strong> {SEKIL.sonuc}</p>
            <OrbitalAnatomisi />
            <p>{SEKIL.bloklar} {SEKIL.lantanit}</p>
            <TrendGrafigi />
            <p><strong>{MADELUNG.baslik}.</strong> {MADELUNG.metin}</p>
            <p className="text-slate-400">
              İstisnalar arasında gündelik metaller var: {MADELUNG.istisnalar.slice(0, 6).join(', ')} ve
              diğerleri. {MADELUNG.hukum}
            </p>
          </ArticleSection>
        </div>

        {/* ══════════ PERDE 4 ══════════ */}
        <div id="perde-4">
          <ArticleSection kicker="PERDE 4 · SINIR" title="Tablonun kenarları hâlâ yazılıyor">
            <p><strong>{GRUP3.soru}</strong> {GRUP3.metin}</p>
            <blockquote className="my-5 border-l-2 pl-4 text-slate-300" style={{ borderColor: ACCENT }}>
              “{GRUP3.alinti}”
              <footer className="mt-1.5 text-xs text-slate-500">— {GRUP3.alintiKaynak}</footer>
            </blockquote>
            <p>{GRUP3.uzlasi}</p>
            <AdlandirmaNotu>{GRUP3.turkiye}</AdlandirmaNotu>

            <p><strong>{OGANESSON.baslik}.</strong> {OGANESSON.metin}</p>
            <p>{OGANESSON.derin}</p>

            <p><strong>{YARIS.baslik}</strong> {YARIS.riken.yer}: {YARIS.riken.demet} demeti{' '}
              {YARIS.riken.hedef} hedefine çarpıyor, {YARIS.riken.siddet}. {YARIS.riken.tekerlek}.
              Buna rağmen {YARIS.riken.beklenti}.
            </p>
            <ArticleImage
              className={IMG}
              src="/articles/periyodik-tablo/riken-kuryum-hedef-tekerlegi.webp"
              ratio="884 / 825"
              alt="Alüminyum bir tekerlek; jantının çevresine dizilmiş on altı dikdörtgen hedef yuvası, her birinin üzerinde el yazısıyla Cm ve bir numara yazılı."
              caption="“Hedef” dediğimiz şey bu: jantın çevresine dizilmiş on altı kuryum oksit numunesi, her birinin üzerinde el yazısıyla Cm 97'den Cm 112'ye numaralar. Tekerlek dakikada iki bin devirle dönüyor, vanadyum demeti üzerine düşüyor — ve istenen çarpışma yaklaşık iki yüz günde bir gerçekleşiyor."
              credit="RIKEN · CC BY 4.0"
            />
            <p>
              {YARIS.berkeley.yer}: {YARIS.berkeley.sonuc}. {YARIS.berkeley.onem}.{' '}
              {YARIS.berkeley.zorluk}.
            </p>

            <p><strong>{SON.baslik}</strong> {SON.naif} {SON.gercek} {SON.ada}</p>
            <p className="text-slate-400">
              Kararlılık adasının nerede olduğu, çekirdeğin ne kadar dayandığıyla ilgili bir
              soru — ve o hikâye{' '}
              <Link href="/articles/radyoaktivite" className="article-ilink" style={{ color: ACCENT }}>
                radyoaktivite dosyasında
              </Link>{' '}
              yarılanma süreleriyle birlikte duruyor.
            </p>
          </ArticleSection>
        </div>

        {/* ══════════ PERDE 5 ══════════ */}
        <div id="perde-5">
          <ArticleSection kicker="PERDE 5 · BURADA" title="Tablonun Türkiye’ye değen yerleri">
            <p><strong>{RELATIVITE.baslik}.</strong> {RELATIVITE.altin} {RELATIVITE.civa}</p>
            <p>{RELATIVITE.aku} <span className="text-slate-500">({RELATIVITE.kaynak})</span></p>

            <p><strong>{TURKIYE.bor.baslik}.</strong> {TURKIYE.bor.metin} {TURKIYE.bor.ironi}</p>
            <ArticleImage
              className={IMG}
              src="/articles/periyodik-tablo/espey-bor-ocagi.webp"
              ratio="1600 / 900"
              alt="Bir tepenin içine oyulmuş geniş, basamaklı açık ocak; soluk pembe-beyaz-gri şeritli katmanlar teraslar hâlinde üst üste diziliyor, tabanda koyu pasa yığınları ve küçük iş makineleri, iki yanda çam kaplı sırtlar."
              caption="Tablonun 5 numaralı kutusunun ölçeği: Espey açık ocağı. Dünya bor rezervinin yaklaşık üçte ikisinden fazlası bu coğrafyada."
              credit="Espey sahası, Emet, Kütahya, 2015 · Foto: Ahmet Kaynarpunar, CC BY-SA 3.0"
            />
            <p><strong>{TURKIYE.lantanit.baslik}.</strong> {TURKIYE.lantanit.metin}</p>
            <p><strong>{TURKIYE.kitap.baslik}.</strong> {TURKIYE.kitap.metin}</p>
            <TahminNotu tuttu={false}>{TURKIYE.yok.metin}</TahminNotu>

            <AdlandirmaKarari />

            <p>
              Bir elementin kutusundaki ondalıklı sayının aynı zamanda gram cinsinden ne
              anlama geldiği başka bir hikâye — onu{' '}
              <Link href="/articles/mol" className="article-ilink" style={{ color: ACCENT }}>
                mol dosyasında
              </Link>{' '}
              anlattık.
            </p>
          </ArticleSection>
        </div>

        <HorizontalTimeline heading="Yüz elli yılda ne oldu?" items={timeline} />

        <ArticleQuiz questions={quizQs} />

        <ArticleBibliography items={refs} accent={ACCENT} />

        <ArticleFooter tagline="Tablo bir dolap değil, çalışan ve tökezleyen bir tahmin makinesi. Ve hâlâ yazılıyor. ⚗️" />
      </ArticleShell>
    </>
  );
}
