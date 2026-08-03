'use client';

// Katman B makalesi: WebGL yok, GSAP yok, ArticleBlocks'tan import YOK
// (o dosya modül tepesinde gsap + ScrollTrigger çekiyor).
// Hero saf CSS; interaktif parçalar ./widgets içinde, saf React + SVG.
//
// ⚠ EDİTÖRYEL ÇİZGİ — SİYASETSİZ: bu makale enflasyonu MEKANİZMA olarak anlatır.
// Ölçüm yöntemi tartışmasına girerken taraf tutmaz; farklı sepet ağırlığının
// farklı sonuç vermesi matematiksel bir zorunluluktur ve yazı bunu öyle sunar.
// Duygusal işi hesaplayıcı yapar: okur kendi sayısını görür, kimse ona ne
// düşüneceğini söylemez. Güncel Türkiye'ye ait tek bir fotoğraf bile yoktur.

import Link from 'next/link';
import ArticleBibliography from '@/app/components/ArticleBibliography';
import ArticleImage from '@/app/components/article/ArticleImage';
import { SepetKatki, KisiselEnflasyon, AlimGucu } from './widgets';
import { refs } from './refs';

const ACCENT = '#e8a33d';

const SEPETE_GIRENLER = ['Simit', 'Yöresel peynir çeşitleri', 'Hazır pizza ve börek', 'Okul forması', 'Bebek kıyafeti', 'Termos', 'Araç ekspertiz hizmeti'];
const SEPETTEN_CIKANLAR = ['Kravat', 'Gazete', 'Kakao', 'Yufka', 'Bazı tıraş ürünleri'];

const MOTORLAR = [
  { ad: 'Talep çekişli', metin: 'İnsanların elinde çok para var, ortada mal az. Klasik tarif: çok para, az malın peşinde koşuyor. Herkes aynı anda araba almak isterse, araba sayısı artmadıkça fiyat yükselir.' },
  { ad: 'Maliyet itişli', metin: 'Üretmek pahalılaşır. Enerji zamlanır, hammadde pahalanır, nakliye artar; üretici bunu fiyata yansıtır. 2022’de dünyanın büyük kısmını vuran dalganın ana motoru buydu.' },
  { ad: 'Kur geçişkenliği', metin: 'Ekonomi ithal girdiye bağımlıysa — petrol, doğal gaz, ilaç hammaddesi, elektronik parça — döviz yükseldiğinde bunların yerli para cinsinden fiyatı otomatik yükselir. Yerli üretilen malın bile içinde ithal bir parça vardır; kur hareketi birkaç ay gecikmeyle rafa yürür.' },
  { ad: 'Para arzı', metin: 'Mal ve hizmet miktarı artmadan para miktarı artarsa, her bir birim para daha az şey ifade eder. 1585’te akçenin gümüşünü azaltmak tam olarak buydu — dijital değil, fiziksel hâli.' },
  { ad: 'Beklentiler', metin: 'En sinsisi bu. Herkes gelecek yıl fiyatların artacağını düşünüyorsa, işveren zammı ona göre planlar, satıcı etiketi ona göre yazar, kiracıyla ev sahibi sözleşmeyi ona göre bağlar. Kimse kötü niyetli değil; herkes kendini korumaya çalışıyor. Ama toplamda beklenti kendini gerçekleştirir.' },
];

export default function EnflasyonClient() {
  return (
    <main className="main-content enf-page">
      <div className="enf-topbar">
        <Link href="/" className="enf-back" aria-label="Ana sayfa">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        </Link>
        <span className="enf-topbar-title">Enflasyon</span>
      </div>

      <header className="enf-hero">
        <div className="enf-hero-grid" aria-hidden="true" />
        <div className="enf-hero-eyebrow">PARA · FİYAT · SATIN ALMA GÜCÜ</div>
        <h1 className="enf-hero-title">Enflasyon <span className="enf-grad">Nedir?</span></h1>
        <p className="enf-hero-sub">
          Cebindeki sayı aynı kalırken o sayının aldığı şeyin küçülmesine enflasyon denir.
          Bu yazı onu tanımlıyor, nasıl ölçüldüğünü gösteriyor ve sepeti sana doldurtuyor.
        </p>
        <div className="enf-hero-tags">
          {['TÜFE', 'sepet', 'çekirdek', 'bileşik etki', 'tağşiş', 'hiperenflasyon'].map((t) => (
            <span key={t} className="enf-tag">{t}</span>
          ))}
        </div>
      </header>

      {/* ══════════ 01 ══════════ */}
      <section className="enf-section">
        <div className="enf-kicker">01 — Açılış</div>
        <h2 className="enf-h2">Bir yeniçerinin maaşı, 1585</h2>
        <p className="enf-p">
          Sene 1585. İstanbul’da bir yeniçeri maaşını alıyor. Kesede geçen aydakiyle aynı sayıda
          akçe var. Sayı değişmemiş. Ama adam çarşıya indiğinde aynı akçeyle geçen ay aldığı
          ekmeği alamıyor.
        </p>
        <p className="enf-p">
          Kimse ondan para çalmadı. Maaşı kesilmedi. Kesedeki akçe sayısı hâlâ aynı.
          Değişen şey <strong>akçenin kendisi</strong>.
        </p>
        <ArticleImage
          className="enf-img"
          src="/articles/enflasyon/osmanli-akcesi.webp"
          ratio="1600 / 698"
          priority
          alt="Osmanlı gümüş akçesinin ön ve arka yüzü; her iki yüzde de daire içinde Arap harfli yazı ve kenarda noktalı bordür."
          caption="Osmanlı akçesi — Orhan Gazi dönemi darbı, 1,15 gram gümüş. Anlatılan tağşişten yaklaşık iki buçuk yüzyıl öncesine ait; burada akçenin ne olduğunu göstermek için duruyor."
          credit="icollector · Kamu malı"
        />
        <p className="enf-p">
          O yıl darphane, akçenin içindeki gümüş oranını yaklaşık <strong>%44 düşürdü</strong>.
          1580’lerin başında 100 dirhem gümüşten 450 akçe kesiliyordu; tağşişten sonra aynı
          gümüşten <strong>850 akçe</strong> çıkmaya başladı. Devletin elinde birdenbire iki katına
          yakın “para” vardı — ama gümüş aynı gümüştü. Sebep basitti: 1578’de başlayan İran Seferi
          hazineyi kurutmuştu.
        </p>
        <p className="enf-p">
          Yeniçeriler bunu bir ekonomi dersinden öğrenmediler; ceplerinden öğrendiler. Ayaklandılar,
          maaşlarına zam istediler ve para işlerinden sorumlu Rumeli Beylerbeyi Mehmed Paşa’nın
          kellesini istediler. Padişah vermek zorunda kaldı. Bu,{' '}
          <Link href="/articles/kanuni" className="article-ilink" style={{ color: ACCENT }}>
            Kanuni’nin ölümünden
          </Link>{' '}
          yirmi yıl sonra yaşanan, Osmanlı tarihinin ilk büyük enflasyonuydu.
        </p>
        <div className="enf-callout">
          <span className="enf-callout-icon">🪙</span>
          <p>
            440 yıl sonra, elinde maaşıyla markette hesap yapan herkes aynı şeyi hissediyor:
            <strong> sayı aynı, ama bir şeyler eksik.</strong> İşte o “bir şeyler”in adı enflasyon.
          </p>
        </div>
      </section>

      {/* ══════════ 02 ══════════ */}
      <section className="enf-section">
        <div className="enf-kicker">02 — Tanım</div>
        <h2 className="enf-h2">Enflasyon ne değildir</h2>
        <p className="enf-p">
          Enflasyonu anlamanın en hızlı yolu, ne <em>olmadığını</em> görmek. Domates pahalandı:
          bu enflasyon değil. Kira arttı: bu da tek başına enflasyon değil. Telefonun fiyatı
          yükseldi: hayır, o da değil.
        </p>
        <p className="enf-p">
          Bunların hepsi <strong>nispi fiyat</strong> değişimi — bir malın diğerlerine göre
          pahalanması. Domates kuraklıkta pahalanır, hasat bollaşınca ucuzlar. Bu, piyasanın normal
          nefes alıp vermesidir; her ekonomide olur, enflasyonu sıfıra yakın ülkelerde bile.
        </p>
        <p className="enf-p">
          Enflasyon ise <strong>genel fiyat seviyesinin sürekli yükselmesi</strong>. Yani domates de,
          kira da, ayakkabı da, otobüs bileti de, kuaför de — hepsi birden, ve tek seferlik değil,
          üst üste.
        </p>
        <p className="enf-p">
          Tersinden bakınca daha net: enflasyon aslında fiyatların hikâyesi değil,{' '}
          <strong>paranın hikâyesi</strong>. Fiyatlar yükseliyor demek, paranın satın alma gücü
          düşüyor demektir. Aynı cümlenin iki yüzü. 1585’teki akçe gibi: sayı sabit kaldı, içindeki
          değer eridi. Bu yüzden “enflasyon” derken sorduğumuz şey aslında şudur:{' '}
          <em>bu para, geçen sene aldığının ne kadarını alabiliyor?</em>
        </p>
      </section>

      {/* ══════════ 03 ══════════ */}
      <section className="enf-section">
        <div className="enf-kicker">03 — Ölçüm</div>
        <h2 className="enf-h2">Bir sepet dolusu ürün</h2>
        <p className="enf-p">
          “Genel fiyat seviyesi” kulağa hoş geliyor ama ölçmek için somut bir şey lazım. Çözüm şu:
          hayali bir alışveriş sepeti kur, içine ortalama bir hanenin bir ay boyunca aldığı her şeyi
          koy, sonra o sepetin fiyatını her ay yeniden hesapla. Çıkan sayıya TÜFE deniyor —
          Tüketici Fiyat Endeksi. Haberlerde “enflasyon” dendiğinde kastedilen şey bu.
        </p>
        <p className="enf-p">Türkiye’de bunu TÜİK yapıyor ve işin ölçeği sanıldığından büyük:</p>
        <div className="enf-olcek">
          <div><strong>428</strong><span>madde</span></div>
          <div><strong>972</strong><span>ürün çeşidi</span></div>
          <div><strong>636 bin</strong><span>fiyat / ay</span></div>
          <div><strong>81</strong><span>il</span></div>
          <div><strong>39.070</strong><span>iş yeri</span></div>
          <div><strong>5.246</strong><span>konut (kira)</span></div>
        </div>
        <p className="enf-p">
          Sepet dondurulmuş bir liste değil; hayat değiştikçe o da değişiyor.{' '}
          <strong>2026’da TÜİK sepeti baştan yeniledi:</strong> baz yıl 2003’ten 2025’e çekildi,
          ana grup sayısı 12’den 13’e çıktı ve sepete 38 yeni kalem girdi. Girenlerle çıkanlar,
          son yirmi yılın sessiz bir portresi gibi:
        </p>
        <div className="enf-degisim">
          <div className="enf-degisim-sutun enf-girdi">
            <h3>Sepete girdi</h3>
            <ul>{SEPETE_GIRENLER.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div className="enf-degisim-sutun enf-cikti">
            <h3>Sepetten çıktı</h3>
            <ul>{SEPETTEN_CIKANLAR.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </div>
        <p className="enf-p">
          Kravat ve gazete sepetten düştü, simit ve hazır börek girdi. Enflasyon ölçümünün içinde
          bile insanların nasıl yaşadığı yazılı.
        </p>

        <h3 className="enf-h3">“Endeks” tam olarak ne demek?</h3>
        <p className="enf-p">
          Sepetin fiyatı doğrudan lira olarak açıklanmaz; bir referans yıla göre ölçeklenir. 2026’da
          baz yıl 2025 kabul edildi, yani 2025 ortalaması <strong>100</strong> sayılıyor. Endeks
          131,75’e çıktıysa aynı sepet 2025’e göre %31,75 pahalanmış demektir. Endeksin kendi
          değeri tek başına hiçbir şey ifade etmez; anlamı her zaman bir başlangıç noktasına
          göredir — tıpkı rakımın deniz seviyesine göre ölçülmesi gibi.
        </p>

        <h3 className="enf-h3">Hangi “enflasyon”?</h3>
        <p className="enf-p">
          Aynı bültenden birden fazla oran çıkar ve haberlerde sık sık birbirine karışır. Üçü de
          doğrudur, üçü de farklı soruya cevap verir:
        </p>
        <div className="enf-oran-liste">
          <div>
            <strong>Aylık</strong>
            <span>Bir önceki aya göre. Kısa vadeli hareketi gösterir, oynaktır.</span>
            <em>Temmuz 2026: %1,78</em>
          </div>
          <div>
            <strong>Yıllık</strong>
            <span>Geçen yılın aynı ayına göre. En çok konuşulan, “manşet” oran budur.</span>
            <em>Temmuz 2026: %31,75</em>
          </div>
          <div>
            <strong>12 aylık ortalama</strong>
            <span>Son on iki ayın ortalamasının, önceki on iki aya oranı. En yavaş tepki veren ölçüt; aydan aya zıplamadığı için sözleşmelerde tercih edilir.</span>
            <em>Temmuz 2026: %31,90</em>
          </div>
        </div>
        <p className="enf-p">
          Bir de <strong>ÜFE</strong> var: Üretici Fiyat Endeksi. O, tüketicinin değil üreticinin
          karşılaştığı fiyatları ölçer — yani maliyet tarafını. ÜFE genelde TÜFE’nin önünden gider,
          çünkü üreticinin bugün ödediği maliyet birkaç ay sonra rafa yansır.
        </p>

        <SepetKatki />
      </section>

      {/* ══════════ 04 ══════════ */}
      <section className="enf-section">
        <div className="enf-kicker">04 — Sapma</div>
        <h2 className="enf-h2">“Ama bana daha yüksek geliyor”</h2>
        <p className="enf-p">
          Herkesin aklından geçen soru bu. Ve cevabı bir komplo değil — <strong>basit bir
          matematik</strong>. TÜFE’nin sepeti <em>ortalama</em> haneyi temsil eder. Ortalama hane
          diye biri yoktur.
        </p>
        <p className="enf-p">
          Diyelim büyük bir şehirde kirada oturuyorsun ve maaşının neredeyse yarısı kiraya gidiyor.
          Konut kaleminin sepetteki ağırlığı senin bütçendekinin çok altında: kira senin dünyanda
          enflasyonun büyük kısmını belirlerken, endekste çok daha küçük bir yer tutuyor. Sonuç,
          resmî rakam ne olursa olsun, <strong>senin yaşadığın enflasyonun farklı olması</strong>.
        </p>
        <p className="enf-p">
          Tersi de doğru. Evi olan, arabası olmayan, çocuğunun okulu bitmiş bir emeklinin sepeti de
          ortalamadan sapar — sadece başka yöne. Bu matematiksel bir zorunluluk: ortalama bir
          sayıdır, kimsenin hayatı değildir. Ölçüm ne kadar iyi yapılırsa yapılsın bu fark kalır.
        </p>
        <p className="enf-p">
          Türkiye’de bu tartışmanın bir de ikinci katmanı var: bağımsız bir grup olan ENAG, kendi
          yöntemiyle hesapladığı ve TÜİK’inkinden farklı çıkan bir enflasyon rakamı yayımlıyor. İki
          hesabın farklı çıkması tek başına şaşırtıcı değil — farklı sepet ağırlıkları, farklı ürün
          kapsamı ve farklı veri toplama yöntemi kullanan iki ölçüm her zaman farklı sonuç verir.
          Hangi yöntemin daha isabetli olduğu ayrı ve teknik bir tartışma; bu yazının konusu o değil.
        </p>
        <p className="enf-p">
          Bu yazının yapabileceği şey daha faydalı: sana <strong>kendi rakamını</strong> vermek.
        </p>
        <KisiselEnflasyon />
      </section>

      {/* ══════════ 05 ══════════ */}
      <section className="enf-section">
        <div className="enf-kicker">05 — Sebepler</div>
        <h2 className="enf-h2">Enflasyon neden olur?</h2>
        <p className="enf-p">
          Tek bir sebep yok; birkaç motor aynı anda çalışıyor. Çoğu enflasyon dalgasında bunların
          ikisi üçü birden döner ve hangisinin ne kadar payı olduğu ancak sonradan anlaşılır.
        </p>
        <div className="enf-motorlar">
          {MOTORLAR.map((m, i) => (
            <div className="enf-motor" key={m.ad}>
              <span className="enf-motor-no">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{m.ad}</h3>
                <p>{m.metin}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="enf-p">
          Sonuncusu, merkez bankalarının neden sürekli “beklentileri çıpalamak”tan söz ettiğini
          açıklıyor. Enflasyonla mücadelenin bir kısmı matematik, bir kısmı toplu psikoloji.
          Faiz, parite, kur gibi terimlerin birbirine nasıl bağlandığını{' '}
          <Link href="/articles/ekonomi" className="article-ilink" style={{ color: ACCENT }}>
            ekonominin dili
          </Link>{' '}
          dosyasında ayrı ayrı açtık.
        </p>
      </section>

      {/* ══════════ 06 ══════════ */}
      <section className="enf-section">
        <div className="enf-kicker">06 — Bileşik etki</div>
        <h2 className="enf-h2">Asıl mesele tek yılda değil</h2>
        <p className="enf-p">
          Enflasyonun en yanıltıcı tarafı, tek yıla bakınca anlaşılır görünmesi. Sorun şu ki
          enflasyon her yıl <strong>bir önceki yılın üstüne</strong> biner. Faiz gibi bileşiklenir —
          sadece ters yönde.
        </p>
        <p className="enf-p">
          Bir kısayol var: <strong>70 kuralı</strong>. 70’i enflasyon oranına bölersen, paranın
          kabaca kaç yılda yarı değerine düşeceğini bulursun. Ama bu bir yaklaşım ve yüksek
          oranlarda sapıyor — aşağıdaki kaydırıcıda gerçek hesapla yan yana duruyor.
        </p>
        <AlimGucu />
        <ArticleImage
          className="enf-img"
          src="/articles/enflasyon/bir-milyon-lira.webp"
          ratio="1485 / 713"
          alt="1995 tarihli bir milyon Türk lirası banknotu; üzerinde 1000000 rakamı, Bir Milyon Türk Lirası yazısı ve Atatürk portresi."
          caption="Onlarca yıl üst üste binen enflasyonun ete kemiğe bürünmüş hâli: banknotun üstünde biriken altı sıfır. 2005’te o altı sıfır atıldı ve bir milyon lira, bir liraya döndü."
          credit="Kerhaneci31 · CC0"
        />
        <p className="enf-p">
          Yastık altındaki paranın alım gücü, yüksek enflasyonda birkaç yıl içinde yarıya iniyor.
          Bu, “parayı ne yapmalı” sorusunun neden bu kadar konuşulduğunu açıklıyor — ve enflasyonun
          neden sadece bir fiyat meselesi değil, aynı zamanda bir zaman meselesi olduğunu.
        </p>

        <h3 className="enf-h3">Nominal ve reel: aynı sayının iki okuması</h3>
        <p className="enf-p">
          Bu ayrım, enflasyonun gündelik hayatta en çok işe yarayan kavramı — ve en sık atlananı.
          <strong> Nominal</strong>, etiketteki sayının kendisi. <strong>Reel</strong>, o sayının
          enflasyondan arındırılmış hâli.
        </p>
        <p className="enf-p">
          Diyelim maaşın %25 arttı ve aynı dönemde enflasyon %31,75 oldu. Nominal olarak kazandın:
          hesabına giren rakam büyüdü. Reel olarak kaybettin. Hesap düz bir bölme —{' '}
          <code className="enf-code">1,25 ÷ 1,3175 = 0,949</code> — yani alım gücün yaklaşık{' '}
          <strong>%5 geriledi</strong>. Aynı mantık faiz, kira, emekli aylığı, asgari ücret ve
          şirket cirosu için de aynen geçerlidir.
        </p>
        <p className="enf-p">
          Bu yüzden yüksek enflasyonlu bir ortamda “arttı” ya da “azaldı” cümlesinin, hangisinden
          söz edildiği söylenmeden pek bir anlamı yoktur. Enflasyon sadece fiyatları değil,
          <strong> sayılar hakkında konuşma biçimimizi</strong> de değiştiriyor.
        </p>
      </section>

      {/* ══════════ 07 ══════════ */}
      <section className="enf-section">
        <div className="enf-kicker">07 — Uç örnekler</div>
        <h2 className="enf-h2">İşler çığırından çıkınca</h2>
        <p className="enf-p">
          Türkiye’de yakın dönemin zirvesi <strong>Ekim 2022’de %85,51</strong> oldu. Yüksek bir
          rakam. Ama tarih, “yüksek”in nerelere gidebileceğini gösteren örneklerle dolu — ve o
          örneklerde enflasyon bir istatistik olmaktan çıkıp sokakta görünür hâle geliyor.
        </p>
        <ArticleImage
          className="enf-img"
          src="/articles/enflasyon/berlin-ekmek-izdihami.webp"
          ratio="1600 / 1170"
          alt="1923 Berlin'de kalabalık bir grup insan, bir fırıncının arabasının etrafını sarmış; eller havada banknotlar tutuyor, arabadaki adam kucağında büyük bir ekmek taşıyor."
          caption="Berlin, 1923: kalabalık bir fırıncının arabasını kuşatmış, milyonlarca markla ekmek kapışıyor. Hiperenflasyon böyle bir şey — sıfır saymak değil, ekmek için itişmek."
          credit="Agence de presse Meurisse · Kamu malı"
        />
        <p className="enf-p">
          <strong>Macaristan, 1946 — rekor hâlâ kırılmadı.</strong> İkinci Dünya Savaşı’ndan çıkan
          ülkede pengő çöktü. Temmuz 1946’da fiyatlar yaklaşık <strong>her 15 saatte bir ikiye
          katlanıyordu</strong>. Sabah cebindeki para, akşam alım gücünün yarısını kaybetmiş
          oluyordu; pengő dört günde değerinin %90’ını yitirdi. Basılan en büyük banknot 100
          kentilyon pengő oldu — yani 1’in arkasında 20 sıfır. 1 Ağustos 1946’da forint geldi;
          dönüşüm kuru 400 oktilyon pengő = 1 forint’ti.
        </p>
        <ArticleImage
          className="enf-img"
          src="/articles/enflasyon/macaristan-1946.webp"
          ratio="1600 / 1600"
          alt="Yelpaze gibi dizilmiş Macar pengő banknotları; üzerlerinde on bin, yüz bin, bir milyon, on milyon, yüz milyon ve bir milyar pengő yazıyor."
          caption="Merdivenin tırmanışı: on binden bir milyara pengő banknotları, çoğu 1945 sonuna ait. Zirve bunların çok ötesindeydi — en büyük banknot bu karede yok."
          credit="Takkk · CC BY-SA 3.0"
        />
        <p className="enf-p">
          <strong>Roma, 3. yüzyıl — dijital olmayan para basma.</strong> Roma’nın gümüş sikkesi
          denarius, yüzyıllar içinde giderek daha az gümüş içerdi. 3. yüzyıl krizinin sonunda ortada
          dolaşan sikke, üzerine ince bir gümüş yıkaması yapılmış bakırdan ibaretti. Tıpkı 1585’in
          akçesi gibi: devlet daha fazla harcamak istedi, madeni seyreltti, fiyatlar buna göre
          yükseldi.{' '}
          <Link href="/articles/rome" className="article-ilink" style={{ color: ACCENT }}>
            Roma’nın kendi hikâyesinde
          </Link>{' '}
          bu, çöküşe giden yolun sessiz kalemlerinden biridir.
        </p>
        <div className="enf-img-pair">
          <ArticleImage
            narrow
            className="enf-img"
            src="/articles/enflasyon/denarius-gumus.webp"
            ratio="1600 / 1312"
            alt="Roma Cumhuriyeti gümüş denariusunun iki yüzü; parlak gümüş rengi, bir yüzünde miğferli baş, diğerinde at arabası. Altında cetvel."
            caption="Yüksek gümüşlü Cumhuriyet denariusu."
            credit="Portable Antiquities Scheme · CC BY-SA 2.0"
          />
          <ArticleImage
            narrow
            className="enf-img"
            src="/articles/enflasyon/antoninianus-billon.webp"
            ratio="1600 / 872"
            alt="Postumus dönemi billon antoninianusunun iki yüzü; bakır rengi ve yeşil pas lekeleri belirgin, ışınlı taç takan imparator büstü. Altında santimetre cetveli."
            caption="Üç yüzyıl sonrasının billon antoninianusu — bakır ağırlıklı alaşım. Aynı sikkenin iki hâli değil, iki ayrı nominal; ama seyrelmenin yönü tek bakışta görünüyor."
            credit="Portable Antiquities Scheme · CC BY-SA 4.0"
          />
        </div>
        <p className="enf-p">
          <strong>Ve işe yaramayan çözüm.</strong> İmparator Diocletianus 301 yılında bir ferman
          yayımladı: <em>Edictum de Pretiis Rerum Venalium</em> — Azami Fiyat Fermanı. Tahıldan
          şaraba, zeytinyağından ete, kumaştan nakliyeye kadar yüzlerce kalem için tavan fiyat
          belirledi. Dahası, çiftçiden öğretmene ve avukata kadar meslekler için tavan ücret de
          koydu.
        </p>
        <ArticleImage
          className="enf-img"
          src="/articles/enflasyon/diocletianus-fermani.webp"
          ratio="1195 / 1035"
          alt="Latince yazıtlı taş levha parçası; kırmızıya boyanmış harflerle mal adları ve karşılarında rakamlar sıralanmış."
          caption="Azami Fiyat Fermanı’ndan bir parça — at, deve, eşek, koyun ve işçilik için taşa kazınmış tavan fiyatlar. Berlin’deki bu levha özgün taşın kalıp kopyasıdır."
          credit="MatthiasKabel · CC BY-SA 3.0"
        />
        <p className="enf-p">
          Sonuç: satıcılar tavan fiyattan satmaktansa mallarını piyasadan çekti. Raflar boşaldı,
          karaborsa doğdu, ferman uygulanamadı ve sessizce terk edildi. Aradan 1700 yıl geçti ama
          ders aynı yerde duruyor: fiyat bir <strong>belirti</strong>. Belirtiyi yasaklamak
          hastalığı iyileştirmiyor.
        </p>
      </section>

      {/* ══════════ 08 ══════════ */}
      <section className="enf-section">
        <div className="enf-kicker">08 — Ne yapılıyor</div>
        <h2 className="enf-h2">Enflasyonla nasıl mücadele ediliyor?</h2>
        <p className="enf-p">
          Ana araç <strong>para politikası</strong> ve onun en görünür ucu <strong>faiz</strong>.
          Mantık kabaca şöyle: faiz yükseldiğinde borçlanmak pahalı, tasarruf etmek cazip hâle
          gelir. İnsanlar ve şirketler harcamayı kısar, talep soğur, fiyatlar üzerindeki baskı
          azalır. Bunun bir bedeli vardır — büyüme yavaşlar, istihdam etkilenir. Merkez
          bankalarının işi tam olarak bu ödünleşimi yönetmektir.
        </p>
        <p className="enf-p">
          İkinci ve daha az görünen araç: <strong>beklenti yönetimi</strong>. Merkez bankaları
          hedef açıklar, tahmin yayımlar, sözlü yönlendirme yapar. Amaç, beşinci bölümdeki kendini
          gerçekleştiren döngüyü tersine çevirmek. İnsanlar enflasyonun düşeceğine inanırsa
          sözleşmelerini ve fiyat kararlarını ona göre yapar — ve inanç bir ölçüde kendini
          gerçekleştirir.
        </p>
        <p className="enf-p">
          Bir de ölçütün kendisi var. Manşet TÜFE, gıda ve enerji gibi çok oynak kalemleri
          taşıdığı için aydan aya zıplayabiliyor. Bu yüzden <strong>çekirdek enflasyon</strong> de
          takip ediliyor: gıda, enerji, alkol-tütün ve altın çıkarıldığında geriye kalan, trendi
          daha sakin gösteren ölçüt. Türkiye’de tablo şu an düşüş yönünde — Haziran 2026’da yıllık
          %32,11 olan enflasyon Temmuz’da <strong>%31,75</strong>’e geriledi.
        </p>
        <div className="enf-callout">
          <span className="enf-callout-icon">📉</span>
          <p>
            Sayılar önemli. Ama 1585’teki yeniçeriden bugüne değişmeyen tek şey şu: enflasyon soyut
            bir istatistik olarak yaşanmaz. <strong>Cepte yaşanır.</strong>
          </p>
        </div>
      </section>

      <ArticleBibliography items={refs} accent={ACCENT} />

      <footer className="enf-footer">
        <div className="enf-footer-mark">BASEMENTONFIRE</div>
        <p>Fiyatlar artmıyor; para küçülüyor. Aynı cümlenin iki yüzü. 🪙</p>
        <Link href="/discover" className="enf-footer-link">← Diğer içerikleri keşfet</Link>
      </footer>

      <style>{`
        .enf-page {
          --c1:#e8a33d; --c2:#6ea8d8; --c3:#d97757;
          --bg:#0d1119; --panel:rgba(255,255,255,0.035); --line:rgba(255,255,255,0.1);
          --ink:#e9e5df; --muted:#9aa3ad;
          background: var(--bg); color: var(--ink); min-height: 100vh;
          font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
          line-height: 1.65; overflow-x: clip;
        }

        .enf-img {
          --ai-caption:#b9b0a3; --ai-credit:#7d8590;
          --ai-border:rgba(232,163,61,0.2); --ai-fill:rgba(232,163,61,0.05);
          --ai-mark:rgba(232,163,61,0.26);
        }
        .enf-img-pair { display:grid; grid-template-columns:repeat(2,1fr); gap:18px; align-items:start; margin:18px 0; }
        @media (max-width:700px){ .enf-img-pair { grid-template-columns:1fr; } }

        .enf-topbar {
          position:sticky; top:0; z-index:40; background:rgba(13,17,25,0.92);
          backdrop-filter:blur(12px); border-bottom:1px solid var(--line);
          padding:10px 16px; display:flex; align-items:center; gap:10px;
        }
        .enf-back { color:var(--ink); display:flex; padding:6px; border-radius:50%; transition:background .15s; }
        .enf-back:hover { background:rgba(255,255,255,0.08); }
        .enf-topbar-title { font-weight:700; font-size:.92rem; color:var(--c1); }

        .enf-hero {
          position:relative; text-align:center; padding:60px 20px 46px; overflow:hidden;
          background:radial-gradient(ellipse at 50% -10%, rgba(232,163,61,0.16), transparent 62%);
        }
        .enf-hero-grid {
          position:absolute; inset:0; opacity:.45; pointer-events:none;
          background-image:linear-gradient(rgba(232,163,61,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(232,163,61,0.07) 1px, transparent 1px);
          background-size:34px 34px;
          mask-image:radial-gradient(ellipse at 50% 0%, #000, transparent 70%);
          -webkit-mask-image:radial-gradient(ellipse at 50% 0%, #000, transparent 70%);
        }
        .enf-hero-eyebrow { position:relative; font-size:.66rem; font-weight:800; letter-spacing:.3em; color:var(--c2); margin-bottom:14px; }
        .enf-hero-title { position:relative; font-size:clamp(2rem,7vw,4rem); font-weight:900; margin:0 0 16px; letter-spacing:-.02em; line-height:1.05; }
        .enf-grad { background:linear-gradient(100deg, var(--c1), var(--c3), var(--c2)); -webkit-background-clip:text; background-clip:text; color:transparent; }
        .enf-hero-sub { position:relative; max-width:620px; margin:0 auto 28px; color:var(--muted); font-size:clamp(.9rem,2vw,1.02rem); }
        .enf-hero-tags { position:relative; display:flex; flex-wrap:wrap; gap:8px; justify-content:center; }
        .enf-tag { padding:6px 13px; border-radius:9999px; font-size:.74rem; font-weight:700; background:rgba(232,163,61,0.08); border:1px solid rgba(232,163,61,0.2); color:var(--c1); }

        .enf-section { max-width:860px; margin:0 auto; padding:44px 16px; border-top:1px solid rgba(255,255,255,0.05); }
        .enf-kicker { font-size:.68rem; font-weight:800; letter-spacing:.18em; color:var(--c2); margin-bottom:8px; text-transform:uppercase; }
        .enf-h2 { font-size:clamp(1.35rem,4vw,2rem); font-weight:800; margin:0 0 16px; letter-spacing:-.01em; line-height:1.2; }
        .enf-h3 { font-size:1.06rem; font-weight:800; margin:26px 0 10px; color:var(--ink); letter-spacing:-.005em; }

        .enf-oran-liste { display:flex; flex-direction:column; gap:10px; margin:16px 0 20px; }
        .enf-oran-liste > div { background:var(--panel); border:1px solid var(--line); border-left:3px solid var(--c2); border-radius:10px; padding:12px 14px; }
        .enf-oran-liste strong { display:block; font-size:.92rem; font-weight:800; color:var(--c2); margin-bottom:3px; }
        .enf-oran-liste span { display:block; font-size:.86rem; color:#b8b0a5; }
        .enf-oran-liste em { display:block; font-size:.8rem; font-style:normal; font-weight:700; color:var(--c1); margin-top:6px; font-family:"SF Mono",Consolas,monospace; }
        .enf-p { color:#c4bcb1; font-size:1rem; margin:0 0 18px; }
        .enf-p strong, .enf-callout strong { color:var(--ink); font-weight:700; }
        .enf-p em { color:#d6cdc1; font-style:italic; }

        .enf-callout { display:flex; gap:12px; background:linear-gradient(90deg, rgba(232,163,61,0.08), transparent); border:1px solid rgba(232,163,61,0.2); border-left:3px solid var(--c1); border-radius:12px; padding:14px 16px; margin:22px 0; }
        .enf-callout-icon { font-size:1.4rem; flex-shrink:0; line-height:1.3; }
        .enf-callout p { margin:0; font-size:.94rem; color:#c4bcb1; }

        .enf-olcek { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin:20px 0 22px; }
        .enf-olcek > div { background:var(--panel); border:1px solid var(--line); border-radius:12px; padding:14px 10px; text-align:center; }
        .enf-olcek strong { display:block; font-size:1.3rem; font-weight:800; color:var(--c1); line-height:1.2; }
        .enf-olcek span { display:block; font-size:.72rem; color:var(--muted); margin-top:3px; }
        @media (max-width:520px){ .enf-olcek { grid-template-columns:repeat(2,1fr); } }

        .enf-degisim { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin:20px 0 22px; }
        .enf-degisim-sutun { background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:16px; }
        .enf-degisim-sutun h3 { margin:0 0 10px; font-size:.8rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
        .enf-degisim-sutun ul { margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:7px; }
        .enf-degisim-sutun li { font-size:.88rem; color:#c4bcb1; padding-left:16px; position:relative; }
        .enf-degisim-sutun li::before { position:absolute; left:0; font-weight:700; }
        .enf-girdi h3 { color:var(--c1); }
        .enf-girdi li::before { content:"+"; color:var(--c1); }
        .enf-cikti h3 { color:var(--c2); }
        .enf-cikti li::before { content:"−"; color:var(--c2); }
        @media (max-width:560px){ .enf-degisim { grid-template-columns:1fr; } }

        .enf-motorlar { display:flex; flex-direction:column; gap:12px; margin:20px 0 22px; }
        .enf-motor { display:flex; gap:14px; background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:16px; }
        .enf-motor-no { font-family:"SF Mono",Consolas,monospace; font-size:.8rem; font-weight:800; color:var(--c1); opacity:.75; flex-shrink:0; padding-top:2px; }
        .enf-motor h3 { margin:0 0 6px; font-size:1rem; font-weight:800; color:var(--ink); }
        .enf-motor p { margin:0; font-size:.9rem; color:#b8b0a5; }

        /* ── widgets.tsx ortak kabuğu ── */
        .enf-w { margin:24px 0; padding:20px; background:var(--panel); border:1px solid var(--line); border-radius:16px; }
        .enf-w-baslik { display:flex; flex-wrap:wrap; align-items:center; gap:10px; font-size:1rem; font-weight:800; color:var(--ink); margin-bottom:14px; line-height:1.35; }
        .enf-w-etiket { font-size:.6rem; font-weight:800; letter-spacing:.16em; color:#0d1119; background:var(--c1); padding:4px 8px; border-radius:6px; flex-shrink:0; }
        .enf-w-yonerge { font-size:.9rem; color:#b8b0a5; margin:0 0 16px; }
        .enf-w-not { font-size:.86rem; color:#b8b0a5; margin:14px 0 0; }
        .enf-w-not em { color:var(--c1); font-style:italic; }
        .enf-w-kaynak { font-size:.76rem; color:#7d8590; margin:12px 0 0; line-height:1.5; }

        .enf-bar-liste { display:flex; flex-direction:column; gap:14px; }
        .enf-bar-ad { display:flex; justify-content:space-between; align-items:baseline; gap:10px; font-size:.86rem; font-weight:600; margin-bottom:5px; }
        .enf-bar-agirlik { font-size:.74rem; color:var(--muted); font-weight:500; flex-shrink:0; }
        .enf-bar-yol { height:9px; background:rgba(255,255,255,0.06); border-radius:999px; overflow:hidden; }
        .enf-bar-dolu { height:100%; border-radius:999px; transition:width .3s ease; }
        .enf-bar-sayi { display:flex; align-items:baseline; gap:7px; margin-top:5px; font-size:.76rem; color:var(--muted); }
        .enf-bar-sayi strong { font-size:.94rem; font-weight:800; }

        .enf-kaydirici-liste { display:flex; flex-direction:column; gap:15px; }
        .enf-kaydirici-ust { display:flex; justify-content:space-between; align-items:center; font-size:.88rem; font-weight:600; margin-bottom:6px; cursor:pointer; }
        .enf-kaydirici-ust > span { display:flex; align-items:center; gap:8px; }
        .enf-nokta { width:9px; height:9px; border-radius:50%; display:inline-block; flex-shrink:0; }
        .enf-kaydirici input[type="range"] { width:100%; display:block; height:22px; cursor:pointer; }
        .enf-kaydirici-tek { margin-bottom:6px; }
        .enf-kaydirici-iz { display:flex; justify-content:space-between; font-size:.7rem; color:#7d8590; margin-top:-2px; }

        .enf-sonuc { display:flex; align-items:stretch; gap:14px; margin:20px 0 10px; padding:16px; background:rgba(232,163,61,0.06); border:1px solid rgba(232,163,61,0.2); border-radius:14px; }
        .enf-sonuc-kutu { flex:1; display:flex; flex-direction:column; gap:4px; min-width:0; }
        .enf-sonuc-ayrac { width:1px; background:var(--line); flex-shrink:0; }
        .enf-sonuc-etiket { font-size:.72rem; color:var(--muted); }
        .enf-sonuc-buyuk { font-size:1.9rem; font-weight:900; color:var(--c1); line-height:1.1; }
        .enf-sonuc-orta { font-size:1.25rem; font-weight:800; color:var(--ink); line-height:1.2; }
        .enf-soluk { color:var(--muted); }
        .enf-fark { font-size:.9rem; color:var(--c3); font-weight:600; margin:0 0 14px; }
        .enf-fark-notr { color:var(--muted); font-weight:500; }
        .enf-sifirla { background:transparent; border:1px solid var(--line); color:var(--muted); font-size:.8rem; font-weight:600; padding:7px 14px; border-radius:9px; cursor:pointer; transition:border-color .15s, color .15s; }
        .enf-sifirla:hover { border-color:var(--c1); color:var(--c1); }

        .enf-grafik { width:100%; height:auto; display:block; margin:16px 0 6px; }
        .enf-yil-izgara { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin:6px 0 16px; }
        .enf-yil { background:rgba(255,255,255,0.04); border-radius:10px; padding:10px 6px; text-align:center; }
        .enf-yil-ust { display:block; font-size:.68rem; color:var(--muted); margin-bottom:3px; }
        .enf-yil strong { font-size:1rem; font-weight:800; color:var(--c1); }
        .enf-yari { display:flex; gap:14px; }
        .enf-yari > div { flex:1; display:flex; flex-direction:column; gap:3px; }
        @media (max-width:480px){ .enf-yil-izgara { grid-template-columns:repeat(2,1fr); } }

        .enf-footer { max-width:700px; margin:0 auto; text-align:center; padding:48px 20px 64px; border-top:1px solid var(--line); }
        .enf-footer-mark { font-family:"SF Mono",Consolas,monospace; font-weight:800; letter-spacing:.3em; color:var(--c1); font-size:.85rem; margin-bottom:14px; }
        .enf-footer p { color:var(--muted); font-size:.92rem; max-width:460px; margin:0 auto 18px; }
        .enf-footer-link { color:var(--c1); text-decoration:none; font-weight:700; font-size:.9rem; }
        .enf-footer-link:hover { text-decoration:underline; }

        @media (max-width:600px){ .enf-section { padding:34px 14px; } .enf-w { padding:16px; } }
      `}</style>
    </main>
  );
}
