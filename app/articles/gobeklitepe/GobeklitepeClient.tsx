'use client';

import Link from 'next/link';
import {
  ArticleShell, ArticleHero, ArticleLede, ArticleSection, HorizontalTimeline, ArticleQuiz, ArticleBibliography, ArticleFooter,
} from '@/app/components/article/ArticleBlocks';
import { ACCENT } from './ui';
import { ArticleImage } from './images';
import { DeepTimeScale, PillarExplorer, EnclosureMap, NotYetInvented, refs } from './widgets';
import { quizQs, timeline } from './data';

export default function GobeklitepeClient() {
  return (
    <ArticleShell accent={ACCENT} title="Göbeklitepe">
      <ArticleHero
        title="Göbeklitepe"
        fullTitle="Göbeklitepe — Tarladan Önce Tapınak"
        eyebrow="11.600 YIL ÖNCE · İNTERAKTİF DOSYA"
        subtitle={<>Piramitlerden yedi bin yıl, yazıdan altı bin yıl önce. Aşağı kaydır: başlık dağılsın, <em className="not-italic text-amber-200">taş devinin</em> gözü olmayan yüzü belirsin.</>}
      />

      <ArticleLede points={[
        'Yaklaşık MÖ 9600 — bugünden ~11.600 yıl önce; Stonehenge’den ~6.600, Giza’dan ~7.000 yıl eski',
        'Tarım, çömlek, yazı, metal ve tekerlekten ÖNCE inşa edildi — üstelik avcı-toplayıcılar tarafından',
        'Alanın yalnızca ~%10’u kazıldı; en büyük buluntular hâlâ toprak altında olabilir',
      ]}>
        Göbeklitepe, Şanlıurfa yakınlarında, bilinen en eski anıtsal tören yapılarının bulunduğu bir Neolitik alandır:
        yaklaşık MÖ 9600’de, henüz tarıma geçmemiş avcı-toplayıcıların diktiği, onlarca tonluk T-biçimli taş
        pilarlarla çevrili dev çemberler. İnsanlık tarihinin başlangıç çizgisini geriye çekti.
      </ArticleLede>

      {/* ── Açılış: yaş şoku ── */}
      <ArticleSection>
        <div className="space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            Bir sayıyla başlayalım, çünkü bu sayı olmadan gerisi anlaşılmıyor. Göbeklitepe’nin en eski taş çemberleri
            yaklaşık <strong className="text-white">on bir bin altı yüz yıl</strong> önce dikildi.
          </p>
          <p>
            Bunu hissetmek zor, o yüzden bir kıyas: Mısır piramitleri bize, Göbeklitepe’ye olduğundan{' '}
            <strong className="text-amber-200">zaman olarak daha yakın</strong>. Yani piramitleri kuran Mısırlılar için
            Göbeklitepe, bizim için piramitlerin olduğundan bile daha eski, daha efsanevi bir geçmişti. O taşlar
            dikildiğinde henüz ne yazı vardı, ne tekerlek, ne çömlek, ne de bir metal parçası. Buzul Çağı yeni bitmişti.
          </p>
          <p>
            Bize kadim gelen her uygarlık — demokrasinin beşiği{' '}
            <Link href="/articles/greece" className="article-ilink">Antik Yunan</Link>, Roma, firavunların Mısır’ı — bu
            tepenin yanında gençtir. Hepsi Göbeklitepe’den <em className="not-italic text-amber-200">binlerce yıl
            sonra</em> geldi.
          </p>
        </div>
      </ArticleSection>

      <ArticleImage src="/articles/gobeklitepe/hero.jpg" ratio="16/9" priority
        alt="Göbeklitepe kazı alanı: koruyucu çatı altında taş çemberler ve T-biçimli pilarlar"
        caption="Göbeklitepe’nin taş çemberleri, koruyucu çatının altında. (Şanlıurfa)" />

      {/* ── YILDIZ: derin zaman ── */}
      <ArticleSection title="Ne kadar eski, gerçekten?" max="max-w-4xl">
        <div className="mx-auto max-w-3xl">
          <p className="text-lg leading-relaxed text-slate-300">
            &quot;Piramitlerden eski&quot; demek kolay; hissetmek başka. Aşağıdaki kaydırıcıyı geriye it. Her durakta
            insanlığın o an ne yapabildiğini gör — ve Göbeklitepe’nin bu çizginin tam nerede, ne kadar başında
            durduğunu.
          </p>
        </div>
        <div className="mt-8">
          <DeepTimeScale />
        </div>
      </ArticleSection>

      {/* ── Kimler yaptı ── */}
      <ArticleSection title="Bunu kimler yaptı?">
        <div className="space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            İşin en sarsıcı yanı burada. Bu çemberleri kaldıranlar, bir kral ya da bir imparatorluk değildi. Ne
            şehirleri vardı, ne tarlaları. <strong className="text-white">Avcı-toplayıcılardı</strong> — yabani buğday
            toplayan, ceylan ve yaban eşeği avlayan gruplar. Alandaki bütün hayvan kemikleri yabani; tek bir evcil
            bitki ya da hayvan izi yok.
          </p>
          <p>
            Uzun süre şöyle düşünmüştük: önce insanlar yerleşik hayata geçer, tarımı bulur, artı ürün biriktirir, boş
            zaman kazanır — <em className="not-italic">sonra</em> tapınak, sanat, din gibi &quot;lükslere&quot; sıra
            gelir. Göbeklitepe bu sıralamayı ters çevirdi. Anıtsal mimari, tarımdan{' '}
            <strong className="text-amber-200">önce</strong> geldi.
          </p>
        </div>
        <div className="mt-8">
          <NotYetInvented />
        </div>
      </ArticleSection>

      {/* ── T-pilarlar ── */}
      <ArticleSection title="Yüzü olmayan devler" max="max-w-4xl">
        <div className="mx-auto max-w-3xl space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            Alandaki taşlar rastgele dikilmiş kaya blokları değil. Çoğu, üstten bir T harfi gibi genişleyen, özenle
            yontulmuş <strong className="text-white">T-biçimli pilarlar</strong>. Ve uzun süre bakınca fark ediyorsunuz:
            bunlar taş değil, <strong className="text-amber-200">insan</strong>. Yatay üst plaka bir baş, dikey gövde
            bir beden. Yanlarda kollar, önde karında birleşen eller, belde bir kemer, kemerden sarkan bir tilki-postu
            peştamal.
          </p>
          <p>
            Ama yüzleri yok. Göz yok, ağız yok, ifade yok. Dünyanın bu en eski anıtsal insan figürleri, kasıtlı olarak
            kimliksiz bırakılmış — belki atalar, belki isimsiz bir güç. En büyükleri yaklaşık <strong className="text-white">5,5
            metre</strong> boyunda ve tek parça kireçtaşından; tahminen 7–10 ton.
          </p>
        </div>

        <ArticleImage src="/articles/gobeklitepe/pilar.jpg" ratio="3/4"
          alt="Göbeklitepe’nin merkezi T-biçimli piları: yandan kollar, önde birleşen eller ve kemer"
          caption="Çevre D’nin merkezi ikiz pilarlarından biri — kollar, eller ve kemer seçilebiliyor." />

        <div className="mt-8">
          <PillarExplorer />
        </div>

        <div className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-slate-300">
          <p>
            Ve akıllara durgunluk veren nokta: bu taşları yakındaki ocaktan çıkarıp dikenlerin ne{' '}
            <strong className="text-white">tekerleği</strong>, ne yük hayvanı, ne de metal aleti vardı. Ocakta yarım
            kalmış bir pilar var — yaklaşık 7 metre, tahminen 50 ton. Onu çatlağı yüzünden bırakmışlar. Gerisini yalnızca
            taş aletler, kaldıraçlar ve çok sayıda insanın gücüyle taşıdılar.
          </p>
        </div>
      </ArticleSection>

      {/* ── Çevreler + hayvanlar ── */}
      <ArticleSection title="Dört çember, dört hayvan" max="max-w-4xl">
        <div className="mx-auto max-w-3xl space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            Kazılan büyük çemberler harflerle anılıyor: A, B, C, D. Her birinin ortasında, çevredekilerden daha uzun
            bir çift merkezi pilar var. Ve ilginç olan şu: her çemberde farklı bir hayvan baskın. Sanki her biri,
            amblemi başka bir hayvan olan ayrı bir topluluğun eseri.
          </p>
        </div>
        <div className="mt-8">
          <EnclosureMap />
        </div>

        <ArticleImage src="/articles/gobeklitepe/oyma.jpg" ratio="4/3"
          alt="Göbeklitepe pilarında bir hayvan kabartması yakın çekim"
          caption="Pilarlardaki kabartmaların çoğu tehlikeli hayvanlar: yılan, tilki, akrep, yaban domuzu." />

        <div className="mx-auto mt-8 max-w-3xl space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            Dikkat çekici olan hangi hayvanların seçildiği. Kemik kalıntıları bu insanların çoğunlukla ceylan ve yaban
            eşeği yediğini gösteriyor — ama duvarlarda neredeyse hiç ceylan yok. Bunun yerine{' '}
            <strong className="text-white">yılan, tilki, akrep, yaban domuzu, akbaba</strong>: yenmeyen, korkulan,
            güçlü hayvanlar. Yani bu bir menü değil, bir <strong className="text-amber-200">semboller sistemi</strong>.
            Neyi anlattığını tam bilmiyoruz — çünkü onu yazacak bir alfabe daha altı bin yıl gelmeyecekti.
          </p>
        </div>
      </ArticleSection>

      {/* ── Akbaba Taşı + kafatası kültü ── */}
      <ArticleSection title="Akbaba Taşı ve bir kafatası kültü">
        <div className="space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            Çevre D’de, Pilar 43 olarak bilinen bir taş var; herkes ona <strong className="text-white">Akbaba
            Taşı</strong> diyor. Üzerinde kanatlarını açmış bir akbaba, bir akrep, yılanlar, gizemli üç &quot;çanta&quot;
            sembolü ve başsız bir insan figürü. Yakın Doğu’da akbaba ve kesik baş, bilinen bir ölüm ritüeli temasıdır:
            ceset açık bırakılır, etini kuşlar alır, geriye kemik kalır.
          </p>
          <p>
            Bu yorumu destekleyen bir buluntu da 2017’de geldi: çakmaktaşıyla oyulmuş oluklar ve kasıtlı bir delik
            taşıyan insan kafatası parçaları. Kafatasları süsleniyor, belki bir ipe ya da bir pilara asılıyordu. Erken
            Neolitik’te daha önce görülmemiş bir <strong className="text-amber-200">kafatası kültü</strong>.
          </p>
          <p className="rounded-2xl border p-4 text-base leading-relaxed text-slate-300" style={{ borderColor: 'rgba(148,163,184,0.25)', background: 'rgba(148,163,184,0.06)' }}>
            <strong className="text-white">Bir uyarı.</strong> İnternette Akbaba Taşı’nın bir &quot;kuyruklu yıldız
            çarpmasını&quot; ya da bir yıldız takvimini anlattığı iddiasına rastlarsanız: bu görüş (Sweatman, 2017) ana
            akım arkeoloji tarafından reddedildi. Önerilen tarih piların kendisinden yüzyıllarca eski; yorum, alandaki
            onlarca benzer pilardan yalnızca birini keyfî olarak seçiyor. Kazı ekibinin cevabı nazikti ama netti: bu bir
            gökyüzü haritası değil, bir ölüm anlatısı.
          </p>
        </div>
      </ArticleSection>

      {/* ── Tapınak mı yerleşim mi ── */}
      <ArticleSection title="Önce tapınak mıydı?">
        <div className="space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            Kazıyı başlatan Klaus Schmidt’in büyük fikri şuydu: Göbeklitepe bir yerleşim değil, uzaktan gelen grupların
            toplandığı salt bir <strong className="text-white">tören merkeziydi</strong> — evler, ocaklar, günlük hayat
            yok. Ona göre insanları bir araya getiren şey tarım değil, <em className="not-italic">inanç</em> tı. Belki de
            bu kadar insanı besleme ihtiyacı, tarımı icat etmeye iten şeydi. Çarpıcı bir tersine çevirme: önce tapınak,
            sonra tarla.
          </p>
          <p>
            Ama dürüst olalım, çünkü bilim böyle çalışıyor. Schmidt’in bu katı görüşü sonradan yumuşadı. Alanda öğütme
            taşları, çakmaktaşı atıkları, kesilmiş hayvan kemikleri ve büyük olasılıkla su sarnıçları bulundu — başka
            her yerde bunlar <strong className="text-amber-200">günlük yaşamın</strong> izi sayılırdı. Bugün kazı ekibi
            de en azından dönemsel bir yerleşim olduğunu kabul ediyor. &quot;Sadece tapınak, hiç ev yok&quot; artık pek
            savunulmuyor.
          </p>
          <p>
            &quot;Dünyanın ilk tapınağı&quot; başlığını da bu yüzden bir soru işaretiyle kullanmak gerekiyor. Kesin olan
            şu: burası, insanların tarımdan önce, ortak bir amaç için dev taşları birlikte kaldırdığı, bilinen en eski
            yer. Bu bile başlı başına devrimci.
          </p>
        </div>
      </ArticleSection>

      {/* ── Keşif hikayesi ── */}
      <ArticleImage src="/articles/gobeklitepe/kazi.jpg" ratio="16/9"
        alt="Göbeklitepe’de arkeolojik kazı çalışması / höyüğün hava görünümü"
        caption="Höyüğün yalnızca küçük bir bölümü açıldı; yaklaşık %90’ı hâlâ toprak altında." />

      <ArticleSection title="Bir mezarlık sanılan tepe" max="max-w-3xl">
        <div className="space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            Göbeklitepe’nin altında yattığı toprak, aslında 1963’te incelenmişti. Ama araştırmacılar tepedeki taşları
            iki küçük mezarlık sanıp geçtiler. Höyük otuz yıl daha sessizce bekledi.
          </p>
          <p>
            1994’te Alman arkeolog <strong className="text-white">Klaus Schmidt</strong> o eski kaydı yeniden okudu,
            tepeye çıktı ve toprağın hemen altındaki T-pilarları gördü. Sonradan anlatacaktı: o an, ya oradan hemen
            gidecek ya da hayatının geri kalanını orada geçirecekti. Kaldı — ve 2014’teki ölümüne dek, on sekiz yıl
            boyunca kazıyı yönetti.
          </p>
          <p>
            Sorularının çoğu hâlâ cevapsız. Çünkü bütün bu anlattıklarımız,{' '}
            <Link href="/articles/turkler" className="article-ilink">bu toprakların</Link> yalnızca ~%10’undan çıktı.
          </p>
        </div>
      </ArticleSection>

      <HorizontalTimeline heading="Bir tepenin uyanışı" kicker="KEŞİF · 1963 → BUGÜN" items={timeline} />

      {/* ── Taş Tepeler ── */}
      <ArticleSection title="Göbeklitepe yalnız değil">
        <div className="space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            Ve son sürpriz: Göbeklitepe bir tek değil. Şanlıurfa çevresinde, aynı çağdan, aynı T-pilarlı geleneğe ait
            bir dizi alan daha var. En etkileyicisi <strong className="text-white">Karahantepe</strong> — 250’den fazla
            T-biçimli blok, kaya içine oyulmuş odalar ve gerçekçi insan heykelleriyle. Hepsi birlikte{' '}
            <strong className="text-amber-200">Taş Tepeler</strong> adıyla anılıyor.
          </p>
          <p>
            Yani Göbeklitepe tek bir dâhinin eseri değil, bir kültürel ağın en görkemli düğümü. On bir bin yıl önce, bu
            topraklarda, birbirini tanıyan topluluklar dev taşları birlikte kaldırıyordu.
          </p>
        </div>
      </ArticleSection>

      {/* ── Kapanış ── */}
      <ArticleImage src="/articles/gobeklitepe/manzara.jpg" ratio="16/9"
        alt="Şanlıurfa ovası ve Göbeklitepe höyüğünün manzarası"
        caption="Germuş dağlarının bir sırtında, ovaya bakan höyük." />

      <ArticleSection title="Neyi değiştirdi?">
        <div className="space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            Göbeklitepe’den önce hikâye basitti: insan karnını doyurdu, yerleşti, sonra tanrılarını buldu. Şimdi o
            sıralama sarsılmış durumda. Belki de insanları bir araya getiren, karın değil <em className="not-italic">anlamdı</em>.
            Belki ilk büyük ortak proje bir tarla değil, bir tapınaktı.
          </p>
          <p className="rounded-2xl border p-5 text-xl font-medium text-slate-100" style={{ borderColor: `color-mix(in srgb, ${ACCENT} 30%, transparent)`, background: `color-mix(in srgb, ${ACCENT} 7%, transparent)` }}>
            Yazıdan önce, tekerlekten önce, tarladan önce — yüzü olmayan taş devler ovaya bakıyordu. Ve onları diken
            eller, henüz bir sözcük yazamayan ellerdi. <span style={{ color: ACCENT }}>Uygarlık, sandığımızdan çok daha
            eski bir yerde başlıyor.</span>
          </p>
        </div>
      </ArticleSection>

      <ArticleSection kicker="MİNİ TEST" title="Anladın mı? Kazalım bakalım">
        <ArticleQuiz questions={quizQs} />
      </ArticleSection>

      <div className="relative z-10">
        <ArticleBibliography items={refs} accent={ACCENT} />
      </div>

      <ArticleFooter tagline="Tarladan önce tapınak. Yazıdan önce sanat. Uygarlığın başlangıç çizgisi, Şanlıurfa’da bir tepenin altında. 🗿" />
    </ArticleShell>
  );
}
